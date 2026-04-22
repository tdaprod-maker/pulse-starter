import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Topbar } from './components/Topbar'
import { EditorPage } from './pages/EditorPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { LoginPage } from './pages/LoginPage'
import { IntroPage } from './pages/IntroPage'
import { BrandPage } from './pages/BrandPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { CarouselPage } from './pages/CarouselPage'
import { VideoPage } from './pages/VideoPage'
import { CarouselLibraryPage } from './pages/CarouselLibraryPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { AdminPage } from './pages/AdminPage'
import { AccountPage } from './pages/AccountPage'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session?.user?.email) {
        const { data: brandData, error: brandError } = await supabase
          .from('brand_config')
          .select('id')
          .eq('user_email', data.session.user.email)
          .maybeSingle()
        const hasOnboarded = brandData !== null && !brandError
        if (!hasOnboarded && window.location.pathname !== '/onboarding') {
          window.location.href = '/onboarding'
        }
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null
  if (!session) {
    if (showIntro) return <IntroPage onFinish={() => setShowIntro(false)} />
    return <LoginPage />
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
          <Topbar />
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/carousel" element={<CarouselPage />} />
            <Route path="/carousel-library" element={<CarouselLibraryPage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/brand" element={<BrandPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
