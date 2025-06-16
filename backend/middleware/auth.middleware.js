const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token missing' });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken };
