'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import SettingsPage from '@/components/organizer/SettingsPage';

export default function Page() {
  return (
    <AuthGuard>
      <OrganizerShell>
        <SettingsPage />
      </OrganizerShell>
    </AuthGuard>
  );
}
