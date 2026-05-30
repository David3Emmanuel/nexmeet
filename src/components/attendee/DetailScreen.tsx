'use client';

import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';

interface MatchItem {
  id: string;
  name: string;
  color?: string;
  reason?: string;
  score?: number;
  answers?: Record<string, string>;
}

interface DetailScreenProps {
  you: { name: string };
  match: MatchItem;
  met: boolean;
  onBack: () => void;
  onShare: () => void;
  onMet: () => void;
}

const ACCENT_FALLBACK = 'var(--accent)';

export default function DetailScreen({ you, match, met, onBack, onShare, onMet }: DetailScreenProps) {
  const accent = match.color || ACCENT_FALLBACK;
  const answers = match.answers || {};

  // Derive displayable fields from real DB answers
  const role = answers.role || answers['what-do-you-do'] || answers['your-role'] || null;
  const focus = answers.focus || answers['what-are-you-working-on'] || answers['current-focus'] || null;
  const fun = answers.fun || answers['fun-fact'] || answers['one-fun-fact'] || null;
  const email = answers.email || null;
  const phone = answers.phone || null;

  // Build conversation starters from real answers
  const starters: string[] = [];
  if (focus) starters.push(`"I heard you're working on ${focus.toLowerCase().replace(/\.$/, '')} — tell me more about that."`);
  if (role) starters.push(`"You're in ${role} — I've been thinking about that space. What's your take right now?"`);
  if (fun) starters.push(`"${fun} — okay, I have to ask about that."`);
  const starter = starters[0] || `"Hey, I'm ${you.name.split(' ')[0]} — NexMeet said we should meet. I'm glad it did."`;

  // Build skills list from responses
  const skills: string[] = answers.skills
    ? (Array.isArray(answers.skills) ? answers.skills : answers.skills.split(',').map((s: string) => s.trim()))
    : [];

  const contact = email || phone || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0,
        background: 'color-mix(in srgb, var(--paper) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        padding: "16px 22px",
        borderBottom: '1px solid var(--line)',
        zIndex: 100, flexShrink: 0,
      }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack}><Icon name="back" size={20} /></button>
          <button className="icon-btn" onClick={onShare}><Icon name="share" size={19} /></button>
        </div>
      </div>

      <div className="scroll" style={{ padding: "16px 24px 24px" }}>
        {/* Header card */}
        <div className="screen-enter mcard" style={{ background: accent, gap: 18, padding: "26px 24px" }}>
          <div className="row gap16" style={{ alignItems: "center" }}>
            <div style={{ borderRadius: "50%", padding: 3, background: "rgba(255,255,255,.22)" }}>
              <Avatar name={match.name} color="rgba(255,255,255,.16)" size={64} />
            </div>
            <div>
              <div className="display" style={{ fontSize: 25, color: "#fff" }}>{match.name}</div>
              {role && <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)", marginTop: 3 }}>{role}</div>}
            </div>
          </div>
          {match.score && (
            <div className="row between" style={{ alignItems: "center" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>Match strength</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,.2)", padding: "4px 10px", borderRadius: 999 }}>
                {match.score}%
              </span>
            </div>
          )}
        </div>

        {/* Why you two */}
        {match.reason && (
          <div style={{ marginTop: 22 }}>
            <div className="eyebrow">Why you two, tonight</div>
            <p className="display" style={{ fontSize: 22, lineHeight: 1.25, marginTop: 12, fontWeight: 700 }}>
              {match.reason}
            </p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{match.name.split(" ")[0]}&apos;s skills</div>
            <div className="row wrap gap8">
              {skills.map(s => <span key={s} className="chip" style={{ cursor: "default" }}>{s}</span>)}
            </div>
          </div>
        )}

        {/* Working on / fun fact / contact */}
        {(focus || fun || contact) && (
          <div style={{ marginTop: 22, background: "var(--card)", border: "1px solid var(--card-edge)", borderRadius: 18, padding: 18 }}>
            {focus && (
              <>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Working on</div>
                <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)" }}>{focus}</p>
              </>
            )}
            {fun && (
              <>
                {focus && <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />}
                <div className="row gap8" style={{ color: "var(--ink-2)", fontSize: 14.5, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--accent)", marginTop: 1 }}><Icon name="spark" size={17} /></span>
                  <span><b style={{ color: "var(--ink)" }}>Fun fact:</b> {fun}</span>
                </div>
              </>
            )}
            {contact && (
              <>
                <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
                <div className="row gap8" style={{ color: "var(--ink-2)", fontSize: 14.5, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--accent)", marginTop: 1 }}><Icon name="chat" size={17} /></span>
                  <span><b style={{ color: "var(--ink)" }}>Reach them:</b> {contact}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Conversation starter */}
        <div style={{ marginTop: 18, background: "var(--ink)", borderRadius: 18, padding: 20 }}>
          <div className="row gap8" style={{ color: "var(--paper)", alignItems: "center", marginBottom: 10 }}>
            <Icon name="chat" size={18} />
            <span className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>Try opening with</span>
          </div>
          <p style={{ color: "var(--paper)", fontSize: 16.5, lineHeight: 1.45, fontFamily: "var(--font-display)", fontWeight: 600 }}>
            {starter}
          </p>
        </div>
      </div>

      <div style={{ padding: "12px 24px 26px", background: "linear-gradient(transparent, var(--paper) 26%)" }}>
        <div className="row gap10">
          <button className="btn btn-ghost" onClick={onShare} style={{ flex: "0 0 auto", width: 56, padding: 0 }}>
            <Icon name="share" size={19} />
          </button>
          <button className={"btn btn-full " + (met ? "btn-ghost" : "btn-ink")} onClick={onMet}>
            {met ? <><Icon name="check" size={19} /> Marked as met</> : <><Icon name="heart" size={18} /> I&apos;ll go say hi</>}
          </button>
        </div>
      </div>
    </div>
  );
}
