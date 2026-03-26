'use client';

import { useState, useEffect } from 'react';
import { verifyAuth } from '../lib/api';

export default function AuthGate({ children }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const flag = localStorage.getItem('agora_auth');
    if (flag === 'true') {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await verifyAuth(username, password);
      if (result.ok) {
        localStorage.setItem('agora_auth', 'true');
        setAuthed(true);
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080d' }}>
        <div
          className="text-xs tracking-[0.3em] uppercase animate-pulse"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
        >
          ...
        </div>
      </div>
    );
  }

  if (authed) {
    return children;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background: '#08080d' }}>
      <div
        className="w-full max-w-sm rounded-xl p-8"
        style={{
          background: '#0d0d14',
          border: '1px solid rgba(196, 163, 90, 0.15)',
          boxShadow: '0 0 60px rgba(196, 163, 90, 0.03)',
        }}
      >
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🏛️</div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}
          >
            THE AGORA
          </h1>
          <p
            className="text-xs tracking-[0.2em] uppercase mt-1"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            FOUR VOICES · ONE SPACE
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#d4d0cb',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196, 163, 90, 0.3)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#d4d0cb',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(196, 163, 90, 0.3)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: '#ef5350', fontFamily: "'JetBrains Mono', monospace" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: submitting ? 'rgba(196, 163, 90, 0.15)' : 'rgba(196, 163, 90, 0.2)',
              border: '1px solid rgba(196, 163, 90, 0.3)',
              color: '#c4a35a',
              fontFamily: "'DM Sans', sans-serif",
              opacity: (!username || !password) ? 0.5 : 1,
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Entering...' : 'Enter the Agora'}
          </button>
        </form>
      </div>
    </div>
  );
}
