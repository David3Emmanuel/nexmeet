import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { triggerMatch } from '@/lib/match'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
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

  try {
    const matched = await triggerMatch(id)
    return NextResponse.json({ matched })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Matching failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
