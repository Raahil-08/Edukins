const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken };
