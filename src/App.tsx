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

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session?.user?.email) {
        await checkOnboarding(data.session.user.email)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s)
      if (s?.user?.email) {
        await checkOnboarding(s.user.email)
      } else {
        setHasOnboarded(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkOnboarding(email: string) {
    const { data: brandData } = await supabase
      .from('brand_config')
      .select('id')
      .eq('user_email', email)
      .maybeSingle()
    setHasOnboarded(brandData !== null)
    setLoading(false)
  }

  if (loading || (session && hasOnboarded === null)) return null
  if (!session) {
    if (showIntro) return <IntroPage onFinish={() => setShowIntro(false)} />
    return <LoginPage />
  }
  return (
    <ThemeProvider>
      <BrowserRouter>
        {hasOnboarded === false && <OnboardingPage onComplete={() => setHasOnboarded(true)} />}
        {hasOnboarded === true && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
          <Topbar />
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/carousel" element={<CarouselPage />} />
            <Route path="/carousel-library" element={<CarouselLibraryPage />} />
            <Route path="/brand" element={<BrandPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage onComplete={() => setHasOnboarded(true)} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/video" element={<VideoPage />} />
          </Routes>
        </div>
        )}
      </BrowserRouter>
    </ThemeProvider>
  )
}
