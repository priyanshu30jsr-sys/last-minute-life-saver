const { google } = require('googleapis');
const { getAuthenticatedClient, getValidTokens } = require('./tokenManager');

const createCalendarEvents = async (userId, plan) => {
  const tokens   = await getValidTokens(userId);
  const auth     = getAuthenticatedClient(tokens);
  const calendar = google.calendar({ version: 'v3', auth });

  const createdEventIds = [];

  for (const step of plan.steps) {
    const endTime   = new Date(step.deadline);
    const startTime = new Date(endTime.getTime() - step.durationMinutes * 60_000);

    const event = {
      summary: `🎯 ${step.title}`,
      description: [
        step.description,
        '',
        `📋 Plan: ${plan.title}`,
        `🤖 Scheduled autonomously by LifeSaver AI (Powered by Gemini · Google AI Studio)`
      ].join('\n'),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      colorId: '9', // Blueberry — Google blue
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 }
        ]
      },
      source: {
        title: 'LifeSaver AI',
        url: process.env.CLIENT_URL || 'https://lifesaver.app'
      }
    };

    try {
      const created = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      createdEventIds.push({ stepId: step._id, eventId: created.data.id });
    } catch (err) {
      console.error(`[Calendar] Failed to create event for "${step.title}":`, err.message);
    }
  }

  return createdEventIds;
};

const deleteCalendarEvent = async (userId, eventId) => {
  try {
    const tokens   = await getValidTokens(userId);
    const auth     = getAuthenticatedClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({ calendarId: 'primary', eventId });
  } catch (err) {
    console.error('[Calendar] Delete event failed:', err.message);
  }
};

module.exports = { createCalendarEvents, deleteCalendarEvent };