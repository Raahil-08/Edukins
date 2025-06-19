import { pgPool } from '../database/connect.js';

export const createUser = async ({ name, email, password, role }) => {
  const res = await pgPool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, password, role || 'student']
  );
  return res.rows[0];
};

export const getUserByEmail = async (email) => {
  const res = await pgPool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return res.rows[0];
};
