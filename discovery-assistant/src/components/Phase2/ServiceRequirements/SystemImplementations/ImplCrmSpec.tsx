import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function ImplCrmSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ platform: 'zoho', subscriptionTier: '', estimatedWeeks: 6 }
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const existing = category.find(s => s.serviceId === 'impl-crm');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const updated = category.filter(s => s.serviceId !== 'impl-crm');

    updated.push({
      serviceId: 'impl-crm',
      serviceName: 'הטמעת CRM',
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
      <Card title="שירות #41: הטמעת CRM">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Zoho CRM</option><option>Salesforce</option><option>HubSpot</option></select></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="משך בשבועות" /></div></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
