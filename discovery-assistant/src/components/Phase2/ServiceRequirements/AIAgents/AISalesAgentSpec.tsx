import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function AISalesAgentSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    aiModel: 'gpt4',
    conversationStyle: 'professional',
    integrationCRM: 'zoho',
    autoFollowup: true,
    humanHandoff: true,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-sales-agent');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-sales-agent');

    updated.push({
      serviceId: 'ai-sales-agent',
      serviceName: 'סוכן AI למכירות',
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
      <Card title="שירות #23: AI - סוכן מכירות וירטואלי">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מודל AI</label>
              <select value={config.aiModel} onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="gpt4">GPT-4</option>
                <option value="claude">Claude</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סגנון שיחה</label>
              <select value={config.conversationStyle} onChange={(e) => setConfig({ ...config, conversationStyle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="professional">מקצועי</option>
                <option value="friendly">ידידותי</option>
                <option value="consultative">ייעוצי</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoFollowup}
                onChange={(e) => setConfig({ ...config, autoFollowup: e.target.checked })} className="mr-2" />
              <span className="text-sm">מעקב אוטומטי</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.humanHandoff}
                onChange={(e) => setConfig({ ...config, humanHandoff: e.target.checked })} className="mr-2" />
              <span className="text-sm">העברה לאנושי</span>
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
