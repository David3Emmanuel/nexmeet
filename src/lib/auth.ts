import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.AUTH_SECRET!
const COOKIE = 'nexmeet_session'

export function signToken(email: string): string {
  return jwt.sign({ email }, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { email: string } | null {
  try {
    return jwt.verify(token, SECRET) as { email: string }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export function sessionCookieOptions() {
  return {
    name: COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}
