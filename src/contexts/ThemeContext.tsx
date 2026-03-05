import { createContext, useContext, useState } from 'react'
import type { Theme } from '../themes'
import { defaultTheme, themes as allThemes } from '../themes'

interface ThemeContextValue {
  /** Tema atualmente ativo. */
  theme: Theme
  /** Lista de todos os temas disponíveis. */
  themes: Theme[]
  /** Troca o tema ativo pelo id fornecido. */
  setThemeId: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<string>(defaultTheme.id)

  const theme = allThemes.find((t) => t.id === themeId) ?? defaultTheme

  return (
    <ThemeContext.Provider value={{ theme, themes: allThemes, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Hook que retorna o tema ativo e funções de controle. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
