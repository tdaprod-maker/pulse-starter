import { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import type Konva from 'konva'
import { useStore } from '../state/useStore'
import type { CanvasElement } from '../state/useStore'
import { CanvasEngine } from '../engine/CanvasEngine'
import { makeHeroTitleVariants } from '../templates/hero-title/variants'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { Sidebar } from '../components/Sidebar'
import { ExportPanel } from '../components/ExportPanel'
import { PropertiesPanel } from '../components/PropertiesPanel'
import { ImagePanel } from '../components/ImagePanel'
import { AIPanel } from '../components/AIPanel'
import { TextEditor } from '../components/TextEditor'

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
  const variantRefs = useRef<Record<string, Konva.Stage | null>>({})

  const {
    templates,
    activeTemplateId,
    selectedElementId,
    setSelectedElement,
    updateElement,
    addTemplate,
    setActiveTemplate,
  } = useStore()

  const { theme } = useTheme()
  const activeTemplate = templates.find((t) => t.id === activeTemplateId)

  // Seleciona Hero Title 1:1 como template padrão ao carregar
  useEffect(() => {
    if (!activeTemplateId) {
      const heroTitle1x1 = makeHeroTitleVariants(theme)[0]
      addTemplate(heroTitle1x1)
      setActiveTemplate(heroTitle1x1.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const CANVAS_PADDING = 48
  const MINI_ROW_H = 200
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

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar />

      <main ref={mainRef} className="canvas-area" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        position: 'relative',
        gap: '24px',
        padding: '24px',
      }}>
        {activeTemplate ? (
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

            {/* Mini previews dos outros formatos */}
            {allVariants.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                {allVariants.map((v) => {
                  const miniScale = Math.min(160 / v.width, 160 / v.height)
                  const isActive = v.id === activeTemplate.id
                  const storedVariant = templates.find((t) => t.id === v.id) ?? v
                  return (
                    <div
                      key={v.id}
                      onClick={() => setActiveTemplate(v.id)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: isActive
                          ? '2px solid var(--accent)'
                          : '2px solid rgba(255,255,255,0.08)',
                        boxShadow: isActive
                          ? '0 0 12px rgba(58,90,255,0.4)'
                          : 'none',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                        position: 'relative',
                      }}
                      title={v.id.split('-').pop()?.toUpperCase()}
                    >
                      <CanvasEngine
                        key={v.id}
                        ref={(el) => { variantRefs.current[v.id] = el }}
                        template={storedVariant}
                        scale={miniScale}
                        selectedElementId={null}
                        onSelectElement={() => {}}
                        editingElementId={null}
                        onEditStart={() => {}}
                      />
                      {/* Label do formato */}
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: 'white',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        letterSpacing: '0.05em',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                      }}>
                        {v.id.split('-').pop()?.toUpperCase()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Bem-vindo ao Pulse</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Selecione um template na barra lateral para começar.</p>
          </div>
        )}
      </main>

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

      <aside style={{
        width: '280px',
        background: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* AIPanel sempre visível — gera e ativa o template automaticamente */}
        <AIPanel />

        {activeTemplate ? (
          <>
            <PropertiesPanel template={activeTemplate} />
            <ImagePanel template={activeTemplate} />
            <ExportPanel stageRef={stageRef} template={activeTemplate} />
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
