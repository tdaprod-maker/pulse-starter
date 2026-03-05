import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lineH = (size: number) => Math.ceil(size * 1.0)

const opticalCenterY = (canvasH: number, blockH: number) =>
  Math.round((canvasH - blockH) / 2) - 16

// ─── Constantes para 1080px de largura (1:1, 4:5, 9:16) ──────────────────────
const M       = 60           // era 120 — margens apertadas, mais ousado
const FS_1080 = 240
const LH_1080 = lineH(FS_1080)       // 240px por linha
const W_1080  = 1080 - M             // 1020px

// Bloco = 2 linhas de texto + underline accent
const UNDERLINE_GAP = 16
const UNDERLINE_H   = 6
const BLOCK_H_1080  = LH_1080 + LH_1080 + UNDERLINE_GAP + UNDERLINE_H  // 502px

// ─── 16:9 ─────────────────────────────────────────────────────────────────────
const M_16x9        = 80
const FS_16x9       = 360
const LH_16x9       = lineH(FS_16x9)  // 360px por linha
const W_16x9        = 1920 - M_16x9   // 1840px

// ─── Factory ──────────────────────────────────────────────────────────────────

export function makeBigStatementVariants(theme: Theme): Template[] {
  const BACKGROUND = theme.colors.primary
  const LINE1      = theme.colors.text
  const LINE2      = theme.colors.accentAlt
  const ACCENT     = theme.colors.accent
  const FONT       = theme.fonts.heading

  // 1:1 — ancorado no topo, tensão vertical
  const DY1 = 60
  const bigStatement1x1: Template = {
    id: 'big-statement-1x1',
    name: 'Big Statement — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BACKGROUND,
    elements: [
      // Faixa vertical esquerda — âncora editorial
      {
        id: 'left-strip',
        type: 'shape',
        x: 0,
        y: 0,
        width: 10,
        height: 1080,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
      {
        id: 'line1',
        type: 'text',
        x: M,
        y: DY1,
        width: W_1080,
        height: LH_1080,
        props: {
          text: 'FAÇA',
          fontSize: FS_1080,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE1,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'line2',
        type: 'text',
        x: M,
        y: DY1 + LH_1080,
        width: W_1080,
        height: LH_1080,
        props: {
          text: 'MAIS.',
          fontSize: FS_1080,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE2,
          wrap: 'none',
          autoFit: true,
        },
      },
      // Underline accent — assinatura visual abaixo do texto
      {
        id: 'underline-accent',
        type: 'shape',
        x: M,
        y: DY1 + LH_1080 + LH_1080 + UNDERLINE_GAP,
        width: 160,
        height: UNDERLINE_H,
        props: { fill: LINE2, cornerRadius: 0 },
      },
    ],
  }

  // 4:5 — mesmo ponto de ancoragem, mais espaço abaixo
  const DY2 = 60
  const bigStatement4x5: Template = {
    id: 'big-statement-4x5',
    name: 'Big Statement — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BACKGROUND,
    elements: [
      {
        id: 'left-strip',
        type: 'shape',
        x: 0,
        y: 0,
        width: 10,
        height: 1350,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
      {
        id: 'line1',
        type: 'text',
        x: M,
        y: DY2,
        width: W_1080,
        height: LH_1080,
        props: {
          text: 'FAÇA',
          fontSize: FS_1080,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE1,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'line2',
        type: 'text',
        x: M,
        y: DY2 + LH_1080,
        width: W_1080,
        height: LH_1080,
        props: {
          text: 'MAIS.',
          fontSize: FS_1080,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE2,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'underline-accent',
        type: 'shape',
        x: M,
        y: DY2 + LH_1080 + LH_1080 + UNDERLINE_GAP,
        width: 160,
        height: UNDERLINE_H,
        props: { fill: LINE2, cornerRadius: 0 },
      },
    ],
  }

  // 9:16 — centralizado verticalmente (muito espaço acima e abaixo)
  const DY3 = opticalCenterY(1920, BLOCK_H_1080)  // 693
  const bigStatement9x16: Template = {
    id: 'big-statement-9x16',
    name: 'Big Statement — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BACKGROUND,
    elements: [
      {
        id: 'left-strip',
        type: 'shape',
        x: 0,
        y: 0,
        width: 10,
        height: 1920,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
      {
        id: 'line1',
        type: 'text',
        x: M,
        y: DY3,
        width: W_1080,
        height: LH_1080,
        props: {
          text: 'FAÇA',
          fontSize: FS_1080,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE1,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'line2',
        type: 'text',
        x: M,
        y: DY3 + LH_1080,
        width: W_1080,
        height: LH_1080,
        props: {
          text: 'MAIS.',
          fontSize: FS_1080,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE2,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'underline-accent',
        type: 'shape',
        x: M,
        y: DY3 + LH_1080 + LH_1080 + UNDERLINE_GAP,
        width: 160,
        height: UNDERLINE_H,
        props: { fill: LINE2, cornerRadius: 0 },
      },
    ],
  }

  // 16:9 — ancorado no topo, fontes maiores
  const DY4 = 60
  const bigStatement16x9: Template = {
    id: 'big-statement-16x9',
    name: 'Big Statement — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BACKGROUND,
    elements: [
      {
        id: 'left-strip',
        type: 'shape',
        x: 0,
        y: 0,
        width: 12,
        height: 1080,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
      {
        id: 'line1',
        type: 'text',
        x: M_16x9,
        y: DY4,
        width: W_16x9,
        height: LH_16x9,
        props: {
          text: 'FAÇA',
          fontSize: FS_16x9,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE1,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'line2',
        type: 'text',
        x: M_16x9,
        y: DY4 + LH_16x9,   // 420
        width: W_16x9,
        height: LH_16x9,
        props: {
          text: 'MAIS.',
          fontSize: FS_16x9,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: 1.0,
          align: 'left',
          fill: LINE2,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'underline-accent',
        type: 'shape',
        x: M_16x9,
        y: DY4 + LH_16x9 + LH_16x9 + UNDERLINE_GAP,  // 796
        width: 200,
        height: 8,
        props: { fill: LINE2, cornerRadius: 0 },
      },
    ],
  }

  return [bigStatement1x1, bigStatement4x5, bigStatement9x16, bigStatement16x9]
}
