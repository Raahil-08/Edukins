import app from './app.js';
import { connectPostgres } from './database/connect.js';

const PORT = process.env.PORT || 5050;

try {
  await connectPostgres();
  app.listen(PORT, () => {
    console.log(`✅ EDUKINS backend running on port ${PORT}`);
  });
} catch (err) {
  console.error('❌ Server startup failed:', err.message);
}
