import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-slate-50 via-white to-violet-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
        <div className="max-w-3xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-16 animate-fade-up">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-indigo-500/30 animate-float">
              🔊
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              About <span className="gradient-text">Voxify</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              A fast, smart, and beautifully simple text-to-speech tool built entirely in the browser.
            </p>
          </div>

          {/* Story */}
          <div className="space-y-6 animate-fade-up-1">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span> The Story
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Voxify was built to prove that a powerful TTS tool doesn't need a backend, a subscription, or a complex setup. Everything runs in your browser using the Web Speech API — instant, private, and free.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🛠</span> Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {['React 18', 'Vite', 'Tailwind CSS v4', 'Web Speech API', 'React Router', 'localStorage'].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">👨‍💻</span> Built by MultiMian
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Crafted with care by <strong className="text-gray-900 dark:text-white">Mian Hassam</strong> — developer, designer, and builder of useful things.
              </p>
              <a
                href="https://github.com/Mianhassam96"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:scale-105 transition-all"
              >
                <span>⭐</span> GitHub — @Mianhassam96
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 animate-fade-up-2">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all duration-200"
            >
              🎙 Try Voxify
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
