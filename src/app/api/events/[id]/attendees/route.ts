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
    `SELECT id, name, email, phone, responses, lat, lng, updated_at
     FROM attendees WHERE event_id = $1 ORDER BY name`,
    [id],
  )

  return NextResponse.json({ attendees: rows, total: rows.length })
}
