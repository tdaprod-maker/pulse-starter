import { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import type Konva from 'konva'
import { useStore } from '../state/useStore'
import type { CanvasElement } from '../state/useStore'
import { CanvasEngine } from '../engine/CanvasEngine'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { Sidebar } from '../components/Sidebar'
import { ExportPanel } from '../components/ExportPanel'
import { PropertiesPanel } from '../components/PropertiesPanel'
import { ImagePanel } from '../components/ImagePanel'
import { AgentChat } from '../components/AgentChat'
import { CarouselViewer } from '../components/CarouselViewer'
import { PremiumResultViewer } from '../components/PremiumResultViewer'
import type { PremiumSlide } from '../services/gemini'
import { CaptionPanel } from '../components/CaptionPanel'
import { PostReviewer } from '../components/PostReviewer'
import { TextEditor } from '../components/TextEditor'
import { generateImage } from '../services/replicate'

interface EditingState {
  el: CanvasElement
  containerRect: DOMRect
  autoScale: number
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

  // Registra todas as variantes do template ativo no store ao trocar de template
  useEffect(() => {
    if (!activeTemplate) return
    const def = templateRegistry.find((d) => activeTemplate.id.startsWith(d.id))
    if (!def) return
    def.getVariants(theme).forEach((v) => {
      if (!templates.find((t) => t.id === v.id)) addTemplate(v)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate?.id])

  // Restaura post do histórico quando pendingPost é definido
  const ACCENT_ELEMENT: Record<string, string> = {
    'hero-title':     'accent-bar',
    'editorial-card': 'accent-bar',
    'big-number':     'number',
    'food-promo':     'bg-color',
    'tech-news':      'category-line',
    'tech-product':   'accent-strip',
  }

  useEffect(() => {
    console.log('[EditorPage] pendingPost useEffect disparado. valor:', pendingPost)
    if (!pendingPost) return

    console.log('[pendingPost] objeto completo:', JSON.stringify(pendingPost, null, 2))

    const rawId = pendingPost.template_id ?? ''
    const normalizedId = rawId.toLowerCase().trim().replace(/\s+/g, '-')
    const def = templateRegistry.find((d) =>
      rawId === d.id || rawId.startsWith(d.id) ||
      normalizedId === d.id || normalizedId.startsWith(d.id)
    )
    console.log('[pendingPost] template_id raw:', rawId, '| normalized:', normalizedId, '| def found:', def?.id ?? 'NENHUM')
    if (!def) { setPendingPost(null); return }

    const variants = def.getVariants(theme)
    variants.forEach((v) => addTemplate(v))

    const target = variants.find(v => v.id === pendingPost.template_id) ?? variants[0]
    setActiveTemplate(target.id)

    // Aplica textos em todas as variantes
    variants.forEach((v) => {
      const snap = useStore.getState().templates.find((t) => t.id === v.id) ?? v
      Object.entries(pendingPost.texts).forEach(([fieldId, text]) => {
        const el = snap.elements.find((e) => e.id === fieldId)
        if (el && el.type === 'text') {
          updateElement(v.id, fieldId, { props: { ...el.props, text } })
        }
      })

      // Aplica accent_color
      const accentId = ACCENT_ELEMENT[def.id]
      if (accentId && pendingPost.accent_color) {
        const snapAfter = useStore.getState().templates.find((t) => t.id === v.id) ?? snap
        const accentEl = snapAfter.elements.find((e) => e.id === accentId)
        if (accentEl) {
          updateElement(v.id, accentId, { props: { ...accentEl.props, fill: pendingPost.accent_color } })
        }
      }
    })

    // Restaura legenda se existir no post (campo opcional, não presente em posts antigos)
    const postWithCaption = pendingPost as typeof pendingPost & { caption?: { instagram: string; linkedin: string; hashtags: string } }
    if (postWithCaption.caption) setCaption(postWithCaption.caption)

    setPendingPost(null)

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

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  // Auto-expand properties panel when element is selected on mobile
  useEffect(() => {
    if (selectedElementId || carouselSelectedElement) setRightPanelOpen(true)
  }, [selectedElementId, carouselSelectedElement])

  return (
    <div className="editor-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Boas-vindas — visível antes do primeiro post */}
        {!activeTemplate && !premiumSlides && !carouselSlides && (
          <div style={{ textAlign: 'center', padding: '32px 24px 0', flexShrink: 0 }}>
            <p className="display-title" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '10px', margin: '0 0 10px' }}>Bem-vindo ao Pulse</p>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Diga o que precisa fazer ou selecione um template na barra lateral para começar.</p>
          </div>
        )}

        {/* Agente conversacional — fixo no topo */}
        <div className="agent-chat-wrapper" style={{ padding: '16px 24px 0', flexShrink: 0 }}>
          <AgentChat
            onGenerating={() => {}}
            onGenerated={() => {}}
            onReset={() => { setCarouselSlides(null); setCarouselCaption(''); setCarouselTemplateId(undefined); setCarouselEngine(undefined); setPremiumSlides(null); setPremiumCaption(null) }}
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
          {/* Mobile FAB: open templates sidebar */}
          <button
            className="mobile-only"
            onClick={() => setSidebarOpen(true)}
            title="Templates"
            style={{
              position: 'fixed',
              bottom: '64px',
              left: '16px',
              zIndex: 350,
              background: 'rgba(13,17,23,0.95)',
              border: '1px solid rgba(91,143,212,0.3)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'inherit',
              gap: '6px',
              alignItems: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" opacity="0.8"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" opacity="0.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" opacity="0.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" opacity="0.3"/>
            </svg>
            Templates
          </button>

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
          ) : activeTemplate ? (
            <>
              {/* Preview principal — formato ativo */}
              <div style={{
                borderRadius: '12px',
                boxShadow: '0 0 0 1px rgba(91,143,212,0.2), 0 24px 80px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}>
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
