export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const severityToHebrew = (severity: string): string => {
  const map: Record<string, string> = {
    low: 'נמוכה',
    medium: 'בינונית',
    high: 'גבוהה',
    critical: 'קריטית',
  };
  return map[severity] || severity;
};

export const severityToColor = (severity: string): string => {
  const map: Record<string, string> = {
    low: 'text-yellow-600 bg-yellow-50',
    medium: 'text-orange-600 bg-orange-50',
    high: 'text-red-600 bg-red-50',
    critical: 'text-red-800 bg-red-100',
  };
  return map[severity] || '';
};

export const moduleToHebrew = (module: string): string => {
  const map: Record<string, string> = {
    overview: 'סקירה כללית',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    operations: 'תפעול פנימי',
    reporting: 'דוחות והתראות',
    aiAgents: 'סוכני AI',
    systems: 'מערכות וטכנולוגיה',
    roi: 'ROI וכימות',
    planning: 'סיכום ותכנון',
  };
  return map[module] || module;
};
