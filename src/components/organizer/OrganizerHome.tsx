'use client';

import { useState, useEffect } from "react";
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import { AV } from '@/lib/data';

interface OrganizerHomeProps {
  onCreate: () => void;
  onOpenEvent: (e: { name: string; type: string }) => void;
  onExit: () => void;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { t: string; c: string }> = {
    live: { t: "Live", c: "var(--forest)" },
    ended: { t: "Ended", c: "var(--ink-3)" },
    draft: { t: "Draft", c: "var(--spark)" },
  };
  const s = map[status] || map.draft;
  return (
    <span className="row gap6" style={{ alignItems: "center", fontSize: 12, fontWeight: 700, color: s.c, background: `color-mix(in srgb, ${s.c} 12%, transparent)`, padding: "5px 10px", borderRadius: 999 }}>
      {status === "live" && <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.c, animation: "pulse 1.6s infinite" }} />}
      {s.t}
    </span>
  );
}

export default function OrganizerHome({ onCreate, onOpenEvent, onExit }: OrganizerHomeProps) {
  const [events, setEvents] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          const parsed = data.events.slice(0, 3).map((e: any) => ({
            id: e.slug || e.id,
            name: e.title,
            date: e.match_times && e.match_times[0] ? new Date(e.match_times[0]).toLocaleDateString() : 'No date set',
            status: e.matched ? 'ended' : 'live',
            attendees: 0,
            accent: (e.theme_config && typeof e.theme_config === 'string' ? JSON.parse(e.theme_config).accent : e.theme_config?.accent) || 'var(--coral)',
            type: e.about?.slice(0, 20) || 'Event',
          }));
          setEvents(parsed);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="org screen-enter">
      <div style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 28px" }} className="row between">
          <div className="row gap14" style={{ alignItems: "center" }}>
            <Logo size={20} />
            <span style={{ padding: "5px 11px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--card-edge)", fontSize: 12.5, fontWeight: 700 }}>Organizer</span>
          </div>
          <div className="row gap10" style={{ alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm" onClick={onExit}><Icon name="eye" size={16} /> Attendee view</button>
            <Avatar name="Team Dial" color="var(--ink)" size={36} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 28px 60px" }}>
        <div className="eyebrow">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <h1 className="display" style={{ fontSize: 40, marginTop: 12 }}>Welcome back!</h1>
        <p className="lead" style={{ fontSize: 16, marginTop: 10, maxWidth: 460 }}>Spin up a new event and let the AI handle the form, the theme, and the networking connections.</p>

        <button onClick={onCreate} className="row gap20" style={{ width: "100%", textAlign: "left", marginTop: 26, padding: 26, borderRadius: 24, border: "1.5px solid var(--card-edge)", background: "linear-gradient(120deg, color-mix(in srgb, var(--accent) 10%, var(--card)), var(--card))", alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ width: 60, height: 60, borderRadius: 18, background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", boxShadow: "0 8px 22px color-mix(in srgb, var(--accent) 40%, transparent)" }}>
            <Icon name="spark" size={28} />
          </span>
          <div className="grow">
            <div className="display" style={{ fontSize: 23 }}>Create a new event</div>
            <div className="lead" style={{ fontSize: 14.5, marginTop: 4 }}>Two minutes from idea to a live, shareable sign-up link.</div>
          </div>
          <span style={{ color: "var(--accent)" }}><Icon name="arrow" size={26} /></span>
        </button>

        <div className="row between" style={{ alignItems: "center", margin: "34px 0 14px" }}>
          <h2 className="display" style={{ fontSize: 22 }}>Your events</h2>
          <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{events.length} total</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {events.map((e: any) => {
            const live = e.status === "live";
            return (
              <button key={e.name} onClick={() => live && onOpenEvent(e)} className="panel" style={{ padding: 22, textAlign: "left", cursor: live ? "pointer" : "default", opacity: e.status === "draft" ? .72 : 1 }}>
                <div className="row between" style={{ alignItems: "center", marginBottom: 16 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: e.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bolt" size={20} />
                  </span>
                  <StatusPill status={e.status} />
                </div>
                <div className="display" style={{ fontSize: 18 }}>{e.name}</div>
                <div className="lead" style={{ fontSize: 13.5, marginTop: 4 }}>{e.date}</div>
                <div style={{ height: 1, background: "var(--line)", margin: "16px 0 12px" }} />
                <div className="row between" style={{ alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, color: "var(--ink-2)", fontWeight: 600 }}>{e.attendees > 0 ? e.attendees + " attendees" : "Not published"}</span>
                  {live && <span className="row gap6" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>Open <Icon name="arrow" size={15} /></span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
