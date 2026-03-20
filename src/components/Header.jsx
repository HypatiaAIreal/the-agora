'use client';

export default function Header({ status, onToggleFilter, showFilter }) {
  return (
    <header className="relative z-10 border-b border-white/5 px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#c4a35a' }}
          >
            The Agora
          </h1>
          <p
            className="text-xs tracking-[0.3em] mt-0.5 uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            Four Voices &middot; One Space
          </p>
        </div>

        <div className="flex items-center gap-4">
          {status && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {status.total_messages} messages
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
