'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';

interface ShareSheetProps {
  match: { name: string; color?: string; reason?: string; answers?: Record<string, string> };
  you: { name: string };
  onClose: () => void;
}

export default function ShareSheet({ match, you, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{ position: "absolute", inset: 0, zIndex: 80, background: "rgba(25,20,15,.4)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", animation: "fadeUp .25s ease" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--paper)", width: "100%", borderRadius: "28px 28px 0 0", padding: "12px 24px 28px", animation: "pop .35s var(--pop)" }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 999, background: "var(--card-edge)", margin: "0 auto 18px" }} />
        <div className="eyebrow">Share this match</div>
        <h3 className="display" style={{ fontSize: 24, marginTop: 8, marginBottom: 16 }}>Screenshot-ready</h3>

        <div className="mcard" style={{ background: match.color || 'var(--accent)', gap: 14 }}>
          <div className="row between" style={{ alignItems: "center" }}>
            <Logo size={16} dark />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>NexMeet</span>
          </div>
          <div className="row gap12" style={{ alignItems: "center" }}>
            <Avatar name={match.name} color="rgba(255,255,255,.18)" size={44} />
            <div>
              <div className="display" style={{ fontSize: 18, color: "#fff" }}>{you.name.split(" ")[0]} × {match.name.split(" ")[0]}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)" }}>{match.answers?.role || 'Attendee'}</div>
            </div>
          </div>
          <div className="quote" style={{ fontSize: 17 }}>&ldquo;{match.reason}&rdquo;</div>
        </div>

        <div className="row gap10" style={{ marginTop: 20 }}>
          <button
            className="btn btn-ghost btn-full"
            onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}
          >
            {copied ? <><Icon name="check" size={18} /> Copied!</> : <><Icon name="copy" size={18} /> Copy link</>}
          </button>
          <button
            className="btn btn-primary btn-full"
            onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}
          >
            <Icon name="download" size={18} /> Save image
          </button>
        </div>
      </div>
    </div>
  );
}
