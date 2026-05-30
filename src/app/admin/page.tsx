'use client';

import { useEffect } from 'react';
import OrganizerDashboard from '@/components/organizer/OrganizerDashboard';

export default function AdminPage() {
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--paper)", overflow: "hidden" }}>
      <OrganizerDashboard
        onExit={() => window.location.href = "/"}
        onHome={() => window.location.href = "/organizer"}
        onNewEvent={() => window.location.href = "/organizer/create"}
      />
    </div>
  );
}
