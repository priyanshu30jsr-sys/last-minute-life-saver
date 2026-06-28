const mongoose = require('mongoose');

const dailyBriefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  date:      { type: Date, required: true },
  briefText: { type: String },
  tasksForToday: [{
    planId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    title:           { type: String },
    priority:        { type: Number },
    durationMinutes: { type: Number }
  }],
  focusMessage:      { type: String },
  generatedByGemini: { type: Boolean, default: true },
  delivered:         { type: Boolean, default: false },
  deliveredAt:       { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('DailyBrief', dailyBriefSchema);