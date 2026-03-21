import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const textH = (fs: number, lh: number, lines: number) => Math.ceil(fs * lh * lines)
const opticalCenterY = (canvasH: number, blockH: number) =>
  Math.round((canvasH - blockH) / 2) - 16

// ─── Constantes ───────────────────────────────────────────────────────────────
const BG        = '#000000'
const TEXT_COLOR = '#FFFFFF'
const FONT      = 'Montserrat, sans-serif'
const MARGIN    = 80   // cada lado

const FS     = 96
const FS_169 = 80
const LH     = 1.2
const LINES  = 3

const H     = textH(FS, LH, LINES)       // 346px
const H_169 = textH(FS_169, LH, LINES)   // 288px

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeTechMinimalVariants(_theme: Theme): Template[] {

  // 1:1
  const techMinimal1x1: Template = {
    id: 'tech-minimal-1x1',
    name: 'Tech Minimal — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: MARGIN,
        y: opticalCenterY(1080, H),   // 351px
        width: 1080 - MARGIN * 2,
        height: H,
        props: {
          text: 'SUA FRASE\nAQUI',
          fontSize: FS,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH,
          letterSpacing: 0,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
    ],
  }

  // 4:5
  const techMinimal4x5: Template = {
    id: 'tech-minimal-4x5',
    name: 'Tech Minimal — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: MARGIN,
        y: opticalCenterY(1350, H),   // 486px
        width: 1080 - MARGIN * 2,
        height: H,
        props: {
          text: 'SUA FRASE\nAQUI',
          fontSize: FS,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH,
          letterSpacing: 0,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
    ],
  }

  // 9:16
  const techMinimal9x16: Template = {
    id: 'tech-minimal-9x16',
    name: 'Tech Minimal — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: MARGIN,
        y: opticalCenterY(1920, H),   // 771px
        width: 1080 - MARGIN * 2,
        height: H,
        props: {
          text: 'SUA FRASE\nAQUI',
          fontSize: FS,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH,
          letterSpacing: 0,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
    ],
  }

  // 16:9
  const techMinimal16x9: Template = {
    id: 'tech-minimal-16x9',
    name: 'Tech Minimal — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      {
        id: 'phrase',
        type: 'text',
        x: MARGIN,
        y: opticalCenterY(1080, H_169),   // 380px
        width: 1920 - MARGIN * 2,
        height: H_169,
        props: {
          text: 'SUA FRASE\nAQUI',
          fontSize: FS_169,
          fontFamily: FONT,
          fontStyle: 'bold',
          lineHeight: LH,
          letterSpacing: 0,
          align: 'center',
          fill: TEXT_COLOR,
        },
      },
    ],
  }

  return [techMinimal1x1, techMinimal4x5, techMinimal9x16, techMinimal16x9]
}
