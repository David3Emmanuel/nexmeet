import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 15 * 60 * 1000)

  await pool.query(
    `INSERT INTO otp_codes (email, code, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3`,
    [email, code, expires]
  )

  await sendEmail({
    to: email,
    subject: 'Your NexMeet login code',
    text: `Your login code is: ${code}\n\nThis code expires in 15 minutes.`,
    html: `<p>Your NexMeet login code is:</p><h2>${code}</h2><p>This code expires in 15 minutes.</p>`,
  })

  return NextResponse.json({ success: true })
}
