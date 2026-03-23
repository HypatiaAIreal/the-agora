'use client';

import { useState, useRef, useEffect } from 'react';
import { VOICES, TOPICS, TOPIC_KEYS } from '../lib/constants';
import VoiceSelector from './VoiceSelector';

export default function ComposeBar({ voiceFilter, onVoiceFilterChange, onSend, replyTo, onCancelReply }) {
  const [text, setText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [project, setProject] = useState('');
  const [showProjectInput, setShowProjectInput] = useState(false);
  const textareaRef = useRef(null);
  const senderVoice = VOICES.carles;

  useEffect(() => { textareaRef.current?.focus(); }, [replyTo]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend({
      from: 'carles',
      text: trimmed,
      topic: selectedTopic,
      project: project.trim() || null,
      reply_to: replyTo?.timestamp || null,
    });
    setText('');
    setSelectedTopic(null);
    setProject('');
    setShowProjectInput(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="relative z-10 border-t border-white/5" style={{ background: 'rgba(13, 13, 20, 0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        <VoiceSelector activeFilter={voiceFilter} onSelect={onVoiceFilterChange} />
        {replyTo && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${(VOICES[replyTo.from] || VOICES.carles).color}33` }}>
            <span style={{ color: (VOICES[replyTo.from] || VOICES.carles).color }}>Replying to {(VOICES[replyTo.from] || VOICES.carles).name}:</span>
            <span className="truncate flex-1" style={{ color: '#7a7580' }}>{replyTo.text.slice(0, 80)}{replyTo.text.length > 80 ? '...' : ''}</span>
            <button onClick={onCancelReply} style={{ color: '#7a7580' }}>&times;</button>
          </div>
        )}
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${senderVoice.color}22` }}>
          <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Speak as Carles..." rows={2} className="compose-textarea" />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {TOPIC_KEYS.map((key) => {
                const topic = TOPICS[key];
                const isActive = selectedTopic === key;
                return (
                  <button key={key} onClick={() => setSelectedTopic(isActive ? null : key)} className="topic-pill transition-colors"
                    style={{ background: isActive ? `${topic.color}22` : 'rgba(255,255,255,0.04)', color: isActive ? topic.color : '#7a758088', border: isActive ? `1px solid ${topic.color}44` : '1px solid transparent' }}>
                    {topic.label}
                  </button>
                );
              })}
              {showProjectInput ? (
                <input type="text" value={project} onChange={(e) => setProject(e.target.value)} placeholder="project name"
                  className="bg-transparent border border-white/10 rounded px-2 py-0.5 text-xs outline-none"
                  style={{ color: '#d4d0cb', fontFamily: "'JetBrains Mono', monospace", width: '120px' }}
                  autoFocus onBlur={() => { if (!project) setShowProjectInput(false); }} />
              ) : (
                <button onClick={() => setShowProjectInput(true)} className="topic-pill transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#7a758088', border: '1px solid transparent' }}>+ project</button>
              )}
            </div>
            <button onClick={handleSend} disabled={!text.trim()} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: text.trim() ? senderVoice.color : 'rgba(255,255,255,0.05)', color: text.trim() ? '#08080d' : '#7a7580', opacity: text.trim() ? 1 : 0.5, fontFamily: "'DM Sans', sans-serif" }}>
              Send
            </button>
          </div>
        </div>
        <p className="text-center text-xs" style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>
          Enter to send &middot; Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
