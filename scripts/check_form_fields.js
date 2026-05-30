const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Show existing events and their form field counts
  const { rows } = await pool.query(`
    SELECT id, title, slug,
      CASE 
        WHEN form_fields IS NULL THEN 0
        WHEN jsonb_typeof(form_fields::jsonb) = 'array' THEN jsonb_array_length(form_fields::jsonb)
        ELSE 0
      END as field_count,
      form_fields
    FROM events ORDER BY created_at DESC LIMIT 5
  `);
  
  for (const row of rows) {
    console.log(`\n${row.title} (${row.slug}): ${row.field_count} fields`);
    const fields = row.form_fields;
    if (fields) {
      const arr = typeof fields === 'string' ? JSON.parse(fields) : fields;
      if (Array.isArray(arr)) {
        arr.forEach((f, i) => console.log(`  ${i+1}. ${f.label || f.name || JSON.stringify(f)}`));
      }
    }
  }
  
  pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
