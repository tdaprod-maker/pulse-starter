import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Tipografia ────────────────────────────────────────────────────────────────
const FS    = 72     // era 56 — maior, mais confiante
const LH    = 1.2   // era 1.4 — mais deliberado e tenso
const LINES = 2

// ─── Helpers ──────────────────────────────────────────────────────────────────
const textH = (fs: number, lh: number, n: number) => Math.ceil(fs * lh * n)
const PHRASE_H = textH(FS, LH, LINES)   // 173px

const OPTICAL_SHIFT = -16
const centerY = (canvasH: number) =>
  Math.round((canvasH - PHRASE_H) / 2) + OPTICAL_SHIFT

// ─── Hairline accent ──────────────────────────────────────────────────────────
// Único elemento gráfico: uma régua discreta abaixo do texto
const HAIRLINE_W   = 120
const HAIRLINE_H   = 2
const HAIRLINE_GAP = 56   // distância generosa entre texto e régua

// ─── Margens e larguras ───────────────────────────────────────────────────────
const LM_1080 = 120
const W_1080  = 1080 - LM_1080 * 2   // 840px

// 16:9 — fonte escala proporcionalmente com o canvas maior
const FS_1920    = 96
const PHRASE_H_1920 = textH(FS_1920, LH, LINES)   // 231px
const LM_1920    = 120
const W_1920     = 1920 - LM_1920 * 2              // 1680px
const centerY_1920 = (canvasH: number) =>
  Math.round((canvasH - PHRASE_H_1920) / 2) + OPTICAL_SHIFT

// ─── Factory ──────────────────────────────────────────────────────────────────

export function makeMinimalTypeVariants(theme: Theme): Template[] {
  const BACKGROUND = theme.colors.primary
  const TEXT_COLOR = theme.colors.text
  const ACCENT     = theme.colors.accent
  const FONT       = theme.fonts.body

  const minimalType1x1: Template = {
    id: 'minimal-type-1x1',
    name: 'Minimal Type — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BACKGROUND,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: LM_1080,
        y: centerY(1080),   // 437
        width: W_1080,
        height: PHRASE_H,
        props: {
          text: 'Apenas\no essencial.',
          fontSize: FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH,
          letterSpacing: -1,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
      // Régua — único sinal gráfico, perfeitamente centrado
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: centerY(1080) + PHRASE_H + HAIRLINE_GAP,   // 666
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  const minimalType4x5: Template = {
    id: 'minimal-type-4x5',
    name: 'Minimal Type — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BACKGROUND,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: LM_1080,
        y: centerY(1350),   // 572
        width: W_1080,
        height: PHRASE_H,
        props: {
          text: 'Apenas\no essencial.',
          fontSize: FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH,
          letterSpacing: -1,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: centerY(1350) + PHRASE_H + HAIRLINE_GAP,   // 801
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  const minimalType9x16: Template = {
    id: 'minimal-type-9x16',
    name: 'Minimal Type — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BACKGROUND,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: LM_1080,
        y: centerY(1920),   // 857
        width: W_1080,
        height: PHRASE_H,
        props: {
          text: 'Apenas\no essencial.',
          fontSize: FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH,
          letterSpacing: -1,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: centerY(1920) + PHRASE_H + HAIRLINE_GAP,   // 1086
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  const minimalType16x9: Template = {
    id: 'minimal-type-16x9',
    name: 'Minimal Type — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BACKGROUND,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: LM_1920,
        y: centerY_1920(1080),   // 408
        width: W_1920,
        height: PHRASE_H_1920,
        props: {
          text: 'Apenas\no essencial.',
          fontSize: FS_1920,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH,
          letterSpacing: -1,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1920 - HAIRLINE_W) / 2),
        y: centerY_1920(1080) + PHRASE_H_1920 + HAIRLINE_GAP,   // 695
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  return [minimalType1x1, minimalType4x5, minimalType9x16, minimalType16x9]
}
