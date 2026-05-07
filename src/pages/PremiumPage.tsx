import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { turboPrompt } from '../services/gemini'

const SLIDE_OPTIONS = [3, 4, 5, 6, 7]
const PULSE_COST_PREMIUM = 5

export function PremiumPage() {
  const [prompt, setPrompt] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [slides, setSlides] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [error, setError] = useState('')
  const [turbining, setTurbining] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleTurbo() {
    if (!prompt.trim() || turbining) return
    setTurbining(true)
    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email ?? ''
      const brand = email ? await loadBrandConfig(email) : null
      const enriched = await turboPrompt(prompt, brand ? {
        businessName: brand.business_name || brand.brand_name,
        segment: brand.segment,
        tone: brand.tone,
        visualStyle: brand.visual_style ?? undefined,
        brandDescription: brand.brand_description ?? undefined,
      } : undefined)
      setPrompt(enriched)
    } catch (e) {
      console.error(e)
    } finally {
      setTurbining(false)
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || status === 'loading') return
    setStatus('loading')
    setSlides([])
    setCurrentSlide(0)
    setError('')

    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email ?? ''
      const brand = email ? await loadBrandConfig(email) : null

      const styleContext = [
        brand?.segment ? `Segment: ${brand.segment}` : '',
        brand?.tone ? `Tone: ${brand.tone}` : '',
        brand?.visual_style ? `Visual style: ${brand.visual_style}` : '',
        brand?.brand_description ? `Brand: ${brand.brand_description}` : '',
        brand?.color_primary ? `Primary color: ${brand.color_primary}` : '',
      ].filter(Boolean).join('. ')

      const generated: string[] = []

      for (let i = 1; i <= slideCount; i++) {
        setCurrentSlide(i)
        const slidePromptText = i === 1
          ? `CAPA do carrossel: ${prompt}. Crie um slide de abertura impactante com título principal.`
          : i === slideCount
          ? `SLIDE FINAL do carrossel sobre: ${prompt}. Slide de encerramento com call-to-action.`
          : `SLIDE ${i} de ${slideCount} do carrossel sobre: ${prompt}. Conteúdo intermediário, ponto ${i - 1} do tema.`

        const res = await fetch('/api/generate-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: slidePromptText,
            slideIndex: i,
            totalSlides: slideCount,
            styleContext,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao gerar slide')
        }

        const data2 = await res.json()
        generated.push(data2.image)
        setSlides([...generated])
      }

      setStatus('done')
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar carrossel')
      setStatus('error')
    }
  }

  function handleDownload(imageUrl: string, index: number) {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `premium-slide-${index + 1}.png`
    link.click()
  }

  function handleDownloadAll() {
    slides.forEach((slide, i) => {
      setTimeout(() => handleDownload(slide, i), i * 300)
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Painel esquerdo — input */}
        <div style={{
          width: '380px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          gap: '20px',
          overflowY: 'auto',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Posts Premium
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Gerado com GPT Image 2 · {PULSE_COST_PREMIUM} pulses por carrossel
            </p>
          </div>

          {/* Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Descreva o carrossel
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ex: 5 dicas para treinar em casa sem equipamento, estilo moderno e motivacional..."
                rows={6}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  padding: '12px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-active)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>
            <button
              onClick={handleTurbo}
              disabled={!prompt.trim() || turbining}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: !prompt.trim() || turbining ? 'default' : 'pointer',
                opacity: !prompt.trim() || turbining ? 0.5 : 1,
                alignSelf: 'flex-start',
              }}
            >
              <span>⚡</span>
              {turbining ? 'Turbinando...' : 'Turbinar prompt'}
            </button>
          </div>

          {/* Número de slides */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Número de slides
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SLIDE_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setSlideCount(n)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: slideCount === n ? 'var(--accent)' : 'var(--border)',
                    background: slideCount === n ? 'var(--accent-glow)' : 'var(--bg-surface)',
                    color: slideCount === n ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: slideCount === n ? 600 : 400,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Botão gerar */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || status === 'loading'}
            className="btn-gerar"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: !prompt.trim() || status === 'loading' ? 'default' : 'pointer',
              opacity: !prompt.trim() || status === 'loading' ? 0.6 : 1,
            }}
          >
            {status === 'loading'
              ? `Gerando slide ${currentSlide} de ${slideCount}...`
              : `✦ Gerar Carrossel · ${PULSE_COST_PREMIUM} pulses`}
          </button>

          {error && (
            <p style={{ fontSize: '12px', color: 'rgb(239,68,68)', margin: 0 }}>{error}</p>
          )}

          {status === 'done' && slides.length > 0 && (
            <button
              onClick={handleDownloadAll}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Baixar todos os slides
            </button>
          )}
        </div>

        {/* Área de resultado */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
        }}>
          {status === 'idle' && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '48px', opacity: 0.3 }}>✦</div>
              <p style={{ fontSize: '14px', margin: 0 }}>Descreva seu carrossel e clique em Gerar</p>
              <p style={{ fontSize: '12px', margin: 0, opacity: 0.6 }}>Os slides aparecem aqui conforme são gerados</p>
            </div>
          )}

          {status === 'loading' && slides.length === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '14px' }}>Gerando slide {currentSlide} de {slideCount}...</div>
              <div style={{ width: '200px', height: '4px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(currentSlide / slideCount) * 100}%`,
                  background: 'var(--accent)',
                  borderRadius: '2px',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          )}

          {slides.map((slide, i) => (
            <div key={i} style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                backdropFilter: 'blur(4px)',
              }}>
                Slide {i + 1}
              </div>
              <img
                src={slide}
                alt={`Slide ${i + 1}`}
                style={{ width: '100%', display: 'block' }}
              />
              <button
                onClick={() => handleDownload(slide, i)}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  fontFamily: 'inherit',
                }}
              >
                Baixar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
