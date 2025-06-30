const router = require('express').Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    // In production, fetch from database using req.user.userId
    const userProfile = {
      id: req.user.userId,
      email: req.user.email,
      name: 'Alex Student',
      grade: 5,
      completedLessons: 12,
      totalLessons: 50,
      subjects: ['Science', 'Math', 'English', 'History', 'Geography'],
      joinedAt: '2024-01-15T00:00:00.000Z'
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, grade } = req.body;

    // In production, update database record
    const updatedProfile = {
      id: req.user.userId,
      email: req.user.email,
      name: name || 'Alex Student',
      grade: grade || 5,
      updatedAt: new Date().toISOString()
    };

    res.json({
      user: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;