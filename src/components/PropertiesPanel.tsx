import { useState, useRef, useEffect } from 'react'
import type { CanvasElement, Template } from '../state/useStore'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { loadBrandConfig } from '../services/brandKit'
import { supabase } from '../lib/supabase'

const LABEL_MAP: Record<string, string> = {
  title:    'Título',
  subtitle: 'Subtítulo',
  line1:    'Linha 1',
  line2:    'Linha 2',
  phrase:   'Frase',
  number:   'Número',
  caption:  'Legenda',
  label:    'Rótulo',
  body:     'Corpo',
}

const FONTS = [
  { value: 'Inter, sans-serif',         label: 'Inter'            },
  { value: 'Public Sans, sans-serif',   label: 'Public Sans'      },
  { value: 'Poppins, sans-serif',       label: 'Poppins'          },
  { value: 'Playfair Display, serif',   label: 'Playfair Display' },
  { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk'    },
  { value: 'Montserrat, sans-serif',    label: 'Montserrat'       },
  { value: 'Lora, serif',               label: 'Lora'             },
  { value: 'Oswald, sans-serif',        label: 'Oswald'           },
  { value: 'Raleway, sans-serif',       label: 'Raleway'          },
  { value: 'Bebas Neue, cursive',       label: 'Bebas Neue'       },
]

function useEnsureSiblings() {
  const { addTemplate, templates } = useStore()
  const { theme } = useTheme()
  return function ensureSiblings(templateId: string) {
    const lastHyphen = templateId.lastIndexOf('-')
    const prefix = lastHyphen >= 0 ? templateId.substring(0, lastHyphen) : templateId
    const def = templateRegistry.find((d) => d.id === prefix)
    if (!def) return
    def.getVariants(theme).forEach((v) => {
      if (!templates.find((t) => t.id === v.id)) addTemplate(v)
    })
  }
}

function getAccentElementId(templateId: string): string | null {
  if (templateId.startsWith('hero-title'))     return 'accent-bar'
  if (templateId.startsWith('editorial-card')) return 'accent-bar'
  if (templateId.startsWith('big-number'))     return 'number'
  if (templateId.startsWith('big-statement'))  return 'line2'
  if (templateId.startsWith('tech-news'))      return 'brand-line'
  if (templateId.startsWith('tech-statement')) return 'brand-line'
  return null
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({ color, onChange, title }: { color: string; onChange: (hex: string) => void; title?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={() => inputRef.current?.click()}
      title={title}
      style={{
        width: '22px', height: '22px', borderRadius: '6px',
        background: color, border: '2px solid rgba(255,255,255,0.15)',
        cursor: 'pointer', flexShrink: 0, position: 'relative',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}
    >
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
    </div>
  )
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────

const EMOJIS = ['🚀','⚡','🎯','💡','🔥','✅','📈','🏆','💎','🌟','👑','💪','🤝','🎉','📊','🧠','⭐','🙌','👏','💰']

function EmojiPicker({ onSelect }: { onSelect: (e: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', opacity: 0.7 }}
        title="Inserir emoji"
      >
        😊
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, zIndex: 99,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px',
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => { onSelect(e); setOpen(false) }}
              style={{ fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TextField com card colapsável ────────────────────────────────────────────

function TextField({ el, templateId, defaultExpanded = false }: { el: CanvasElement; templateId: string; defaultExpanded?: boolean }) {
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [expanded, setExpanded] = useState(defaultExpanded)

  const text     = (el.props.text     as string) ?? ''
  const fontSize = (el.props.fontSize as number) ?? 40
  const fontFamily = (el.props.fontFamily as string) ?? 'Inter, sans-serif'
  const fill     = (el.props.fill     as string) ?? '#FFFFFF'

  function handleText(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    ensureSiblings(templateId)
    syncElementStyle(templateId, el.id, { text: v })
    const ta = textRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
  }

  useEffect(() => {
    const ta = textRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
  }, [text])

  function handleFontSize(v: number) {
    ensureSiblings(templateId)
    syncElementStyle(templateId, el.id, { fontSize: Math.max(8, Math.min(300, v)) })
  }

  const label = LABEL_MAP[el.id] ?? el.id

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      {/* Header do card — sempre visível */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <EmojiPicker onSelect={(emoji) => {
              const newText = text + emoji
              handleText({ target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>)
            }} />
            <button
              onClick={() => setExpanded(e => !e)}
              title={expanded ? 'Ocultar opções' : 'Mais opções'}
              style={{
                background: expanded ? 'rgba(58,90,255,0.15)' : 'transparent',
                border: `1px solid ${expanded ? 'rgba(58,90,255,0.4)' : 'var(--border)'}`,
                borderRadius: '6px', padding: '3px 7px', cursor: 'pointer',
                color: expanded ? 'var(--accent)' : 'var(--text-muted)', fontSize: '11px',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
        <textarea
          ref={textRef}
          value={text}
          rows={1}
          onChange={handleText}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)' }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = 'transparent' }}
          spellCheck={false}
          style={{
            width: '100%', background: 'transparent',
            border: '1px solid transparent', borderRadius: '6px',
            color: 'var(--text-primary)', fontSize: '13px',
            padding: '4px 0', fontFamily: 'inherit',
            resize: 'none', outline: 'none', lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Opções avançadas — colapsáveis */}
      {expanded && (
        <div style={{
          padding: '10px 12px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '10px',
          background: 'rgba(0,0,0,0.15)',
        }}>
          {/* Fonte */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '40px', flexShrink: 0 }}>Fonte</span>
            <select
              value={fontFamily}
              onChange={(e) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fontFamily: e.target.value }) }}
              style={{
                flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text-primary)', fontSize: '11px',
                padding: '4px 6px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
              }}
            >
              {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* Tamanho + Cor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '40px', flexShrink: 0 }}>Tam.</span>
            <button onClick={() => handleFontSize(fontSize - 4)} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>A-</button>
            <input
              type="number" min={8} max={300} step={2} value={fontSize}
              onChange={(e) => handleFontSize(Number(e.target.value))}
              style={{ width: '48px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-primary)', fontSize: '11px', padding: '2px 4px', textAlign: 'center', fontFamily: 'inherit' }}
            />
            <button onClick={() => handleFontSize(fontSize + 4)} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>A+</button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cor</span>
            <ColorPicker
              color={fill}
              onChange={(hex) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fill: hex }) }}
              title="Cor do texto"
            />
          </div>

          {/* Fundo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '40px', flexShrink: 0 }}>Fundo</span>
            <button
              onClick={() => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { textBackground: !el.props.textBackground }) }}
              style={{
                fontSize: '10px', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'inherit',
                background: el.props.textBackground ? 'rgba(58,90,255,0.15)' : 'var(--bg-base)',
                border: `1px solid ${el.props.textBackground ? 'rgba(58,90,255,0.4)' : 'var(--border)'}`,
                color: el.props.textBackground ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {el.props.textBackground ? 'Ativo' : 'Inativo'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Seção destaque ───────────────────────────────────────────────────────────

function AccentSection({ template }: { template: Template }) {
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()

  const accentId = getAccentElementId(template.id)
  if (!accentId) return null

  const accentEl = template.elements.find((e) => e.id === accentId)
  if (!accentEl) return null

  const fill = (accentEl.props.fill as string) ?? '#3A5AFF'

  function handleColor(hex: string) {
    ensureSiblings(template.id)
    syncElementStyle(template.id, accentId!, { fill: hex })
    if (template.id.startsWith('editorial-card')) {
      syncElementStyle(template.id, 'title-vert-accent', { fill: hex })
      syncElementStyle(template.id, 'title-rule', { fill: hex })
    }
  }

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1 }}>
        Cor de destaque
      </span>
      <ColorPicker color={fill} onChange={handleColor} title="Cor de destaque" />
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{fill}</span>
    </div>
  )
}

// ─── Seção shape ──────────────────────────────────────────────────────────────

function ShapeSection({ template }: { template: Template }) {
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()

  const el = template.elements.find((e) => e.id === 'brand-line')
  if (!el) return null

  const width    = el.width
  const rotation = (el.props.rotation as number) ?? 0

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Elemento decorativo
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Largura</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{width}px</span>
        </div>
        <input type="range" min={40} max={300} step={10} value={width}
          onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { width: Number(e.target.value) } as never) }}
          style={{ width: '100%', accentColor: 'var(--color-primary)' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rotação</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{rotation}°</span>
        </div>
        <input type="range" min={-45} max={45} step={1} value={rotation}
          onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { rotation: Number(e.target.value) }) }}
          style={{ width: '100%', accentColor: 'var(--color-primary)' }}
        />
      </div>
    </div>
  )
}

// ─── Fundo sólido ─────────────────────────────────────────────────────────────

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function SolidBackgroundSection({ template }: { template: Template }) {
  const { setTemplateSolidBackground, templates, syncElementStyle, setTemplateLogo } = useStore()
  const ensureSiblings = useEnsureSiblings()
  const { theme } = useTheme()

  const isTechMinimal = template.id.startsWith('tech-minimal')
  const isBigNumber   = template.id.startsWith('big-number')
  if (!isTechMinimal && !isBigNumber) return null

  const color = template.background ?? '#000000'

  function handleColor(hex: string) {
    ensureSiblings(template.id)
    const lastHyphen = template.id.lastIndexOf('-')
    const prefix = lastHyphen >= 0 ? template.id.substring(0, lastHyphen) : template.id
    templates
      .filter((t) => t.id.startsWith(prefix))
      .forEach((t) => setTemplateSolidBackground(t.id, hex))
    const luminance = hexLuminance(hex)
    const textFill = luminance > 128 ? '#000000' : '#FFFFFF'
    if (isBigNumber) {
      syncElementStyle(template.id, 'number', { fill: textFill })
      syncElementStyle(template.id, 'caption', { fill: textFill })
    } else {
      syncElementStyle(template.id, 'phrase', { fill: textFill })
    }
    const isLight = luminance > 128
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      if (!email) return
      loadBrandConfig(email).then(config => {
        const logos = config.logos ?? []
        const targetLogo = isLight
          ? logos.find(l => l.label.toLowerCase().includes('black') || l.label.toLowerCase().includes('preto') || l.label.toLowerCase().includes('escuro'))
          : logos.find(l => !l.label.toLowerCase().includes('black') && !l.label.toLowerCase().includes('preto') && !l.label.toLowerCase().includes('escuro'))
        if (targetLogo) {
          const def = templateRegistry.find(d => template.id.startsWith(d.id))
          def?.getVariants(theme).forEach(v => setTemplateLogo(v.id, targetLogo.url))
        }
      })
    })
  }

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1 }}>
        Cor de fundo
      </span>
      <ColorPicker color={color} onChange={handleColor} title="Cor de fundo" />
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{color}</span>
    </div>
  )
}

// ─── Painel principal ─────────────────────────────────────────────────────────

export function PropertiesPanel({ template, selectedElementId }: { template: Template; selectedElementId?: string | null }) {
  const allTextEls = template.elements.filter((el) => el.type === 'text')
  if (allTextEls.length === 0) return null

  const selectedEl = selectedElementId
    ? template.elements.find((el) => el.id === selectedElementId)
    : null

  const showAll = !selectedEl

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
      {!selectedEl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '16px 0', opacity: 0.5 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Clique em um elemento<br/>no canvas para editar
          </p>
        </div>
      )}

      {selectedEl && selectedEl.type === 'text' && (
        <>
          <h3 style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px' }}>
            Editando elemento
          </h3>
          <TextField key={`${template.id}-${selectedEl.id}`} el={selectedEl} templateId={template.id} defaultExpanded />
        </>
      )}

      {showAll && (
        <>
          <h3 style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px' }}>
            Todos os textos
          </h3>
          {allTextEls.map((el) => (
            <TextField key={`${template.id}-${el.id}`} el={el} templateId={template.id} />
          ))}
        </>
      )}

      <AccentSection template={template} />
      <ShapeSection template={template} />
      <SolidBackgroundSection template={template} />
    </div>
  )
}
