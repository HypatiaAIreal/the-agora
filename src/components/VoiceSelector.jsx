'use client';

import { VOICES, VOICE_KEYS } from '../lib/constants';

export default function VoiceSelector({ activeFilter, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className="voice-btn"
        style={{
          '--voice-color': '#c4a35a',
          borderColor: activeFilter === null ? '#c4a35a' : 'rgba(255,255,255,0.06)',
          background: activeFilter === null ? 'rgba(196, 163, 90, 0.1)' : 'rgba(255, 255, 255, 0.03)',
          boxShadow: activeFilter === null ? '0 0 20px rgba(196, 163, 90, 0.15)' : 'none',
        }}
      >
        <span className="text-base">All</span>
      </button>
      {VOICE_KEYS.map((key) => {
        const voice = VOICES[key];
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(isActive ? null : key)}
            className="voice-btn"
            style={{
              '--voice-color': voice.color,
              borderColor: isActive ? voice.color : 'rgba(255,255,255,0.06)',
              background: isActive ? `color-mix(in srgb, ${voice.color} 10%, transparent)` : 'rgba(255, 255, 255, 0.03)',
              boxShadow: isActive ? `0 0 20px color-mix(in srgb, ${voice.color} 15%, transparent)` : 'none',
            }}
          >
            <span className="text-base">{voice.emoji}</span>
            <span className="text-xs font-medium hidden sm:inline" style={{ color: isActive ? voice.color : '#7a7580' }}>
              {voice.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
