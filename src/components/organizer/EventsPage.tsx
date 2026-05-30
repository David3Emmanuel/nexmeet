'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import { AV, EVENT, SEED } from '@/lib/data';

type Tab = 'all' | 'live' | 'draft' | 'ended';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All Events' },
  { id: 'live', label: 'Live' },
  { id: 'draft', label: 'Drafts' },
  { id: 'ended', label: 'Ended' },
];

const MY_EVENTS = [
  {
    id: 'buildwithai-lagos-26',
    name: EVENT.name + ' ' + EVENT.edition,
    date: EVENT.date,
    status: 'live' as const,
    attendees: SEED.length + 6,
    accent: 'var(--coral)',
    type: 'Hackathon',
  },
  {
    id: 'gdg-devfest-lagos',
    name: 'GDG DevFest Lagos',
    date: 'Nov 16 · 2025',
    status: 'ended' as const,
    attendees: 312,
    accent: 'var(--plum)',
    type: 'Conference',
  },
  {
    id: 'founders-friday-08',
    name: 'Founders Friday #08',
    date: 'Jun 4 · 2026',
    status: 'draft' as const,
    attendees: 0,
    accent: 'var(--forest)',
    type: 'Meetup',
  },
  {
    id: 'ai-summit-abuja',
    name: 'AI Summit Abuja',
    date: 'Jul 19 · 2026',
    status: 'draft' as const,
    attendees: 0,
    accent: 'var(--sky)',
    type: 'Conference',
  },
];

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string; dot: boolean }> = {
    live: { label: 'Live', color: 'var(--forest)', bg: 'color-mix(in srgb, var(--forest) 12%, transparent)', dot: true },
    ended: { label: 'Ended', color: 'var(--ink-3)', bg: 'var(--paper-2)', dot: false },
    draft: { label: 'Draft', color: 'var(--spark)', bg: 'color-mix(in srgb, var(--spark) 15%, transparent)', dot: false },
  };
  const s = cfg[status] || cfg.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 800, letterSpacing: '.04em',
      color: s.color, background: s.bg,
      padding: '4px 10px', borderRadius: 999,
    }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, animation: 'pulse 1.6s infinite' }} />}
      {s.label}
    </span>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');

  const filtered = tab === 'all' ? MY_EVENTS : MY_EVENTS.filter(e => e.status === tab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Page header */}
      <div className="org-header-container-tabbed">
        <h1 className="display" style={{ fontSize: 32 }}>Events</h1>

        {/* Tabs + Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 20px',
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: tab === t.id ? 'var(--accent)' : 'var(--ink-3)',
                  borderBottom: `2.5px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
                  transition: 'all .15s',
                  marginBottom: -1,
                }}
              >
                {t.id === 'all' ? (
                  <>
                    <span className="desktop-only">All Events</span>
                    <span className="mobile-only">All</span>
                  </>
                ) : t.label}
                {t.id !== 'all' && (
                  <span style={{
                    marginLeft: 7, fontSize: 11, fontWeight: 800,
                    background: tab === t.id ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--paper-2)',
                    color: tab === t.id ? 'var(--accent)' : 'var(--ink-3)',
                    padding: '2px 7px', borderRadius: 999,
                  }}>
                    {MY_EVENTS.filter(e => e.status === t.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="org-content-container">
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bolt" size={32} />
            </div>
            <div className="display" style={{ fontSize: 22 }}>No events here yet</div>
            <p className="lead" style={{ fontSize: 14.5, textAlign: 'center', maxWidth: 340 }}>
              {tab === 'all' ? 'Create your first event and share the link with attendees.' : `You have no ${tab} events.`}
            </p>
            {tab === 'all' && (
              <button className="btn btn-primary" style={{ minHeight: 46 }} onClick={() => router.push('/organizer/create')}>
                <Icon name="spark" size={17} /> Create event
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filtered.map((ev, i) => (
              <button
                key={ev.id}
                id={`event-card-${ev.id}`}
                onClick={() => ev.status === 'live' && router.push(`/organizer/dashboard/${ev.id}`)}
                style={{
                  textAlign: 'left',
                  background: 'var(--card)',
                  border: '1px solid var(--card-edge)',
                  borderRadius: 20,
                  padding: 22,
                  boxShadow: 'var(--shadow-sm)',
                  cursor: ev.status === 'live' ? 'pointer' : 'default',
                  opacity: ev.status === 'draft' ? 0.78 : 1,
                  transition: 'box-shadow .18s, transform .14s',
                  animation: `pop .4s var(--pop) ${i * 0.06}s both`,
                }}
                onMouseEnter={e => { if (ev.status === 'live') (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
              >
                {/* Accent bar */}
                <div style={{ height: 4, background: ev.accent, borderRadius: 999, marginBottom: 18, width: 40 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>{ev.type}</div>
                    <div className="display" style={{ fontSize: 18, lineHeight: 1.2 }}>{ev.name}</div>
                  </div>
                  <StatusBadge status={ev.status} />
                </div>

                <div className="lead" style={{ fontSize: 13.5, marginBottom: 16 }}>{ev.date}</div>

                <div style={{ height: 1, background: 'var(--line)', margin: '0 0 14px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Mini avatar stack */}
                    {ev.attendees > 0 && (
                      <div style={{ display: 'flex' }}>
                        {[0, 1, 2].map(j => (
                          <Avatar key={j} name={`A${j}`} color={AV[(i + j) % AV.length]} size={24} style={{ marginLeft: j === 0 ? 0 : -8, border: '2px solid var(--card)' }} />
                        ))}
                      </div>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
                      {ev.attendees > 0 ? `${ev.attendees} attendees` : 'Not published'}
                    </span>
                  </div>
                  {ev.status === 'live' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                      Open <Icon name="arrow" size={14} />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Action Button ── */}
      <button
        id="create-event-fab"
        onClick={() => router.push('/organizer/create')}
        title="Create new event"
        style={{
          position: 'fixed',
          bottom: 32, right: 32,
          width: 58, height: 58,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px color-mix(in srgb, var(--accent) 45%, transparent), 0 2px 8px rgba(0,0,0,0.12)',
          zIndex: 50,
          transition: 'transform .15s ease, box-shadow .2s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px color-mix(in srgb, var(--accent) 55%, transparent)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px color-mix(in srgb, var(--accent) 45%, transparent)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
