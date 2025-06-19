import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function connectPostgres() {
  await pgPool.connect();
  console.log("✅ PostgreSQL connected");
}

export { pgPool };
