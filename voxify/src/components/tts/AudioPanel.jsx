import { useState, useRef, useEffect, useCallback } from 'react'
import { useDownload } from '../../hooks/useDownload'

export function AudioPanel({ text, lang }) {
  const { status, progress, error, audioBlob, blobUrl, generateAudio, downloadMp3, cancel, reset } = useDownload()
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const audioRef = useRef(null)

  const isFetching = status === 'fetching'
  const isReady = status === 'ready'
  const isError = status === 'error'

  // Reset when text changes
  useEffect(() => {
    reset()
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = useCallback(async () => {
    if (!text?.trim()) return
    await generateAudio({ text, lang })
  }, [text, lang, generateAudio])

  const handleCopyLink = useCallback(async () => {
    if (!blobUrl) return
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(blobUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard API blocked — show the URL in a prompt as fallback
      try {
        window.prompt('Copy this audio link:', blobUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        setCopyError(true)
        setTimeout(() => setCopyError(false), 3000)
      }
    }
  }, [blobUrl])

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Audio Export</span>
        {isReady && (
          <span className="ml-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </span>
        )}
      </div>

      <div className="px-5 pb-5 space-y-3">

        {/* Idle / Error state */}
        {(status === 'idle' || isError) && (
          <>
            {isError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                <span className="text-base mt-0.5">⚠️</span>
                <div>
                  <p className="font-semibold">Generation failed</p>
                  <p className="text-xs mt-0.5 opacity-80">Check your internet connection and try again.</p>
                </div>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!text?.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              <span className="text-base">🎵</span>
              Generate MP3 Audio
            </button>
            <p className="text-xs text-center text-gray-400 dark:text-gray-600">
              Powered by Google TTS · Works on all devices
            </p>
          </>
        )}

        {/* Fetching state */}
        {isFetching && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Generating audio...</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{progress}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-2">
                {progress < 30 ? 'Connecting to TTS service...' : progress < 80 ? 'Processing text chunks...' : 'Merging audio...'}
              </p>
            </div>
            <button
              onClick={cancel}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Ready state */}
        {isReady && (
          <div className="space-y-3">
            {/* Native audio player */}
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 p-3">
              <audio
                ref={audioRef}
                src={blobUrl}
                controls
                className="w-full"
                style={{ height: '36px', colorScheme: 'light dark' }}
              />
            </div>

            {/* Download MP3 */}
            <button
              onClick={() => downloadMp3(audioBlob)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>⬇</span> Download MP3
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 border flex items-center justify-center gap-2
                ${copied
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                  : copyError
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
            >
              {copied ? '✅ Link Copied!' : copyError ? '❌ Copy failed' : '🔗 Copy Audio Link'}
            </button>

            {/* Session note + regenerate */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Link valid for this session
              </p>
              <button
                onClick={() => { reset(); setTimeout(handleGenerate, 50) }}
                className="text-xs text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                🔄 Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
