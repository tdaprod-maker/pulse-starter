import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeFashionEditorialVariants(theme: Theme): Template[] {
  const BG      = '#FFFFFF'
  const PRIMARY = theme.colors.accent
  const DARK    = '#1A1A1A'
  const MUTED   = 'rgba(0,0,0,0.2)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const fe1x1: Template = {
    id: 'fashion-editorial-1x1',
    name: 'Fashion Editorial — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 60, y: 60, width: 600, height: 28,
        props: { text: 'SUA MARCA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'num', type: 'text', x: 960, y: 60, width: 60, height: 28,
        props: { text: '001', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 460, width: 960, height: 280,
        props: { text: 'Nome da\nPeca', fontSize: 140, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.15, align: 'center', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'accent-dot', type: 'shape', x: 528, y: 760, width: 8, height: 8,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'cat', type: 'text', x: 60, y: 1020, width: 960, height: 24,
        props: { text: 'COLECAO · 2026', fontSize: 14, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
    ],
  }

  const fe4x5: Template = {
    id: 'fashion-editorial-4x5',
    name: 'Fashion Editorial — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 60, y: 80, width: 600, height: 28,
        props: { text: 'SUA MARCA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'num', type: 'text', x: 960, y: 80, width: 60, height: 28,
        props: { text: '001', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 590, width: 960, height: 280,
        props: { text: 'Nome da\nPeca', fontSize: 140, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.15, align: 'center', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'accent-dot', type: 'shape', x: 528, y: 890, width: 8, height: 8,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'cat', type: 'text', x: 60, y: 1290, width: 960, height: 24,
        props: { text: 'COLECAO · 2026', fontSize: 14, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
    ],
  }

  const fe9x16: Template = {
    id: 'fashion-editorial-9x16',
    name: 'Fashion Editorial — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 60, y: 120, width: 600, height: 28,
        props: { text: 'SUA MARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'num', type: 'text', x: 960, y: 120, width: 60, height: 28,
        props: { text: '001', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 820, width: 960, height: 360,
        props: { text: 'Nome da\nPeca', fontSize: 180, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.15, align: 'center', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'accent-dot', type: 'shape', x: 528, y: 1200, width: 8, height: 8,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'cat', type: 'text', x: 60, y: 1860, width: 960, height: 28,
        props: { text: 'COLECAO · 2026', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
    ],
  }

  const fe16x9: Template = {
    id: 'fashion-editorial-16x9',
    name: 'Fashion Editorial — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'brand', type: 'text', x: 100, y: 60, width: 800, height: 28,
        props: { text: 'SUA MARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 8, wrap: 'none' } },
      { id: 'num', type: 'text', x: 1760, y: 60, width: 60, height: 28,
        props: { text: '001', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 100, y: 380, width: 1720, height: 360,
        props: { text: 'Nome da Peca', fontSize: 200, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.15, align: 'center', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'accent-dot', type: 'shape', x: 952, y: 760, width: 8, height: 8,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'cat', type: 'text', x: 100, y: 1020, width: 1720, height: 24,
        props: { text: 'COLECAO · 2026', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
    ],
  }

  return [fe1x1, fe4x5, fe9x16, fe16x9]
}
