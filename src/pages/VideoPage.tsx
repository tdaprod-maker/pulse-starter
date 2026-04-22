// @ts-nocheck
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'

interface VideoClip {
  id: number
  url: string
  thumbnail: string
  duration: number
}

export function VideoPage() {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'searching' | 'error'>('idle')
  const [clips, setClips] = useState<VideoClip[]>([])
  const [error, setError] = useState('')
  const [turboing, setTurboing] = useState(false)

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

  async function handleSearch() {
    if (!prompt.trim() || status === 'searching') return
    setStatus('searching')
    setError('')
    setClips([])
    try {
      const res = await fetch(`/api/search-videos?query=${encodeURIComponent(prompt)}&per_page=9&orientation=portrait`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setClips(data.videos)
      setStatus('idle')
    } catch {
      setError('Erro ao buscar vídeos. Tente novamente.')
      setStatus('error')
    }
  }

  async function handleDownload(url: string, id: number) {
    const a = document.createElement('a')
    a.href = url
    a.download = `clip-${id}.mp4`
    a.target = '_blank'
    a.click()
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Clipes para Vídeo
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Busque clipes gratuitos do Pexels para usar nos seus Reels e Stories
          </p>
        </div>

        {/* Busca */}
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
            <button
              onClick={handleTurbo}
              disabled={turboing || !prompt.trim()}
              title="Traduzir para inglês com IA"
              style={{
                padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,202,29,0.3)',
                background: 'rgba(255,202,29,0.1)', color: '#FFCA1D', cursor: 'pointer',
                fontSize: '14px', opacity: !prompt.trim() ? 0.4 : 1,
              }}
            >
              {turboing ? '...' : '⚡'}
            </button>
            <button
              onClick={handleSearch}
              disabled={!prompt.trim() || status === 'searching'}
              style={{
                padding: '10px 20px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white', fontSize: '13px',
                fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
                opacity: !prompt.trim() || status === 'searching' ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {status === 'searching' ? 'Buscando...' : 'Buscar clipes'}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
            Use o ⚡ para traduzir seu tema para inglês e encontrar mais resultados. Baixe os clipes e monte seu vídeo no Instagram ou CapCut.
          </p>
        </div>

        {error && <p style={{ fontSize: '13px', color: 'rgb(239,68,68)', margin: 0 }}>{error}</p>}

        {/* Grid de clipes */}
        {clips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {clips.length} clipes encontrados — clique para baixar
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {clips.map(clip => (
                <div
                  key={clip.id}
                  style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '9/16', cursor: 'pointer' }}
                  onClick={() => handleDownload(clip.url, clip.id)}
                >
                  <img src={clip.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  >
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '6px' }}>
                      ↓ Baixar
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: 'white' }}>
                    {clip.duration}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
