import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").then(res => console.log(res.rows.map(r => r.table_name))).then(() => pool.end());
