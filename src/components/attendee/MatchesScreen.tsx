'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import { AV } from '@/lib/data';

interface MatchItem {
  id: string;
  name: string;
  color?: string;
  reason?: string;
  score?: number;
  answers?: Record<string, string>;
}

interface MatchesScreenProps {
  you: { name: string };
  matches: MatchItem[];
  count: number;
  onOpen: (m: MatchItem) => void;
  onMap: () => void;
  onRefresh: () => void;
  onRestart: () => void;
}

const ACCENT_POOL = ['var(--coral)', 'var(--plum)', 'var(--forest)', 'var(--sky)'];

export default function MatchesScreen({ you, matches, count, onOpen, onMap, onRefresh, onRestart }: MatchesScreenProps) {
  const [refreshing, setRefreshing] = useState(false);

  const doRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { onRefresh(); setRefreshing(false); }, 900);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0,
        background: 'color-mix(in srgb, var(--paper) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        padding: "16px 24px",
        borderBottom: '1px solid var(--line)',
        zIndex: 100, flexShrink: 0,
      }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <Logo size={19} />
          <button className="chip" onClick={onRestart} style={{ padding: "8px 12px", fontSize: 12.5 }}>
            <Icon name="user" size={15} /> {you.name.split(" ")[0]}
          </button>
        </div>
      </div>

      <div className="scroll" style={{ padding: "0 24px 24px" }}>
        <div className="screen-enter">
          <div className="eyebrow">Your matches</div>
          <h1 className="display" style={{ fontSize: 36, marginTop: 12 }}>
            {matches.length === 1 ? '1 person you' : `${matches.length} people you`}<br />should meet today
          </h1>
          <p className="lead" style={{ fontSize: 15, marginTop: 18 }}>
            Picked from <b style={{ color: "var(--ink)" }}>{count} {count === 1 ? 'attendee' : 'attendees'}</b> in the room. Tap a card for the full story and a conversation starter.
          </p>
        </div>

        {matches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>
            <Icon name="spark" size={36} />
            <p style={{ marginTop: 16, fontSize: 15 }}>Matches are being generated — check back in a moment.</p>
            <button className="btn btn-ghost" onClick={doRefresh} style={{ marginTop: 16 }}>
              <Icon name="refresh" size={18} /> Refresh
            </button>
          </div>
        )}

        <div className="col gap16" style={{ marginTop: 22 }}>
          {matches.map((m, i) => {
            const accent = m.color || ACCENT_POOL[i % ACCENT_POOL.length];
            return (
              <button
                key={m.id}
                className={`mcard anim-pop d${i + 1}`}
                onClick={() => onOpen(m)}
                style={{ background: accent, textAlign: "left", border: "none" }}
              >
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <div className="row gap12" style={{ alignItems: "center" }}>
                    <div style={{ borderRadius: "50%", padding: 2, background: "rgba(255,255,255,.25)" }}>
                      <Avatar name={m.name} color="rgba(255,255,255,.18)" size={48} />
                    </div>
                    <div>
                      <div className="display" style={{ fontSize: 19, color: "#fff" }}>{m.name}</div>
                      {m.answers?.role && (
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.82)", marginTop: 2 }}>{m.answers.role}</div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.14)", padding: "5px 9px", borderRadius: 999 }}>
                    #{i + 1}
                  </span>
                </div>
                {m.reason && (
                  <div className="quote">&ldquo;{m.reason}&rdquo;</div>
                )}
                <div className="row between" style={{ alignItems: "center", marginTop: 2 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                    {m.score ? `${m.score}% match` : 'Great match'}
                  </span>
                  <span className="row gap6" style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
                    See why <Icon name="arrow" size={16} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button className="btn btn-ink btn-full" onClick={onMap} style={{ marginTop: 20 }}>
          <Icon name="location" size={18} /> See them on the live map
        </button>
        <button className="btn btn-ghost btn-full" onClick={doRefresh} style={{ marginTop: 10 }}>
          <span style={{ display: "inline-flex", animation: refreshing ? "spin .9s linear infinite" : "none" }}>
            <Icon name="refresh" size={18} />
          </span>
          {refreshing ? "Re-reading the room…" : "Refresh as more people join"}
        </button>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 12.5, color: "var(--ink-3)" }}>
          <Icon name="chat" size={13} /> We&apos;ve emailed these to you too — they unlock at match time.
        </p>

        {onRestart && (
          <div style={{ textAlign: "center", marginTop: 24, marginBottom: 12 }}>
            <button onClick={onRestart} style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Register another person
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
