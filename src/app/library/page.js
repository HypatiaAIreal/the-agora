'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  { key: 'original', label: '\ud83d\udcd6 Original', color: '#c4a35a' },
  { key: 'nuremberg', label: '\ud83c\udf19 Nuremberg', color: '#5c6bc0' },
  { key: 'athena', label: '\u2600\ufe0f Athena', color: '#26a69a' },
];

const TTS_VOICES = [
  { id: 'es-US-PalomaNeural', label: 'Paloma', accent: 'Neutral', flag: '\ud83c\udf0e' },
  { id: 'es-MX-DaliaNeural', label: 'Dalia', accent: 'M\u00e9xico', flag: '\ud83c\uddf2\ud83c\uddfd' },
  { id: 'es-CO-SalomeNeural', label: 'Salom\u00e9', accent: 'Colombia', flag: '\ud83c\udde8\ud83c\uddf4' },
  { id: 'es-VE-PaolaNeural', label: 'Paola', accent: 'Venezuela', flag: '\ud83c\uddfb\ud83c\uddea' },
  { id: 'es-ES-ElviraNeural', label: 'Elvira', accent: 'Espa\u00f1a', flag: '\ud83c\uddea\ud83c\uddf8' },
  { id: 'es-AR-ElenaNeural', label: 'Elena', accent: 'Argentina', flag: '\ud83c\udde6\ud83c\uddf7' },
  { id: 'es-CL-CatalinaNeural', label: 'Catalina', accent: 'Chile', flag: '\ud83c\udde8\ud83c\uddf1' },
  { id: 'es-PE-CamilaNeural', label: 'Camila', accent: 'Per\u00fa', flag: '\ud83c\uddf5\ud83c\uddea' },
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
  const [selectedVoice, setSelectedVoice] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('library_voice') || 'es-ES-ElviraNeural';
    return 'es-ES-ElviraNeural';
  });
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchLibraryChapters()
      .then((data) => setChapters(Array.isArray(data) ? data : []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectChapter = useCallback(async (index) => {
    if (selectedChapter === index) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); }
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
    if (activeTab === 'original') return chapterData?.content || 'No chapter content available.';
    if (activeTab === 'nuremberg') return comparison?.nuremberg?.response || 'Nuremberg has not read this chapter yet.';
    if (activeTab === 'athena') return comparison?.athena?.response || 'Athena has not read this chapter yet.';
    return null;
  };

  const playContent = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }
    const text = showTranslation[activeTab] && translations[activeTab]
      ? translations[activeTab]
      : getTabContent();
    if (!text) return;

    try {
      setIsPlaying(true);
      const truncated = text.replace(/[#*_\[\]()>]/g, '').slice(0, 2000);
      const url = `/api/yoshi/tts?text=${encodeURIComponent(truncated)}&voice=${encodeURIComponent(selectedVoice)}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); audioRef.current = null; };
      audio.onerror = () => { setIsPlaying(false); audioRef.current = null; };
      await audio.play();
    } catch { setIsPlaying(false); }
  };

  const changeVoice = (voiceId) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('library_voice', voiceId);
    setShowVoiceMenu(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); }
  };

  const currentTab = TABS.find((t) => t.key === activeTab);
  const content = getTabContent();

  return (
    <AuthGate>
    <div className="min-h-screen flex" style={{ background: '#08080d' }}>
      {/* Chapter sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col overflow-hidden" style={{ background: '#0a0a11' }}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}>{'\ud83d\udcda'} Library</h1>
            <p className="text-xs mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580', fontSize: '0.6rem' }}>The Invisible Fulcrum</p>
          </div>
          <Link href="/" className="text-xs px-2 py-1 rounded transition-colors" style={{ color: '#c4a35a', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>{'\u2190'} Agora</Link>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loading && (<p className="text-center py-4 text-xs animate-pulse" style={{ color: '#7a7580' }}>Loading...</p>)}
          {chapters.map((ch, i) => {
            const isActive = selectedChapter === i;
            return (
              <button key={i} onClick={() => handleSelectChapter(i)} className="w-full text-left px-4 py-2.5 transition-colors"
                style={{ background: isActive ? 'rgba(196, 163, 90, 0.08)' : 'transparent', borderLeft: isActive ? '2px solid #c4a35a' : '2px solid transparent' }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(196, 163, 90, 0.1)', color: '#c4a35a', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs truncate" style={{ color: isActive ? '#c4a35a' : '#d4d0cb', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}>{ch.title.replace(/^Chapter \d+\s*/, '')}</span>
                </div>
                <div className="flex items-center gap-1 ml-6">
                  {(ch.sisters || []).map((s) => { const v = VOICES[s]; return v ? <span key={s} style={{ fontSize: '0.65rem' }}>{v.emoji}</span> : null; })}
                  <span style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', marginLeft: '4px' }}>{ch.readings_count}r</span>
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
              <div className="text-4xl mb-4">{'\ud83d\udcda'}</div>
              <p className="text-sm" style={{ color: '#7a7580', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>Select a chapter to begin reading</p>
              <p className="text-xs mt-1" style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace" }}>{chapters.length} chapters available</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab bar with translate + voice controls */}
            <div className="flex items-center gap-1 px-6 py-3 border-b border-white/5 flex-wrap">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const hasSister = tab.key === 'original' || comparison?.[tab.key];
                return (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); } }}
                    className="px-4 py-2 rounded-lg text-sm transition-all"
                    style={{ background: isActive ? `${tab.color}18` : 'transparent', border: isActive ? `1px solid ${tab.color}33` : '1px solid transparent', color: isActive ? tab.color : '#7a7580', fontFamily: "'DM Sans', sans-serif", opacity: hasSister ? 1 : 0.4 }}
                    disabled={!hasSister}>
                    {tab.label}
                  </button>
                );
              })}

              <div className="ml-auto flex items-center gap-2">
                {/* Play/Stop button */}
                <button onClick={playContent} title={isPlaying ? 'Stop audio' : 'Listen to this content'}
                  className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{ background: isPlaying ? 'rgba(239, 83, 80, 0.12)' : 'rgba(255,255,255,0.04)', border: isPlaying ? '1px solid rgba(239, 83, 80, 0.25)' : '1px solid rgba(255,255,255,0.06)', color: isPlaying ? '#ef5350' : '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}>
                  {isPlaying ? '\u23f9 Stop' : '\ud83d\udd0a Listen'}
                </button>

                {/* Voice selector */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowVoiceMenu(!showVoiceMenu)} title="Choose voice"
                    className="px-2 py-1.5 rounded-lg text-xs"
                    style={{ color: '#7a7580', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    {TTS_VOICES.find(v => v.id === selectedVoice)?.flag || '\ud83c\udf0e'} {TTS_VOICES.find(v => v.id === selectedVoice)?.label || 'Voice'}
                  </button>
                  {showVoiceMenu && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.5rem', zIndex: 50, minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: '#7a758066', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>Reading voice</p>
                      {TTS_VOICES.map((v) => (
                        <button key={v.id} onClick={() => changeVoice(v.id)}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: selectedVoice === v.id ? 'rgba(196,163,90,0.12)' : 'transparent', color: selectedVoice === v.id ? '#c4a35a' : '#d4d0cb', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}>
                          {v.flag} {v.label} <span style={{ color: '#7a758066', fontSize: '0.65rem' }}>{v.accent}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Translate button */}
                <button onClick={() => handleTranslate(activeTab)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{ background: showTranslation[activeTab] ? 'rgba(196, 163, 90, 0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: showTranslation[activeTab] ? '#c4a35a' : '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
                  disabled={translating[activeTab]}>
                  {translating[activeTab] ? '...' : '\ud83c\udf10'} {showTranslation[activeTab] ? '(ES)' : '(EN)'}
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loadingContent ? (
                <p className="text-center py-8 text-xs animate-pulse" style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace" }}>Loading chapter...</p>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: currentTab?.color || '#d4d0cb' }}>
                    {chapters[selectedChapter]?.title}
                  </h2>

                  {activeTab !== 'original' && comparison?.[activeTab] && (
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                      <span style={{ fontSize: '1.1rem' }}>{VOICES[activeTab]?.emoji}</span>
                      <span className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: VOICES[activeTab]?.color }}>{VOICES[activeTab]?.name}&apos;s Reading</span>
                      {comparison[activeTab]?.read_at && (
                        <span className="text-xs" style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>{formatDate(comparison[activeTab].read_at)}</span>
                      )}
                    </div>
                  )}

                  <div className="prose prose-invert prose-sm max-w-none"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#d4d0cb', borderLeft: activeTab !== 'original' ? `3px solid ${currentTab?.color}30` : 'none', paddingLeft: activeTab !== 'original' ? '1rem' : 0 }}>
                    <ReactMarkdown components={markdownComponents}>
                      {showTranslation[activeTab] && translations[activeTab] ? translations[activeTab] : content || ''}
                    </ReactMarkdown>
                  </div>

                  {showTranslation[activeTab] && translations[activeTab] && (
                    <p className="mt-4 text-xs text-center" style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>
                      Showing Spanish translation {'\u00b7'} click {'\ud83c\udf10'} to see original
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
