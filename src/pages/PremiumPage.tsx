import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generatePremiumCaption, reviewPost, type PostReview } from '../services/gemini'
import { loadBrandConfig, savePost, uploadThumbnail, updatePostThumbnail } from '../services/brandKit'
import { turboPrompt } from '../services/gemini'

const SLIDE_OPTIONS = [3, 4, 5, 6, 7]
const PULSE_SINGLE = 4
const PULSE_PER_SLIDE = 2

type Mode = 'single' | 'carousel'
type Slide = { image: string; label: string; aspectRatio?: string }

const CROP_STYLES: Record<string, React.CSSProperties> = {
  '1/1':  { aspectRatio: '1/1' },
  '4/5':  { aspectRatio: '4/5' },
  '9/16': { aspectRatio: '9/16' },
  '16/9': { aspectRatio: '16/9' },
}

export function PremiumPage() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<Mode>('single')
  const [slideCount, setSlideCount] = useState(3)
  const [slides, setSlides] = useState<Slide[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [error, setError] = useState('')
  const [turbining, setTurbining] = useState(false)
  const [caption, setCaption] = useState<{ instagram: string; linkedin: string; hashtags: string } | null>(null)
  const [captionTab, setCaptionTab] = useState<'instagram' | 'linkedin'>('instagram')
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [linkedinToken, setLinkedinToken] = useState(localStorage.getItem('linkedin_token') ?? '')
  const [linkedinSub, setLinkedinSub] = useState(localStorage.getItem('linkedin_sub') ?? '')
  const [linkedinName, setLinkedinName] = useState(localStorage.getItem('linkedin_name') ?? '')
  const [publishingIG, setPublishingIG] = useState(false)
  const [review, setReview] = useState<PostReview | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [publishingLI, setPublishingLI] = useState(false)
  const [igStatus, setIgStatus] = useState<'idle'|'success'|'error'>('idle')
  const [liStatus, setLiStatus] = useState<'idle'|'success'|'error'>('idle')
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null)
  const [brandPhotos, setBrandPhotos] = useState<string[]>([])
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const totalCost = mode === 'single' ? PULSE_SINGLE : slideCount * PULSE_PER_SLIDE

  // Restaura estado ao montar
  useState(() => {
    try {
      const saved = sessionStorage.getItem('premium_state')
      if (saved) {
        const { slides: s, caption: c, status: st } = JSON.parse(saved)
        if (s?.length) { setSlides(s); setStatus(st ?? 'done') }
        if (c) setCaption(c)
      }
    } catch {}
  })

  // Persiste slides e caption no sessionStorage
  useEffect(() => {
    if (slides.length > 0) {
      try {
        if (status === 'done') sessionStorage.setItem('premium_state', JSON.stringify({ slides, caption, status }))
      } catch {}
    }
  }, [slides, caption, status])

  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      if (!email) return
      loadBrandConfig(email).then(b => setBrandPhotos(b.photos ?? []))
    })
  })

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
    } catch (e) { console.error(e) }
    finally { setTurbining(false) }
  }

  async function generateImage(slidePrompt: string, slideIndex: number, totalSlides: number, styleContext: string, size: string, refs: string[] = []) {
    const res = await fetch('/api/generate-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: slidePrompt, slideIndex, totalSlides, styleContext, size, visualReferences: refs }),
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
    setCaption(null)
    setReview(null)
    try { sessionStorage.removeItem('premium_state') } catch {}

    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email ?? ''
      const brand = email ? await loadBrandConfig(email) : null
      // Se a foto de referência é base64, faz upload para o Supabase primeiro
      let visualReferences: string[] = brand?.visual_references ?? []
      if (referencePhoto) {
        if (referencePhoto.startsWith('data:')) {
          try {
            const base64 = referencePhoto.replace(/^data:image\/\w+;base64,/, '')
            const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
            const blob = new Blob([byteArray], { type: 'image/jpeg' })
            const fileName = `references/${email}/ref-${Date.now()}.jpg`
            const { error: upErr } = await supabase.storage.from('media').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
            if (!upErr) {
              const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
              visualReferences = [urlData.publicUrl]
            }
          } catch (e) {
            console.error('[ref upload]', e)
          }
        } else {
          visualReferences = [referencePhoto]
        }
      }

      const styleContext = [
        brand?.segment ? `Segment: ${brand.segment}` : '',
        brand?.tone ? `Tone: ${brand.tone}` : '',
        brand?.visual_style ? `Visual style: ${brand.visual_style}` : '',
        brand?.brand_description ? `Brand: ${brand.brand_description}` : '',
        brand?.color_primary ? `Primary color: ${brand.color_primary}` : '',
      ].filter(Boolean).join('. ')

      const generated: Slide[] = []

      if (mode === 'single') {
        setTotalSteps(1)

        // Uma única geração vertical — 9:16, 4:5 e 1:1 via crop
        setCurrentStep(1)
        const verticalPrompt = `Create a professional social media post. Content: ${prompt}. Vertical format. CRITICAL LAYOUT RULES: All text and visual elements must be strictly within the CENTER 55% of image width and CENTER 60% of image height. Use compact font sizes and tight line spacing. No text or elements near edges. No borders, frames or decorative containers. Background only in outer areas.`
        const verticalImage = await generateImage(verticalPrompt, 1, 1, styleContext, '1024x1536', visualReferences)
        generated.push({ image: verticalImage, label: '9:16', aspectRatio: '9/16' })
        generated.push({ image: verticalImage, label: '4:5', aspectRatio: '4/5' })
        generated.push({ image: verticalImage, label: '1:1', aspectRatio: '1/1' })
        setSlides([...generated])
      } else {
        setTotalSteps(slideCount)
        for (let i = 1; i <= slideCount; i++) {
          setCurrentStep(i)
          const slidePromptText = i === 1
            ? `COVER slide of carousel: ${prompt}. Impactful opening slide with main title. Format 4:5 vertical.`
            : i === slideCount
            ? `FINAL slide of carousel about: ${prompt}. Closing slide with call-to-action. Format 4:5 vertical.`
            : `SLIDE ${i} of ${slideCount} of carousel about: ${prompt}. Point ${i - 1} of the topic. Format 4:5 vertical.`
          const image = await generateImage(slidePromptText, i, slideCount, styleContext, '1024x1536', visualReferences)
          generated.push({ image, label: `Slide ${i}` })
          setSlides([...generated])
        }
      }

      // Aplica logo real do Brand Kit em todas as imagens
      const brandForLogo = await loadBrandConfig(email)
      if (brandForLogo.logo_url) {
        for (let i = 0; i < generated.length; i++) {
          try {
            // Primeiro cropa, depois aplica o logo
            const cropped = generated[i].aspectRatio
              ? await cropImageToRatio(generated[i].image, generated[i].aspectRatio!)
              : generated[i].image
            generated[i] = {
              ...generated[i],
              image: await overlayLogo(cropped, brandForLogo.logo_url),
              aspectRatio: undefined, // já cropado, não precisa cropar de novo
            }
          } catch (e) {
            console.error('[logo overlay]', e)
          }
        }
        setSlides([...generated])
      }

      setStatus('done')
      // Gera legenda automaticamente
      setGeneratingCaption(true)
      console.log('[premium] gerando legenda para prompt:', prompt.slice(0, 50))
      try {
        const cap = await generatePremiumCaption(prompt, brand ? {
          businessName: brand.business_name || brand.brand_name,
          segment: brand.segment,
          tone: brand.tone,
          brandDescription: brand.brand_description ?? undefined,
        } : undefined)
        console.log('[premium] legenda gerada:', cap)
        setCaption(cap)
        // Salva na biblioteca com legenda
        saveToLibrary(generated, email, mode, cap)
      } finally {
        setGeneratingCaption(false)
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar')
      setStatus('error')
    }
  }


  async function cropImageToRatio(imageUrl: string, aspectRatio: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const [rw, rh] = aspectRatio.split('/').map(Number)
        const targetRatio = rw / rh
        const srcRatio = img.width / img.height

        let sx = 0, sy = 0, sw = img.width, sh = img.height

        if (srcRatio > targetRatio) {
          sw = Math.round(img.height * targetRatio)
          sx = Math.round((img.width - sw) / 2)
        } else {
          sh = Math.round(img.width / targetRatio)
          sy = Math.round((img.height - sh) / 2)
        }

        const canvas = document.createElement('canvas')
        const outputW = rw * 512
        const outputH = rh * 512
        canvas.width = outputW
        canvas.height = outputH
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputW, outputH)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = imageUrl
    })
  }

  async function handlePublishInstagram() {
    if (!caption || publishingIG || slides.length === 0) return
    setPublishingIG(true)
    setIgStatus('idle')
    try {
      const text = `${caption.instagram}\n\n${caption.hashtags}`
      const igUserId = '17841479034844249'
      if (mode === 'single') {
        // Post único — usa a imagem 1:1
        const mainImage = slides.find(s => s.label === '1:1')?.image ?? slides[0].image
        const base64 = mainImage.replace(/^data:image\/\w+;base64,/, '')
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const blob = new Blob([byteArray], { type: 'image/jpeg' })
        const fileName = `premium-ig-${Date.now()}.jpg`
        await supabase.storage.from('media').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
        const res = await fetch('/api/instagram-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: urlData.publicUrl, caption: text, igUserId }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        await supabase.storage.from('media').remove([fileName])
      } else {
        // Carrossel — faz upload de todos os slides
        const imageUrls: string[] = []
        for (const slide of slides) {
          const base64 = slide.image.replace(/^data:image\/\w+;base64,/, '')
          const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
          const blob = new Blob([byteArray], { type: 'image/jpeg' })
          const fileName = `premium-ig-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
          await supabase.storage.from('media').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
          imageUrls.push(urlData.publicUrl)
        }
        const res = await fetch('/api/instagram-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls, caption: text, igUserId }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        await supabase.storage.from('media').remove(imageUrls.map(u => u.split('/media/')[1]))
      }
      setIgStatus('success')
      setTimeout(() => setIgStatus('idle'), 3000)
    } catch (e) {
      console.error(e)
      setIgStatus('error')
      setTimeout(() => setIgStatus('idle'), 3000)
    } finally {
      setPublishingIG(false)
    }
  }

  async function handlePublishLinkedIn() {
    if (!caption || publishingLI || slides.length === 0 || !linkedinToken) return
    setPublishingLI(true)
    setLiStatus('idle')
    try {
      const text = `${caption.linkedin}\n\n${caption.hashtags}`
      if (mode === 'single') {
        const mainImage = slides.find(s => s.label === '1:1')?.image ?? slides[0].image
        const res = await fetch('/api/linkedin-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: linkedinToken, linkedinSub, text, imageBase64: mainImage }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
      } else {
        const images = slides.map(s => s.image)
        const res = await fetch('/api/linkedin-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: linkedinToken, linkedinSub, text, images }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
      }
      setLiStatus('success')
      setTimeout(() => setLiStatus('idle'), 3000)
    } catch (e) {
      console.error(e)
      setLiStatus('error')
      setTimeout(() => setLiStatus('idle'), 3000)
    } finally {
      setPublishingLI(false)
    }
  }

  async function handleReview() {
    if (!slides.length || !caption || reviewing) return
    setReviewing(true)
    setReview(null)
    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email ?? ''
      const brand = email ? await loadBrandConfig(email) : null
      const mainImage = slides[0].image
      const result = await reviewPost({
        imageBase64: mainImage,
        titulo: prompt,
        legenda: caption[captionTab],
        hashtags: caption.hashtags,
        segmento: brand?.segment ?? undefined,
        tone: brand?.tone ?? undefined,
      })
      setReview(result)
    } catch (e) {
      console.error('[review]', e)
    } finally {
      setReviewing(false)
    }
  }

  async function overlayLogo(imageBase64: string, logoUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const logo = new Image()
        logo.crossOrigin = 'anonymous'
        logo.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          // Logo no canto inferior direito com margem de 4%
          const margin = img.width * 0.04
          const maxLogoW = img.width * 0.20
          const ratio = logo.naturalWidth / logo.naturalHeight
          const logoW = Math.min(maxLogoW, logo.naturalWidth)
          const logoH = logoW / ratio
          const x = img.width - logoW - margin
          const y = img.height - logoH - margin
          ctx.drawImage(logo, x, y, logoW, logoH)
          resolve(canvas.toDataURL('image/png'))
        }
        logo.onerror = () => resolve(imageBase64)
        logo.src = logoUrl
      }
      img.onerror = () => resolve(imageBase64)
      img.src = imageBase64
    })
  }

  async function saveToLibrary(images: Slide[], userEmail: string, currentMode: 'single' | 'carousel', cap?: { instagram: string; linkedin: string; hashtags: string } | null) {
    if (!userEmail) return
    try {
      // Usa a primeira imagem como thumbnail
      const firstImage = images[0]?.image
      if (!firstImage) return

      const postId = await savePost(userEmail, {
        template_id: currentMode === 'single' ? 'premium-single' : 'premium-carousel',
        texts: {},
        accent_color: '',
        image_prompt: JSON.stringify({ prompt, caption: cap ?? null }),
      })

      if (postId && firstImage) {
        const thumbUrl = await uploadThumbnail(postId, userEmail, firstImage)
        if (thumbUrl) await updatePostThumbnail(postId, thumbUrl)
        console.log('[saveToLibrary] post Premium salvo na biblioteca:', postId)
      }
    } catch (e) {
      console.error('[saveToLibrary] erro:', e)
    }
  }

  function handleDownload(imageUrl: string, label: string) {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `premium-${label.toLowerCase().replace(/[\s:/]/g, '-')}.png`
    link.click()
  }

  async function handleDownloadAll() {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      setTimeout(() => handleDownload(slide.image, slide.label), i * 300)
    }
  }

  const isIdle = status === 'idle'
  const isLoading = status === 'loading'
  const isDone = status === 'done'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', overflow: 'hidden', position: 'relative' }}>

      {/* Área de resultado */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isIdle ? '0' : '32px 24px 220px', gap: '20px' }}>

        {isIdle && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 24px 200px' }}>
            <div style={{ fontSize: '40px', opacity: 0.5, marginBottom: '8px', color: 'var(--accent)' }}>✦</div>
            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Posts Premium</p>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.8, textAlign: 'center', maxWidth: '420px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Design completo gerado por GPT Image 2 — texto integrado à imagem, sem templates.
            </p>
          </div>
        )}

        {isLoading && slides.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '0 24px 200px' }}>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-muted)' }}>
              {mode === 'single' ? 'Gerando post...' : `Gerando slide ${currentStep} de ${totalSteps}...`}
            </p>
            <div style={{ width: '240px', height: '4px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(currentStep / totalSteps) * 100}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

        {isLoading && slides.length > 0 && totalSteps > 0 && (
          <div style={{ width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
                {mode === 'single' ? `Formato ${currentStep} de ${totalSteps}` : `Slide ${currentStep} de ${totalSteps}`}
              </p>
              <p style={{ fontSize: '11px', margin: 0, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.05em' }}>
                {Math.round((currentStep / totalSteps) * 100)}%
              </p>
            </div>
            <div style={{ width: '100%', height: '2px', background: 'var(--bg-surface)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(currentStep / totalSteps) * 100}%`, background: 'linear-gradient(90deg, var(--accent), #7c9fff)', borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
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
            alignItems: mode === 'single' ? 'start' : 'center',
          }}>
            {slides.map((slide, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                  {slide.label}
                </div>
                {/* Container com crop por proporção */}
                <div style={slide.aspectRatio ? { ...CROP_STYLES[slide.aspectRatio], overflow: 'hidden', position: 'relative' } : {}}>
                  <img
                    src={slide.image}
                    alt={slide.label}
                    style={slide.aspectRatio ? {
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                    } : { width: '100%', display: 'block' }}
                  />
                </div>
                <button
                  onClick={async () => {
                    const imageUrl = slide.aspectRatio
                      ? await cropImageToRatio(slide.image, slide.aspectRatio)
                      : slide.image
                    handleDownload(imageUrl, slide.label)
                  }}
                  style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)', fontFamily: 'inherit', zIndex: 2 }}
                >
                  Baixar
                </button>
                {isLoading && i === slides.length - 1 && mode === 'carousel' && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', color: 'var(--accent)', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                    Gerando próximo...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {generatingCaption && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Gerando legenda...</p>
        )}

        {isDone && caption && (
          <div style={{ width: '100%', maxWidth: mode === 'single' ? '900px' : '520px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Legenda gerada</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['instagram', 'linkedin'] as const).map(t => (
                <button key={t} onClick={() => setCaptionTab(t)} style={{ flex: 1, fontSize: '11px', padding: '5px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, ...(captionTab === t ? { background: 'var(--accent)', border: 'none', color: 'white' } : { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }) }}>
                  {t === 'instagram' ? 'Instagram' : 'LinkedIn'}
                </button>
              ))}
            </div>
            <textarea
              value={caption[captionTab]}
              onChange={e => setCaption(prev => prev ? { ...prev, [captionTab]: e.target.value } : prev)}
              rows={5}
              style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', padding: '8px 10px', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
            />
            <textarea
              value={caption.hashtags}
              onChange={e => setCaption(prev => prev ? { ...prev, hashtags: e.target.value } : prev)}
              rows={2}
              style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '11px', padding: '8px 10px', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => navigator.clipboard.writeText(`${caption[captionTab]}\n\n${caption.hashtags}`)} style={{ flex: 1, fontSize: '11px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Copiar legenda</button>
              <button onClick={() => navigator.clipboard.writeText(caption.hashtags)} style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Copiar hashtags</button>
            </div>
            <button onClick={handleReview} disabled={reviewing} style={{ width: '100%', fontSize: '11px', padding: '7px', borderRadius: '6px', cursor: reviewing ? 'default' : 'pointer', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit', opacity: reviewing ? 0.6 : 1 }}>
              {reviewing ? 'Analisando...' : '✦ Analisar post · 1 pulse'}
            </button>
            {review && (
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Análise do Post</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[['Visual', review.score_visual], ['Legenda', review.score_legenda]].map(([label, score]) => {
                    const s = Number(score)
                    const color = s >= 8 ? '#22c55e' : s >= 6 ? '#FFCA1D' : '#ef4444'
                    return (
                      <div key={label as string} style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label as string}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color }}>{s}/10</span>
                        </div>
                        <div style={{ height: '5px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s * 10}%`, background: color, borderRadius: '3px' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--accent)', margin: 0, fontStyle: 'italic' }}>{review.resumo}</p>
                {review.pontos_positivos?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#22c55e', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pontos positivos</p>
                    {review.pontos_positivos.map((p, i) => <p key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 2px' }}>· {p}</p>)}
                  </div>
                )}
                {review.sugestoes?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sugestões</p>
                    {review.sugestoes.map((s, i) => <p key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 2px' }}>· {s}</p>)}
                  </div>
                )}
              </div>
            )}
            <button onClick={handlePublishInstagram} disabled={publishingIG} style={{ width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px', cursor: publishingIG ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 600, border: 'none', opacity: publishingIG ? 0.6 : 1, background: igStatus === 'success' ? 'rgba(34,197,94,0.8)' : igStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
              {publishingIG ? 'Publicando...' : igStatus === 'success' ? 'Publicado!' : igStatus === 'error' ? 'Erro ao publicar' : 'Publicar no Instagram'}
            </button>
            {linkedinToken ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Conectado como <strong style={{ color: 'var(--text-primary)' }}>{linkedinName || 'LinkedIn'}</strong></span>
                  <button onClick={() => { localStorage.removeItem('linkedin_token'); localStorage.removeItem('linkedin_sub'); localStorage.removeItem('linkedin_name'); setLinkedinToken(''); setLinkedinSub(''); setLinkedinName('') }} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.6)', fontFamily: 'inherit' }}>Desconectar</button>
                </div>
                <button onClick={handlePublishLinkedIn} disabled={publishingLI} style={{ width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px', cursor: publishingLI ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 600, border: 'none', opacity: publishingLI ? 0.6 : 1, background: liStatus === 'success' ? 'rgba(34,197,94,0.8)' : liStatus === 'error' ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg,#0077B5,#005e93)', color: 'white' }}>
                  {publishingLI ? 'Publicando...' : liStatus === 'success' ? 'Publicado!' : liStatus === 'error' ? 'Erro ao publicar' : 'Publicar no LinkedIn'}
                </button>
              </div>
            ) : (
              <button onClick={() => window.open('/api/linkedin-auth', '_blank', 'width=600,height=700')} style={{ width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: 'linear-gradient(135deg,#0077B5,#005e93)', border: 'none', color: 'white' }}>
                Conectar LinkedIn
              </button>
            )}
          </div>
        )}

        {isDone && (
          <button onClick={handleDownloadAll} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', marginBottom: '24px' }}>
            Baixar tudo ({slides.length} imagens)
          </button>
        )}
      </div>

      {/* Input fixo no rodapé */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 24px 24px', background: 'linear-gradient(to top, var(--bg-base) 75%, transparent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>

        {error && <p style={{ fontSize: '12px', color: 'rgb(239,68,68)', margin: 0 }}>{error}</p>}

        {/* Foto de referência */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = ev => setReferencePhoto(ev.target?.result as string)
            reader.readAsDataURL(file)
            e.target.value = ''
          }} />
          {referencePhoto ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={referencePhoto} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--accent)' }} alt="ref" />
              <span style={{ fontSize: '11px', color: 'var(--accent)' }}>Foto selecionada</span>
              <button onClick={() => setReferencePhoto(null)} style={{ fontSize: '11px', color: 'rgba(239,68,68,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Remover</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => photoInputRef.current?.click()}
                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                + Upload de foto
              </button>
              {brandPhotos.length > 0 && (
                <button
                  onClick={() => setShowPhotoLibrary(!showPhotoLibrary)}
                  style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: showPhotoLibrary ? 'var(--accent-glow)' : 'var(--bg-surface)', color: showPhotoLibrary ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  Biblioteca ({brandPhotos.length})
                </button>
              )}
            </div>
          )}
        </div>

        {showPhotoLibrary && !referencePhoto && (
          <div style={{ width: '100%', maxWidth: '720px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {brandPhotos.map(url => (
              <button key={url} onClick={() => { setReferencePhoto(url); setShowPhotoLibrary(false) }} style={{ padding: 0, border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', background: 'none', aspectRatio: '1' }}>
                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
              </button>
            ))}
          </div>
        )}

        {/* Seletor de modo */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setMode('single')}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid', borderColor: mode === 'single' ? 'var(--accent)' : 'var(--border)', background: mode === 'single' ? 'var(--accent-glow)' : 'var(--bg-surface)', color: mode === 'single' ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '12px', fontWeight: mode === 'single' ? 600 : 400, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            Post único · {PULSE_SINGLE} pulses
          </button>
          <button
            onClick={() => { setMode('carousel'); setSlideCount(3) }}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid', borderColor: mode === 'carousel' ? 'var(--accent)' : 'var(--border)', background: mode === 'carousel' ? 'var(--accent-glow)' : 'var(--bg-surface)', color: mode === 'carousel' ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '12px', fontWeight: mode === 'carousel' ? 600 : 400, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            Carrossel
          </button>

          {mode === 'carousel' && (
            <>
              <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Slides:</span>
              {SLIDE_OPTIONS.map(n => (
                <button key={n} onClick={() => setSlideCount(n)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid', borderColor: slideCount === n ? 'var(--accent)' : 'var(--border)', background: slideCount === n ? 'var(--accent-glow)' : 'var(--bg-surface)', color: slideCount === n ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '12px', fontWeight: slideCount === n ? 600 : 400, fontFamily: 'inherit', cursor: 'pointer' }}>
                  {n}
                </button>
              ))}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {totalCost} pulses</span>
            </>
          )}
        </div>

        {/* Caixa de prompt */}
        <div style={{ width: '100%', maxWidth: '720px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
            placeholder="Descreva o post ou carrossel que deseja criar..."
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: '160px', overflowY: 'auto' }}
          />
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button onClick={handleTurbo} disabled={!prompt.trim() || turbining} title="Turbinar prompt" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-muted)', fontSize: '16px', cursor: !prompt.trim() || turbining ? 'default' : 'pointer', opacity: !prompt.trim() || turbining ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ⚡
            </button>
            <button onClick={handleGenerate} disabled={!prompt.trim() || isLoading} className="btn-gerar" style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: !prompt.trim() || isLoading ? 'default' : 'pointer', opacity: !prompt.trim() || isLoading ? 0.5 : 1, whiteSpace: 'nowrap' }}>
              {isLoading ? `${currentStep}/${totalSteps}...` : 'Gerar'}
            </button>
          </div>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>⌘ + Enter para gerar · GPT Image 2</p>
      </div>
    </div>
  )
}
