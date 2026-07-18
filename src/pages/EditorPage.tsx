import { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import type Konva from 'konva'
import { useStore } from '../state/useStore'
import type { CanvasElement } from '../state/useStore'
import { CanvasEngine } from '../engine/CanvasEngine'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { ExportPanel } from '../components/ExportPanel'
import { PropertiesPanel } from '../components/PropertiesPanel'
import { ImagePanel } from '../components/ImagePanel'
import { AgentChat } from '../components/AgentChat'
import type { ActivePost } from '../components/AgentChat'
import { CarouselViewer } from '../components/CarouselViewer'
import { PremiumResultViewer } from '../components/PremiumResultViewer'
import type { PremiumSlide } from '../services/gemini'
import { CaptionPanel } from '../components/CaptionPanel'
import { PostReviewer } from '../components/PostReviewer'
import { TextEditor } from '../components/TextEditor'
import { generateImage } from '../services/replicate'
import { loadBrandConfig } from '../services/brandKit'
import { supabase } from '../lib/supabase'

interface EditingState {
  el: CanvasElement
  containerRect: DOMRect
  autoScale: number
}

const STANDARD_PHRASES = [
  'Escolhendo a fonte perfeita...',
  'Pedindo inspiração ao algoritmo...',
  'Ajustando os pixels com luvas brancas...',
  'Convencendo a IA a ser criativa...',
  'Calculando o equilíbrio perfeito entre arte e dados...',
]
const PREMIUM_PHRASES = [
  'Gerando fotorrealismo de respeito...',
  'Isso leva um tempo. Vale a pena.',
  'A IA está trabalhando mais do que você hoje...',
  'Resultado premium requer paciência premium...',
  'Processando cada pixel com carinho...',
]

function GeneratingOverlay({ engine }: { engine: 'standard' | 'premium' }) {
  const phrases = engine === 'premium' ? PREMIUM_PHRASES : STANDARD_PHRASES
  const rotateMs = engine === 'premium' ? 4000 : 3000
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const timer = setInterval(() => {
      setVisible(false)
      timeoutId = setTimeout(() => { setIdx(i => (i + 1) % phrases.length); setVisible(true) }, 300)
    }, rotateMs)
    return () => { clearInterval(timer); if (timeoutId !== null) clearTimeout(timeoutId) }
  }, [rotateMs, phrases.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '48px 24px', width: '100%' }}>
      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {engine === 'premium' ? '✦ Post Premium · GPT Image 2' : '✦ Gerando Post'}
      </span>
      <div style={{ width: '260px', height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '38%', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', animation: 'generating-scan 1.8s ease-in-out infinite' }} />
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', maxWidth: '320px', lineHeight: 1.6, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {phrases[idx]}
      </p>
    </div>
  )
}

export function EditorPage() {
  const stageRef = useRef<Konva.Stage>(null)
  const [editingState, setEditingState] = useState<EditingState | null>(null)
    const mainRef = useRef<HTMLElement>(null)
  const [containerW, setContainerW] = useState(800)
  const [containerH, setContainerH] = useState(600)
  const [carouselSlides, setCarouselSlides] = useState<(import('../services/gemini').CarouselSlide & { imageUrl: string })[] | null>(null)
  const [carouselCaption, setCarouselCaption] = useState('')
  const [carouselTemplateId, setCarouselTemplateId] = useState<string | undefined>(undefined)
  const [carouselCurrentSlide, setCarouselCurrentSlide] = useState(0)
  const [carouselSelectedElement, setCarouselSelectedElement] = useState<string | null>(null)
  const [carouselEngine, setCarouselEngine] = useState<string | undefined>(undefined)
  const [premiumSlides, setPremiumSlides] = useState<PremiumSlide[] | null>(null)
  const [premiumCaption, setPremiumCaption] = useState<{ instagram: string; linkedin: string; hashtags: string } | null>(null)
  const variantRefs = useRef<Record<string, Konva.Stage | null>>({})

  const {
    templates,
    activeTemplateId,
    selectedElementId,
    setSelectedElement,
    updateElement,
    addTemplate,
    setActiveTemplate,
    setTemplateBackground,
    setTemplateImagePrompt,
    pendingPost,
    setPendingPost,
    setCaption,
  } = useStore()

  const { theme } = useTheme()
  const activeTemplate = templates.find((t) => t.id === activeTemplateId)

  // Registra todas as variantes do template ativo no store ao trocar de template.
  // NÃO executa durante restauração de pendingPost — o pendingPost effect já faz o addTemplate
  // com a ordem certa (reset → apply texts). Se este effect rodasse junto, poderia sobrescrever
  // os textos restaurados com os defaults da definição.
  useEffect(() => {
    if (!activeTemplate) return
    if (pendingPost) return
    const def = templateRegistry.find((d) => activeTemplate.id.startsWith(d.id))
    if (!def) return
    def.getVariants(theme).forEach((v) => {
      if (!templates.find((t) => t.id === v.id)) addTemplate(v)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate?.id, !!pendingPost])

  // Mapeamento de template base → elemento de destaque (deve ser idêntico ao AgentChat.tsx)
  const ACCENT_ELEMENT: Record<string, string> = {
    'hero-title':     'accent-bar',
    'editorial-card': 'accent-bar',
    'big-number':     'number',
    'food-promo':     'bg-color',
    'tech-news':      'brand-line',
    'tech-statement': 'brand-line',
    'tech-product':   'accent-strip',
  }

  useEffect(() => {
    if (!pendingPost) return

    const rawId = pendingPost.template_id ?? ''
    const normalizedId = rawId.toLowerCase().trim().replace(/\s+/g, '-')

    console.log('[restore] iniciando | template_id:', rawId, '| normalizado:', normalizedId)

    const def = templateRegistry.find((d) =>
      rawId === d.id || rawId.startsWith(d.id) ||
      normalizedId === d.id || normalizedId.startsWith(d.id)
    )

    if (!def) {
      console.warn('[restore] template definition NÃO encontrado para:', rawId)
      setPendingPost(null)
      return
    }

    console.log('[restore] definition encontrada:', def.id)

    // 1. Registra todas as variantes no store (reseta para defaults limpos)
    const variants = def.getVariants(theme)
    variants.forEach((v) => addTemplate(v))
    console.log('[restore] variantes registradas:', variants.map(v => v.id).join(', '))

    // 2. Identifica a variante-alvo pelo sufixo de proporção salvo
    //    Tenta: match exato → match com ID normalizado → primeira variante (fallback)
    const target =
      variants.find(v => v.id === rawId) ??
      variants.find(v => v.id === normalizedId) ??
      variants[0]

    const matchType =
      target.id === rawId ? 'exact' :
      target.id === normalizedId ? 'normalized' :
      'fallback-variants[0]'

    console.log('[restore] variante-alvo:', target.id, '| match:', matchType,
      matchType === 'fallback-variants[0]' ? `(template_id "${rawId}" não encontrado nas variantes)` : '')

    // 3. Ativa a variante correta ANTES de aplicar textos
    setActiveTemplate(target.id)
    console.log('[restore] setActiveTemplate →', target.id)

    // 4. Aplica textos e accent_color em todas as variantes usando snapshot pós-addTemplate
    const textEntries = Object.entries(pendingPost.texts)
    const accentId = ACCENT_ELEMENT[def.id]
    console.log('[restore] textos a aplicar:', JSON.stringify(pendingPost.texts),
      '| accentId:', accentId ?? 'nenhum', '| accent_color:', pendingPost.accent_color ?? 'nenhuma',
      '| total campos:', textEntries.length)

    variants.forEach((v) => {
      // Lê o estado atual da variante no store (após addTemplate)
      const snap = useStore.getState().templates.find((t) => t.id === v.id) ?? v
      const isTarget = v.id === target.id

      if (isTarget) {
        const snapTextIds = snap.elements.filter(e => e.type === 'text').map(e => e.id)
        const savedIds = textEntries.map(([id]) => id)
        const matched = savedIds.filter(id => snapTextIds.includes(id))
        const missing = savedIds.filter(id => !snapTextIds.includes(id))
        console.log(`[restore] [${v.id}] IDs de texto no template:`, snapTextIds.join(', '))
        console.log(`[restore] [${v.id}] IDs salvos no post:`, savedIds.join(', '))
        console.log(`[restore] [${v.id}] match: ${matched.length}/${savedIds.length}`, missing.length ? `| não encontrados: ${missing.join(', ')}` : '')
      }

      textEntries.forEach(([fieldId, text]) => {
        const el = snap.elements.find((e) => e.id === fieldId)
        if (el && el.type === 'text') {
          updateElement(v.id, fieldId, { props: { ...el.props, text } })
          if (isTarget) console.log(`[restore] [${v.id}] ✓ "${fieldId}" → "${String(text).slice(0, 60)}"`)
        } else if (isTarget) {
          console.warn(`[restore] [${v.id}] ✗ "${fieldId}" NÃO encontrado (tipo: ${snap.elements.find(e => e.id === fieldId)?.type ?? 'ausente'})`)
        }
      })

      if (accentId && pendingPost.accent_color) {
        // Relê o snap após updateElement para pegar props atualizados
        const snapAfterText = useStore.getState().templates.find((t) => t.id === v.id) ?? snap
        const accentEl = snapAfterText.elements.find((e) => e.id === accentId)
        if (accentEl) {
          updateElement(v.id, accentId, { props: { ...accentEl.props, fill: pendingPost.accent_color } })
          if (isTarget) console.log(`[restore] [${v.id}] ✓ accent "${accentId}" → "${pendingPost.accent_color}"`)
        } else if (isTarget) {
          console.warn(`[restore] [${v.id}] ✗ accent "${accentId}" NÃO encontrado`)
        }
      }
    })

    // Verifica o estado final do template ativo após todos os updateElement
    const snapFinal = useStore.getState().templates.find(t => t.id === target.id)
    if (snapFinal) {
      const finalTexts = snapFinal.elements.filter(e => e.type === 'text').map(e => `${e.id}="${String(e.props.text ?? '').slice(0, 30)}"`)
      console.log('[restore] estado final do template ativo:', finalTexts.join(' | '))
    }

    // Restaura legenda se existir no post (campo opcional, não presente em posts antigos)
    const postWithCaption = pendingPost as typeof pendingPost & { caption?: { instagram: string; linkedin: string; hashtags: string } }
    if (postWithCaption.caption) setCaption(postWithCaption.caption)

    console.log('[restore] concluído | activeTemplateId final esperado:', target.id)
    setPendingPost(null)
    setEditModeActive(true)
    setAgentChatKey(k => k + 1)

    // Restaura imagem de fundo: usa thumbnail_url salva (sem custo) ou, como último
    // recurso, gera nova imagem via FAL.ai (consome pulse)
    const imagePrompt = (pendingPost as typeof pendingPost & { image_prompt?: string }).image_prompt
    const savedImageUrl = pendingPost.thumbnail_url

    if (savedImageUrl) {
      variants.forEach((v) => {
        setTemplateBackground(v.id, savedImageUrl)
        if (imagePrompt) setTemplateImagePrompt(v.id, imagePrompt)
      })
    } else if (imagePrompt) {
      generateImage(imagePrompt).then((url) => {
        variants.forEach((v) => {
          setTemplateBackground(v.id, url)
          setTemplateImagePrompt(v.id, imagePrompt)
        })
      }).catch(() => {
        // falha silenciosa — não interrompe a restauração
      })
    }

    // Restaura logo do brand kit em todas as variantes
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const email = data.user?.email
        if (!email) return
        const brand = await loadBrandConfig(email)
        if (!brand?.logo_url) return
        const resp = await fetch(brand.logo_url)
        const blob = await resp.blob()
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
        variants.forEach(v => {
          useStore.getState().setTemplateLogo(v.id, base64)
        })
        console.log('[restore] logo do brand kit aplicado em', variants.length, 'variantes')
      } catch {
        // falha silenciosa — não interrompe a restauração
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPost])

  // Cancela a edição ao trocar de template
  useEffect(() => {
    setEditingState(null)
  }, [activeTemplateId])

  // Mede o container principal para calcular o scale dinâmico do canvas
  useLayoutEffect(() => {
    const el = mainRef.current
    if (!el) return
    const update = () => {
      setContainerW(el.clientWidth)
      setContainerH(el.clientHeight)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Scale dinâmico: o canvas ocupa a maior área possível mantendo proporção
  // Reserva ~160px na altura para os mini previews
  const CANVAS_PADDING = 24
  const MINI_ROW_H = 160
  const canvasScale = activeTemplate
    ? Math.min(
        (containerW - CANVAS_PADDING) / activeTemplate.width,
        (containerH - CANVAS_PADDING - MINI_ROW_H) / activeTemplate.height,
      )
    : 1

  // Todas as variantes do template ativo (para o multi-format preview)
  const allVariants = useMemo(() => {
    if (!activeTemplate) return []
    const def = templateRegistry.find((d) => activeTemplate.id.startsWith(d.id))
    if (!def) return []
    return def.getVariants(theme)
  }, [activeTemplate, theme])

  function handleEditStart(el: CanvasElement) {
    const container = stageRef.current?.container()
    if (!container || !activeTemplate) return
    setEditingState({
      el,
      containerRect: container.getBoundingClientRect(),
      autoScale: canvasScale,
    })
    setSelectedElement(el.id)
  }

  function handleCommit(newText: string) {
    if (!editingState || !activeTemplateId) return
    const { el } = editingState
    updateElement(activeTemplateId, el.id, {
      props: { ...el.props, text: newText },
    })
    setEditingState(null)
  }

  function handleCancel() {
    setEditingState(null)
  }

  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [agentChatKey, setAgentChatKey] = useState(0)
  const [editModeActive, setEditModeActive] = useState(false)
  const [canvasExpanded, setCanvasExpanded] = useState(false)
  const [generatingEngine, setGeneratingEngine] = useState<'standard' | 'premium' | null>(null)

  // Computa o contexto do post ativo para o agente de edição
  const editPost = useMemo<ActivePost | undefined>(() => {
    if (!activeTemplate || !editModeActive) return undefined
    const base = activeTemplate.id.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
    const suffix = activeTemplate.id.split('-').pop() ?? '1x1'
    const format = ['1x1', '4x5', '9x16', '16x9'].includes(suffix) ? suffix : '1x1'
    return {
      templateBase: base,
      format,
      textElements: activeTemplate.elements
        .filter(e => e.type === 'text')
        .map(e => ({ id: e.id, currentValue: String(e.props.text ?? ''), currentFill: String(e.props.fill ?? '') })),
      accentElements: activeTemplate.elements
        .filter(e => e.type === 'shape' && !/overlay|gradient|bg-overlay/i.test(e.id))
        .map(e => ({ id: e.id, currentColor: String(e.props.fill ?? '') })),
      overlayElements: activeTemplate.elements
        .filter(e => e.type === 'shape' && /overlay|gradient|bg-overlay/i.test(e.id))
        .map(e => ({ id: e.id, currentOpacity: (e.props.opacity as number) ?? 1, currentFill: String(e.props.fill ?? '') })),
      imagePrompt: activeTemplate.imagePrompt,
    }
  }, [activeTemplate, editModeActive])

  // Auto-expand properties panel when element is selected on mobile
  useEffect(() => {
    if (selectedElementId || carouselSelectedElement) setRightPanelOpen(true)
  }, [selectedElementId, carouselSelectedElement])

  return (
    <div className="editor-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Boas-vindas — visível antes do primeiro post */}
        {!activeTemplate && !premiumSlides && !carouselSlides && (
          <div style={{ textAlign: 'center', padding: '32px 24px 0', flexShrink: 0 }}>
            <p className="display-title" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '10px', margin: '0 0 10px' }}>Bem-vindo ao Pulse</p>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Diga o que precisa fazer para começar.</p>
          </div>
        )}

        {/* Agente conversacional — fixo no topo */}
        <div className="agent-chat-wrapper" style={{ padding: '16px 24px 0', flexShrink: 0 }}>
          <AgentChat
            key={agentChatKey}
            onGenerating={(engine) => { if (engine) setGeneratingEngine(engine) }}
            onGenerated={() => setGeneratingEngine(null)}
            onActivateEditMode={() => setEditModeActive(true)}
            onReset={() => {
              setCarouselSlides(null)
              setCarouselCaption('')
              setCarouselTemplateId(undefined)
              setCarouselEngine(undefined)
              setPremiumSlides(null)
              setPremiumCaption(null)
              setEditModeActive(false)
            }}
            onCarouselGenerated={(slides: (import('../services/gemini').CarouselSlide & { imageUrl: string })[], caption: string, templateId?: string, engine?: string) => {
              setCarouselSlides(slides)
              setCarouselCaption(caption)
              setCarouselTemplateId(templateId)
              setCarouselEngine(engine)
            }}
            onPremiumGenerated={(slides, caption) => {
              console.log('[EditorPage] onPremiumGenerated chamado, slides:', slides.length)
              setPremiumSlides(slides)
              setPremiumCaption(caption)
            }}
            activePost={editPost}
            isPremiumActive={!!premiumSlides}
            premiumSlides={premiumSlides ?? undefined}
            onPremiumSlidesUpdate={setPremiumSlides}
            forceCollapsed={canvasExpanded}
            onCollapsedChange={(c) => { if (!c) setCanvasExpanded(false) }}
          />
        </div>

        {/* Área do canvas — scrollável */}
        <main ref={mainRef} className="canvas-area" onClick={(e) => { if (e.target === mainRef.current) setSelectedElement(null) }} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'auto',
          position: 'relative',
          gap: '24px',
          padding: '24px',
          paddingTop: '16px',
        }}>
          {premiumSlides ? (
            <PremiumResultViewer
              slides={premiumSlides}
              caption={premiumCaption}
              onClose={() => { setPremiumSlides(null); setPremiumCaption(null) }}
            />
          ) : carouselSlides ? (
            <CarouselViewer
              slides={carouselSlides}
              caption={carouselCaption}
              templateId={carouselTemplateId}
              engine={carouselEngine}
              onClose={() => { setCarouselSlides(null); setCarouselCaption(''); setCarouselTemplateId(undefined); setCarouselEngine(undefined); setCarouselCurrentSlide(0); setCarouselSelectedElement(null) }}
              onSlideChange={(i) => { setCarouselCurrentSlide(i); setCarouselSelectedElement(null) }}
              onSelectElement={setCarouselSelectedElement}
            />
          ) : generatingEngine ? (
            <GeneratingOverlay engine={generatingEngine} />
          ) : activeTemplate ? (
            <>
              {/* Preview principal — formato ativo */}
              <div style={{ borderRadius: '12px', boxShadow: '0 0 0 1px rgba(91,143,212,0.2), 0 24px 80px rgba(0,0,0,0.6)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <CanvasEngine
                  key={activeTemplate.id}
                  ref={stageRef}
                  template={activeTemplate}
                  scale={canvasScale}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElement}
                  editingElementId={editingState?.el.id ?? null}
                  onEditStart={handleEditStart}
                />
                {/* Botão expand */}
                <button
                  onClick={() => setCanvasExpanded(true)}
                  title="Expandir visualização"
                  style={{ position: 'absolute', bottom: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '7px', border: 'none', background: 'rgba(0,0,0,0.55)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M1 5V1h4M8 1h4v4M12 8v4H8M5 12H1V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <ExportPanel stageRef={stageRef} template={activeTemplate} variantRefs={variantRefs} allVariants={allVariants} />
              <CaptionPanel stageRef={stageRef} template={activeTemplate} />
              <PostReviewer key={activeTemplate?.id} stageRef={stageRef} template={activeTemplate} />
            </>
          ) : null}
        </main>
      </div>

      {/* Textarea overlay — renderizado fora do canvas para não herdar a escala do Stage */}
      {editingState && (
        <TextEditor
          el={editingState.el}
          containerRect={editingState.containerRect}
          autoScale={editingState.autoScale}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      )}

      <aside
        className={`right-panel${rightPanelOpen ? ' panel-open' : ''}`}
        style={{
          width: '380px',
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Drag handle — mobile only */}
        <div
          className="panel-drag-handle"
          onClick={() => setRightPanelOpen((v) => !v)}
          style={{ display: 'none' }}
        >
          <div className="panel-drag-handle-bar" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Propriedades
            </span>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ transform: rightPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--text-muted)' }}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {carouselSlides ? (() => {
          const carouselTemplate = templates.find(t => t.id === `carousel-slide-${carouselCurrentSlide}`)
          return carouselTemplate ? (
            <>
              <PropertiesPanel template={carouselTemplate} selectedElementId={carouselSelectedElement} />
              <ImagePanel template={carouselTemplate} />
            </>
          ) : null
        })() : activeTemplate ? (
          <>
            <PropertiesPanel template={activeTemplate} selectedElementId={selectedElementId} />
            <ImagePanel template={activeTemplate} />
          </>
        ) : (
          <p style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Gere um post acima ou selecione um template na barra lateral.
          </p>
        )}
      </aside>
    </div>
  )
}
