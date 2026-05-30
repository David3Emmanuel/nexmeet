import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateMatches } from '@/ai'
import { sendEmail } from '@/lib/email'
import type { MatchAttendee, FormQuestion } from '@/lib/types'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify organizer owns event
  const event = await pool.query(
    `SELECT e.id, e.title, e.form_fields FROM events e
     JOIN organizers o ON o.id = e.organizer_id
     WHERE e.id = $1 AND o.email = $2`,
    [id, session.email],
  )
  if (event.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { title, form_fields } = event.rows[0]

  // Load attendees
  const attendeeRows = await pool.query(
    `SELECT id, name, responses FROM attendees WHERE event_id = $1`,
    [id],
  )
  if (attendeeRows.rowCount === 0) {
    return NextResponse.json({ error: 'No attendees to match' }, { status: 400 })
  }

  const questions: FormQuestion[] = (form_fields as FormQuestion[]).filter(
    (f) => f.id && f.question,
  )

  const attendees: MatchAttendee[] = attendeeRows.rows.map((row) => ({
    id: row.id,
    name: row.name,
    lookingFor: (row.responses as Record<string, string>)['looking_for'],
    answers: row.responses as Record<string, string>,
  }))

  // Run AI matching
  const results = await generateMatches(questions, attendees)

  // Persist matches — clear old ones first
  await pool.query('DELETE FROM matches WHERE event_id = $1', [id])

  // Build a de-duped set of pairs (lower id first to avoid duplicates)
  const pairs = new Set<string>()
  for (const result of results) {
    for (const match of result.matches) {
      const pair = [result.attendeeId, match.matchedAttendeeId].sort().join('|')
      pairs.add(pair)
    }
  }

  for (const pair of pairs) {
    const [a, b] = pair.split('|')
    await pool.query(
      `INSERT INTO matches (event_id, attendee_a_id, attendee_b_id) VALUES ($1, $2, $3)`,
      [id, a, b],
    )
  }

  // Mark event as matched
  await pool.query('UPDATE events SET matched = true WHERE id = $1', [id])

  // Build lookup maps for notification emails
  const attendeeMap = new Map(attendeeRows.rows.map((r) => [r.id, r]))
  const resultMap = new Map(results.map((r) => [r.attendeeId, r]))

  const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000'

  // Send match notification emails (fire and forget — don't block response)
  Promise.allSettled(
    attendeeRows.rows.map(async (row) => {
      const result = resultMap.get(row.id)
      if (!result || result.matches.length === 0) return

      const matchNames = result.matches.map((m) => m.matchedName).join(', ')
      const ticketUrl = `${baseUrl}/e/${id}?ticket=${row.auth_token}`

      await sendEmail({
        to: row.email,
        subject: `Your matches at ${title} are ready!`,
        text: `Hi ${row.name},\n\nYour matches: ${matchNames}\n\nSee details: ${ticketUrl}`,
        html: `
          <p>Hi <strong>${row.name}</strong>,</p>
          <p>Your matches at <strong>${title}</strong> are ready!</p>
          <ul>${result.matches.map((m) => `<li><strong>${m.matchedName}</strong> — ${m.reason}</li>`).join('')}</ul>
          <p><a href="${ticketUrl}">View your match card</a></p>
        `,
      })
    }),
  )

  return NextResponse.json({ matched: pairs.size })
}
