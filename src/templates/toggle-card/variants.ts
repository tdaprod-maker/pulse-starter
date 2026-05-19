import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeToggleCardVariants(theme: Theme): Template[] {
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.65)'
  const CARD    = '#2d2620'
  const TOGGLE_BG = '#f0ebe4'
  const TOGGLE_KNOB = '#7a6e68'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const tc4x5: Template = {
    id: 'toggle-card-4x5',
    name: 'Card Reveal — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: '#c4b4a4',
    elements: [
      // Overlay escuro sobre a foto de fundo
      { id: 'overlay', type: 'shape', x: 0, y: 0, width: 1080, height: 1350,
        props: { fill: 'rgba(180,160,140,0.55)', cornerRadius: 0 } },
      // Card dark central arredondado
      { id: 'card', type: 'shape', x: 120, y: 320, width: 840, height: 700,
        props: { fill: CARD, cornerRadius: 40 } },
      // Toggle decorativo
      { id: 'toggle-bg', type: 'shape', x: 390, y: 380, width: 300, height: 80,
        props: { fill: TOGGLE_BG, cornerRadius: 40 } },
      { id: 'toggle-knob', type: 'shape', x: 400, y: 390, width: 60, height: 60,
        props: { fill: TOGGLE_KNOB, cornerRadius: 30 } },
      // Hashtag
      { id: 'hashtag', type: 'text', x: 120, y: 490, width: 840, height: 60,
        props: { text: '#suamarca', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 1, wrap: 'none' } },
      // Título principal
      { id: 'title', type: 'text', x: 160, y: 570, width: 760, height: 260,
        props: { text: '4 Motivos para escolher a gente!', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      // Handle base
      { id: 'handle', type: 'text', x: 120, y: 1270, width: 840, height: 44,
        props: { text: '@suamarca', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: 'rgba(255,255,255,0.7)', wrap: 'none' } },
    ],
  }

  const tc1x1: Template = {
    id: 'toggle-card-1x1',
    name: 'Card Reveal — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: '#c4b4a4',
    elements: [
      { id: 'overlay', type: 'shape', x: 0, y: 0, width: 1080, height: 1080,
        props: { fill: 'rgba(180,160,140,0.55)', cornerRadius: 0 } },
      { id: 'card', type: 'shape', x: 120, y: 180, width: 840, height: 680,
        props: { fill: CARD, cornerRadius: 40 } },
      { id: 'toggle-bg', type: 'shape', x: 390, y: 240, width: 300, height: 76,
        props: { fill: TOGGLE_BG, cornerRadius: 38 } },
      { id: 'toggle-knob', type: 'shape', x: 400, y: 250, width: 56, height: 56,
        props: { fill: TOGGLE_KNOB, cornerRadius: 28 } },
      { id: 'hashtag', type: 'text', x: 120, y: 348, width: 840, height: 54,
        props: { text: '#suamarca', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 1, wrap: 'none' } },
      { id: 'title', type: 'text', x: 160, y: 420, width: 760, height: 260,
        props: { text: '4 Motivos para escolher a gente!', fontSize: 68, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'handle', type: 'text', x: 120, y: 1014, width: 840, height: 40,
        props: { text: '@suamarca', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: 'rgba(255,255,255,0.7)', wrap: 'none' } },
    ],
  }

  const tc9x16: Template = {
    id: 'toggle-card-9x16',
    name: 'Card Reveal — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: '#c4b4a4',
    elements: [
      { id: 'overlay', type: 'shape', x: 0, y: 0, width: 1080, height: 1920,
        props: { fill: 'rgba(180,160,140,0.55)', cornerRadius: 0 } },
      { id: 'card', type: 'shape', x: 100, y: 580, width: 880, height: 760,
        props: { fill: CARD, cornerRadius: 48 } },
      { id: 'toggle-bg', type: 'shape', x: 390, y: 650, width: 300, height: 84,
        props: { fill: TOGGLE_BG, cornerRadius: 42 } },
      { id: 'toggle-knob', type: 'shape', x: 400, y: 661, width: 62, height: 62,
        props: { fill: TOGGLE_KNOB, cornerRadius: 31 } },
      { id: 'hashtag', type: 'text', x: 100, y: 770, width: 880, height: 60,
        props: { text: '#suamarca', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 1, wrap: 'none' } },
      { id: 'title', type: 'text', x: 140, y: 856, width: 800, height: 340,
        props: { text: '4 Motivos para escolher a gente!', fontSize: 88, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'handle', type: 'text', x: 100, y: 1820, width: 880, height: 50,
        props: { text: '@suamarca', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: 'rgba(255,255,255,0.7)', wrap: 'none' } },
    ],
  }

  return [tc4x5, tc1x1, tc9x16]
}
