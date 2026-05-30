'use client'

export interface NexSession {
  email: string
  name?: string
}

const COOKIE = 'nexmeet_session'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export async function getSession(): Promise<NexSession | null> {
  try {
    const res = await fetch('/api/auth/session', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.session || !data.session.email) return null
    return { 
      email: data.session.email, 
      name: data.session.name || data.session.email.split('@')[0] 
    }
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' })
  } catch {}
}

export function markOnboarded(): void {
  localStorage.setItem('nexmeet_onboarded', 'true')
}

export function isNewUser(): boolean {
  return !localStorage.getItem('nexmeet_onboarded')
}
