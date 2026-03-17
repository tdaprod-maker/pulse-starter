import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Topbar() {
  const { pathname } = useLocation()

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '56px',
      background: 'rgba(13,17,23,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(91,143,212,0.12)',
      position: 'relative',
      zIndex: 50,
      boxShadow: '0 1px 0 rgba(91,143,212,0.25), 0 2px 0 rgba(91,143,212,0.08), 0 4px 24px rgba(0,0,0,0.5)',
    }}>

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} onClick={e => { if (pathname === '/') e.preventDefault() }}>
        <img
          src="/logo-pulse.svg"
          alt="Pulse"
          style={{
            height: '120px',
            marginTop: '-38px',
            marginBottom: '-38px',
            marginLeft: '-20px',
            display: 'block',
          }}
        />
      </Link>

      {/* Nav central */}
      <nav style={{
        display: 'flex',
        gap: '2px',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '10px',
        padding: '3px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
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
                padding: '6px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? '#ffffff' : 'var(--text-secondary)',
                background: active
                  ? 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))'
                  : 'transparent',
                boxShadow: active ? '0 2px 8px rgba(58,90,255,0.3)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/brand"
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'white',
            background: 'var(--accent)',
            border: 'none',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(58,90,255,0.3)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
        >
          Brand Kit
        </Link>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          Sair
        </button>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: '#5B8FD4',
          background: 'rgba(58,90,255,0.1)',
          border: '1px solid rgba(58,90,255,0.2)',
          borderRadius: '6px',
          padding: '4px 10px',
        }}>
          BETA
        </div>
        <span style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
        }}>
          por{' '}
          <a
            href="https://agente17.com.br"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '10px',
            }}
          >
            Agente 17
          </a>
        </span>
      </div>
    </header>
  )
}
