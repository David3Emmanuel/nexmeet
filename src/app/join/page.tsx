'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';

export default function JoinPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleJoinEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    try {
      const res = await fetch(`/api/events/resolve?code=${encodeURIComponent(joinCode.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Event not found');
      router.push(`/e/${data.slug}`);
    } catch (err: any) {
      setJoinError(err.message || 'Invalid code');
      setIsJoining(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      backgroundColor: '#120F0C',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Image with Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(to bottom, rgba(18, 15, 12, 0.6) 0%, rgba(18, 15, 12, 0.75) 60%, rgba(18, 15, 12, 0.95) 100%), url("/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--plum) 10%, transparent), transparent 70%)', animation: 'float 10s ease-in-out infinite 2s' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <Logo size={24} dark />
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--card-edge)',
          borderRadius: 28,
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 13.5, fontWeight: 700, marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Icon name="back" size={16} /> Home
          </button>

          <div className="eyebrow" style={{ marginBottom: 8 }}>Ready to connect?</div>
          <h1 className="display" style={{ fontSize: 28, marginBottom: 8 }}>Join an event</h1>
          <p className="lead" style={{ fontSize: 15, marginBottom: 28 }}>
            Enter the 4-letter code provided by your event organizer to get started.
          </p>

          <form onSubmit={handleJoinEvent}>
            <label className="field" style={{ marginBottom: 8 }}>
              <span className="field-label">Event code</span>
              <input
                ref={inputRef}
                className="input"
                type="text"
                placeholder="e.g. X8M2"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value); setJoinError(''); }}
                style={{ marginTop: 8, textTransform: 'uppercase' }}
                maxLength={10}
              />
            </label>
            {joinError && (
              <p style={{ color: '#E0356B', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{joinError}</p>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: 16 }}
              disabled={isJoining}
            >
              {isJoining ? (
                <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              ) : (
                <>Join event <Icon name="arrow" size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
