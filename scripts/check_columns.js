import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const tables = ['users', 'event_registrations', 'connections'];
  for (const t of tables) {
    const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${t}'`);
    console.log(t, res.rows.map(r => r.column_name));
  }
  await pool.end();
}
run();
