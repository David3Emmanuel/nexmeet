'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { AV } from '@/lib/data';

const ZONES = [
  { label: "Main Stage", x: 8, y: 6, w: 84, h: 15 },
  { label: "Workshops", x: 8, y: 29, w: 32, h: 22 },
  { label: "Coffee Bar", x: 60, y: 28, w: 32, h: 20 },
  { label: "Demo Zone", x: 58, y: 57, w: 34, h: 19 },
  { label: "Lounge", x: 8, y: 59, w: 34, h: 21 },
  { label: "Entrance", x: 38, y: 86, w: 24, h: 10 },
];
const YOU_POS = { x: 50, y: 70 };
const MATCH_POS = [
  { x: 66, y: 36, near: "Coffee Bar" },
  { x: 26, y: 42, near: "Workshops" },
  { x: 68, y: 66, near: "Demo Zone" },
];

const crowd = (() => {
  let h = 7;
  const r = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  return Array.from({ length: 26 }, () => ({ x: 8 + r() * 84, y: 6 + r() * 88 }));
})();

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 0.62);
}

interface LocationGateProps {
  onGrant: () => void;
  onSkip: () => void;
}

function LocationGate({ onGrant, onSkip }: LocationGateProps) {
  return (
    <div className="scroll screen-enter" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "30px 32px 50px" }}>
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 30 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "color-mix(in srgb, var(--accent) 14%, transparent)", animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 24, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px color-mix(in srgb, var(--accent) 40%, transparent)" }}>
          <Icon name="location" size={40} />
        </div>
      </div>
      <h2 className="display" style={{ fontSize: 28 }}>Find them in the room</h2>
      <p className="lead" style={{ fontSize: 15.5, marginTop: 12, maxWidth: 300 }}>Share your location and NexMeet shows you and your matches on a live map of the venue — so you can actually walk up and say hi.</p>
      <div className="col gap10" style={{ width: "100%", marginTop: 28 }}>
        <button className="btn btn-primary btn-full" onClick={onGrant}><Icon name="location" size={18} /> Enable location</button>
        <button className="btn btn-ghost btn-full" onClick={onSkip}>Not now</button>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 16, maxWidth: 280 }}>Only shared with people you&apos;ve matched with, only during the event.</p>
    </div>
  );
}

interface MatchItem {
  id: string;
  name: string;
  color?: string;
  reason?: string;
  answers?: Record<string, string>;
}

interface MapScreenProps {
  you: { name: string };
  matches: MatchItem[];
  granted: boolean;
  onGrant: () => void;
  onSkip: () => void;
  onOpenMatch: (m: MatchItem) => void;
}

export default function MapScreen({ you, matches, granted, onGrant, onSkip, onOpenMatch }: MapScreenProps) {
  const [sel, setSel] = useState<number | null>(null);
  if (!granted) return <LocationGate onGrant={onGrant} onSkip={onSkip} />;

  const mm = matches.map((m, i) => ({ ...m, pos: MATCH_POS[i % MATCH_POS.length], d: dist(YOU_POS, MATCH_POS[i % MATCH_POS.length]), accent: m.color || AV[i % AV.length] }));
  const selected = sel != null ? mm[sel] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'color-mix(in srgb, var(--paper) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        padding: "16px 24px 12px",
        borderBottom: '1px solid var(--line)',
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div className="eyebrow">Live map · Your matches</div>
        <h1 className="display" style={{ fontSize: 26, marginTop: 8 }}>You &amp; your people</h1>
      </div>

      <div className="grow" style={{ position: "relative", margin: "0 16px", borderRadius: 24, overflow: "hidden", background: "var(--card)", border: "1px solid var(--card-edge)" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {ZONES.map(z => (
            <g key={z.label}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="3" fill="var(--paper-2)" stroke="var(--card-edge)" strokeWidth="0.4" />
              <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 1} fontSize="2.6" fontWeight="700" textAnchor="middle" fill="var(--ink-3)" style={{ fontFamily: "var(--font-body)" }}>{z.label}</text>
            </g>
          ))}
          {crowd.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r="0.8" fill="var(--ink-3)" opacity="0.28" />)}
          {selected && <line x1={YOU_POS.x} y1={YOU_POS.y} x2={selected.pos.x} y2={selected.pos.y} stroke={selected.accent} strokeWidth="0.7" strokeDasharray="2 1.6" opacity="0.9" />}
          <circle cx={YOU_POS.x} cy={YOU_POS.y} r="4.2" fill="var(--accent)" opacity="0.18" style={{ animation: "pulse 2s ease-in-out infinite", transformOrigin: `${YOU_POS.x}px ${YOU_POS.y}px` }} />
          <circle cx={YOU_POS.x} cy={YOU_POS.y} r="2.1" fill="var(--accent)" stroke="#fff" strokeWidth="0.7" />
        </svg>

        {mm.map((m, i) => (
          <button key={m.id} onClick={() => setSel(sel === i ? null : i)} style={{ position: "absolute", left: m.pos.x + "%", top: m.pos.y + "%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, zIndex: sel === i ? 5 : 2 }}>
            <div style={{ position: "relative", padding: 2, borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow-md)", border: "2px solid " + m.accent }}>
              <Avatar name={m.name} color={m.accent} size={sel === i ? 40 : 32} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: m.accent, padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "var(--shadow-sm)" }}>{m.name.split(" ")[0]} · {m.d}m</span>
          </button>
        ))}
        <div style={{ position: "absolute", left: YOU_POS.x + "%", top: YOU_POS.y + "%", transform: "translate(-50%, 14px)", fontSize: 11, fontWeight: 800, color: "var(--accent)", pointerEvents: "none" }}>You</div>
      </div>

      <div style={{ flex: "0 0 auto", padding: "14px 16px 18px" }}>
        {selected ? (
          <div className="screen-enter" style={{ background: selected.accent, borderRadius: 20, padding: 16, color: "#fff", boxShadow: "var(--shadow-md)" }}>
            <div className="row gap12" style={{ alignItems: "center" }}>
              <Avatar name={selected.name} color="rgba(255,255,255,.2)" size={44} />
              <div className="grow">
                <div className="display" style={{ fontSize: 17, color: "#fff" }}>{selected.name}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.85)" }}>{selected.d}m away · near {selected.pos.near}</div>
              </div>
              <button className="icon-btn" onClick={() => setSel(null)} style={{ background: "rgba(255,255,255,.18)", border: "none", color: "#fff" }}><Icon name="close" size={16} /></button>
            </div>
            <button className="btn btn-full" onClick={() => onOpenMatch(selected)} style={{ background: "rgba(255,255,255,.18)", color: "#fff", marginTop: 12, minHeight: 46 }}>
              See why you matched <Icon name="arrow" size={17} />
            </button>
          </div>
        ) : (
          <div className="row gap8" style={{ overflowX: "auto", paddingBottom: 2 }}>
            {mm.map((m, i) => (
              <button key={m.id} onClick={() => setSel(i)} className="row gap8" style={{ alignItems: "center", flex: "0 0 auto", padding: "9px 13px 9px 9px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--card-edge)" }}>
                <Avatar name={m.name} color={m.accent} size={30} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>{m.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{m.d}m · {m.pos.near}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
