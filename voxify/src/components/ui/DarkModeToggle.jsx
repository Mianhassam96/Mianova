import { useEffect, useState } from 'react'

function getInitialDark() {
  const stored = localStorage.getItem('voxify_theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
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
    localStorage.setItem('voxify_theme', dark ? 'dark' : 'light')
  }, [dark])

  // Apply on first mount before paint
  useEffect(() => {
    if (getInitialDark()) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
