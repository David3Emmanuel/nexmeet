import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/events — list the authenticated organizer's events
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const org = await pool.query('SELECT id FROM organizers WHERE email = $1', [session.email])
  if (org.rowCount === 0) return NextResponse.json({ events: [] })

  const { rows } = await pool.query(
    `SELECT id, title, about, image_url, theme_config, match_times, matched
     FROM events WHERE organizer_id = $1 ORDER BY id DESC`,
    [org.rows[0].id],
  )
  return NextResponse.json({ events: rows })
}

// POST /api/events — create an event
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, about, image_url, form_fields, theme_config, match_times } = body

  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  // Upsert organizer row
  await pool.query(
    `INSERT INTO organizers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
    [session.email],
  )
  const org = await pool.query('SELECT id FROM organizers WHERE email = $1', [session.email])
  const organizerId = org.rows[0].id

  const { rows } = await pool.query(
    `INSERT INTO events (organizer_id, title, about, image_url, form_fields, theme_config, match_times)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      organizerId,
      title,
      about ?? null,
      image_url ?? null,
      JSON.stringify(form_fields ?? []),
      JSON.stringify(theme_config ?? {}),
      JSON.stringify(match_times ?? []),
    ],
  )

  return NextResponse.json({ event_id: rows[0].id }, { status: 201 })
}
