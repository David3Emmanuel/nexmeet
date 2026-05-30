/* ===========================================================
   NexMeet — attendee screens: Cover, Form, Finding
   =========================================================== */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

/* ---------- COVER / EVENT ENTRY ---------- */
function CoverScreen({ onStart, onOrganizer }) {
  return (
    <div className="scroll screen-enter" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 26px 0" }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <Logo size={21} />
          <button className="chip" onClick={onOrganizer} style={{ padding: "8px 13px", fontSize: 12.5 }}><Icon name="grid" size={15} /> Organizer</button>
        </div>
      </div>

      <div style={{ padding: "30px 26px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="eyebrow anim-up">You're in the room · live now</div>
        <h1 className="display anim-up d1" style={{ fontSize: 52, marginTop: 14 }}>
          Meet the<br />right people.<br /><span style={{ color: "var(--accent)" }}>Every time.</span>
        </h1>
        <p className="lead anim-up d2" style={{ fontSize: 17, marginTop: 18, maxWidth: 320 }}>
          Tell us about you in two minutes. Our AI reads everyone in the room and hands you the three people you can't afford to miss tonight.
        </p>

        {/* event card */}
        <div className="anim-up d3" style={{ marginTop: 26, background: "var(--card)", border: "1px solid var(--card-edge)", borderRadius: 24, padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="display" style={{ fontSize: 22 }}>{EVENT.name}</div>
              <div className="lead" style={{ fontSize: 14, marginTop: 4 }}>{EVENT.edition} · Hackathon</div>
            </div>
            <div style={{ background: "var(--paper-2)", borderRadius: 14, padding: 8 }}>
              <QrCode seed={EVENT.code} size={66} />
            </div>
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />
          <div className="col gap10">
            <div className="row gap10" style={{ color: "var(--ink-2)", fontSize: 14.5 }}><Icon name="location" size={17} /> {EVENT.venue}</div>
            <div className="row gap10" style={{ color: "var(--ink-2)", fontSize: 14.5 }}><Icon name="bolt" size={17} /> {EVENT.date}</div>
          </div>
        </div>

        <div className="grow" />
      </div>

      {/* sticky CTA */}
      <div style={{ padding: "16px 26px 26px", background: "linear-gradient(transparent, var(--paper) 30%)" }}>
        <button className="btn btn-primary btn-full" onClick={onStart}>Find my people <Icon name="arrow" size={20} /></button>
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>No login. No password. 2 minutes, tops.</p>
      </div>
    </div>
  );
}

/* ---------- MULTI-STEP FORM ---------- */
function FormScreen({ initial, onBack, onSubmit }) {
  const [step, setStep] = useStateA(0);
  const [d, setD] = useStateA(initial);
  const steps = [
    { key: "name", title: "First, who are you?", hint: "The name people will look for.", type: "text", ph: "e.g. Moni Adeleke", label: "Your name" },
    { key: "role", title: "What do you do?", hint: "Role, company, or school — keep it short.", type: "text", ph: "e.g. Solo founder building an AI study tool", label: "Your one-liner" },
    { key: "skills", title: "What are you great at?", hint: "Pick up to three.", type: "skills", label: "Your top skills" },
    { key: "focus", title: "What are you building?", hint: "What's got your attention right now.", type: "textarea", ph: "Right now I'm focused on…", label: "Current focus" },
    { key: "goal", title: "What do you want tonight?", hint: "This is what we match on hardest.", type: "goal", label: "Looking for" },
    { key: "fun", title: "One fun fact.", hint: "The thing that makes you, you. Great icebreaker fuel.", type: "textarea", ph: "Something unexpected about you…", label: "Fun fact" },
  ];
  const cur = steps[step];
  const total = steps.length;
  const val = d[cur.key];
  const valid = cur.type === "skills" ? (val && val.length > 0) : (val && String(val).trim().length > 0);

  const set = (v) => setD({ ...d, [cur.key]: v });
  const toggleSkill = (s) => {
    const arr = d.skills || [];
    if (arr.includes(s)) set(arr.filter(x => x !== s));
    else if (arr.length < 3) set([...arr, s]);
  };
  const next = () => { if (step < total - 1) setStep(step + 1); else onSubmit(d); };
  const back = () => { if (step === 0) onBack(); else setStep(step - 1); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* header */}
      <div style={{ padding: "4px 22px 0" }}>
        <div className="row gap12" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={back}><Icon name="back" size={20} /></button>
          <div className="progress-track grow"><div className="progress-fill" style={{ width: ((step + 1) / total * 100) + "%" }} /></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-3)", minWidth: 34, textAlign: "right" }}>{step + 1}/{total}</span>
        </div>
      </div>

      {/* body */}
      <div className="scroll" style={{ padding: "30px 26px 10px" }} key={step}>
        <div className="screen-enter">
          <div className="eyebrow">Step {step + 1}</div>
          <h2 className="display" style={{ fontSize: 33, marginTop: 10, lineHeight: 1.04 }}>{cur.title}</h2>
          <p className="lead" style={{ fontSize: 15, marginTop: 14, marginBottom: 26 }}>{cur.hint}</p>

          {cur.type === "text" && (
            <input className="input" autoFocus placeholder={cur.ph} value={val || ""} onChange={e => set(e.target.value)} onKeyDown={e => e.key === "Enter" && valid && next()} />
          )}
          {cur.type === "textarea" && (
            <textarea className="textarea" autoFocus rows={4} placeholder={cur.ph} value={val || ""} onChange={e => set(e.target.value)} />
          )}
          {cur.type === "skills" && (
            <div className="row wrap gap10">
              {SKILL_BANK.map(s => {
                const on = (d.skills || []).includes(s);
                return <button key={s} className={"chip" + (on ? " on accent" : "")} onClick={() => toggleSkill(s)}>{on && <Icon name="check" size={14} />}{s}</button>;
              })}
            </div>
          )}
          {cur.type === "goal" && (
            <div className="col gap10">
              {GOALS.map(g => {
                const on = d.goal === g.id;
                return (
                  <button key={g.id} className="row between" onClick={() => set(g.id)} style={{ textAlign: "left", padding: "16px 18px", borderRadius: 16, border: "1.5px solid " + (on ? "var(--accent)" : "var(--card-edge)"), background: on ? "color-mix(in srgb, var(--accent) 10%, var(--card))" : "var(--card)", transition: "all .16s", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{g.label}</span>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid " + (on ? "var(--accent)" : "var(--card-edge)"), display: "flex", alignItems: "center", justifyContent: "center", background: on ? "var(--accent)" : "transparent", color: "#fff" }}>{on && <Icon name="check" size={13} stroke={3} />}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "12px 26px 26px", background: "linear-gradient(transparent, var(--paper) 26%)" }}>
        <button className="btn btn-primary btn-full" disabled={!valid} onClick={next} style={{ opacity: valid ? 1 : .4, transition: "opacity .2s" }}>
          {step < total - 1 ? <>Continue <Icon name="arrow" size={19} /></> : <>See my matches <Icon name="spark" size={19} /></>}
        </button>
      </div>
    </div>
  );
}

/* ---------- FINDING (loading) ---------- */
function FindingScreen({ you, onDone }) {
  const msgs = ["Reading the room…", "Scanning 47 profiles…", "Matching on what you're looking for…", "Writing your reasons…", "Almost there…"];
  const [mi, setMi] = useStateA(0);
  useEffectA(() => {
    const id = setInterval(() => setMi(m => Math.min(m + 1, msgs.length - 1)), 620);
    const t = setTimeout(onDone, 3300);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);
  return (
    <div className="scroll screen-enter" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "30px 30px 60px" }}>
      {/* orbiting avatars */}
      <div style={{ position: "relative", width: 220, height: 220, marginBottom: 36 }}>
        <div style={{ position: "absolute", inset: 0, animation: "orbit 8s linear infinite" }}>
          {SEED.slice(0, 6).map((p, i) => {
            const a = (i / 6) * Math.PI * 2;
            return <div key={p.id} style={{ position: "absolute", left: 110 + Math.cos(a) * 95 - 21, top: 110 + Math.sin(a) * 95 - 21, animation: `pulse ${1.6 + i * .2}s ease-in-out infinite` }}><Avatar name={p.name} color={p.color} size={42} /></div>;
          })}
        </div>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 92, height: 92, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 45%, transparent)", animation: "float 3s ease-in-out infinite" }}>
          <div style={{ color: "#fff" }}><Icon name="spark" size={40} /></div>
        </div>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", border: "2px dashed var(--card-edge)", animation: "orbit 14s linear infinite reverse" }} />
      </div>
      <h2 className="display" style={{ fontSize: 30 }}>Finding your people</h2>
      <p className="lead" style={{ marginTop: 12, fontSize: 16, minHeight: 24, transition: "opacity .3s" }} key={mi}><span className="screen-enter">{msgs[mi]}</span></p>
    </div>
  );
}

Object.assign(window, { CoverScreen, FormScreen, FindingScreen });
