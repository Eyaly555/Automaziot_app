import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function SupportOngoingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ supportLevel: 'extended', hoursPerMonth: 10 }
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find((s: any) => s.serviceId === 'support-ongoing');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const updated = category.filter((s: any) => s.serviceId !== 'support-ongoing');

    updated.push({
      serviceId: 'support-ongoing',
      serviceName: 'תמיכה שוטפת',
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
      <Card title="שירות #57: תמיכה שוטפת">
        <div className="space-y-4">
          <div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>בסיסי</option><option>מורחב</option><option>פרימיום</option></select></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
