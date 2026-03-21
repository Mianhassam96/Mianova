import { memo } from 'react'

export const AdvancedControls = memo(function AdvancedControls({
  voices, selectedVoice, setSelectedVoice,
  rate, setRate, pitch, setPitch, volume, setVolume
}) {
  const sliders = [
    { label: 'Speed', icon: '⚡', val: rate, set: setRate, min: 0.5, max: 2, step: 0.1, fmt: v => `${v}×`, lo: '0.5×', hi: '2×' },
    { label: 'Pitch', icon: '🎵', val: pitch, set: setPitch, min: 0.5, max: 2, step: 0.1, fmt: v => `${v}`, lo: 'Low', hi: 'High' },
    { label: 'Volume', icon: '🔊', val: volume, set: setVolume, min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%`, lo: '0%', hi: '100%' },
  ]

  return (
    <div className="space-y-5">
      {/* Voice selector */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          <span>🎤</span> Voice
        </label>
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value) || null)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition-colors"
        >
          <option value="">🤖 Auto (detect language)</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>{v.name} — {v.lang}</option>
          ))}
        </select>
      </div>

      {/* Sliders */}
      {sliders.map(({ label, icon, val, set, min, max, step, fmt, lo, hi }) => {
        const pct = ((val - min) / (max - min)) * 100
        return (
          <div key={label}>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <span>{icon}</span> {label}
              </label>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg">
                {fmt(val)}
              </span>
            </div>
            <input
              type="range" min={min} max={max} step={step} value={val}
              onChange={(e) => set(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full accent-indigo-600 cursor-pointer"
              style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)` }}
            />
            <div className="flex justify-between text-xs text-gray-300 dark:text-gray-700 mt-1">
              <span>{lo}</span><span>{hi}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
