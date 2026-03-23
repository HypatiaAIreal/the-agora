'use client';

export default function Header({ status, onToggleFilter, showFilter, onLogout, activeThread, onToggleSidebar }) {
  return (
    <header className="relative z-10 border-b border-white/5 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger menu for threads */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#c4a35a',
            }}
            title="Threads"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-lg sm:text-2xl font-bold tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#c4a35a' }}
              >
                The Agora
              </h1>
              {activeThread && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(196, 163, 90, 0.1)',
                    color: '#c4a35a',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    border: '1px solid rgba(196, 163, 90, 0.2)',
                  }}
                >
                  {activeThread.title}
                </span>
              )}
            </div>
            <p
              className="text-xs tracking-[0.3em] mt-0.5 uppercase hidden sm:block"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
            >
              Four Voices &middot; One Space
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {status && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {status.total_messages} msgs
            </span>
          )}
          <button
            onClick={onToggleFilter}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: showFilter ? 'rgba(196, 163, 90, 0.15)' : 'rgba(255,255,255,0.03)',
              border: showFilter ? '1px solid rgba(196, 163, 90, 0.3)' : '1px solid rgba(255,255,255,0.06)',
              color: showFilter ? '#c4a35a' : '#7a7580',
            }}
            title="Toggle filters"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#7a7580',
              }}
              title="Leave the Agora"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
