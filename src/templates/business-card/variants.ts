import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeBusinessCardVariants(theme: Theme): Template[] {
  const BG      = '#0D0D0D'
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.35)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const bc1x1: Template = {
    id: 'business-card-1x1',
    name: 'Business Card — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 60, width: 800, height: 30,
        props: { text: 'SUA EMPRESA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-line', type: 'shape', x: 960, y: 68, width: 60, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 380, width: 400, height: 40,
        props: { text: 'SERVIÇO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 428, width: 40, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 460, width: 960, height: 280,
        props: { text: 'Nome do\nServiço', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 780, width: 840, height: 120,
        props: { text: 'Descreva brevemente o seu serviço ou produto em uma ou duas linhas de forma clara e direta.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 940, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 960, width: 600, height: 40,
        props: { text: 'SAIBA MAIS →', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const bc4x5: Template = {
    id: 'business-card-4x5',
    name: 'Business Card — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 80, width: 800, height: 30,
        props: { text: 'SUA EMPRESA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-line', type: 'shape', x: 960, y: 88, width: 60, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 520, width: 400, height: 40,
        props: { text: 'SERVIÇO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 568, width: 40, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 600, width: 960, height: 280,
        props: { text: 'Nome do\nServiço', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 940, width: 840, height: 120,
        props: { text: 'Descreva brevemente o seu serviço ou produto em uma ou duas linhas de forma clara e direta.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 1200, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1220, width: 600, height: 40,
        props: { text: 'SAIBA MAIS →', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const bc9x16: Template = {
    id: 'business-card-9x16',
    name: 'Business Card — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 120, width: 800, height: 30,
        props: { text: 'SUA EMPRESA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-line', type: 'shape', x: 960, y: 128, width: 60, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 800, width: 400, height: 40,
        props: { text: 'SERVIÇO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 848, width: 40, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 880, width: 960, height: 380,
        props: { text: 'Nome do\nServiço', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 1340, width: 840, height: 160,
        props: { text: 'Descreva brevemente o seu serviço ou produto em uma ou duas linhas de forma clara e direta.', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 1740, width: 960, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1760, width: 600, height: 50,
        props: { text: 'SAIBA MAIS →', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }


  const bc16x9: Template = {
    id: 'business-card-16x9',
    name: 'Business Card — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 100, y: 60, width: 1000, height: 30,
        props: { text: 'SUA EMPRESA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'accent-line', type: 'shape', x: 1800, y: 68, width: 60, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 100, y: 380, width: 400, height: 40,
        props: { text: 'SERVIÇO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 100, y: 428, width: 40, height: 2,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 100, y: 460, width: 860, height: 380,
        props: { text: 'Nome do
Serviço', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 1060, y: 460, width: 760, height: 200,
        props: { text: 'Descreva brevemente o seu serviço ou produto de forma clara e direta.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 1060, y: 720, width: 760, height: 1,
        props: { fill: '#1A1A1A', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 1060, y: 740, width: 600, height: 50,
        props: { text: 'SAIBA MAIS →', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  return [bc1x1, bc4x5, bc9x16, bc16x9]
}
