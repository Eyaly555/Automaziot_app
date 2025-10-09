import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function IntCustomSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ description: '', complexity: 'medium', estimatedWeeks: 4 }
  });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'int-custom');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const updated = integrationServices.filter(i => i.serviceId !== 'int-custom');

    updated.push({
      serviceId: 'int-custom',
      serviceName: 'אינטגרציה מותאמת אישית',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        integrationServices: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #40: אינטגרציה מותאמת אישית">
        <div className="space-y-4">
          <div><textarea rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תאר את האינטגרציה המותאמת..." /></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
