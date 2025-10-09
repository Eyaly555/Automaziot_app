import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoSystemSyncConfig {
  systems: Array<{ name: string; type: string }>;
  syncRules: Array<{ source: string; target: string; mapping: string }>;
  scheduleEnabled: boolean;
  realTimeEnabled: boolean;
  loggingEnabled: boolean;
}

export function AutoSystemSyncSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoSystemSyncConfig>>({
    systems: [],
    syncRules: [],
    scheduleEnabled: true,
    realTimeEnabled: false,
    loggingEnabled: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-system-sync');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-system-sync');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-system-sync',
      serviceName: 'סנכרון בין מערכות אוטומטי',
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
      <Card title="שירות #15: סנכרון מערכות אוטומטי">
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.scheduleEnabled}
                onChange={(e) => setConfig({ ...config, scheduleEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">סנכרון מתוזמן</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.realTimeEnabled}
                onChange={(e) => setConfig({ ...config, realTimeEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">סנכרון בזמן אמת</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.loggingEnabled}
                onChange={(e) => setConfig({ ...config, loggingEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">רישום פעילות</span>
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
