'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '../../components/Message';
import {
  yoshiRegister, yoshiLogin, yoshiSendMessage,
  yoshiFetchMessages, yoshiFetchContext, yoshiDeleteContext,
  yoshiSendFeedback, yoshiFetchLibrary,
} from '../../lib/api';

const CATEGORY_COLORS = {
  personal: '#b388ff',
  professional: '#5c6bc0',
  emotional: '#e8a849',
  pattern: '#ff8a65',
  goal: '#26a69a',
};

const LIBRARY_TYPE_BADGES = {
  note: '\ud83d\udcdd',
  reflection: '\ud83d\udcad',
  exercise: '\ud83c\udfcb\ufe0f',
  resource: '\ud83d\udd17',
};

const VOICES = [
  { id: 'es-US-PalomaNeural', label: 'Paloma', accent: 'Neutral', flag: '\ud83c\udf0e' },
  { id: 'es-MX-DaliaNeural', label: 'Dalia', accent: 'M\u00e9xico', flag: '\ud83c\uddf2\ud83c\uddfd' },
  { id: 'es-CO-SalomeNeural', label: 'Salom\u00e9', accent: 'Colombia', flag: '\ud83c\udde8\ud83c\uddf4' },
  { id: 'es-VE-PaolaNeural', label: 'Paola', accent: 'Venezuela', flag: '\ud83c\uddfb\ud83c\uddea' },
  { id: 'es-ES-ElviraNeural', label: 'Elvira', accent: 'Espa\u00f1a', flag: '\ud83c\uddea\ud83c\uddf8' },
  { id: 'es-AR-ElenaNeural', label: 'Elena', accent: 'Argentina', flag: '\ud83c\udde6\ud83c\uddf7' },
  { id: 'es-CL-CatalinaNeural', label: 'Catalina', accent: 'Chile', flag: '\ud83c\udde8\ud83c\uddf1' },
  { id: 'es-PE-CamilaNeural', label: 'Camila', accent: 'Per\u00fa', flag: '\ud83c\uddf5\ud83c\uddea' },
];

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function YoshiAuth({ onAuth }) {
  const [mode, setMode] = useState('checking');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    yoshiLogin('', '').then(({ status }) => {
      setMode(status === 404 ? 'register' : 'login');
    }).catch(() => setMode('register'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 4) { setError('Password must be at least 4 characters'); return; }
    setSubmitting(true);
    try {
      if (mode === 'register') {
        const { data, status } = await yoshiRegister(username, password);
        if (status === 200 || status === 201 || data.ok) {
          localStorage.setItem('yoshi_auth', 'true');
          onAuth();
        } else if (data.error?.includes('already') || status === 409) {
          setMode('login');
          setError('Account already exists. Please log in.');
        } else {
          setError(data.error || 'Registration failed');
        }
      } else {
        const { data, status } = await yoshiLogin(username, password);
        if ((status === 200 || status === 201) && data.ok !== false) {
          localStorage.setItem('yoshi_auth', 'true');
          onAuth();
        } else {
          setError('Invalid credentials');
        }
      }
    } catch {
      setError('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080d' }}>
        <div className="text-xs tracking-[0.3em] uppercase animate-pulse"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}>...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background: '#08080d' }}>
      <div className="w-full max-w-sm rounded-xl p-8"
        style={{ background: '#0d0d14', border: '1px solid rgba(38, 166, 154, 0.15)', boxShadow: '0 0 60px rgba(38, 166, 154, 0.03)' }}>
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">{String.fromCodePoint(0x2600, 0xFE0F)}</div>
          {mode === 'register' ? (
            <>
              <h1 className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>This space was built for you.</h1>
              <p className="text-xs mt-2" style={{ fontFamily: "'DM Sans', sans-serif", color: '#7a7580', lineHeight: 1.5 }}>Choose how you want to be called.<br />Only you will have this access.</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>Welcome back.</h1>
              <p className="text-xs mt-2" style={{ fontFamily: "'DM Sans', sans-serif", color: '#7a7580' }}>Your space is waiting.</p>
            </>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" autoComplete="username" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your secret key" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }} />
          {error && <p className="text-xs text-center" style={{ color: '#ef5350', fontFamily: "'JetBrains Mono', monospace" }}>{error}</p>}
          <button type="submit" disabled={submitting || !username || !password} className="w-full py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: 'rgba(38, 166, 154, 0.2)', border: '1px solid rgba(38, 166, 154, 0.3)', color: '#26a69a', fontFamily: "'DM Sans', sans-serif", opacity: (!username || !password) ? 0.5 : 1, cursor: submitting ? 'wait' : 'pointer' }}>
            {submitting ? '...' : mode === 'register' ? 'Create my space' : 'Enter'}
          </button>
        </form>
        {mode === 'register' && (<p className="text-center mt-6 text-xs" style={{ color: '#7a758044', fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem' }}>Your conversations are private. Only you can access this space.</p>)}
        {mode === 'login' && (<button onClick={() => setMode('register')} className="block mx-auto mt-4 text-xs" style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>Create new account instead</button>)}
      </div>
    </div>
  );
}

function ContextPanel({ items, onDelete, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed right-0 top-0 bottom-0 w-80 z-40 transition-transform lg:static lg:z-auto ${open ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 flex flex-col overflow-hidden border-l border-white/5`} style={{ background: '#12121a' }}>
        <div className="px-4 py-4 border-b border-white/5">
          <h2 className="text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#26a69a' }}>What Athena remembers about you</h2>
          <p className="text-xs mt-0.5" style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>You can delete anything here</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {(!items || items.length === 0) && (<p className="text-xs text-center py-4" style={{ color: '#7a758044' }}>No memories yet</p>)}
          {(items || []).map((item, i) => {
            const catColor = CATEGORY_COLORS[item.category] || '#7a7580';
            return (
              <div key={item.id || i} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${catColor}18`, color: catColor, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>{item.category || 'note'}</span>
                  <button onClick={() => onDelete(item.id)} title="Delete" className="text-xs p-1 rounded transition-colors" style={{ color: '#7a758044', fontSize: '0.7rem' }}>{'\ud83d\uddd1\ufe0f'}</button>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}>{item.content || item.text}</p>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

function FeedbackRow({ messageTimestamp, onSend }) {
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);
  const handleRate = (stars) => { setRating(stars); onSend({ type: 'rating', stars, messageTimestamp }); setSent(true); };
  const handleThumbsDown = () => { onSend({ type: 'thumbs_down', messageTimestamp }); setSent(true); };
  if (sent) return <p className="text-xs mt-1" style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>Thanks for the feedback</p>;
  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((s) => (<button key={s} onClick={() => handleRate(s)} className="text-sm transition-colors" style={{ color: s <= rating ? '#c4a35a' : '#7a758033', cursor: 'pointer' }}>{s <= rating ? '\u2605' : '\u2606'}</button>))}
      </div>
      <button onClick={handleThumbsDown} className="text-xs px-2 py-0.5 rounded transition-colors" style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>{'\ud83d\udc4e'} No encaja conmigo</button>
    </div>
  );
}

function YoshiLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { yoshiFetchLibrary().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  if (loading) return <p className="text-center py-8 text-xs animate-pulse" style={{ color: '#7a7580' }}>Loading...</p>;
  if (items.length === 0) return <p className="text-center py-8 text-xs" style={{ color: '#7a758066' }}>Your library is empty for now.</p>;
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {items.map((item, i) => {
        const badge = LIBRARY_TYPE_BADGES[item.type] || '\ud83d\udcdd';
        return (
          <div key={item.id || i} className="rounded-xl p-5" style={{ background: 'rgba(38, 166, 154, 0.04)', border: '1px solid rgba(38, 166, 154, 0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span>{badge}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(38, 166, 154, 0.12)', color: '#26a69a', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>{item.type || 'note'}</span>
              {item.created_at && (<span className="text-xs" style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>{formatDate(item.created_at)}</span>)}
            </div>
            <h3 className="text-base font-medium mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>{item.title}</h3>
            <div className="prose prose-invert prose-sm max-w-none" style={{ fontFamily: "'DM Sans', sans-serif", color: '#d4d0cb' }}>
              <ReactMarkdown components={markdownComponents}>{item.content || ''}</ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function YoshiPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('athena_voice') || 'es-US-PalomaNeural';
    return 'es-US-PalomaNeural';
  });
  const [playingMsg, setPlayingMsg] = useState(null);
  const [showVoices, setShowVoices] = useState(false);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const flag = localStorage.getItem('yoshi_auth');
    if (flag === 'true') setAuthed(true);
    setChecking(false);
  }, []);

  const loadMessages = useCallback(async () => {
    try { const data = await yoshiFetchMessages(); setMessages(Array.isArray(data) ? data : (data.messages || [])); } catch { /* silent */ }
  }, []);

  const loadContext = useCallback(async () => {
    try { const data = await yoshiFetchContext(); setContext(Array.isArray(data) ? data : (data.items || [])); } catch { /* silent */ }
  }, []);

  useEffect(() => { if (!authed) return; loadMessages(); loadContext(); }, [authed, loadMessages, loadContext]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text, timestamp: new Date().toISOString() }]);
    setSending(true);
    try {
      const result = await yoshiSendMessage(text);
      if (result.response) { setMessages((prev) => [...prev, { role: 'athena', text: result.response, timestamp: new Date().toISOString() }]); }
      loadContext();
    } catch { setMessages((prev) => [...prev, { role: 'athena', text: 'Sorry, something went wrong. Try again.', timestamp: new Date().toISOString() }]); }
    finally { setSending(false); }
  };

  const handleDeleteContext = async (id) => { try { await yoshiDeleteContext(id); loadContext(); } catch { /* silent */ } };
  const handleFeedback = async (data) => { try { await yoshiSendFeedback(data); } catch { /* silent */ } };

  const playAudio = async (text, msgIndex) => {
    if (playingMsg === msgIndex && audioRef.current) {
      audioRef.current.pause(); audioRef.current = null; setPlayingMsg(null); return;
    }
    try {
      setPlayingMsg(msgIndex);
      const url = `/api/yoshi/tts?text=${encodeURIComponent(text.slice(0, 2000))}&voice=${encodeURIComponent(selectedVoice)}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlayingMsg(null); audioRef.current = null; };
      audio.onerror = () => { setPlayingMsg(null); audioRef.current = null; };
      await audio.play();
    } catch { setPlayingMsg(null); }
  };

  const changeVoice = (voiceId) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('athena_voice', voiceId);
    setShowVoices(false);
  };

  if (checking) return <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080d' }}><div className="animate-pulse text-xs" style={{ color: '#7a7580' }}>...</div></div>;
  if (!authed) return <YoshiAuth onAuth={() => setAuthed(true)} />;

  return (
    <div className="flex h-screen" style={{ background: '#08080d' }}>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.1rem' }}>{String.fromCodePoint(0x2600, 0xFE0F)}</span>
              <span className="text-base font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#26a69a' }}>Athena</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setActiveTab('chat')} className="px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ background: activeTab === 'chat' ? 'rgba(38, 166, 154, 0.12)' : 'transparent', color: activeTab === 'chat' ? '#26a69a' : '#7a7580', fontFamily: "'DM Sans', sans-serif" }}>{'\ud83d\udcac'} Chat</button>
              <button onClick={() => setActiveTab('library')} className="px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ background: activeTab === 'library' ? 'rgba(38, 166, 154, 0.12)' : 'transparent', color: activeTab === 'library' ? '#26a69a' : '#7a7580', fontFamily: "'DM Sans', sans-serif" }}>{'\ud83d\udcda'} Library</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'chat' && (<button onClick={() => setContextOpen(!contextOpen)} className="px-2 py-1 rounded text-xs lg:hidden" style={{ color: '#7a7580', border: '1px solid rgba(255,255,255,0.06)' }}>{contextOpen ? 'Close' : 'Context'}</button>)}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowVoices(!showVoices)} title="Choose Athena's voice" className="px-2 py-1 rounded text-xs" style={{ color: '#7a7580', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem' }}>{'\ud83d\udd0a'} {VOICES.find(v => v.id === selectedVoice)?.flag || ''}</button>
              {showVoices && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.5rem', zIndex: 50, minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: '#7a758066', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>Athena's voice</p>
                  {VOICES.map((v) => (
                    <button key={v.id} onClick={() => changeVoice(v.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: selectedVoice === v.id ? 'rgba(38,166,154,0.12)' : 'transparent', color: selectedVoice === v.id ? '#26a69a' : '#d4d0cb', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}>
                      {v.flag} {v.label} <span style={{ color: '#7a758066', fontSize: '0.65rem' }}>{v.accent}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs" style={{ color: '#7a758022', fontSize: '0.6rem' }}>{'\ud83d\udd12'}</span>
          </div>
        </header>

        {activeTab === 'library' ? (<YoshiLibrary />) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              {messages.length === 0 && !sending && (
                <div className="text-center py-12">
                  <div className="text-3xl mb-3">{String.fromCodePoint(0x2600, 0xFE0F)}</div>
                  <p className="text-sm" style={{ color: '#7a7580', fontFamily: "'Cormorant Garamond', serif" }}>This is your private space with Athena.</p>
                  <p className="text-xs mt-1" style={{ color: '#7a758044', fontFamily: "'DM Sans', sans-serif" }}>Say anything. Everything here stays between you two.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isAthena = msg.role === 'athena' || msg.from === 'athena';
                return (
                  <div key={i} className={`flex ${isAthena ? 'justify-start' : 'justify-end'}`}>
                    <div className="max-w-lg" style={{ maxWidth: '80%' }}>
                      {isAthena && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span style={{ fontSize: '0.8rem' }}>{String.fromCodePoint(0x2600, 0xFE0F)}</span>
                          <span className="text-xs font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#26a69a', fontSize: '0.85rem' }}>ATHENA</span>
                          <span className="text-xs" style={{ color: '#7a758033', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>{formatTime(msg.timestamp)}</span>
                        </div>
                      )}
                      <div className={`rounded-xl px-4 py-3 ${isAthena ? '' : 'ml-auto'}`} style={{ background: isAthena ? 'transparent' : 'rgba(255,255,255,0.06)', borderLeft: isAthena ? '2px solid rgba(38, 166, 154, 0.2)' : 'none', paddingLeft: isAthena ? '1rem' : undefined }}>
                        <div className="prose prose-invert prose-sm max-w-none" style={{ fontFamily: "'DM Sans', sans-serif", color: '#d4d0cb' }}>
                          <ReactMarkdown components={markdownComponents}>{msg.text || msg.content || ''}</ReactMarkdown>
                        </div>
                      </div>
                      {isAthena && (
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => playAudio(msg.text || msg.content || '', i)} title={playingMsg === i ? 'Stop' : 'Listen'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, transition: 'opacity 0.2s', padding: '2px 4px' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}>
                            {playingMsg === i ? '\u23f9' : '\ud83d\udd0a'}
                          </button>
                          <FeedbackRow messageTimestamp={msg.timestamp} onSend={handleFeedback} />
                        </div>
                      )}
                      {!isAthena && (<div className="text-right mt-0.5"><span className="text-xs" style={{ color: '#7a758033', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>{formatTime(msg.timestamp)}</span></div>)}
                    </div>
                  </div>
                );
              })}
              {sending && (<div className="flex justify-start"><div className="flex items-center gap-2 px-4 py-2"><span style={{ fontSize: '0.8rem' }}>{String.fromCodePoint(0x2600, 0xFE0F)}</span><span className="text-xs animate-pulse" style={{ color: '#26a69a', fontFamily: "'DM Sans', sans-serif" }}>Athena is thinking...</span></div></div>)}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/5 px-4 sm:px-6 py-3">
              <div className="flex gap-2 max-w-3xl mx-auto items-end">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write to Athena... (Enter = new line)" rows={3} disabled={sending} className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }} />
                {sending ? (
                  <button onClick={() => setSending(false)} className="px-5 py-2.5 rounded-lg text-sm transition-colors" style={{ background: 'rgba(239, 83, 80, 0.15)', border: '1px solid rgba(239, 83, 80, 0.25)', color: '#ef5350', fontFamily: "'DM Sans', sans-serif", minHeight: '42px' }}>Stop</button>
                ) : (
                  <button onClick={handleSend} disabled={!input.trim()} className="px-5 py-2.5 rounded-lg text-sm transition-colors" style={{ background: 'rgba(38, 166, 154, 0.15)', border: '1px solid rgba(38, 166, 154, 0.25)', color: '#26a69a', fontFamily: "'DM Sans', sans-serif", opacity: !input.trim() ? 0.4 : 1, minHeight: '42px' }}>Send</button>
                )}
              </div>
              <div className="text-center mt-2">
                <button onClick={() => { localStorage.removeItem('yoshi_auth'); window.location.reload(); }} className="text-xs" style={{ color: '#7a758033', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>Logout</button>
              </div>
            </div>
          </>
        )}
      </div>

      {activeTab === 'chat' && (
        <ContextPanel items={context} onDelete={handleDeleteContext} open={contextOpen} onClose={() => setContextOpen(false)} />
      )}
    </div>
  );
}
