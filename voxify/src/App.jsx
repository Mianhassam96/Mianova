import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import AppPage from './pages/AppPage'
import FeaturesPage from './pages/FeaturesPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <BrowserRouter basename="/Voxify">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  )
}
