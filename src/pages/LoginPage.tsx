import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleResetPassword() {
    if (!email) { setError('Digite seu e-mail antes de solicitar a redefinição de senha'); return }
    setResetLoading(true)
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    setResetSent(true)
    setResetLoading(false)
  }

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-base)',
      padding: '24px',
    }}>
      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '56px 56px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Logo Pulse */}
        <img
          src="/logo-pulse-cropped.png"
          alt="Pulse"
          style={{ height: 48, width: 220, objectFit: 'contain', display: 'block', margin: '0 auto', marginBottom: 32 }}
        />

        {/* Título */}
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0, letterSpacing: '0.1em' }}>
          ACESSE SUA CONTA
        </p>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email</label>
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
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Senha</label>
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
          <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>
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

        {/* Esqueci minha senha */}
        {resetSent ? (
          <p style={{ fontSize: '12px', color: '#22c55e', textAlign: 'center', margin: 0 }}>
            E-mail de redefinição enviado. Verifique sua caixa de entrada.
          </p>
        ) : (
          <button
            onClick={handleResetPassword}
            disabled={resetLoading}
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              alignSelf: 'center',
            }}
          >
            {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
          </button>
        )}
      </div>

      {/* Rodapé */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', margin: '0 0 8px' }}>
          Desenvolvido por
        </p>
        <img
          src="/logo-agente17-crop.png"
          alt="Agente 17"
          style={{ height: 'auto', width: '160px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
        />
      </div>
    </div>
  )
}
