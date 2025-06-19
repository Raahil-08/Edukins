import express from 'express';

const router = express.Router();

// Example route (you can customize later)
router.get('/', (req, res) => {
  res.send("Avatar route works! ✅");
});

export default router;
