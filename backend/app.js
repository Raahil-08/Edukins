import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import lessonRoutes from './routes/lesson.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import avatarRoutes from './routes/avatar.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lesson', lessonRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/avatar', avatarRoutes);

app.get('/', (req, res) => {
  res.send('🌟 EDUKINS backend is running!');
});

export default app;
