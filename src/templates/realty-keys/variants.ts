import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeRealtyKeysVariants(theme: Theme): Template[] {
  const DARK    = '#1a3318'
  const BTN_BG  = '#e8ead4'
  const BODY    = theme.fonts.body

  const rk4x5: Template = {
    id: 'realty-keys-4x5',
    name: 'Chave na Mão — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: '#d4d0c8',
    elements: [
      // Headline itálico grande
      { id: 'headline', type: 'text', x: 60, y: 100, width: 700, height: 600,
        props: { text: 'Temos o imóvel que você procura!', fontSize: 110, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', lineHeight: 1.1, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      // Label CTA
      { id: 'cta-label', type: 'text', x: 60, y: 820, width: 500, height: 50,
        props: { text: 'Entre em contato!', fontSize: 32, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      // Botão oval com telefone
      { id: 'btn-bg', type: 'shape', x: 60, y: 890, width: 500, height: 80,
        props: { fill: BTN_BG, cornerRadius: 40, stroke: DARK, strokeWidth: 2 } },
      // Ícone telefone simulado
      { id: 'btn-icon', type: 'shape', x: 90, y: 915, width: 30, height: 30,
        props: { fill: DARK, cornerRadius: 15 } },
      { id: 'btn-phone', type: 'text', x: 130, y: 908, width: 400, height: 48,
        props: { text: '(12) 3456-7890', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      // Handle base
      { id: 'handle', type: 'text', x: 60, y: 1280, width: 960, height: 44,
        props: { text: '@suamarca', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  const rk1x1: Template = {
    id: 'realty-keys-1x1',
    name: 'Chave na Mão — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: '#d4d0c8',
    elements: [
      { id: 'headline', type: 'text', x: 60, y: 80, width: 700, height: 500,
        props: { text: 'Temos o imóvel que você procura!', fontSize: 100, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', lineHeight: 1.1, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'cta-label', type: 'text', x: 60, y: 660, width: 500, height: 46,
        props: { text: 'Entre em contato!', fontSize: 30, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'btn-bg', type: 'shape', x: 60, y: 722, width: 480, height: 76,
        props: { fill: BTN_BG, cornerRadius: 38, stroke: DARK, strokeWidth: 2 } },
      { id: 'btn-icon', type: 'shape', x: 88, y: 745, width: 28, height: 28,
        props: { fill: DARK, cornerRadius: 14 } },
      { id: 'btn-phone', type: 'text', x: 126, y: 740, width: 390, height: 44,
        props: { text: '(12) 3456-7890', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'handle', type: 'text', x: 60, y: 1016, width: 960, height: 40,
        props: { text: '@suamarca', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  const rk9x16: Template = {
    id: 'realty-keys-9x16',
    name: 'Chave na Mão — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: '#d4d0c8',
    elements: [
      { id: 'headline', type: 'text', x: 60, y: 200, width: 700, height: 800,
        props: { text: 'Temos o imóvel que você procura!', fontSize: 130, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', lineHeight: 1.1, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'cta-label', type: 'text', x: 60, y: 1160, width: 600, height: 56,
        props: { text: 'Entre em contato!', fontSize: 36, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'btn-bg', type: 'shape', x: 60, y: 1236, width: 560, height: 88,
        props: { fill: BTN_BG, cornerRadius: 44, stroke: DARK, strokeWidth: 2 } },
      { id: 'btn-icon', type: 'shape', x: 92, y: 1260, width: 34, height: 34,
        props: { fill: DARK, cornerRadius: 17 } },
      { id: 'btn-phone', type: 'text', x: 138, y: 1254, width: 460, height: 54,
        props: { text: '(12) 3456-7890', fontSize: 34, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'handle', type: 'text', x: 60, y: 1844, width: 960, height: 50,
        props: { text: '@suamarca', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: DARK, wrap: 'none' } },
    ],
  }

  return [rk4x5, rk1x1, rk9x16]
}
