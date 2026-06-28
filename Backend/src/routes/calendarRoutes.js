const express = require('express');
const router  = express.Router();
const {
  getCalendarAuthUrl, handleOAuthCallback, syncPlanToCalendar, getCalendarStatus
} = require('../controllers/calendarController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/auth-url',       authMiddleware, getCalendarAuthUrl);
router.get('/callback',       handleOAuthCallback); // Public — OAuth redirect
router.get('/status',         authMiddleware, getCalendarStatus);
router.post('/sync/:planId',  authMiddleware, syncPlanToCalendar);

module.exports = router;