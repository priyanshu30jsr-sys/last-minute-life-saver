const Plan         = require('../models/Plan');
const User         = require('../models/User');
const path = require('path');
const modelPath = path.join(__dirname, '..', 'models', 'ChatHistory.js');

const ChatHistory = require(modelPath);
const { generatePlan }          = require('../gemini/planGenerator');
const { replanAfterMissedStep } = require('../gemini/replanEngine');
const { createCalendarEvents }  = require('../calendar/eventManager');
const { getSocketIO }           = require('../socket/socketManager');

// POST /api/plans/generate
const generateNewPlan = async (req, res, next) => {
  try {
    const { userMessage, sessionId } = req.body;
    const userId = req.user.userId;

    if (!userMessage) {
      return res.status(400).json({ message: 'userMessage is required' });
    }

    // Load chat history for multi-turn context
    let chatSession = await ChatHistory.findOne({ userId, sessionId });
    const history   = chatSession?.messages || [];

    // Call Gemini
    const { planData, conversationalText } = await generatePlan(userMessage, history);

    // Update chat session regardless of whether a plan was generated
    if (!chatSession) {
      chatSession = new ChatHistory({ userId, sessionId, messages: [] });
    }

    if (!planData) {
      // Gemini gave a conversational reply — no plan this time
      chatSession.messages.push(
        { role: 'user',  content: userMessage },
        { role: 'model', content: conversationalText }
      );
      await chatSession.save();
      return res.json({ planGenerated: false, message: conversationalText });
    }

    // Save plan to MongoDB
    const plan = await Plan.create({
      userId,
      title:           planData.planTitle,
      goal:            planData.goal,
      deadline:        new Date(planData.deadline),
      steps:           planData.steps.map(s => ({
        title:           s.title,
        description:     s.description || '',
        deadline:        new Date(s.deadline),
        durationMinutes: s.durationMinutes || 30
      })),
      priorityScore:   planData.priorityScore || 5,
      motivationalNote:planData.motivationalNote || '',
      tags:            planData.tags || [],
      createdByGemini: true
    });

    // Save to chat history with planId reference
    chatSession.messages.push(
      { role: 'user',  content: userMessage },
      { role: 'model', content: conversationalText, planGenerated: true, planId: plan._id }
    );
    await chatSession.save();

    // Auto-sync to Google Calendar (non-blocking — don't fail the whole request)
    let calendarSynced = false;
    try {
      const user = await User.findById(userId);
      if (user?.googleTokens?.access_token) {
        const eventIds = await createCalendarEvents(userId, plan);
        eventIds.forEach(({ stepId, eventId }) => {
          const step = plan.steps.id(stepId);
          if (step) step.calendarEventId = eventId;
        });
        plan.calendarSynced = true;
        calendarSynced      = true;
        await plan.save();
      }
    } catch (calErr) {
      console.warn('[Calendar] Auto-sync skipped:', calErr.message);
    }

    // Notify frontend via Socket.io
    const io = getSocketIO();
    io.to(userId.toString()).emit('plan:created', {
      planId:  plan._id,
      title:   plan.title,
      calendarSynced
    });

    res.status(201).json({
      planGenerated: true,
      plan,
      message: conversationalText,
      calendarSynced
    });
  } catch (err) { next(err); }
};

// GET /api/plans
const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ userId: req.user.userId })
      .sort({ priorityScore: -1, createdAt: -1 });
    res.json(plans);
  } catch (err) { next(err); }
};

// GET /api/plans/:id
const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) { next(err); }
};

// PATCH /api/plans/:planId/steps/:stepIndex/complete
const completeStep = async (req, res, next) => {
  try {
    const { planId, stepIndex } = req.params;
    const { completed, skipped } = req.body;
    const userId = req.user.userId;

    const plan = await Plan.findOne({ _id: planId, userId });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const idx  = parseInt(stepIndex);
    const step = plan.steps[idx];
    if (!step) return res.status(404).json({ message: 'Step not found' });

    step.completed = !!completed;
    step.skipped   = !!skipped;
    if (completed) step.completedAt = new Date();

    // AUTONOMOUS REPLAN — triggers when user marks step as skipped
    if (skipped && !completed) {
      plan.replanCount     += 1;
      plan.lastReplannedAt  = new Date();
      plan.updateStatus(); // Update status to 'at-risk' if needed
      await plan.save();

      // Fire replan asynchronously — respond immediately, push update via socket
      setImmediate(() => {
        (async () => {
          try {
            const { newPlanData, recoveryMessage } = await replanAfterMissedStep(plan, idx);

            if (newPlanData?.steps?.length) {
              const keptSteps = plan.steps.slice(0, idx + 1);
              const newSteps  = newPlanData.steps.map(s => ({
                title:           s.title,
                description:     s.description || '',
                deadline:        new Date(s.deadline),
                durationMinutes: s.durationMinutes || 30
              }));

              plan.steps           = [...keptSteps, ...newSteps];
              plan.motivationalNote = newPlanData.motivationalNote || plan.motivationalNote;
              await plan.save();

              const io = getSocketIO();
              io.to(userId.toString()).emit('plan:replanned', {
                planId:          plan._id,
                newSteps,
                recoveryMessage,
                totalSteps:      plan.steps.length
              });
            }
          } catch (replanErr) {
            console.error('[Replan] Autonomous replan failed:', replanErr.message);
          }
        })().catch(err => {
          console.error('[Replan] Unhandled promise rejection:', err);
        });
      });

      return res.json({
        message:    'Step marked skipped. LifeSaver AI is building your recovery plan...',
        replanning: true
      });
    }

    plan.updateStatus();
    await plan.save();

    // Award points for completions
    if (completed) {
      await User.findByIdAndUpdate(userId, { $inc: { totalPoints: 10 } });
    }

    const io = getSocketIO();
    io.to(userId.toString()).emit('step:updated', { planId, stepIndex: idx, completed });

    res.json({
      plan,
      message: completed ? '✅ Step complete! +10 points earned.' : 'Step updated.'
    });
  } catch (err) { next(err); }
};

// DELETE /api/plans/:id
const deletePlan = async (req, res, next) => {
  try {
    const deleted = await Plan.findOneAndDelete({
      _id: req.params.id, userId: req.user.userId
    });
    if (!deleted) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { generateNewPlan, getPlans, getPlanById, completeStep, deletePlan };