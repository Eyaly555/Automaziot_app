import React from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import { useZohoIntegration } from '../hooks/useZohoIntegration';

export const ZohoModeIndicator: React.FC = () => {
  const { currentMeeting } = useMeetingStore();
  const { syncStatus, syncToZoho } = useZohoIntegration();
  const zoho = currentMeeting?.zohoIntegration;

  if (!zoho) return null;

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return '🔄';
      case 'error':
        return '⚠️';
      default:
        return '✓';
    }
  };

  const formatSyncTime = (time?: string) => {
    if (!time) return 'לא סונכרן';
    const date = new Date(time);
    return `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString(
      'he-IL',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )}`;
  };

  return (
    <div
      dir="rtl"
      className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">מצב Zoho</span>
        <span className="text-xs opacity-90">
          ID: {zoho.recordId.slice(-8)}
        </span>
      </div>

      <div className="h-4 w-px bg-white/30" />

      <div className="flex items-center gap-2">
        <span className="text-lg">{getSyncIcon()}</span>
        <div className="text-xs">
          <div>סנכרון אחרון:</div>
          <div className="opacity-90">{formatSyncTime(zoho.lastSyncTime)}</div>
        </div>
      </div>

      <button
        onClick={syncToZoho}
        disabled={syncStatus === 'syncing'}
        className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors disabled:opacity-50"
      >
        {syncStatus === 'syncing' ? 'מסנכרן...' : 'סנכרן עכשיו'}
      </button>
    </div>
  );
};
