import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Calorosa Comunitária — variação suave (pets/educação). Pêssego mais
// claro, cluster de círculos espelhado no canto superior-DIREITO (não é a
// warm-circle-bold recolorida — silhueta diferente), com o círculo principal
// usando gradiente radial real em tom terracota — a única aparição da cor de
// destaque nesta variação (o CTA usa texto simples, sem chip preenchido).
const BG      = '#FBC9A6'
const INK     = '#3A2419'
const ACCENT  = '#E8622E'
const ACCENT_LIGHT = '#F0895A'
const HEADING = 'Plus Jakarta Sans, sans-serif'
const BODY    = 'Lato, sans-serif'
const MARGIN  = 140

function accentCircle(x: number, y: number, size: number) {
  return {
    id: 'circle-accent', type: 'shape' as const, x, y, width: size, height: size,
    props: {
      cornerRadius: size / 2,
      fillRadialGradientColorStops: [0, ACCENT_LIGHT, 1, ACCENT],
      fillRadialGradientStartPoint: { x: size / 2, y: size / 2 },
      fillRadialGradientEndPoint: { x: size / 2, y: size / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: size / 2,
    },
  }
}

function whiteCircle(id: string, x: number, y: number, size: number, opacity: number) {
  return { id, type: 'shape' as const, x, y, width: size, height: size, props: { fill: '#FFFFFF', cornerRadius: size / 2, opacity } }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeWarmCircleSoftVariants(_theme: Theme): Template[] {
  const wcs4x5: Template = {
    id: 'warm-circle-soft-4x5',
    name: 'Comunitária Suave — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      accentCircle(780, 50, 240),
      whiteCircle('circle-2', 900, 180, 120, 0.85),
      whiteCircle('circle-3', 740, 220, 80, 0.6),
      { id: 'label', type: 'text', x: MARGIN, y: 800, width: 800, height: 26,
        props: { text: 'ADOÇÃO RESPONSÁVEL', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 840, width: 760, height: 320,
        props: { text: 'Um novo amigo\nesperando por você', fontSize: 96, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'cta-bullet', type: 'shape', x: MARGIN, y: 1240, width: 14, height: 14,
        props: { fill: ACCENT, cornerRadius: 7 } },
      { id: 'cta', type: 'text', x: MARGIN + 28, y: 1236, width: 760, height: 30,
        props: { text: 'Conheça os pets disponíveis', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, wrap: 'none' } },
    ],
  }

  const wcs1x1: Template = {
    id: 'warm-circle-soft-1x1',
    name: 'Comunitária Suave — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      accentCircle(800, 40, 200),
      whiteCircle('circle-2', 900, 150, 100, 0.85),
      whiteCircle('circle-3', 770, 180, 70, 0.6),
      { id: 'label', type: 'text', x: MARGIN, y: 660, width: 800, height: 24,
        props: { text: 'ADOÇÃO RESPONSÁVEL', fontSize: 18, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 700, width: 760, height: 270,
        props: { text: 'Um novo amigo\nesperando por você', fontSize: 82, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'cta-bullet', type: 'shape', x: MARGIN, y: 990, width: 13, height: 13,
        props: { fill: ACCENT, cornerRadius: 6.5 } },
      { id: 'cta', type: 'text', x: MARGIN + 26, y: 986, width: 760, height: 28,
        props: { text: 'Conheça os pets disponíveis', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, wrap: 'none' } },
    ],
  }

  const wcs9x16: Template = {
    id: 'warm-circle-soft-9x16',
    name: 'Comunitária Suave — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      accentCircle(760, 60, 260),
      whiteCircle('circle-2', 900, 210, 140, 0.85),
      whiteCircle('circle-3', 720, 260, 90, 0.6),
      { id: 'label', type: 'text', x: MARGIN, y: 1370, width: 800, height: 30,
        props: { text: 'ADOÇÃO RESPONSÁVEL', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 1410, width: 760, height: 360,
        props: { text: 'Um novo amigo\nesperando por você', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'cta-bullet', type: 'shape', x: MARGIN, y: 1780, width: 16, height: 16,
        props: { fill: ACCENT, cornerRadius: 8 } },
      { id: 'cta', type: 'text', x: MARGIN + 32, y: 1776, width: 760, height: 34,
        props: { text: 'Conheça os pets disponíveis', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: INK, wrap: 'none' } },
    ],
  }

  return [wcs4x5, wcs1x1, wcs9x16]
}
