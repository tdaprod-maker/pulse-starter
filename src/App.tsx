import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Topbar } from './components/Topbar'
import { EditorPage } from './pages/EditorPage'
import { TemplatesPage } from './pages/TemplatesPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen bg-gray-900">
          <Topbar />
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
