export interface TextOverlayOptions {
  headline: string
  subtitle?: string
}

// Margens de safe-zone do Instagram — as mesmas porcentagens que antes só existiam
// como texto de prompt para o gpt-image-2 ("mantenha ~3% de margem lateral e ~4.5%
// vertical"). Aqui viram matemática de canvas: garantia por construção, não por
// instrução que o modelo pode ignorar.
const SAFE_MARGIN_X_RATIO = 0.03
const SAFE_MARGIN_Y_RATIO = 0.045
const MIN_FONT_SIZE = 22
const MAX_HEADLINE_LINES = 3
const MAX_SUBTITLE_LINES = 2

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const lines: string[] = []
  let current = words[0]
  for (const word of words.slice(1)) {
    const test = `${current} ${word}`
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      lines.push(current)
      current = word
    }
  }
  lines.push(current)
  return lines
}

/** Reduz o tamanho de fonte até o texto caber em no máximo `maxLines` linhas dentro
 *  de `maxWidth`, parando em MIN_FONT_SIZE mesmo que ainda não caiba perfeitamente
 *  (nesse caso corta linhas excedentes — nunca deixa o texto vazar da safe zone). */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  bold: boolean,
  maxLines: number,
): { size: number; lines: string[]; lineHeight: number } {
  let size = startSize
  while (size > MIN_FONT_SIZE) {
    ctx.font = `${bold ? '700 ' : '500 '}${size}px Helvetica, Arial, sans-serif`
    const lines = wrapText(ctx, text, maxWidth)
    if (lines.length <= maxLines) {
      return { size, lines, lineHeight: Math.round(size * 1.25) }
    }
    size -= 2
  }
  ctx.font = `${bold ? '700 ' : '500 '}${MIN_FONT_SIZE}px Helvetica, Arial, sans-serif`
  return { size: MIN_FONT_SIZE, lines: wrapText(ctx, text, maxWidth).slice(0, maxLines), lineHeight: Math.round(MIN_FONT_SIZE * 1.25) }
}

/**
 * Desenha headline (+ subtitle opcional) sobre uma imagem já gerada, dentro de uma
 * safe-zone calculada em código — nunca depende do gpt-image-2 para posicionar ou
 * dimensionar texto. Usa uma faixa semi-transparente na base da imagem para garantir
 * contraste independente do brilho da foto por baixo. Sempre sans-serif (Helvetica/
 * Arial), nunca decidido pelo modelo.
 */
export function overlayTextOnImage(imageBase64: string, opts: TextOverlayOptions): Promise<string> {
  return new Promise((resolve) => {
    const headline = opts.headline?.trim()
    if (!headline) { resolve(imageBase64); return }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(imageBase64); return }
        ctx.drawImage(img, 0, 0)

        const marginX = img.width * SAFE_MARGIN_X_RATIO
        const marginY = img.height * SAFE_MARGIN_Y_RATIO
        const safeWidth = img.width - marginX * 2

        // Faixa reservada na base — mesma região que o prompt de geração agora é
        // instruído a deixar "limpa" (ver buildTextTypographyRules/reservedSpace
        // em api/generate-premium.js).
        const stripHeight = img.height * 0.32
        const stripY = img.height - stripHeight
        const gradient = ctx.createLinearGradient(0, stripY, 0, img.height)
        gradient.addColorStop(0, 'rgba(0,0,0,0)')
        gradient.addColorStop(0.4, 'rgba(0,0,0,0.55)')
        gradient.addColorStop(1, 'rgba(0,0,0,0.75)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, stripY, img.width, stripHeight)

        const maxBlockHeight = stripHeight - marginY * 1.5
        const subtitle = opts.subtitle?.trim()

        let headlineSize = Math.round(img.width * 0.085)
        let fittedHeadline = fitText(ctx, headline, safeWidth, headlineSize, true, MAX_HEADLINE_LINES)
        let fittedSubtitle = subtitle
          ? fitText(ctx, subtitle, safeWidth, Math.round(fittedHeadline.size * 0.5), false, MAX_SUBTITLE_LINES)
          : null
        const gap = subtitle ? Math.round(fittedHeadline.lineHeight * 0.35) : 0

        const blockHeight = () =>
          fittedHeadline.lines.length * fittedHeadline.lineHeight +
          gap +
          (fittedSubtitle ? fittedSubtitle.lines.length * fittedSubtitle.lineHeight : 0)

        // Reduz junto (headline + subtitle) até o bloco inteiro caber na altura
        // reservada, sem nunca ultrapassar a safe zone vertical.
        while (blockHeight() > maxBlockHeight && headlineSize > MIN_FONT_SIZE) {
          headlineSize -= 2
          fittedHeadline = fitText(ctx, headline, safeWidth, headlineSize, true, MAX_HEADLINE_LINES)
          fittedSubtitle = subtitle
            ? fitText(ctx, subtitle, safeWidth, Math.round(fittedHeadline.size * 0.5), false, MAX_SUBTITLE_LINES)
            : null
        }

        // Posiciona de cima pra baixo dentro da faixa reservada: como `blockHeight()`
        // já foi restringido a caber em `maxBlockHeight` (dentro da safe zone), começar
        // no topo da faixa (+ um respiro) garante que a última linha nunca ultrapassa
        // a margem inferior — sem precisar de matemática de baseline pixel-perfeita.
        const centerX = img.width / 2
        const safeTop = stripY + marginY * 0.5
        let y = safeTop + fittedHeadline.size * 0.85

        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `700 ${fittedHeadline.size}px Helvetica, Arial, sans-serif`
        for (const line of fittedHeadline.lines) {
          ctx.fillText(line, centerX, y, safeWidth)
          y += fittedHeadline.lineHeight
        }

        if (fittedSubtitle) {
          y += gap
          ctx.font = `500 ${fittedSubtitle.size}px Helvetica, Arial, sans-serif`
          ctx.fillStyle = 'rgba(255,255,255,0.92)'
          for (const line of fittedSubtitle.lines) {
            ctx.fillText(line, centerX, y, safeWidth)
            y += fittedSubtitle.lineHeight
          }
        }

        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(imageBase64)
      }
    }
    img.onerror = () => resolve(imageBase64)
    img.src = imageBase64
  })
}
