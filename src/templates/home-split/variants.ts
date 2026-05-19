import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeHomeSplitVariants(theme: Theme): Template[] {
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.6)'
  const PANEL   = '#6b5a52'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const hs4x5: Template = {
    id: 'home-split-4x5',
    name: 'Painel Duplo — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: '#8a7060',
    elements: [
      // Painel escuro esquerdo
      { id: 'panel-left', type: 'shape', x: 0, y: 0, width: 520, height: 1350,
        props: { fill: PANEL, cornerRadius: 0 } },
      // Card arredondado sobre o painel (detalhe decorativo)
      { id: 'card-deco', type: 'shape', x: 40, y: 60, width: 420, height: 560,
        props: { fill: 'rgba(255,255,255,0.08)', cornerRadius: 24 } },
      // Headline grande
      { id: 'headline', type: 'text', x: 40, y: 200, width: 440, height: 520,
        props: { text: 'Seu lar, do jeito que você sempre sonhou.', fontSize: 90, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.05, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      // Palavra em bold dentro do headline — linha separada decorativa
      { id: 'highlight', type: 'shape', x: 40, y: 750, width: 120, height: 4,
        props: { fill: WHITE, cornerRadius: 2 } },
      // Descrição
      { id: 'desc-label', type: 'text', x: 40, y: 778, width: 440, height: 80,
        props: { text: 'Móveis planejados com acabamento impecável e medidas perfeitas.', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      // Linha divisória base
      { id: 'base-line', type: 'shape', x: 40, y: 1240, width: 440, height: 1,
        props: { fill: 'rgba(255,255,255,0.3)', cornerRadius: 0 } },
      // CTA base esquerdo
      { id: 'cta-label', type: 'text', x: 40, y: 1258, width: 300, height: 36,
        props: { text: 'Solicite o seu orçamento', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 1, wrap: 'none' } },
      { id: 'cta-phone', type: 'text', x: 40, y: 1292, width: 300, height: 44,
        props: { text: '(11) 9 9999-9999', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      // Handle direito base
      { id: 'handle', type: 'text', x: 580, y: 1300, width: 460, height: 36,
        props: { text: '@suamarca', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: 'rgba(255,255,255,0.5)', wrap: 'none' } },
    ],
  }

  const hs1x1: Template = {
    id: 'home-split-1x1',
    name: 'Painel Duplo — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: '#8a7060',
    elements: [
      { id: 'panel-left', type: 'shape', x: 0, y: 0, width: 480, height: 1080,
        props: { fill: PANEL, cornerRadius: 0 } },
      { id: 'card-deco', type: 'shape', x: 36, y: 50, width: 400, height: 440,
        props: { fill: 'rgba(255,255,255,0.08)', cornerRadius: 24 } },
      { id: 'headline', type: 'text', x: 36, y: 160, width: 408, height: 420,
        props: { text: 'Seu lar, do jeito que você sempre sonhou.', fontSize: 80, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.05, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'highlight', type: 'shape', x: 36, y: 610, width: 100, height: 4,
        props: { fill: WHITE, cornerRadius: 2 } },
      { id: 'desc-label', type: 'text', x: 36, y: 632, width: 408, height: 80,
        props: { text: 'Móveis planejados com acabamento impecável.', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'base-line', type: 'shape', x: 36, y: 980, width: 408, height: 1,
        props: { fill: 'rgba(255,255,255,0.3)', cornerRadius: 0 } },
      { id: 'cta-phone', type: 'text', x: 36, y: 1000, width: 380, height: 44,
        props: { text: '(11) 9 9999-9999', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'handle', type: 'text', x: 520, y: 1020, width: 520, height: 36,
        props: { text: '@suamarca', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: 'rgba(255,255,255,0.5)', wrap: 'none' } },
    ],
  }

  const hs9x16: Template = {
    id: 'home-split-9x16',
    name: 'Painel Duplo — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: '#8a7060',
    elements: [
      { id: 'panel-left', type: 'shape', x: 0, y: 0, width: 520, height: 1920,
        props: { fill: PANEL, cornerRadius: 0 } },
      { id: 'card-deco', type: 'shape', x: 40, y: 100, width: 430, height: 700,
        props: { fill: 'rgba(255,255,255,0.08)', cornerRadius: 24 } },
      { id: 'headline', type: 'text', x: 40, y: 280, width: 440, height: 660,
        props: { text: 'Seu lar, do jeito que você sempre sonhou.', fontSize: 110, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.05, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'highlight', type: 'shape', x: 40, y: 1060, width: 140, height: 4,
        props: { fill: WHITE, cornerRadius: 2 } },
      { id: 'desc-label', type: 'text', x: 40, y: 1086, width: 440, height: 120,
        props: { text: 'Móveis planejados com acabamento impecável e medidas perfeitas.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'base-line', type: 'shape', x: 40, y: 1780, width: 440, height: 1,
        props: { fill: 'rgba(255,255,255,0.3)', cornerRadius: 0 } },
      { id: 'cta-label', type: 'text', x: 40, y: 1800, width: 380, height: 40,
        props: { text: 'Solicite o seu orçamento', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'cta-phone', type: 'text', x: 40, y: 1844, width: 380, height: 50,
        props: { text: '(11) 9 9999-9999', fontSize: 32, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'handle', type: 'text', x: 560, y: 1856, width: 480, height: 40,
        props: { text: '@suamarca', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: 'rgba(255,255,255,0.5)', wrap: 'none' } },
    ],
  }

  return [hs4x5, hs1x1, hs9x16]
}
