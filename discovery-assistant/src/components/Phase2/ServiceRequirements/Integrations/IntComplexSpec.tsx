import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function IntComplexSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ transformation: '', validation: true }
  });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'int-complex');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const updated = integrationServices.filter(i => i.serviceId !== 'int-complex');

    updated.push({
      serviceId: 'int-complex',
      serviceName: 'אינטגרציה מורכבת עם טרנספורמציות',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        integrationServices: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #33: אינטגרציה מורכבת עם טרנספורמציה">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">טרנספורמציות</label><textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
