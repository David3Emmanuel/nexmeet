import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { triggerMatch } from '@/lib/match';

export async function GET(req: Request) {
  // Optional cron secret for security
  // const authHeader = req.headers.get('authorization');
  // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    // Find events whose match time has passed but aren't matched yet
    const { rows: events } = await pool.query(`
      SELECT e.id, e.title, e.form_fields
      FROM events e
      WHERE e.matched = false
        AND e.match_times IS NOT NULL
        AND jsonb_array_length(e.match_times::jsonb) > 0
        AND (e.match_times::jsonb ->> 0)::timestamp < NOW()
    `);

    let matchedCount = 0;

    for (const event of events) {
      try {
        await triggerMatch(event.id);
        matchedCount++;
      } catch (err) {
        console.error(`Error matching event ${event.id}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: events.length,
      matched_events: matchedCount
    });
  } catch (error: any) {
    console.error('Cron match error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
