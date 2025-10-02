import React from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { calculateROI } from '../../utils/roiCalculator';

export const SummaryTab: React.FC = () => {
  const { currentMeeting, getModuleProgress, getOverallProgress } = useMeetingStore();

  if (!currentMeeting) return null;

  const roiData = calculateROI(currentMeeting);
  const progress = getOverallProgress();
  const moduleProgress = getModuleProgress();

  // Aggregate pain points from all modules
  const getAllPainPoints = () => {
    const painPoints = [...(currentMeeting.painPoints || [])];

    // Add module-specific pain points
    Object.values(currentMeeting.modules).forEach(module => {
      if (module && typeof module === 'object' && 'painPoints' in module) {
        const modulePainPoints = module.painPoints as any[];
        if (Array.isArray(modulePainPoints)) {
          painPoints.push(...modulePainPoints);
        }
      }
    });

    return painPoints;
  };

  const painPoints = getAllPainPoints();

  return (
    <div dir="rtl" className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">סיכום פגישת גילוי</h1>

      {/* Client Overview */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">סקירה כללית</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="text-gray-600 text-sm">שם הלקוח:</span>
            <p className="font-medium">{currentMeeting.clientName}</p>
          </div>
          {currentMeeting.modules.overview?.businessType && (
            <div>
              <span className="text-gray-600 text-sm">סוג עסק:</span>
              <p className="font-medium">{currentMeeting.modules.overview.businessType}</p>
            </div>
          )}
          {currentMeeting.modules.overview?.employees && (
            <div>
              <span className="text-gray-600 text-sm">מספר עובדים:</span>
              <p className="font-medium">{currentMeeting.modules.overview.employees}</p>
            </div>
          )}
          {currentMeeting.modules.overview?.budget && (
            <div>
              <span className="text-gray-600 text-sm">תקציב:</span>
              <p className="font-medium">{currentMeeting.modules.overview.budget}</p>
            </div>
          )}
        </div>

        {currentMeeting.zohoIntegration?.contactInfo && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {currentMeeting.zohoIntegration.contactInfo.email && (
              <div>
                <span className="text-gray-600 text-sm">אימייל:</span>
                <p className="font-medium">{currentMeeting.zohoIntegration.contactInfo.email}</p>
              </div>
            )}
            {currentMeeting.zohoIntegration.contactInfo.phone && (
              <div>
                <span className="text-gray-600 text-sm">טלפון:</span>
                <p className="font-medium">{currentMeeting.zohoIntegration.contactInfo.phone}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Progress Overview */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">התקדמות</h2>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">התקדמות כללית</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {moduleProgress.map(module => (
            <div key={module.moduleId} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                module.status === 'completed' ? 'bg-green-500' :
                module.status === 'in_progress' ? 'bg-yellow-500' :
                'bg-gray-300'
              }`} />
              <span className="text-sm">{module.hebrewName}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points */}
      {painPoints.length > 0 && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">נקודות כאב שזוהו</h2>
          <div className="space-y-3">
            {painPoints.map((point, idx) => (
              <div key={point.id || idx} className="border-r-4 border-red-500 pr-3">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800">{point.description}</p>
                  <span className={`px-2 py-1 text-xs rounded ${
                    point.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    point.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    point.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {point.severity === 'critical' ? 'קריטי' :
                     point.severity === 'high' ? 'גבוה' :
                     point.severity === 'medium' ? 'בינוני' : 'נמוך'}
                  </span>
                </div>
                {point.potentialSaving && (
                  <p className="text-sm text-gray-600 mt-1">
                    חיסכון פוטנציאלי: ₪{point.potentialSaving.toLocaleString('he-IL')}
                  </p>
                )}
                {point.potentialHours && (
                  <p className="text-sm text-gray-600 mt-1">
                    שעות חיסכון: {point.potentialHours} שעות
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ROI Summary */}
      {roiData && (
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">סיכום ROI</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roiData.monthlySavings && roiData.monthlySavings > 0 && (
              <div className="bg-white rounded-lg p-4">
                <span className="text-gray-600 text-sm">חיסכון חודשי</span>
                <p className="text-2xl font-bold text-green-600">
                  ₪{roiData.monthlySavings.toLocaleString('he-IL')}
                </p>
              </div>
            )}
            {roiData.hoursSaved && roiData.hoursSaved > 0 && (
              <div className="bg-white rounded-lg p-4">
                <span className="text-gray-600 text-sm">שעות נחסכות</span>
                <p className="text-2xl font-bold text-blue-600">
                  {roiData.hoursSaved}
                </p>
              </div>
            )}
            {roiData.roiPercentage && roiData.roiPercentage > 0 && (
              <div className="bg-white rounded-lg p-4">
                <span className="text-gray-600 text-sm">החזר השקעה</span>
                <p className="text-2xl font-bold text-purple-600">
                  {roiData.roiPercentage}%
                </p>
              </div>
            )}
            {roiData.paybackMonths && roiData.paybackMonths > 0 && (
              <div className="bg-white rounded-lg p-4">
                <span className="text-gray-600 text-sm">זמן החזר</span>
                <p className="text-2xl font-bold text-orange-600">
                  {roiData.paybackMonths} חודשים
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Challenge */}
      {currentMeeting.modules.overview?.mainChallenge && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">אתגר עיקרי</h2>
          <p className="text-gray-800">{currentMeeting.modules.overview.mainChallenge}</p>
        </section>
      )}

      {/* Notes */}
      {currentMeeting.notes && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">הערות נוספות</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{currentMeeting.notes}</p>
        </section>
      )}

      {/* Zoho Sync Info */}
      {currentMeeting.zohoIntegration && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>מסונכרן עם Zoho CRM - Record ID: {currentMeeting.zohoIntegration.recordId}</p>
          {currentMeeting.zohoIntegration.lastSyncTime && (
            <p>עדכון אחרון: {new Date(currentMeeting.zohoIntegration.lastSyncTime).toLocaleString('he-IL')}</p>
          )}
        </div>
      )}
    </div>
  );
};