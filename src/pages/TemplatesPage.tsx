import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadPosts } from '../services/brandKit'
import type { PostRecord } from '../services/brandKit'

export function TemplatesPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostRecord[]>([])
  const [loading, setLoading] = useState(true)

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
                onClick={() => navigate('/')}
                style={{
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
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
              >
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
