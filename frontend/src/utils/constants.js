export const COLORS = {
  navy:   '#0A0F1E',
  gblu:   '#4285F4',
  gred:   '#EA4335',
  gyel:   '#FBBC04',
  ggrn:   '#34A853',
  gpurp:  '#8B5CF6',
  glass:  'rgba(255,255,255,0.05)'
};

export const GOOGLE_GRADIENT = [
  '#4285F4', '#EA4335', '#FBBC04', '#34A853'
];

export const STATUS_COLORS = {
  active:    '#4285F4',
  completed: '#34A853',
  'at-risk': '#FBBC04',
  failed:    '#EA4335'
};

export const STATUS_LABELS = {
  active:    'On Track',
  completed: 'Completed',
  'at-risk': 'At Risk',
  failed:    'Overdue'
};

export const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:8080/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

export const BADGE_TYPES = {
  FIRST_PLAN:    { name: 'First Mission',  icon: '🚀' },
  STREAK_7:      { name: '7-Day Streak',   icon: '🔥' },
  STREAK_30:     { name: '30-Day Legend',  icon: '⚡' },
  PERFECT_DAY:   { name: 'Perfect Day',    icon: '✨' },
  EARLY_BIRD:    { name: 'Early Bird',     icon: '🌅' },
  SPEED_RUN:     { name: 'Speed Run',      icon: '⚡' },
  COMEBACK_KID:  { name: 'Comeback Kid',   icon: '💪' }
};