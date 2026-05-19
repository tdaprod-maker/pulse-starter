import type { Template } from '../../state/useStore'
import type { Theme } from '../../themes'

export function makeHeroGradientVariants(theme: Theme): Template[] {
  const WHITE   = '#FFFFFF'
  const MUTED   = 'rgba(255,255,255,0.7)'
  const HEADING = theme.fonts.heading
  const BODY    = theme.fonts.body

  const hg4x5: Template = {
    id: 'hero-gradient-4x5',
    name: 'Palco de Marca — 4:5',
    category: 'instagram-post',
    width: 1080,
    height: 1350,
    background: '#1a3a5c',
    elements: [
      // Overlay gradiente no topo (escurece levemente para logo ser legível)
      { id: 'overlay-top', type: 'shape', x: 0, y: 0, width: 1080, height: 220,
        props: { fill: 'rgba(0,0,0,0.45)', cornerRadius: 0 } },
      // Overlay gradiente na base (onde fica o texto)
      { id: 'overlay-bottom', type: 'shape', x: 0, y: 820, width: 1080, height: 530,
        props: { fill: 'rgba(20,60,120,0.82)', cornerRadius: 0 } },
      // Forma orgânica de transição
      { id: 'wave', type: 'shape', x: 0, y: 750, width: 1080, height: 120,
        props: { fill: 'rgba(20,60,120,0.5)', cornerRadius: 0 } },
      // Logo / nome da marca no topo esquerdo
      { id: 'logo-icon', type: 'shape', x: 60, y: 60, width: 48, height: 48,
        props: { fill: WHITE, cornerRadius: 4 } },
      { id: 'logo-text', type: 'text', x: 120, y: 68, width: 400, height: 44,
        props: { text: 'NOME DA MARCA', fontSize: 26, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, letterSpacing: 2, wrap: 'none' } },
      // Headline principal
      { id: 'headline', type: 'text', x: 60, y: 840, width: 960, height: 240,
        props: { text: 'Este Dia,\nCelebramos Você', fontSize: 110, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      // Subtítulo
      { id: 'subtitle', type: 'text', x: 60, y: 1110, width: 960, height: 60,
        props: { text: 'Porque cada conquista merece reconhecimento', fontSize: 28, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, wrap: 'none', autoFit: true } },
    ],
  }

  const hg1x1: Template = {
    id: 'hero-gradient-1x1',
    name: 'Palco de Marca — 1:1',
    category: 'instagram-post',
    width: 1080,
    height: 1080,
    background: '#1a3a5c',
    elements: [
      { id: 'overlay-top', type: 'shape', x: 0, y: 0, width: 1080, height: 200,
        props: { fill: 'rgba(0,0,0,0.45)', cornerRadius: 0 } },
      { id: 'overlay-bottom', type: 'shape', x: 0, y: 620, width: 1080, height: 460,
        props: { fill: 'rgba(20,60,120,0.82)', cornerRadius: 0 } },
      { id: 'wave', type: 'shape', x: 0, y: 570, width: 1080, height: 100,
        props: { fill: 'rgba(20,60,120,0.5)', cornerRadius: 0 } },
      { id: 'logo-icon', type: 'shape', x: 60, y: 56, width: 44, height: 44,
        props: { fill: WHITE, cornerRadius: 4 } },
      { id: 'logo-text', type: 'text', x: 116, y: 64, width: 400, height: 40,
        props: { text: 'NOME DA MARCA', fontSize: 24, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, letterSpacing: 2, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 60, y: 640, width: 960, height: 220,
        props: { text: 'Este Dia,\nCelebramos Você', fontSize: 100, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 890, width: 960, height: 56,
        props: { text: 'Porque cada conquista merece reconhecimento', fontSize: 26, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, wrap: 'none', autoFit: true } },
    ],
  }

  const hg9x16: Template = {
    id: 'hero-gradient-9x16',
    name: 'Palco de Marca — 9:16',
    category: 'instagram-story',
    width: 1080,
    height: 1920,
    background: '#1a3a5c',
    elements: [
      { id: 'overlay-top', type: 'shape', x: 0, y: 0, width: 1080, height: 280,
        props: { fill: 'rgba(0,0,0,0.45)', cornerRadius: 0 } },
      { id: 'overlay-bottom', type: 'shape', x: 0, y: 1260, width: 1080, height: 660,
        props: { fill: 'rgba(20,60,120,0.82)', cornerRadius: 0 } },
      { id: 'wave', type: 'shape', x: 0, y: 1180, width: 1080, height: 140,
        props: { fill: 'rgba(20,60,120,0.5)', cornerRadius: 0 } },
      { id: 'logo-icon', type: 'shape', x: 60, y: 80, width: 52, height: 52,
        props: { fill: WHITE, cornerRadius: 4 } },
      { id: 'logo-text', type: 'text', x: 126, y: 90, width: 500, height: 46,
        props: { text: 'NOME DA MARCA', fontSize: 28, fontFamily: BODY, fontStyle: 'bold', lineHeight: 1, align: 'left', fill: WHITE, letterSpacing: 2, wrap: 'none' } },
      { id: 'headline', type: 'text', x: 60, y: 1290, width: 960, height: 340,
        props: { text: 'Este Dia,\nCelebramos Você', fontSize: 140, fontFamily: HEADING, fontStyle: 'bold', lineHeight: 1.05, align: 'center', fill: WHITE, wrap: 'word', autoFit: true } },
      { id: 'subtitle', type: 'text', x: 60, y: 1670, width: 960, height: 70,
        props: { text: 'Porque cada conquista merece reconhecimento', fontSize: 32, fontFamily: BODY, fontStyle: 'normal', lineHeight: 1, align: 'center', fill: MUTED, wrap: 'none', autoFit: true } },
    ],
  }

  return [hg4x5, hg1x1, hg9x16]
}
