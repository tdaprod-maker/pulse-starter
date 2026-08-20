import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Apetitosa — variação vibrante (delivery/casual). Fundo de cor
// saturada única (coral-vermelho) com um gradiente radial real e sutil atrás
// do texto (efeito "spotlight" sem clichê de glow). Se o usuário adicionar uma
// foto do prato, ela substitui o fundo normalmente (mesmo comportamento de
// qualquer outro template com backgroundImage) — este estado sólido é o
// "pronto para publicar" sem foto, para posts tipográficos de promoção/preço.
const BASE   = '#E8452F'
const SPOT   = '#F05A3F'
const TEXT   = '#FFF8F0'
const CHIP   = '#1A1410'
const HEADING = 'Space Grotesk, sans-serif'
const BODY    = 'DM Sans, sans-serif'
const MARGIN  = 100

function spotlight(width: number, height: number, cx: number, cy: number, radius: number) {
  return {
    id: 'spotlight', type: 'shape' as const, x: 0, y: 0, width, height,
    props: {
      fillRadialGradientColorStops: [0, SPOT, 1, BASE],
      fillRadialGradientStartPoint: { x: cx, y: cy },
      fillRadialGradientEndPoint: { x: cx, y: cy },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: radius,
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeFoodVividVariants(_theme: Theme): Template[] {
  const w = 1080 - MARGIN * 2

  const fv4x5: Template = {
    id: 'food-vivid-4x5',
    name: 'Apetitosa Vibrante — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BASE,
    elements: [
      spotlight(1080, 1350, 540, 560, 780),
      { id: 'category', type: 'text', x: MARGIN, y: 140, width: w, height: 28,
        props: { text: 'HAMBÚRGUER ARTESANAL', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'dish', type: 'text', x: MARGIN, y: 190, width: w, height: 340,
        props: { text: 'Smash\nDuplo', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'price-chip', type: 'shape', x: MARGIN, y: 1150, width: 260, height: 90,
        props: { fill: CHIP, cornerRadius: 16 } },
      { id: 'price', type: 'text', x: MARGIN + 40, y: 1175, width: 200, height: 50,
        props: { text: 'R$ 34,90', fontSize: 30, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: 420, y: 1195, width: 560, height: 34,
        props: { text: 'Peça agora →', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
    ],
  }

  const fv1x1: Template = {
    id: 'food-vivid-1x1',
    name: 'Apetitosa Vibrante — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BASE,
    elements: [
      spotlight(1080, 1080, 540, 480, 650),
      { id: 'category', type: 'text', x: MARGIN, y: 120, width: w, height: 26,
        props: { text: 'HAMBÚRGUER ARTESANAL', fontSize: 18, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'dish', type: 'text', x: MARGIN, y: 165, width: w, height: 300,
        props: { text: 'Smash\nDuplo', fontSize: 88, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'price-chip', type: 'shape', x: MARGIN, y: 860, width: 240, height: 80,
        props: { fill: CHIP, cornerRadius: 14 } },
      { id: 'price', type: 'text', x: MARGIN + 36, y: 882, width: 180, height: 44,
        props: { text: 'R$ 34,90', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: 380, y: 890, width: 600, height: 30,
        props: { text: 'Peça agora →', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
    ],
  }

  const fv9x16: Template = {
    id: 'food-vivid-9x16',
    name: 'Apetitosa Vibrante — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BASE,
    elements: [
      spotlight(1080, 1920, 540, 860, 950),
      { id: 'category', type: 'text', x: MARGIN, y: 460, width: w, height: 30,
        props: { text: 'HAMBÚRGUER ARTESANAL', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, letterSpacing: 3, wrap: 'none' } },
      { id: 'dish', type: 'text', x: MARGIN, y: 510, width: w, height: 380,
        props: { text: 'Smash\nDuplo', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: TEXT, wrap: 'word', autoFit: true } },
      { id: 'price-chip', type: 'shape', x: MARGIN, y: 1650, width: 280, height: 100,
        props: { fill: CHIP, cornerRadius: 18 } },
      { id: 'price', type: 'text', x: MARGIN + 40, y: 1678, width: 220, height: 54,
        props: { text: 'R$ 34,90', fontSize: 34, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
      { id: 'cta', type: 'text', x: 460, y: 1698, width: 520, height: 40,
        props: { text: 'Peça agora →', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: TEXT, wrap: 'none' } },
    ],
  }

  return [fv4x5, fv1x1, fv9x16]
}
