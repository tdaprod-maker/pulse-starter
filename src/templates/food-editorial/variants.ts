import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeFoodEditorialVariants(theme: Theme): Template[] {
  const BG      = '#0F0A05'
  const ACCENT  = theme.colors.accent
  const CREAM   = '#F5EDD9'
  const MUTED   = 'rgba(255,255,255,0.4)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  // ─── 1:1 (1080×1080) ──────────────────────────────────────────────────────
  const foodEd1x1: Template = {
    id: 'food-editorial-1x1',
    name: 'Food Editorial — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'label', type: 'text', x: 60, y: 60, width: 400, height: 40,
        props: { text: 'PRATO PRINCIPAL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'label-line', type: 'shape', x: 60, y: 106, width: 40, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'dish', type: 'text', x: 60, y: 680, width: 960, height: 320,
        props: { text: 'Nome do\nPrato', fontSize: 120, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.1, align: 'left', fill: CREAM, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 1010, width: 60, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'price', type: 'text', x: 60, y: 1022, width: 300, height: 48,
        props: { text: 'R$ 00,00', fontSize: 36, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: 380, y: 1032, width: 280, height: 30,
        props: { text: 'PEÇA AGORA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
    ],
  }

  // ─── 4:5 (1080×1350) ──────────────────────────────────────────────────────
  const foodEd4x5: Template = {
    id: 'food-editorial-4x5',
    name: 'Food Editorial — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'label', type: 'text', x: 60, y: 60, width: 400, height: 40,
        props: { text: 'PRATO PRINCIPAL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'label-line', type: 'shape', x: 60, y: 106, width: 40, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'dish', type: 'text', x: 60, y: 860, width: 960, height: 380,
        props: { text: 'Nome do\nPrato', fontSize: 120, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.1, align: 'left', fill: CREAM, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 1252, width: 60, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'price', type: 'text', x: 60, y: 1264, width: 300, height: 48,
        props: { text: 'R$ 00,00', fontSize: 36, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: 380, y: 1274, width: 280, height: 30,
        props: { text: 'PEÇA AGORA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
    ],
  }

  // ─── 9:16 (1080×1920) ──────────────────────────────────────────────────────
  const foodEd9x16: Template = {
    id: 'food-editorial-9x16',
    name: 'Food Editorial — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'label', type: 'text', x: 60, y: 60, width: 400, height: 40,
        props: { text: 'PRATO PRINCIPAL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'label-line', type: 'shape', x: 60, y: 106, width: 40, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'dish', type: 'text', x: 60, y: 1320, width: 960, height: 480,
        props: { text: 'Nome do\nPrato', fontSize: 120, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.1, align: 'left', fill: CREAM, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 60, y: 1810, width: 60, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'price', type: 'text', x: 60, y: 1822, width: 300, height: 48,
        props: { text: 'R$ 00,00', fontSize: 36, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: 380, y: 1834, width: 280, height: 30,
        props: { text: 'PEÇA AGORA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
    ],
  }

  // ─── 16:9 (1920×1080) ──────────────────────────────────────────────────────
  const foodEd16x9: Template = {
    id: 'food-editorial-16x9',
    name: 'Food Editorial — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'label', type: 'text', x: 100, y: 60, width: 600, height: 40,
        props: { text: 'PRATO PRINCIPAL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 5, wrap: 'none' } },
      { id: 'label-line', type: 'shape', x: 100, y: 106, width: 40, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'dish', type: 'text', x: 100, y: 660, width: 1720, height: 340,
        props: { text: 'Nome do\nPrato', fontSize: 120, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.1, align: 'left', fill: CREAM, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 100, y: 1012, width: 60, height: 1,
        props: { fill: ACCENT, cornerRadius: 0 } },
      { id: 'price', type: 'text', x: 100, y: 1024, width: 400, height: 48,
        props: { text: 'R$ 00,00', fontSize: 36, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: 560, y: 1034, width: 400, height: 30,
        props: { text: 'PEÇA AGORA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
    ],
  }

  return [foodEd1x1, foodEd4x5, foodEd9x16, foodEd16x9]
}
