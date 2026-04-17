import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { uploadLogo } from '../services/brandKit'

const SEGMENTS = [
  'Restaurante / Food', 'Consultoria / Serviços', 'Varejo / E-commerce',
  'Saúde / Bem-estar', 'Educação / Cursos', 'Tecnologia / SaaS',
  'Imobiliário', 'Moda / Beleza', 'Agência / Marketing', 'Outro',
]

const TONES = [
  { value: 'professional', label: 'Profissional', description: 'Formal, técnico e direto' },
  { value: 'casual', label: 'Descontraído', description: 'Amigável, próximo e humano' },
  { value: 'inspirational', label: 'Inspiracional', description: 'Motivador, emotivo e impactante' },
  { value: 'technical', label: 'Técnico', description: 'Especialista, preciso e informativo' },
]

const COLOR_PRESETS = [
  { primary: '#3A5AFF', secondary: '#000000', label: 'Azul' },
  { primary: '#FF6F5E', secondary: '#000000', label: 'Coral' },
  { primary: '#22c55e', secondary: '#000000', label: 'Verde' },
  { primary: '#FFCA1D', secondary: '#000000', label: 'Amarelo' },
  { primary: '#8B5CF6', secondary: '#000000', label: 'Roxo' },
  { primary: '#000000', secondary: '#FFFFFF', label: 'Preto' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [segment, setSegment] = useState('')
  const [tone, setTone] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [colorPrimary, setColorPrimary] = useState('#3A5AFF')
  const [colorSecondary, setColorSecondary] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const TOTAL_STEPS = 5

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const email = sessionData.session?.user?.email ?? ''
    if (email) {
      const logo = await uploadLogo(file, email, 'Logo principal')
      if (logo) {
        setLogoUrl(logo.url)
        setLogoPreview(logo.url)
      }
    }
    setUploadingLogo(false)
  }

  async function handleFinish() {
    setLoading(true)
    setError('')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const email = sessionData.session?.user?.email
      if (!email) throw new Error('Usuário não autenticado')

      const logos = logoUrl ? [{ url: logoUrl, label: 'Logo principal' }] : []

      const { error } = await supabase
        .from('brand_config')
        .upsert({
          user_email: email,
          brand_name: businessName,
          business_name: businessName,
          segment,
          tone,
          logo_url: logoUrl,
          logos: logos,
          color_primary: colorPrimary,
          color_secondary: colorSecondary,
          color_accent: colorPrimary,
        }, { onConflict: 'user_email' })

      if (error) throw error
      navigate('/')
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && step === TOTAL_STEPS) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Configurando sua conta...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <img src="/logo-pulse-cropped.png" alt="Pulse" style={{ height: 40, width: 180, objectFit: 'contain', display: 'block', margin: '0 auto' }} />

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i + 1 <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Passo 1 — Nome */}
          {step === 1 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Bem-vindo ao Pulse!</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Vamos configurar sua conta em {TOTAL_STEPS} passos rápidos.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nome da empresa ou marca</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ex: Agente 17, Studio Ana Silva..."
                  onKeyDown={e => e.key === 'Enter' && businessName.trim() && setStep(2)}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <button onClick={() => { if (!businessName.trim()) { setError('Digite o nome da empresa'); return } setError(''); setStep(2) }}
                className="btn-gerar" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                Continuar →
              </button>
            </>
          )}

          {/* Passo 2 — Segmento */}
          {step === 2 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Qual é o seu segmento?</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>A IA vai usar essa informação para criar posts mais relevantes.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {SEGMENTS.map(s => (
                  <button key={s} onClick={() => setSegment(s)} style={{
                    padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '13px', fontWeight: segment === s ? 600 : 400, textAlign: 'left',
                    background: segment === s ? 'rgba(58,90,255,0.15)' : 'var(--bg-surface)',
                    border: `1px solid ${segment === s ? 'rgba(58,90,255,0.5)' : 'var(--border)'}`,
                    color: segment === s ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 0.15s',
                  }}>{s}</button>
                ))}
              </div>
              {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'inherit' }}>← Voltar</button>
                <button onClick={() => { if (!segment) { setError('Selecione o segmento'); return } setError(''); setStep(3) }}
                  className="btn-gerar" style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  Continuar →
                </button>
              </div>
            </>
          )}

          {/* Passo 3 — Tom de voz */}
          {step === 3 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Tom de voz da marca</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Como você quer que sua marca se comunique?</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TONES.map(t => (
                  <button key={t.value} onClick={() => setTone(t.value)} style={{
                    padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px',
                    background: tone === t.value ? 'rgba(58,90,255,0.15)' : 'var(--bg-surface)',
                    border: `1px solid ${tone === t.value ? 'rgba(58,90,255,0.5)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: tone === t.value ? 'var(--accent)' : 'var(--text-primary)' }}>{t.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.description}</span>
                  </button>
                ))}
              </div>
              {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'inherit' }}>← Voltar</button>
                <button onClick={() => { if (!tone) { setError('Selecione o tom de voz'); return } setError(''); setStep(4) }}
                  className="btn-gerar" style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  Continuar →
                </button>
              </div>
            </>
          )}

          {/* Passo 4 — Logo */}
          {step === 4 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Logo da marca</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Será aplicado automaticamente nos posts. Pode pular e adicionar depois.</p>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              {logoPreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <img src={logoPreview} alt="Logo" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain', borderRadius: '8px', background: 'var(--bg-surface)', padding: '12px' }} />
                  <button onClick={() => { setLogoUrl(null); setLogoPreview(null) }} style={{ fontSize: '12px', color: 'rgba(239,68,68,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Remover logo
                  </button>
                </div>
              ) : (
                <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                  style={{ width: '100%', padding: '32px', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-surface)', border: '2px dashed var(--border)', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '32px' }}>+</span>
                  <span>{uploadingLogo ? 'Enviando...' : 'Clique para fazer upload do logo'}</span>
                  <span style={{ fontSize: '12px' }}>PNG, SVG ou JPG</span>
                </button>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'inherit' }}>← Voltar</button>
                <button onClick={() => { setError(''); setStep(5) }}
                  className="btn-gerar" style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  {logoPreview ? 'Continuar →' : 'Pular por agora →'}
                </button>
              </div>
            </>
          )}

          {/* Passo 5 — Cores */}
          {step === 5 && (
            <>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Cores da marca</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Escolha as cores que representam sua marca nos posts.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Presets</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLOR_PRESETS.map(preset => (
                    <button key={preset.primary} onClick={() => { setColorPrimary(preset.primary); setColorSecondary(preset.secondary) }}
                      style={{
                        width: '44px', height: '44px', borderRadius: '50%', background: preset.primary, cursor: 'pointer', padding: 0,
                        border: colorPrimary === preset.primary ? '3px solid white' : '2px solid transparent',
                        boxShadow: colorPrimary === preset.primary ? '0 0 0 2px var(--accent)' : 'none',
                      }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cor primária</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={colorPrimary} onChange={e => setColorPrimary(e.target.value)}
                      style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', padding: '2px', background: 'var(--bg-surface)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{colorPrimary}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cor secundária</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={colorSecondary} onChange={e => setColorSecondary(e.target.value)}
                      style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', padding: '2px', background: 'var(--bg-surface)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{colorSecondary}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div style={{ background: colorPrimary, borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {logoPreview && <img src={logoPreview} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />}
                <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>{businessName || 'Sua marca'}</span>
              </div>

              {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(4)} style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'inherit' }}>← Voltar</button>
                <button onClick={handleFinish} disabled={loading}
                  className="btn-gerar" style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
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
