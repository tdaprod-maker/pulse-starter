import Stripe from 'stripe'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

export const config = { maxDuration: 30 }

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, item } = req.body ?? {}

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' })
  }
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
      client_reference_id: email,
      // Tax: precisa da Stripe Tax ativada + endereço de origem configurado no
      // Dashboard (Settings → Tax). billing_address_collection garante que o
      // cálculo automático tenha o país/CEP do cliente.
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      metadata: {
        user_email: email,
        item,
        ...(isSubscription ? {} : { pulses_amount: String(RECHARGE_PULSES[item]) }),
      },
      ...(isSubscription
        ? { subscription_data: { metadata: { user_email: email, plan: item } } }
        : {}),
      success_url: `${siteUrl}/account?checkout=success`,
      cancel_url: `${siteUrl}/account?checkout=cancel`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout] erro:', err)
    return res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
}
