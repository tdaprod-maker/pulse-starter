import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'ricardo_jimenes@yahoo.com.br'

interface UserData {
  email: string
  tokens_remaining: number
  tokens_used: number
  updated_at: string
  brand_name?: string
  segment?: string
}

export function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [addingPulses, setAddingPulses] = useState<string | null>(null)
  const [pulseAmount, setPulseAmount] = useState<Record<string, number>>({})
  const [currentEmail, setCurrentEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? ''
      setCurrentEmail(email)
      if (email === ADMIN_EMAIL) loadUsers()
      else setLoading(false)
    })
  }, [])

  async function loadUsers() {
    setLoading(true)
    const { data: tokens } = await supabase
      .from('user_tokens')
      .select('*')
      .order('updated_at', { ascending: false })

    const { data: brands } = await supabase
      .from('brand_config')
      .select('user_email, brand_name, segment')

    const merged = (tokens ?? []).map(t => ({
      email: t.user_email,
      tokens_remaining: t.tokens_remaining,
      tokens_used: t.tokens_used,
      updated_at: t.updated_at,
      brand_name: brands?.find(b => b.user_email === t.user_email)?.brand_name ?? '',
      segment: brands?.find(b => b.user_email === t.user_email)?.segment ?? '',
    }))

    setUsers(merged)
    setLoading(false)
  }

  async function handleAddPulses(email: string) {
    const amount = pulseAmount[email] ?? 50
    setAddingPulses(email)
    const { data } = await supabase
      .from('user_tokens')
      .select('tokens_remaining')
      .eq('user_email', email)
      .single()

    await supabase
      .from('user_tokens')
      .update({ tokens_remaining: (data?.tokens_remaining ?? 0) + amount })
      .eq('user_email', email)

    await loadUsers()
    setAddingPulses(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
      Carregando...
    </div>
  )

  if (currentEmail !== ADMIN_EMAIL) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
      Acesso negado.
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Painel Administrativo
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0' }}>
              {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={loadUsers} style={{
            fontSize: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontFamily: 'inherit',
          }}>
            Atualizar
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map(user => (
            <div key={user.email} style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px',
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.brand_name || user.email}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {user.email}
                </p>
                {user.segment && (
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--accent)' }}>
                    {user.segment}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: user.tokens_remaining < 10 ? 'rgb(239,68,68)' : 'var(--text-primary)' }}>
                    {user.tokens_remaining}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>restantes</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {user.tokens_used}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>usados</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={pulseAmount[user.email] ?? 50}
                  onChange={e => setPulseAmount(prev => ({ ...prev, [user.email]: Number(e.target.value) }))}
                  min={1}
                  max={500}
                  style={{
                    width: '70px', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '6px 8px', color: 'var(--text-primary)',
                    fontSize: '13px', fontFamily: 'inherit', outline: 'none', textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => handleAddPulses(user.email)}
                  disabled={addingPulses === user.email}
                  style={{
                    fontSize: '12px', padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
                    background: 'rgba(58,90,255,0.15)', border: '1px solid rgba(58,90,255,0.3)',
                    color: 'var(--accent)', fontFamily: 'inherit', fontWeight: 600,
                    opacity: addingPulses === user.email ? 0.6 : 1,
                  }}
                >
                  {addingPulses === user.email ? '...' : '+ Pulses'}
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {new Date(user.updated_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
