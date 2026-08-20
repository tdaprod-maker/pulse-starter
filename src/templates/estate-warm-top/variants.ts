import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Aspiracional Quente — variação topo (institucional/construtoras).
// Silhueta invertida da estate-warm-bottom, não um clone recolorido: gradiente
// escuro no topo (onde ficam label/headline) esvaindo para transparente no
// meio, deixando os dois terços inferiores da foto respirarem livres.
const FALLBACK_BG = '#241C16'
const TEXT    = '#F7F3EC'
const MUTED   = 'rgba(247,243,236,0.72)'
const ACCENT  = '#A8481F'
const HEADING = 'Cormorant Garamond, serif'
const BODY    = 'Public Sans, sans-serif'
const MARGIN  = 100

function overlayGradient(width: number, height: number) {
  return {
    id: 'overlay-gradient', type: 'shape' as const, x: 0, y: 0, width, height,
    props: {
      fillLinearGradientColorStops: [0, 'rgba(10,8,6,0.82)', 0.42, 'rgba(10,8,6,0.15)', 1, 'rgba(10,8,6,0)'],
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: height },
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeEstateWarmTopVariants(_theme: Theme): Template[] {
  const w = 1080 - MARGIN * 2

  const et4x5: Template = {
    id: 'estate-warm-top-4x5',
    name: 'Aspiracional Topo — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: FALLBACK_BG,
    elements: [
      overlayGradient(1080, 1350),
      { id: 'eyebrow', type: 'text', x: MARGIN, y: 110, width: w, height: 28,
        props: { text: 'CONSTRUTORA', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 155, width: w, height: 220,
        props: { text: 'Construímos\nespaços que duram', fontSize: 64, fontFamily: HEADING, fontStyle: 'italic', lineHeight: 1.15, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 395, width: 90, height: 2,
        props: { fill: ACCENT, cornerRadius: 1 } },
      { id: 'tagline', type: 'text', x: MARGIN, y: 415, width: w - 120, height: 70,
        props: { text: 'Mais de 20 anos entregando obras com qualidade e no prazo.', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 505, width: w, height: 32,
        props: { text: 'Conheça o projeto →', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const et1x1: Template = {
    id: 'estate-warm-top-1x1',
    name: 'Aspiracional Topo — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: FALLBACK_BG,
    elements: [
      overlayGradient(1080, 1080),
      { id: 'eyebrow', type: 'text', x: MARGIN, y: 90, width: w, height: 26,
        props: { text: 'CONSTRUTORA', fontSize: 18, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 130, width: w, height: 190,
        props: { text: 'Construímos\nespaços que duram', fontSize: 58, fontFamily: HEADING, fontStyle: 'italic', lineHeight: 1.15, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 335, width: 90, height: 2,
        props: { fill: ACCENT, cornerRadius: 1 } },
      { id: 'tagline', type: 'text', x: MARGIN, y: 352, width: w - 120, height: 60,
        props: { text: 'Mais de 20 anos entregando obras com qualidade e no prazo.', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 430, width: w, height: 28,
        props: { text: 'Conheça o projeto →', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const et9x16: Template = {
    id: 'estate-warm-top-9x16',
    name: 'Aspiracional Topo — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: FALLBACK_BG,
    elements: [
      overlayGradient(1080, 1920),
      { id: 'eyebrow', type: 'text', x: MARGIN, y: 140, width: w, height: 30,
        props: { text: 'CONSTRUTORA', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 185, width: w, height: 260,
        props: { text: 'Construímos\nespaços que duram', fontSize: 74, fontFamily: HEADING, fontStyle: 'italic', lineHeight: 1.15, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 460, width: 90, height: 2,
        props: { fill: ACCENT, cornerRadius: 1 } },
      { id: 'tagline', type: 'text', x: MARGIN, y: 480, width: w - 100, height: 80,
        props: { text: 'Mais de 20 anos entregando obras com qualidade e no prazo.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 575, width: w, height: 34,
        props: { text: 'Conheça o projeto →', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  return [et4x5, et1x1, et9x16]
}
