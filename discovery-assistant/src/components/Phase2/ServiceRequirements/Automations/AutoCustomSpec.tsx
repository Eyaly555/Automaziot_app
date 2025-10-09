import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoCustomConfig {
  customDescription: string;
  requirements: string[];
  systems: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedWeeks: number;
  specialRequirements?: string;
}

export function AutoCustomSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoCustomConfig>>({
    customDescription: '',
    requirements: [],
    systems: [],
    complexity: 'medium',
    estimatedWeeks: 4,
    specialRequirements: '',
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-custom');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-custom');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-custom',
      serviceName: 'אוטומציה מותאמת אישית',
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
      <Card title="שירות #20: אוטומציה מותאמת אישית">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תיאור האוטומציה</label>
            <textarea value={config.customDescription} onChange={(e) => setConfig({ ...config, customDescription: e.target.value })}
              rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תאר את האוטומציה המבוקשת בפירוט..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">רמת מורכבות</label>
              <select value={config.complexity} onChange={(e) => setConfig({ ...config, complexity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="low">נמוכה</option>
                <option value="medium">בינונית</option>
                <option value="high">גבוהה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">זמן משוער (שבועות)</label>
              <input type="number" value={config.estimatedWeeks} onChange={(e) => setConfig({ ...config, estimatedWeeks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" min="1" max="52" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">דרישות מיוחדות</label>
            <textarea value={config.specialRequirements} onChange={(e) => setConfig({ ...config, specialRequirements: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="אבטחה, ביצועים, אינטגרציות..." />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
