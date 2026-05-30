import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-attendee-token')
  if (!token) return NextResponse.json({ error: 'Missing attendee token' }, { status: 401 })

  // Resolve attendee from token
  const { rowCount, rows: attendeeRows } = await pool.query(
    `SELECT id, event_id FROM attendees WHERE auth_token = $1`,
    [token],
  )
  if (rowCount === 0) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { id: attendeeId, event_id: eventId } = attendeeRows[0]

  // Fetch matches with the peer's name and the stored reason
  const { rows } = await pool.query(
    `SELECT
       a.id,
       a.name,
       m.reason
     FROM matches m
     JOIN attendees a ON (
       CASE WHEN m.attendee_a_id = $1 THEN m.attendee_b_id ELSE m.attendee_a_id END = a.id
     )
     WHERE m.event_id = $2
       AND (m.attendee_a_id = $1 OR m.attendee_b_id = $1)
     ORDER BY a.name`,
    [attendeeId, eventId],
  )

  return NextResponse.json({ matches: rows })
}
