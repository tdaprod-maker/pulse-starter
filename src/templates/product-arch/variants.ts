import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeProductArchVariants(theme: Theme): Template[] {
  const DARK    = '#5a3e2b'
  const MUTED   = '#8a6a52'
  const BG      = '#e8ddd4'
  const ARCH    = '#d4c4b8'
  const BTN_BG  = '#f5f0eb'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const pa4x5: Template = {
    id: 'product-arch-4x5',
    name: 'Produto com Arco — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      // Semicírculo decorativo (arco atrás do produto)
      { id: 'arch', type: 'shape', x: 190, y: 680, width: 700, height: 700,
        props: { fill: ARCH, cornerRadius: 350 } },
      // Título principal
      { id: 'headline', type: 'text', x: 60, y: 80, width: 960, height: 220,
        props: { text: 'CONFORTO QUE\nVOCÊ PROCURA', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true, letterSpacing: -1 } },
      // Subtítulo 1
      { id: 'sub1', type: 'text', x: 60, y: 330, width: 960, height: 70,
        props: { text: 'Ideal para quem quer unir elegância e praticidade em um só móvel.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      // Subtítulo 2
      { id: 'sub2', type: 'text', x: 60, y: 430, width: 960, height: 70,
        props: { text: 'Um produto que combina com tudo e valoriza seu ambiente.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      // Botão CTA
      { id: 'btn-bg', type: 'shape', x: 290, y: 550, width: 500, height: 72,
        props: { fill: BTN_BG, cornerRadius: 36, stroke: MUTED, strokeWidth: 1 } },
      { id: 'btn-text', type: 'text', x: 290, y: 566, width: 500, height: 44,
        props: { text: 'Conheça nossa linha', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  const pa1x1: Template = {
    id: 'product-arch-1x1',
    name: 'Produto com Arco — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'arch', type: 'shape', x: 190, y: 420, width: 700, height: 700,
        props: { fill: ARCH, cornerRadius: 350 } },
      { id: 'headline', type: 'text', x: 60, y: 60, width: 960, height: 180,
        props: { text: 'CONFORTO QUE\nVOCÊ PROCURA', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true, letterSpacing: -1 } },
      { id: 'sub1', type: 'text', x: 60, y: 270, width: 960, height: 60,
        props: { text: 'Ideal para quem quer unir elegância e praticidade em um só móvel.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'btn-bg', type: 'shape', x: 290, y: 370, width: 500, height: 68,
        props: { fill: BTN_BG, cornerRadius: 34, stroke: MUTED, strokeWidth: 1 } },
      { id: 'btn-text', type: 'text', x: 290, y: 386, width: 500, height: 40,
        props: { text: 'Conheça nossa linha', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  const pa9x16: Template = {
    id: 'product-arch-9x16',
    name: 'Produto com Arco — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'arch', type: 'shape', x: 190, y: 1100, width: 700, height: 700,
        props: { fill: ARCH, cornerRadius: 350 } },
      { id: 'headline', type: 'text', x: 60, y: 180, width: 960, height: 280,
        props: { text: 'CONFORTO QUE\nVOCÊ PROCURA', fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true, letterSpacing: -1 } },
      { id: 'sub1', type: 'text', x: 60, y: 490, width: 960, height: 80,
        props: { text: 'Ideal para quem quer unir elegância e praticidade em um só móvel.', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'sub2', type: 'text', x: 60, y: 600, width: 960, height: 80,
        props: { text: 'Um produto que combina com tudo e valoriza seu ambiente.', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'btn-bg', type: 'shape', x: 240, y: 730, width: 600, height: 80,
        props: { fill: BTN_BG, cornerRadius: 40, stroke: MUTED, strokeWidth: 1 } },
      { id: 'btn-text', type: 'text', x: 240, y: 750, width: 600, height: 44,
        props: { text: 'Conheça nossa linha', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  return [pa4x5, pa1x1, pa9x16]
}
