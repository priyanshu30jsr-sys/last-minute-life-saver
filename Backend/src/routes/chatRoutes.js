const express = require('express');
const router  = express.Router();
const { sendMessage, getChatHistory, getSessions } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/message',              sendMessage);
router.get('/sessions',              getSessions);
router.get('/history/:sessionId',    getChatHistory);

module.exports = router;