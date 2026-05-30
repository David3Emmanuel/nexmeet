'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import AnalyticsPage from '@/components/organizer/AnalyticsPage';

export default function Page() {
  return (
    <AuthGuard>
      <OrganizerShell>
        <AnalyticsPage />
      </OrganizerShell>
    </AuthGuard>
  );
}
