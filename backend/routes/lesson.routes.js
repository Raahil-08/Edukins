const router = require('express').Router();
const jwt = require('jsonwebtoken');
const openaiService = require('../services/openai.service');

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

// Generate AI Lesson endpoint
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, grade, topic, avatar } = req.body;

    // Validate input
    if (!subject || !grade || !topic) {
      return res.status(400).json({ 
        message: 'Subject, grade, and topic are required' 
      });
    }

    if (grade < 1 || grade > 12) {
      return res.status(400).json({ 
        message: 'Grade must be between 1 and 12' 
      });
    }

    if (topic.length < 3) {
      return res.status(400).json({ 
        message: 'Topic must be at least 3 characters long' 
      });
    }

    console.log('🚀 Starting AI lesson generation:', { subject, grade, topic, avatar });

    // Generate lesson using OpenAI
    const aiLesson = await openaiService.generateLesson(subject, grade, topic, avatar);

    console.log('✅ AI lesson generated successfully:', {
      id: aiLesson.id,
      wordCount: aiLesson.wordCount,
      duration: aiLesson.duration,
      keyPoints: aiLesson.keyPoints.length
    });

    res.json(aiLesson);
    
  } catch (error) {
    console.error('❌ AI lesson generation error:', error.message);
    
    // Return specific error messages for different failure types
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        message: 'AI service configuration error. Please contact support.',
        error: 'API_KEY_ERROR'
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        message: 'AI service is busy. Please try again in a moment.',
        error: 'RATE_LIMIT_ERROR'
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({ 
        message: 'AI generation took too long. Please try again.',
        error: 'TIMEOUT_ERROR'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to generate AI lesson. Please try again.',
      error: error.message 
    });
  }
});

// Get all lessons for user
router.get('/', authenticateToken, (req, res) => {
  try {
    // Return user's lesson history (in production, fetch from database)
    const lessons = [
      {
        id: '1',
        topic: 'Solar System',
        subject: 'Science',
        grade: 5,
        createdAt: new Date().toISOString(),
        duration: '12 min',
        isAIGenerated: true
      }
    ];

    res.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// Get specific lesson by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, fetch from database
    const lesson = {
      id: id,
      topic: 'Sample Lesson',
      subject: 'Science',
      grade: 5,
      script: 'This is a sample lesson content...',
      duration: '10 min',
      createdAt: new Date().toISOString(),
      isAIGenerated: false
    };

    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Failed to fetch lesson' });
  }
});

module.exports = router;