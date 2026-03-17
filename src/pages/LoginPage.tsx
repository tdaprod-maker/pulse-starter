import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        width: '360px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img
            src="/logo-pulse.svg"
            alt="Pulse"
            style={{ height: '120px', marginLeft: '-20px', mixBlendMode: 'screen' }}
          />
        </div>

        {/* Título */}
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)',
            textAlign: 'center', margin: 0, letterSpacing: '0.1em' }}>
            ACESSE SUA CONTA
          </p>
        </div>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>

        {/* Senha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>

        {/* Erro */}
        {error && (
          <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>
            {error}
          </p>
        )}

        {/* Botão */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-gerar"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          margin: 0,
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
            }}
          >
            Agente 17
          </a>
        </p>
      </div>
    </div>
  )
}
