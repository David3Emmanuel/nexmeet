'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import PhoneShell from '@/components/PhoneShell';
import CoverScreen from '@/components/attendee/CoverScreen';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: '01',
    icon: 'bolt',
    title: 'Host creates the event',
    body: 'Sign in with your email, describe your event, and NexMeet AI drafts your sign-up form and theme in seconds.',
    accent: 'var(--coral)',
  },
  {
    num: '02',
    icon: 'users',
    title: 'Attendees scan & fill in',
    body: 'One QR code on screen. Attendees scan it, fill a 2-minute form on their phone — no app, no account.',
    accent: 'var(--plum)',
  },
  {
    num: '03',
    icon: 'spark',
    title: 'AI finds their best matches',
    body: 'The AI reads every profile in the room and gives each person the exact connections they can\'t afford to miss — with a conversation starter.',
    accent: 'var(--forest)',
  },
];

const FAQS = [
  { q: 'Do attendees need to create an account?', a: 'Nope. Attendees just scan the QR code, fill a 2-minute form, and get their matches. Completely anonymous.' },
  { q: 'How does the AI matching work?', a: 'NexMeet reads everyone\'s goals, skills, and context, then scores every possible pairing. The top 3 matches for each person come with a reason and a conversation starter.' },
  { q: 'Can I customise the sign-up form?', a: 'Yes — after the AI drafts your form, you can toggle questions on/off, rename them, or add your own before going live.' },
  { q: 'What types of events work best?', a: 'Hackathons, conferences, career fairs, community meetups, demo days — anything where the right conversation matters.' },
];

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroEmail, setHeroEmail] = useState('');

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroEmail.trim()) {
      router.push(`/auth?email=${encodeURIComponent(heroEmail.trim())}`);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text entrance
      gsap.from('.hero-word', {
        opacity: 0, y: 40, stagger: 0.08, duration: 0.7,
        ease: 'power3.out', delay: 0.15,
      });
      // Orbs float
      gsap.to('.land-orb', {
        y: -20, duration: 4, yoyo: true, repeat: -1,
        ease: 'sine.inOut', stagger: 1.5,
      });
      // Steps scroll
      gsap.from('.step-card', {
        scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' },
        opacity: 0, y: 50, stagger: 0.14, duration: 0.6, ease: 'power2.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ background: 'var(--paper)', overflowX: 'hidden' }}>
      {/* ─── Navbar ─── */}
      <nav style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(to bottom, rgba(18, 15, 12, 0.7) 0%, transparent 100%)',
        padding: '0 clamp(20px, 5vw, 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 76,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Logo size={34} dark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              id="nav-signin"
              className="btn nav-signin-btn"
              onClick={() => router.push('/auth')}
              style={{ fontWeight: 700, minHeight: 44, paddingInline: 22, fontSize: 15 }}
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(96px, 12vw, 130px) clamp(16px, 4vw, 40px) 48px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#120F0C',
      }}>
        {/* Background Image with Netflix-style Gradient Overlay */}
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
        <div className="land-orb" style={{ position: 'absolute', top: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />
        <div className="land-orb" style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--plum) 18%, transparent), transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />
        <div className="land-orb" style={{ position: 'absolute', top: '40%', left: '10%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--forest) 12%, transparent), transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, width: '100%' }}>
          <h1 className="display hero-word" style={{ fontSize: 'clamp(34px, 5.2vw, 56px)', lineHeight: 1.15, marginBottom: 16, color: '#ffffff' }}>
            AI-powered <span style={{ color: 'var(--accent)' }}>networking</span><br />for events and more
          </h1>

          <p className="lead hero-word" style={{ fontSize: 'clamp(17px, 2.4vw, 21px)', maxWidth: 580, margin: '0 auto 24px', lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.85)' }}>
            Set up in 2 minutes. Go live instantly.
          </p>

          <div className="hero-word" style={{ maxWidth: 580, margin: '0 auto' }}>
            <p style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.65)', fontWeight: 700, marginBottom: 12 }}>
              Ready to connect? Enter your email to create your room.
            </p>
            <form onSubmit={handleGetStarted} className="hero-email-form">
              <input
                type="email"
                placeholder="Email address"
                value={heroEmail}
                onChange={e => setHeroEmail(e.target.value)}
                required
                className="hero-email-input"
              />
              <button
                type="submit"
                className="hero-get-started-btn"
              >
                Get Started <Icon name="arrow" size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" ref={stepsRef} style={{ padding: 'clamp(36px, 5vw, 64px) clamp(20px, 5vw, 80px) clamp(56px, 7vw, 90px)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 8, fontSize: 12 }}>How it works</div>
          <h2 className="display" style={{ fontSize: 'clamp(34px, 5.5vw, 54px)', lineHeight: 1.15 }}>From idea to live in 3 steps</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28, alignItems: 'stretch' }}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="step-card landing-step-card"
              style={{ '--step-accent': s.accent } as React.CSSProperties}
            >
              {/* Pill badge in the top-right */}
              <div style={{
                position: 'absolute',
                top: 24,
                right: 24,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: 'var(--step-accent)',
                background: 'color-mix(in srgb, var(--step-accent) 12%, transparent)',
                padding: '4px 10px',
                borderRadius: 999,
                textTransform: 'uppercase',
              }}>
                Step {s.num}
              </div>

              {/* Icon Container */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'color-mix(in srgb, var(--step-accent) 10%, var(--card))',
                border: '1.5px solid color-mix(in srgb, var(--step-accent) 20%, var(--card-edge))',
                color: 'var(--step-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Icon name={s.icon} size={22} />
              </div>

              {/* Title & Body */}
              <h3 className="display" style={{ fontSize: 23, marginBottom: 12, fontWeight: 800, color: 'var(--ink)' }}>{s.title}</h3>
              <p className="lead" style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Demo section ─── */}
      <section className="demo-section">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8, fontSize: 12 }}>Attendee experience</div>
            <h2 className="display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.15, marginBottom: 16 }}>
              What your attendees see
            </h2>
            <p className="lead" style={{ fontSize: 17, lineHeight: 1.6, marginBottom: 28 }}>
              A clean, fast, mobile-first flow. Attendees fill a quick form, see a loader as the AI thinks, then get their best personalised match cards with a conversation starter for each.
            </p>
            <button className="btn btn-primary" onClick={() => router.push('/auth')}>
              <Icon name="spark" size={18} /> Host your first event
            </button>
          </div>

          {/* Phone shell — this is the ONE place PhoneShell is used */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="demo-phone-container">
              <div className="demo-phone-scaler">
                <PhoneShell>
                  <CoverScreen onStart={() => {}} onOrganizer={() => {}} />
                </PhoneShell>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: 'clamp(36px, 5vw, 64px) clamp(20px, 5vw, 80px)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 8, fontSize: 12 }}>Questions</div>
          <h2 className="display" style={{ fontSize: 'clamp(32px, 4.5vw, 46px)', lineHeight: 1.15 }}>Frequently asked</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--card-edge)', borderRadius: 16, overflow: 'hidden' }}>
              <button
                id={`faq-${i}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 22px', fontWeight: 700, fontSize: 15.5, textAlign: 'left',
                }}
              >
                {faq.q}
                <span style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--ink-3)', flexShrink: 0, marginLeft: 12 }}>
                  <Icon name="arrow" size={18} />
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 22px 20px', borderTop: '1px solid var(--line)' }}>
                  <p className="lead" style={{ fontSize: 15, lineHeight: 1.65, paddingTop: 14 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={{
        padding: 'clamp(40px, 6vw, 68px) clamp(20px, 5vw, 80px)',
        background: 'var(--ink)',
        color: 'var(--paper)',
        textAlign: 'center',
      }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12, fontSize: 12 }}>Ready?</div>
        <h2 className="display" style={{ fontSize: 'clamp(36px, 5.5vw, 60px)', lineHeight: 1.15, color: 'var(--paper)', marginBottom: 16 }}>
          Your next great connection<br />is in this room.
        </h2>
        <p style={{ fontSize: 18, fontWeight: 600, opacity: 0.65, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
          Set up your room in 2 minutes. Go live instantly.
        </p>
        <form onSubmit={handleGetStarted} className="hero-email-form" style={{ maxWidth: 480, margin: '0 auto' }}>
          <input
            type="email"
            placeholder="Email address"
            value={heroEmail}
            onChange={e => setHeroEmail(e.target.value)}
            required
            className="hero-email-input"
          />
          <button
            type="submit"
            className="hero-get-started-btn"
          >
            Get Started <Icon name="arrow" size={18} />
          </button>
        </form>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,.06)',
        background: 'var(--ink)',
        padding: 'clamp(24px, 3vw, 36px) clamp(20px, 5vw, 80px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <Logo size={17} dark />
        <div style={{ display: 'flex', gap: 24, fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', flexWrap: 'wrap' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>
          © 2026 NexMeet
        </span>
      </footer>
    </div>
  );
}
