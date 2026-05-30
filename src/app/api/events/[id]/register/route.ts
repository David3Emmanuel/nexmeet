import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { sendEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { name, email, phone, responses } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }

  // Verify event exists
  const event = await pool.query('SELECT id, title FROM events WHERE id = $1', [id])
  if (event.rowCount === 0) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const { rows } = await pool.query(
    `INSERT INTO attendees (event_id, name, email, phone, responses)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, auth_token`,
    [id, name, email, phone ?? null, JSON.stringify(responses ?? {})],
  )

  const { auth_token } = rows[0]
  const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000'
  const ticketUrl = `${baseUrl}/e/${id}?ticket=${auth_token}`

  await sendEmail({
    to: email,
    subject: `You're registered for ${event.rows[0].title}!`,
    text: `Hi ${name},\n\nYou're registered! Access your match card here:\n${ticketUrl}`,
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>You're registered for <strong>${event.rows[0].title}</strong>!</p>
      <p>When matches are generated, use the link below to see who you should meet:</p>
      <p><a href="${ticketUrl}">${ticketUrl}</a></p>
    `,
  })

  return NextResponse.json({ success: true })
}
