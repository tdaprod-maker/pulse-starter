import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeHealthSplitVariants(theme: Theme): Template[] {
  const WHITE   = '#FFFFFF'
  const DARK    = '#0d2a4a'
  const TEAL    = '#3dbfb0'
  const TEAL_BG = '#e8f7f6'
  const MUTED   = '#4a6a8a'
  const BODY    = theme.fonts.body
  const HEADING = theme.fonts.heading

  const hs4x5: Template = {
    id: 'health-split-4x5',
    name: 'Saúde em Foco — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: '#f0f8f7',
    elements: [
      // Fundo claro lado direito (área de texto)
      { id: 'bg-right', type: 'shape', x: 460, y: 0, width: 620, height: 1350,
        props: { fill: WHITE, cornerRadius: 0 } },
      // Cruzes decorativas fundo
      { id: 'cross1', type: 'shape', x: 80, y: 60, width: 60, height: 16,
        props: { fill: 'rgba(61,191,176,0.25)', cornerRadius: 4 } },
      { id: 'cross1v', type: 'shape', x: 102, y: 38, width: 16, height: 60,
        props: { fill: 'rgba(61,191,176,0.25)', cornerRadius: 4 } },
      { id: 'cross2', type: 'shape', x: 300, y: 900, width: 50, height: 14,
        props: { fill: 'rgba(61,191,176,0.2)', cornerRadius: 4 } },
      { id: 'cross2v', type: 'shape', x: 318, y: 882, width: 14, height: 50,
        props: { fill: 'rgba(61,191,176,0.2)', cornerRadius: 4 } },
      // Badge marca no topo direito
      { id: 'badge-bg', type: 'shape', x: 720, y: 40, width: 280, height: 70,
        props: { fill: TEAL_BG, cornerRadius: 35 } },
      { id: 'badge-icon', type: 'shape', x: 738, y: 58, width: 34, height: 34,
        props: { fill: TEAL, cornerRadius: 17 } },
      { id: 'badge-text', type: 'text', x: 782, y: 58, width: 200, height: 34,
        props: { text: 'Borcelle', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      // Headline principal
      { id: 'headline1', type: 'text', x: 500, y: 180, width: 520, height: 100,
        props: { text: 'Sua Saúde,', fontSize: 70, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'headline2', type: 'text', x: 500, y: 278, width: 520, height: 100,
        props: { text: 'Nossa', fontSize: 70, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'headline3', type: 'text', x: 500, y: 370, width: 520, height: 100,
        props: { text: 'Prioridade', fontSize: 70, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      // Linha decorativa teal
      { id: 'teal-line', type: 'shape', x: 720, y: 500, width: 280, height: 5,
        props: { fill: TEAL, cornerRadius: 3 } },
      // Subtítulo / frase
      { id: 'subtitle', type: 'text', x: 500, y: 530, width: 520, height: 120,
        props: { text: '"Cuidado de confiança porque o seu bem-estar merece o melhor."', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'right', fill: MUTED, wrap: 'word' } },
      // Badge inferior com telefone
      { id: 'phone-bg', type: 'shape', x: 620, y: 1220, width: 400, height: 80,
        props: { fill: TEAL_BG, cornerRadius: 20 } },
      { id: 'phone-label', type: 'text', x: 640, y: 1230, width: 360, height: 30,
        props: { text: 'Entrega Gratuita', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, wrap: 'none' } },
      { id: 'phone-number', type: 'text', x: 640, y: 1262, width: 360, height: 36,
        props: { text: '+55 (11) 9 9999-9999', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  const hs1x1: Template = {
    id: 'health-split-1x1',
    name: 'Saúde em Foco — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: '#f0f8f7',
    elements: [
      { id: 'bg-right', type: 'shape', x: 440, y: 0, width: 640, height: 1080,
        props: { fill: WHITE, cornerRadius: 0 } },
      { id: 'cross1', type: 'shape', x: 70, y: 50, width: 54, height: 14,
        props: { fill: 'rgba(61,191,176,0.25)', cornerRadius: 4 } },
      { id: 'cross1v', type: 'shape', x: 90, y: 30, width: 14, height: 54,
        props: { fill: 'rgba(61,191,176,0.25)', cornerRadius: 4 } },
      { id: 'badge-bg', type: 'shape', x: 700, y: 36, width: 300, height: 66,
        props: { fill: TEAL_BG, cornerRadius: 33 } },
      { id: 'badge-icon', type: 'shape', x: 718, y: 52, width: 32, height: 32,
        props: { fill: TEAL, cornerRadius: 16 } },
      { id: 'badge-text', type: 'text', x: 760, y: 54, width: 220, height: 32,
        props: { text: 'Borcelle', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'headline1', type: 'text', x: 480, y: 160, width: 540, height: 90,
        props: { text: 'Sua Saúde,', fontSize: 62, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'headline2', type: 'text', x: 480, y: 248, width: 540, height: 90,
        props: { text: 'Nossa', fontSize: 62, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'headline3', type: 'text', x: 480, y: 332, width: 540, height: 90,
        props: { text: 'Prioridade', fontSize: 62, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'teal-line', type: 'shape', x: 700, y: 450, width: 280, height: 4,
        props: { fill: TEAL, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 480, y: 476, width: 540, height: 120,
        props: { text: '"Cuidado de confiança porque o seu bem-estar merece o melhor."', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'right', fill: MUTED, wrap: 'word' } },
      { id: 'phone-bg', type: 'shape', x: 620, y: 960, width: 400, height: 76,
        props: { fill: TEAL_BG, cornerRadius: 18 } },
      { id: 'phone-label', type: 'text', x: 640, y: 968, width: 360, height: 28,
        props: { text: 'Entrega Gratuita', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, wrap: 'none' } },
      { id: 'phone-number', type: 'text', x: 640, y: 998, width: 360, height: 34,
        props: { text: '+55 (11) 9 9999-9999', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  const hs9x16: Template = {
    id: 'health-split-9x16',
    name: 'Saúde em Foco — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: '#f0f8f7',
    elements: [
      { id: 'bg-right', type: 'shape', x: 460, y: 0, width: 620, height: 1920,
        props: { fill: WHITE, cornerRadius: 0 } },
      { id: 'cross1', type: 'shape', x: 80, y: 80, width: 64, height: 16,
        props: { fill: 'rgba(61,191,176,0.25)', cornerRadius: 4 } },
      { id: 'cross1v', type: 'shape', x: 104, y: 56, width: 16, height: 64,
        props: { fill: 'rgba(61,191,176,0.25)', cornerRadius: 4 } },
      { id: 'badge-bg', type: 'shape', x: 680, y: 60, width: 340, height: 80,
        props: { fill: TEAL_BG, cornerRadius: 40 } },
      { id: 'badge-icon', type: 'shape', x: 700, y: 78, width: 40, height: 40,
        props: { fill: TEAL, cornerRadius: 20 } },
      { id: 'badge-text', type: 'text', x: 752, y: 80, width: 250, height: 40,
        props: { text: 'Borcelle', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'headline1', type: 'text', x: 500, y: 400, width: 520, height: 110,
        props: { text: 'Sua Saúde,', fontSize: 80, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'headline2', type: 'text', x: 500, y: 506, width: 520, height: 110,
        props: { text: 'Nossa', fontSize: 80, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'headline3', type: 'text', x: 500, y: 610, width: 520, height: 110,
        props: { text: 'Prioridade', fontSize: 80, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'right', fill: DARK, wrap: 'none', autoFit: true } },
      { id: 'teal-line', type: 'shape', x: 720, y: 760, width: 280, height: 5,
        props: { fill: TEAL, cornerRadius: 3 } },
      { id: 'subtitle', type: 'text', x: 500, y: 790, width: 520, height: 160,
        props: { text: '"Cuidado de confiança porque o seu bem-estar merece o melhor."', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'right', fill: MUTED, wrap: 'word' } },
      { id: 'phone-bg', type: 'shape', x: 600, y: 1780, width: 420, height: 90,
        props: { fill: TEAL_BG, cornerRadius: 22 } },
      { id: 'phone-label', type: 'text', x: 620, y: 1792, width: 380, height: 32,
        props: { text: 'Entrega Gratuita', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, wrap: 'none' } },
      { id: 'phone-number', type: 'text', x: 620, y: 1828, width: 380, height: 40,
        props: { text: '+55 (11) 9 9999-9999', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  return [hs4x5, hs1x1, hs9x16]
}
