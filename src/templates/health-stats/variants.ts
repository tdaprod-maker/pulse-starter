import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeHealthStatsVariants(theme: Theme): Template[] {
  const BG      = '#0A1628'
  const PRIMARY = theme.colors.accent
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.35)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const hs1x1: Template = {
    id: 'health-stats-1x1',
    name: 'Health Stats — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 60, width: 800, height: 30,
        props: { text: 'ESPECIALIDADE', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'cross-h', type: 'shape', x: 1010, y: 68, width: 30, height: 4,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'cross-v', type: 'shape', x: 1022, y: 56, width: 4, height: 30,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 280, width: 960, height: 30,
        props: { text: 'DADO DE SAUDE', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 340, width: 960, height: 300,
        props: { text: 'Sabia que 1 em cada 3 adultos tem pressao alta sem saber?', fontSize: 72, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.2, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'stat1-num', type: 'text', x: 60, y: 720, width: 280, height: 120,
        props: { text: '33%', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat1-label', type: 'text', x: 60, y: 840, width: 280, height: 40,
        props: { text: 'DOS ADULTOS', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'stat2-num', type: 'text', x: 420, y: 720, width: 280, height: 120,
        props: { text: '80%', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat2-label', type: 'text', x: 420, y: 840, width: 280, height: 40,
        props: { text: 'PREVENIVEL', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 940, width: 960, height: 1,
        props: { fill: '#1E3A5F', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 960, width: 700, height: 40,
        props: { text: 'AGENDE SUA CONSULTA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const hs4x5: Template = {
    id: 'health-stats-4x5',
    name: 'Health Stats — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 80, width: 800, height: 30,
        props: { text: 'ESPECIALIDADE', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'cross-h', type: 'shape', x: 1010, y: 88, width: 30, height: 4,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'cross-v', type: 'shape', x: 1022, y: 76, width: 4, height: 30,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 400, width: 960, height: 30,
        props: { text: 'DADO DE SAUDE', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 460, width: 960, height: 300,
        props: { text: 'Sabia que 1 em cada 3 adultos tem pressao alta sem saber?', fontSize: 72, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.2, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'stat1-num', type: 'text', x: 60, y: 880, width: 280, height: 120,
        props: { text: '33%', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat1-label', type: 'text', x: 60, y: 1000, width: 280, height: 40,
        props: { text: 'DOS ADULTOS', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'stat2-num', type: 'text', x: 420, y: 880, width: 280, height: 120,
        props: { text: '80%', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat2-label', type: 'text', x: 420, y: 1000, width: 280, height: 40,
        props: { text: 'PREVENIVEL', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 1200, width: 960, height: 1,
        props: { fill: '#1E3A5F', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1220, width: 700, height: 40,
        props: { text: 'AGENDE SUA CONSULTA', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const hs9x16: Template = {
    id: 'health-stats-9x16',
    name: 'Health Stats — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 60, y: 120, width: 800, height: 30,
        props: { text: 'ESPECIALIDADE', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'cross-h', type: 'shape', x: 1010, y: 128, width: 30, height: 4,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'cross-v', type: 'shape', x: 1022, y: 116, width: 4, height: 30,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 60, y: 600, width: 960, height: 30,
        props: { text: 'DADO DE SAUDE', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 680, width: 960, height: 400,
        props: { text: 'Sabia que 1 em cada 3 adultos tem pressao alta sem saber?', fontSize: 88, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.2, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'stat1-num', type: 'text', x: 60, y: 1220, width: 340, height: 140,
        props: { text: '33%', fontSize: 120, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat1-label', type: 'text', x: 60, y: 1360, width: 340, height: 40,
        props: { text: 'DOS ADULTOS', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'stat2-num', type: 'text', x: 500, y: 1220, width: 340, height: 140,
        props: { text: '80%', fontSize: 120, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat2-label', type: 'text', x: 500, y: 1360, width: 340, height: 40,
        props: { text: 'PREVENIVEL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 60, y: 1740, width: 960, height: 1,
        props: { fill: '#1E3A5F', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 60, y: 1760, width: 700, height: 50,
        props: { text: 'AGENDE SUA CONSULTA', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  const hs16x9: Template = {
    id: 'health-stats-16x9',
    name: 'Health Stats — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'cat', type: 'text', x: 100, y: 60, width: 1000, height: 30,
        props: { text: 'ESPECIALIDADE', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 5, wrap: 'none' } },
      { id: 'cross-h', type: 'shape', x: 1850, y: 68, width: 30, height: 4,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'cross-v', type: 'shape', x: 1862, y: 56, width: 4, height: 30,
        props: { fill: PRIMARY, cornerRadius: 0 } },
      { id: 'tag', type: 'text', x: 100, y: 280, width: 800, height: 30,
        props: { text: 'DADO DE SAUDE', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 5, wrap: 'none' } },
      { id: 'title', type: 'text', x: 100, y: 340, width: 800, height: 380,
        props: { text: 'Sabia que 1 em cada 3 adultos tem pressao alta sem saber?', fontSize: 80, fontFamily: HEADING, fontStyle: 'normal', lineHeight: 1.2, align: 'left', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'stat1-num', type: 'text', x: 1060, y: 280, width: 340, height: 160,
        props: { text: '33%', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat1-label', type: 'text', x: 1060, y: 440, width: 340, height: 40,
        props: { text: 'DOS ADULTOS', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'stat2-num', type: 'text', x: 1480, y: 280, width: 340, height: 160,
        props: { text: '80%', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: PRIMARY, wrap: 'none' } },
      { id: 'stat2-label', type: 'text', x: 1480, y: 440, width: 340, height: 40,
        props: { text: 'PREVENIVEL', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 3, wrap: 'none' } },
      { id: 'divider', type: 'shape', x: 100, y: 860, width: 1720, height: 1,
        props: { fill: '#1E3A5F', cornerRadius: 0 } },
      { id: 'cta', type: 'text', x: 100, y: 880, width: 700, height: 50,
        props: { text: 'AGENDE SUA CONSULTA', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: PRIMARY, letterSpacing: 4, wrap: 'none' } },
    ],
  }

  return [hs1x1, hs4x5, hs9x16, hs16x9]
}
