import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useSpeech } from '../hooks/useSpeech'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { TextArea } from '../components/tts/TextArea'
import { SmartPlay } from '../components/tts/SmartPlay'
import { Presets } from '../components/tts/Presets'
import { DownloadButton } from '../components/tts/DownloadButton'
import { TextStats } from '../components/tts/TextStats'
import { Waveform } from '../components/animations/Waveform'
import { detectLang, findBestVoice, cleanText } from '../utils/language'

const AdvancedControls = lazy(() =>
  import('../components/tts/AdvancedControls').then(m => ({ default: m.AdvancedControls }))
)

const MAX_CHARS = 5000

export default function AppPage() {
  const { voices, isSpeaking, isPaused, speak, pause, resume, stop } = useSpeech()
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useLocalStorage('mianova_rate', 1)
  const [pitch, setPitch] = useLocalStorage('mianova_pitch', 1)
  const [volume, setVolume] = useLocalStorage('mianova_volume', 1)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [activePreset, setActivePreset] = useState('Normal')
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [detectedLang, setDetectedLang] = useState('')

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])

  // Detect language live
  useEffect(() => {
    if (!text.trim()) { setDetectedLang(''); return }
    const lang = detectLang(text)
    const labels = { en: '🇬🇧 English', ur: '🇵🇰 Urdu', ar: '🇸🇦 Arabic', zh: '🇨🇳 Chinese', ja: '🇯🇵 Japanese', hi: '🇮🇳 Hindi' }
    setDetectedLang(labels[lang] || lang)
  }, [text])

  const smartPlay = useCallback(() => {
    const cleaned = cleanText(text)
    if (!cleaned) return
    const lang = detectLang(cleaned)
    const voice = selectedVoice || findBestVoice(voices, lang)
    speak({ text: cleaned, voice, rate, pitch, volume, onBoundary: idx => setHighlightIndex(idx) })
  }, [text, voices, rate, pitch, volume, selectedVoice, speak])

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

  const handleTextChange = useCallback((t) => {
    setText(t.slice(0, MAX_CHARS))
    if (isSpeaking) stop()
  }, [isSpeaking, stop])

  const handleClean = useCallback(() => {
    setText(prev =>
      prev
        .replace(/\s+/g, ' ')           // collapse whitespace
        .replace(/([.!?,;:])\s*/g, '$1 ') // fix spacing after punctuation
        .replace(/\s+([.!?,;:])/g, '$1')  // remove space before punctuation
        .trim()
    )
  }, [])

  const charPct = (text.length / MAX_CHARS) * 100

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-[#030712] dark:via-[#0f172a] dark:to-[#0c0a1e] relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-violet-100/50 dark:bg-violet-900/10 rounded-full blur-3xl animate-float2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="text-center animate-fade-up mb-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            <span className="gradient-text">Mianova</span> Studio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Paste text · Hit play · Hear it instantly</p>
        </div>

        {/* Live status bar */}
        {isSpeaking && (
          <div className="animate-scale-in glass-card rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="h-8 flex-1">
              <Waveform active={!isPaused} bars={40} className="h-full" />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
              {isPaused ? '⏸ Paused' : '🎙 Speaking...'}
            </span>
          </div>
        )}

        {/* Main card */}
        <div className="gradient-border rounded-3xl animate-fade-up-1">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">

            {/* Lang badge */}
            {detectedLang && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  {detectedLang}
                </span>
                <span className="text-xs text-gray-400">detected</span>
              </div>
            )}

            {/* TextArea + char bar */}
            <div className="space-y-1.5">
              <TextArea
                text={text}
                setText={handleTextChange}
                highlightIndex={highlightIndex}
                words={words}
              />
              {/* Char progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${charPct > 90 ? 'bg-red-400' : charPct > 70 ? 'bg-amber-400' : 'bg-indigo-400'}`}
                    style={{ width: `${charPct}%` }}
                  />
                </div>
                <span className={`text-xs tabular-nums font-medium ${charPct > 90 ? 'text-red-400' : 'text-gray-400'}`}>
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
            </div>

            {/* Stats */}
            <TextStats text={text} onClean={handleClean} />

            {/* Presets */}
            <Presets onSelect={handlePreset} active={activePreset} />

            {/* Smart Play */}
            <SmartPlay
              isSpeaking={isSpeaking}
              isPaused={isPaused}
              onPlay={smartPlay}
              onPause={pause}
              onResume={resume}
              onStop={stop}
              disabled={!text.trim()}
            />

            {/* Bottom row */}
            <div className="flex items-center gap-2 flex-wrap">
              <DownloadButton
                text={cleanText(text)}
                lang={detectLang(text)}
              />
              <button
                onClick={() => setIsAdvanced(v => !v)}
                className="ml-auto text-xs text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
              >
                <span>{isAdvanced ? '▲' : '⚙'}</span>
                {isAdvanced ? 'Less' : 'Advanced'}
              </button>
            </div>

            {/* Advanced */}
            {isAdvanced && (
              <Suspense fallback={<div className="h-48 rounded-2xl bg-gray-50 dark:bg-gray-800/50 animate-pulse" />}>
                <AdvancedControls
                  voices={voices}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                  rate={rate} setRate={setRate}
                  pitch={pitch} setPitch={setPitch}
                  volume={volume} setVolume={setVolume}
                />
              </Suspense>
            )}
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="flex items-center justify-center gap-4 animate-fade-up-3">
          {[['Ctrl+Enter', 'Play'], ['Esc', 'Stop'], ['⚙', 'Advanced']].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
              <kbd className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-gray-500 dark:text-gray-400">{key}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
