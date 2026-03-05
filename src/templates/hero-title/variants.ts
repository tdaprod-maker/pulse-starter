import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Cores fixas — spec exata ──────────────────────────────────────────────────
const BG_COLOR       = '#0C0C0D'
const TITLE_COLOR    = '#FFFFFF'
const SUBTITLE_COLOR = '#6D6D6E'
const BAR_COLOR      = '#3A5AFF'

// ─── Tipografia ────────────────────────────────────────────────────────────────
const TITLE_FS   = 96
const TITLE_LH   = 1.1
const TITLE_FONT = 'Inter'

const SUBTITLE_FS   = 24
const SUBTITLE_LH   = 1.5
const SUBTITLE_FONT = 'Inter'

// ─── Barra vertical ───────────────────────────────────────────────────────────
const BAR_W = 8
const BAR_H = 120

// ─── Layout base (1080px de largura) ──────────────────────────────────────────
//   título: x=80, y=200  |  barra: x=52 centralizada com o título
const TITLE_X    = 80
const TITLE_Y    = 200

const textH = (fs: number, lh: number, lines: number) => Math.ceil(fs * lh * lines)

const TITLE_H_1080    = textH(TITLE_FS, TITLE_LH, 2)        // 212px
const SUBTITLE_H_1080 = textH(SUBTITLE_FS, SUBTITLE_LH, 1)  // 36px

const SUBTITLE_X_1080 = TITLE_X
const SUBTITLE_Y_1080 = TITLE_Y + TITLE_H_1080 + 40         // 452px
const TITLE_W_1080    = 1080 - TITLE_X - 40                  // 960px
const SUBTITLE_W_1080 = 900

// Barra: centralizada verticalmente com o título
const BAR_X_1080 = 52
const BAR_Y_1080 = TITLE_Y + Math.round(TITLE_H_1080 / 2) - Math.round(BAR_H / 2)  // 246px

// ─── Layout 16:9 (1920px de largura) ─────────────────────────────────────────
const TITLE_FS_169   = 128
const SUBTITLE_FS_169 = 32
const BAR_W_169      = 10
const BAR_H_169      = 160

const TITLE_X_169    = 140
const TITLE_Y_169    = TITLE_Y                               // mesma altura — canvas tem 1080px
const TITLE_H_169    = textH(TITLE_FS_169, TITLE_LH, 2)     // 282px
const TITLE_W_169    = 1920 - TITLE_X_169 - 60              // 1720px

const SUBTITLE_X_169 = TITLE_X_169
const SUBTITLE_Y_169 = TITLE_Y_169 + TITLE_H_169 + 40       // 522px
const SUBTITLE_H_169 = textH(SUBTITLE_FS_169, SUBTITLE_LH, 1) // 48px
const SUBTITLE_W_169 = 1200

const BAR_X_169 = 90
const BAR_Y_169 = TITLE_Y_169 + Math.round(TITLE_H_169 / 2) - Math.round(BAR_H_169 / 2)  // 261px

// ─── Factory ──────────────────────────────────────────────────────────────────
// theme mantido na assinatura para compatibilidade com o registry
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeHeroTitleVariants(_theme: Theme): Template[] {

  // Elementos base para 1080px — reutilizados em 1:1, 4:5 e 9:16
  const elements1080 = [
    {
      id: 'accent-bar',
      type: 'shape' as const,
      x: BAR_X_1080,
      y: BAR_Y_1080,
      width: BAR_W,
      height: BAR_H,
      props: { fill: BAR_COLOR, cornerRadius: 0 },
    },
    {
      id: 'title',
      type: 'text' as const,
      x: TITLE_X,
      y: TITLE_Y,
      width: TITLE_W_1080,
      height: TITLE_H_1080,
      props: {
        text: 'Seu Título\nImpactante',
        fontSize: TITLE_FS,
        fontFamily: TITLE_FONT,
        fontStyle: 'bold',
        lineHeight: TITLE_LH,
        align: 'left',
        fill: TITLE_COLOR,
      },
    },
    {
      id: 'subtitle',
      type: 'text' as const,
      x: SUBTITLE_X_1080,
      y: SUBTITLE_Y_1080,
      width: SUBTITLE_W_1080,
      height: SUBTITLE_H_1080,
      props: {
        text: 'Uma descrição clara e objetiva do seu conteúdo',
        fontSize: SUBTITLE_FS,
        fontFamily: SUBTITLE_FONT,
        fontStyle: 'normal',
        lineHeight: SUBTITLE_LH,
        align: 'left',
        fill: SUBTITLE_COLOR,
      },
    },
  ]

  // 1:1
  const heroTitle1x1: Template = {
    id: 'hero-title-1x1',
    name: 'Hero Title — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG_COLOR,
    elements: elements1080,
  }

  // 4:5 — mesmas posições, canvas mais alto
  const heroTitle4x5: Template = {
    id: 'hero-title-4x5',
    name: 'Hero Title — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG_COLOR,
    elements: elements1080,
  }

  // 9:16 — texto pesado no topo, vazio expressivo embaixo
  const heroTitle9x16: Template = {
    id: 'hero-title-9x16',
    name: 'Hero Title — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG_COLOR,
    elements: elements1080,
  }

  // 16:9 — fontes e espaçamentos escalados para canvas mais largo
  const heroTitle16x9: Template = {
    id: 'hero-title-16x9',
    name: 'Hero Title — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG_COLOR,
    elements: [
      {
        id: 'accent-bar',
        type: 'shape',
        x: BAR_X_169,
        y: BAR_Y_169,
        width: BAR_W_169,
        height: BAR_H_169,
        props: { fill: BAR_COLOR, cornerRadius: 0 },
      },
      {
        id: 'title',
        type: 'text',
        x: TITLE_X_169,
        y: TITLE_Y_169,
        width: TITLE_W_169,
        height: TITLE_H_169,
        props: {
          text: 'Seu Título\nImpactante',
          fontSize: TITLE_FS_169,
          fontFamily: TITLE_FONT,
          fontStyle: 'bold',
          lineHeight: TITLE_LH,
          align: 'left',
          fill: TITLE_COLOR,
        },
      },
      {
        id: 'subtitle',
        type: 'text',
        x: SUBTITLE_X_169,
        y: SUBTITLE_Y_169,
        width: SUBTITLE_W_169,
        height: SUBTITLE_H_169,
        props: {
          text: 'Uma descrição clara e objetiva do seu conteúdo',
          fontSize: SUBTITLE_FS_169,
          fontFamily: SUBTITLE_FONT,
          fontStyle: 'normal',
          lineHeight: SUBTITLE_LH,
          align: 'left',
          fill: SUBTITLE_COLOR,
        },
      },
    ],
  }

  return [heroTitle1x1, heroTitle4x5, heroTitle9x16, heroTitle16x9]
}
