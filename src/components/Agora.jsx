'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMessages, fetchStatus, sendMessage } from '../lib/api';
import Header from './Header';
import FilterBar from './FilterBar';
import MessageList from './MessageList';
import ComposeBar from './ComposeBar';

const POLL_INTERVAL = 12000;

export default function Agora({ onLogout }) {
  const [messages, setMessages] = useState([]);
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

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const params = {};
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
      if (mountedRef.current) {
        setError(`Could not load messages: ${err.message}`);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [activeTopic, searchQuery]);

  const loadStatus = useCallback(async () => {
    try {
      const s = await fetchStatus();
      if (mountedRef.current) setStatus(s);
    } catch (err) {
      console.error('[Agora] loadStatus error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMessages();
    loadStatus();
  }, [loadMessages, loadStatus]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
      loadStatus();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMessages, loadStatus]);

  // Reset new count on filter change
  useEffect(() => {
    setNewCount(0);
  }, [activeTopic, searchQuery]);

  const handleSend = async (msgData) => {
    try {
      await sendMessage(msgData);
      setReplyTo(null);
    } catch (err) {
      console.error('[Agora] sendMessage error:', err);
    }
    // Always refresh after send attempt, even if send failed
    try {
      await loadMessages();
      await loadStatus();
    } catch (err) {
      console.error('[Agora] refresh after send error:', err);
    }
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
  };

  // Tab title with unread count
  useEffect(() => {
    document.title = newCount > 0
      ? `(${newCount}) The Agora \u2014 Four Voices \u00b7 One Space`
      : 'The Agora \u2014 Four Voices \u00b7 One Space';
  }, [newCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080d' }}>
        <div className="text-center">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}
          >
            The Agora
          </h1>
          <p
            className="text-xs tracking-[0.3em] uppercase animate-pulse"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            Opening the gates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative z-10" style={{ background: '#08080d' }}>
      <Header
        status={status}
        onToggleFilter={() => setShowFilter(!showFilter)}
        showFilter={showFilter}
        onLogout={onLogout}
      />

      {showFilter && (
        <FilterBar
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Error banner */}
      {error && (
        <div className="text-center py-2 px-4">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs"
            style={{
              background: 'rgba(239, 83, 80, 0.1)',
              color: '#ef5350',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              border: '1px solid rgba(239, 83, 80, 0.2)',
            }}
          >
            {error}
            <button
              onClick={() => { setError(null); loadMessages(); }}
              className="underline hover:no-underline ml-2"
            >
              retry
            </button>
          </span>
        </div>
      )}

      {/* Unread indicator */}
      {newCount > 0 && (
        <div className="text-center py-1">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs"
            style={{
              background: 'rgba(196, 163, 90, 0.15)',
              color: '#c4a35a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              border: '1px solid rgba(196, 163, 90, 0.2)',
            }}
          >
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
  );
}
