import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { postLesson, getAllLessons, getSingleLesson } from '../controllers/lesson.controller.js';

const router = express.Router();

router.post('/', verifyToken, postLesson);
router.get('/', verifyToken, getAllLessons);
router.get('/:id', verifyToken, getSingleLesson);

export default router;
