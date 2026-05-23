export const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' });
  } catch { return String(d); }
};

export const formatTime = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};
