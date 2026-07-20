import { useState, useRef, useEffect } from 'react'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { agentChat, generatePostContent, generateCarouselContent, generatePremiumCaption, type AgentMessage, type AgentResponse, type CarouselSlide, type PremiumSlide, type EditContext, type EditAction } from '../services/gemini'
import { generateImage } from '../services/replicate'
import { loadBrandConfig, savePost, uploadThumbnail, updatePostThumbnail } from '../services/brandKit'
import { overlayLogoOnImage } from '../services/logoOverlay'
import { supabase } from '../lib/supabase'
import { debitToken, getTokenBalance, notifyBalanceUpdate, PULSE_COSTS } from '../services/tokens'

export interface ActivePost {
  templateBase: string
  format: string
  textElements: { id: string; currentValue: string; currentFill: string }[]
  accentElements: { id: string; currentColor: string }[]
  overlayElements: { id: string; currentOpacity: number; currentFill: string }[]
  imagePrompt?: string
}

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

export function AgentChat({ onGenerating, onGenerated, onReset, onCarouselGenerated, onPremiumGenerated, onActivateEditMode, activePost, isPremiumActive, premiumSlides, onPremiumSlidesUpdate, forceCollapsed, onCollapsedChange }: {
  onGenerating?: (engine?: 'standard' | 'premium') => void
  onGenerated?: () => void
  onReset?: () => void
  onCarouselGenerated?: (slides: (CarouselSlide & { imageUrl: string })[], caption: string, templateId?: string, engine?: string) => void
  onPremiumGenerated?: (slides: PremiumSlide[], caption: { instagram: string; linkedin: string; hashtags: string } | null) => void
  onActivateEditMode?: () => void
  activePost?: ActivePost
  isPremiumActive?: boolean
  premiumSlides?: PremiumSlide[]
  onPremiumSlidesUpdate?: (slides: PremiumSlide[]) => void
  forceCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
} = {}) {
  const friendlyTemplateName = activePost
    ? activePost.templateBase.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : ''

  const [messages, setMessages] = useState<AgentMessage[]>(() => [
    activePost
      ? { role: 'agent', content: `Post carregado (${friendlyTemplateName}, ${activePost.format}). Que ajuste você quer fazer? Posso mudar textos, cores, formato ou regenerar a imagem de fundo (4 pulses).` }
      : { role: 'agent', content: 'Olá! Me conta o que você quer comunicar no post de hoje.' }
  ])
  const [pendingRegenImage, setPendingRegenImage] = useState<{ prompt: string } | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<{ stop(): void } | null>(null)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [pendingPhotoAsk, setPendingPhotoAsk] = useState<{ prompt: string; format?: string } | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result !== 'string') return
      setUploadedPhoto(result)
      if (pendingPhotoAsk) {
        const p = pendingPhotoAsk
        setPendingPhotoAsk(null)
        setPendingEngineChoice({ prompt: p.prompt, format: p.format })
        setMessages(prev => [...prev, {
          role: 'agent',
          content: '📷 Foto recebida! Vou usar ela como base do post. Qual qualidade de imagem você prefere?',
        }])
      } else if (activePost || hasGeneratedPost) {
        // Já existe um post ativo (modo edição) — aplica a foto direto como novo fundo,
        // sem depender do fluxo de regenerate_image do agente.
        const activeId = useStore.getState().activeTemplateId
        if (activeId) {
          const currentTemplate = useStore.getState().templates.find(t => t.id === activeId)
          const promptFallback = currentTemplate?.imagePrompt
          setTemplateBackground(activeId, result)
          if (promptFallback) setTemplateImagePrompt(activeId, promptFallback)
          const base = activeId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
          const def = templateRegistry.find(d => d.id === base)
          def?.getVariants(theme).forEach(v => {
            if (v.id !== activeId) {
              setTemplateBackground(v.id, result)
              if (promptFallback) setTemplateImagePrompt(v.id, promptFallback)
            }
          })
        }
        setPendingRegenImage(null)
        setUploadedPhoto(null)
        setMessages(prev => [...prev, {
          role: 'agent',
          content: '📷 Foto aplicada como novo fundo do post!',
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: '📷 Foto anexada — vou usar ela como base quando você pedir para gerar o post.',
        }])
      }
    }
    reader.readAsDataURL(file)
  }

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
  const [pendingPremiumCarousel, setPendingPremiumCarousel] = useState<{ prompt: string; slideCount: number; templateId?: string; slides?: { title: string; body?: string }[] } | null>(null)
  const [pendingAmbiguous, setPendingAmbiguous] = useState<AgentResponse | null>(null)
  const [pendingEngineChoice, setPendingEngineChoice] = useState<{ prompt: string; format?: string } | null>(null)
  const [hasGeneratedPost, setHasGeneratedPost] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastUsedTemplateRef = useRef<string | null>(null)
  const originalPremiumSlidesRef = useRef<PremiumSlide[] | null>(null)
  const { theme } = useTheme()
  const {
    addTemplate, setActiveTemplate, updateElement, setTemplateBackground,
    setTemplateImagePrompt, setCaption, setTemplateSolidBackground,
    setTemplateLogo, setTemplateLogoPosition, setTemplateLogoStyle,
  } = useStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (forceCollapsed) setCollapsed(true)
  }, [forceCollapsed])

  async function applyEditActions(actions: EditAction[]) {
    const activeId = useStore.getState().activeTemplateId
    if (!activeId) return

    const base = activeId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
    const def = templateRegistry.find(d => d.id === base)
    const allVariants = def ? def.getVariants(theme) : []

    for (const action of actions) {
      switch (action.type) {
        case 'recolor': {
          if (!action.elementId || !action.color) break
          allVariants.forEach(v => {
            const snap = useStore.getState().templates.find(t => t.id === v.id) ?? v
            const el = snap.elements.find(e => e.id === action.elementId)
            if (el) updateElement(v.id, action.elementId!, { props: { ...el.props, fill: action.color } })
          })
          break
        }
        case 'rewrite': {
          if (!action.fieldId || action.text === undefined) break
          allVariants.forEach(v => {
            const snap = useStore.getState().templates.find(t => t.id === v.id) ?? v
            const el = snap.elements.find(e => e.id === action.fieldId)
            if (el && el.type === 'text') updateElement(v.id, action.fieldId!, { props: { ...el.props, text: action.text } })
          })
          break
        }
        case 'resize': {
          if (!action.format) break
          const formats = ['1x1', '4x5', '9x16', '16x9']
          const fmt = formats.find(f => action.format === f)
          if (!fmt) break
          // Em edit mode todas as variantes já estão no store com edits aplicados —
          // basta ativar a variante do formato solicitado diretamente.
          const target = allVariants.find(v => v.id.endsWith('-' + fmt))
          if (!target) break
          setActiveTemplate(target.id)
          break
        }
        case 'recolor_background': {
          if (!action.color) break
          const currentId = useStore.getState().activeTemplateId
          if (currentId) setTemplateSolidBackground(currentId, action.color)
          break
        }
        case 'overlay_opacity': {
          if (!action.elementId || action.opacity === undefined) break
          allVariants.forEach(v => {
            const snap = useStore.getState().templates.find(t => t.id === v.id) ?? v
            const el = snap.elements.find(e => e.id === action.elementId)
            if (el) updateElement(v.id, action.elementId!, { props: { ...el.props, opacity: action.opacity } })
          })
          break
        }
        case 'overlay_color': {
          if (!action.elementId || !action.color) break
          allVariants.forEach(v => {
            const snap = useStore.getState().templates.find(t => t.id === v.id) ?? v
            const el = snap.elements.find(e => e.id === action.elementId)
            if (el) updateElement(v.id, action.elementId!, { props: { ...el.props, fill: action.color } })
          })
          break
        }
        case 'add_logo': {
          console.log('[applyEditActions] add_logo chamado | logoUrl:', action.logoUrl, '| corner:', action.corner)
          if (!action.logoUrl) { console.warn('[applyEditActions] add_logo: logoUrl ausente — abortando'); break }
          try {
            const resp = await fetch(action.logoUrl)
            const blob = await resp.blob()
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(blob)
            })
            const logoAspect = await new Promise<number>((resolve) => {
              const img = new Image()
              img.onload = () => resolve(img.height / img.width)
              img.onerror = () => resolve(1)
              img.src = base64
            })
            const corner = action.corner ?? 'bottom-right'
            const logoSize = 160
            const margin = 16
            allVariants.forEach(v => {
              const tmpl = useStore.getState().templates.find(t => t.id === v.id) ?? v
              const logoH = logoSize * logoAspect
              let x: number, y: number
              switch (corner) {
                case 'bottom-left': x = margin; y = tmpl.height - logoH - margin; break
                case 'top-right':   x = tmpl.width - logoSize - margin; y = margin; break
                case 'top-left':    x = margin; y = margin; break
                default:            x = tmpl.width - logoSize - margin; y = tmpl.height - logoH - margin
              }
              setTemplateLogo(v.id, base64)
              setTemplateLogoPosition(v.id, x, y)
            })
          } catch (e) {
            console.error('[add_logo] erro ao carregar logo:', e)
          }
          break
        }
        case 'remove_logo': {
          console.log('[applyEditActions] remove_logo chamado | variantes:', allVariants.map(v => v.id))
          allVariants.forEach(v => {
            setTemplateLogo(v.id, null)
          })
          break
        }
        case 'resize_logo': {
          console.log('[applyEditActions] resize_logo chamado | logoSize:', action.logoSize)
          if (!action.logoSize) break
          const newSize = Math.max(40, Math.min(600, action.logoSize))
          const margin = 16
          // Lê prevSize e logoImage do template ATIVO (garantidamente no store).
          // Usar cada variante isolada causava prevSize=160 (fallback da definição)
          // quando a variante ainda não estava no store, corrompendo o cálculo de Y.
          const activeTmpl = useStore.getState().templates.find(t => t.id === activeId)
          if (!activeTmpl?.logoImage) {
            console.warn('[resize_logo] logoImage ausente no template ativo — abortando')
            break
          }
          const prevSize = activeTmpl.logoSize ?? 160
          const logoAspect = await new Promise<number>((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img.height / img.width)
            img.onerror = () => resolve(1)
            img.src = activeTmpl.logoImage!
          })
          const newLogoH = newSize * logoAspect
          const prevLogoH = prevSize * logoAspect
          console.log('[resize_logo] prevSize:', prevSize, '| newSize:', newSize, '| aspect:', logoAspect.toFixed(3))
          for (const v of allVariants) {
            const tmpl = useStore.getState().templates.find(t => t.id === v.id) ?? v
            const currentX = tmpl.logoX ?? (tmpl.width  - prevSize  - margin)
            const currentY = tmpl.logoY ?? (tmpl.height - prevLogoH - margin)
            // Re-ancora ao canto mais próximo para que o logo não salte ao redimensionar
            const nearRight  = currentX >= tmpl.width  - prevSize  - margin * 3
            const nearBottom = currentY >= tmpl.height - prevLogoH - margin * 3
            const nearLeft   = currentX <= margin * 3
            const nearTop    = currentY <= margin * 3
            let newX: number, newY: number
            if (nearRight && nearBottom) {
              newX = Math.max(0, tmpl.width  - newSize  - margin)
              newY = Math.max(0, tmpl.height - newLogoH - margin)
            } else if (nearRight && nearTop) {
              newX = Math.max(0, tmpl.width - newSize - margin)
              newY = margin
            } else if (nearLeft && nearBottom) {
              newX = margin
              newY = Math.max(0, tmpl.height - newLogoH - margin)
            } else if (nearLeft && nearTop) {
              newX = margin
              newY = margin
            } else {
              newX = Math.max(0, Math.min(Math.max(0, tmpl.width  - newSize  - margin), currentX))
              newY = Math.max(0, Math.min(Math.max(0, tmpl.height - newLogoH - margin), currentY))
            }
            // Clamp final — garante que o logo nunca ultrapassa os limites do canvas
            newX = Math.max(0, Math.min(Math.max(0, tmpl.width  - newSize  - margin), newX))
            newY = Math.max(0, Math.min(Math.max(0, tmpl.height - newLogoH - margin), newY))
            console.log('[resize_logo]', v.id, '| newX:', newX, '| newY:', newY, '| tmpl.h:', tmpl.height)
            setTemplateLogoStyle(v.id, newSize)
            setTemplateLogoPosition(v.id, newX, newY)
          }
          break
        }
        case 'move_logo': {
          if (!action.position) break
          const margin = 60
          const activeTmpl = useStore.getState().templates.find(t => t.id === activeId)
          if (!activeTmpl?.logoImage) break
          const logoSize = activeTmpl.logoSize ?? 160
          const logoAspect = await new Promise<number>((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img.height / img.width)
            img.onerror = () => resolve(1)
            img.src = activeTmpl.logoImage!
          })
          const pos = action.position.toLowerCase()
          for (const v of allVariants) {
            const tmpl = useStore.getState().templates.find(t => t.id === v.id) ?? v
            const logoH = logoSize * logoAspect
            const centerX = (tmpl.width  - logoSize) / 2
            const centerY = (tmpl.height - logoH)   / 2
            const rightX  = tmpl.width  - logoSize  - margin
            const bottomY = tmpl.height - logoH     - margin
            let newX: number, newY: number
            if (pos.includes('bottom') && pos.includes('center')) { newX = centerX; newY = bottomY }
            else if (pos.includes('top') && pos.includes('center')) { newX = centerX; newY = margin }
            else if (pos.includes('center') && pos.includes('right')) { newX = rightX; newY = centerY }
            else if (pos.includes('center') && pos.includes('left')) { newX = margin; newY = centerY }
            else if (pos.includes('bottom') && pos.includes('right')) { newX = rightX; newY = bottomY }
            else if (pos.includes('bottom') && pos.includes('left')) { newX = margin; newY = bottomY }
            else if (pos.includes('top') && pos.includes('right')) { newX = rightX; newY = margin }
            else if (pos.includes('top') && pos.includes('left')) { newX = margin; newY = margin }
            else { newX = centerX; newY = centerY }
            setTemplateLogoPosition(v.id, Math.max(0, newX), Math.max(0, newY))
          }
          break
        }
      }
    }
  }

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
    console.log('[generate] uploadedPhoto no momento da chamada:', uploadedPhoto ? `presente (${uploadedPhoto.length} chars)` : '(nenhuma)')
    setGenerating(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const activeId = useStore.getState().activeTemplateId
      const activeBase = activeId?.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '') ?? null
      const activeTemplateBase = (!format && activeBase && activeBase !== lastUsedTemplateRef.current)
        ? activeBase
        : null

      console.log('[generate] lastUsedTemplate enviado:', lastUsedTemplateRef.current ?? '(nenhum)')
      const result = await generatePostContent(prompt, brandCtx ? {
        businessName: brandCtx.business_name || brandCtx.brand_name,
        segment: brandCtx.segment,
        tone: brandCtx.tone,
        visualStyle: brandCtx.visual_style ?? undefined,
        brandDescription: brandCtx.brand_description ?? undefined,
      } : undefined, activeTemplateBase ?? undefined, lastUsedTemplateRef.current ?? undefined)

      console.log('[generate] template escolhido pelo modelo:', result.template)
      lastUsedTemplateRef.current = normalizeTemplateId(result.template)

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

      // Gera imagem de fundo (ou usa a foto enviada pelo usuário como base)
      if (result.imagePrompt && result.template !== 'tech-minimal') {
        try {
          const url = uploadedPhoto ?? await generateImage(result.imagePrompt, undefined, brandCtx?.segment)
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
          if (uploadedPhoto) setUploadedPhoto(null)
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
      setHasGeneratedPost(true)
      setMessages(prev => [...prev, {
        role: 'agent',
        content: '✦ Post gerado! Pode me pedir alterações aqui mesmo — mude textos, cores, formato ou a imagem de fundo.'
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

  async function generatePremium(prompt: string, format?: string) {
    console.log('[generatePremium] iniciando, prompt:', prompt.slice(0, 60))
    console.log('[generatePremium] onPremiumGenerated disponível?', typeof onPremiumGenerated)
    console.log('[generatePremium] uploadedPhoto no momento da chamada:', uploadedPhoto ? `presente (${uploadedPhoto.length} chars)` : '(nenhuma)')

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
      content: 'Gerando com GPT Image 2 — pode levar até 60s...',
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
        console.log('[generatePremium] enviando visualReferences?', !!uploadedPhoto)
        const premRes = await fetch('/api/generate-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt, slideIndex: 1, totalSlides: 1, styleContext, segment: brandCtx?.segment, size: fmt.size,
            ...(uploadedPhoto ? { visualReferences: [uploadedPhoto] } : {}),
          }),
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
      setHasGeneratedPost(true)
      if (uploadedPhoto) setUploadedPhoto(null)
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

  async function generatePremiumCarousel(prompt: string, slideCount: number, templateId?: string, presetSlides?: { title: string; body?: string }[]) {
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

        let imageUrl = ''
        for (let attempt = 0; attempt < 2; attempt++) {
          if (attempt === 1) {
            setMessages(prev => {
              const msgs = [...prev]
              msgs[msgs.length - 1] = { role: 'agent', content: `Slide ${i + 1} demorou — tentando novamente...` }
              return msgs
            })
          }
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 55000)
          try {
            const premRes = await fetch('/api/generate-premium', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: slide.imagePrompt,
                slideIndex: i + 1,
                totalSlides: carouselData.slides.length,
                styleContext,
                size: '1024x1536',
                slideTitle: presetSlides?.[i]?.title ?? slide.title,
                slideBody: presetSlides?.[i]?.body ?? slide.body ?? '',
              }),
              signal: controller.signal,
            })
            clearTimeout(timeoutId)
            if (premRes.ok) {
              const data = await premRes.json() as { image?: string }
              imageUrl = data.image ?? ''
            } else {
              const err = await premRes.json().catch(() => ({})) as { error?: string }
              console.error(`[generatePremiumCarousel] slide ${i + 1} erro HTTP:`, err)
            }
            break
          } catch (e: any) {
            clearTimeout(timeoutId)
            if (e.name === 'AbortError' && attempt === 0) {
              continue
            }
            console.error(`[generatePremiumCarousel] slide ${i + 1} erro:`, e)
            break
          }
        }
        slidesWithImages.push({ ...slide, imageUrl })
      }

      const debit = await debitToken(userEmail, PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE * cappedCount)
      if (debit.success) notifyBalanceUpdate()

      onCarouselGenerated?.(slidesWithImages, carouselData.caption, undefined, 'premium')
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

    console.log('[handleSend] activePost:', !!activePost, '| pendingEngineChoice:', !!pendingEngineChoice, '| pendingAmbiguous:', !!pendingAmbiguous)

    // Posts premium: suporta add_logo e remove_logo via chat
    if (isPremiumActive) {
      const msgText = input.trim()
      const isRemoveLogo = /\b(remov[ae]?r?|tira[r]?|retira[r]?|exclu[ií]r?|sem)\b.*\b(logo|logotipo)\b/i.test(msgText) || /\b(logo|logotipo)\b.*\b(remov[ae]?r?|tira[r]?|retira[r]?)\b/i.test(msgText)
      const isLogoRequest = /logo|logotipo/i.test(msgText)
      const userMsg: AgentMessage = { role: 'user', content: msgText }
      if (!isLogoRequest || !premiumSlides?.length || !onPremiumSlidesUpdate) {
        setMessages(prev => [...prev, userMsg, {
          role: 'agent',
          content: 'Posts premium gerados com GPT Image 2 não são editáveis pelo agente. Você pode pedir para inserir o logo da sua marca digitando "insira o logo".',
        }])
        setInput('')
        return
      }
      setMessages(prev => [...prev, userMsg])
      setInput('')

      if (isRemoveLogo) {
        if (originalPremiumSlidesRef.current) {
          onPremiumSlidesUpdate(originalPremiumSlidesRef.current)
          originalPremiumSlidesRef.current = null
          setMessages(prev => [...prev, { role: 'agent', content: '✦ Logo removido!' }])
        } else {
          setMessages(prev => [...prev, { role: 'agent', content: 'Nenhum logo para remover.' }])
        }
        return
      }

      setLoading(true)
      try {
        const { data: authData } = await supabase.auth.getUser()
        const userEmail = authData.user?.email ?? ''
        const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null
        if (!brandCtx?.logo_url) {
          setMessages(prev => [...prev, { role: 'agent', content: 'Nenhum logo configurado na sua marca. Adicione o logo no painel de configuração da marca e tente novamente.' }])
          return
        }
        originalPremiumSlidesRef.current = premiumSlides
        const updatedSlides = await Promise.all(
          premiumSlides.map(async slide => ({
            ...slide,
            image: await overlayLogoOnImage(slide.image, brandCtx.logo_url!),
          }))
        )
        onPremiumSlidesUpdate(updatedSlides)
        setMessages(prev => [...prev, { role: 'agent', content: '✦ Logo inserido em todos os formatos!' }])
      } catch (e) {
        console.error('[premium add_logo] erro:', e)
        setMessages(prev => [...prev, { role: 'agent', content: 'Erro ao inserir o logo. Tente novamente.' }])
      } finally {
        setLoading(false)
      }
      return
    }

    const userMsg: AgentMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const filteredMessages = newMessages.filter(m => m.role !== 'agent' || newMessages.indexOf(m) > 0)

      // ── MODO EDIÇÃO ──────────────────────────────────────────────────────────
      // Se há um post gerado localmente mas EditorPage ainda não ativou editModeActive,
      // reconstruímos activePost diretamente do store para não cair no fluxo de engine choice.
      let effectiveActivePost = activePost
      if (!effectiveActivePost && hasGeneratedPost) {
        const activeId = useStore.getState().activeTemplateId
        const activeTempl = useStore.getState().templates.find(t => t.id === activeId)
        if (activeId && activeTempl) {
          const base = activeId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
          const suffix = activeId.split('-').pop() ?? '1x1'
          const format = ['1x1', '4x5', '9x16', '16x9'].includes(suffix) ? suffix : '1x1'
          effectiveActivePost = {
            templateBase: base,
            format,
            textElements: activeTempl.elements
              .filter(e => e.type === 'text')
              .map(e => ({ id: e.id, currentValue: String(e.props.text ?? ''), currentFill: String(e.props.fill ?? '') })),
            accentElements: activeTempl.elements
              .filter(e => e.type === 'shape' && !/overlay|gradient|bg-overlay/i.test(e.id))
              .map(e => ({ id: e.id, currentColor: String(e.props.fill ?? '') })),
            overlayElements: activeTempl.elements
              .filter(e => e.type === 'shape' && /overlay|gradient|bg-overlay/i.test(e.id))
              .map(e => ({ id: e.id, currentOpacity: (e.props.opacity as number) ?? 1, currentFill: String(e.props.fill ?? '') })),
            imagePrompt: activeTempl.imagePrompt,
          }
          onActivateEditMode?.()
        }
      }

      if (effectiveActivePost) {
        const activeId = useStore.getState().activeTemplateId
        const activeTmplForCtx = useStore.getState().templates.find(t => t.id === activeId)
        const editContext: EditContext = {
          templateBase: effectiveActivePost.templateBase,
          format: effectiveActivePost.format,
          textElements: effectiveActivePost.textElements,
          accentElements: effectiveActivePost.accentElements,
          overlayElements: effectiveActivePost.overlayElements,
          imagePrompt: effectiveActivePost.imagePrompt,
          logoSize: activeTmplForCtx?.logoSize ?? undefined,
        }

        console.log('[edit-mode] brandCtx completo:', JSON.stringify(brandCtx))

        const response = await agentChat(
          filteredMessages,
          brandCtx ? {
            businessName: brandCtx.business_name || brandCtx.brand_name,
            segment: brandCtx.segment,
            tone: brandCtx.tone,
            brandDescription: brandCtx.brand_description ?? undefined,
            visualStyle: brandCtx.visual_style ?? undefined,
            logoUrl: brandCtx.logo_url ?? undefined,
          } : undefined,
          undefined,
          editContext
        )

        if (response.mode === 'edit') {
          if (response.actions && response.actions.length > 0) {
            await applyEditActions(response.actions)
          }
          if (response.needs_confirm && response.confirm_type === 'regenerate_image') {
            const currentImagePrompt = useStore.getState().templates
              .find(t => t.id === useStore.getState().activeTemplateId)?.imagePrompt
            setPendingRegenImage({ prompt: response.confirm_prompt || currentImagePrompt || '' })
          }
          setMessages(prev => [...prev, { role: 'agent', content: response.message || 'Feito!' }])
        } else {
          setMessages(prev => [...prev, { role: 'agent', content: response.message || 'Pode me contar mais?' }])
        }
        return
      }
      // ── FIM MODO EDIÇÃO ──────────────────────────────────────────────────────

      const currentActiveId = useStore.getState().activeTemplateId
      const currentBase = currentActiveId
        ? currentActiveId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
        : undefined
      // Só trava o template se o usuário escolheu um diferente do último gerado.
      // Se currentBase === lastUsedTemplateRef, é o residual do post anterior —
      // não passa lockedBase para o agente poder variar livremente.
      const lockedBase = (currentBase && currentBase !== lastUsedTemplateRef.current)
        ? currentBase
        : undefined
      console.log('[handleSend] currentBase:', currentBase ?? '(none)', '| lastUsed:', lastUsedTemplateRef.current ?? '(none)', '| lockedBase:', lockedBase ?? '(none)')

      const response = await agentChat(
        filteredMessages,
        brandCtx ? {
          businessName: brandCtx.business_name || brandCtx.brand_name,
          segment: brandCtx.segment,
          tone: brandCtx.tone,
          brandDescription: brandCtx.brand_description ?? undefined,
          visualStyle: brandCtx.visual_style ?? undefined,
          nichoInfo: brandCtx.nicho_info ?? undefined,
        } : undefined,
        lockedBase ?? undefined
      )

      console.log('[handleSend] agentChat response:', JSON.stringify(response))
      console.log('[handleSend] activeTemplateId:', useStore.getState().activeTemplateId ?? '(none)')

      const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true'
      if (debugMode && response.ready && response.mode === 'carousel' && response.engine === 'premium') {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `**[DEBUG] JSON do agente (premium carousel):**\n\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``,
        }])
        return
      }

      if (response.ready && response.prompt) {
        if (response.mode === 'carousel' && response.engine === 'premium') {
          const slideCount = Math.min(response.slideCount ?? 5, 5)
          setPendingPremiumCarousel({ prompt: response.prompt, slideCount, templateId: response.templateId, slides: response.slides })
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `Esse carrossel usa GPT Image 2 — cada slide é uma imagem fotorrealista. Custa ${PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE * slideCount} pulses (4 × ${slideCount} slides) e pode levar até ${slideCount * 30}s. Confirmar?`,
          }])
        } else if (response.mode === 'carousel') {
          onGenerating?.()
          await generateCarousel(response.prompt, response.slideCount ?? 5, response.templateId)
        } else if (!uploadedPhoto) {
          // Antes de gerar, pergunta se o usuário tem uma foto para usar
          console.log('[handleSend] setPendingPhotoAsk | prompt:', response.prompt?.slice(0, 60), '| format:', response.format)
          setPendingPhotoAsk({ prompt: response.prompt, format: response.format })
          setMessages(prev => [...prev, {
            role: 'agent',
            content: 'Você tem uma foto para usar? Pode enviar agora ou deixo a IA criar uma.',
          }])
        } else {
          // Post — usuário sempre escolhe a engine
          console.log('[handleSend] setPendingEngineChoice | prompt:', response.prompt?.slice(0, 60), '| format:', response.format)
          setPendingEngineChoice({ prompt: response.prompt, format: response.format })
          setMessages(prev => [...prev, {
            role: 'agent',
            content: 'Vou usar a foto que você enviou como base da imagem. Qual qualidade de imagem você prefere?',
          }])
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
      setTimeout(() => inputRef.current?.focus(), 0)
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
    onCollapsedChange?.(false)
    setPendingPremium(null)
    setPendingPremiumCarousel(null)
    setPendingRegenImage(null)
    setPendingAmbiguous(null)
    setPendingEngineChoice(null)
    setPendingPhotoAsk(null)
    setUploadedPhoto(null)
    setHasGeneratedPost(false)
    onReset?.()
  }

  const isDisabled = loading || generating

  if (collapsed) {
    return (
      <div
        onClick={() => { setCollapsed(false); onCollapsedChange?.(false) }}
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
        {pendingRegenImage && !loading && !generating && (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={async () => {
                const p = pendingRegenImage
                setPendingRegenImage(null)
                setGenerating(true)
                try {
                  const url = uploadedPhoto ?? await generateImage(p.prompt)
                  const activeId = useStore.getState().activeTemplateId
                  if (activeId) {
                    setTemplateBackground(activeId, url)
                    setTemplateImagePrompt(activeId, p.prompt)
                    const def = templateRegistry.find(d => activeId.startsWith(d.id))
                    def?.getVariants(theme).forEach(v => {
                      if (v.id !== activeId) {
                        setTemplateBackground(v.id, url)
                        setTemplateImagePrompt(v.id, p.prompt)
                      }
                    })
                  }
                  if (uploadedPhoto) setUploadedPhoto(null)
                  setMessages(prev => [...prev, { role: 'agent', content: uploadedPhoto ? '✦ Foto aplicada como nova imagem!' : '✦ Nova imagem gerada!' }])
                } catch (e: any) {
                  setMessages(prev => [...prev, { role: 'agent', content: e.message || 'Erro ao gerar imagem.' }])
                } finally {
                  setGenerating(false)
                }
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white',
                fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Confirmar · 4 pulses
            </button>
            <button
              onClick={() => setPendingRegenImage(null)}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Cancelar
            </button>
          </div>
        )}
        {pendingAmbiguous && !loading && !generating && (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={() => {
                setPendingAmbiguous(null)
                onActivateEditMode?.()
                setMessages(prev => [...prev, {
                  role: 'agent',
                  content: 'Modo edição ativado! Descreva o que quer mudar — textos, cores, formato ou imagem.',
                }])
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white',
                fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Alterar post atual
            </button>
            <button
              onClick={() => {
                const p = pendingAmbiguous
                setPendingAmbiguous(null)
                setPendingEngineChoice({ prompt: p.prompt!, format: p.format })
                setMessages(prev => [...prev, {
                  role: 'agent',
                  content: 'Qual qualidade de imagem você prefere?',
                }])
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Criar novo post
            </button>
          </div>
        )}
        {pendingPhotoAsk && !loading && !generating && (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => photoInputRef.current?.click()}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white',
                fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              📷 Enviar foto
            </button>
            <button
              onClick={() => {
                const p = pendingPhotoAsk
                setPendingPhotoAsk(null)
                setPendingEngineChoice({ prompt: p.prompt, format: p.format })
                setMessages(prev => [...prev, {
                  role: 'agent',
                  content: 'Sem problema, deixo a IA criar a imagem. Qual qualidade de imagem você prefere?',
                }])
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Deixar a IA criar
            </button>
          </div>
        )}
        {pendingEngineChoice && !loading && !generating && (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const p = pendingEngineChoice
                setPendingEngineChoice(null)
                onGenerating?.('standard')
                setMessages(prev => [...prev, { role: 'agent', content: 'Gerando seu post...' }])
                generate(p.prompt, p.format)
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white',
                fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Standard · 4 pulses
            </button>
            <button
              onClick={() => {
                const p = pendingEngineChoice
                setPendingEngineChoice(null)
                onGenerating?.('premium')
                generatePremium(p.prompt, p.format)
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid var(--accent)', background: 'transparent',
                color: 'var(--accent)', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Premium · 8 pulses
            </button>
          </div>
        )}
        {pendingPremiumCarousel && !loading && !generating && (
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={() => {
                const pending = pendingPremiumCarousel
                setPendingPremiumCarousel(null)
                onGenerating?.()
                generatePremiumCarousel(pending.prompt, pending.slideCount, pending.templateId, pending.slides)
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
      {uploadedPhoto && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px 0', background: 'var(--bg-base)',
        }}>
          <img src={uploadedPhoto} alt="Foto anexada" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Foto anexada — será usada no post</span>
          <button
            onClick={() => setUploadedPhoto(null)}
            title="Remover foto"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: '2px 6px' }}
          >
            ×
          </button>
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-base)',
      }}>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
          }}
          onKeyDown={handleKeyDown}
          placeholder={generating ? 'Gerando seu post...' : 'Digite sua mensagem...'}
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontSize: '14px',
            fontFamily: 'inherit', resize: 'none', outline: 'none',
            lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto',
            opacity: isDisabled ? 0.6 : 1,
          }}
        />
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={isDisabled}
          title="Enviar foto"
          style={{
            width: '36px', height: '36px', borderRadius: '10px', border: 'none',
            background: 'transparent',
            color: uploadedPhoto ? 'var(--accent)' : 'var(--text-muted)',
            cursor: isDisabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h1.6l.6-1.1A1 1 0 0 1 6.6 2.4h2.8a1 1 0 0 1 .9.5L10.9 4h1.6A1.5 1.5 0 0 1 14 5.5v6A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <circle cx="8" cy="8.2" r="2.4" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </button>
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
