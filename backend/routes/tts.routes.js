const router = require('express').Router();
const jwt = require('jsonwebtoken');
const ttsService = require('../services/tts.service'); // ✅ Import your real TTS service

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ✅ JWT auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Generate TTS audio endpoint — real implementation
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { text, voiceId, format = 'wav' } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ message: 'Text and voiceId are required' });
    }
    if (text.length > 10000) {
      return res.status(400).json({ message: 'Text too long (max 10,000 characters).' });
    }

    console.log(`🎤 Generating TTS: voiceId=${voiceId}`);
    const audioBuffer = await ttsService.generateVoice(voiceId, text);

    res.set({
      'Content-Type': `audio/${format}`,
      'Content-Length': audioBuffer.length,
      'Content-Disposition': `attachment; filename="lesson_audio.${format}"`
    });
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ TTS generation error:', error);
    res.status(500).json({ message: 'Failed to generate audio' });
  }
});

// ✅ Static list of available voices
router.get('/voices', authenticateToken, (req, res) => {
  res.json({
    voices: [
      { id: 'Cyberstein', name: 'Cyberstein', gender: 'male', locale: 'en-US', description: 'Strict German professor' },
      { id: 'Roboldo', name: 'Roboldo', gender: 'male', locale: 'en-PT', description: 'Enthusiastic Portuguese accent' },
      { id: 'Debugjit', name: 'Debugjit', gender: 'male', locale: 'en-IN', description: 'Chill Punjabi uncle' },
      { id: 'Jennerator', name: 'Jennerator', gender: 'female', locale: 'en-US', description: 'Cool American teen' },
    ],
    message: 'Available TTS voices'
  });
});

module.exports = router;
