import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Explicitly load .env.local BEFORE doing anything else
dotenv.config({ path: '.env.local' });

// Now import pg and create a pool
import { Pool } from 'pg';

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Testing database connection to:", process.env.DATABASE_URL?.substring(0, 30) + "...");
    const client = await pool.connect();
    console.log("Connection successful! Running migrations...");
    const sql = fs.readFileSync(path.join(process.cwd(), 'migrations/001_init.sql'), 'utf-8');
    await client.query(sql);
    console.log("Migration successful! Tables created.");
    client.release();
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

run();
