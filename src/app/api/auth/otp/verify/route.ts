import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { signToken, sessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
  }

  const result = await pool.query(
    `DELETE FROM otp_codes
     WHERE email = $1 AND code = $2 AND expires_at > NOW()
     RETURNING *`,
    [email, code]
  )

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
  }

  const token = signToken(email)
  const options = sessionCookieOptions()

  const response = NextResponse.json({ success: true })
  response.cookies.set(options.name, token, options)
  return response
}
