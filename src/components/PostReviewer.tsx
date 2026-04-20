import { useState, type RefObject } from 'react'
import type Konva from 'konva'
import type { Template } from '../state/useStore'
import { useStore } from '../state/useStore'
import { calcAutoScale } from '../engine/CanvasEngine'
import { reviewPost, type PostReview } from '../services/gemini'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { debitToken, PULSE_COSTS, notifyBalanceUpdate } from '../services/tokens'

interface PostReviewerProps {
  stageRef: RefObject<Konva.Stage | null>
  template: Template
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#FFCA1D' : '#ef4444'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color }}>{score}/10</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score * 10}%`, background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

export function PostReviewer({ stageRef, template }: PostReviewerProps) {
  const caption = useStore(s => s.caption)
  const [reviewing, setReviewing] = useState(false)
  const [review, setReview] = useState<PostReview | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  async function handleReview() {
    if (!stageRef.current || reviewing) return
    setReviewing(true)
    setError('')
    setOpen(true)
    try {
      // Exporta o canvas como base64
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
      const imageBase64 = stageRef.current.toDataURL({ pixelRatio, mimeType: 'image/jpeg', quality: 0.85 })
      selectedNodes.forEach(({ node, stroke, strokeWidth }) => {
        node.stroke(stroke)
        node.strokeWidth(strokeWidth)
      })
      stageRef.current.batchDraw()

      // Carrega contexto da marca
      const { data: authData } = await supabase.auth.getSession()
      const email = authData.session?.user?.email ?? ''
      const brand = email ? await loadBrandConfig(email) : null

      // Busca textos do template
      const el = template.elements?.find(e => e.id === 'title' || e.id === 'phrase' || e.id === 'line1')
      const titulo = (el as any)?.text ?? ''

      // Debita 1 pulse pela revisão
      const { data: reviewAuthData } = await supabase.auth.getSession()
      const reviewEmail = reviewAuthData.session?.user?.email ?? ''
      if (reviewEmail) {
        const { success } = await debitToken(reviewEmail, PULSE_COSTS.REVIEW_POST)
        if (!success) {
          setError('Pulses insuficientes para revisar o post.')
          setReviewing(false)
          return
        }
        notifyBalanceUpdate()
      }

      const result = await reviewPost({
        imageBase64,
        titulo,
        legenda: caption?.instagram ?? '',
        hashtags: caption?.hashtags ?? '',
        segmento: brand?.segment,
        tone: brand?.tone,
      })
      setReview(result)
    } catch {
      setError('Não foi possível analisar o post. Tente novamente.')
    } finally {
      setReviewing(false)
    }
  }

  if (!caption) return null

  return (
    <div style={{ width: '100%', maxWidth: '700px' }}>
      {!open ? (
        <button
          onClick={handleReview}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
            background: 'rgba(255,202,29,0.08)', border: '1px solid rgba(255,202,29,0.25)',
            color: '#FFCA1D', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          ⚡ Revisar post com IA
        </button>
      ) : (
        <div style={{
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ⚡ Revisão do Post
            </span>
            <button onClick={() => { setOpen(false); setReview(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}>
              ×
            </button>
          </div>

          {reviewing && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Analisando seu post...
            </div>
          )}

          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>
          )}

          {review && !reviewing && (
            <>
              {/* Resumo */}
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                "{review.resumo}"
              </p>

              {/* Scores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ScoreBar score={review.score_visual} label="Visual" />
                <ScoreBar score={review.score_legenda} label="Legenda" />
              </div>

              {/* Pontos positivos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  O que está bom
                </span>
                {review.pontos_positivos.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22c55e', fontSize: '12px', marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>

              {/* Sugestões */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFCA1D', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Sugestões de melhoria
                </span>
                {review.sugestoes.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#FFCA1D', fontSize: '12px', marginTop: '1px' }}>→</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Reanalisar */}
              <button onClick={handleReview}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'inherit' }}>
                Reanalisar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
