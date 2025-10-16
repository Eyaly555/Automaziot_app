import React from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SaveStatusIndicator: React.FC = () => {
  const { lastSavedTime, isSyncing, syncError } = useMeetingStore();

  if (syncError) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>שגיאה בשמירה</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>שומר...</span>
      </div>
    );
  }

  if (lastSavedTime) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Check className="w-4 h-4" />
        <span>
          נשמר {formatDistanceToNow(lastSavedTime, { addSuffix: true })}
        </span>
      </div>
    );
  }

  return null;
};
