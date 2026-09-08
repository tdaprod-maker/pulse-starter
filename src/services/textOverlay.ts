export type TextBand = 'top' | 'center' | 'bottom'
export type TextScale = 'small' | 'medium' | 'large'
export type TextFontKind = 'sans' | 'serif' | 'anton' | 'archivo' | 'bebas' | 'oswald'

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
  /** Família tipográfica — 'sans'→Sora, 'serif'→Playfair Display, 'anton'/'archivo'/
   *  'bebas'/'oswald' → famílias impact/condensadas. Default 'sans'. */
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

// Todas carregadas no index.html (Google Fonts). O fallback existe só para o caso
// de a folha de fonte não ter chegado — mas ensureFontLoaded() abaixo aguarda o
// carregamento antes de desenhar no canvas, então na prática a primeira
// renderização já sai na fonte certa.
const FONT_STACKS: Record<TextFontKind, string> = {
  sans: '"Sora", "Helvetica Neue", Helvetica, Arial, sans-serif',
  serif: '"Playfair Display", Georgia, "Times New Roman", serif',
  anton: '"Anton", "Impact", "Haettenschweiler", "Arial Narrow Bold", sans-serif',
  archivo: '"Archivo Black", "Arial Black", "Helvetica Neue", Arial, sans-serif',
  bebas: '"Bebas Neue", "Oswald", "Impact", "Arial Narrow", sans-serif',
  oswald: '"Oswald", "Impact", "Arial Narrow", sans-serif',
}
const FONT_FAMILY_FOR_LOAD: Record<TextFontKind, string> = {
  sans: '"Sora"',
  serif: '"Playfair Display"',
  anton: '"Anton"',
  archivo: '"Archivo Black"',
  bebas: '"Bebas Neue"',
  oswald: '"Oswald"',
}
// Peso do headline / subtitle por família. Anton, Archivo Black e Bebas Neue só
// têm um peso (400) — pedir 700 nelas dispara faux-bold (borra a fonte já pesada)
// e desalinha a medição do measureText do desenho real. Sora/Playfair mantêm o
// que já estava validado.
const FONT_WEIGHTS: Record<TextFontKind, { head: string; sub: string }> = {
  sans: { head: '700', sub: '500' },
  serif: { head: '700', sub: '500' },
  anton: { head: '400', sub: '400' },
  archivo: { head: '400', sub: '400' },
  bebas: { head: '400', sub: '400' },
  oswald: { head: '700', sub: '400' },
}
const SCALE_MULTIPLIER: Record<TextScale, number> = {
  small: 0.74,
  medium: 1,
  large: 1.3,
}

// Entre baselines = (tinta real ascender+descender) × isto. Substitui o antigo
// `size * 1.25` fixo — agora o espaçamento acompanha a fonte real (condensadas
// apertam, serifadas com descender fundo abrem), medido, não estimado.
const LINE_LEADING = 1.28
// Folga (px) nas checagens de safe-zone, contra antialias sangrando além da bbox
// geométrica medida. Simulação: com 1.5px de sangramento no pior caso de 36k
// combinações (fonte × conteúdo × canvas × band × scale × ±6% de métrica), sobra
// ~1.5px dos dois lados.
const INK_PAD = 3
// Borda de cima da band 'top' é limite duro (marginY), sem faixa de manobra como
// a base. Baseline 1px a mais que INK_PAD → topo do glifo cai com folga real
// abaixo de marginY mesmo no pior caso.
const TOP_PAD = INK_PAD + 1
// Só usados quando `TextMetrics.actualBoundingBox*` não existe (browser antigo /
// canvas sem suporte) ou devolve algo degenerado. Em produção (Chrome/Safari
// atuais) a medição real sempre vence e estes nunca entram.
const FALLBACK_ASCENT_RATIO = 0.95
const FALLBACK_DESCENT_RATIO = 0.32

/** Extensão REAL de tinta acima/abaixo da baseline alfabética, medida com
 *  `ctx.measureText(...).actualBoundingBoxAscent/Descent` na fonte atual do ctx —
 *  por fonte E por conteúdo, sem constante calibrada. `ctx.textBaseline` precisa
 *  estar em 'alphabetic'. Toma o máximo entre as linhas do bloco. */
function inkExtent(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  size: number,
): { ascent: number; descent: number; measured: boolean } {
  let ascent = 0
  let descent = 0
  let measured = false
  for (const line of lines) {
    const m = ctx.measureText(line)
    if (Number.isFinite(m.actualBoundingBoxAscent) && Number.isFinite(m.actualBoundingBoxDescent)) {
      measured = true
      if (m.actualBoundingBoxAscent > ascent) ascent = m.actualBoundingBoxAscent
      if (m.actualBoundingBoxDescent > descent) descent = m.actualBoundingBoxDescent
    }
  }
  if (!measured || ascent + descent < size * 0.25) {
    return { ascent: size * FALLBACK_ASCENT_RATIO, descent: size * FALLBACK_DESCENT_RATIO, measured: false }
  }
  return { ascent, descent, measured: true }
}

/** `ctx.fillText` desenha na fonte de fallback se a web font ainda não terminou de
 *  carregar — silenciosamente, sem erro. Aguardar `document.fonts.load` para os
 *  pesos/tamanhos que vamos usar evita a primeira renderização sair na fonte errada. */
async function ensureFontLoaded(kind: TextFontKind, sizes: number[]): Promise<void> {
  try {
    const fonts = (document as unknown as { fonts?: { load: (f: string) => Promise<unknown>; ready: Promise<unknown> } }).fonts
    if (!fonts?.load) return
    const fam = FONT_FAMILY_FOR_LOAD[kind]
    const weights = FONT_WEIGHTS[kind]
    const specs = new Set<string>()
    for (const s of sizes) {
      const px = Math.max(MIN_FONT_SIZE, Math.round(s))
      specs.add(`${weights.head} ${px}px ${fam}`)
      specs.add(`${weights.sub} ${px}px ${fam}`)
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

interface FittedText {
  size: number
  lines: string[]
  /** avanço entre baselines — derivado da tinta real (ver LINE_LEADING) */
  lineHeight: number
  /** tinta real acima da baseline (máx. entre linhas), medida via TextMetrics */
  ascent: number
  /** tinta real abaixo da baseline (máx. entre linhas), medida via TextMetrics */
  descent: number
}

/** Máximo tamanho de fonte ≤ `startSize` em que `text` cabe em ≤ `maxLines` linhas
 *  dentro de `maxWidth`; se nem no MIN_FONT_SIZE couber, corta linhas excedentes.
 *  ascent/descent/lineHeight saem de medição real (`inkExtent`) na fonte escolhida. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  weight: string,
  maxLines: number,
  fontStack: string,
): FittedText {
  let size = startSize
  let lines: string[] | undefined
  while (size > MIN_FONT_SIZE) {
    ctx.font = `${weight} ${size}px ${fontStack}`
    const wrapped = wrapText(ctx, text, maxWidth)
    if (wrapped.length <= maxLines) { lines = wrapped; break }
    size -= 2
  }
  if (!lines) {
    size = MIN_FONT_SIZE
    ctx.font = `${weight} ${size}px ${fontStack}`
    lines = wrapText(ctx, text, maxWidth).slice(0, maxLines)
  }
  const { ascent, descent } = inkExtent(ctx, lines, size)
  return { size, lines, ascent, descent, lineHeight: Math.round((ascent + descent) * LINE_LEADING) }
}

/** Re-mede ascent/descent/lineHeight de um bloco depois que suas linhas mudaram
 *  (corte no passo 2). Remover linha só pode manter ou reduzir a tinta do bloco. */
function remeasure(ctx: CanvasRenderingContext2D, fitted: FittedText, weight: string, fontStack: string): FittedText {
  ctx.font = `${weight} ${fitted.size}px ${fontStack}`
  const { ascent, descent } = inkExtent(ctx, fitted.lines, fitted.size)
  return { ...fitted, ascent, descent, lineHeight: Math.round((ascent + descent) * LINE_LEADING) }
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
    const weights = FONT_WEIGHTS[fontKind]
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
          // 'alphabetic' ANTES de qualquer measureText: actualBoundingBoxAscent/
          // Descent são relativos à baseline implícita pelo textBaseline — tem que
          // ser a mesma que o fillText usa lá embaixo, senão a medida não bate.
          ctx.textAlign = 'center'
          ctx.textBaseline = 'alphabetic'

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

          let headlineSize = startHeadlineSize
          let fittedHeadline = fitText(ctx, headline, safeWidth, headlineSize, weights.head, MAX_HEADLINE_LINES, fontStack)
          let fittedSubtitle = subtitle
            ? fitText(ctx, subtitle, safeWidth, Math.round(fittedHeadline.size * 0.5), weights.sub, MAX_SUBTITLE_LINES, fontStack)
            : null

          // Recalculado a cada iteração — o gap depende do lineHeight ATUAL do
          // headline, que encolhe junto (antes ficava congelado no valor inicial).
          const currentGap = () => (subtitle ? Math.round(fittedHeadline.lineHeight * 0.35) : 0)

          const blockHeight = () =>
            fittedHeadline.lines.length * fittedHeadline.lineHeight +
            currentGap() +
            (fittedSubtitle ? fittedSubtitle.lines.length * fittedSubtitle.lineHeight : 0)

          // Y da baseline da PRIMEIRA linha — mesma fórmula que o renderer usa.
          // O offset até o topo do bloco é `fittedHeadline.ascent` (tinta real
          // medida), não mais `~0.85*size` estimado. 'top' soma INK_PAD pra o
          // topo do glifo cair logo ABAIXO de marginY, nunca em cima.
          const firstBaselineY = () => {
            const asc = fittedHeadline.ascent
            if (band === 'bottom') return stripYForFit + marginY * 0.5 + asc
            if (band === 'top') return marginY + asc + TOP_PAD
            const platePadY = marginY * 0.7
            const plateH = blockHeight() + platePadY * 2
            return (img.height - plateH) / 2 + platePadY + asc
          }
          // Pixel de tinta mais BAIXO do bloco: baseline da última linha (headline
          // ou subtitle) + descender REAL medido dela.
          const renderedBottom = () => {
            const last = fittedSubtitle ?? fittedHeadline
            return firstBaselineY() + blockHeight() - last.lineHeight + last.descent + INK_PAD
          }
          // Pixel de tinta mais ALTO = baseline da 1ª linha − ascender REAL medido.
          const renderedTop = () => firstBaselineY() - fittedHeadline.ascent - INK_PAD

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
            fittedHeadline = fitText(ctx, headline, safeWidth, headlineSize, weights.head, MAX_HEADLINE_LINES, fontStack)
            fittedSubtitle = subtitle
              ? fitText(ctx, subtitle, safeWidth, Math.round(fittedHeadline.size * 0.5), weights.sub, MAX_SUBTITLE_LINES, fontStack)
              : null
          }

          // 2) Se mesmo no MIN_FONT_SIZE o bloco ainda vaza (canvas pequeno +
          //    headline 3 linhas + subtitle 2 linhas não cabem nos ~32% da faixa),
          //    corta linhas — subtitle primeiro, depois headline — até caber nos
          //    DOIS limites. Checar renderedTop() também é essencial na band
          //    'center': lá o bloco é centrado, e caber embaixo NÃO garante caber
          //    em cima (o topo precisa de bound ~0.28*(asc+desc) mais apertado).
          //    Sempre sobra ≥ 1 linha de headline.
          while (renderedBottom() > safeBottom || renderedTop() < safeTop) {
            if (fittedSubtitle && fittedSubtitle.lines.length > 0) {
              const trimmed = fittedSubtitle.lines.slice(0, -1)
              fittedSubtitle = trimmed.length
                ? remeasure(ctx, { ...fittedSubtitle, lines: trimmed }, weights.sub, fontStack)
                : null
            } else if (fittedHeadline.lines.length > 1) {
              fittedHeadline = remeasure(ctx, { ...fittedHeadline, lines: fittedHeadline.lines.slice(0, -1) }, weights.head, fontStack)
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
            // Idêntico a firstBaselineY() do loop de encaixe (ascent = tinta real
            // medida). O loop ja garantiu renderedBottom() <= safeBottom com este y.
            y = stripY + marginY * 0.5 + fittedHeadline.ascent
          } else if (band === 'top') {
            const stripHeight = img.height * 0.32
            const grad = ctx.createLinearGradient(0, 0, 0, stripHeight)
            grad.addColorStop(0, 'rgba(0,0,0,0.75)')
            grad.addColorStop(0.6, 'rgba(0,0,0,0.55)')
            grad.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, img.width, stripHeight)
            // Igual a firstBaselineY() do loop de encaixe: baseline = marginY +
            // ascender REAL medido + TOP_PAD → topo do glifo cai abaixo de marginY
            // com folga real, nunca acima.
            y = marginY + fittedHeadline.ascent + TOP_PAD
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
            y = plateY + platePadY + fittedHeadline.ascent
          }

          ctx.fillStyle = headlineColor
          ctx.font = `${weights.head} ${fittedHeadline.size}px ${fontStack}`
          for (const line of fittedHeadline.lines) {
            ctx.fillText(line, centerX, y, safeWidth)
            y += fittedHeadline.lineHeight
          }

          if (fittedSubtitle) {
            y += gap
            ctx.font = `${weights.sub} ${fittedSubtitle.size}px ${fontStack}`
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
