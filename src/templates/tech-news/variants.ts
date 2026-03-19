import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Constantes base (1080px) ─────────────────────────────────────────────────
const M        = 60
const W_1080   = 1080 - M * 2   // 960px
const BLUE     = '#5B8FD4'
const BLACK    = '#0A0A0A'
const WHITE    = '#FFFFFF'
const ACCENT   = '#3A5AFF'

// Proporções zona foto / zona texto
// 1:1  → foto 60% = 648px  | texto 40% = 432px
// 4:5  → foto 60% = 810px  | texto 40% = 540px
// 9:16 → foto 55% = 1056px | texto 45% = 864px
// 16:9 → foto 60% = 648px  | texto 40% = 432px (igual 1:1, canvas mais largo)

export function makeTechNewsVariants(_theme: Theme): Template[] {

  // ─── 1:1 (1080×1080) ───────────────────────────────────────────────────────
  const SPLIT_1x1 = 648
  const techNews1x1: Template = {
    id: 'tech-news-1x1',
    name: 'Tech News — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BLACK,
    elements: [
      // Overlay escuro na zona inferior
      {
        id: 'overlay',
        type: 'shape',
        x: 0, y: SPLIT_1x1,
        width: 1080, height: 1080 - SPLIT_1x1,
        props: { fill: BLACK, cornerRadius: 0 },
      },
      // Categoria
      {
        id: 'category',
        type: 'text',
        x: M, y: SPLIT_1x1 + 22,
        width: W_1080, height: 36,
        props: {
          text: 'INTELIGÊNCIA ARTIFICIAL',
          fontSize: 22, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE, wrap: 'none',
          letterSpacing: 4,
        },
      },
      // Linha decorativa abaixo da categoria
      {
        id: 'category-line',
        type: 'shape',
        x: M, y: SPLIT_1x1 + 64,
        width: 80, height: 2,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      // Título principal
      {
        id: 'title',
        type: 'text',
        x: M, y: SPLIT_1x1 + 82,
        width: W_1080, height: 260,
        props: {
          text: 'NOVA ERA\nDA AUTOMAÇÃO',
          fontSize: 96, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      // Marca no rodapé
      {
        id: 'brand-line',
        type: 'shape',
        x: 500, y: 1057,
        width: 80, height: 3,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  // ─── 4:5 (1080×1350) ───────────────────────────────────────────────────────
  const SPLIT_4x5 = 810
  const techNews4x5: Template = {
    id: 'tech-news-4x5',
    name: 'Tech News — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BLACK,
    elements: [
      {
        id: 'overlay',
        type: 'shape',
        x: 0, y: SPLIT_4x5,
        width: 1080, height: 1350 - SPLIT_4x5,
        props: { fill: BLACK, cornerRadius: 0 },
      },
      {
        id: 'category',
        type: 'text',
        x: M, y: SPLIT_4x5 + 28,
        width: W_1080, height: 36,
        props: {
          text: 'INTELIGÊNCIA ARTIFICIAL',
          fontSize: 22, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE, wrap: 'none',
          letterSpacing: 4,
        },
      },
      {
        id: 'category-line',
        type: 'shape',
        x: M, y: SPLIT_4x5 + 70,
        width: 80, height: 2,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: M, y: SPLIT_4x5 + 88,
        width: W_1080, height: 280,
        props: {
          text: 'NOVA ERA\nDA AUTOMAÇÃO',
          fontSize: 96, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'brand-line',
        type: 'shape',
        x: 500, y: 1327,
        width: 80, height: 3,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  // ─── 9:16 (1080×1920) ───────────────────────────────────────────────────────
  const SPLIT_9x16 = 1056
  const techNews9x16: Template = {
    id: 'tech-news-9x16',
    name: 'Tech News — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BLACK,
    elements: [
      {
        id: 'overlay',
        type: 'shape',
        x: 0, y: SPLIT_9x16,
        width: 1080, height: 1920 - SPLIT_9x16,
        props: { fill: BLACK, cornerRadius: 0 },
      },
      {
        id: 'category',
        type: 'text',
        x: M, y: SPLIT_9x16 + 40,
        width: W_1080, height: 36,
        props: {
          text: 'INTELIGÊNCIA ARTIFICIAL',
          fontSize: 22, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE, wrap: 'none',
          letterSpacing: 4,
        },
      },
      {
        id: 'category-line',
        type: 'shape',
        x: M, y: SPLIT_9x16 + 86,
        width: 80, height: 2,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: M, y: SPLIT_9x16 + 104,
        width: W_1080, height: 400,
        props: {
          text: 'NOVA ERA\nDA AUTOMAÇÃO',
          fontSize: 120, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'brand-line',
        type: 'shape',
        x: 500, y: 1897,
        width: 80, height: 3,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  // ─── 16:9 (1920×1080) ───────────────────────────────────────────────────────
  const M_16x9  = 80
  const W_16x9  = 1920 - M_16x9 * 2
  const SPLIT_16x9 = 648
  const techNews16x9: Template = {
    id: 'tech-news-16x9',
    name: 'Tech News — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BLACK,
    elements: [
      {
        id: 'overlay',
        type: 'shape',
        x: 0, y: SPLIT_16x9,
        width: 1920, height: 1080 - SPLIT_16x9,
        props: { fill: BLACK, cornerRadius: 0 },
      },
      {
        id: 'category',
        type: 'text',
        x: M_16x9, y: SPLIT_16x9 + 22,
        width: W_16x9, height: 36,
        props: {
          text: 'INTELIGÊNCIA ARTIFICIAL',
          fontSize: 24, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE, wrap: 'none',
          letterSpacing: 4,
        },
      },
      {
        id: 'category-line',
        type: 'shape',
        x: M_16x9, y: SPLIT_16x9 + 66,
        width: 80, height: 2,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: M_16x9, y: SPLIT_16x9 + 84,
        width: W_16x9, height: 240,
        props: {
          text: 'NOVA ERA\nDA AUTOMAÇÃO',
          fontSize: 110, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'brand-line',
        type: 'shape',
        x: 920, y: 1057,
        width: 80, height: 3,
        props: { fill: ACCENT, cornerRadius: 0 },
      },
    ],
  }

  return [techNews1x1, techNews4x5, techNews9x16, techNews16x9]
}
