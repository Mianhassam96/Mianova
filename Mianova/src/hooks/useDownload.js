import { useRef, useState, useCallback } from 'react'
import lamejs from 'lamejs'

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

// ── Pick best voice for lang ───────────────────────────────────
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

// ── Float32 PCM → Int16 PCM ────────────────────────────────────
function floatTo16BitPCM(float32Array) {
  const int16 = new Int16Array(float32Array.length)
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16
}

// ── Encode PCM buffers → MP3 blob ─────────────────────────────
function encodeMp3(pcmBuffers, sampleRate) {
  const mp3enc = new lamejs.Mp3Encoder(1, sampleRate, 128)
  const mp3Data = []

  for (const buf of pcmBuffers) {
    const samples = floatTo16BitPCM(buf)
    // lamejs processes in chunks of 1152
    const chunkSize = 1152
    for (let i = 0; i < samples.length; i += chunkSize) {
      const chunk = samples.subarray(i, i + chunkSize)
      const encoded = mp3enc.encodeBuffer(chunk)
      if (encoded.length > 0) mp3Data.push(new Int8Array(encoded))
    }
  }

  const flushed = mp3enc.flush()
  if (flushed.length > 0) mp3Data.push(new Int8Array(flushed))

  return new Blob(mp3Data, { type: 'audio/mpeg' })
}

// ── Record speech and capture raw PCM ─────────────────────────
function recordSpeechAsPcm({ text, lang, rate, pitch, volume, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) return reject(new Error('Speech synthesis not supported'))

    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return reject(new Error('AudioContext not supported'))

    const audioCtx = new AudioCtx()
    const sampleRate = audioCtx.sampleRate
    const pcmBuffers = []

    // ScriptProcessorNode captures raw PCM from the audio graph
    // Buffer size 4096, mono (1 channel)
    const bufferSize = 4096
    const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1)

    // Destination node — we route speech through here
    const destination = audioCtx.createMediaStreamDestination()

    // Connect processor to destination so it stays active
    processor.connect(audioCtx.destination)

    processor.onaudioprocess = (e) => {
      // Copy the input buffer (captures whatever is playing)
      const input = e.inputBuffer.getChannelData(0)
      pcmBuffers.push(new Float32Array(input))
    }

    const cleanup = () => {
      try { processor.disconnect() } catch {}
      try { audioCtx.close() } catch {}
      window.speechSynthesis.cancel()
    }

    signal?.addEventListener('abort', () => {
      cleanup()
      reject(new Error('AbortError'))
    })

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = Math.max(0.1, Math.min(10, rate))
    utterance.pitch = Math.max(0, Math.min(2, pitch))
    utterance.volume = Math.max(0, Math.min(1, volume))
    const voice = pickVoice(lang)
    if (voice) utterance.voice = voice

    let wordCount = 0
    const totalWords = text.split(/\s+/).filter(Boolean).length

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        wordCount++
        onProgress?.(Math.round(5 + (wordCount / Math.max(totalWords, 1)) * 88))
      }
    }

    utterance.onend = () => {
      // Wait a bit for trailing audio to flush through processor
      setTimeout(() => {
        cleanup()
        resolve({ pcmBuffers, sampleRate })
      }, 400)
    }

    utterance.onerror = (e) => {
      cleanup()
      reject(new Error(`Speech error: ${e.error}`))
    }

    window.speechSynthesis.cancel()
    // Small delay so cancel() clears before we speak
    setTimeout(() => {
      if (signal?.aborted) return
      window.speechSynthesis.speak(utterance)
    }, 100)
  })
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

      // Step 1: record PCM while speech plays
      const { pcmBuffers, sampleRate } = await recordSpeechAsPcm({
        text, lang: langCode, rate, pitch, volume,
        onProgress: (p) => setProgress(p),
        signal: ctrl.signal,
      })

      if (ctrl.signal.aborted) return null

      setProgress(95)

      // Step 2: encode PCM → MP3 (runs synchronously, fast)
      const blob = encodeMp3(pcmBuffers, sampleRate)

      const url = URL.createObjectURL(blob)
      setAudioBlob(blob)
      setBlobUrl(url)
      setProgress(100)
      setStatus('ready')
      return { blob, url }
    } catch (err) {
      if (err.message === 'AbortError' || err.name === 'AbortError') return null
      console.error('MP3 generation failed:', err)
      setErrorMsg(err.message || 'Recording failed. Try Chrome or Edge.')
      setStatus('error')
      return null
    }
  }, [reset])

  const downloadMp3 = useCallback((blob, name = `mianova-${Date.now()}.mp3`) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: name })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }, [])

  return { status, progress, errorMsg, audioBlob, blobUrl, generateAudio, downloadMp3, cancel, reset }
}
