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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      background: 'var(--bg-base)',
    }}>
      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Logo Pulse */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img
            src="/logo-pulse.png"
            alt="Pulse"
            style={{ height: '36px' }}
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
      </div>

      {/* Rodapé */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Desenvolvido por</span>
        <img
          src="/logo-agente17.png"
          alt="Agente 17"
          height={24}
          onError={(e) => {
            const img = e.currentTarget
            img.style.display = 'none'
            const span = document.createElement('span')
            span.textContent = 'Agente 17'
            span.style.fontSize = '12px'
            span.style.color = 'var(--text-muted)'
            img.parentNode?.appendChild(span)
          }}
        />
      </div>
    </div>
  )
}
