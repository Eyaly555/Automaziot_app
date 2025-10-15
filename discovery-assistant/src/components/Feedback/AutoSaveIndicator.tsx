import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Cloud, CloudOff, AlertCircle, Loader2 } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

/**
 * Auto Save Indicator Component
 * Real-time save status indicator with smooth animations
 * Shows save state, sync status, and errors
 */
export const AutoSaveIndicator: React.FC = () => {
  const { currentMeeting, lastSavedTime } = useMeetingStore();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const isEnglish = currentMeeting?.phase === 'development';

  // Monitor Zustand save state changes
  useEffect(() => {
    if (lastSavedTime) {
      setSaveStatus('saved');

      // Auto-hide after 3 seconds
      const timeoutId = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [lastSavedTime]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      if (saveStatus === 'offline') {
        setSaveStatus('idle');
      }
    };
    const handleOffline = () => setSaveStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setSaveStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [saveStatus]);

  // Format last save time
  const formatLastSaveTime = (date: Date | string): string => {
    const now = new Date();
    // Handle both Date objects and string dates from localStorage
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return isEnglish ? 'Just now' : 'כעת';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return isEnglish
        ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
        : `לפני ${minutes} ${minutes === 1 ? 'דקה' : 'דקות'}`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return isEnglish
        ? `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
        : `לפני ${hours} ${hours === 1 ? 'שעה' : 'שעות'}`;
    }
  };

  // Status configuration
  const statusConfig = {
    idle: {
      icon: null,
      text: '',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
    },
    saving: {
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      text: isEnglish ? 'Saving...' : 'שומר...',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    saved: {
      icon: <Check className="w-4 h-4" />,
      text: isEnglish ? 'Saved' : 'נשמר',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4" />,
      text: isEnglish ? 'Save failed' : 'שמירה נכשלה',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    offline: {
      icon: <CloudOff className="w-4 h-4" />,
      text: isEnglish ? 'Offline' : 'לא מקוון',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  };

  const config = statusConfig[saveStatus];

  // Don't show if idle
  if (saveStatus === 'idle') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-4 ${isEnglish ? 'left-4' : 'right-4'} z-50`}
        dir={isEnglish ? 'ltr' : 'rtl'}
      >
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg shadow-md
            ${config.bgColor}
            ${config.color}
          `}
        >
          {config.icon}
          <span className="text-sm font-medium">{config.text}</span>
          {saveStatus === 'saved' && lastSavedTime && (
            <span className="text-xs text-gray-500">
              • {formatLastSaveTime(lastSavedTime)}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
