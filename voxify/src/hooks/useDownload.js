import { useRef, useState, useCallback } from 'react'

// ── Text chunking ──────────────────────────────────────────────
const CHUNK_MAX = 150 // conservative — Google TTS limit

function chunkText(text) {
  const words = text.trim().split(/\s+/)
  const chunks = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > CHUNK_MAX) { if (cur) chunks.push(cur); cur = w }
    else cur = next
  }
  if (cur) chunks.push(cur)
  return chunks.length ? chunks : [text.trim().slice(0, CHUNK_MAX)]
}

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

// ── Google TTS URL builder ─────────────────────────────────────
// speed: 'slow' | '' (normal)
function gttsUrl(text, lang, slow = false) {
  return (
    `https://translate.google.com/translate_tts` +
    `?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}` +
    `&total=1&idx=0&textlen=${text.length}` +
    `&client=tw-ob${slow ? '&ttsspeed=0.24' : ''}`
  )
}

// ── CORS proxy list — tried in order ──────────────────────────
const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://cors-anywhere.herokuapp.com/${url}`,
]

async function fetchWithProxies(url, signal) {
  // Try direct first (works in some environments)
  try {
    const r = await fetch(url, { signal, headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (r.ok) return r
  } catch { /* CORS blocked — try proxies */ }

  for (const proxy of PROXIES) {
    if (signal?.aborted) return null
    try {
      const r = await fetch(proxy(url), { signal })
      if (r.ok) return r
    } catch { /* try next */ }
  }
  throw new Error('All proxies failed')
}

// ── Buffer merge ───────────────────────────────────────────────
function mergeBuffers(bufs) {
  const total = bufs.reduce((s, b) => s + b.byteLength, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const b of bufs) { out.set(new Uint8Array(b), off); off += b.byteLength }
  return out.buffer
}

// ── Public upload — tries file.io then 0x0.st ─────────────────
export async function uploadForPublicLink(blob) {
  const filename = `mianova-${Date.now()}.mp3`

  // 1. file.io (CORS-friendly, 14-day link)
  try {
    const form = new FormData()
    form.append('file', blob, filename)
    const r = await fetch('https://file.io/?expires=14d', { method: 'POST', body: form })
    if (r.ok) {
      const j = await r.json()
      if (j.success && j.link) return j.link
    }
  } catch { /* fallback */ }

  // 2. 0x0.st
  try {
    const form = new FormData()
    form.append('file', blob, filename)
    const r = await fetch('https://0x0.st', { method: 'POST', body: form })
    if (r.ok) {
      const url = (await r.text()).trim()
      if (url.startsWith('http')) return url
    }
  } catch { /* fallback */ }

  throw new Error('All upload services failed')
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

  /**
   * Generate MP3 from text using Google TTS.
   * @param {object} opts
   * @param {string} opts.text
   * @param {string} [opts.lang]   - language code override
   * @param {number} [opts.rate]   - 0.5–2 (maps to slow/normal)
   */
  const generateAudio = useCallback(async ({ text, lang, rate = 1 }) => {
    if (!text?.trim()) return null

    reset()
    // Small delay so reset's revokeObjectURL runs first
    await new Promise(r => setTimeout(r, 20))

    setStatus('fetching')
    setProgress(5)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    const langCode = lang || detectLangCode(text)
    const slow = rate < 0.8
    const chunks = chunkText(text)

    try {
      const buffers = []
      for (let i = 0; i < chunks.length; i++) {
        if (ctrl.signal.aborted) return null
        const url = gttsUrl(chunks[i], langCode, slow)
        const res = await fetchWithProxies(url, ctrl.signal)
        if (!res) return null
        buffers.push(await res.arrayBuffer())
        setProgress(Math.round(10 + ((i + 1) / chunks.length) * 82))
      }

      const blob = new Blob([mergeBuffers(buffers)], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      setAudioBlob(blob)
      setBlobUrl(url)
      setProgress(100)
      setStatus('ready')
      return { blob, url }
    } catch (err) {
      if (err.name === 'AbortError') return null
      console.error('TTS generation failed:', err)
      setErrorMsg(err.message || 'Generation failed')
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
