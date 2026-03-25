'use client';

import { useState, useEffect } from 'react';
import { fetchTags, createTag, createBookmark, deleteBookmark } from '../lib/api';

export default function BookmarkPopover({ message, isBookmarked, onClose, onBookmarkChange }) {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [note, setNote] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTags()
      .then((t) => setTags(Array.isArray(t) ? t : []))
      .catch(() => setTags([]));
  }, []);

  const topicTags = tags.filter((t) => t.type === 'topic');
  const projectTags = tags.filter((t) => t.type === 'project');

  const toggleTag = (name) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleCreateTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    try {
      await createTag({ name: trimmed, type: 'topic', color: '#7a7580' });
      const updated = await fetchTags();
      setTags(Array.isArray(updated) ? updated : []);
      setSelectedTags((prev) => [...prev, trimmed]);
      setNewTagName('');
    } catch {
      // silent
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await createBookmark({
        timestamp: message.timestamp,
        thread_id: message.thread_id || null,
        from: message.from,
        text_preview: message.text.slice(0, 200),
        tags: selectedTags,
        project: selectedProject || null,
        note: note.trim() || null,
      });
      onBookmarkChange?.();
      onClose();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await deleteBookmark(message.timestamp);
      onBookmarkChange?.();
      onClose();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mt-2 p-3 rounded-lg"
      style={{
        background: '#0d0d14',
        border: '1px solid rgba(196, 163, 90, 0.2)',
        maxWidth: '320px',
      }}
    >
      {/* Tags */}
      <label
        className="block mb-1 text-xs"
        style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
      >
        Tags
      </label>
      <div className="flex flex-wrap gap-1 mb-2">
        {topicTags.map((t) => (
          <button
            key={t.name}
            onClick={() => toggleTag(t.name)}
            className="topic-pill transition-colors"
            style={{
              background: selectedTags.includes(t.name) ? `${t.color || '#7a7580'}22` : 'rgba(255,255,255,0.04)',
              color: selectedTags.includes(t.name) ? (t.color || '#c4a35a') : '#7a758088',
              border: selectedTags.includes(t.name) ? `1px solid ${t.color || '#7a7580'}44` : '1px solid transparent',
            }}
          >
            {t.name}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            placeholder="+ new"
            className="bg-transparent border border-white/10 rounded px-2 py-0.5 text-xs outline-none"
            style={{ color: '#d4d0cb', fontFamily: "'JetBrains Mono', monospace", width: '70px', fontSize: '0.65rem' }}
          />
        </div>
      </div>

      {/* Project */}
      <label
        className="block mb-1 text-xs"
        style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
      >
        Project
      </label>
      <div className="flex flex-wrap gap-1 mb-2">
        {projectTags.map((p) => (
          <button
            key={p.name}
            onClick={() => setSelectedProject(selectedProject === p.name ? '' : p.name)}
            className="topic-pill transition-colors"
            style={{
              background: selectedProject === p.name ? `${p.color || '#26a69a'}22` : 'rgba(255,255,255,0.04)',
              color: selectedProject === p.name ? (p.color || '#26a69a') : '#7a758088',
              border: selectedProject === p.name ? `1px solid ${p.color || '#26a69a'}44` : '1px solid transparent',
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Note */}
      <label
        className="block mb-1 text-xs"
        style={{ color: '#7a7580', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
      >
        Note
      </label>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Why bookmark this?"
        className="w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-xs outline-none mb-3"
        style={{ color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }}
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-3 py-1 rounded text-xs font-medium transition-colors"
          style={{ background: '#c4a35a', color: '#08080d' }}
        >
          {loading ? '...' : (isBookmarked ? 'Update' : 'Save')}
        </button>
        {isBookmarked && (
          <button
            onClick={handleRemove}
            disabled={loading}
            className="px-3 py-1 rounded text-xs transition-colors"
            style={{ background: 'rgba(239, 83, 80, 0.15)', color: '#ef5350', border: '1px solid rgba(239, 83, 80, 0.2)' }}
          >
            Remove
          </button>
        )}
        <button
          onClick={onClose}
          className="px-3 py-1 rounded text-xs transition-colors"
          style={{ color: '#7a7580' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
