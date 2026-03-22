'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMessages, fetchStatus, fetchThreads, createThread, sendMessage } from '../lib/api';
import Header from './Header';
import FilterBar from './FilterBar';
import MessageList from './MessageList';
import ComposeBar from './ComposeBar';

const POLL_INTERVAL = 12000;

function ThreadSidebar({ threads, activeThreadId, onSelectThread, onNewThread, activeVoice }) {
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await onNewThread({ title: newTitle.trim(), created_by: activeVoice });
    setNewTitle('');
    setShowNew(false);
  };

  return (
    <div style={{
      width: '240px', minWidth: '240px', borderRight: '1px solid rgba(255,255,255,0.06)',
      background: '#0a0a10', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#7a7580', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Threads
        </span>
        <button onClick={() => setShowNew(!showNew)} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px',
          color: '#c4a35a', fontSize: '12px', padding: '2px 8px', cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
        }}>+</button>
      </div>

      {showNew && (
        <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <input
            value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Thread title..."
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', padding: '6px 8px', color: '#d4d0cb', fontSize: '12px',
              fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button onClick={handleCreate} style={{
            marginTop: '4px', width: '100%', background: 'rgba(196,163,90,0.15)',
            border: '1px solid rgba(196,163,90,0.2)', borderRadius: '6px', padding: '4px',
            color: '#c4a35a', fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>Create</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {threads.map(t => (
          <button key={t.thread_id} onClick={() => onSelectThread(t.thread_id)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
            background: activeThreadId === t.thread_id ? 'rgba(196,163,90,0.08)' : 'transparent',
            border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer',
            borderLeft: activeThreadId === t.thread_id ? '2px solid #c4a35a' : '2px solid transparent',
          }}>
            <div style={{ fontSize: '13px', color: activeThreadId === t.thread_id ? '#c4a35a' : '#d4d0cb', fontFamily: "'DM Sans', sans-serif", fontWeight: activeThreadId === t.thread_id ? 600 : 400 }}>
              {t.title}
            </div>
            <div style={{ fontSize: '10px', color: '#555', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>
              {t.message_count || 0} msgs
              {t.last_message && ` · ${t.last_message.from}`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Agora({ onLogout }) {
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [status, setStatus] = useState(null);
  const [activeVoice, setActiveVoice] = useState('carles');
  const [activeTopic, setActiveTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const lastSeenCountRef = useRef(0);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      const t = await fetchThreads();
      if (!mountedRef.current) return;
      setThreads(Array.isArray(t) ? t : []);
      // Auto-select first thread on initial load
      if (!initializedRef.current && Array.isArray(t) && t.length > 0) {
        const general = t.find(th => th.title === 'General');
        setActiveThreadId(general ? general.thread_id : t[0].thread_id);
        initializedRef.current = true;
      }
    } catch (err) {
      console.error('[Agora] loadThreads error:', err);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!activeThreadId) return;
    try {
      const params = { thread_id: activeThreadId };
      if (activeTopic) params.topic = activeTopic;
      if (searchQuery) params.q = searchQuery;
      const msgs = await fetchMessages(params);
      if (!mountedRef.current) return;
      setMessages(msgs);
      setError(null);
      if (msgs.length > lastSeenCountRef.current && lastSeenCountRef.current > 0) {
        setNewCount(msgs.length - lastSeenCountRef.current);
      }
      lastSeenCountRef.current = msgs.length;
    } catch (err) {
      console.error('[Agora] loadMessages error:', err);
      if (mountedRef.current) setError(`Could not load messages: ${err.message}`);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [activeThreadId, activeTopic, searchQuery]);

  const loadStatus = useCallback(async () => {
    try {
      const s = await fetchStatus();
      if (mountedRef.current) setStatus(s);
    } catch (err) {
      console.error('[Agora] loadStatus error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => { loadThreads(); loadStatus(); }, [loadThreads, loadStatus]);

  // Load messages when thread changes
  useEffect(() => {
    if (activeThreadId) {
      setLoading(true);
      loadMessages();
    }
  }, [activeThreadId, loadMessages]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
      loadThreads();
      loadMessages();
      loadStatus();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadThreads, loadMessages, loadStatus]);

  useEffect(() => { setNewCount(0); }, [activeTopic, searchQuery, activeThreadId]);

  const handleSend = async (msgData) => {
    try {
      await sendMessage({ ...msgData, thread_id: activeThreadId });
      setReplyTo(null);
    } catch (err) {
      console.error('[Agora] sendMessage error:', err);
    }
    try { await loadMessages(); await loadThreads(); await loadStatus(); } catch (e) {}
  };

  const handleNewThread = async ({ title, created_by }) => {
    try {
      const t = await createThread({ title, created_by });
      await loadThreads();
      if (t && t.thread_id) setActiveThreadId(t.thread_id);
    } catch (err) {
      console.error('[Agora] createThread error:', err);
    }
  };

  const handleReply = (msg) => { setReplyTo(msg); };

  useEffect(() => {
    const activeThread = threads.find(t => t.thread_id === activeThreadId);
    const threadName = activeThread ? activeThread.title : 'The Agora';
    document.title = newCount > 0
      ? `(${newCount}) ${threadName} — The Agora`
      : `${threadName} — The Agora`;
  }, [newCount, activeThreadId, threads]);

  if (loading && !activeThreadId) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080d' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}>
            The Agora
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase animate-pulse" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}>
            Opening the gates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ background: '#08080d' }}>
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onNewThread={handleNewThread}
        activeVoice={activeVoice}
      />
      <div className="flex flex-col flex-1 relative z-10">
        <Header
          status={status}
          onToggleFilter={() => setShowFilter(!showFilter)}
          showFilter={showFilter}
          onLogout={onLogout}
          activeThread={threads.find(t => t.thread_id === activeThreadId)}
        />

        {showFilter && (
          <FilterBar
            activeTopic={activeTopic}
            onTopicChange={setActiveTopic}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {error && (
          <div className="text-center py-2 px-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs"
              style={{ background: 'rgba(239, 83, 80, 0.1)', color: '#ef5350', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', border: '1px solid rgba(239, 83, 80, 0.2)' }}>
              {error}
              <button onClick={() => { setError(null); loadMessages(); }} className="underline hover:no-underline ml-2">retry</button>
            </span>
          </div>
        )}

        {newCount > 0 && (
          <div className="text-center py-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs"
              style={{ background: 'rgba(196, 163, 90, 0.15)', color: '#c4a35a', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', border: '1px solid rgba(196, 163, 90, 0.2)' }}>
              {newCount} new {newCount === 1 ? 'message' : 'messages'}
            </span>
          </div>
        )}

        <MessageList messages={messages} onReply={handleReply} />

        <ComposeBar
          activeVoice={activeVoice}
          onVoiceChange={setActiveVoice}
          onSend={handleSend}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>
    </div>
  );
}
