import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getTokenBalance } from '../services/tokens'
import { loadBrandConfig } from '../services/brandKit'

export function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [balance, setBalance] = useState(0)
  const [used, setUsed] = useState(0)
  const [brandName, setBrandName] = useState('')
  const [segment, setSegment] = useState('')
  const [tone, setTone] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const userEmail = data.session?.user?.email ?? ''
      setEmail(userEmail)
      if (!userEmail) { setLoading(false); return }

      const [brand, tokenData] = await Promise.all([
        loadBrandConfig(userEmail),
        supabase.from('user_tokens').select('tokens_remaining, tokens_used').eq('user_email', userEmail).single()
      ])

      setBrandName(brand.business_name || brand.brand_name || '')
      setSegment(brand.segment || '')
      setTone(brand.tone || '')
      setBalance(tokenData.data?.tokens_remaining ?? 0)
      setUsed(tokenData.data?.tokens_used ?? 0)
      setLoading(false)
    })
  }, [])

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
