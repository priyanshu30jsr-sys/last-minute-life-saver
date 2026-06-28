export const formatDeadline = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const getDaysLeft = (deadlineStr) => {
  const now  = new Date();
  const dead = new Date(deadlineStr);
  const diff = Math.ceil((dead - now) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return 'Overdue';
  if (diff === 0) return 'Due today';
  if (diff === 1) return '1 day left';
  return `${diff} days left`;
};

export const getPlanProgress = (steps = []) => {
  if (!steps.length) return 0;
  return Math.round((steps.filter(s => s.completed).length / steps.length) * 100);
};

export const getPriorityColor = (score) => {
  if (score >= 8) return '#EA4335';
  if (score >= 5) return '#FBBC04';
  return '#34A853';
};

export const formatDuration = (minutes) => {
  if (minutes < 60)     return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const getStatusColor = (status) => {
  const map = {
    active:    '#4285F4',
    completed: '#34A853',
    'at-risk': '#FBBC04',
    failed:    '#EA4335'
  };
  return map[status] || '#4285F4';
};

export const truncate = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '...' : str;

export const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;