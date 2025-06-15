const router = require('express').Router();

router.post('/register', (req, res) => {
  res.json({ msg: 'Register route works ✅' });
});

router.post('/login', (req, res) => {
  res.json({ token: 'demo.jwt.token' });
});

module.exports = router;


