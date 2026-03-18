import { useRef, useState } from 'react'
import type { Template } from '../state/useStore'
import { useStore } from '../state/useStore'
import { generateImage } from '../services/replicate'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { LogoSection } from './LogoSection'

interface ImagePanelProps {
  template: Template
}

const ALIGN_OPTIONS: { value: 'top' | 'center' | 'bottom'; label: string }[] = [
  { value: 'top',    label: 'Topo'   },
  { value: 'center', label: 'Centro' },
  { value: 'bottom', label: 'Baixo'  },
]

export function ImagePanel({ template }: ImagePanelProps) {
  const { setTemplateBackground, setTemplateImageStyle, setTemplateImageOffset } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [regenerating, setRegenerating] = useState(false)
  const { theme } = useTheme()

  async function handleNewImage() {
    if (!template.imagePrompt || regenerating) return
    setRegenerating(true)
    try {
      const url = await generateImage(template.imagePrompt)
      setTemplateBackground(template.id, url)
      const templateBase = templateRegistry.find(d => template.id.startsWith(d.id))
      if (templateBase) {
        templateBase.getVariants(theme).forEach(v => {
          if (v.id !== template.id) setTemplateBackground(v.id, url)
        })
      }
    } finally {
      setRegenerating(false)
    }
  }

  const zoom    = template.backgroundZoom    ?? 100
  const align   = template.backgroundAlign   ?? 'center'
  const offsetX = template.backgroundOffsetX ?? 0
  const offsetY = template.backgroundOffsetY ?? 0
  const hasOffset = offsetX !== 0 || offsetY !== 0

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') setTemplateBackground(template.id, result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleRemove() {
    setTemplateBackground(template.id, null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
        Imagem
      </h3>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {template.backgroundImage ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Thumbnail */}
          <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', aspectRatio: '1' }}>
            <img
              src={template.backgroundImage}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                objectPosition:  `center ${align}`,
                transform:       `scale(${zoom / 100})`,
                transformOrigin: `center ${align}`,
              }}
              alt="Imagem de fundo"
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          </div>

          {/* Hint interação direta */}
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5, userSelect: 'none', margin: 0 }}>
            Arraste a imagem no canvas para reposicionar. Use o scroll do mouse para dar zoom.
          </p>

          {/* Zoom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', userSelect: 'none' }}>Zoom</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{zoom}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={zoom}
              onChange={(e) => setTemplateImageStyle(template.id, Number(e.target.value), undefined)}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          {/* Alinhamento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', userSelect: 'none' }}>Alinhamento</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {ALIGN_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTemplateImageStyle(template.id, undefined, value)}
                  style={align === value
                    ? { flex: 1, fontSize: '12px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white', fontFamily: 'inherit', fontWeight: 500 }
                    : { flex: 1, fontSize: '12px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'inherit', transition: 'all 0.15s' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset posição */}
          {hasOffset && (
            <button
              onClick={() => setTemplateImageOffset(template.id, 0, 0)}
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s' }}
            >
              Resetar posição
            </button>
          )}

          {/* Nova imagem via IA */}
          {template.imagePrompt && (
            <button
              onClick={handleNewImage}
              disabled={regenerating}
              style={{ width: '100%', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', cursor: regenerating ? 'default' : 'pointer', background: 'var(--accent)', border: '1px solid transparent', color: 'white', fontFamily: 'inherit', transition: 'all 0.15s', opacity: regenerating ? 0.5 : 1 }}
            >
              {regenerating ? 'Buscando...' : 'Nova imagem'}
            </button>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => inputRef.current?.click()}
              style={{ flex: 1, fontSize: '12px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s' }}
            >
              Trocar
            </button>
            <button
              onClick={handleRemove}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; e.currentTarget.style.color = 'rgb(239,68,68)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)' }}
              style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.6)', fontFamily: 'inherit', transition: 'all 0.15s' }}
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          style={{ width: '100%', padding: '20px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'inherit', transition: 'all 0.15s' }}
        >
          <UploadIcon />
          <span>Carregar imagem</span>
        </button>
      )}
      <LogoSection template={template} />
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 12V4M5.5 7l3.5-3.5L12.5 7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 14.5h14"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
