const app = require('./app');
const { connectPostgres, connectMongo } = require('./database/connect');

const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001

(async () => {
  try {
    // Connect to databases
    await connectPostgres();
    await connectMongo();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ EDUKINS backend running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();