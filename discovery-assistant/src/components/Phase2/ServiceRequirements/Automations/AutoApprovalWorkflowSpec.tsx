import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoApprovalWorkflowConfig {
  approvalSteps: Array<{ role: string; threshold?: number }>;
  notificationMethod: 'email' | 'slack' | 'teams';
  escalationEnabled: boolean;
  reminderEnabled: boolean;
}

export function AutoApprovalWorkflowSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoApprovalWorkflowConfig>>({
    approvalSteps: [],
    notificationMethod: 'email',
    escalationEnabled: true,
    reminderEnabled: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-approval-workflow');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-approval-workflow');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-approval-workflow',
      serviceName: 'workflow אישורים אוטומטי',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #11: Workflow אישורים אוטומטי">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שיטת התראה</label>
            <select value={config.notificationMethod} onChange={(e) => setConfig({ ...config, notificationMethod: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="teams">Microsoft Teams</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.escalationEnabled}
                onChange={(e) => setConfig({ ...config, escalationEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">הסלמה אוטומטית</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.reminderEnabled}
                onChange={(e) => setConfig({ ...config, reminderEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">תזכורות</span>
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
