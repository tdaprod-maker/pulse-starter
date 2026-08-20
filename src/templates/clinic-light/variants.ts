import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

// Família Clínica — variação clara. Paleta fria/neutra, muito espaço em branco,
// tipografia limpa (Sora + DM Sans, nenhuma delas usada em outro template),
// composição que respira: um único bloco alinado à esquerda, um filete como
// única decoração. Pensado para saúde, odontologia e estética.
const BG      = '#F6F7F5'
const INK     = '#14181A'
const MUTED   = '#5B615E'
const ACCENT  = '#0E7C74'
const HEADING = 'Sora, sans-serif'
const BODY    = 'DM Sans, sans-serif'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeClinicLightVariants(_theme: Theme): Template[] {
  const cl4x5: Template = {
    id: 'clinic-light-4x5',
    name: 'Clínica Clara — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'eyebrow', type: 'text', x: 140, y: 140, width: 800, height: 28,
        props: { text: 'ODONTOLOGIA', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 140, y: 210, width: 800, height: 340,
        props: { text: 'Cuidado que\ntransforma sorrisos', fontSize: 76, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 140, y: 590, width: 120, height: 3,
        props: { fill: ACCENT, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 140, y: 630, width: 680, height: 90,
        props: { text: 'Atendimento humanizado, tecnologia de ponta e resultados que você sente logo na primeira consulta.', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 140, y: 1240, width: 680, height: 40,
        props: { text: 'Agende sua consulta →', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const cl1x1: Template = {
    id: 'clinic-light-1x1',
    name: 'Clínica Clara — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'eyebrow', type: 'text', x: 140, y: 120, width: 800, height: 28,
        props: { text: 'ODONTOLOGIA', fontSize: 20, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 140, y: 188, width: 800, height: 300,
        props: { text: 'Cuidado que\ntransforma sorrisos', fontSize: 68, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 140, y: 510, width: 120, height: 3,
        props: { fill: ACCENT, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 140, y: 548, width: 680, height: 80,
        props: { text: 'Atendimento humanizado, tecnologia de ponta e resultados que você sente logo na primeira consulta.', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 140, y: 970, width: 680, height: 40,
        props: { text: 'Agende sua consulta →', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  const cl9x16: Template = {
    id: 'clinic-light-9x16',
    name: 'Clínica Clara — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'eyebrow', type: 'text', x: 140, y: 460, width: 800, height: 30,
        props: { text: 'ODONTOLOGIA', fontSize: 22, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, letterSpacing: 3, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 140, y: 530, width: 800, height: 380,
        props: { text: 'Cuidado que\ntransforma sorrisos', fontSize: 80, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: INK, wrap: 'word', autoFit: true } },
      { id: 'divider', type: 'shape', x: 140, y: 930, width: 120, height: 3,
        props: { fill: ACCENT, cornerRadius: 2 } },
      { id: 'subtitle', type: 'text', x: 140, y: 970, width: 680, height: 100,
        props: { text: 'Atendimento humanizado, tecnologia de ponta e resultados que você sente logo na primeira consulta.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.4, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'cta', type: 'text', x: 140, y: 1740, width: 680, height: 44,
        props: { text: 'Agende sua consulta →', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: ACCENT, wrap: 'none' } },
    ],
  }

  return [cl4x5, cl1x1, cl9x16]
}
