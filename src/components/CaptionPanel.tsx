import { useState, useEffect } from 'react'
import type { RefObject } from 'react'
import type Konva from 'konva'
import type { Template } from '../state/useStore'
import { calcAutoScale } from '../engine/CanvasEngine'
import { useStore } from '../state/useStore'
import { supabase } from '../lib/supabase'

interface CaptionPanelProps {
  stageRef?: RefObject<Konva.Stage | null>
  template?: Template
}

export function CaptionPanel({ stageRef, template }: CaptionPanelProps = {}) {
  const caption = useStore((s) => s.caption)
  const [tab, setTab] = useState<'instagram' | 'linkedin'>('instagram')
  const [linkedinToken, setLinkedinToken] = useState<string>('')
  const [linkedinSub, setLinkedinSub] = useState<string>('')
  const [linkedinName, setLinkedinName] = useState<string>('')
  const [publishing, setPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [publishingInstagram, setPublishingInstagram] = useState(false)
  const [instagramStatus, setInstagramStatus] = useState<'idle' | 'success' | 'error'>('idle')

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
    window.open('/api/linkedin-auth', '_blank', 'width=600,height=700')
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
      let imageBase64: string | null = null
      if (stageRef?.current && template) {
        const autoScale = calcAutoScale(template)
        const pixelRatio = 2 / autoScale
        // Remove stroke de seleção temporariamente
        const selectedNodes: any[] = []
        stageRef.current.find('Text, Rect, Image').forEach((node: any) => {
          if (node.stroke() === '#3A5AFF' && node.strokeWidth() > 0) {
            selectedNodes.push({ node, stroke: node.stroke(), strokeWidth: node.strokeWidth() })
            node.stroke('')
            node.strokeWidth(0)
          }
        })
        stageRef.current.batchDraw()
        imageBase64 = stageRef.current.toDataURL({ pixelRatio, mimeType: 'image/jpeg', quality: 0.92 })
        selectedNodes.forEach(({ node, stroke, strokeWidth }) => {
          node.stroke(stroke)
          node.strokeWidth(strokeWidth)
        })
        stageRef.current.batchDraw()
      }

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

  async function handlePublishInstagram() {
    if (!caption || !stageRef?.current || publishingInstagram) return
    setPublishingInstagram(true)
    setInstagramStatus('idle')
    try {
      // Exporta o canvas como blob
      const autoScale = template ? calcAutoScale(template) : 1
      const pixelRatio = 2 / autoScale
      const dataUrl = stageRef.current.toDataURL({ pixelRatio, mimeType: 'image/jpeg', quality: 0.92 })
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob = new Blob([byteArray], { type: 'image/jpeg' })

      // Faz upload para o Supabase Storage
      const fileName = `instagram-temp-${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) throw new Error('Erro ao fazer upload da imagem')

      // Obtém URL pública
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
      const imageUrl = urlData.publicUrl

      // Publica no Instagram
      const igUserId = '17841479034844249' // agente17ia
      const text = `${caption.instagram}\n\n${caption.hashtags}`

      const res = await fetch('/api/instagram-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, caption: text, igUserId }),
      })

      const data = await res.json()
      if (data.success) {
        setInstagramStatus('success')
        setTimeout(() => setInstagramStatus('idle'), 3000)
        // Remove imagem temporária do Storage
        await supabase.storage.from('media').remove([fileName])
      } else {
        throw new Error(data.error)
      }
    } catch (err: unknown) {
      console.error('[CaptionPanel] erro Instagram:', err)
      setInstagramStatus('error')
      setTimeout(() => setInstagramStatus('idle'), 3000)
    } finally {
      setPublishingInstagram(false)
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
      {/* Instagram */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handlePublishInstagram}
          disabled={publishingInstagram || !caption}
          style={{
            width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
            cursor: publishingInstagram || !caption ? 'default' : 'pointer',
            fontFamily: 'inherit', fontWeight: 600, border: 'none',
            opacity: publishingInstagram || !caption ? 0.6 : 1,
            background: instagramStatus === 'success' ? 'rgba(34,197,94,0.8)' : instagramStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            color: 'white', transition: 'all 0.2s',
          }}
        >
          {publishingInstagram ? 'Publicando...' : instagramStatus === 'success' ? 'Publicado!' : instagramStatus === 'error' ? 'Erro ao publicar' : 'Publicar no Instagram'}
        </button>
      </div>
    </div>
  )
}
