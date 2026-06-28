const { google }                   = require('googleapis');
const { getAuthUrl, getTokens, getAuthenticatedClient } = require('../calendar/calendarClient');
const { generateToken } = require('./authController');
const { createCalendarEvents }     = require('../calendar/eventManager');
const User = require('../models/User');
const Plan = require('../models/Plan');

// GET /api/calendar/auth-url
const getCalendarAuthUrl = (req, res) => {
  try {
    const url = getAuthUrl();
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate auth URL' });
  }
};

// GET /api/calendar/callback  ← OAuth redirect lands here
const handleOAuthCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Authorization code missing' });

    const tokens = await getTokens(code);
    const auth   = getAuthenticatedClient(tokens);

    // Fetch user's Google profile
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const { data: gUser } = await oauth2.userinfo.get();

    // Upsert user: if user exists update tokens, otherwise create a new user
    let user = await User.findOne({ email: gUser.email });
    if (user) {
      user.googleTokens = tokens;
      user.googleId = gUser.id;
      await user.save();
    } else {
      user = await User.create({
        name: gUser.name || `${gUser.given_name || ''} ${gUser.family_name || ''}`.trim(),
        email: gUser.email,
        googleId: gUser.id,
        googleTokens: tokens
      });
    }

    // Issue JWT so frontend can auto-login the user after OAuth
    const token = generateToken(user._id);
    const redirectUrl = `${process.env.CLIENT_URL}/settings?calendar=connected&token=${encodeURIComponent(token)}`;
    res.redirect(redirectUrl);
  } catch (err) { next(err); }
};

// GET /api/calendar/status
const getCalendarStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('googleTokens');
    res.json({ connected: !!user?.googleTokens?.access_token });
  } catch (err) { next(err); }
};

// POST /api/calendar/sync/:planId
const syncPlanToCalendar = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.planId, userId: req.user.userId });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const eventIds = await createCalendarEvents(req.user.userId, plan);

    eventIds.forEach(({ stepId, eventId }) => {
      const step = plan.steps.id(stepId);
      if (step) step.calendarEventId = eventId;
    });
    plan.calendarSynced = true;
    await plan.save();

    res.json({
      message:      `Synced to Google Calendar ✅`,
      syncedEvents: eventIds.length,
      plan
    });
  } catch (err) { next(err); }
};

module.exports = {
  getCalendarAuthUrl,
  handleOAuthCallback,
  syncPlanToCalendar,
  getCalendarStatus
};