'use client';

import OrganizerHome from '@/components/organizer/OrganizerHome';

export default function OrganizerPage() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--paper)", overflow: "hidden" }}>
      <OrganizerHome
        onCreate={() => { window.location.href = "/organizer/create"; }}
        onOpenEvent={() => { window.location.href = "/admin"; }}
        onExit={() => { window.location.href = "/"; }}
      />
    </div>
  );
}
