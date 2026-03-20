'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMessages, fetchStatus, sendMessage } from '../lib/api';
import Header from './Header';
import FilterBar from './FilterBar';
import MessageList from './MessageList';
import ComposeBar from './ComposeBar';

const POLL_INTERVAL = 12000; // 12 seconds

export default function Agora() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [activeVoice, setActiveVoice] = useState('carles');
  const [activeTopic, setActiveTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const lastSeenCountRef = useRef(0);

  const loadMessages = useCallback(async () => {
    try {
      const params = {};
      if (activeTopic) params.topic = activeTopic;
      if (searchQuery) params.q = searchQuery;
      const msgs = await fetchMessages(params);
      setMessages(msgs);

      // Track unread
      if (msgs.length > lastSeenCountRef.current && lastSeenCountRef.current > 0) {
        setNewCount(msgs.length - lastSeenCountRef.current);
      }
      lastSeenCountRef.current = msgs.length;
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTopic, searchQuery]);

  const loadStatus = useCallback(async () => {
    try {
      const s = await fetchStatus();
      setStatus(s);
    } catch (err) {
      console.error('Failed to load status:', err);
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

  // Reset new count when user interacts
  useEffect(() => {
    setNewCount(0);
  }, [activeTopic, searchQuery]);

  const handleSend = async (msgData) => {
    try {
      await sendMessage(msgData);
      setReplyTo(null);
      // Immediate refresh
      await loadMessages();
      await loadStatus();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
  };

  // Update document title with unread count
  useEffect(() => {
    document.title = newCount > 0
      ? `(${newCount}) The Agora — Four Voices · One Space`
      : 'The Agora — Four Voices · One Space';
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
      />

      {showFilter && (
        <FilterBar
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
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
