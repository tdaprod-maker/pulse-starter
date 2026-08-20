import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Calorosa Comunitária — variação sólida (fitness/esportes). Âmbar
// saturado, cluster de círculos orgânicos (com gradiente radial real e sutil
// em cada um) no canto superior-esquerdo, tipografia amigável mas adulta
// (Plus Jakarta Sans + Lato). Nota de implementação: o CTA usa um bullet
// circular simples em vez de um "chip" preenchido — evita repetir, sem
// necessidade, o mesmo problema de contraste-sobre-foto que exigiu uma
// exceção dedicada no editorial-light-pop (aqui a cor de destaque nunca some
// atrás de texto escuro sobre fundo claro).
const BG     = '#F2A93B'
const INK    = '#2B1B0E'
const WHITE  = '#FFFFFF'
const HEADING = 'Plus Jakarta Sans, sans-serif'
const BODY    = 'Lato, sans-serif'
const MARGIN  = 140

function circle(id: string, x: number, y: number, size: number, opacity: number) {
  return {
    id, type: 'shape' as const, x, y, width: size, height: size,
    props: {
      cornerRadius: size / 2,
      opacity,
      fillRadialGradientColorStops: [0, 'rgba(255,255,255,0.95)', 1, 'rgba(255,255,255,0.55)'],
      fillRadialGradientStartPoint: { x: size / 2, y: size / 2 },
      fillRadialGradientEndPoint: { x: size / 2, y: size / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: size / 2,
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeWarmCircleBoldVariants(_theme: Theme): Template[] {
  const wcb4x5: Template = {
    id: 'warm-circle-bold-4x5',
    name: 'Comunitária Sólida — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      circle('circle-1', 60, 60, 220, 1),
      circle('circle-2', 180, 40, 140, 0.7),
      circle('circle-3', 40, 200, 100, 0.5),
      { id: 'label', type: 'text', x: MARGIN, y: 780, width: 800, height: 26,
        props: { text: 'TREINO FUNCIONAL', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 820, width: 800, height: 340,
        props: { text: 'Supere seus\nlimites hoje', fontSize: 104, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'cta-bullet', type: 'shape', x: MARGIN, y: 1230, width: 14, height: 14,
        props: { fill: WHITE, cornerRadius: 7 } },
      { id: 'cta', type: 'text', x: MARGIN + 28, y: 1226, width: 760, height: 30,
        props: { text: 'Agende sua aula experimental', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, wrap: 'none' } },
    ],
  }

  const wcb1x1: Template = {
    id: 'warm-circle-bold-1x1',
    name: 'Comunitária Sólida — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      circle('circle-1', 60, 60, 190, 1),
      circle('circle-2', 170, 40, 120, 0.7),
      circle('circle-3', 40, 180, 90, 0.5),
      { id: 'label', type: 'text', x: MARGIN, y: 650, width: 800, height: 24,
        props: { text: 'TREINO FUNCIONAL', fontSize: 18, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 690, width: 800, height: 290,
        props: { text: 'Supere seus\nlimites hoje', fontSize: 90, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'cta-bullet', type: 'shape', x: MARGIN, y: 990, width: 13, height: 13,
        props: { fill: WHITE, cornerRadius: 6.5 } },
      { id: 'cta', type: 'text', x: MARGIN + 26, y: 986, width: 760, height: 28,
        props: { text: 'Agende sua aula experimental', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, wrap: 'none' } },
    ],
  }

  const wcb9x16: Template = {
    id: 'warm-circle-bold-9x16',
    name: 'Comunitária Sólida — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      circle('circle-1', 60, 70, 260, 1),
      circle('circle-2', 200, 50, 160, 0.7),
      circle('circle-3', 40, 240, 110, 0.5),
      { id: 'label', type: 'text', x: MARGIN, y: 1350, width: 800, height: 30,
        props: { text: 'TREINO FUNCIONAL', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 1390, width: 800, height: 380,
        props: { text: 'Supere seus\nlimites hoje', fontSize: 118, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'cta-bullet', type: 'shape', x: MARGIN, y: 1774, width: 16, height: 16,
        props: { fill: WHITE, cornerRadius: 8 } },
      { id: 'cta', type: 'text', x: MARGIN + 32, y: 1770, width: 760, height: 34,
        props: { text: 'Agende sua aula experimental', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, wrap: 'none' } },
    ],
  }

  return [wcb4x5, wcb1x1, wcb9x16]
}
