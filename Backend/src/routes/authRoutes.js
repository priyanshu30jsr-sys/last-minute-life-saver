const express = require('express');
const router  = express.Router();
const { register, login, getMe, startGoogleAuth } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/me', authMiddleware, getMe);
// Public redirect endpoint to initiate Google OAuth (used by frontend login button)
router.get('/google', startGoogleAuth);

module.exports = router;