// updated 23 mar 2026
import { useState, useEffect, useRef, useCallback } from 'react'
import JSZip from 'jszip'
import { generateCarouselContent } from '../services/gemini'
import type { CarouselSlide } from '../services/gemini'
import { generateImage } from '../services/replicate'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'

const SLIDE_COUNTS = [3, 4, 5]

const CAROUSEL_TEMPLATES = [
  { id: 'tech-statement', label: 'Tech Statement' },
  { id: 'tech-product',   label: 'Tech Product'   },
  { id: 'editorial-card', label: 'Editorial Card'  },
  { id: 'tech-minimal',   label: 'Tech Minimal'    },
]

const TYPE_LABEL: Record<CarouselSlide['type'], string> = {
  cover:   'CAPA',
  content: 'CONTEÚDO',
  cta:     'CTA',
}

const TYPE_COLOR: Record<CarouselSlide['type'], string> = {
  cover:   'rgba(58,90,255,0.85)',
  content: 'rgba(30,30,30,0.75)',
  cta:     'rgba(255,111,94,0.85)',
}

// ─── Shared draw function ──────────────────────────────────────────────────────

async function drawSlide(
  ctx: CanvasRenderingContext2D,
  slide: CarouselSlide,
  imgSrc: string,
  templateId: string,
  logoUrl: string,
  options: { fontScale: number; accentColor: string; logoSize: number; textShadow: boolean; logoTint: 'original' | 'white'; logoWhiteUrl: string; bgVariant: 'dark' | 'white'; titlePos: {x:number,y:number}; bodyPos: {x:number,y:number}; logoPos: {x:number,y:number} },
) {
  const SIZE = 1080
  ctx.clearRect(0, 0, SIZE, SIZE)

  if (templateId === 'tech-statement') {
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, SIZE, SIZE)
    if (imgSrc) {
      await new Promise<void>(resolve => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const scale = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight)
          const w = img.naturalWidth * scale
          const h = img.naturalHeight * scale
          ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = imgSrc
      })
    }
    const grad = ctx.createLinearGradient(0, 0, 0, SIZE)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.82)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = options.accentColor
    ctx.fillRect(80, 180, 6, 320)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = options.textShadow ? 'rgba(0,0,0,0.8)' : 'transparent'
    ctx.shadowBlur = options.textShadow ? 12 : 0
    ctx.shadowOffsetX = options.textShadow ? 2 : 0
    ctx.shadowOffsetY = options.textShadow ? 2 : 0
    ctx.font = `bold ${Math.round(68 * options.fontScale)}px Inter, sans-serif`
    const tsTitle = wrapText(ctx, slide.title, 860)
    let cy = options.titlePos.y
    for (const line of tsTitle) {
      ctx.fillText(line, options.titlePos.x, cy)
      cy += 80
    }
    if (slide.body) {
      let bcy = options.bodyPos.y
      ctx.font = `${Math.round(28 * options.fontScale)}px Inter, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.78)'
      for (const line of wrapText(ctx, slide.body, 860)) {
        ctx.fillText(line, options.bodyPos.x, bcy)
        bcy += 40
      }
    }
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

  } else if (templateId === 'tech-product') {
    ctx.fillStyle = '#0D0D0D'
    ctx.fillRect(0, 0, SIZE, SIZE)
    if (imgSrc) {
      await new Promise<void>(resolve => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const scale = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight)
          const w = img.naturalWidth * scale
          const h = img.naturalHeight * scale
          ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = imgSrc
      })
    }
    const tpGrad = ctx.createLinearGradient(0, 0, 0, SIZE)
    tpGrad.addColorStop(0, 'rgba(0,0,0,0.3)')
    tpGrad.addColorStop(1, 'rgba(0,0,0,0.75)')
    ctx.fillStyle = tpGrad
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = options.accentColor
    ctx.fillRect(0, 0, 1080, 8)
    ctx.font = `bold ${Math.round(72 * options.fontScale)}px Inter, sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = options.textShadow ? 'rgba(0,0,0,0.8)' : 'transparent'
    ctx.shadowBlur = options.textShadow ? 12 : 0
    ctx.shadowOffsetX = options.textShadow ? 2 : 0
    ctx.shadowOffsetY = options.textShadow ? 2 : 0
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const tpTitle = wrapText(ctx, slide.title, 900)
    let cy = options.titlePos.y
    for (const line of tpTitle) {
      ctx.fillText(line, options.titlePos.x, cy)
      cy += 86
    }
    cy += 32
    ctx.fillStyle = options.accentColor
    ctx.fillRect(options.titlePos.x - 60, cy, 120, 3)
    cy += 3
    if (slide.body) {
      let bcy = options.bodyPos.y
      ctx.font = `${Math.round(30 * options.fontScale)}px Inter, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.72)'
      ctx.textBaseline = 'top'
      for (const line of wrapText(ctx, slide.body, 900)) {
        ctx.fillText(line, options.bodyPos.x, bcy)
        bcy += 44
      }
    }
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

  } else if (templateId === 'editorial-card') {
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, SIZE, SIZE)
    if (imgSrc) {
      await new Promise<void>(resolve => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const scale = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight)
          const w = img.naturalWidth * scale
          const h = img.naturalHeight * scale
          ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = imgSrc
      })
    }
    const grad = ctx.createLinearGradient(0, 0, 600, 0)
    grad.addColorStop(0, 'rgba(0,0,0,0.88)')
    grad.addColorStop(1, 'rgba(0,0,0,0.1)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = '#FFCA1D'
    ctx.fillRect(0, 0, 1080, 6)
    ctx.font = `bold ${Math.round(60 * options.fontScale)}px Inter, sans-serif`
    const ecTitle = wrapText(ctx, slide.title, 700)
    ctx.font = `${Math.round(26 * options.fontScale)}px Inter, sans-serif`
    const ecBody = slide.body ? wrapText(ctx, slide.body, 700) : []
    const titleLineH = 72
    const bodyLineH = 36
    let cy = options.titlePos.y
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = options.textShadow ? 'rgba(0,0,0,0.8)' : 'transparent'
    ctx.shadowBlur = options.textShadow ? 12 : 0
    ctx.shadowOffsetX = options.textShadow ? 2 : 0
    ctx.shadowOffsetY = options.textShadow ? 2 : 0
    ctx.font = `bold ${Math.round(60 * options.fontScale)}px Inter, sans-serif`
    for (const line of ecTitle) {
      ctx.fillText(line, options.titlePos.x, cy)
      cy += titleLineH
    }
    if (ecBody.length > 0) {
      let bcy = options.bodyPos.y
      ctx.font = `${Math.round(26 * options.fontScale)}px Inter, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.80)'
      for (const line of ecBody) {
        ctx.fillText(line, options.bodyPos.x, bcy)
        bcy += bodyLineH
      }
    }
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

  } else {
    // tech-minimal
    const tmBg = options.bgVariant === 'white' ? '#ffffff' : '#111111'
    const tmText = options.bgVariant === 'white' ? '#000000' : '#ffffff'
    const tmBody = options.bgVariant === 'white' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.65)'

    ctx.fillStyle = tmBg
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.font = `bold ${Math.round(88 * options.fontScale)}px Montserrat, Inter, sans-serif`
    const tmTitle = wrapText(ctx, slide.title, 900)
    ctx.font = `${Math.round(30 * options.fontScale)}px Inter, sans-serif`
    const tmBodyLines = slide.body ? wrapText(ctx, slide.body, 900) : []
    const titleLineH = Math.round(100 * options.fontScale)
    const bodyLineH = Math.round(44 * options.fontScale)
    const lineGap = 20
    const lineThick = 2
    let cy = options.titlePos.y
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = tmText
    ctx.font = `bold ${Math.round(88 * options.fontScale)}px Montserrat, Inter, sans-serif`
    for (const line of tmTitle) {
      ctx.fillText(line, options.titlePos.x, cy)
      cy += titleLineH
    }
    ctx.fillStyle = options.accentColor
    ctx.fillRect(options.titlePos.x - 60, cy + lineGap, 120, lineThick)
    cy += lineGap + lineThick
    if (tmBodyLines.length > 0) {
      let bcy = options.bodyPos.y
      ctx.font = `${Math.round(30 * options.fontScale)}px Inter, sans-serif`
      ctx.fillStyle = tmBody
      ctx.textBaseline = 'top'
      for (const line of tmBodyLines) {
        ctx.fillText(line, options.bodyPos.x, bcy)
        bcy += bodyLineH
      }
    }
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // logo brand kit — canto inferior direito (compartilhado)
  if (logoUrl) {
    await new Promise<void>(resolve => {
      const logo = new window.Image()
      logo.crossOrigin = 'anonymous'
      logo.onload = () => {
        const scale = options.logoSize / logo.naturalHeight
        const logoW = logo.naturalWidth * scale
        const logoX = Math.round(options.logoPos.x - logoW / 2)
        const logoY = Math.round(options.logoPos.y - options.logoSize / 2)

        if (options.logoTint === 'white') {
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          ctx.drawImage(logo, logoX, logoY, logoW, options.logoSize)
          ctx.restore()
        } else {
          ctx.drawImage(logo, logoX, logoY, logoW, options.logoSize)
        }
        resolve()
      }
      logo.onerror = () => resolve()
      logo.src = (options.logoTint === 'white' && options.bgVariant !== 'white') ? options.logoWhiteUrl : logoUrl
    })
  }

}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CarouselPage() {
  const [slideCount, setSlideCount] = useState(4)
  const [templateId, setTemplateId] = useState('tech-statement')
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [slideImages, setSlideImages] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [brandLogoUrl, setBrandLogoUrl] = useState('')
  const brandLogoWhiteUrl = '/logo-agente17-white.png'
  const [fontScale, setFontScale] = useState(1)
  const [accentColor, setAccentColor] = useState('#3A5AFF')
  const [logoSize, setLogoSize] = useState(180)
  const [textShadow, setTextShadow] = useState(false)
  const [logoTint, setLogoTint] = useState<'original' | 'white'>(templateId === 'tech-minimal' ? 'white' : 'original')
  const [bgVariant, setBgVariant] = useState<'dark' | 'white'>('dark')
  const [slidePositions, setSlidePositions] = useState<Record<number, { titlePos: {x:number,y:number}, bodyPos: {x:number,y:number}, logoPos: {x:number,y:number} }>>({})
  const [dragging, setDragging] = useState<'title' | 'body' | 'logo' | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasRect, setCanvasRect] = useState<{width: number, height: number} | null>(null)

  const currentPositions = slidePositions[previewIndex ?? 0] ?? { titlePos: { x: 540, y: 400 }, bodyPos: { x: 540, y: 600 }, logoPos: { x: 960, y: 960 } }
  const titlePos = currentPositions.titlePos
  const bodyPos = currentPositions.bodyPos
  const logoPos = currentPositions.logoPos

  const updatePosition = (key: 'titlePos' | 'bodyPos' | 'logoPos', value: {x:number,y:number}) => {
    if (key === 'logoPos') {
      // propaga para todos os slides
      setSlidePositions(prev => {
        const updated: typeof prev = {}
        for (let i = 0; i < slides.length; i++) {
          updated[i] = {
            ...(prev[i] ?? { titlePos: { x: 540, y: 400 }, bodyPos: { x: 540, y: 600 }, logoPos: { x: 960, y: 960 } }),
            logoPos: value,
          }
        }
        return updated
      })
    } else {
      setSlidePositions(prev => ({
        ...prev,
        [previewIndex ?? 0]: {
          ...(prev[previewIndex ?? 0] ?? { titlePos: { x: 540, y: 400 }, bodyPos: { x: 540, y: 600 }, logoPos: { x: 960, y: 960 } }),
          [key]: value,
        }
      }))
    }
  }

  // Carrega logo do Brand Kit
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email
      if (!email) return
      loadBrandConfig(email).then(cfg => {
        const first = cfg.logos?.[0]?.url
        if (first) setBrandLogoUrl(first)
      })
    })
  }, [])

  // Renderiza canvas do modal sempre que o slide em preview muda
  const renderPreviewCanvas = useCallback(async (index: number) => {
    const canvas = previewCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const slide = slides[index]
    const imgSrc = slideImages[index] ?? ''
    await drawSlide(ctx, slide, imgSrc, templateId, brandLogoUrl, { fontScale, accentColor, logoSize, textShadow, logoTint, logoWhiteUrl: brandLogoWhiteUrl, bgVariant, titlePos, bodyPos, logoPos })
  }, [slides, slideImages, templateId, brandLogoUrl, brandLogoWhiteUrl, fontScale, accentColor, logoSize, textShadow, logoTint, bgVariant, titlePos, bodyPos, logoPos])

  useEffect(() => {
    if (previewIndex === null) return
    // aguarda o canvas ser inserido no DOM antes de renderizar
    const id = setTimeout(() => renderPreviewCanvas(previewIndex), 0)
    return () => clearTimeout(id)
  }, [previewIndex, renderPreviewCanvas])

  useEffect(() => {
    if (templateId === 'tech-minimal') {
      setLogoTint('white')
      setLogoSize(120)
    } else {
      setLogoTint('original')
      setLogoSize(210)
    }
  }, [templateId])

  useEffect(() => {
    setBgVariant('dark')
  }, [templateId])

  useEffect(() => {
    setSlidePositions({})
    setDragging(null)
  }, [templateId, slides])

  useEffect(() => {
    if (previewIndex === null) return
    const id = setTimeout(() => {
      const canvas = previewCanvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      setCanvasRect({ width: rect.width, height: rect.height })
    }, 50)
    return () => clearTimeout(id)
  }, [previewIndex])

  // Fecha modal com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPreviewIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleGenerate() {
    if (!prompt.trim() || status === 'loading') return
    setStatus('loading')
    setSlides([])
    setSlideImages([])
    setCaption('')
    try {
      const result = await generateCarouselContent(prompt, slideCount)
      setSlides(result.slides)
      setCaption(result.caption)
      const images = await Promise.all(
        result.slides.map(s => generateImage(s.imagePrompt).catch(() => ''))
      )
      setSlideImages(images)
      setStatus('idle')
    } catch (err) {
      console.error('[CarouselPage] erro ao gerar:', err)
      setStatus('error')
    } finally {
      setStatus(s => s === 'loading' ? 'error' : s)
    }
  }

  async function handleExport() {
    if (!slides.length || exporting) return
    setExporting(true)
    try {
      const zip = new JSZip()
      for (let i = 0; i < slides.length; i++) {
        const canvas = document.createElement('canvas')
        canvas.width  = 1080
        canvas.height = 1080
        const ctx = canvas.getContext('2d')!
        await drawSlide(ctx, slides[i], slideImages[i] ?? '', templateId, brandLogoUrl, { fontScale, accentColor, logoSize, textShadow, logoTint, logoWhiteUrl: brandLogoWhiteUrl, bgVariant, titlePos, bodyPos, logoPos })
        const base64 = canvas.toDataURL('image/png').split(',')[1]
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true })
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'carrossel.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isLoading = status === 'loading'

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Carrossel
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Gere slides para carrossel do Instagram com IA.
          </p>
        </div>

        {/* Config + Prompt */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Template do carrossel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Template do carrossel
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CAROUSEL_TEMPLATES.map(tpl => {
                const active = tpl.id === templateId
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setTemplateId(tpl.id)}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', textAlign: 'left',
                      fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                      background: active ? 'rgba(58,90,255,0.08)' : 'var(--bg-surface)',
                      border: active ? '1px solid rgba(58,90,255,0.5)' : '1px solid var(--border)',
                      boxShadow: active ? '0 0 0 1px rgba(58,90,255,0.2)' : 'none',
                    }}
                  >
                    <span style={{
                      display: 'block', fontSize: '13px', fontWeight: active ? 600 : 400,
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}>
                      {tpl.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Número de slides */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Número de slides
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SLIDE_COUNTS.map(n => {
                const active = n === slideCount
                return (
                  <button
                    key={n}
                    onClick={() => setSlideCount(n)}
                    style={{
                      width: '56px', height: '40px', borderRadius: '8px',
                      fontSize: '15px', fontWeight: active ? 700 : 400,
                      fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                      background: active
                        ? 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))'
                        : 'var(--bg-surface)',
                      border: active ? '1px solid rgba(58,90,255,0.5)' : '1px solid var(--border)',
                      color: active ? '#ffffff' : 'var(--text-secondary)',
                      boxShadow: active ? '0 2px 8px rgba(58,90,255,0.3)' : 'none',
                    }}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tema do carrossel
            </span>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
              placeholder="Descreva o tema do seu carrossel... Ex: 5 erros que empresas cometem ao usar IA"
              rows={3}
              spellCheck={false}
              style={{
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                padding: '12px 14px', fontFamily: 'inherit', resize: 'none', outline: 'none',
                lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-active)' }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>

          {/* Botão gerar */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="btn-gerar"
            style={{
              width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
              color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
              cursor: prompt.trim() && !isLoading ? 'pointer' : 'not-allowed',
              opacity: prompt.trim() && !isLoading ? 1 : 0.5, transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? 'Gerando...' : 'Gerar Carrossel'}
          </button>

          {status === 'error' && (
            <p style={{ fontSize: '13px', color: '#ef4444', margin: 0, textAlign: 'center' }}>
              Erro ao gerar o carrossel. Tente novamente.
            </p>
          )}
        </div>

        {/* Área de slides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Slides
            </span>
            {slides.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                style={{
                  fontSize: '12px', padding: '5px 14px', borderRadius: '7px', cursor: exporting ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s', opacity: exporting ? 0.6 : 1,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {exporting ? 'Exportando...' : 'Exportar ZIP'}
              </button>
            )}
          </div>

          {slides.length === 0 ? (
            <div style={{
              background: 'var(--bg-panel)', border: '1px dashed var(--border)', borderRadius: '12px',
              padding: '60px 24px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}>
              {isLoading ? <Spinner /> : <SlidesIcon />}
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                {isLoading ? 'Gerando slides e buscando imagens...' : 'Seus slides aparecerão aqui'}
              </p>
              {!isLoading && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6, margin: 0, textAlign: 'center' }}>
                  Descreva o tema acima e clique em Gerar Carrossel
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  onClick={() => setPreviewIndex(i)}
                  style={{
                    position: 'relative', aspectRatio: '1', borderRadius: '10px',
                    overflow: 'hidden', background: '#111', cursor: 'pointer',
                  }}
                >
                  {slideImages[i] && templateId !== 'tech-minimal' && (
                    <img
                      src={slideImages[i]}
                      alt=""
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.1) 100%)' }} />

                  <div style={{
                    position: 'absolute', top: '10px', left: '10px',
                    background: TYPE_COLOR[slide.type],
                    backdropFilter: 'blur(4px)',
                    color: '#fff', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.1em', padding: '3px 8px', borderRadius: '4px',
                  }}>
                    {TYPE_LABEL[slide.type]}
                  </div>

                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600,
                  }}>
                    {i + 1}/{slides.length}
                  </div>

                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px' }}>
                    <p style={{
                      margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700,
                      lineHeight: 1.3, textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    }}>
                      {slide.title}
                    </p>
                    {slide.body && (
                      <p style={{
                        margin: '4px 0 0', color: 'rgba(255,255,255,0.8)',
                        fontSize: '11px', lineHeight: 1.4,
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      }}>
                        {slide.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legenda */}
        {caption && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Legenda
              </span>
              <button
                onClick={handleCopyCaption}
                style={{
                  fontSize: '12px', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  background: copied ? 'rgba(34,197,94,0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                  color: copied ? 'rgb(34,197,94)' : 'var(--text-secondary)',
                }}
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <div style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px',
              padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)',
              lineHeight: 1.7, whiteSpace: 'pre-wrap',
            }}>
              {caption}
            </div>
          </div>
        )}

      </main>

      {/* Modal de preview */}
      {previewIndex !== null && slides[previewIndex] && (
        <div
          onClick={() => setPreviewIndex(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          {/* Botão anterior */}
          <button
            onClick={e => { e.stopPropagation(); setPreviewIndex(i => i !== null ? Math.max(0, i - 1) : null) }}
            disabled={previewIndex === 0}
            style={{
              position: 'absolute', left: '24px',
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: previewIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
              fontSize: '20px', cursor: previewIndex === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >
            ‹
          </button>

          {/* Canvas */}
          <div ref={canvasContainerRef} onClick={e => e.stopPropagation()} style={{ position: 'relative', display: 'inline-block' }}>
            <canvas
              ref={previewCanvasRef}
              width={1080}
              height={1080}
              onMouseDown={e => {
                const canvas = previewCanvasRef.current
                if (!canvas) return
                const rect = canvas.getBoundingClientRect()
                const scaleX = 1080 / rect.width
                const scaleY = 1080 / rect.height
                const mx = (e.clientX - rect.left) * scaleX
                const my = (e.clientY - rect.top) * scaleY
                const HIT = 80
                if (Math.abs(mx - titlePos.x) < 300 && Math.abs(my - titlePos.y) < HIT) setDragging('title')
                else if (Math.abs(mx - bodyPos.x) < 300 && Math.abs(my - bodyPos.y) < HIT) setDragging('body')
                else if (Math.abs(mx - logoPos.x) < 150 && Math.abs(my - logoPos.y) < 150) setDragging('logo')
              }}
              onMouseMove={e => {
                if (!dragging) return
                const canvas = previewCanvasRef.current
                if (!canvas) return
                const rect = canvas.getBoundingClientRect()
                const scaleX = 1080 / rect.width
                const scaleY = 1080 / rect.height
                const mx = Math.round((e.clientX - rect.left) * scaleX)
                const my = Math.round((e.clientY - rect.top) * scaleY)
                if (dragging === 'title') updatePosition('titlePos', { x: mx, y: my })
                else if (dragging === 'body') updatePosition('bodyPos', { x: mx, y: my })
                else if (dragging === 'logo') updatePosition('logoPos', { x: mx, y: my })
              }}
              onMouseUp={() => setDragging(null)}
              onMouseLeave={() => setDragging(null)}
              style={{
                display: 'block',
                maxWidth: 'min(80vh, calc(100vw - 160px))',
                maxHeight: '80vh',
                borderRadius: '12px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                cursor: dragging ? 'grabbing' : 'grab',
              }}
            />
            {/* SVG overlay: réguas permanentes */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: canvasRect ? `${canvasRect.width}px` : '100%',
                height: canvasRect ? `${canvasRect.height}px` : '100%',
                pointerEvents: 'none',
                borderRadius: '12px',
              }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,0,0,0.6)" strokeWidth="0.3" strokeDasharray="2,1.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,0,0,0.6)" strokeWidth="0.3" strokeDasharray="2,1.5" />
              <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="rgba(255,0,0,0.3)" strokeWidth="0.2" strokeDasharray="1.5,2" />
              <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="rgba(255,0,0,0.3)" strokeWidth="0.2" strokeDasharray="1.5,2" />
              <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="rgba(255,0,0,0.3)" strokeWidth="0.2" strokeDasharray="1.5,2" />
              <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="rgba(255,0,0,0.3)" strokeWidth="0.2" strokeDasharray="1.5,2" />
            </svg>
            {/* Contador */}
            <p style={{
              textAlign: 'center', color: 'rgba(255,255,255,0.5)',
              fontSize: '12px', marginTop: '12px',
            }}>
              {previewIndex + 1} / {slides.length}
            </p>

            {/* Controles em tempo real */}
            <div style={{
              background: 'rgba(0,0,0,0.6)', padding: '16px', marginTop: '12px',
              borderRadius: '10px', display: 'flex', gap: '20px', flexWrap: 'wrap',
              justifyContent: 'center',
            }}>

              {/* Cor de destaque */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Cor de destaque
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['#3A5AFF', '#FFCA1D', '#FF6F5E', '#FFFFFF', '#000000'].map(color => {
                    const active = accentColor === color
                    const activeBorder = color === '#FFFFFF' ? '#3A5AFF' : '#FFFFFF'
                    const border = color === '#000000'
                      ? (active ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.4)')
                      : (active ? `2px solid ${activeBorder}` : '2px solid transparent')
                    return (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: color, border,
                          boxShadow: active ? `0 0 0 2px ${color}` : 'none',
                          cursor: 'pointer', padding: 0, transition: 'all 0.15s',
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Fonte */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Fonte
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range" min={0.7} max={1.5} step={0.05} value={fontScale}
                    onChange={e => setFontScale(Number(e.target.value))}
                    style={{ width: '100px', accentColor: '#3A5AFF' }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', minWidth: '34px' }}>
                    {Math.round(fontScale * 100)}%
                  </span>
                </div>
              </div>

              {/* Logo tamanho */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Logo tamanho
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range" min={100} max={300} step={10} value={logoSize}
                    onChange={e => setLogoSize(Number(e.target.value))}
                    style={{ width: '100px', accentColor: '#3A5AFF' }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', minWidth: '36px' }}>
                    {logoSize}px
                  </span>
                </div>
              </div>

              {/* Logo cor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Logo cor
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {([{ label: 'Original', value: 'original' }, { label: 'Branco', value: 'white' }] as const).map(opt => {
                    const active = logoTint === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setLogoTint(opt.value); setLogoSize(opt.value === 'original' ? 210 : 120) }}
                        style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                          fontWeight: active ? 700 : 400, fontFamily: 'inherit',
                          cursor: 'pointer', transition: 'all 0.15s',
                          background: active ? 'rgba(58,90,255,0.8)' : 'rgba(255,255,255,0.1)',
                          border: active ? '1px solid rgba(58,90,255,0.6)' : '1px solid rgba(255,255,255,0.15)',
                          color: '#ffffff',
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Fundo (apenas tech-minimal) */}
              {templateId === 'tech-minimal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fundo</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[{ label: 'Escuro', value: 'dark' }, { label: 'Branco', value: 'white' }].map(opt => {
                      const active = bgVariant === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setBgVariant(opt.value as 'dark' | 'white'); setLogoTint(opt.value === 'white' ? 'original' : 'white') }}
                          style={{
                            padding: '0 14px', height: '36px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: active ? 700 : 400,
                            fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                            background: active ? 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))' : 'rgba(255,255,255,0.08)',
                            border: active ? '1px solid rgba(58,90,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
                            color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Sombra */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Sombra
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {([{ label: 'On', value: true }, { label: 'Off', value: false }] as const).map(opt => {
                    const active = textShadow === opt.value
                    return (
                      <button
                        key={String(opt.value)}
                        onClick={() => setTextShadow(opt.value)}
                        style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                          fontWeight: active ? 700 : 400, fontFamily: 'inherit',
                          cursor: 'pointer', transition: 'all 0.15s',
                          background: active ? 'rgba(58,90,255,0.8)' : 'rgba(255,255,255,0.1)',
                          border: active ? '1px solid rgba(58,90,255,0.6)' : '1px solid rgba(255,255,255,0.15)',
                          color: '#ffffff',
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>


            </div>
          </div>

          {/* Botão próximo */}
          <button
            onClick={e => { e.stopPropagation(); setPreviewIndex(i => i !== null ? Math.min(slides.length - 1, i + 1) : null) }}
            disabled={previewIndex === slides.length - 1}
            style={{
              position: 'absolute', right: '24px',
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: previewIndex === slides.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff',
              fontSize: '20px', cursor: previewIndex === slides.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >
            ›
          </button>

          {/* Botão fechar */}
          <button
            onClick={() => setPreviewIndex(null)}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SlidesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3, color: 'var(--text-muted)' }}>
      <rect x="2" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="11" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function Spinner() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M14 3a11 11 0 0 1 11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
