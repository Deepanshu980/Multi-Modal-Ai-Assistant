import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiVolume2,
  FiVolumeX,
  FiMic,
  FiUser,
  FiPlay,
  FiPause,
} from 'react-icons/fi'

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match?.[1] || 'text'
  const code = String(children).replace(/\n$/, '')

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inline) {
    return (
      <code className="font-mono text-xs bg-surface-600 text-aurora-cyan px-1.5 py-0.5 rounded" {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="code-block relative group my-3 rounded-xl overflow-hidden border border-surface-500">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-700">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <FiCheck size={12} className="text-green-400" /> : <FiCopy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.8125rem',
          lineHeight: '1.6',
          background: '#0e1117',
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

const AIAvatar = () => (
  <div
    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center aurora-border"
    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)' }}
  >
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-white">
      <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" fill="currentColor" />
    </svg>
  </div>
)

const UserAvatar = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-500 border border-surface-400 flex items-center justify-center">
    <FiUser size={14} className="text-slate-400" />
  </div>
)

const MessageBubble = ({ message, onRegenerate }) => {
  const { role, content, timestamp, isVoice, audioUrl } = message
  const isUser = role === 'user'
  const isAI = role === 'assistant'

  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const copyMessage = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  const speakMessage = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [content, speaking])

  const toggleAudioPlay = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-start gap-3 animate-fade-in group px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? <UserAvatar /> : <AIAvatar />}

      <div className={`flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          rounded-2xl px-4 py-3 leading-relaxed text-sm
          ${isUser
            ? 'message-user rounded-tr-sm text-white'
            : 'message-ai rounded-tl-sm text-slate-200'
          }
        `}>
          {isVoice && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-400">
              <FiMic size={10} />
              <span>Voice message</span>
            </div>
          )}

          {audioUrl && isAI ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-surface-600/50 rounded-lg px-3 py-2">
                <button
                  onClick={toggleAudioPlay}
                  className="flex-shrink-0 p-1.5 hover:bg-surface-500 rounded-lg transition-colors text-accent-400"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = parseFloat(e.target.value)
                    }
                  }}
                  className="flex-1 h-1 bg-surface-500 rounded-full appearance-none cursor-pointer accent-accent-400"
                />
                <span className="text-xs text-slate-400 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
              <div className="text-xs text-slate-400">AI voice response ready</div>
            </div>
          ) : isAI ? (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>

        {/* Timestamp + Actions */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-slate-600">{time}</span>

          {/* AI action buttons */}
          {isAI && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyMessage}
                title="Copy"
                className="p-1.5 text-slate-500 hover:text-white hover:bg-surface-500 rounded-lg transition-all"
              >
                {copied ? <FiCheck size={12} className="text-green-400" /> : <FiCopy size={12} />}
              </button>
              <button
                onClick={speakMessage}
                title={speaking ? 'Stop speaking' : 'Read aloud'}
                className={`p-1.5 rounded-lg transition-all ${
                  speaking
                    ? 'text-accent-400 bg-surface-500'
                    : 'text-slate-500 hover:text-white hover:bg-surface-500'
                }`}
              >
                {speaking ? <FiVolumeX size={12} /> : <FiVolume2 size={12} />}
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate"
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-surface-500 rounded-lg transition-all"
                >
                  <FiRefreshCw size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
