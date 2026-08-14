import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { startCheckout, type CheckoutItem } from '../services/billing'

const PLAN_LABEL: Record<string, string> = { monthly: 'Mensal', annual: 'Anual' }
const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa', trialing: 'Em teste', past_due: 'Pagamento pendente',
  canceled: 'Cancelada', unpaid: 'Não paga', incomplete: 'Incompleta', incomplete_expired: 'Expirada',
}

export function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [balance, setBalance] = useState(0)
  const [used, setUsed] = useState(0)
  const [brandName, setBrandName] = useState('')
  const [segment, setSegment] = useState('')
  const [tone, setTone] = useState('')
  const [plan, setPlan] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<CheckoutItem | null>(null)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const userEmail = data.session?.user?.email ?? ''
      setEmail(userEmail)
      if (!userEmail) { setLoading(false); return }

      const [brand, tokenData] = await Promise.all([
        loadBrandConfig(userEmail),
        supabase.from('user_tokens')
          .select('tokens_remaining, tokens_used, plan, subscription_status, current_period_end')
          .eq('user_email', userEmail).single()
      ])

      setBrandName(brand.business_name || brand.brand_name || '')
      setSegment(brand.segment || '')
      setTone(brand.tone || '')
      setBalance(tokenData.data?.tokens_remaining ?? 0)
      setUsed(tokenData.data?.tokens_used ?? 0)
      setPlan(tokenData.data?.plan ?? null)
      setSubscriptionStatus(tokenData.data?.subscription_status ?? null)
      setCurrentPeriodEnd(tokenData.data?.current_period_end ?? null)
      setLoading(false)
    })
  }, [])

  async function handleCheckout(item: CheckoutItem) {
    if (!email || checkoutLoading) return
    setCheckoutError('')
    setCheckoutLoading(item)
    try {
      await startCheckout(email, item)
    } catch (e: any) {
      setCheckoutError(e.message ?? 'Erro ao iniciar checkout.')
      setCheckoutLoading(null)
    }
  }

  const isActiveSubscriber = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'

  const toneLabel: Record<string, string> = {
    professional: 'Profissional',
    casual: 'Descontraído',
    inspirational: 'Inspiracional',
    technical: 'Técnico',
  }

  const total = balance + used
  const percentUsed = total > 0 ? Math.round((used / total) * 100) : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
      Carregando...
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Minha Conta
        </h1>

        {/* Saldo de Pulses */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Saldo de Pulses
          </span>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '48px', fontWeight: 800, color: balance < 10 ? 'rgb(239,68,68)' : 'var(--accent)', lineHeight: 1 }}>
                {balance}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>pulses restantes</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1 }}>
                {used}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>pulses utilizados</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px', transition: 'width 0.8s ease',
                width: `${percentUsed}%`,
                background: percentUsed > 80 ? 'rgb(239,68,68)' : 'var(--accent)',
              }} />
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
              {percentUsed}% dos pulses utilizados
            </p>
          </div>

          {/* Custo por ação */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Custo por ação</span>
            {[
              { label: 'Gerar post com imagem', cost: 2 },
              { label: 'Slide de carrossel', cost: 1 },
              { label: 'Editar imagem com IA', cost: 3 },
              { label: 'Revisar post com IA', cost: 1 },
              { label: 'Turbinar prompt', cost: 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: item.cost === 0 ? '#22c55e' : 'var(--text-primary)' }}>
                  {item.cost === 0 ? 'Grátis' : `${item.cost} pulse${item.cost > 1 ? 's' : ''}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plano e assinatura */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Plano
          </span>

          {plan && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', borderRadius: '8px', padding: '12px 16px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Plano {PLAN_LABEL[plan] ?? plan}
                </p>
                {currentPeriodEnd && (
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {subscriptionStatus === 'canceled' ? 'Válido até' : 'Renova em'} {new Date(currentPeriodEnd).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px',
                background: isActiveSubscriber ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: isActiveSubscriber ? '#22c55e' : 'rgb(239,68,68)',
              }}>
                {subscriptionStatus ? (STATUS_LABEL[subscriptionStatus] ?? subscriptionStatus) : '—'}
              </span>
            </div>
          )}

          {!isActiveSubscriber && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { item: 'monthly' as const, label: 'Plano Mensal', price: 'R$ 47,90/mês', detail: '200 pulses/mês' },
                { item: 'annual' as const, label: 'Plano Anual', price: 'R$ 39,90/mês', detail: 'R$ 478,80/ano · 200 pulses/mês' },
              ].map(p => (
                <div key={p.item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{p.price} · {p.detail}</p>
                  </div>
                  <button
                    onClick={() => handleCheckout(p.item)}
                    disabled={checkoutLoading !== null}
                    style={{
                      padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: checkoutLoading ? 'default' : 'pointer',
                      background: '#3A5AFF', color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                      opacity: checkoutLoading !== null && checkoutLoading !== p.item ? 0.5 : 1,
                    }}
                  >
                    {checkoutLoading === p.item ? 'Abrindo...' : 'Assinar'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {checkoutError && (
            <p style={{ margin: 0, fontSize: '12px', color: 'rgb(239,68,68)' }}>{checkoutError}</p>
          )}
        </div>

        {/* Recarga avulsa de pulses */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Recarga avulsa
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {[
              { item: 'recharge_100' as const, pulses: 100, price: 'R$ 27,90' },
              { item: 'recharge_200' as const, pulses: 200, price: 'R$ 49,90' },
              { item: 'recharge_500' as const, pulses: 500, price: 'R$ 99,90' },
            ].map(r => (
              <div key={r.item} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.pulses} pulses</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{r.price}</p>
                </div>
                <button
                  onClick={() => handleCheckout(r.item)}
                  disabled={checkoutLoading !== null}
                  style={{
                    width: '100%', padding: '9px 16px', borderRadius: '8px', cursor: checkoutLoading ? 'default' : 'pointer',
                    background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                    opacity: checkoutLoading !== null && checkoutLoading !== r.item ? 0.5 : 1,
                  }}
                >
                  {checkoutLoading === r.item ? 'Abrindo...' : 'Comprar'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dados da conta */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Dados da conta
          </span>
          {[
            { label: 'Email', value: email },
            { label: 'Empresa', value: brandName || '—' },
            { label: 'Segmento', value: segment || '—' },
            { label: 'Tom de voz', value: toneLabel[tone] || '—' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
          <a href="/brand" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Editar Brand Kit →
          </a>
        </div>

      </main>
    </div>
  )
}
