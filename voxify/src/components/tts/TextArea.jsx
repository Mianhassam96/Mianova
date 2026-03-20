import { memo } from 'react'

export const TextArea = memo(function TextArea({ text, setText, highlightIndex, words }) {
  // Speaking mode — show highlighted words
  if (highlightIndex >= 0 && words.length > 0) {
    let charCount = 0
    return (
      <div className="w-full min-h-[180px] p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-base leading-relaxed whitespace-pre-wrap break-words">
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
                  : ''
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
      placeholder="Paste or type your text here..."
      rows={7}
      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 text-base leading-relaxed transition-colors"
    />
  )
})
