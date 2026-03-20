import { memo, useState } from 'react'

export const TextStats = memo(function TextStats({ text, onClean }) {
  const [copied, setCopied] = useState(false)

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
  const readingTimeSec = Math.ceil((words / 150) * 60) // avg 150 wpm reading
  const speakTimeSec = Math.ceil((words / 130) * 60)   // avg 130 wpm speaking

  const fmt = (s) => s >= 60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`

  const handleCopy = async () => {
    if (!text.trim()) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4 space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Words', val: words },
          { label: 'Chars', val: chars },
          { label: 'Sentences', val: sentences },
          { label: 'Read time', val: fmt(readingTimeSec) },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-xl bg-white/70 dark:bg-gray-800/50">
            <div className="text-base font-black text-indigo-600 dark:text-indigo-400">{s.val}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Speak time */}
      {words > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-1">
          <span>🎙</span>
          <span>Estimated speak time: <strong className="text-indigo-600 dark:text-indigo-400">{fmt(speakTimeSec)}</strong></span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!text.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-40"
        >
          {copied ? '✅ Copied!' : '📋 Copy text'}
        </button>
        <button
          onClick={onClean}
          disabled={!text.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-40"
          title="Remove extra spaces, fix punctuation"
        >
          ✨ Clean text
        </button>
      </div>
    </div>
  )
})
