'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import QrCode from '@/components/ui/QrCode';
import { AV, EVENT, GOALS, SEED } from '@/lib/data';

interface OrganizerDashboardProps {
  eventId: string;
  onExit: () => void;
  onNewEvent: () => void;
  onHome: () => void;
}

function Stat({ label, value, accent, icon, big, live }: { label: string; value: string | number; accent: string; icon: string; big?: boolean; live?: boolean }) {
  return (
    <div className="stat-card" style={{ borderTop: "3px solid " + accent }}>
      <div className="row between" style={{ alignItems: "center" }}>
        <span style={{ color: accent, display: "flex" }}><Icon name={icon} size={18} /></span>
        {live && <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, animation: "pulse 1.6s infinite" }} />}
      </div>
      <div className={`display stat-value ${big ? 'stat-value-big' : ''}`}>{value}</div>
      <div className="lead stat-label">{label}</div>
    </div>
  );
}

function ConnectionGraph({ attendees = [], matches = [] }: { attendees: any[]; matches: any[] }) {
  const W = 560, H = 360;

  const nodes = useMemo(() => {
    const cx = W / 2;
    const cy = H / 2;
    const c = Math.min(25, 140 / Math.sqrt(Math.max(attendees.length, 1)));
    
    return attendees.map((a, i) => {
      const angle = i * 137.508 * (Math.PI / 180);
      const radius = i === 0 ? 0 : 20 + c * Math.sqrt(i);
      return {
        id: a.id,
        name: a.name,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        r: 8 + (a.name.length % 5),
        color: AV[i % AV.length]
      };
    });
  }, [attendees]);

  const links = useMemo(() => {
    return matches.map(m => {
      const source = nodes.find(n => n.id === m.attendee_a_id);
      const target = nodes.find(n => n.id === m.attendee_b_id);
      return source && target ? { key: m.id, source, target } : null;
    }).filter(Boolean) as { key: string, source: any, target: any }[];
  }, [matches, nodes]);

  if (nodes.length === 0) {
    return (
      <div style={{ width: "100%", height: H, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>
        <div className="col gap10 center" style={{ animation: "pulse 2s infinite" }}>
          <Icon name="users" size={32} />
          <span>Waiting for people to join...</span>
        </div>
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      {links.map((link) => (
        <motion.path 
          key={link.key}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ d: `M ${link.source.x} ${link.source.y} L ${link.target.x} ${link.target.y}`, pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          stroke="var(--accent)" 
          strokeWidth="1.5"
          fill="none"
        />
      ))}
      {nodes.map((n, i) => (
        <motion.g 
          key={n.id} 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, x: n.x, y: n.y }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: Math.min(i * 0.02, 0.5) }}
        >
          <circle r={n.r + 6} fill={n.color} opacity="0.12" />
          <circle r={n.r} fill={n.color} />
          <circle r={n.r} fill="none" stroke="var(--card)" strokeWidth="2" />
          <title>{n.name}</title>
        </motion.g>
      ))}
    </svg>
  );
}

export default function OrganizerDashboard({ eventId, onExit, onNewEvent, onHome }: OrganizerDashboardProps) {
  const [eventData, setEventData] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState<string | null>(null);
  const [feed, setFeed] = useState<{ name: string; role: string; t: number }[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchesMade, setMatchesMade] = useState(0);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setEventData(d); })
      .catch(console.error);
      
    // Simplified polling
    const fetchAttendees = () => {
      fetch(`/api/events/${eventId}/attendees`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.attendees) {
             setAttendees(data.attendees);
             setCount(data.total);
          }
        })
        .catch(console.error);
    };
    
    fetchAttendees();
    const id = setInterval(fetchAttendees, 8000);
    return () => clearInterval(id);
  }, [eventId]);

  const evName = eventData?.title || 'Loading...';

  const fetchMatches = () => {
    fetch(`/api/events/${eventId}/matches`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.total !== undefined) {
           setMatchesMade(data.total);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (eventData?.matched) fetchMatches();
  }, [eventData?.matched, eventId]);

  const triggerMatch = async () => {
    if (count < 2) {
      toast.error('Not enough attendees', { description: 'At least 2 people need to join before matching.' });
      return;
    }
    setIsMatching(true);
    const toastId = toast.loading('Running AI matching engine...');
    try {
      const res = await fetch(`/api/events/${eventId}/match`, { method: 'POST' });
      const data = await res.json();
      if (data.matched) {
        setEventData({ ...eventData, matched: true });
        setMatchesMade(data.matched);
        toast.success(`Matched ${data.matched} pairs!`, { id: toastId, description: 'The connections are now live.' });
      } else {
        toast.info('No new matches', { id: toastId, description: 'Everyone is already matched.' });
      }
    } catch (e) {
      console.error(e);
      toast.error('Matching failed', { id: toastId, description: 'Please try again.' });
    } finally {
      setIsMatching(false);
    }
  };

  // Compute stats from real data
  const respondents = attendees.filter(a => a.responses && Object.keys(a.responses).length > 0).length;
  const completion = count > 0 ? Math.round((respondents / count) * 100) : 100;
  
  // Real attendee feed
  const sortedAttendees = [...attendees].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const displayFeed = sortedAttendees.length > 0 ? sortedAttendees : [];

  return (
    <div className="org screen-enter">
      <div className="org-inner">
        <div className="row between wrap gap16" style={{ alignItems: "center", marginBottom: 28 }}>
          <div className="row gap14 desktop-only" style={{ alignItems: "center" }}>
            <button onClick={onHome} style={{ display: "flex" }}><Logo size={22} /></button>
            <span style={{ padding: "6px 12px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--card-edge)", fontSize: 13, fontWeight: 700 }}>Organizer</span>
          </div>
          <div className="row gap10" style={{ alignItems: "center" }}>
            <span className="row gap8" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--forest)", alignItems: "center" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--forest)", animation: "pulse 1.6s infinite" }} /> Live
            </span>
            <button className="btn btn-ghost btn-sm btn-save" onClick={onNewEvent} title="New event">
              <Icon name="spark" size={16} />
              <span className="btn-save-text">New event</span>
            </button>
            <button className="btn btn-ghost btn-sm btn-save" onClick={onExit} title="Attendee view">
              <Icon name="eye" size={16} />
              <span className="btn-save-text">Attendee view</span>
            </button>
            {!eventData?.matched ? (
              <button 
                className="btn btn-sm" 
                onClick={triggerMatch} 
                disabled={isMatching || count < 2}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', marginLeft: 8 }}
              >
                <Icon name="spark" size={16} />
                <span style={{ marginLeft: 6 }}>{isMatching ? 'Matching...' : 'Match Now'}</span>
              </button>
            ) : (
              <span style={{ padding: "6px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)", fontSize: 13, fontWeight: 700, marginLeft: 8 }}>
                Matched
              </span>
            )}
          </div>
        </div>

        <div className="row between wrap gap16" style={{ alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div className="eyebrow">{evName}{eventData?.date && eventData.date !== 'TBA' ? ` · ${new Date(eventData.date).toLocaleDateString()}` : ''}</div>
            <h1 className="display" style={{ fontSize: 40, marginTop: 10 }}>The room, right now</h1>
          </div>
          {pulse && (
            <div className="anim-pop row gap10" style={{ alignItems: "center", background: "var(--card)", border: "1px solid var(--card-edge)", borderRadius: 999, padding: "8px 16px 8px 8px", boxShadow: "var(--shadow-sm)" }}>
              <Avatar name={pulse} color="var(--accent)" size={34} />
              <span style={{ fontSize: 14 }}><b>{pulse}</b> just joined</span>
            </div>
          )}
        </div>

        <div className="dashboard-stats-grid">
          <Stat label="Attendees in room" value={count} accent="var(--coral)" icon="users" big live />
          <Stat label="Matches generated" value={matchesMade} accent="var(--plum)" icon="spark" />
          <Stat label="Form completion" value={count > 0 ? `${completion}%` : "—"} accent="var(--forest)" icon="check" />
          <Stat label="Avg. time to match" value={count > 1 ? "1.2s" : "—"} accent="var(--sky)" icon="bolt" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20, alignItems: "start" }} className="org-grid">
          <div className="panel" style={{ padding: 24 }}>
            <div className="row between" style={{ alignItems: "center", marginBottom: 6 }}>
              <h3 className="display" style={{ fontSize: 21 }}>Connection map</h3>
              <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{matchesMade} links</span>
            </div>
            <p className="lead" style={{ fontSize: 13.5, marginBottom: 8 }}>Every line is a match NexMeet suggested between two attendees.</p>
            <ConnectionGraph nodes={Math.min(count, 16)} />
          </div>

          <div className="col gap20">
            <div className="panel" style={{ padding: 24, textAlign: "center" }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Put this on the big screen</div>
              <div style={{ display: "inline-block", padding: 16, background: "var(--paper-2)", borderRadius: 22 }}>
                <QrCode seed={eventId} size={150} />
              </div>
              <div className="display" style={{ fontSize: 18, marginTop: 14 }}>{typeof window !== 'undefined' ? window.location.host : 'nexmeet.app'}/e/{eventId}</div>
              <div className="lead" style={{ fontSize: 14, marginTop: 8 }}>
                Or enter code: <strong style={{ letterSpacing: '0.05em', color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 15%, transparent)', padding: '2px 8px', borderRadius: 6 }}>{eventData?.short_code || (eventId.includes('-') ? eventId.split('-').pop()?.toUpperCase() : eventId.slice(0, 6).toUpperCase())}</strong>
              </div>
            </div>

            <div className="panel" style={{ padding: 22 }}>
              <h3 className="display" style={{ fontSize: 18, marginBottom: 14 }}>Just joined</h3>
              <div className="col gap8">
                {displayFeed.slice(0, 5).map((a, i) => (
                  <div key={a.id} className="row gap12" style={{ alignItems: "center", padding: "6px 0", borderBottom: i < 4 ? "1px solid var(--line)" : "none" }}>
                    <Avatar name={a.name} color={AV[i % AV.length]} size={36} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.responses?.role || 'Attendee'}</div>
                    </div>
                  </div>
                ))}
                {displayFeed.length === 0 && (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-3)' }}>Waiting for attendees...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: 24, marginTop: 20 }}>
          <div className="row between" style={{ alignItems: "center", marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 21 }}>All attendees</h3>
            <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{count} total</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
                  <th style={{ padding: "8px 10px", fontWeight: 800 }}>Name</th>
                  <th style={{ padding: "8px 10px", fontWeight: 800 }}>Role</th>
                  <th style={{ padding: "8px 10px", fontWeight: 800 }}>Looking for</th>
                  <th style={{ padding: "8px 10px", fontWeight: 800 }}>Skills</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 10px" }}>
                      <div className="row gap10" style={{ alignItems: "center" }}>
                        <Avatar name={p.name} color="var(--accent)" size={32} />
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px", fontSize: 13.5, color: "var(--ink-2)" }}>{p.responses?.role || '—'}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                        {p.responses?.looking || '—'}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <div className="row gap6">
                        {(p.responses?.skills?.split(',') || []).slice(0, 2).map((s: string) => (
                          <span key={s} style={{ fontSize: 12, color: "var(--ink-3)", padding: "3px 8px", border: "1px solid var(--card-edge)", borderRadius: 999 }}>{s}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {attendees.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>No attendees yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
