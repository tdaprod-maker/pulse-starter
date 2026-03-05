// ─── Theme interface ──────────────────────────────────────────────────────────

export interface ThemeColors {
  /** Fundo principal (escuro). */
  primary: string
  /** Fundo secundário (claro), usado no Editorial Card. */
  secondary: string
  /** Accent primário (azul). */
  accent: string
  /** Accent alternativo (amarelo), usado no Big Statement. */
  accentAlt: string
  /** Accent coral, usado no Editorial Card. */
  coral: string
  /** Texto sobre fundo escuro. */
  text: string
  /** Texto secundário / muted. */
  textSecondary: string
  /** Texto sobre fundo claro. */
  textOnLight: string
}

export interface ThemeFonts {
  /** Fonte de títulos e display. */
  heading: string
  /** Fonte de corpo / captions. */
  body: string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
}

// ─── Tema padrão — design system atual do Pulse ───────────────────────────────

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Pulse Default',
  colors: {
    primary:       '#0C0C0D',
    secondary:     '#FFFFFF',
    accent:        '#3A5AFF',
    accentAlt:     '#FFCA1D',
    coral:         '#FF6F5E',
    text:          '#FFFFFF',
    textSecondary: '#6D6D6E',
    textOnLight:   '#0C0C0D',
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body:    'Inter, sans-serif',
  },
}

/** Lista de todos os temas disponíveis. Adicione novos temas aqui. */
export const themes: Theme[] = [defaultTheme]
