const { Pool } = require('pg');
const mongoose = require('mongoose');

let pgPool;

const connectPostgres = async () => {
  pgPool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  await pgPool.connect();
  console.log('✅ PostgreSQL connected');
};

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

module.exports = { connectPostgres, connectMongo, pgPool };
