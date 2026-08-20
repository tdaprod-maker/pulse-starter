import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Clínica — variação escura. Mesmo esqueleto/paleta-base da clinic-light
// (Sora + DM Sans, accent teal), invertida para fundo escuro. Demonstra o
// gradiente real do motor: um fade vertical sutil (quase imperceptível) em vez
// do preto chapado — profundidade sem parecer "glow de IA".
const BG_TOP    = '#0B1210'
const BG_BOTTOM = '#0F1D19'
const TEXT      = '#F3F5F3'
const MUTED     = '#9AA39F'
const ACCENT    = '#14A89D'
const HEADING   = 'Sora, sans-serif'
const BODY      = 'DM Sans, sans-serif'

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
export function makeClinicDarkVariants(_theme: Theme): Template[] {
  const cd4x5: Template = {
    id: 'clinic-dark-4x5',
    name: 'Clínica Escura — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG_TOP,
    elements: [
      bgGradient(1080, 1350),
      { id: 'eyebrow', type: 'text', x: 140, y: 140, width: 800, height: 28,
        props: { text: 'ESTÉTICA AVANÇADA', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 140, y: 210, width: 800, height: 340,
        props: { text: 'Sua pele merece\ncuidado de verdade', fontSize: 76, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 140, y: 590, width: 120, height: 3,
        props: { fill: ACCENT, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 140, y: 630, width: 680, height: 90,
        props: { text: 'Protocolos personalizados, profissionais especializados e resultados visíveis desde a primeira sessão.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 140, y: 1240, width: 680, height: 40,
        props: { text: 'Agende sua avaliação →', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const cd1x1: Template = {
    id: 'clinic-dark-1x1',
    name: 'Clínica Escura — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG_TOP,
    elements: [
      bgGradient(1080, 1080),
      { id: 'eyebrow', type: 'text', x: 140, y: 120, width: 800, height: 28,
        props: { text: 'ESTÉTICA AVANÇADA', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 140, y: 188, width: 800, height: 300,
        props: { text: 'Sua pele merece\ncuidado de verdade', fontSize: 68, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 140, y: 510, width: 120, height: 3,
        props: { fill: ACCENT, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 140, y: 548, width: 680, height: 80,
        props: { text: 'Protocolos personalizados, profissionais especializados e resultados visíveis desde a primeira sessão.', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 140, y: 970, width: 680, height: 40,
        props: { text: 'Agende sua avaliação →', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const cd9x16: Template = {
    id: 'clinic-dark-9x16',
    name: 'Clínica Escura — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG_TOP,
    elements: [
      bgGradient(1080, 1920),
      { id: 'eyebrow', type: 'text', x: 140, y: 460, width: 800, height: 30,
        props: { text: 'ESTÉTICA AVANÇADA', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 140, y: 530, width: 800, height: 380,
        props: { text: 'Sua pele merece\ncuidado de verdade', fontSize: 80, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 140, y: 930, width: 120, height: 3,
        props: { fill: ACCENT, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 140, y: 970, width: 680, height: 100,
        props: { text: 'Protocolos personalizados, profissionais especializados e resultados visíveis desde a primeira sessão.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 140, y: 1740, width: 680, height: 44,
        props: { text: 'Agende sua avaliação →', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  return [cd4x5, cd1x1, cd9x16]
}
