'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMessages, fetchStatus, fetchThreads, fetchBookmarks, createThread, sendMessage } from '../lib/api';
import Header from './Header';
import FilterBar from './FilterBar';
import MessageList from './MessageList';
import ComposeBar from './ComposeBar';
import ThreadSidebar from './ThreadSidebar';
import NewThreadDialog from './NewThreadDialog';

const POLL_INTERVAL = 12000; // 12 seconds

export default function Agora() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [activeVoice, setActiveVoice] = useState('carles');
  const [activeTopic, setActiveTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [bookmarkedTimestamps, setBookmarkedTimestamps] = useState(new Set());
  const lastSeenCountRef = useRef(0);

  const loadBookmarks = useCallback(async () => {
    try {
      const data = await fetchBookmarks();
      const timestamps = new Set(
        (Array.isArray(data) ? data : []).map((b) => b.timestamp)
      );
      setBookmarkedTimestamps(timestamps);
    } catch {
      // silent
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const params = {};
      if (activeTopic) params.topic = activeTopic;
      if (searchQuery) params.q = searchQuery;
      if (activeThreadId) params.thread_id = activeThreadId;
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
  }, [activeTopic, searchQuery, activeThreadId]);

  const loadStatus = useCallback(async () => {
    try {
      const s = await fetchStatus();
      setStatus(s);
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      const t = await fetchThreads();
      // Sort by last_message timestamp (most recent first)
      t.sort((a, b) => {
        const aTime = a.last_message?.timestamp || a.created_at || '';
        const bTime = b.last_message?.timestamp || b.created_at || '';
        return bTime.localeCompare(aTime);
      });
      setThreads(t);
      // Auto-select first thread (General) if none selected yet
      setActiveThreadId((prev) => {
        if (prev) return prev;
        const general = t.find((th) => th.title === 'General');
        return general?.id || t[0]?.id || null;
      });
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMessages();
    loadStatus();
    loadThreads();
    loadBookmarks();
  }, [loadMessages, loadStatus, loadThreads, loadBookmarks]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
      loadStatus();
      loadThreads();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMessages, loadStatus, loadThreads]);

  // Reset unread count when user changes filters or thread
  useEffect(() => {
    setNewCount(0);
    lastSeenCountRef.current = 0;
  }, [activeTopic, searchQuery, activeThreadId]);

  const handleSend = async (msgData) => {
    try {
      await sendMessage({
        ...msgData,
        thread_id: activeThreadId,
      });
      setReplyTo(null);
      await loadMessages();
      await loadStatus();
      await loadThreads();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
  };

  const handleCreateThread = async (threadData) => {
    try {
      const result = await createThread(threadData);
      await loadThreads();
      if (result.thread_id) {
        setActiveThreadId(result.thread_id);
      }
    } catch (err) {
      console.error('Failed to create thread:', err);
    }
  };

  const handleSelectThread = (threadId) => {
    setActiveThreadId(threadId);
    setReplyTo(null);
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
    <div className="flex h-screen relative z-10" style={{ background: '#08080d' }}>
      {/* Thread Sidebar */}
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={() => setShowNewThread(true)}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          status={status}
          onToggleFilter={() => setShowFilter(!showFilter)}
          showFilter={showFilter}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeThreadTitle={
            threads.find((t) => t.id === activeThreadId)?.title || null
          }
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

        <MessageList
          messages={messages}
          onReply={handleReply}
          bookmarkedTimestamps={bookmarkedTimestamps}
          onBookmarkChange={loadBookmarks}
        />

        <ComposeBar
          activeVoice={activeVoice}
          onVoiceChange={setActiveVoice}
          onSend={handleSend}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>

      {/* New Thread Dialog */}
      {showNewThread && (
        <NewThreadDialog
          activeVoice={activeVoice}
          onClose={() => setShowNewThread(false)}
          onCreate={handleCreateThread}
        />
      )}
    </div>
  );
}
