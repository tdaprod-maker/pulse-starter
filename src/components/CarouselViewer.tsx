import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import type Konva from 'konva'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { CanvasEngine } from '../engine/CanvasEngine'
import { exportToPng, buildFileName } from '../export/exportUtils'
import JSZip from 'jszip'
import type { SlideWithImage } from '../services/gemini'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { calcAutoScale } from '../engine/CanvasEngine'
import { validateSlides } from '../services/carouselValidation'
import { overlayLogoOnImage, type LogoPosition, type LogoSize } from '../services/logoOverlay'
import { getInstagramConnection } from '../services/socialConnections'
import { isIOS, openIOSSaveOverlay } from './IOSSaveOverlay'

interface CarouselViewerProps {
  slides: SlideWithImage[]
  caption: string
  templateId?: string
  engine?: string
  onClose: () => void
  onSlideChange?: (index: number) => void
  onSelectElement?: (id: string | null) => void
}

const LOGO_POSITION_OPTIONS: { value: LogoPosition; label: string }[] = [
  { value: 'top-left', label: '↖ Superior esq.' },
  { value: 'top-right', label: '↗ Superior dir.' },
  { value: 'bottom-left', label: '↙ Inferior esq.' },
  { value: 'bottom-right', label: '↘ Inferior dir.' },
  { value: 'bottom-center', label: '⬇ Centro inferior' },
  { value: 'top-center', label: '⬆ Centro superior' },
  { value: 'center', label: '⊙ Centro' },
]

const LOGO_SIZE_OPTIONS: { value: LogoSize; label: string }[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
]

const TYPE_LABEL: Record<string, string> = {
  cover: 'CAPA',
  content: 'CONTEÚDO',
  cta: 'CTA',
}

const TYPE_COLOR: Record<string, string> = {
  cover: '#3A5AFF',
  content: '#1e1e1e',
  cta: '#FF6F5E',
}

export function CarouselViewer({ slides, caption, templateId, engine, onClose, onSlideChange, onSelectElement }: CarouselViewerProps) {
  const slidesList = validateSlides<SlideWithImage>(slides)
  const [current, setCurrent] = useState(0)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [publishingLI, setPublishingLI] = useState(false)
  const [publishingIG, setPublishingIG] = useState(false)
  const [liStatus, setLiStatus] = useState<'idle'|'success'|'error'>('idle')
  const [igStatus, setIgStatus] = useState<'idle'|'success'|'error'>('idle')
  const [linkedinToken, setLinkedinToken] = useState(localStorage.getItem('linkedin_token') ?? '')
  const [linkedinSub, setLinkedinSub] = useState(localStorage.getItem('linkedin_sub') ?? '')

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'linkedin_auth') {
        setLinkedinToken(e.data.linkedin_token)
        setLinkedinSub(e.data.linkedin_sub)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  const [ready, setReady] = useState(false)
  const stageRefs = useRef<Record<number, Konva.Stage | null>>({})

  // Mede a área disponível para o canvas do slide (mesma lógica do EditorPage)
  // para escalar o slide inteiro visível na tela, sem cortar nenhuma parte.
  const canvasAreaRef = useRef<HTMLDivElement>(null)
  const [canvasAreaSize, setCanvasAreaSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = canvasAreaRef.current
    if (!el) return
    const update = () => setCanvasAreaSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ready])

  const { theme } = useTheme()
  const { addTemplate, updateElement, setTemplateBackground, setTemplateLogo, setTemplateLogoStyle } = useStore()
  const slide = slidesList[current]

  // Logo overlay do carrossel premium: os slides originais (sem logo) ficam
  // preservados para permitir reprocessar posição/tamanho sem perder qualidade
  // por overlays acumulados. Aplicado em todos os slides de uma vez.
  const [originalPremiumSlides] = useState<SlideWithImage[]>(() => validateSlides<SlideWithImage>(slides))
  const [premiumSlidesWithLogo, setPremiumSlidesWithLogo] = useState<SlideWithImage[] | null>(null)
  const [premiumLogoActive, setPremiumLogoActive] = useState(false)
  const [premiumLogoUrl, setPremiumLogoUrl] = useState<string | null>(null)
  const [premiumLogoPosition, setPremiumLogoPosition] = useState<LogoPosition>('bottom-right')
  const [premiumLogoSize, setPremiumLogoSize] = useState<LogoSize>('medium')
  const [applyingPremiumLogo, setApplyingPremiumLogo] = useState(false)
  const [premiumLogoError, setPremiumLogoError] = useState('')
  const displayedPremiumSlides = premiumLogoActive && premiumSlidesWithLogo ? premiumSlidesWithLogo : originalPremiumSlides

  // Cria templates Konva para cada slide
  useEffect(() => {
    if (engine === 'premium') { setReady(true); return }
    if (!templateId) { setReady(true); return }
    const def = templateRegistry.find(d => d.id === templateId)
    if (!def) { setReady(true); return }
    const variants = def.getVariants(theme)
    const base = variants.find(v => v.id.endsWith('-4x5')) ?? variants[0]

    slidesList.forEach((slide, i) => {
      const variant = {
        ...base,
        id: `carousel-slide-${i}`,
        name: `Slide ${i + 1}`,
      }
      addTemplate(variant)

      // Aplica textos mapeados
      if (slide.texts) {
        Object.entries(slide.texts).forEach(([fieldId, text]) => {
          const el = variant.elements.find(e => e.id === fieldId)
          if (el && el.type === 'text') {
            updateElement(variant.id, fieldId, { props: { ...el.props, text: String(text) } })
          }
        })
      } else {
        // Fallback: aplica title/body nos primeiros campos de texto
        const textEls = variant.elements.filter(e => e.type === 'text')
        if (textEls[0] && slide.title) {
          updateElement(variant.id, textEls[0].id, { props: { ...textEls[0].props, text: slide.title } })
        }
        if (textEls[1] && slide.body) {
          updateElement(variant.id, textEls[1].id, { props: { ...textEls[1].props, text: slide.body } })
        }
      }

      // Aplica imagem de fundo
      if (slide.imageUrl) {
        setTemplateBackground(variant.id, slide.imageUrl)
      }
    })

    // Carrega logo do brand kit
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      if (!email) { setReady(true); return }
      loadBrandConfig(email).then(brand => {
        if (brand.logo_url) {
          fetch(brand.logo_url)
            .then(r => r.blob())
            .then(blob => {
              const reader = new FileReader()
              reader.onload = () => {
                const base64 = reader.result as string
                slidesList.forEach((_, i) => {
                  setTemplateLogo(`carousel-slide-${i}`, base64)
                  setTemplateLogoStyle(`carousel-slide-${i}`, 400)
                })
              }
              reader.readAsDataURL(blob)
            })
            .catch(() => {})
        }
        setReady(true)
      })
    })
  }, [templateId])

  async function applyPremiumLogo(position: LogoPosition, size: LogoSize, urlOverride?: string) {
    const url = urlOverride ?? premiumLogoUrl
    if (!url) return
    setApplyingPremiumLogo(true)
    try {
      const withLogo = await Promise.all(
        originalPremiumSlides.map(async s => ({
          ...s,
          imageUrl: s.imageUrl ? await overlayLogoOnImage(s.imageUrl, url, position, size) : s.imageUrl,
        }))
      )
      setPremiumSlidesWithLogo(withLogo)
      setPremiumLogoActive(true)
    } finally {
      setApplyingPremiumLogo(false)
    }
  }

  async function handleAddPremiumLogo() {
    setPremiumLogoError('')
    let url = premiumLogoUrl
    if (!url) {
      const { data: authData } = await supabase.auth.getUser()
      const email = authData.user?.email ?? ''
      const brandCtx = email ? await loadBrandConfig(email) : null
      if (!brandCtx?.logo_url) {
        setPremiumLogoError('Nenhum logo configurado na sua marca. Adicione o logo no painel de configuração da marca.')
        return
      }
      url = brandCtx.logo_url
      setPremiumLogoUrl(url)
    }
    await applyPremiumLogo(premiumLogoPosition, premiumLogoSize, url)
  }

  function handleRemovePremiumLogo() {
    setPremiumLogoActive(false)
    setPremiumSlidesWithLogo(null)
  }

  function handlePremiumLogoPositionChange(position: LogoPosition) {
    setPremiumLogoPosition(position)
    if (premiumLogoActive) applyPremiumLogo(position, premiumLogoSize)
  }

  function handlePremiumLogoSizeChange(size: LogoSize) {
    setPremiumLogoSize(size)
    if (premiumLogoActive) applyPremiumLogo(premiumLogoPosition, size)
  }

  async function getSlideImages(): Promise<string[]> {
    if (engine === 'premium') {
      return displayedPremiumSlides.map(s => s.imageUrl).filter(Boolean)
    }
    await new Promise(r => setTimeout(r, 800))
    const images: string[] = []
    for (let i = 0; i < slidesList.length; i++) {
      const stage = stageRefs.current[i]
      if (!stage) continue
      const tmpl = useStore.getState().templates.find(t => t.id === `carousel-slide-${i}`)
      if (!tmpl) continue
      const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/jpeg', quality: 0.7 })
      images.push(dataUrl)
      await new Promise(r => setTimeout(r, 200))
    }
    return images
  }

  async function handlePublishLinkedIn() {
    if (!linkedinToken || !linkedinSub || publishingLI) return
    setPublishingLI(true)
    setLiStatus('idle')
    try {
      console.log('[LinkedIn] token:', linkedinToken.slice(0, 20) + '...', '| sub:', linkedinSub)
      const images = await getSlideImages()
      const text = caption || ''
      console.log('[LinkedIn] payload:', { sub: linkedinSub, textLen: text.length, imageCount: images.length, imgPrefix: images[0]?.slice(0, 50) })
      const res = await fetch('/api/linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: linkedinToken, linkedinSub, text, images }),
      })
      const data = await res.json()
      console.log('[LinkedIn] resposta:', res.status, data)
      if (data.success) { setLiStatus('success'); setTimeout(() => setLiStatus('idle'), 3000) }
      else throw new Error(data.error)
    } catch (err) {
      console.error('[LinkedIn] erro completo:', err)
      setLiStatus('error')
      setTimeout(() => setLiStatus('idle'), 3000)
    }
    finally { setPublishingLI(false) }
  }

  async function handlePublishInstagram() {
    if (publishingIG) return
    setPublishingIG(true)
    setIgStatus('idle')
    try {
      const { data: authData } = await supabase.auth.getUser()
      const email = authData.user?.email ?? ''
      const igConnection = email ? await getInstagramConnection(email) : null

      console.log('[CarouselViewer] Instagram connection check:', {
        email,
        hasConnection: !!igConnection,
        igUserId: igConnection?.ig_user_id || null,
        accessTokenPresent: !!igConnection?.access_token,
      })

      if (!igConnection?.access_token || !igConnection?.ig_user_id) {
        throw new Error('Instagram não conectado. Conecte sua conta no painel de configuração da marca.')
      }

      const igUserId = igConnection.ig_user_id
      const accessToken = igConnection.access_token

      const images = await getSlideImages()
      const imageUrls: string[] = []
      for (let i = 0; i < images.length; i++) {
        const base64 = images[i].replace(/^data:image\/\w+;base64,/, '')
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const blob = new Blob([byteArray], { type: 'image/jpeg' })
        const fileName = `carousel-${Date.now()}-${i}.jpg`
        const { error } = await supabase.storage.from('media').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
        if (error) throw new Error('Erro no upload')
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
        imageUrls.push(urlData.publicUrl)
      }
      const text = caption || ''

      console.log('[CarouselViewer] Instagram fetch payload:', {
        imageCount: imageUrls.length,
        igUserId,
        accessTokenPreview: accessToken ? `${accessToken.slice(0, 10)}...` : null,
        captionLength: text.length,
      })

      const res = await fetch('/api/instagram-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls, caption: text, igUserId, accessToken }),
      })
      const data = await res.json()
      if (data.success) { setIgStatus('success'); setTimeout(() => setIgStatus('idle'), 3000) }
      else throw new Error(data.error)
    } catch (e) {
      console.error('[CarouselViewer] instagram publish:', e)
      setIgStatus('error')
      setTimeout(() => setIgStatus('idle'), 3000)
    }
    finally { setPublishingIG(false) }
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(caption)
    setCopiedCaption(true)
    setTimeout(() => setCopiedCaption(false), 2000)
  }

  // Gera os dataURLs de todos os slides do engine standard (Konva) — usado tanto
  // para montar o ZIP (desktop) quanto para alimentar o overlay de salvar do iOS,
  // que mostra as imagens em tela cheia em vez de um .zip (pouco confiável no Safari).
  async function collectStandardSlideDataURLs(): Promise<{ url: string; label: string }[]> {
    const images: { url: string; label: string }[] = []
    for (let i = 0; i < slidesList.length; i++) {
      const stage = stageRefs.current[i]
      if (!stage) continue
      const templateStore = useStore.getState().templates.find(t => t.id === `carousel-slide-${i}`)
      if (!templateStore) continue
      const autoScale = calcAutoScale(templateStore)
      const pixelRatio = 2 / autoScale
      const dataUrl = stage.toDataURL({ pixelRatio, mimeType: 'image/png' })
      images.push({ url: dataUrl, label: `Slide ${i + 1}` })
      await new Promise(r => setTimeout(r, 300))
    }
    return images
  }

  async function handleDownloadAll() {
    setExporting(true)
    try {
      if (engine === 'premium') {
        if (isIOS()) {
          openIOSSaveOverlay(
            displayedPremiumSlides.map((s, i) => ({ url: s.imageUrl ?? '', label: `Slide ${i + 1}` }))
          )
          return
        }
        const zip = new JSZip()
        for (let i = 0; i < displayedPremiumSlides.length; i++) {
          const imageUrl = displayedPremiumSlides[i].imageUrl
          if (!imageUrl) continue
          const base64 = imageUrl.split(',')[1]
          if (base64) zip.file(`slide-${i + 1}.png`, base64, { base64: true })
        }
        const blob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'carrossel-premium.zip'
        a.click()
        URL.revokeObjectURL(url)
        return
      }
      await new Promise(r => setTimeout(r, 800))
      const slideImages = await collectStandardSlideDataURLs()
      if (isIOS()) {
        openIOSSaveOverlay(slideImages)
        return
      }
      const zip = new JSZip()
      slideImages.forEach((img, i) => {
        const base64 = img.url.split(',')[1]
        if (base64) zip.file(`slide-${i + 1}.png`, base64, { base64: true })
      })
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'carrossel.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Erro ao exportar ZIP:', e)
    } finally {
      setExporting(false)
    }
  }

  async function handleDownloadCurrent() {
    if (engine === 'premium') {
      const imageUrl = displayedPremiumSlides[current].imageUrl
      if (!imageUrl) return
      if (isIOS()) {
        openIOSSaveOverlay([{ url: imageUrl, label: `Slide ${current + 1}` }])
        return
      }
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = `slide-${current + 1}.png`
      a.click()
      return
    }
    const stage = stageRefs.current[current]
    if (!stage) return
    const templateStore = useStore.getState().templates.find(t => t.id === `carousel-slide-${current}`)
    if (!templateStore) return
    const autoScale = calcAutoScale(templateStore)
    const pixelRatio = 2 / autoScale
    exportToPng(stage, `${buildFileName(`slide-${current + 1}`, '2x')}.png`, { pixelRatio })
  }

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Preparando slides...</p>
      </div>
    )
  }

  // ── Modo premium: render puramente baseado em imagens ──────────────────────
  if (engine === 'premium') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-panel)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Carrossel Premium — {displayedPremiumSlides.length} slides
            </span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#3A5AFF', color: '#fff', fontWeight: 600 }}>
              Premium
            </span>
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
              background: TYPE_COLOR[slide.type], color: '#fff', fontWeight: 600,
            }}>
              {TYPE_LABEL[slide.type]}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>

        {/* Imagem do slide atual — dimensionada por CSS puro (max-width/max-height +
            object-fit: contain) para caber inteira na área disponível em qualquer
            viewport, sem depender de medição via JS nem de uma proporção fixa. */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', overflow: 'hidden', position: 'relative', minHeight: 0,
        }}>
          {displayedPremiumSlides[current].imageUrl ? (
            <img
              src={displayedPremiumSlides[current].imageUrl}
              alt={displayedPremiumSlides[current].title}
              style={{
                maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto',
                objectFit: 'contain', display: 'block', borderRadius: '12px',
                boxShadow: '0 0 0 1px rgba(91,143,212,0.2), 0 24px 80px rgba(0,0,0,0.6)',
                background: '#111', opacity: applyingPremiumLogo ? 0.6 : 1, transition: 'opacity 0.15s',
              }}
            />
          ) : (
            <div style={{ width: '400px', maxWidth: '100%', aspectRatio: '4/5', borderRadius: '12px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Slide indisponível</p>
            </div>
          )}
          {current > 0 && (
            <button onClick={() => { const i = current - 1; setCurrent(i); onSlideChange?.(i) }} style={{
              position: 'absolute', left: '12px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>‹</button>
          )}
          {current < displayedPremiumSlides.length - 1 && (
            <button onClick={() => { const i = current + 1; setCurrent(i); onSlideChange?.(i) }} style={{
              position: 'absolute', right: '12px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>›</button>
          )}
        </div>

        {/* Miniaturas */}
        <div style={{ display: 'flex', gap: '8px', padding: '0 20px 16px', overflowX: 'auto', flexShrink: 0, justifyContent: 'center' }}>
          {displayedPremiumSlides.map((s, i) => (
            <div key={i} onClick={() => { setCurrent(i); onSlideChange?.(i) }} style={{
              width: '56px', height: '70px', borderRadius: '6px', overflow: 'hidden',
              cursor: 'pointer', flexShrink: 0, position: 'relative',
              border: i === current ? '2px solid var(--accent)' : '2px solid transparent',
              background: '#111',
            }}>
              {s.imageUrl && <img src={s.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#fff',
              }}>{i + 1}</div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          {/* Controles de logo */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '10px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Logo da marca
              </span>
              {!premiumLogoActive ? (
                <button
                  onClick={handleAddPremiumLogo}
                  disabled={applyingPremiumLogo}
                  style={{
                    fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: applyingPremiumLogo ? 'default' : 'pointer',
                    fontFamily: 'inherit', fontWeight: 600, border: 'none',
                    background: 'var(--accent)', color: 'white', opacity: applyingPremiumLogo ? 0.6 : 1,
                  }}
                >
                  {applyingPremiumLogo ? 'Aplicando...' : 'Adicionar logo'}
                </button>
              ) : (
                <button
                  onClick={handleRemovePremiumLogo}
                  disabled={applyingPremiumLogo}
                  style={{
                    fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: applyingPremiumLogo ? 'default' : 'pointer',
                    fontFamily: 'inherit', fontWeight: 600,
                    border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)',
                  }}
                >
                  Remover logo
                </button>
              )}
            </div>

            {premiumLogoError && (
              <span style={{ fontSize: '11px', color: 'rgba(239,68,68,0.9)' }}>{premiumLogoError}</span>
            )}

            {premiumLogoActive && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Posição</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {LOGO_POSITION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handlePremiumLogoPositionChange(opt.value)}
                        disabled={applyingPremiumLogo}
                        style={{
                          fontSize: '11px', padding: '5px 10px', borderRadius: '6px',
                          cursor: applyingPremiumLogo ? 'default' : 'pointer', fontFamily: 'inherit',
                          whiteSpace: 'nowrap',
                          ...(premiumLogoPosition === opt.value
                            ? { background: 'var(--accent)', border: 'none', color: 'white' }
                            : { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }),
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tamanho</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {LOGO_SIZE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handlePremiumLogoSizeChange(opt.value)}
                        disabled={applyingPremiumLogo}
                        style={{
                          flex: 1, fontSize: '11px', padding: '5px 10px', borderRadius: '6px',
                          cursor: applyingPremiumLogo ? 'default' : 'pointer', fontFamily: 'inherit',
                          ...(premiumLogoSize === opt.value
                            ? { background: 'var(--accent)', border: 'none', color: 'white' }
                            : { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }),
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {caption && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxHeight: '80px', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: '8px', padding: '8px 12px', border: '1px solid var(--border)' }}>{caption}</p>
              <button onClick={handleCopyCaption} style={{ width: '100%', padding: '9px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit' }}>
                {copiedCaption ? 'Legenda copiada!' : 'Copiar legenda'}
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleDownloadCurrent} style={{ flex: 1, padding: '11px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit' }}>
              Baixar slide {current + 1}
            </button>
            <button onClick={handleDownloadAll} disabled={exporting} style={{ flex: 1, padding: '11px', borderRadius: '8px', cursor: exporting ? 'default' : 'pointer', background: '#3A5AFF', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', opacity: exporting ? 0.7 : 1 }}>
              {exporting ? 'Exportando...' : 'Baixar todos'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePublishLinkedIn} disabled={publishingLI || !linkedinToken} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: publishingLI || !linkedinToken ? 'default' : 'pointer', background: linkedinToken ? '#0A66C2' : 'var(--bg-surface)', border: '1px solid var(--border)', color: linkedinToken ? '#fff' : 'var(--text-muted)', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', opacity: publishingLI ? 0.7 : 1 }}>
              {publishingLI ? 'Publicando...' : liStatus === 'success' ? 'Publicado!' : liStatus === 'error' ? 'Erro' : 'LinkedIn'}
            </button>
            <button onClick={handlePublishInstagram} disabled={publishingIG} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: publishingIG ? 'default' : 'pointer', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', opacity: publishingIG ? 0.7 : 1 }}>
              {publishingIG ? 'Publicando...' : igStatus === 'success' ? 'Publicado!' : igStatus === 'error' ? 'Erro' : 'Instagram'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Modo standard: render baseado em Konva ──────────────────────────────────
  const slideTemplateId = `carousel-slide-${current}`
  const slideTemplate = useStore.getState().templates.find(t => t.id === slideTemplateId)

  if (!slideTemplate) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Erro ao carregar slide.</p>
      </div>
    )
  }

  // Escala dinâmica baseada na área realmente disponível na tela (não numa
  // caixa fixa de 500x600), para o slide sempre caber inteiro sem cortar —
  // mesmo princípio aplicado no fix do CarouselViewer premium.
  const CANVAS_PADDING = 24
  const canvasScale = canvasAreaSize.width > 0 && canvasAreaSize.height > 0
    ? Math.min(
        (canvasAreaSize.width - CANVAS_PADDING * 2) / slideTemplate.width,
        (canvasAreaSize.height - CANVAS_PADDING * 2) / slideTemplate.height,
      )
    : Math.min(500 / slideTemplate.width, 600 / slideTemplate.height)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-panel)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Carrossel — {slidesList.length} slides
          </span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
            background: TYPE_COLOR[slide.type], color: '#fff', fontWeight: 600,
          }}>
            {TYPE_LABEL[slide.type]}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
      </div>

      {/* Canvas do slide atual */}
      <div ref={canvasAreaRef} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', overflow: 'hidden', position: 'relative',
      }}>
        {/* Slide atual visível */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(91,143,212,0.2), 0 24px 80px rgba(0,0,0,0.6)', flexShrink: 0 }}>
          <CanvasEngine
            key={slideTemplateId}
            ref={(el) => { stageRefs.current[current] = el }}
            template={slideTemplate}
            scale={canvasScale}
            selectedElementId={null}
            onSelectElement={(id) => onSelectElement?.(id)}
            editingElementId={null}
            onEditStart={() => {}}
          />
        </div>
        {/* Slides ocultos renderizados fora da tela para export */}
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
          {slidesList.map((_, i) => {
            if (i === current) return null
            const tid = `carousel-slide-${i}`
            const tmpl = useStore.getState().templates.find(t => t.id === tid)
            if (!tmpl) return null
            return (
              <CanvasEngine
                key={tid}
                ref={(el) => { stageRefs.current[i] = el }}
                template={tmpl}
                scale={1}
                selectedElementId={null}
                onSelectElement={() => {}}
                editingElementId={null}
                onEditStart={() => {}}
              />
            )
          })}
        </div>

        {/* Navegação */}
        {current > 0 && (
          <button onClick={() => { const i = current - 1; setCurrent(i); onSlideChange?.(i) }} style={{
            position: 'absolute', left: '12px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
        )}
        {current < slidesList.length - 1 && (
          <button onClick={() => { const i = current + 1; setCurrent(i); onSlideChange?.(i) }} style={{
            position: 'absolute', right: '12px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>›</button>
        )}
      </div>

      {/* Miniaturas */}
      <div style={{
        display: 'flex', gap: '8px', padding: '0 20px 16px',
        overflowX: 'auto', flexShrink: 0, justifyContent: 'center',
      }}>
        {slidesList.map((s, i) => (
          <div key={i} onClick={() => { setCurrent(i); onSlideChange?.(i) }} style={{
            width: '56px', height: '70px', borderRadius: '6px', overflow: 'hidden',
            cursor: 'pointer', flexShrink: 0, position: 'relative',
            border: i === current ? '2px solid var(--accent)' : '2px solid transparent',
            background: '#111',
          }}>
            {s.imageUrl && (
              <img src={s.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff',
            }}>{i + 1}</div>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div style={{
        padding: '12px 20px 20px', borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0,
      }}>
        {caption && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{
              fontSize: '12px', color: 'var(--text-secondary)', margin: 0,
              lineHeight: 1.5, maxHeight: '80px', overflowY: 'auto',
              background: 'var(--bg-surface)', borderRadius: '8px',
              padding: '8px 12px', border: '1px solid var(--border)',
            }}>{caption}</p>
            <button onClick={handleCopyCaption} style={{
              width: '100%', padding: '9px', borderRadius: '8px', cursor: 'pointer',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit',
            }}>
              {copiedCaption ? 'Legenda copiada!' : 'Copiar legenda'}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleDownloadCurrent} style={{
            flex: 1, padding: '11px', borderRadius: '8px', cursor: 'pointer',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
          }}>
            Baixar slide {current + 1}
          </button>
          <button onClick={handleDownloadAll} disabled={exporting} style={{
            flex: 1, padding: '11px', borderRadius: '8px', cursor: exporting ? 'default' : 'pointer',
            background: '#3A5AFF', border: 'none', color: '#fff',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
            opacity: exporting ? 0.7 : 1,
          }}>
            {exporting ? 'Exportando...' : 'Baixar todos'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePublishLinkedIn}
            disabled={publishingLI || !linkedinToken}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              cursor: publishingLI || !linkedinToken ? 'default' : 'pointer',
              background: linkedinToken ? '#0A66C2' : 'var(--bg-surface)',
              border: '1px solid var(--border)', color: linkedinToken ? '#fff' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
              opacity: publishingLI ? 0.7 : 1,
            }}
          >
            {publishingLI ? 'Publicando...' : liStatus === 'success' ? 'Publicado!' : liStatus === 'error' ? 'Erro' : 'LinkedIn'}
          </button>
          <button
            onClick={handlePublishInstagram}
            disabled={publishingIG}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              cursor: publishingIG ? 'default' : 'pointer',
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              border: 'none', color: '#fff',
              fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
              opacity: publishingIG ? 0.7 : 1,
            }}
          >
            {publishingIG ? 'Publicando...' : igStatus === 'success' ? 'Publicado!' : igStatus === 'error' ? 'Erro' : 'Instagram'}
          </button>
        </div>
      </div>
    </div>
  )
}
