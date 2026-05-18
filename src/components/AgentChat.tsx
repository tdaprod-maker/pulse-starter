import { useState, useRef, useEffect } from 'react'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { useTheme } from '../contexts/ThemeContext'
import { agentChat, generatePostContent, type AgentMessage } from '../services/gemini'
import { generateImage } from '../services/replicate'
import { loadBrandConfig, savePost, uploadThumbnail, updatePostThumbnail } from '../services/brandKit'
import { supabase } from '../lib/supabase'

const ACCENT_ELEMENT: Record<string, string> = {
  'hero-title':     'accent-bar',
  'editorial-card': 'accent-bar',
  'food-promo':     'bg-color',
  'tech-news':      'brand-line',
  'tech-statement': 'brand-line',
  'tech-product':   'accent-strip',
}

function normalizeTemplateId(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, '-')
}

export function AgentChat({ onGenerating, onGenerated, onReset }: { onGenerating?: () => void; onGenerated?: () => void; onReset?: () => void } = {}) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    { role: 'agent', content: 'Olá! Me conta o que você quer comunicar no post de hoje.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<{ stop(): void } | null>(null)

  function toggleMic() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const win = window as any
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }
  const [generating, setGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { theme } = useTheme()
  const {
    addTemplate, setActiveTemplate, updateElement, setTemplateBackground,
    setTemplateImagePrompt, setCaption, 
  } = useStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function applyResult(result: any, forcedTemplateId?: string) {
    const templateId = forcedTemplateId
      ? normalizeTemplateId(forcedTemplateId)
      : normalizeTemplateId(result.template)
    const def = templateRegistry.find((d) => d.id === templateId)
    if (!def) throw new Error(`Template "${result.template}" não reconhecido`)

    const allVariants = def.getVariants(theme)
    const currentActiveId = useStore.getState().activeTemplateId
    let variant = allVariants.find((v) => v.id === currentActiveId)
    if (!variant && currentActiveId) {
      const suffix = currentActiveId.split('-').pop()
      variant = allVariants.find((v) => v.id.endsWith('-' + suffix))
    }
    variant ??= allVariants[0]

    addTemplate(variant)
    setActiveTemplate(variant.id)

    const accentId = ACCENT_ELEMENT[templateId]
    const accentColor = result.accentColor

    for (const v of allVariants) {
      if (v.id !== variant.id) addTemplate(v)
      const snap = useStore.getState().templates.find((t) => t.id === v.id) ?? v
      Object.entries(result.texts).forEach(([fieldId, text]) => {
        const el = snap.elements.find((e) => e.id === fieldId)
        if (el && el.type === 'text') {
          updateElement(v.id, fieldId, { props: { ...el.props, text: String(text) } })
        }
      })
      if (accentColor && accentId) {
        const snapAfter = useStore.getState().templates.find((t) => t.id === v.id) ?? snap
        const accentEl = snapAfter.elements.find((e) => e.id === accentId)
        if (accentEl) {
          updateElement(v.id, accentId, { props: { ...accentEl.props, fill: accentColor } })
        }
      }
    }
    setActiveTemplate(variant.id)

    const { data } = await supabase.auth.getUser()
    const email = data.user?.email ?? ''
    if (email) {
      const brand = await loadBrandConfig(email)
      if (brand.logo_url) {
        const response = await fetch(brand.logo_url)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          allVariants.forEach(v => {
            useStore.getState().setTemplateLogo(v.id, base64)
            useStore.getState().setTemplateLogoStyle(v.id, 400)
          })
        }
        reader.readAsDataURL(blob)
      }
    }
  }

  async function generate(prompt: string, format?: string) {
    setGenerating(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const activeTemplateBase = format
        ? null
        : useStore.getState().activeTemplateId?.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '') ?? null

      const result = await generatePostContent(prompt, brandCtx ? {
        businessName: brandCtx.business_name || brandCtx.brand_name,
        segment: brandCtx.segment,
        tone: brandCtx.tone,
        visualStyle: brandCtx.visual_style ?? undefined,
        brandDescription: brandCtx.brand_description ?? undefined,
      } : undefined, activeTemplateBase ?? undefined)

      if (brandCtx?.color_primary && result.accentColor) {
        result.accentColor = brandCtx.color_primary
      }

      await applyResult(result, activeTemplateBase ?? undefined)

      // Se formato especificado, ativa a variante correta
      if (format) {
        const formatMap: Record<string, string> = { '1x1': '1x1', '4x5': '4x5', '9x16': '9x16', '16x9': '16x9' }
        const suffix = formatMap[format] ?? '1x1'
        const currentId = useStore.getState().activeTemplateId
        if (currentId) {
          const base = currentId.replace(/-1x1$|-4x5$|-9x16$|-16x9$/, '')
          const def = templateRegistry.find(d => d.id === base)
          if (def) {
            const target = def.getVariants(theme).find(v => v.id.endsWith('-' + suffix))
            if (target) setActiveTemplate(target.id)
          }
        }
      }

      // Gera imagem de fundo
      if (result.imagePrompt && result.template !== 'tech-minimal') {
        try {
          const url = await generateImage(result.imagePrompt)
          const activeId = useStore.getState().activeTemplateId
          if (activeId) {
            setTemplateBackground(activeId, url)
            setTemplateImagePrompt(activeId, result.imagePrompt)
            const def = templateRegistry.find(d => activeId.startsWith(d.id))
            def?.getVariants(theme).forEach(v => {
              if (v.id !== activeId) {
                setTemplateBackground(v.id, url)
                setTemplateImagePrompt(v.id, result.imagePrompt!)
              }
            })
          }
        } catch (e) {
          console.error('Erro ao gerar imagem:', e)
        }
      }

      if (result.caption) setCaption(result.caption)

      // Salva na biblioteca
      try {
        if (userEmail) {
          const postId = await savePost(userEmail, {
            template_id: result.template,
            texts: result.texts as Record<string, string>,
            accent_color: result.accentColor ?? '',
            image_prompt: result.imagePrompt ?? '',
          })
          if (postId) {
            const activeId = useStore.getState().activeTemplateId
            const activeTemplate = useStore.getState().templates.find(t => t.id === activeId)
            const bgImage = activeTemplate?.backgroundImage
            if (bgImage?.startsWith('data:')) {
              const thumbUrl = await uploadThumbnail(postId, userEmail, bgImage)
              if (thumbUrl) await updatePostThumbnail(postId, thumbUrl)
            }
          }
        }
      } catch (e) {
        console.error('Erro ao salvar:', e)
      }

      onGenerated?.()
      setMessages(prev => [...prev, {
        role: 'agent',
        content: '✦ Post gerado! Clique nos elementos do canvas para editar texto, cores e fontes.'
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Algo deu errado ao gerar. Tente novamente.'
      }])
    } finally {
      setGenerating(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || loading || generating) return
    const userMsg: AgentMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData.user?.email ?? ''
      const brandCtx = userEmail ? await loadBrandConfig(userEmail) : null

      const response = await agentChat(
        newMessages.filter(m => m.role !== 'agent' || newMessages.indexOf(m) > 0),
        brandCtx ? {
          businessName: brandCtx.business_name || brandCtx.brand_name,
          segment: brandCtx.segment,
          tone: brandCtx.tone,
          brandDescription: brandCtx.brand_description ?? undefined,
          visualStyle: brandCtx.visual_style ?? undefined,
        } : undefined
      )

      if (response.ready && response.prompt) {
        setMessages(prev => [...prev, { role: 'agent', content: 'Perfeito! Gerando seu post...' }])
        onGenerating?.()
        await generate(response.prompt, response.format)
      } else {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: response.message || 'Pode me contar mais?'
        }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Erro ao processar. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleReset() {
    setMessages([{ role: 'agent', content: 'Olá! Me conta o que você quer comunicar no post de hoje.' }])
    setInput('')
    onReset?.()
  }

  const isDisabled = loading || generating

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(58,90,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            Agente de Design
          </span>
        </div>
        <button onClick={handleReset}
          style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '3px 10px', borderRadius: '6px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Nova conversa">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5A4.5 4.5 0 0 1 9.5 3M1 1v4h4M10 5.5A4.5 4.5 0 0 1 1.5 8M10 10V6H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Nova conversa
        </button>
      </div>

      {/* Mensagens */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        padding: '16px', maxHeight: '200px', overflowY: 'auto',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-surface)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              fontSize: '13px',
              lineHeight: 1.5,
              border: msg.role === 'agent' ? '1px solid var(--border)' : 'none',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {(loading || generating) && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '8px 14px', borderRadius: '12px 12px 12px 2px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              fontSize: '13px', color: 'var(--text-muted)',
            }}>
              {generating ? '✦ Gerando...' : '...'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-base)',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
          }}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={generating ? 'Gerando seu post...' : 'Digite sua mensagem...'}
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontSize: '13px',
            fontFamily: 'inherit', resize: 'none', outline: 'none',
            lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto',
            opacity: isDisabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={toggleMic}
          disabled={isDisabled}
          title={isListening ? 'Parar gravação' : 'Falar mensagem'}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', border: 'none',
            background: isListening ? 'rgba(58,90,255,0.2)' : 'transparent',
            color: isListening ? 'var(--accent)' : 'var(--text-muted)',
            cursor: isDisabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
            outline: isListening ? '1px solid var(--accent)' : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="1" width="6" height="8" rx="3" fill="currentColor"/>
            <path d="M2.5 8a5.5 5.5 0 0 0 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="13.5" x2="8" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={handleSend}
          disabled={isDisabled || !input.trim()}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', border: 'none',
            background: isDisabled || !input.trim() ? 'var(--bg-surface)' : 'var(--accent)',
            color: isDisabled || !input.trim() ? 'var(--text-muted)' : 'white',
            cursor: isDisabled || !input.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l3 6-3 6 12-6z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
