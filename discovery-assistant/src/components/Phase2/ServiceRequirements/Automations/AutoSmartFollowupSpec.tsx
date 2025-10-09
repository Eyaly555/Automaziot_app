import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoSmartFollowupConfig {
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  emailService: 'sendgrid' | 'mailgun' | 'smtp' | 'gmail' | 'outlook';
  followupSequences: Array<{
    id: string;
    name: string;
    dayDelay: number;
    emailTemplate: string;
  }>;
  aiPersonalization: boolean;
  stopOnReply: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
}

/**
 * Smart Auto Smart Followup Spec Component
 *
 * NOW WITH INTELLIGENT FIELD PRE-POPULATION:
 * - Auto-fills CRM system from Phase 1 if already selected
 * - Auto-fills email provider from automation requirements
 * - Auto-fills alert email from company contact or automation defaults
 * - Shows "Auto-filled from Phase 1" badges
 * - Detects and warns about conflicts
 */
export function AutoSmartFollowupSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-smart-followup',
    autoSave: false // We'll batch save
  });

  const emailProvider = useSmartField<string>({
    fieldId: 'email_provider',
    localPath: 'emailService',
    serviceId: 'auto-smart-followup',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'auto-smart-followup',
    autoSave: false
  });

  // Regular state for other fields (not in registry yet)
  const [config, setConfig] = useState<Partial<AutoSmartFollowupConfig>>({
    followupSequences: [],
    aiPersonalization: false,
    stopOnReply: true,
    trackOpens: true,
    trackClicks: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-smart-followup');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter((a: any) => a.serviceId !== 'auto-smart-followup');

    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      emailService: emailProvider.value,
      alertEmail: alertEmail.value
    };

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-smart-followup',
      serviceName: 'מעקב אוטומטי חכם אחרי לידים',
      serviceNameHe: 'מעקב אוטומטי חכם אחרי לידים',
      requirements: completeConfig,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });

    alert('✅ הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with smart field indicators */}
      <Card title="שירות #6: Follow-up חכם ואוטומטי">
        <div className="space-y-6">
          {/* Smart Fields Info Banner */}
          {(crmSystem.isAutoPopulated || emailProvider.isAutoPopulated || alertEmail.isAutoPopulated) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">נתונים מולאו אוטומטית משלב 1</h4>
                <p className="text-sm text-blue-800">
                  חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1.
                  תוכל לערוך אותם במידת הצורך.
                </p>
              </div>
            </div>
          )}

          {/* Conflict Warnings */}
          {(crmSystem.hasConflict || emailProvider.hasConflict || alertEmail.hasConflict) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-1">זוהה אי-התאמה בנתונים</h4>
                <p className="text-sm text-orange-800">
                  נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                  crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="zoho">Zoho CRM</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="other">אחר</option>
              </select>
              {crmSystem.isAutoPopulated && crmSystem.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {crmSystem.source.description}
                </p>
              )}
            </div>

            {/* Smart Email Provider Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {emailProvider.metadata.label.he}
                </label>
                {emailProvider.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <select
                value={emailProvider.value || 'sendgrid'}
                onChange={(e) => emailProvider.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  emailProvider.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${emailProvider.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="smtp">SMTP</option>
                <option value="gmail">Gmail API</option>
                <option value="outlook">Outlook/Office 365</option>
                <option value="other">אחר</option>
              </select>
              {emailProvider.isAutoPopulated && emailProvider.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {emailProvider.source.description}
                </p>
              )}
            </div>
          </div>

          {/* Alert Email Field */}
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
              placeholder="alerts@company.com"
              className={`w-full px-3 py-2 border rounded-md ${
                alertEmail.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
            />
            {alertEmail.isAutoPopulated && alertEmail.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {alertEmail.source.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.aiPersonalization}
                onChange={(e) => setConfig({ ...config, aiPersonalization: e.target.checked })} className="mr-2" />
              <span className="text-sm">התאמה אישית מבוססת AI</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.stopOnReply}
                onChange={(e) => setConfig({ ...config, stopOnReply: e.target.checked })} className="mr-2" />
              <span className="text-sm">עצור בקבלת תגובה</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.trackOpens}
                onChange={(e) => setConfig({ ...config, trackOpens: e.target.checked })} className="mr-2" />
              <span className="text-sm">עקוב אחר פתיחות</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.trackClicks}
                onChange={(e) => setConfig({ ...config, trackClicks: e.target.checked })} className="mr-2" />
              <span className="text-sm">עקוב אחר קליקים</span>
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
