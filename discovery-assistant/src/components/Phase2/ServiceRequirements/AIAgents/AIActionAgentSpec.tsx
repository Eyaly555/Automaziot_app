import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function AIActionAgentSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    aiModel: 'gpt4',
    actions: [],
    systemIntegrations: [],
    requireApproval: true,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-action-agent');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-action-agent');

    updated.push({
      serviceId: 'ai-action-agent',
      serviceName: 'AI עם יכולות פעולה',
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
      <Card title="שירות #25: AI - סוכן ביצוע פעולות">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מודל AI</label>
            <select value={config.aiModel} onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="gpt4">GPT-4</option>
              <option value="claude">Claude</option>
              <option value="custom">מותאם אישית</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.requireApproval}
                onChange={(e) => setConfig({ ...config, requireApproval: e.target.checked })} className="mr-2" />
              <span className="text-sm">דרוש אישור לפעולות</span>
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
