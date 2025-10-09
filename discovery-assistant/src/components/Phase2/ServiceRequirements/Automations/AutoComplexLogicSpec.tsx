import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoComplexLogicRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Save, Brain, GitBranch } from 'lucide-react';

export function AutoComplexLogicSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoComplexLogicRequirements>({
    logicRules: [
      {
        id: '1',
        name: 'קביעת עדיפות לידים',
        condition: 'מקור הליד === "אתר אינטרנט" && תקציב > 10000',
        action: 'הקצה לנציג מכירות בכיר',
        priority: 'high'
      },
      {
        id: '2',
        name: 'זיהוי לקוחות חוזרים',
        condition: 'אימייל קיים במערכת && רכישה קודמת',
        action: 'הצג היסטוריית רכישות',
        priority: 'medium'
      }
    ],
    decisionTrees: {
      leadQualification: {
        steps: [
          { question: 'מה התקציב?', answers: ['<10K', '10K-50K', '50K+', '>100K'] },
          { question: 'איך שמעת עלינו?', answers: ['חיפוש', 'המלצה', 'פרסומת', 'אחר'] },
          { question: 'מה הדחיפות?', answers: ['מיידי', 'השבוע', 'החודש', 'אין דחיפות'] }
        ]
      }
    },
    dataProcessing: {
      aggregation: ['ממוצע מכירות חודשי', 'סך הכל לידים לפי מקור'],
      calculations: ['שיעור המרה', 'ROI למקור לידים', 'זמן תגובה ממוצע'],
      transformations: ['ניקוי נתונים', 'סטנדרטיזציה', 'אימות תקינות']
    },
    externalApis: {
      endpoints: [
        {
          name: 'מזג אוויר',
          url: 'https://api.weatherapi.com/v1/current.json',
          purpose: 'התאמת הצעות לפי מזג אוויר',
          frequency: 'hourly'
        }
      ],
      authentication: {
        apiKeys: true,
        oauth: false,
        rateLimiting: true
      }
    },
    errorHandling: {
      retryAttempts: 3,
      fallbackActions: ['שמור בלוג', 'הודע למנהל', 'המשך ללא נתונים'],
      monitoring: {
        performanceMetrics: true,
        errorRates: true,
        responseTimes: true
      }
    }
  });

  useEffect(() => {
    if (currentMeeting?.implementationSpec?.automations) {
      const existing = currentMeeting.implementationSpec.automations.find(
        (a: any) => a.serviceId === 'auto-complex-logic'
      );
      if (existing) {
        setConfig(existing.requirements);
      }
    }
  }, [currentMeeting]);

  const saveConfig = () => {
    if (!currentMeeting) return;

    const updatedAutomations = [...(currentMeeting.implementationSpec?.automations || [])];
    const existingIndex = updatedAutomations.findIndex((a: any) => a.serviceId === 'auto-complex-logic');

    const automationData = {
      serviceId: 'auto-complex-logic',
      serviceName: 'לוגיקה מורכבת ואוטומציה מתקדמת',
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
      <Card title="לוגיקה מורכבת ואוטומציה מתקדמת" subtitle="הגדר כללים מורכבים, עצי החלטה ועיבוד נתונים מתקדם">
        <div className="space-y-6">
          {/* כללי לוגיקה */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              כללי לוגיקה עסקית
            </h4>
            <div className="space-y-3">
              {config.logicRules.map((rule, index) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{rule.name}</h5>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">תנאי:</span>
                          <code className="block bg-gray-50 p-2 rounded mt-1 font-mono text-xs">
                            {rule.condition}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">פעולה:</span>
                          <p className="mt-1">{rule.action}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rule.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rule.priority === 'high' ? 'גבוה' : rule.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* עצי החלטה */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              עצי החלטה
            </h4>
            <div className="space-y-4">
              {Object.entries(config.decisionTrees).map(([treeName, tree]) => (
                <div key={treeName} className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-3 capitalize">
                    {treeName === 'leadQualification' ? 'קביעת איכות לידים' : treeName}
                  </h5>
                  <div className="space-y-3">
                    {tree.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{step.question}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {step.answers.map((answer, ansIndex) => (
                              <span key={ansIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {answer}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* עיבוד נתונים */}
          <div>
            <h4 className="font-medium mb-3">עיבוד וניתוח נתונים</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">אגרגציות</label>
                <textarea
                  value={config.dataProcessing.aggregation.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dataProcessing: {
                      ...prev.dataProcessing,
                      aggregation: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - אגרגציה אחת..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">חישובים</label>
                <textarea
                  value={config.dataProcessing.calculations.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dataProcessing: {
                      ...prev.dataProcessing,
                      calculations: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - חישוב אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">טרנספורמציות</label>
                <textarea
                  value={config.dataProcessing.transformations.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dataProcessing: {
                      ...prev.dataProcessing,
                      transformations: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - טרנספורמציה אחת..."
                />
              </div>
            </div>
          </div>

          {/* APIs חיצוניים */}
          <div>
            <h4 className="font-medium mb-3">APIs חיצוניים</h4>
            <div className="space-y-3">
              {config.externalApis.endpoints.map((endpoint, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">שם השירות</label>
                      <input
                        type="text"
                        value={endpoint.name}
                        onChange={(e) => {
                          const newEndpoints = [...config.externalApis.endpoints];
                          newEndpoints[index] = { ...newEndpoints[index], name: e.target.value };
                          setConfig(prev => ({
                            ...prev,
                            externalApis: { ...prev.externalApis, endpoints: newEndpoints }
                          }));
                        }}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">כתובת API</label>
                      <input
                        type="url"
                        value={endpoint.url}
                        onChange={(e) => {
                          const newEndpoints = [...config.externalApis.endpoints];
                          newEndpoints[index] = { ...newEndpoints[index], url: e.target.value };
                          setConfig(prev => ({
                            ...prev,
                            externalApis: { ...prev.externalApis, endpoints: newEndpoints }
                          }));
                        }}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">תדירות</label>
                      <select
                        value={endpoint.frequency}
                        onChange={(e) => {
                          const newEndpoints = [...config.externalApis.endpoints];
                          newEndpoints[index] = { ...newEndpoints[index], frequency: e.target.value as any };
                          setConfig(prev => ({
                            ...prev,
                            externalApis: { ...prev.externalApis, endpoints: newEndpoints }
                          }));
                        }}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="realtime">זמן אמת</option>
                        <option value="hourly">שעתי</option>
                        <option value="daily">יומי</option>
                        <option value="weekly">שבועי</option>
                        <option value="ondemand">על פי דרישה</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">מטרה</label>
                    <input
                      type="text"
                      value={endpoint.purpose}
                      onChange={(e) => {
                        const newEndpoints = [...config.externalApis.endpoints];
                        newEndpoints[index] = { ...newEndpoints[index], purpose: e.target.value };
                        setConfig(prev => ({
                          ...prev,
                          externalApis: { ...prev.externalApis, endpoints: newEndpoints }
                        }));
                      }}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="למה אנחנו צריכים את ה-API הזה..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* טיפול בשגיאות */}
          <div>
            <h4 className="font-medium mb-3">טיפול בשגיאות ומוניטורינג</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">מספר ניסיונות חוזרים</label>
                <input
                  type="number"
                  value={config.errorHandling.retryAttempts}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    errorHandling: { ...prev.errorHandling, retryAttempts: parseInt(e.target.value) || 3 }
                  }))}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">פעולות חזרה</label>
                {config.errorHandling.fallbackActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">מוניטורינג</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling.monitoring.performanceMetrics}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      errorHandling: {
                        ...prev.errorHandling,
                        monitoring: { ...prev.errorHandling.monitoring, performanceMetrics: e.target.checked }
                      }
                    }))}
                  />
                  <span className="text-sm">מדדי ביצועים</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling.monitoring.errorRates}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      errorHandling: {
                        ...prev.errorHandling,
                        monitoring: { ...prev.errorHandling.monitoring, errorRates: e.target.checked }
                      }
                    }))}
                  />
                  <span className="text-sm">שיעורי שגיאות</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling.monitoring.responseTimes}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      errorHandling: {
                        ...prev.errorHandling,
                        monitoring: { ...prev.errorHandling.monitoring, responseTimes: e.target.checked }
                      }
                    }))}
                  />
                  <span className="text-sm">זמני תגובה</span>
                </label>
              </div>
            </div>
          </div>

          {/* שמירה */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              שמור הגדרות לוגיקה מורכבת
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
