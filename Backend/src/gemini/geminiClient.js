const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGeminiClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Accept an additional options payload to safely pipe system configurations
const getModel = (modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash', options = {}) => {
  return getGeminiClient().getGenerativeModel({ 
    model: modelName,
    ...options
  });
};

module.exports = { getGeminiClient, getModel };