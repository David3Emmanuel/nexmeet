import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function PUT(req: NextRequest) {
  const token = req.headers.get('x-attendee-token')
  if (!token) return NextResponse.json({ error: 'Missing attendee token' }, { status: 401 })

  const body = await req.json()
  const { lat, lng } = body as { lat?: number; lng?: number }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'lat and lng are required numbers' }, { status: 400 })
  }

  // Update this attendee's location
  const { rowCount, rows } = await pool.query(
    `UPDATE attendees SET lat = $1, lng = $2, updated_at = now()
     WHERE auth_token = $3
     RETURNING id, event_id`,
    [lat, lng, token],
  )

  if (rowCount === 0) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { id: attendeeId, event_id: eventId } = rows[0]

  // Return matched attendees' current locations
  const { rows: matchRows } = await pool.query(
    `SELECT a.name, a.lat, a.lng
     FROM matches m
     JOIN attendees a ON (
       CASE WHEN m.attendee_a_id = $1 THEN m.attendee_b_id ELSE m.attendee_a_id END = a.id
     )
     WHERE m.event_id = $2
       AND (m.attendee_a_id = $1 OR m.attendee_b_id = $1)
       AND a.lat IS NOT NULL AND a.lng IS NOT NULL`,
    [attendeeId, eventId],
  )

  return NextResponse.json({ matches: matchRows })
}
