import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { validateServiceRequirements } from '../../utils/serviceRequirementsValidation';

/**
 * IncompleteServicesAlert Component
 *
 * Displays a warning alert when there are services that haven't had their
 * technical requirement forms completed in Phase 2.
 *
 * This component appears on Phase 2 dashboards to remind users that all
 * purchased services must have completed technical specs before moving to Phase 3.
 */
export const IncompleteServicesAlert: React.FC = () => {
  const { currentMeeting } = useMeetingStore();

  // Get purchased services and validate completion
  const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];
  const validation = validateServiceRequirements(
    purchasedServices,
    currentMeeting?.implementationSpec || {}
  );

  // Don't render if all services are complete or there are no services
  if (validation.isValid || purchasedServices.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg" dir="rtl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-orange-900">
            יש שירותים שטרם הושלמו
          </h4>
          <p className="text-sm text-orange-800 mt-1">
            לא ניתן לעבור לשלב הפיתוח לפני השלמת הפרטים הטכניים עבור כל השירותים:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-orange-800 space-y-1">
            {validation.missingServices.map(service => (
              <li key={service}>{service}</li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm">
              {validation.completedCount > 0 && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              <span className="text-orange-700 font-medium">
                התקדמות: {validation.completedCount} מתוך {validation.totalCount} שירותים הושלמו
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CompletionProgressBar Component
 *
 * Shows a visual progress bar for service requirements completion.
 * Can be used separately in dashboards or combined with the alert.
 */
export const CompletionProgressBar: React.FC = () => {
  const { currentMeeting } = useMeetingStore();

  const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];
  const validation = validateServiceRequirements(
    purchasedServices,
    currentMeeting?.implementationSpec || {}
  );

  if (purchasedServices.length === 0) {
    return null;
  }

  const percentage = validation.totalCount > 0
    ? Math.round((validation.completedCount / validation.totalCount) * 100)
    : 0;

  const isComplete = validation.isValid;

  return (
    <div className="w-full" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          השלמת דרישות שירותים
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {validation.completedCount} / {validation.totalCount}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-600' : 'bg-orange-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-600 text-right">
        {isComplete ? (
          <span className="text-green-600 font-medium">✓ כל השירותים הושלמו</span>
        ) : (
          <span>נותרו {validation.missingServices.length} שירותים להשלמה</span>
        )}
      </div>
    </div>
  );
};
