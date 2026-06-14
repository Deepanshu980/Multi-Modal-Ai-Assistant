import React, { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { FiSend, FiStopCircle } from 'react-icons/fi'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import ChatWindow from '../components/ChatWindow'
import VoiceRecorder from '../components/VoiceRecorder'
import { sendMessage, uploadAudio, getResponse, sendVoiceMessage } from '../services/api'

const STORAGE_KEY = 'aria_chats_v2'

const loadChats = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

const saveChats = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {
    console.warn('Could not save to localStorage')
  }
}

const createChat = () => ({
  id: uuidv4(),
  title: 'New conversation',
  messages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const createMessage = (role, content, extra = {}) => ({
  id: uuidv4(),
  role,
  content,
  timestamp: new Date().toISOString(),
  ...extra,
})

export default function Home() {
  const [chats, setChats] = useState(loadChats)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  // Persist chats
  useEffect(() => {
    saveChats(chats)
  }, [chats])

  const currentChat = chats.find((c) => c.id === currentChatId) || null
  const messages = currentChat?.messages || []

  const updateChat = useCallback((chatId, updater) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...updater(c), updatedAt: new Date().toISOString() }
          : c
      )
    )
  }, [])

  const ensureChat = useCallback(() => {
    if (currentChatId && chats.find((c) => c.id === currentChatId)) {
      return currentChatId
    }
    const chat = createChat()
    setChats((prev) => [chat, ...prev])
    setCurrentChatId(chat.id)
    return chat.id
  }, [currentChatId, chats])

  const addMessage = useCallback((chatId, message) => {
    updateChat(chatId, (chat) => {
      const updated = { ...chat, messages: [...chat.messages, message] }
      // Auto-title based on first user message
      if (chat.title === 'New conversation' && message.role === 'user') {
        updated.title =
          message.content.slice(0, 50) + (message.content.length > 50 ? '…' : '')
      }
      return updated
    })
  }, [updateChat])

  const handleSend = useCallback(async (text, isVoice = false) => {
    const trimmed = (text || input).trim()
    if (!trimmed || isLoading) return

    setInput('')
    setError(null)
    const chatId = ensureChat()

    const userMsg = createMessage('user', trimmed, { isVoice })
    addMessage(chatId, userMsg)
    setIsLoading(true)

    const history = [
      ...(chats.find((c) => c.id === chatId)?.messages || []),
      userMsg,
    ]

    try {
      const data = await sendMessage(trimmed, history, chatId)
      const aiMsg = createMessage('assistant', data.response || data.message || data.text || JSON.stringify(data))
      addMessage(chatId, aiMsg)
    } catch (err) {
      setError(err.message)
      // Add error message to chat
      const errMsg = createMessage('assistant', `⚠️ ${err.message}\n\nPlease ensure the backend is running at \`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}\`.`)
      addMessage(chatId, errMsg)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, ensureChat, addMessage, chats])

  const handleVoiceComplete = useCallback(async (audioBlob) => {
    setError(null)
    const chatId = ensureChat()
    setIsLoading(true)

    try {
      // First, get the voice-to-voice response
      const voiceResponseBlob = await sendVoiceMessage(audioBlob)
      
      // Convert blob to object URL for playback
      const audioUrl = URL.createObjectURL(voiceResponseBlob)
      
      // Also transcribe the input for text display
      const transcribeData = await uploadAudio(audioBlob)
      const transcribedText = transcribeData.text || transcribeData.transcript

      if (!transcribedText?.trim()) {
        setError('Could not transcribe audio. Please try again.')
        setIsLoading(false)
        return
      }

      // Add user message with voice flag
      const userMsg = createMessage('user', transcribedText, { isVoice: true })
      addMessage(chatId, userMsg)

      // Add AI response with audio
      const aiMsg = createMessage('assistant', '🎧 Voice response (playing...)', { 
        isVoice: true,
        audioUrl: audioUrl,
        audioBlob: voiceResponseBlob
      })
      addMessage(chatId, aiMsg)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [ensureChat, addMessage])

  const handleRegenerate = useCallback(async (aiMessage) => {
    if (!currentChatId || isLoading) return
    const chat = chats.find((c) => c.id === currentChatId)
    if (!chat) return

    // Find the user message before this AI message
    const aiIdx = chat.messages.findIndex((m) => m.id === aiMessage.id)
    const userMsg = chat.messages.slice(0, aiIdx).reverse().find((m) => m.role === 'user')
    if (!userMsg) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getResponse(userMsg.content, chat.messages.slice(0, aiIdx - 1))
      const newContent = data.response || data.message || data.text

      updateChat(currentChatId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === aiMessage.id ? { ...m, content: newContent, timestamp: new Date().toISOString() } : m
        ),
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentChatId, chats, isLoading, updateChat])

  const handleNewChat = useCallback(() => {
    const chat = createChat()
    setChats((prev) => [chat, ...prev])
    setCurrentChatId(chat.id)
    setSidebarOpen(false)
    inputRef.current?.focus()
  }, [])

  const handleDeleteChat = useCallback((chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (currentChatId === chatId) {
      const remaining = chats.filter((c) => c.id !== chatId)
      setCurrentChatId(remaining[0]?.id || null)
    }
  }, [chats, currentChatId])

  const handleClearAll = useCallback(() => {
    if (confirm('Clear all conversations? This cannot be undone.')) {
      setChats([])
      setCurrentChatId(null)
    }
  }, [])

  const handleDownloadChat = useCallback((chatId) => {
    const chat = chats.find((c) => c.id === chatId)
    if (!chat) return
    const text = chat.messages
      .map((m) => `[${m.role.toUpperCase()}] ${new Date(m.timestamp).toLocaleString()}\n${m.content}`)
      .join('\n\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chat.title.slice(0, 30)}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [chats])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />
      </div>

      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => { setCurrentChatId(id); setSidebarOpen(false) }}
        onDeleteChat={handleDeleteChat}
        onClearAll={handleClearAll}
        onDownloadChat={handleDownloadChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Navbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentChat={currentChat}
        />

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onRegenerate={handleRegenerate}
          onSuggestion={(text) => handleSend(text)}
        />

        {/* Error banner */}
        {error && (
          <div className="max-w-3xl mx-auto w-full px-4 pb-2">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm text-red-400 flex items-center justify-between animate-fade-in">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 ml-3">✕</button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="flex-shrink-0 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass aurora-border rounded-2xl p-3 flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Aria… (Enter to send, Shift+Enter for newline)"
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none max-h-40 leading-relaxed py-1.5 px-1 disabled:opacity-50"
                style={{ scrollbarWidth: 'none' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                }}
              />

              <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
                <VoiceRecorder onTranscribe={handleVoiceComplete} disabled={isLoading} />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0
                    ${input.trim() && !isLoading
                      ? 'bg-accent-500 hover:bg-accent-600 text-white active:scale-95 shadow-lg shadow-accent-500/25'
                      : 'bg-surface-500 text-slate-600 cursor-not-allowed'
                    }
                  `}
                >
                  {isLoading ? (
                    <FiStopCircle size={16} className="animate-pulse" />
                  ) : (
                    <FiSend size={15} />
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-700 mt-2">
              Aria may make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
