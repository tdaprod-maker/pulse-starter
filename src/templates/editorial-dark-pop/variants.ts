import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Editorial Monocromática + Pop — variação escura (tech/consultoria).
// Fundo preto puro, hierarquia por PESO dentro da mesma família (Sora bold vs
// normal) em vez de misturar fontes — a técnica correta de ênfase cinética.
// A cor pop (lima elétrico) aparece em exatamente dois elementos: a linha de
// destaque do headline e um ponto de 8-10px — nada mais usa a cor.
const BG     = '#0A0A0A'
const WHITE  = '#FFFFFF'
const MUTED  = '#8C8C8C'
const LIME   = '#D4F000'
const HEADING = 'Sora, sans-serif'
const BODY    = 'Public Sans, sans-serif'
const MARGIN  = 100

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeEditorialDarkPopVariants(_theme: Theme): Template[] {
  const edp4x5: Template = {
    id: 'editorial-dark-pop-4x5',
    name: 'Editorial Escuro + Lima — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'dot', type: 'shape', x: MARGIN, y: 142, width: 10, height: 10,
        props: { fill: LIME, cornerRadius: 5 } },
      { id: 'eyebrow', type: 'text', x: MARGIN + 26, y: 138, width: 500, height: 26,
        props: { text: 'CONSULTORIA DIGITAL', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 210, width: 620, height: 140,
        props: { text: 'Decisões', fontSize: 84, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'headline-accent', type: 'text', x: MARGIN, y: 355, width: 620, height: 190,
        props: { text: 'orientadas por dados', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: LIME, wrap: 'word', autoFit: true } },
      { id: 'subline', type: 'text', x: MARGIN, y: 565, width: 560, height: 90,
        props: { text: 'Ajudamos empresas a transformar dados em crescimento real.', fontSize: 26, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 675, width: 140, height: 2,
        props: { fill: 'rgba(255,255,255,0.25)', cornerRadius: 1 } },
      { id: 'cta', type: 'text', x: MARGIN, y: 1250, width: 500, height: 28,
        props: { text: '@suaempresa · suaempresa.com.br', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
    ],
  }

  const edp1x1: Template = {
    id: 'editorial-dark-pop-1x1',
    name: 'Editorial Escuro + Lima — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'dot', type: 'shape', x: MARGIN, y: 116, width: 10, height: 10,
        props: { fill: LIME, cornerRadius: 5 } },
      { id: 'eyebrow', type: 'text', x: MARGIN + 26, y: 108, width: 500, height: 24,
        props: { text: 'CONSULTORIA DIGITAL', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 170, width: 620, height: 120,
        props: { text: 'Decisões', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'headline-accent', type: 'text', x: MARGIN, y: 300, width: 620, height: 160,
        props: { text: 'orientadas por dados', fontSize: 60, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: LIME, wrap: 'word', autoFit: true } },
      { id: 'subline', type: 'text', x: MARGIN, y: 470, width: 560, height: 80,
        props: { text: 'Ajudamos empresas a transformar dados em crescimento real.', fontSize: 24, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 560, width: 130, height: 2,
        props: { fill: 'rgba(255,255,255,0.25)', cornerRadius: 1 } },
      { id: 'cta', type: 'text', x: MARGIN, y: 960, width: 500, height: 26,
        props: { text: '@suaempresa · suaempresa.com.br', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
    ],
  }

  const edp9x16: Template = {
    id: 'editorial-dark-pop-9x16',
    name: 'Editorial Escuro + Lima — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'dot', type: 'shape', x: MARGIN, y: 472, width: 12, height: 12,
        props: { fill: LIME, cornerRadius: 6 } },
      { id: 'eyebrow', type: 'text', x: MARGIN + 28, y: 466, width: 500, height: 28,
        props: { text: 'CONSULTORIA DIGITAL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'headline', type: 'text', x: MARGIN, y: 545, width: 620, height: 160,
        props: { text: 'Decisões', fontSize: 96, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'headline-accent', type: 'text', x: MARGIN, y: 715, width: 620, height: 220,
        props: { text: 'orientadas por dados', fontSize: 82, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: LIME, wrap: 'word', autoFit: true } },
      { id: 'subline', type: 'text', x: MARGIN, y: 955, width: 560, height: 100,
        props: { text: 'Ajudamos empresas a transformar dados em crescimento real.', fontSize: 30, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: MARGIN, y: 1075, width: 150, height: 2,
        props: { fill: 'rgba(255,255,255,0.25)', cornerRadius: 1 } },
      { id: 'cta', type: 'text', x: MARGIN, y: 1770, width: 500, height: 32,
        props: { text: '@suaempresa · suaempresa.com.br', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
    ],
  }

  return [edp4x5, edp1x1, edp9x16]
}
