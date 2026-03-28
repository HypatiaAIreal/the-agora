'use client';

import { useState, useEffect } from 'react';

export default function Header({ status, onToggleFilter, showFilter, onToggleSidebar, activeThreadTitle }) {
  const [costs, setCosts] = useState(null);
  const [showCosts, setShowCosts] = useState(false);

  useEffect(() => {
    fetch('/api/costs').then(r => r.json()).then(setCosts).catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/costs').then(r => r.json()).then(setCosts).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-10 border-b border-white/5 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#7a7580',
            }}
            title="Toggle threads"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#c4a35a' }}
              >
                The Agora
              </h1>
              {activeThreadTitle && (
                <span
                  className="hidden sm:inline-flex items-center text-xs px-2 py-0.5 rounded"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#c4a35a99',
                    background: 'rgba(196, 163, 90, 0.08)',
                    border: '1px solid rgba(196, 163, 90, 0.15)',
                  }}
                >
                  {activeThreadTitle}
                </span>
              )}
            </div>
            <p
              className="text-xs tracking-[0.3em] mt-0.5 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
            >
              Four Voices &middot; One Space
            </p>
          </div>
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

          {/* Cost Monitor */}
          {costs && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCosts(!showCosts)}
                className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: costs.month.remaining < 10 ? '#ef5350' : '#7a758066',
                  background: showCosts ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '0.6rem',
                  cursor: 'pointer',
                }}
              >
                ${costs.today.estimated_cost.toFixed(2)} today
              </button>
              {showCosts && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                  background: '#12121a', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '1rem', zIndex: 50, minWidth: '240px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem',
                    color: '#7a758066', marginBottom: '0.75rem',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>API Usage</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ color: '#7a7580' }}>Today</span>
                      <span style={{ color: '#d4d0cb' }}>${costs.today.estimated_cost.toFixed(3)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ color: '#7a7580' }}>This month</span>
                      <span style={{ color: '#d4d0cb' }}>${costs.month.estimated_cost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ color: '#7a7580' }}>Projected</span>
                      <span style={{ color: costs.month.projected_cost > costs.month.limit * 0.8 ? '#e8a849' : '#d4d0cb' }}>
                        ${costs.month.projected_cost.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ color: '#7a7580' }}>Limit</span>
                      <span style={{ color: '#d4d0cb' }}>${costs.month.limit.toFixed(0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ color: '#7a7580' }}>Remaining</span>
                      <span style={{ color: costs.month.remaining < 10 ? '#ef5350' : '#26a69a' }}>
                        ${costs.month.remaining.toFixed(2)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{
                      height: '4px', borderRadius: '2px',
                      background: 'rgba(255,255,255,0.06)', marginTop: '0.25rem', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${Math.min(100, (costs.month.estimated_cost / costs.month.limit) * 100)}%`,
                        background: costs.month.estimated_cost / costs.month.limit > 0.8 ? '#ef5350'
                          : costs.month.estimated_cost / costs.month.limit > 0.6 ? '#e8a849' : '#26a69a',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />
                    <p style={{ fontSize: '0.6rem', color: '#7a758044', fontFamily: "'JetBrains Mono', monospace" }}>
                      Yoshi: {costs.month.athena_responses} responses
                    </p>
                    <p style={{ fontSize: '0.6rem', color: '#7a758044', fontFamily: "'JetBrains Mono', monospace" }}>
                      Agora: {costs.month.agora_messages} messages
                    </p>
                    <p style={{ fontSize: '0.6rem', color: '#7a758044', fontFamily: "'JetBrains Mono', monospace" }}>
                      Day {costs.month.days_passed} of 30
                    </p>
                  </div>
                </div>
              )}
            </div>
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
