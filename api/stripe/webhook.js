import Stripe from 'stripe'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

// Precisa do corpo cru (não parseado) pra validar a assinatura HMAC da Stripe —
// se o Vercel parsear o JSON antes, os bytes não batem mais com o que a Stripe assinou.
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

export default async function handler(req, res) {
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
  const rawBody = await readRawBody(req)
  const signature = req.headers['stripe-signature']

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
        const session = event.data.object
        const email = session.metadata?.user_email || session.client_reference_id || session.customer_details?.email
        if (!email) {
          console.error('[stripe/webhook] checkout.session.completed sem email resolvível:', session.id)
          break
        }

        if (session.mode === 'subscription') {
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
          if (!subscriptionId) break
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const plan = subscription.metadata?.plan === 'annual' ? 'annual' : 'monthly'

          const { error } = await admin.from('user_tokens').update({
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            stripe_subscription_id: subscriptionId,
            plan,
            subscription_status: subscription.status,
            current_period_end: periodEndOf(subscription),
            tokens_remaining: 200,
            pulses_last_credited_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('user_email', email)

          if (error) console.error('[stripe/webhook] erro ao ativar assinatura:', error)
        } else {
          const pulsesAmount = parseInt(session.metadata?.pulses_amount ?? '0', 10)
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

          if (pulsesAmount > 0) {
            const { error } = await admin.rpc('credit_pulses', { p_email: email, p_amount: pulsesAmount })
            if (error) console.error('[stripe/webhook] erro ao creditar recarga:', error)
          }
          // Salva o customer mesmo em recarga avulsa, pra reusar em compras futuras
          if (customerId) {
            await admin.from('user_tokens').update({ stripe_customer_id: customerId }).eq('user_email', email)
          }
        }
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
