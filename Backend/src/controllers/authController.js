const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { getAuthenticatedClient, getAuthUrl } = require('../calendar/calendarClient');
const { google } = require('googleapis');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user  = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        streakCount:  0,
        totalPoints:  0,
        badges:       []
      }
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last active date
    user.lastActiveDate = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        streakCount:   user.streakCount,
        totalPoints:   user.totalPoints,
        badges:        user.badges,
        calendarLinked: !!user.googleTokens?.access_token
      }
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -googleTokens');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// GET /api/auth/google  ← Redirect helper so frontend can start OAuth
const startGoogleAuth = (req, res) => {
  try {
    const url = getAuthUrl();
    // Redirect browser to Google's consent screen
    res.redirect(url);
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate Google OAuth' });
  }
};

module.exports = { register, login, getMe, startGoogleAuth, generateToken };