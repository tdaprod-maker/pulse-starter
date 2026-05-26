import { useState } from 'react'
import { templateRegistry } from '../templates/index'
import { useStore } from '../state/useStore'
import { useTheme } from '../contexts/ThemeContext'
import type { Template } from '../state/useStore'

const GROUPS = [
  { label: 'Sport', ids: ['sport-arena', 'sport-brand'] },
  { label: 'Food', ids: ['food-editorial', 'food-promo', 'food-vertical'] },
  { label: 'Business', ids: ['business-statement', 'business-card', 'job-glass', 'hero-gradient', 'toggle-card', 'infographic-ring'] },
  { label: 'Health', ids: ['health-content', 'health-stats', 'health-split'] },
  { label: 'Construction', ids: ['build-impact', 'build-editorial'] },
  { label: 'Realty', ids: ['realty-premium', 'realty-launch', 'realty-keys'] },
  { label: 'Fashion', ids: ['fashion-editorial', 'fashion-drop'] },
  { label: 'Tech', ids: ['tech-statement', 'tech-news', 'tech-product', 'tech-minimal'] },
  { label: 'Home & Deco', ids: ['home-split', 'product-arch'] },
  { label: 'Outros', ids: ['bold-circle', 'editorial-cover', 'split-editorial', 'geo-impact', 'editorial-card'] },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { addTemplate, setActiveTemplate, activeTemplateId } = useStore()
  const { theme } = useTheme()
  const [openGroups, setOpenGroups] = useState<string[]>(['Sport'])

  function toggleGroup(label: string) {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    )
  }

  function handleSelectTemplate(variant: Template) {
    addTemplate(variant)
    setActiveTemplate(variant.id)
    onClose?.()
  }

  return (
    <aside
      className={`sidebar-container${isOpen ? ' sidebar-open' : ''}`}
      style={{
        width: '220px',
        background: 'var(--bg-panel)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: 'inset -1px 0 0 rgba(91,143,212,0.08)',
        flexShrink: 0,
      }}
    >
      {/* Mobile header with close button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0, paddingLeft: '4px', textTransform: 'uppercase' }}>
          ESTILOS
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mobile-only"
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px 8px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {GROUPS.map(({ label, ids }) => {
        const isGroupOpen = openGroups.includes(label)
        const hasActive = ids.some(id => activeTemplateId?.startsWith(id))
        return (
          <div key={label}>
            <button
              onClick={() => toggleGroup(label)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid transparent',
                background: hasActive ? 'var(--accent-glow)' : 'transparent',
                cursor: 'pointer',
                color: hasActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span>{label}</span>
              <span style={{ fontSize: '10px', opacity: 0.5, transform: isGroupOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {isGroupOpen && (
              <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
                {ids.flatMap(id => {
                  const def = templateRegistry.find(d => d.id === id)
                  if (!def) return []
                  const firstVariant = def.getVariants(theme)[0]
                  const isActive = activeTemplateId?.startsWith(def.id) ?? false
                  return (
                    <button
                      key={def.id}
                      onClick={() => handleSelectTemplate(firstVariant)}
                      style={{
                        width: '100%',
                        background: isActive ? 'var(--accent-glow)' : 'transparent',
                        border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: isActive ? 600 : 400,
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      {def.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
