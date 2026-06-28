const { getModel } = require('./geminiClient');
const { SYSTEM_PROMPT } = require('./systemPrompt');
const { extractPlanJSON } = require('./planGenerator');

const replanAfterMissedStep = async (plan, missedStepIndex) => {
  const model = getModel();

  const now          = new Date();
  const deadline     = new Date(plan.deadline);
  const hoursLeft    = Math.max(0, Math.floor((deadline - now) / (1000 * 60 * 60)));
  const daysLeft     = Math.floor(hoursLeft / 24);
  const completedCount = plan.steps.filter(s => s.completed).length;
  const missedStep   = plan.steps[missedStepIndex];

  const replanPrompt = `
AUTONOMOUS REPLAN — DO NOT WAIT FOR USER INSTRUCTION

Original Goal: ${plan.goal}
Original Deadline: ${plan.deadline}
Time Remaining: ${hoursLeft} hours (${daysLeft} days)
Steps Completed: ${completedCount} out of ${plan.steps.length}

MISSED STEP (index ${missedStepIndex}): "${missedStep?.title}"
Reason skipped: User marked as missed/skipped

Current timestamp: ${now.toISOString()}

INSTRUCTION: Without waiting for the user to ask, generate a RECOVERY PLAN covering only
the remaining work. Compress aggressively where possible to still hit the original deadline.
If the deadline is no longer achievable, clearly state what CAN be done and propose a
revised completion target.

Remaining steps that still need to be done:
${plan.steps.slice(missedStepIndex + 1).map((s, i) => `  ${i + 1}. ${s.title}`).join('\n')}

Generate the new plan in the EXACT same JSON format (<<<PLAN_START>>> ... <<<PLAN_END>>>).
Add a brief recovery note before the JSON acknowledging what was missed and what the path forward is.
`;

  const chat = model.startChat({
    history: [
      { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Recovery replan mode activated.' }] }
    ],
    generationConfig: { temperature: 0.6, maxOutputTokens: 3000 }
  });

  const result = await chat.sendMessage(replanPrompt);
  const rawResponse = result.response.text();

  const newPlanData = extractPlanJSON(rawResponse);
  const recoveryMessage = rawResponse
    .replace(/<<<PLAN_START>>>[\s\S]*?<<<PLAN_END>>>/g, '')
    .trim();

  return { newPlanData, recoveryMessage };
};

module.exports = { replanAfterMissedStep };