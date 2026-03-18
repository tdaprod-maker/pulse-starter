import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadPosts, deletePost } from '../services/brandKit'
import type { PostRecord } from '../services/brandKit'
import { useStore } from '../state/useStore'

export function TemplatesPage() {
  const navigate = useNavigate()
  const { setPendingPost } = useStore()
  const [posts, setPosts] = useState<PostRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      if (email) {
        loadPosts(email).then(p => {
          setPosts(p)
          setLoading(false)
        })
      }
    })
  }, [])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px',
      background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)', margin: 0 }}>
              Histórico de Posts
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)',
              marginTop: '6px' }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''} gerado{posts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'var(--accent)', border: 'none',
              color: 'white', fontSize: '13px', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            + Novo Post
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Carregando...
          </p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)',
              marginBottom: '8px' }}>
              Nenhum post gerado ainda
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Gere seu primeiro post no Editor
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => { setPendingPost(post); navigate('/') }}
                style={{
                  position: 'relative',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-active)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                  const btn = e.currentTarget.querySelector('button')
                  if (btn) (btn as HTMLButtonElement).style.opacity = '1'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                  const btn = e.currentTarget.querySelector('button')
                  if (btn && deletingId !== post.id) (btn as HTMLButtonElement).style.opacity = '0'
                }}
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (!confirm('Deletar este post?')) return
                    setDeletingId(post.id!)
                    await deletePost(post.id!)
                    setPosts(prev => prev.filter(p => p.id !== post.id))
                    setDeletingId(null)
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 10,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.85)',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    opacity: deletingId === post.id ? 1 : 0,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => {
                    if (deletingId !== post.id) e.currentTarget.style.opacity = '0'
                  }}
                >
                  ×
                </button>

                {/* Thumbnail */}
                <div style={{
                  aspectRatio: '1',
                  background: 'var(--bg-surface)',
                  overflow: 'hidden',
                }}>
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt="thumbnail"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)', fontSize: '11px',
                    }}>
                      sem preview
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '10px 12px' }}>
                  <p style={{
                    fontSize: '11px', fontWeight: 600,
                    color: 'var(--text-secondary)', margin: 0,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {post.template_id.replace(/-/g, ' ')}
                  </p>
                  <p style={{
                    fontSize: '10px', color: 'var(--text-muted)',
                    margin: '4px 0 0',
                  }}>
                    {new Date(post.created_at!).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
