import { useEffect, useRef, useState } from 'react'
import type { CanvasElement } from '../state/useStore'

interface TextEditorProps {
  el: CanvasElement
  /** DOMRect do container do Stage (stageRef.current.container().getBoundingClientRect()) */
  containerRect: DOMRect
  /** Fator de escala do preview — calcAutoScale(template) */
  autoScale: number
  /** Chamado com o novo texto ao confirmar (blur ou Enter em campo de linha única) */
  onCommit: (newText: string) => void
  /** Chamado ao pressionar Escape — reverte sem salvar */
  onCancel: () => void
}

/**
 * Textarea sobreposto ao canvas para edição inline de texto.
 *
 * Posicionamento: position fixed (relativo ao viewport) para ser imune a scroll.
 * Estilo: espelha exatamente os props do nó Konva, compensando o autoScale.
 *
 * Fluxo:
 *   1. Monta → foca e seleciona todo o texto
 *   2. Usuário edita → textarea cresce automaticamente com o conteúdo
 *   3. Blur → commit   |   Escape → cancel
 *   4. Resize/scroll da janela → commit (garante que o estado não fique preso)
 */
export function TextEditor({ el, containerRect, autoScale, onCommit, onCancel }: TextEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState((el.props.text as string) ?? '')

  // ── Fonte escalonada para o preview ───────────────────────────────────────
  const rawFontStyle   = (el.props.fontStyle as string) ?? 'normal'
  const cssFontWeight  = rawFontStyle.includes('bold') ? 'bold' : 'normal'
  const cssFontStyle   = rawFontStyle.includes('italic') ? 'italic' : 'normal'
  const scaledFontSize = ((el.props.fontSize as number) ?? 24) * autoScale
  const scaledLetterSpacing = ((el.props.letterSpacing as number) ?? 0) * autoScale

  // ── Foco e seleção ao montar ───────────────────────────────────────────────
  useEffect(() => {
    const ta = ref.current
    if (!ta) return
    ta.focus()
    ta.setSelectionRange(ta.value.length, ta.value.length)
  }, [])

  // ── Auto-resize: cresce com o conteúdo, nunca mostra barra de rolagem ─────
  useEffect(() => {
    const ta = ref.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [value])

  // ── Commit ao redimensionar ou rolar a janela ──────────────────────────────
  useEffect(() => {
    const handler = () => onCommit(value)
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [value, onCommit])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const style: React.CSSProperties = {
    // ── Posição: fixed → relativo ao viewport, imune a scroll de containers ──
    position: 'fixed',
    left:  containerRect.left + el.x * autoScale,
    top:   containerRect.top  + el.y * autoScale,
    width: (el.width || 400) * autoScale,
    minHeight: scaledFontSize * ((el.props.lineHeight as number) ?? 1.2),
    zIndex: 1000,

    // ── Tipografia: espelha exatamente o nó Konva ─────────────────────────────
    fontSize:      scaledFontSize,
    fontFamily:    (el.props.fontFamily as string) ?? 'Inter, sans-serif',
    fontWeight:    cssFontWeight,
    fontStyle:     cssFontStyle,
    lineHeight:    el.props.lineHeight as number ?? 1.2,
    letterSpacing: scaledLetterSpacing ? `${scaledLetterSpacing}px` : 'normal',
    textAlign:     (el.props.align as 'left' | 'center' | 'right') ?? 'left',
    color:         (el.props.fill as string) ?? '#000000',

    // ── Layout: sem padding próprio para alinhar com o texto Konva ───────────
    padding:    0,
    margin:     0,
    border:     'none',
    // outline visível como indicador de edição (não afeta box-model)
    outline:       '1.5px solid #3A5AFF',
    outlineOffset: '3px',
    borderRadius:  0,
    boxSizing:     'border-box',

    // ── Aparência: transparente para que o fundo do canvas apareça ────────────
    background:  'transparent',
    resize:      'none',
    overflow:    'hidden',
    whiteSpace:  'pre-wrap', // preserva quebras de linha (\n) do template
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onCommit(value)}
      style={style}
      // Impede que o click no textarea propague para o Stage (que limparia a seleção)
      onClick={(e) => e.stopPropagation()}
    />
  )
}
