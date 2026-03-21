import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800/60 bg-white/40 dark:bg-[#030712]/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="mb-3">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Turn any text into natural-sounding voice instantly. Fast, smart, and beautifully simple.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/app" className="hover:text-indigo-500 transition-colors">Try Mianova</Link></li>
              <li><Link to="/features" className="hover:text-indigo-500 transition-colors">Features</Link></li>
              <li><Link to="/about" className="hover:text-indigo-500 transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Built by</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">MultiMian</p>
            <a href="https://github.com/Mianhassam96" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium">
              ⭐ @Mianhassam96
            </a>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800/60 flex justify-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">© {new Date().getFullYear()} Mianova by MultiMian. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
