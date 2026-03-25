'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchBookmarks, fetchTags, deleteBookmark } from '../../lib/api';
import { VOICES } from '../../lib/constants';
import Link from 'next/link';

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [tags, setTags] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      const params = {};
      if (filterTag) params.tag = filterTag;
      if (filterProject) params.project = filterProject;
      const data = await fetchBookmarks(params);
      setBookmarks(Array.isArray(data) ? data : []);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [filterTag, filterProject]);

  useEffect(() => {
    fetchTags()
      .then((t) => setTags(Array.isArray(t) ? t : []))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = async (timestamp) => {
    try {
      await deleteBookmark(timestamp);
      loadBookmarks();
    } catch {
      // silent
    }
  };

  const topicTags = tags.filter((t) => t.type === 'topic');
  const projectTags = tags.filter((t) => t.type === 'project');

  // Group by project
  const grouped = {};
  for (const bm of bookmarks) {
    const key = bm.project || 'Untagged';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(bm);
  }

  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}
            >
              ★ Bookmarks
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
            >
              {bookmarks.length} saved {bookmarks.length === 1 ? 'message' : 'messages'}
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

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs"
            style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
          >
            Filter:
          </span>
          <button
            onClick={() => { setFilterTag(''); setFilterProject(''); }}
            className="topic-pill transition-colors"
            style={{
              background: !filterTag && !filterProject ? 'rgba(196, 163, 90, 0.15)' : 'rgba(255,255,255,0.04)',
              color: !filterTag && !filterProject ? '#c4a35a' : '#7a758088',
            }}
          >
            All
          </button>
          {topicTags.map((t) => (
            <button
              key={t.name}
              onClick={() => setFilterTag(filterTag === t.name ? '' : t.name)}
              className="topic-pill transition-colors"
              style={{
                background: filterTag === t.name ? `${t.color || '#7a7580'}22` : 'rgba(255,255,255,0.04)',
                color: filterTag === t.name ? (t.color || '#c4a35a') : '#7a758088',
              }}
            >
              {t.name}
            </button>
          ))}
          {projectTags.map((p) => (
            <button
              key={p.name}
              onClick={() => setFilterProject(filterProject === p.name ? '' : p.name)}
              className="topic-pill transition-colors"
              style={{
                background: filterProject === p.name ? `${p.color || '#26a69a'}22` : 'rgba(255,255,255,0.04)',
                color: filterProject === p.name ? (p.color || '#26a69a') : '#7a758088',
              }}
            >
              📁 {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        {loading && (
          <p
            className="text-center py-8 text-sm"
            style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Loading bookmarks...
          </p>
        )}

        {!loading && bookmarks.length === 0 && (
          <p
            className="text-center py-8 text-sm"
            style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace" }}
          >
            No bookmarks yet. Star ☆ a message to save it here.
          </p>
        )}

        {Object.entries(grouped).map(([project, items]) => (
          <div key={project} className="mb-6">
            <h2
              className="text-xs uppercase tracking-widest mb-2 px-1"
              style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
            >
              {project}
            </h2>
            <div className="space-y-2">
              {items.map((bm) => {
                const voice = VOICES[bm.from] || VOICES.carles;
                return (
                  <div
                    key={bm.timestamp}
                    className="rounded-lg p-3 transition-colors hover:border-white/10"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderLeft: `3px solid ${voice.color}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ color: voice.color, fontSize: '0.85rem' }}>
                            {voice.emoji} {voice.name}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                          >
                            {formatDate(bm.timestamp)}
                          </span>
                        </div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {bm.text_preview}
                        </p>
                        {bm.note && (
                          <p
                            className="text-xs italic"
                            style={{ color: '#c4a35a99', fontFamily: "'DM Sans', sans-serif" }}
                          >
                            &ldquo;{bm.note}&rdquo;
                          </p>
                        )}
                        {bm.tags && bm.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bm.tags.map((tag) => (
                              <span
                                key={tag}
                                className="topic-pill"
                                style={{ background: 'rgba(255,255,255,0.06)', color: '#7a7580' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(bm.timestamp)}
                        className="text-xs flex-shrink-0 p-1 rounded transition-colors"
                        style={{ color: '#7a758066' }}
                        title="Remove bookmark"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
