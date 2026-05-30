'use client';

import { useState, useEffect } from 'react';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { SEED, YouProfile } from '@/lib/data';

interface FindingScreenProps {
  you: YouProfile;
  onDone: () => void;
}

const MSGS = [
  "Reading the room…",
  "Scanning 47 profiles…",
  "Matching on what you're looking for…",
  "Writing your reasons…",
  "Almost there…",
];

export default function FindingScreen({ you, onDone }: FindingScreenProps) {
  const [mi, setMi] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMi(m => Math.min(m + 1, MSGS.length - 1)), 620);
    const t = setTimeout(onDone, 3300);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [onDone]);

  return (
    <div className="scroll screen-enter" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "30px 30px 60px" }}>
      <div style={{ position: "relative", width: 220, height: 220, marginBottom: 36 }}>
        <div style={{ position: "absolute", inset: 0, animation: "orbit 8s linear infinite" }}>
          {SEED.slice(0, 6).map((p, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <div key={p.id} style={{ position: "absolute", left: 110 + Math.cos(a) * 95 - 21, top: 110 + Math.sin(a) * 95 - 21, animation: `pulse ${1.6 + i * .2}s ease-in-out infinite` }}>
                <Avatar name={p.name} color={p.color} size={42} />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 92, height: 92, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 45%, transparent)", animation: "float 3s ease-in-out infinite" }}>
          <div style={{ color: "#fff" }}><Icon name="spark" size={40} /></div>
        </div>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", border: "2px dashed var(--card-edge)", animation: "orbit 14s linear infinite reverse" }} />
      </div>
      <h2 className="display" style={{ fontSize: 30 }}>Finding your people</h2>
      <p className="lead" style={{ marginTop: 12, fontSize: 16, minHeight: 24, transition: "opacity .3s" }} key={mi}>
        <span className="screen-enter">{MSGS[mi]}</span>
      </p>
    </div>
  );
}
