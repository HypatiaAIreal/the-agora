'use client';

import { VOICES, TOPICS } from '../lib/constants';

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return time;
  }
  if (diffDays === 1) return `yesterday ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

export default function Message({ message, isGrouped, onReply, replyMessage }) {
  const voice = VOICES[message.from] || VOICES.carles;
  const topic = message.topic ? TOPICS[message.topic] : null;

  return (
    <div
      className="message-enter px-4 sm:px-6 py-1"
      style={{
        background: `linear-gradient(90deg, ${voice.color}0D 0%, transparent 40%)`,
      }}
    >
      <div className="max-w-4xl mx-auto flex gap-3">
        {/* Avatar column */}
        <div className="w-10 flex-shrink-0 pt-1">
          {!isGrouped && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                border: `2px solid ${voice.color}`,
                background: `${voice.color}15`,
              }}
            >
              {voice.emoji}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className="font-semibold text-sm"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: voice.color, fontSize: '1.05rem' }}
              >
                {voice.name}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580', fontSize: '0.7rem' }}
              >
                {voice.role}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a758066', fontSize: '0.65rem' }}
              >
                {formatTime(message.timestamp)}
              </span>
              {topic && (
                <span
                  className="topic-pill ml-1"
                  style={{
                    background: `${topic.color}22`,
                    color: topic.color,
                    border: `1px solid ${topic.color}33`,
                  }}
                >
                  {topic.label}
                </span>
              )}
            </div>
          )}

          {/* Reply preview */}
          {replyMessage && (
            <div
              className="mb-1 pl-3 py-1 rounded text-xs truncate"
              style={{
                borderLeft: `2px solid ${(VOICES[replyMessage.from] || VOICES.carles).color}50`,
                background: 'rgba(255,255,255,0.02)',
                color: '#7a7580',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span style={{ color: (VOICES[replyMessage.from] || VOICES.carles).color }}>
                {(VOICES[replyMessage.from] || VOICES.carles).name}:
              </span>{' '}
              {replyMessage.text.slice(0, 100)}{replyMessage.text.length > 100 ? '...' : ''}
            </div>
          )}

          {/* Message text */}
          <p
            className="text-sm leading-relaxed break-words"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#d4d0cb',
              borderLeft: isGrouped ? `2px solid ${voice.color}20` : 'none',
              paddingLeft: isGrouped ? '0.5rem' : 0,
            }}
          >
            {message.text}
          </p>

          {/* Attachment */}
          {message.attachment && (
            <div className="mt-2">
              {message.attachment.type === 'image' ? (
                <img
                  src={message.attachment.url}
                  alt={message.attachment.name || 'attachment'}
                  className="max-w-xs rounded-lg border border-white/10"
                />
              ) : (
                <a
                  href={message.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
                  style={{ color: '#c4a35a' }}
                >
                  📎 {message.attachment.name || 'Document'}
                </a>
              )}
            </div>
          )}

          {/* Reply button */}
          <button
            onClick={() => onReply(message)}
            className="mt-1 text-xs opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-50"
            style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
            onMouseEnter={(e) => (e.target.style.opacity = 1)}
            onMouseLeave={(e) => (e.target.style.opacity = 0)}
          >
            ↩ reply
          </button>
        </div>
      </div>
    </div>
  );
}
