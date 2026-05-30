'use server'

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.AUTH_SECRET!
const COOKIE = 'nexmeet_session'

export async function signToken(email: string): Promise<string> {
  return jwt.sign({ email }, SECRET, { expiresIn: '7d' })
}

export async function verifyToken(
  token: string,
): Promise<{ email: string } | null> {
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

export async function sessionCookieOptions() {
  return {
    name: COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}
