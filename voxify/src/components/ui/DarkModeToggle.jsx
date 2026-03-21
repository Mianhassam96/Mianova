import { useEffect, useState } from 'react'

function getInitialDark() {
  try {
    const stored = localStorage.getItem('mianova_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function DarkModeToggle() {
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try { localStorage.setItem('mianova_theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700/50 hover:scale-110 active:scale-95"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <span className="transition-transform duration-300" style={{ display: 'inline-block', transform: dark ? 'rotate(0deg)' : 'rotate(180deg)' }}>
        {dark ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
