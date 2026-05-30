'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOtp, verifyOtp, setSession, isNewUser } from '@/lib/auth';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';

type Step = 'email' | 'otp';

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function AuthFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [otpErr, setOtpErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('email');
      if (urlEmail) {
        setEmail(urlEmail);
      }
    }
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { setEmailErr('Enter a valid email address'); return; }
    setEmailErr('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate latency
    sendOtp(email);
    setLoading(false);
    setStep('otp');
    setResendTimer(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 80);
  };

  const handleDigitChange = (i: number, val: string) => {
    // Handle paste
    if (val.length > 1) {
      const clean = val.replace(/\D/g, '').slice(0, 5);
      const next = [...digits];
      clean.split('').forEach((c, idx) => { if (idx < 5) next[idx] = c; });
      setDigits(next);
      inputRefs.current[Math.min(clean.length, 4)]?.focus();
      return;
    }
    const clean = val.replace(/\D/g, '');
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 4) inputRefs.current[i + 1]?.focus();
  };

  const handleDigitKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 5) { setOtpErr('Enter the full 5-digit code'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (!verifyOtp(email, code)) {
      setOtpErr('That code doesn\'t match. Double-check or request a new one.');
      setLoading(false);
      return;
    }
    const firstTime = isNewUser();
    setSession(email);
    router.push(firstTime ? '/organizer?onboarding=true' : '/organizer');
  };

  const resend = () => {
    sendOtp(email);
    setResendTimer(60);
    setDigits(['', '', '', '', '']);
    setOtpErr('');
    setTimeout(() => inputRefs.current[0]?.focus(), 80);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'var(--paper)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--plum) 10%, transparent), transparent 70%)', animation: 'float 10s ease-in-out infinite 2s' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <Logo size={24} />
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--card-edge)',
          borderRadius: 28,
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div key="email" variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Welcome to NexMeet</div>
                <h1 className="display" style={{ fontSize: 28, marginBottom: 8 }}>Sign in to get started</h1>
                <p className="lead" style={{ fontSize: 15, marginBottom: 28 }}>
                  Enter your email and we'll send you a 5-digit code. No passwords, ever.
                </p>

                <form onSubmit={handleEmailSubmit}>
                  <label className="field" style={{ marginBottom: 8 }}>
                    <span className="field-label">Email address</span>
                    <input
                      ref={emailRef}
                      id="auth-email"
                      className="input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                      style={{ marginTop: 8 }}
                      autoComplete="email"
                    />
                  </label>
                  {emailErr && (
                    <p style={{ color: '#E0356B', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{emailErr}</p>
                  )}
                  <button
                    id="auth-send-code"
                    type="submit"
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 16 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                    ) : (
                      <><Icon name="spark" size={18} /> Send me a code</>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <button
                  onClick={() => { setStep('email'); setDigits(['', '', '', '', '']); setOtpErr(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 13.5, fontWeight: 700, marginBottom: 20 }}
                >
                  <Icon name="back" size={16} /> Back
                </button>

                <div className="eyebrow" style={{ marginBottom: 8 }}>Check your inbox</div>
                <h1 className="display" style={{ fontSize: 26, marginBottom: 8 }}>Enter your code</h1>
                <p className="lead" style={{ fontSize: 14.5, marginBottom: 28 }}>
                  We sent a 5-digit code to <strong style={{ color: 'var(--ink)' }}>{email}</strong>. It expires in 10 minutes.
                </p>

                <form onSubmit={handleOtpSubmit}>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-digit-${i}`}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={d}
                        onChange={e => handleDigitChange(i, e.target.value)}
                        onKeyDown={e => handleDigitKey(i, e)}
                        style={{
                          width: 54, height: 62,
                          textAlign: 'center',
                          fontSize: 26, fontWeight: 800,
                          fontFamily: 'var(--font-display)',
                          background: 'var(--paper)',
                          border: `2px solid ${d ? 'var(--accent)' : 'var(--card-edge)'}`,
                          borderRadius: 14,
                          color: 'var(--ink)',
                          outline: 'none',
                          transition: 'border-color .15s',
                          caretColor: 'var(--accent)',
                        }}
                        onFocus={e => e.target.select()}
                      />
                    ))}
                  </div>

                  {otpErr && (
                    <p style={{ color: '#E0356B', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>{otpErr}</p>
                  )}

                  <button
                    id="auth-verify-otp"
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                    ) : (
                      <>Verify code <Icon name="arrow" size={18} /></>
                    )}
                  </button>

                  <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: 'var(--ink-3)' }}>
                    Didn't get it?{' '}
                    {resendTimer > 0 ? (
                      <span>Resend in {resendTimer}s</span>
                    ) : (
                      <button type="button" onClick={resend} style={{ color: 'var(--accent)', fontWeight: 700 }}>
                        Resend code
                      </button>
                    )}
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          By continuing you agree to NexMeet's{' '}
          <a href="#" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Terms</a>
          {' '}and{' '}
          <a href="#" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
