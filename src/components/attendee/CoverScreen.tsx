'use client';

import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import QrCode from '@/components/ui/QrCode';
import { EVENT } from '@/lib/data';

interface CoverScreenProps {
  onStart: () => void;
  onOrganizer: () => void;
}

export default function CoverScreen({ onStart, onOrganizer }: CoverScreenProps) {
  return (
    <div className="scroll screen-enter" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 26px 0" }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <Logo size={21} />
          <button className="chip" onClick={onOrganizer} style={{ padding: "8px 13px", fontSize: 12.5 }}>
            <Icon name="grid" size={15} /> Organizer
          </button>
        </div>
      </div>

      <div style={{ padding: "48px 26px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="eyebrow anim-up">You're in the room · live now</div>
        <h1 className="display anim-up d1" style={{ fontSize: 44, marginTop: 14, lineHeight: 1.05 }}>
          Meet the<br />right people.<br /><span style={{ color: "var(--accent)" }}>Every time.</span>
        </h1>
        <p className="lead anim-up d2" style={{ fontSize: 17, marginTop: 18, maxWidth: 320 }}>
          Tell us about you in two minutes. Our AI reads everyone in the room and hands you the three people you can't afford to miss tonight.
        </p>

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

      <div style={{ padding: "16px 26px 26px", background: "linear-gradient(transparent, var(--paper) 30%)" }}>
        <button className="btn btn-primary btn-full" onClick={onStart}>
          Find my people <Icon name="arrow" size={20} />
        </button>
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>
          No login. No password. 2 minutes, tops.
        </p>
      </div>
    </div>
  );
}
