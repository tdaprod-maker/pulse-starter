import { useRef, useEffect, useState } from 'react'
import type { Template } from '../state/useStore'
import { useStore } from '../state/useStore'
import { loadBrandConfig } from '../services/brandKit'
import type { BrandLogo } from '../services/brandKit'
import { supabase } from '../lib/supabase'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'

interface LogoSectionProps {
  template: Template
}

export function LogoSection({ template }: LogoSectionProps) {
  const { setTemplateLogo, setTemplateLogoStyle, templates, addTemplate } = useStore()
  const { theme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [brandLogos, setBrandLogos] = useState<BrandLogo[]>([])

  const logoSize = template.logoSize ?? 400

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      if (!email) return
      loadBrandConfig(email).then(config => {
        setBrandLogos(config.logos ?? [])
      })
    })
  }, [])

  function handleSelectBrandLogo(url: string) {
    const def = templateRegistry.find(d => template.id.startsWith(d.id))
    const variants = def ? def.getVariants(theme) : []
    variants.forEach(v => {
      if (!templates.find(t => t.id === v.id)) addTemplate(v)
    })
    variants.forEach(v => setTemplateLogo(v.id, url))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') setTemplateLogo(template.id, result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-gray-800">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Logotipo
      </h3>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Brand Kit logos */}
      {brandLogos.length > 0 ? (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {brandLogos.map((logo) => (
            <button
              key={logo.url}
              onClick={() => handleSelectBrandLogo(logo.url)}
              title={logo.label}
              style={{
                flexShrink: 0,
                width: '52px', height: '52px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 0 0 / 10px 10px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img src={logo.url} alt={logo.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </button>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          Adicione logotipos no Brand Kit
        </p>
      )}

      {template.logoImage ? (
        <div className="flex flex-col gap-3">
          {/* Preview */}
          <div
            className="rounded-md overflow-hidden flex items-center justify-center"
            style={{
              background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 0 0 / 12px 12px',
              minHeight: 64,
            }}
          >
            <img
              src={template.logoImage}
              alt="Logotipo"
              className="max-h-16 max-w-full object-contain"
            />
          </div>

          <p className="text-[10px] text-gray-600 leading-snug select-none">
            Arraste o logotipo no canvas para reposicioná-lo.
          </p>

          {/* Tamanho */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500 select-none">Tamanho</span>
              <span className="text-xs text-gray-400 font-mono">{logoSize}px</span>
            </div>
            <input
              type="range"
              min={60}
              max={1080}
              step={4}
              value={logoSize}
              onChange={(e) => setTemplateLogoStyle(template.id, Number(e.target.value))}
              className="w-full accent-[#3A5AFF]"
            />
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              Trocar
            </button>
            <button
              onClick={() => setTemplateLogo(template.id, null)}
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
          <LogoIcon />
          <span className="text-xs">Carregar logotipo</span>
        </button>
      )}
    </div>
  )
}

function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="4.5" width="15" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="6" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M4.5 13.5l3-4.5 2.5 3 2-2.5 3 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
