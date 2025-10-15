import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import type { AIBrandedRequirements } from '../../../../types/aiAgentServices';
import { Card } from '../../../Common/Card';
import { Save, Bot, MessageSquare, CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' }
];

export function AIBrandedSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'aiModel',
    serviceId: 'ai-branded',
    autoSave: false
  });

  const [config, setConfig] = useState<AIBrandedRequirements>({
    aiModel: 'gpt-4o',
    branding: {
      companyName: '',
      logoUrl: '',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      brandVoice: 'professional',
      tone: 'helpful_friendly'
    },
    capabilities: {
      conversationStyle: 'conversational',
      responseLength: 'medium',
      useEmojis: false,
      formalLanguage: true,
      personalizedResponses: true
    },
    knowledgeBase: {
      companyInfo: {
        history: '',
        values: '',
        uniqueSellingPoints: [],
        faq: []
      },
      productKnowledge: {
        services: [],
        pricing: '',
        commonObjections: []
      },
      industryContext: {
        marketPosition: '',
        competitors: [],
        trends: []
      }
    },
    conversationFlow: {
      greeting: 'שלום! אני העוזר הוירטואלי של {companyName}. איך אוכל לעזור לך היום?',
      fallback: 'מצטער, לא הבנתי לגמרי. האם תוכל לנסח אחרת או לשאול על נושאים ספציפיים כמו השירותים שלנו או פרטי התקשרות?',
      closing: 'תודה שפנית אלינו! אם יש לך עוד שאלות, אני כאן לעזור.',
      transferTriggers: ['מבקש לדבר עם אדם', 'בעיה טכנית מורכבת', 'תלונה']
    },
    integration: {
      crmSync: true,
      leadCapture: true,
      conversationLogging: true,
      analytics: true
    },
    training: {
      brandGuidelines: '',
      forbiddenTopics: ['מחירים פנימיים', 'מידע סודי', 'השוואות למתחרים'],
      escalationKeywords: ['בעיה', 'תקלה', 'לא עובד', 'מבטל']
    }
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'ai-branded',
    category: 'aiAgentServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: any) => a.serviceId === 'ai-branded');

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
  //   if (config.aiModel) {
  //     const completeConfig = {
  //       ...config,
  //       aiModel: aiModelPreference.value
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, aiModelPreference.value, saveData]);

  const handleFieldChange = useCallback((field: keyof AIBrandedRequirements, value: any) => {
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

      <Card title="סוכן AI ממותג" subtitle="יצירת סוכן AI המותאם למותג ולקול של החברה שלכם">
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
              className={`w-full p-2 border rounded-lg ${
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

          {/* מיתוג בסיסי */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              מיתוג בסיסי
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם החברה</label>
                <input
                  type="text"
                  value={config.branding.companyName}
                  onChange={(e) => handleFieldChange('branding.companyName', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="שם החברה שלכם"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">לוגו (URL)</label>
                <input
                  type="url"
                  value={config.branding.logoUrl}
                  onChange={(e) => handleFieldChange('branding.logoUrl', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">צבע ראשי</label>
                <input
                  type="color"
                  value={config.branding.primaryColor}
                  onChange={(e) => handleFieldChange('branding.primaryColor', e.target.value)}
                  className="w-full p-2 border rounded-lg h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">צבע משני</label>
                <input
                  type="color"
                  value={config.branding.secondaryColor}
                  onChange={(e) => handleFieldChange('branding.secondaryColor', e.target.value)}
                  className="w-full p-2 border rounded-lg h-10"
                />
              </div>
            </div>
          </div>

          {/* סגנון שיחה */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              סגנון שיחה
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">סגנון שיחה</label>
                <select
                  value={config.capabilities.conversationStyle}
                  onChange={(e) => handleFieldChange('capabilities.conversationStyle', e.target.value as any)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="formal">פורמלי</option>
                  <option value="conversational">שיחתי</option>
                  <option value="friendly">ידידותי</option>
                  <option value="professional">מקצועי</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">אורך תגובה</label>
                <select
                  value={config.capabilities.responseLength}
                  onChange={(e) => handleFieldChange('capabilities.responseLength', e.target.value as any)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="short">קצר</option>
                  <option value="medium">בינוני</option>
                  <option value="detailed">מפורט</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useEmojis"
                  checked={config.capabilities.useEmojis}
                  onChange={(e) => handleFieldChange('capabilities.useEmojis', e.target.checked)}
                />
                <label htmlFor="useEmojis" className="text-sm">השתמש באימוג'ים</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="formalLanguage"
                  checked={config.capabilities.formalLanguage}
                  onChange={(e) => handleFieldChange('capabilities.formalLanguage', e.target.checked)}
                />
                <label htmlFor="formalLanguage" className="text-sm">שפה פורמלית</label>
              </div>
            </div>
          </div>

          {/* בסיס ידע - מידע על החברה */}
          <div>
            <h4 className="font-medium mb-3">מידע על החברה</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">היסטוריה ורקע</label>
                <textarea
                  value={config.knowledgeBase.companyInfo.history}
                  onChange={(e) => handleFieldChange('knowledgeBase.companyInfo.history', e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="ספר על ההיסטוריה והרקע של החברה..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ערכים וחזון</label>
                <textarea
                  value={config.knowledgeBase.companyInfo.values}
                  onChange={(e) => handleFieldChange('knowledgeBase.companyInfo.values', e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="מה הערכים והחזון של החברה..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">נקודות חוזק ייחודיות</label>
                <textarea
                  value={config.knowledgeBase.companyInfo.uniqueSellingPoints.join('\n')}
                  onChange={(e) => handleFieldChange('knowledgeBase.companyInfo.uniqueSellingPoints', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - נקודת חוזק אחת..."
                />
              </div>
            </div>
          </div>

          {/* זרימת שיחה */}
          <div>
            <h4 className="font-medium mb-3">זרימת שיחה</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">הודעת פתיחה</label>
                <input
                  type="text"
                  value={config.conversationFlow.greeting}
                  onChange={(e) => handleFieldChange('conversationFlow.greeting', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="שלום! אני העוזר הוירטואלי של {companyName}..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">הודעת חזרה (כשלא מבין)</label>
                <textarea
                  value={config.conversationFlow.fallback}
                  onChange={(e) => handleFieldChange('conversationFlow.fallback', e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="מצטער, לא הבנתי לגמרי..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">הודעת סיום</label>
                <input
                  type="text"
                  value={config.conversationFlow.closing}
                  onChange={(e) => handleFieldChange('conversationFlow.closing', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="תודה שפנית אלינו!..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">מילות מפתח להעברה לאדם</label>
                <textarea
                  value={config.conversationFlow.transferTriggers.join('\n')}
                  onChange={(e) => handleFieldChange('conversationFlow.transferTriggers', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - מילת מפתח אחת..."
                />
              </div>
            </div>
          </div>

          {/* הגדרות אימון */}
          <div>
            <h4 className="font-medium mb-3">הגדרות אימון</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">הנחיות מותג</label>
                <textarea
                  value={config.training.brandGuidelines}
                  onChange={(e) => handleFieldChange('training.brandGuidelines', e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="איך הסוכן צריך לייצג את המותג..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">נושאים אסורים</label>
                <textarea
                  value={config.training.forbiddenTopics.join('\n')}
                  onChange={(e) => handleFieldChange('training.forbiddenTopics', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - נושא אסור אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">מילות מפתח להסלמה</label>
                <textarea
                  value={config.training.escalationKeywords.join('\n')}
                  onChange={(e) => handleFieldChange('training.escalationKeywords', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - מילת מפתח אחת להסלמה..."
                />
              </div>
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
              {!isSaving && !saveError && config.branding.companyName && (
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



