import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface CarouselRecord {
  id: string
  title: string
  prompt: string
  template_id: string
  slides: string
  slide_images: string
  caption: string
  settings: string
  created_at: string
}

export function CarouselLibraryPage() {
  const [carousels, setCarousels] = useState<CarouselRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [linkedinToken, setLinkedinToken] = useState<string>('')
  const [linkedinSub, setLinkedinSub] = useState<string>('')
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [publishStatus, setPublishStatus] = useState<Record<string, 'success' | 'error'>>({})
  const navigate = useNavigate()

  useEffect(() => {
    loadCarousels()
  }, [])

  useEffect(() => {
    setLinkedinToken(localStorage.getItem('linkedin_token') ?? '')
    setLinkedinSub(localStorage.getItem('linkedin_sub') ?? '')
  }, [])

  async function loadCarousels() {
    setLoading(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const email = authData.user?.email
      if (!email) return

      const { data, error } = await supabase
        .from('carousels')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCarousels(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await supabase.from('carousels').delete().eq('id', id)
      setCarousels(prev => prev.filter(c => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function handleDeleteSelected() {
    for (const id of selected) {
      await supabase.from('carousels').delete().eq('id', id)
    }
    setCarousels(prev => prev.filter(c => !selected.has(c.id)))
    setSelected(new Set())
  }

  async function handlePublishLinkedIn(carousel: CarouselRecord) {
    if (!linkedinToken || !linkedinSub || publishingId) return
    setPublishingId(carousel.id)
    try {
      const images = JSON.parse(carousel.slide_images) as string[]
      const text = carousel.caption || carousel.prompt || carousel.title

      const res = await fetch('/api/linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: linkedinToken,
          linkedinSub,
          text,
          images: images.filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPublishStatus(prev => ({ ...prev, [carousel.id]: 'success' }))
        setTimeout(() => setPublishStatus(prev => { const n = { ...prev }; delete n[carousel.id]; return n }), 3000)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error('[CarouselLibrary] erro ao publicar:', err)
      setPublishStatus(prev => ({ ...prev, [carousel.id]: 'error' }))
      setTimeout(() => setPublishStatus(prev => { const n = { ...prev }; delete n[carousel.id]; return n }), 3000)
    } finally {
      setPublishingId(null)
    }
  }

  function handleRestore(carousel: CarouselRecord) {
    const params = new URLSearchParams({
      restore: JSON.stringify({
        slides: carousel.slides,
        slide_images: carousel.slide_images,
        caption: carousel.caption,
        template_id: carousel.template_id,
        settings: carousel.settings,
        prompt: carousel.prompt,
      })
    })
    navigate(`/carousel?${params.toString()}`)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Biblioteca de Carrosséis
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {carousels.length} carrossel{carousels.length !== 1 ? 'is' : ''} salvos
            </p>
          </div>
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              style={{
                fontSize: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
                color: 'rgb(239,68,68)', fontFamily: 'inherit',
              }}
            >
              Excluir {selected.size} selecionado{selected.size !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Carregando...
          </div>
        ) : carousels.length === 0 ? (
          <div style={{
            background: 'var(--bg-panel)', border: '1px dashed var(--border)', borderRadius: '12px',
            padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)',
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>Nenhum carrossel salvo ainda</p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', opacity: 0.6 }}>
              Gere um carrossel e clique em "Salvar" para aparecer aqui
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {carousels.map(carousel => {
              const images = JSON.parse(carousel.slide_images) as string[]
              const slides = JSON.parse(carousel.slides) as { title: string }[]
              const isSelected = selected.has(carousel.id)
              return (
                <div
                  key={carousel.id}
                  style={{
                    background: 'var(--bg-panel)',
                    border: `1px solid ${isSelected ? 'rgba(58,90,255,0.5)' : 'var(--border)'}`,
                    borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 0 0 2px rgba(58,90,255,0.2)' : 'none',
                  }}
                >
                  {/* Preview — primeiros 3 slides em miniatura */}
                  <div style={{ display: 'flex', height: '120px', overflow: 'hidden' }}>
                    {images.slice(0, 3).map((img, i) => (
                      <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111' }}>
                        {img && (
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
                      </div>
                    ))}
                    {images.length === 0 && (
                      <div style={{ flex: 1, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Sem imagens</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '12px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {carousel.title}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {slides.length} slides · {carousel.template_id} · {new Date(carousel.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Ações */}
                  <div style={{ padding: '0 12px 12px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleRestore(carousel)}
                      style={{
                        flex: 1, fontSize: '11px', padding: '6px', borderRadius: '6px', cursor: 'pointer',
                        background: 'var(--accent)', border: 'none', color: 'white', fontFamily: 'inherit',
                      }}
                    >
                      Recarregar
                    </button>
                    {linkedinToken ? (
                      <button
                        onClick={() => handlePublishLinkedIn(carousel)}
                        disabled={publishingId === carousel.id}
                        style={{
                          fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: publishingId === carousel.id ? 'default' : 'pointer',
                          fontFamily: 'inherit', fontWeight: 600, border: 'none',
                          opacity: publishingId === carousel.id ? 0.6 : 1,
                          background: publishStatus[carousel.id] === 'success' ? 'rgba(34,197,94,0.8)' : publishStatus[carousel.id] === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #0077B5, #005e93)',
                          color: 'white',
                        }}
                      >
                        {publishingId === carousel.id ? '...' : publishStatus[carousel.id] === 'success' ? '✓' : publishStatus[carousel.id] === 'error' ? '!' : 'LinkedIn'}
                      </button>
                    ) : (
                      <button
                        onClick={() => window.open('/api/linkedin-auth', '_blank', 'width=600,height=700')}
                        style={{
                          fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                          fontFamily: 'inherit', fontWeight: 600,
                          background: 'linear-gradient(135deg, #0077B5, #005e93)',
                          border: 'none', color: 'white',
                        }}
                      >
                        LinkedIn
                      </button>
                    )}
                    <button
                      onClick={() => toggleSelect(carousel.id)}
                      style={{
                        fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                        background: isSelected ? 'rgba(58,90,255,0.15)' : 'var(--bg-surface)',
                        border: `1px solid ${isSelected ? 'rgba(58,90,255,0.4)' : 'var(--border)'}`,
                        color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)', fontFamily: 'inherit',
                      }}
                    >
                      {isSelected ? '✓' : 'Sel.'}
                    </button>
                    <button
                      onClick={() => handleDelete(carousel.id)}
                      disabled={deleting === carousel.id}
                      style={{
                        fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                        background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                        color: 'rgba(239,68,68,0.6)', fontFamily: 'inherit',
                      }}
                    >
                      {deleting === carousel.id ? '...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
