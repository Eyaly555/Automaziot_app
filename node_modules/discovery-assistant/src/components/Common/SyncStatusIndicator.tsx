import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';

export const SyncStatusIndicator: React.FC = () => {
  const { currentMeeting, isSyncing, syncError, lastSyncTime } = useMeetingStore();
  const [showToast, setShowToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Show error toast
  useEffect(() => {
    if (syncError) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  }, [syncError]);

  // Show success toast after sync
  useEffect(() => {
    if (lastSyncTime && !isSyncing) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  }, [lastSyncTime, isSyncing]);

  if (!currentMeeting?.zohoIntegration) {
    return null;
  }

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return '';

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'כרגע';
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    return `לפני ${days} ימים`;
  };

  return (
    <>
      {/* Fixed Status Badge */}
      <div className="fixed bottom-4 left-4 z-50">
        <div
          className={`
            px-4 py-2 rounded-lg shadow-lg flex items-center gap-2
            transition-all duration-300
            ${isSyncing ? 'bg-blue-600 text-white' : ''}
            ${syncError && !isSyncing ? 'bg-red-600 text-white' : ''}
            ${!isSyncing && !syncError ? 'bg-green-600 text-white' : ''}
          `}
        >
          {isSyncing && <RefreshCw className="w-4 h-4 animate-spin" />}
          {syncError && !isSyncing && <AlertCircle className="w-4 h-4" />}
          {!isSyncing && !syncError && <CheckCircle className="w-4 h-4" />}

          <div className="text-sm">
            <div className="font-semibold">
              {isSyncing ? 'מסנכרן עם Zoho...' : ''}
              {syncError && !isSyncing ? 'שגיאת סנכרון' : ''}
              {!isSyncing && !syncError ? 'מסונכרן' : ''}
            </div>
            {!isSyncing && lastSyncTime && (
              <div className="text-xs opacity-90">
                {formatRelativeTime(lastSyncTime)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {showToast && syncError && (
        <div className="fixed top-4 right-4 z-50 animate-slideDown">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-xl max-w-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-1">שגיאת סנכרון עם Zoho</h4>
                <p className="text-sm text-red-700">{syncError}</p>
                <p className="text-xs text-red-600 mt-2">
                  השינויים נשמרו מקומית ויסתנכרנו אוטומטית מאוחר יותר
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && !syncError && (
        <div className="fixed top-4 right-4 z-50 animate-slideDown">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">סונכרן בהצלחה!</h4>
                <p className="text-sm text-green-700">הנתונים עודכנו ב-Zoho</p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
