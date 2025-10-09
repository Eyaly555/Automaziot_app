import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoMultiSystemConfig {
  systems: Array<{ name: string; role: 'source' | 'target' | 'both' }>;
  orchestrationPlatform: 'n8n' | 'zapier' | 'make' | 'custom';
  errorHandling: 'retry' | 'fallback' | 'alert';
  monitoring: boolean;
}

export function AutoMultiSystemSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoMultiSystemConfig>>({
    systems: [],
    orchestrationPlatform: 'n8n',
    errorHandling: 'retry',
    monitoring: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-multi-system');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-multi-system');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-multi-system',
      serviceName: 'אוטומציה רב-מערכתית',
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
      <Card title="שירות #17: אוטומציה רב-מערכתית">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פלטפורמת תזמור</label>
            <select value={config.orchestrationPlatform} onChange={(e) => setConfig({ ...config, orchestrationPlatform: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="n8n">n8n</option>
              <option value="zapier">Zapier</option>
              <option value="make">Make</option>
              <option value="custom">מותאם אישית</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">טיפול בשגיאות</label>
            <select value={config.errorHandling} onChange={(e) => setConfig({ ...config, errorHandling: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="retry">ניסיון חוזר</option>
              <option value="fallback">גיבוי</option>
              <option value="alert">התראה</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.monitoring}
                onChange={(e) => setConfig({ ...config, monitoring: e.target.checked })} className="mr-2" />
              <span className="text-sm">ניטור פעיל</span>
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
