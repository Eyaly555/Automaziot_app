import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

export function AIComplexWorkflowSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    workflowName: '',
    aiModel: 'gpt4',
    decisionPoints: [],
    monitoringEnabled: true,
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-complex-workflow');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-complex-workflow');

    updated.push({
      serviceId: 'ai-complex-workflow',
      serviceName: 'AI לworkflows מורכבים',
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
      <Card title="שירות #26: AI - זרימות עבודה מורכבות">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שם Workflow</label>
            <input type="text" value={config.workflowName} onChange={(e) => setConfig({ ...config, workflowName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תהליך עסקי מורכב" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.monitoringEnabled}
                onChange={(e) => setConfig({ ...config, monitoringEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">ניטור פעיל</span>
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
