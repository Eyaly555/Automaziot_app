import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoFormToCrmConfig {
  formPlatform: 'wix' | 'wordpress' | 'elementor' | 'google_forms' | 'typeform' | 'custom';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  fieldMapping: Array<{
    formField: string;
    crmField: string;
    transformation?: string;
  }>;
  duplicateDetection: boolean;
  dataValidation: boolean;
  autoAssignment: boolean;
}

export function AutoFormToCrmSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoFormToCrmConfig>>({
    formPlatform: 'wix',
    crmSystem: 'zoho',
    fieldMapping: [],
    duplicateDetection: true,
    dataValidation: true,
    autoAssignment: false,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-form-to-crm');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-form-to-crm');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-form-to-crm',
      serviceName: 'חיבור טפסים ל-CRM',
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
      <Card title="שירות #8: העברת טפסים אוטומטית ל-CRM">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">פלטפורמת טפסים</label>
              <select value={config.formPlatform} onChange={(e) => setConfig({ ...config, formPlatform: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="wix">Wix</option>
                <option value="wordpress">WordPress</option>
                <option value="elementor">Elementor</option>
                <option value="google_forms">Google Forms</option>
                <option value="typeform">Typeform</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
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
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.duplicateDetection}
                onChange={(e) => setConfig({ ...config, duplicateDetection: e.target.checked })} className="mr-2" />
              <span className="text-sm">זיהוי כפילויות</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.dataValidation}
                onChange={(e) => setConfig({ ...config, dataValidation: e.target.checked })} className="mr-2" />
              <span className="text-sm">ולידציה של נתונים</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoAssignment}
                onChange={(e) => setConfig({ ...config, autoAssignment: e.target.checked })} className="mr-2" />
              <span className="text-sm">הקצאה אוטומטית</span>
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
