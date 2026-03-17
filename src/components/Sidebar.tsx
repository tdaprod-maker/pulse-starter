import { templateRegistry } from '../templates/index'
import { useStore } from '../state/useStore'
import { useTheme } from '../contexts/ThemeContext'
import type { Template } from '../state/useStore'

const SEPARATOR_AFTER = 'food-promo'

export function Sidebar() {
  const { addTemplate, setActiveTemplate, activeTemplateId } = useStore()
  const { theme } = useTheme()

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
        const firstVariant = variants[0]
        const isActive = activeTemplateId?.startsWith(def.id) ?? false

        return (
          <>
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
            {def.id === SEPARATOR_AFTER && (
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
            )}
          </>
        )
      })}
    </aside>
  )
}
