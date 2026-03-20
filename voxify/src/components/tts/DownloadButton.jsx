import { useState } from 'react'
import { useDownload } from '../../hooks/useDownload'

export function DownloadButton({ text, voice, rate, pitch, volume }) {
  const { status, progress, downloadSpeech, cancel } = useDownload()
  const [showGuide, setShowGuide] = useState(false)

  const isActive = status !== 'idle'

  const handleClick = async () => {
    if (isActive) { cancel(); return }
    setShowGuide(false)

    const result = await downloadSpeech({ text, voice, rate, pitch, volume })

    if (result === 'no-audio') {
      setShowGuide(true)
    } else if (result === 'error') {
      alert('Download failed. Please use Chrome or Edge browser.')
    }
    // 'cancelled' = user closed dialog, do nothing
  }

  const statusLabel = {
    idle: '⬇ Download Audio',
    waiting: '⏳ Waiting...',
    recording: `🔴 Recording ${progress}%`,
    saving: '💾 Saving...',
  }[status]

  return (
    <div className="relative">
      {/* Guide tooltip */}
      {showGuide && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 shadow-xl z-50 text-xs space-y-2">
          <div className="font-bold text-gray-800 dark:text-white flex items-center justify-between">
            <span>📋 How to download audio</span>
            <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <ol className="space-y-1.5 text-gray-600 dark:text-gray-300 list-decimal list-inside">
            <li>Click <strong>Download Audio</strong> again</li>
            <li>A screen share dialog will appear</li>
            <li>Select <strong>"This Tab"</strong> or <strong>"Chrome Tab"</strong></li>
            <li>✅ Check <strong>"Share tab audio"</strong> checkbox</li>
            <li>Click <strong>Share</strong> — recording starts automatically</li>
          </ol>
          <p className="text-gray-400 dark:text-gray-500 pt-1">Works in Chrome & Edge only.</p>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={!text?.trim() && !isActive}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed
          ${isActive
            ? 'bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        title={isActive ? 'Cancel' : 'Download speech as audio'}
      >
        {/* Progress fill */}
        {isActive && (
          <div
            className="absolute inset-0 bg-white/20 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        )}
        <span className="relative">{statusLabel}</span>
      </button>
    </div>
  )
}
