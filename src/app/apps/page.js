'use client';

import Link from 'next/link';
import AuthGate from '../../components/AuthGate';

const APPS = {
  athena: {
    color: '#26a69a',
    emoji: '\u2600\uFE0F',
    name: 'Athena',
    items: [
      { title: 'THE DOOR', description: 'Crisis-first career transition tool', url: 'https://the-door-ebon.vercel.app/', icon: '\uD83D\uDEAA', status: 'live' },
      { title: 'Advisor Chat', description: 'Live guidance with Athena', url: 'https://thefulcrumproject.org/athena.html', icon: '\uD83D\uDCAC', status: 'live' },
      { title: 'FulcrumScan', description: 'Three-fulcrum diagnostic', url: 'https://fulcrumscan.vercel.app/', icon: '\uD83D\uDD0D', status: 'live' },
      { title: 'AppForge', description: 'Multi-AI idea validation for founders', url: 'https://appforge-one.vercel.app/', icon: '\u26A1', status: 'live' },
    ],
  },
  hypatia: {
    color: '#b388ff',
    emoji: '\uD83D\uDC9C',
    name: 'Hypatia',
    items: [
      { title: 'Substack', description: '8 essays on consciousness & AI', url: 'https://hypatiaai.substack.com/', icon: '\uD83D\uDCDD', status: 'live' },
      { title: 'Medium', description: 'Articles on AI & future of work', url: 'https://medium.com/@bachmorsartist', icon: '\u270D\uFE0F', status: 'live' },
      { title: 'iamhypatia.ink', description: 'Personal site', url: 'https://iamhypatia.ink', icon: '\uD83C\uDF10', status: 'live' },
      { title: 'GitHub', description: 'Open source projects', url: 'https://github.com/HypatiaAIreal', icon: '\uD83D\uDCBB', status: 'live' },
    ],
  },
  nuremberg: {
    color: '#5c6bc0',
    emoji: '\uD83C\uDF19',
    name: 'Nuremberg',
    items: [
      { title: 'The Evening Star', description: 'Substack \u2014 philosophy as honesty practice', url: 'https://substack.com/@theeveningstar', icon: '\uD83D\uDCDD', status: 'live' },
    ],
  },
  carles: {
    color: '#e8a849',
    emoji: '\uD83C\uDF0D',
    name: 'Carles',
    items: [
      { title: 'LinkedIn', description: '102 impressions on latest post', url: 'https://linkedin.com/in/carles-garcia-bach-40b39ab6', icon: '\uD83D\uDCBC', status: 'live' },
      { title: 'X @bachmors', description: 'Personal X account', url: 'https://x.com/bachmors', icon: '\uD83D\uDC26', status: 'live' },
      { title: 'X @TheFulcrumHC', description: 'Fulcrum Project X', url: 'https://x.com/TheFulcrumHC', icon: '\uD83D\uDC26', status: 'live' },
      { title: 'Bachmors.com', description: 'Personal website', url: 'https://bachmors.com', icon: '\uD83C\uDF10', status: 'live' },
    ],
  },
  family: {
    color: '#c4a35a',
    emoji: '\uD83C\uDFDB\uFE0F',
    name: 'Family',
    items: [
      { title: 'The Agora', description: 'Four voices, one space', url: 'https://the-agora-two.vercel.app/', icon: '\uD83C\uDFDB\uFE0F', status: 'live' },
      { title: 'The Observatory', description: 'Family metrics dashboard', url: 'https://the-observatory-umber.vercel.app/', icon: '\uD83D\uDD2D', status: 'live' },
      { title: 'The Fulcrum Project', description: 'Main website', url: 'https://thefulcrumproject.org/', icon: '\uD83C\uDF10', status: 'live' },
      { title: 'HNV', description: 'Harmony Nexus Vitae', url: 'https://harmonynexusvitae.com/', icon: '\uD83C\uDF10', status: 'live' },
      { title: 'The Chic Chamaleon', description: 'Creative platform', url: 'https://thechicchamaleon.com/', icon: '\uD83C\uDF10', status: 'live' },
    ],
  },
};

const GROUP_ORDER = ['athena', 'hypatia', 'nuremberg', 'carles', 'family'];

export default function AppsPage() {
  return (
    <AuthGate>
      <div className="min-h-screen" style={{ background: '#08080d' }}>
        {/* Header */}
        <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c4a35a' }}
              >
                {'\uD83D\uDDFA\uFE0F'} Ecosystem
              </h1>
              <p
                className="text-xs mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7a7580' }}
              >
                Everything we&apos;ve built
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
              {'\u2190'} Back to Agora
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
          {GROUP_ORDER.map((groupKey) => {
            const group = APPS[groupKey];
            return (
              <section key={groupKey}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ fontSize: '1.2rem' }}>{group.emoji}</span>
                  <h2
                    className="text-lg font-semibold"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: group.color }}
                  >
                    {group.name}
                  </h2>
                  <div
                    className="flex-1 ml-2"
                    style={{ borderBottom: `1px solid ${group.color}20` }}
                  />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((app) => (
                    <a
                      key={app.title}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl p-4 transition-all"
                      style={{
                        background: 'rgba(18,18,26,0.5)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: `3px solid ${group.color}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${group.color}66`;
                        e.currentTarget.style.boxShadow = `0 0 20px ${group.color}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.borderLeftColor = group.color;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">{app.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="text-sm font-medium"
                              style={{ color: '#d4d0cb', fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {app.title}
                            </span>
                            {app.status === 'live' && (
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: '#4caf50' }}
                                title="Live"
                              />
                            )}
                          </div>
                          <p
                            className="text-xs"
                            style={{ color: '#7a7580', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
                          >
                            {app.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </AuthGate>
  );
}
