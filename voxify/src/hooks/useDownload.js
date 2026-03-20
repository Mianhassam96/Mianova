import { useRef, useState, useCallback } from 'react'

/**
 * Records speech via getDisplayMedia (tab audio capture).
 * User must: share THIS tab + enable "Share tab audio" checkbox.
 * Works reliably in Chrome/Edge.
 */
export function useDownload() {
  const [status, setStatus] = useState('idle') // idle | waiting | recording | saving
  const [progress, setProgress] = useState(0)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const downloadSpeech = useCallback(async ({ text, voice, rate = 1, pitch = 1, volume = 1, onReady }) => {
    if (!text.trim()) return 'no-text'

    try {
      setStatus('waiting')

      // Step 1: get tab audio via screen share
      let stream
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'browser' },
          audio: { suppressLocalAudioPlayback: false },
          preferCurrentTab: true, // Chrome 109+ hint
        })
      } catch (e) {
        setStatus('idle')
        return 'cancelled'
      }

      // Drop video, keep audio only
      stream.getVideoTracks().forEach(t => t.stop())
      const audioTracks = stream.getAudioTracks()

      if (!audioTracks.length) {
        stream.getTracks().forEach(t => t.stop())
        setStatus('idle')
        return 'no-audio'
      }

      const audioStream = new MediaStream(audioTracks)
      chunksRef.current = []

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
        .find(t => MediaRecorder.isTypeSupported(t)) || ''

      const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : {})
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorderRef.current = recorder

      recorder.onstop = () => {
        const ext = mimeType.includes('ogg') ? 'ogg' : 'webm'
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `voxify-${Date.now()}.${ext}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        audioStream.getTracks().forEach(t => t.stop())
        recorderRef.current = null
        setStatus('idle')
        setProgress(0)
      }

      recorder.start(100)
      setStatus('recording')
      setProgress(10)

      // Step 2: speak
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume
      if (voice) utterance.voice = voice

      utterance.onstart = () => { setProgress(30); onReady?.() }

      utterance.onboundary = (e) => {
        if (e.name === 'word' && e.charIndex != null) {
          const pct = Math.min(90, 30 + Math.round((e.charIndex / text.length) * 60))
          setProgress(pct)
        }
      }

      utterance.onend = () => {
        setProgress(95)
        setStatus('saving')
        setTimeout(() => {
          if (recorder.state !== 'inactive') recorder.stop()
        }, 700)
      }

      utterance.onerror = (e) => {
        console.warn('Speech error:', e)
        if (recorder.state !== 'inactive') recorder.stop()
      }

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)

      return 'ok'
    } catch (err) {
      console.warn('Download error:', err)
      setStatus('idle')
      setProgress(0)
      return 'error'
    }
  }, [])

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel()
    if (recorderRef.current?.state !== 'inactive') {
      recorderRef.current?.stop()
    }
    setStatus('idle')
    setProgress(0)
  }, [])

  return { status, progress, downloadSpeech, cancel }
}
