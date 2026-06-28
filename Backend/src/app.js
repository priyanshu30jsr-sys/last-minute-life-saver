require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const { rateLimiter } = require('./middleware/rateLimiter');

const authRoutes     = require('./routes/authRoutes');
const planRoutes     = require('./routes/planRoutes');
const chatRoutes     = require('./routes/chatRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const userRoutes     = require('./routes/userRoutes');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Trust proxy (required for rate limiter and IP detection behind reverse proxy)
app.set('trust proxy', 1);

// Core middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit AI-heavy endpoints only
app.use('/api/chat/message', rateLimiter);
app.use('/api/plans/generate', rateLimiter);

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/plans',    planRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/users',    userRoutes);

// Health check for Cloud Run
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'LifeSaver AI', timestamp: new Date() })
);

// Global error handler — must be last
app.use(errorMiddleware);

module.exports = app;