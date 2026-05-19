import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeFoodVerticalVariants(theme: Theme): Template[] {
  const BG      = '#F5C842'
  const DARK    = '#0C0C0D'
  const WHITE   = '#FFFFFF'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const fv1x1: Template = {
    id: 'food-vertical-1x1',
    name: 'Food Vertical — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      // Faixa escura vertical esquerda
      { id: 'left-bar', type: 'shape', x: 0, y: 0, width: 200, height: 1080,
        props: { fill: DARK, cornerRadius: 0 } },
      // Texto vertical rotacionado na faixa escura
      { id: 'vert-text', type: 'text', x: -380, y: 480, width: 960, height: 180,
        props: { text: 'VEM QUE TEM', fontSize: 120, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: BG, wrap: 'none', rotation: -90, autoFit: true, letterSpacing: 8 } },
      // Bloco escuro direito com conteúdo
      { id: 'right-block', type: 'shape', x: 560, y: 0, width: 520, height: 1080,
        props: { fill: DARK, cornerRadius: 0 } },
      // Título no bloco direito
      { id: 'title', type: 'text', x: 580, y: 60, width: 460, height: 200,
        props: { text: 'QUARTA\nTEM\nPROMO', fontSize: 88, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      // Highlight tag
      { id: 'tag-bg', type: 'shape', x: 580, y: 300, width: 280, height: 52,
        props: { fill: BG, cornerRadius: 4 } },
      { id: 'tag', type: 'text', x: 580, y: 312, width: 280, height: 32,
        props: { text: 'DELIVERY OU RETIRADA', fontSize: 16, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: DARK, letterSpacing: 1, wrap: 'none' } },
      // Corpo
      { id: 'body', type: 'text', x: 580, y: 380, width: 460, height: 120,
        props: { text: 'Aproveite nossa promoção especial toda quarta-feira.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: 'rgba(255,255,255,0.6)', wrap: 'word' } },
      // Telefone
      { id: 'phone', type: 'text', x: 580, y: 880, width: 460, height: 50,
        props: { text: '(11) 9999-9999', fontSize: 32, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      // Site
      { id: 'website', type: 'text', x: 580, y: 930, width: 460, height: 40,
        props: { text: 'seusite.com.br', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: BG, wrap: 'none' } },
    ],
  }

  const fv4x5: Template = {
    id: 'food-vertical-4x5',
    name: 'Food Vertical — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'left-bar', type: 'shape', x: 0, y: 0, width: 200, height: 1350,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'vert-text', type: 'text', x: -440, y: 620, width: 1240, height: 180,
        props: { text: 'VEM QUE TEM', fontSize: 120, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: BG, wrap: 'none', rotation: -90, autoFit: true, letterSpacing: 8 } },
      { id: 'right-block', type: 'shape', x: 560, y: 0, width: 520, height: 1350,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 580, y: 80, width: 460, height: 260,
        props: { text: 'QUARTA\nTEM\nPROMO', fontSize: 96, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'tag-bg', type: 'shape', x: 580, y: 380, width: 300, height: 56,
        props: { fill: BG, cornerRadius: 4 } },
      { id: 'tag', type: 'text', x: 580, y: 394, width: 300, height: 32,
        props: { text: 'DELIVERY OU RETIRADA', fontSize: 16, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: DARK, letterSpacing: 1, wrap: 'none' } },
      { id: 'body', type: 'text', x: 580, y: 460, width: 460, height: 160,
        props: { text: 'Aproveite nossa promoção especial toda quarta-feira.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: 'rgba(255,255,255,0.6)', wrap: 'word' } },
      { id: 'phone', type: 'text', x: 580, y: 1160, width: 460, height: 60,
        props: { text: '(11) 9999-9999', fontSize: 34, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'website', type: 'text', x: 580, y: 1220, width: 460, height: 50,
        props: { text: 'seusite.com.br', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: BG, wrap: 'none' } },
    ],
  }

  const fv9x16: Template = {
    id: 'food-vertical-9x16',
    name: 'Food Vertical — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'left-bar', type: 'shape', x: 0, y: 0, width: 240, height: 1920,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'vert-text', type: 'text', x: -580, y: 900, width: 1800, height: 220,
        props: { text: 'VEM QUE TEM', fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: BG, wrap: 'none', rotation: -90, autoFit: true, letterSpacing: 8 } },
      { id: 'right-block', type: 'shape', x: 620, y: 0, width: 460, height: 1920,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 640, y: 120, width: 400, height: 400,
        props: { text: 'QUARTA\nTEM\nPROMO', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'tag-bg', type: 'shape', x: 640, y: 560, width: 340, height: 64,
        props: { fill: BG, cornerRadius: 4 } },
      { id: 'tag', type: 'text', x: 640, y: 576, width: 340, height: 36,
        props: { text: 'DELIVERY OU RETIRADA', fontSize: 17, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: DARK, letterSpacing: 1, wrap: 'none' } },
      { id: 'body', type: 'text', x: 640, y: 660, width: 400, height: 240,
        props: { text: 'Aproveite nossa promoção especial toda quarta-feira.', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: 'rgba(255,255,255,0.6)', wrap: 'word' } },
      { id: 'phone', type: 'text', x: 640, y: 1680, width: 400, height: 70,
        props: { text: '(11) 9999-9999', fontSize: 36, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'website', type: 'text', x: 640, y: 1760, width: 400, height: 60,
        props: { text: 'seusite.com.br', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: BG, wrap: 'none' } },
    ],
  }

  return [fv1x1, fv4x5, fv9x16]
}
