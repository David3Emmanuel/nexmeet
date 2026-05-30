'use client';

import { useRef } from 'react';
import { AV, SEED } from '@/lib/data';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';

const STATS = [
  { label: 'Total attendees', value: '330', delta: '+18 this month', accent: 'var(--coral)', icon: 'users' },
  { label: 'Matches generated', value: '792', delta: '+43 this week', accent: 'var(--plum)', icon: 'spark' },
  { label: 'Avg. match time', value: '38s', delta: '−4s vs last event', accent: 'var(--forest)', icon: 'bolt' },
  { label: 'Events hosted', value: '4', delta: '1 live now', accent: 'var(--sky)', icon: 'grid' },
];

// Mini bar chart data (last 6 events)
const CHART_BARS = [
  { label: 'Jan', attendees: 42, matches: 98 },
  { label: 'Feb', attendees: 58, matches: 134 },
  { label: 'Mar', attendees: 36, matches: 80 },
  { label: 'Apr', attendees: 80, matches: 190 },
  { label: 'May', attendees: 114, matches: 270 },
  { label: 'Jun', attendees: 0, matches: 0, upcoming: true },
];
const MAX_ATTENDEES = Math.max(...CHART_BARS.map(b => b.attendees));

const TOP_EVENTS = [
  { name: 'BuildWithAI Lagos 2026', attendees: 18, matches: 43, rate: '94%', accent: 'var(--coral)' },
  { name: 'GDG DevFest Lagos', attendees: 312, matches: 749, rate: '91%', accent: 'var(--plum)' },
  { name: 'Founders Friday #08', attendees: 0, matches: 0, rate: '—', accent: 'var(--forest)' },
];

const GOALS_DIST = [
  { label: 'Co-founder', pct: 28, color: 'var(--coral)' },
  { label: 'Mentor', pct: 20, color: 'var(--plum)' },
  { label: 'Clients', pct: 17, color: 'var(--forest)' },
  { label: 'Collab', pct: 15, color: 'var(--sky)' },
  { label: 'Funding', pct: 12, color: 'var(--spark)' },
  { label: 'Other', pct: 8, color: 'var(--ink-3)' },
];

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="org-header-container">
        <div className="eyebrow" style={{ marginBottom: 8 }}>Overview · All time</div>
        <h1 className="display" style={{ fontSize: 32 }}>Analytics</h1>
      </div>

      {/* Scrollable content */}
      <div className="org-content-container">

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 28 }}>
          {STATS.map((s, i) => (
            <div key={i} className="panel" style={{ padding: 22, borderTop: `3px solid ${s.accent}`, animation: `pop .4s var(--pop) ${i * 0.07}s both` }}>
              <div style={{ color: s.accent, marginBottom: 14 }}><Icon name={s.icon} size={20} /></div>
              <div className="display" style={{ fontSize: 38 }}>{s.value}</div>
              <div className="lead" style={{ fontSize: 13, marginTop: 4 }}>{s.label}</div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Chart + Goal distribution */}
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Bar chart */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 className="display" style={{ fontSize: 20 }}>Attendees over time</h3>
                <p className="lead" style={{ fontSize: 13, marginTop: 2 }}>Per event, last 6 months</p>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)' }} /> Attendees
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--plum)', opacity: 0.5 }} /> Matches
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
              {CHART_BARS.map((b, i) => {
                const h = MAX_ATTENDEES > 0 ? (b.attendees / MAX_ATTENDEES) * 120 : 0;
                const mh = MAX_ATTENDEES > 0 ? ((b.matches / (MAX_ATTENDEES * 2.4)) * 120) : 0;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 120 }}>
                      <div style={{
                        width: 16, height: Math.max(h, b.upcoming ? 6 : 0),
                        background: b.upcoming ? 'var(--card-edge)' : 'var(--accent)',
                        borderRadius: '4px 4px 0 0',
                        opacity: b.upcoming ? 0.5 : 1,
                        transition: 'height 0.6s ease',
                        animation: b.upcoming ? 'none' : `pop 0.5s var(--pop) ${i * 0.08}s both`,
                      }} />
                      <div style={{
                        width: 16, height: Math.max(mh, b.upcoming ? 6 : 0),
                        background: 'var(--plum)',
                        borderRadius: '4px 4px 0 0',
                        opacity: b.upcoming ? 0.2 : 0.5,
                        animation: b.upcoming ? 'none' : `pop 0.5s var(--pop) ${i * 0.08 + 0.04}s both`,
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' }}>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal distribution */}
          <div className="panel" style={{ padding: 24 }}>
            <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>What attendees want</h3>
            <p className="lead" style={{ fontSize: 13, marginBottom: 20 }}>Goals across all events</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS_DIST.map((g, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{g.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: g.color }}>{g.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      background: g.color,
                      width: `${g.pct}%`,
                      animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top events table */}
        <div className="panel" style={{ padding: 24 }}>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 20 }}>Event breakdown</h3>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ color: 'var(--ink-3)', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 800 }}>Event</th>
                <th style={{ padding: '8px 12px', fontWeight: 800 }}>Attendees</th>
                <th style={{ padding: '8px 12px', fontWeight: 800 }}>Matches</th>
                <th style={{ padding: '8px 12px', fontWeight: 800 }}>Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {TOP_EVENTS.map((ev, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 28, borderRadius: 999, background: ev.accent, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{ev.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 700 }}>{ev.attendees || '—'}</td>
                  <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 700 }}>{ev.matches || '—'}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      fontSize: 12.5, fontWeight: 800,
                      color: ev.rate !== '—' ? 'var(--forest)' : 'var(--ink-3)',
                      background: ev.rate !== '—' ? 'color-mix(in srgb, var(--forest) 10%, transparent)' : 'var(--paper-2)',
                      padding: '4px 10px', borderRadius: 999,
                    }}>{ev.rate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
