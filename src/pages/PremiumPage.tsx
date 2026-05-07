import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { turboPrompt } from '../services/gemini'

const SLIDE_OPTIONS = [3, 4, 5, 6, 7]
const PULSE_PER_SLIDE = 2

export function PremiumPage() {
  const [prompt, setPrompt] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [slides, setSlides] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [error, setError] = useState('')
  const [turbining, setTurbining] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const totalCost = slideCount * PULSE_PER_SLIDE

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

  const isIdle = status === 'idle'
  const isLoading = status === 'loading'
  const isDone = status === 'done'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-base)',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Área de resultado — scroll */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isIdle ? '0' : '32px 24px 200px',
        gap: '20px',
      }}>

        {/* Estado vazio — centralizado */}
        {isIdle && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            padding: '0 24px 180px',
          }}>
            <div style={{ fontSize: '40px', opacity: 0.2, marginBottom: '8px' }}>✦</div>
            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Posts Premium</p>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.6, textAlign: 'center', maxWidth: '400px' }}>
              Carrosséis gerados com GPT Image 2 — design completo com texto integrado, sem templates.
            </p>
          </div>
        )}

        {/* Loading inicial */}
        {isLoading && slides.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'var(--text-muted)',
            padding: '0 24px 180px',
          }}>
            <p style={{ fontSize: '14px', margin: 0 }}>Gerando slide {currentSlide} de {slideCount}...</p>
            <div style={{ width: '240px', height: '4px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(currentSlide / slideCount) * 100}%`,
                background: 'var(--accent)',
                borderRadius: '2px',
                transition: 'width 0.4s',
              }} />
            </div>
          </div>
        )}

        {/* Slides gerados */}
        {slides.map((slide, i) => (
          <div key={i} style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              backdropFilter: 'blur(4px)',
            }}>
              Slide {i + 1} de {slideCount}
            </div>
            <img src={slide} alt={`Slide ${i + 1}`} style={{ width: '100%', display: 'block' }} />
            <button
              onClick={() => handleDownload(slide, i)}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                fontFamily: 'inherit',
              }}
            >
              Baixar
            </button>
            {isLoading && i === slides.length - 1 && (
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(0,0,0,0.65)',
                color: 'var(--accent)',
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                backdropFilter: 'blur(4px)',
              }}>
                Gerando próximo...
              </div>
            )}
          </div>
        ))}

        {isDone && (
          <button
            onClick={handleDownloadAll}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            Baixar todos os {slideCount} slides
          </button>
        )}
      </div>

      {/* Input fixo no rodapé — estilo ChatGPT */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px 24px',
        background: 'linear-gradient(to top, var(--bg-base) 80%, transparent)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}>
        {error && (
          <p style={{ fontSize: '12px', color: 'rgb(239,68,68)', margin: 0 }}>{error}</p>
        )}

        {/* Seletor de slides */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}>Slides:</span>
          {SLIDE_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setSlideCount(n)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
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
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
            · {totalCost} pulses
          </span>
        </div>

        {/* Caixa de prompt */}
        <div style={{
          width: '100%',
          maxWidth: '720px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
        }}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
            }}
            placeholder="Descreva o carrossel que deseja criar..."
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
              maxHeight: '160px',
              overflowY: 'auto',
            }}
          />
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={handleTurbo}
              disabled={!prompt.trim() || turbining}
              title="Turbinar prompt"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-base)',
                color: 'var(--text-muted)',
                fontSize: '16px',
                cursor: !prompt.trim() || turbining ? 'default' : 'pointer',
                opacity: !prompt.trim() || turbining ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚡
            </button>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="btn-gerar"
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '8px',
                border: 'none',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: !prompt.trim() || isLoading ? 'default' : 'pointer',
                opacity: !prompt.trim() || isLoading ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {isLoading ? `${currentSlide}/${slideCount}...` : 'Gerar'}
            </button>
          </div>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          ⌘ + Enter para gerar · GPT Image 2
        </p>
      </div>
    </div>
  )
}
