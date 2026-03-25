'use client';

import Link from 'next/link';
import { VOICES, TOPICS } from '../lib/constants';

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}

export default function ThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  sidebarOpen,
  onCloseSidebar,
}) {
  const allThreads = threads;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}

      <aside
        className={`
          thread-sidebar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <h2
            className="text-sm tracking-[0.15em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            Threads
          </h2>
          <button
            onClick={onNewThread}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
            style={{
              background: 'rgba(196, 163, 90, 0.12)',
              border: '1px solid rgba(196, 163, 90, 0.25)',
              color: '#c4a35a',
            }}
            title="New thread"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto py-2">
          {allThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            const creator = thread.created_by ? VOICES[thread.created_by] : null;
            const topicData = thread.topic ? TOPICS[thread.topic] : null;

            return (
              <button
                key={thread.id}
                onClick={() => {
                  onSelectThread(thread.id);
                  onCloseSidebar();
                }}
                className={`thread-item ${isActive ? 'active' : ''}`}
                style={isActive ? {
                  background: 'rgba(196, 163, 90, 0.08)',
                  borderLeft: '2px solid #c4a35a',
                } : {}}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-medium truncate"
                    style={{
                      color: isActive ? '#c4a35a' : '#d4d0cb',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {thread.title}
                  </span>
                  {thread.message_count != null && (
                    <span
                      className="text-xs flex-shrink-0 ml-2"
                      style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
                    >
                      {thread.message_count}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {creator && (
                    <span className="text-xs" style={{ color: creator.color, fontSize: '0.65rem' }}>
                      {creator.emoji} {creator.name}
                    </span>
                  )}
                  {topicData && (
                    <span
                      className="topic-pill"
                      style={{
                        background: `${topicData.color}18`,
                        color: topicData.color,
                        fontSize: '0.55rem',
                        padding: '1px 6px',
                      }}
                    >
                      {topicData.label}
                    </span>
                  )}
                </div>

                {thread.last_message && (
                  <p
                    className="text-xs truncate mt-1"
                    style={{ color: '#7a758099', fontSize: '0.7rem' }}
                  >
                    {thread.last_message.text?.slice(0, 60)}
                  </p>
                )}

                {thread.last_message?.timestamp && (
                  <span
                    className="text-xs mt-0.5 block"
                    style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                  >
                    {formatTimeAgo(thread.last_message.timestamp)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bookmarks link */}
        <div className="px-4 py-3 border-t border-white/5">
          <Link
            href="/bookmarks"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#7a7580',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>★</span>
            Bookmarks
          </Link>
        </div>
      </aside>
    </>
  );
}
