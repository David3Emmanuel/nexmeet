'use client';

import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Strength from '@/components/ui/Strength';
import { Match, YouProfile } from '@/lib/data';

interface DetailScreenProps {
  you: YouProfile;
  match: Match;
  met: boolean;
  onBack: () => void;
  onShare: () => void;
  onMet: () => void;
}

export default function DetailScreen({ you, match, met, onBack, onShare, onMet }: DetailScreenProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "4px 22px 0" }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack}><Icon name="back" size={20} /></button>
          <button className="icon-btn" onClick={onShare}><Icon name="share" size={19} /></button>
        </div>
      </div>

      <div className="scroll" style={{ padding: "16px 24px 24px" }}>
        <div className="screen-enter mcard" style={{ background: match.accent, gap: 18, padding: "26px 24px" }}>
          <div className="row gap16" style={{ alignItems: "center" }}>
            <div style={{ borderRadius: "50%", padding: 3, background: "rgba(255,255,255,.22)" }}>
              <Avatar name={match.name} color="rgba(255,255,255,.16)" size={64} />
            </div>
            <div>
              <div className="display" style={{ fontSize: 25, color: "#fff" }}>{match.name}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)", marginTop: 3 }}>{match.role}</div>
            </div>
          </div>
          <div className="row between" style={{ alignItems: "center" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>Match strength</span>
            <Strength value={match.strength} light />
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="eyebrow">Why you two, tonight</div>
          <p className="display" style={{ fontSize: 22, lineHeight: 1.25, marginTop: 12, fontWeight: 700 }}>{match.reason}</p>
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{match.name.split(" ")[0]} is great at</div>
          <div className="row wrap gap8">
            {match.skills.map(s => <span key={s} className="chip" style={{ cursor: "default" }}>{s}</span>)}
          </div>
        </div>

        <div style={{ marginTop: 22, background: "var(--card)", border: "1px solid var(--card-edge)", borderRadius: 18, padding: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Working on</div>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)" }}>{match.focus}</p>
          <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
          <div className="row gap8" style={{ color: "var(--ink-2)", fontSize: 14.5, alignItems: "flex-start" }}>
            <span style={{ color: "var(--accent)", marginTop: 1 }}><Icon name="spark" size={17} /></span>
            <span><b style={{ color: "var(--ink)" }}>Fun fact:</b> {match.fun}</span>
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
          <div className="row gap8" style={{ color: "var(--ink-2)", fontSize: 14.5, alignItems: "flex-start" }}>
            <span style={{ color: "var(--accent)", marginTop: 1 }}><Icon name="chat" size={17} /></span>
            <span><b style={{ color: "var(--ink)" }}>Reach them:</b> {match.contact}</span>
          </div>
        </div>

        <div style={{ marginTop: 18, background: "var(--ink)", borderRadius: 18, padding: 20 }}>
          <div className="row gap8" style={{ color: "var(--paper)", alignItems: "center", marginBottom: 10 }}>
            <Icon name="chat" size={18} />
            <span className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>Try opening with</span>
          </div>
          <p style={{ color: "var(--paper)", fontSize: 16.5, lineHeight: 1.45, fontFamily: "var(--font-display)", fontWeight: 600 }}>{match.starter}</p>
        </div>
      </div>

      <div style={{ padding: "12px 24px 26px", background: "linear-gradient(transparent, var(--paper) 26%)" }}>
        <div className="row gap10">
          <button className="btn btn-ghost" onClick={onShare} style={{ flex: "0 0 auto", width: 56, padding: 0 }}>
            <Icon name="share" size={19} />
          </button>
          <button className={"btn btn-full " + (met ? "btn-ghost" : "btn-ink")} onClick={onMet}>
            {met ? <><Icon name="check" size={19} /> Marked as met</> : <><Icon name="heart" size={18} /> I'll go say hi</>}
          </button>
        </div>
      </div>
    </div>
  );
}
