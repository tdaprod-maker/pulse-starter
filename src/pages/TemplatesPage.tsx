import { useNavigate } from 'react-router-dom'
import { templateRegistry } from '../templates/index'
import { useStore } from '../state/useStore'
import { useTheme } from '../contexts/ThemeContext'

export function TemplatesPage() {
  const navigate = useNavigate()
  const { addTemplate, setActiveTemplate, templates } = useStore()
  const { theme } = useTheme()

  function handleSelect(variantId: string) {
    const variant = templateRegistry
      .flatMap((d) => d.getVariants(theme))
      .find((v) => v.id === variantId)
    if (!variant) return
    if (!templates.find((t) => t.id === variantId)) addTemplate(variant)
    setActiveTemplate(variantId)
    navigate('/')
  }

  return (
    <main className="flex-1 bg-gray-900 p-10 overflow-auto">
      <h1 className="text-white text-2xl font-bold mb-8">Galeria de Templates</h1>

      {templateRegistry.map((def) => {
        const variants = def.getVariants(theme)
        return (
          <section key={def.id} className="mb-10">
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-4">
              {def.name}
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(v.id)}
                  className="rounded-xl p-5 text-white text-left transition hover:ring-2 hover:ring-[#3A5AFF]"
                  style={{ backgroundColor: v.background ?? '#1f2937' }}
                >
                  <p className="font-semibold text-sm">{v.name}</p>
                  <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                    {v.width} × {v.height} px
                  </p>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
