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
    addTemplate(variant)          // upserts: refreshes definition, keeps backgroundImage
    setActiveTemplate(variant.id)
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 gap-3 overflow-y-auto">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 px-1">
        Templates
      </h2>

      {templateRegistry.map((def) => {
        const variants = def.getVariants(theme)
        return (
          <div key={def.id}>
            <button
              onClick={() =>
                setExpandedId(expandedId === def.id ? null : def.id)
              }
              className="w-full text-left px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition flex items-center justify-between"
            >
              <span className="text-sm font-medium">{def.name}</span>
              <span className="text-gray-500 text-xs">
                {expandedId === def.id ? '▲' : '▼'}
              </span>
            </button>

            {expandedId === def.id && (
              <ul className="mt-1 flex flex-col gap-1 pl-3">
                {variants.map((v) => (
                  <li key={v.id}>
                    <button
                      onClick={() => handleSelectVariant(v)}
                      className={`w-full text-left px-3 py-1.5 rounded-md transition text-xs flex items-center justify-between ${
                        activeTemplateId === v.id
                          ? 'bg-[#3A5AFF] text-white'
                          : 'bg-gray-700 hover:bg-[#3A5AFF]'
                      }`}
                    >
                      <span>{ratioLabel(v)}</span>
                      <span className="text-gray-400">
                        {v.width}×{v.height}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </aside>
  )
}
