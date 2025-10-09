import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoTeamAlertsConfig {
  notificationChannels: ('email' | 'slack' | 'teams' | 'sms' | 'whatsapp')[];
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  triggers: Array<{
    id: string;
    name: string;
    condition: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  slackWebhookUrl?: string;
  teamsWebhookUrl?: string;
  emailRecipients: string[];
  businessHoursOnly: boolean;
}

/**
 * Smart Auto Team Alerts Spec Component
 *
 * NOW WITH INTELLIGENT FIELD PRE-POPULATION:
 * - Auto-fills notification channels from Phase 1 requirements
 * - Auto-fills alert email from company contact or automation defaults
 * - Auto-fills n8n instance URL from Phase 1 automation requirements
 * - Shows "Auto-filled from Phase 1" badges
 * - Detects and warns about conflicts
 */
export function AutoTeamAlertsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const notificationChannels = useSmartField<string[]>({
    fieldId: 'notification_channels',
    localPath: 'notificationChannels',
    serviceId: 'auto-team-alerts',
    autoSave: false // We'll batch save
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'auto-team-alerts',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nInstanceUrl',
    serviceId: 'auto-team-alerts',
    autoSave: false
  });

  const [config, setConfig] = useState<Partial<AutoTeamAlertsConfig>>({
    triggers: [],
    emailRecipients: [],
    businessHoursOnly: false,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-team-alerts');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-team-alerts');

    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      notificationChannels: notificationChannels.value,
      alertEmail: alertEmail.value,
      n8nInstanceUrl: n8nInstanceUrl.value
    };

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-team-alerts',
      serviceName: 'התראות לצוות על לידים חשובים',
      serviceNameHe: 'התראות לצוות על לידים חשובים',
      requirements: completeConfig,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with smart field indicators */}
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

          <div className="space-y-4">
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
            <div className="space-y-2">
              {['email', 'slack', 'teams', 'sms', 'whatsapp'].map((channel) => (
                <label key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationChannels.value?.includes(channel)}
                    onChange={(e) => {
                      const currentChannels = notificationChannels.value || [];
                      let newChannels;
                      if (e.target.checked) {
                        newChannels = [...currentChannels, channel];
                      } else {
                        newChannels = currentChannels.filter(c => c !== channel);
                      }
                      notificationChannels.setValue(newChannels);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{channel}</span>
                </label>
              ))}
            </div>
            {notificationChannels.isAutoPopulated && notificationChannels.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {notificationChannels.source.description}
              </p>
            )}
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

          {/* N8N Instance URL Field */}
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
              placeholder="https://n8n.example.com"
              className={`w-full px-3 py-2 border rounded-md ${
                n8nInstanceUrl.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${n8nInstanceUrl.hasConflict ? 'border-orange-300' : ''}`}
            />
            {n8nInstanceUrl.isAutoPopulated && n8nInstanceUrl.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {n8nInstanceUrl.source.description}
              </p>
            )}
          </div>

          {config.notificationChannels?.includes('slack') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slack Webhook URL
              </label>
              <input
                type="url"
                value={config.slackWebhookUrl || ''}
                onChange={(e) => setConfig({ ...config, slackWebhookUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          )}

          {config.notificationChannels?.includes('teams') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teams Webhook URL
              </label>
              <input
                type="url"
                value={config.teamsWebhookUrl || ''}
                onChange={(e) => setConfig({ ...config, teamsWebhookUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://outlook.office.com/webhook/..."
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.businessHoursOnly}
                onChange={(e) => setConfig({ ...config, businessHoursOnly: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">שלח התראות רק בשעות עבודה</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
