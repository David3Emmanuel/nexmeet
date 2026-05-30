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

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function getSession(): NexSession | null {
  const token = getCookie(COOKIE)
  if (!token) return null
  const payload = parseJwt(token)
  if (!payload || !payload.email) return null
  const exp = payload.exp as number | undefined
  if (exp && exp * 1000 < Date.now()) return null
  return { email: payload.email as string, name: payload.name as string | undefined }
}

export function clearSession(): void {
  document.cookie = `${COOKIE}=; Max-Age=0; path=/`
}

export function markOnboarded(): void {
  localStorage.setItem('nexmeet_onboarded', 'true')
}

export function isNewUser(): boolean {
  return !localStorage.getItem('nexmeet_onboarded')
}
