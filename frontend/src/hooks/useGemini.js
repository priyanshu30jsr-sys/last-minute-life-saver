import { useState, useCallback } from 'react';
import * as chatService from '../services/chatService';
import * as planService from '../services/planService';

const useGemini = () => {
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [planDetected, setPlanDetected] = useState(false);

  const sendMessage = useCallback(async (message, sessionId) => {
    setLoading(true);
    setError(null);
    setPlanDetected(false);
    try {
      const data = await chatService.sendMessage(message, sessionId);
      setLastResponse(data);
      if (data.planDetected) setPlanDetected(true);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Gemini is unavailable. Try again.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePlan = useCallback(async (userMessage, sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await planService.generatePlan(userMessage, sessionId);
      setLastResponse(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Plan generation failed.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    lastResponse,
    planDetected,
    isThinking: loading,
    sendMessage,
    generatePlan,
    clearError
  };
};

export default useGemini;