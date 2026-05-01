import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeFoodPromoVariants(theme: Theme): Template[] {
  const BG      = '#F7F3EE'
  const ACCENT  = theme.colors.accent
  const DARK    = '#1A1008'
  const MUTED   = '#888888'
  const WHITE   = '#FFFFFF'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  // ─── 1:1 (1080×1080) ──────────────────────────────────────────────────────
  const foodPromo1x1: Template = {
    id: 'food-promo-1x1',
    name: 'Food Promo — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'top-dot', type: 'shape', x: 60, y: 42, width: 10, height: 10,
        props: { fill: ACCENT, cornerRadius: 5 } },
      { id: 'cat', type: 'text', x: 60, y: 60, width: 960, height: 40,
        props: { text: 'PROMOÇÃO DO DIA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'dish', type: 'text', x: 60, y: 280, width: 960, height: 420,
        props: { text: 'NOME DO\nPRATO', fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 720, width: 960, height: 50,
        props: { text: 'Acompanhamentos e detalhes do prato', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'price', type: 'text', x: 60, y: 860, width: 500, height: 100,
        props: { text: 'R$ 00,00', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta-bg', type: 'shape', x: 60, y: 990, width: 280, height: 52,
        props: { fill: ACCENT, cornerRadius: 6 } },
      { id: 'cta', type: 'text', x: 60, y: 1002, width: 280, height: 30,
        props: { text: 'PEÇA AGORA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
    ],
  }

  // ─── 4:5 (1080×1350) ──────────────────────────────────────────────────────
  const foodPromo4x5: Template = {
    id: 'food-promo-4x5',
    name: 'Food Promo — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'top-dot', type: 'shape', x: 60, y: 42, width: 10, height: 10,
        props: { fill: ACCENT, cornerRadius: 5 } },
      { id: 'cat', type: 'text', x: 60, y: 60, width: 960, height: 40,
        props: { text: 'PROMOÇÃO DO DIA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'dish', type: 'text', x: 60, y: 380, width: 960, height: 520,
        props: { text: 'NOME DO\nPRATO', fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 940, width: 960, height: 50,
        props: { text: 'Acompanhamentos e detalhes do prato', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'price', type: 'text', x: 60, y: 1080, width: 500, height: 100,
        props: { text: 'R$ 00,00', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta-bg', type: 'shape', x: 60, y: 1252, width: 280, height: 52,
        props: { fill: ACCENT, cornerRadius: 6 } },
      { id: 'cta', type: 'text', x: 60, y: 1264, width: 280, height: 30,
        props: { text: 'PEÇA AGORA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
    ],
  }

  // ─── 9:16 (1080×1920) ──────────────────────────────────────────────────────
  const foodPromo9x16: Template = {
    id: 'food-promo-9x16',
    name: 'Food Promo — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'top-dot', type: 'shape', x: 60, y: 62, width: 10, height: 10,
        props: { fill: ACCENT, cornerRadius: 5 } },
      { id: 'cat', type: 'text', x: 60, y: 80, width: 960, height: 40,
        props: { text: 'PROMOÇÃO DO DIA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'dish', type: 'text', x: 60, y: 620, width: 960, height: 680,
        props: { text: 'NOME DO\nPRATO', fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 1350, width: 960, height: 50,
        props: { text: 'Acompanhamentos e detalhes do prato', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'price', type: 'text', x: 60, y: 1520, width: 500, height: 100,
        props: { text: 'R$ 00,00', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta-bg', type: 'shape', x: 60, y: 1764, width: 280, height: 52,
        props: { fill: ACCENT, cornerRadius: 6 } },
      { id: 'cta', type: 'text', x: 60, y: 1776, width: 280, height: 30,
        props: { text: 'PEÇA AGORA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
    ],
  }


  const foodPromo16x9: Template = {
    id: 'food-promo-16x9',
    name: 'Food Promo — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 100, y: 60, width: 1000, height: 30,
        props: { text: 'PROMOCAO DO DIA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'top-dot', type: 'shape', x: 100, y: 108, width: 10, height: 10,
        props: { fill: ACCENT, cornerRadius: 5 } },
      { id: 'dish', type: 'text', x: 100, y: 280, width: 860, height: 440,
        props: { text: 'NOME DO
PRATO', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 1060, y: 280, width: 760, height: 100,
        props: { text: 'Acompanhamentos e detalhes do prato', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.5, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'price', type: 'text', x: 1060, y: 440, width: 760, height: 120,
        props: { text: 'R$ 00,00', fontSize: 80, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta-bg', type: 'shape', x: 1060, y: 620, width: 280, height: 52,
        props: { fill: ACCENT, cornerRadius: 6 } },
      { id: 'cta', type: 'text', x: 1060, y: 632, width: 280, height: 30,
        props: { text: 'PECA AGORA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
    ],
  }

  return [foodPromo1x1, foodPromo4x5, foodPromo9x16, foodPromo16x9]
}
