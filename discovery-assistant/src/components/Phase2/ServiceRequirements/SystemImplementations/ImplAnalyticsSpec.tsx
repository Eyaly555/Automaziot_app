import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function ImplAnalyticsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ platform: 'google_analytics_4', estimatedDays: 7 }
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const existing = category.find(s => s.serviceId === 'impl-analytics');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const updated = category.filter(s => s.serviceId !== 'impl-analytics');

    updated.push({
      serviceId: 'impl-analytics',
      serviceName: 'הטמעת Analytics',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        systemImplementations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #47: הטמעת Analytics">
        <div className="space-y-4">
          <div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Google Analytics 4</option><option>Mixpanel</option><option>Amplitude</option></select></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
