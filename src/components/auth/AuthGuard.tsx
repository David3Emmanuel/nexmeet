'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) {
          setStatus('authed');
        } else {
          setStatus('unauthed');
          router.replace('/auth');
        }
      })
      .catch(() => {
        setStatus('unauthed');
        router.replace('/auth');
      });
  }, [router]);

  // Show a subtle spinner while checking — avoids blank page on back navigation
  if (status === 'loading') {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--paper)',
      }}>
        <div style={{
          width: 28, height: 28,
          border: '3px solid var(--card-edge)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
        }} />
      </div>
    );
  }

  if (status === 'unauthed') return null;
  return <>{children}</>;
}
