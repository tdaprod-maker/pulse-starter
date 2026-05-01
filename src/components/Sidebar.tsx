import type React from 'react'
import { templateRegistry } from '../templates/index'
import { useStore } from '../state/useStore'
import { useTheme } from '../contexts/ThemeContext'
import type { Template } from '../state/useStore'

const OFFICIAL = ['sport-arena', 'sport-brand', 'business-statement', 'business-card', 'food-editorial', 'food-promo', 'tech-statement', 'tech-news', 'tech-product', 'tech-minimal']
const SAMPLES  = ['hero-title', 'big-statement', 'editorial-card', 'big-number']

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  color: 'var(--text-muted)',
  marginBottom: '4px',
  paddingLeft: '4px',
  textTransform: 'uppercase',
}

export function Sidebar() {
  const { addTemplate, setActiveTemplate, activeTemplateId } = useStore()
  const { theme } = useTheme()

  function handleSelectTemplate(variant: Template) {
    addTemplate(variant)
    setActiveTemplate(variant.id)
  }

  function renderGroup(ids: string[]) {
    return ids.flatMap((id) => {
      const def = templateRegistry.find((d) => d.id === id)
      if (!def) return []
      const firstVariant = def.getVariants(theme)[0]
      const isActive = activeTemplateId?.startsWith(def.id) ?? false
      return (
        <button
          key={def.id}
          className="template-btn"
          onClick={() => handleSelectTemplate(firstVariant)}
          style={{
            width: '100%',
            background: isActive ? 'var(--accent-glow)' : 'transparent',
            border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: isActive ? 600 : 500,
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        >
          {def.name}
        </button>
      )
    })
  }

  return (
    <aside style={{
      width: '220px',
      background: 'rgba(10,14,20,0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      padding: '20px 10px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      boxShadow: 'inset -1px 0 0 rgba(91,143,212,0.08)',
    }}>
      <p style={labelStyle}>ESTILOS</p>
      {renderGroup([...OFFICIAL, ...SAMPLES])}
    </aside>
  )
}
