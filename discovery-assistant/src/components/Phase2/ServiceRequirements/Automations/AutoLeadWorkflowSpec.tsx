import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoLeadWorkflowConfig {
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  workflowSteps: Array<{
    id: string;
    name: string;
    action: string;
    delay?: number;
  }>;
  leadSources: string[];
  scoringEnabled: boolean;
  assignmentRules: boolean;
  notificationsEnabled: boolean;
}

export function AutoLeadWorkflowSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoLeadWorkflowConfig>>({
    crmSystem: 'zoho',
    workflowSteps: [],
    leadSources: [],
    scoringEnabled: false,
    assignmentRules: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-lead-workflow');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-lead-workflow');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-lead-workflow',
      serviceName: 'workflow מלא לניהול לידים',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #5: Workflow אוטומטי לניהול לידים">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מערכת CRM</label>
            <select value={config.crmSystem} onChange={(e) => setConfig({ ...config, crmSystem: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.scoringEnabled}
                onChange={(e) => setConfig({ ...config, scoringEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">הפעל ניקוד לידים</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.assignmentRules}
                onChange={(e) => setConfig({ ...config, assignmentRules: e.target.checked })} className="mr-2" />
              <span className="text-sm">כללי הקצאה אוטומטיים</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.notificationsEnabled}
                onChange={(e) => setConfig({ ...config, notificationsEnabled: e.target.checked })} className="mr-2" />
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
