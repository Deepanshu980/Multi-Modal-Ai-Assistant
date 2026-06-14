import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3 animate-fade-in px-4 py-2">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center aurora-border"
        style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}>
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-white">
          <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z"
            fill="currentColor" />
        </svg>
      </div>

      <div className="message-ai rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
        <div className="flex items-center gap-1.5">
          <div className="typing-dot w-2 h-2 rounded-full bg-accent-400"></div>
          <div className="typing-dot w-2 h-2 rounded-full bg-accent-400"></div>
          <div className="typing-dot w-2 h-2 rounded-full bg-accent-400"></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
