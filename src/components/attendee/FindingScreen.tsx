'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';

interface FindingScreenProps {
  you: { name: string };
  onDone: () => void;
}

export default function FindingScreen({ you, onDone }: FindingScreenProps) {
  return (
    <div className="scroll screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      {/* Top Bar */}
      <div style={{ padding: "16px 26px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>NexMeet AI</span>
        <Avatar name={you.name || "You"} color="var(--accent)" size={32} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px 60px", textAlign: "center" }}>
        
        {/* Animated Check */}
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
          You&apos;re registered!
        </h2>
        
        <p className="lead" style={{ marginTop: 14, fontSize: 16.5, maxWidth: 300, margin: "14px auto 0" }}>
          Go grab a drink and enjoy the event. We&apos;ll notify you when the organizer runs the matchmaking.
        </p>

        <div style={{ marginTop: 36, padding: "20px", background: "var(--card)", border: "1px solid var(--card-edge)", borderRadius: 20 }}>
          <div className="row gap12" style={{ alignItems: "center", justifyContent: "center", color: "var(--ink-2)", fontSize: 14.5, fontWeight: 600 }}>
            <span style={{ animation: "spin 3s linear infinite", display: "inline-block" }}>
              <Icon name="spark" size={18} />
            </span>
            Listening for matches…
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-3)" }}>
            You can safely close this page or keep it open. It will automatically update when your AI matches are ready.
          </div>
        </div>
      </div>

    </div>
  );
}
