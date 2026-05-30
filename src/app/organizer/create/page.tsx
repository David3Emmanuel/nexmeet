'use client';

import { useEffect } from 'react';
import OrganizerCreate from '@/components/organizer/OrganizerCreate';

export default function OrganizerCreatePage() {
  const applyTheme = (th?: { accent: string; font: string }) => {
    if (!th) return;
    document.documentElement.style.setProperty("--accent", th.accent);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--paper)", overflow: "hidden" }}>
      <OrganizerCreate
        defaults={{ title: "", about: "", type: "hackathon" }}
        applyTheme={applyTheme}
        onHome={() => { window.location.href = "/organizer"; }}
        onExit={() => { window.location.href = "/"; }}
        onLaunch={() => { window.location.href = "/admin"; }}
      />
    </div>
  );
}
