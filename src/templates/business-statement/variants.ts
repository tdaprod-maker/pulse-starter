import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeBusinessStatementVariants(theme: Theme): Template[] {
  const BG      = '#F8F8F6'
  const PRIMARY = theme.colors.accent
  const DARK    = '#0A0A0A'
  const MUTED   = '#888888'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const bs1x1: Template = {
    id: 'business-statement-1x1',
    name: 'Business Statement — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 60, width: 800, height: 30,
        props: { text: 'RESULTADO DO PERÍODO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'dot', type: 'shape', x: 1000, y: 64, width: 20, height: 20,
        props: { fill: PRIMARY, cornerRadius: 10 } },
      { id: 'number', type: 'text', x: 60, y: 380, width: 960, height: 320,
        props: { text: '+00', fontSize: 320, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'symbol', type: 'text', x: 700, y: 480, width: 320, height: 160,
        props: { text: '%', fontSize: 160, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 730, width: 960, height: 50,
        props: { text: 'de crescimento no período', fontSize: 36, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 830, width: 960, height: 1,
        props: { fill: '#E0E0E0', cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 860, width: 960, height: 160,
        props: { text: 'Descreva aqui o contexto e o resultado conquistado pela sua empresa neste período.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
    ],
  }

  const bs4x5: Template = {
    id: 'business-statement-4x5',
    name: 'Business Statement — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 80, width: 800, height: 30,
        props: { text: 'RESULTADO DO PERÍODO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'dot', type: 'shape', x: 1000, y: 84, width: 20, height: 20,
        props: { fill: PRIMARY, cornerRadius: 10 } },
      { id: 'number', type: 'text', x: 60, y: 500, width: 960, height: 320,
        props: { text: '+00', fontSize: 320, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'symbol', type: 'text', x: 700, y: 580, width: 320, height: 160,
        props: { text: '%', fontSize: 160, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 880, width: 960, height: 50,
        props: { text: 'de crescimento no período', fontSize: 36, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 980, width: 960, height: 1,
        props: { fill: '#E0E0E0', cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 1010, width: 960, height: 200,
        props: { text: 'Descreva aqui o contexto e o resultado conquistado pela sua empresa neste período.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
    ],
  }

  const bs9x16: Template = {
    id: 'business-statement-9x16',
    name: 'Business Statement — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 120, width: 800, height: 30,
        props: { text: 'RESULTADO DO PERÍODO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'dot', type: 'shape', x: 1000, y: 124, width: 20, height: 20,
        props: { fill: PRIMARY, cornerRadius: 10 } },
      { id: 'number', type: 'text', x: 60, y: 800, width: 960, height: 360,
        props: { text: '+00', fontSize: 360, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'symbol', type: 'text', x: 700, y: 900, width: 320, height: 180,
        props: { text: '%', fontSize: 180, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 1220, width: 960, height: 60,
        props: { text: 'de crescimento no período', fontSize: 40, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 1340, width: 960, height: 1,
        props: { fill: '#E0E0E0', cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 1370, width: 960, height: 200,
        props: { text: 'Descreva aqui o contexto e o resultado conquistado pela sua empresa neste período.', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
    ],
  }

  return [bs1x1, bs4x5, bs9x16]
}
