import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AILeadQualifierRequirements } from '../../../../types/aiAgentServices';
import { Card } from '../../../Common/Card';

export function AILeadQualifierSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AILeadQualifierRequirements>>({
    aiModel: 'gpt4',
    trainingDataSource: 'crm',
    qualificationCriteria: [],
    integrationSystem: 'zoho',
    scoringThreshold: 70,
    autoAssignment: true,
    humanReview: false,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-lead-qualifier');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-lead-qualifier');

    updated.push({
      serviceId: 'ai-lead-qualifier',
      serviceName: 'AI לאיסוף מידע ראשוני מלידים',
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
      <Card title="שירות #22: AI - סינון וסיווג לידים אוטומטי">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מודל AI</label>
              <select value={config.aiModel} onChange={(e) => setConfig({ ...config, aiModel: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="gpt4">GPT-4</option>
                <option value="gpt35">GPT-3.5</option>
                <option value="claude">Claude</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מקור נתוני אימון</label>
              <select value={config.trainingDataSource} onChange={(e) => setConfig({ ...config, trainingDataSource: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="crm">CRM</option>
                <option value="historical">היסטורי</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מערכת אינטגרציה</label>
            <select value={config.integrationSystem} onChange={(e) => setConfig({ ...config, integrationSystem: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">סף ניקוד (%)</label>
            <input type="number" value={config.scoringThreshold} onChange={(e) => setConfig({ ...config, scoringThreshold: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" min="0" max="100" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoAssignment}
                onChange={(e) => setConfig({ ...config, autoAssignment: e.target.checked })} className="mr-2" />
              <span className="text-sm">הקצאה אוטומטית</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.humanReview}
                onChange={(e) => setConfig({ ...config, humanReview: e.target.checked })} className="mr-2" />
              <span className="text-sm">ביקורת אנושית</span>
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
