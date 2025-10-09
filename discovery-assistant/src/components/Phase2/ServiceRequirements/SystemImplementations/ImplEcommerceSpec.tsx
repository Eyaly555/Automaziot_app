import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function ImplEcommerceSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ platform: 'shopify', estimatedWeeks: 4 }
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const existing = category.find((s: any) => s.serviceId === 'impl-ecommerce');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const category = currentMeeting?.implementationSpec?.systemImplementations || [];
    const updated = category.filter((s: any) => s.serviceId !== 'impl-ecommerce');

    updated.push({
      serviceId: 'impl-ecommerce',
      serviceName: 'הטמעת eCommerce',
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
      <Card title="שירות #46: הטמעת E-commerce">
        <div className="space-y-4">
          <div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Shopify</option><option>WooCommerce</option><option>Magento</option></select></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
