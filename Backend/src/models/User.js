const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true
  },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true
  },
  password: {
    type: String, minlength: 6
  },
  googleId: { type: String },
  googleTokens: {
    access_token:  { type: String },
    refresh_token: { type: String },
    expiry_date:   { type: Number },
    token_type:    { type: String }
  },
  productivityStyle: {
    type: String,
    enum: ['morning', 'night', 'flexible'],
    default: 'flexible'
  },
  timezone:      { type: String, default: 'Asia/Kolkata' },
  streakCount:   { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalPoints:   { type: Number, default: 0 },
  lastActiveDate:{ type: Date },
  badges: [{
    name:     { type: String },
    icon:     { type: String },
    earnedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);