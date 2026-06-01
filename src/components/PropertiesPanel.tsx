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
  { value: 'Playfair Display, serif', label: 'Playfair' },
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
      title={title ?? color.toUpperCase()}
      style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: color, border: '2px solid rgba(255,255,255,0.12)',
        cursor: 'pointer', flexShrink: 0, position: 'relative',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        transition: 'transform 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
    >
      <input ref={inputRef} type="color" value={color} onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0, width: '32px', height: '32px', cursor: 'pointer', border: 'none', padding: 0 }} />
    </div>
  )
}

function EmojiPicker({ onSelect }: { onSelect: (e: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px', opacity: 0.55, transition: 'opacity 0.15s' }}
        title="Inserir emoji"
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.55'}
      >
        😊
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', right: 0, zIndex: 99,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Label + emoji picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <EmojiPicker onSelect={(emoji) => {
          handleText({ target: { value: text + emoji } } as React.ChangeEvent<HTMLTextAreaElement>)
        }} />
      </div>

      {/* Textarea auto-grow */}
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

      {/* Linha única: fonte + tamanho + toggle fundo + cor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Font select compacto */}
        <select
          value={fontFamily}
          onChange={(e) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fontFamily: e.target.value }) }}
          style={{
            flex: 1, minWidth: 0,
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text-primary)', fontSize: '11px',
            padding: '6px 8px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
          }}
        >
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Tamanho — só input numérico */}
        <input
          type="number" min={8} max={300} step={2} value={fontSize}
          onChange={(e) => handleFontSize(Number(e.target.value))}
          title="Tamanho da fonte"
          style={{
            width: '48px', flexShrink: 0,
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px',
            padding: '6px 4px', textAlign: 'center', fontFamily: 'inherit', outline: 'none',
          }}
        />

        {/* Toggle fundo de texto — ícone T */}
        <button
          onClick={() => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { textBackground: !hasBg }) }}
          title={hasBg ? 'Remover fundo do texto' : 'Adicionar fundo ao texto'}
          style={{
            width: '32px', height: '32px', flexShrink: 0,
            borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
            fontFamily: 'serif', border: 'none', transition: 'all 0.15s',
            background: hasBg ? 'var(--accent)' : 'var(--bg-base)',
            color: hasBg ? 'white' : 'var(--text-muted)',
            outline: hasBg ? 'none' : '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          T
        </button>

        {/* Cor do texto */}
        <ColorSwatch
          color={fill}
          onChange={(hex) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fill: hex }) }}
          title={`Cor do texto: ${fill.toUpperCase()}`}
        />
      </div>
    </div>
  )
}

// ─── Painel de edição de shape (avançado) ────────────────────────────────────

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <ColorSwatch color={fill}
          onChange={(hex) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { fill: hex }) }}
          title={`Cor: ${fill.toUpperCase()}`}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Largura</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{width}px</span>
        </div>
        <input type="range" min={10} max={500} step={5} value={width}
          onChange={(e) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { width: Number(e.target.value) } as never) }}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Espessura</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{height}px</span>
        </div>
        <input type="range" min={1} max={40} step={1} value={height}
          onChange={(e) => { ensureSiblings(templateId); syncElementStyle(templateId, el.id, { height: Number(e.target.value) } as never) }}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}

// ─── Seção "Estilo do Post" — sempre visível no topo ─────────────────────────

function PostStyleSection({ template }: { template: Template }) {
  const { syncElementStyle, setTemplateSolidBackground, setTemplateLogo, templates } = useStore()
  const ensureSiblings = useEnsureSiblings()
  const { theme } = useTheme()

  const accentId = getAccentElementId(template.id)
  const accentEl = accentId ? template.elements.find((e) => e.id === accentId) : null
  const accentColor = (accentEl?.props.fill as string) ?? null

  const isTechMinimal = template.id.startsWith('tech-minimal')
  const isBigNumber   = template.id.startsWith('big-number')
  const bgColor = template.background ?? (isTechMinimal || isBigNumber ? '#000000' : '#ffffff')

  function handleAccentColor(hex: string) {
    if (!accentId) return
    ensureSiblings(template.id)
    syncElementStyle(template.id, accentId, { fill: hex })
    if (template.id.startsWith('editorial-card')) {
      syncElementStyle(template.id, 'title-vert-accent', { fill: hex })
      syncElementStyle(template.id, 'title-rule', { fill: hex })
    }
  }

  function handleBgColor(hex: string) {
    ensureSiblings(template.id)
    const lastHyphen = template.id.lastIndexOf('-')
    const prefix = lastHyphen >= 0 ? template.id.substring(0, lastHyphen) : template.id
    templates.filter((t) => t.id.startsWith(prefix)).forEach((t) => setTemplateSolidBackground(t.id, hex))

    if (isTechMinimal || isBigNumber) {
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
  }

  const hasAccent = accentColor !== null
  const hasBg = true // background always editable

  if (!hasAccent && !hasBg) return null

  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Estilo do Post
      </span>

      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Cor de fundo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <ColorSwatch
            color={bgColor}
            onChange={handleBgColor}
            title={`Cor de fundo: ${bgColor.toUpperCase()}`}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Fundo</span>
        </div>

        {/* Cor de destaque */}
        {hasAccent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <ColorSwatch
              color={accentColor!}
              onChange={handleAccentColor}
              title={`Cor de destaque: ${accentColor!.toUpperCase()}`}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Destaque</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Seção "Avançado" colapsável ─────────────────────────────────────────────

function AdvancedSection({ template }: { template: Template }) {
  const [open, setOpen] = useState(false)
  const { syncElementStyle } = useStore()
  const ensureSiblings = useEnsureSiblings()

  const el = template.elements.find((e) => e.id === 'brand-line')
  if (!el) return null

  const width    = el.width
  const rotation = (el.props.rotation as number) ?? 0

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'inherit',
          fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}
      >
        <span>Avançado</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Linha decorativa — largura</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{width}px</span>
            </div>
            <input type="range" min={40} max={300} step={10} value={width}
              onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { width: Number(e.target.value) } as never) }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rotação</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{rotation}°</span>
            </div>
            <input type="range" min={-45} max={45} step={1} value={rotation}
              onChange={(e) => { ensureSiblings(template.id); syncElementStyle(template.id, 'brand-line', { rotation: Number(e.target.value) }) }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
        </div>
      )}
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

  const hasAdvanced = template.elements.some((e) => e.id === 'brand-line')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)' }}>

      {/* Estilo do Post — sempre visível no topo */}
      <PostStyleSection template={template} />

      {/* Elemento selecionado */}
      {selectedEl && selectedEl.type === 'text' ? (
        <div style={{ padding: '14px 16px', borderBottom: hasAdvanced ? '1px solid var(--border)' : 'none' }}>
          <TextFieldPanel el={selectedEl} templateId={template.id} />
        </div>
      ) : selectedEl && selectedEl.type === 'shape' ? (
        <div style={{ padding: '14px 16px', borderBottom: hasAdvanced ? '1px solid var(--border)' : 'none' }}>
          <ShapeFieldPanel el={selectedEl} templateId={template.id} />
        </div>
      ) : (
        <div style={{ padding: '12px 16px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Clique num elemento do post para editar.
          </p>
        </div>
      )}

      {/* Avançado — colapsável */}
      {hasAdvanced && <AdvancedSection template={template} />}
    </div>
  )
}
