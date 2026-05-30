'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import { AV } from '@/lib/data';

type Tab = 'all' | 'live' | 'draft' | 'ended';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All Events' },
  { id: 'live', label: 'Live' },
  { id: 'draft', label: 'Drafts' },
  { id: 'ended', label: 'Ended' },
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
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          const parsed = data.events.map((e: any) => ({
            id: e.slug || e.id,
            name: e.title,
            date: e.match_times && e.match_times[0] ? new Date(e.match_times[0]).toLocaleDateString() : 'No date set',
            status: e.matched ? 'ended' : 'live', // Simplified status for now
            attendees: 0, // Will fetch later
            accent: (e.theme_config && typeof e.theme_config === 'string' ? JSON.parse(e.theme_config).accent : e.theme_config?.accent) || 'var(--coral)',
            type: e.about?.slice(0, 20) || 'Event',
          }));
          setEvents(parsed);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  async function deleteEvent(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Delete failed' }));
        alert(error || 'Delete failed');
      }
    } catch {
      alert('Network error, please try again.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  const filtered = tab === 'all' ? events : events.filter(e => e.status === tab);

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
                    {events.filter(e => e.status === t.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="org-content-container">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--card)', border: '1px solid var(--card-edge)', borderRadius: 20, padding: 22, height: 180,
                animation: `pulse 1.5s infinite ease-in-out ${i * 0.15}s`, opacity: 0.6
              }}>
                <div style={{ width: 40, height: 4, background: 'var(--paper-2)', borderRadius: 999, marginBottom: 22 }} />
                <div style={{ width: '35%', height: 10, background: 'var(--paper-2)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ width: '75%', height: 20, background: 'var(--paper-2)', borderRadius: 6, marginBottom: 22 }} />
                <div style={{ width: '45%', height: 14, background: 'var(--paper-2)', borderRadius: 6, marginBottom: 22 }} />
                <div style={{ height: 1, background: 'var(--line)', margin: '0 0 14px' }} />
                <div style={{ width: 90, height: 20, background: 'var(--paper-2)', borderRadius: 10 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>{ev.type}</div>
                    <div className="display" style={{ fontSize: 18, lineHeight: 1.2 }}>{ev.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <StatusBadge status={ev.status} />
                    {confirmId === ev.id ? (
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                          disabled={deletingId === ev.id}
                          title="Confirm delete"
                          style={{
                            padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: 'var(--red, #e53935)', color: '#fff', cursor: 'pointer',
                            opacity: deletingId === ev.id ? 0.6 : 1,
                          }}
                        >
                          {deletingId === ev.id ? '…' : 'Delete'}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmId(null); }}
                          title="Cancel"
                          style={{
                            padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: 'var(--paper-2)', color: 'var(--ink-2)', cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmId(ev.id); }}
                        title="Delete event"
                        style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: 'transparent', color: 'var(--ink-3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'background .15s, color .15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--red, #e53935) 12%, transparent)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--red, #e53935)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'var(--ink-3)';
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    )}
                  </div>
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
