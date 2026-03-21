import { useRef, useState, useCallback } from 'react'

// Google Translate TTS — returns real MP3, no API key needed
// Max ~200 chars per request; we chunk longer texts
const GTTS_MAX = 180

function buildGttsUrl(text, lang = 'en') {
  const encoded = encodeURIComponent(text)
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`
}

// CORS proxy to fetch the MP3 blob
function proxied(url) {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
}

// Split text into chunks ≤ GTTS_MAX chars, breaking on word boundaries
function chunkText(text) {
  const words = text.split(' ')
  const chunks = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > GTTS_MAX) {
      if (current) chunks.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) chunks.push(current)
  return chunks
}

// Detect language code from text for Google TTS
function detectLangCode(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN'
  if (/[\u3040-\u30FF]/.test(text)) return 'ja'
  if (/[\u0900-\u097F]/.test(text)) return 'hi'
  return 'en'
}

// Merge multiple ArrayBuffers into one
function mergeBuffers(buffers) {
  const total = buffers.reduce((s, b) => s + b.byteLength, 0)
  const merged = new Uint8Array(total)
  let offset = 0
  for (const buf of buffers) {
    merged.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  }
  return merged.buffer
}

export function useDownload() {
  const [status, setStatus] = useState('idle')
  // idle | fetching | ready | error
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [blobUrl, setBlobUrl] = useState(null)
  const abortRef = useRef(null)

  const reset = useCallback(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setStatus('idle')
    setProgress(0)
    setError(null)
    setAudioBlob(null)
    setBlobUrl(null)
  }, [blobUrl])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    reset()
  }, [reset])

  /**
   * Fetch MP3 from Google TTS, merge chunks, return blob URL.
   * Works on all browsers/devices — no screen share needed.
   */
  const generateAudio = useCallback(async ({ text, lang }) => {
    if (!text?.trim()) { setError('no-text'); return null }

    reset()
    setStatus('fetching')
    setProgress(5)

    const controller = new AbortController()
    abortRef.current = controller
    const langCode = lang || detectLangCode(text)
    const chunks = chunkText(text.trim())

    try {
      const buffers = []
      for (let i = 0; i < chunks.length; i++) {
        if (controller.signal.aborted) return null

        const url = buildGttsUrl(chunks[i], langCode)
        const res = await fetch(proxied(url), { signal: controller.signal })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        buffers.push(await res.arrayBuffer())

        setProgress(Math.round(10 + ((i + 1) / chunks.length) * 80))
      }

      const merged = mergeBuffers(buffers)
      const blob = new Blob([merged], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      setAudioBlob(blob)
      setBlobUrl(url)
      setProgress(100)
      setStatus('ready')
      return { blob, url }
    } catch (err) {
      if (err.name === 'AbortError') return null
      console.warn('TTS fetch failed:', err)
      setError('fetch-failed')
      setStatus('error')
      return null
    }
  }, [reset])

  /**
   * Trigger browser download of the generated MP3.
   */
  const downloadMp3 = useCallback((blob, filename = `mianova-${Date.now()}.mp3`) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }, [])

  return {
    status,      // idle | fetching | ready | error
    progress,
    error,       // null | 'no-text' | 'fetch-failed'
    audioBlob,
    blobUrl,     // blob: URL — usable as <audio src> or copy link
    generateAudio,
    downloadMp3,
    cancel,
    reset,
  }
}
