import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Página pública mostrada como success_url do Stripe Checkout. Quem comprou pela
// LP ainda não tem sessão — a instrução é checar o email (link de definir senha
// enviado pelo webhook). Quem já estava logado vê o atalho de voltar ao app.
export function CheckoutSuccessPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session?.user?.email))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', textAlign: 'center' }}>
        <img src="/logo-pulse-cropped.png" alt="Pulse" style={{ height: 44, width: 200, objectFit: 'contain', marginBottom: 8 }} />
        <div style={{ fontSize: '32px' }}>✓</div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Pagamento confirmado!</p>

        {loggedIn ? (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Seus pulses já foram creditados na sua conta.
            </p>
            <a href="/" style={{ marginTop: 8, background: 'var(--accent)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '14px', padding: '11px 24px', borderRadius: '10px' }}>
              Voltar ao Pulse
            </a>
          </>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Enviamos um email para você <strong>definir sua senha e acessar o Pulse</strong>. Os pulses do seu plano já estão creditados.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Não recebeu em alguns minutos? Verifique o spam ou use "Esqueci minha senha" na tela de login com o mesmo email da compra.
            </p>
            <a href="/" style={{ marginTop: 8, fontSize: '13px', color: 'var(--accent)', textDecoration: 'underline' }}>
              Ir para a tela de login
            </a>
          </>
        )}
      </div>
    </div>
  )
}
