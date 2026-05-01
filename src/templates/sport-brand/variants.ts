import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeSportBrandVariants(theme: Theme): Template[] {
  const BG      = '#0A0A0A'
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.25)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const sportBrand1x1: Template = {
    id: 'sport-brand-1x1',
    name: 'Sport Brand — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'brand-label', type: 'text', x: 60, y: 60, width: 600, height: 30,
        props: { text: 'SUA MARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 6, wrap: 'none' } },
      { id: 'accent-dot', type: 'shape', x: 1000, y: 64, width: 20, height: 20,
        props: { fill: PRIMARY, cornerRadius: 10 } },
      { id: 'phrase-line1', type: 'text', x: 60, y: 620, width: 960, height: 180,
        props: { text: 'SUPERE', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'phrase-line2', type: 'text', x: 60, y: 790, width: 960, height: 180,
        props: { text: 'LIMITES', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 990, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'tagline', type: 'text', x: 60, y: 1010, width: 900, height: 30,
        props: { text: 'SUA MARCA · SEU ESPORTE · SEU TEMPO', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const sportBrand4x5: Template = {
    id: 'sport-brand-4x5',
    name: 'Sport Brand — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'brand-label', type: 'text', x: 60, y: 60, width: 600, height: 30,
        props: { text: 'SUA MARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 6, wrap: 'none' } },
      { id: 'accent-dot', type: 'shape', x: 1000, y: 64, width: 20, height: 20,
        props: { fill: PRIMARY, cornerRadius: 10 } },
      { id: 'phrase-line1', type: 'text', x: 60, y: 800, width: 960, height: 180,
        props: { text: 'SUPERE', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'phrase-line2', type: 'text', x: 60, y: 970, width: 960, height: 180,
        props: { text: 'LIMITES', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 1270, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'tagline', type: 'text', x: 60, y: 1290, width: 900, height: 30,
        props: { text: 'SUA MARCA · SEU ESPORTE · SEU TEMPO', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const sportBrand9x16: Template = {
    id: 'sport-brand-9x16',
    name: 'Sport Brand — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'brand-label', type: 'text', x: 60, y: 80, width: 600, height: 30,
        props: { text: 'SUA MARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 6, wrap: 'none' } },
      { id: 'accent-dot', type: 'shape', x: 1000, y: 84, width: 20, height: 20,
        props: { fill: PRIMARY, cornerRadius: 10 } },
      { id: 'phrase-line1', type: 'text', x: 60, y: 1200, width: 960, height: 200,
        props: { text: 'SUPERE', fontSize: 200, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'phrase-line2', type: 'text', x: 60, y: 1390, width: 960, height: 200,
        props: { text: 'LIMITES', fontSize: 200, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 1840, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'tagline', type: 'text', x: 60, y: 1860, width: 900, height: 30,
        props: { text: 'SUA MARCA · SEU ESPORTE · SEU TEMPO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const sportBrand16x9: Template = {
    id: 'sport-brand-16x9',
    name: 'Sport Brand — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'brand-label', type: 'text', x: 100, y: 60, width: 800, height: 30,
        props: { text: 'SUA MARCA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 6, wrap: 'none' } },
      { id: 'accent-dot', type: 'shape', x: 1840, y: 64, width: 20, height: 20,
        props: { fill: PRIMARY, cornerRadius: 10 } },
      { id: 'phrase-line1', type: 'text', x: 100, y: 580, width: 1720, height: 200,
        props: { text: 'SUPERE', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'phrase-line2', type: 'text', x: 100, y: 760, width: 1720, height: 200,
        props: { text: 'LIMITES', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 100, y: 990, width: 1720, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'tagline', type: 'text', x: 100, y: 1012, width: 1400, height: 30,
        props: { text: 'SUA MARCA · SEU ESPORTE · SEU TEMPO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  return [sportBrand1x1, sportBrand4x5, sportBrand9x16, sportBrand16x9]
}
