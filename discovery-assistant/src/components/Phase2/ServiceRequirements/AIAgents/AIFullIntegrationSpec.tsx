import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function AIFullIntegrationSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    systems: [],
    aiModel: 'gpt4',
    orchestration: 'n8n',
    continuousLearning: true,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-full-integration');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-full-integration');

    updated.push({
      serviceId: 'ai-full-integration',
      serviceName: 'אינטגרציית AI מלאה',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        aiAgentServices: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #29: AI - אינטגרציה מלאה">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פלטפורמת תזמור</label>
            <select value={config.orchestration} onChange={(e) => setConfig({ ...config, orchestration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="n8n">n8n</option>
              <option value="zapier">Zapier</option>
              <option value="make">Make</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.continuousLearning}
                onChange={(e) => setConfig({ ...config, continuousLearning: e.target.checked })} className="mr-2" />
              <span className="text-sm">למידה מתמשכת</span>
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
