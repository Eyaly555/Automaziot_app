import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function TrainingWorkshopsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ sessionCount: 1, participantCount: 10, durationHours: 4 }
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find((s: any) => s.serviceId === 'training-workshops');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const updated = category.filter((s: any) => s.serviceId !== 'training-workshops');

    updated.push({
      serviceId: 'training-workshops',
      serviceName: 'הדרכות וworkshops',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        additionalServices: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #55: הדרכות וסדנאות">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4"><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מספר מפגשים" /></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="משתתפים" /></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שעות" /></div></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
