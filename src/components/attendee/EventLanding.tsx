'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import QrCode from '@/components/ui/QrCode';
import Avatar from '@/components/ui/Avatar';
import { AV } from '@/lib/data';

interface EventData {
  slug: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  organizer: string;
  about: string;
  attendeeCount: number;
  accent: string;
}

export default function EventLanding({ event }: { event: EventData }) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [localEvent, setLocalEvent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`nexmeet:event:${event.slug}`);
    if (saved) {
      try { setLocalEvent(JSON.parse(saved)); } catch (e) {}
    }
  }, [event.slug]);

  const displayEvent = localEvent || event;
  const dbTheme = displayEvent.theme || {};
  
  const bg = dbTheme.background || dbTheme.paper;
  const fg = dbTheme.foreground || dbTheme.ink;
  
  const themeStyle = {
    ...(dbTheme.accent ? { '--accent': dbTheme.accent } : {}),
    ...(bg ? { '--paper': bg, '--paper-2': `color-mix(in srgb, ${bg} 95%, ${fg || '#000'})`, '--card': bg, '--card-edge': `color-mix(in srgb, ${bg} 90%, ${fg || '#000'})` } : {}),
    ...(fg ? { '--ink': fg, '--ink-2': `color-mix(in srgb, ${fg} 80%, ${bg || '#fff'})`, '--ink-3': `color-mix(in srgb, ${fg} 50%, ${bg || '#fff'})` } : {}),
    ...(dbTheme.fontFamily ? { fontFamily: dbTheme.fontFamily } : (dbTheme.font === 'Outfit' ? { fontFamily: 'var(--font-outfit), sans-serif' } : {})),
  } as React.CSSProperties;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      ...themeStyle,
    }}>
      {/* Gradient blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--plum) 10%, transparent), transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {/* Sticky Nav Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'color-mix(in srgb, var(--paper) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          margin: '0 -20px',
          borderBottom: '1px solid var(--line)',
          zIndex: 100,
        }}>
          <Logo size={20} />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', background: 'var(--paper-2)', padding: '5px 12px', borderRadius: 999, border: '1px solid var(--card-edge)' }}>
            {displayEvent.type}
          </span>
        </div>

        {/* Custom Flyer */}
        {displayEvent.flyer && (
          <div className="anim-up" style={{ marginTop: 24, borderRadius: 24, overflow: 'hidden', border: '1px solid var(--card-edge)', background: 'var(--paper-2)', display: 'flex', justifyContent: 'center' }}>
            <img src={displayEvent.flyer} alt="Event flyer" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain', display: 'block' }} />
          </div>
        )}

        {/* Hero */}
        <div className="anim-up" style={{ marginTop: displayEvent.flyer ? 24 : 40, marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>You're invited</div>
          <h1 className="display" style={{ fontSize: 38, lineHeight: 1.1, marginBottom: 16 }}>
            {displayEvent.title || displayEvent.name}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {(displayEvent.date || event.date) && (displayEvent.date !== 'TBA' && event.date !== 'TBA') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-2)', fontSize: 15 }}>
                <Icon name="bolt" size={17} />
                <span>{displayEvent.date || event.date}</span>
              </div>
            )}
            {(displayEvent.venue || event.venue) && (displayEvent.venue !== 'TBA' && event.venue !== 'TBA') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-2)', fontSize: 15 }}>
                <Icon name="location" size={17} />
                <span>{displayEvent.venue || event.venue}</span>
              </div>
            )}
          </div>

          {/* Attendee count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {Array.from({ length: Math.min((displayEvent.attendeeCount || event.attendeeCount || 0), 4) }).map((_, i) => (
                <Avatar key={i} name={`P${i}`} color={AV[i % AV.length]} size={30}
                  style={{ marginLeft: i === 0 ? 0 : -10, border: '2px solid var(--paper)' }} />
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>
              {(displayEvent.attendeeCount || event.attendeeCount || 0) > 0 ? (
                <>
                  <strong style={{ color: 'var(--ink)' }}>{displayEvent.attendeeCount || event.attendeeCount}</strong> people already in the room
                </>
              ) : (
                "Be the first to join the room!"
              )}
            </span>
          </div>
        </div>

        {/* Main CTA card */}
        <div className="anim-up d2" style={{
          background: 'var(--card)',
          border: '1px solid var(--card-edge)',
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 16,
        }}>
          {/* NexMeet value prop */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: `0 8px 20px color-mix(in srgb, var(--accent) 38%, transparent)`,
            }}>
              <Icon name="spark" size={22} />
            </div>
            <div>
              <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>AI-powered matching</div>
              <p className="lead" style={{ fontSize: 14, lineHeight: 1.5 }}>
                Tell us about yourself in 2 minutes. The AI reads everyone in the room and finds your best connections tonight.
              </p>
            </div>
          </div>

          <button
            id="find-my-people-btn"
            className="btn btn-primary btn-full"
            onClick={() => router.push(`/e/${event.slug}/join`)}
            style={{ background: 'var(--accent)', boxShadow: `0 8px 22px color-mix(in srgb, var(--accent) 38%, transparent)` }}
          >
            Find my people <Icon name="arrow" size={20} />
          </button>
          <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, color: 'var(--ink-3)' }}>
            Anonymous · No account needed · 2 minutes
          </p>
        </div>

        {/* QR code */}
        <div className="anim-up d3" style={{
          background: 'var(--card)',
          border: '1px solid var(--card-edge)',
          borderRadius: 20,
          padding: '20px 24px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}>
          <div style={{ background: 'var(--paper-2)', borderRadius: 12, padding: 10, flexShrink: 0 }}>
            <QrCode seed={event.slug} size={72} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Share this event</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', wordBreak: 'break-all' }}>
              {typeof window !== 'undefined' ? window.location.host : 'nexmeet.app'}/e/{event.slug}
            </div>
            <button 
              onClick={() => {
                const host = typeof window !== 'undefined' ? window.location.origin : 'https://nexmeet.app';
                navigator.clipboard.writeText(`${host}/e/${event.slug}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: copied ? 'var(--forest)' : 'var(--accent)', display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Icon name={copied ? "check" : "copy"} size={14} /> {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>

        {/* Event details accordion */}
        <div className="anim-up d4" style={{
          background: 'var(--card)',
          border: '1px solid var(--card-edge)',
          borderRadius: 20,
          marginBottom: 40,
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setDetailsOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 22px', fontWeight: 700, fontSize: 15,
            }}
          >
            About this event
            <span style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--ink-3)' }}>
              <Icon name="arrow" size={16} />
            </span>
          </button>
          <AnimatePresence>
            {detailsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0 22px 22px', borderTop: '1px solid var(--line)' }}>
                  <p className="lead" style={{ fontSize: 14.5, lineHeight: 1.6, marginTop: 16 }}>{displayEvent.about || event.about}</p>
                  <div style={{ marginTop: 14, fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600 }}>
                    Organised by <span style={{ color: 'var(--ink)', fontWeight: 800 }}>{displayEvent.organizer || event.organizer || 'Host'}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
