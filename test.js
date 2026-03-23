import pg from 'pg';
const { Pool } = pg;
console.log("DB_URL is:", process.env.DATABASE_URL ? "SET" : "UNDEFINED");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()')
  .then(res => console.log("DB SUCCESS:", res.rows))
  .catch(err => console.error("DB ERR:", err))
  .finally(() => process.exit(0));
