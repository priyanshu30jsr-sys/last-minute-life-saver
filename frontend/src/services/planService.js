import api from './api';

export const generatePlan = async (userMessage, sessionId) => {
  const { data } = await api.post('/plans/generate', { userMessage, sessionId });
  return data;
};

export const getPlans = async () => {
  const { data } = await api.get('/plans');
  return data;
};

export const getPlanById = async (id) => {
  const { data } = await api.get(`/plans/${id}`);
  return data;
};

export const completeStep = async (planId, stepIndex, payload) => {
  const { data } = await api.patch(
    `/plans/${planId}/steps/${stepIndex}/complete`, payload
  );
  return data;
};

export const deletePlan = async (id) => {
  const { data } = await api.delete(`/plans/${id}`);
  return data;
};