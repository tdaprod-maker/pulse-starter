import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Editorial Monocromática + Pop — variação clara (moda/negócios).
// Silhueta espelhada da editorial-dark-pop (bloco alinhado à DIREITA, não é
// só a mesma recolorida): fundo branco puro, texto quase-preto, magenta em
// exatamente dois elementos (a linha de destaque + a "espinha" vertical).
//
// IMPORTANTE — contraste com foto de fundo: o texto "de tinta" (headline,
// eyebrow, subline, cta) usa #111111 sobre fundo branco (18.9:1 sem foto).
// Se o usuário adicionar uma foto, o CanvasEngine já escurece o fundo para
// legibilidade — o que quebraria o contraste desse texto escuro (~1:1).
// Por isso o CanvasEngine tem um flip dedicado para o prefixo
// "editorial-light-pop": todo texto exceto o id "headline-accent" (que já
// mantém >4:1 mesmo sobre foto escurecida, verificado) vira branco quando
// há backgroundImage. Ver CanvasEngine.tsx.
const BG      = '#FFFFFF'
const INK     = '#111111'
const MUTED   = '#8A8A8A'
const MAGENTA = '#E8005A'
const HEADING = 'Sora, sans-serif'
const BODY    = 'Public Sans, sans-serif'
const RIGHT   = 980 // borda direita do bloco de texto (margem de 100 da direita do canvas 1080)
const BLOCK_X = 410 // início do bloco (alinhado à direita)
const BLOCK_W = RIGHT - BLOCK_X
const SPINE_X = 380

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeEditorialLightPopVariants(_theme: Theme): Template[] {
  const elp4x5: Template = {
    id: 'editorial-light-pop-4x5',
    name: 'Editorial Claro + Magenta — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'spine', type: 'shape', x: SPINE_X, y: 210, width: 3, height: 465,
        props: { fill: MAGENTA, cornerRadius: 0 } },
      { id: 'eyebrow', type: 'text', x: BLOCK_X, y: 180, width: BLOCK_W, height: 26,
        props: { text: 'MODA CONTEMPORÂNEA', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: INK, letterSpacing: 4, wrap: 'none' } },
      { id: 'headline', type: 'text', x: BLOCK_X, y: 230, width: BLOCK_W, height: 140,
        props: { text: 'Estilo', fontSize: 84, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'right', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'headline-accent', type: 'text', x: BLOCK_X, y: 375, width: BLOCK_W, height: 190,
        props: { text: 'que não segue regras', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'right', fill: MAGENTA, wrap: 'word', autoFit: true } },
      { id: 'subline', type: 'text', x: BLOCK_X, y: 585, width: BLOCK_W, height: 90,
        props: { text: 'Peças autorais para quem constrói a própria identidade.', fontSize: 26, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.4, align: 'right', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: BLOCK_X, y: 1250, width: BLOCK_W, height: 28,
        props: { text: '@suamarca · suamarca.com.br', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, wrap: 'none' } },
    ],
  }

  const elp1x1: Template = {
    id: 'editorial-light-pop-1x1',
    name: 'Editorial Claro + Magenta — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'spine', type: 'shape', x: SPINE_X, y: 195, width: 3, height: 380,
        props: { fill: MAGENTA, cornerRadius: 0 } },
      { id: 'eyebrow', type: 'text', x: BLOCK_X, y: 150, width: BLOCK_W, height: 24,
        props: { text: 'MODA CONTEMPORÂNEA', fontSize: 16, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: INK, letterSpacing: 4, wrap: 'none' } },
      { id: 'headline', type: 'text', x: BLOCK_X, y: 195, width: BLOCK_W, height: 120,
        props: { text: 'Estilo', fontSize: 72, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'right', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'headline-accent', type: 'text', x: BLOCK_X, y: 325, width: BLOCK_W, height: 160,
        props: { text: 'que não segue regras', fontSize: 60, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'right', fill: MAGENTA, wrap: 'word', autoFit: true } },
      { id: 'subline', type: 'text', x: BLOCK_X, y: 495, width: BLOCK_W, height: 80,
        props: { text: 'Peças autorais para quem constrói a própria identidade.', fontSize: 24, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.4, align: 'right', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: BLOCK_X, y: 960, width: BLOCK_W, height: 26,
        props: { text: '@suamarca · suamarca.com.br', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, wrap: 'none' } },
    ],
  }

  const elp9x16: Template = {
    id: 'editorial-light-pop-9x16',
    name: 'Editorial Claro + Magenta — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'spine', type: 'shape', x: SPINE_X, y: 530, width: 3, height: 510,
        props: { fill: MAGENTA, cornerRadius: 0 } },
      { id: 'eyebrow', type: 'text', x: BLOCK_X, y: 480, width: BLOCK_W, height: 28,
        props: { text: 'MODA CONTEMPORÂNEA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: INK, letterSpacing: 4, wrap: 'none' } },
      { id: 'headline', type: 'text', x: BLOCK_X, y: 530, width: BLOCK_W, height: 160,
        props: { text: 'Estilo', fontSize: 96, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'right', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'headline-accent', type: 'text', x: BLOCK_X, y: 700, width: BLOCK_W, height: 220,
        props: { text: 'que não segue regras', fontSize: 82, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'right', fill: MAGENTA, wrap: 'word', autoFit: true } },
      { id: 'subline', type: 'text', x: BLOCK_X, y: 940, width: BLOCK_W, height: 100,
        props: { text: 'Peças autorais para quem constrói a própria identidade.', fontSize: 30, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.4, align: 'right', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: BLOCK_X, y: 1770, width: BLOCK_W, height: 32,
        props: { text: '@suamarca · suamarca.com.br', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'right', fill: MUTED, wrap: 'none' } },
    ],
  }

  return [elp4x5, elp1x1, elp9x16]
}
