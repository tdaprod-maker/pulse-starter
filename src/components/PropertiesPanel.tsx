import { useEffect, useRef } from 'react'
import type { CanvasElement, Template } from '../state/useStore'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { loadBrandConfig } from '../services/brandKit'
import { supabase } from '../lib/supabase'

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
  if (templateId.startsWith('minimal-type'))   return 'phrase'
  if (templateId.startsWith('big-number'))     return 'number'
  if (templateId.startsWith('big-statement'))  return 'line2'
  if (templateId.startsWith('tech-news'))      return 'brand-line'
  if (templateId.startsWith('tech-statement')) return 'brand-line'
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
  const ensureSiblings = useEnsureSiblings()
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
    ensureSiblings(templateId)
    syncElementStyle(templateId, el.id, { fill: hex })
  }

  function handleFont(e: React.ChangeEvent<HTMLSelectElement>) {
    ensureSiblings(templateId)
    syncElementStyle(templateId, el.id, { fontFamily: e.target.value })
  }

  function handleFontSize(value: number) {
    const clamped = Math.min(300, Math.max(8, value))
    ensureSiblings(templateId)
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

      {/* Toggle fundo escuro */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', userSelect: 'none', flex: 1 }}>Fundo</span>
        <button
          onClick={() => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { textBackground: !el.props.textBackground }) }}
          style={{
            fontSize: '10px', padding: '1px 8px', borderRadius: '5px', cursor: 'pointer',
            fontFamily: 'inherit',
            background: el.props.textBackground ? 'rgba(58,90,255,0.15)' : 'transparent',
            border: `1px solid ${el.props.textBackground ? 'var(--color-primary)' : 'var(--border)'}`,
            color: el.props.textBackground ? 'var(--color-primary)' : 'var(--text-muted)',
          }}
        >
          {el.props.textBackground ? 'ON' : 'OFF'}
        </button>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', flex: 1, userSelect: 'none' }}>
        Cor de destaque
      </span>
      <ColorPicker color={fill} onChange={handleColor} title="Cor de destaque" />
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{fill}</span>
    </div>
  )
}

// ─── Seção shape (brand-line) ─────────────────────────────────────────────────

function ShapeSection({ template }: { template: Template }) {
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()

  const el = template.elements.find((e) => e.id === 'brand-line')
  if (!el) return null

  const width    = el.width
  const rotation = (el.props.rotation as number) ?? 0

  const sliderStyle: React.CSSProperties = {
    width: '100%', accentColor: 'var(--color-primary)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', userSelect: 'none' }}>Largura</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{width}px</span>
        </div>
        <input
          type="range" min={40} max={300} step={10}
          value={width}
          onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { width: Number(e.target.value) } as never) }}
          style={sliderStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', userSelect: 'none' }}>Rotação</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{rotation}°</span>
        </div>
        <input
          type="range" min={-45} max={45} step={1}
          value={rotation}
          onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { rotation: Number(e.target.value) }) }}
          style={sliderStyle}
        />
      </div>
    </div>
  )
}

// ─── Seção fundo sólido (tech-minimal) ───────────────────────────────────────

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

  if (!template.id.startsWith('tech-minimal')) return null

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
    syncElementStyle(template.id, 'phrase', { fill: textFill })
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', flex: 1, userSelect: 'none' }}>
        Cor de fundo
      </span>
      <ColorPicker color={color} onChange={handleColor} title="Cor de fundo" />
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{color}</span>
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
      <ShapeSection template={template} />
      <SolidBackgroundSection template={template} />
    </div>
  )
}
