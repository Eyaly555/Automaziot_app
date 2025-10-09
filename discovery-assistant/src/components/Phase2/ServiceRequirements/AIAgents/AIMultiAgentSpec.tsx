import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function AIMultiAgentSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    agents: [],
    coordination: 'centralized',
    sharedKnowledge: true,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-multi-agent');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-multi-agent');

    updated.push({
      serviceId: 'ai-multi-agent',
      serviceName: 'מערך סוכני AI מרובים',
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
      <Card title="שירות #30: AI - מערך סוכנים מרובים">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">סוג תיאום</label>
            <select value={config.coordination} onChange={(e) => setConfig({ ...config, coordination: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="centralized">מרכזי</option>
              <option value="distributed">מבוזר</option>
              <option value="hierarchical">היררכי</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.sharedKnowledge}
                onChange={(e) => setConfig({ ...config, sharedKnowledge: e.target.checked })} className="mr-2" />
              <span className="text-sm">ידע משותף</span>
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
