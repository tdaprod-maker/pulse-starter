import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SEGMENTS = [
  'Restaurante / Food',
  'Consultoria / Serviços',
  'Varejo / E-commerce',
  'Saúde / Bem-estar',
  'Educação / Cursos',
  'Tecnologia / SaaS',
  'Imobiliário',
  'Moda / Beleza',
  'Agência / Marketing',
  'Outro',
]

const TONES = [
  { value: 'professional', label: 'Profissional', description: 'Formal, técnico e direto' },
  { value: 'casual', label: 'Descontraído', description: 'Amigável, próximo e humano' },
  { value: 'inspirational', label: 'Inspiracional', description: 'Motivador, emotivo e impactante' },
  { value: 'technical', label: 'Técnico', description: 'Especialista, preciso e informativo' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [segment, setSegment] = useState('')
  const [tone, setTone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFinish() {
    if (!businessName.trim()) { setError('Digite o nome da sua empresa'); return }
    if (!segment) { setError('Selecione o segmento'); return }
    if (!tone) { setError('Selecione o tom de voz'); return }
    setLoading(true)
    setError('')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const email = sessionData.session?.user?.email
      if (!email) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('brand_config')
        .upsert({
          user_email: email,
          brand_name: businessName,
          business_name: businessName,
          segment,
          tone,
          color_primary: '#3A5AFF',
          color_secondary: '#000000',
        }, { onConflict: 'user_email' })

      if (error) throw error
      navigate('/')
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Logo */}
        <img src="/logo-pulse-cropped.png" alt="Pulse" style={{ height: 40, width: 180, objectFit: 'contain', display: 'block', margin: '0 auto' }} />

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {step === 1 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Bem-vindo ao Pulse!</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Vamos configurar sua conta em 3 passos rápidos.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nome da empresa ou marca</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Ex: Agente 17, Studio Ana Silva..."
                  onKeyDown={e => e.key === 'Enter' && businessName.trim() && setStep(2)}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
              {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <button
                onClick={() => { if (!businessName.trim()) { setError('Digite o nome da empresa'); return } setError(''); setStep(2) }}
                className="btn-gerar"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                Continuar →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Qual é o seu segmento?</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>A IA vai usar essa informação para criar posts mais relevantes.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {SEGMENTS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSegment(s)}
                    style={{
                      padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '13px', fontWeight: segment === s ? 600 : 400, textAlign: 'left',
                      background: segment === s ? 'rgba(58,90,255,0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${segment === s ? 'rgba(58,90,255,0.5)' : 'var(--border)'}`,
                      color: segment === s ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'inherit' }}>
                  ← Voltar
                </button>
                <button
                  onClick={() => { if (!segment) { setError('Selecione o segmento'); return } setError(''); setStep(3) }}
                  className="btn-gerar"
                  style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  Continuar →
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Tom de voz da marca</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Como você quer que sua marca se comunique?</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TONES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    style={{
                      padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px',
                      background: tone === t.value ? 'rgba(58,90,255,0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${tone === t.value ? 'rgba(58,90,255,0.5)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: tone === t.value ? 'var(--accent)' : 'var(--text-primary)' }}>{t.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.description}</span>
                  </button>
                ))}
              </div>
              {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'inherit' }}>
                  ← Voltar
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="btn-gerar"
                  style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Salvando...' : 'Começar a usar o Pulse →'}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Você pode alterar essas configurações a qualquer momento no Brand Kit
        </p>
      </div>
    </div>
  )
}
