import { useState, useEffect } from 'react'
import type { PremiumSlide } from '../services/gemini'
import { supabase } from '../lib/supabase'
import { type LogoPosition, type LogoSize } from '../services/logoOverlay'
import { getInstagramConnection } from '../services/socialConnections'
import { validatePremiumSlides } from '../services/carouselValidation'
import { isIOS, openIOSSaveOverlay } from './IOSSaveOverlay'
import { ColorSwatch } from './ColorSwatch'
import {
  DEFAULT_PREMIUM_LOGO_LAYER, DEFAULT_PREMIUM_TEXT_LAYER,
  type PremiumLogoLayer, type PremiumTextLayer,
} from '../services/premiumCompose'
import type { TextBand, TextScale, TextFontKind } from '../services/textOverlay'

interface Props {
  /** Slides já compostos (base → texto → logo) pelo EditorPage. O viewer só exibe. */
  slides: PremiumSlide[]
  caption: { instagram: string; linkedin: string; hashtags: string } | null
  logoLayer?: PremiumLogoLayer
  textLayer?: PremiumTextLayer
  logoUrl?: string | null
  onLogoLayerChange?: (layer: PremiumLogoLayer) => void
  onTextLayerChange?: (layer: PremiumTextLayer) => void
  onClose: () => void
}

const ASPECT_STYLES: Record<string, React.CSSProperties> = {
  '9:16': { aspectRatio: '9/16' },
  '4:5':  { aspectRatio: '4/5' },
  '1:1':  { aspectRatio: '1/1' },
}

const POSITION_OPTIONS: { value: LogoPosition; label: string }[] = [
  { value: 'top-left', label: '↖ Superior esq.' },
  { value: 'top-right', label: '↗ Superior dir.' },
  { value: 'bottom-left', label: '↙ Inferior esq.' },
  { value: 'bottom-right', label: '↘ Inferior dir.' },
  { value: 'bottom-center', label: '⬇ Centro inferior' },
  { value: 'top-center', label: '⬆ Centro superior' },
  { value: 'center', label: '⊙ Centro' },
]

const SIZE_OPTIONS: { value: LogoSize; label: string }[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
]

const TEXT_BAND_OPTIONS: { value: TextBand; label: string }[] = [
  { value: 'top', label: '⬆ Topo' },
  { value: 'center', label: '⊙ Centro' },
  { value: 'bottom', label: '⬇ Base' },
]

const TEXT_SCALE_OPTIONS: { value: TextScale; label: string }[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
]

const TEXT_FONT_OPTIONS: { value: TextFontKind; label: string }[] = [
  { value: 'sans', label: 'Sora' },
  { value: 'serif', label: 'Playfair' },
  { value: 'anton', label: 'Anton' },
  { value: 'archivo', label: 'Archivo Black' },
  { value: 'bebas', label: 'Bebas Neue' },
  { value: 'oswald', label: 'Oswald' },
]

const chipStyle = (selected: boolean): React.CSSProperties => ({
  fontSize: '11px', padding: '5px 10px', borderRadius: '6px',
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  ...(selected
    ? { background: 'var(--accent)', border: 'none', color: 'white' }
    : { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }),
})

export function PremiumResultViewer({
  slides,
  caption: initialCaption,
  logoLayer = DEFAULT_PREMIUM_LOGO_LAYER,
  textLayer = DEFAULT_PREMIUM_TEXT_LAYER,
  logoUrl = null,
  onLogoLayerChange,
  onTextLayerChange,
  onClose,
}: Props) {
  const displaySlides = validatePremiumSlides<PremiumSlide>(slides)
  const [caption, setCaption] = useState(initialCaption)

  const [logoError, setLogoError] = useState('')
  const [textDraft, setTextDraft] = useState(textLayer.headline)
  useEffect(() => { setTextDraft(textLayer.headline) }, [textLayer.headline])

  function addLogo() {
    setLogoError('')
    if (!logoUrl) {
      setLogoError('Nenhum logo configurado na sua marca. Adicione o logo no painel de configuração da marca.')
      return
    }
    onLogoLayerChange?.({ ...logoLayer, active: true })
  }

  function commitText() {
    const headline = textDraft.trim()
    if (!headline) {
      if (textLayer.active || textLayer.headline) onTextLayerChange?.({ ...textLayer, active: false, headline: '' })
      return
    }
    if (headline === textLayer.headline && textLayer.active) return
    onTextLayerChange?.({ ...textLayer, active: true, headline })
  }

  const [captionTab, setCaptionTab] = useState<'instagram' | 'linkedin'>('instagram')
  const [linkedinToken, setLinkedinToken] = useState(localStorage.getItem('linkedin_token') ?? '')
  const [linkedinSub, setLinkedinSub] = useState(localStorage.getItem('linkedin_sub') ?? '')
  const [linkedinName, setLinkedinName] = useState(localStorage.getItem('linkedin_name') ?? '')

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'linkedin_auth') {
        setLinkedinToken(e.data.linkedin_token)
        setLinkedinSub(e.data.linkedin_sub)
        setLinkedinName(e.data.linkedin_name ?? '')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  const [publishingLI, setPublishingLI] = useState(false)
  const [liStatus, setLiStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [publishingIG, setPublishingIG] = useState(false)
  const [igStatus, setIgStatus] = useState<'idle' | 'success' | 'error'>('idle')

  function handleDownload(imageUrl: string, label: string) {
    if (isIOS()) {
      openIOSSaveOverlay([{ url: imageUrl, label }])
      return
    }
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `pulse-premium-${label.toLowerCase().replace(/[:/]/g, '-')}.png`
    link.click()
  }

  function handleDownloadAll() {
    if (isIOS()) {
      openIOSSaveOverlay(displaySlides.map(slide => ({ url: slide.image, label: slide.label })))
      return
    }
    displaySlides.forEach((slide, i) => {
      setTimeout(() => handleDownload(slide.image, slide.label), i * 800)
    })
  }

  async function handlePublishLinkedIn() {
    if (!caption || publishingLI || !linkedinToken || displaySlides.length === 0) return
    setPublishingLI(true)
    setLiStatus('idle')
    try {
      const text = `${caption.linkedin}\n\n${caption.hashtags}`
      const mainImage = displaySlides.find(s => s.label === '1:1')?.image ?? displaySlides[0].image
      const res = await fetch('/api/linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: linkedinToken, linkedinSub, text, imageBase64: mainImage }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!data.success) throw new Error(data.error)
      setLiStatus('success')
      setTimeout(() => setLiStatus('idle'), 3000)
    } catch (e) {
      console.error('[premium viewer] linkedin publish:', e)
      setLiStatus('error')
      setTimeout(() => setLiStatus('idle'), 3000)
    } finally {
      setPublishingLI(false)
    }
  }

  async function handlePublishInstagram() {
    if (!caption || publishingIG || displaySlides.length === 0) return
    setPublishingIG(true)
    setIgStatus('idle')
    try {
      const { data: authData } = await supabase.auth.getUser()
      const email = authData.user?.email ?? ''
      const igConnection = email ? await getInstagramConnection(email) : null

      console.log('[PremiumResultViewer] Instagram connection check:', {
        email,
        hasConnection: !!igConnection,
        igUserId: igConnection?.ig_user_id || null,
        accessTokenPresent: !!igConnection?.access_token,
      })

      if (!igConnection?.access_token || !igConnection?.ig_user_id) {
        throw new Error('Instagram não conectado. Conecte sua conta no painel de configuração da marca.')
      }

      const igUserId = igConnection.ig_user_id
      const accessToken = igConnection.access_token

      const text = `${caption.instagram}\n\n${caption.hashtags}`
      const mainImage = displaySlides.find(s => s.label === '1:1')?.image ?? displaySlides[0].image
      const base64 = mainImage.replace(/^data:image\/\w+;base64,/, '')
      const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      const fileName = `premium-ig-${Date.now()}.jpg`
      await supabase.storage.from('media').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)

      console.log('[PremiumResultViewer] Instagram fetch payload:', {
        imageUrl: urlData.publicUrl,
        igUserId,
        accessTokenPreview: accessToken ? `${accessToken.slice(0, 10)}...` : null,
        captionLength: text.length,
      })

      const res = await fetch('/api/instagram-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: urlData.publicUrl, caption: text, igUserId, accessToken }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!data.success) throw new Error(data.error)
      await supabase.storage.from('media').remove([fileName])
      setIgStatus('success')
      setTimeout(() => setIgStatus('idle'), 3000)
    } catch (e) {
      console.error('[premium viewer] instagram publish:', e)
      setIgStatus('error')
      setTimeout(() => setIgStatus('idle'), 3000)
    } finally {
      setPublishingIG(false)
    }
  }

  const textActive = textLayer.active && textLayer.headline.trim().length > 0

  return (
    <div style={{ width: '100%', maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Post Premium
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            fontSize: '11px', color: 'var(--text-muted)', background: 'none',
            border: '1px solid var(--border)', cursor: 'pointer',
            padding: '4px 12px', borderRadius: '6px', fontFamily: 'inherit',
          }}
        >
          ← Voltar ao canvas
        </button>
      </div>

      {/* Image grid — single format or multiple side by side */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {displaySlides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'relative', borderRadius: '10px', overflow: 'hidden',
              border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
              flex: displaySlides.length === 1 ? '0 0 auto' : '1 1 140px',
              minWidth: displaySlides.length === 1 ? 'min(320px, 100%)' : '120px',
              maxWidth: displaySlides.length === 1 ? '380px' : '260px',
            }}
          >
            {slide.label && (
              <div style={{
                position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                color: '#fff', fontSize: '10px', fontWeight: 600,
                padding: '2px 6px', borderRadius: '4px',
              }}>
                {slide.label}
              </div>
            )}

            {ASPECT_STYLES[slide.label] ? (
              <div style={ASPECT_STYLES[slide.label]}>
                {/* crossOrigin: a mesma URL é depois desenhada em <canvas> no
                    ajuste (composePremiumImage/compressReferenceImage). Sem isso,
                    o browser cacheia a resposta sem CORS e o load com crossOrigin
                    do canvas herda o cache tainted → toDataURL() lança. */}
                <img
                  src={slide.image}
                  alt={slide.label}
                  crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : (
              <img
                src={slide.image}
                alt={slide.label}
                crossOrigin="anonymous"
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            )}

            <button
              onClick={() => handleDownload(slide.image, slide.label)}
              style={{
                position: 'absolute', bottom: '8px', right: '8px', zIndex: 2,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                color: '#fff', fontSize: '10px', padding: '4px 8px',
                borderRadius: '5px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Baixar
            </button>
          </div>
        ))}
      </div>

      {/* Controles de logo */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Logo da marca
          </span>
          {!logoLayer.active ? (
            <button
              onClick={addLogo}
              style={{
                fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600, border: 'none',
                background: 'var(--accent)', color: 'white',
              }}
            >
              Adicionar logo
            </button>
          ) : (
            <button
              onClick={() => onLogoLayerChange?.({ ...logoLayer, active: false })}
              style={{
                fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600,
                border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)',
              }}
            >
              Remover logo
            </button>
          )}
        </div>

        {logoError && (
          <span style={{ fontSize: '11px', color: 'rgba(239,68,68,0.9)' }}>{logoError}</span>
        )}

        {logoLayer.active && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Posição</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {POSITION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onLogoLayerChange?.({ ...logoLayer, position: opt.value })}
                    style={chipStyle(logoLayer.position === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tamanho</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {SIZE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onLogoLayerChange?.({ ...logoLayer, size: opt.value })}
                    style={{ ...chipStyle(logoLayer.size === opt.value), flex: 1 }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controles de texto (overlay) */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Texto sobre a imagem
          </span>
          {textActive && (
            <button
              onClick={() => onTextLayerChange?.({ ...textLayer, active: false })}
              style={{
                fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600,
                border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)',
              }}
            >
              Remover texto
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            value={textDraft}
            onChange={e => setTextDraft(e.target.value)}
            onBlur={commitText}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitText() } }}
            placeholder="Escreva o texto e tecle Enter"
            style={{
              flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px',
              padding: '8px 10px', fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={commitText}
            style={{
              fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600, border: 'none',
              background: 'var(--accent)', color: 'white', whiteSpace: 'nowrap',
            }}
          >
            {textActive ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>

        {textActive && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Posição</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {TEXT_BAND_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onTextLayerChange?.({ ...textLayer, band: opt.value })}
                    style={chipStyle(textLayer.band === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tamanho</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {TEXT_SCALE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onTextLayerChange?.({ ...textLayer, scale: opt.value })}
                    style={{ ...chipStyle(textLayer.scale === opt.value), flex: 1 }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fonte</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {TEXT_FONT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => onTextLayerChange?.({ ...textLayer, font: opt.value })}
                      style={chipStyle(textLayer.font === opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cor</span>
                <ColorSwatch color={textLayer.color} onChange={hex => onTextLayerChange?.({ ...textLayer, color: hex })} title="Cor do texto" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Destaque (trecho + cor)</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  value={textLayer.highlightText ?? ''}
                  onChange={e => onTextLayerChange?.({ ...textLayer, highlightText: e.target.value })}
                  placeholder="Palavra ou frase do texto acima"
                  style={{
                    flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)',
                    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px',
                    padding: '6px 10px', fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <ColorSwatch
                  color={textLayer.highlightColor ?? '#4A90D9'}
                  onChange={hex => onTextLayerChange?.({ ...textLayer, highlightColor: hex })}
                  title="Cor do destaque"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Download — só mostra "Baixar tudo" se houver mais de 1 formato */}
      {displaySlides.length > 1 && (
        <button
          onClick={handleDownloadAll}
          style={{
            alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-surface)',
            color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          Baixar tudo ({displaySlides.length} formatos)
        </button>
      )}

      {/* Caption panel */}
      {caption && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Legenda gerada
          </span>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['instagram', 'linkedin'] as const).map(t => (
              <button
                key={t}
                onClick={() => setCaptionTab(t)}
                style={{
                  flex: 1, fontSize: '11px', padding: '5px', borderRadius: '6px',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                  ...(captionTab === t
                    ? { background: 'var(--accent)', border: 'none', color: 'white' }
                    : { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }),
                }}
              >
                {t === 'instagram' ? 'Instagram' : 'LinkedIn'}
              </button>
            ))}
          </div>

          <textarea
            value={caption[captionTab]}
            onChange={e => setCaption(prev => prev ? { ...prev, [captionTab]: e.target.value } : prev)}
            rows={5}
            style={{
              width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px',
              padding: '8px 10px', fontFamily: 'inherit', resize: 'none', outline: 'none',
              lineHeight: 1.6, boxSizing: 'border-box',
            }}
          />
          <textarea
            value={caption.hashtags}
            onChange={e => setCaption(prev => prev ? { ...prev, hashtags: e.target.value } : prev)}
            rows={2}
            style={{
              width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-muted)', fontSize: '11px',
              padding: '8px 10px', fontFamily: 'inherit', resize: 'none', outline: 'none',
              lineHeight: 1.6, boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => navigator.clipboard.writeText(`${caption[captionTab]}\n\n${caption.hashtags}`)}
              style={{ flex: 1, fontSize: '11px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}
            >
              Copiar legenda
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(caption.hashtags)}
              style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}
            >
              Copiar hashtags
            </button>
          </div>

          {/* Publish Instagram */}
          <button
            onClick={handlePublishInstagram}
            disabled={publishingIG}
            style={{
              width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
              cursor: publishingIG ? 'default' : 'pointer', fontFamily: 'inherit',
              fontWeight: 600, border: 'none', opacity: publishingIG ? 0.6 : 1,
              background: igStatus === 'success' ? 'rgba(34,197,94,0.8)'
                : igStatus === 'error' ? 'rgba(239,68,68,0.8)'
                : 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
              color: 'white',
            }}
          >
            {publishingIG ? 'Publicando...' : igStatus === 'success' ? 'Publicado!' : igStatus === 'error' ? 'Erro ao publicar' : 'Publicar no Instagram'}
          </button>

          {/* Publish LinkedIn */}
          {linkedinToken ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Conectado como <strong style={{ color: 'var(--text-primary)' }}>{linkedinName || 'LinkedIn'}</strong>
                </span>
              </div>
              <button
                onClick={handlePublishLinkedIn}
                disabled={publishingLI}
                style={{
                  width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px',
                  cursor: publishingLI ? 'default' : 'pointer', fontFamily: 'inherit',
                  fontWeight: 600, border: 'none', opacity: publishingLI ? 0.6 : 1,
                  background: liStatus === 'success' ? 'rgba(34,197,94,0.8)'
                    : liStatus === 'error' ? 'rgba(239,68,68,0.8)'
                    : 'linear-gradient(135deg,#0077B5,#005e93)',
                  color: 'white',
                }}
              >
                {publishingLI ? 'Publicando...' : liStatus === 'success' ? 'Publicado!' : liStatus === 'error' ? 'Erro ao publicar' : 'Publicar no LinkedIn'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.open('/api/linkedin-auth', 'linkedin_popup', 'width=600,height=700')}
              style={{ width: '100%', fontSize: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: 'linear-gradient(135deg,#0077B5,#005e93)', border: 'none', color: 'white' }}
            >
              Conectar LinkedIn para publicar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
