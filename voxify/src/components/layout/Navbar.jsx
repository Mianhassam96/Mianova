import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DarkModeToggle } from '../ui/DarkModeToggle'
import { Logo } from '../ui/Logo'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'App', to: '/app' },
  { label: 'Features', to: '/features' },
  { label: 'About', to: '/about' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [location])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass dark:glass-dark shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Logo />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, to }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    active
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-indigo-900/30" />
                  )}
                  <span className="relative">{label}</span>
                  {!active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500 rounded-full transition-all duration-300 group-hover:w-4" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Link
              to="/app"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95"
            >
              <span>🎙</span> Try Now
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              <span className={`w-4 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-4 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`w-4 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="glass dark:glass-dark border-t border-white/20 dark:border-white/5 px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === to
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link to="/app" className="block mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold text-center">
              🎙 Try Mianova
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}
