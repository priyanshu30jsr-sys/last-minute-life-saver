import api from './api';

export const sendMessage = async (text, sessionId) => {
  // Sending both 'text' and 'message' fields ensures that whatever naming convention 
  // your backend controller schema enforces, the validation passes.
  const { data } = await api.post('/chat/message', { 
    text: text, 
    message: text, 
    sessionId 
  });
  return data;
};

export const getChatHistory = async (sessionId) => {
  const { data } = await api.get(`/chat/history/${sessionId}`);
  return data;
};

export const getSessions = async () => {
  const { data } = await api.get('/chat/sessions');
  return data;
};