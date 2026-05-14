import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadPosts } from '../services/brandKit'
import type { PostRecord } from '../services/brandKit'

export function PostLibraryPage() {
  const [posts, setPosts] = useState<PostRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email
      if (!email) return
      const data2 = await loadPosts(email)
      setPosts(data2)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await supabase.from('posts').delete().eq('id', id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function handleDeleteSelected() {
    for (const id of selected) {
      await supabase.from('posts').delete().eq('id', id)
    }
    setPosts(prev => prev.filter(p => !selected.has(p.id ?? '')))
    setSelected(new Set())
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleOpen(post: PostRecord) {
    if (post.template_id === 'premium-single' || post.template_id === 'premium-carousel') {
      // Posts Premium — abre na aba Premium com a imagem salva
      navigate('/premium')
    } else {
      // Posts do editor — abre no editor
      navigate('/')
    }
  }

  const isPremium = (post: PostRecord) =>
    post.template_id === 'premium-single' || post.template_id === 'premium-carousel'

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Histórico de Posts
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''} gerado{posts.length !== 1 ? 's' : ''}
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Carregando...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <p style={{ fontSize: '16px', margin: '0 0 8px', color: 'var(--text-secondary)' }}>Nenhum post gerado ainda</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Gere seu primeiro post no Editor ou em Posts Premium</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {posts.map(post => (
              <div
                key={post.id}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: selected.has(post.id ?? '') ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onClick={() => handleOpen(post)}
              >
                {/* Checkbox */}
                <div
                  onClick={e => { e.stopPropagation(); toggleSelect(post.id ?? '') }}
                  style={{ position: 'absolute', top: '8px', left: '8px', width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--border)', background: selected.has(post.id ?? '') ? 'var(--accent)' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                >
                  {selected.has(post.id ?? '') && <span style={{ color: 'white', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                </div>

                {/* Badge Premium */}
                {isPremium(post) && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--accent)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', zIndex: 2, letterSpacing: '0.05em' }}>
                    PREMIUM
                  </div>
                )}

                {/* Thumbnail */}
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt="Post" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
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

                {/* Botão excluir */}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(post.id ?? '') }}
                  disabled={deleting === post.id}
                  style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgb(239,68,68)', fontSize: '10px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {deleting === post.id ? '...' : 'Excluir'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
