const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10,             // 10 AI calls per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many AI requests. Please wait a moment and try again.'
  }
});

module.exports = { rateLimiter };