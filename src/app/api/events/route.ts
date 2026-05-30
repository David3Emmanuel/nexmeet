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
    `SELECT id, slug, short_code, title, about, image_url, theme_config, match_times, matched
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
  const { title, about, image_url, form_fields, theme_config, match_times, date, venue } = body

  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  // Upsert organizer row
  await pool.query(
    `INSERT INTO organizers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
    [session.email],
  )
  const org = await pool.query('SELECT id FROM organizers WHERE email = $1', [session.email])
  const organizerId = org.rows[0].id

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slugSuffix = Math.random().toString(36).substring(2, 6);
  const slug = baseSlug + '-' + slugSuffix;
  const shortCode = Math.random().toString(36).substring(2, 7).toUpperCase();

  const { rows } = await pool.query(
    `INSERT INTO events (organizer_id, title, about, image_url, form_fields, theme_config, match_times, slug, short_code, event_date, venue)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING slug, short_code`,
    [
      organizerId,
      title,
      about ?? null,
      image_url ?? null,
      JSON.stringify(form_fields ?? []),
      JSON.stringify(theme_config ?? {}),
      JSON.stringify(match_times ?? []),
      slug,
      shortCode,
      date ?? null,
      venue ?? null
    ],
  )

  return NextResponse.json({ event_id: rows[0].slug, short_code: rows[0].short_code }, { status: 201 })
}
