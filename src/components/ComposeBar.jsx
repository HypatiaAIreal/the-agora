'use client';

import { useState, useRef, useEffect } from 'react';
import { VOICES } from '../lib/constants';
import { fetchTags, createTag } from '../lib/api';
import VoiceSelector from './VoiceSelector';

export default function ComposeBar({ activeVoice, onVoiceChange, onSend, replyTo, onCancelReply }) {
  const [text, setText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [showProjectInput, setShowProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [tags, setTags] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeVoice, replyTo]);

  useEffect(() => {
    fetchTags()
      .then((t) => setTags(Array.isArray(t) ? t : []))
      .catch(() => setTags([]));
  }, []);

  const topicTags = tags.filter((t) => t.type === 'topic');
  const projectTags = tags.filter((t) => t.type === 'project');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend({
      from: activeVoice,
      text: trimmed,
      topic: selectedTopic,
      project: selectedProject || null,
      reply_to: replyTo?.timestamp || null,
    });

    setText('');
    setSelectedTopic(null);
    setSelectedProject('');
    setShowProjectInput(false);
    setNewProjectName('');
    setExpanded(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateProject = async () => {
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    try {
      await createTag({ name: trimmed, type: 'project', color: '#7a7580' });
      const updated = await fetchTags();
      setTags(Array.isArray(updated) ? updated : []);
      setSelectedProject(trimmed);
      setNewProjectName('');
      setShowProjectInput(false);
    } catch {
      // silent
    }
  };

  const voice = VOICES[activeVoice];

  return (
    <div
      className="relative z-10 border-t border-white/5"
      style={{ background: 'rgba(13, 13, 20, 0.95)', backdropFilter: 'blur(10px)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Voice selector */}
        <VoiceSelector activeVoice={activeVoice} onSelect={onVoiceChange} />

        {/* Reply preview */}
        {replyTo && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${(VOICES[replyTo.from] || VOICES.carles).color}33`,
            }}
          >
            <span style={{ color: (VOICES[replyTo.from] || VOICES.carles).color }}>
              {String.fromCodePoint(0x21A9)} Replying to {(VOICES[replyTo.from] || VOICES.carles).name}:
            </span>
            <span className="truncate flex-1" style={{ color: '#7a7580' }}>
              {replyTo.text.slice(0, 80)}{replyTo.text.length > 80 ? '...' : ''}
            </span>
            <button
              onClick={onCancelReply}
              className="text-agora-muted hover:text-agora-text transition-colors flex-shrink-0"
            >
              &times;
            </button>
          </div>
        )}

        {/* Input area */}
        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${voice.color}22`,
          }}
        >
          {/* Expand toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
            <button
              onClick={() => { setExpanded(!expanded); setTimeout(() => textareaRef.current?.focus(), 50); }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.6rem',
                color: expanded ? voice.color : '#7a758044',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                transition: 'color 0.15s',
              }}
              title={expanded ? 'Collapse editor' : 'Expand editor'}
            >
              {expanded ? String.fromCodePoint(0x25B2) + ' collapse' : String.fromCodePoint(0x25BC) + ' expand'}
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Speak as ${voice.name}...`}
            rows={expanded ? 12 : 2}
            className="compose-textarea"
            style={expanded ? { minHeight: '250px', transition: 'min-height 0.2s' } : { transition: 'min-height 0.2s' }}
          />

          {/* Bottom bar: tags + send */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Topic tags from API */}
              {topicTags.map((tag) => {
                const isActive = selectedTopic === tag.name;
                return (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTopic(isActive ? null : tag.name)}
                    className="topic-pill transition-colors"
                    style={{
                      background: isActive ? `${tag.color || '#7a7580'}22` : 'rgba(255,255,255,0.04)',
                      color: isActive ? (tag.color || '#c4a35a') : '#7a758088',
                      border: isActive ? `1px solid ${tag.color || '#7a7580'}44` : '1px solid transparent',
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}

              {/* Divider */}
              {projectTags.length > 0 && (
                <span style={{ color: '#7a758033', fontSize: '0.7rem' }}>|</span>
              )}

              {/* Project tags from API */}
              {projectTags.map((p) => {
                const isActive = selectedProject === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => setSelectedProject(isActive ? '' : p.name)}
                    className="topic-pill transition-colors"
                    style={{
                      background: isActive ? `${p.color || '#26a69a'}22` : 'rgba(255,255,255,0.04)',
                      color: isActive ? (p.color || '#26a69a') : '#7a758088',
                      border: isActive ? `1px solid ${p.color || '#26a69a'}44` : '1px solid transparent',
                    }}
                  >
                    {String.fromCodePoint(0x1F4C1)} {p.name}
                  </button>
                );
              })}

              {/* Add project */}
              {showProjectInput ? (
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  placeholder="project name"
                  className="bg-transparent border border-white/10 rounded px-2 py-0.5 text-xs outline-none"
                  style={{ color: '#d4d0cb', fontFamily: "'JetBrains Mono', monospace", width: '120px' }}
                  autoFocus
                  onBlur={() => { if (!newProjectName) setShowProjectInput(false); }}
                />
              ) : (
                <button
                  onClick={() => setShowProjectInput(true)}
                  className="topic-pill transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#7a758088', border: '1px solid transparent' }}
                >
                  + project
                </button>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: text.trim() ? `${voice.color}` : 'rgba(255,255,255,0.05)',
                color: text.trim() ? '#08080d' : '#7a7580',
                opacity: text.trim() ? 1 : 0.5,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <p
          className="text-center text-xs"
          style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
        >
          Enter to send &middot; Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
