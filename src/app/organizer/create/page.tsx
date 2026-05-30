'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import OrganizerCreate from '@/components/organizer/OrganizerCreate';

export default function CreateEventPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <OrganizerShell>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <OrganizerCreate
            defaults={{ title: '', about: '', type: 'hackathon' }}
            applyTheme={() => {}}
            onHome={() => router.push('/organizer')}
            onExit={() => router.push('/organizer')}
            onLaunch={(d) => {
              const slug = (d.title || 'my-event')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 22);
              router.push(`/organizer/dashboard/${slug}`);
            }}
          />
        </div>
      </OrganizerShell>
    </AuthGuard>
  );
}
