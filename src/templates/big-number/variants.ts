import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Tipografia ────────────────────────────────────────────────────────────────
// Número vaza pelo topo — quase saindo do canvas
const FS_NUM    = 720     // era 560 — muito mais dramático
const FS_CAP    = 24      // era 32 — legenda mais discreta e elegante
const LH_NUM    = 1.0
const LH_CAP    = 1.4

// ─── Posicionamento do número ─────────────────────────────────────────────────
// y negativo = número sangra pelo topo do canvas
const NUM_Y_OFFSET = -60

// ─── Helpers ──────────────────────────────────────────────────────────────────
const textH = (fs: number, lh: number, n: number) => Math.ceil(fs * lh * n)

const NUM_H  = textH(FS_NUM, LH_NUM, 1)   // 720px
const CAP_H  = textH(FS_CAP, LH_CAP, 1)  // 34px

// Espaçamentos entre número, hairline e legenda
const GAP1 = 24   // número → hairline
const GAP2 = 24   // hairline → legenda
const HAIRLINE_W = 120
const HAIRLINE_H = 2

// Posição da legenda: número começa em NUM_Y_OFFSET, mede NUM_H, depois gaps
const captionY = NUM_Y_OFFSET + NUM_H + GAP1 + HAIRLINE_H + GAP2

// ─── Margens e larguras ───────────────────────────────────────────────────────
const LM_1080 = 120
const W_1080  = 1080 - LM_1080 * 2   // 840px
const LM_1920 = 120
const W_1920  = 1920 - LM_1920 * 2   // 1680px

// ─── 9:16 ─────────────────────────────────────────────────────────────────────
const FS_NUM_9x16   = 740
const NUM_H_9x16    = textH(FS_NUM_9x16, LH_NUM, 1)   // 740px
const NUM_Y_9x16    = -60
const captionY_9x16 = NUM_Y_9x16 + NUM_H_9x16 + GAP1 + HAIRLINE_H + GAP2

// ─── 16:9 ─────────────────────────────────────────────────────────────────────
const FS_NUM_169  = 800
const FS_CAP_169  = 28
const NUM_H_169   = textH(FS_NUM_169, LH_NUM, 1)   // 800px
const NUM_Y_169   = -70
const captionY_169 = NUM_Y_169 + NUM_H_169 + GAP1 + HAIRLINE_H + GAP2
const CAP_H_169   = textH(FS_CAP_169, LH_CAP, 1)  // 40px

// ─── Factory ──────────────────────────────────────────────────────────────────

export function makeBigNumberVariants(theme: Theme): Template[] {
  const BACKGROUND    = theme.colors.primary
  const NUMBER_COLOR  = theme.colors.accent
  const CAPTION_COLOR = theme.colors.text
  const FONT          = theme.fonts.heading

  const bigNumber1x1: Template = {
    id: 'big-number-1x1',
    name: 'Big Number — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BACKGROUND,
    elements: [
      // Número gigante sangrando pelo topo
      {
        id: 'number',
        type: 'text',
        x: 0,
        y: NUM_Y_OFFSET,
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
        },
      },
      // Hairline — separador entre número e legenda
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: NUM_Y_OFFSET + NUM_H + GAP1,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: CAPTION_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1080,
        y: captionY,
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
        y: NUM_Y_OFFSET,
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
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: NUM_Y_OFFSET + NUM_H + GAP1,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: CAPTION_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1080,
        y: captionY,
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
        y: NUM_Y_9x16,
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
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1080 - HAIRLINE_W) / 2),
        y: NUM_Y_9x16 + NUM_H_9x16 + GAP1,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: CAPTION_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1080,
        y: captionY_9x16,
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
        y: NUM_Y_169,
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
        },
      },
      {
        id: 'hairline',
        type: 'shape',
        x: Math.round((1920 - HAIRLINE_W) / 2),
        y: NUM_Y_169 + NUM_H_169 + GAP1,
        width: HAIRLINE_W,
        height: HAIRLINE_H,
        props: { fill: CAPTION_COLOR, cornerRadius: 0 },
      },
      {
        id: 'caption',
        type: 'text',
        x: LM_1920,
        y: captionY_169,
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
