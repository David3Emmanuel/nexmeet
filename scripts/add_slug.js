import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;`);
    console.log("Added slug column");
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
