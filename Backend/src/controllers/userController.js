const User       = require('../models/User');
const Plan       = require('../models/Plan');
const DailyBrief = require('../models/DailyBrief');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -googleTokens');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// PATCH /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, productivityStyle, timezone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, productivityStyle, timezone },
      { new: true, runValidators: true }
    ).select('-password -googleTokens');
    res.json(user);
  } catch (err) { next(err); }
};

// GET /api/users/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user   = await User.findById(userId)
      .select('streakCount longestStreak totalPoints badges');

    const plans = await Plan.find({ userId });

    const completedPlans    = plans.filter(p => p.status === 'completed').length;
    const activePlans       = plans.filter(p => p.status === 'active').length;
    const totalStepsCompleted = plans.reduce(
      (acc, p) => acc + p.steps.filter(s => s.completed).length, 0
    );

    // Build 30-day streak history for 3D bar chart
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      return d.toDateString();
    });

    const completionsByDay = {};
    plans.forEach(plan =>
      plan.steps.forEach(step => {
        if (step.completedAt) {
          const day = new Date(step.completedAt).toDateString();
          completionsByDay[day] = (completionsByDay[day] || 0) + 1;
        }
      })
    );

    const streakHistory = last30Days.map(day => ({
      date:  day,
      count: completionsByDay[day] || 0
    }));

    res.json({
      streakCount:       user.streakCount,
      longestStreak:     user.longestStreak,
      totalPoints:       user.totalPoints,
      badges:            user.badges,
      completedPlans,
      activePlans,
      totalStepsCompleted,
      totalPlans:        plans.length,
      streakHistory      // Used by Three.js 3D bar chart in frontend
    });
  } catch (err) { next(err); }
};

// GET /api/users/daily-brief
const getTodaysBrief = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const brief = await DailyBrief.findOne({
      userId: req.user.userId,
      date:   { $gte: todayStart }
    });

    res.json(brief || { briefText: null, tasksForToday: [], focusMessage: null });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getStats, getTodaysBrief };