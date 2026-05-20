import { useState } from 'react'
import type { CarouselSlide } from '../services/gemini'

type SlideWithImage = CarouselSlide & { imageUrl: string }

interface CarouselViewerProps {
  slides: SlideWithImage[]
  caption: string
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

export function CarouselViewer({ slides, caption, onClose }: CarouselViewerProps) {
  const [current, setCurrent] = useState(0)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const slide = slides[current]

  function handleCopyCaption() {
    navigator.clipboard.writeText(caption)
    setCopiedCaption(true)
    setTimeout(() => setCopiedCaption(false), 2000)
  }

  async function handleDownloadAll() {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      if (!slide.imageUrl) continue
      try {
        const res = await fetch(slide.imageUrl)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `slide-${i + 1}.png`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 400))
      } catch {
        const a = document.createElement('a')
        a.href = slide.imageUrl
        a.download = `slide-${i + 1}.png`
        a.target = '_blank'
        a.click()
      }
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-base)', overflow: 'hidden',
    }}>
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
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '20px', lineHeight: 1,
          }}
        >×</button>
      </div>

      {/* Slide preview */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', overflow: 'hidden', position: 'relative',
      }}>
        {/* Slide card */}
        <div style={{
          position: 'relative', borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(91,143,212,0.2), 0 24px 80px rgba(0,0,0,0.5)',
          aspectRatio: '4/5', height: 'min(70vh, 560px)',
          background: '#111',
        }}>
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {/* Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.3) 100%)',
          }} />
          {/* Texto */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '32px 28px',
          }}>
            <p style={{
              fontSize: '28px', fontWeight: 700, color: '#fff',
              margin: '0 0 12px', lineHeight: 1.2,
            }}>{slide.title}</p>
            {slide.body && (
              <p style={{
                fontSize: '16px', color: 'rgba(255,255,255,0.8)',
                margin: 0, lineHeight: 1.5,
              }}>{slide.body}</p>
            )}
          </div>
          {/* Número do slide */}
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(0,0,0,0.6)', borderRadius: '20px',
            padding: '4px 10px', fontSize: '12px', fontWeight: 600, color: '#fff',
          }}>
            {current + 1} / {slides.length}
          </div>
        </div>

        {/* Navegação */}
        {current > 0 && (
          <button
            onClick={() => setCurrent(c => c - 1)}
            style={{
              position: 'absolute', left: '12px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >‹</button>
        )}
        {current < slides.length - 1 && (
          <button
            onClick={() => setCurrent(c => c + 1)}
            style={{
              position: 'absolute', right: '12px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >›</button>
        )}
      </div>

      {/* Miniaturas */}
      <div style={{
        display: 'flex', gap: '8px', padding: '0 20px 16px',
        overflowX: 'auto', flexShrink: 0, justifyContent: 'center',
      }}>
        {slides.map((s, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: '56px', height: '70px', borderRadius: '6px', overflow: 'hidden',
              cursor: 'pointer', flexShrink: 0, position: 'relative',
              border: i === current ? '2px solid var(--accent)' : '2px solid transparent',
              background: '#111',
            }}
          >
            {s.imageUrl && (
              <img src={s.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.4)',
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
            <button
              onClick={handleCopyCaption}
              style={{
                width: '100%', padding: '9px', borderRadius: '8px', cursor: 'pointer',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit',
              }}
            >
              {copiedCaption ? 'Legenda copiada!' : 'Copiar legenda'}
            </button>
          </div>
        )}
        <button
          onClick={handleDownloadAll}
          style={{
            width: '100%', padding: '11px', borderRadius: '8px', cursor: 'pointer',
            background: '#3A5AFF', border: 'none', color: '#fff',
            fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          Baixar todos os slides
        </button>
      </div>
    </div>
  )
}
