import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useSpeech } from '../hooks/useSpeech'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { TextArea } from '../components/tts/TextArea'
import { Presets } from '../components/tts/Presets'
import { AudioPanel } from '../components/tts/AudioPanel'
import { History } from '../components/tts/History'
import { Waveform } from '../components/animations/Waveform'
import { Footer } from '../components/layout/Footer'
import { detectLang, findBestVoice, cleanText } from '../utils/language'

const AdvancedControls = lazy(() =>
  import('../components/tts/AdvancedControls').then(m => ({ default: m.AdvancedControls }))
)

const MAX_CHARS = 5000

const LANG_LABELS = {
  en: '🇬🇧 English',
  ur: '🇵🇰 Urdu',
  ar: '🇸🇦 Arabic',
  zh: '🇨🇳 Chinese',
  ja: '🇯🇵 Japanese',
  hi: '🇮🇳 Hindi',
}

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
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useLocalStorage('mianova_history', [])

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])
  const wordCount = words.length
  const charPct = (text.length / MAX_CHARS) * 100
  const speakSec = Math.ceil((wordCount / 130) * 60)
  const fmtTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`

  useEffect(() => {
    if (!text.trim()) { setDetectedLang(''); return }
    const lang = detectLang(text)
    setDetectedLang(LANG_LABELS[lang] || lang)
  }, [text])

  const smartPlay = useCallback(() => {
    const cleaned = cleanText(text)
    if (!cleaned) return
    const lang = detectLang(cleaned)
    const voice = selectedVoice || findBestVoice(voices, lang)
    speak({ text: cleaned, voice, rate, pitch, volume, onBoundary: idx => setHighlightIndex(idx) })
    setHistory(prev => [cleaned, ...prev.filter(h => h !== cleaned)].slice(0, 8))
  }, [text, voices, rate, pitch, volume, selectedVoice, speak, setHistory])

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
    setText(prev => prev.replace(/\s+/g, ' ').replace(/([.!?,;:])\s*/g, '$1 ').replace(/\s+([.!?,;:])/g, '$1').trim())
  }, [])

  const handleCopyText = useCallback(async () => {
    if (!text.trim()) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  const handleHistorySelect = useCallback((item) => { setText(item); stop() }, [stop])
  const handleHistoryClear = useCallback(() => setHistory([]), [setHistory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-[#030712] dark:via-[#0f172a] dark:to-[#0c0a1e] relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-200/30 dark:bg-violet-900/10 rounded-full blur-3xl animate-float2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">

        {/* Page header */}
        <div className="mb-6 animate-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                <span className="gradient-text">Mianova</span> Studio
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">Text to speech · MP3 download · Multi-language</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {[['Ctrl+Enter', 'Play'], ['Esc', 'Stop']].map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
                  <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-gray-500 dark:text-gray-400 shadow-sm">{key}</kbd>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">

          {/* LEFT: Editor column */}
          <div className="space-y-4 animate-fade-up-1">

            {/* Editor card */}
            <div className="gradient-border rounded-3xl">
              <div className="glass-card rounded-3xl overflow-hidden">

                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800/60">
                  <div className="flex items-center gap-2">
                    {detectedLang && (
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                        {detectedLang}
                      </span>
                    )}
                    {wordCount > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-600">
                        {wordCount} words · {fmtTime(speakSec)} speak time
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyText}
                      disabled={!text.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-30"
                    >
                      {copied ? '✅ Copied' : '📋 Copy'}
                    </button>
                    <button
                      onClick={handleClean}
                      disabled={!text.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all disabled:opacity-30"
                    >
                      ✨ Clean
                    </button>
                    <button
                      onClick={() => { setText(''); stop() }}
                      disabled={!text.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-30"
                    >
                      🗑 Clear
                    </button>
                  </div>
                </div>

                {/* Text area */}
                <div className="p-4 sm:p-5">
                  <TextArea
                    text={text}
                    setText={handleTextChange}
                    highlightIndex={highlightIndex}
                    words={words}
                  />
                  {/* Char bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-0.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${charPct > 90 ? 'bg-red-400' : charPct > 70 ? 'bg-amber-400' : 'bg-indigo-400'}`}
                        style={{ width: `${charPct}%` }}
                      />
                    </div>
                    <span className={`text-xs tabular-nums font-medium ${charPct > 90 ? 'text-red-400' : 'text-gray-400 dark:text-gray-600'}`}>
                      {text.length}/{MAX_CHARS}
                    </span>
                  </div>
                </div>

                {/* Waveform — shown while speaking */}
                {isSpeaking && (
                  <div className="px-5 pb-4 animate-scale-in">
                    <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 h-8">
                        <Waveform active={!isPaused} bars={48} className="h-full" />
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {isPaused ? '⏸ Paused' : '🎙 Speaking'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Presets */}
            <div className="glass-card rounded-2xl px-5 py-4">
              <Presets onSelect={handlePreset} active={activePreset} />
            </div>

            {/* Advanced toggle + panel */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setIsAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs">⚙</span>
                  Advanced Controls
                </span>
                <span className={`text-xs text-gray-400 transition-transform duration-200 ${isAdvanced ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {isAdvanced && (
                <div className="border-t border-gray-100 dark:border-gray-800/60 p-5">
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
                </div>
              )}
            </div>

            {/* History */}
            <div className="glass-card rounded-2xl p-5">
              <History
                history={history}
                onSelect={handleHistorySelect}
                onClear={handleHistoryClear}
              />
            </div>
          </div>

          {/* RIGHT: Controls column */}
          <div className="space-y-4 animate-fade-up-2">

            {/* Play controls card */}
            <div className="glass-card rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Playback</span>
              </div>

              {!isSpeaking ? (
                <button
                  onClick={smartPlay}
                  disabled={!text.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient text-white text-base font-black shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-xl">🎙</span> Smart Play
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="h-10 rounded-xl overflow-hidden bg-indigo-50 dark:bg-indigo-900/20 px-3 flex items-center">
                    <Waveform active={!isPaused} bars={36} className="h-full w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {isPaused ? (
                      <button onClick={resume} className="py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-indigo-200 dark:shadow-indigo-900/40">
                        ▶ Resume
                      </button>
                    ) : (
                      <button onClick={pause} className="py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm transition-all active:scale-95 hover:border-indigo-300 dark:hover:border-indigo-700">
                        ⏸ Pause
                      </button>
                    )}
                    <button onClick={stop} className="py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-red-200 dark:shadow-red-900/40">
                      ■ Stop
                    </button>
                  </div>
                </div>
              )}

              {/* Volume quick control */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Volume</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05} value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full accent-indigo-600 cursor-pointer"
                  style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)` }}
                />
              </div>

              {/* Speed quick control */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Speed</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{rate}×</span>
                </div>
                <input
                  type="range" min={0.5} max={2} step={0.1} value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full accent-indigo-600 cursor-pointer"
                  style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((rate - 0.5) / 1.5) * 100}%, #e5e7eb ${((rate - 0.5) / 1.5) * 100}%, #e5e7eb 100%)` }}
                />
              </div>
            </div>

            {/* Audio download card */}
            <AudioPanel text={cleanText(text)} lang={detectLang(text)} rate={rate} pitch={pitch} volume={volume} />

            {/* Stats card */}
            {text.trim() && (
              <div className="glass-card rounded-2xl p-5 animate-scale-in">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Words', val: wordCount, icon: '📝' },
                    { label: 'Characters', val: text.length, icon: '🔤' },
                    { label: 'Sentences', val: text.split(/[.!?]+/).filter(s => s.trim()).length, icon: '📄' },
                    { label: 'Speak time', val: fmtTime(speakSec), icon: '⏱' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
                      <div className="text-lg mb-0.5">{s.icon}</div>
                      <div className="text-base font-black text-indigo-600 dark:text-indigo-400">{s.val}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-600">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
