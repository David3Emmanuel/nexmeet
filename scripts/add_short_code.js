import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS short_code VARCHAR(10) UNIQUE;`);
    await pool.query(`UPDATE events SET short_code = upper(substring(md5(id::text) from 1 for 5)) WHERE short_code IS NULL;`);
    console.log("Added short_code column and backfilled data");
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
