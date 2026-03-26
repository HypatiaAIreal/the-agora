'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchLibraryChapters, fetchLibraryCompare } from '../../lib/api';
import { VOICES } from '../../lib/constants';
import Link from 'next/link';

const markdownComponents = {
  p: ({ children }) => <p className="text-sm leading-relaxed break-words mb-2 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d4d0cb' }}>{children}</h3>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5 text-sm">{children}</ol>,
  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="pl-3 my-2 text-sm italic" style={{ borderLeft: '2px solid #c4a35a44', color: '#7a7580' }}>
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <pre className="rounded p-3 my-2 overflow-x-auto text-xs" style={{ background: 'rgba(255,255,255,0.04)', fontFamily: "'JetBrains Mono', monospace" }}>
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)', fontFamily: "'JetBrains Mono', monospace", color: '#c4a35a' }}>
        {children}
      </code>
    );
  },
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#c4a35a' }}>
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />,
  strong: ({ children }) => <strong className="font-semibold" style={{ color: '#e0dcd7' }}>{children}</strong>,
  em: ({ children }) => <em className="italic" style={{ color: '#b0aca6' }}>{children}</em>,
};

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function LibraryPage() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    fetchLibraryChapters()
      .then((data) => setChapters(Array.isArray(data) ? data : []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectChapter = useCallback(async (chapter, index) => {
    if (selectedChapter === index) {
      setSelectedChapter(null);
      setComparison(null);
      return;
    }
    setSelectedChapter(index);
    setComparison(null);
    setLoadingCompare(true);
    try {
      const data = await fetchLibraryCompare(index + 1);
      setComparison(data);
    } catch {
      setComparison(null);
    } finally {
      setLoadingCompare(false);
    }
  }, [selectedChapter]);

  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}
            >
              📚 Library
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
            >
              The Invisible Fulcrum — {chapters.length} chapters
            </p>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(196, 163, 90, 0.1)',
              color: '#c4a35a',
              border: '1px solid rgba(196, 163, 90, 0.2)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Agora
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading && (
          <p
            className="text-center py-8 text-sm"
            style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Loading chapters...
          </p>
        )}

        {!loading && chapters.length === 0 && (
          <p
            className="text-center py-8 text-sm"
            style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace" }}
          >
            No chapters found.
          </p>
        )}

        {/* Chapter list */}
        <div className="space-y-2">
          {chapters.map((ch, i) => {
            const isSelected = selectedChapter === i;

            return (
              <div key={i}>
                <button
                  onClick={() => handleSelectChapter(ch, i)}
                  className="w-full text-left rounded-lg p-3 transition-colors"
                  style={{
                    background: isSelected ? 'rgba(196, 163, 90, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid rgba(196, 163, 90, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(196, 163, 90, 0.12)',
                            color: '#c4a35a',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.65rem',
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="text-sm font-medium truncate"
                          style={{
                            color: isSelected ? '#c4a35a' : '#d4d0cb',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {ch.title.replace(/^Chapter \d+\s*/, '')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {(ch.sisters || []).map((s) => {
                            const voice = VOICES[s];
                            if (!voice) return null;
                            return (
                              <span
                                key={s}
                                title={voice.name}
                                style={{ fontSize: '0.75rem' }}
                              >
                                {voice.emoji}
                              </span>
                            );
                          })}
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                        >
                          {ch.readings_count} {ch.readings_count === 1 ? 'reading' : 'readings'}
                        </span>
                        {ch.latest_read && (
                          <span
                            className="text-xs"
                            style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                          >
                            {formatDate(ch.latest_read)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-xs flex-shrink-0 mt-1"
                      style={{ color: '#7a758066', fontSize: '0.7rem' }}
                    >
                      {isSelected ? '▾' : '▸'}
                    </span>
                  </div>
                </button>

                {/* Expanded comparison */}
                {isSelected && (
                  <div className="mt-2 ml-4 mr-2">
                    {loadingCompare && (
                      <p
                        className="py-4 text-xs animate-pulse"
                        style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Loading responses...
                      </p>
                    )}

                    {comparison && !loadingCompare && (
                      <div className="space-y-3">
                        {/* Render each sister&apos;s response */}
                        {['nuremberg', 'athena'].map((sister) => {
                          const data = comparison[sister];
                          if (!data) return null;
                          const voice = VOICES[sister];

                          return (
                            <div
                              key={sister}
                              className="rounded-lg p-4"
                              style={{
                                background: `linear-gradient(135deg, ${voice.color}08 0%, transparent 50%)`,
                                border: `1px solid ${voice.color}20`,
                                borderLeft: `3px solid ${voice.color}`,
                              }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span style={{ fontSize: '1rem' }}>{voice.emoji}</span>
                                <span
                                  className="font-semibold text-sm"
                                  style={{ fontFamily: "'Cormorant Garamond', serif", color: voice.color }}
                                >
                                  {voice.name}
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580', fontSize: '0.65rem' }}
                                >
                                  {voice.role}
                                </span>
                                {data.read_at && (
                                  <span
                                    className="text-xs"
                                    style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a758044', fontSize: '0.6rem' }}
                                  >
                                    {formatDate(data.read_at)}
                                  </span>
                                )}
                              </div>
                              <div
                                className="prose prose-invert prose-sm max-w-none"
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  color: '#d4d0cb',
                                }}
                              >
                                <ReactMarkdown components={markdownComponents}>
                                  {data.response || 'No response available.'}
                                </ReactMarkdown>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!comparison && !loadingCompare && (
                      <p
                        className="py-4 text-xs"
                        style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        No comparison data available.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
