import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setError('')
    if (!newPassword || !confirmPassword) {
      setError('Preencha os dois campos.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
    setTimeout(() => navigate('/'), 3000)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
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
        <img
          src="/logo-pulse-cropped.png"
          alt="Pulse"
          style={{ height: 48, width: 220, objectFit: 'contain', display: 'block', margin: '0 auto', marginBottom: 32 }}
        />

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0, letterSpacing: '0.1em' }}>
          REDEFINIR SENHA
        </p>

        {success ? (
          <p style={{ fontSize: '13px', color: '#22c55e', textAlign: 'center', margin: 0 }}>
            Senha atualizada com sucesso! Redirecionando...
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Confirmar senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
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
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px' }}>
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
