import { useState } from 'react'

const SLIDE_COUNTS = [3, 4, 5]

export function CarouselPage() {
  const [slideCount, setSlideCount] = useState(4)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    // TODO: implementar geração
    setTimeout(() => setGenerating(false), 1500)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Carrossel
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Gere slides para carrossel do Instagram com IA.
          </p>
        </div>

        {/* Config + Prompt */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Número de slides */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Número de slides
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SLIDE_COUNTS.map(n => {
                const active = n === slideCount
                return (
                  <button
                    key={n}
                    onClick={() => setSlideCount(n)}
                    style={{
                      width: '56px',
                      height: '40px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: active ? 700 : 400,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: active
                        ? 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))'
                        : 'var(--bg-surface)',
                      border: active
                        ? '1px solid rgba(58,90,255,0.5)'
                        : '1px solid var(--border)',
                      color: active ? '#ffffff' : 'var(--text-secondary)',
                      boxShadow: active ? '0 2px 8px rgba(58,90,255,0.3)' : 'none',
                    }}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tema do carrossel
            </span>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
              placeholder="Descreva o tema do seu carrossel... Ex: 5 erros que empresas cometem ao usar IA"
              rows={3}
              spellCheck={false}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                padding: '12px 14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.6,
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-active)' }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>

          {/* Botão gerar */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="btn-gerar"
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: prompt.trim() && !generating ? 'pointer' : 'not-allowed',
              opacity: prompt.trim() && !generating ? 1 : 0.5,
              transition: 'opacity 0.2s',
            }}
          >
            {generating ? 'Gerando...' : 'Gerar Carrossel'}
          </button>
        </div>

        {/* Área de slides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Slides
          </span>
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px dashed var(--border)',
            borderRadius: '12px',
            padding: '60px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <SlidesIcon />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
              Seus slides aparecerão aqui
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6, margin: 0, textAlign: 'center' }}>
              Descreva o tema acima e clique em Gerar Carrossel
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}

function SlidesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3 }}>
      <rect x="2" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="11" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
