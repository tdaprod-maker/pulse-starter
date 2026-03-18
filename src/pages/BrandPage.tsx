import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadBrandConfig, saveBrandConfig, uploadMedia, DEFAULT_BRAND } from '../services/brandKit'
import type { BrandConfig } from '../services/brandKit'
export function BrandPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<BrandConfig>(DEFAULT_BRAND)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      setUserEmail(email)
      loadBrandConfig(email).then(c => {
        setConfig(c)
        setLoading(false)
      })
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    await saveBrandConfig(userEmail, config)
    setSaving(false)
    setSaved(true)
    setTimeout(() => navigate('/'), 1000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadMedia(file, `logos/${userEmail}/logo`)
    if (url) setConfig(prev => ({ ...prev, logo_url: url }))
  }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)',
      color: 'var(--text-muted)' }}>
      Carregando...
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ padding: '40px',
        display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px',
          display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Header */}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700,
              color: 'var(--text-primary)', margin: 0 }}>Brand Kit</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)',
              marginTop: '6px' }}>
              Configure a identidade visual padrão da sua marca.
            </p>
          </div>

          {/* Nome da marca */}
          <Section title="Nome da Marca">
            <input
              value={config.brand_name}
              onChange={e => setConfig(p => ({ ...p, brand_name: e.target.value }))}
              style={inputStyle}
            />
          </Section>

          {/* Logo */}
          <Section title="Logotipo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {config.logo_url && (
                <img src={config.logo_url} alt="Logo"
                  style={{ height: '48px', borderRadius: '6px',
                    background: '#111', padding: '4px' }} />
              )}
              <label style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px',
              }}>
                {config.logo_url ? 'Trocar logo' : 'Fazer upload do logo'}
                <input type="file" accept="image/*"
                  onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </Section>

          {/* Cores */}
          <Section title="Cores da Marca">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'color_primary', label: 'Cor principal' },
                { key: 'color_secondary', label: 'Cor secundária' },
                { key: 'color_accent', label: 'Cor de destaque' },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center',
                  gap: '12px' }}>
                  <input
                    type="color"
                    value={config[key as keyof BrandConfig] as string}
                    onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: '40px', height: '40px', borderRadius: '6px',
                      border: 'none', cursor: 'pointer', background: 'none' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {label}
                  </span>
                  <code style={{ fontSize: '12px', color: 'var(--text-muted)',
                    marginLeft: 'auto' }}>
                    {config[key as keyof BrandConfig] as string}
                  </code>
                </div>
              ))}
            </div>
          </Section>

          {/* Fontes */}
          <Section title="Fontes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'font_title', label: 'Fonte de título' },
                { key: 'font_body', label: 'Fonte de texto' },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center',
                  gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)',
                    width: '120px' }}>{label}</span>
                  <select
                    value={config[key as keyof BrandConfig] as string}
                    onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }}
                  >
                    {['Inter', 'Sora', 'Montserrat', 'Space Grotesk',
                      'Playfair Display', 'Oswald', 'Raleway', 'Bebas Neue', 'Lora',
                      'Public Sans', 'Poppins']
                      .map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </Section>

          {/* Botão salvar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gerar"
            style={{
              padding: '12px', borderRadius: '8px', border: 'none',
              color: 'white', fontSize: '14px', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            {saved ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar Brand Kit'}
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px', borderRadius: '8px',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '13px',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            ← Voltar ao Editor
          </button>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
        color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
        {title}
      </h2>
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '16px' }}>
        {children}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-surface)',
  border: '1px solid var(--border)', borderRadius: '8px',
  padding: '10px 12px', color: 'var(--text-primary)',
  fontSize: '13px', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
}
