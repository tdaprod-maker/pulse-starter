import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeGeoImpactVariants(theme: Theme): Template[] {
  const BG      = '#F5F5F0'
  const PRIMARY = theme.colors.accent
  const DARK    = '#0C0C0D'
  const WHITE   = '#FFFFFF'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const geo1x1: Template = {
    id: 'geo-impact-1x1',
    name: 'Geo Impact — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'circle-bg', type: 'shape', x: 540, y: -200, width: 740, height: 740,
        props: { fill: DARK, cornerRadius: 370 } },
      { id: 'circle-text', type: 'text', x: 560, y: 60, width: 680, height: 360,
        props: { text: 'NOVO\nPOST', fontSize: 120, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'line-left', type: 'shape', x: 60, y: 160, width: 2, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-left2', type: 'shape', x: 60, y: 420, width: 2, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 620, width: 960, height: 280,
        props: { text: 'Que Mudam\nSua Vida', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'highlight-line', type: 'shape', x: 60, y: 920, width: 200, height: 4,
        props: { fill: PRIMARY, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 60, y: 940, width: 960, height: 60,
        props: { text: 'Pequenos hábitos. Grandes resultados.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: DARK, wrap: 'none', autoFit: true } },
    ],
  }

  const geo4x5: Template = {
    id: 'geo-impact-4x5',
    name: 'Geo Impact — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'circle-bg', type: 'shape', x: 540, y: -180, width: 740, height: 740,
        props: { fill: DARK, cornerRadius: 370 } },
      { id: 'circle-text', type: 'text', x: 560, y: 80, width: 680, height: 360,
        props: { text: 'NOVO\nPOST', fontSize: 120, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'line-left', type: 'shape', x: 60, y: 200, width: 2, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-left2', type: 'shape', x: 60, y: 460, width: 2, height: 200,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 740, width: 960, height: 400,
        props: { text: 'Que Mudam\nSua Vida', fontSize: 120, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'highlight-line', type: 'shape', x: 60, y: 1180, width: 200, height: 4,
        props: { fill: PRIMARY, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 60, y: 1200, width: 960, height: 80,
        props: { text: 'Pequenos hábitos. Grandes resultados.', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: DARK, wrap: 'none', autoFit: true } },
    ],
  }

  const geo9x16: Template = {
    id: 'geo-impact-9x16',
    name: 'Geo Impact — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'circle-bg', type: 'shape', x: 540, y: -200, width: 840, height: 840,
        props: { fill: DARK, cornerRadius: 420 } },
      { id: 'circle-text', type: 'text', x: 560, y: 100, width: 760, height: 420,
        props: { text: 'NOVO\nPOST', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.0, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'line-left', type: 'shape', x: 60, y: 320, width: 2, height: 240,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'line-left2', type: 'shape', x: 60, y: 620, width: 2, height: 240,
        props: { fill: DARK, cornerRadius: 0 } },
      { id: 'title', type: 'text', x: 60, y: 1100, width: 960, height: 500,
        props: { text: 'Que Mudam\nSua Vida', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'highlight-line', type: 'shape', x: 60, y: 1700, width: 200, height: 4,
        props: { fill: PRIMARY, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 60, y: 1730, width: 960, height: 80,
        props: { text: 'Pequenos hábitos. Grandes resultados.', fontSize: 34, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: DARK, wrap: 'none', autoFit: true } },
    ],
  }

  return [geo1x1, geo4x5, geo9x16]
}
