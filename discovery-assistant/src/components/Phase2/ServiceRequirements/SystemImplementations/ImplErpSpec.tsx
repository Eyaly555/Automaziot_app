import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function ImplErpSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ platform: 'sap_s4hana', estimatedMonths: 12 }
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const existing = category.find((s: any) => s.serviceId === 'impl-erp');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const updated = category.filter((s: any) => s.serviceId !== 'impl-erp');

    updated.push({
      serviceId: 'impl-erp',
      serviceName: 'הטמעת ERP',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        systemImplementations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #45: הטמעת ERP">
        <div className="space-y-4">
          <div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>SAP S/4HANA</option><option>Oracle NetSuite</option><option>Microsoft Dynamics</option></select></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
