import React from 'react'
import { FiMenu, FiX, FiZap } from 'react-icons/fi'

const Navbar = ({ sidebarOpen, onToggleSidebar, currentChat }) => {
  return (
    <div className="h-14 flex items-center justify-between px-4 glass border-b border-white/5 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="btn-ghost p-2 md:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}
          >
            <FiZap size={14} className="text-white fill-current" />
          </div>
          <span className="font-semibold text-sm tracking-wide">
            <span className="gradient-text">Aria</span>
          </span>
        </div>
      </div>

      {currentChat && (
        <span className="text-xs text-slate-500 truncate max-w-48 hidden sm:block">
          {currentChat.title}
        </span>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:block">Online</span>
        </div>
      </div>
    </div>
  )
}

export default Navbar
