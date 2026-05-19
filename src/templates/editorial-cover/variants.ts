import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeEditorialCoverVariants(theme: Theme): Template[] {
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.5)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const ec1x1: Template = {
    id: 'editorial-cover-1x1',
    name: 'Editorial Cover — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: '#1a1a1a',
    elements: [
      // Overlay escuro no topo
      { id: 'overlay-top', type: 'shape', x: 0, y: 0, width: 1080, height: 200,
        props: { fill: 'rgba(0,0,0,0.5)', cornerRadius: 0 } },
      // Overlay escuro na base
      { id: 'overlay-bottom', type: 'shape', x: 0, y: 700, width: 1080, height: 380,
        props: { fill: 'rgba(0,0,0,0.65)', cornerRadius: 0 } },
      // Autor no topo
      { id: 'author', type: 'text', x: 60, y: 60, width: 960, height: 40,
        props: { text: 'BY NOME DO AUTOR', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      // Linha decorativa topo
      { id: 'top-line', type: 'shape', x: 460, y: 110, width: 160, height: 1,
        props: { fill: MUTED, cornerRadius: 0 } },
      // Palavra em destaque — grande
      { id: 'word1', type: 'text', x: 0, y: 560, width: 1080, height: 200,
        props: { text: 'BECOMING', fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: 8 } },
      // Palavra em estilo diferente
      { id: 'word2', type: 'text', x: 0, y: 720, width: 1080, height: 140,
        props: { text: 'Gentle', fontSize: 120, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', lineHeight: 1.0, align: 'center', fill: PRIMARY, wrap: 'none', autoFit: true } },
      // Subtítulo
      { id: 'subtitle', type: 'text', x: 60, y: 880, width: 960, height: 60,
        props: { text: 'WITH YOUR OWN PACE', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 6, wrap: 'none' } },
      // Página no rodapé
      { id: 'page', type: 'text', x: 60, y: 1010, width: 200, height: 30,
        props: { text: '@SUAMARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
      { id: 'page-num', type: 'text', x: 820, y: 1010, width: 200, height: 30,
        props: { text: 'PAGE 001', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
    ],
  }

  const ec4x5: Template = {
    id: 'editorial-cover-4x5',
    name: 'Editorial Cover — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: '#1a1a1a',
    elements: [
      { id: 'overlay-top', type: 'shape', x: 0, y: 0, width: 1080, height: 220,
        props: { fill: 'rgba(0,0,0,0.5)', cornerRadius: 0 } },
      { id: 'overlay-bottom', type: 'shape', x: 0, y: 880, width: 1080, height: 470,
        props: { fill: 'rgba(0,0,0,0.65)', cornerRadius: 0 } },
      { id: 'author', type: 'text', x: 60, y: 70, width: 960, height: 40,
        props: { text: 'BY NOME DO AUTOR', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'top-line', type: 'shape', x: 460, y: 120, width: 160, height: 1,
        props: { fill: MUTED, cornerRadius: 0 } },
      { id: 'word1', type: 'text', x: 0, y: 720, width: 1080, height: 220,
        props: { text: 'BECOMING', fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: 8 } },
      { id: 'word2', type: 'text', x: 0, y: 920, width: 1080, height: 160,
        props: { text: 'Gentle', fontSize: 130, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', lineHeight: 1.0, align: 'center', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 1110, width: 960, height: 60,
        props: { text: 'WITH YOUR OWN PACE', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 6, wrap: 'none' } },
      { id: 'page', type: 'text', x: 60, y: 1290, width: 200, height: 30,
        props: { text: '@SUAMARCA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
      { id: 'page-num', type: 'text', x: 820, y: 1290, width: 200, height: 30,
        props: { text: 'PAGE 001', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
    ],
  }

  const ec9x16: Template = {
    id: 'editorial-cover-9x16',
    name: 'Editorial Cover — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: '#1a1a1a',
    elements: [
      { id: 'overlay-top', type: 'shape', x: 0, y: 0, width: 1080, height: 280,
        props: { fill: 'rgba(0,0,0,0.5)', cornerRadius: 0 } },
      { id: 'overlay-bottom', type: 'shape', x: 0, y: 1280, width: 1080, height: 640,
        props: { fill: 'rgba(0,0,0,0.65)', cornerRadius: 0 } },
      { id: 'author', type: 'text', x: 60, y: 100, width: 960, height: 50,
        props: { text: 'BY NOME DO AUTOR', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 4, wrap: 'none' } },
      { id: 'top-line', type: 'shape', x: 460, y: 165, width: 160, height: 1,
        props: { fill: MUTED, cornerRadius: 0 } },
      { id: 'word1', type: 'text', x: 0, y: 1080, width: 1080, height: 260,
        props: { text: 'BECOMING', fontSize: 180, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: 8 } },
      { id: 'word2', type: 'text', x: 0, y: 1320, width: 1080, height: 200,
        props: { text: 'Gentle', fontSize: 160, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', lineHeight: 1.0, align: 'center', fill: PRIMARY, wrap: 'none', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 1560, width: 960, height: 80,
        props: { text: 'WITH YOUR OWN PACE', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, letterSpacing: 6, wrap: 'none' } },
      { id: 'page', type: 'text', x: 60, y: 1840, width: 300, height: 40,
        props: { text: '@SUAMARCA', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
      { id: 'page-num', type: 'text', x: 720, y: 1840, width: 300, height: 40,
        props: { text: 'PAGE 001', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, letterSpacing: 2, wrap: 'none' } },
    ],
  }

  return [ec1x1, ec4x5, ec9x16]
}
