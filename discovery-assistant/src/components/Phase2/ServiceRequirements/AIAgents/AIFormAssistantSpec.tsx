import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AIFormAssistantRequirements } from '../../../../types/aiAgentServices';
import { Card } from '../../../Common/Card';
import { Save, FileText, HelpCircle } from 'lucide-react';

export function AIFormAssistantSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AIFormAssistantRequirements>({
    formTypes: {
      contactForms: true,
      quoteRequests: true,
      supportTickets: false,
      registration: false,
      surveys: false
    },
    assistanceLevel: {
      fieldValidation: true,
      contextualHelp: true,
      autoComplete: true,
      smartSuggestions: true,
      errorPrevention: true
    },
    interactionStyle: {
      proactive: false,
      reactive: true,
      conversational: true,
      stepByStep: true,
      minimal: false
    },
    helpContent: {
      fieldDescriptions: [
        {
          fieldName: 'phone',
          description: 'מספר טלפון עם קידומת מדינה (למשל: +972-50-123-4567)',
          examples: ['+972-50-123-4567', '+1-555-123-4567']
        },
        {
          fieldName: 'budget',
          description: 'טווח התקציב המשוער לפרויקט בשקלים',
          examples: ['10,000-50,000', '50,000-200,000', '200,000+']
        }
      ],
      faqItems: [
        {
          question: 'איך אני בוחר את התקציב המתאים?',
          answer: 'התקציב תלוי בהיקף הפרויקט, מספר המשתמשים ורמת המורכבות. נוכל לעזור לכם להעריך את זה בשיחת הייעוץ הראשונה.'
        },
        {
          question: 'מה כולל השירות?',
          answer: 'השירות כולל ייעוץ ראשוני, אפיון מפורט, פיתוח בהתאמה אישית ובדיקות איכות. לא כולל אחסון ותחזוקה שנתית.'
        }
      ]
    },
    validationRules: {
      requiredFields: ['name', 'email', 'phone'],
      optionalFields: ['company', 'budget', 'timeline'],
      conditionalRequired: {
        'company': 'מבקש הצעת מחיר',
        'budget': 'מעוניין בשירות בתשלום'
      }
    },
    integration: {
      crmCapture: true,
      leadScoring: true,
      followUpAutomation: false,
      analytics: true
    }
  });

  useEffect(() => {
    if (currentMeeting?.implementationSpec?.aiAgents) {
      const existing = currentMeeting.implementationSpec.aiAgents.find(
        (a: any) => a.serviceId === 'ai-form-assistant'
      );
      if (existing) {
        setConfig(existing.requirements);
      }
    }
  }, [currentMeeting]);

  const saveConfig = () => {
    if (!currentMeeting) return;

    const updatedAIAgents = [...(currentMeeting.implementationSpec?.aiAgents || [])];
    const existingIndex = updatedAIAgents.findIndex((a: any) => a.serviceId === 'ai-form-assistant');

    const agentData = {
      serviceId: 'ai-form-assistant',
      serviceName: 'עוזר AI לטפסים',
      requirements: config,
      completedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updatedAIAgents[existingIndex] = agentData;
    } else {
      updatedAIAgents.push(agentData);
    }

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        aiAgents: updatedAIAgents,
        lastUpdated: new Date()
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="עוזר AI לטפסים" subtitle="יצירת עוזר AI חכם שיעזור למשתמשים למלא טפסים בצורה מדויקת ויעילה">
        <div className="space-y-6">
          {/* סוגי טפסים */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              סוגי טפסים נתמכים
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(config.formTypes).map(([formType, enabled]) => (
                <label key={formType} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      formTypes: { ...prev.formTypes, [formType]: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">
                    {formType === 'contactForms' && 'טפסי יצירת קשר'}
                    {formType === 'quoteRequests' && 'בקשות הצעת מחיר'}
                    {formType === 'supportTickets' && 'כרטיסי תמיכה'}
                    {formType === 'registration' && 'טפסי הרשמה'}
                    {formType === 'surveys' && 'סקרים'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* רמת עזרה */}
          <div>
            <h4 className="font-medium mb-3">רמת העזרה שיספק הסוכן</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(config.assistanceLevel).map(([feature, enabled]) => (
                <label key={feature} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      assistanceLevel: { ...prev.assistanceLevel, [feature]: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">
                    {feature === 'fieldValidation' && 'ולידציה של שדות'}
                    {feature === 'contextualHelp' && 'עזרה הקשרית'}
                    {feature === 'autoComplete' && 'השלמה אוטומטית'}
                    {feature === 'smartSuggestions' && 'הצעות חכמות'}
                    {feature === 'errorPrevention' && 'מניעת שגיאות'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* סגנון אינטראקציה */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              סגנון אינטראקציה עם המשתמש
            </h4>
            <div className="space-y-2">
              {Object.entries(config.interactionStyle).map(([style, enabled]) => (
                <label key={style} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="interactionStyle"
                    checked={enabled}
                    onChange={() => {
                      const newStyle = Object.keys(config.interactionStyle).reduce((acc, key) => {
                        acc[key] = key === style;
                        return acc;
                      }, {} as any);
                      setConfig(prev => ({
                        ...prev,
                        interactionStyle: newStyle
                      }));
                    }}
                  />
                  <span className="text-sm">
                    {style === 'proactive' && 'יזום - הסוכן מציע עזרה באופן אקטיבי'}
                    {style === 'reactive' && 'תגובתי - הסוכן מגיב רק כשנשאל'}
                    {style === 'conversational' && 'שיחתי - הסוכן מדבר עם המשתמש בצורה טבעית'}
                    {style === 'stepByStep' && 'שלב אחר שלב - הסוכן מדריך את המשתמש צעד אחר צעד'}
                    {style === 'minimal' && 'מינימלי - הסוכן מספק רק מידע בסיסי'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* תוכן עזרה */}
          <div>
            <h4 className="font-medium mb-3">תוכן עזרה לשדות</h4>
            <div className="space-y-4">
              {config.helpContent.fieldDescriptions.map((field, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">שם השדה</label>
                      <input
                        type="text"
                        value={field.fieldName}
                        onChange={(e) => {
                          const newFields = [...config.helpContent.fieldDescriptions];
                          newFields[index] = { ...newFields[index], fieldName: e.target.value };
                          setConfig(prev => ({
                            ...prev,
                            helpContent: { ...prev.helpContent, fieldDescriptions: newFields }
                          }));
                        }}
                        className="w-full p-2 border rounded-lg"
                        placeholder="שם השדה (למשל: phone)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">תיאור השדה</label>
                      <input
                        type="text"
                        value={field.description}
                        onChange={(e) => {
                          const newFields = [...config.helpContent.fieldDescriptions];
                          newFields[index] = { ...newFields[index], description: e.target.value };
                          setConfig(prev => ({
                            ...prev,
                            helpContent: { ...prev.helpContent, fieldDescriptions: newFields }
                          }));
                        }}
                        className="w-full p-2 border rounded-lg"
                        placeholder="תיאור שיעזור למשתמש להבין מה להכניס..."
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">דוגמאות</label>
                    <textarea
                      value={field.examples.join('\n')}
                      onChange={(e) => {
                        const newFields = [...config.helpContent.fieldDescriptions];
                        newFields[index] = {
                          ...newFields[index],
                          examples: e.target.value.split('\n').filter(s => s.trim())
                        };
                        setConfig(prev => ({
                          ...prev,
                          helpContent: { ...prev.helpContent, fieldDescriptions: newFields }
                        }));
                      }}
                      rows={2}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="כל שורה - דוגמה אחת..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* שאלות נפוצות */}
          <div>
            <h4 className="font-medium mb-3">שאלות ותשובות נפוצות</h4>
            <div className="space-y-3">
              {config.helpContent.faqItems.map((faq, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">שאלה</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaq = [...config.helpContent.faqItems];
                        newFaq[index] = { ...newFaq[index], question: e.target.value };
                        setConfig(prev => ({
                          ...prev,
                          helpContent: { ...prev.helpContent, faqItems: newFaq }
                        }));
                      }}
                      className="w-full p-2 border rounded-lg"
                      placeholder="שאלה שמשתמשים שואלים לעתים קרובות..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">תשובה</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaq = [...config.helpContent.faqItems];
                        newFaq[index] = { ...newFaq[index], answer: e.target.value };
                        setConfig(prev => ({
                          ...prev,
                          helpContent: { ...prev.helpContent, faqItems: newFaq }
                        }));
                      }}
                      rows={3}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="תשובה מפורטת ומסייעת..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* כללי ולידציה */}
          <div>
            <h4 className="font-medium mb-3">כללי ולידציה</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">שדות חובה</label>
                <textarea
                  value={config.validationRules.requiredFields.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    validationRules: {
                      ...prev.validationRules,
                      requiredFields: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={2}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - שם שדה אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">שדות אופציונליים</label>
                <textarea
                  value={config.validationRules.optionalFields.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    validationRules: {
                      ...prev.validationRules,
                      optionalFields: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={2}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - שם שדה אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">שדות מותנים (שדה: תנאי)</label>
                <textarea
                  value={Object.entries(config.validationRules.conditionalRequired)
                    .map(([field, condition]) => `${field}: ${condition}`)
                    .join('\n')}
                  onChange={(e) => {
                    const conditionalRequired: Record<string, string> = {};
                    e.target.value.split('\n').forEach(line => {
                      const [field, condition] = line.split(':').map(s => s.trim());
                      if (field && condition) {
                        conditionalRequired[field] = condition;
                      }
                    });
                    setConfig(prev => ({
                      ...prev,
                      validationRules: { ...prev.validationRules, conditionalRequired }
                    }));
                  }}
                  rows={2}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - שדה: תנאי (למשל: company: מבקש הצעת מחיר)..."
                />
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
                  checked={config.integration.crmCapture}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, crmCapture: e.target.checked }
                  }))}
                />
                <span className="text-sm">שמירת לידים במערכת CRM</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.leadScoring}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, leadScoring: e.target.checked }
                  }))}
                />
                <span className="text-sm">ניקוד איכות לידים</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.followUpAutomation}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, followUpAutomation: e.target.checked }
                  }))}
                />
                <span className="text-sm">אוטומציה של מעקב</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.analytics}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, analytics: e.target.checked }
                  }))}
                />
                <span className="text-sm">ניתוח נתוני טפסים</span>
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
              שמור הגדרות עוזר טפסים
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
