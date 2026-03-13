import { Link, useLocation } from 'react-router-dom'

export function Topbar() {
  const { pathname } = useLocation()

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '52px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo-pulse.png"
          alt="Pulse"
          style={{ height: '28px', mixBlendMode: 'screen' }}
        />
      </div>

      {/* Nav central */}
      <nav style={{ display: 'flex', gap: '4px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {[
          { label: 'Editor', to: '/' },
          { label: 'Templates', to: '/templates' },
        ].map(({ label, to }) => {
          const active = pathname === to || (to === '/' && pathname === '/editor')
          return (
            <Link
              key={to}
              to={to}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-surface)' : 'transparent',
                border: active ? '1px solid var(--border-active)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Badge versão */}
      <div style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '4px 10px',
        letterSpacing: '0.05em',
      }}>
        BETA
      </div>
    </header>
  )
}
