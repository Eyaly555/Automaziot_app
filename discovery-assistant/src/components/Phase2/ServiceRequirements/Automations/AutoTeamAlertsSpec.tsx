import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoTeamAlertsConfig {
  notificationChannels: string[];
  alertTypes: string[];
  escalationLevels: number;
  workingHoursOnly: boolean;
  customMessageTemplates: boolean;
}

export function AutoTeamAlertsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const notificationChannels = useSmartField<string>({
    fieldId: 'notification_channels',
    localPath: 'communication.notificationChannels',
    serviceId: 'auto-team-alerts',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-team-alerts',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-team-alerts',
    autoSave: false
  });

  const [config, setConfig] = useState<Partial<AutoTeamAlertsConfig>>({
    notificationChannels: [],
    alertTypes: [],
    escalationLevels: 3,
    workingHoursOnly: true,
    customMessageTemplates: false,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-team-alerts');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter((a: any) => a.serviceId !== 'auto-team-alerts');

    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      notificationChannels: notificationChannels.value,
      n8nWorkflow: {
        instanceUrl: n8nInstanceUrl.value,
        errorHandling: {
          alertEmail: alertEmail.value
        }
      }
    };

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-team-alerts',
      serviceName: 'התראות אוטומטיות לצוות',
      serviceNameHe: 'התראות אוטומטיות לצוות',
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
      <Card title="שירות #4: התראות אוטומטיות לצוות">
        <div className="space-y-6">
          {/* Smart Fields Info Banner */}
          {(notificationChannels.isAutoPopulated || alertEmail.isAutoPopulated || n8nInstanceUrl.isAutoPopulated) && (
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
          {(notificationChannels.hasConflict || alertEmail.hasConflict || n8nInstanceUrl.hasConflict) && (
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

          {/* Smart Fields Section */}
          <div className="grid grid-cols-1 gap-4">
            {/* Smart Notification Channels Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {notificationChannels.metadata.label.he}
                </label>
                {notificationChannels.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <select
                value={notificationChannels.value || 'email'}
                onChange={(e) => notificationChannels.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  notificationChannels.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${notificationChannels.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="email">מייל</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="slack">Slack</option>
                <option value="teams">Microsoft Teams</option>
              </select>
              {notificationChannels.isAutoPopulated && notificationChannels.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {notificationChannels.source.description}
                </p>
              )}
            </div>

            {/* Smart n8n Instance URL Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {n8nInstanceUrl.metadata.label.he}
                </label>
                {n8nInstanceUrl.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <input
                type="url"
                value={n8nInstanceUrl.value || ''}
                onChange={(e) => n8nInstanceUrl.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  n8nInstanceUrl.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${n8nInstanceUrl.hasConflict ? 'border-orange-300' : ''}`}
                placeholder="https://n8n.example.com"
              />
              {n8nInstanceUrl.isAutoPopulated && n8nInstanceUrl.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {n8nInstanceUrl.source.description}
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
                  alertEmail.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">רמת הסלמה</label>
                <select value={config.escalationLevels} onChange={(e) => setConfig({ ...config, escalationLevels: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value={1}>1 - התראה בלבד</option>
                  <option value={2}>2 - התראה + מנהל</option>
                  <option value={3}>3 - התראה + מנהל + הנהלה</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ערוצי התראה</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" checked={config.notificationChannels?.includes('email')}
                      onChange={(e) => {
                        const channels = config.notificationChannels || [];
                        if (e.target.checked) {
                          setConfig({ ...config, notificationChannels: [...channels, 'email'] });
                        } else {
                          setConfig({ ...config, notificationChannels: channels.filter(c => c !== 'email') });
                        }
                      }} className="mr-2" />
                    <span className="text-sm">מייל</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={config.notificationChannels?.includes('sms')}
                      onChange={(e) => {
                        const channels = config.notificationChannels || [];
                        if (e.target.checked) {
                          setConfig({ ...config, notificationChannels: [...channels, 'sms'] });
                        } else {
                          setConfig({ ...config, notificationChannels: channels.filter(c => c !== 'sms') });
                        }
                      }} className="mr-2" />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" checked={config.workingHoursOnly}
                  onChange={(e) => setConfig({ ...config, workingHoursOnly: e.target.checked })} className="mr-2" />
                <span className="text-sm">שלח התראות רק בשעות עבודה</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={config.customMessageTemplates}
                  onChange={(e) => setConfig({ ...config, customMessageTemplates: e.target.checked })} className="mr-2" />
                <span className="text-sm">תבניות הודעות מותאמות אישית</span>
              </label>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}