import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function AIPredictiveSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    predictionType: 'sales',
    dataSource: 'crm',
    updateFrequency: 'daily',
    alertingEnabled: true,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-predictive');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-predictive');

    updated.push({
      serviceId: 'ai-predictive',
      serviceName: 'AI לניתוחים predictive',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        aiAgentServices: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #28: AI - ניתוח חיזוי">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סוג חיזוי</label>
              <select value={config.predictionType} onChange={(e) => setConfig({ ...config, predictionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="sales">מכירות</option>
                <option value="churn">נטישה</option>
                <option value="demand">ביקוש</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תדירות עדכון</label>
              <select value={config.updateFrequency} onChange={(e) => setConfig({ ...config, updateFrequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="realtime">זמן אמת</option>
                <option value="hourly">שעתי</option>
                <option value="daily">יומי</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.alertingEnabled}
                onChange={(e) => setConfig({ ...config, alertingEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">התראות מופעלות</span>
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
