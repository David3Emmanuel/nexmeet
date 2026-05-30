'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import QrCode from '@/components/ui/QrCode';
import ImageDrop from '@/components/ui/ImageDrop';

const EVENT_TYPES = [
  { id: "hackathon", label: "Hackathon" },
  { id: "conference", label: "Conference" },
  { id: "meetup", label: "Community meetup" },
  { id: "career", label: "Career fair" },
  { id: "demo", label: "Demo day" },
  { id: "mixer", label: "Networking mixer" },
];

const THEMES = [
  { id: "ember", name: "Ember", accent: "#FF5A2C", font: "Bricolage", desc: "Warm · energetic" },
  { id: "cobalt", name: "Cobalt", accent: "#2F6BFF", font: "Clean", desc: "Sharp · professional" },
  { id: "grove", name: "Grove", accent: "#1F8A5B", font: "Clean", desc: "Calm · grounded" },
  { id: "orchid", name: "Orchid", accent: "#7A3E9D", font: "Serif", desc: "Editorial · bold" },
  { id: "rose", name: "Rosé", accent: "#E0356B", font: "Bricolage", desc: "Playful · social" },
];

const TYPE_THEME: Record<string, string> = { hackathon: "ember", conference: "cobalt", meetup: "grove", career: "cobalt", demo: "orchid", mixer: "rose" };
const TYPE_EXTRA: Record<string, string> = {
  hackathon: "What role do you play on a team? (frontend, ML, design, etc.)",
  conference: "What topic could you talk about for an hour?",
  meetup: "What's a project you'd love feedback on?",
  career: "What roles or companies are you targeting?",
  demo: "Are you raising, investing, or building?",
  mixer: "What's a project you'd love feedback on?",
};

function baseQuestions(type: string) {
  return [
    { id: "name", q: "Full name", locked: true, on: true },
    { id: "phone", q: "Phone number", locked: true, on: true },
    { id: "email", q: "Email address", locked: true, on: true },
    { id: "role", q: "What do you do? (role, company, or school)", on: true },
    { id: "skills", q: "Your top 3 skills or areas of expertise", on: true },
    { id: "focus", q: "What are you working on right now?", on: true },
    { id: "looking", q: "Who are you hoping to meet here?", on: true },
    { id: "extra", q: TYPE_EXTRA[type] || TYPE_EXTRA.mixer, on: true },
    { id: "fun", q: "One fun or unexpected fact about you", on: true },
  ];
}

interface Details { 
  title: string; 
  about: string; 
  type: string; 
  date: string;
  venue: string;
  matchCount: string;
}

interface Timing { mode: string; when: string; }
interface Question { id: string; q: string; locked?: boolean; on: boolean; custom?: boolean; }

interface OrganizerCreateProps {
  defaults?: Partial<Details>;
  applyTheme: (th: { accent: string; font: string } | undefined) => void;
  onHome?: () => void;
  onExit: () => void;
  onLaunch: (d: Details) => void;
}

const WIZARD_STEPS = ["Details", "Generate", "Review", "Timing", "Live"];

/* ---- Steps ---- */
function StepDetails({ details, set }: { details: Details; set: (k: string, v: string) => void }) {
  const isStandardType = EVENT_TYPES.some(t => t.id === details.type);
  const [customType, setCustomType] = useState(isStandardType ? "" : details.type);

  return (
    <div className="screen-enter step-details-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40, alignItems: "start" }}>
      
      {/* Left side: Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div className="eyebrow">Step 1 · Event Details</div>
          <h1 className="display" style={{ fontSize: 34, marginTop: 10, marginBottom: 8 }}>What are you hosting?</h1>
          <p className="lead" style={{ fontSize: 14.5 }}>
            Fill in the information below. NexMeet's AI will draft a custom sign-up form and choose a matching event theme.
          </p>
        </div>

        {/* Event Title */}
        <label className="field">
          <span className="field-label">Event Title <strong style={{ color: 'var(--accent)' }}>*</strong></span>
          <input 
            className="input" 
            placeholder="e.g. BuildWithAI Lagos 2026" 
            value={details.title} 
            onChange={e => set("title", e.target.value)} 
          />
        </label>

        {/* Event Type */}
        <div className="field">
          <span className="field-label">Event Type</span>
          <div className="row wrap gap8" style={{ marginTop: 8 }}>
            {EVENT_TYPES.map(t => (
              <button 
                key={t.id} 
                type="button"
                className={"chip" + (details.type === t.id ? " on accent" : "")} 
                onClick={() => set("type", t.id)}
              >
                {details.type === t.id && <Icon name="check" size={14} />}{t.label}
              </button>
            ))}
            <button 
              type="button"
              className={"chip" + (!isStandardType ? " on accent" : "")} 
              onClick={() => set("type", customType || "Custom Event")}
            >
              {!isStandardType && <Icon name="check" size={14} />}Other
            </button>
          </div>

          {!isStandardType && (
            <div className="screen-enter" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              <span className="field-hint" style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Name your custom event type</span>
              <div style={{ position: 'relative', maxWidth: 320 }}>
                <input 
                  className="input" 
                  placeholder="e.g. Workshop, Board game night" 
                  value={customType} 
                  maxLength={25}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomType(val);
                    set("type", val || "Custom Event");
                  }}
                  style={{ paddingRight: 50 }}
                />
                <span style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  fontWeight: 700
                }}>
                  {customType.length}/25
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Date & Location Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label className="field">
            <span className="field-label">Date & Time <strong style={{ color: 'var(--accent)' }}>*</strong></span>
            <input 
              className="input" 
              type="datetime-local"
              value={details.date} 
              onChange={e => set("date", e.target.value)} 
            />
          </label>

          <label className="field">
            <span className="field-label">Location / Venue <strong style={{ color: 'var(--accent)' }}>*</strong></span>
            <input 
              className="input" 
              placeholder="e.g. Zone Tech Park, Gbagada" 
              value={details.venue} 
              onChange={e => set("venue", e.target.value)} 
            />
          </label>
        </div>

        {/* About details */}
        <label className="field">
          <span className="field-label">About this event <strong style={{ color: 'var(--accent)' }}>*</strong></span>
          <span className="field-hint">Describe who is coming and why. The AI reads this to shape your matching form.</span>
          <textarea 
            className="textarea" 
            rows={4} 
            placeholder="A one-night AI hackathon bringing together student builders, founders, and mentors from across Lagos…" 
            value={details.about} 
            onChange={e => set("about", e.target.value)} 
          />
        </label>

        {/* Matches configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label className="field">
            <span className="field-label">Matches per Person <strong style={{ color: 'var(--accent)' }}>*</strong></span>
            <span className="field-hint">Target matches each attendee gets.</span>
            <input 
              className="input" 
              type="number"
              min="1"
              max="10"
              placeholder="3" 
              value={details.matchCount} 
              onChange={e => set("matchCount", e.target.value)} 
            />
          </label>
        </div>

      </div>

      {/* Right side: Live Preview Card */}
      <div style={{ position: 'sticky', top: 20 }}>
        <span className="field-label" style={{ marginBottom: 8, display: 'block' }}>Event Card Preview</span>
        
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--card-edge)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Header Image Dropzone */}
          <div style={{ position: 'relative', height: 160, background: 'var(--paper-2)' }}>
            <ImageDrop placeholder="Upload cover flyer / logo" style={{ width: "100%", height: "100%", border: 'none', borderRadius: 0 }} />
          </div>

          {/* Details Preview */}
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ 
                fontSize: 10.5, 
                fontWeight: 800, 
                letterSpacing: '.08em', 
                textTransform: 'uppercase', 
                color: 'var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                padding: '4px 8px',
                borderRadius: 4
              }}>
                {details.type || 'HACKATHON'}
              </span>
            </div>

            <h3 className="display" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 12, minHeight: 26 }}>
              {details.title || 'Untitled Event'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ink-2)', fontSize: 13, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="bolt" size={14} />
                <span>
                  {details.date ? new Date(details.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date & Time not set'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="location" size={14} />
                <span>{details.venue || 'Location not set'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="users" size={14} />
                <span>Target: {details.matchCount || '3'} matches per person</span>
              </div>
            </div>

            <p style={{ 
              fontSize: 13, 
              color: 'var(--ink-3)', 
              lineHeight: 1.4, 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 36
            }}>
              {details.about || 'Provide a short description on the left to see it here.'}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function StepGenerating({ details }: { details: Details }) {
  const msgs = ["Reading your event brief…", "Drafting sign-up questions…", "Choosing a theme that fits…", "Tuning the matching prompt…"];
  const [mi, setMi] = useState(0);
  useEffect(() => { const id = setInterval(() => setMi(m => Math.min(m + 1, msgs.length - 1)), 600); return () => clearInterval(id); }, []);
  return (
    <div className="screen-enter" style={{ textAlign: "center", padding: "40px 0 60px" }}>
      <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 30px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px dashed var(--card-edge)", animation: "orbit 9s linear infinite" }} />
        <div style={{ position: "absolute", inset: 22, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", animation: "float 3s ease-in-out infinite", boxShadow: "0 12px 34px color-mix(in srgb, var(--accent) 45%, transparent)" }}>
          <Icon name="spark" size={42} />
        </div>
      </div>
      <h2 className="display" style={{ fontSize: 28 }}>Building &ldquo;{details.title || "your event"}&rdquo;</h2>
      <p className="lead" style={{ fontSize: 16, marginTop: 12, minHeight: 24 }} key={mi}><span className="screen-enter">{msgs[mi]}</span></p>
    </div>
  );
}

function StepReview({ details, themeObj, themeId, onTheme, questions, setQuestions }: {
  details: Details; themeObj: typeof THEMES[0]; themeId: string;
  onTheme: (id: string) => void; questions: Question[]; setQuestions: (qs: Question[]) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const toggle = (id: string) => setQuestions(questions.map(q => q.id === id && !q.locked ? { ...q, on: !q.on } : q));
  const edit = (id: string, v: string) => setQuestions(questions.map(q => q.id === id ? { ...q, q: v } : q));
  const addQ = () => setQuestions([...questions, { id: "c" + Date.now(), q: "New question", on: true, custom: true }]);
  const removeQ = (id: string) => setQuestions(questions.filter(q => q.id !== id));

  return (
    <div className="screen-enter">
      <div className="row gap8" style={{ alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 12%, transparent)", padding: "5px 10px", borderRadius: 999 }}>✦ AI generated</span>
      </div>
      <h1 className="display" style={{ fontSize: 32, marginTop: 12, marginBottom: 6 }}>Review &amp; edit</h1>
      <p className="lead" style={{ fontSize: 15, marginBottom: 26 }}>Here's what we drafted. Change the theme, toggle questions on or off, rename anything, or add your own.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 24, alignItems: "start" }} className="review-grid">
        <div className="panel" style={{ padding: 22 }}>
          <div className="row between" style={{ marginBottom: 14 }}>
            <h3 className="display" style={{ fontSize: 19 }}>Theme</h3>
            <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>Tap to switch</span>
          </div>
          <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--card-edge)", marginBottom: 16 }}>
            <div style={{ background: themeObj.accent, padding: 18, color: "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", opacity: .8 }}>{details.type}</div>
              <div className="display" style={{ fontSize: 22, marginTop: 6 }}>{details.title || "Your event"}</div>
              <div style={{ marginTop: 12, display: "inline-flex", padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,.2)", fontSize: 13, fontWeight: 700 }}>Find my people →</div>
            </div>
          </div>
          <div className="row wrap gap8">
            {THEMES.map(t => (
              <button key={t.id} type="button" onClick={() => onTheme(t.id)} className="row gap8" style={{ alignItems: "center", padding: "8px 12px", borderRadius: 999, border: "1.5px solid " + (themeId === t.id ? "var(--ink)" : "var(--card-edge)"), background: themeId === t.id ? "var(--card)" : "transparent" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: t.accent }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</span>
              </button>
            ))}
          </div>
          <p className="lead" style={{ fontSize: 12.5, marginTop: 12 }}>AI picked <b style={{ color: "var(--ink)" }}>{themeObj.name}</b> — {themeObj.desc} — to fit a {details.type}.</p>
        </div>

        <div className="panel" style={{ padding: 22 }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <h3 className="display" style={{ fontSize: 19 }}>Sign-up form</h3>
            <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{questions.filter(q => q.on).length} questions</span>
          </div>
          <p className="lead" style={{ fontSize: 12.5, marginBottom: 14 }}>Name, phone &amp; email are required. Everything else is optional and editable.</p>
          <div className="col gap8">
            {questions.map(q => (
              <div key={q.id} className="row gap10" style={{ alignItems: "center", padding: "11px 12px", borderRadius: 14, border: "1px solid var(--card-edge)", background: q.on ? "var(--card)" : "transparent", opacity: q.on ? 1 : .55 }}>
                {q.locked
                  ? <span title="Required" style={{ color: "var(--ink-3)" }}><Icon name="pin" size={16} /></span>
                  : <button type="button" onClick={() => toggle(q.id)} style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid " + (q.on ? "var(--accent)" : "var(--card-edge)"), background: q.on ? "var(--accent)" : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                      {q.on && <Icon name="check" size={12} stroke={3} />}
                    </button>}
                {editing === q.id && !q.locked
                  ? <input autoFocus className="input" style={{ padding: "6px 10px", fontSize: 14, borderRadius: 8 }} value={q.q} onChange={e => edit(q.id, e.target.value)} onBlur={() => setEditing(null)} onKeyDown={e => e.key === "Enter" && setEditing(null)} />
                  : <span className="grow" style={{ fontSize: 14, fontWeight: q.locked ? 700 : 500 }} onClick={() => !q.locked && setEditing(q.id)}>{q.q}</span>}
                {q.locked
                  ? <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-3)", textTransform: "uppercase" }}>Required</span>
                  : (q.custom
                    ? <button type="button" className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => removeQ(q.id)}><Icon name="close" size={14} /></button>
                    : <button type="button" onClick={() => setEditing(q.id)} style={{ color: "var(--ink-3)" }}><Icon name="sliders" size={15} /></button>)}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-full" onClick={addQ} style={{ marginTop: 12 }}>+ Add your own question</button>
        </div>
      </div>
    </div>
  );
}

function StepTiming({ timing, setTiming, details }: { timing: Timing; setTiming: (t: Timing) => void; details: Details }) {
  const opts = [
    { id: "before", title: "Match before the event", icon: "bolt", desc: "Everyone who signs up early gets their 3 matches ready the moment they walk in. Best when registration opens ahead of time." },
    { id: "during", title: "Match live, during the event", icon: "refresh", desc: "Matches generate as people arrive and keep improving as the room fills. Attendees can refresh anytime. Best for walk-in energy." },
  ];
  return (
    <div className="screen-enter">
      <div className="eyebrow">Step 4 · Timing</div>
      <h1 className="display" style={{ fontSize: 32, marginTop: 12, marginBottom: 6 }}>When should we match people?</h1>
      <p className="lead" style={{ fontSize: 15, marginBottom: 26 }}>You can always change this later from your dashboard.</p>
      <div className="col gap14">
        {opts.map(o => {
          const on = timing.mode === o.id;
          return (
            <button key={o.id} type="button" onClick={() => setTiming({ ...timing, mode: o.id })} className="row gap16" style={{ textAlign: "left", alignItems: "flex-start", padding: 22, borderRadius: 20, border: "1.5px solid " + (on ? "var(--accent)" : "var(--card-edge)"), background: on ? "color-mix(in srgb, var(--accent) 7%, var(--card))" : "var(--card)", transition: "all .16s" }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, flex: "0 0 auto", background: on ? "var(--accent)" : "var(--paper-2)", color: on ? "#fff" : "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={o.icon} size={22} /></span>
              <div className="grow">
                <div className="row between" style={{ alignItems: "center" }}>
                  <span className="display" style={{ fontSize: 19 }}>{o.title}</span>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid " + (on ? "var(--accent)" : "var(--card-edge)"), background: on ? "var(--accent)" : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{on && <Icon name="check" size={13} stroke={3} />}</span>
                </div>
                <p className="lead" style={{ fontSize: 14, marginTop: 6 }}>{o.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
      {timing.mode === "before" && (
        <div className="screen-enter panel" style={{ padding: 20, marginTop: 16 }}>
          <span className="field-label">Generate matches at</span>
          <input className="input" type="datetime-local" value={timing.when} onChange={e => setTiming({ ...timing, when: e.target.value })} style={{ marginTop: 8, maxWidth: 280 }} />
        </div>
      )}
    </div>
  );
}

function StepLive({ details, themeObj, onLaunch }: { details: Details; themeObj: typeof THEMES[0]; onLaunch: () => void }) {
  const slug = (details.title || "your-event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 22);
  return (
    <div className="screen-enter" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "20px 0 40px" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--forest)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pop .5s var(--pop)" }}><Icon name="check" size={32} stroke={3} /></div>
      <div className="eyebrow">You're live</div>
      <h1 className="display" style={{ fontSize: 34, marginTop: 12 }}>&ldquo;{details.title}&rdquo; is ready</h1>
      <p className="lead" style={{ fontSize: 15, marginTop: 12, marginBottom: 26 }}>Share the QR or link anywhere — screen, print, or the group chat. Matches start the moment people sign up.</p>
      <div className="panel" style={{ padding: 26, display: "inline-block" }}>
        <div style={{ display: "inline-block", padding: 16, background: "var(--paper-2)", borderRadius: 22 }}>
          <QrCode seed={slug} size={170} />
        </div>
        <div className="display" style={{ fontSize: 19, marginTop: 16 }}>nexmeet.app/e/{slug}</div>
        <div className="lead" style={{ fontSize: 13, marginTop: 4 }}>Scan to join · no login needed</div>
      </div>
      <div className="row gap10 center" style={{ marginTop: 26 }}>
        <button type="button" className="btn btn-ghost"><Icon name="copy" size={18} /> Copy link</button>
        <button type="button" className="btn btn-primary" onClick={onLaunch}><Icon name="grid" size={18} /> Open live dashboard</button>
      </div>
    </div>
  );
}

export default function OrganizerCreate({ defaults, applyTheme, onHome, onExit, onLaunch }: OrganizerCreateProps) {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>({
    title: defaults?.title || "",
    about: defaults?.about || "",
    type: defaults?.type || "hackathon",
    date: defaults?.date || "",
    venue: defaults?.venue || "",
    matchCount: defaults?.matchCount || "3",
  });
  const [theme, setTheme] = useState("ember");
  const [questions, setQuestions] = useState<Question[]>(baseQuestions("hackathon"));
  const [timing, setTiming] = useState<Timing>({ mode: "during", when: "" });

  useEffect(() => {
    if (step !== 1) return;
    const picked = TYPE_THEME[details.type] || "ember";
    const t = setTimeout(() => {
      setTheme(picked);
      setQuestions(baseQuestions(details.type));
      applyTheme(THEMES.find(x => x.id === picked));
      setStep(2);
    }, 2600);
    return () => clearTimeout(t);
  }, [step]);

  const set = (k: string, v: string) => setDetails(d => ({ ...d, [k]: v }));
  const detailsValid = details.title.trim() && details.about.trim() && details.date.trim() && details.venue.trim();
  const themeObj = THEMES.find(x => x.id === theme) || THEMES[0];

  const goBack = () => { if (step === 0) (onHome || onExit)(); else if (step === 2) setStep(0); else setStep(s => s - 1); };

  return (
    <div className="org screen-enter" style={{ display: "flex", flexDirection: "column", height: '100%' }}>


      {step !== 4 && (
        <div style={{ maxWidth: 1080, margin: "0 auto", width: "100%", padding: "22px 28px 0", flex: "0 0 auto" }}>
          <div className="row gap8" style={{ alignItems: "center" }}>
            {WIZARD_STEPS.slice(0, 4).map((s, i) => (
              <div key={s} style={{ display: "contents" }}>
                <div className="row gap8" style={{ alignItems: "center", opacity: i <= step ? 1 : .4 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 800, color: i < step ? "#fff" : (i === step ? "#fff" : "var(--ink-3)"), background: i <= step ? "var(--accent)" : "var(--card-edge)" }}>
                    {i < step ? <Icon name="check" size={14} stroke={3} /> : i + 1}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: i === step ? "var(--ink)" : "var(--ink-3)" }}>{s}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 2, background: i < step ? "var(--accent)" : "var(--card-edge)", borderRadius: 2, maxWidth: 80 }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grow" style={{ overflowY: "auto" }}>
        <div style={{ maxWidth: step === 0 ? 1080 : (step === 2 ? 980 : 680), margin: "0 auto", padding: "30px 28px 40px" }} key={step}>
          {step === 0 && <StepDetails details={details} set={set} />}
          {step === 1 && <StepGenerating details={details} />}
          {step === 2 && <StepReview details={details} themeObj={themeObj} themeId={theme} onTheme={(id) => { setTheme(id); applyTheme(THEMES.find(x => x.id === id)); }} questions={questions} setQuestions={setQuestions} />}
          {step === 3 && <StepTiming timing={timing} setTiming={setTiming} details={details} />}
          {step === 4 && <StepLive details={details} themeObj={themeObj} onLaunch={() => onLaunch(details)} />}
        </div>
      </div>

      {step !== 1 && step !== 4 && (
        <div style={{ borderTop: "1px solid var(--line)", flex: "0 0 auto", background: "var(--paper)" }}>
          <div style={{ maxWidth: step === 0 ? 1080 : (step === 2 ? 980 : 680), margin: "0 auto", padding: "16px 28px" }} className="row between">
            <button type="button" className="btn btn-ghost" onClick={goBack}><Icon name="back" size={18} /> Back</button>
            {step === 0 && <button type="button" className="btn btn-primary" disabled={!detailsValid} onClick={() => setStep(1)} style={{ opacity: detailsValid ? 1 : .4 }}><Icon name="spark" size={18} /> Generate with AI</button>}
            {step === 2 && <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Looks good <Icon name="arrow" size={18} /></button>}
            {step === 3 && <button type="button" className="btn btn-primary" onClick={() => setStep(4)}><Icon name="bolt" size={18} /> Launch event</button>}
          </div>
        </div>
      )}
    </div>
  );
}
