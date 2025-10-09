import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoLeadResponseConfig } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';

export function AutoLeadResponseSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<Partial<AutoLeadResponseConfig>>({
    formPlatform: 'wix',
    emailService: 'sendgrid',
    crmSystem: 'zoho',
    n8nAccess: false,
    webhookSupport: 'yes',
    formFields: [],
    formUrl: '',
    emailCredentialsReady: false,
    domainVerified: false,
    emailTemplate: '',
    senderName: '',
    senderEmail: '',
    rateLimitKnown: false,
    crmCredentialsReady: false,
    crmModule: 'leads',
    crmFieldMapping: [],
    logResponseInCrm: true,
    responseTime: 'immediate',
    businessHoursOnly: false,
    fallbackMechanism: 'queue',
    duplicateCheck: true,
    errorNotificationEmail: '',
    retryAttempts: 3,
    testMode: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-lead-response');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-lead-response');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-lead-response',
      serviceName: 'מענה אוטומטי ללידים מטפסים',
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
      <Card title="שירות #1: מענה אוטומטי ללידים מטפסים">
        <div className="space-y-4">
          {/* Form Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פלטפורמת טפסים
            </label>
            <select
              value={config.formPlatform}
              onChange={(e) => setConfig({ ...config, formPlatform: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="wix">Wix</option>
              <option value="wordpress">WordPress</option>
              <option value="elementor">Elementor</option>
              <option value="google_forms">Google Forms</option>
              <option value="typeform">Typeform</option>
              <option value="custom">מותאם אישית</option>
            </select>
          </div>

          {/* Email Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שירות אימייל
            </label>
            <select
              value={config.emailService}
              onChange={(e) => setConfig({ ...config, emailService: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="smtp">SMTP</option>
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
            </select>
          </div>

          {/* CRM System */}
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

          {/* Form URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כתובת טופס
            </label>
            <input
              type="url"
              value={config.formUrl}
              onChange={(e) => setConfig({ ...config, formUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/contact-form"
            />
          </div>

          {/* Sender Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם שולח
              </label>
              <input
                type="text"
                value={config.senderName}
                onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="שם החברה"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אימייל שולח
              </label>
              <input
                type="email"
                value={config.senderEmail}
                onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="info@example.com"
              />
            </div>
          </div>

          {/* Email Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תבנית אימייל
            </label>
            <textarea
              value={config.emailTemplate}
              onChange={(e) => setConfig({ ...config, emailTemplate: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="שלום {{firstName}}&#10;&#10;תודה שיצרת איתנו קשר..."
            />
            <p className="text-sm text-gray-500 mt-1">
              השתמש ב-{'{{fieldName}}'} לשדות דינמיים
            </p>
          </div>

          {/* Response Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              זמן מענה
            </label>
            <select
              value={config.responseTime}
              onChange={(e) => setConfig({ ...config, responseTime: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="immediate">מיידי</option>
              <option value="2-5min">2-5 דקות</option>
              <option value="15min">15 דקות</option>
            </select>
          </div>

          {/* Error Notification Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל להתראות שגיאה
            </label>
            <input
              type="email"
              value={config.errorNotificationEmail}
              onChange={(e) => setConfig({ ...config, errorNotificationEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin@example.com"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.n8nAccess}
                onChange={(e) => setConfig({ ...config, n8nAccess: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">גישה ל-n8n</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.emailCredentialsReady}
                onChange={(e) => setConfig({ ...config, emailCredentialsReady: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">אישורים לשירות אימייל מוכנים</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.domainVerified}
                onChange={(e) => setConfig({ ...config, domainVerified: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">דומיין מאומת</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.crmCredentialsReady}
                onChange={(e) => setConfig({ ...config, crmCredentialsReady: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">אישורים ל-CRM מוכנים</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.logResponseInCrm}
                onChange={(e) => setConfig({ ...config, logResponseInCrm: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">לתעד תגובה ב-CRM</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.duplicateCheck}
                onChange={(e) => setConfig({ ...config, duplicateCheck: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">בדיקת כפילויות</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.testMode}
                onChange={(e) => setConfig({ ...config, testMode: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">מצב בדיקה</span>
            </label>
          </div>

          {/* Save Button */}
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
