import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { startCheckout, type CheckoutItem } from '../services/billing'

const PLANS: Record<CheckoutItem, { label: string; price: string; detail: string }> = {
  monthly: { label: 'Plano Mensal', price: 'R$ 47,90/mês', detail: '200 pulses todo mês · renovação automática' },
  annual: { label: 'Plano Anual', price: 'R$ 39,90/mês', detail: 'R$ 478,80/ano · 200 pulses todo mês · 2 meses grátis' },
  recharge_100: { label: '100 pulses avulsos', price: 'R$ 27,90', detail: 'Pagamento único · sem assinatura' },
  recharge_200: { label: '200 pulses avulsos', price: 'R$ 49,90', detail: 'Pagamento único · sem assinatura' },
  recharge_500: { label: '500 pulses avulsos', price: 'R$ 99,90', detail: 'Pagamento único · sem assinatura' },
}

function resolvePlan(): CheckoutItem {
  const raw = new URLSearchParams(window.location.search).get('plan')
  return raw && raw in PLANS ? (raw as CheckoutItem) : 'monthly'
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
}

export function CheckoutPage() {
  const [item] = useState<CheckoutItem>(resolvePlan)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canceled = new URLSearchParams(window.location.search).get('canceled') === '1'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const e = data.session?.user?.email
      if (e) setEmail(e)
      const n = (data.session?.user?.user_metadata as { name?: string } | undefined)?.name
      if (n) setName(n)
    })
  }, [])

  async function handleSubmit() {
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Digite um email válido.')
      return
    }
    setLoading(true)
    try {
      await startCheckout(trimmed, item, name.trim() || undefined)
      // startCheckout redireciona o browser; se voltar aqui é porque falhou
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar o pagamento. Tente novamente.')
      setLoading(false)
    }
  }

  const plan = PLANS[item]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <img src="/logo-pulse-cropped.png" alt="Pulse" style={{ height: 44, width: 200, objectFit: 'contain', display: 'block', margin: '0 auto', marginBottom: 8 }} />

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 18px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.label}</p>
          <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--accent)' }}>{plan.price}</p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{plan.detail}</p>
        </div>

        {canceled && (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
            Pagamento cancelado. Você pode tentar de novo quando quiser.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nome (opcional)</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            É neste email que você vai receber o acesso ao Pulse depois do pagamento.
          </span>
        </div>

        {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn-gerar"
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Abrindo pagamento...' : 'Ir para o pagamento →'}
        </button>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          Pagamento processado com segurança pela Stripe. Você pode cancelar a assinatura quando quiser.
        </p>
      </div>
    </div>
  )
}
