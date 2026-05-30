import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'events'").then(res => console.log(res.rows.map(r => r.column_name))).then(() => pool.end());
