// updated 23 mar 2026
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import JSZip from 'jszip'
import { generateCarouselContent, turboPrompt } from '../services/gemini'
import type { CarouselSlide } from '../services/gemini'
import { generateImage } from '../services/replicate'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { PULSE_COSTS } from '../services/tokens'

const SLIDE_COUNTS = [3, 4, 5, 7, 10]

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
  options: { titleFontScale: number; bodyFontScale: number; titleAlign: 'left' | 'center' | 'right'; bodyAlign: 'left' | 'center' | 'right'; titleColor: string; bodyColor: string; fontFamily: string; accentColor: string; accentPos: {x:number,y:number}; logoSize: number; textShadow: boolean; logoTint: 'original' | 'white'; logoWhiteUrl: string; bgVariant: 'dark' | 'white'; titlePos: {x:number,y:number}; bodyPos: {x:number,y:number}; logoPos: {x:number,y:number} },
) {
  const W = 1080
  const H = 1350
  ctx.clearRect(0, 0, W, H)
  const titleX = options.titleAlign === 'left' ? 80 : options.titleAlign === 'right' ? W - 80 : W / 2
  const bodyX = options.bodyAlign === 'left' ? 80 : options.bodyAlign === 'right' ? W - 80 : W / 2

  if (templateId === 'tech-statement') {
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, W, H)
    if (imgSrc) {
      await new Promise<void>(resolve => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
          const w = img.naturalWidth * scale
          const h = img.naturalHeight * scale
          ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = imgSrc
      })
    }
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.82)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = options.accentColor
    ctx.fillRect(options.accentPos.x, options.accentPos.y, 6, 320)
    ctx.textAlign = options.titleAlign
    ctx.textBaseline = 'top'
    ctx.fillStyle = options.titleColor
    ctx.shadowColor = options.textShadow ? 'rgba(0,0,0,0.8)' : 'transparent'
    ctx.shadowBlur = options.textShadow ? 12 : 0
    ctx.shadowOffsetX = options.textShadow ? 2 : 0
    ctx.shadowOffsetY = options.textShadow ? 2 : 0
    ctx.font = `bold ${Math.round(68 * options.titleFontScale)}px ${options.fontFamily}, sans-serif`
    const tsTitle = wrapText(ctx, slide.title, 860)
    let cy = options.titlePos.y
    for (const line of tsTitle) {
      ctx.fillText(line, titleX, cy)
      cy += 80
    }
    if (slide.body) {
      let bcy = options.bodyPos.y
      ctx.textAlign = options.bodyAlign
      ctx.font = `${Math.round(28 * options.bodyFontScale)}px ${options.fontFamily}, sans-serif`
      ctx.fillStyle = options.bodyColor
      for (const line of wrapText(ctx, slide.body, 860)) {
        ctx.fillText(line, bodyX, bcy)
        bcy += 40
      }
    }
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

  } else if (templateId === 'tech-product') {
    ctx.fillStyle = '#0D0D0D'
    ctx.fillRect(0, 0, W, H)
    if (imgSrc) {
      await new Promise<void>(resolve => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
          const w = img.naturalWidth * scale
          const h = img.naturalHeight * scale
          ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = imgSrc
      })
    }
    const tpGrad = ctx.createLinearGradient(0, 0, 0, H)
    tpGrad.addColorStop(0, 'rgba(0,0,0,0.3)')
    tpGrad.addColorStop(1, 'rgba(0,0,0,0.75)')
    ctx.fillStyle = tpGrad
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = options.accentColor
    ctx.fillRect(0, options.accentPos.y > 100 ? 0 : options.accentPos.y, W, 8)
    ctx.font = `bold ${Math.round(72 * options.titleFontScale)}px ${options.fontFamily}, sans-serif`
    ctx.fillStyle = options.titleColor
    ctx.shadowColor = options.textShadow ? 'rgba(0,0,0,0.8)' : 'transparent'
    ctx.shadowBlur = options.textShadow ? 12 : 0
    ctx.shadowOffsetX = options.textShadow ? 2 : 0
    ctx.shadowOffsetY = options.textShadow ? 2 : 0
    ctx.textAlign = options.titleAlign
    ctx.textBaseline = 'top'
    const tpTitle = wrapText(ctx, slide.title, 900)
    let cy = options.titlePos.y
    for (const line of tpTitle) {
      ctx.fillText(line, titleX, cy)
      cy += 86
    }
    ctx.fillStyle = options.accentColor
    ctx.fillRect(options.accentPos.x, options.accentPos.y, 120, 3)
    if (slide.body) {
      let bcy = options.bodyPos.y
      ctx.textAlign = options.bodyAlign
      ctx.font = `${Math.round(30 * options.bodyFontScale)}px ${options.fontFamily}, sans-serif`
      ctx.fillStyle = options.bodyColor
      ctx.textBaseline = 'top'
      for (const line of wrapText(ctx, slide.body, 900)) {
        ctx.fillText(line, bodyX, bcy)
        bcy += 44
      }
    }
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

  } else if (templateId === 'editorial-card') {
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, W, H)
    if (imgSrc) {
      await new Promise<void>(resolve => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
          const w = img.naturalWidth * scale
          const h = img.naturalHeight * scale
          ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
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
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = options.accentColor
    ctx.fillRect(0, options.accentPos.y, W, 6)
    ctx.font = `bold ${Math.round(60 * options.titleFontScale)}px ${options.fontFamily}, sans-serif`
    const ecTitle = wrapText(ctx, slide.title, 700)
    ctx.font = `${Math.round(26 * options.bodyFontScale)}px ${options.fontFamily}, sans-serif`
    const ecBody = slide.body ? wrapText(ctx, slide.body, 700) : []
    const titleLineH = 72
    const bodyLineH = 36
    let cy = options.titlePos.y
    ctx.textAlign = options.titleAlign
    ctx.textBaseline = 'top'
    ctx.fillStyle = options.titleColor
    ctx.shadowColor = options.textShadow ? 'rgba(0,0,0,0.8)' : 'transparent'
    ctx.shadowBlur = options.textShadow ? 12 : 0
    ctx.shadowOffsetX = options.textShadow ? 2 : 0
    ctx.shadowOffsetY = options.textShadow ? 2 : 0
    ctx.font = `bold ${Math.round(60 * options.titleFontScale)}px ${options.fontFamily}, sans-serif`
    for (const line of ecTitle) {
      ctx.fillText(line, titleX, cy)
      cy += titleLineH
    }
    if (ecBody.length > 0) {
      let bcy = options.bodyPos.y
      ctx.textAlign = options.bodyAlign
      ctx.font = `${Math.round(26 * options.bodyFontScale)}px ${options.fontFamily}, sans-serif`
      ctx.fillStyle = options.bodyColor
      for (const line of ecBody) {
        ctx.fillText(line, bodyX, bcy)
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

    ctx.fillStyle = tmBg
    ctx.fillRect(0, 0, W, H)
    ctx.font = `bold ${Math.round(88 * options.titleFontScale)}px ${options.fontFamily}, sans-serif`
    const tmTitle = wrapText(ctx, slide.title, 900)
    ctx.font = `${Math.round(30 * options.bodyFontScale)}px ${options.fontFamily}, sans-serif`
    const tmBodyLines = slide.body ? wrapText(ctx, slide.body, 900) : []
    const titleLineH = Math.round(100 * options.titleFontScale)
    const bodyLineH = Math.round(44 * options.bodyFontScale)
    const lineGap = 20
    const lineThick = 2
    let cy = options.titlePos.y
    ctx.textAlign = options.titleAlign
    ctx.textBaseline = 'top'
    ctx.fillStyle = options.titleColor
    ctx.font = `bold ${Math.round(88 * options.titleFontScale)}px ${options.fontFamily}, sans-serif`
    for (const line of tmTitle) {
      ctx.fillText(line, titleX, cy)
      cy += titleLineH
    }
    ctx.fillStyle = options.accentColor
    ctx.fillRect(options.accentPos.x - 60, cy + lineGap, 120, lineThick)
    cy += lineGap + lineThick
    if (tmBodyLines.length > 0) {
      let bcy = options.bodyPos.y
      ctx.textAlign = options.bodyAlign
      ctx.font = `${Math.round(30 * options.bodyFontScale)}px ${options.fontFamily}, sans-serif`
      ctx.fillStyle = options.bodyColor
      ctx.textBaseline = 'top'
      for (const line of tmBodyLines) {
        ctx.fillText(line, bodyX, bcy)
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
  const [turboing, setTurboing] = useState(false)
  const [regeneratingSlide, setRegeneratingSlide] = useState(false)
  const slideImageInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [slideImages, setSlideImages] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [brandLogoUrl, setBrandLogoUrl] = useState('')
  const [brandPhotos, setBrandPhotos] = useState<string[]>([])
  const [brandContext, setBrandContext] = useState<{ businessName?: string; segment?: string; tone?: string; visualStyle?: string; brandDescription?: string }>({})
  const brandLogoWhiteUrl = brandLogoUrl
  const [titleFontScale, setTitleFontScale] = useState(1)
  const [bodyFontScale, setBodyFontScale] = useState(1)
  const [titleAlign, setTitleAlign] = useState<'left' | 'center' | 'right'>('center')
  const [bodyAlign, setBodyAlign] = useState<'left' | 'center' | 'right'>('center')
  const [titleColor, setTitleColor] = useState('#FFFFFF')
  const [bodyColor, setBodyColor] = useState('rgba(255,255,255,0.78)')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [accentColor, setAccentColor] = useState('#3A5AFF')
  const [logoSize, setLogoSize] = useState(180)
  const [textShadow, setTextShadow] = useState(false)
  const [logoTint, setLogoTint] = useState<'original' | 'white'>(templateId === 'tech-minimal' ? 'white' : 'original')
  const [bgVariant, setBgVariant] = useState<'dark' | 'white'>('dark')
  const [slidePositions, setSlidePositions] = useState<Record<number, { titlePos: {x:number,y:number}, bodyPos: {x:number,y:number}, logoPos: {x:number,y:number} }>>({})
  const [accentPos, setAccentPos] = useState({ x: 80, y: 180 })
  const [dragging, setDragging] = useState<'title' | 'body' | 'logo' | 'accent' | null>(null)
  const [linkedinToken, setLinkedinToken] = useState<string>('')
  const [linkedinSub, setLinkedinSub] = useState<string>('')
  const [linkedinName, setLinkedinName] = useState<string>('')
  const [publishingLinkedIn, setPublishingLinkedIn] = useState(false)
  const [linkedinStatus, setLinkedinStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [publishingInstagram, setPublishingInstagram] = useState(false)
  const [instagramStatus, setInstagramStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasRect, setCanvasRect] = useState<{width: number, height: number} | null>(null)

  const currentPositions = slidePositions[previewIndex ?? 0] ?? { titlePos: { x: 540, y: 500 }, bodyPos: { x: 540, y: 750 }, logoPos: { x: 960, y: 1200 } }
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
            ...(prev[i] ?? { titlePos: { x: 540, y: 500 }, bodyPos: { x: 540, y: 750 }, logoPos: { x: 960, y: 1200 } }),
            logoPos: value,
          }
        }
        return updated
      })
    } else {
      setSlidePositions(prev => ({
        ...prev,
        [previewIndex ?? 0]: {
          ...(prev[previewIndex ?? 0] ?? { titlePos: { x: 540, y: 500 }, bodyPos: { x: 540, y: 750 }, logoPos: { x: 960, y: 1200 } }),
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
        setBrandContext({
          businessName: cfg.business_name || cfg.brand_name,
          segment: cfg.segment,
          tone: cfg.tone,
          visualStyle: cfg.visual_style ?? undefined,
          brandDescription: cfg.brand_description ?? undefined,
        })
        setBrandPhotos(cfg.photos ?? [])
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
    await drawSlide(ctx, slide, imgSrc, templateId, brandLogoUrl, { titleFontScale, bodyFontScale, titleAlign, bodyAlign, titleColor, bodyColor, fontFamily, accentColor, accentPos, logoSize, textShadow, logoTint, logoWhiteUrl: brandLogoWhiteUrl, bgVariant, titlePos, bodyPos, logoPos })
  }, [slides, slideImages, templateId, brandLogoUrl, brandLogoWhiteUrl, titleFontScale, bodyFontScale, titleAlign, bodyAlign, titleColor, bodyColor, fontFamily, accentColor, accentPos, logoSize, textShadow, logoTint, bgVariant, titlePos, bodyPos, logoPos])

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
    setAccentPos(templateId === 'tech-product' ? { x: 80, y: 400 } : templateId === 'editorial-card' ? { x: 0, y: 0 } : { x: 80, y: 180 })
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

  useEffect(() => {
    setLinkedinToken(localStorage.getItem('linkedin_token') ?? '')
    setLinkedinSub(localStorage.getItem('linkedin_sub') ?? '')
    setLinkedinName(localStorage.getItem('linkedin_name') ?? '')
  }, [])

  useEffect(() => {
    const restore = searchParams.get('restore')
    if (!restore) return
    try {
      const data = JSON.parse(restore)
      const parsedSlides = JSON.parse(data.slides)
      const parsedImages = JSON.parse(data.slide_images)
      const parsedSettings = data.settings ? JSON.parse(data.settings) : null

      setSlides(parsedSlides)
      setSlideImages(parsedImages)
      setCaption(data.caption ?? '')
      setPrompt(data.prompt ?? '')
      setTemplateId(data.template_id ?? 'tech-statement')
      setSlideCount(parsedSlides.length)

      if (parsedSettings) {
        if (parsedSettings.fontFamily) setFontFamily(parsedSettings.fontFamily)
        if (parsedSettings.titleFontScale) setTitleFontScale(parsedSettings.titleFontScale)
        if (parsedSettings.bodyFontScale) setBodyFontScale(parsedSettings.bodyFontScale)
        if (parsedSettings.titleAlign) setTitleAlign(parsedSettings.titleAlign)
        if (parsedSettings.bodyAlign) setBodyAlign(parsedSettings.bodyAlign)
        if (parsedSettings.titleColor) setTitleColor(parsedSettings.titleColor)
        if (parsedSettings.bodyColor) setBodyColor(parsedSettings.bodyColor)
        if (parsedSettings.accentColor) setAccentColor(parsedSettings.accentColor)
        if (parsedSettings.logoSize) setLogoSize(parsedSettings.logoSize)
        if (parsedSettings.textShadow !== undefined) setTextShadow(parsedSettings.textShadow)
        if (parsedSettings.logoTint) setLogoTint(parsedSettings.logoTint)
        if (parsedSettings.bgVariant) setBgVariant(parsedSettings.bgVariant)
      }

      // Limpa os params da URL
      setSearchParams({})
    } catch (err) {
      console.error('[CarouselPage] erro ao restaurar:', err)
    }
  }, [])

  async function handleGenerate() {
    if (!prompt.trim() || status === 'loading') return
    setStatus('loading')
    setSlides([])
    setSlideImages([])
    setCaption('')
    try {
      const result = await generateCarouselContent(prompt, slideCount, brandContext)
      setSlides(result.slides)
      setCaption(result.caption)
      const images: string[] = []
      for (const s of result.slides) {
        try {
          const url = await generateImage(s.imagePrompt, PULSE_COSTS.CAROUSEL_SLIDE)
          images.push(url)
        } catch {
          images.push('')
        }
      }
      setSlideImages(images)
      setStatus('idle')
    } catch (err) {
      console.error('[CarouselPage] erro ao gerar:', err)
      setStatus('error')
    } finally {
      setStatus(s => s === 'loading' ? 'error' : s)
    }
  }

  async function handleTurbo() {
    if (!prompt.trim() || turboing) return
    setTurboing(true)
    try {
      const turboed = await turboPrompt(prompt.trim(), brandContext)
      setPrompt(turboed)
    } catch {
      // silencioso — mantém o prompt original
    } finally {
      setTurboing(false)
    }
  }

  async function handleRegenerateSlideImage() {
    if (previewIndex === null || regeneratingSlide) return
    setRegeneratingSlide(true)
    try {
      const slide = slides[previewIndex]
      const url = await generateImage(slide.imagePrompt, PULSE_COSTS.CAROUSEL_SLIDE)
      setSlideImages(prev => {
        const next = [...prev]
        next[previewIndex] = url
        return next
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('insuficientes')) {
        alert('Pulses insuficientes para regerar a imagem.')
      }
    } finally {
      setRegeneratingSlide(false)
    }
  }

  function handleSlideImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || previewIndex === null) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        setSlideImages(prev => {
          const next = [...prev]
          next[previewIndex] = result
          return next
        })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleExport() {
    if (!slides.length || exporting) return
    setExporting(true)
    try {
      const zip = new JSZip()
      for (let i = 0; i < slides.length; i++) {
        const canvas = document.createElement('canvas')
        canvas.width  = 1080
        canvas.height = 1350
        const ctx = canvas.getContext('2d')!
        await drawSlide(ctx, slides[i], slideImages[i] ?? '', templateId, brandLogoUrl, { titleFontScale, bodyFontScale, titleAlign, bodyAlign, titleColor, bodyColor, fontFamily, accentColor, accentPos, logoSize, textShadow, logoTint, logoWhiteUrl: brandLogoWhiteUrl, bgVariant, titlePos, bodyPos, logoPos })
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

  async function handleSave() {
    if (!slides.length || saving) return
    setSaving(true)
    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email
      if (!email) throw new Error('Usuário não autenticado')

      const title = slides[0]?.title ?? prompt ?? 'Carrossel sem título'

      const settings = {
        templateId, fontFamily, titleFontScale, bodyFontScale,
        titleAlign, bodyAlign, titleColor, bodyColor,
        accentColor, logoSize, textShadow, logoTint, bgVariant,
      }

      const { error } = await supabase.from('carousels').insert({
        user_email: email,
        title,
        prompt,
        template_id: templateId,
        slides: JSON.stringify(slides),
        slide_images: JSON.stringify(slideImages),
        caption,
        settings: JSON.stringify(settings),
      })

      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('[CarouselPage] erro ao salvar:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublishLinkedIn() {
    if (!linkedinToken || !linkedinSub || !slides.length || publishingLinkedIn) return
    setPublishingLinkedIn(true)
    setLinkedinStatus('idle')
    try {
      // Renderiza todos os slides em canvas e converte para base64
      const images: string[] = []
      for (let i = 0; i < slides.length; i++) {
        const canvas = document.createElement('canvas')
        canvas.width = 1080
        canvas.height = 1350
        const ctx = canvas.getContext('2d')!
        const pos = slidePositions[i] ?? { titlePos: { x: 540, y: 500 }, bodyPos: { x: 540, y: 750 }, logoPos: { x: 960, y: 1200 } }
        await drawSlide(ctx, slides[i], slideImages[i] ?? '', templateId, brandLogoUrl, {
          titleFontScale, bodyFontScale, titleAlign, bodyAlign, titleColor, bodyColor, fontFamily,
          accentColor, accentPos, logoSize, textShadow, logoTint,
          logoWhiteUrl: brandLogoWhiteUrl, bgVariant,
          titlePos: pos.titlePos, bodyPos: pos.bodyPos, logoPos: pos.logoPos,
        })
        images.push(canvas.toDataURL('image/jpeg', 0.92))
      }

      const text = caption || prompt

      const res = await fetch('/api/linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: linkedinToken,
          linkedinSub,
          text,
          images,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setLinkedinStatus('success')
        setTimeout(() => setLinkedinStatus('idle'), 3000)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error('[CarouselPage] erro ao publicar LinkedIn:', err)
      setLinkedinStatus('error')
      setTimeout(() => setLinkedinStatus('idle'), 3000)
    } finally {
      setPublishingLinkedIn(false)
    }
  }

  async function handlePublishInstagram() {
    if (!slides.length || publishingInstagram) return
    setPublishingInstagram(true)
    setInstagramStatus('idle')
    try {
      // Renderiza todos os slides e faz upload para o Supabase Storage
      const imageUrls: string[] = []
      for (let i = 0; i < slides.length; i++) {
        const canvas = document.createElement('canvas')
        canvas.width = 1080
        canvas.height = 1350
        const ctx = canvas.getContext('2d')!
        const pos = slidePositions[i] ?? { titlePos: { x: 540, y: 500 }, bodyPos: { x: 540, y: 750 }, logoPos: { x: 960, y: 1200 } }
        await drawSlide(ctx, slides[i], slideImages[i] ?? '', templateId, brandLogoUrl, {
          titleFontScale, bodyFontScale, titleAlign, bodyAlign, titleColor, bodyColor, fontFamily,
          accentColor, accentPos, logoSize, textShadow, logoTint,
          logoWhiteUrl: brandLogoWhiteUrl, bgVariant,
          titlePos: pos.titlePos, bodyPos: pos.bodyPos, logoPos: pos.logoPos,
        })

        // Converte canvas para blob e faz upload
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const blob = new Blob([byteArray], { type: 'image/jpeg' })
        const fileName = `instagram-carousel-${Date.now()}-${i}.jpg`

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

        if (uploadError) throw new Error(`Erro ao fazer upload do slide ${i + 1}`)

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
        imageUrls.push(urlData.publicUrl)
      }

      // Publica no Instagram
      const igUserId = '17841479034844249'
      const text = caption || prompt

      const res = await fetch('/api/instagram-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls, caption: text, igUserId }),
      })

      const data = await res.json()
      if (data.success) {
        setInstagramStatus('success')
        setTimeout(() => setInstagramStatus('idle'), 3000)
        // Remove imagens temporárias
        const fileNames = imageUrls.map((_, i) => `instagram-carousel-${Date.now()}-${i}.jpg`)
        await supabase.storage.from('media').remove(fileNames)
      } else {
        throw new Error(data.error)
      }
    } catch (err: unknown) {
      console.error('[CarouselPage] erro Instagram:', err)
      setInstagramStatus('error')
      setTimeout(() => setInstagramStatus('idle'), 3000)
    } finally {
      setPublishingInstagram(false)
    }
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function updateSlide(index: number, field: 'title' | 'body', value: string) {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
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

          <button
            onClick={handleTurbo}
            disabled={turboing || !prompt.trim()}
            title="Turbinar prompt com IA"
            style={{
              alignSelf: 'flex-end',
              background: turboing ? 'rgba(255,202,29,0.2)' : 'rgba(255,202,29,0.1)',
              border: '1px solid rgba(255,202,29,0.3)',
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: turboing || !prompt.trim() ? 'default' : 'pointer',
              color: '#FFCA1D',
              fontSize: '13px',
              fontFamily: 'inherit',
              fontWeight: 600,
              opacity: !prompt.trim() ? 0.4 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {turboing ? 'Turbinando...' : '⚡ Turbinar prompt'}
          </button>

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
            {status === 'loading' ? 'Gerando...' : `Gerar Carrossel  ·  ${slideCount * PULSE_COSTS.CAROUSEL_SLIDE} pulses`}
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
            {slides.length > 0 && (
              <button
                onClick={handleSave}
                disabled={saving || !slides.length}
                style={{
                  fontSize: '12px', padding: '5px 14px', borderRadius: '7px', cursor: saving || !slides.length ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  opacity: saving || !slides.length ? 0.6 : 1,
                  background: saved ? 'rgba(34,197,94,0.8)' : 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar'}
              </button>
            )}
          {slides.length > 0 && (
            linkedinToken ? (
              <button
                onClick={handlePublishLinkedIn}
                disabled={publishingLinkedIn}
                style={{
                  fontSize: '12px', padding: '5px 14px', borderRadius: '7px',
                  cursor: publishingLinkedIn ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s', fontWeight: 600,
                  opacity: publishingLinkedIn ? 0.6 : 1, border: 'none',
                  background: linkedinStatus === 'success' ? 'rgba(34,197,94,0.8)' : linkedinStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #0077B5, #005e93)',
                  color: 'white',
                }}
              >
                {publishingLinkedIn ? 'Publicando...' : linkedinStatus === 'success' ? '✓ Publicado' : linkedinStatus === 'error' ? 'Erro' : 'LinkedIn'}
              </button>
            ) : (
              <button
                onClick={() => window.open('/api/linkedin-auth', '_blank', 'width=600,height=700')}
                style={{
                  fontSize: '12px', padding: '5px 14px', borderRadius: '7px',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  background: 'linear-gradient(135deg, #0077B5, #005e93)',
                  border: 'none', color: 'white',
                }}
              >
                Conectar LinkedIn
              </button>
            )
          )}
          {slides.length > 0 && (
            <button
              onClick={handlePublishInstagram}
              disabled={publishingInstagram}
              style={{
                fontSize: '12px', padding: '5px 14px', borderRadius: '7px',
                cursor: publishingInstagram ? 'default' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s', fontWeight: 600,
                opacity: publishingInstagram ? 0.6 : 1, border: 'none',
                background: instagramStatus === 'success' ? 'rgba(34,197,94,0.8)' : instagramStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                color: 'white',
              }}
            >
              {publishingInstagram ? 'Publicando...' : instagramStatus === 'success' ? '✓ Publicado' : instagramStatus === 'error' ? 'Erro' : 'Instagram'}
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
          {/* Navegação por teclado/botão */}
          {previewIndex !== null && previewIndex > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setPreviewIndex(i => i !== null ? Math.max(0, i - 1) : null) }}
              style={{
                position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)',
                width: '44px', height: '44px', borderRadius: '50%', zIndex: 1001,
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '22px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              ‹
            </button>
          )}
          {previewIndex !== null && previewIndex < slides.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setPreviewIndex(i => i !== null ? Math.min(slides.length - 1, i + 1) : null) }}
              style={{
                position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)',
                width: '44px', height: '44px', borderRadius: '50%', zIndex: 1001,
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '22px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              ›
            </button>
          )}

          {/* Container principal centralizado */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', maxHeight: '92vh', width: 'auto' }}
          >
            {/* Canvas com réguas */}
            <div ref={canvasContainerRef} style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
            <canvas
              ref={previewCanvasRef}
              width={1080}
              height={1350}
              onMouseDown={e => {
                const canvas = previewCanvasRef.current
                if (!canvas) return
                const rect = canvas.getBoundingClientRect()
                const scaleX = 1080 / rect.width
                const scaleY = 1350 / rect.height
                const mx = (e.clientX - rect.left) * scaleX
                const my = (e.clientY - rect.top) * scaleY
                const LOGO_HIT = logoSize * 0.8
                const TITLE_HIT_W = templateId === 'tech-statement' ? 200 : 400
                const TITLE_HIT_H = Math.round(88 * titleFontScale) * 4 + 80
                const BODY_HIT_W = 400
                const BODY_HIT_H = Math.round(30 * bodyFontScale) * 5 + 60

                // Accent tem prioridade — área menor e mais específica
                const accentHit = templateId === 'tech-statement'
                  ? Math.abs(mx - accentPos.x) < 40 && Math.abs(my - (accentPos.y + 160)) < 180
                  : templateId === 'tech-minimal'
                  ? Math.abs(mx - accentPos.x) < 80 && Math.abs(my - accentPos.y) < 20
                  : templateId === 'editorial-card'
                  ? Math.abs(my - accentPos.y) < 40
                  : Math.abs(mx - accentPos.x) < 80 && Math.abs(my - accentPos.y) < 20

                if (accentHit) setDragging('accent')
                else if (Math.abs(mx - logoPos.x) < LOGO_HIT && Math.abs(my - logoPos.y) < LOGO_HIT) setDragging('logo')
                else if (Math.abs(mx - titlePos.x) < TITLE_HIT_W && my > titlePos.y - 60 && my < titlePos.y + TITLE_HIT_H) setDragging('title')
                else if (Math.abs(mx - bodyPos.x) < BODY_HIT_W && my > bodyPos.y - 40 && my < bodyPos.y + BODY_HIT_H) setDragging('body')
              }}
              onMouseMove={e => {
                if (!dragging) return
                const canvas = previewCanvasRef.current
                if (!canvas) return
                const rect = canvas.getBoundingClientRect()
                const scaleX = 1080 / rect.width
                const scaleY = 1350 / rect.height
                const mx = Math.round((e.clientX - rect.left) * scaleX)
                const my = Math.round((e.clientY - rect.top) * scaleY)
                if (dragging === 'title') updatePosition('titlePos', { x: mx, y: my })
                else if (dragging === 'body') updatePosition('bodyPos', { x: mx, y: my })
                else if (dragging === 'logo') updatePosition('logoPos', { x: mx, y: my })
                else if (dragging === 'accent') {
                  if (templateId === 'editorial-card') {
                    setAccentPos(prev => ({ ...prev, y: my }))
                  } else {
                    setAccentPos({ x: mx, y: my })
                  }
                }
              }}
              onMouseUp={() => setDragging(null)}
              onMouseLeave={() => setDragging(null)}
              style={{
                display: 'block',
                maxHeight: '85vh',
                width: 'auto',
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
            </div>

            {/* Painel lateral direito */}
            <div style={{
              width: '240px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}>
              {/* Painel de edição de texto */}
              <div style={{
                width: '100%', background: 'rgba(20,20,20,0.95)', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '14px',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                  Slide {(previewIndex ?? 0) + 1} de {slides.length}
                </span>

                {/* Título */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Título</span>
                  <textarea
                    value={slides[previewIndex ?? 0]?.title ?? ''}
                    onChange={e => updateSlide(previewIndex ?? 0, 'title', e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px', color: '#fff', fontSize: '12px', padding: '8px 10px',
                      fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5,
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(58,90,255,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Texto</span>
                  <textarea
                    value={slides[previewIndex ?? 0]?.body ?? ''}
                    onChange={e => updateSlide(previewIndex ?? 0, 'body', e.target.value)}
                    rows={4}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px', color: '#fff', fontSize: '12px', padding: '8px 10px',
                      fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5,
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(58,90,255,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>

                {/* Navegação entre slides */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPreviewIndex(i => i !== null ? Math.max(0, i - 1) : null)}
                    disabled={previewIndex === 0}
                    style={{
                      flex: 1, padding: '7px', borderRadius: '7px', cursor: previewIndex === 0 ? 'default' : 'pointer',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: previewIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff', fontFamily: 'inherit', fontSize: '13px',
                    }}
                  >
                    ‹ Anterior
                  </button>
                  <button
                    onClick={() => setPreviewIndex(i => i !== null ? Math.min(slides.length - 1, i + 1) : null)}
                    disabled={previewIndex === slides.length - 1}
                    style={{
                      flex: 1, padding: '7px', borderRadius: '7px', cursor: previewIndex === slides.length - 1 ? 'default' : 'pointer',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: previewIndex === slides.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff', fontFamily: 'inherit', fontSize: '13px',
                    }}
                  >
                    Próximo ›
                  </button>
                </div>

                {/* Imagem do slide */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                    Imagem do slide
                  </span>
                  <input ref={slideImageInputRef} type="file" accept="image/*" onChange={handleSlideImageUpload} style={{ display: 'none' }} />
                  <button
                    onClick={handleRegenerateSlideImage}
                    disabled={regeneratingSlide}
                    style={{
                      width: '100%', fontSize: '12px', padding: '7px', borderRadius: '7px',
                      cursor: regeneratingSlide ? 'default' : 'pointer', fontFamily: 'inherit',
                      background: 'rgba(58,90,255,0.15)', border: '1px solid rgba(58,90,255,0.3)',
                      color: 'var(--accent)', opacity: regeneratingSlide ? 0.6 : 1,
                    }}
                  >
                    {regeneratingSlide ? 'Gerando...' : `⚡ Regerar imagem · ${PULSE_COSTS.CAROUSEL_SLIDE} pulse`}
                  </button>
                  <button
                    onClick={() => slideImageInputRef.current?.click()}
                    style={{
                      width: '100%', fontSize: '12px', padding: '7px', borderRadius: '7px',
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    Usar minha foto
                  </button>
                  {brandPhotos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Biblioteca
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {brandPhotos.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (previewIndex === null) return
                              setSlideImages(prev => {
                                const next = [...prev]
                                next[previewIndex] = url
                                return next
                              })
                            }}
                            style={{
                              padding: 0, border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px',
                              overflow: 'hidden', cursor: 'pointer', background: 'none', aspectRatio: '1',
                            }}
                          >
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* LinkedIn */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {linkedinToken ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                        Conectado como <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{linkedinName || 'LinkedIn'}</strong>
                      </span>
                      <button
                        onClick={handlePublishLinkedIn}
                        disabled={publishingLinkedIn || !slides.length}
                        style={{
                          width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
                          cursor: publishingLinkedIn || !slides.length ? 'default' : 'pointer',
                          fontFamily: 'inherit', fontWeight: 600, border: 'none',
                          opacity: publishingLinkedIn || !slides.length ? 0.6 : 1,
                          background: linkedinStatus === 'success' ? 'rgba(34,197,94,0.8)' : linkedinStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #0077B5, #005e93)',
                          color: 'white', transition: 'all 0.2s',
                        }}
                      >
                        {publishingLinkedIn ? 'Publicando...' : linkedinStatus === 'success' ? 'Publicado!' : linkedinStatus === 'error' ? 'Erro ao publicar' : `Publicar ${slides.length} slides`}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => window.open('/api/linkedin-auth', '_blank', 'width=600,height=700')}
                      style={{
                        width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
                        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                        background: 'linear-gradient(135deg, #0077B5, #005e93)',
                        border: 'none', color: 'white',
                      }}
                    >
                      Conectar LinkedIn
                    </button>
                  )}
                </div>

                {/* Instagram */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={handlePublishInstagram}
                    disabled={publishingInstagram || !slides.length}
                    style={{
                      width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
                      cursor: publishingInstagram || !slides.length ? 'default' : 'pointer',
                      fontFamily: 'inherit', fontWeight: 600, border: 'none',
                      opacity: publishingInstagram || !slides.length ? 0.6 : 1,
                      background: instagramStatus === 'success' ? 'rgba(34,197,94,0.8)' : instagramStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                      color: 'white', transition: 'all 0.2s',
                    }}
                  >
                    {publishingInstagram ? 'Publicando...' : instagramStatus === 'success' ? 'Publicado!' : instagramStatus === 'error' ? 'Erro ao publicar' : `Publicar ${slides.length} slides no Instagram`}
                  </button>
                </div>
              </div>

              {/* Controles em tempo real */}
              <div style={{
                background: 'rgba(0,0,0,0.6)', padding: '16px', marginTop: '0',
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

              {/* Fonte Título */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Título
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range" min={0.5} max={2} step={0.05} value={titleFontScale}
                    onChange={e => setTitleFontScale(Number(e.target.value))}
                    style={{ width: '100px', accentColor: '#3A5AFF' }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', minWidth: '34px' }}>
                    {Math.round(titleFontScale * 100)}%
                  </span>
                </div>
              </div>

              {/* Fonte Texto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Texto
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range" min={0.5} max={2} step={0.05} value={bodyFontScale}
                    onChange={e => setBodyFontScale(Number(e.target.value))}
                    style={{ width: '100px', accentColor: '#3A5AFF' }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', minWidth: '34px' }}>
                    {Math.round(bodyFontScale * 100)}%
                  </span>
                </div>
              </div>

              {/* Alinhamento Título */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Alinhamento Título
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => setTitleAlign(align)}
                      style={{
                        width: '36px', height: '28px', borderRadius: '6px', cursor: 'pointer',
                        background: titleAlign === align ? 'rgba(58,90,255,0.8)' : 'rgba(255,255,255,0.08)',
                        border: titleAlign === align ? '1px solid rgba(58,90,255,0.6)' : '1px solid rgba(255,255,255,0.15)',
                        color: '#fff', fontSize: '12px', fontFamily: 'inherit',
                      }}
                    >
                      {align === 'left' ? '≡' : align === 'center' ? '≡' : '≡'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alinhamento Texto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Alinhamento Texto
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => setBodyAlign(align)}
                      style={{
                        width: '36px', height: '28px', borderRadius: '6px', cursor: 'pointer',
                        background: bodyAlign === align ? 'rgba(58,90,255,0.8)' : 'rgba(255,255,255,0.08)',
                        border: bodyAlign === align ? '1px solid rgba(58,90,255,0.6)' : '1px solid rgba(255,255,255,0.15)',
                        color: '#fff', fontSize: '12px', fontFamily: 'inherit',
                      }}
                    >
                      {align === 'left' ? 'E' : align === 'center' ? 'C' : 'D'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor do título */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Cor Título</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#FFFFFF', '#000000', '#3A5AFF', '#FFCA1D', '#FF6F5E'].map(color => (
                    <button key={color} onClick={() => setTitleColor(color)} style={{
                      width: '24px', height: '24px', borderRadius: '50%', background: color, padding: 0, cursor: 'pointer',
                      border: titleColor === color ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                      boxShadow: color === '#000000' ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
                    }} />
                  ))}
                </div>
              </div>

              {/* Cor do texto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Cor Texto</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#FFFFFF', '#000000', '#3A5AFF', '#FFCA1D', '#FF6F5E'].map(color => (
                    <button key={color} onClick={() => setBodyColor(color)} style={{
                      width: '24px', height: '24px', borderRadius: '50%', background: color, padding: 0, cursor: 'pointer',
                      border: bodyColor === color ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                      boxShadow: color === '#000000' ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
                    }} />
                  ))}
                </div>
              </div>

              {/* Fonte */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Fonte</span>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px', color: '#fff', fontSize: '11px', padding: '4px 8px',
                    fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
                  }}
                >
                  {['Inter', 'Playfair Display', 'Space Grotesk', 'Montserrat', 'Lora', 'Oswald', 'Raleway', 'Bebas Neue'].map(f => (
                    <option key={f} value={f} style={{ background: '#1a1a1a' }}>{f}</option>
                  ))}
                </select>
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
          </div>

          {/* Botão fechar */}
          <button
            onClick={() => setPreviewIndex(null)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
  const lines: string[] = []
  // Respeita quebras de linha manuais (\n)
  const paragraphs = text.split('\n')
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('')
      continue
    }
    const words = paragraph.split(' ')
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
  }
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
