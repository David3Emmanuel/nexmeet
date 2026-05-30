import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { triggerMatch } from '@/lib/match'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find unmatched events with at least one match_time that has passed
  const { rows } = await pool.query<{ id: string }>(`
    SELECT id FROM events
    WHERE matched = false
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(match_times) AS t(ts)
        WHERE ts::timestamptz <= NOW()
      )
  `)

  if (rows.length === 0) {
    return NextResponse.json({ triggered: 0 })
  }

  let triggered = 0
  for (const { id } of rows) {
    try {
      await triggerMatch(id)
      triggered++
      console.log(`[cron/match] matched event ${id}`)
    } catch (err) {
      console.error(`[cron/match] failed for event ${id}:`, err)
    }
  }

  return NextResponse.json({ triggered })
}
