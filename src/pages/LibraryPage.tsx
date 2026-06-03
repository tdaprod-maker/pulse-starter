import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadPosts } from '../services/brandKit'
import type { PostRecord } from '../services/brandKit'
import { useStore } from '../state/useStore'

function LazyImage({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  const [active, setActive] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } },
      { rootMargin: '300px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [src])

  return (
    <img
      ref={ref}
      src={active ? src : undefined}
      alt={alt}
      style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.25s' }}
      onLoad={() => setLoaded(true)}
    />
  )
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <div style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>
        <div className="lib-shimmer" style={{ position: 'absolute', inset: 0 }} />
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="lib-shimmer" style={{ height: '11px', borderRadius: '4px', width: '75%' }} />
        <div className="lib-shimmer" style={{ height: '10px', borderRadius: '4px', width: '45%' }} />
      </div>
    </div>
  )
}

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

type LibraryItem =
  | { kind: 'post';     created_at: string; data: PostRecord }
  | { kind: 'carousel'; created_at: string; data: CarouselRecord }

export function LibraryPage() {
  const [items, setItems]           = useState<LibraryItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [selectedPost, setSelectedPost] = useState<PostRecord | null>(null)
  const [activeCarousel, setActiveCarousel] = useState<CarouselRecord | null>(null)
  const [linkedinToken, setLinkedinToken] = useState('')
  const [linkedinSub, setLinkedinSub]     = useState('')
  const [publishingId, setPublishingId]   = useState<string | null>(null)
  const [publishStatus, setPublishStatus] = useState<Record<string, 'success' | 'error'>>({})
  const navigate = useNavigate()

  useEffect(() => {
    setLinkedinToken(localStorage.getItem('linkedin_token') ?? '')
    setLinkedinSub(localStorage.getItem('linkedin_sub') ?? '')
  }, [])

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type !== 'linkedin_auth') return
      const { linkedin_token, linkedin_sub } = e.data
      if (linkedin_token && linkedin_sub) {
        localStorage.setItem('linkedin_token', linkedin_token)
        localStorage.setItem('linkedin_sub', linkedin_sub)
        setLinkedinToken(linkedin_token)
        setLinkedinSub(linkedin_sub)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const email = authData.user?.email
      if (!email) return

      const [posts, carouselsRes] = await Promise.all([
        loadPosts(email),
        supabase
          .from('carousels')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false }),
      ])

      const postItems: LibraryItem[] = posts.map(p => ({
        kind: 'post',
        created_at: p.created_at ?? '',
        data: p,
      }))

      const carouselItems: LibraryItem[] = (carouselsRes.data ?? []).map((c: CarouselRecord) => ({
        kind: 'carousel',
        created_at: c.created_at,
        data: c,
      }))

      const merged = [...postItems, ...carouselItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setItems(merged)
    } finally {
      setLoading(false)
    }
  }

  function itemKey(item: LibraryItem) {
    return item.kind + ':' + (item.kind === 'post' ? item.data.id : item.data.id)
  }

  function toggleSelect(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleDeleteItem(item: LibraryItem) {
    const key = itemKey(item)
    setDeleting(key)
    try {
      if (item.kind === 'post') {
        await supabase.from('posts').delete().eq('id', item.data.id)
      } else {
        await supabase.from('carousels').delete().eq('id', item.data.id)
      }
      setItems(prev => prev.filter(i => itemKey(i) !== key))
    } finally {
      setDeleting(null)
    }
  }

  async function handleDeleteSelected() {
    for (const key of selected) {
      const item = items.find(i => itemKey(i) === key)
      if (!item) continue
      if (item.kind === 'post') await supabase.from('posts').delete().eq('id', item.data.id)
      else await supabase.from('carousels').delete().eq('id', item.data.id)
    }
    setItems(prev => prev.filter(i => !selected.has(itemKey(i))))
    setSelected(new Set())
  }

  function handleOpenPost(post: PostRecord) {
    const isPremium = post.template_id === 'premium-single' || post.template_id === 'premium-carousel'
    if (isPremium) {
      setSelectedPost(selectedPost?.id === post.id ? null : post)
    } else {
      useStore.getState().setPendingPost(post)
      navigate('/')
    }
  }

  function handleRestoreCarousel(carousel: CarouselRecord) {
    const params = new URLSearchParams({
      restore: JSON.stringify({
        slides: carousel.slides,
        slide_images: carousel.slide_images,
        caption: carousel.caption,
        template_id: carousel.template_id,
        settings: carousel.settings,
        prompt: carousel.prompt,
      }),
    })
    navigate(`/carousel?${params.toString()}`)
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
        body: JSON.stringify({ accessToken: linkedinToken, linkedinSub, text, images: images.filter(Boolean) }),
      })
      const data = await res.json()
      if (data.success) {
        setPublishStatus(prev => ({ ...prev, [carousel.id]: 'success' }))
        setTimeout(() => setPublishStatus(prev => { const n = { ...prev }; delete n[carousel.id]; return n }), 3000)
      } else {
        throw new Error(data.error)
      }
    } catch {
      setPublishStatus(prev => ({ ...prev, [carousel.id]: 'error' }))
      setTimeout(() => setPublishStatus(prev => { const n = { ...prev }; delete n[carousel.id]; return n }), 3000)
    } finally {
      setPublishingId(null)
    }
  }

  function getPremiumCaption(post: PostRecord) {
    try { return (JSON.parse(post.image_prompt ?? '{}')).caption ?? null }
    catch { return null }
  }

  const isPremiumPost = (post: PostRecord) =>
    post.template_id === 'premium-single' || post.template_id === 'premium-carousel'

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <style>{`
        @keyframes lib-shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        .lib-shimmer {
          background: linear-gradient(90deg, var(--bg-base) 25%, var(--bg-surface) 50%, var(--bg-base) 75%);
          background-size: 200% 100%;
          animation: lib-shimmer 1.4s ease-in-out infinite;
        }
      `}</style>
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Biblioteca
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} — posts e carrosséis em ordem cronológica
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selected.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: 'rgb(239,68,68)', fontFamily: 'inherit' }}
              >
                Excluir {selected.size} selecionado{selected.size !== 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white', fontFamily: 'inherit', fontWeight: 600 }}
            >
              + Novo Post
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <p style={{ fontSize: '16px', margin: '0 0 8px', color: 'var(--text-secondary)' }}>Nenhum item gerado ainda</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Gere seu primeiro post ou carrossel no Editor</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
            {items.map(item => {
              const key = itemKey(item)
              const isSelected = selected.has(key)
              const isDeleting = deleting === key

              if (item.kind === 'post') {
                const post = item.data
                return (
                  <div
                    key={key}
                    style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onClick={() => handleOpenPost(post)}
                  >
                    {/* Checkbox */}
                    <div
                      onClick={e => { e.stopPropagation(); toggleSelect(key) }}
                      style={{ position: 'absolute', top: '8px', left: '8px', width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--border)', background: isSelected ? 'var(--accent)' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                    >
                      {isSelected && <span style={{ color: 'white', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                    </div>
                    {/* Badge */}
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: isPremiumPost(post) ? 'var(--accent)' : 'rgba(0,0,0,0.55)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', zIndex: 2, letterSpacing: '0.05em' }}>
                      {isPremiumPost(post) ? 'PREMIUM' : 'POST'}
                    </div>
                    {/* Thumbnail */}
                    {post.thumbnail_url ? (
                      <LazyImage src={post.thumbnail_url} alt="Post" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '1', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '32px', opacity: 0.2 }}>✦</span>
                      </div>
                    )}
                    {/* Info */}
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.image_prompt || post.template_id || 'Post gerado'}
                      </p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR') : ''}
                      </p>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteItem(item) }}
                      disabled={isDeleting}
                      style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgb(239,68,68)', fontSize: '10px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {isDeleting ? '...' : 'Excluir'}
                    </button>
                  </div>
                )
              }

              // Carousel card
              const carousel = item.data
              const images = JSON.parse(carousel.slide_images) as string[]
              const slides = JSON.parse(carousel.slides) as { title: string }[]
              const isPremiumCarousel = carousel.template_id === 'premium-carousel'
              return (
                <div
                  key={key}
                  onClick={() => { if (isPremiumCarousel) setActiveCarousel(carousel) }}
                  style={{ background: 'var(--bg-panel)', border: `1px solid ${isSelected ? 'rgba(58,90,255,0.5)' : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s', boxShadow: isSelected ? '0 0 0 2px rgba(58,90,255,0.2)' : 'none', position: 'relative' }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={e => { e.stopPropagation(); toggleSelect(key) }}
                    style={{ position: 'absolute', top: '8px', left: '8px', width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--border)', background: isSelected ? 'var(--accent)' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                  >
                    {isSelected && <span style={{ color: 'white', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                  </div>
                  {/* Badge */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: isPremiumCarousel ? 'var(--accent)' : 'rgba(0,0,0,0.55)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', zIndex: 2, letterSpacing: '0.05em' }}>
                    {isPremiumCarousel ? 'PREMIUM' : 'CARROSSEL'}
                  </div>
                  {/* Preview strip */}
                  <div style={{ display: 'flex', height: '110px', overflow: 'hidden' }}>
                    {images.slice(0, 3).map((img, i) => (
                      <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111' }}>
                        {img && <LazyImage src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
                      </div>
                    ))}
                    {images.length === 0 && (
                      <div style={{ flex: 1, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Sem imagens</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {carousel.title}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>
                      {slides.length} slides · {new Date(carousel.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {/* Actions */}
                  <div style={{ padding: '0 12px 10px', display: 'flex', gap: '5px' }}>
                    {!isPremiumCarousel && (
                      <button
                        onClick={e => { e.stopPropagation(); handleRestoreCarousel(carousel) }}
                        style={{ flex: 1, fontSize: '11px', padding: '5px', borderRadius: '6px', cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white', fontFamily: 'inherit' }}
                      >
                        Recarregar
                      </button>
                    )}
                    {linkedinToken ? (
                      <button
                        onClick={e => { e.stopPropagation(); handlePublishLinkedIn(carousel) }}
                        disabled={publishingId === carousel.id}
                        style={{ fontSize: '11px', padding: '5px 9px', borderRadius: '6px', cursor: publishingId === carousel.id ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 600, border: 'none', opacity: publishingId === carousel.id ? 0.6 : 1, background: publishStatus[carousel.id] === 'success' ? 'rgba(34,197,94,0.8)' : publishStatus[carousel.id] === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #0077B5, #005e93)', color: 'white' }}
                      >
                        {publishingId === carousel.id ? '...' : publishStatus[carousel.id] === 'success' ? '✓' : publishStatus[carousel.id] === 'error' ? '!' : 'LI'}
                      </button>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); window.open('/api/linkedin-auth', 'linkedin_popup', 'width=600,height=700') }}
                        style={{ fontSize: '11px', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: 'linear-gradient(135deg, #0077B5, #005e93)', border: 'none', color: 'white' }}
                      >
                        LI
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteItem(item) }}
                      disabled={isDeleting}
                      style={{ fontSize: '11px', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.6)', fontFamily: 'inherit' }}
                    >
                      {isDeleting ? '...' : '✕'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Painel legenda para post premium selecionado */}
        {selectedPost && isPremiumPost(selectedPost) && (() => {
          const cap = getPremiumCaption(selectedPost)
          return cap ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Legenda do Post</span>
                <button onClick={() => setSelectedPost(null)} style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Fechar ✕</button>
              </div>
              {selectedPost.thumbnail_url && (
                <img src={selectedPost.thumbnail_url} alt="Post" style={{ width: '200px', borderRadius: '8px', alignSelf: 'center' }} />
              )}
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Instagram</p>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{cap.instagram}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>LinkedIn</p>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{cap.linkedin}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Hashtags</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{cap.hashtags}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => navigator.clipboard.writeText(`${cap.instagram}\n\n${cap.hashtags}`)} style={{ flex: 1, fontSize: '11px', padding: '7px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Copiar Instagram</button>
                <button onClick={() => navigator.clipboard.writeText(`${cap.linkedin}\n\n${cap.hashtags}`)} style={{ flex: 1, fontSize: '11px', padding: '7px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Copiar LinkedIn</button>
              </div>
            </div>
          ) : null
        })()}
      </main>

      {/* Modal carrossel premium */}
      {activeCarousel && (() => {
        const modalImages = JSON.parse(activeCarousel.slide_images) as string[]
        const caption = activeCarousel.caption || ''
        return (
          <div
            onClick={() => setActiveCarousel(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{activeCarousel.title}</p>
                <button onClick={() => setActiveCarousel(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {modalImages.map((img, i) => (
                  <div key={i} style={{ flexShrink: 0, position: 'relative' }}>
                    <img src={img} alt={`Slide ${i + 1}`} style={{ height: '320px', borderRadius: '8px', display: 'block' }} />
                    <button
                      onClick={() => { const a = document.createElement('a'); a.href = img; a.download = `slide-${i + 1}.png`; a.click() }}
                      style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Baixar
                    </button>
                  </div>
                ))}
              </div>
              {caption && (
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Legenda</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{caption}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(caption)}
                    style={{ alignSelf: 'flex-start', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}
                  >
                    Copiar legenda
                  </button>
                </div>
              )}
              <button
                onClick={() => { modalImages.forEach((img, i) => { setTimeout(() => { const a = document.createElement('a'); a.href = img; a.download = `slide-${i + 1}.png`; a.click() }, i * 800) }) }}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Baixar todos os slides
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
