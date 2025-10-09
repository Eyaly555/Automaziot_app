import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function IntCrmMarketingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ crmSystem: 'zoho', marketingPlatform: 'mailchimp', syncContacts: true }
  });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'int-crm-marketing');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const updated = integrationServices.filter(i => i.serviceId !== 'int-crm-marketing');

    updated.push({
      serviceId: 'int-crm-marketing',
      serviceName: 'אינטגרציה CRM ↔ Marketing',
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
      <Card title="שירות #35: אינטגרציה CRM + שיווק">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Zoho</option><option>Salesforce</option></select></div><div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>MailChimp</option><option>ActiveCampaign</option></select></div></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
