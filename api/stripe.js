import Stripe from 'stripe'
import { supabaseAdmin } from '../api-lib/supabaseAdmin.js'
import { ensureUserForCheckout } from '../api-lib/provisionAccount.js'
import { sendAccessEmail } from '../api-lib/sendEmail.js'

const PLAN_LABEL = { monthly: 'Plano Mensal', annual: 'Plano Anual' }

// Consolida checkout + webhook num único arquivo pra reduzir a contagem de
// Serverless Functions (limite de 12 no plano Vercel Hobby). Roteia por
// ?action=checkout|webhook. O webhook precisa do corpo cru (não parseado) pra
// validar a assinatura HMAC da Stripe, então o bodyParser fica desligado pro
// arquivo inteiro — o checkout faz o próprio JSON.parse do corpo cru.
export const config = { api: { bodyParser: false }, maxDuration: 30 }

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function periodEndOf(subscription) {
  // A partir da API 2025-xx, current_period_end saiu do Subscription e foi para
  // cada SubscriptionItem — nossas assinaturas têm sempre 1 item (mensal ou anual).
  const ts = subscription.items?.data?.[0]?.current_period_end
  return ts ? new Date(ts * 1000).toISOString() : null
}

// Preço mensal/anual (assinatura) e recargas avulsas (pagamento único). Os IDs
// reais são criados no Dashboard/CLI da Stripe e configurados como env vars —
// nunca hardcoded aqui, para permitir trocar preço sem novo deploy.
const PRICE_ENV_BY_ITEM = {
  monthly: 'STRIPE_PRICE_MONTHLY',
  annual: 'STRIPE_PRICE_ANNUAL',
  recharge_100: 'STRIPE_PRICE_RECHARGE_100',
  recharge_200: 'STRIPE_PRICE_RECHARGE_200',
  recharge_500: 'STRIPE_PRICE_RECHARGE_500',
}

const RECHARGE_PULSES = { recharge_100: 100, recharge_200: 200, recharge_500: 500 }

async function handleCheckout(req, res, rawBody) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body
  try {
    body = JSON.parse(rawBody.length ? rawBody.toString('utf8') : '{}')
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const { email: rawEmail, item, name: rawName } = body ?? {}

  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'email is required' })
  }
  const email = rawEmail.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'email inválido' })
  }
  const name = typeof rawName === 'string' && rawName.trim() ? rawName.trim().slice(0, 120) : undefined
  if (!item || !PRICE_ENV_BY_ITEM[item]) {
    return res.status(400).json({ error: 'item must be one of: monthly, annual, recharge_100, recharge_200, recharge_500' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' })
  }
  const priceId = process.env[PRICE_ENV_BY_ITEM[item]]
  if (!priceId) {
    return res.status(500).json({ error: `${PRICE_ENV_BY_ITEM[item]} not configured` })
  }

  const stripe = new Stripe(secretKey)
  const siteUrl = process.env.SITE_URL || 'https://pulse.agente17.com.br'
  const isSubscription = item === 'monthly' || item === 'annual'

  try {
    // Reusa o Customer da Stripe já vinculado ao usuário, se existir — evita
    // duplicar clientes na Stripe a cada nova compra/assinatura.
    const admin = supabaseAdmin()
    const { data: existing } = await admin
      .from('user_tokens')
      .select('stripe_customer_id')
      .eq('user_email', email)
      .single()

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: email }),
      // Recarga (mode: payment) não cria Customer por padrão — força a criação
      // pra conseguir reusar em compras futuras (o webhook salva o id).
      ...(isSubscription || existing?.stripe_customer_id ? {} : { customer_creation: 'always' }),
      client_reference_id: email,
      // Tax: automatic_tax desativado temporariamente — a conta Stripe ainda
      // não tem país/dados bancários configurados (CNPJ pendente), então o
      // Stripe Tax não está disponível. Reativar (automatic_tax: { enabled: true })
      // assim que a conta estiver com o país configurado em Settings → Tax.
      billing_address_collection: 'required',
      metadata: {
        user_email: email,
        item,
        ...(name ? { name } : {}),
        ...(isSubscription ? {} : { pulses_amount: String(RECHARGE_PULSES[item]) }),
      },
      ...(isSubscription
        ? { subscription_data: { metadata: { user_email: email, plan: item, ...(name ? { name } : {}) } } }
        : {}),
      // Compra pela LP: o cliente ainda não tem sessão, então manda pra uma
      // página pública de sucesso que instrui a checar o email. Quem comprou
      // logado (AccountPage) também cai aqui e tem link pra voltar ao app.
      success_url: `${siteUrl}/checkout/sucesso`,
      cancel_url: `${siteUrl}/checkout?canceled=1`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout] erro:', err)
    return res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
}

// Extraído do switch do webhook para poder ser testado isoladamente (mock de
// `session` + stub de `stripe`). `admin` é o client service-role do Supabase.
export async function handleCheckoutSessionCompleted({ session, stripe, admin }) {
  // Prioriza o email que o cliente confirmou no próprio Checkout — é onde ele
  // recebe email e o que ele associa à compra. metadata/client_reference_id
  // (vindos da LP) são só fallback.
  const email = (
    session.customer_details?.email ||
    session.metadata?.user_email ||
    session.client_reference_id ||
    ''
  ).trim().toLowerCase()
  if (!email) {
    console.error('[stripe/webhook] checkout.session.completed sem email resolvível:', session.id)
    return
  }

  // Aquisição via Stripe: quem paga pela LP pode não ter conta no Pulse ainda.
  // Cria a conta Supabase Auth + garante a linha em user_tokens e pega o link de
  // acesso ANTES de creditar (credit_pulses / upsert dependem do email existir).
  const name = session.customer_details?.name || session.metadata?.name || undefined
  let provision
  try {
    provision = await ensureUserForCheckout({ email, name })
  } catch (err) {
    console.error('[stripe/webhook] falha ao provisionar conta:', err)
    provision = { userId: null, isNew: false, actionLink: null }
  }

  let planLabel

  if (session.mode === 'subscription') {
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
    if (!subscriptionId) return
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const plan = subscription.metadata?.plan === 'annual' ? 'annual' : 'monthly'
    planLabel = PLAN_LABEL[plan]

    // upsert (não update): a linha pode não existir se a conta acabou de ser
    // criada ou se o cliente pagou antes de qualquer signup.
    const { error } = await admin.from('user_tokens').upsert({
      user_email: email,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripe_subscription_id: subscriptionId,
      plan,
      subscription_status: subscription.status,
      current_period_end: periodEndOf(subscription),
      tokens_remaining: 200,
      pulses_last_credited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_email' })

    if (error) console.error('[stripe/webhook] erro ao ativar assinatura:', error)
  } else {
    const pulsesAmount = parseInt(session.metadata?.pulses_amount ?? '0', 10)
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

    if (pulsesAmount > 0) {
      const { error } = await admin.rpc('credit_pulses', { p_email: email, p_amount: pulsesAmount })
      if (error) console.error('[stripe/webhook] erro ao creditar recarga:', error)
    }
    if (customerId) {
      await admin.from('user_tokens').update({ stripe_customer_id: customerId }).eq('user_email', email)
    }
  }

  // Email de acesso — só uma vez por conta. access_email_sent_at é a salvaguarda
  // contra retries do Stripe além da dedupe de stripe_events. Só marca como
  // enviado se o envio realmente aconteceu (se o Resend ainda não estiver
  // configurado, um replay futuro reenvia).
  try {
    const { data: tokRow } = await admin
      .from('user_tokens')
      .select('access_email_sent_at')
      .eq('user_email', email)
      .single()
    if (!tokRow?.access_email_sent_at) {
      const emailRes = await sendAccessEmail({
        to: email,
        actionLink: provision.actionLink,
        isNew: provision.isNew,
        planLabel,
      })
      if (emailRes.sent) {
        await admin.from('user_tokens')
          .update({ access_email_sent_at: new Date().toISOString() })
          .eq('user_email', email)
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] erro ao enviar email de acesso (seguindo):', err)
  }
}

async function handleWebhook(req, res, rawBody) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    console.error('[stripe/webhook] STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET não configurados')
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const stripe = new Stripe(secretKey)
  const signature = req.headers['stripe-signature']

  console.log(`[stripe/webhook] rawBody.length=${rawBody.length} stripe-signature presente=${Boolean(signature)}`)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[stripe/webhook] assinatura inválida:', err.message)
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` })
  }

  const admin = supabaseAdmin()

  // Idempotência: a Stripe pode reenviar o mesmo evento (retry, ou dois listeners).
  // Se já processamos esse event.id, retorna 200 sem repetir o efeito colateral.
  const { error: dedupeError } = await admin.from('stripe_events').insert({ id: event.id, type: event.type })
  if (dedupeError) {
    if (dedupeError.code === '23505') {
      return res.status(200).json({ received: true, duplicate: true })
    }
    console.error('[stripe/webhook] erro ao registrar evento (seguindo mesmo assim):', dedupeError)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted({ session: event.data.object, stripe, admin })
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object
        // O primeiro invoice de uma assinatura (billing_reason: subscription_create)
        // já foi tratado em checkout.session.completed — só reseta em renovações
        // reais pra não creditar 200 pulses duas vezes no primeiro ciclo.
        if (invoice.billing_reason !== 'subscription_cycle') break

        const subscriptionId = invoice.parent?.subscription_details?.subscription
        const resolvedSubscriptionId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id
        if (!resolvedSubscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(resolvedSubscriptionId)

        const { error } = await admin.from('user_tokens').update({
          tokens_remaining: 200,
          subscription_status: subscription.status,
          current_period_end: periodEndOf(subscription),
          pulses_last_credited_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', resolvedSubscriptionId)

        if (error) console.error('[stripe/webhook] erro ao renovar assinatura:', error)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const { error } = await admin.from('user_tokens').update({
          subscription_status: subscription.status,
          current_period_end: periodEndOf(subscription),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)

        if (error) console.error('[stripe/webhook] erro ao atualizar assinatura:', error)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        // Não zera tokens_remaining aqui — o usuário pode continuar usando o saldo
        // já creditado até o fim do período pago. Só marca o status como cancelado.
        const { error } = await admin.from('user_tokens').update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)

        if (error) console.error('[stripe/webhook] erro ao cancelar assinatura:', error)
        break
      }

      default:
        break
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error(`[stripe/webhook] erro ao processar ${event.type}:`, err)
    return res.status(500).json({ error: 'Internal error processing webhook' })
  }
}

export default async function handler(req, res) {
  const rawBody = await readRawBody(req)

  switch (req.query.action) {
    case 'checkout': return handleCheckout(req, res, rawBody)
    case 'webhook': return handleWebhook(req, res, rawBody)
    default: return res.status(400).json({ error: 'Unknown or missing action' })
  }
}
