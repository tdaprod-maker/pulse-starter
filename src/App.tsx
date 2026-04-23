import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Topbar } from './components/Topbar'
import { EditorPage } from './pages/EditorPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { LoginPage } from './pages/LoginPage'
import { BrandPage } from './pages/BrandPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { CarouselPage } from './pages/CarouselPage'
import { CarouselLibraryPage } from './pages/CarouselLibraryPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { AdminPage } from './pages/AdminPage'
import { AccountPage } from './pages/AccountPage'
import { VideoPage } from './pages/VideoPage'
import { IntroPage } from './pages/IntroPage'
import { supabase } from './lib/supabase'

type AppState = 'intro' | 'login' | 'checking' | 'onboarding' | 'app'

export default function App() {
  const [appState, setAppState] = useState<AppState>('intro')

  async function checkAndRoute() {
    setAppState('checking')
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user?.email) {
      setAppState('login')
      return
    }
    const email = data.session.user.email
    const { data: brandData } = await supabase
      .from('brand_config')
      .select('id')
      .eq('user_email', email)
      .maybeSingle()
    setAppState(brandData ? 'app' : 'onboarding')
  }

  if (appState === 'intro') return <IntroPage onFinish={checkAndRoute} />
  if (appState === 'checking') return null
  if (appState === 'login') return <LoginPage onLogin={checkAndRoute} />
  if (appState === 'onboarding') return (
    <BrowserRouter>
      <OnboardingPage onComplete={() => setAppState('app')} />
    </BrowserRouter>
  )

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
            <Route path="/brand" element={<BrandPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage onComplete={() => setAppState('app')} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/video" element={<VideoPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
