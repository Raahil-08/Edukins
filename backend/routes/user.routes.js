const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/me', verifyToken, (req, res) => {
  res.json({ message: "🔒 Access granted!", user: req.user });
});

module.exports = router;
