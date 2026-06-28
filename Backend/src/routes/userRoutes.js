const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, getStats, getTodaysBrief } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/profile',      getProfile);
router.patch('/profile',    updateProfile);
router.get('/stats',        getStats);
router.get('/daily-brief',  getTodaysBrief);

module.exports = router;