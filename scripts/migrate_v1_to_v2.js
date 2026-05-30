import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    await pool.query('BEGIN');
    
    // 1. Rename users to organizers if organizers doesn't exist
    const orgRes = await pool.query("SELECT to_regclass('public.organizers')");
    if (!orgRes.rows[0].to_regclass) {
      await pool.query('ALTER TABLE users RENAME TO organizers');
    }

    // 2. Rename created_by to organizer_id in events
    const evRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_by'");
    if (evRes.rows.length > 0) {
      await pool.query('ALTER TABLE events RENAME COLUMN created_by TO organizer_id');
    }

    // 3. Rename event_registrations to attendees
    const attRes = await pool.query("SELECT to_regclass('public.attendees')");
    if (!attRes.rows[0].to_regclass) {
      await pool.query('ALTER TABLE event_registrations RENAME TO attendees');
      
      // Add name, email, phone to attendees
      await pool.query('ALTER TABLE attendees ADD COLUMN name TEXT');
      await pool.query('ALTER TABLE attendees ADD COLUMN email TEXT');
      await pool.query('ALTER TABLE attendees ADD COLUMN phone TEXT');
      
      // Copy data from organizers (formerly users) to attendees
      await pool.query(`
        UPDATE attendees a
        SET name = o.name, email = o.email, phone = o.phone
        FROM organizers o
        WHERE a.user_id = o.id
      `);
      
      // Make name and email NOT NULL (if possible, else leave as is)
      // Drop user_id from attendees
      await pool.query('ALTER TABLE attendees DROP COLUMN user_id');
    }

    // 4. Rename connections to matches
    const matRes = await pool.query("SELECT to_regclass('public.matches')");
    if (!matRes.rows[0].to_regclass) {
      await pool.query('ALTER TABLE connections RENAME TO matches');
      await pool.query('ALTER TABLE matches RENAME COLUMN source_event_id TO event_id');
      await pool.query('ALTER TABLE matches RENAME COLUMN user_a_id TO attendee_a_id');
      await pool.query('ALTER TABLE matches RENAME COLUMN user_b_id TO attendee_b_id');
    }

    await pool.query('COMMIT');
    console.log("Migration successful!");
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error("Migration failed:", e);
  } finally {
    await pool.end();
  }
}

migrate();
