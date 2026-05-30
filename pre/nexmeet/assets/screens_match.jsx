/* ===========================================================
   NexMeet — Match results, Match detail, Share sheet
   =========================================================== */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

/* ---------- MATCHES (hero) ---------- */
function MatchesScreen({ you, matches, count, onOpen, onMap, onRefresh, onRestart }) {
  const [refreshing, setRefreshing] = useStateM(false);
  const doRefresh = () => { setRefreshing(true); setTimeout(() => { onRefresh(); setRefreshing(false); }, 900); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* header */}
      <div style={{ padding: "4px 24px 14px" }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <Logo size={19} />
          <button className="chip" onClick={onRestart} style={{ padding: "8px 12px", fontSize: 12.5 }}><Icon name="user" size={15} /> {you.name.split(" ")[0]}</button>
        </div>
      </div>

      <div className="scroll" style={{ padding: "0 24px 24px" }}>
        <div className="screen-enter">
          <div className="eyebrow">Your matches · {EVENT.name}</div>
          <h1 className="display" style={{ fontSize: 36, marginTop: 12 }}>3 people you<br />should meet today</h1>
          <p className="lead" style={{ fontSize: 15, marginTop: 18 }}>
            Picked from <b style={{ color: "var(--ink)" }}>{count} attendees</b> in the room. Tap a card for the full story and a conversation starter.
          </p>
        </div>

        <div className="col gap16" style={{ marginTop: 22 }}>
          {matches.map((m, i) => (
            <button key={m.id} className={"mcard anim-pop d" + (i + 1)} onClick={() => onOpen(m)} style={{ background: m.accent, textAlign: "left", border: "none" }}>
              <div className="row between" style={{ alignItems: "flex-start" }}>
                <div className="row gap12" style={{ alignItems: "center" }}>
                  <div style={{ borderRadius: "50%", padding: 2, background: "rgba(255,255,255,.25)" }}>
                    <Avatar name={m.name} color="rgba(255,255,255,.18)" size={48} />
                  </div>
                  <div>
                    <div className="display" style={{ fontSize: 19, color: "#fff" }}>{m.name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.82)", marginTop: 2 }}>{m.role}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.14)", padding: "5px 9px", borderRadius: 999 }}>#{i + 1}</span>
              </div>
              <div className="quote">"{m.reason}"</div>
              <div className="row between" style={{ alignItems: "center", marginTop: 2 }}>
                <Strength value={m.strength} light />
                <span className="row gap6" style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>See why <Icon name="arrow" size={16} /></span>
              </div>
            </button>
          ))}
        </div>

        <button className="btn btn-ink btn-full" onClick={onMap} style={{ marginTop: 20 }}>
          <Icon name="location" size={18} /> See them on the live map
        </button>
        <button className="btn btn-ghost btn-full" onClick={doRefresh} style={{ marginTop: 10 }}>
          <span style={{ display: "inline-flex", animation: refreshing ? "spin .9s linear infinite" : "none" }}><Icon name="refresh" size={18} /></span>
          {refreshing ? "Re-reading the room…" : "Refresh as more people join"}
        </button>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 12.5, color: "var(--ink-3)" }}>
          <Icon name="chat" size={13} /> We've emailed these to you too — they unlock at match time.
        </p>
      </div>
    </div>
  );
}

/* ---------- DETAIL ---------- */
function DetailScreen({ you, match, onBack, onShare, onMet, met }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "4px 22px 0" }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack}><Icon name="back" size={20} /></button>
          <button className="icon-btn" onClick={onShare}><Icon name="share" size={19} /></button>
        </div>
      </div>

      <div className="scroll" style={{ padding: "16px 24px 24px" }}>
        {/* hero block */}
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

        {/* why */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow">Why you two, tonight</div>
          <p className="display" style={{ fontSize: 22, lineHeight: 1.25, marginTop: 12, fontWeight: 700 }}>{match.reason}</p>
        </div>

        {/* their skills */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{match.name.split(" ")[0]} is great at</div>
          <div className="row wrap gap8">
            {match.skills.map(s => <span key={s} className="chip" style={{ cursor: "default" }}>{s}</span>)}
          </div>
        </div>

        {/* working on */}
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

        {/* conversation starter */}
        <div style={{ marginTop: 18, background: "var(--ink)", borderRadius: 18, padding: 20 }}>
          <div className="row gap8" style={{ color: "var(--paper)", alignItems: "center", marginBottom: 10 }}>
            <Icon name="chat" size={18} /><span className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>Try opening with</span>
          </div>
          <p style={{ color: "var(--paper)", fontSize: 16.5, lineHeight: 1.45, fontFamily: "var(--font-display)", fontWeight: 600 }}>{match.starter}</p>
        </div>
      </div>

      <div style={{ padding: "12px 24px 26px", background: "linear-gradient(transparent, var(--paper) 26%)" }}>
        <div className="row gap10">
          <button className="btn btn-ghost" onClick={onShare} style={{ flex: "0 0 auto", width: 56, padding: 0 }}><Icon name="share" size={19} /></button>
          <button className={"btn btn-full " + (met ? "btn-ghost" : "btn-ink")} onClick={onMet}>
            {met ? <><Icon name="check" size={19} /> Marked as met</> : <><Icon name="heart" size={18} /> I'll go say hi</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- SHARE SHEET ---------- */
function ShareSheet({ match, you, onClose }) {
  const [copied, setCopied] = useStateM(false);
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 80, background: "rgba(25,20,15,.4)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", animation: "fadeUp .25s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--paper)", width: "100%", borderRadius: "28px 28px 0 0", padding: "12px 24px 28px", animation: "pop .35s var(--pop)" }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: "var(--card-edge)", margin: "0 auto 18px" }} />
        <div className="eyebrow">Share this match</div>
        <h3 className="display" style={{ fontSize: 24, marginTop: 8, marginBottom: 16 }}>Screenshot-ready</h3>

        {/* shareable card preview */}
        <div className="mcard" style={{ background: match.accent, gap: 14 }}>
          <div className="row between" style={{ alignItems: "center" }}>
            <Logo size={16} dark />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>{EVENT.name}</span>
          </div>
          <div className="row gap12" style={{ alignItems: "center" }}>
            <Avatar name={match.name} color="rgba(255,255,255,.18)" size={44} />
            <div>
              <div className="display" style={{ fontSize: 18, color: "#fff" }}>{you.name.split(" ")[0]} × {match.name.split(" ")[0]}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)" }}>{match.role}</div>
            </div>
          </div>
          <div className="quote" style={{ fontSize: 17 }}>"{match.reason}"</div>
        </div>

        <div className="row gap10" style={{ marginTop: 20 }}>
          <button className="btn btn-ghost btn-full" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
            {copied ? <><Icon name="check" size={18} /> Copied!</> : <><Icon name="copy" size={18} /> Copy link</>}
          </button>
          <button className="btn btn-primary btn-full" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}><Icon name="download" size={18} /> Save image</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MatchesScreen, DetailScreen, ShareSheet });
