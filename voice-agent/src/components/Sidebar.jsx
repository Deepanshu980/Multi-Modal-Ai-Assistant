import React, { useState } from 'react'
import {
  FiPlus,
  FiMessageSquare,
  FiTrash2,
  FiDownload,
  FiSettings,
  FiZap,
  FiX,
  FiChevronRight,
} from 'react-icons/fi'

const Sidebar = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClearAll,
  onDownloadChat,
  onClose,
  isOpen,
}) => {
  const [showSettings, setShowSettings] = useState(false)

  const grouped = chats.reduce((acc, chat) => {
    const date = new Date(chat.updatedAt)
    const now = new Date()
    const diffDays = Math.floor((now - date) / 86400000)
    let group = 'Older'
    if (diffDays === 0) group = 'Today'
    else if (diffDays === 1) group = 'Yesterday'
    else if (diffDays < 7) group = 'This Week'
    if (!acc[group]) acc[group] = []
    acc[group].push(chat)
    return acc
  }, {})

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older']

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative z-30 md:z-auto
          flex flex-col h-full w-72
          glass border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}
            >
              <FiZap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm gradient-text">Aria</p>
              <p className="text-xs text-slate-500">Voice AI Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 md:hidden">
            <FiX size={16} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-white/5">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 hover:text-accent-300 border border-accent-500/20 transition-all duration-200 text-sm font-medium group"
          >
            <FiPlus
              size={16}
              className="group-hover:rotate-90 transition-transform duration-200"
            />
            New conversation
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-surface-600 flex items-center justify-center mx-auto mb-3">
                <FiMessageSquare size={20} className="text-slate-500" />
              </div>
              <p className="text-sm text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-600 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            groupOrder.map((group) => {
              const groupChats = grouped[group]
              if (!groupChats?.length) return null
              return (
                <div key={group}>
                  <p className="text-xs text-slate-600 font-medium px-3 mb-1.5 uppercase tracking-wider">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {groupChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''} group/item relative`}
                        onClick={() => onSelectChat(chat.id)}
                      >
                        <FiMessageSquare size={14} className="flex-shrink-0 opacity-60" />
                        <span className="flex-1 truncate">{chat.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteChat(chat.id)
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:text-red-400 transition-all flex-shrink-0"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/5 space-y-1">
          {chats.length > 0 && (
            <button
              onClick={() => onDownloadChat(currentChatId)}
              className="w-full chat-history-item"
            >
              <FiDownload size={14} />
              <span>Download conversation</span>
            </button>
          )}
          {chats.length > 0 && (
            <button
              onClick={onClearAll}
              className="w-full chat-history-item hover:text-red-400"
            >
              <FiTrash2 size={14} />
              <span>Clear all chats</span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-full chat-history-item ${showSettings ? 'active' : ''}`}
          >
            <FiSettings size={14} />
            <span>Settings</span>
            <FiChevronRight
              size={12}
              className={`ml-auto transition-transform ${showSettings ? 'rotate-90' : ''}`}
            />
          </button>

          {showSettings && (
            <div className="glass rounded-xl p-3 mt-2 space-y-3 animate-fade-in">
              <p className="text-xs font-medium text-slate-300">Settings</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">API Endpoint</span>
                </div>
                <input
                  className="w-full bg-surface-700 border border-surface-500 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent-500 transition-colors"
                  defaultValue={import.meta.env.VITE_API_URL || 'http://localhost:8000'}
                  placeholder="http://localhost:8000"
                  readOnly
                />
              </div>
              <div className="text-xs text-slate-600">
                Set VITE_API_URL in .env to configure
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
