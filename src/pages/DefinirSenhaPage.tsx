import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Tela que o cliente que pagou pela LP abre a partir do link do email de acesso
// (fluxo de recovery do Supabase). O link traz a sessão no hash da URL; o
// supabase-js consome sozinho (detectSessionInUrl). Aqui ele só define a senha.
// Se abrir sem sessão (link expirado), oferece pedir um novo link.
export function DefinirSenhaPage() {
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Fluxo "pedir novo link"
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    let settled = false
    supabase.auth.getSession().then(({ data }) => {
      settled = true
      setHasSession(!!data.session)
      setChecking(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session)
      if (!settled) setChecking(false)
    })
    // fallback: se o hash ainda estiver sendo processado, para de "checando" após 2s
    const t = setTimeout(() => setChecking(false), 2000)
    return () => { subscription.unsubscribe(); clearTimeout(t) }
  }, [])

  async function handleSubmit() {
    setError('')
    if (!password || !confirm) { setError('Preencha os dois campos.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
    // Não desloga: o cliente já está autenticado depois do updateUser. O reload
    // pra "/" remonta o App, que no mount detecta a sessão e chama checkAndRoute
    // — cliente novo (sem brand_config) cai no onboarding, sem re-login.
    setTimeout(() => { window.location.href = '/' }, 1200)
  }

  async function handleRequestLink() {
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) { setError('Digite um email válido.'); return }
    setResetLoading(true)
    await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/definir-senha`,
    })
    setResetSent(true)
    setResetLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px',
    padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <img src="/logo-pulse-cropped.png" alt="Pulse" style={{ height: 44, width: 200, objectFit: 'contain', display: 'block', margin: '0 auto', marginBottom: 8 }} />
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0, letterSpacing: '0.1em' }}>DEFINIR SENHA</p>

        {checking ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>Carregando...</p>
        ) : done ? (
          <p style={{ fontSize: '13px', color: '#22c55e', textAlign: 'center', margin: 0 }}>
            Senha definida! Entrando no Pulse...
          </p>
        ) : hasSession ? (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Crie uma senha para acessar sua conta. Os pulses do seu plano já estão creditados.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nova senha <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(mínimo 6 caracteres)</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Confirmar senha</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
            </div>
            {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading} className="btn-gerar"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Salvando...' : 'Salvar e acessar'}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Este link expirou ou já foi usado. Informe o email da compra e enviamos um novo link.
            </p>
            {resetSent ? (
              <p style={{ fontSize: '13px', color: '#22c55e', margin: 0 }}>Link enviado. Confira seu email.</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="seu@email.com"
                    onKeyDown={e => e.key === 'Enter' && handleRequestLink()} style={inputStyle} />
                </div>
                {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
                <button onClick={handleRequestLink} disabled={resetLoading} className="btn-gerar"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: resetLoading ? 'not-allowed' : 'pointer', opacity: resetLoading ? 0.7 : 1 }}>
                  {resetLoading ? 'Enviando...' : 'Enviar novo link'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
