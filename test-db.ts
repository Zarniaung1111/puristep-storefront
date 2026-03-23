import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
console.log("Connecting to:", process.env.DATABASE_URL);
pool.query('SELECT NOW()').then(res => {
  console.log("DB SUCCESS:", res.rows);
  process.exit(0);
}).catch(e => {
  console.error("DB ERR:", e);
  process.exit(1);
});
