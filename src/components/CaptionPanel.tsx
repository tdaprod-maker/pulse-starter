import { useState, useEffect } from 'react'
import { useStore } from '../state/useStore'

export function CaptionPanel() {
  const caption = useStore((s) => s.caption)
  const activeTemplate = useStore((s) => s.templates.find(t => t.id === s.activeTemplateId))
  const [tab, setTab] = useState<'instagram' | 'linkedin'>('instagram')
  const [linkedinToken, setLinkedinToken] = useState<string>('')
  const [linkedinSub, setLinkedinSub] = useState<string>('')
  const [linkedinName, setLinkedinName] = useState<string>('')
  const [publishing, setPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Lê token do LinkedIn salvo no localStorage
  useEffect(() => {
    setLinkedinToken(localStorage.getItem('linkedin_token') ?? '')
    setLinkedinSub(localStorage.getItem('linkedin_sub') ?? '')
    setLinkedinName(localStorage.getItem('linkedin_name') ?? '')
  }, [])

  // Captura token do LinkedIn após callback OAuth (parâmetros na URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('linkedin_token')
    const sub = params.get('linkedin_sub')
    const name = params.get('linkedin_name')
    const error = params.get('linkedin_error')

    if (token && sub) {
      localStorage.setItem('linkedin_token', token)
      localStorage.setItem('linkedin_sub', sub)
      localStorage.setItem('linkedin_name', name ?? '')
      setLinkedinToken(token)
      setLinkedinSub(sub)
      setLinkedinName(name ?? '')
      // Limpa os parâmetros da URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (error) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleConnectLinkedIn() {
    window.location.href = '/api/linkedin-auth'
  }

  function handleDisconnectLinkedIn() {
    localStorage.removeItem('linkedin_token')
    localStorage.removeItem('linkedin_sub')
    localStorage.removeItem('linkedin_name')
    setLinkedinToken('')
    setLinkedinSub('')
    setLinkedinName('')
  }

  async function handlePublishLinkedIn() {
    if (!linkedinToken || !linkedinSub || !caption || publishing) return
    setPublishing(true)
    setPublishStatus('idle')
    try {
      const text = `${caption.linkedin}\n\n${caption.hashtags}`
      const imageBase64 = activeTemplate?.backgroundImage ?? null

      const res = await fetch('/api/linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: linkedinToken,
          linkedinSub,
          text,
          imageBase64,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setPublishStatus('success')
        setTimeout(() => setPublishStatus('idle'), 3000)
      } else {
        throw new Error(data.error)
      }
    } catch {
      setPublishStatus('error')
      setTimeout(() => setPublishStatus('idle'), 3000)
    } finally {
      setPublishing(false)
    }
  }

  if (!caption) return null

  return (
    <div style={{
      width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column',
      gap: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '16px',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        Legenda
      </span>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {(['instagram', 'linkedin'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, fontSize: '11px', padding: '5px', borderRadius: '6px',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.15s',
            ...(tab === t
              ? { background: 'var(--accent)', border: 'none', color: 'white' }
              : { background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }),
          }}>
            {t === 'instagram' ? 'Instagram' : 'LinkedIn'}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea readOnly value={caption[tab]} rows={5} style={{
        width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px',
        padding: '8px 10px', fontFamily: 'inherit', resize: 'none', outline: 'none',
        lineHeight: 1.6, boxSizing: 'border-box',
      }} />

      {/* Hashtags */}
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
        {caption.hashtags}
      </p>

      {/* Botões copiar */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => navigator.clipboard.writeText(`${caption[tab]}\n\n${caption.hashtags}`)}
          style={{ flex: 1, fontSize: '11px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s' }}
        >
          Copiar legenda
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(caption.hashtags)}
          style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s' }}
        >
          Copiar hashtags
        </button>
      </div>

      {/* LinkedIn */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {linkedinToken ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Conectado como <strong style={{ color: 'var(--text-primary)' }}>{linkedinName || 'LinkedIn'}</strong>
              </span>
              <button onClick={handleDisconnectLinkedIn} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.6)', fontFamily: 'inherit' }}>
                Desconectar
              </button>
            </div>
            <button
              onClick={handlePublishLinkedIn}
              disabled={publishing}
              style={{
                width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
                cursor: publishing ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 600,
                border: 'none', transition: 'all 0.2s', opacity: publishing ? 0.6 : 1,
                background: publishStatus === 'success' ? 'rgba(34,197,94,0.8)' : publishStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #0077B5, #005e93)',
                color: 'white',
              }}
            >
              {publishing ? 'Publicando...' : publishStatus === 'success' ? 'Publicado!' : publishStatus === 'error' ? 'Erro ao publicar' : 'Publicar no LinkedIn'}
            </button>
          </>
        ) : (
          <button
            onClick={handleConnectLinkedIn}
            style={{
              width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
              background: 'linear-gradient(135deg, #0077B5, #005e93)',
              border: 'none', color: 'white', transition: 'all 0.2s',
            }}
          >
            Conectar LinkedIn
          </button>
        )}
      </div>
    </div>
  )
}
