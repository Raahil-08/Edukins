
const app = require('./app');
const { connectPostgres, connectMongo } = require('./database/connect');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectPostgres();
    await connectMongo();
    app.listen(PORT, () => console.log(`✅ EDUKINS backend running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
  }
})();
