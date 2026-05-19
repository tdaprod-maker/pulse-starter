import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeJobGlassVariants(theme: Theme): Template[] {
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.6)'
  const GLASS   = 'rgba(255,255,255,0.15)'
  const GLASS2  = 'rgba(255,255,255,0.08)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const jg4x5: Template = {
    id: 'job-glass-4x5',
    name: 'Vaga em Destaque — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: '#2a2a2a',
    elements: [
      // Card glass central
      { id: 'glass-card', type: 'shape', x: 80, y: 260, width: 920, height: 820,
        props: { fill: GLASS, cornerRadius: 32, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 } },
      // Linha interna decorativa no topo do card
      { id: 'card-top-line', type: 'shape', x: 80, y: 260, width: 920, height: 2,
        props: { fill: 'rgba(255,255,255,0.3)', cornerRadius: 0 } },
      // Nome da empresa
      { id: 'company', type: 'text', x: 120, y: 300, width: 700, height: 50,
        props: { text: 'Nome da Empresa', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 1, wrap: 'none' } },
      // Ícone decorativo canto direito
      { id: 'icon-box', type: 'shape', x: 870, y: 295, width: 90, height: 60,
        props: { fill: GLASS2, cornerRadius: 8 } },
      { id: 'icon-line1', type: 'shape', x: 896, y: 316, width: 38, height: 3,
        props: { fill: MUTED, cornerRadius: 2 } },
      { id: 'icon-line2', type: 'shape', x: 906, y: 326, width: 28, height: 3,
        props: { fill: MUTED, cornerRadius: 2 } },
      // Headline principal bold
      { id: 'headline1', type: 'text', x: 100, y: 390, width: 880, height: 200,
        props: { text: "ESTAMOS", fontSize: 170, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: -2 } },
      { id: 'headline2', type: 'text', x: 100, y: 560, width: 880, height: 200,
        props: { text: "CONTRATANDO", fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: -2 } },
      // Linha separadora
      { id: 'divider', type: 'shape', x: 120, y: 780, width: 840, height: 1,
        props: { fill: 'rgba(255,255,255,0.25)', cornerRadius: 0 } },
      // Cargo
      { id: 'role-box', type: 'shape', x: 120, y: 808, width: 620, height: 64,
        props: { fill: GLASS2, cornerRadius: 12 } },
      { id: 'role', type: 'text', x: 140, y: 820, width: 580, height: 44,
        props: { text: 'Assistente Administrativo', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      // CTA envio
      { id: 'cta-label', type: 'text', x: 120, y: 910, width: 840, height: 36,
        props: { text: 'Envie seu currículo para', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'cta-email', type: 'text', x: 120, y: 950, width: 840, height: 50,
        props: { text: 'contato@suaempresa.com', fontSize: 30, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      // Data limite
      { id: 'deadline', type: 'text', x: 120, y: 1030, width: 840, height: 36,
        props: { text: 'Inscrições até: 31 de Dezembro de 2025', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
    ],
  }

  const jg1x1: Template = {
    id: 'job-glass-1x1',
    name: 'Vaga em Destaque — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: '#2a2a2a',
    elements: [
      { id: 'glass-card', type: 'shape', x: 80, y: 140, width: 920, height: 800,
        props: { fill: GLASS, cornerRadius: 32, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 } },
      { id: 'card-top-line', type: 'shape', x: 80, y: 140, width: 920, height: 2,
        props: { fill: 'rgba(255,255,255,0.3)', cornerRadius: 0 } },
      { id: 'company', type: 'text', x: 120, y: 178, width: 700, height: 50,
        props: { text: 'Nome da Empresa', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 1, wrap: 'none' } },
      { id: 'icon-box', type: 'shape', x: 870, y: 173, width: 90, height: 60,
        props: { fill: GLASS2, cornerRadius: 8 } },
      { id: 'icon-line1', type: 'shape', x: 896, y: 194, width: 38, height: 3,
        props: { fill: MUTED, cornerRadius: 2 } },
      { id: 'icon-line2', type: 'shape', x: 906, y: 204, width: 28, height: 3,
        props: { fill: MUTED, cornerRadius: 2 } },
      { id: 'headline1', type: 'text', x: 100, y: 260, width: 880, height: 180,
        props: { text: "ESTAMOS", fontSize: 160, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: -2 } },
      { id: 'headline2', type: 'text', x: 100, y: 420, width: 880, height: 160,
        props: { text: "CONTRATANDO", fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: -2 } },
      { id: 'divider', type: 'shape', x: 120, y: 610, width: 840, height: 1,
        props: { fill: 'rgba(255,255,255,0.25)', cornerRadius: 0 } },
      { id: 'role-box', type: 'shape', x: 120, y: 632, width: 620, height: 60,
        props: { fill: GLASS2, cornerRadius: 12 } },
      { id: 'role', type: 'text', x: 140, y: 644, width: 580, height: 40,
        props: { text: 'Assistente Administrativo', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'cta-label', type: 'text', x: 120, y: 730, width: 840, height: 36,
        props: { text: 'Envie seu currículo para', fontSize: 22, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'cta-email', type: 'text', x: 120, y: 768, width: 840, height: 50,
        props: { text: 'contato@suaempresa.com', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'deadline', type: 'text', x: 120, y: 848, width: 840, height: 36,
        props: { text: 'Inscrições até: 31 de Dezembro de 2025', fontSize: 20, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
    ],
  }

  const jg9x16: Template = {
    id: 'job-glass-9x16',
    name: 'Vaga em Destaque — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: '#2a2a2a',
    elements: [
      { id: 'glass-card', type: 'shape', x: 80, y: 500, width: 920, height: 920,
        props: { fill: GLASS, cornerRadius: 32, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 } },
      { id: 'card-top-line', type: 'shape', x: 80, y: 500, width: 920, height: 2,
        props: { fill: 'rgba(255,255,255,0.3)', cornerRadius: 0 } },
      { id: 'company', type: 'text', x: 120, y: 540, width: 700, height: 50,
        props: { text: 'Nome da Empresa', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, letterSpacing: 1, wrap: 'none' } },
      { id: 'icon-box', type: 'shape', x: 870, y: 534, width: 90, height: 60,
        props: { fill: GLASS2, cornerRadius: 8 } },
      { id: 'icon-line1', type: 'shape', x: 896, y: 556, width: 38, height: 3,
        props: { fill: MUTED, cornerRadius: 2 } },
      { id: 'icon-line2', type: 'shape', x: 906, y: 566, width: 28, height: 3,
        props: { fill: MUTED, cornerRadius: 2 } },
      { id: 'headline1', type: 'text', x: 100, y: 640, width: 880, height: 240,
        props: { text: "ESTAMOS", fontSize: 200, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: -2 } },
      { id: 'headline2', type: 'text', x: 100, y: 860, width: 880, height: 200,
        props: { text: "CONTRATANDO", fontSize: 130, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 0.95, align: 'left', fill: WHITE, wrap: 'none', autoFit: true, letterSpacing: -2 } },
      { id: 'divider', type: 'shape', x: 120, y: 1090, width: 840, height: 1,
        props: { fill: 'rgba(255,255,255,0.25)', cornerRadius: 0 } },
      { id: 'role-box', type: 'shape', x: 120, y: 1116, width: 680, height: 72,
        props: { fill: GLASS2, cornerRadius: 12 } },
      { id: 'role', type: 'text', x: 140, y: 1130, width: 640, height: 48,
        props: { text: 'Assistente Administrativo', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'cta-label', type: 'text', x: 120, y: 1230, width: 840, height: 40,
        props: { text: 'Envie seu currículo para', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
      { id: 'cta-email', type: 'text', x: 120, y: 1276, width: 840, height: 60,
        props: { text: 'contato@suaempresa.com', fontSize: 34, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, wrap: 'none' } },
      { id: 'deadline', type: 'text', x: 120, y: 1376, width: 840, height: 40,
        props: { text: 'Inscrições até: 31 de Dezembro de 2025', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'left', fill: MUTED, wrap: 'none' } },
    ],
  }

  return [jg4x5, jg1x1, jg9x16]
}
