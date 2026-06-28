const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: true,
    trim:     true
  },
  description: {
    type:    String,
    default: ''
  },
  deadline: {
    type: Date
  },
  durationMinutes: {
    type:    Number,
    default: 30,
    min:     5
  },
  day: {
    type:    Number,
    default: 1
  },
  completed: {
    type:    Boolean,
    default: false
  },
  skipped: {
    type:    Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  calendarEventId: {
    type: String
  }
}, { timestamps: true });

module.exports = stepSchema;