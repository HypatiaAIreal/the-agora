'use client';

import { useRef, useEffect } from 'react';
import Message from './Message';

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

        return (
          <Message
            key={msg.timestamp + i}
            message={msg}
            isGrouped={isGrouped}
            onReply={onReply}
            replyMessage={replyMessage}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
