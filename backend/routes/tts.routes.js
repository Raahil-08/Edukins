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

// Generate TTS audio endpoint
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { text, voiceId, format = 'mp3' } = req.body;

    // Validate input
    if (!text || !voiceId) {
      return res.status(400).json({ 
        message: 'Text and voiceId are required' 
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({ 
        message: 'Text is too long. Maximum 10,000 characters allowed.' 
      });
    }

    // Simulate TTS generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // In a real implementation, you would:
    // 1. Use a TTS service like Azure Cognitive Services, AWS Polly, or Google Cloud TTS
    // 2. Generate actual audio with the specified voice
    // 3. Return the audio file as a blob

    // For demo purposes, we'll return an error to trigger fallback to browser TTS
    return res.status(503).json({ 
      message: 'TTS service temporarily unavailable. Please use browser fallback.',
      fallback: true
    });

    // Example of what a real implementation might look like:
    /*
    const audioBuffer = await generateTTSAudio(text, voiceId, format);
    
    res.set({
      'Content-Type': `audio/${format}`,
      'Content-Length': audioBuffer.length,
      'Content-Disposition': `attachment; filename="lesson_audio.${format}"`
    });
    
    res.send(audioBuffer);
    */
    
  } catch (error) {
    console.error('TTS generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate audio',
      fallback: true 
    });
  }
});

// Get available voices endpoint
router.get('/voices', authenticateToken, (req, res) => {
  try {
    // Return available TTS voices
    const voices = [
      {
        id: 'en-US-AriaNeural',
        name: 'Aria',
        gender: 'female',
        locale: 'en-US',
        description: 'Natural, friendly American female voice'
      },
      {
        id: 'en-US-DavisNeural',
        name: 'Davis',
        gender: 'male',
        locale: 'en-US',
        description: 'Clear, professional American male voice'
      },
      {
        id: 'en-US-AndrewNeural',
        name: 'Andrew',
        gender: 'male',
        locale: 'en-US',
        description: 'Warm, engaging American male voice'
      },
      {
        id: 'en-GB-RyanNeural',
        name: 'Ryan',
        gender: 'male',
        locale: 'en-GB',
        description: 'Sophisticated British male voice'
      },
      {
        id: 'en-AU-NatashaNeural',
        name: 'Natasha',
        gender: 'female',
        locale: 'en-AU',
        description: 'Cheerful Australian female voice'
      },
      {
        id: 'en-CA-ClaraNeural',
        name: 'Clara',
        gender: 'female',
        locale: 'en-CA',
        description: 'Friendly Canadian female voice'
      }
    ];

    res.json({
      voices: voices,
      message: 'Available TTS voices'
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ message: 'Failed to fetch available voices' });
  }
});

module.exports = router;