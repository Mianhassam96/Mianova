import { Link } from 'react-router-dom'
import { Waveform } from '../animations/Waveform'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden">

      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950" />
        {/* Morphing blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl animate-morph" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-violet-200/40 dark:bg-violet-900/20 rounded-full blur-3xl animate-morph" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/30 dark:bg-sky-900/10 rounded-full blur-3xl animate-float" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-32 left-16 w-3 h-3 rounded-full bg-indigo-400 animate-float opacity-60" />
      <div className="absolute top-48 right-24 w-2 h-2 rounded-full bg-violet-400 animate-float2 opacity-50" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-32 w-4 h-4 rounded-full bg-sky-400 animate-float opacity-40" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 right-16 w-2 h-2 rounded-full bg-indigo-300 animate-float2 opacity-60" style={{ animationDelay: '0.5s' }} />

      {/* Badge */}
      <div className="animate-fade-up mb-6">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass dark:glass-dark text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Powered by Web Speech API · 100% Free
        </span>
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up-1 text-5xl sm:text-6xl md:text-7xl font-black text-center leading-[1.05] tracking-tight max-w-4xl">
        <span className="text-gray-900 dark:text-white">Turn Text into</span>
        <br />
        <span className="gradient-text-animated">Natural Voice</span>
        <br />
        <span className="text-gray-900 dark:text-white">Instantly</span>
      </h1>

      {/* Sub */}
      <p className="animate-fade-up-2 mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 text-center max-w-2xl leading-relaxed">
        The smartest browser-based TTS tool. Multi-language, real-time word highlighting, presets, history — all in one beautiful interface.
      </p>

      {/* CTAs */}
      <div className="animate-fade-up-3 mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link
          to="/app"
          className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient text-white text-lg font-bold shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">🎙 Start Speaking</span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          to="/features"
          className="px-6 py-4 rounded-2xl glass dark:glass-dark text-gray-700 dark:text-gray-300 font-semibold hover:scale-105 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
        >
          Explore features →
        </Link>
      </div>

      {/* Stats */}
      <div className="animate-fade-up-4 mt-14 flex flex-wrap justify-center gap-8">
        {[
          { val: '50+', label: 'Voices' },
          { val: '10+', label: 'Languages' },
          { val: '0ms', label: 'Latency' },
          { val: '100%', label: 'Free' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-black gradient-text">{s.val}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Waveform */}
      <div className="animate-fade-up-5 mt-16 w-full max-w-lg h-14 opacity-40">
        <Waveform active={true} bars={48} className="h-full" />
      </div>

      {/* Scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40">
        <span className="text-xs text-gray-400 font-medium">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-gray-400 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
