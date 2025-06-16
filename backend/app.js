const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Valid route files
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/lesson', require('./routes/lesson.routes'));
app.use('/api/quiz', require('./routes/quiz.routes'));
app.use('/api/avatar', require('./routes/avatar.routes'));

module.exports = app;
