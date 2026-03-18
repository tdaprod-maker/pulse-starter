import { useEffect, useRef } from 'react'
import type { CanvasElement, Template } from '../state/useStore'
import { useStore } from '../state/useStore'

// ─── Constantes ───────────────────────────────────────────────────────────────

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

function getAccentElementId(templateId: string): string | null {
  if (templateId.startsWith('hero-title'))     return 'accent-bar'
  if (templateId.startsWith('editorial-card')) return 'accent-bar'
  if (templateId.startsWith('minimal-type'))   return 'phrase'
  if (templateId.startsWith('big-number'))     return 'number'
  if (templateId.startsWith('big-statement'))  return 'line2'
  return null
}

// ─── Color picker ─────────────────────────────────────────────────────────────

interface ColorPickerProps {
  color: string
  onChange: (hex: string) => void
  title?: string
}

function ColorPicker({ color, onChange, title = 'Cor' }: ColorPickerProps) {
  return (
    <label
      title={title}
      style={{ position: 'relative', flexShrink: 0, width: '18px', height: '18px', borderRadius: '4px', cursor: 'pointer', overflow: 'hidden', border: '1px solid var(--border-active)' }}
    >
      <div style={{ width: '100%', height: '100%', background: color }} />
      <input
        type="color"
        value={color.startsWith('#') && color.length === 7 ? color : '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', padding: 0, border: 0 }}
      />
    </label>
  )
}

// ─── Campo de texto com cor e fonte individuais ───────────────────────────────

interface TextFieldProps {
  el: CanvasElement
  templateId: string
}

function TextField({ el, templateId }: TextFieldProps) {
  const { updateElement, syncElementStyle } = useStore()
  const textRef = useRef<HTMLTextAreaElement>(null)

  const text       = (el.props.text       as string) ?? ''
  const fill       = (el.props.fill       as string) ?? '#ffffff'
  const fontFamily = (el.props.fontFamily as string) ?? 'Inter, sans-serif'
  const fontSize   = (el.props.fontSize   as number) ?? 24

  useEffect(() => {
    const ta = textRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [text])

  function handleText(e: React.ChangeEvent<HTMLTextAreaElement>) {
    updateElement(templateId, el.id, { props: { ...el.props, text: e.target.value } })
  }

  function handleColor(hex: string) {
    syncElementStyle(templateId, el.id, { fill: hex })
  }

  function handleFont(e: React.ChangeEvent<HTMLSelectElement>) {
    syncElementStyle(templateId, el.id, { fontFamily: e.target.value })
  }

  function handleFontSize(value: number) {
    const clamped = Math.min(300, Math.max(8, value))
    syncElementStyle(templateId, el.id, { fontSize: clamped })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Linha: rótulo + cor + fonte */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', userSelect: 'none' }}>
          {LABEL_MAP[el.id] ?? el.id}
        </span>
        <ColorPicker color={fill} onChange={handleColor} title="Cor do texto" />
        <select
          value={fontFamily}
          onChange={handleFont}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '11px', padding: '2px 4px', fontFamily: 'inherit', flex: 1 }}
        >
          {FONTS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tamanho de fonte */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', userSelect: 'none' }}>Tamanho</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => handleFontSize(fontSize - 4)}
            style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            A-
          </button>
          <input
            type="number"
            min={8}
            max={300}
            step={2}
            value={fontSize}
            onChange={(e) => handleFontSize(Number(e.target.value))}
            style={{ width: '52px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-primary)', fontSize: '12px', padding: '2px 4px', textAlign: 'center', fontFamily: 'inherit' }}
          />
          <button
            onClick={() => handleFontSize(fontSize + 4)}
            style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            A+
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textRef}
        value={text}
        rows={1}
        onChange={handleText}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)' }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)' }}
        spellCheck={false}
        style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 10px', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5 }}
      />
    </div>
  )
}

// ─── Seção destaque ───────────────────────────────────────────────────────────

function AccentSection({ template }: { template: Template }) {
  const { updateElement } = useStore()

  const accentId = getAccentElementId(template.id)
  if (!accentId) return null

  const accentEl = template.elements.find((e) => e.id === accentId)
  if (!accentEl) return null

  const fill = (accentEl.props.fill as string) ?? '#3A5AFF'

  function handleColor(hex: string) {
    updateElement(template.id, accentId!, { props: { ...accentEl!.props, fill: hex } })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', flex: 1, userSelect: 'none' }}>
        Cor de destaque
      </span>
      <ColorPicker color={fill} onChange={handleColor} title="Cor de destaque" />
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{fill}</span>
    </div>
  )
}

// ─── Painel de propriedades ───────────────────────────────────────────────────

export function PropertiesPanel({ template }: { template: Template }) {
  const textEls = template.elements.filter((el) => el.type === 'text')
  if (textEls.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
        Textos
      </h3>

      {textEls.map((el) => (
        <TextField key={`${template.id}-${el.id}`} el={el} templateId={template.id} />
      ))}

      <AccentSection template={template} />
    </div>
  )
}
