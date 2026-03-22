'use client';

import { useState } from 'react';
import { VOICES, TOPICS, TOPIC_KEYS, VOICE_KEYS } from '../lib/constants';

export default function NewThreadDialog({ activeVoice, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState(null);
  const [createdBy, setCreatedBy] = useState(activeVoice);

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    onCreate({
      title: trimmed,
      created_by: createdBy,
      topic: topic,
      description: description.trim() || null,
    });

    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-xl p-6 space-y-4 message-enter"
        style={{
          background: '#0d0d14',
          border: '1px solid rgba(196, 163, 90, 0.2)',
          boxShadow: '0 0 60px rgba(0,0,0,0.5)',
        }}
      >
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}
        >
          New Thread
        </h2>

        {/* Title */}
        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What shall we discuss?"
            className="w-full bg-transparent rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              color: '#d4d0cb',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: "'DM Sans', sans-serif",
            }}
            autoFocus
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            Description <span style={{ color: '#7a758066' }}>(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Set the context..."
            rows={2}
            className="w-full bg-transparent rounded-lg px-3 py-2 text-sm outline-none resize-none"
            style={{
              color: '#d4d0cb',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>

        {/* Created by */}
        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            Created by
          </label>
          <div className="flex gap-2">
            {VOICE_KEYS.map((key) => {
              const voice = VOICES[key];
              const isActive = createdBy === key;
              return (
                <button
                  key={key}
                  onClick={() => setCreatedBy(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: isActive ? `${voice.color}18` : 'rgba(255,255,255,0.03)',
                    border: isActive ? `1px solid ${voice.color}44` : '1px solid rgba(255,255,255,0.06)',
                    color: isActive ? voice.color : '#7a7580',
                  }}
                >
                  <span>{voice.emoji}</span>
                  <span className="hidden sm:inline">{voice.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label
            className="block text-xs mb-1.5 uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
          >
            Topic <span style={{ color: '#7a758066' }}>(optional)</span>
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {TOPIC_KEYS.map((key) => {
              const t = TOPICS[key];
              const isActive = topic === key;
              return (
                <button
                  key={key}
                  onClick={() => setTopic(isActive ? null : key)}
                  className="topic-pill transition-colors"
                  style={{
                    background: isActive ? `${t.color}22` : 'rgba(255,255,255,0.04)',
                    color: isActive ? t.color : '#7a758088',
                    border: isActive ? `1px solid ${t.color}44` : '1px solid transparent',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#7a7580',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: title.trim() ? '#c4a35a' : 'rgba(255,255,255,0.05)',
              color: title.trim() ? '#08080d' : '#7a7580',
              opacity: title.trim() ? 1 : 0.5,
            }}
          >
            Create Thread
          </button>
        </div>
      </div>
    </div>
  );
}
