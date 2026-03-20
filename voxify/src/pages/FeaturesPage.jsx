import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'

const FEATURES = [
  { icon: '🧠', title: 'Smart Play', desc: 'Auto-detects language from your text and selects the best matching voice automatically. No manual setup needed.', color: 'from-indigo-500 to-violet-500' },
  { icon: '🌍', title: 'Multi-language', desc: 'Supports English, Urdu, Arabic, Chinese, Japanese, Hindi and more. Detects script automatically.', color: 'from-sky-500 to-cyan-500' },
  { icon: '🎧', title: 'Word Highlight', desc: 'Real-time word-by-word highlighting as speech plays. Follow along with every word.', color: 'from-violet-500 to-pink-500' },
  { icon: '⚡', title: 'Presets', desc: 'One-click presets: Normal, Fast, Slow, Podcast. Instantly apply and play without touching sliders.', color: 'from-amber-500 to-orange-500' },
  { icon: '🎚', title: 'Advanced Controls', desc: 'Fine-tune voice, speed (0.5×–2×), and pitch. All settings persist across sessions via localStorage.', color: 'from-emerald-500 to-teal-500' },
  { icon: '🧾', title: 'History', desc: 'Last 8 texts auto-saved locally. Click any entry to instantly reload and replay.', color: 'from-rose-500 to-pink-500' },
  { icon: '⬇', title: 'Download Audio', desc: 'Record your speech output and download as .webm audio. Works in Chrome and Edge.', color: 'from-indigo-500 to-sky-500' },
  { icon: '🌙', title: 'Dark Mode', desc: 'Full dark mode with system preference detection. Flicker-free with inline script injection.', color: 'from-slate-500 to-gray-600' },
  { icon: '⌨', title: 'Keyboard Shortcuts', desc: 'Ctrl+Enter to play, Esc to stop. Stay in flow without reaching for the mouse.', color: 'from-violet-500 to-indigo-500' },
]

export default function FeaturesPage() {
  return (
    <>
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
              ✨ Everything included
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Packed with <span className="gradient-text">powerful features</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              No subscriptions. No limits. Everything runs in your browser.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl glass-card hover:scale-[1.02] hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${f.color} opacity-5 group-hover:opacity-10 transition-opacity blur-2xl`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 animate-fade-up-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all duration-200 active:scale-95"
            >
              🎙 Try it now — it's free
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
