import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeSplitEditorialVariants(theme: Theme): Template[] {
  const BG      = '#F5F5F0'
  const PRIMARY = theme.colors.accent
  const DARK    = '#0C0C0D'
  const MUTED   = 'rgba(12,12,13,0.5)'
  const WHITE   = '#FFFFFF'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const split1x1: Template = {
    id: 'split-editorial-1x1',
    name: 'Split Editorial — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      // Metade superior escura
      { id: 'top-block', type: 'shape', x: 0, y: 0, width: 1080, height: 520,
        props: { fill: DARK, cornerRadius: 0 } },
      // Badge no topo
      { id: 'badge-bg', type: 'shape', x: 60, y: 60, width: 180, height: 36,
        props: { fill: PRIMARY, cornerRadius: 18 } },
      { id: 'badge', type: 'text', x: 60, y: 68, width: 180, height: 24,
        props: { text: 'DICAS', fontSize: 14, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
      // Número grande decorativo
      { id: 'number', type: 'text', x: 60, y: 120, width: 400, height: 320,
        props: { text: '5', fontSize: 320, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: 'rgba(255,255,255,0.08)', wrap: 'none' } },
      // Título na área escura
      { id: 'title', type: 'text', x: 60, y: 300, width: 960, height: 200,
        props: { text: 'Como Melhorar\nSua Produtividade', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      // Linha divisória
      { id: 'divider', type: 'shape', x: 0, y: 518, width: 1080, height: 4,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      // Corpo na área clara
      { id: 'body', type: 'text', x: 60, y: 560, width: 960, height: 200,
        props: { text: 'Pequenos ajustes diários podem transformar completamente sua rotina. Descubra as estratégias que realmente funcionam.', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.6, align: 'left', fill: MUTED, wrap: 'word' } },
      // CTA
      { id: 'cta', type: 'text', x: 60, y: 800, width: 400, height: 50,
        props: { text: 'SAIBA MAIS →', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 2, wrap: 'none' } },
      // Linha CTA
      { id: 'cta-line', type: 'shape', x: 60, y: 852, width: 160, height: 2,
        props: { fill: PRIMARY, cornerRadius: 1 } },
      // Contador
      { id: 'counter', type: 'text', x: 60, y: 1000, width: 960, height: 30,
        props: { text: '[P.01/05]', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
    ],
  }

  const split4x5: Template = {
    id: 'split-editorial-4x5',
    name: 'Split Editorial — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'top-block', type: 'shape', x: 0, y: 0, width: 1080, height: 660,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'badge-bg', type: 'shape', x: 60, y: 60, width: 180, height: 36,
        props: { fill: PRIMARY, cornerRadius: 18 } },
      { id: 'badge', type: 'text', x: 60, y: 68, width: 180, height: 24,
        props: { text: 'DICAS', fontSize: 14, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
      { id: 'number', type: 'text', x: 60, y: 120, width: 400, height: 320,
        props: { text: '5', fontSize: 320, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: 'rgba(255,255,255,0.08)', wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 380, width: 960, height: 260,
        props: { text: 'Como Melhorar\nSua Produtividade', fontSize: 80, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 0, y: 658, width: 1080, height: 4,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 700, width: 960, height: 260,
        props: { text: 'Pequenos ajustes diários podem transformar completamente sua rotina. Descubra as estratégias que realmente funcionam.', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.6, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 60, y: 1020, width: 400, height: 50,
        props: { text: 'SAIBA MAIS →', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 2, wrap: 'none' } },
      { id: 'cta-line', type: 'shape', x: 60, y: 1072, width: 160, height: 2,
        props: { fill: PRIMARY, cornerRadius: 1 } },
      { id: 'counter', type: 'text', x: 60, y: 1280, width: 960, height: 30,
        props: { text: '[P.01/05]', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
    ],
  }

  const split9x16: Template = {
    id: 'split-editorial-9x16',
    name: 'Split Editorial — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'top-block', type: 'shape', x: 0, y: 0, width: 1080, height: 960,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'badge-bg', type: 'shape', x: 60, y: 80, width: 180, height: 36,
        props: { fill: PRIMARY, cornerRadius: 18 } },
      { id: 'badge', type: 'text', x: 60, y: 88, width: 180, height: 24,
        props: { text: 'DICAS', fontSize: 14, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
      { id: 'number', type: 'text', x: 60, y: 160, width: 500, height: 400,
        props: { text: '5', fontSize: 400, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'left', fill: 'rgba(255,255,255,0.08)', wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 580, width: 960, height: 360,
        props: { text: 'Como Melhorar\nSua Produtividade', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.1, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 0, y: 958, width: 1080, height: 4,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'body', type: 'text', x: 60, y: 1020, width: 960, height: 400,
        props: { text: 'Pequenos ajustes diários podem transformar completamente sua rotina. Descubra as estratégias que realmente funcionam.', fontSize: 36, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.6, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 60, y: 1500, width: 400, height: 50,
        props: { text: 'SAIBA MAIS →', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 2, wrap: 'none' } },
      { id: 'cta-line', type: 'shape', x: 60, y: 1552, width: 160, height: 2,
        props: { fill: PRIMARY, cornerRadius: 1 } },
      { id: 'counter', type: 'text', x: 60, y: 1840, width: 960, height: 40,
        props: { text: '[P.01/05]', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
    ],
  }

  return [split1x1, split4x5, split9x16]
}
