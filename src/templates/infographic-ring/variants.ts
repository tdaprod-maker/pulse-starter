import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeInfographicRingVariants(theme: Theme): Template[] {
  const WHITE   = '#FFFFFF'
  const YELLOW  = '#F5A800'
  const DARK    = '#111111'
  const CARD    = '#1e1e1e'
  const MUTED   = 'rgba(255,255,255,0.6)'
  const BODY    = theme.fonts.body
  const HEADING = theme.fonts.heading

  const ir4x5: Template = {
    id: 'infographic-ring-4x5',
    name: 'Infográfico Anel — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: DARK,
    elements: [
      // Anel externo amarelo (círculo grande)
      { id: 'ring-outer', type: 'shape', x: 90, y: 60, width: 900, height: 900,
        props: { fill: YELLOW, cornerRadius: 450 } },
      // Círculo interno escuro (cria o efeito de anel)
      { id: 'ring-inner', type: 'shape', x: 190, y: 160, width: 700, height: 700,
        props: { fill: DARK, cornerRadius: 350 } },
      // Título central
      { id: 'ring-title1', type: 'text', x: 190, y: 390, width: 700, height: 80,
        props: { text: 'INFOGRÁFICO', fontSize: 52, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 4, wrap: 'none', autoFit: true } },
      { id: 'ring-title2', type: 'text', x: 190, y: 468, width: 700, height: 80,
        props: { text: 'GLOBAL', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 2, wrap: 'none', autoFit: true } },
      // Ícone decorativo central
      { id: 'ring-icon', type: 'shape', x: 490, y: 570, width: 100, height: 100,
        props: { fill: WHITE, cornerRadius: 50 } },

      // Cards de itens — linha 1
      { id: 'card1', type: 'shape', x: 30, y: 980, width: 490, height: 150,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon1', type: 'shape', x: 58, y: 1010, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num1', type: 'text', x: 148, y: 990, width: 340, height: 36,
        props: { text: '01 ITEM UM', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc1', type: 'text', x: 148, y: 1028, width: 340, height: 80,
        props: { text: 'Descrição breve do primeiro ponto de destaque.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },

      { id: 'card2', type: 'shape', x: 560, y: 980, width: 490, height: 150,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon2', type: 'shape', x: 588, y: 1010, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num2', type: 'text', x: 678, y: 990, width: 340, height: 36,
        props: { text: '02 ITEM DOIS', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc2', type: 'text', x: 678, y: 1028, width: 340, height: 80,
        props: { text: 'Descrição breve do segundo ponto de destaque.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },

      // Cards de itens — linha 2
      { id: 'card3', type: 'shape', x: 30, y: 1150, width: 490, height: 150,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon3', type: 'shape', x: 58, y: 1180, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num3', type: 'text', x: 148, y: 1160, width: 340, height: 36,
        props: { text: '03 ITEM TRÊS', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc3', type: 'text', x: 148, y: 1198, width: 340, height: 80,
        props: { text: 'Descrição breve do terceiro ponto de destaque.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },

      { id: 'card4', type: 'shape', x: 560, y: 1150, width: 490, height: 150,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon4', type: 'shape', x: 588, y: 1180, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num4', type: 'text', x: 678, y: 1160, width: 340, height: 36,
        props: { text: '04 ITEM QUATRO', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc4', type: 'text', x: 678, y: 1198, width: 340, height: 80,
        props: { text: 'Descrição breve do quarto ponto de destaque.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },
    ],
  }

  const ir1x1: Template = {
    id: 'infographic-ring-1x1',
    name: 'Infográfico Anel — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: DARK,
    elements: [
      { id: 'ring-outer', type: 'shape', x: 140, y: 40, width: 800, height: 800,
        props: { fill: YELLOW, cornerRadius: 400 } },
      { id: 'ring-inner', type: 'shape', x: 240, y: 140, width: 600, height: 600,
        props: { fill: DARK, cornerRadius: 300 } },
      { id: 'ring-title1', type: 'text', x: 240, y: 330, width: 600, height: 70,
        props: { text: 'INFOGRÁFICO', fontSize: 44, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 4, wrap: 'none', autoFit: true } },
      { id: 'ring-title2', type: 'text', x: 240, y: 396, width: 600, height: 70,
        props: { text: 'GLOBAL', fontSize: 62, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 2, wrap: 'none', autoFit: true } },
      { id: 'ring-icon', type: 'shape', x: 490, y: 490, width: 100, height: 100,
        props: { fill: WHITE, cornerRadius: 50 } },
      { id: 'card1', type: 'shape', x: 20, y: 860, width: 490, height: 160,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon1', type: 'shape', x: 46, y: 892, width: 64, height: 64,
        props: { fill: YELLOW, cornerRadius: 32 } },
      { id: 'num1', type: 'text', x: 126, y: 872, width: 360, height: 34,
        props: { text: '01 ITEM UM', fontSize: 20, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc1', type: 'text', x: 126, y: 908, width: 360, height: 80,
        props: { text: 'Descrição breve do primeiro ponto.', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'card2', type: 'shape', x: 560, y: 860, width: 500, height: 160,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon2', type: 'shape', x: 586, y: 892, width: 64, height: 64,
        props: { fill: YELLOW, cornerRadius: 32 } },
      { id: 'num2', type: 'text', x: 666, y: 872, width: 360, height: 34,
        props: { text: '02 ITEM DOIS', fontSize: 20, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc2', type: 'text', x: 666, y: 908, width: 360, height: 80,
        props: { text: 'Descrição breve do segundo ponto.', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },
    ],
  }

  const ir9x16: Template = {
    id: 'infographic-ring-9x16',
    name: 'Infográfico Anel — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: DARK,
    elements: [
      { id: 'ring-outer', type: 'shape', x: 90, y: 100, width: 900, height: 900,
        props: { fill: YELLOW, cornerRadius: 450 } },
      { id: 'ring-inner', type: 'shape', x: 190, y: 200, width: 700, height: 700,
        props: { fill: DARK, cornerRadius: 350 } },
      { id: 'ring-title1', type: 'text', x: 190, y: 430, width: 700, height: 80,
        props: { text: 'INFOGRÁFICO', fontSize: 52, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 4, wrap: 'none', autoFit: true } },
      { id: 'ring-title2', type: 'text', x: 190, y: 510, width: 700, height: 80,
        props: { text: 'GLOBAL', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 2, wrap: 'none', autoFit: true } },
      { id: 'ring-icon', type: 'shape', x: 490, y: 612, width: 100, height: 100,
        props: { fill: WHITE, cornerRadius: 50 } },
      { id: 'card1', type: 'shape', x: 30, y: 1060, width: 490, height: 160,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon1', type: 'shape', x: 58, y: 1090, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num1', type: 'text', x: 148, y: 1070, width: 340, height: 36,
        props: { text: '01 ITEM UM', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc1', type: 'text', x: 148, y: 1108, width: 340, height: 80,
        props: { text: 'Descrição breve do primeiro ponto.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'card2', type: 'shape', x: 560, y: 1060, width: 490, height: 160,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon2', type: 'shape', x: 588, y: 1090, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num2', type: 'text', x: 678, y: 1070, width: 340, height: 36,
        props: { text: '02 ITEM DOIS', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc2', type: 'text', x: 678, y: 1108, width: 340, height: 80,
        props: { text: 'Descrição breve do segundo ponto.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'card3', type: 'shape', x: 30, y: 1240, width: 490, height: 160,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon3', type: 'shape', x: 58, y: 1270, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num3', type: 'text', x: 148, y: 1250, width: 340, height: 36,
        props: { text: '03 ITEM TRÊS', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc3', type: 'text', x: 148, y: 1288, width: 340, height: 80,
        props: { text: 'Descrição breve do terceiro ponto.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'card4', type: 'shape', x: 560, y: 1240, width: 490, height: 160,
        props: { fill: CARD, cornerRadius: 16 } },
      { id: 'icon4', type: 'shape', x: 588, y: 1270, width: 70, height: 70,
        props: { fill: YELLOW, cornerRadius: 35 } },
      { id: 'num4', type: 'text', x: 678, y: 1250, width: 340, height: 36,
        props: { text: '04 ITEM QUATRO', fontSize: 22, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'desc4', type: 'text', x: 678, y: 1288, width: 340, height: 80,
        props: { text: 'Descrição breve do quarto ponto.', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.3, align: 'left', fill: MUTED, wrap: 'word' } },
    ],
  }

  return [ir4x5, ir1x1, ir9x16]
}
