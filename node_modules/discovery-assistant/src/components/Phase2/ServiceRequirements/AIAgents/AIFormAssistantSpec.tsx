import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import type { AIFormAssistantRequirements } from '../../../../types/aiAgentServices';
import { Card } from '../../../Common/Card';
import { Save, FileText, HelpCircle, CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' }
];

export function AIFormAssistantSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'aiModel',
    serviceId: 'ai-form-assistant',
    autoSave: false
  });

  const [config, setConfig] = useState<AIFormAssistantRequirements>({
    aiModel: 'gpt-4o',
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

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'ai-form-assistant',
    category: 'aiAgentServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value || config.aiModel
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: any) => a.serviceId === 'ai-form-assistant');

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements);

        // Set smart field value if existing
        if (existing.requirements.aiModel) {
          aiModelPreference.setValue(existing.requirements.aiModel);
        }

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.aiAgentServices]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.aiModel || config.formTypes.contactForms) {
  //     const completeConfig = {
  //       ...config,
  //       aiModel: aiModelPreference.value
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, aiModelPreference.value, saveData]);

  const handleFieldChange = useCallback((field: keyof AIFormAssistantRequirements, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = {
            ...updated,
            aiModel: aiModelPreference.value
          };
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [aiModelPreference.value, saveData]);

  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value || config.aiModel
    };

    await saveData(completeConfig, 'manual');
  }, [config, aiModelPreference.value, saveData]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {aiModelPreference.isAutoPopulated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">נתונים מולאו אוטומטית משלב 1</h4>
            <p className="text-sm text-blue-800">
              חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1.
              תוכל לערוך אותם במידת הצורך.
            </p>
          </div>
        </div>
      )}

      {/* Conflict Warnings */}
      {aiModelPreference.hasConflict && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900 mb-1">זוהה אי-התאמה בנתונים</h4>
            <p className="text-sm text-orange-800">
              נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
            </p>
          </div>
        </div>
      )}

      <Card title="עוזר AI לטפסים" subtitle="יצירת עוזר AI חכם שיעזור למשתמשים למלא טפסים בצורה מדויקת ויעילה">
        <div className="space-y-6">
          {/* AI Model Preference */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">מודל AI</label>
              {aiModelPreference.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select 
              value={aiModelPreference.value || config.aiModel} 
              onChange={(e) => aiModelPreference.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                aiModelPreference.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${aiModelPreference.hasConflict ? 'border-orange-300' : ''}`}
            >
              {AI_MODELS.map(model => (
                <option key={model.value} value={model.value}>{model.label}</option>
              ))}
            </select>
            {aiModelPreference.isAutoPopulated && aiModelPreference.source && (
              <p className="text-xs text-gray-500 mt-1">מקור: {aiModelPreference.source.description}</p>
            )}
          </div>

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
                    onChange={(e) => handleFieldChange('formTypes', { ...config.formTypes, [formType]: e.target.checked })}
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
                    onChange={(e) => handleFieldChange('assistanceLevel', { ...config.assistanceLevel, [feature]: e.target.checked })}
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
                      handleFieldChange('interactionStyle', newStyle);
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
                          handleFieldChange('helpContent.fieldDescriptions', newFields);
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
                          handleFieldChange('helpContent.fieldDescriptions', newFields);
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
                          handleFieldChange('helpContent.fieldDescriptions', newFields);
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
                        handleFieldChange('helpContent.faqItems', newFaq);
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
                        handleFieldChange('helpContent.faqItems', newFaq);
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
                  onChange={(e) => handleFieldChange('validationRules.requiredFields', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={2}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - שם שדה אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">שדות אופציונליים</label>
                <textarea
                  value={config.validationRules.optionalFields.join('\n')}
                  onChange={(e) => handleFieldChange('validationRules.optionalFields', e.target.value.split('\n').filter(s => s.trim()))}
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
                    handleFieldChange('validationRules.conditionalRequired', conditionalRequired);
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
                  onChange={(e) => handleFieldChange('integration.crmCapture', e.target.checked)}
                />
                <span className="text-sm">שמירת לידים במערכת CRM</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.leadScoring}
                  onChange={(e) => handleFieldChange('integration.leadScoring', e.target.checked)}
                />
                <span className="text-sm">ניקוד איכות לידים</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.followUpAutomation}
                  onChange={(e) => handleFieldChange('integration.followUpAutomation', e.target.checked)}
                />
                <span className="text-sm">אוטומציה של מעקב</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.integration.analytics}
                  onChange={(e) => handleFieldChange('integration.analytics', e.target.checked)}
                />
                <span className="text-sm">ניתוח נתוני טפסים</span>
              </label>
            </div>
          </div>

          {/* Save Status and Button */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">שומר אוטומטית...</span>
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2 text-red-600">
                  <span className="text-sm">שגיאה בשמירה</span>
                </div>
              )}
              {!isSaving && !saveError && config.formTypes.contactForms && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'שומר...' : 'שמור ידנית'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}



