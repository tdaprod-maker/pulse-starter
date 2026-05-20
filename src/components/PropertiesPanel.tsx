import { useState, useRef, useEffect } from 'react'
import type { CanvasElement, Template } from '../state/useStore'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { loadBrandConfig } from '../services/brandKit'
import { supabase } from '../lib/supabase'

const LABEL_MAP: Record<string, string> = {
  title: 'Título', subtitle: 'Subtítulo', line1: 'Linha 1', line2: 'Linha 2',
  phrase: 'Frase', number: 'Número', caption: 'Legenda', label: 'Rótulo', body: 'Corpo',
  tag: 'Tag', cat: 'Categoria', dish: 'Prato', price: 'Preço', cta: 'CTA',
  brand: 'Marca', category: 'Categoria', symbol: 'Símbolo',
}

const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Public Sans, sans-serif', label: 'Public Sans' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Lora, serif', label: 'Lora' },
  { value: 'Oswald, sans-serif', label: 'Oswald' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: 'Bebas Neue, cursive', label: 'Bebas Neue' },
]

const EMOJIS = ['🚀','⚡','🎯','💡','🔥','✅','📈','🏆','💎','🌟','👑','💪','🤝','🎉','📊','🧠','⭐','🙌','👏','💰']

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

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function ColorSwatch({ color, onChange, title }: { color: string; onChange: (hex: string) => void; title?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={() => inputRef.current?.click()}
      title={title}
      style={{
        width: '28px', height: '28px', borderRadius: '8px',
        background: color, border: '2px solid rgba(255,255,255,0.12)',
        cursor: 'pointer', flexShrink: 0, position: 'relative',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        transition: 'transform 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
    >
      <input ref={inputRef} type="color" value={color} onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0, width: '28px', height: '28px', cursor: 'pointer', border: 'none', padding: 0 }} />
    </div>
  )
}

function EmojiPicker({ onSelect }: { onSelect: (e: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: '5px', opacity: 0.6, transition: 'opacity 0.15s' }}
        title="Inserir emoji"
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'}
      >
        😊
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, zIndex: 99,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '8px',
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => { onSelect(e); setOpen(false) }}
              style={{ fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '6px' }}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Painel de edição de texto ────────────────────────────────────────────────

function TextFieldPanel({ el, templateId }: { el: CanvasElement; templateId: string }) {
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()
  const textRef = useRef<HTMLTextAreaElement>(null)

  const text       = (el.props.text       as string) ?? ''
  const fontSize   = (el.props.fontSize   as number) ?? 40
  const fontFamily = (el.props.fontFamily as string) ?? 'Inter, sans-serif'
  const fill       = (el.props.fill       as string) ?? '#FFFFFF'
  const hasBg      = !!(el.props.textBackground)

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <EmojiPicker onSelect={(emoji) => {
          handleText({ target: { value: text + emoji } } as React.ChangeEvent<HTMLTextAreaElement>)
        }} />
      </div>

      {/* Textarea */}
      <textarea
        ref={textRef} value={text} rows={1} onChange={handleText}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)' }}
        spellCheck={false}
        style={{
          width: '100%', background: 'var(--bg-base)',
          border: '1px solid var(--border)', borderRadius: '10px',
          color: 'var(--text-primary)', fontSize: '14px',
          padding: '10px 12px', fontFamily: 'inherit',
          resize: 'none', outline: 'none', lineHeight: 1.5,
          boxSizing: 'border-box', transition: 'border-color 0.15s',
        }}
      />

      {/* Fonte */}
      <div>
        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', letterSpacing: '0.06em' }}>FONTE</label>
        <select value={fontFamily}
          onChange={(e) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fontFamily: e.target.value }) }}
          style={{
            width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px',
            padding: '7px 10px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
          }}>
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Tamanho + Cor */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', letterSpacing: '0.06em' }}>TAMANHO</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => handleFontSize(fontSize - 4)}
              style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              A-
            </button>
            <input type="number" min={8} max={300} step={2} value={fontSize}
              onChange={(e) => handleFontSize(Number(e.target.value))}
              style={{ width: '48px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-primary)', fontSize: '12px', padding: '4px 6px', textAlign: 'center', fontFamily: 'inherit', outline: 'none' }}
            />
            <button onClick={() => handleFontSize(fontSize + 4)}
              style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              A+
            </button>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', letterSpacing: '0.06em' }}>COR</label>
          <ColorSwatch color={fill}
            onChange={(hex) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fill: hex }) }}
            title="Cor do texto"
          />
        </div>
      </div>

      {/* Fundo de texto */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fundo no texto</span>
        <button
          onClick={() => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { textBackground: !hasBg }) }}
          style={{
            padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px',
            fontFamily: 'inherit', fontWeight: 600, border: 'none', transition: 'all 0.15s',
            background: hasBg ? 'var(--accent)' : 'var(--bg-base)',
            color: hasBg ? 'white' : 'var(--text-muted)',
            outline: hasBg ? 'none' : '1px solid var(--border)',
          }}>
          {hasBg ? 'Ativo' : 'Inativo'}
        </button>
      </div>
    </div>
  )
}

// ─── Painel de edição de shape ───────────────────────────────────────────────

function ShapeFieldPanel({ el, templateId }: { el: CanvasElement; templateId: string }) {
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()

  const fill   = (el.props.fill as string) ?? '#3A5AFF'
  const width  = el.width
  const height = el.height

  const SHAPE_LABELS: Record<string, string> = {
    'accent-line':  'Linha de destaque',
    'tag-line':     'Linha da tag',
    'divider':      'Divisor',
    'brand-line':   'Linha da marca',
    'accent-bar':   'Barra de destaque',
    'accent-strip': 'Faixa de destaque',
    'circle-bg':    'Círculo',
    'top-block':    'Bloco superior',
    'line-left':    'Linha lateral',
    'line-left2':   'Linha lateral 2',
    'highlight-line':'Linha de destaque',
    'cta-line':     'Linha CTA',
    'accent-dot':   'Ponto de destaque',
  }
  const label = SHAPE_LABELS[el.id] ?? el.id

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </span>

      {/* Cor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cor</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fill.toUpperCase()}</span>
          <ColorSwatch color={fill}
            onChange={(hex) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fill: hex }) }}
            title="Cor do elemento"
          />
        </div>
      </div>

      {/* Largura */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Largura</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{width}px</span>
        </div>
        <input type="range" min={10} max={500} step={5} value={width}
          onChange={(e) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { width: Number(e.target.value) } as never) }}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      {/* Altura */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Espessura</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{height}px</span>
        </div>
        <input type="range" min={1} max={40} step={1} value={height}
          onChange={(e) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { height: Number(e.target.value) } as never) }}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}

// ─── Estado vazio ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px 16px', opacity: 0.4 }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="17" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="4" y="17" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="17" y="17" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
        Clique em um elemento<br/>no canvas para editar
      </p>
    </div>
  )
}

// ─── Seção de destaque ────────────────────────────────────────────────────────

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cor de destaque</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fill.toUpperCase()}</span>
        <ColorSwatch color={fill} onChange={handleColor} title="Cor de destaque" />
      </div>
    </div>
  )
}

function ShapeSection({ template }: { template: Template }) {
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()
  const el = template.elements.find((e) => e.id === 'brand-line')
  if (!el) return null
  const width    = el.width
  const rotation = (el.props.rotation as number) ?? 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Elemento decorativo</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Largura</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{width}px</span>
        </div>
        <input type="range" min={40} max={300} step={10} value={width}
          onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { width: Number(e.target.value) } as never) }}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rotação</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{rotation}°</span>
        </div>
        <input type="range" min={-45} max={45} step={1} value={rotation}
          onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { rotation: Number(e.target.value) }) }}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
      </div>
    </div>
  )
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
    templates.filter((t) => t.id.startsWith(prefix)).forEach((t) => setTemplateSolidBackground(t.id, hex))
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cor de fundo</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{color.toUpperCase()}</span>
        <ColorSwatch color={color} onChange={handleColor} title="Cor de fundo" />
      </div>
    </div>
  )
}

// ─── Fundo genérico ──────────────────────────────────────────────────────────────

function GenericBackgroundSection({ template }: { template: Template }) {
  const { setTemplateSolidBackground, templates } = useStore()
  const ensureSiblings = useEnsureSiblings()

  const isTechMinimal = template.id.startsWith('tech-minimal')
  const isBigNumber   = template.id.startsWith('big-number')
  if (isTechMinimal || isBigNumber) return null

  const color = template.background ?? '#ffffff'

  function handleColor(hex: string) {
    ensureSiblings(template.id)
    const lastHyphen = template.id.lastIndexOf('-')
    const prefix = lastHyphen >= 0 ? template.id.substring(0, lastHyphen) : template.id
    templates
      .filter((t) => t.id.startsWith(prefix))
      .forEach((t) => setTemplateSolidBackground(t.id, hex))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cor de fundo</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{color.toUpperCase()}</span>
        <ColorSwatch color={color} onChange={handleColor} title="Cor de fundo" />
      </div>
    </div>
  )
}

// ─── Painel principal ─────────────────────────────────────────────────────────

export function PropertiesPanel({ template, selectedElementId }: { template: Template; selectedElementId?: string | null }) {
  const textEls = template.elements.filter((el) => el.type === 'text')
  if (textEls.length === 0) return null

  const selectedEl = selectedElementId
    ? template.elements.find((el) => el.id === selectedElementId)
    : null

  const hasAccent = !!getAccentElementId(template.id)
  const hasShape = template.elements.some((e) => e.id === 'brand-line')
  const hasSolidBg = template.id.startsWith('tech-minimal') || template.id.startsWith('big-number')
  const hasGlobalControls = hasAccent || hasShape || hasSolidBg || true

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)' }}>

      {/* Área de edição do elemento selecionado */}
      {selectedEl && selectedEl.type === 'text' ? (
        <div style={{ padding: '16px', borderBottom: hasGlobalControls ? '1px solid var(--border)' : 'none' }}>
          <TextFieldPanel el={selectedEl} templateId={template.id} />
        </div>
      ) : selectedEl && selectedEl.type === 'shape' ? (
        <div style={{ padding: '16px', borderBottom: hasGlobalControls ? '1px solid var(--border)' : 'none' }}>
          <ShapeFieldPanel el={selectedEl} templateId={template.id} />
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Controles globais do template — sempre visíveis */}
      {hasGlobalControls && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <GenericBackgroundSection template={template} />
          <AccentSection template={template} />
          <ShapeSection template={template} />
          <SolidBackgroundSection template={template} />
        </div>
      )}
    </div>
  )
}
