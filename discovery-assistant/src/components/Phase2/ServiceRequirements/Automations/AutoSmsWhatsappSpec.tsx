import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoSmsWhatsappConfig {
  messagingPlatform: 'whatsapp_business_api' | 'twilio' | 'vonage' | 'clicksend' | 'other';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  phoneNumberVerified: boolean;
  apiCredentialsReady: boolean;
  webhookSupport: boolean;
  messageTemplatesApproved: boolean;
  consentManagement: boolean;
  optOutMechanism: boolean;
  deliveryReportsEnabled: boolean;
}

export function AutoSmsWhatsappSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<Partial<AutoSmsWhatsappConfig>>({
    messagingPlatform: 'whatsapp_business_api',
    crmSystem: 'zoho',
    phoneNumberVerified: false,
    apiCredentialsReady: false,
    webhookSupport: true,
    messageTemplatesApproved: false,
    consentManagement: true,
    optOutMechanism: true,
    deliveryReportsEnabled: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-sms-whatsapp');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-sms-whatsapp');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-sms-whatsapp',
      serviceName: 'SMS/WhatsApp אוטומטי ללידים',
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
      <Card title="שירות #2: SMS/WhatsApp אוטומטיים">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פלטפורמת הודעות
            </label>
            <select
              value={config.messagingPlatform}
              onChange={(e) => setConfig({ ...config, messagingPlatform: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="whatsapp_business_api">WhatsApp Business API</option>
              <option value="twilio">Twilio</option>
              <option value="vonage">Vonage (Nexmo)</option>
              <option value="clicksend">ClickSend</option>
              <option value="other">אחר</option>
            </select>
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

          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.phoneNumberVerified}
                onChange={(e) => setConfig({ ...config, phoneNumberVerified: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">מספר טלפון מאומת</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.apiCredentialsReady}
                onChange={(e) => setConfig({ ...config, apiCredentialsReady: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">אישורי API מוכנים</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.webhookSupport}
                onChange={(e) => setConfig({ ...config, webhookSupport: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">תמיכה ב-Webhook</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.messageTemplatesApproved}
                onChange={(e) => setConfig({ ...config, messageTemplatesApproved: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">תבניות הודעות מאושרות</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.consentManagement}
                onChange={(e) => setConfig({ ...config, consentManagement: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">ניהול הסכמות</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.optOutMechanism}
                onChange={(e) => setConfig({ ...config, optOutMechanism: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">מנגנון הסרה מרשימה</span>
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
