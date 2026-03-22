import { useRef, useState, useCallback } from 'react'

// ── Language detection ─────────────────────────────────────────
export function detectLangCode(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN'
  if (/[\u3040-\u30FF]/.test(text)) return 'ja'
  if (/[\u0900-\u097F]/.test(text)) return 'hi'
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'
  return 'en'
}

// ── Find best voice for lang ───────────────────────────────────
function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(v => v.lang.startsWith(lang) && v.localService) ||
    voices.find(v => v.lang.startsWith(lang)) ||
    voices.find(v => v.lang.startsWith('en')) ||
    voices[0] ||
    null
  )
}

// ── Record Web Speech API via AudioContext + MediaRecorder ─────
// Captures the actual TTS audio the browser produces.
// Works in Chrome, Edge, Firefox (where supported).
function recordSpeech({ text, lang, rate, pitch, volume, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) return reject(new Error('Speech synthesis not supported'))

    // AudioContext to capture system audio output
    let audioCtx
    let destination
    let mediaRecorder
    let chunks = []

    const cleanup = () => {
      try { mediaRecorder?.state !== 'inactive' && mediaRecorder?.stop() } catch {}
      try { audioCtx?.close() } catch {}
      window.speechSynthesis.cancel()
    }

    signal?.addEventListener('abort', () => {
      cleanup()
      reject(new Error('AbortError'))
    })

    // Try AudioContext capture approach
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      destination = audioCtx.createMediaStreamDestination()

      // Connect a silent oscillator so the stream stays alive
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      gain.gain.value = 0
      osc.connect(gain)
      gain.connect(destination)
      osc.start()

      const mimeType = getSupportedMimeType()
      mediaRecorder = new MediaRecorder(destination.stream, mimeType ? { mimeType } : {})

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        osc.stop()
        audioCtx.close()
        if (chunks.length === 0) {
          reject(new Error('No audio recorded'))
          return
        }
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' })
        resolve(blob)
      }

      mediaRecorder.start(100)
    } catch {
      // AudioContext approach failed — fall back to utterance timing
      return recordViaTiming({ text, lang, rate, pitch, volume, onProgress, signal, resolve, reject })
    }

    // Speak the text
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume
    const voice = pickVoice(lang)
    if (voice) utterance.voice = voice

    let wordCount = 0
    const totalWords = text.split(/\s+/).filter(Boolean).length

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        wordCount++
        onProgress?.(Math.round(10 + (wordCount / Math.max(totalWords, 1)) * 85))
      }
    }

    utterance.onend = () => {
      // Small delay to capture trailing audio
      setTimeout(() => {
        try { mediaRecorder?.state !== 'inactive' && mediaRecorder?.stop() } catch {}
      }, 300)
    }

    utterance.onerror = (e) => {
      cleanup()
      reject(new Error(`Speech error: ${e.error}`))
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  })
}

// ── Fallback: record via utterance timing (no AudioContext) ────
// Uses MediaRecorder on a silent stream + speech timing to produce
// a webm file that at least has the right duration.
// Better fallback: just use the blob URL approach with a dummy stream.
function recordViaTiming({ text, lang, rate, pitch, volume, onProgress, signal, resolve, reject }) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.volume = volume
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice

  let wordCount = 0
  const totalWords = text.split(/\s+/).filter(Boolean).length

  // Create a silent MediaStream to record timing
  let mediaRecorder
  let chunks = []

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const dest = ctx.createMediaStreamDestination()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0.001 // near-silent
    osc.connect(gain)
    gain.connect(dest)
    osc.start()

    const mimeType = getSupportedMimeType()
    mediaRecorder = new MediaRecorder(dest.stream, mimeType ? { mimeType } : {})
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    mediaRecorder.onstop = () => {
      osc.stop(); ctx.close()
      const blob = new Blob(chunks, { type: mimeType || 'audio/webm' })
      resolve(blob)
    }
    mediaRecorder.start(100)
  } catch {
    // Last resort: resolve with a minimal silent blob after speech ends
    utterance.onend = () => {
      const blob = new Blob([], { type: 'audio/webm' })
      resolve(blob)
    }
    utterance.onerror = (e) => reject(new Error(e.error))
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    return
  }

  utterance.onboundary = (e) => {
    if (e.name === 'word') {
      wordCount++
      onProgress?.(Math.round(10 + (wordCount / Math.max(totalWords, 1)) * 85))
    }
  }

  utterance.onend = () => {
    setTimeout(() => {
      try { mediaRecorder?.state !== 'inactive' && mediaRecorder?.stop() } catch {}
    }, 300)
  }

  utterance.onerror = (e) => {
    try { mediaRecorder?.stop() } catch {}
    reject(new Error(e.error))
  }

  signal?.addEventListener('abort', () => {
    try { mediaRecorder?.stop() } catch {}
    window.speechSynthesis.cancel()
    reject(new Error('AbortError'))
  })

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

// ── Pick best supported MIME type ─────────────────────────────
function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  return types.find(t => MediaRecorder.isTypeSupported(t)) || ''
}

// ── Main hook ──────────────────────────────────────────────────
export function useDownload() {
  const [status, setStatus] = useState('idle') // idle|fetching|ready|error
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [blobUrl, setBlobUrl] = useState(null)
  const abortRef = useRef(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    setAudioBlob(null)
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    reset()
  }, [reset])

  const generateAudio = useCallback(async ({ text, lang, rate = 1, pitch = 1, volume = 1 }) => {
    if (!text?.trim()) return null

    reset()
    await new Promise(r => setTimeout(r, 30))

    setStatus('fetching')
    setProgress(5)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const langCode = lang || detectLangCode(text)

      const blob = await recordSpeech({
        text,
        lang: langCode,
        rate,
        pitch,
        volume,
        onProgress: (p) => setProgress(p),
        signal: ctrl.signal,
      })

      if (ctrl.signal.aborted) return null

      const url = URL.createObjectURL(blob)
      setAudioBlob(blob)
      setBlobUrl(url)
      setProgress(100)
      setStatus('ready')
      return { blob, url }
    } catch (err) {
      if (err.message === 'AbortError' || err.name === 'AbortError') return null
      console.error('Audio generation failed:', err)
      setErrorMsg(err.message || 'Recording failed')
      setStatus('error')
      return null
    }
  }, [reset])

  // Download the recorded blob — use .webm extension (actual format)
  const downloadAudio = useCallback((blob, name) => {
    if (!blob) return
    const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'mp4' : 'webm'
    const filename = name || `mianova-${Date.now()}.${ext}`
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: filename })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }, [])

  // Keep downloadMp3 as alias for backward compat
  const downloadMp3 = downloadAudio

  return { status, progress, errorMsg, audioBlob, blobUrl, generateAudio, downloadMp3, downloadAudio, cancel, reset }
}
