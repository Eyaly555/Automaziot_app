import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoSlaTrackingConfig {
  slaRules: Array<{ metric: string; threshold: number; unit: string }>;
  alertingEnabled: boolean;
  escalationEnabled: boolean;
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  integrationSystem: string;
}

export function AutoSlaTrackingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoSlaTrackingConfig>>({
    slaRules: [],
    alertingEnabled: true,
    escalationEnabled: true,
    reportingFrequency: 'weekly',
    integrationSystem: '',
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-sla-tracking');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-sla-tracking');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-sla-tracking',
      serviceName: 'מעקב SLA אוטומטי',
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
      <Card title="שירות #19: מעקב SLA אוטומטי">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תדירות דיווח</label>
            <select value={config.reportingFrequency} onChange={(e) => setConfig({ ...config, reportingFrequency: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="daily">יומי</option>
              <option value="weekly">שבועי</option>
              <option value="monthly">חודשי</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מערכת אינטגרציה</label>
            <input type="text" value={config.integrationSystem} onChange={(e) => setConfig({ ...config, integrationSystem: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="CRM / Helpdesk" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.alertingEnabled}
                onChange={(e) => setConfig({ ...config, alertingEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">התראות מופעלות</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.escalationEnabled}
                onChange={(e) => setConfig({ ...config, escalationEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">הסלמה אוטומטית</span>
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
