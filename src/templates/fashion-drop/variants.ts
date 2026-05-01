import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeFashionDropVariants(theme: Theme): Template[] {
  const BG      = '#0A0A0A'
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.25)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const fd1x1: Template = {
    id: 'fashion-drop-1x1',
    name: 'Fashion Drop — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 60, y: 60, width: 600, height: 28,
        props: { text: 'SUA MARCA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'tag-bg', type: 'shape', x: 860, y: 52, width: 160, height: 36,
        props: { fill: 'rgba(0,0,0,0)', cornerRadius: 2 } },
      { id: 'tag', type: 'text', x: 860, y: 58, width: 160, height: 26,
        props: { text: 'SALE', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 540, width: 960, height: 30,
        props: { text: 'OFERTA ESPECIAL', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'line1', type: 'text', x: 60, y: 590, width: 960, height: 180,
        props: { text: 'ATE', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'line2', type: 'text', x: 60, y: 760, width: 960, height: 180,
        props: { text: '50% OFF', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 970, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 988, width: 700, height: 36,
        props: { text: 'APROVEITE AGORA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'arrow', type: 'text', x: 980, y: 988, width: 40, height: 36,
        props: { text: '→', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, wrap: 'none' } },
    ],
  }

  const fd4x5: Template = {
    id: 'fashion-drop-4x5',
    name: 'Fashion Drop — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 60, y: 80, width: 600, height: 28,
        props: { text: 'SUA MARCA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'tag', type: 'text', x: 860, y: 80, width: 160, height: 26,
        props: { text: 'SALE', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 720, width: 960, height: 30,
        props: { text: 'OFERTA ESPECIAL', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'line1', type: 'text', x: 60, y: 770, width: 960, height: 180,
        props: { text: 'ATE', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'line2', type: 'text', x: 60, y: 940, width: 960, height: 180,
        props: { text: '50% OFF', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 1240, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1258, width: 700, height: 36,
        props: { text: 'APROVEITE AGORA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'arrow', type: 'text', x: 980, y: 1258, width: 40, height: 36,
        props: { text: '→', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, wrap: 'none' } },
    ],
  }

  const fd9x16: Template = {
    id: 'fashion-drop-9x16',
    name: 'Fashion Drop — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 60, y: 120, width: 600, height: 28,
        props: { text: 'SUA MARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'tag', type: 'text', x: 860, y: 120, width: 160, height: 28,
        props: { text: 'SALE', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'label', type: 'text', x: 60, y: 1060, width: 960, height: 36,
        props: { text: 'OFERTA ESPECIAL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'line1', type: 'text', x: 60, y: 1120, width: 960, height: 220,
        props: { text: 'ATE', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'line2', type: 'text', x: 60, y: 1330, width: 960, height: 220,
        props: { text: '50% OFF', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 1740, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1758, width: 700, height: 40,
        props: { text: 'APROVEITE AGORA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'arrow', type: 'text', x: 980, y: 1758, width: 40, height: 40,
        props: { text: '→', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, wrap: 'none' } },
    ],
  }

  const fd16x9: Template = {
    id: 'fashion-drop-16x9',
    name: 'Fashion Drop — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 100, y: 60, width: 800, height: 28,
        props: { text: 'SUA MARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'tag', type: 'text', x: 1700, y: 60, width: 160, height: 28,
        props: { text: 'SALE', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'label', type: 'text', x: 100, y: 380, width: 1720, height: 36,
        props: { text: 'OFERTA ESPECIAL', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'line1', type: 'text', x: 100, y: 440, width: 860, height: 220,
        props: { text: 'ATE', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: WHITE, wrap: 'none', autoFit: true } },
      { id: 'line2', type: 'text', x: 100, y: 650, width: 860, height: 220,
        props: { text: '50% OFF', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.9, align: 'left', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'divider', type: 'shape', x: 1060, y: 380, width: 1, height: 560,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 1100, y: 680, width: 700, height: 40,
        props: { text: 'APROVEITE AGORA', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'arrow', type: 'text', x: 1760, y: 680, width: 60, height: 40,
        props: { text: '→', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: PRIMARY, wrap: 'none' } },
    ],
  }

  return [fd1x1, fd4x5, fd9x16, fd16x9]
}
