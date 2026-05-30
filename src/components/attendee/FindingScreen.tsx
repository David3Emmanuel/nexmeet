'use client';

import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';

interface FindingScreenProps {
  you: { name: string };
  onDone: () => void;
  onRestart?: () => void;
}

export default function FindingScreen({ you, onDone, onRestart }: FindingScreenProps) {
  return (
    <div className="scroll screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px 60px", textAlign: "center", marginTop: 40 }}>
        
        {/* Simple Clean Check */}
        <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 30px" }}>
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
            animation: "pulse 2s infinite"
          }} />
          <div style={{
            position: "absolute", inset: 10,
            borderRadius: "50%", background: "var(--accent)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 30px color-mix(in srgb, var(--accent) 40%, transparent)",
          }}>
            <Icon name="check" size={40} />
          </div>
        </div>

        <h2 className="display" style={{ fontSize: 32, lineHeight: 1.1 }}>
          You&apos;re all set.
        </h2>
        
        <p className="lead" style={{ marginTop: 14, fontSize: 16.5, maxWidth: 300, margin: "14px auto 0" }}>
          Enjoy the event! We&apos;ll notify you as soon as your connections are ready.
        </p>

        {/* Clean minimal indicator */}
        <div style={{ marginTop: 36, padding: "20px", background: "var(--card)", border: "1px solid var(--card-edge)", borderRadius: 20 }}>
          <div className="row gap12" style={{ alignItems: "center", justifyContent: "center", color: "var(--ink-2)", fontSize: 14.5, fontWeight: 600 }}>
            <span style={{ animation: "pulse 2s infinite", display: "inline-block" }}>
              <Icon name="spark" size={18} />
            </span>
            Analyzing profiles...
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-3)" }}>
            Feel free to close this page. We&apos;ll let you know when it&apos;s done.
          </div>
        </div>

        {onRestart && (
          <button onClick={onRestart} style={{ marginTop: 32, fontSize: 13.5, fontWeight: 600, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
            Register another person
          </button>
        )}
      </div>

    </div>
  );
}
