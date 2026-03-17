import { useState } from 'react'
import { useStore } from '../state/useStore'
import { templateRegistry } from '../templates/index'
import { generatePostContent } from '../services/gemini'
import type { AIResponse } from '../services/gemini'
import { generateImage } from '../services/replicate'
import { useTheme } from '../contexts/ThemeContext'

// ─── Qual elemento de cada template recebe a accentColor ─────────────────────
// IDs corretos conforme variants.ts de cada template:
// hero-title:    'accent-bar' (shape barra vertical azul)
// editorial-card: 'accent-bar' (shape barra coral)
// minimal-type:  'phrase'  (text — muda cor da frase)
// big-number:    'number'  (text — muda cor do número)
// big-statement: excluído — line2 usa amarelo do design system (#FFCA1D)
const ACCENT_ELEMENT: Record<string, string> = {
  'hero-title':    'accent-bar',
  'editorial-card': 'accent-bar',
  'minimal-type':  'phrase',
  'big-number':    'number',
  'food-promo':    'bg-color',
}

// ─── Normaliza nomes que a IA pode retornar levemente errados ─────────────────
function normalizeTemplateId(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, '-')
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AIPanel() {
  const [prompt, setPrompt]   = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const { addTemplate, setActiveTemplate, updateElement, setTemplateBackground } = useStore()
  const { theme } = useTheme()

  // ── Aplica o resultado da IA no store ──────────────────────────────────────
  function applyResult(result: AIResponse) {
    const templateId = normalizeTemplateId(result.template)
    const def = templateRegistry.find((d) => d.id === templateId)
    if (!def) throw new Error(`Template "${result.template}" não reconhecido`)

    const allVariants = def.getVariants(theme)

    // Preserva o formato ativo:
    // 1. Tenta match exato (mesma família, mesmo formato: hero-title-9x16 → hero-title-9x16)
    // 2. Se família diferente, preserva o sufixo do formato (hero-title-9x16 → editorial-card-9x16)
    // 3. Fallback: 1:1 da nova família
    const currentActiveId = useStore.getState().activeTemplateId
    let variant = allVariants.find((v) => v.id === currentActiveId)
    if (!variant && currentActiveId) {
      const suffix = currentActiveId.split('-').pop()
      variant = allVariants.find((v) => v.id.endsWith('-' + suffix))
    }
    variant ??= allVariants[0]

    // Sempre faz upsert para garantir que elementos antigos (ex: accent-line obsoleto)
    // sejam substituídos pela definição canônica atual do template.
    addTemplate(variant)
    setActiveTemplate(variant.id)

    // Lê o template do store (com os props canônicos, recém adicionado)
    const stored = useStore.getState().templates.find((t) => t.id === variant.id) ?? variant

    // Aplica os textos campo a campo
    Object.entries(result.texts).forEach(([fieldId, text]) => {
      const el = stored.elements.find((e) => e.id === fieldId)
      if (el && el.type === 'text') {
        updateElement(variant.id, fieldId, {
          props: { ...el.props, text: String(text) },
        })
      }
    })

    // Relê do store APÓS as atualizações de texto (Zustand set() é síncrono).
    // Necessário porque `stored` é um snapshot antigo: se o elemento de destaque
    // for o mesmo que um campo de texto (ex: minimal-type → phrase), usar
    // `stored.elements` espalharia os props velhos e reverteria o texto recém-aplicado.
    const afterTexts = useStore.getState().templates.find((t) => t.id === variant.id) ?? stored

    // Aplica a cor de destaque ao elemento correto do template
    const accentColor = result.accentColor
    if (accentColor) {
      const accentId = ACCENT_ELEMENT[templateId]
      if (accentId) {
        const accentEl = afterTexts.elements.find((e) => e.id === accentId)
        if (accentEl) {
          updateElement(variant.id, accentId, {
            props: { ...accentEl.props, fill: accentColor },
          })
        }
      }
    }
  }

  // ── Handler principal ──────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!prompt.trim() || status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    // Captura o formato ativo antes da geração (sufixo: '1x1', '4x5', '9x16', '16x9')
    const beforeId     = useStore.getState().activeTemplateId
    const beforeSuffix = beforeId ? beforeId.split('-').pop() : null

    try {
      // 1. Gera textos via Gemini
      const result = await generatePostContent(prompt.trim())
      applyResult(result)

      // Verificação de segurança: se o formato mudou após applyResult, restaura
      const afterId     = useStore.getState().activeTemplateId
      const afterSuffix = afterId ? afterId.split('-').pop() : null
      if (beforeSuffix && afterSuffix && beforeSuffix !== afterSuffix && afterId) {
        const def = templateRegistry.find((d) => afterId.startsWith(d.id + '-') || afterId === d.id)
        if (def) {
          const allVariants = def.getVariants(theme)
          const target = allVariants.find((v) => v.id.endsWith('-' + beforeSuffix))
          if (target) {
            if (!useStore.getState().templates.find((t) => t.id === target.id)) {
              addTemplate(target)
            }
            setActiveTemplate(target.id)
          }
        }
      }

      // 2. Gera imagem de fundo via proxy local → Pollinations.ai (base64)
      if (result.imagePrompt) {
        const url      = await generateImage(result.imagePrompt)
        const activeId = useStore.getState().activeTemplateId
        if (activeId) setTemplateBackground(activeId, url)
      }

      setStatus('idle')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('error')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const loading  = status === 'loading'
  const disabled = loading || !prompt.trim()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      padding: '16px', borderBottom: '1px solid var(--border)',
    }}>
      <h3 style={{
        fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
        color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0,
      }}>
        Gerar com IA
      </h3>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)' }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)' }}
        disabled={loading}
        placeholder="Ex: lançamento de produto tech, tom sofisticado..."
        rows={3}
        style={{
          width: '100%', background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '10px 12px', color: 'var(--text-primary)',
          fontSize: '13px', fontFamily: 'inherit', resize: 'none',
          outline: 'none', lineHeight: 1.5,
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={disabled}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        style={{
          width: '100%', background: 'var(--accent)',
          border: 'none', borderRadius: '8px', padding: '10px',
          color: 'white', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px', fontFamily: 'inherit',
          transition: 'opacity 0.15s',
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {loading ? (
          <>
            <SpinnerIcon />
            Gerando...
          </>
        ) : (
          <>
            <SparkleIcon />
            Gerar
          </>
        )}
      </button>

      {status === 'error' && (
        <p className="text-xs text-red-400 leading-snug">{errorMsg}</p>
      )}

      <p style={{
        fontSize: '11px', color: 'var(--text-muted)',
        textAlign: 'center', margin: 0,
      }}>
        ⌘ Enter para gerar rapidamente
      </p>
    </div>
  )
}

// ─── Ícones ───────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg className="shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5 L8.3 5.2 L12 7 L8.3 8.8 L7 12.5 L5.7 8.8 L2 7 L5.7 5.2 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
