// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { debitToken, notifyBalanceUpdate } from '../services/tokens'
import { uploadMedia } from '../services/brandKit'

const VIDEO_PULSE_COST = 10
const VIDEO_SERVER_URL = import.meta.env.VITE_VIDEO_SERVER_URL

interface VideoClip {
  id: number
  url: string
  thumbnail: string
  duration: number
  selected: boolean
}

export function VideoPage() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState<15 | 30>(15)
  const [status, setStatus] = useState<'idle' | 'searching' | 'processing' | 'done' | 'error'>('idle')
  const [clips, setClips] = useState<VideoClip[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [turboing, setTurboing] = useState(false)
  const [myClips, setMyClips] = useState<{url: string, name: string}[]>([])
  const [uploadingClip, setUploadingClip] = useState(false)
  const [activeTab, setActiveTab] = useState<'pexels' | 'myvideos'>('pexels')
  const clipInputRef = useRef<HTMLInputElement>(null)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? '')
    })
  }, [])

  async function handleTurbo() {
    if (!prompt.trim() || turboing) return
    setTurboing(true)
    try {
      const { data: authData } = await supabase.auth.getSession()
      const email = authData.session?.user?.email ?? ''
      const brand = email ? await loadBrandConfig(email) : null
      const context = [
        brand?.segment ? `Segmento: ${brand.segment}` : '',
        brand?.brand_description ? `Marca: ${brand.brand_description}` : '',
      ].filter(Boolean).join('. ')

      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Traduza esse tema para inglês de forma descritiva para buscar vídeos no Pexels. ${context ? 'Contexto: ' + context : ''} Tema: "${prompt}". Responda APENAS com a query em inglês, máximo 5 palavras, sem aspas.` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 50, thinkingConfig: { thinkingBudget: 0 } },
        }),
      })
      const data = await res.json()
      const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (translated) setPrompt(translated)
    } catch {
      // silencioso
    } finally {
      setTurboing(false)
    }
  }

  async function handleClipUpload(e) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !userEmail) return
    setUploadingClip(true)
    try {
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `videos/${userEmail}/${Date.now()}_${safeName}`
        const url = await uploadMedia(file, path)
        if (url) setMyClips(prev => [...prev, { url, name: file.name }])
      }
    } finally {
      setUploadingClip(false)
      e.target.value = ''
    }
  }

  async function handleSearch() {
    if (!prompt.trim() || status === 'searching') return
    setStatus('searching')
    setError('')
    setClips([])
    setVideoUrl(null)
    try {
      const res = await fetch(`/api/search-videos?query=${encodeURIComponent(prompt)}&per_page=9&orientation=portrait`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setClips(data.videos.map((v, i) => ({ ...v, selected: i < 3 })))
      setStatus('idle')
    } catch {
      setError('Erro ao buscar vídeos. Tente novamente.')
      setStatus('error')
    }
  }

  function toggleClip(id: number) {
    setClips(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c))
  }

  async function handleGenerate() {
    const selected = clips.filter(c => c.selected)
    if (!selected.length) { setError('Selecione pelo menos 1 clipe.'); return }

    const { data: authData } = await supabase.auth.getSession()
    const email = authData.session?.user?.email ?? ''
    if (email) {
      const { success } = await debitToken(email, VIDEO_PULSE_COST)
      if (!success) { setError('Pulses insuficientes para gerar o vídeo.'); return }
      notifyBalanceUpdate()
    }

    setStatus('processing')
    setProgress('Enviando clipes para processamento...')
    setError('')

    try {
      const res = await fetch(`${VIDEO_SERVER_URL}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clips: selected.map(c => c.url),
          duration,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Erro ${res.status}`)
      }

      setProgress('Finalizando vídeo...')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      setStatus('done')
    } catch (err) {
      console.error('[VideoPage] erro:', err)
      setError('Erro ao gerar o vídeo. Tente novamente.')
      setStatus('error')
    }
  }

  function handleDownload() {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `pulse-video-${Date.now()}.mp4`
    a.click()
  }

  const selectedCount = clips.filter(c => c.selected).length

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Criar Vídeo
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Gere vídeos para Reels e Stories com clipes do Pexels · {VIDEO_PULSE_COST} pulses
          </p>
        </div>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Tema do vídeo
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ex: baseball kids training, team celebrating..."
              style={{
                flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)',
                fontSize: '14px', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={handleTurbo} disabled={turboing || !prompt.trim()}
              title="Traduzir para inglês"
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,202,29,0.3)', background: 'rgba(255,202,29,0.1)', color: '#FFCA1D', cursor: 'pointer', fontSize: '14px', opacity: !prompt.trim() ? 0.4 : 1 }}>
              {turboing ? '...' : '⚡'}
            </button>
            <button onClick={handleSearch} disabled={!prompt.trim() || status === 'searching'}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', opacity: !prompt.trim() || status === 'searching' ? 0.6 : 1, whiteSpace: 'nowrap' }}>
              {status === 'searching' ? 'Buscando...' : 'Buscar clipes'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {([15, 30] as const).map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '13px', fontWeight: duration === d ? 600 : 400,
                background: duration === d ? 'rgba(58,90,255,0.15)' : 'var(--bg-surface)',
                border: `1px solid ${duration === d ? 'rgba(58,90,255,0.5)' : 'var(--border)'}`,
                color: duration === d ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {d} segundos
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ fontSize: '13px', color: 'rgb(239,68,68)', margin: 0 }}>{error}</p>}

        {/* Abas */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border)' }}>
          {[{ id: 'pexels', label: 'Clipes do Pexels' }, { id: 'myvideos', label: 'Meus Vídeos' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1, padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '13px', fontWeight: activeTab === tab.id ? 600 : 400,
                background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)', transition: 'all 0.2s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Meus vídeos */}
        {activeTab === 'myvideos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input ref={clipInputRef} type="file" accept="video/*" multiple onChange={handleClipUpload} style={{ display: 'none' }} />
            <button onClick={() => clipInputRef.current?.click()} disabled={uploadingClip}
              style={{
                width: '100%', padding: '20px', borderRadius: '12px', cursor: 'pointer',
                background: 'var(--bg-surface)', border: '2px dashed var(--border)',
                color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                opacity: uploadingClip ? 0.6 : 1,
              }}>
              <span style={{ fontSize: '28px' }}>+</span>
              <span>{uploadingClip ? 'Enviando...' : 'Adicionar meus clipes de vídeo'}</span>
              <span style={{ fontSize: '11px' }}>MP4, MOV ou AVI</span>
            </button>

            {myClips.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myClips.map((clip, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: '8px', padding: '10px 14px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {clip.name}
                    </span>
                    <button
                      onClick={() => {
                        const selected = { id: Date.now(), url: clip.url, thumbnail: '', duration: 0, selected: true }
                        setClips(prev => [...prev, selected])
                        setActiveTab('pexels')
                      }}
                      style={{
                        fontSize: '12px', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
                        background: 'rgba(58,90,255,0.15)', border: '1px solid rgba(58,90,255,0.3)',
                        color: 'var(--accent)', fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '8px',
                      }}
                    >
                      + Usar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pexels' && clips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {selectedCount} clipe{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''} — clique para selecionar/deselecionar
              </span>
              <button onClick={handleGenerate} disabled={!selectedCount || status === 'processing'}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))',
                  color: 'white', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600,
                  opacity: !selectedCount || status === 'processing' ? 0.6 : 1,
                }}>
                {status === 'processing' ? progress : `Gerar vídeo · ${VIDEO_PULSE_COST} pulses`}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {clips.map(clip => (
                <div key={clip.id} onClick={() => toggleClip(clip.id)}
                  style={{
                    position: 'relative', borderRadius: '8px', overflow: 'hidden',
                    aspectRatio: '9/16', cursor: 'pointer',
                    border: `2px solid ${clip.selected ? 'var(--accent)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}>
                  <img src={clip.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: clip.selected ? 'rgba(58,90,255,0.2)' : 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {clip.selected && (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: 'white' }}>
                    {clip.duration}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'done' && videoUrl && (
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <video src={videoUrl} controls style={{ maxHeight: '400px', borderRadius: '8px' }} />
            <button onClick={handleDownload}
              style={{ padding: '10px 32px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))', color: 'white', fontSize: '14px', fontFamily: 'inherit', fontWeight: 600 }}>
              Baixar vídeo
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
