import { useState } from 'react'
import { useStore } from '../state/useStore'

export function CaptionPanel() {
  const caption = useStore((s) => s.caption)
  const [tab, setTab] = useState<'instagram' | 'linkedin'>('instagram')

  if (!caption) return null

  return (
    <div style={{
      width: '100%',
      maxWidth: '700px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        Legenda
      </span>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {(['instagram', 'linkedin'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, fontSize: '11px', padding: '5px', borderRadius: '6px',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              transition: 'all 0.15s',
              ...(tab === t
                ? { background: 'var(--accent)', border: 'none', color: 'white' }
                : { background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }),
            }}
          >
            {t === 'instagram' ? 'Instagram' : 'LinkedIn'}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        readOnly
        value={caption[tab]}
        rows={5}
        style={{
          width: '100%', background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: '8px',
          color: 'var(--text-primary)', fontSize: '12px',
          padding: '8px 10px', fontFamily: 'inherit',
          resize: 'none', outline: 'none', lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
      />

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
    </div>
  )
}
