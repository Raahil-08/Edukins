const app = require('./app');
const { connectPostgres } = require('./database/connect');

const PORT = process.env.PORT || 5050;

(async () => {
  try {
    await connectPostgres();
    app.listen(PORT, () => {
      console.log(`✅ EDUKINS backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
  }
})();
