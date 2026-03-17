import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import type Konva from 'konva'
import { useStore } from '../state/useStore'
import type { CanvasElement } from '../state/useStore'
import { CanvasEngine } from '../engine/CanvasEngine'
import { makeHeroTitleVariants } from '../templates/hero-title/variants'
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
  const CANVAS_PADDING = 48
  const canvasScale = activeTemplate
    ? Math.min(
        (containerW - CANVAS_PADDING) / activeTemplate.width,
        (containerH - CANVAS_PADDING) / activeTemplate.height,
      )
    : 1

  function handleEditStart(el: CanvasElement) {
    const container = stageRef.current?.container()
    if (!container || !activeTemplate) return
    setEditingState({
      el,
      containerRect: container.getBoundingClientRect(),
      autoScale: canvasScale,
    })
    // Seleciona o elemento para manter o contexto visual
    setSelectedElement(el.id)
  }

  function handleCommit(newText: string) {
    if (!editingState || !activeTemplateId) return
    const { el } = editingState
    // Preserva todos os props do Design System — só o texto muda
    updateElement(activeTemplateId, el.id, {
      props: { ...el.props, text: newText },
    })
    setEditingState(null)
  }

  function handleCancel() {
    setEditingState(null)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />

      <main ref={mainRef} className="canvas-area flex-1 flex items-center justify-center overflow-hidden">
        {activeTemplate ? (
          <div className="shadow-2xl">
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
        ) : (
          <div className="text-gray-400 text-center">
            <p className="text-2xl font-semibold mb-2">Bem-vindo ao Pulse</p>
            <p className="text-sm">Selecione um template na barra lateral para começar.</p>
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

      <aside className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col overflow-y-auto">
        {/* AIPanel sempre visível — gera e ativa o template automaticamente */}
        <AIPanel />

        {activeTemplate ? (
          <>
            <PropertiesPanel template={activeTemplate} />
            <ImagePanel template={activeTemplate} />
            <ExportPanel stageRef={stageRef} template={activeTemplate} />
          </>
        ) : (
          <p className="p-4 text-xs text-gray-600">
            Gere um post acima ou selecione um template na barra lateral.
          </p>
        )}
      </aside>
    </div>
  )
}
