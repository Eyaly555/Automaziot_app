import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

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

export function AutoTeamAlertsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<Partial<AutoTeamAlertsConfig>>({
    notificationChannels: ['email', 'slack'],
    crmSystem: 'zoho',
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

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-team-alerts',
      serviceName: 'התראות לצוות על לידים חשובים',
      requirements: config,
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
      <Card title="שירות #4: התראות אוטומטיות לצוות">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ערוצי התראה
            </label>
            <div className="space-y-2">
              {['email', 'slack', 'teams', 'sms', 'whatsapp'].map((channel) => (
                <label key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notificationChannels?.includes(channel as any)}
                    onChange={(e) => {
                      const channels = config.notificationChannels || [];
                      if (e.target.checked) {
                        setConfig({ ...config, notificationChannels: [...channels, channel as any] });
                      } else {
                        setConfig({ ...config, notificationChannels: channels.filter(c => c !== channel) });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{channel}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מערכת CRM
            </label>
            <select
              value={config.crmSystem}
              onChange={(e) => setConfig({ ...config, crmSystem: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="other">אחר</option>
            </select>
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
