'use client';

import { useRef, useEffect } from 'react';
import Message from './Message';

function formatDateSeparator(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - msgDate) / 86400000);

  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options);

  if (diffDays === 0) return `Today — ${formatted}`;
  if (diffDays === 1) return `Yesterday — ${formatted}`;
  return formatted;
}

function getDateKey(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function MessageList({ messages, onReply }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: prevCountRef.current === 0 ? 'auto' : 'smooth' });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  // Build a map of reply_to -> message for reply previews
  const messagesByTimestamp = {};
  for (const msg of messages) {
    messagesByTimestamp[msg.timestamp] = msg;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-4"
      style={{ scrollBehavior: 'smooth' }}
    >
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-agora-muted text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            The Agora awaits its first words...
          </p>
        </div>
      )}

      {messages.map((msg, i) => {
        const prev = i > 0 ? messages[i - 1] : null;
        const isGrouped = prev && prev.from === msg.from && !msg.reply_to;
        const replyMessage = msg.reply_to ? messagesByTimestamp[msg.reply_to] : null;

        // Date separator: show when date changes between messages
        const showDateSeparator = !prev || getDateKey(msg.timestamp) !== getDateKey(prev.timestamp);

        return (
          <div key={msg.timestamp + i}>
            {showDateSeparator && (
              <div className="flex items-center gap-4 px-4 sm:px-6 py-3 my-2">
                <div className="flex-1 h-px" style={{ background: 'rgba(196, 163, 90, 0.15)' }} />
                <span
                  className="text-xs whitespace-nowrap"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#c4a35a',
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {formatDateSeparator(msg.timestamp)}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(196, 163, 90, 0.15)' }} />
              </div>
            )}
            <Message
              message={msg}
              isGrouped={isGrouped && !showDateSeparator}
              onReply={onReply}
              replyMessage={replyMessage}
            />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
