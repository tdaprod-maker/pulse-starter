import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Cores default ────────────────────────────────────────────────────────────
const BG_DEFAULT    = '#1A1A1A'
const TEXT_WHITE    = '#FFFFFF'
const LABEL_COLOR   = 'rgba(255,255,255,0.7)'
const ACCENT_DEFAULT = '#FF6F5E'

// ─── Tipografia ───────────────────────────────────────────────────────────────
const textH = (fs: number, lh: number, lines: number) => Math.ceil(fs * lh * lines)

const LABEL_FS = 28
const LABEL_LH = 1.5
const LABEL_H  = textH(LABEL_FS, LABEL_LH, 1)  // 42px

const TITLE_FS = 140
const TITLE_LH = 1.1
const TITLE_H  = textH(TITLE_FS, TITLE_LH, 2)  // 308px

const SUBTITLE_FS = 36
const SUBTITLE_LH = 1.5
const SUBTITLE_H  = textH(SUBTITLE_FS, SUBTITLE_LH, 1)  // 54px

// ─── Layout 1080px de largura ─────────────────────────────────────────────────
const MX       = 60
const CONTENT_W = 1080 - MX * 2  // 960px

const LABEL_Y   = 80
const TITLE_Y   = 200
const SUBTITLE_Y = TITLE_Y + TITLE_H + 40  // 548px

// ─── Factory ──────────────────────────────────────────────────────────────────
// theme mantido na assinatura para compatibilidade com o registry
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeFoodPromoVariants(_theme: Theme): Template[] {

  // bg-color precisa cobrir o canvas inteiro — dimensões por variante
  const makeElements = (canvasW: number, canvasH: number) => [
    {
      id: 'bg-color',
      type: 'shape' as const,
      x: 0,
      y: 0,
      width: canvasW,
      height: canvasH,
      props: { fill: BG_DEFAULT, cornerRadius: 0 },
    },
    {
      id: 'label',
      type: 'text' as const,
      x: MX,
      y: LABEL_Y,
      width: CONTENT_W,
      height: LABEL_H,
      props: {
        text: 'CATEGORIA',
        fontSize: LABEL_FS,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        lineHeight: LABEL_LH,
        letterSpacing: 6,
        align: 'center',
        fill: LABEL_COLOR,
      },
    },
    {
      id: 'title',
      type: 'text' as const,
      x: MX,
      y: TITLE_Y,
      width: CONTENT_W,
      height: TITLE_H,
      props: {
        text: 'NOME DO\nPRATO',
        fontSize: TITLE_FS,
        fontFamily: 'Bebas Neue',
        fontStyle: 'bold',
        lineHeight: TITLE_LH,
        align: 'center',
        fill: TEXT_WHITE,
      },
    },
    {
      id: 'subtitle',
      type: 'text' as const,
      x: MX,
      y: SUBTITLE_Y,
      width: CONTENT_W,
      height: SUBTITLE_H,
      props: {
        text: 'R$ 49,90 · Peça agora!',
        fontSize: SUBTITLE_FS,
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        lineHeight: SUBTITLE_LH,
        align: 'center',
        fill: '#FFFFFF',
        shadowColor: '#000000',
        shadowBlur: 12,
        shadowOpacity: 1,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
      },
    },
  ]

  // 1:1
  const foodPromo1x1: Template = {
    id: 'food-promo-1x1',
    name: 'Food Promo — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG_DEFAULT,
    elements: makeElements(1080, 1080),
  }

  // 4:5 — canvas mais alto, conteúdo ancorado no topo
  const foodPromo4x5: Template = {
    id: 'food-promo-4x5',
    name: 'Food Promo — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG_DEFAULT,
    elements: makeElements(1080, 1350),
  }

  // 9:16 — story com texto no terço superior, espaço visual embaixo
  const foodPromo9x16: Template = {
    id: 'food-promo-9x16',
    name: 'Food Promo — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG_DEFAULT,
    elements: makeElements(1080, 1920),
  }

  return [foodPromo1x1, foodPromo4x5, foodPromo9x16]
}
