const app = require('./app');
const { connectPostgres, connectMongo } = require('./database/connect');

const PORT = process.env.PORT || 5050; // Changed from 5001 to 5050 to match frontend

(async () => {
  try {
    // Connect to databases (optional - app works without them)
    try {
      await connectPostgres();
      console.log('✅ PostgreSQL connected');
    } catch (error) {
      console.log('⚠️  PostgreSQL connection failed, continuing without it:', error.message);
    }
    
    try {
      await connectMongo();
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.log('⚠️  MongoDB connection failed, continuing without it:', error.message);
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ EDUKINS AI BACKEND running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API base URL: http://localhost:${PORT}/api`);
      console.log(`🤖 AI Lesson Generation: http://localhost:${PORT}/api/lesson`);
      console.log(`🔊 TTS Service: http://localhost:${PORT}/api/tts`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();