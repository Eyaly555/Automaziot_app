import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

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

export function AutoSmartFollowupSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoSmartFollowupConfig>>({
    crmSystem: 'zoho',
    emailService: 'sendgrid',
    followupSequences: [],
    aiPersonalization: false,
    stopOnReply: true,
    trackOpens: true,
    trackClicks: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-smart-followup');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-smart-followup');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-smart-followup',
      serviceName: 'מעקב אוטומטי חכם אחרי לידים',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #6: Follow-up חכם ואוטומטי">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מערכת CRM</label>
              <select value={config.crmSystem} onChange={(e) => setConfig({ ...config, crmSystem: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="zoho">Zoho CRM</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="other">אחר</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שירות אימייל</label>
              <select value={config.emailService} onChange={(e) => setConfig({ ...config, emailService: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="smtp">SMTP</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
              </select>
            </div>
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
