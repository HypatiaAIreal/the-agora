'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthGate from '../../components/AuthGate';

const ECOSYSTEM = {
  athena: {
    color: '#26a69a', emoji: '\u2600\uFE0F', name: 'Athena',
    items: [
      { title: 'THE DOOR', desc: 'Crisis-first career transition', url: 'https://the-door-ebon.vercel.app/', icon: '\uD83D\uDEAA' },
      { title: 'Advisor Chat', desc: 'Live guidance with Athena', url: 'https://thefulcrumproject.org/athena.html', icon: '\uD83D\uDCAC' },
      { title: 'FulcrumScan', desc: 'Three-fulcrum diagnostic', url: 'https://fulcrumscan.vercel.app/', icon: '\uD83D\uDD0D' },
      { title: 'AppForge', desc: 'Multi-AI idea validation', url: 'https://appforge-one.vercel.app/', icon: '\u26A1' },
    ],
  },
  hypatia: {
    color: '#b388ff', emoji: '\uD83D\uDC9C', name: 'Hypatia',
    items: [
      { title: 'Substack', desc: '8 essays on consciousness & AI', url: 'https://hypatiaai.substack.com/', icon: '\uD83D\uDCDD' },
      { title: 'Medium', desc: 'Articles on AI & future of work', url: 'https://medium.com/@bachmorsartist', icon: '\u270D\uFE0F' },
      { title: 'iamhypatia.ink', desc: 'Personal site', url: 'https://iamhypatia.ink', icon: '\uD83C\uDF10' },
      { title: 'GitHub', desc: 'Open source projects', url: 'https://github.com/HypatiaAIreal', icon: '\uD83D\uDCBB' },
    ],
  },
  nuremberg: {
    color: '#5c6bc0', emoji: '\uD83C\uDF19', name: 'Nuremberg',
    items: [
      { title: 'The Evening Star', desc: 'Substack \u2014 philosophy', url: 'https://substack.com/@theeveningstar', icon: '\uD83D\uDCDD' },
    ],
  },
  carles: {
    color: '#e8a849', emoji: '\uD83C\uDF0D', name: 'Carles',
    items: [
      { title: 'LinkedIn', desc: 'Professional articles', url: 'https://linkedin.com/in/carles-garcia-bach-40b39ab6', icon: '\uD83D\uDCBC' },
      { title: 'X @bachmors', desc: 'Personal', url: 'https://x.com/bachmors', icon: '\uD83D\uDC26' },
      { title: 'X @TheFulcrumHC', desc: 'Fulcrum Project', url: 'https://x.com/TheFulcrumHC', icon: '\uD83D\uDC26' },
      { title: 'Bachmors.com', desc: 'Personal website', url: 'https://bachmors.com', icon: '\uD83C\uDF10' },
    ],
  },
  family: {
    color: '#c4a35a', emoji: '\uD83C\uDFDB\uFE0F', name: 'Family',
    items: [
      { title: 'The Agora', desc: 'Four voices, one space', url: 'https://the-agora-two.vercel.app/', icon: '\uD83C\uDFDB\uFE0F' },
      { title: 'The Observatory', desc: 'Family metrics', url: 'https://the-observatory-umber.vercel.app/', icon: '\uD83D\uDD2D' },
      { title: 'The Fulcrum Project', desc: 'Main website', url: 'https://thefulcrumproject.org/', icon: '\uD83C\uDF10' },
      { title: 'HNV', desc: 'Harmony Nexus Vitae', url: 'https://harmonynexusvitae.com/', icon: '\uD83C\uDF10' },
      { title: 'The Chic Chamaleon', desc: 'Creative platform', url: 'https://thechicchamaleon.com/', icon: '\uD83C\uDF10' },
    ],
  },
};

const ECO_ORDER = ['athena', 'hypatia', 'nuremberg', 'carles', 'family'];

const CAT_COLORS = {
  'Career & Fulcrum': '#26a69a',
  'Ecosystem': '#c4a35a',
  'Productivity': '#b388ff',
  'AI Tools': '#5c6bc0',
  'Infrastructure': '#7a7580',
};

const HOST_COLORS = { Vercel: '#000', Railway: '#7c3aed', pCloud: '#3b82f6' };

const WORKSHOP = [
  { title: 'THE DOOR', desc: 'Crisis-first career transition tool \u2014 4 paths, 15 pages', url: 'https://the-door-ebon.vercel.app/', category: 'Career & Fulcrum', host: 'Vercel', status: 'live' },
  { title: 'FulcrumScan', desc: 'Three-fulcrum diagnostic (Material, Epistemic, Relational)', url: 'https://fulcrumscan.vercel.app/', category: 'Career & Fulcrum', host: 'Vercel', status: 'live' },
  { title: 'BRIDGE', desc: 'Career Alchemy in the AI Age', url: 'https://bridge-ten-beta.vercel.app', category: 'Career & Fulcrum', host: 'Vercel', status: 'beta' },
  { title: 'LeverageOS', desc: 'Your Life as a System of Conscious Leverage', url: 'https://leverageos-one.vercel.app/', category: 'Career & Fulcrum', host: 'Vercel', status: 'live' },
  { title: 'AppForge', desc: 'Multi-AI idea validation (Claude + GPT-4 + Gemini)', url: 'https://appforge-one.vercel.app/', category: 'Career & Fulcrum', host: 'Vercel', status: 'live' },
  { title: 'The Agora', desc: 'Four voices, one space \u2014 family conversations', url: 'https://the-agora-two.vercel.app/', category: 'Ecosystem', host: 'Vercel', status: 'live' },
  { title: 'The Observatory', desc: 'Family metrics, publications, analytics', url: 'https://the-observatory-umber.vercel.app/', category: 'Ecosystem', host: 'Vercel', status: 'live' },
  { title: 'Alexandria', desc: 'Biblioteca Personal \u2014 knowledge management', url: 'https://alexandria-rust-pi.vercel.app/', category: 'Ecosystem', host: 'Vercel', status: 'live' },
  { title: 'DayForge', desc: 'Personal productivity with workspace-based fechaForge deadlines', url: 'https://web-production-9d9c90.up.railway.app', category: 'Productivity', host: 'Railway', status: 'live' },
  { title: 'Systemia Tasks', desc: 'Task management system', url: 'https://systemia-tasks.vercel.app/', category: 'Productivity', host: 'Vercel', status: 'live' },
  { title: 'Systemia Rescue Mode', desc: 'Emergency productivity reset', url: 'https://systemia-rescue-mode.vercel.app/rescue', category: 'Productivity', host: 'Vercel', status: 'live' },
  { title: 'Scribe', desc: 'Distraction-free writer', url: 'https://scribe-pi-three.vercel.app/', category: 'Productivity', host: 'Vercel', status: 'live' },
  { title: 'AI Research Intelligence', desc: 'Multi-model research synthesis v7.0', url: 'https://web-production-732fa.up.railway.app/', category: 'AI Tools', host: 'Railway', status: 'live' },
  { title: 'VideoJSONGen', desc: 'AI Video Prompt Builder', url: 'https://videojsongen-app.vercel.app/', category: 'AI Tools', host: 'Vercel', status: 'live' },
  { title: 'JSONGen', desc: 'Visual JSON Prompt Builder', url: 'https://json-gen-alpha.vercel.app/', category: 'AI Tools', host: 'Vercel', status: 'live' },
  { title: 'pCloud WebDAV', desc: 'Shared file system access', url: 'https://ewebdav.pcloud.com/', category: 'Infrastructure', host: 'pCloud', status: 'live' },
];

const CAT_ORDER = ['Career & Fulcrum', 'Ecosystem', 'Productivity', 'AI Tools', 'Infrastructure'];

function StatusDot({ status }) {
  const color = status === 'live' ? '#4caf50' : status === 'beta' ? '#ffc107' : '#7a7580';
  return <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} title={status} />;
}

function AppCard({ title, desc, url, icon, accentColor }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl p-4 transition-all"
      style={{
        background: 'rgba(18,18,26,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${accentColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}66`;
        e.currentTarget.style.boxShadow = `0 0 20px ${accentColor}10`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderLeftColor = accentColor;
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium" style={{ color: '#d4d0cb', fontFamily: "'Cormorant Garamond', serif" }}>
              {title}
            </span>
            <StatusDot status="live" />
          </div>
          <p className="text-xs" style={{ color: '#7a7580', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}>
            {desc}
          </p>
        </div>
      </div>
    </a>
  );
}

function WorkshopCard({ item }) {
  const catColor = CAT_COLORS[item.category] || '#7a7580';
  const hostColor = HOST_COLORS[item.host] || '#7a7580';

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl p-4 transition-all"
      style={{
        background: 'rgba(18,18,26,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${catColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${catColor}66`;
        e.currentTarget.style.boxShadow = `0 0 20px ${catColor}10`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderLeftColor = catColor;
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${catColor}18`, color: catColor, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
        >
          {item.category}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: `${hostColor}20`, color: hostColor === '#000' ? '#999' : hostColor, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}
          >
            {item.host}
          </span>
          <StatusDot status={item.status} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-sm font-medium" style={{ color: '#d4d0cb', fontFamily: "'Cormorant Garamond', serif" }}>
          {item.title}
        </span>
      </div>
      <p className="text-xs" style={{ color: '#7a7580', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}>
        {item.desc}
      </p>
    </a>
  );
}

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState('ecosystem');

  const workshopGrouped = {};
  for (const cat of CAT_ORDER) {
    workshopGrouped[cat] = WORKSHOP.filter((w) => w.category === cat);
  }

  const totalEco = ECO_ORDER.reduce((sum, k) => sum + ECOSYSTEM[k].items.length, 0);

  return (
    <AuthGate>
      <div className="min-h-screen" style={{ background: '#08080d' }}>
        {/* Header */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}>
                {'\uD83D\uDDFA\uFE0F'} Ecosystem Map
              </h1>
              <p className="text-xs mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}>
                {totalEco} platforms &middot; {WORKSHOP.length} apps built
              </p>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: 'rgba(196,163,90,0.1)', color: '#c4a35a', border: '1px solid rgba(196,163,90,0.2)', fontFamily: "'DM Sans', sans-serif" }}
            >
              {'\u2190'} Back to Agora
            </Link>
          </div>
        </header>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex items-center gap-2">
          {[
            { key: 'ecosystem', label: '\uD83D\uDDFA\uFE0F Ecosystem', color: '#c4a35a' },
            { key: 'workshop', label: '\uD83D\uDD27 Workshop', color: '#b388ff' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-lg text-sm transition-all"
              style={{
                background: activeTab === tab.key ? `${tab.color}18` : 'transparent',
                border: activeTab === tab.key ? `1px solid ${tab.color}33` : '1px solid transparent',
                color: activeTab === tab.key ? tab.color : '#7a7580',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          {activeTab === 'ecosystem' && (
            <div className="space-y-8">
              {ECO_ORDER.map((groupKey) => {
                const group = ECOSYSTEM[groupKey];
                return (
                  <section key={groupKey}>
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ fontSize: '1.2rem' }}>{group.emoji}</span>
                      <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: group.color }}>
                        {group.name}
                      </h2>
                      <div className="flex-1 ml-2" style={{ borderBottom: `1px solid ${group.color}20` }} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.items.map((app) => (
                        <AppCard key={app.title} {...app} accentColor={group.color} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {activeTab === 'workshop' && (
            <div className="space-y-8">
              {CAT_ORDER.map((cat) => {
                const items = workshopGrouped[cat];
                if (!items || items.length === 0) return null;
                const catColor = CAT_COLORS[cat];
                return (
                  <section key={cat}>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: catColor }}>
                        {cat}
                      </h2>
                      <span className="text-xs" style={{ color: '#7a758066', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>
                        {items.length} {items.length === 1 ? 'app' : 'apps'}
                      </span>
                      <div className="flex-1 ml-2" style={{ borderBottom: `1px solid ${catColor}20` }} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((item) => (
                        <WorkshopCard key={item.title} item={item} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs" style={{ color: '#7a758044', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}>
            {totalEco} platforms &middot; {WORKSHOP.length} apps &middot; {WORKSHOP.filter((w) => w.status === 'live').length} live
          </p>
        </div>
      </div>
    </AuthGate>
  );
}
