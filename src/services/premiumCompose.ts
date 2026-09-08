import { overlayLogoOnImage, type LogoPosition, type LogoSize } from './logoOverlay'
import { overlayTextOnImage, type TextBand, type TextScale, type TextFontKind } from './textOverlay'

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
      headline: t.headline,
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
