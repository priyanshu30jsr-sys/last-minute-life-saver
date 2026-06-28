import api from './api';

export const getCalendarAuthUrl = async () => {
  const { data } = await api.get('/calendar/auth-url');
  return data.url;
};

export const getCalendarStatus = async () => {
  const { data } = await api.get('/calendar/status');
  return data;
};

export const syncPlanToCalendar = async (planId) => {
  const { data } = await api.post(`/calendar/sync/${planId}`);
  return data;
};

export const getUserStats = async () => {
  const { data } = await api.get('/users/stats');
  return data;
};

export const getDailyBrief = async () => {
  const { data } = await api.get('/users/daily-brief');
  return data;
};