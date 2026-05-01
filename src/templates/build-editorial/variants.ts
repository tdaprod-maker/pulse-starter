import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeBuildEditorialVariants(theme: Theme): Template[] {
  const BG      = '#F5F2EE'
  const PRIMARY = theme.colors.accent
  const DARK    = '#1A1008'
  const MUTED   = '#888888'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const be1x1: Template = {
    id: 'build-editorial-1x1',
    name: 'Build Editorial — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 60, width: 800, height: 30,
        props: { text: 'CONSTRUTORA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 960, y: 60, width: 60, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 380, width: 600, height: 40,
        props: { text: 'SERVICO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 428, width: 40, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 460, width: 960, height: 300,
        props: { text: 'CONSTRUCAO DO ZERO', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 800, width: 960, height: 120,
        props: { text: 'Do projeto a entrega das chaves. Planejamento completo, mao de obra qualificada e materiais de primeira linha.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 960, width: 960, height: 1,
        props: { fill: '#DDDDDD', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 980, width: 700, height: 40,
        props: { text: 'SOLICITE UM ORCAMENTO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const be4x5: Template = {
    id: 'build-editorial-4x5',
    name: 'Build Editorial — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 80, width: 800, height: 30,
        props: { text: 'CONSTRUTORA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 960, y: 80, width: 60, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 520, width: 600, height: 40,
        props: { text: 'SERVICO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 568, width: 40, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 600, width: 960, height: 300,
        props: { text: 'CONSTRUCAO DO ZERO', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 960, width: 960, height: 180,
        props: { text: 'Do projeto a entrega das chaves. Planejamento completo, mao de obra qualificada e materiais de primeira linha.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 1240, width: 960, height: 1,
        props: { fill: '#DDDDDD', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1260, width: 700, height: 40,
        props: { text: 'SOLICITE UM ORCAMENTO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const be9x16: Template = {
    id: 'build-editorial-9x16',
    name: 'Build Editorial — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 120, width: 800, height: 30,
        props: { text: 'CONSTRUTORA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 960, y: 120, width: 60, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 800, width: 600, height: 40,
        props: { text: 'SERVICO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 848, width: 40, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 880, width: 960, height: 400,
        props: { text: 'CONSTRUCAO DO ZERO', fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 1380, width: 960, height: 200,
        props: { text: 'Do projeto a entrega das chaves. Planejamento completo, mao de obra qualificada e materiais de primeira linha.', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 1740, width: 960, height: 1,
        props: { fill: '#DDDDDD', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1760, width: 700, height: 50,
        props: { text: 'SOLICITE UM ORCAMENTO', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const be16x9: Template = {
    id: 'build-editorial-16x9',
    name: 'Build Editorial — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 100, y: 60, width: 1000, height: 30,
        props: { text: 'CONSTRUTORA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 1820, y: 60, width: 60, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 100, y: 380, width: 600, height: 40,
        props: { text: 'SERVICO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 100, y: 428, width: 40, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 100, y: 460, width: 860, height: 380,
        props: { text: 'CONSTRUCAO DO ZERO', fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 1060, y: 380, width: 760, height: 240,
        props: { text: 'Do projeto a entrega das chaves. Planejamento completo, mao de obra qualificada e materiais de primeira linha.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 1060, y: 680, width: 760, height: 1,
        props: { fill: '#DDDDDD', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 1060, y: 700, width: 700, height: 50,
        props: { text: 'SOLICITE UM ORCAMENTO', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  return [be1x1, be4x5, be9x16, be16x9]
}
