import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const textH = (fs: number, lh: number, lines: number) => Math.ceil(fs * lh * lines)


// ─── Constantes para 1080px de largura (1:1, 4:5, 9:16) ──────────────────────
const LM     = 120
const TOP    = 80      // era 120 — topo mais assertivo

const BAR_H  = 8       // era 4 — barra editorial mais marcante

const LABEL_FS = 22    // era 20
const LABEL_LH = 1.4
const LABEL_H  = textH(LABEL_FS, LABEL_LH, 1)   // 31px

const TITLE_FS = 72    // era 52 — título muito mais dominante
const TITLE_LH = 1.0
const TITLE_H  = textH(TITLE_FS, TITLE_LH, 2)   // 144px

const BODY_FS  = 28
const BODY_LH  = 1.7   // era 1.6 — respiração editorial
const BODY_H   = textH(BODY_FS, BODY_LH, 2)     // 96px
const BODY_W   = 600   // era 680 — mais espaço negativo à direita

const VERT_ACCENT_W = 4   // barra vertical à esquerda do título

const GAP1 = 40   // barra → label
const GAP2 = 60   // label → título (era 48)
const GAP3 = 24   // título → régua
const GAP4 = 28   // régua → corpo

const RULE_W = 240
const RULE_H = 2


// ─── 9:16 ─────────────────────────────────────────────────────────────────────
const TITLE_FS916 = 64
const TITLE_H916  = textH(TITLE_FS916, TITLE_LH, 3)   // 192px
const BODY_FS916  = 32
const BODY_H916   = textH(BODY_FS916, BODY_LH, 2)     // 109px
const BODY_W916   = 840

// ─── 16:9 ─────────────────────────────────────────────────────────────────────
const LM16       = 160
const LABEL_FS16 = 28
const LABEL_H16  = textH(LABEL_FS16, LABEL_LH, 1)   // 40px
const TITLE_FS16 = 88    // era 64
const TITLE_H16  = textH(TITLE_FS16, TITLE_LH, 2)   // 176px
const BODY_FS16  = 36
const BODY_H16   = textH(BODY_FS16, BODY_LH, 2)     // 123px
const TITLE_W16  = 1000
const BODY_W16   = 760

// ─── Factory ──────────────────────────────────────────────────────────────────

export function makeEditorialCardVariants(theme: Theme): Template[] {
  const BACKGROUND   = theme.colors.secondary
  const ACCENT_COLOR = theme.colors.primary
  const TITLE_COLOR  = theme.colors.textOnLight
  const MUTED_COLOR  = theme.colors.textSecondary
  const FONT         = theme.fonts.heading

  // 1:1 — topo ancorado, hierarquia de revista
  const AY1 = TOP   // 80
  const editorialCard1x1: Template = {
    id: 'editorial-card-1x1',
    name: 'Editorial Card — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BACKGROUND,
    elements: [
      // Barra superior — largura total, marca editorial
      {
        id: 'accent-bar',
        type: 'shape',
        x: 0,
        y: AY1,
        width: 1080,
        height: BAR_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'label',
        type: 'text',
        x: LM,
        y: AY1 + BAR_H + GAP1,
        width: 1080 - LM * 2,
        height: LABEL_H,
        props: {
          text: 'CATEGORIA',
          fontSize: LABEL_FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LABEL_LH,
          letterSpacing: 8,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
      // Fio vertical à esquerda do título — detalhe de revista
      {
        id: 'title-vert-accent',
        type: 'shape',
        x: LM - 16,
        y: AY1 + BAR_H + GAP1 + LABEL_H + GAP2,
        width: VERT_ACCENT_W,
        height: TITLE_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: LM,
        y: AY1 + BAR_H + GAP1 + LABEL_H + GAP2,
        width: 1080 - LM * 2,
        height: TITLE_H,
        props: {
          text: 'Título do\nSeu Post',
          fontSize: TITLE_FS,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: TITLE_LH,
          letterSpacing: 0,
          align: 'left',
          fill: TITLE_COLOR,
          autoFit: true,
        },
      },
      // Régua entre título e corpo
      {
        id: 'title-rule',
        type: 'shape',
        x: LM,
        y: AY1 + BAR_H + GAP1 + LABEL_H + GAP2 + TITLE_H + GAP3,
        width: RULE_W,
        height: RULE_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'body',
        type: 'text',
        x: LM,
        y: AY1 + BAR_H + GAP1 + LABEL_H + GAP2 + TITLE_H + GAP3 + RULE_H + GAP4,
        width: BODY_W,
        height: BODY_H,
        props: {
          text: 'Texto descritivo que complementa e expande o título principal do seu post.',
          fontSize: BODY_FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: BODY_LH,
          letterSpacing: 0,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
    ],
  }

  // 4:5
  const AY2 = TOP
  const editorialCard4x5: Template = {
    id: 'editorial-card-4x5',
    name: 'Editorial Card — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BACKGROUND,
    elements: [
      {
        id: 'accent-bar',
        type: 'shape',
        x: 0,
        y: AY2,
        width: 1080,
        height: BAR_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'label',
        type: 'text',
        x: LM,
        y: AY2 + BAR_H + GAP1,
        width: 1080 - LM * 2,
        height: LABEL_H,
        props: {
          text: 'CATEGORIA',
          fontSize: LABEL_FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LABEL_LH,
          letterSpacing: 8,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
      {
        id: 'title-vert-accent',
        type: 'shape',
        x: LM - 16,
        y: AY2 + BAR_H + GAP1 + LABEL_H + GAP2,
        width: VERT_ACCENT_W,
        height: TITLE_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: LM,
        y: AY2 + BAR_H + GAP1 + LABEL_H + GAP2,
        width: 1080 - LM * 2,
        height: TITLE_H,
        props: {
          text: 'Título do\nSeu Post',
          fontSize: TITLE_FS,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: TITLE_LH,
          letterSpacing: 0,
          align: 'left',
          fill: TITLE_COLOR,
          autoFit: true,
        },
      },
      {
        id: 'title-rule',
        type: 'shape',
        x: LM,
        y: AY2 + BAR_H + GAP1 + LABEL_H + GAP2 + TITLE_H + GAP3,
        width: RULE_W,
        height: RULE_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'body',
        type: 'text',
        x: LM,
        y: AY2 + BAR_H + GAP1 + LABEL_H + GAP2 + TITLE_H + GAP3 + RULE_H + GAP4,
        width: BODY_W,
        height: BODY_H,
        props: {
          text: 'Texto descritivo que complementa e expande o título principal do seu post.',
          fontSize: BODY_FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: BODY_LH,
          letterSpacing: 0,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
    ],
  }

  // 9:16 — mesma estrutura do 1:1, canvas mais alto, fontes levemente maiores
  const AY3 = TOP   // 80
  const editorialCard9x16: Template = {
    id: 'editorial-card-9x16',
    name: 'Editorial Card — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BACKGROUND,
    elements: [
      {
        id: 'accent-bar',
        type: 'shape',
        x: 0,
        y: AY3,
        width: 1080,
        height: BAR_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'label',
        type: 'text',
        x: LM,
        y: AY3 + BAR_H + GAP1,
        width: 1080 - LM * 2,
        height: LABEL_H,
        props: {
          text: 'CATEGORIA',
          fontSize: LABEL_FS,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LABEL_LH,
          letterSpacing: 8,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
      {
        id: 'title-vert-accent',
        type: 'shape',
        x: LM - 16,
        y: AY3 + BAR_H + GAP1 + LABEL_H + GAP2,
        width: VERT_ACCENT_W,
        height: TITLE_H916,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: LM,
        y: AY3 + BAR_H + GAP1 + LABEL_H + GAP2,
        width: 1080 - LM * 2,
        height: TITLE_H916,
        props: {
          text: 'Título do\nSeu Post',
          fontSize: TITLE_FS916,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: TITLE_LH,
          letterSpacing: 0,
          align: 'left',
          fill: TITLE_COLOR,
          autoFit: true,
        },
      },
      {
        id: 'title-rule',
        type: 'shape',
        x: LM,
        y: AY3 + BAR_H + GAP1 + LABEL_H + GAP2 + TITLE_H916 + GAP3,
        width: RULE_W,
        height: RULE_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'body',
        type: 'text',
        x: LM,
        y: AY3 + BAR_H + GAP1 + LABEL_H + GAP2 + TITLE_H916 + GAP3 + RULE_H + GAP4,
        width: BODY_W916,
        height: BODY_H916,
        props: {
          text: 'Texto descritivo que complementa e expande o título principal do seu post.',
          fontSize: BODY_FS916,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: BODY_LH,
          letterSpacing: 0,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
    ],
  }

  // 16:9
  const AY4 = TOP
  const editorialCard16x9: Template = {
    id: 'editorial-card-16x9',
    name: 'Editorial Card — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BACKGROUND,
    elements: [
      {
        id: 'accent-bar',
        type: 'shape',
        x: 0,
        y: AY4,
        width: 1920,
        height: BAR_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'label',
        type: 'text',
        x: LM16,
        y: AY4 + BAR_H + GAP1,
        width: 1920 - LM16 * 2,
        height: LABEL_H16,
        props: {
          text: 'CATEGORIA',
          fontSize: LABEL_FS16,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: LABEL_LH,
          letterSpacing: 8,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
      {
        id: 'title-vert-accent',
        type: 'shape',
        x: LM16 - 16,
        y: AY4 + BAR_H + GAP1 + LABEL_H16 + GAP2,
        width: VERT_ACCENT_W,
        height: TITLE_H16,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: LM16,
        y: AY4 + BAR_H + GAP1 + LABEL_H16 + GAP2,
        width: TITLE_W16,
        height: TITLE_H16,
        props: {
          text: 'Título do\nSeu Post',
          fontSize: TITLE_FS16,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: TITLE_LH,
          letterSpacing: 0,
          align: 'left',
          fill: TITLE_COLOR,
          autoFit: true,
        },
      },
      {
        id: 'title-rule',
        type: 'shape',
        x: LM16,
        y: AY4 + BAR_H + GAP1 + LABEL_H16 + GAP2 + TITLE_H16 + GAP3,
        width: 360,
        height: RULE_H,
        props: { fill: ACCENT_COLOR, cornerRadius: 0 },
      },
      {
        id: 'body',
        type: 'text',
        x: LM16,
        y: AY4 + BAR_H + GAP1 + LABEL_H16 + GAP2 + TITLE_H16 + GAP3 + RULE_H + GAP4,
        width: BODY_W16,
        height: BODY_H16,
        props: {
          text: 'Texto descritivo que complementa e expande o título principal do seu post.',
          fontSize: BODY_FS16,
          fontFamily: FONT,
          fontStyle: 'normal',
          lineHeight: BODY_LH,
          letterSpacing: 0,
          align: 'left',
          fill: MUTED_COLOR,
        },
      },
    ],
  }

  return [editorialCard1x1, editorialCard4x5, editorialCard9x16, editorialCard16x9]
}
