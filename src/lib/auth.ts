/* ================================================================
   NexMeet — Auth utilities (mock / client-side)
   In production: replace sendOtp/verifyOtp with API calls to
   your backend (Resend, SendGrid, etc.) and use server sessions.
   ================================================================ */

const OTP_KEY = 'nm_otp';
const SESSION_KEY = 'nm_session';
const ONBOARDED_KEY = 'nm_onboarded';

export interface NexSession {
  email: string;
  name?: string;
  createdAt: number;
}

/** Generate and "send" a 5-digit OTP. Returns the code so the
 *  dev console can confirm it. In production, send via email. */
export function sendOtp(email: string): string {
  const code = String(Math.floor(10000 + Math.random() * 90000));
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(OTP_KEY, JSON.stringify({ email: email.toLowerCase(), code, exp: Date.now() + 10 * 60 * 1000 }));
  }
  // TODO: replace with real email send
  console.info(`[NexMeet OTP] Code for ${email}: ${code}`);
  return code;
}

/** Verify the OTP against the stored value. */
export function verifyOtp(email: string, code: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    if (!raw) return false;
    const stored = JSON.parse(raw) as { email: string; code: string; exp: number };
    if (stored.email !== email.toLowerCase()) return false;
    if (Date.now() > stored.exp) return false;
    return stored.code === code.trim();
  } catch {
    return false;
  }
}

/** Persist the session after successful OTP verification. */
export function setSession(email: string, name?: string): void {
  if (typeof window === 'undefined') return;
  const session: NexSession = { email: email.toLowerCase(), name, createdAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionStorage.removeItem(OTP_KEY);
}

/** Read the current session. Returns null if not logged in. */
export function getSession(): NexSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NexSession;
  } catch {
    return null;
  }
}

/** Clear the session (logout). */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

/** Returns true if this is a first-time login (onboarding tour needed). */
export function isNewUser(): boolean {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem(ONBOARDED_KEY);
}

/** Mark the onboarding tour as completed so it never replays. */
export function markOnboarded(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDED_KEY, '1');
}
