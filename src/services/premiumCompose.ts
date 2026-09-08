import { overlayLogoOnImage, type LogoPosition, type LogoSize } from './logoOverlay'
import { overlayTextOnImage, type TextBand, type TextScale, type TextFontKind, type TextRun, type StyledLine, type TextContent } from './textOverlay'

/** Camada de logo do Premium. Vive no EditorPage (fonte única) — nunca mais em
 *  estado local congelado dentro de um viewer. */
export interface PremiumLogoLayer {
  active: boolean
  position: LogoPosition
  size: LogoSize
}

/** Camada de texto (headline/subtitle desenhados por canvas depois da geração).
 *  `band`/`scale`/`color`/`font` são os controles pós-inserção expostos no viewer. */
export interface PremiumTextLayer {
  active: boolean
  headline: string
  subtitle?: string
  band: TextBand
  scale: TextScale
  color: string
  font: TextFontKind
  /** Fase 3 (UI opção A): trecho literal do headline a colorir + a cor. Só afeta
   *  o render quando os DOIS estão setados e o trecho é achado no headline —
   *  senão o headline continua sendo uma string simples (comportamento Fase 2). */
  highlightText?: string
  highlightColor?: string
}

export const DEFAULT_PREMIUM_LOGO_LAYER: PremiumLogoLayer = {
  active: false,
  position: 'bottom-right',
  size: 'medium',
}

export const DEFAULT_PREMIUM_TEXT_LAYER: PremiumTextLayer = {
  active: false,
  headline: '',
  band: 'bottom',
  scale: 'medium',
  color: '#FFFFFF',
  font: 'sans',
  highlightText: '',
  highlightColor: '#4A90D9',
}

/** Monta o headline como StyledLine[] com o trecho `hlText` (case-insensitive,
 *  1ª ocorrência por linha) num run de cor `hlColor`. Se faltar um dos dois, o
 *  trecho não aparecer, ou o match não cair em fronteira de palavra, devolve a
 *  string original (o overlay segue no caminho simples da Fase 2). Respeita `\n`.
 *
 *  O match precisa ser word-aligned porque o tokenizer do overlay normaliza
 *  whitespace para 1 espaço entre tokens — um match no MEIO de uma palavra
 *  ("SULT" em "RESULTADOS") introduziria espaços e mudaria a métrica, quebrando
 *  a neutralidade que garante a safe-zone. Destaque é para palavras/frases. */
export function buildHighlightedHeadline(headline: string, hlText?: string, hlColor?: string): TextContent {
  const needle = hlText?.trim()
  if (!needle || !hlColor) return headline
  let matched = false
  const lines: StyledLine[] = headline.split('\n').map(raw => {
    const idx = raw.toLowerCase().indexOf(needle.toLowerCase())
    if (idx < 0) return raw
    const end = idx + needle.length
    const boundaryBefore = idx === 0 || /\s/.test(raw[idx - 1])
    const boundaryAfter = end === raw.length || /\s/.test(raw[end])
    if (!boundaryBefore || !boundaryAfter) return raw
    matched = true
    const runs: TextRun[] = []
    const before = raw.slice(0, idx)
    const after = raw.slice(end)
    if (before) runs.push({ text: before })
    runs.push({ text: raw.slice(idx, end), color: hlColor })
    if (after) runs.push({ text: after })
    return runs
  })
  return matched ? lines : headline
}

export function isTextLayerActive(layer: PremiumTextLayer | null | undefined): boolean {
  return !!layer?.active && !!layer.headline.trim()
}

export function isLogoLayerActive(layer: PremiumLogoLayer | null | undefined, logoUrl: string | null | undefined): boolean {
  return !!layer?.active && !!logoUrl
}

/**
 * Compõe a imagem final do Premium na ordem canônica: **base → texto → logo**.
 * O logo entra por último de propósito — se o texto tem um scrim na base e o logo
 * está em `bottom-*`, desenhar o logo depois garante que ele fica *sobre* o scrim,
 * nunca soterrado por ele. Camadas inativas são no-op (retorna a imagem intacta).
 */
export async function composePremiumImage(
  baseImage: string,
  opts: { text?: PremiumTextLayer | null; logo?: PremiumLogoLayer | null; logoUrl?: string | null },
): Promise<string> {
  if (!baseImage) return baseImage
  let out = baseImage

  if (isTextLayerActive(opts.text)) {
    const t = opts.text as PremiumTextLayer
    out = await overlayTextOnImage(out, {
      headline: buildHighlightedHeadline(t.headline, t.highlightText, t.highlightColor),
      subtitle: t.subtitle?.trim() || undefined,
      band: t.band,
      scale: t.scale,
      color: t.color,
      font: t.font,
    })
  }

  if (isLogoLayerActive(opts.logo, opts.logoUrl)) {
    const l = opts.logo as PremiumLogoLayer
    out = await overlayLogoOnImage(out, opts.logoUrl as string, l.position, l.size)
  }

  return out
}
