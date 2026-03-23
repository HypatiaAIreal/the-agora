'use client';

import { VOICES, TOPICS } from '../lib/constants';
import ReactMarkdown from 'react-markdown';

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${month} ${day}, ${time}`;
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
            <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
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
              {message.project && (
                <span
                  className="topic-pill ml-1"
                  style={{
                    background: 'rgba(196, 163, 90, 0.12)',
                    color: '#c4a35a',
                    border: '1px solid rgba(196, 163, 90, 0.25)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  📁 {message.project}
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

          {/* Message text with markdown */}
          <div
            className="text-sm leading-relaxed break-words agora-markdown"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#d4d0cb',
              borderLeft: isGrouped ? `2px solid ${voice.color}20` : 'none',
              paddingLeft: isGrouped ? '0.5rem' : 0,
            }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-2 mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mb-2 mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold mb-1 mt-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}>{children}</h3>
                ),
                strong: ({ children }) => <strong className="font-bold" style={{ color: '#e8e4df' }}>{children}</strong>,
                em: ({ children }) => <em className="italic" style={{ color: '#b0acaa' }}>{children}</em>,
                code: ({ inline, className, children }) => {
                  if (inline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          fontFamily: "'JetBrains Mono', monospace",
                          color: '#c4a35a',
                        }}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="block p-3 rounded-lg my-2 text-xs overflow-x-auto"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#d4d0cb',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="my-2">{children}</pre>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                hr: () => (
                  <hr className="my-3 border-0 h-px" style={{ background: 'rgba(196, 163, 90, 0.2)' }} />
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#c4a35a' }}>
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="pl-3 my-2 italic"
                    style={{ borderLeft: '2px solid rgba(196, 163, 90, 0.4)', color: '#7a7580' }}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

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
