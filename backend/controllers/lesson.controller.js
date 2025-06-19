import { createLesson, getLessonsByUser, getLessonById } from '../models/lesson.model.js';
import { generateLessonScript } from '../services/ai.service.js';

export const postLesson = async (req, res) => {
  try {
    const { subject, grade, topic, avatar } = req.body;

    const script = await generateLessonScript({ topic, grade, subject, avatar });
    const video_url = `https://mock-video.ai/${topic}-${avatar}.mp4`;

    const lesson = await createLesson({
      user_id: req.user.id,
      subject,
      grade,
      topic,
      script,
      avatar,
      video_url
    });

    res.status(201).json({ lesson });
  } catch (err) {
    console.error("Lesson generation failed:", err.message);
    res.status(500).json({ error: "Lesson generation failed." });
  }
};

export const getAllLessons = async (req, res) => {
  const lessons = await getLessonsByUser(req.user.id);
  res.json({ lessons });
};

export const getSingleLesson = async (req, res) => {
  const lesson = await getLessonById(req.params.id, req.user.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ lesson });
};
