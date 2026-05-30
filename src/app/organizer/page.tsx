'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import OrganizerShell from '@/components/organizer/OrganizerShell';
import EventsPage from '@/components/organizer/EventsPage';
import OnboardingTour from '@/components/organizer/OnboardingTour';

function OrganizerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const param = searchParams.get('onboarding');
    // Only auto-trigger when coming from auth (?onboarding=true).
    // isNewUser() alone is removed as trigger — dev page reloads
    // without auth would keep showing the tour otherwise.
    if (param === 'true') {
      setShowTour(true);
    }
  }, [searchParams]);

  const handleTourDone = () => {
    setShowTour(false);
    // Clean up the query param without a full navigation
    router.replace('/organizer');
  };

  return (
    <>
      <OrganizerShell>
        <EventsPage />
      </OrganizerShell>
      {showTour && <OnboardingTour onDone={handleTourDone} />}
    </>
  );
}

export default function OrganizerPage() {
  return (
    <AuthGuard>
      <Suspense>
        <OrganizerContent />
      </Suspense>
    </AuthGuard>
  );
}
