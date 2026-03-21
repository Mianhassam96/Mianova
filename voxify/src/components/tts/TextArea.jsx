import { memo } from 'react'

export const TextArea = memo(function TextArea({ text, setText, highlightIndex, words }) {
  // Speaking mode — word highlight view
  if (highlightIndex >= 0 && words.length > 0) {
    let charCount = 0
    return (
      <div className="w-full min-h-[220px] sm:min-h-[280px] p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 text-base leading-relaxed whitespace-pre-wrap break-words overflow-y-auto">
        {words.map((word, i) => {
          const start = charCount
          charCount += word.length + 1
          const isActive = start <= highlightIndex && highlightIndex < start + word.length
          return (
            <span
              key={i}
              className={`transition-all duration-75 ${
                isActive
                  ? 'bg-indigo-500 text-white rounded px-0.5 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {word}{' '}
            </span>
          )
        })}
      </div>
    )
  }

  // Edit mode
  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Paste or type your text here...&#10;&#10;Supports English, Urdu, Arabic, Chinese, Japanese, Hindi and more."
      rows={10}
      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/60 dark:focus:ring-indigo-600/60 focus:border-indigo-300 dark:focus:border-indigo-700 text-base leading-relaxed transition-all duration-200 min-h-[220px] sm:min-h-[280px]"
    />
  )
})
