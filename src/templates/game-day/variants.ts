import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeGameDayVariants(theme: Theme): Template[] {
  const BG      = '#0A0A0A'
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = '#888888'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  // ─── 1:1 (1080×1080) ──────────────────────────────────────────────────────
  const gameDay1x1: Template = {
    id: 'game-day-1x1',
    name: 'Game Day — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      // Barra topo (acento primário)
      {
        id: 'top-bar',
        type: 'shape',
        x: 0, y: 0,
        width: 1080, height: 6,
        props: { fill: PRIMARY, cornerRadius: 0 },
      },
      // Tag / categoria
      {
        id: 'tag',
        type: 'text',
        x: 60, y: 80,
        width: 960, height: 40,
        props: {
          text: 'CAMPEONATO PAULISTA',
          fontSize: 22, fontFamily: BODY,
          fontStyle: 'normal', lineHeight: 1,
          align: 'left', fill: PRIMARY,
          letterSpacing: 6, wrap: 'none',
        },
      },
      // Linha separadora
      {
        id: 'tag-line',
        type: 'shape',
        x: 60, y: 136,
        width: 60, height: 3,
        props: { fill: PRIMARY, cornerRadius: 0 },
      },
      // Título principal
      {
        id: 'title',
        type: 'text',
        x: 60, y: 200,
        width: 960, height: 480,
        props: {
          text: 'É FINAL,\nINDAIÁ!',
          fontSize: 180, fontFamily: HEADING,
          fontStyle: 'bold', lineHeight: 0.95,
          align: 'left', fill: WHITE,
          wrap: 'word', autoFit: true,
        },
      },
      // Subtítulo / detalhe do evento
      {
        id: 'subtitle',
        type: 'text',
        x: 60, y: 920,
        width: 960, height: 60,
        props: {
          text: 'Pré-infantil · Sábado 15h · Arena Central',
          fontSize: 28, fontFamily: BODY,
          fontStyle: 'normal', lineHeight: 1.4,
          align: 'left', fill: MUTED,
          wrap: 'word',
        },
      },
      // Barra rodapé
      {
        id: 'bottom-bar',
        type: 'shape',
        x: 0, y: 1074,
        width: 1080, height: 6,
        props: { fill: PRIMARY, cornerRadius: 0 },
      },
    ],
  }

  // ─── 4:5 (1080×1350) ──────────────────────────────────────────────────────
  const gameDay4x5: Template = {
    id: 'game-day-4x5',
    name: 'Game Day — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 100, width: 960, height: 40,
        props: { text: 'CAMPEONATO PAULISTA', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 6, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 156, width: 60, height: 3, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 240, width: 960, height: 600,
        props: { text: 'É FINAL,\nINDAIÁ!', fontSize: 200, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 960, width: 960, height: 60,
        props: { text: 'Pré-infantil · Sábado 15h · Arena Central', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'bottom-bar', type: 'shape', x: 0, y: 1344, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
    ],
  }

  // ─── 9:16 (1080×1920) ──────────────────────────────────────────────────────
  const gameDay9x16: Template = {
    id: 'game-day-9x16',
    name: 'Game Day — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 120, width: 960, height: 40,
        props: { text: 'CAMPEONATO PAULISTA', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 6, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 60, y: 176, width: 60, height: 3, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 700, width: 960, height: 600,
        props: { text: 'É FINAL,\nINDAIÁ!', fontSize: 200, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 1400, width: 960, height: 60,
        props: { text: 'Pré-infantil · Sábado 15h · Arena Central', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'bottom-bar', type: 'shape', x: 0, y: 1914, width: 1080, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
    ],
  }

  // ─── 16:9 (1920×1080) ──────────────────────────────────────────────────────
  const gameDay16x9: Template = {
    id: 'game-day-16x9',
    name: 'Game Day — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 1920, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 100, y: 100, width: 1720, height: 40,
        props: { text: 'CAMPEONATO PAULISTA', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 6, wrap: 'none' } },
      { id: 'tag-line', type: 'shape', x: 100, y: 156, width: 60, height: 3, props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 100, y: 220, width: 1720, height: 480,
        props: { text: 'É FINAL, INDAIÁ!', fontSize: 220, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 100, y: 780, width: 1720, height: 60,
        props: { text: 'Pré-infantil · Sábado 15h · Arena Central', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'bottom-bar', type: 'shape', x: 0, y: 1074, width: 1920, height: 6, props: { fill: PRIMARY, cornerRadius: 0 } },
    ],
  }

  return [gameDay1x1, gameDay4x5, gameDay9x16, gameDay16x9]
}
