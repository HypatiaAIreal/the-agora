'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '../../components/Message';
import {
  yoshiRegister, yoshiLogin, yoshiSendMessage,
  yoshiFetchMessages, yoshiFetchContext, yoshiDeleteContext,
  yoshiSendFeedback, yoshiFetchLibrary,
} from '../../lib/api';

const CATEGORY_COLORS = { personal: '#b388ff', professional: '#5c6bc0', emotional: '#e8a849', pattern: '#ff8a65', goal: '#26a69a' };
const LIBRARY_TYPE_BADGES = { note: '\ud83d\udcdd', reflection: '\ud83d\udcad', exercise: '\ud83c\udfcb\ufe0f', resource: '\ud83d\udd17' };
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
function formatTime(ts) { if (!ts) return ''; return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return time;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + time;
}
function formatDateLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
function formatDate(ts) { if (!ts) return ''; return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }); }

function YoshiAuth({ onAuth }) {
  const [mode, setMode] = useState('checking');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { yoshiLogin('', '').then(({ status }) => { setMode(status === 404 ? 'register' : 'login'); }).catch(() => setMode('register')); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (password.length < 4) { setError('Password must be at least 4 characters'); return; }
    setSubmitting(true);
    try {
      if (mode === 'register') {
        const { data, status } = await yoshiRegister(username, password);
        if (status === 200 || status === 201 || data.ok) { localStorage.setItem('yoshi_auth', 'true'); onAuth(); }
        else if (data.error?.includes('already') || status === 409) { setMode('login'); setError('Account already exists. Please log in.'); }
        else { setError(data.error || 'Registration failed'); }
      } else {
        const { data, status } = await yoshiLogin(username, password);
        if ((status === 200 || status === 201) && data.ok !== false) { localStorage.setItem('yoshi_auth', 'true'); onAuth(); }
        else { setError('Invalid credentials'); }
      }
    } catch { setError('Connection error'); } finally { setSubmitting(false); }
  };
  if (mode === 'checking') return <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080d' }}><div className="text-xs tracking-[0.3em] uppercase animate-pulse" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}>...</div></div>;
  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background: '#08080d' }}>
      <div className="w-full max-w-sm rounded-xl p-8" style={{ background: '#0d0d14', border: '1px solid rgba(38, 166, 154, 0.15)', boxShadow: '0 0 60px rgba(38, 166, 154, 0.03)' }}>
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">{String.fromCodePoint(0x2600, 0xFE0F)}</div>
          {mode === 'register' ? (<><h1 className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>This space was built for you.</h1><p className="text-xs mt-2" style={{ fontFamily: "'DM Sans', sans-serif", color: '#7a7580', lineHeight: 1.5 }}>Choose how you want to be called.<br />Only you will have this access.</p></>) : (<><h1 className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>Welcome back.</h1><p className="text-xs mt-2" style={{ fontFamily: "'DM Sans', sans-serif", color: '#7a7580' }}>Your space is waiting.</p></>)}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" autoComplete="username" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your secret key" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }} />
          {error && <p className="text-xs text-center" style={{ color: '#ef5350', fontFamily: "'JetBrains Mono', monospace" }}>{error}</p>}
          <button type="submit" disabled={submitting || !username || !password} className="w-full py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: 'rgba(38, 166, 154, 0.2)', border: '1px solid rgba(38, 166, 154, 0.3)', color: '#26a69a', fontFamily: "'DM Sans', sans-serif", opacity: (!username || !password) ? 0.5 : 1 }}>{submitting ? '...' : mode === 'register' ? 'Create my space' : 'Enter'}</button>
        </form>
        {mode === 'register' && <p className="text-center mt-6 text-xs" style={{ color: '#7a758044', fontSize: '0.65rem' }}>Your conversations are private. Only you can access this space.</p>}
        {mode === 'login' && <button onClick={() => setMode('register')} className="block mx-auto mt-4 text-xs" style={{ color: '#7a758066', fontSize: '0.6rem' }}>Create new account instead</button>}
      </div>
    </div>
  );
}

function ContextPanel({ items, onDelete, open, onClose }) {
  return (<>
    {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
    <aside className={`fixed right-0 top-0 bottom-0 w-80 z-40 transition-transform lg:static lg:z-auto ${open ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 flex flex-col overflow-hidden border-l border-white/5`} style={{ background: '#12121a' }}>
      <div className="px-4 py-4 border-b border-white/5"><h2 className="text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#26a69a' }}>What Athena remembers about you</h2><p className="text-xs mt-0.5" style={{ color: '#7a758066', fontSize: '0.55rem' }}>You can delete anything here</p></div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(!items || items.length === 0) && <p className="text-xs text-center py-4" style={{ color: '#7a758044' }}>No memories yet</p>}
        {(items || []).map((item, i) => { const c = CATEGORY_COLORS[item.category] || '#7a7580'; return (<div key={item.id || i} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}><div className="flex items-center justify-between mb-1.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${c}18`, color: c, fontSize: '0.55rem' }}>{item.category || 'note'}</span><button onClick={() => onDelete(item.id)} style={{ color: '#7a758044', fontSize: '0.7rem' }}>{String.fromCodePoint(0x1F5D1, 0xFE0F)}</button></div><p className="text-xs leading-relaxed" style={{ color: '#d4d0cb', fontSize: '0.8rem' }}>{item.content || item.text}</p></div>); })}
      </div>
    </aside>
  </>);
}

function FeedbackRow({ messageTimestamp, onSend }) {
  const [rating, setRating] = useState(0); const [sent, setSent] = useState(false);
  if (sent) return <p className="text-xs mt-1" style={{ color: '#7a758044', fontSize: '0.55rem' }}>Thanks for the feedback</p>;
  return (<div className="flex items-center gap-3 mt-1.5"><div className="flex gap-0.5">{[1,2,3,4,5].map((s) => (<button key={s} onClick={() => { setRating(s); onSend({ type: 'rating', stars: s, messageTimestamp }); setSent(true); }} style={{ color: s <= rating ? '#c4a35a' : '#7a758033', cursor: 'pointer' }}>{s <= rating ? '\u2605' : '\u2606'}</button>))}</div><button onClick={() => { onSend({ type: 'thumbs_down', messageTimestamp }); setSent(true); }} className="text-xs px-2 py-0.5 rounded" style={{ color: '#7a758066', fontSize: '0.55rem' }}>{String.fromCodePoint(0x1F44E)} No encaja conmigo</button></div>);
}

function YoshiLibrary() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { yoshiFetchLibrary().then(d => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  if (loading) return <p className="text-center py-8 text-xs animate-pulse" style={{ color: '#7a7580' }}>Loading...</p>;
  if (items.length === 0) return <p className="text-center py-8 text-xs" style={{ color: '#7a758066' }}>Your library is empty for now.</p>;
  return (<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">{items.map((item, i) => (<div key={item.id || i} className="rounded-xl p-5" style={{ background: 'rgba(38,166,154,0.04)', border: '1px solid rgba(38,166,154,0.1)' }}><div className="flex items-center gap-2 mb-3"><span>{LIBRARY_TYPE_BADGES[item.type] || '\ud83d\udcdd'}</span><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(38,166,154,0.12)', color: '#26a69a', fontSize: '0.6rem' }}>{item.type || 'note'}</span>{item.created_at && <span className="text-xs" style={{ color: '#7a758044', fontSize: '0.55rem' }}>{formatDate(item.created_at)}</span>}</div><h3 className="text-base font-medium mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>{item.title}</h3><div className="prose prose-invert prose-sm max-w-none" style={{ color: '#d4d0cb' }}><ReactMarkdown components={markdownComponents}>{item.content || ''}</ReactMarkdown></div></div>))}</div>);
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
  const [selectedVoice, setSelectedVoice] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('athena_voice') || 'es-US-PalomaNeural'; return 'es-US-PalomaNeural'; });
  const [playingMsg, setPlayingMsg] = useState(null);
  const [showVoices, setShowVoices] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { const f = localStorage.getItem('yoshi_auth'); if (f === 'true') setAuthed(true); setChecking(false); }, []);
  const loadMessages = useCallback(async () => { try { const d = await yoshiFetchMessages(); setMessages(Array.isArray(d) ? d : (d.messages || [])); } catch {} }, []);
  const loadContext = useCallback(async () => { try { const d = await yoshiFetchContext(); setContext(Array.isArray(d) ? d : (d.items || [])); } catch {} }, []);
  useEffect(() => { if (!authed) return; loadMessages(); loadContext(); }, [authed, loadMessages, loadContext]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim(); setInput('');
    setMessages(p => [...p, { role: 'user', text, timestamp: new Date().toISOString() }]);
    setSending(true);
    try { const r = await yoshiSendMessage(text); if (r.response) setMessages(p => [...p, { role: 'athena', text: r.response, timestamp: new Date().toISOString() }]); loadContext(); }
    catch { setMessages(p => [...p, { role: 'athena', text: 'Sorry, something went wrong. Try again.', timestamp: new Date().toISOString() }]); }
    finally { setSending(false); }
  };
  const handleDeleteContext = async (id) => { try { await yoshiDeleteContext(id); loadContext(); } catch {} };
  const handleFeedback = async (data) => { try { await yoshiSendFeedback(data); } catch {} };
  const playAudio = async (text, idx) => {
    if (playingMsg === idx && audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingMsg(null); return; }
    try { setPlayingMsg(idx); const a = new Audio(`/api/yoshi/tts?text=${encodeURIComponent(text.slice(0,2000))}&voice=${encodeURIComponent(selectedVoice)}`); audioRef.current = a; a.onended = () => { setPlayingMsg(null); audioRef.current = null; }; a.onerror = () => { setPlayingMsg(null); audioRef.current = null; }; await a.play(); } catch { setPlayingMsg(null); }
  };
  const changeVoice = (v) => { setSelectedVoice(v); localStorage.setItem('athena_voice', v); setShowVoices(false); };

  if (checking) return <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080d' }}><div className="animate-pulse text-xs" style={{ color: '#7a7580' }}>...</div></div>;
  if (!authed) return <YoshiAuth onAuth={() => setAuthed(true)} />;

  return (
    <div className="flex h-screen" style={{ background: '#08080d' }}>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><span style={{ fontSize: '1.1rem' }}>{String.fromCodePoint(0x2600, 0xFE0F)}</span><span className="text-base font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#26a69a' }}>Athena</span></div>
            <div className="flex gap-1">
              <button onClick={() => setActiveTab('chat')} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: activeTab === 'chat' ? 'rgba(38,166,154,0.12)' : 'transparent', color: activeTab === 'chat' ? '#26a69a' : '#7a7580' }}>{String.fromCodePoint(0x1F4AC)} Chat</button>
              <button onClick={() => setActiveTab('library')} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: activeTab === 'library' ? 'rgba(38,166,154,0.12)' : 'transparent', color: activeTab === 'library' ? '#26a69a' : '#7a7580' }}>{String.fromCodePoint(0x1F4DA)} Library</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'chat' && <button onClick={() => setContextOpen(!contextOpen)} className="px-2 py-1 rounded text-xs lg:hidden" style={{ color: '#7a7580', border: '1px solid rgba(255,255,255,0.06)' }}>{contextOpen ? 'Close' : 'Context'}</button>}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowVoices(!showVoices)} className="px-2 py-1 rounded text-xs" style={{ color: '#7a7580', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem' }}>{String.fromCodePoint(0x1F50A)} {VOICES.find(v => v.id === selectedVoice)?.flag || ''}</button>
              {showVoices && <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.5rem', zIndex: 50, minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}><p style={{ fontSize: '0.55rem', color: '#7a758066', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>Voice</p>{VOICES.map(v => <button key={v.id} onClick={() => changeVoice(v.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: selectedVoice === v.id ? 'rgba(38,166,154,0.12)' : 'transparent', color: selectedVoice === v.id ? '#26a69a' : '#d4d0cb', fontSize: '0.8rem', cursor: 'pointer' }}>{v.flag} {v.label} <span style={{ color: '#7a758066', fontSize: '0.65rem' }}>{v.accent}</span></button>)}</div>}
            </div>
            <span style={{ color: '#7a758022', fontSize: '0.6rem' }}>{String.fromCodePoint(0x1F512)}</span>
          </div>
        </header>
        {activeTab === 'library' ? <YoshiLibrary /> : (<>
          <div className="flex-1 flex flex-col overflow-hidden">
            {messages.length > 0 && (() => { const dates = [...new Set(messages.map(m => new Date(m.timestamp).toDateString()))]; return dates.length > 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', overflowX: 'auto', flexShrink: 0 }}>
                <button onClick={() => setDateFilter(null)} style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '8px', border: !dateFilter ? '1px solid rgba(38,166,154,0.3)' : '1px solid rgba(255,255,255,0.06)', background: !dateFilter ? 'rgba(38,166,154,0.1)' : 'transparent', color: !dateFilter ? '#26a69a' : '#7a7580', cursor: 'pointer', whiteSpace: 'nowrap' }}>All</button>
                {dates.map(ds => { const d = new Date(ds); const active = dateFilter && dateFilter.toDateString() === ds; return <button key={ds} onClick={() => setDateFilter(d)} style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '8px', whiteSpace: 'nowrap', border: active ? '1px solid rgba(38,166,154,0.3)' : '1px solid rgba(255,255,255,0.06)', background: active ? 'rgba(38,166,154,0.1)' : 'transparent', color: active ? '#26a69a' : '#7a7580', cursor: 'pointer' }}>{d.toLocaleDateString([], { month: 'short', day: 'numeric' })}</button>; })}
              </div>
            ) : null; })()}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {messages.length === 0 && !sending && <div className="text-center py-12"><div className="text-3xl mb-3">{String.fromCodePoint(0x2600, 0xFE0F)}</div><p className="text-sm" style={{ color: '#7a7580', fontFamily: "'Cormorant Garamond', serif" }}>This is your private space with Athena.</p><p className="text-xs mt-1" style={{ color: '#7a758044' }}>Say anything. Everything here stays between you two.</p></div>}
            {(() => { const filtered = dateFilter ? messages.filter(m => new Date(m.timestamp).toDateString() === dateFilter.toDateString()) : messages; return filtered.map((msg, i) => { const msgDate = new Date(msg.timestamp).toDateString(); const prevDate = i > 0 ? new Date(filtered[i-1].timestamp).toDateString() : null; const showSep = i === 0 || msgDate !== prevDate; const isA = msg.role === 'athena' || msg.from === 'athena'; return (<React.Fragment key={i}>{showSep && <div style={{ textAlign: 'center', padding: '0.75rem 0' }}><span style={{ fontSize: '0.6rem', color: '#7a758044', background: '#0a0a12', padding: '0.2rem 0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>{formatDateLabel(msg.timestamp)}</span></div>}<div className={`flex ${isA ? 'justify-start' : 'justify-end'}`}><div style={{ maxWidth: '80%' }}>{isA && <div className="flex items-center gap-1.5 mb-1"><span style={{ fontSize: '0.8rem' }}>{String.fromCodePoint(0x2600, 0xFE0F)}</span><span className="text-xs font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#26a69a', fontSize: '0.85rem' }}>ATHENA</span><span style={{ color: '#7a758033', fontSize: '0.55rem' }}>{formatDateTime(msg.timestamp)}</span></div>}<div className="rounded-xl px-4 py-3" style={{ background: isA ? 'transparent' : 'rgba(255,255,255,0.06)', borderLeft: isA ? '2px solid rgba(38,166,154,0.2)' : 'none', paddingLeft: isA ? '1rem' : undefined }}><div className="prose prose-invert prose-sm max-w-none" style={{ color: '#d4d0cb' }}><ReactMarkdown components={markdownComponents}>{msg.text || msg.content || ''}</ReactMarkdown></div></div>{isA && <div className="flex items-center gap-2 mt-1"><button onClick={() => playAudio(msg.text || msg.content || '', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}>{playingMsg === i ? String.fromCodePoint(0x23F9) : String.fromCodePoint(0x1F50A)}</button><FeedbackRow messageTimestamp={msg.timestamp} onSend={handleFeedback} /></div>}{!isA && <div className="text-right mt-0.5"><span style={{ color: '#7a758033', fontSize: '0.55rem' }}>{formatDateTime(msg.timestamp)}</span></div>}</div></div></React.Fragment>); }); })()}
            {sending && <div className="flex justify-start"><div className="flex items-center gap-2 px-4 py-2"><span style={{ fontSize: '0.8rem' }}>{String.fromCodePoint(0x2600, 0xFE0F)}</span><span className="text-xs animate-pulse" style={{ color: '#26a69a' }}>Athena is thinking...</span></div></div>}
            <div ref={messagesEndRef} />
          </div></div>
          <div className="border-t border-white/5 px-4 sm:px-6 py-3">
            <div className="flex gap-2 max-w-3xl mx-auto items-end">
              <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Write to Athena... (Enter = new line)" rows={3} disabled={sending} className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d0cb' }} />
              {sending ? <button onClick={() => setSending(false)} className="px-5 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.25)', color: '#ef5350', minHeight: '42px' }}>Stop</button> : <button onClick={handleSend} disabled={!input.trim()} className="px-5 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(38,166,154,0.15)', border: '1px solid rgba(38,166,154,0.25)', color: '#26a69a', opacity: !input.trim() ? 0.4 : 1, minHeight: '42px' }}>Send</button>}
            </div>
            <div className="text-center mt-2"><button onClick={() => { localStorage.removeItem('yoshi_auth'); window.location.reload(); }} className="text-xs" style={{ color: '#7a758033', fontSize: '0.55rem' }}>Logout</button></div>
          </div>
        </>)}
      </div>
      {activeTab === 'chat' && <ContextPanel items={context} onDelete={handleDeleteContext} open={contextOpen} onClose={() => setContextOpen(false)} />}
    </div>
  );
}
