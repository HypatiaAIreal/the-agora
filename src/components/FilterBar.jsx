'use client';

import { TOPICS, TOPIC_KEYS } from '../lib/constants';
import { useState } from 'react';

export default function FilterBar({ activeTopic, onTopicChange, searchQuery, onSearchChange }) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleSearchClear = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="border-b border-white/5 px-4 sm:px-6 py-3" style={{ background: 'rgba(13, 13, 20, 0.8)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#7a7580" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition-colors focus:border-agora-gold/30"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#d4d0cb' }}
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-agora-muted hover:text-agora-text"
              >
                &times;
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
            style={{
              background: 'rgba(196, 163, 90, 0.1)',
              border: '1px solid rgba(196, 163, 90, 0.2)',
              color: '#c4a35a',
            }}
          >
            Search
          </button>
        </form>

        {/* Topic filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs mr-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}>
            Topics:
          </span>
          <button
            onClick={() => onTopicChange(null)}
            className="topic-pill transition-colors"
            style={{
              background: !activeTopic ? 'rgba(196, 163, 90, 0.15)' : 'rgba(255,255,255,0.05)',
              color: !activeTopic ? '#c4a35a' : '#7a7580',
              border: !activeTopic ? '1px solid rgba(196, 163, 90, 0.3)' : '1px solid transparent',
            }}
          >
            All
          </button>
          {TOPIC_KEYS.map((key) => {
            const topic = TOPICS[key];
            const isActive = activeTopic === key;
            return (
              <button
                key={key}
                onClick={() => onTopicChange(isActive ? null : key)}
                className="topic-pill transition-colors"
                style={{
                  background: isActive ? `${topic.color}22` : 'rgba(255,255,255,0.05)',
                  color: isActive ? topic.color : '#7a7580',
                  border: isActive ? `1px solid ${topic.color}44` : '1px solid transparent',
                }}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
