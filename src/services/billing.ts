export type CheckoutItem = 'monthly' | 'annual' | 'recharge_100' | 'recharge_200' | 'recharge_500'

/** Cria a Checkout Session na Stripe e redireciona o browser pra ela. */
export async function startCheckout(email: string, item: CheckoutItem): Promise<void> {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, item }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? 'Erro ao iniciar checkout. Tente novamente.')
  }
  window.location.href = data.url
}
