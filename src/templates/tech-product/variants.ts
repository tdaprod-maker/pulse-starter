import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

const BG      = '#080C14'
const BLUE    = '#3A5AFF'
const BLUE_L  = '#5B8FD4'
const WHITE   = '#FFFFFF'
const WHITE70 = 'rgba(255,255,255,0.7)'

export function makeTechProductVariants(_theme: Theme): Template[] {

  // ─── 1:1 (1080×1080) ───────────────────────────────────────────────────────
  const techProduct1x1: Template = {
    id: 'tech-product-1x1',
    name: 'Tech Product — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      // Faixa vertical esquerda
      {
        id: 'accent-strip',
        type: 'shape',
        x: 0, y: 0,
        width: 6, height: 1080,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      // Tag / categoria
      {
        id: 'tag',
        type: 'text',
        x: 80, y: 120,
        width: 920, height: 40,
        props: {
          text: 'AGENTE DE IA',
          fontSize: 20, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
          letterSpacing: 3,
        },
      },
      // Nome do produto
      {
        id: 'title',
        type: 'text',
        x: 80, y: 200,
        width: 920, height: 220,
        props: {
          text: 'PULSE AI',
          fontSize: 110, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.0,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      // Descrição
      {
        id: 'subtitle',
        type: 'text',
        x: 80, y: 430,
        width: 820, height: 90,
        props: {
          text: 'Automatize seus posts com inteligência artificial em segundos.',
          fontSize: 28, fontFamily: 'Inter, sans-serif',
          fontStyle: 'normal', lineHeight: 1.4,
          align: 'left', fill: WHITE70,
          wrap: 'word',
        },
      },
      // Linha de acento horizontal
      {
        id: 'accent-line',
        type: 'shape',
        x: 80, y: 540,
        width: 120, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      // CTA
      {
        id: 'cta',
        type: 'text',
        x: 80, y: 564,
        width: 920, height: 50,
        props: {
          text: 'Conheça agora →',
          fontSize: 22, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
        },
      },
    ],
  }

  // ─── 4:5 (1080×1350) ───────────────────────────────────────────────────────
  const techProduct4x5: Template = {
    id: 'tech-product-4x5',
    name: 'Tech Product — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      {
        id: 'accent-strip',
        type: 'shape',
        x: 0, y: 0,
        width: 6, height: 1350,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'tag',
        type: 'text',
        x: 80, y: 180,
        width: 920, height: 40,
        props: {
          text: 'AGENTE DE IA',
          fontSize: 20, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
          letterSpacing: 3,
        },
      },
      {
        id: 'title',
        type: 'text',
        x: 80, y: 260,
        width: 920, height: 220,
        props: {
          text: 'PULSE AI',
          fontSize: 110, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.0,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'subtitle',
        type: 'text',
        x: 80, y: 500,
        width: 820, height: 90,
        props: {
          text: 'Automatize seus posts com inteligência artificial em segundos.',
          fontSize: 28, fontFamily: 'Inter, sans-serif',
          fontStyle: 'normal', lineHeight: 1.4,
          align: 'left', fill: WHITE70,
          wrap: 'word',
        },
      },
      {
        id: 'accent-line',
        type: 'shape',
        x: 80, y: 610,
        width: 120, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'cta',
        type: 'text',
        x: 80, y: 634,
        width: 920, height: 50,
        props: {
          text: 'Conheça agora →',
          fontSize: 22, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
        },
      },
    ],
  }

  // ─── 9:16 (1080×1920) ───────────────────────────────────────────────────────
  const techProduct9x16: Template = {
    id: 'tech-product-9x16',
    name: 'Tech Product — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      {
        id: 'accent-strip',
        type: 'shape',
        x: 0, y: 0,
        width: 6, height: 1920,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'tag',
        type: 'text',
        x: 80, y: 300,
        width: 920, height: 50,
        props: {
          text: 'AGENTE DE IA',
          fontSize: 22, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
          letterSpacing: 3,
        },
      },
      {
        id: 'title',
        type: 'text',
        x: 80, y: 400,
        width: 920, height: 280,
        props: {
          text: 'PULSE AI',
          fontSize: 140, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.0,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'subtitle',
        type: 'text',
        x: 80, y: 700,
        width: 820, height: 120,
        props: {
          text: 'Automatize seus posts com inteligência artificial em segundos.',
          fontSize: 32, fontFamily: 'Inter, sans-serif',
          fontStyle: 'normal', lineHeight: 1.4,
          align: 'left', fill: WHITE70,
          wrap: 'word',
        },
      },
      {
        id: 'accent-line',
        type: 'shape',
        x: 80, y: 840,
        width: 120, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'cta',
        type: 'text',
        x: 80, y: 866,
        width: 920, height: 60,
        props: {
          text: 'Conheça agora →',
          fontSize: 26, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
        },
      },
    ],
  }

  // ─── 16:9 (1920×1080) ───────────────────────────────────────────────────────
  const techProduct16x9: Template = {
    id: 'tech-product-16x9',
    name: 'Tech Product — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      {
        id: 'accent-strip',
        type: 'shape',
        x: 0, y: 0,
        width: 6, height: 1080,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'tag',
        type: 'text',
        x: 100, y: 120,
        width: 1720, height: 40,
        props: {
          text: 'AGENTE DE IA',
          fontSize: 22, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
          letterSpacing: 3,
        },
      },
      {
        id: 'title',
        type: 'text',
        x: 100, y: 200,
        width: 1720, height: 240,
        props: {
          text: 'PULSE AI',
          fontSize: 160, fontFamily: 'Bebas Neue, cursive',
          fontStyle: 'normal', lineHeight: 1.0,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'subtitle',
        type: 'text',
        x: 100, y: 460,
        width: 1200, height: 90,
        props: {
          text: 'Automatize seus posts com inteligência artificial em segundos.',
          fontSize: 30, fontFamily: 'Inter, sans-serif',
          fontStyle: 'normal', lineHeight: 1.4,
          align: 'left', fill: WHITE70,
          wrap: 'word',
        },
      },
      {
        id: 'accent-line',
        type: 'shape',
        x: 100, y: 570,
        width: 120, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
      {
        id: 'cta',
        type: 'text',
        x: 100, y: 596,
        width: 1720, height: 50,
        props: {
          text: 'Conheça agora →',
          fontSize: 24, fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold', align: 'left',
          fill: BLUE_L, wrap: 'none',
        },
      },
    ],
  }

  return [techProduct1x1, techProduct4x5, techProduct9x16, techProduct16x9]
}
