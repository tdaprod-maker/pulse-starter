import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeHealthContentVariants(theme: Theme): Template[] {
  const BG      = '#F0F4FF'
  const PRIMARY = theme.colors.accent
  const DARK    = '#0D1F5C'
  const MUTED   = '#667788'
  const WHITE   = '#FFFFFF'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const hc1x1: Template = {
    id: 'health-content-1x1',
    name: 'Health Content — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: BG,
    elements: [
      { id: 'badge-bg', type: 'shape', x: 60, y: 60, width: 320, height: 52,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'badge', type: 'text', x: 60, y: 72, width: 320, height: 30,
        props: { text: 'SAUDE E PREVENCAO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 180, width: 960, height: 320,
        props: { text: '3 sinais que voce nao deve ignorar', fontSize: 96, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 560, width: 960, height: 200,
        props: { text: 'Dor persistente, fadiga sem causa e alteracoes de peso podem indicar condicoes que exigem atencao medica imediata. Consulte um especialista.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.6, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 820, width: 960, height: 1,
        props: { fill: '#C8D5F5', cornerRadius: 0 } },
      { id: 'doctor', type: 'text', x: 120, y: 860, width: 700, height: 40,
        props: { text: 'Dr. Nome do Medico', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'crm', type: 'text', x: 120, y: 900, width: 700, height: 30,
        props: { text: 'Especialidade · CRM 00000', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'avatar-bg', type: 'shape', x: 60, y: 852, width: 48, height: 48,
        props: { fill: PRIMARY, cornerRadius: 24 } },
    ],
  }

  const hc4x5: Template = {
    id: 'health-content-4x5',
    name: 'Health Content — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: BG,
    elements: [
      { id: 'badge-bg', type: 'shape', x: 60, y: 80, width: 320, height: 52,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'badge', type: 'text', x: 60, y: 92, width: 320, height: 30,
        props: { text: 'SAUDE E PREVENCAO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 220, width: 960, height: 380,
        props: { text: '3 sinais que voce nao deve ignorar', fontSize: 96, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 680, width: 960, height: 300,
        props: { text: 'Dor persistente, fadiga sem causa e alteracoes de peso podem indicar condicoes que exigem atencao medica imediata. Consulte um especialista.', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.6, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 1060, width: 960, height: 1,
        props: { fill: '#C8D5F5', cornerRadius: 0 } },
      { id: 'doctor', type: 'text', x: 120, y: 1100, width: 700, height: 40,
        props: { text: 'Dr. Nome do Medico', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'crm', type: 'text', x: 120, y: 1140, width: 700, height: 30,
        props: { text: 'Especialidade · CRM 00000', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'avatar-bg', type: 'shape', x: 60, y: 1092, width: 48, height: 48,
        props: { fill: PRIMARY, cornerRadius: 24 } },
    ],
  }

  const hc9x16: Template = {
    id: 'health-content-9x16',
    name: 'Health Content — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: BG,
    elements: [
      { id: 'badge-bg', type: 'shape', x: 60, y: 120, width: 320, height: 52,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'badge', type: 'text', x: 60, y: 132, width: 320, height: 30,
        props: { text: 'SAUDE E PREVENCAO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 60, y: 700, width: 960, height: 440,
        props: { text: '3 sinais que voce nao deve ignorar', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 60, y: 1220, width: 960, height: 300,
        props: { text: 'Dor persistente, fadiga sem causa e alteracoes de peso podem indicar condicoes que exigem atencao medica imediata. Consulte um especialista.', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.6, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 60, y: 1640, width: 960, height: 1,
        props: { fill: '#C8D5F5', cornerRadius: 0 } },
      { id: 'doctor', type: 'text', x: 120, y: 1680, width: 700, height: 40,
        props: { text: 'Dr. Nome do Medico', fontSize: 30, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'crm', type: 'text', x: 120, y: 1724, width: 700, height: 30,
        props: { text: 'Especialidade · CRM 00000', fontSize: 24, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'avatar-bg', type: 'shape', x: 60, y: 1672, width: 48, height: 48,
        props: { fill: PRIMARY, cornerRadius: 24 } },
    ],
  }

  const hc16x9: Template = {
    id: 'health-content-16x9',
    name: 'Health Content — 16:9',
    category: 'linkedin-banner',
    width: 1920,
    height: 1080,
    background: BG,
    elements: [
      { id: 'badge-bg', type: 'shape', x: 100, y: 80, width: 320, height: 52,
        props: { fill: PRIMARY, cornerRadius: 4 } },
      { id: 'badge', type: 'text', x: 100, y: 92, width: 320, height: 30,
        props: { text: 'SAUDE E PREVENCAO', fontSize: 18, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: WHITE, letterSpacing: 3, wrap: 'none' } },
      { id: 'title', type: 'text', x: 100, y: 220, width: 860, height: 440,
        props: { text: '3 sinais que voce nao deve ignorar', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.15, align: 'left', fill: DARK, wrap: 'word', autoFit: true } },
      { id: 'body', type: 'text', x: 1060, y: 220, width: 760, height: 300,
        props: { text: 'Dor persistente, fadiga sem causa e alteracoes de peso podem indicar condicoes que exigem atencao medica imediata. Consulte um especialista.', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1.6, align: 'left', fill: MUTED, wrap: 'word' } },
      { id: 'divider', type: 'shape', x: 1060, y: 600, width: 760, height: 1,
        props: { fill: '#C8D5F5', cornerRadius: 0 } },
      { id: 'doctor', type: 'text', x: 1120, y: 640, width: 600, height: 40,
        props: { text: 'Dr. Nome do Medico', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: DARK, wrap: 'none' } },
      { id: 'crm', type: 'text', x: 1120, y: 682, width: 600, height: 30,
        props: { text: 'Especialidade · CRM 00000', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'avatar-bg', type: 'shape', x: 1060, y: 632, width: 48, height: 48,
        props: { fill: PRIMARY, cornerRadius: 24 } },
    ],
  }

  return [hc1x1, hc4x5, hc9x16, hc16x9]
}
