import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function TrainingOngoingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ durationMonths: 6, hoursPerMonth: 4 }
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find(s => s.serviceId === 'training-ongoing');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const updated = category.filter(s => s.serviceId !== 'training-ongoing');

    updated.push({
      serviceId: 'training-ongoing',
      serviceName: 'הדרכה שוטפת',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        additionalServices: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #56: הדרכה מתמשכת">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="חודשים" /></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שעות/חודש" /></div></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
