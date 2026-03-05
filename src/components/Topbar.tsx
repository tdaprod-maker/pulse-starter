import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const links = [
  { to: '/', label: 'Editor' },
  { to: '/templates', label: 'Templates' },
]

export function Topbar() {
  const { pathname } = useLocation()
  const { theme } = useTheme()

  return (
    <header className="h-14 bg-gray-950 text-white flex items-center px-6 gap-8 shadow-md">
      <span className="text-xl font-bold text-indigo-400 tracking-tight">Pulse</span>

      <nav className="flex gap-4">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`text-sm font-medium hover:text-indigo-300 transition ${
              pathname === l.to ? 'text-indigo-400' : 'text-gray-300'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700"
          title={`Tema ativo: ${theme.name}`}
        >
          {/* Palheta de cores do tema */}
          <div className="flex gap-1">
            <span
              className="w-3 h-3 rounded-full border border-gray-600"
              style={{ background: theme.colors.accent }}
            />
            <span
              className="w-3 h-3 rounded-full border border-gray-600"
              style={{ background: theme.colors.accentAlt }}
            />
            <span
              className="w-3 h-3 rounded-full border border-gray-600"
              style={{ background: theme.colors.coral }}
            />
          </div>
          <span className="text-xs text-gray-300 font-medium">{theme.name}</span>
        </div>
      </div>
    </header>
  )
}
