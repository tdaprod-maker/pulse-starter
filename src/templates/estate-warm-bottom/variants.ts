import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Aspiracional Quente — variação base (imóveis/lançamentos). Foto em
// tela cheia (aplicada pelo usuário depois via geração/upload), com um
// gradiente real multi-stop (não chapado) escurecendo a base para o headline
// serifado itálico ficar legível. overlayOpacity é 0 para este template no
// CanvasEngine (ver comentário lá) — este shape "overlay-gradient" é quem
// cuida do escurecimento.
const FALLBACK_BG = '#241C16'
const TEXT    = '#F7F3EC'
const MUTED   = 'rgba(247,243,236,0.72)'
const ACCENT  = '#B5502E'
const HEADING = 'Cormorant Garamond, serif'
const BODY    = 'Public Sans, sans-serif'
const MARGIN  = 100

function overlayGradient(width: number, height: number) {
  return {
    id: 'overlay-gradient', type: 'shape' as const, x: 0, y: 0, width, height,
    props: {
      fillLinearGradientColorStops: [0, 'rgba(10,8,6,0)', 0.55, 'rgba(10,8,6,0.35)', 1, 'rgba(10,8,6,0.88)'],
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: height },
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeEstateWarmBottomVariants(_theme: Theme): Template[] {
  const w = 1080 - MARGIN * 2

  const eb4x5: Template = {
    id: 'estate-warm-bottom-4x5',
    name: 'Aspiracional Base — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: FALLBACK_BG,
    elements: [
      overlayGradient(1080, 1350),
      { id: 'eyebrow', type: 'text', x: MARGIN, y: 990, width: w, height: 30,
        props: { text: 'LANÇAMENTO', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 1030, width: w, height: 140,
        props: { text: 'Viver perto\ndo que importa', fontSize: 72, fontFamily: HEADING, fontStyle: 'italic', lineHeight: 1.1, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 1185, width: 90, height: 2,
        props: { fill: ACCENT, cornerRadius: 1 } },
      { id: 'specs', type: 'text', x: MARGIN, y: 1205, width: w, height: 34,
        props: { text: '120m² · 3 suítes · 2 vagas', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'price', type: 'text', x: MARGIN, y: 1250, width: w, height: 44,
        props: { text: 'A partir de R$ 890.000', fontSize: 34, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 1300, width: w, height: 30,
        props: { text: 'Agende uma visita →', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const eb1x1: Template = {
    id: 'estate-warm-bottom-1x1',
    name: 'Aspiracional Base — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: FALLBACK_BG,
    elements: [
      overlayGradient(1080, 1080),
      { id: 'eyebrow', type: 'text', x: MARGIN, y: 790, width: w, height: 28,
        props: { text: 'LANÇAMENTO', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 828, width: w, height: 130,
        props: { text: 'Viver perto\ndo que importa', fontSize: 64, fontFamily: HEADING, fontStyle: 'italic', lineHeight: 1.1, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 965, width: 90, height: 2,
        props: { fill: ACCENT, cornerRadius: 1 } },
      { id: 'specs', type: 'text', x: MARGIN, y: 985, width: w, height: 32,
        props: { text: '120m² · 3 suítes · 2 vagas', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'price', type: 'text', x: MARGIN, y: 1020, width: w, height: 38,
        props: { text: 'A partir de R$ 890.000', fontSize: 30, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 1063, width: w, height: 28,
        props: { text: 'Agende uma visita →', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const eb9x16: Template = {
    id: 'estate-warm-bottom-9x16',
    name: 'Aspiracional Base — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: FALLBACK_BG,
    elements: [
      overlayGradient(1080, 1920),
      { id: 'eyebrow', type: 'text', x: MARGIN, y: 1500, width: w, height: 32,
        props: { text: 'LANÇAMENTO', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 1545, width: w, height: 170,
        props: { text: 'Viver perto\ndo que importa', fontSize: 80, fontFamily: HEADING, fontStyle: 'italic', lineHeight: 1.1, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 1730, width: 90, height: 2,
        props: { fill: ACCENT, cornerRadius: 1 } },
      { id: 'specs', type: 'text', x: MARGIN, y: 1750, width: w, height: 36,
        props: { text: '120m² · 3 suítes · 2 vagas', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'price', type: 'text', x: MARGIN, y: 1800, width: w, height: 48,
        props: { text: 'A partir de R$ 890.000', fontSize: 38, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: MARGIN, y: 1855, width: w, height: 32,
        props: { text: 'Agende uma visita →', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  return [eb4x5, eb1x1, eb9x16]
}
