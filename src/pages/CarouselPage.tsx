import { useState } from 'react'
import { generateCarouselContent } from '../services/gemini'
import type { CarouselSlide } from '../services/gemini'
import { generateImage } from '../services/replicate'

const SLIDE_COUNTS = [3, 4, 5]

const TYPE_LABEL: Record<CarouselSlide['type'], string> = {
  cover:   'CAPA',
  content: 'CONTEÚDO',
  cta:     'CTA',
}

const TYPE_COLOR: Record<CarouselSlide['type'], string> = {
  cover:   'rgba(58,90,255,0.85)',
  content: 'rgba(30,30,30,0.75)',
  cta:     'rgba(255,111,94,0.85)',
}

export function CarouselPage() {
  const [slideCount, setSlideCount] = useState(4)
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [slideImages, setSlideImages] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!prompt.trim() || status === 'loading') return
    setStatus('loading')
    setSlides([])
    setSlideImages([])
    setCaption('')
    try {
      const result = await generateCarouselContent(prompt, slideCount)
      setSlides(result.slides)
      setCaption(result.caption)
      const images = await Promise.all(
        result.slides.map(s => generateImage(s.imagePrompt).catch(() => ''))
      )
      setSlideImages(images)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isLoading = status === 'loading'

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
                      width: '56px', height: '40px', borderRadius: '8px',
                      fontSize: '15px', fontWeight: active ? 700 : 400,
                      fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                      background: active
                        ? 'linear-gradient(135deg, rgba(58,90,255,0.9), rgba(91,143,212,0.8))'
                        : 'var(--bg-surface)',
                      border: active ? '1px solid rgba(58,90,255,0.5)' : '1px solid var(--border)',
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
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                padding: '12px 14px', fontFamily: 'inherit', resize: 'none', outline: 'none',
                lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-active)' }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>

          {/* Botão gerar */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="btn-gerar"
            style={{
              width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
              color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
              cursor: prompt.trim() && !isLoading ? 'pointer' : 'not-allowed',
              opacity: prompt.trim() && !isLoading ? 1 : 0.5, transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? 'Gerando...' : 'Gerar Carrossel'}
          </button>

          {status === 'error' && (
            <p style={{ fontSize: '13px', color: '#ef4444', margin: 0, textAlign: 'center' }}>
              Erro ao gerar o carrossel. Tente novamente.
            </p>
          )}
        </div>

        {/* Área de slides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Slides
          </span>

          {slides.length === 0 ? (
            <div style={{
              background: 'var(--bg-panel)', border: '1px dashed var(--border)', borderRadius: '12px',
              padding: '60px 24px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}>
              {isLoading ? <Spinner /> : <SlidesIcon />}
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                {isLoading ? 'Gerando slides e buscando imagens...' : 'Seus slides aparecerão aqui'}
              </p>
              {!isLoading && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6, margin: 0, textAlign: 'center' }}>
                  Descreva o tema acima e clique em Gerar Carrossel
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative', aspectRatio: '1', borderRadius: '10px',
                    overflow: 'hidden', background: '#111',
                  }}
                >
                  {/* Imagem de fundo */}
                  {slideImages[i] && (
                    <img
                      src={slideImages[i]}
                      alt=""
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  {/* Overlay escuro */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.1) 100%)' }} />

                  {/* Badge tipo */}
                  <div style={{
                    position: 'absolute', top: '10px', left: '10px',
                    background: TYPE_COLOR[slide.type],
                    backdropFilter: 'blur(4px)',
                    color: '#fff', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.1em', padding: '3px 8px', borderRadius: '4px',
                  }}>
                    {TYPE_LABEL[slide.type]}
                  </div>

                  {/* Número do slide */}
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600,
                  }}>
                    {i + 1}/{slides.length}
                  </div>

                  {/* Texto */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '12px',
                  }}>
                    <p style={{
                      margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700,
                      lineHeight: 1.3, textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    }}>
                      {slide.title}
                    </p>
                    {slide.body && (
                      <p style={{
                        margin: '4px 0 0', color: 'rgba(255,255,255,0.8)',
                        fontSize: '11px', lineHeight: 1.4,
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      }}>
                        {slide.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legenda */}
        {caption && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Legenda
              </span>
              <button
                onClick={handleCopyCaption}
                style={{
                  fontSize: '12px', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  background: copied ? 'rgba(34,197,94,0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                  color: copied ? 'rgb(34,197,94)' : 'var(--text-secondary)',
                }}
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <div style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px',
              padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)',
              lineHeight: 1.7, whiteSpace: 'pre-wrap',
            }}>
              {caption}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

function SlidesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3, color: 'var(--text-muted)' }}>
      <rect x="2" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="11" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M14 3a11 11 0 0 1 11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
