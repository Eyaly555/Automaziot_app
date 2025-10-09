import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoEndToEndConfig {
  processName: string;
  startTrigger: string;
  endCondition: string;
  steps: Array<{ order: number; action: string; system: string }>;
  slaMonitoring: boolean;
  performanceTracking: boolean;
}

export function AutoEndToEndSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoEndToEndConfig>>({
    processName: '',
    startTrigger: '',
    endCondition: '',
    steps: [],
    slaMonitoring: true,
    performanceTracking: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-end-to-end');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-end-to-end');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-end-to-end',
      serviceName: 'אוטומציה מקצה לקצה',
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
      <Card title="שירות #18: תהליך End-to-End אוטומטי">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שם התהליך</label>
            <input type="text" value={config.processName} onChange={(e) => setConfig({ ...config, processName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="הזן שם תהליך" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">טריגר התחלה</label>
              <input type="text" value={config.startTrigger} onChange={(e) => setConfig({ ...config, startTrigger: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="אירוע מתחיל" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תנאי סיום</label>
              <input type="text" value={config.endCondition} onChange={(e) => setConfig({ ...config, endCondition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תנאי השלמה" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.slaMonitoring}
                onChange={(e) => setConfig({ ...config, slaMonitoring: e.target.checked })} className="mr-2" />
              <span className="text-sm">ניטור SLA</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.performanceTracking}
                onChange={(e) => setConfig({ ...config, performanceTracking: e.target.checked })} className="mr-2" />
              <span className="text-sm">מעקב ביצועים</span>
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
