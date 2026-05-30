import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// GET /api/events/:id — public, attendee-facing
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.about, e.image_url, e.form_fields, e.theme_config, e.short_code, e.matched, e.event_date as date, e.venue
     FROM events e WHERE e.slug = $1 OR e.id::text = $1 OR upper(e.short_code) = upper($1)`,
    [id],
  )
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(rows[0])
}

// PATCH /api/events/:id — update (organizer only, must own event)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const owned = await pool.query(
    `SELECT e.id FROM events e
     JOIN organizers o ON o.id = e.organizer_id
     WHERE (e.slug = $1 OR e.id::text = $1) AND o.email = $2`,
    [id, session.email],
  )
  if (owned.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const fields: string[] = []
  const values: unknown[] = []
  let i = 1

  const allowed = ['title', 'about', 'image_url', 'form_fields', 'theme_config', 'match_times', 'date', 'venue'] as const
  for (const key of allowed) {
    if (key in body) {
      const dbCol = key === 'date' ? 'event_date' : key;
      fields.push(`${dbCol} = $${i++}`)
      values.push(typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key])
    }
  }

  if (fields.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  values.push(owned.rows[0].id)
  await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = $${i}`, values)

  return NextResponse.json({ success: true })
}

// DELETE /api/events/:id — organizer only, must own event
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { rowCount } = await pool.query(
    `DELETE FROM events e USING organizers o
     WHERE e.organizer_id = o.id AND (e.slug = $1 OR e.id::text = $1) AND o.email = $2`,
    [id, session.email],
  )

  if (rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
