import React, { useState, useEffect } from 'react';
import { useZohoIntegration } from '../hooks/useZohoIntegration';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ZohoNotifications: React.FC = () => {
  const { syncStatus, syncToZoho, isZohoMode } = useZohoIntegration();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);

  // Add notification helper
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);

    // Auto-remove after 5 seconds for non-error notifications
    if (notification.type !== 'error') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Monitor sync status
  useEffect(() => {
    if (syncStatus === 'syncing') {
      setShowSyncIndicator(true);
    } else if (syncStatus === 'idle' && showSyncIndicator) {
      setShowSyncIndicator(false);
      setLastSyncTime(new Date());
      addNotification({
        type: 'success',
        message: 'נתונים סונכרנו בהצלחה עם Zoho CRM'
      });
    } else if (syncStatus === 'error') {
      setShowSyncIndicator(false);
      addNotification({
        type: 'error',
        message: 'שגיאה בסנכרון עם Zoho CRM',
        action: {
          label: 'נסה שוב',
          onClick: () => syncToZoho()
        }
      });
    }
  }, [syncStatus, showSyncIndicator, syncToZoho]);

  if (!isZohoMode) return null;

  return (
    <>
      {/* Sync Status Indicator */}
      {showSyncIndicator && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 z-50">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-gray-700">מסנכרן עם Zoho CRM...</span>
        </div>
      )}

      {/* Last Sync Time */}
      {lastSyncTime && !showSyncIndicator && (
        <div className="fixed bottom-4 left-4 text-xs text-gray-500">
          סונכרן לאחרונה: {lastSyncTime.toLocaleTimeString('he-IL')}
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2" dir="rtl">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`
              rounded-lg shadow-lg p-4 max-w-sm animate-slide-in
              ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : ''}
              ${notification.type === 'error' ? 'bg-red-50 border border-red-200' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : ''}
              ${notification.type === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`text-sm ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>

                {/* Action button */}
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className={`mt-2 text-sm font-medium underline ${
                      notification.type === 'error' ? 'text-red-700 hover:text-red-800' :
                      notification.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' :
                      'text-blue-700 hover:text-blue-800'
                    }`}
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};