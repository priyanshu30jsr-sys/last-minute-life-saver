const ChatHistory = require('../models/ChatHistory');
const { generatePlan } = require('../gemini/planGenerator');
const { v4: uuidv4 } = require('uuid');

// POST /api/chat/message
const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.userId;

    if (!message) return res.status(400).json({ message: 'message is required' });

    const activeSessionId = sessionId || uuidv4();
    let session = await ChatHistory.findOne({ userId, sessionId: activeSessionId });
    if (!session) {
      session = new ChatHistory({ userId, sessionId: activeSessionId, messages: [] });
    }

    const { conversationalText, planData } = await generatePlan(message, session.messages);

    session.messages.push(
      { role: 'user',  content: message },
      { role: 'model', content: conversationalText, planGenerated: !!planData }
    );
    await session.save();

    res.json({
      response:     conversationalText,
      sessionId:    activeSessionId,
      planDetected: !!planData,
      planData      // Frontend uses this to show a "Create Plan" confirm button
    });
  } catch (err) { next(err); }
};

// GET /api/chat/sessions
const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatHistory
      .find({ userId: req.user.userId })
      .select('sessionId createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (err) { next(err); }
};

// GET /api/chat/history/:sessionId
const getChatHistory = async (req, res, next) => {
  try {
    const session = await ChatHistory.findOne({
      userId:    req.user.userId,
      sessionId: req.params.sessionId
    });
    res.json(session || { messages: [], sessionId: req.params.sessionId });
  } catch (err) { next(err); }
};

module.exports = { sendMessage, getChatHistory, getSessions };