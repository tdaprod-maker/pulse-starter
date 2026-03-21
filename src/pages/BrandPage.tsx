import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadBrandConfig, saveBrandConfig, uploadMedia, uploadPhoto, uploadLogo, DEFAULT_BRAND } from '../services/brandKit'
import type { BrandConfig, BrandLogo } from '../services/brandKit'
export function BrandPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<BrandConfig>(DEFAULT_BRAND)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const logoLibInputRef = useRef<HTMLInputElement>(null)

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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const current = config.photos ?? []
    const slots = 20 - current.length
    if (slots <= 0) return
    setUploadingPhotos(true)
    const toUpload = files.slice(0, slots)
    const urls = await Promise.all(toUpload.map(f => uploadPhoto(f, userEmail)))
    const valid = urls.filter((u): u is string => !!u)
    setConfig(prev => ({ ...prev, photos: [...(prev.photos ?? []), ...valid] }))
    setUploadingPhotos(false)
    e.target.value = ''
  }

  function handleRemovePhoto(url: string) {
    setConfig(prev => ({ ...prev, photos: (prev.photos ?? []).filter(u => u !== url) }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadMedia(file, `logos/${userEmail}/logo`)
    if (url) setConfig(prev => ({ ...prev, logo_url: url }))
  }

  async function handleAddLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const defaultLabel = file.name.replace(/\.[^.]+$/, '')
    const label = window.prompt('Nome do logotipo (ex: Branco, Preto)', defaultLabel)
    if (!label) { e.target.value = ''; return }
    const current = config.logos ?? []
    if (current.length >= 10) { e.target.value = ''; return }
    setUploadingLogo(true)
    const result = await uploadLogo(file, userEmail, label)
    if (result) setConfig(prev => ({ ...prev, logos: [...(prev.logos ?? []), result] }))
    setUploadingLogo(false)
    e.target.value = ''
  }

  function handleRemoveLogo(logo: BrandLogo) {
    setConfig(prev => ({ ...prev, logos: (prev.logos ?? []).filter(l => l.url !== logo.url) }))
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

          {/* Logotipos */}
          <Section title="Logotipos">
            <input
              ref={logoLibInputRef}
              type="file"
              accept="image/*"
              onChange={handleAddLogo}
              style={{ display: 'none' }}
            />
            {(config.logos ?? []).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {(config.logos ?? []).map((logo) => (
                  <div key={logo.url} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', width: '80px', height: '80px', background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 0 0 / 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={logo.url} alt={logo.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '6px' }} />
                    <button
                      onClick={() => handleRemoveLogo(logo)}
                      title={logo.label}
                      style={{
                        position: 'absolute', top: '3px', right: '3px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)', border: 'none',
                        color: 'white', fontSize: '11px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1, padding: 0,
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => logoLibInputRef.current?.click()}
              disabled={uploadingLogo || (config.logos ?? []).length >= 10}
              style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit',
                opacity: uploadingLogo || (config.logos ?? []).length >= 10 ? 0.5 : 1,
              }}
            >
              {uploadingLogo ? 'Enviando...' : `Adicionar logotipo ${(config.logos ?? []).length}/10`}
            </button>
          </Section>

          {/* Biblioteca de Fotos */}
          <Section title="Biblioteca de Fotos">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            {(config.photos ?? []).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {(config.photos ?? []).map((url) => (
                  <div key={url} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', width: '80px', height: '80px' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button
                      onClick={() => handleRemovePhoto(url)}
                      style={{
                        position: 'absolute', top: '3px', right: '3px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)', border: 'none',
                        color: 'white', fontSize: '11px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1, padding: 0,
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhotos || (config.photos ?? []).length >= 20}
              style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit',
                opacity: uploadingPhotos || (config.photos ?? []).length >= 20 ? 0.5 : 1,
              }}
            >
              {uploadingPhotos ? 'Enviando...' : `Adicionar foto ${(config.photos ?? []).length}/20`}
            </button>
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
