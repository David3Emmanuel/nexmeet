'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { markOnboarded } from '@/lib/auth-client';
import Icon from '@/components/ui/Icon';

const STEPS = [
  {
    id: 'welcome',
    eyebrow: 'Welcome to NexMeet',
    title: "You're in.",
    body: "NexMeet turns any gathering into a room where every person meets the right people. Let's show you around in 30 seconds.",
    cta: 'Show me',
  },
  {
    id: 'events',
    eyebrow: 'Your command centre',
    title: 'Manage all your events.',
    body: 'One place for every event you host — live, draft, or ended. Filter, open, and manage anything from the sidebar.',
    cta: 'Got it',
  },
  {
    id: 'create',
    eyebrow: 'Two minutes to live',
    title: 'Create an event with AI.',
    body: "Describe your event and NexMeet's AI drafts the sign-up form, picks a theme, and generates your QR code instantly.",
    cta: 'Nice',
  },
  {
    id: 'done',
    eyebrow: "You're all set",
    title: 'Ready to go live.',
    body: 'Share your link or QR code anywhere. Attendees join, AI matches them in seconds, and you watch connections happen in real time.',
    cta: 'Create my first event',
  },
];

/* ── Illustrations ─────────────────────────────────────────── */
function WelcomeIllus() {
  return (
    <svg viewBox="0 0 180 120" width="180" height="120">
      <circle cx="90" cy="60" r="44" fill="var(--accent)" opacity="0.1" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
      <circle cx="90" cy="60" r="28" fill="var(--accent)" opacity="0.18" />
      <circle cx="90" cy="60" r="16" fill="var(--accent)" />
      <text x="90" y="66" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="800">✦</text>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const x = 90 + 44 * Math.cos(r);
        const y = 60 + 44 * Math.sin(r);
        return (
          <circle key={i} cx={x} cy={y} r="5"
            fill={i % 2 === 0 ? 'var(--accent)' : 'var(--plum)'}
            style={{ animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite` }}
          />
        );
      })}
    </svg>
  );
}

function EventsIllus() {
  const colors = ['var(--coral)', 'var(--plum)', 'var(--forest)'];
  return (
    <svg viewBox="0 0 200 120" width="200" height="120">
      {[0, 1, 2].map(i => (
        <g key={i} style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
          <rect x={10} y={12 + i * 34} width={180} height={26} rx="8"
            fill="var(--card)" stroke="var(--card-edge)" strokeWidth="1" />
          <circle cx={26} cy={25 + i * 34} r="6" fill={colors[i]} />
          <rect x={40} y={21 + i * 34} width={90} height={5} rx="2.5" fill="var(--ink-3)" opacity="0.4" />
          <rect x={150} y={19 + i * 34} width={30} height={9} rx="4.5"
            fill={colors[i]} opacity="0.25" />
          <rect x={155} y={22 + i * 34} width={20} height={3} rx="1.5"
            fill={colors[i]} opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

function CreateIllus() {
  const cells = [
    true, true, false, true, true,
    true, false, true, false, true,
    false, true, true, true, false,
    true, false, false, true, true,
    true, true, false, true, false,
  ];
  return (
    <svg viewBox="0 0 180 120" width="180" height="120">
      <rect x="50" y="10" width="80" height="80" rx="12"
        fill="var(--paper-2)" stroke="var(--card-edge)" strokeWidth="1.5"
        style={{ animation: 'pop 0.4s var(--pop) both' }} />
      {cells.map((on, idx) => {
        const col = idx % 5;
        const row = Math.floor(idx / 5);
        return (
          <rect key={idx}
            x={58 + col * 13} y={18 + row * 13}
            width={10} height={10} rx="2"
            fill="var(--ink)" opacity={on ? 0.75 : 0.08}
            style={{ animation: `pop 0.3s var(--pop) ${idx * 0.02}s both` }}
          />
        );
      })}
      <text x="90" y="106" textAnchor="middle" fontSize="9"
        fill="var(--ink-3)" fontWeight="700" letterSpacing="0.04em">
        nexmeet.app/event
      </text>
    </svg>
  );
}

function DoneIllus() {
  const nodes = [
    { x: 90, y: 40, main: true },
    { x: 35, y: 80 }, { x: 145, y: 80 },
    { x: 58, y: 108 }, { x: 122, y: 108 },
  ];
  return (
    <svg viewBox="0 0 180 125" width="180" height="125">
      {nodes.slice(1).map((n, i) => (
        <line key={i}
          x1={nodes[0].x} y1={nodes[0].y} x2={n.x} y2={n.y}
          stroke="var(--accent)" strokeWidth="2" opacity="0.35"
          strokeDasharray="80" strokeDashoffset="80"
          style={{ animation: `dash 0.5s ease ${0.3 + i * 0.1}s forwards` }}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i} style={{ animation: `pop 0.4s var(--pop) ${i * 0.07}s both` }}>
          <circle cx={n.x} cy={n.y} r={n.main ? 18 : 12}
            fill={n.main ? 'var(--accent)' : 'var(--plum)'} opacity={n.main ? 1 : 0.75} />
          {n.main && (
            <text x={n.x} y={n.y + 6} textAnchor="middle" fontSize="14" fill="#fff" fontWeight="800">✦</text>
          )}
        </g>
      ))}
    </svg>
  );
}

const ILLUSTRATIONS = [WelcomeIllus, EventsIllus, CreateIllus, DoneIllus];

interface OnboardingTourProps {
  onDone: () => void;
}

export default function OnboardingTour({ onDone }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Illustration = ILLUSTRATIONS[step];

  const dismiss = (goCreate = false) => {
    markOnboarded();
    setVisible(false);
    // Wait for exit animation, then call onDone
    setTimeout(() => {
      onDone();
      if (goCreate && typeof window !== 'undefined') {
        window.location.href = '/organizer/create';
      }
    }, 280);
  };

  const advance = () => {
    if (isLast) {
      dismiss(true);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="tour-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(10, 8, 5, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            key="tour-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-edge)',
              borderRadius: 28,
              padding: '36px 32px 28px',
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
              position: 'relative',
            }}
          >
            {/* Skip */}
            <button
              id="tour-skip"
              onClick={() => dismiss()}
              style={{
                position: 'absolute', top: 16, right: 16,
                fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)',
                padding: '5px 12px', borderRadius: 999,
                background: 'var(--paper-2)',
                border: '1px solid var(--card-edge)',
              }}
            >
              Skip
            </button>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 28 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  height: 3, borderRadius: 999,
                  flex: i === step ? 2 : 1,
                  background: i <= step ? 'var(--accent)' : 'var(--card-edge)',
                  transition: 'flex 0.35s ease, background 0.2s',
                }} />
              ))}
            </div>

            {/* Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, minHeight: 120 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.22 }}
                >
                  <Illustration />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${step}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
              >
                <div className="eyebrow" style={{ marginBottom: 8 }}>{current.eyebrow}</div>
                <h2 className="display" style={{ fontSize: 26, marginBottom: 10 }}>{current.title}</h2>
                <p className="lead" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{current.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* CTA + step counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700 }}>
                {step + 1} / {STEPS.length}
              </span>
              <button
                id={`tour-cta-${step}`}
                className="btn btn-primary"
                onClick={advance}
                style={{ minHeight: 46, fontSize: 15 }}
              >
                {isLast ? (
                  <><Icon name="spark" size={17} /> {current.cta}</>
                ) : (
                  <>{current.cta} <Icon name="arrow" size={17} /></>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
