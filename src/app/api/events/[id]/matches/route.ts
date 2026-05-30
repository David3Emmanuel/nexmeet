import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const owned = await pool.query(
    `SELECT e.id FROM events e
     JOIN organizers o ON o.id = e.organizer_id
     WHERE e.id = $1 AND o.email = $2`,
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
    [id],
  )

  return NextResponse.json({ matches: rows, total: rows.length })
}
