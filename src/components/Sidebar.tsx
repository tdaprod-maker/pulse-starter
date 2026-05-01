import { useState } from 'react'
import { templateRegistry } from '../templates/index'
import { useStore } from '../state/useStore'
import { useTheme } from '../contexts/ThemeContext'
import type { Template } from '../state/useStore'

const GROUPS = [
  { label: 'Sport', ids: ['sport-arena', 'sport-brand'] },
  { label: 'Food', ids: ['food-editorial', 'food-promo'] },
  { label: 'Business', ids: ['business-statement', 'business-card'] },
  { label: 'Health', ids: ['health-content', 'health-stats'] },
  { label: 'Construction', ids: ['build-impact', 'build-editorial'] },
  { label: 'Realty', ids: ['realty-premium', 'realty-launch'] },
  { label: 'Fashion', ids: ['fashion-editorial', 'fashion-drop'] },
  { label: 'Outros', ids: ['tech-statement', 'tech-news', 'tech-product', 'tech-minimal', 'hero-title', 'big-statement', 'editorial-card', 'big-number'] },
]

export function Sidebar() {
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
      gap: '4px',
      boxShadow: 'inset -1px 0 0 rgba(91,143,212,0.08)',
    }}>
      <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '4px', textTransform: 'uppercase' }}>ESTILOS</p>

      {GROUPS.map(({ label, ids }) => {
        const isOpen = openGroups.includes(label)
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
                padding: '8px 10px',
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
              <span style={{ fontSize: '10px', opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {isOpen && (
              <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
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
                        padding: '6px 10px',
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
