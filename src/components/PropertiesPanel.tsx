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
      className="relative flex-shrink-0 w-5 h-5 rounded cursor-pointer overflow-hidden border border-gray-600 hover:border-gray-400 transition-colors"
    >
      <div className="w-full h-full" style={{ background: color }} />
      <input
        type="color"
        value={color.startsWith('#') && color.length === 7 ? color : '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
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
  const { updateElement } = useStore()
  const textRef = useRef<HTMLTextAreaElement>(null)

  const text       = (el.props.text       as string) ?? ''
  const fill       = (el.props.fill       as string) ?? '#ffffff'
  const fontFamily = (el.props.fontFamily as string) ?? 'Inter, sans-serif'

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
    updateElement(templateId, el.id, { props: { ...el.props, fill: hex } })
  }

  function handleFont(e: React.ChangeEvent<HTMLSelectElement>) {
    updateElement(templateId, el.id, { props: { ...el.props, fontFamily: e.target.value } })
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Linha: rótulo + cor + fonte */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 flex-1 truncate select-none">
          {LABEL_MAP[el.id] ?? el.id}
        </span>
        <ColorPicker color={fill} onChange={handleColor} title="Cor do texto" />
        <select
          value={fontFamily}
          onChange={handleFont}
          className="
            bg-gray-800 border border-gray-700 rounded
            text-gray-300 text-[11px] px-1 py-0.5
            focus:border-[#3A5AFF] focus:outline-none
            transition-colors max-w-[108px]
          "
        >
          {FONTS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Textarea */}
      <textarea
        ref={textRef}
        value={text}
        rows={1}
        onChange={handleText}
        spellCheck={false}
        className="
          w-full bg-gray-800 border border-gray-700
          focus:border-[#3A5AFF] focus:outline-none
          text-white text-sm rounded-md px-2.5 py-1.5
          resize-none overflow-hidden leading-snug
          transition-colors placeholder-gray-600
        "
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
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-medium text-gray-500 flex-1 select-none">
        Cor de destaque
      </span>
      <ColorPicker color={fill} onChange={handleColor} title="Cor de destaque" />
      <span className="text-[10px] text-gray-600 font-mono uppercase">{fill}</span>
    </div>
  )
}

// ─── Painel de propriedades ───────────────────────────────────────────────────

export function PropertiesPanel({ template }: { template: Template }) {
  const textEls = template.elements.filter((el) => el.type === 'text')
  if (textEls.length === 0) return null

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-gray-800">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Textos
      </h3>

      {textEls.map((el) => (
        <TextField key={`${template.id}-${el.id}`} el={el} templateId={template.id} />
      ))}

      <AccentSection template={template} />
    </div>
  )
}
