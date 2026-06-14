import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { FiZap, FiMic, FiMessageSquare, FiCode } from 'react-icons/fi'

const WelcomeScreen = ({ onSuggestion }) => {
  const suggestions = [
    { icon: <FiMessageSquare size={16} />, text: 'Explain quantum computing simply' },
    { icon: <FiCode size={16} />, text: 'Write a Python async function' },
    { icon: <FiMic size={16} />, text: 'Try voice — press the mic button' },
    { icon: <FiZap size={16} />, text: 'Summarize the latest AI trends' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
      {/* Logo */}
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center aurora-border"
          style={{ background: 'linear-gradient(135deg, #1e222e, #252a38)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}
          >
            <FiZap size={28} className="text-white" />
          </div>
        </div>
        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-surface-900 flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </span>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Hi, I'm <span className="gradient-text">Aria</span>
      </h1>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-10">
        Your context-aware multimodal voice assistant. Chat by text or speak naturally — I understand both.
      </p>

      {/* Suggestion chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            className="glass-lighter flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm text-slate-300 hover:text-white hover:border-accent-500/30 transition-all duration-200 group"
          >
            <span className="text-accent-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              {s.icon}
            </span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const ChatWindow = ({ messages, isLoading, onRegenerate, onSuggestion }) => {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const isEmpty = messages.length === 0

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {isEmpty ? (
        <WelcomeScreen onSuggestion={onSuggestion} />
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onRegenerate={
                msg.role === 'assistant' && idx === messages.length - 1
                  ? () => onRegenerate(msg)
                  : null
              }
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} className="h-1" />
        </div>
      )}
    </div>
  )
}

export default ChatWindow
