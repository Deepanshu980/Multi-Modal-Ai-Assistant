import React from 'react'
import { FiMic, FiMicOff, FiSquare, FiX } from 'react-icons/fi'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

const WaveformVisualizer = ({ audioLevel, isRecording }) => {
  const bars = 12
  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = (i / bars) * 1.2
        const height = isRecording
          ? Math.max(20, Math.min(100, audioLevel * 100 + Math.sin(i * 0.8) * 30 + 20))
          : 20
        return (
          <div
            key={i}
            className="w-1 rounded-full transition-all duration-75"
            style={{
              height: `${height}%`,
              background: isRecording
                ? `linear-gradient(to top, #6366f1, #22d3ee)`
                : 'rgba(100,116,139,0.3)',
              animationDelay: `${delay}s`,
              animation: isRecording ? `wave 1.2s ease-in-out ${delay}s infinite` : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

const VoiceRecorder = ({ onTranscribe, disabled }) => {
  const { isRecording, formattedDuration, audioLevel, error, startRecording, stopRecording, cancelRecording } =
    useVoiceRecorder({
      onComplete: (blob) => {
        if (onTranscribe) onTranscribe(blob)
      },
    })

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isRecording && (
        <div className="flex items-center gap-3 glass px-3 py-2 rounded-xl animate-fade-in">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-record-pulse" />
            <span className="text-xs font-mono text-red-400 tabular-nums">{formattedDuration}</span>
          </span>

          <WaveformVisualizer audioLevel={audioLevel} isRecording={isRecording} />

          <button
            onClick={cancelRecording}
            className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
            title="Cancel"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {error && (
        <span className="text-xs text-red-400 max-w-32 truncate" title={error}>
          {error}
        </span>
      )}

      <button
        onClick={handleMicClick}
        disabled={disabled}
        title={isRecording ? 'Stop recording' : 'Start recording'}
        className={`
          relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0
          ${isRecording
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-record-pulse'
            : 'glass-lighter text-slate-400 hover:text-accent-400 hover:bg-surface-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
        `}
      >
        {isRecording ? (
          <FiSquare size={16} className="fill-current" />
        ) : (
          <FiMic size={16} />
        )}
      </button>
    </div>
  )
}

export default VoiceRecorder
