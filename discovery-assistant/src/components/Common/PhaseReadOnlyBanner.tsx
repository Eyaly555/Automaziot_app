import React from 'react';
import { Lock, Info } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';

interface PhaseReadOnlyBannerProps {
  moduleName?: string;
  className?: string;
}

/**
 * PhaseReadOnlyBanner Component
 *
 * Displays a warning banner when viewing a module in read-only mode
 * (i.e., when the meeting is in a phase beyond discovery).
 *
 * Features:
 * - Automatically detects if current phase is beyond discovery
 * - Shows lock icon and informative message
 * - Customizable styling
 * - Can be hidden if not in read-only mode
 *
 * @example
 * <PhaseReadOnlyBanner moduleName="Leads and Sales" />
 */
export const PhaseReadOnlyBanner: React.FC<PhaseReadOnlyBannerProps> = ({
  moduleName,
  className = ''
}) => {
  const { currentMeeting } = useMeetingStore();

  // Don't show banner if in discovery phase or no meeting
  if (!currentMeeting || currentMeeting.phase === 'discovery') {
    return null;
  }

  const phaseNames = {
    implementation_spec: 'מפרט יישום',
    development: 'פיתוח',
    completed: 'הושלם'
  };

  const phaseName = phaseNames[currentMeeting.phase] || currentMeeting.phase;

  return (
    <div className={`mb-6 p-4 bg-amber-50 border-r-4 border-amber-500 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            מודול נעול לעריכה
          </h3>
          <p className="text-xs text-amber-800">
            {moduleName && <span className="font-semibold">{moduleName}: </span>}
            הפגישה נמצאת בשלב "{phaseName}". נתוני הגילוי נעולים לעריכה כדי למנוע שינויים לא מכוונים.
            ניתן לצפות במידע אך לא לערוך אותו.
          </p>
        </div>
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      </div>
    </div>
  );
};
