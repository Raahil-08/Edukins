const { Pool } = require('pg');

const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const connectPostgres = async () => {
  await pgPool.connect();
  console.log("✅ PostgreSQL connected");
};

module.exports = { connectPostgres, pgPool };
