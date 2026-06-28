const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:          { type: String, enum: ['user', 'model'], required: true },
  content:       { type: String, required: true },
  planGenerated: { type: Boolean, default: false },
  planId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  timestamp:     { type: Date, default: Date.now }
});

const chatHistorySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  messages:  [messageSchema],
  isActive:  { type: Boolean, default: true }
}, { timestamps: true });

// Compound index so we can quickly look up a session
chatHistorySchema.index({ userId: 1, sessionId: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);