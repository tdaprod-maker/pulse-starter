import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeBuildImpactVariants(theme: Theme): Template[] {
  const BG      = '#111111'
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.35)'
  const MUTED2  = 'rgba(255,255,255,0.55)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const bi1x1: Template = {
    id: 'build-impact-1x1',
    name: 'Build Impact — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 60, width: 800, height: 30,
        props: { text: 'PORTFOLIO DE OBRAS', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 1000, y: 48, width: 8, height: 60,
        props: { fill: PRIMARY, cornerRadius: 2 } },
      { id: 'number', type: 'text', x: 60, y: 540, width: 960, height: 280,
        props: { text: '+000', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'symbol', type: 'text', x: 500, y: 610, width: 280, height: 120,
        props: { text: 'm2', fontSize: 90, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 840, width: 960, height: 40,
        props: { text: 'ENTREGUES COM EXCELENCIA', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 920, width: 960, height: 1,
        props: { fill: '#222222', cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 940, width: 960, height: 100,
        props: { text: 'Obra concluida no prazo. Acabamento premium, materiais certificados e total transparencia do inicio ao fim.', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED2, wrap: 'word' } },
    ],
  }

  const bi4x5: Template = {
    id: 'build-impact-4x5',
    name: 'Build Impact — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 80, width: 800, height: 30,
        props: { text: 'PORTFOLIO DE OBRAS', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 1000, y: 68, width: 8, height: 60,
        props: { fill: PRIMARY, cornerRadius: 2 } },
      { id: 'number', type: 'text', x: 60, y: 720, width: 960, height: 280,
        props: { text: '+000', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'symbol', type: 'text', x: 500, y: 790, width: 280, height: 120,
        props: { text: 'm2', fontSize: 90, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 1020, width: 960, height: 40,
        props: { text: 'ENTREGUES COM EXCELENCIA', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 1160, width: 960, height: 1,
        props: { fill: '#222222', cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 1180, width: 960, height: 100,
        props: { text: 'Obra concluida no prazo. Acabamento premium, materiais certificados e total transparencia do inicio ao fim.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED2, wrap: 'word' } },
    ],
  }

  const bi9x16: Template = {
    id: 'build-impact-9x16',
    name: 'Build Impact — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 120, width: 800, height: 30,
        props: { text: 'PORTFOLIO DE OBRAS', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 1000, y: 108, width: 8, height: 60,
        props: { fill: PRIMARY, cornerRadius: 2 } },
      { id: 'number', type: 'text', x: 60, y: 1000, width: 960, height: 360,
        props: { text: '+000', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'symbol', type: 'text', x: 560, y: 1090, width: 280, height: 160,
        props: { text: 'm2', fontSize: 110, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 1400, width: 960, height: 50,
        props: { text: 'ENTREGUES COM EXCELENCIA', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 1560, width: 960, height: 1,
        props: { fill: '#222222', cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 1580, width: 960, height: 160,
        props: { text: 'Obra concluida no prazo. Acabamento premium, materiais certificados e total transparencia do inicio ao fim.', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED2, wrap: 'word' } },
    ],
  }

  const bi16x9: Template = {
    id: 'build-impact-16x9',
    name: 'Build Impact — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 100, y: 60, width: 1000, height: 30,
        props: { text: 'PORTFOLIO DE OBRAS', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-bar', type: 'shape', x: 1860, y: 48, width: 8, height: 60,
        props: { fill: PRIMARY, cornerRadius: 2 } },
      { id: 'number', type: 'text', x: 100, y: 340, width: 860, height: 380,
        props: { text: '+000', fontSize: 380, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'label', type: 'text', x: 100, y: 760, width: 860, height: 50,
        props: { text: 'ENTREGUES COM EXCELENCIA', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'symbol', type: 'text', x: 580, y: 350, width: 280, height: 160,
        props: { text: 'm2', fontSize: 110, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 1060, y: 600, width: 760, height: 1,
        props: { fill: '#222222', cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 1060, y: 620, width: 760, height: 160,
        props: { text: 'Obra concluida no prazo. Acabamento premium, materiais certificados e total transparencia do inicio ao fim.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED2, wrap: 'word' } },
    ],
  }

  return [bi1x1, bi4x5, bi9x16, bi16x9]
}
