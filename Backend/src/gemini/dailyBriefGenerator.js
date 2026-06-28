const { getModel } = require('./geminiClient');

const generateDailyBrief = async (user, activePlans) => {
  const model = getModel();
  const today = new Date().toDateString();

  const plansContext = activePlans.map(plan => {
    const todaySteps = plan.steps.filter(s => {
      if (s.completed) return false;
      const stepDay = new Date(s.deadline).toDateString();
      return stepDay === today;
    });

    return {
      title:           plan.title,
      goal:            plan.goal,
      deadline:        new Date(plan.deadline).toDateString(),
      priorityScore:   plan.priorityScore,
      completedSteps:  plan.steps.filter(s => s.completed).length,
      totalSteps:      plan.steps.length,
      status:          plan.status,
      todaysSteps:     todaySteps.map(s => s.title)
    };
  });

  const prompt = `
You are generating a personalized morning productivity brief for ${user.name}.
Today is ${today}. The user's productivity style is "${user.productivityStyle}".
Current streak: ${user.streakCount} days. Total points: ${user.totalPoints}.

Their active plans and today's pending steps:
${JSON.stringify(plansContext, null, 2)}

Generate a motivating, personalized morning brief. Respond ONLY with valid JSON (no markdown, no backticks):

{
  "briefText": "2-3 sentences — energizing, personalized morning message referencing their specific goals",
  "tasksForToday": [
    {
      "title": "specific step title",
      "planTitle": "which plan this belongs to",
      "priority": 1,
      "durationMinutes": 30,
      "why": "one sentence on urgency or impact"
    }
  ],
  "focusMessage": "One powerful sentence for their entire day — make it specific to their situation"
}

Rules:
- Max 5 tasks in tasksForToday
- Rank by urgency × impact, not just deadline
- If streak > 5, acknowledge it
- If any plan is "at-risk", make that the #1 task
`;

  const result = await model.generateContent(prompt);
  const text   = result.response.text().replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    // Fallback brief if JSON parsing fails
    return {
      briefText: `Good morning, ${user.name}! You have ${activePlans.length} active plan(s) today. Let's get moving.`,
      tasksForToday: [],
      focusMessage:  'One step at a time. You have everything you need.'
    };
  }
};

module.exports = { generateDailyBrief };