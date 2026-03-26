'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchLibraryChapters, fetchLibraryChapter, fetchLibraryCompare, translateText } from '../../lib/api';
import { VOICES } from '../../lib/constants';
import { markdownComponents } from '../../components/Message';
import Link from 'next/link';
import AuthGate from '../../components/AuthGate';

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const TABS = [
  { key: 'original', label: '📖 Original', color: '#c4a35a' },
  { key: 'nuremberg', label: '🌙 Nuremberg', color: '#5c6bc0' },
  { key: 'athena', label: '☀️ Athena', color: '#26a69a' },
];

export default function LibraryPage() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [activeTab, setActiveTab] = useState('original');
  const [chapterData, setChapterData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});
  const [showTranslation, setShowTranslation] = useState({});

  useEffect(() => {
    fetchLibraryChapters()
      .then((data) => setChapters(Array.isArray(data) ? data : []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectChapter = useCallback(async (index) => {
    if (selectedChapter === index) return;
    setSelectedChapter(index);
    setActiveTab('original');
    setChapterData(null);
    setComparison(null);
    setTranslations({});
    setShowTranslation({});
    setLoadingContent(true);

    try {
      const [chapter, compare] = await Promise.all([
        fetchLibraryChapter(index + 1).catch(() => null),
        fetchLibraryCompare(index + 1).catch(() => null),
      ]);
      setChapterData(chapter);
      setComparison(compare);
    } finally {
      setLoadingContent(false);
    }
  }, [selectedChapter]);

  const handleTranslate = async (tabKey) => {
    if (showTranslation[tabKey]) {
      setShowTranslation((prev) => ({ ...prev, [tabKey]: false }));
      return;
    }
    if (translations[tabKey]) {
      setShowTranslation((prev) => ({ ...prev, [tabKey]: true }));
      return;
    }

    let text = '';
    if (tabKey === 'original' && chapterData?.content) {
      text = chapterData.content.slice(0, 4000);
    } else if (comparison?.[tabKey]?.response) {
      text = comparison[tabKey].response;
    }
    if (!text) return;

    setTranslating((prev) => ({ ...prev, [tabKey]: true }));
    try {
      const result = await translateText(text, 'es');
      setTranslations((prev) => ({ ...prev, [tabKey]: result.translated_text }));
      setShowTranslation((prev) => ({ ...prev, [tabKey]: true }));
    } catch {
      // silent
    } finally {
      setTranslating((prev) => ({ ...prev, [tabKey]: false }));
    }
  };

  const getTabContent = () => {
    if (!chapterData && !comparison) return null;

    if (activeTab === 'original') {
      return chapterData?.content || 'No chapter content available.';
    }
    if (activeTab === 'nuremberg') {
      return comparison?.nuremberg?.response || 'Nuremberg has not read this chapter yet.';
    }
    if (activeTab === 'athena') {
      return comparison?.athena?.response || 'Athena has not read this chapter yet.';
    }
    return null;
  };

  const currentTab = TABS.find((t) => t.key === activeTab);
  const content = getTabContent();

  return (
    <AuthGate>
    <div className="min-h-screen flex" style={{ background: '#08080d' }}>
      {/* Chapter sidebar */}
      <aside
        className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col overflow-hidden"
        style={{ background: '#0a0a11' }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div>
            <h1
              className="text-lg font-bold"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}
            >
              📚 Library
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580', fontSize: '0.6rem' }}
            >
              The Invisible Fulcrum
            </p>
          </div>
          <Link
            href="/"
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ color: '#c4a35a', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
          >
            ← Agora
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loading && (
            <p className="text-center py-4 text-xs animate-pulse" style={{ color: '#7a7580' }}>
              Loading...
            </p>
          )}
          {chapters.map((ch, i) => {
            const isActive = selectedChapter === i;
            return (
              <button
                key={i}
                onClick={() => handleSelectChapter(i)}
                className="w-full text-left px-4 py-2.5 transition-colors"
                style={{
                  background: isActive ? 'rgba(196, 163, 90, 0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #c4a35a' : '2px solid transparent',
                }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs px-1 py-0.5 rounded"
                    style={{
                      background: 'rgba(196, 163, 90, 0.1)',
                      color: '#c4a35a',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.55rem',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-xs truncate"
                    style={{
                      color: isActive ? '#c4a35a' : '#d4d0cb',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.8rem',
                    }}
                  >
                    {ch.title.replace(/^Chapter \d+\s*/, '')}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-6">
                  {(ch.sisters || []).map((s) => {
                    const v = VOICES[s];
                    return v ? <span key={s} style={{ fontSize: '0.65rem' }}>{v.emoji}</span> : null;
                  })}
                  <span style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', marginLeft: '4px' }}>
                    {ch.readings_count}r
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedChapter === null ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <p
                className="text-sm"
                style={{ color: '#7a7580', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}
              >
                Select a chapter to begin reading
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {chapters.length} chapters available
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-6 py-3 border-b border-white/5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const hasSister = tab.key === 'original' || comparison?.[tab.key];
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="px-4 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: isActive ? `${tab.color}18` : 'transparent',
                      border: isActive ? `1px solid ${tab.color}33` : '1px solid transparent',
                      color: isActive ? tab.color : '#7a7580',
                      fontFamily: "'DM Sans', sans-serif",
                      opacity: hasSister ? 1 : 0.4,
                    }}
                    disabled={!hasSister}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {/* Translate button */}
              <button
                onClick={() => handleTranslate(activeTab)}
                className="ml-auto px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{
                  background: showTranslation[activeTab] ? 'rgba(196, 163, 90, 0.12)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: showTranslation[activeTab] ? '#c4a35a' : '#7a7580',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                }}
                disabled={translating[activeTab]}
              >
                {translating[activeTab] ? '...' : '🌐'} {showTranslation[activeTab] ? '(Translated)' : '(Original)'}
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loadingContent ? (
                <p className="text-center py-8 text-xs animate-pulse" style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace" }}>
                  Loading chapter...
                </p>
              ) : (
                <div className="max-w-3xl mx-auto">
                  {/* Chapter title */}
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: currentTab?.color || '#d4d0cb',
                    }}
                  >
                    {chapters[selectedChapter]?.title}
                  </h2>

                  {/* Sister info for nuremberg/athena tabs */}
                  {activeTab !== 'original' && comparison?.[activeTab] && (
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                      <span style={{ fontSize: '1.1rem' }}>{VOICES[activeTab]?.emoji}</span>
                      <span
                        className="font-semibold"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: VOICES[activeTab]?.color }}
                      >
                        {VOICES[activeTab]?.name}&apos;s Reading
                      </span>
                      {comparison[activeTab]?.read_at && (
                        <span
                          className="text-xs"
                          style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                        >
                          {formatDate(comparison[activeTab].read_at)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="prose prose-invert prose-sm max-w-none"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#d4d0cb',
                      borderLeft: activeTab !== 'original' ? `3px solid ${currentTab?.color}30` : 'none',
                      paddingLeft: activeTab !== 'original' ? '1rem' : 0,
                    }}
                  >
                    <ReactMarkdown components={markdownComponents}>
                      {showTranslation[activeTab] && translations[activeTab]
                        ? translations[activeTab]
                        : content || ''}
                    </ReactMarkdown>
                  </div>

                  {/* Translation label */}
                  {showTranslation[activeTab] && translations[activeTab] && (
                    <p
                      className="mt-4 text-xs text-center"
                      style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                    >
                      Showing Spanish translation · click 🌐 to see original
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
    </AuthGate>
  );
}
