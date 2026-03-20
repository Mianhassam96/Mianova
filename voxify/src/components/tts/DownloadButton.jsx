import { useEffect, useRef } from 'react'
import { useDownload } from '../../hooks/useDownload'
import { Button } from '../ui/Button'

export function DownloadButton({ onRequestPlay, isSpeaking, text }) {
  const { isRecording, startRecording, stopAndDownload } = useDownload()
  const autoStopTimer = useRef(null)

  // Auto-stop when speech finishes while recording
  useEffect(() => {
    if (isRecording && !isSpeaking) {
      autoStopTimer.current = setTimeout(() => {
        stopAndDownload('voxify-speech.webm')
      }, 600)
    }
    return () => clearTimeout(autoStopTimer.current)
  }, [isRecording, isSpeaking, stopAndDownload])

  const handleClick = async () => {
    if (isRecording) {
      stopAndDownload('voxify-speech.webm')
      return
    }
    const started = await startRecording()
    if (!started) {
      alert('Could not capture audio.\n\nTip: When the screen share dialog appears, make sure to check "Share tab audio" and select this tab.')
      return
    }
    onRequestPlay()
  }

  return (
    <Button
      variant={isRecording ? 'danger' : 'secondary'}
      onClick={handleClick}
      disabled={!text.trim()}
      className="flex items-center gap-2"
      title="Record speech and download as audio"
    >
      {isRecording ? '⏹ Stop & Save' : '⬇ Download Audio'}
    </Button>
  )
}
