export type TextBand = 'top' | 'center' | 'bottom'
export type TextScale = 'small' | 'medium' | 'large'
export type TextFontKind = 'sans' | 'serif'

export interface TextOverlayOptions {
  headline: string
  subtitle?: string
  /** Faixa vertical onde o texto é ancorado. Default 'bottom' (retrocompatível
   *  com as chamadas de geração, que sempre desenharam na base). */
  band?: TextBand
  /** Multiplicador do tamanho de fonte base (img.width * 0.085). Default 'medium'. */
  scale?: TextScale
  /** Cor do headline (hex). Subtitle usa a mesma cor com alpha reduzido. Default '#FFFFFF'. */
  color?: string
  /** Família tipográfica com caráter — 'sans' → Sora, 'serif' → Playfair Display.
   *  Substitui a Helvetica/Arial genérica de antes. Default 'sans'. */
  font?: TextFontKind
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

// Sora e Playfair Display já são carregadas no index.html (Google Fonts). O fallback
// existe só para o caso de a folha de fonte não ter chegado — mas ensureFontLoaded()
// abaixo aguarda o carregamento antes de desenhar no canvas, então na prática a
// primeira renderização já sai na fonte certa.
const FONT_STACKS: Record<TextFontKind, string> = {
  sans: '"Sora", "Helvetica Neue", Helvetica, Arial, sans-serif',
  serif: '"Playfair Display", Georgia, "Times New Roman", serif',
}
const FONT_FAMILY_FOR_LOAD: Record<TextFontKind, string> = {
  sans: '"Sora"',
  serif: '"Playfair Display"',
}
const SCALE_MULTIPLIER: Record<TextScale, number> = {
  small: 0.74,
  medium: 1,
  large: 1.3,
}

/** `ctx.fillText` desenha na fonte de fallback se a web font ainda não terminou de
 *  carregar — silenciosamente, sem erro. Aguardar `document.fonts.load` para os
 *  pesos/tamanhos que vamos usar evita a primeira renderização sair na fonte errada. */
async function ensureFontLoaded(kind: TextFontKind, sizes: number[]): Promise<void> {
  try {
    const fonts = (document as unknown as { fonts?: { load: (f: string) => Promise<unknown>; ready: Promise<unknown> } }).fonts
    if (!fonts?.load) return
    const fam = FONT_FAMILY_FOR_LOAD[kind]
    const specs = new Set<string>()
    for (const s of sizes) {
      specs.add(`700 ${Math.max(MIN_FONT_SIZE, Math.round(s))}px ${fam}`)
      specs.add(`500 ${Math.max(MIN_FONT_SIZE, Math.round(s))}px ${fam}`)
    }
    await Promise.all([...specs].map(spec => fonts.load(spec).catch(() => undefined)))
    await fonts.ready
  } catch {
    // usa o fallback stack — não bloqueia o overlay
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return `rgba(255,255,255,${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

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
  fontStack: string,
): { size: number; lines: string[]; lineHeight: number } {
  let size = startSize
  while (size > MIN_FONT_SIZE) {
    ctx.font = `${bold ? '700 ' : '500 '}${size}px ${fontStack}`
    const lines = wrapText(ctx, text, maxWidth)
    if (lines.length <= maxLines) {
      return { size, lines, lineHeight: Math.round(size * 1.25) }
    }
    size -= 2
  }
  ctx.font = `${bold ? '700 ' : '500 '}${MIN_FONT_SIZE}px ${fontStack}`
  return { size: MIN_FONT_SIZE, lines: wrapText(ctx, text, maxWidth).slice(0, maxLines), lineHeight: Math.round(MIN_FONT_SIZE * 1.25) }
}

/**
 * Desenha headline (+ subtitle opcional) sobre uma imagem já gerada, dentro de uma
 * safe-zone calculada em código — nunca depende do gpt-image-2 para posicionar ou
 * dimensionar texto. `band` escolhe a faixa (base/topo com scrim de gradiente,
 * centro com placa de contraste). Tipografia com caráter (Sora/Playfair), tamanho
 * e cor são parâmetros de código, nunca decididos pelo modelo.
 */
export function overlayTextOnImage(imageBase64: string, opts: TextOverlayOptions): Promise<string> {
  return new Promise((resolve) => {
    const headline = opts.headline?.trim()
    if (!headline) { resolve(imageBase64); return }

    const band: TextBand = opts.band ?? 'bottom'
    const fontKind: TextFontKind = opts.font ?? 'sans'
    const fontStack = FONT_STACKS[fontKind]
    const scaleMult = SCALE_MULTIPLIER[opts.scale ?? 'medium']
    const headlineColor = opts.color?.trim() || '#FFFFFF'
    const subtitleColor = hexToRgba(headlineColor, 0.92)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      void (async () => {
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
          const subtitle = opts.subtitle?.trim()

          const startHeadlineSize = Math.round(img.width * 0.085 * scaleMult)
          await ensureFontLoaded(fontKind, [startHeadlineSize, Math.round(startHeadlineSize * 0.5)])

          // Faixa (scrim de gradiente) usada por 'bottom'/'top' — proporção fixa da
          // altura. `firstBaselineY()` abaixo REPLICA exatamente a fórmula de `y`
          // que o renderer usa mais adiante: é essa igualdade que garante que o
          // teste "cabe na safe zone" bate com o desenho real.
          const STRIP_RATIO = 0.32
          const stripYForFit = img.height - img.height * STRIP_RATIO
          // Distâncias baseline↔tinta da Sora (em frações do size), com folga:
          // ASCENT cobre ascender + diacríticos PT (Ã, Õ, É); DESCENT o descender.
          const ASCENT_RATIO = 0.93
          const DESCENT_RATIO = 0.30
          // Deslocamento vertical do desenho (baseline da 1ª linha) por band.
          // 'top' usa o ascender inteiro pra que o topo do glifo caia EM marginY,
          // não acima; 'bottom'/'center' mantêm o respiro visual de antes (0.85).
          const drawAscent = (size: number) => (band === 'top' ? size * (ASCENT_RATIO + 0.03) : size * 0.85)

          let headlineSize = startHeadlineSize
          let fittedHeadline = fitText(ctx, headline, safeWidth, headlineSize, true, MAX_HEADLINE_LINES, fontStack)
          let fittedSubtitle = subtitle
            ? fitText(ctx, subtitle, safeWidth, Math.round(fittedHeadline.size * 0.5), false, MAX_SUBTITLE_LINES, fontStack)
            : null

          // Recalculado a cada iteração — o gap depende do lineHeight ATUAL do
          // headline, que encolhe junto (antes ficava congelado no valor inicial).
          const currentGap = () => (subtitle ? Math.round(fittedHeadline.lineHeight * 0.35) : 0)

          const blockHeight = () =>
            fittedHeadline.lines.length * fittedHeadline.lineHeight +
            currentGap() +
            (fittedSubtitle ? fittedSubtitle.lines.length * fittedSubtitle.lineHeight : 0)

          // Baseline da PRIMEIRA linha — idêntico ao `y` inicial do renderer para
          // cada band. Sem replicar isso aqui, o loop de encaixe ignorava o offset
          // de partida (~0.85*headlineSize + 0.5*marginY na base) e o bloco
          // headline+subtitle vazava a margem inferior (bug real: legendas de
          // carrossel Premium, que passam subtitle, saíam da safe zone).
          const firstBaselineY = () => {
            const asc = drawAscent(fittedHeadline.size)
            if (band === 'bottom') return stripYForFit + marginY * 0.5 + asc
            if (band === 'top') return marginY + asc
            const platePadY = marginY * 0.7
            const plateH = blockHeight() + platePadY * 2
            return (img.height - plateH) / 2 + platePadY + asc
          }
          // Pixel de tinta mais BAIXO do bloco inteiro (última linha = subtitle se
          // houver): baseline da última linha + descender.
          const renderedBottom = () => {
            const lastLH = fittedSubtitle ? fittedSubtitle.lineHeight : fittedHeadline.lineHeight
            const lastSize = fittedSubtitle ? fittedSubtitle.size : fittedHeadline.size
            return firstBaselineY() + blockHeight() - lastLH + lastSize * DESCENT_RATIO
          }
          // Pixel de tinta mais ALTO (topo da 1ª linha = baseline − ascender).
          const renderedTop = () => firstBaselineY() - fittedHeadline.size * ASCENT_RATIO

          const safeBottom = img.height - marginY
          const safeTop = marginY

          // 1) Encolhe headline (e subtitle junto) até o envelope de tinta caber
          //    em [safeTop, safeBottom]. O loop testa a MESMA geometria que o
          //    renderer desenha, então ao sair renderedBottom() <= safeBottom e
          //    renderedTop() >= safeTop — ou chegou-se ao MIN_FONT_SIZE.
          while (
            headlineSize > MIN_FONT_SIZE &&
            (renderedBottom() > safeBottom || renderedTop() < safeTop)
          ) {
            headlineSize -= 2
            fittedHeadline = fitText(ctx, headline, safeWidth, headlineSize, true, MAX_HEADLINE_LINES, fontStack)
            fittedSubtitle = subtitle
              ? fitText(ctx, subtitle, safeWidth, Math.round(fittedHeadline.size * 0.5), false, MAX_SUBTITLE_LINES, fontStack)
              : null
          }

          // 2) Se mesmo no MIN_FONT_SIZE o bloco ainda vaza (canvas pequeno +
          //    headline 3 linhas + subtitle 2 linhas não cabem nos ~32% da faixa),
          //    corta linhas — subtitle primeiro, depois headline — até caber.
          //    Sempre sobra ≥ 1 linha de headline. Garante o invariante por
          //    construção mesmo no pior caso.
          while (renderedBottom() > safeBottom) {
            if (fittedSubtitle && fittedSubtitle.lines.length > 0) {
              fittedSubtitle = { ...fittedSubtitle, lines: fittedSubtitle.lines.slice(0, -1) }
              if (fittedSubtitle.lines.length === 0) fittedSubtitle = null
            } else if (fittedHeadline.lines.length > 1) {
              fittedHeadline = { ...fittedHeadline, lines: fittedHeadline.lines.slice(0, -1) }
            } else {
              break
            }
          }

          const gap = currentGap()
          const centerX = img.width / 2
          const totalBlock = blockHeight()
          let y: number

          if (band === 'bottom') {
            const stripHeight = img.height * 0.32
            const stripY = img.height - stripHeight
            const grad = ctx.createLinearGradient(0, stripY, 0, img.height)
            grad.addColorStop(0, 'rgba(0,0,0,0)')
            grad.addColorStop(0.4, 'rgba(0,0,0,0.55)')
            grad.addColorStop(1, 'rgba(0,0,0,0.75)')
            ctx.fillStyle = grad
            ctx.fillRect(0, stripY, img.width, stripHeight)
            // Começa no topo da faixa (+ respiro): o loop de encaixe já garantiu
            // que renderedBottom() <= safeBottom com ESTE mesmo y.
            y = stripY + marginY * 0.5 + drawAscent(fittedHeadline.size)
          } else if (band === 'top') {
            const stripHeight = img.height * 0.32
            const grad = ctx.createLinearGradient(0, 0, 0, stripHeight)
            grad.addColorStop(0, 'rgba(0,0,0,0.75)')
            grad.addColorStop(0.6, 'rgba(0,0,0,0.55)')
            grad.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, img.width, stripHeight)
            // Igual a firstBaselineY() do loop de encaixe. Baseline = marginY +
            // ascender inteiro → topo do glifo cai EM marginY (era marginY*0.9 +
            // 0.85: o topo do glifo passava acima da margem em headlines grandes).
            y = marginY + drawAscent(fittedHeadline.size)
          } else {
            // center: placa de contraste atrás do bloco (sem scrim de tela cheia).
            const platePadX = marginX * 0.8
            const platePadY = marginY * 0.7
            const plateW = Math.min(img.width - marginX, safeWidth + platePadX * 2)
            const plateH = totalBlock + platePadY * 2
            const plateX = (img.width - plateW) / 2
            const plateY = (img.height - plateH) / 2
            const radius = Math.min(28, plateH / 2)
            ctx.fillStyle = 'rgba(0,0,0,0.42)'
            ctx.beginPath()
            ctx.moveTo(plateX + radius, plateY)
            ctx.arcTo(plateX + plateW, plateY, plateX + plateW, plateY + plateH, radius)
            ctx.arcTo(plateX + plateW, plateY + plateH, plateX, plateY + plateH, radius)
            ctx.arcTo(plateX, plateY + plateH, plateX, plateY, radius)
            ctx.arcTo(plateX, plateY, plateX + plateW, plateY, radius)
            ctx.closePath()
            ctx.fill()
            y = plateY + platePadY + drawAscent(fittedHeadline.size)
          }

          ctx.textAlign = 'center'
          ctx.textBaseline = 'alphabetic'
          ctx.fillStyle = headlineColor
          ctx.font = `700 ${fittedHeadline.size}px ${fontStack}`
          for (const line of fittedHeadline.lines) {
            ctx.fillText(line, centerX, y, safeWidth)
            y += fittedHeadline.lineHeight
          }

          if (fittedSubtitle) {
            y += gap
            ctx.font = `500 ${fittedSubtitle.size}px ${fontStack}`
            ctx.fillStyle = subtitleColor
            for (const line of fittedSubtitle.lines) {
              ctx.fillText(line, centerX, y, safeWidth)
              y += fittedSubtitle.lineHeight
            }
          }

          resolve(canvas.toDataURL('image/png'))
        } catch {
          resolve(imageBase64)
        }
      })()
    }
    img.onerror = () => resolve(imageBase64)
    img.src = imageBase64
  })
}
