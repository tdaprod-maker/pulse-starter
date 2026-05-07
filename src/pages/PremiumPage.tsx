import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { loadBrandConfig } from '../services/brandKit'
import { turboPrompt } from '../services/gemini'

const SLIDE_OPTIONS = [3, 4, 5, 6, 7]
const PULSE_SINGLE = 4
const PULSE_PER_SLIDE = 2

type Mode = 'single' | 'carousel'

const PROPORTIONS = [
  { label: '1:1', width: 1024, height: 1024, display: '1080×1080' },
  { label: '4:5', width: 832, height: 1024, display: '1080×1350' },
  { label: '9:16', width: 576, height: 1024, display: '1080×1920' },
  { label: '16:9', width: 1024, height: 576, display: '1920×1080' },
]

export function PremiumPage() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<Mode>('single')
  const [slideCount, setSlideCount] = useState(3)
  const [slides, setSlides] = useState<{ image: string; label: string }[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [error, setError] = useState('')
  const [turbining, setTurbining] = useState(false)
  const [visualReferences, setVisualReferences] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const totalCost = mode === 'single' ? PULSE_SINGLE : slideCount * PULSE_PER_SLIDE

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

  async function generateImage(slidePrompt: string, slideIndex: number, totalSlides: number, styleContext: string, size: string) {
    const res = await fetch('/api/generate-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: slidePrompt,
        slideIndex,
        totalSlides,
        styleContext,
        size,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Erro ao gerar imagem')
    }
    const data = await res.json()
    return data.image
  }

  async function handleGenerate() {
    if (!prompt.trim() || status === 'loading') return
    setStatus('loading')
    setSlides([])
    setCurrentStep(0)
    setError('')

    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email ?? ''
      const brand = email ? await loadBrandConfig(email) : null
      if (brand?.visual_references?.length) setVisualReferences(brand.visual_references)

      const styleContext = [
        brand?.segment ? `Segment: ${brand.segment}` : '',
        brand?.tone ? `Tone: ${brand.tone}` : '',
        brand?.visual_style ? `Visual style: ${brand.visual_style}` : '',
        brand?.brand_description ? `Brand: ${brand.brand_description}` : '',
        brand?.color_primary ? `Primary color: ${brand.color_primary}` : '',
      ].filter(Boolean).join('. ')

      const generated: { image: string; label: string }[] = []

      if (mode === 'single') {
        setTotalSteps(PROPORTIONS.length)
        for (let i = 0; i < PROPORTIONS.length; i++) {
          setCurrentStep(i + 1)
          const prop = PROPORTIONS[i]
          const singlePrompt = `Create a professional single Instagram post. Content: ${prompt}. Format: ${prop.label} (${prop.display}). Make it visually impactful with text integrated into the design.`
          const image = await generateImage(singlePrompt, 1, 1, styleContext, `${prop.width}x${prop.height}`)
          generated.push({ image, label: prop.label })
          setSlides([...generated])
        }
      } else {
        setTotalSteps(slideCount)
        for (let i = 1; i <= slideCount; i++) {
          setCurrentStep(i)
          const slidePromptText = i === 1
            ? `COVER slide of carousel: ${prompt}. Impactful opening slide with main title. Format 4:5 vertical.`
            : i === slideCount
            ? `FINAL slide of carousel about: ${prompt}. Closing slide with call-to-action. Format 4:5 vertical.`
            : `SLIDE ${i} of ${slideCount} of carousel about: ${prompt}. Point ${i - 1} of the topic. Format 4:5 vertical.`
          const image = await generateImage(slidePromptText, i, slideCount, styleContext, '832x1024')
          generated.push({ image, label: `Slide ${i}` })
          setSlides([...generated])
        }
      }

      setStatus('done')
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar')
      setStatus('error')
    }
  }

  function handleDownload(imageUrl: string, label: string) {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `premium-${label.toLowerCase().replace(/\s/g, '-')}.png`
    link.click()
  }

  function handleDownloadAll() {
    slides.forEach((slide, i) => {
      setTimeout(() => handleDownload(slide.image, slide.label), i * 300)
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
      {/* Área de resultado */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isIdle ? '0' : '32px 24px 220px',
        gap: '20px',
      }}>
        {isIdle && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            padding: '0 24px 200px',
          }}>
            <div style={{ fontSize: '40px', opacity: 0.5, marginBottom: '8px', color: 'var(--accent)' }}>✦</div>
            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Posts Premium</p>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.8, textAlign: 'center', maxWidth: '420px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Design completo gerado por GPT Image 2 — texto integrado à imagem, sem templates.
            </p>
          </div>
        )}

        {isLoading && slides.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'var(--text-muted)',
            padding: '0 24px 200px',
          }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              {mode === 'single' ? `Gerando proporção ${currentStep} de ${totalSteps}...` : `Gerando slide ${currentStep} de ${totalSteps}...`}
            </p>
            <div style={{ width: '240px', height: '4px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(currentStep / totalSteps) * 100}%`,
                background: 'var(--accent)',
                borderRadius: '2px',
                transition: 'width 0.4s',
              }} />
            </div>
          </div>
        )}

        {/* Grid para post único, coluna para carrossel */}
        {slides.length > 0 && (
          <div style={{
            width: '100%',
            maxWidth: mode === 'single' ? '900px' : '520px',
            display: mode === 'single' ? 'grid' : 'flex',
            gridTemplateColumns: mode === 'single' ? 'repeat(2, 1fr)' : undefined,
            flexDirection: mode === 'single' ? undefined : 'column',
            gap: '16px',
            alignItems: mode === 'single' ? undefined : 'center',
          }}>
            {slides.map((slide, i) => (
              <div key={i} style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                width: mode === 'single' ? '100%' : '100%',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(4px)',
                }}>
                  {slide.label}
                </div>
                <img src={slide.image} alt={slide.label} style={{ width: '100%', display: 'block' }} />
                <button
                  onClick={() => handleDownload(slide.image, slide.label)}
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.65)',
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
                {isLoading && i === slides.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.65)',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(4px)',
                  }}>
                    Gerando próximo...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
            Baixar tudo ({slides.length} imagens)
          </button>
        )}
      </div>

      {/* Input fixo no rodapé */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 24px 24px',
        background: 'linear-gradient(to top, var(--bg-base) 75%, transparent)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}>
        {error && (
          <p style={{ fontSize: '12px', color: 'rgb(239,68,68)', margin: 0 }}>{error}</p>
        )}

        {/* Seletor de modo e slides */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setMode('single')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: mode === 'single' ? 'var(--accent)' : 'var(--border)',
              background: mode === 'single' ? 'var(--accent-glow)' : 'var(--bg-surface)',
              color: mode === 'single' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: mode === 'single' ? 600 : 400,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Post único · {PULSE_SINGLE} pulses
          </button>
          <button
            onClick={() => { setMode('carousel'); setSlideCount(3) }}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: mode === 'carousel' ? 'var(--accent)' : 'var(--border)',
              background: mode === 'carousel' ? 'var(--accent-glow)' : 'var(--bg-surface)',
              color: mode === 'carousel' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: mode === 'carousel' ? 600 : 400,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Carrossel
          </button>

          {mode === 'carousel' && (
            <>
              <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Slides:</span>
              {SLIDE_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setSlideCount(n)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: slideCount === n ? 'var(--accent)' : 'var(--border)',
                    background: slideCount === n ? 'var(--accent-glow)' : 'var(--bg-surface)',
                    color: slideCount === n ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: slideCount === n ? 600 : 400,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              ))}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {totalCost} pulses</span>
            </>
          )}
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
            placeholder="Descreva o post ou carrossel que deseja criar..."
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
              {isLoading ? `${currentStep}/${totalSteps}...` : 'Gerar'}
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
