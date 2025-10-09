import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function AIServiceAgentSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    aiModel: 'gpt4',
    knowledgeBaseUrl: '',
    integrationHelpdesk: 'zendesk',
    autoResponse: true,
    sentimentAnalysis: true,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-service-agent');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-service-agent');

    updated.push({
      serviceId: 'ai-service-agent',
      serviceName: 'סוכן AI לשירות לקוחות',
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
      <Card title="שירות #24: AI - סוכן שירות לקוחות">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מערכת Helpdesk</label>
            <select value={config.integrationHelpdesk} onChange={(e) => setConfig({ ...config, integrationHelpdesk: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="zendesk">Zendesk</option>
              <option value="freshdesk">Freshdesk</option>
              <option value="intercom">Intercom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">כתובת מאגר ידע</label>
            <input type="url" value={config.knowledgeBaseUrl} onChange={(e) => setConfig({ ...config, knowledgeBaseUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://docs.example.com" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoResponse}
                onChange={(e) => setConfig({ ...config, autoResponse: e.target.checked })} className="mr-2" />
              <span className="text-sm">מענה אוטומטי</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.sentimentAnalysis}
                onChange={(e) => setConfig({ ...config, sentimentAnalysis: e.target.checked })} className="mr-2" />
              <span className="text-sm">ניתוח סנטימנט</span>
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
