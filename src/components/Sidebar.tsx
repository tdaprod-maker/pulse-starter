import { useState } from 'react'
import { templateRegistry } from '../templates/index'
import { useStore } from '../state/useStore'
import { useTheme } from '../contexts/ThemeContext'
import type { Template } from '../state/useStore'

const RATIO_LABELS: Record<string, string> = {
  '1x1': '1:1',
  '4x5': '4:5',
  '9x16': '9:16',
  '16x9': '16:9',
}

function ratioLabel(template: Template) {
  const suffix = template.id.split('-').pop() ?? ''
  return RATIO_LABELS[suffix] ?? `${template.width}×${template.height}`
}

export function Sidebar() {
  const { addTemplate, setActiveTemplate, activeTemplateId } = useStore()
  const { theme } = useTheme()
  const [expandedId, setExpandedId] = useState<string | null>('hero-title')

  function handleSelectVariant(variant: Template) {
    addTemplate(variant)
    setActiveTemplate(variant.id)
  }

  return (
    <aside style={{
      width: '180px',
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
      <p style={{
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        color: 'var(--text-muted)',
        marginBottom: '12px',
        paddingLeft: '4px',
        textTransform: 'uppercase',
      }}>
        Templates
      </p>

      {templateRegistry.map((def) => {
        const variants = def.getVariants(theme)
        const isExpanded = expandedId === def.id

        return (
          <div key={def.id}>
            <button
              className="template-btn"
              onClick={() => setExpandedId(isExpanded ? null : def.id)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              <span>{def.name}</span>
              <span style={{ fontSize: '10px', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                marginBottom: '8px',
                paddingLeft: '8px',
              }}>
                {variants.map((v) => {
                  const active = activeTemplateId === v.id
                  return (
                    <button
                      key={v.id}
                      className="variant-btn"
                      onClick={() => handleSelectVariant(v)}
                      style={{
                        width: '100%',
                        background: active ? 'var(--accent-glow)' : 'transparent',
                        border: active ? '1px solid var(--border-active)' : '1px solid transparent',
                        borderRadius: '6px',
                        padding: '5px 8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span>{ratioLabel(v)}</span>
                      <span style={{ opacity: 0.5 }}>{v.width}×{v.height}</span>
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
