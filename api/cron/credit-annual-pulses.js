import { supabaseAdmin } from '../../api-lib/supabaseAdmin.js'

export const config = { maxDuration: 60 }

// O Plano Anual cobra 1x por ano na Stripe, mas credita pulses mês a mês (mesma
// cadência do Plano Mensal) — a Stripe só dispara invoice.paid uma vez por ano
// pra esse plano, então esse cron supre os outros 11 créditos mensais.
// Roda diariamente (ver vercel.json); credita quem está "vencido" há >= 27 dias,
// o que dá ~12 créditos/ano com folga sem precisar fixar o dia exato do mês.
const CREDIT_INTERVAL_DAYS = 27
const MONTHLY_PULSES = 200

export default async function handler(req, res) {
  // Vercel injeta Authorization: Bearer $CRON_SECRET automaticamente em Cron Jobs
  // quando a env var CRON_SECRET está configurada — isso impede chamadas externas.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const admin = supabaseAdmin()
  const cutoff = new Date(Date.now() - CREDIT_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const nowIso = new Date().toISOString()

  const { data: due, error } = await admin
    .from('user_tokens')
    .select('user_email, pulses_last_credited_at, current_period_end')
    .eq('plan', 'annual')
    .eq('subscription_status', 'active')
    .gt('current_period_end', nowIso)
    .or(`pulses_last_credited_at.is.null,pulses_last_credited_at.lt.${cutoff}`)

  if (error) {
    console.error('[cron/credit-annual-pulses] erro ao buscar assinantes:', error)
    return res.status(500).json({ error: error.message })
  }

  const results = { credited: 0, failed: 0 }

  for (const row of due ?? []) {
    const { error: updateError } = await admin
      .from('user_tokens')
      .update({
        tokens_remaining: MONTHLY_PULSES,
        pulses_last_credited_at: nowIso,
        updated_at: nowIso,
      })
      .eq('user_email', row.user_email)

    if (updateError) {
      console.error(`[cron/credit-annual-pulses] erro ao creditar ${row.user_email}:`, updateError)
      results.failed++
    } else {
      results.credited++
    }
  }

  return res.status(200).json(results)
}
