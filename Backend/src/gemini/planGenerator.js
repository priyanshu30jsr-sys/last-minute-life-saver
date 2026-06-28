const { getModel } = require('./geminiClient');
const { SYSTEM_PROMPT } = require('./systemPrompt');

const FALLBACK_RESPONSE = 'I’m having trouble reaching Gemini right now, so I can’t generate a full plan yet. Please try again in a moment, or describe your goal in a shorter message and I’ll help you from there.';
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash'
].filter(Boolean);

const extractPlanJSON = (text) => {
  const match = text.match(/<<<PLAN_START>>>([\s\S]*?)<<<PLAN_END>>>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch (err) {
    console.error('[Gemini] Failed to parse plan JSON:', err.message);
    return null;
  }
};

const extractConversationalText = (text) => {
  return text
    .replace(/<<<PLAN_START>>>[\s\S]*?<<<PLAN_END>>>/g, '')
    .trim();
};

const generatePlan = async (userMessage, chatHistory = []) => {
  // Map history cleanly. System instructions are now stripped from the conversation history array!
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      // Pass the system prompt directly to getModel context configuration 
      const model = getModel(modelName, {
        systemInstruction: SYSTEM_PROMPT
      });

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096
        }
      });

      const result = await chat.sendMessage(userMessage);
      const rawResponse = result.response.text();

      const planData = extractPlanJSON(rawResponse);
      const conversationalText = extractConversationalText(rawResponse);

      return { planData, conversationalText, rawResponse };
    } catch (error) {
      lastError = error;
      console.error(`[Gemini] Model ${modelName} failed:`, error.message);
    }
  }

  console.error('[Gemini] All model attempts failed:', lastError?.message || 'unknown error');

  return {
    planData: null,
    conversationalText: FALLBACK_RESPONSE,
    rawResponse: FALLBACK_RESPONSE,
    fallback: true
  };
};

module.exports = { generatePlan, extractPlanJSON };