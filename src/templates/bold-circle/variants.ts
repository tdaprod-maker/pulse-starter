import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeBoldCircleVariants(theme: Theme): Template[] {
  const BG      = '#E8450A'
  const DARK    = '#1A1A1A'
  const WHITE   = '#F5F0E8'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const bc1x1: Template = {
    id: 'bold-circle-1x1',
    name: 'Bold Circle — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      // Círculo escuro no topo direito
      { id: 'circle-dark', type: 'shape', x: 460, y: -320, width: 860, height: 860,
        props: { fill: DARK, cornerRadius: 430 } },
      // Texto dentro do círculo
      { id: 'circle-title', type: 'text', x: 480, y: 40, width: 780, height: 380,
        props: { text: 'Small\nHabits', fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      // Linha decorativa esquerda superior
      { id: 'line-top-left', type: 'shape', x: 60, y: 80, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-top-left2', type: 'shape', x: 60, y: 300, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      // Linha decorativa direita inferior
      { id: 'line-bot-right', type: 'shape', x: 1018, y: 560, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-bot-right2', type: 'shape', x: 1018, y: 780, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      // Título principal
      { id: 'title', type: 'text', x: 60, y: 580, width: 800, height: 320,
        props: { text: 'That Secretly\nChange Your Life', fontSize: 90, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      // Highlight box em uma palavra
      { id: 'highlight-bg', type: 'shape', x: 60, y: 820, width: 340, height: 90,
        props: { fill: DARK, cornerRadius: 4 } },
      { id: 'highlight-text', type: 'text', x: 60, y: 833, width: 340, height: 70,
        props: { text: 'Change', fontSize: 68, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'none' } },
    ],
  }

  const bc4x5: Template = {
    id: 'bold-circle-4x5',
    name: 'Bold Circle — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'circle-dark', type: 'shape', x: 460, y: -320, width: 860, height: 860,
        props: { fill: DARK, cornerRadius: 430 } },
      { id: 'circle-title', type: 'text', x: 480, y: 40, width: 780, height: 380,
        props: { text: 'Small\nHabits', fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'line-top-left', type: 'shape', x: 60, y: 80, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-top-left2', type: 'shape', x: 60, y: 300, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-bot-right', type: 'shape', x: 1018, y: 760, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-bot-right2', type: 'shape', x: 1018, y: 980, width: 1, height: 160,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 700, width: 800, height: 420,
        props: { text: 'That Secretly\nChange Your Life', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'highlight-bg', type: 'shape', x: 60, y: 1000, width: 380, height: 100,
        props: { fill: DARK, cornerRadius: 4 } },
      { id: 'highlight-text', type: 'text', x: 60, y: 1015, width: 380, height: 80,
        props: { text: 'Change', fontSize: 76, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'none' } },
      { id: 'subtitle', type: 'text', x: 60, y: 1260, width: 960, height: 50,
        props: { text: 'Deslize para descobrir →', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none', letterSpacing: 1 } },
    ],
  }

  const bc9x16: Template = {
    id: 'bold-circle-9x16',
    name: 'Bold Circle — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'circle-dark', type: 'shape', x: 460, y: -360, width: 980, height: 980,
        props: { fill: DARK, cornerRadius: 490 } },
      { id: 'circle-title', type: 'text', x: 480, y: 60, width: 860, height: 460,
        props: { text: 'Small\nHabits', fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'line-top-left', type: 'shape', x: 60, y: 100, width: 1, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-top-left2', type: 'shape', x: 60, y: 360, width: 1, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-bot-right', type: 'shape', x: 1018, y: 1100, width: 1, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-bot-right2', type: 'shape', x: 1018, y: 1360, width: 1, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 1000, width: 900, height: 600,
        props: { text: 'That Secretly\nChange Your Life', fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'highlight-bg', type: 'shape', x: 60, y: 1460, width: 460, height: 120,
        props: { fill: DARK, cornerRadius: 4 } },
      { id: 'highlight-text', type: 'text', x: 60, y: 1478, width: 460, height: 96,
        props: { text: 'Change', fontSize: 90, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'none' } },
      { id: 'subtitle', type: 'text', x: 60, y: 1820, width: 960, height: 60,
        props: { text: 'Deslize para descobrir →', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none', letterSpacing: 1 } },
    ],
  }

  return [bc1x1, bc4x5, bc9x16]
}
