import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Topbar } from './components/Topbar'
import { EditorPage } from './pages/EditorPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { LoginPage } from './pages/LoginPage'
import { BrandPage } from './pages/BrandPage'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (!session) return <LoginPage />

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
          <Topbar />
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/brand" element={<BrandPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
