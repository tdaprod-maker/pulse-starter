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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        Logotipo
      </span>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* Logos do Brand Kit */}
      {brandLogos.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {brandLogos.map((logo) => (
            <button
              key={logo.url}
              onClick={() => handleSelectBrandLogo(logo.url)}
              title={logo.label}
              style={{
                flexShrink: 0, width: '48px', height: '48px', borderRadius: '8px',
                border: `2px solid ${template.logoImage === logo.url ? 'var(--accent)' : 'var(--border)'}`,
                background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 0 0 / 10px 10px',
                cursor: 'pointer', padding: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', transition: 'border-color 0.15s',
              }}
            >
              <img src={logo.url} alt={logo.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </button>
          ))}
        </div>
      )}

      {!brandLogos.length && !template.logoImage && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          Adicione logotipos no Brand Kit
        </p>
      )}

      {template.logoImage ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Preview */}
          <div style={{
            borderRadius: '10px', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 0 0 / 12px 12px',
            minHeight: '60px', border: '1px solid var(--border)',
          }}>
            <img src={template.logoImage} alt="Logotipo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain', padding: '8px' }} />
          </div>

          {/* Tamanho */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TAMANHO</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{logoSize}px</span>
            </div>
            <input
              type="range" min={60} max={1080} step={4} value={logoSize}
              onChange={(e) => setTemplateLogoStyle(template.id, Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Arraste o logotipo no canvas para reposicioná-lo.
          </p>

          {/* Ações */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                flex: 1, fontSize: '12px', padding: '7px', borderRadius: '8px', cursor: 'pointer',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-active)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
            >
              Trocar
            </button>
            <button
              onClick={() => setTemplateLogo(template.id, null)}
              style={{
                fontSize: '12px', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(239,68,68,0.2)',
                color: 'rgba(239,68,68,0.5)', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgb(239,68,68)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.5)' }}
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
            border: '1px dashed var(--border)', borderRadius: '10px',
            padding: '20px', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-muted)',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1.5" y="4.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
            <circle cx="6.5" cy="10" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M5 15l3.5-5 3 3.5 2.5-3 4 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: '12px' }}>Carregar logotipo</span>
        </button>
      )}
    </div>
  )
}
