import { useRef } from 'react'
import type { Template } from '../state/useStore'
import { useStore } from '../state/useStore'
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
    <div className="flex flex-col gap-3 p-4 border-b border-gray-800">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Imagem
      </h3>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {template.backgroundImage ? (
        <div className="flex flex-col gap-3">
          {/* Thumbnail */}
          <div className="relative rounded-md overflow-hidden aspect-square">
            <img
              src={template.backgroundImage}
              className="w-full h-full object-cover"
              style={{
                objectPosition:  `center ${align}`,
                transform:       `scale(${zoom / 100})`,
                transformOrigin: `center ${align}`,
              }}
              alt="Imagem de fundo"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Hint interação direta */}
          <p className="text-[10px] text-gray-600 leading-snug select-none">
            Arraste a imagem no canvas para reposicionar. Use o scroll do mouse para dar zoom.
          </p>

          {/* Zoom */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500 select-none">Zoom</span>
              <span className="text-xs text-gray-400 font-mono">{zoom}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={zoom}
              onChange={(e) => setTemplateImageStyle(template.id, Number(e.target.value), undefined)}
              className="w-full accent-[#3A5AFF]"
            />
          </div>

          {/* Alinhamento */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500 select-none">Alinhamento</span>
            <div className="flex gap-1.5">
              {ALIGN_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTemplateImageStyle(template.id, undefined, value)}
                  className={`
                    flex-1 text-xs py-1.5 rounded-md transition-colors
                    ${align === value
                      ? 'bg-[#3A5AFF] text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
                  `}
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
              className="text-xs py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              Resetar posição
            </button>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              Trocar
            </button>
            <button
              onClick={handleRemove}
              className="text-xs px-2.5 py-1.5 rounded-md bg-gray-800 hover:bg-red-950 text-gray-500 hover:text-red-400 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="
            w-full flex flex-col items-center justify-center gap-2
            border border-dashed border-gray-700
            hover:border-[#3A5AFF] hover:bg-gray-800/40
            rounded-md px-3 py-5
            text-gray-600 hover:text-gray-300
            transition-colors
          "
        >
          <UploadIcon />
          <span className="text-xs">Carregar imagem</span>
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
