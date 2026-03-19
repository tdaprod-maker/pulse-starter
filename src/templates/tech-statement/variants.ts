import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

const BLACK   = '#000000'
const WHITE   = '#FFFFFF'
const BLUE    = '#3A5AFF'
const FONT    = 'Bebas Neue, cursive'

// Centro óptico: sobe ~5% do centro geométrico
const opticalCenter = (canvasH: number, blockH: number) =>
  Math.round((canvasH - blockH) / 2) - Math.round(canvasH * 0.04)

export function makeTechStatementVariants(_theme: Theme): Template[] {

  // ─── 1:1 (1080×1080) ───────────────────────────────────────────────────────
  const PHRASE_H_1x1 = 400
  const PY_1x1 = opticalCenter(1080, PHRASE_H_1x1)  // ~296
  const techStatement1x1: Template = {
    id: 'tech-statement-1x1',
    name: 'Tech Statement — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BLACK,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: 60, y: PY_1x1,
        width: 960, height: PHRASE_H_1x1,
        props: {
          text: 'AUTOMATIZE\nOU FIQUE\nPARA TRÁS.',
          fontSize: 120, fontFamily: FONT,
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'center', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'brand-line',
        type: 'shape',
        x: 500, y: 1057,
        width: 80, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
    ],
  }

  // ─── 4:5 (1080×1350) ───────────────────────────────────────────────────────
  const PHRASE_H_4x5 = 400
  const PY_4x5 = opticalCenter(1350, PHRASE_H_4x5)  // ~421
  const techStatement4x5: Template = {
    id: 'tech-statement-4x5',
    name: 'Tech Statement — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BLACK,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: 60, y: PY_4x5,
        width: 960, height: PHRASE_H_4x5,
        props: {
          text: 'AUTOMATIZE\nOU FIQUE\nPARA TRÁS.',
          fontSize: 120, fontFamily: FONT,
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'center', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'brand-line',
        type: 'shape',
        x: 500, y: 1327,
        width: 80, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
    ],
  }

  // ─── 9:16 (1080×1920) ───────────────────────────────────────────────────────
  const PHRASE_H_9x16 = 500
  const PY_9x16 = opticalCenter(1920, PHRASE_H_9x16)  // ~633
  const techStatement9x16: Template = {
    id: 'tech-statement-9x16',
    name: 'Tech Statement — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BLACK,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: 60, y: PY_9x16,
        width: 960, height: PHRASE_H_9x16,
        props: {
          text: 'AUTOMATIZE\nOU FIQUE\nPARA TRÁS.',
          fontSize: 140, fontFamily: FONT,
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'center', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'brand-line',
        type: 'shape',
        x: 500, y: 1897,
        width: 80, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
    ],
  }

  // ─── 16:9 (1920×1080) ───────────────────────────────────────────────────────
  const PHRASE_H_16x9 = 440
  const PY_16x9 = opticalCenter(1080, PHRASE_H_16x9)  // ~276
  const techStatement16x9: Template = {
    id: 'tech-statement-16x9',
    name: 'Tech Statement — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BLACK,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: 120, y: PY_16x9,
        width: 1680, height: PHRASE_H_16x9,
        props: {
          text: 'AUTOMATIZE\nOU FIQUE PARA TRÁS.',
          fontSize: 160, fontFamily: FONT,
          fontStyle: 'normal', lineHeight: 1.05,
          align: 'center', fill: WHITE,
          wrap: 'word', autoFit: false,
        },
      },
      {
        id: 'brand-line',
        type: 'shape',
        x: 920, y: 1057,
        width: 80, height: 3,
        props: { fill: BLUE, cornerRadius: 0 },
      },
    ],
  }

  return [techStatement1x1, techStatement4x5, techStatement9x16, techStatement16x9]
}
