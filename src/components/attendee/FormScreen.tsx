'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { GOALS, SKILL_BANK, YouProfile } from '@/lib/data';

interface FormScreenProps {
  initial: YouProfile;
  onBack: () => void;
  onSubmit: (profile: YouProfile) => void;
}

const STEPS = [
  { key: "name", title: "First, who are you?", hint: "The name people will look for.", type: "text", ph: "e.g. Moni Adeleke", label: "Your name" },
  { key: "role", title: "What do you do?", hint: "Role, company, or school — keep it short.", type: "text", ph: "e.g. Solo founder building an AI study tool", label: "Your one-liner" },
  { key: "skills", title: "What are you great at?", hint: "Pick up to three.", type: "skills", label: "Your top skills" },
  { key: "focus", title: "What are you building?", hint: "What's got your attention right now.", type: "textarea", ph: "Right now I'm focused on…", label: "Current focus" },
  { key: "goal", title: "What do you want tonight?", hint: "This is what we match on hardest.", type: "goal", label: "Looking for" },
  { key: "fun", title: "One fun fact.", hint: "The thing that makes you, you. Great icebreaker fuel.", type: "textarea", ph: "Something unexpected about you…", label: "Fun fact" },
];

export default function FormScreen({ initial, onBack, onSubmit }: FormScreenProps) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<YouProfile>(initial);
  const cur = STEPS[step];
  const total = STEPS.length;
  const val = d[cur.key as keyof YouProfile];
  const valid = cur.type === "skills" ? (Array.isArray(val) && val.length > 0) : (val && String(val).trim().length > 0);

  const set = (v: string | string[]) => setD({ ...d, [cur.key]: v });

  const toggleSkill = (s: string) => {
    const arr = d.skills || [];
    if (arr.includes(s)) set(arr.filter(x => x !== s));
    else if (arr.length < 3) set([...arr, s]);
  };

  const next = () => { if (step < total - 1) setStep(step + 1); else onSubmit(d); };
  const back = () => { if (step === 0) onBack(); else setStep(step - 1); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "4px 22px 0" }}>
        <div className="row gap12" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={back}><Icon name="back" size={20} /></button>
          <div className="progress-track grow">
            <div className="progress-fill" style={{ width: ((step + 1) / total * 100) + "%" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-3)", minWidth: 34, textAlign: "right" }}>{step + 1}/{total}</span>
        </div>
      </div>

      <div className="scroll" style={{ padding: "30px 26px 10px" }} key={step}>
        <div className="screen-enter">
          <div className="eyebrow">Step {step + 1}</div>
          <h2 className="display" style={{ fontSize: 33, marginTop: 10, lineHeight: 1.04 }}>{cur.title}</h2>
          <p className="lead" style={{ fontSize: 15, marginTop: 14, marginBottom: 26 }}>{cur.hint}</p>

          {cur.type === "text" && (
            <input
              className="input"
              autoFocus
              placeholder={cur.ph}
              value={(val as string) || ""}
              onChange={e => set(e.target.value)}
              onKeyDown={e => e.key === "Enter" && valid && next()}
            />
          )}
          {cur.type === "textarea" && (
            <textarea
              className="textarea"
              autoFocus
              rows={4}
              placeholder={cur.ph}
              value={(val as string) || ""}
              onChange={e => set(e.target.value)}
            />
          )}
          {cur.type === "skills" && (
            <div className="row wrap gap10">
              {SKILL_BANK.map(s => {
                const on = (d.skills || []).includes(s);
                return (
                  <button key={s} className={"chip" + (on ? " on accent" : "")} onClick={() => toggleSkill(s)}>
                    {on && <Icon name="check" size={14} />}{s}
                  </button>
                );
              })}
            </div>
          )}
          {cur.type === "goal" && (
            <div className="col gap10">
              {GOALS.map(g => {
                const on = d.goal === g.id;
                return (
                  <button
                    key={g.id}
                    className="row between"
                    onClick={() => set(g.id)}
                    style={{
                      textAlign: "left", padding: "16px 18px", borderRadius: 16,
                      border: "1.5px solid " + (on ? "var(--accent)" : "var(--card-edge)"),
                      background: on ? "color-mix(in srgb, var(--accent) 10%, var(--card))" : "var(--card)",
                      transition: "all .16s", alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{g.label}</span>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid " + (on ? "var(--accent)" : "var(--card-edge)"), display: "flex", alignItems: "center", justifyContent: "center", background: on ? "var(--accent)" : "transparent", color: "#fff" }}>
                      {on && <Icon name="check" size={13} stroke={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "12px 26px 26px", background: "linear-gradient(transparent, var(--paper) 26%)" }}>
        <button
          className="btn btn-primary btn-full"
          disabled={!valid}
          onClick={next}
          style={{ opacity: valid ? 1 : .4, transition: "opacity .2s" }}
        >
          {step < total - 1
            ? <>Continue <Icon name="arrow" size={19} /></>
            : <>See my matches <Icon name="spark" size={19} /></>}
        </button>
      </div>
    </div>
  );
}
