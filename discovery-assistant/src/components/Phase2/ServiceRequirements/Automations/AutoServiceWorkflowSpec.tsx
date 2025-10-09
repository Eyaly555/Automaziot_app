import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoServiceWorkflowRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Save, Workflow, CheckCircle } from 'lucide-react';

export function AutoServiceWorkflowSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoServiceWorkflowRequirements>({
    workflowSteps: [
      {
        id: '1',
        name: 'קבלת פנייה',
        description: 'זיהוי פנייה חדשה והתחלת תהליך',
        duration: 'מיידי',
        responsible: 'מערכת אוטומטית'
      },
      {
        id: '2',
        name: 'ניתוח בעיה',
        description: 'ניתוח אוטומטי של סוג הבעיה וחומרתה',
        duration: '2-5 דקות',
        responsible: 'סוכן AI'
      },
      {
        id: '3',
        name: 'הצעת פתרון',
        description: 'הצעת פתרונות ראשוניים או העברה לנציג',
        duration: '5-10 דקות',
        responsible: 'סוכן AI + נציג אנושי'
      }
    ],
    escalationRules: {
      highPriority: ['מבקש לדבר עם מנהל', 'בעיה קריטית', 'אי שביעות רצון חמורה'],
      immediateTransfer: ['איום משפטי', 'בעיה בטיחותית', 'תקלה מלאה במערכת']
    },
    serviceMetrics: {
      responseTime: '< 5 דקות',
      resolutionTime: '< 24 שעות',
      satisfactionTarget: 4.5
    },
    integration: {
      crmSync: true,
      knowledgeBase: true,
      ticketSystem: true
    }
  });

  useEffect(() => {
    if (currentMeeting?.implementationSpec?.automations) {
      const existing = currentMeeting.implementationSpec.automations.find(
        (a: any) => a.serviceId === 'auto-service-workflow'
      );
      if (existing) {
        setConfig(existing.requirements);
      }
    }
  }, [currentMeeting]);

  const saveConfig = () => {
    if (!currentMeeting) return;

    const updatedAutomations = [...(currentMeeting.implementationSpec?.automations || [])];
    const existingIndex = updatedAutomations.findIndex((a: any) => a.serviceId === 'auto-service-workflow');

    const automationData = {
      serviceId: 'auto-service-workflow',
      serviceName: 'זרימת עבודה לשירות לקוחות',
      requirements: config,
      completedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updatedAutomations[existingIndex] = automationData;
    } else {
      updatedAutomations.push(automationData);
    }

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updatedAutomations,
        lastUpdated: new Date()
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="זרימת עבודה לשירות לקוחות" subtitle="הגדר את תהליך הטיפול בפניות לקוחות מהתחלה ועד סיום">
        <div className="space-y-6">
          {/* שלבי זרימה */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              שלבי זרימת העבודה
            </h4>
            <div className="space-y-3">
              {config.workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{step.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>⏱️ {step.duration}</span>
                      <span>👤 {step.responsible}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* כללי הסלמה */}
          <div>
            <h4 className="font-medium mb-3">כללי הסלמה</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">הסלמה בעדיפות גבוהה</label>
                <textarea
                  value={config.escalationRules.highPriority.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    escalationRules: {
                      ...prev.escalationRules,
                      highPriority: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - כלל הסלמה אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">העברה מיידית</label>
                <textarea
                  value={config.escalationRules.immediateTransfer.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    escalationRules: {
                      ...prev.escalationRules,
                      immediateTransfer: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - סיבה להעברה מיידית..."
                />
              </div>
            </div>
          </div>

          {/* מדדי ביצועים */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              מדדי ביצועים (SLA)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{config.serviceMetrics.responseTime}</div>
                <div className="text-sm text-gray-600">זמן תגובה ראשוני</div>
              </div>

              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{config.serviceMetrics.resolutionTime}</div>
                <div className="text-sm text-gray-600">זמן פתרון</div>
              </div>

              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{config.serviceMetrics.satisfactionTarget}/5</div>
                <div className="text-sm text-gray-600">שביעות רצון לקוח</div>
              </div>
            </div>
          </div>

          {/* הגדרות אינטגרציה */}
          <div>
            <h4 className="font-medium mb-3">אינטגרציות מערכת</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.crmSync}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, crmSync: e.target.checked }
                  }))}
                />
                <span className="text-sm">סנכרון עם מערכת CRM</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.knowledgeBase}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, knowledgeBase: e.target.checked }
                  }))}
                />
                <span className="text-sm">חיפוש בבסיס ידע</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.ticketSystem}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, ticketSystem: e.target.checked }
                  }))}
                />
                <span className="text-sm">יצירת כרטיסים במערכת טיקטים</span>
              </label>
            </div>
          </div>

          {/* שמירה */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              שמור הגדרות זרימה
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
