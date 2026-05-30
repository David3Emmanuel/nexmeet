'use client';

import { useState } from 'react';
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, color-mix(in srgb, ${event.accent} 18%, transparent), transparent 70%)` }} />
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
            {event.type}
          </span>
        </div>

        {/* Hero */}
        <div className="anim-up" style={{ marginTop: 40, marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>You're invited</div>
          <h1 className="display" style={{ fontSize: 38, lineHeight: 1.1, marginBottom: 16 }}>
            {event.name}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-2)', fontSize: 15 }}>
              <Icon name="bolt" size={17} />
              <span>{event.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-2)', fontSize: 15 }}>
              <Icon name="location" size={17} />
              <span>{event.venue}</span>
            </div>
          </div>

          {/* Attendee count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {[0, 1, 2, 3].map(i => (
                <Avatar key={i} name={`P${i}`} color={AV[i % AV.length]} size={30}
                  style={{ marginLeft: i === 0 ? 0 : -10, border: '2px solid var(--paper)' }} />
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--ink)' }}>{event.attendeeCount}</strong> people already in the room
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
              background: event.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 20px color-mix(in srgb, ${event.accent} 38%, transparent)`,
            }}>
              <Icon name="spark" size={22} />
            </div>
            <div>
              <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>AI-powered matching</div>
              <p className="lead" style={{ fontSize: 14, lineHeight: 1.5 }}>
                Tell us about yourself in 2 minutes. The AI reads everyone in the room and finds your 3 best connections tonight.
              </p>
            </div>
          </div>

          <button
            id="find-my-people-btn"
            className="btn btn-primary btn-full"
            onClick={() => router.push(`/e/${event.slug}/join`)}
            style={{ background: event.accent, boxShadow: `0 8px 22px color-mix(in srgb, ${event.accent} 38%, transparent)` }}
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
              nexmeet.app/e/{event.slug}
            </div>
            <button style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="copy" size={14} /> Copy link
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
                  <p className="lead" style={{ fontSize: 14.5, lineHeight: 1.6, marginTop: 16 }}>{event.about}</p>
                  <div style={{ marginTop: 14, fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600 }}>
                    Organised by <span style={{ color: 'var(--ink)', fontWeight: 800 }}>{event.organizer}</span>
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
