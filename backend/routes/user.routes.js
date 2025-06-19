import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Example authenticated route
router.get('/me', verifyToken, (req, res) => {
  res.json({
    message: '🔐 User profile route working',
    user: req.user
  });
});

export default router;
