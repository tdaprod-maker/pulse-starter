import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

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
    if (error) setError('Email ou senha incorretos')
    setLoading(false)
  }

  async function handleSignup() {
    if (!name.trim()) { setError('Digite seu nome'); return }
    if (!email.trim()) { setError('Digite seu email'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, company },
        emailRedirectTo: window.location.origin,
      }
    })
    if (error) {
      setError(error.message)
    } else {
      setSignupSuccess(true)
    }
    setLoading(false)
  }

  if (signupSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '560px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '56px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
          <img src="/logo-pulse-cropped.png" alt="Pulse" style={{ height: 48, width: 220, objectFit: 'contain', marginBottom: 16 }} />
          <div style={{ fontSize: '32px' }}>✓</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Conta criada com sucesso!</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Enviamos um email de confirmação para <strong>{email}</strong>. Confirme seu email para acessar o Pulse.
          </p>
          <button onClick={() => { setSignupSuccess(false); setMode('login') }} style={{ fontSize: '13px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            Voltar para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '560px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '56px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <img src="/logo-pulse-cropped.png" alt="Pulse" style={{ height: 48, width: 220, objectFit: 'contain', display: 'block', margin: '0 auto', marginBottom: 16 }} />

        {/* Toggle login/cadastro */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border)' }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: mode === m ? 600 : 400,
              background: mode === m ? 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))' : 'transparent',
              color: mode === m ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {/* Campos de cadastro */}
        {mode === 'signup' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nome completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Empresa (opcional)</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Nome da sua empresa"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
            </div>
          </>
        )}

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
            onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
        </div>

        {/* Senha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Senha {mode === 'signup' && <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(mínimo 6 caracteres)</span>}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
        </div>

        {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}

        <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading} className="btn-gerar"
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? (mode === 'login' ? 'Entrando...' : 'Criando conta...') : (mode === 'login' ? 'Entrar' : 'Criar conta')}
        </button>

        {mode === 'login' && (
          resetSent ? (
            <p style={{ fontSize: '12px', color: '#22c55e', textAlign: 'center', margin: 0 }}>E-mail de redefinição enviado.</p>
          ) : (
            <button onClick={handleResetPassword} disabled={resetLoading}
              style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', alignSelf: 'center' }}>
              {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
            </button>
          )
        )}
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px' }}>Desenvolvido por</p>
        <a href="https://agente17.com.br" target="_blank" rel="noopener noreferrer">
          <img src="/logo-agente17-crop.png" alt="Agente 17" style={{ height: 'auto', width: '160px', objectFit: 'contain', display: 'block', margin: '0 auto', marginLeft: '32px' }} />
        </a>
      </div>
    </div>
  )
}
