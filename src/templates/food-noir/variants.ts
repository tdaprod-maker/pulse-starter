import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Apetitosa — variação editorial escura (alta gastronomia). Vinho
// profundo saturado, acento dourado usado só como linha/label (nunca como
// fundo — evita a paleta bege/latão banida), composição centralizada e mais
// contida que a food-vivid. Gradiente vertical real, quase imperceptível.
const BG_TOP    = '#3B1220'
const BG_BOTTOM = '#2A0C16'
const CREAM     = '#F3E9DD'
const GOLD      = '#C08A4E'
const HEADING   = 'Space Grotesk, sans-serif'
const BODY      = 'DM Sans, sans-serif'
const MARGIN    = 140

function bgGradient(width: number, height: number) {
  return {
    id: 'bg-gradient', type: 'shape' as const, x: 0, y: 0, width, height,
    props: {
      fillLinearGradientColorStops: [0, BG_TOP, 1, BG_BOTTOM],
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: height },
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeFoodNoirVariants(_theme: Theme): Template[] {
  const w = 1080 - MARGIN * 2
  const filete = { x: (1080 - 100) / 2, width: 100 }

  const fn4x5: Template = {
    id: 'food-noir-4x5',
    name: 'Apetitosa Editorial — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG_TOP,
    elements: [
      bgGradient(1080, 1350),
      { id: 'label', type: 'text', x: MARGIN, y: 160, width: w, height: 28,
        props: { text: 'ALTA GASTRONOMIA', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: GOLD, letterSpacing: 4, wrap: 'none' } },
      { id: 'dish', type: 'text', x: MARGIN, y: 210, width: w, height: 320,
        props: { text: 'Risoto de\nTrufas', fontSize: 88, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'center', fill: CREAM, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: filete.x, y: 590, width: filete.width, height: 2,
        props: { fill: GOLD, cornerRadius: 1 } },
      { id: 'price', type: 'text', x: MARGIN, y: 1180, width: w, height: 46,
        props: { text: 'R$ 89,00', fontSize: 32, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: CREAM, wrap: 'none' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 1235, width: w, height: 32,
        props: { text: 'Reserve sua mesa →', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: GOLD, wrap: 'none' } },
    ],
  }

  const fn1x1: Template = {
    id: 'food-noir-1x1',
    name: 'Apetitosa Editorial — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG_TOP,
    elements: [
      bgGradient(1080, 1080),
      { id: 'label', type: 'text', x: MARGIN, y: 130, width: w, height: 26,
        props: { text: 'ALTA GASTRONOMIA', fontSize: 18, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: GOLD, letterSpacing: 4, wrap: 'none' } },
      { id: 'dish', type: 'text', x: MARGIN, y: 175, width: w, height: 280,
        props: { text: 'Risoto de\nTrufas', fontSize: 76, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'center', fill: CREAM, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: filete.x, y: 500, width: filete.width, height: 2,
        props: { fill: GOLD, cornerRadius: 1 } },
      { id: 'price', type: 'text', x: MARGIN, y: 880, width: w, height: 40,
        props: { text: 'R$ 89,00', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: CREAM, wrap: 'none' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 925, width: w, height: 30,
        props: { text: 'Reserve sua mesa →', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: GOLD, wrap: 'none' } },
    ],
  }

  const fn9x16: Template = {
    id: 'food-noir-9x16',
    name: 'Apetitosa Editorial — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG_TOP,
    elements: [
      bgGradient(1080, 1920),
      { id: 'label', type: 'text', x: MARGIN, y: 480, width: w, height: 30,
        props: { text: 'ALTA GASTRONOMIA', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: GOLD, letterSpacing: 4, wrap: 'none' } },
      { id: 'dish', type: 'text', x: MARGIN, y: 525, width: w, height: 360,
        props: { text: 'Risoto de\nTrufas', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'center', fill: CREAM, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: filete.x, y: 930, width: filete.width, height: 2,
        props: { fill: GOLD, cornerRadius: 1 } },
      { id: 'price', type: 'text', x: MARGIN, y: 1650, width: w, height: 52,
        props: { text: 'R$ 89,00', fontSize: 38, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: CREAM, wrap: 'none' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 1710, width: w, height: 36,
        props: { text: 'Reserve sua mesa →', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: GOLD, wrap: 'none' } },
    ],
  }

  return [fn4x5, fn1x1, fn9x16]
}
