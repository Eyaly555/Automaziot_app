import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoMeetingSchedulerConfig {
  schedulingTool:
    | 'calendly'
    | 'microsoft_bookings'
    | 'google_calendar'
    | 'custom';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  calendarSync: boolean;
  autoConfirmation: boolean;
  reminderEnabled: boolean;
  bufferTime: number;
  availabilityRules: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

export function AutoMeetingSchedulerSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const calendarSystem = useSmartField<string>({
    fieldId: 'calendar_system',
    localPath: 'calendarSystem',
    serviceId: 'auto-meeting-scheduler',
    autoSave: false,
  });

  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-meeting-scheduler',
    autoSave: false,
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-meeting-scheduler',
    autoSave: false,
  });
  const [config, setConfig] = useState<Partial<AutoMeetingSchedulerConfig>>({
    schedulingTool: 'calendly',
    crmSystem: 'zoho',
    calendarSync: true,
    autoConfirmation: true,
    reminderEnabled: true,
    bufferTime: 15,
    availabilityRules: [],
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'auto-meeting-scheduler',
    category: 'automations',
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      calendarSystem: calendarSystem.value,
      crmSystem: crmSystem.value,
      alertEmail: alertEmail.value,
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(
      (a: any) => a.serviceId === 'auto-meeting-scheduler'
    );
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.schedulingTool || config.crmSystem) {
      const completeConfig = {
        ...config,
        calendarSystem: calendarSystem.value,
        crmSystem: crmSystem.value,
        alertEmail: alertEmail.value,
      };
      saveData(completeConfig);
    }
  }, [
    config,
    calendarSystem.value,
    crmSystem.value,
    alertEmail.value,
    saveData,
  ]);

  const handleSave = async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      calendarSystem: calendarSystem.value,
      crmSystem: crmSystem.value,
      n8nWorkflow: {
        errorHandling: {
          alertEmail: alertEmail.value,
        },
      },
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig);

    alert('✅ הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #7: תיאום פגישות אוטומטי">
        <div className="space-y-6">
          {/* Smart Fields Info Banner */}
          {(calendarSystem.isAutoPopulated ||
            crmSystem.isAutoPopulated ||
            alertEmail.isAutoPopulated) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  נתונים מולאו אוטומטית משלב 1
                </h4>
                <p className="text-sm text-blue-800">
                  חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1. תוכל
                  לערוך אותם במידת הצורך.
                </p>
              </div>
            </div>
          )}

          {/* Conflict Warnings */}
          {(calendarSystem.hasConflict ||
            crmSystem.hasConflict ||
            alertEmail.hasConflict) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-1">
                  זוהה אי-התאמה בנתונים
                </h4>
                <p className="text-sm text-orange-800">
                  נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
                </p>
              </div>
            </div>
          )}

          {/* Smart Fields Section */}
          <div className="grid grid-cols-1 gap-4">
            {/* Smart Calendar System Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {calendarSystem.metadata.label.he}
                </label>
                {calendarSystem.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <select
                value={calendarSystem.value || 'google'}
                onChange={(e) => calendarSystem.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  calendarSystem.isAutoPopulated
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                } ${calendarSystem.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="google">Google Calendar</option>
                <option value="outlook">Outlook</option>
                <option value="ical">iCal</option>
                <option value="calendly">Calendly</option>
                <option value="other">אחר</option>
              </select>
              {calendarSystem.isAutoPopulated && calendarSystem.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {calendarSystem.source.description}
                </p>
              )}
            </div>

            {/* Smart CRM System Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {crmSystem.metadata.label.he}
                </label>
                {crmSystem.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <select
                value={crmSystem.value || 'zoho'}
                onChange={(e) => crmSystem.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  crmSystem.isAutoPopulated
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="zoho">Zoho CRM</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="monday">Monday CRM</option>
                <option value="other">אחר</option>
              </select>
              {crmSystem.isAutoPopulated && crmSystem.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {crmSystem.source.description}
                </p>
              )}
            </div>

            {/* Smart Alert Email Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {alertEmail.metadata.label.he}
                </label>
                {alertEmail.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <input
                type="email"
                value={alertEmail.value || ''}
                onChange={(e) => alertEmail.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  alertEmail.isAutoPopulated
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
                placeholder="admin@example.com"
              />
              {alertEmail.isAutoPopulated && alertEmail.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {alertEmail.source.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סוג פגישה
                </label>
                <select
                  value={config.meetingType}
                  onChange={(e) =>
                    setConfig({ ...config, meetingType: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="discovery">גילוי דרישות</option>
                  <option value="presentation">מצגת</option>
                  <option value="technical">טכני</option>
                  <option value="closing">סגירה</option>
                  <option value="followup">מעקב</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  משך (דקות)
                </label>
                <select
                  value={config.duration}
                  onChange={(e) =>
                    setConfig({ ...config, duration: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="15">15 דקות</option>
                  <option value="30">30 דקות</option>
                  <option value="45">45 דקות</option>
                  <option value="60">שעה</option>
                  <option value="90">שעה וחצי</option>
                  <option value="120">שעתיים</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תזכורות
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.reminderEmail}
                    onChange={(e) =>
                      setConfig({ ...config, reminderEmail: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">תזכורת במייל</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.reminderSMS}
                    onChange={(e) =>
                      setConfig({ ...config, reminderSMS: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">תזכורת ב-SMS</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.autoReschedule}
                    onChange={(e) =>
                      setConfig({ ...config, autoReschedule: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">
                    תיאום אוטומטי מחדש במקרה של ביטול
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                שמור הגדרות
              </button>
            </div>
          </div>
        </div>
        {/* Smart Fields Info Banner */}
        {(calendarSystem.isAutoPopulated ||
          crmSystem.isAutoPopulated ||
          alertEmail.isAutoPopulated) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                נתונים מולאו אוטומטית משלב 1
              </h4>
              <p className="text-sm text-blue-800">
                חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1. תוכל
                לערוך אותם במידת הצורך.
              </p>
            </div>
          </div>
        )}

        {/* Conflict Warnings */}
        {(calendarSystem.hasConflict ||
          crmSystem.hasConflict ||
          alertEmail.hasConflict) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">
                זוהה אי-התאמה בנתונים
              </h4>
              <p className="text-sm text-orange-800">
                נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
              </p>
            </div>
          </div>
        )}

        {/* Smart Fields Section */}
        <div className="grid grid-cols-1 gap-4">
          {/* Smart Calendar System Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {calendarSystem.metadata.label.he}
              </label>
              {calendarSystem.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={calendarSystem.value || 'google_calendar'}
              onChange={(e) => calendarSystem.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                calendarSystem.isAutoPopulated
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              } ${calendarSystem.hasConflict ? 'border-orange-300' : ''}`}
            >
              <option value="google_calendar">Google Calendar</option>
              <option value="outlook">Outlook Calendar</option>
              <option value="office365">Office 365</option>
              <option value="apple_calendar">Apple Calendar</option>
            </select>
            {calendarSystem.isAutoPopulated && calendarSystem.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {calendarSystem.source.description}
              </p>
            )}
          </div>

          {/* Smart CRM System Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {crmSystem.metadata.label.he}
              </label>
              {crmSystem.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={crmSystem.value || 'zoho'}
              onChange={(e) => crmSystem.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                crmSystem.isAutoPopulated
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
            >
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="monday">Monday CRM</option>
              <option value="other">אחר</option>
            </select>
            {crmSystem.isAutoPopulated && crmSystem.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {crmSystem.source.description}
              </p>
            )}
          </div>

          {/* Smart Alert Email Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {alertEmail.metadata.label.he}
              </label>
              {alertEmail.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <input
              type="email"
              value={alertEmail.value || ''}
              onChange={(e) => alertEmail.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                alertEmail.isAutoPopulated
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
              placeholder="admin@example.com"
            />
            {alertEmail.isAutoPopulated && alertEmail.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {alertEmail.source.description}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כלי תזמון
              </label>
              <select
                value={config.schedulingTool}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    schedulingTool: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="calendly">Calendly</option>
                <option value="microsoft_bookings">Microsoft Bookings</option>
                <option value="google_calendar">Google Calendar</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מערכת CRM
              </label>
              <select
                value={config.crmSystem}
                onChange={(e) =>
                  setConfig({ ...config, crmSystem: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="zoho">Zoho CRM</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="other">אחר</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              זמן חיץ בין פגישות (דקות)
            </label>
            <input
              type="number"
              value={config.bufferTime}
              onChange={(e) =>
                setConfig({ ...config, bufferTime: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              max="60"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.calendarSync}
                onChange={(e) =>
                  setConfig({ ...config, calendarSync: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">סנכרון עם לוח שנה</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoConfirmation}
                onChange={(e) =>
                  setConfig({ ...config, autoConfirmation: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">אישור אוטומטי</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.reminderEnabled}
                onChange={(e) =>
                  setConfig({ ...config, reminderEnabled: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">תזכורות מופעלות</span>
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
