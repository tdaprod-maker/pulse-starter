import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeGameDayVariants(theme: Theme): Template[] {
  const BG      = '#0A0A0A'
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.65)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const gameDay1x1: Template = {
    id: 'game-day-1x1',
    name: 'Game Day — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 40, width: 960, height: 40,
        props: { text: 'CATEGORIA DO EVENTO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 92, width: 48, height: 3, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 600, width: 900, height: 340,
        props: { text: 'É HORA\nDE JOGAR!', fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.92, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 980, width: 900, height: 44,
        props: { text: 'Categoria · Data · Local', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'bottom-bar', type: 'shape', x: 0, y: 1074, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
    ],
  }

  const gameDay4x5: Template = {
    id: 'game-day-4x5',
    name: 'Game Day — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 40, width: 960, height: 40,
        props: { text: 'CATEGORIA DO EVENTO', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 92, width: 48, height: 3, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 820, width: 900, height: 400,
        props: { text: 'É HORA\nDE JOGAR!', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.92, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 1280, width: 900, height: 44,
        props: { text: 'Categoria · Data · Local', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'bottom-bar', type: 'shape', x: 0, y: 1344, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
    ],
  }

  const gameDay9x16: Template = {
    id: 'game-day-9x16',
    name: 'Game Day — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 60, width: 960, height: 40,
        props: { text: 'CATEGORIA DO EVENTO', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 114, width: 48, height: 3, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 1260, width: 900, height: 500,
        props: { text: 'É HORA\nDE JOGAR!', fontSize: 200, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.92, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 1836, width: 900, height: 44,
        props: { text: 'Categoria · Data · Local', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'bottom-bar', type: 'shape', x: 0, y: 1914, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
    ],
  }

  const gameDay16x9: Template = {
    id: 'game-day-16x9',
    name: 'Game Day — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 1920, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 100, y: 50, width: 1720, height: 40,
        props: { text: 'CATEGORIA DO EVENTO', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 100, y: 104, width: 48, height: 3, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 100, y: 520, width: 1400, height: 420,
        props: { text: 'É HORA DE JOGAR!', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.92, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 100, y: 1010, width: 1400, height: 44,
        props: { text: 'Categoria · Data · Local', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'bottom-bar', type: 'shape', x: 0, y: 1074, width: 1920, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
    ],
  }

  return [gameDay1x1, gameDay4x5, gameDay9x16, gameDay16x9]
}
