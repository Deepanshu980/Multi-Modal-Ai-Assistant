import { useState, useRef, useCallback, useEffect } from 'react'

const SUPPORTED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
]

const getSupportedMimeType = () => {
  return SUPPORTED_MIME_TYPES.find((type) =>
    MediaRecorder.isTypeSupported(type)
  ) || ''
}

export const useVoiceRecorder = ({ onComplete, maxDuration = 120 } = {}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
    setAudioLevel(Math.min(avg / 128, 1))
    animFrameRef.current = requestAnimationFrame(analyzeAudio)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })
      streamRef.current = stream

      // Set up audio analysis
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        })
        setAudioBlob(blob)
        if (onComplete) onComplete(blob)
      }

      recorder.start(250)
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      analyzeAudio()
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone permissions.'
          : err.name === 'NotFoundError'
          ? 'No microphone found. Please connect a microphone.'
          : `Recording failed: ${err.message}`
      setError(msg)
    }
  }, [analyzeAudio, onComplete, maxDuration])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    setIsRecording(false)
    setIsPaused(false)
    setAudioLevel(0)
  }, [])

  const cancelRecording = useCallback(() => {
    stopRecording()
    setAudioBlob(null)
    setDuration(0)
    chunksRef.current = []
  }, [stopRecording])

  const formatDuration = useCallback((secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [])

  useEffect(() => {
    return () => {
      cancelRecording()
    }
  }, [])

  return {
    isRecording,
    isPaused,
    duration,
    formattedDuration: formatDuration(duration),
    audioLevel,
    error,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
