import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadBrandConfig, saveBrandConfig, uploadMedia, uploadPhoto, uploadLogo, DEFAULT_BRAND } from '../services/brandKit'
import { analyzeVisualReferences } from '../services/gemini'
import type { BrandConfig, BrandLogo } from '../services/brandKit'
import {
  getConnection,
  getInstagramConnection,
  saveConnection,
  removeConnection,
} from '../services/socialConnections'

export function BrandPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<BrandConfig>(DEFAULT_BRAND)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadingRefs, setUploadingRefs] = useState(false)
  const [analyzingRefs, setAnalyzingRefs] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const logoLibInputRef = useRef<HTMLInputElement>(null)

  // Redes Sociais
  const [linkedinToken, setLinkedinToken] = useState('')
  const [linkedinName, setLinkedinName] = useState('')
  const [instagramToken, setInstagramToken] = useState('')
  const [instagramUserId, setInstagramUserId] = useState('')
  const [instagramUsername, setInstagramUsername] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email ?? ''
      console.log('[BrandPage] init — email:', email, '| href:', window.location.href)
      setUserEmail(email)
      loadBrandConfig(email).then(c => {
        setConfig(c)
        setLoading(false)
      })
      if (!email) {
        console.log('[BrandPage] sem email — abortando fluxo LinkedIn')
        return
      }

      // Consome token pendente do fluxo redirect (mobile)
      const pendingToken = localStorage.getItem('linkedin_token')
      const pendingSub = localStorage.getItem('linkedin_sub')
      const pendingName = localStorage.getItem('linkedin_name')
      console.log('[BrandPage] localStorage — pendingToken:', !!pendingToken, '| pendingSub:', pendingSub, '| pendingName:', pendingName)

      if (pendingToken && pendingSub) {
        console.log('[BrandPage] salvando token LinkedIn no Supabase — sub:', pendingSub)
        await saveConnection(email, 'linkedin', pendingToken, pendingSub, pendingName ?? null, null)
        console.log('[BrandPage] saveConnection concluído')
        setLinkedinToken(pendingToken)
        setLinkedinName(pendingName ?? '')
        console.log('[BrandPage] estado LinkedIn atualizado — name:', pendingName)
        localStorage.removeItem('linkedin_token')
        localStorage.removeItem('linkedin_sub')
        localStorage.removeItem('linkedin_name')
        console.log('[BrandPage] localStorage limpo')
      }

      const [li, ig] = await Promise.all([
        pendingToken ? Promise.resolve(null) : getConnection(email, 'linkedin'),
        getInstagramConnection(email),
      ])
      if (li) {
        console.log('[BrandPage] LinkedIn carregado do Supabase — username:', li.platform_username)
        setLinkedinToken(li.access_token)
        setLinkedinName(li.platform_username ?? '')
      }
      if (ig) {
        setInstagramToken(ig.access_token)
        setInstagramUserId(ig.ig_user_id)
        setInstagramUsername(ig.username)
      }
    })
  }, [])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      console.log('[BrandPage] postMessage recebido — type:', event.data?.type)

      if (event.data?.type === 'linkedin_auth') {
        const { linkedin_token, linkedin_sub, linkedin_name } = event.data
        console.log('[BrandPage] linkedin_auth via popup — sub:', linkedin_sub, '| userEmail:', userEmail)
        if (linkedin_token && linkedin_sub && userEmail) {
          saveConnection(userEmail, 'linkedin', linkedin_token, linkedin_sub, linkedin_name ?? null, null)
          setLinkedinToken(linkedin_token)
          setLinkedinName(linkedin_name ?? '')
          console.log('[BrandPage] estado LinkedIn atualizado via popup — name:', linkedin_name)
        } else {
          console.warn('[BrandPage] linkedin_auth ignorado — falta token, sub ou email', { hasToken: !!linkedin_token, hasSub: !!linkedin_sub, hasEmail: !!userEmail })
        }
      }

      if (event.data?.type === 'instagram_oauth') {
        const { access_token, ig_user_id, username, expires_at } = event.data
        if (access_token && ig_user_id && userEmail) {
          saveConnection(userEmail, 'instagram', access_token, ig_user_id, username ?? null, expires_at || null)
          setInstagramToken(access_token)
          setInstagramUserId(ig_user_id)
          setInstagramUsername(username ?? '')
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [userEmail])

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

  async function handleUploadRef(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingRefs(true)
    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email ?? ''
      const current = config.visual_references ?? []
      const urls: string[] = []
      for (const file of files.slice(0, 5 - current.length)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `references/${email}/${Date.now()}_${safeName}`
        const url = await uploadMedia(file, path)
        if (url) urls.push(url)
      }
      const newRefs = [...current, ...urls].slice(0, 5)
      setConfig(prev => ({ ...prev, visual_references: newRefs }))
      await saveBrandConfig(email, { visual_references: newRefs })
      if (newRefs.length > 0) {
        setAnalyzingRefs(true)
        try {
          const analysis = await analyzeVisualReferences(newRefs)
          setConfig(prev => ({ ...prev, visual_style: analysis }))
          await saveBrandConfig(email, { visual_style: analysis })
        } finally {
          setAnalyzingRefs(false)
        }
      }
    } finally {
      setUploadingRefs(false)
      e.target.value = ''
    }
  }

  async function handleRemoveRef(url: string) {
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email ?? ''
    const newRefs = (config.visual_references ?? []).filter(u => u !== url)
    setConfig(prev => ({ ...prev, visual_references: newRefs }))
    await saveBrandConfig(email, { visual_references: newRefs })
    if (newRefs.length > 0) {
      setAnalyzingRefs(true)
      try {
        const analysis = await analyzeVisualReferences(newRefs)
        setConfig(prev => ({ ...prev, visual_style: analysis }))
        await saveBrandConfig(email, { visual_style: analysis })
      } finally {
        setAnalyzingRefs(false)
      }
    }
  }

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
          <Section title="Referências Visuais">
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Suba até 5 posts que admira — o Gemini analisa o estilo e usa como referência nas gerações.
              {analyzingRefs && <span style={{ color: 'var(--accent)', marginLeft: '8px' }}>Analisando...</span>}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {(config.visual_references ?? []).map((url) => (
                <div key={url} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--border)' }}>
                  <img src={url} alt="Referência" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => handleRemoveRef(url)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '10px', padding: '2px 6px', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {(config.visual_references ?? []).length < 5 && (
              <label style={{ display: 'block', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center', cursor: uploadingRefs ? 'default' : 'pointer', color: 'var(--text-muted)', fontSize: '12px', opacity: uploadingRefs ? 0.5 : 1 }}>
                <input type="file" accept="image/*" multiple onChange={handleUploadRef} style={{ display: 'none' }} disabled={uploadingRefs} />
                {uploadingRefs ? 'Enviando...' : `Adicionar referência (${(config.visual_references ?? []).length}/5)`}
              </label>
            )}
            {config.visual_style && (
              <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Estilo analisado</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{config.visual_style}</p>
              </div>
            )}
          </Section>

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

          {/* Redes Sociais */}
          <Section title="Redes Sociais">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* LinkedIn */}
              {linkedinToken ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'linear-gradient(135deg, #0077B5, #005e93)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>in</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {linkedinName || 'LinkedIn'}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Conectado</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { removeConnection(userEmail, 'linkedin'); setLinkedinToken(''); setLinkedinName('') }}
                    style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.35)', color: 'rgba(239,68,68,0.7)', fontFamily: 'inherit', flexShrink: 0 }}
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0,119,181,0.15)', border: '1px solid rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#0077B5', fontSize: '14px', fontWeight: 700 }}>in</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>LinkedIn</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Não conectado</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                      if (mobile) {
                        window.location.href = '/api/linkedin-auth'
                      } else {
                        window.open('/api/linkedin-auth', 'linkedin_popup', 'width=600,height=700')
                      }
                    }}
                    style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: 'linear-gradient(135deg, #0077B5, #005e93)', border: 'none', color: 'white', flexShrink: 0 }}
                  >
                    Conectar
                  </button>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border)' }} />

              {/* Instagram */}
              {instagramToken ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: '15px' }}>◎</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {instagramUsername ? `@${instagramUsername}` : 'Instagram'}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Conectado · ID {instagramUserId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { removeConnection(userEmail, 'instagram'); setInstagramToken(''); setInstagramUserId(''); setInstagramUsername('') }}
                    style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.35)', color: 'rgba(239,68,68,0.7)', fontFamily: 'inherit', flexShrink: 0 }}
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(220,39,67,0.12)', border: '1px solid rgba(220,39,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#dc2743', fontSize: '15px' }}>◎</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Instagram</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Não conectado</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <button
                      onClick={() => { const p = userEmail ? `?email=${encodeURIComponent(userEmail)}` : ''; window.open(`/api/instagram-auth${p}`, 'instagram_popup', 'width=600,height=700') }}
                      style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', border: 'none', color: 'white', flexShrink: 0 }}
                    >
                      Conectar
                    </button>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(em breve)</span>
                  </div>
                </div>
              )}

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
