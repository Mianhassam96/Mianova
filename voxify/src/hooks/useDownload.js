import { useRef, useState, useCallback } from 'react'

export function useDownload() {
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = useCallback(async () => {
    try {
      // Chrome requires video:true — we stop the video track immediately after
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      // Drop video tracks, keep only audio
      stream.getVideoTracks().forEach(t => t.stop())
      const audioTracks = stream.getAudioTracks()

      if (!audioTracks.length) {
        stream.getTracks().forEach(t => t.stop())
        return false
      }

      const audioStream = new MediaStream(audioTracks)
      chunksRef.current = []

      // Pick best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''

      const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : {})
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.start(100) // collect chunks every 100ms
      recorderRef.current = recorder
      setIsRecording(true)
      return true
    } catch (err) {
      console.warn('Recording failed:', err)
      return false
    }
  }, [])

  const stopAndDownload = useCallback((filename = 'voxify-speech.webm') => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      recorder.stream.getTracks().forEach(t => t.stop())
      recorderRef.current = null
      setIsRecording(false)
    }
    recorder.stop()
  }, [])

  return { isRecording, startRecording, stopAndDownload }
}
