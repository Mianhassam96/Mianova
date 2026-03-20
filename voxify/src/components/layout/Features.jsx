const FEATURES = [
  { icon: '🧠', title: 'Smart Play', desc: 'Auto-detects language and picks the best voice automatically.', color: 'from-indigo-500 to-violet-500' },
  { icon: '🌍', title: 'Multi-language', desc: 'English, Urdu, Arabic, Chinese, Japanese, Hindi and more.', color: 'from-sky-500 to-cyan-500' },
  { icon: '🎧', title: 'Word Highlight', desc: 'Real-time word-by-word highlighting as speech plays.', color: 'from-violet-500 to-pink-500' },
  { icon: '⚡', title: 'Presets', desc: 'Normal, Fast, Slow, Podcast — one click to apply and play.', color: 'from-amber-500 to-orange-500' },
  { icon: '🧾', title: 'History', desc: 'Last 8 texts saved locally. Click to reload and replay.', color: 'from-rose-500 to-pink-500' },
  { icon: '⬇', title: 'Download', desc: 'Record and download your speech as audio.', color: 'from-emerald-500 to-teal-500' },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent dark:via-indigo-950/10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
            ✨ Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
            Everything you need,<br />
            <span className="gradient-text">nothing you don't</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-6 rounded-2xl glass-card hover:scale-[1.03] hover:shadow-xl transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${f.color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity`} />
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
