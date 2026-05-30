/* ===========================================================
   NexMeet — Organizer dashboard (responsive desktop)
   =========================================================== */
const { useState: useStateO, useEffect: useEffectO, useRef: useRefO } = React;

function OrganizerScreen({ onExit, onNewEvent, onHome, event }) {
  const evName = (event && event.name) || EVENT.name;
  const [count, setCount] = useStateO(SEED.length);
  const [pulse, setPulse] = useStateO(null);
  const [feed, setFeed] = useStateO([]);

  // simulate live joins
  useEffectO(() => {
    const names = ["Tunde Bakare", "Grace Imeh", "Leo Park", "Halima Sani", "Ife Bamidele", "Sam Reilly"];
    const roles = ["Student @ UNILAG", "iOS Dev (freelance)", "PM @ Spotify", "Founder, edtech", "Data Analyst", "UX Designer"];
    let i = 0;
    const id = setInterval(() => {
      const nm = names[i % names.length], rl = roles[i % roles.length]; i++;
      setCount(c => c + 1);
      setPulse(nm);
      setFeed(f => [{ name: nm, role: rl, t: Date.now() }, ...f].slice(0, 5));
      setTimeout(() => setPulse(null), 1400);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const matchesMade = Math.round(count * 2.4);
  const completion = 78;

  return (
    <div className="org screen-enter">
      <div className="org-inner">
        {/* top bar */}
        <div className="row between wrap gap16" style={{ alignItems: "center", marginBottom: 28 }}>
          <div className="row gap14" style={{ alignItems: "center" }}>
            <button onClick={onHome} style={{ display: "flex" }}><Logo size={22} /></button>
            <span style={{ padding: "6px 12px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--card-edge)", fontSize: 13, fontWeight: 700 }}>Organizer</span>
          </div>
          <div className="row gap10" style={{ alignItems: "center" }}>
            <span className="row gap8" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--forest)", alignItems: "center" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--forest)", animation: "pulse 1.6s infinite" }} /> Live
            </span>
            <button className="btn btn-ghost btn-sm" onClick={onNewEvent}><Icon name="spark" size={16} /> New event</button>
            <button className="btn btn-ghost btn-sm" onClick={onExit}><Icon name="eye" size={16} /> Attendee view</button>
          </div>
        </div>

        {/* header */}
        <div className="row between wrap gap16" style={{ alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div className="eyebrow">{evName} · {EVENT.date}</div>
            <h1 className="display" style={{ fontSize: 40, marginTop: 10 }}>The room, right now</h1>
          </div>
          {pulse && (
            <div className="anim-pop row gap10" style={{ alignItems: "center", background: "var(--card)", border: "1px solid var(--card-edge)", borderRadius: 999, padding: "8px 16px 8px 8px", boxShadow: "var(--shadow-sm)" }}>
              <Avatar name={pulse} color="var(--accent)" size={34} />
              <span style={{ fontSize: 14 }}><b>{pulse}</b> just joined</span>
            </div>
          )}
        </div>

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 22 }}>
          <Stat label="Attendees in room" value={count} accent="var(--coral)" icon="users" big live />
          <Stat label="Matches generated" value={matchesMade} accent="var(--plum)" icon="spark" />
          <Stat label="Form completion" value={completion + "%"} accent="var(--forest)" icon="check" />
          <Stat label="Avg. time to match" value="38s" accent="var(--sky)" icon="bolt" />
        </div>

        {/* main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20, alignItems: "start" }} className="org-grid">
          {/* connection graph */}
          <div className="panel" style={{ padding: 24 }}>
            <div className="row between" style={{ alignItems: "center", marginBottom: 6 }}>
              <h3 className="display" style={{ fontSize: 21 }}>Connection map</h3>
              <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{matchesMade} links</span>
            </div>
            <p className="lead" style={{ fontSize: 13.5, marginBottom: 8 }}>Every line is a match NexMeet suggested between two attendees.</p>
            <ConnectionGraph nodes={Math.min(count, 16)} />
          </div>

          {/* right column */}
          <div className="col gap20">
            {/* QR share */}
            <div className="panel" style={{ padding: 24, textAlign: "center" }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Put this on the big screen</div>
              <div style={{ display: "inline-block", padding: 16, background: "var(--paper-2)", borderRadius: 22 }}>
                <QrCode seed={EVENT.code} size={150} />
              </div>
              <div className="display" style={{ fontSize: 18, marginTop: 14 }}>nexmeet.app/buildwithai</div>
              <p className="lead" style={{ fontSize: 13, marginTop: 4 }}>Scan to join · code {EVENT.code}</p>
            </div>

            {/* live feed */}
            <div className="panel" style={{ padding: 22 }}>
              <h3 className="display" style={{ fontSize: 18, marginBottom: 14 }}>Just joined</h3>
              <div className="col gap8">
                {(feed.length ? feed : SEED.slice(0, 5).map(s => ({ name: s.name, role: s.role, t: 0 }))).map((f, i) => (
                  <div key={f.name + i} className="row gap12" style={{ alignItems: "center", padding: "6px 0", borderBottom: i < 4 ? "1px solid var(--line)" : "none" }}>
                    <Avatar name={f.name} color={AV[i % AV.length]} size={36} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.role}</div>
                    </div>
                    {f.t > 0 && <span style={{ fontSize: 11.5, color: "var(--forest)", fontWeight: 700 }}>now</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* attendee table */}
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
                {SEED.map((p, i) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 10px" }}>
                      <div className="row gap10" style={{ alignItems: "center" }}>
                        <Avatar name={p.name} color={p.color} size={32} />
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px", fontSize: 13.5, color: "var(--ink-2)" }}>{p.role}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                        {(GOALS.find(g => g.id === p.goal) || {}).label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <div className="row gap6">{p.skills.slice(0, 2).map(s => <span key={s} style={{ fontSize: 12, color: "var(--ink-3)", padding: "3px 8px", border: "1px solid var(--card-edge)", borderRadius: 999 }}>{s}</span>)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, icon, big, live }) {
  return (
    <div className="stat-card" style={{ borderTop: "3px solid " + accent }}>
      <div className="row between" style={{ alignItems: "center" }}>
        <span style={{ color: accent }}><Icon name={icon} size={20} /></span>
        {live && <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent, animation: "pulse 1.6s infinite" }} />}
      </div>
      <div className="display" style={{ fontSize: big ? 40 : 34, marginTop: 14 }}>{value}</div>
      <div className="lead" style={{ fontSize: 13.5, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ConnectionGraph({ nodes = 14 }) {
  const W = 560, H = 360;
  const pts = useRefO(null);
  if (!pts.current || pts.current.length !== nodes) {
    let h = 99; const rnd = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    pts.current = Array.from({ length: nodes }, (_, i) => ({
      x: 60 + rnd() * (W - 120), y: 50 + rnd() * (H - 100),
      r: 9 + rnd() * 9, c: AV[i % AV.length],
    }));
  }
  const P = pts.current;
  const links = [];
  for (let i = 0; i < P.length; i++) {
    const j = (i + 1 + Math.floor((i * 7) % (P.length - 1))) % P.length;
    if (i !== j) links.push([i, j]);
    if (i % 3 === 0) { const k = (i + 4) % P.length; if (i !== k) links.push([i, k]); }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {links.map(([a, b], i) => (
        <line key={i} x1={P[a].x} y1={P[a].y} x2={P[b].x} y2={P[b].y} stroke="var(--accent)" strokeWidth="1.4" opacity="0.28"
          strokeDasharray="200" strokeDashoffset="200" style={{ animation: `dash .9s ease ${i * 0.05}s forwards` }} />
      ))}
      {P.map((p, i) => (
        <g key={i} style={{ animation: `pop .5s var(--pop) ${i * 0.04}s both` }}>
          <circle cx={p.x} cy={p.y} r={p.r + 4} fill={p.c} opacity="0.14" />
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.c} />
          <circle cx={p.x} cy={p.y} r={p.r} fill="none" stroke="var(--card)" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

Object.assign(window, { OrganizerScreen });
