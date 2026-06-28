const mongoose = require('mongoose');

const stepSchema = require('./Step');

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  title:          { type: String, required: true },
  goal:           { type: String, required: true },
  deadline:       { type: Date, required: true },
  steps:          [stepSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'at-risk', 'failed'],
    default: 'active'
  },
  priorityScore:   { type: Number, default: 5, min: 1, max: 10 },
  motivationalNote:{ type: String },
  createdByGemini: { type: Boolean, default: true },
  calendarSynced:  { type: Boolean, default: false },
  replanCount:     { type: Number, default: 0 },
  lastReplannedAt: { type: Date },
  tags:            [String]
}, { timestamps: true });

// Compute and update plan status based on step state
planSchema.methods.updateStatus = function () {
  const total     = this.steps.length;
  if (total === 0) return;

  const completed = this.steps.filter(s => s.completed).length;
  const missed    = this.steps.filter(
    s => !s.completed && s.deadline && s.deadline < new Date()
  ).length;

  if (completed === total)               this.status = 'completed';
  else if (missed > total * 0.3)         this.status = 'at-risk';
  else if (new Date() > this.deadline)   this.status = 'failed';
  else                                   this.status = 'active';
};

module.exports = mongoose.model('Plan', planSchema);