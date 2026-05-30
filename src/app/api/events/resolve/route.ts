import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.trim().toUpperCase()

  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

  const { rows } = await pool.query(
    `SELECT slug, id FROM events 
     WHERE upper(short_code) = $1
        OR upper(slug) LIKE '%-' || $1 
        OR upper(slug) = $1 
        OR upper(id::text) LIKE $1 || '%'
     LIMIT 1`,
    [code]
  )

  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ slug: rows[0].slug || rows[0].id })
}
