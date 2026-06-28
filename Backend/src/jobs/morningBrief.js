const cron                 = require('node-cron');
const User                 = require('../models/User');
const Plan                 = require('../models/Plan');
const DailyBrief           = require('../models/DailyBrief');
const { generateDailyBrief } = require('../gemini/dailyBriefGenerator');
const { getSocketIO }      = require('../socket/socketManager');

const sendMorningBriefs = async () => {
  console.log('🌅 Morning brief job started...');
  let successCount = 0;

  try {
    const users = await User.find({});
    const now = new Date();

    for (const user of users) {
      try {
        // Check if it's 7:00 AM in user's timezone
        const userTimezone = user.timezone || 'Asia/Kolkata';
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: userTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const userTime = formatter.format(now);
        const [hours, minutes] = userTime.split(':').map(Number);

        // Only send brief if it's between 7:00 AM and 7:05 AM in user's timezone
        if (hours !== 7 || minutes >= 5) continue;

        const activePlans = await Plan.find({
          userId: user._id,
          status: { $in: ['active', 'at-risk'] }
        });

        if (activePlans.length === 0) continue;

        // Generate personalized brief via Gemini
        const briefData = await generateDailyBrief(user, activePlans);

        // Persist to MongoDB so user sees it on next login even if offline now
        await DailyBrief.create({
          userId:            user._id,
          date:              new Date(),
          briefText:         briefData.briefText,
          tasksForToday:     briefData.tasksForToday.map(t => ({
            title:           t.title,
            priority:        t.priority,
            durationMinutes: t.durationMinutes
          })),
          focusMessage:      briefData.focusMessage,
          generatedByGemini: true,
          delivered:         true,
          deliveredAt:       new Date()
        });

        // Push live to connected sockets
        try {
          const io = getSocketIO();
          io.to(user._id.toString()).emit('brief:morning', {
            briefText:     briefData.briefText,
            tasksForToday: briefData.tasksForToday,
            focusMessage:  briefData.focusMessage
          });
        } catch {
          // User is offline — brief saved in DB for next session
        }

        successCount++;
      } catch (userErr) {
        console.error(`[MorningBrief] Failed for user ${user._id}:`, userErr.message);
      }
    }

    console.log(`✅ Morning briefs sent: ${successCount}/${users.length} users`);
  } catch (err) {
    console.error('[MorningBrief] Job failed:', err.message);
  }
};

const startMorningBriefJob = () => {
  // Run every 5 minutes during potential morning hours (6:00-8:00 AM UTC covers most timezones' 7 AM)
  cron.schedule('*/5 6-8 * * *', sendMorningBriefs, {
    scheduled: true,
    timezone:  'UTC'
  });
  console.log('⏰ Morning brief cron scheduled → checks every 5 minutes for user timezone 7:00 AM');
};

module.exports = { startMorningBriefJob };