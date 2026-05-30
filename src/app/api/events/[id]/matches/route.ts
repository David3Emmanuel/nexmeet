import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const authToken = searchParams.get('auth_token')

  // Attendee flow
  if (authToken) {
    const attendee = await pool.query(
      `SELECT a.id, e.id as event_id FROM attendees a
       JOIN events e ON e.id = a.event_id
       WHERE a.auth_token = $1 AND (e.slug = $2 OR e.id::text = $2 OR upper(e.short_code) = upper($2))`,
      [authToken, id]
    )
    if (attendee.rowCount === 0) return NextResponse.json({ error: 'Unauthorized attendee' }, { status: 401 })

    const attendeeId = attendee.rows[0].id
    const eventId = attendee.rows[0].event_id

    // Fetch the owner's own name for the email-link landing case
    const ownerRow = await pool.query(`SELECT name FROM attendees WHERE id = $1`, [attendeeId])
    const ownerName: string = ownerRow.rows[0]?.name ?? ''

    // Fetch matches involving this attendee, including the stored AI/heuristic reason
    const { rows } = await pool.query(
      `SELECT m.id,
              m.reason,
              CASE WHEN m.attendee_a_id = $1 THEN b.id ELSE a.id END AS matched_id,
              CASE WHEN m.attendee_a_id = $1 THEN b.name ELSE a.name END AS matched_name,
              CASE WHEN m.attendee_a_id = $1 THEN b.responses ELSE a.responses END AS matched_responses
       FROM matches m
       JOIN attendees a ON a.id = m.attendee_a_id
       JOIN attendees b ON b.id = m.attendee_b_id
       WHERE m.event_id = $2 AND (m.attendee_a_id = $1 OR m.attendee_b_id = $1)`,
      [attendeeId, eventId]
    )

    return NextResponse.json({ owner_name: ownerName, matches: rows })
  }

  // Organizer flow
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owned = await pool.query(
    `SELECT e.id FROM events e
     JOIN organizers o ON o.id = e.organizer_id
     WHERE (e.slug = $1 OR e.id::text = $1) AND o.email = $2`,
    [id, session.email],
  )
  if (owned.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { rows } = await pool.query(
    `SELECT m.id,
            a.id   AS attendee_a_id,   a.name AS attendee_a_name,
            b.id   AS attendee_b_id,   b.name AS attendee_b_name
     FROM matches m
     JOIN attendees a ON a.id = m.attendee_a_id
     JOIN attendees b ON b.id = m.attendee_b_id
     WHERE m.event_id = $1
     ORDER BY a.name, b.name`,
    [owned.rows[0].id],
  )

  return NextResponse.json({ matches: rows, total: rows.length })
}
