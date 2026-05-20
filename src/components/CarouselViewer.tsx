import { useState, useRef, useEffect } from 'react'
import type Konva from 'konva'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { CanvasEngine } from '../engine/CanvasEngine'
import { calcAutoScale } from '../engine/CanvasEngine'
import { exportToPng, buildFileName } from '../export/exportUtils'
import type { CarouselSlide } from '../services/gemini'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'

type SlideWithImage = CarouselSlide & { imageUrl: string }

interface CarouselViewerProps {
  slides: SlideWithImage[]
  caption: string
  templateId?: string
  onClose: () => void
}

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

export function CarouselViewer({ slides, caption, templateId, onClose }: CarouselViewerProps) {
  const [current, setCurrent] = useState(0)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [ready, setReady] = useState(false)
  const stageRefs = useRef<Record<number, Konva.Stage | null>>({})
  const { theme } = useTheme()
  const { addTemplate, updateElement, setTemplateBackground, setTemplateLogo, setTemplateLogoStyle } = useStore()
  const slide = slides[current]

  // Cria templates Konva para cada slide
  useEffect(() => {
    if (!templateId) return
    const def = templateRegistry.find(d => d.id === templateId)
    if (!def) return
    const variants = def.getVariants(theme)
    const base = variants.find(v => v.id.endsWith('-4x5')) ?? variants[0]

    slides.forEach((slide, i) => {
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
                slides.forEach((_, i) => {
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

  function handleCopyCaption() {
    navigator.clipboard.writeText(caption)
    setCopiedCaption(true)
    setTimeout(() => setCopiedCaption(false), 2000)
  }

  async function handleDownloadAll() {
    setExporting(true)
    // Aguarda todos os stages estarem prontos
    await new Promise(r => setTimeout(r, 800))
    for (let i = 0; i < slides.length; i++) {
      const stage = stageRefs.current[i]
      if (!stage) {
        console.warn(`[carousel] stage ${i} não encontrado`)
        continue
      }
      const templateStore = useStore.getState().templates.find(t => t.id === `carousel-slide-${i}`)
      if (!templateStore) continue
      const autoScale = calcAutoScale(templateStore)
      const pixelRatio = 2 / autoScale
      exportToPng(stage, `${buildFileName(`slide-${i + 1}`, '2x')}.png`, { pixelRatio })
      await new Promise(r => setTimeout(r, 600))
    }
    setExporting(false)
  }

  async function handleDownloadCurrent() {
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

  const slideTemplateId = `carousel-slide-${current}`
  const slideTemplate = useStore.getState().templates.find(t => t.id === slideTemplateId)

  if (!slideTemplate) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Erro ao carregar slide.</p>
      </div>
    )
  }

  const canvasScale = Math.min(500 / slideTemplate.width, 600 / slideTemplate.height)

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
            Carrossel — {slides.length} slides
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
      <div style={{
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
            onSelectElement={() => {}}
            editingElementId={null}
            onEditStart={() => {}}
          />
        </div>
        {/* Slides ocultos renderizados fora da tela para export */}
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
          {slides.map((_, i) => {
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
          <button onClick={() => setCurrent(c => c - 1)} style={{
            position: 'absolute', left: '12px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
        )}
        {current < slides.length - 1 && (
          <button onClick={() => setCurrent(c => c + 1)} style={{
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
        {slides.map((s, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
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
      </div>
    </div>
  )
}
