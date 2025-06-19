import { pgPool } from '../database/connect.js';

export const createLesson = async ({ user_id, subject, grade, topic, script, avatar, video_url }) => {
  const res = await pgPool.query(
    `INSERT INTO lessons (user_id, subject, grade, topic, script, avatar, video_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user_id, subject, grade, topic, script, avatar, video_url]
  );
  return res.rows[0];
};

export const getLessonsByUser = async (user_id) => {
  const res = await pgPool.query(
    `SELECT * FROM lessons WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );
  return res.rows;
};

export const getLessonById = async (id, user_id) => {
  const res = await pgPool.query(
    `SELECT * FROM lessons WHERE id = $1 AND user_id = $2`,
    [id, user_id]
  );
  return res.rows[0];
};
