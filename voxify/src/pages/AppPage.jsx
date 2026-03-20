import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useSpeech } from '../hooks/useSpeech'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { TextArea } from '../components/tts/TextArea'
import { SmartPlay } from '../components/tts/SmartPlay'
import { Presets } from '../components/tts/Presets'
import { History } from '../components/tts/History'
import { DownloadButton } from '../components/tts/DownloadButton'
import { Waveform } from '../components/animations/Waveform'
import { detectLang, findBestVoice, cleanText } from '../utils/language'

const AdvancedControls = lazy(() =>
  import('../components/tts/AdvancedControls').then(m => ({ default: m.AdvancedControls }))
)

export default function AppPage() {
  const { voices, isSpeaking, isPaused, speak, pause, resume, stop } = useSpeech()
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useLocalStorage('voxify_rate', 1)
  const [pitch, setPitch] = useLocalStorage('voxify_pitch', 1)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [activePreset, setActivePreset] = useState('Normal')
  const [history, setHistory] = useLocalStorage('voxify_history', [])
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])

  const smartPlay = useCallback(() => {
    const cleaned = cleanText(text)
    if (!cleaned) return
    const lang = detectLang(cleaned)
    const voice = selectedVoice || findBestVoice(voices, lang)
    speak({ text: cleaned, voice, rate, pitch, onBoundary: idx => setHighlightIndex(idx) })
    setHistory(prev => [cleaned, ...prev.filter(h => h !== cleaned)].slice(0, 8))
  }, [text, voices, rate, pitch, selectedVoice, speak, setHistory])

  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); smartPlay() }
      if (e.key === 'Escape') stop()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [smartPlay, stop])

  useEffect(() => { if (!isSpeaking) setHighlightIndex(-1) }, [isSpeaking])

  const handlePreset = useCallback(({ label, rate: r, pitch: p }) => {
    setRate(r); setPitch(p); setActivePreset(label)
  }, [setRate, setPitch])

  const handleTextChange = useCallback((t) => { setText(t); if (isSpeaking) stop() }, [isSpeaking, stop])
  const handleHistorySelect = useCallback((item) => { setText(item); stop() }, [stop])
  const handleHistoryClear = useCallback(() => setHistory([]), [setHistory])

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100/60 dark:bg-indigo-900/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-violet-100/60 dark:bg-violet-900/10 rounded-full blur-3xl animate-float2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="text-center animate-fade-up mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            <span className="gradient-text">Voxify</span> Studio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Paste text · Hit play · Hear it instantly</p>
        </div>

        {/* Speaking status bar */}
        {isSpeaking && (
          <div className="animate-scale-in glass-card rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="h-8 flex-1">
              <Waveform active={!isPaused} bars={36} className="h-full" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
              {isPaused ? '⏸ Paused' : '🎙 Speaking...'}
            </span>
          </div>
        )}

        {/* Main card */}
        <div className="gradient-border rounded-3xl animate-fade-up-1">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">

            <TextArea
              text={text}
              setText={handleTextChange}
              highlightIndex={highlightIndex}
              words={words}
            />

            <Presets onSelect={handlePreset} active={activePreset} />

            <SmartPlay
              isSpeaking={isSpeaking}
              isPaused={isPaused}
              onPlay={smartPlay}
              onPause={pause}
              onResume={resume}
              onStop={stop}
              disabled={!text.trim()}
            />

            <div className="flex items-center gap-2 flex-wrap">
              <DownloadButton onRequestPlay={smartPlay} isSpeaking={isSpeaking} text={text} />
              <button
                onClick={() => setIsAdvanced(v => !v)}
                className="ml-auto text-xs text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
              >
                <span>{isAdvanced ? '▲' : '⚙'}</span>
                {isAdvanced ? 'Less' : 'Advanced'}
              </button>
            </div>

            {isAdvanced && (
              <Suspense fallback={<div className="h-36 rounded-2xl bg-gray-50 dark:bg-gray-800/50 animate-pulse" />}>
                <AdvancedControls
                  voices={voices}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                  rate={rate}
                  setRate={setRate}
                  pitch={pitch}
                  setPitch={setPitch}
                />
              </Suspense>
            )}
          </div>
        </div>

        {/* History */}
        <div className="glass-card rounded-2xl p-5 animate-fade-up-2">
          <History history={history} onSelect={handleHistorySelect} onClear={handleHistoryClear} />
        </div>

        <p className="text-center text-xs text-gray-300 dark:text-gray-700 select-none animate-fade-up-3">
          Ctrl+Enter to play · Esc to stop
        </p>
      </div>
    </div>
  )
}
