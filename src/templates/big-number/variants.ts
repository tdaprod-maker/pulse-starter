import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const textH = (fs: number, lh: number, n: number) => Math.ceil(fs * lh * n)
const opticalCenterY = (canvasH: number, blockH: number) =>
  Math.round((canvasH - blockH) / 2) - 16

// ─── Tipografia ────────────────────────────────────────────────────────────────
const FS_NUM     = 480
const FS_CAP     = 24
const FS_NUM_9x16 = 500
const FS_NUM_169  = 520
const FS_CAP_169  = 28
const LH_NUM     = 1.0
const LH_CAP     = 1.4

// ─── Alturas dos elementos ─────────────────────────────────────────────────────
const NUM_H      = textH(FS_NUM, LH_NUM, 1)       // 480px
const CAP_H      = textH(FS_CAP, LH_CAP, 1)       // 34px
const NUM_H_9x16 = textH(FS_NUM_9x16, LH_NUM, 1)  // 500px
const NUM_H_169  = textH(FS_NUM_169, LH_NUM, 1)   // 520px
const CAP_H_169  = textH(FS_CAP_169, LH_CAP, 1)   // 40px

// ─── Espaçamentos ─────────────────────────────────────────────────────────────
const GAP1       = 24   // número → hairline
const GAP2       = 24   // hairline → legenda
const HAIRLINE_W = 120
const HAIRLINE_H = 2

// ─── Altura total do bloco por formato ────────────────────────────────────────
const BLOCK_H      = NUM_H + GAP1 + HAIRLINE_H + GAP2 + CAP_H      // 564px
const BLOCK_H_9x16 = NUM_H_9x16 + GAP1 + HAIRLINE_H + GAP2 + CAP_H // 584px
const BLOCK_H_169  = NUM_H_169 + GAP1 + HAIRLINE_H + GAP2 + CAP_H_169 // 610px

// ─── Margens e larguras ───────────────────────────────────────────────────────
const LM_1080 = 120
const W_1080  = 1080 - LM_1080 * 2   // 840px
const LM_1920 = 120
const W_1920  = 1920 - LM_1920 * 2   // 1680px

// ─── Factory ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeBigNumberVariants(_theme: Theme): Template[] {
  const BACKGROUND    = '#F0F4FF'
  const NUMBER_COLOR  = '#1A2B6B'
  const CAPTION_COLOR = 'rgba(26,43,107,0.7)'
  const FONT          = 'Space Grotesk, sans-serif'

  // ── 1:1 ───────────────────────────────────────────────────────────────────
  const NY1  = opticalCenterY(1080, BLOCK_H)   // ~242px
  const HY1  = NY1 + NUM_H + GAP1
  const CY1  = HY1 + HAIRLINE_H + GAP2

  const bigNumber1x1: Template = {
    id: 'big-number-1x1',
    name: 'Big Number — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BACKGROUND,
    elements: [
      {
        id: 'number',
        type: 'text',
        x: 0,
        y: NY1,
        width: 1080,
        height: NUM_H,
        props: {
          text: '42',
          fontSize: FS_NUM,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH_NUM,
          letterSpacing: 0,
          align: 'center',
          fill: NUMBER_COLOR,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: HY1,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: NUMBER_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1080,
        y: CY1,
        width: W_1080,
        height: CAP_H,
        props: {
          text: 'projetos entregues este ano.',
          fontSize: FS_CAP,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH_CAP,
          letterSpacing: 5,
          align: 'center',
          fill: CAPTION_COLOR,
        },
      },
    ],
  }

  // ── 4:5 ───────────────────────────────────────────────────────────────────
  const NY2  = opticalCenterY(1350, BLOCK_H)   // ~377px
  const HY2  = NY2 + NUM_H + GAP1
  const CY2  = HY2 + HAIRLINE_H + GAP2

  const bigNumber4x5: Template = {
    id: 'big-number-4x5',
    name: 'Big Number — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BACKGROUND,
    elements: [
      {
        id: 'number',
        type: 'text',
        x: 0,
        y: NY2,
        width: 1080,
        height: NUM_H,
        props: {
          text: '42',
          fontSize: FS_NUM,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH_NUM,
          letterSpacing: 0,
          align: 'center',
          fill: NUMBER_COLOR,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: HY2,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: NUMBER_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1080,
        y: CY2,
        width: W_1080,
        height: CAP_H,
        props: {
          text: 'projetos entregues este ano.',
          fontSize: FS_CAP,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH_CAP,
          letterSpacing: 5,
          align: 'center',
          fill: CAPTION_COLOR,
        },
      },
    ],
  }

  // ── 9:16 ──────────────────────────────────────────────────────────────────
  const NY3  = opticalCenterY(1920, BLOCK_H_9x16)   // ~652px
  const HY3  = NY3 + NUM_H_9x16 + GAP1
  const CY3  = HY3 + HAIRLINE_H + GAP2

  const bigNumber9x16: Template = {
    id: 'big-number-9x16',
    name: 'Big Number — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BACKGROUND,
    elements: [
      {
        id: 'number',
        type: 'text',
        x: 0,
        y: NY3,
        width: 1080,
        height: NUM_H_9x16,
        props: {
          text: '42',
          fontSize: FS_NUM_9x16,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH_NUM,
          letterSpacing: 0,
          align: 'center',
          fill: NUMBER_COLOR,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: HY3,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: NUMBER_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1080,
        y: CY3,
        width: W_1080,
        height: CAP_H,
        props: {
          text: 'projetos entregues este ano.',
          fontSize: FS_CAP,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH_CAP,
          letterSpacing: 5,
          align: 'center',
          fill: CAPTION_COLOR,
        },
      },
    ],
  }

  // ── 16:9 ──────────────────────────────────────────────────────────────────
  const NY4  = opticalCenterY(1080, BLOCK_H_169)   // ~219px
  const HY4  = NY4 + NUM_H_169 + GAP1
  const CY4  = HY4 + HAIRLINE_H + GAP2

  const bigNumber16x9: Template = {
    id: 'big-number-16x9',
    name: 'Big Number — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BACKGROUND,
    elements: [
      {
        id: 'number',
        type: 'text',
        x: 0,
        y: NY4,
        width: 1920,
        height: NUM_H_169,
        props: {
          text: '42',
          fontSize: FS_NUM_169,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH_NUM,
          letterSpacing: 0,
          align: 'center',
          fill: NUMBER_COLOR,
          wrap: 'none',
          autoFit: true,
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1920 - HAIRLINE_W) / 2),
        y: HY4,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: NUMBER_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1920,
        y: CY4,
        width: W_1920,
        height: CAP_H_169,
        props: {
          text: 'projetos entregues este ano.',
          fontSize: FS_CAP_169,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LH_CAP,
          letterSpacing: 5,
          align: 'center',
          fill: CAPTION_COLOR,
        },
      },
    ],
  }

  return [bigNumber1x1, bigNumber4x5, bigNumber9x16, bigNumber16x9]
}
