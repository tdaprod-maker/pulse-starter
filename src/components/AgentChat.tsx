import { useState, useRef, useEffect } from 'react'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { agentChat, generatePostContent, generateCarouselContent, generatePremiumCaption, type AgentMessage, type CarouselSlide, type PremiumSlide } from '../services/gemini'
import { generateImage } from '../services/replicate'
import { loadBrandConfig, savePost, uploadThumbnail, updatePostThumbnail } from '../services/brandKit'
import { supabase } from '../lib/supabase'
import { debitToken, getTokenBalance, notifyBalanceUpdate, PULSE_COSTS } from '../services/tokens'

const ACCENT_ELEMENT: Record<string, string> = {
  'hero-title':     'accent-bar',
  'editorial-card': 'accent-bar',
  'food-promo':     'bg-color',
  'tech-news':      'brand-line',
  'tech-statement': 'brand-line',
  'tech-product':   'accent-strip',
}

function normalizeTemplateId(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, '-')
}

export function AgentChat({ onGenerating, onGenerated, onReset, onCarouselGenerated, onPremiumGenerated }: {
  onGenerating?: () => void
  onGenerated?: () => void
  onReset?: () => void
  onCarouselGenerated?: (slides: (CarouselSlide & { imageUrl: string })[], caption: string, templateId?: string, engine?: string) => void
  onPremiumGenerated?: (slides: PremiumSlide[], caption: { instagram: string; linkedin: string; hashtags: string } | null) => void
} = {}) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    { role: 'agent', content: 'Olá! Me conta o que você quer comunicar no post de hoje.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<{ stop(): void } | null>(null)

  function toggleMic() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const win = window as any
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }
  const [generating, setGenerating] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [pendingPremium, setPendingPremium] = useState<{ prompt: string; format?: string } | null>(null)
  const [pendingPremiumCarousel, setPendingPremiumCarousel] = useState<{ prompt: string; slideCount: number; templateId?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { theme } = useTheme()
  const {
    addTemplate, setActiveTemplate, updateElement, setTemplateBackground,
    setTemplateImagePrompt, setCaption, 
  } = useStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function applyResult(result: any, forcedTemplateId?: string) {
    const templateId = forcedTemplateId
      ? normalizeTemplateId(forcedTemplateId)
      : normalizeTemplateId(result.template)
    const def = templateRegistry.find((d) => d.id === templateId)
    if (!def) throw new Error(`Template "${result.template}" não reconhecido`)

    const allVariants = def.getVariants(theme)
    const currentActiveId = useStore.getState().activeTemplateId
    let variant = allVariants.find((v) => v.id === currentActiveId)
    if (!variant && currentActiveId) {
      const suffix = currentActiveId.split('-').pop()
      variant = allVariants.find((v) => v.id.endsWith('-' + suffix))
    }
    variant ??= allVariants[0]

    addTemplate(variant)
    setActiveTemplate(variant.id)

    const accentId = ACCENT_ELEMENT[templateId]
    const accentColor = result.accentColor

    for (const v of allVariants) {
      if (v.id !== variant.id) addTemplate(v)
      const snap = useStore.getState().templates.find((t) => t.id === v.id) ?? v
      Object.entries(result.texts).forEach(([fieldId, text]) => {
        const el = snap.elements.find((e) => e.id === fieldId)
        if (el && el.type === 'text') {
          updateElement(v.id, fieldId, { props: { ...el.props, text: String(text) } })
        }
      })
      if (accentColor && accentId) {
        const snapAfter = useStore.getState().templates.find((t) => t.id === v.id) ?? snap
        const accentEl = snapAfter.elements.find((e) => e.id === accentId)
        if (accentEl) {
          updateElement(v.id, accentId, { props: { ...accentEl.props, fill: accentColor } })
        }
      }
    }
    setActiveTemplate(variant.id)

    const { data } = await supabase.auth.getUser()
    const email = data.user?.email ?? ''
    if (email) {
      const brand = await loadBrandConfig(email)
      if (brand.logo_url) {
        const response = await fetch(brand.logo_url)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          allVariants.forEach(v => {
            useStore.getState().setTemplateLogo(v.id, base64)
            useStore.getState().setTemplateLogoStyle(v.id, 400)
          })
        }
        reader.readAsDataURL(blob)
      }
    }
  }

  async function generate(prompt: string, format?: string) {
    setGenerating(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const activeTemplateBase = format
        ? null
        : useStore.getState().activeTemplateId?.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '') ?? null

      const result = await generatePostContent(prompt, brandCtx ? {
        businessName: brandCtx.business_name || brandCtx.brand_name,
        segment: brandCtx.segment,
        tone: brandCtx.tone,
        visualStyle: brandCtx.visual_style ?? undefined,
        brandDescription: brandCtx.brand_description ?? undefined,
      } : undefined, activeTemplateBase ?? undefined)

      if (brandCtx?.color_primary && result.accentColor) {
        result.accentColor = brandCtx.color_primary
      }

      await applyResult(result, activeTemplateBase ?? undefined)

      // Se formato especificado, ativa a variante correta
      if (format) {
        const formatMap: Record<string, string> = { '1x1': '1x1', '4x5': '4x5', '9x16': '9x16', '16x9': '16x9' }
        const suffix = formatMap[format] ?? '1x1'
        const currentId = useStore.getState().activeTemplateId
        if (currentId) {
          const base = currentId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
          const def = templateRegistry.find(d => d.id === base)
          if (def) {
            const target = def.getVariants(theme).find(v => v.id.endsWith('-' + suffix))
            if (target) setActiveTemplate(target.id)
          }
        }
      }

      // Gera imagem de fundo
      if (result.imagePrompt && result.template !== 'tech-minimal') {
        try {
          const url = await generateImage(result.imagePrompt)
          const activeId = useStore.getState().activeTemplateId
          if (activeId) {
            setTemplateBackground(activeId, url)
            setTemplateImagePrompt(activeId, result.imagePrompt)
            const def = templateRegistry.find(d => activeId.startsWith(d.id))
            def?.getVariants(theme).forEach(v => {
              if (v.id !== activeId) {
                setTemplateBackground(v.id, url)
                setTemplateImagePrompt(v.id, result.imagePrompt!)
              }
            })
          }
        } catch (e) {
          console.error('Erro ao gerar imagem:', e)
        }
      }

      if (result.caption) setCaption(result.caption)

      // Salva na biblioteca
      try {
        if (userEmail) {
          const postId = await savePost(userEmail, {
            template_id: useStore.getState().activeTemplateId ?? normalizeTemplateId(result.template),
            texts: result.texts as Record<string, string>,
            accent_color: result.accentColor ?? '',
            image_prompt: result.imagePrompt ?? '',
          })
          if (postId) {
            const activeId = useStore.getState().activeTemplateId
            const activeTemplate = useStore.getState().templates.find(t => t.id === activeId)
            const bgImage = activeTemplate?.backgroundImage
            if (bgImage?.startsWith('data:')) {
              const thumbUrl = await uploadThumbnail(postId, userEmail, bgImage)
              if (thumbUrl) await updatePostThumbnail(postId, thumbUrl)
            }
          }
        }
      } catch (e) {
        console.error('Erro ao salvar:', e)
      }

      const debit = await debitToken(userEmail, PULSE_COSTS.POST)
      if (debit.success) notifyBalanceUpdate()

      onGenerated?.()
      setMessages(prev => [...prev, {
        role: 'agent',
        content: '✦ Post gerado! Clique nos elementos do canvas para editar texto, cores e fontes.'
      }])
      setCollapsed(true)
    } catch (e) {
      console.error('[generate] erro ao gerar post:', e)
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Algo deu errado ao gerar. Tente novamente.'
      }])
    } finally {
      setGenerating(false)
    }
  }

  function cropImageToRatio(imageUrl: string, ratio: string): Promise<string> {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const [rw, rh] = ratio.split('/').map(Number)
        const targetRatio = rw / rh
        const srcRatio = img.width / img.height
        let sx = 0, sy = 0, sw = img.width, sh = img.height
        if (srcRatio > targetRatio) {
          sw = Math.round(img.height * targetRatio)
          sx = Math.round((img.width - sw) / 2)
        } else {
          sh = Math.round(img.width / targetRatio)
          sy = Math.round((img.height - sh) / 2)
        }
        const canvas = document.createElement('canvas')
        canvas.width = rw * 512
        canvas.height = rh * 512
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = imageUrl
    })
  }

  function overlayLogoOnImage(imageBase64: string, logoUrl: string): Promise<string> {
    return new Promise(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const logo = new Image()
        logo.crossOrigin = 'anonymous'
        logo.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          const margin = img.width * 0.04
          const maxLogoW = img.width * 0.20
          const ratio = logo.naturalWidth / logo.naturalHeight
          const logoW = Math.min(maxLogoW, logo.naturalWidth)
          const logoH = logoW / ratio
          ctx.drawImage(logo, img.width - logoW - margin, img.height - logoH - margin, logoW, logoH)
          resolve(canvas.toDataURL('image/png'))
        }
        logo.onerror = () => resolve(imageBase64)
        logo.src = logoUrl
      }
      img.onerror = () => resolve(imageBase64)
      img.src = imageBase64
    })
  }

  async function generatePremium(prompt: string, format?: string) {
    console.log('[generatePremium] iniciando, prompt:', prompt.slice(0, 60))
    console.log('[generatePremium] onPremiumGenerated disponível?', typeof onPremiumGenerated)

    const FORMAT_MAP: Record<string, { size: string; ratio: string; label: string; orientation: string }> = {
      '9x16': { size: '1024x1536', ratio: '9/16', label: '9:16', orientation: 'vertical (9:16, Stories/Reels)' },
      '4x5':  { size: '1024x1536', ratio: '4/5',  label: '4:5',  orientation: 'portrait (4:5, Feed)' },
      '1x1':  { size: '1024x1024', ratio: '1/1',  label: '1:1',  orientation: 'square (1:1, Feed)' },
      '16x9': { size: '1536x1024', ratio: '16/9', label: '16:9', orientation: 'horizontal (16:9)' },
    }
    const fmt = FORMAT_MAP[format ?? ''] ?? FORMAT_MAP['9x16']
    setGenerating(true)
    setMessages(prev => [...prev, {
      role: 'agent',
      content: '⏳ Aviso: a geração premium pode levar até 20 segundos. Gerando com GPT Image 2...',
    }])
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const balance = await getTokenBalance(userEmail)
      if (balance < PULSE_COSTS.PREMIUM_POST) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Saldo insuficiente. Você tem ${balance} pulses e precisa de ${PULSE_COSTS.PREMIUM_POST} para geração premium.`,
        }])
        return
      }

      const styleContext = [
        brandCtx?.segment ? `Segment: ${brandCtx.segment}` : '',
        brandCtx?.tone ? `Tone: ${brandCtx.tone}` : '',
        brandCtx?.visual_style ? `Visual style: ${brandCtx.visual_style}` : '',
        brandCtx?.brand_description ? `Brand: ${brandCtx.brand_description}` : '',
        brandCtx?.color_primary ? `Primary color: ${brandCtx.color_primary}` : '',
      ].filter(Boolean).join('. ')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 55000)

      let rawImage: string
      try {
        const premRes = await fetch('/api/generate-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, slideIndex: 1, totalSlides: 1, styleContext, size: fmt.size }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        if (!premRes.ok) {
          const err = await premRes.json().catch(() => ({})) as { error?: string }
          throw new Error(err.error ?? `Erro ${premRes.status} ao gerar imagem premium`)
        }
        const data = await premRes.json() as { image?: string }
        if (!data.image) throw new Error('Nenhuma imagem retornada pela API')
        rawImage = data.image
      } catch (e: any) {
        clearTimeout(timeoutId)
        if (e.name === 'AbortError') {
          throw new Error('Tempo limite atingido (55s). GPT Image 2 pode demorar mais do que o plano atual permite — tente novamente ou acesse Posts Premium.')
        }
        throw e
      }

      // Crop para o formato especificado pelo agente
      const croppedImage = await cropImageToRatio(rawImage, fmt.ratio)

      let slides: PremiumSlide[] = [
        { image: croppedImage, label: fmt.label },
      ]

      // Aplica logo do brand kit
      if (brandCtx?.logo_url) {
        try {
          slides = await Promise.all(
            slides.map(async s => ({ ...s, image: await overlayLogoOnImage(s.image, brandCtx.logo_url!) }))
          )
        } catch (e) {
          console.error('Erro ao aplicar logo:', e)
        }
      }

      // Debita pulses
      const debit = await debitToken(userEmail, PULSE_COSTS.PREMIUM_POST)
      if (debit.success) notifyBalanceUpdate()

      // Gera legenda
      let generatedCaption: { instagram: string; linkedin: string; hashtags: string } | null = null
      try {
        generatedCaption = await generatePremiumCaption(prompt, brandCtx ? {
          businessName: brandCtx.business_name || brandCtx.brand_name,
          segment: brandCtx.segment,
          tone: brandCtx.tone,
          brandDescription: brandCtx.brand_description ?? undefined,
        } : undefined)
      } catch (e) {
        console.error('Erro ao gerar legenda:', e)
      }

      // Salva na biblioteca
      try {
        if (userEmail) {
          const postId = await savePost(userEmail, {
            template_id: 'premium-single',
            texts: {},
            accent_color: '',
            image_prompt: JSON.stringify({ prompt, caption: generatedCaption }),
          })
          if (postId && slides[0]) {
            const thumbUrl = await uploadThumbnail(postId, userEmail, slides[0].image)
            if (thumbUrl) await updatePostThumbnail(postId, thumbUrl)
          }
        }
      } catch (e) {
        console.error('Erro ao salvar:', e)
      }

      console.log('[generatePremium] chamando onPremiumGenerated com', slides.length, 'slides')
      onPremiumGenerated?.(slides, generatedCaption)
      onGenerated?.()
      setMessages(prev => [...prev, {
        role: 'agent',
        content: '✦ Post premium gerado! Faça o download ou publique diretamente.',
      }])
      setCollapsed(true)
    } catch (e: any) {
      console.error('[generatePremium] erro:', e)
      setMessages(prev => [...prev, {
        role: 'agent',
        content: e.message || 'Erro ao gerar imagem premium. Tente novamente.',
      }])
    } finally {
      setGenerating(false)
    }
  }

  async function generateCarousel(prompt: string, slideCount: number, templateId?: string) {
    setGenerating(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const brandContext = brandCtx ? {
        businessName: brandCtx.business_name || brandCtx.brand_name,
        segment: brandCtx.segment,
        tone: brandCtx.tone,
        visualStyle: brandCtx.visual_style ?? undefined,
        brandDescription: brandCtx.brand_description ?? undefined,
      } : undefined

      setMessages(prev => [...prev, { role: 'agent', content: `Gerando ${slideCount} slides...` }])

      // Determina templateId — usa o selecionado pelo usuário ou o retornado pelo agente
      const currentActiveId = useStore.getState().activeTemplateId
      const lockedBase = currentActiveId
        ? currentActiveId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
        : undefined
      const resolvedTemplateId = lockedBase ?? templateId ?? 'editorial-card'

      const carouselData = await generateCarouselContent(prompt, slideCount, brandContext, resolvedTemplateId)

      // Gera imagens em paralelo via FAL.ai
      const slidesWithImages: (CarouselSlide & { imageUrl: string })[] = []
      setMessages(prev => {
        const msgs = [...prev]
        msgs[msgs.length - 1] = { role: 'agent', content: `Gerando imagens dos ${carouselData.slides.length} slides...` }
        return msgs
      })

      const imageResults = await Promise.allSettled(
        carouselData.slides.map(slide => generateImage(slide.imagePrompt))
      )

      for (let i = 0; i < carouselData.slides.length; i++) {
        const slide = carouselData.slides[i]
        const imgResult = imageResults[i]
        const imageUrl = imgResult.status === 'fulfilled' ? imgResult.value : ''
        slidesWithImages.push({ ...slide, imageUrl })
      }

      const debit = await debitToken(userEmail, PULSE_COSTS.CAROUSEL_SLIDE * slideCount)
      if (debit.success) notifyBalanceUpdate()

      onCarouselGenerated?.(slidesWithImages, carouselData.caption, resolvedTemplateId)
      onGenerated?.()
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `✦ Carrossel com ${slideCount} slides gerado! Use as setas para navegar entre os slides.`
      }])
      setCollapsed(true)
    } catch (e) {
      console.error('[generateCarousel] erro:', e)
      setMessages(prev => [...prev, { role: 'agent', content: 'Erro ao gerar o carrossel. Tente novamente.' }])
    } finally {
      setGenerating(false)
    }
  }

  async function generatePremiumCarousel(prompt: string, slideCount: number, templateId?: string) {
    const cappedCount = Math.min(slideCount, 5)
    setGenerating(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const totalCost = PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE * cappedCount
      const balance = await getTokenBalance(userEmail)
      if (balance < totalCost) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Saldo insuficiente. Você tem ${balance} pulses e precisa de ${totalCost} para este carrossel premium.`,
        }])
        return
      }

      const brandContext = brandCtx ? {
        businessName: brandCtx.business_name || brandCtx.brand_name,
        segment: brandCtx.segment,
        tone: brandCtx.tone,
        visualStyle: brandCtx.visual_style ?? undefined,
        brandDescription: brandCtx.brand_description ?? undefined,
      } : undefined

      const currentActiveId = useStore.getState().activeTemplateId
      const lockedBase = currentActiveId
        ? currentActiveId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
        : undefined
      const resolvedTemplateId = lockedBase ?? templateId ?? undefined

      setMessages(prev => [...prev, { role: 'agent', content: `Planejando ${cappedCount} slides...` }])

      const carouselData = await generateCarouselContent(prompt, cappedCount, brandContext, resolvedTemplateId)

      const styleContext = [
        brandCtx?.segment ? `Segment: ${brandCtx.segment}` : '',
        brandCtx?.tone ? `Tone: ${brandCtx.tone}` : '',
        brandCtx?.visual_style ? `Visual style: ${brandCtx.visual_style}` : '',
        brandCtx?.brand_description ? `Brand: ${brandCtx.brand_description}` : '',
        brandCtx?.color_primary ? `Primary color: ${brandCtx.color_primary}` : '',
      ].filter(Boolean).join('. ')

      const slidesWithImages: (CarouselSlide & { imageUrl: string })[] = []

      for (let i = 0; i < carouselData.slides.length; i++) {
        const slide = carouselData.slides[i]
        setMessages(prev => {
          const msgs = [...prev]
          msgs[msgs.length - 1] = {
            role: 'agent',
            content: `Gerando slide ${i + 1} de ${carouselData.slides.length} com GPT Image 2...`,
          }
          return msgs
        })

        const slidePrompt = [
          slide.imagePrompt,
          `Slide ${i + 1} de ${carouselData.slides.length}: ${slide.title}`,
          slide.body ? slide.body.slice(0, 120) : '',
        ].filter(Boolean).join('. ')

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 55000)

        try {
          const premRes = await fetch('/api/generate-premium', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: slidePrompt,
              slideIndex: i + 1,
              totalSlides: carouselData.slides.length,
              styleContext,
              size: '1024x1280',
            }),
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          if (!premRes.ok) {
            const err = await premRes.json().catch(() => ({})) as { error?: string }
            console.error(`[generatePremiumCarousel] slide ${i + 1} erro:`, err)
            slidesWithImages.push({ ...slide, imageUrl: '' })
            continue
          }

          const data = await premRes.json() as { image?: string }
          slidesWithImages.push({ ...slide, imageUrl: data.image ?? '' })
        } catch (e: any) {
          clearTimeout(timeoutId)
          if (e.name === 'AbortError') {
            console.error(`[generatePremiumCarousel] slide ${i + 1} timeout (55s)`)
          } else {
            console.error(`[generatePremiumCarousel] slide ${i + 1} erro:`, e)
          }
          slidesWithImages.push({ ...slide, imageUrl: '' })
        }
      }

      // Aplica logo do brand kit em cada slide
      if (brandCtx?.logo_url) {
        try {
          const withLogo = await Promise.all(
            slidesWithImages.map(async s => {
              if (!s.imageUrl) return s
              return { ...s, image: await overlayLogoOnImage(s.imageUrl, brandCtx.logo_url!) }
            })
          )
          for (let i = 0; i < withLogo.length; i++) {
            if ((withLogo[i] as any).image) {
              slidesWithImages[i] = { ...slidesWithImages[i], imageUrl: (withLogo[i] as any).image }
            }
          }
        } catch (e) {
          console.error('Erro ao aplicar logo:', e)
        }
      }

      const debit = await debitToken(userEmail, PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE * cappedCount)
      if (debit.success) notifyBalanceUpdate()

      // Gera legenda
      let generatedCaption = carouselData.caption
      try {
        const cap = await generatePremiumCaption(prompt, brandContext ? {
          businessName: brandContext.businessName,
          segment: brandContext.segment,
          tone: brandContext.tone,
          brandDescription: brandContext.brandDescription,
        } : undefined)
        if (cap?.instagram) generatedCaption = cap.instagram
      } catch (e) {
        console.error('Erro ao gerar legenda premium:', e)
      }

      onCarouselGenerated?.(slidesWithImages, generatedCaption, undefined, 'premium')
      onGenerated?.()
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `✦ Carrossel premium com ${cappedCount} slides gerado! Cada imagem foi criada com GPT Image 2.`,
      }])
      setCollapsed(true)
    } catch (e: any) {
      console.error('[generatePremiumCarousel] erro:', e)
      setMessages(prev => [...prev, {
        role: 'agent',
        content: e.message || 'Erro ao gerar o carrossel premium. Tente novamente.',
      }])
    } finally {
      setGenerating(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || loading || generating) return
    const userMsg: AgentMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const currentActiveId = useStore.getState().activeTemplateId
      const lockedBase = currentActiveId
        ? currentActiveId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
        : undefined

      const response = await agentChat(
        newMessages.filter(m => m.role !== 'agent' || newMessages.indexOf(m) > 0),
        brandCtx ? {
          businessName: brandCtx.business_name || brandCtx.brand_name,
          segment: brandCtx.segment,
          tone: brandCtx.tone,
          brandDescription: brandCtx.brand_description ?? undefined,
          visualStyle: brandCtx.visual_style ?? undefined,
        } : undefined,
        lockedBase ?? undefined
      )

      console.log('[handleSend] agentChat response:', JSON.stringify(response))

      if (response.ready && response.prompt) {
        if (response.mode === 'carousel' && response.engine === 'premium') {
          const slideCount = Math.min(response.slideCount ?? 5, 5)
          setPendingPremiumCarousel({ prompt: response.prompt, slideCount, templateId: response.templateId })
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `Esse carrossel usa GPT Image 2 — cada slide é uma imagem fotorrealista. Custa ${PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE * slideCount} pulses (4 × ${slideCount} slides) e pode levar até ${slideCount * 30}s. Confirmar?`,
          }])
        } else if (response.mode === 'carousel') {
          onGenerating?.()
          await generateCarousel(response.prompt, response.slideCount ?? 5, response.templateId)
        } else if (response.engine === 'premium') {
          console.log('[handleSend] engine=premium → mostrando confirmação')
          setPendingPremium({ prompt: response.prompt, format: response.format })
          setMessages(prev => [...prev, {
            role: 'agent',
            content: 'Esse post usa GPT Image 2 — imagem fotorrealista de alta qualidade. Custa 8 pulses (padrão custa 4). Confirmar?',
          }])
        } else {
          console.log('[handleSend] engine=standard (ou ausente):', response.engine, '→ generate() FAL.ai')
          onGenerating?.()
          setMessages(prev => [...prev, { role: 'agent', content: 'Perfeito! Gerando seu post...' }])
          await generate(response.prompt, response.format)
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: response.message || 'Pode me contar mais?'
        }])
      }
    } catch (e) {
      console.error('[handleSend] erro:', e)
      setMessages(prev => [...prev, { role: 'agent', content: 'Erro ao processar. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleReset() {
    setMessages([{ role: 'agent', content: 'Olá! Me conta o que você quer comunicar no post de hoje.' }])
    setInput('')
    setCollapsed(false)
    setPendingPremium(null)
    setPendingPremiumCarousel(null)
    onReset?.()
  }

  const isDisabled = loading || generating

  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        style={{
          width: '100%', maxWidth: '680px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            Agente de Design Pulse
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· clique para continuar</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleReset() }}
            style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '3px 10px', borderRadius: '6px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5A4.5 4.5 0 0 1 9.5 3M1 1v4h4M10 5.5A4.5 4.5 0 0 1 1.5 8M10 10V6H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Nova conversa
          </button>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(58,90,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            Agente de Design Pulse
          </span>
        </div>
<button onClick={handleReset}
          style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '3px 10px', borderRadius: '6px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Nova conversa">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5A4.5 4.5 0 0 1 9.5 3M1 1v4h4M10 5.5A4.5 4.5 0 0 1 1.5 8M10 10V6H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Nova conversa
        </button>
      </div>

      {/* Mensagens */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '14px',
        padding: '18px 16px', maxHeight: '220px', overflowY: 'auto',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-surface)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: 1.55,
              border: msg.role === 'agent' ? '1px solid var(--border)' : 'none',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {pendingPremiumCarousel && !loading && !generating && (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={() => {
                const pending = pendingPremiumCarousel
                setPendingPremiumCarousel(null)
                onGenerating?.()
                generatePremiumCarousel(pending.prompt, pending.slideCount, pending.templateId)
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white',
                fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Confirmar premium · {PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE * (pendingPremiumCarousel.slideCount)} pulses
            </button>
            <button
              onClick={() => {
                const pending = pendingPremiumCarousel
                setPendingPremiumCarousel(null)
                onGenerating?.()
                generateCarousel(pending.prompt, pending.slideCount, pending.templateId)
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Usar padrão · {PULSE_COSTS.CAROUSEL_SLIDE * (pendingPremiumCarousel.slideCount)} pulses
            </button>
          </div>
        )}
        {pendingPremium && !loading && !generating && (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={() => {
                const pending = pendingPremium
                setPendingPremium(null)
                onGenerating?.()
                generatePremium(pending.prompt, pending.format)
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white',
                fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Confirmar premium · 8 pulses
            </button>
            <button
              onClick={() => {
                const pending = pendingPremium
                setPendingPremium(null)
                onGenerating?.()
                setMessages(prev => [...prev, { role: 'agent', content: 'Gerando com FAL.ai...' }])
                generate(pending.prompt, pending.format)
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Usar padrão · 4 pulses
            </button>
          </div>
        )}
        {(loading || generating) && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px', borderRadius: '12px 12px 12px 2px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              fontSize: '14px', color: 'var(--text-muted)',
            }}>
              {generating ? '✦ Gerando...' : '...'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-base)',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
          }}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={generating ? 'Gerando seu post...' : 'Digite sua mensagem...'}
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontSize: '14px',
            fontFamily: 'inherit', resize: 'none', outline: 'none',
            lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto',
            opacity: isDisabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={toggleMic}
          disabled={isDisabled}
          title={isListening ? 'Parar gravação' : 'Falar mensagem'}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', border: 'none',
            background: isListening ? 'rgba(58,90,255,0.2)' : 'transparent',
            color: isListening ? 'var(--accent)' : 'var(--text-muted)',
            cursor: isDisabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
            outline: isListening ? '1px solid var(--accent)' : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="1" width="6" height="8" rx="3" fill="currentColor"/>
            <path d="M2.5 8a5.5 5.5 0 0 0 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="13.5" x2="8" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={handleSend}
          disabled={isDisabled || !input.trim()}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', border: 'none',
            background: isDisabled || !input.trim() ? 'var(--bg-surface)' : 'var(--accent)',
            color: isDisabled || !input.trim() ? 'var(--text-muted)' : 'white',
            cursor: isDisabled || !input.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l3 6-3 6 12-6z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
