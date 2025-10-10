import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  AlertCircle,
  Info,
  Loader,
  Target,
  MessageSquare,
  TrendingUp,
  Mail,
  Settings,
  Award,
  Plus,
  Trash2
} from 'lucide-react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AILeadQualifierRequirements, AIProvider, CRMSystem } from '../../../../types/aiAgentServices';
import type { AIAgentServiceEntry } from '../../../../types/aiAgentServices';
import { Button, Input, Select } from '../../../Base';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google' },
  { value: 'azure_openai', label: 'Azure OpenAI' }
];

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (מומלץ)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
];

const ANTHROPIC_MODELS = [
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (מומלץ)' },
  { value: 'claude-3.5-haiku', label: 'Claude 3.5 Haiku' }
];

const CRM_SYSTEMS = [
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'monday', label: 'Monday.com' },
  { value: 'other', label: 'אחר' }
];

const CONVERSATION_TYPES = [
  { value: 'structured', label: 'מובנה (Structured) - שאלות קבועות' },
  { value: 'conversational', label: 'שיחתי (Conversational) - זרימה טבעית' }
];

const CHANNELS = [
  { value: 'web_form', label: 'טופס אתר' },
  { value: 'chat', label: 'Chat' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'טלפון' }
];

export const AILeadQualifierSpec: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'ai-lead-qualifier',
    autoSave: false
  });

  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'model',
    serviceId: 'ai-lead-qualifier',
    autoSave: false
  });

  const [config, setConfig] = useState<AILeadQualifierRequirements>({
    aiProvider: 'openai',
    model: 'gpt-4o',
    crmSystem: 'zoho',
    crmCredentialsReady: false,
    bantCriteria: {
      budget: {
        questions: ['מה התקציב המוקצה לפרויקט?'],
        scoreWeight: 25
      },
      authority: {
        decisionMakerRoles: ['מנכ"ל', 'סמנכ"ל', 'מנהל'],
        questions: ['מה התפקיד שלך בארגון?', 'מי מעורב בקבלת ההחלטה?'],
        scoreWeight: 25
      },
      need: {
        painPoints: ['בעיות בתהליך נוכחי', 'חוסר אוטומציה'],
        questions: ['מה הבעיה העיקרית שאתם מנסים לפתור?'],
        scoreWeight: 25
      },
      timeline: {
        idealTimelines: ['מיידי', 'תוך 30 יום', 'תוך 90 יום'],
        questions: ['מתי אתם מתכננים להטמיע את הפתרון?'],
        scoreWeight: 25
      }
    },
    conversationFlow: {
      maxQuestions: 6,
      conversationType: 'conversational',
      greetingMessage: 'שלום! אשמח לעזור לכם למצוא את הפתרון המתאים. נשאל כמה שאלות קצרות.',
      completionMessage: 'תודה רבה! קיבלנו את המידע ונחזור אליכם בקרוב.'
    },
    leadScoring: {
      qualifiedThreshold: 70,
      usePredictiveAnalytics: true,
      additionalFactors: {
        websiteBehavior: true,
        emailEngagement: true,
        contentDownloads: true
      }
    },
    followUp: {
      autoThankYouEmail: true,
      maxFollowUpAttempts: 3
    },
    channels: [
      { channel: 'web_form', enabled: true },
      { channel: 'chat', enabled: true },
      { channel: 'email', enabled: false },
      { channel: 'phone', enabled: false }
    ],
    performance: {
      dailyLeadVolume: 50,
      qualificationRateTarget: 60,
      completionRateTarget: 80
    }
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'ai-lead-qualifier',
    immediateFields: ['aiProvider', 'model', 'crmSystem'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in AILeadQualifierSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      crmSystem: crmSystem.value
    };
    saveData(completeConfig);
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'bant' | 'conversation' | 'scoring' | 'followup' | 'performance'>('basic');

  // Load existing config
  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: AIAgentServiceEntry) => a.serviceId === 'ai-lead-qualifier');
    if (existing?.requirements) {
      setConfig(existing.requirements as AILeadQualifierRequirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.aiProvider || config.model || config.crmSystem) {
      const completeConfig = {
        ...config,
        aiModel: aiModelPreference.value,
        crmSystem: crmSystem.value
      };
      saveData(completeConfig);
    }
  }, [config, aiModelPreference.value, crmSystem.value, saveData]);

  const handleSave = async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      crmSystem: crmSystem.value
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    navigate('/phase2');
  };

  const getModelOptions = () => {
    return config.aiProvider === 'openai' ? OPENAI_MODELS :
           config.aiProvider === 'anthropic' ? ANTHROPIC_MODELS :
           [{ value: 'default', label: 'Default Model' }];
  };

  // BANT Question Management
  const addBantQuestion = (category: 'budget' | 'authority' | 'need' | 'timeline') => {
    setConfig({
      ...config,
      bantCriteria: {
        ...config.bantCriteria,
        [category]: {
          ...config.bantCriteria[category],
          questions: [...config.bantCriteria[category].questions, '']
        }
      }
    });
  };

  const removeBantQuestion = (category: 'budget' | 'authority' | 'need' | 'timeline', index: number) => {
    const questions = [...config.bantCriteria[category].questions];
    questions.splice(index, 1);
    setConfig({
      ...config,
      bantCriteria: {
        ...config.bantCriteria,
        [category]: {
          ...config.bantCriteria[category],
          questions
        }
      }
    });
  };

  const updateBantQuestion = (category: 'budget' | 'authority' | 'need' | 'timeline', index: number, value: string) => {
    const questions = [...config.bantCriteria[category].questions];
    questions[index] = value;
    setConfig({
      ...config,
      bantCriteria: {
        ...config.bantCriteria,
        [category]: {
          ...config.bantCriteria[category],
          questions
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI לאיסוף מידע ראשוני מלידים (BANT)
              </h1>
              <p className="text-gray-600">
                AI Lead Qualifier - Service #22 - BANT Methodology & Predictive Scoring
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  שמור
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Smart Fields Info Banner */}
        {(crmSystem.isAutoPopulated || aiModelPreference.isAutoPopulated) && (
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
        {(crmSystem.hasConflict || aiModelPreference.hasConflict) && (
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-2 px-6 overflow-x-auto">
              {[
                { id: 'basic', label: 'הגדרות בסיס', icon: Settings },
                { id: 'bant', label: 'קריטריוני BANT', icon: Target },
                { id: 'conversation', label: 'זרימת שיחה', icon: MessageSquare },
                { id: 'scoring', label: 'ניקוד לידים', icon: TrendingUp },
                { id: 'followup', label: 'מעקב אוטומטי', icon: Mail },
                { id: 'performance', label: 'יעדי ביצועים', icon: Award }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Settings */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ספק AI
                    </label>
                    <Select
                      value={config.aiProvider}
                      onChange={(e) => setConfig({
                        ...config,
                        aiProvider: e.target.value as AIProvider,
                        model: e.target.value === 'openai' ? 'gpt-4o' : 'claude-3.5-sonnet'
                      })}
                      options={AI_PROVIDERS}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {aiModelPreference.metadata.label.he}
                      </label>
                      {aiModelPreference.isAutoPopulated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          מולא אוטומטית
                        </span>
                      )}
                    </div>
                    <Select
                      value={aiModelPreference.value || 'gpt-4o'}
                      onChange={(e) => aiModelPreference.setValue(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        aiModelPreference.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      } ${aiModelPreference.hasConflict ? 'border-orange-300' : ''}`}
                      options={getModelOptions()}
                    />
                    {aiModelPreference.isAutoPopulated && aiModelPreference.source && (
                      <p className="text-xs text-gray-500 mt-1">
                        מקור: {aiModelPreference.source.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {crmSystem.metadata.label.he}
                      </label>
                      {crmSystem.isAutoPopulated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          מולא אוטומטית
                        </span>
                      )}
                    </div>
                    <Select
                      value={crmSystem.value || 'zoho'}
                      onChange={(e) => crmSystem.setValue(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
                      options={CRM_SYSTEMS}
                    />
                    {crmSystem.isAutoPopulated && crmSystem.source && (
                      <p className="text-xs text-gray-500 mt-1">
                        מקור: {crmSystem.source.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.crmCredentialsReady}
                        onChange={(e) => setConfig({ ...config, crmCredentialsReady: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        CRM API Credentials מוכנים
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">מתודולוגיית BANT</h4>
                      <p className="text-sm text-blue-700">
                        BANT = Budget (תקציב), Authority (סמכות), Need (צורך), Timeline (לוח זמנים).
                        מסגרת מוכחת לסינון לידים שמגדילה conversion rates ב-30% ומפחיתה CAC ב-25%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BANT Criteria */}
            {activeTab === 'bant' && (
              <div className="space-y-6">
                {/* Budget */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Budget (תקציב)
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תקציב מינימלי (אופציונלי)
                    </label>
                    <Input
                      type="number"
                      value={config.bantCriteria.budget.minimumBudget || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          budget: { ...config.bantCriteria.budget, minimumBudget: parseInt(e.target.value) || undefined }
                        }
                      })}
                      placeholder="50000"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        שאלות לבדיקת תקציב
                      </label>
                      <Button onClick={() => addBantQuestion('budget')} size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-1" />
                        הוסף שאלה
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.bantCriteria.budget.questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={q}
                            onChange={(e) => updateBantQuestion('budget', idx, e.target.value)}
                            placeholder="שאלה..."
                          />
                          <button
                            onClick={() => removeBantQuestion('budget', idx)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      משקל ניקוד (0-25)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="25"
                      value={config.bantCriteria.budget.scoreWeight}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          budget: { ...config.bantCriteria.budget, scoreWeight: parseInt(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Authority */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Authority (סמכות החלטה)
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תפקידי מקבלי החלטות (מופרדים בפסיק)
                    </label>
                    <Input
                      value={config.bantCriteria.authority.decisionMakerRoles.join(', ')}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          authority: {
                            ...config.bantCriteria.authority,
                            decisionMakerRoles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }
                        }
                      })}
                      placeholder='מנכ"ל, סמנכ"ל, מנהל פרויקטים'
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        שאלות לבדיקת סמכות
                      </label>
                      <Button onClick={() => addBantQuestion('authority')} size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-1" />
                        הוסף שאלה
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.bantCriteria.authority.questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={q}
                            onChange={(e) => updateBantQuestion('authority', idx, e.target.value)}
                            placeholder="שאלה..."
                          />
                          <button
                            onClick={() => removeBantQuestion('authority', idx)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      משקל ניקוד (0-25)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="25"
                      value={config.bantCriteria.authority.scoreWeight}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          authority: { ...config.bantCriteria.authority, scoreWeight: parseInt(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Need */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Need (צורך)
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      נקודות כאב לזיהוי (מופרדות בפסיק)
                    </label>
                    <Input
                      value={config.bantCriteria.need.painPoints.join(', ')}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          need: {
                            ...config.bantCriteria.need,
                            painPoints: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }
                        }
                      })}
                      placeholder="תהליך ידני, חוסר אוטומציה, בעיות קנה מידה"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        שאלות לבדיקת צורך
                      </label>
                      <Button onClick={() => addBantQuestion('need')} size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-1" />
                        הוסף שאלה
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.bantCriteria.need.questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={q}
                            onChange={(e) => updateBantQuestion('need', idx, e.target.value)}
                            placeholder="שאלה..."
                          />
                          <button
                            onClick={() => removeBantQuestion('need', idx)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      משקל ניקוד (0-25)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="25"
                      value={config.bantCriteria.need.scoreWeight}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          need: { ...config.bantCriteria.need, scoreWeight: parseInt(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Timeline (לוח זמנים)
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      לוחות זמנים אידיאליים (מופרדים בפסיק)
                    </label>
                    <Input
                      value={config.bantCriteria.timeline.idealTimelines.join(', ')}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          timeline: {
                            ...config.bantCriteria.timeline,
                            idealTimelines: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }
                        }
                      })}
                      placeholder="מיידי, תוך 30 יום, תוך 90 יום, תוך רבעון"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        שאלות לבדיקת לוח זמנים
                      </label>
                      <Button onClick={() => addBantQuestion('timeline')} size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-1" />
                        הוסף שאלה
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.bantCriteria.timeline.questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={q}
                            onChange={(e) => updateBantQuestion('timeline', idx, e.target.value)}
                            placeholder="שאלה..."
                          />
                          <button
                            onClick={() => removeBantQuestion('timeline', idx)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      משקל ניקוד (0-25)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="25"
                      value={config.bantCriteria.timeline.scoreWeight}
                      onChange={(e) => setConfig({
                        ...config,
                        bantCriteria: {
                          ...config.bantCriteria,
                          timeline: { ...config.bantCriteria.timeline, scoreWeight: parseInt(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">חשוב</h4>
                      <p className="text-sm text-yellow-700">
                        סכום המשקלים צריך להיות 100 (כרגע: {
                          config.bantCriteria.budget.scoreWeight +
                          config.bantCriteria.authority.scoreWeight +
                          config.bantCriteria.need.scoreWeight +
                          config.bantCriteria.timeline.scoreWeight
                        }).
                        מומלץ 25 לכל קריטריון או התאמה לפי חשיבות לעסק.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Flow */}
            {activeTab === 'conversation' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר שאלות מקסימלי
                    </label>
                    <Input
                      type="number"
                      min="3"
                      max="15"
                      value={config.conversationFlow.maxQuestions}
                      onChange={(e) => setConfig({
                        ...config,
                        conversationFlow: { ...config.conversationFlow, maxQuestions: parseInt(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">מומלץ: 5-8 שאלות</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סוג שיחה
                    </label>
                    <Select
                      value={config.conversationFlow.conversationType}
                      onChange={(e) => setConfig({
                        ...config,
                        conversationFlow: { ...config.conversationFlow, conversationType: e.target.value as any }
                      })}
                      options={CONVERSATION_TYPES}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הודעת פתיחה
                  </label>
                  <textarea
                    value={config.conversationFlow.greetingMessage}
                    onChange={(e) => setConfig({
                      ...config,
                      conversationFlow: { ...config.conversationFlow, greetingMessage: e.target.value }
                    })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הודעת סיום
                  </label>
                  <textarea
                    value={config.conversationFlow.completionMessage}
                    onChange={(e) => setConfig({
                      ...config,
                      conversationFlow: { ...config.conversationFlow, completionMessage: e.target.value }
                    })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">טיפ</h4>
                      <p className="text-sm text-blue-700">
                        שיחה שיחתית (Conversational) נותנת חוויה טבעית יותר אבל קשה יותר לשלוט.
                        שיחה מובנית (Structured) נותנת נתונים עקביים יותר ונוח יותר לניתוח.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lead Scoring */}
            {activeTab === 'scoring' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סף ניקוד מינימלי (0-100)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={config.leadScoring.qualifiedThreshold}
                      onChange={(e) => setConfig({
                        ...config,
                        leadScoring: { ...config.leadScoring, qualifiedThreshold: parseInt(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">מתחת לסף = unqualified</p>
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.leadScoring.usePredictiveAnalytics}
                        onChange={(e) => setConfig({
                          ...config,
                          leadScoring: { ...config.leadScoring, usePredictiveAnalytics: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        שימוש ב-Predictive Analytics
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">גורמי ניקוד נוספים</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.leadScoring.additionalFactors?.websiteBehavior || false}
                        onChange={(e) => setConfig({
                          ...config,
                          leadScoring: {
                            ...config.leadScoring,
                            additionalFactors: {
                              ...config.leadScoring.additionalFactors,
                              websiteBehavior: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">התנהגות באתר (Website Behavior)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.leadScoring.additionalFactors?.emailEngagement || false}
                        onChange={(e) => setConfig({
                          ...config,
                          leadScoring: {
                            ...config.leadScoring,
                            additionalFactors: {
                              ...config.leadScoring.additionalFactors,
                              emailEngagement: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">מעורבות באימיילים (Email Engagement)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.leadScoring.additionalFactors?.contentDownloads || false}
                        onChange={(e) => setConfig({
                          ...config,
                          leadScoring: {
                            ...config.leadScoring,
                            additionalFactors: {
                              ...config.leadScoring.additionalFactors,
                              contentDownloads: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">הורדות תוכן (Content Downloads)</span>
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">השפעה עסקית</h4>
                      <p className="text-sm text-green-700">
                        ניקוד לידים עם AI מזהה 40% יותר הזדמנויות מוסמכות ומגדיל conversion rates ב-30%.
                        זמן סינון: 2 שעות → 2 דקות (98% חיסכון בזמן).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up */}
            {activeTab === 'followup' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.followUp.autoThankYouEmail}
                      onChange={(e) => setConfig({
                        ...config,
                        followUp: { ...config.followUp, autoThankYouEmail: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      שלח אימייל תודה אוטומטי
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר ניסיונות מעקב מקסימלי
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={config.followUp.maxFollowUpAttempts}
                      onChange={(e) => setConfig({
                        ...config,
                        followUp: { ...config.followUp, maxFollowUpAttempts: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תבנית אימייל ללידים מוסמכים (אופציונלי)
                  </label>
                  <textarea
                    value={config.followUp.qualifiedEmailTemplate || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      followUp: { ...config.followUp, qualifiedEmailTemplate: e.target.value }
                    })}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="תודה רבה! המידע שלך מעיד על התאמה מצוינת..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תבנית אימייל ללידים לא מוסמכים (אופציונלי)
                  </label>
                  <textarea
                    value={config.followUp.unqualifiedEmailTemplate || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      followUp: { ...config.followUp, unqualifiedEmailTemplate: e.target.value }
                    })}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="תודה על התעניינותך! כרגע נראה שהפתרון שלנו לא מתאים..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">טיפ</h4>
                      <p className="text-sm text-blue-700">
                        אפשר לשלוח אימיילים שונים ללידים מוסמכים ולא מוסמכים.
                        לידים מוסמכים - הזמנה לפגישה. לידים לא מוסמכים - הצעת תוכן חינוכי או nurturing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      נפח לידים יומי משוער
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={config.performance.dailyLeadVolume}
                      onChange={(e) => setConfig({
                        ...config,
                        performance: { ...config.performance, dailyLeadVolume: parseInt(e.target.value) }
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      יעד Qualification Rate (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={config.performance.qualificationRateTarget}
                      onChange={(e) => setConfig({
                        ...config,
                        performance: { ...config.performance, qualificationRateTarget: parseInt(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">כמה % מהלידים יהיו מוסמכים</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      יעד Completion Rate (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={config.performance.completionRateTarget}
                      onChange={(e) => setConfig({
                        ...config,
                        performance: { ...config.performance, completionRateTarget: parseInt(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">כמה % מהלידים ישלימו את השאלון</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">ערוצי אינטגרציה</h4>
                  <div className="space-y-3">
                    {config.channels.map((ch, idx) => (
                      <label key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={ch.enabled}
                          onChange={(e) => {
                            const updated = [...config.channels];
                            updated[idx] = { ...updated[idx], enabled: e.target.checked };
                            setConfig({ ...config, channels: updated });
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          {CHANNELS.find(c => c.value === ch.channel)?.label || ch.channel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">תחזית ביצועים</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">לידים יומיים:</span>
                      <span className="font-bold text-gray-900">{config.performance.dailyLeadVolume}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">לידים מוסמכים צפויים (יומי):</span>
                      <span className="font-bold text-green-600">
                        {Math.round(config.performance.dailyLeadVolume * config.performance.qualificationRateTarget / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">לידים מוסמכים צפויים (חודשי):</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.round(config.performance.dailyLeadVolume * config.performance.qualificationRateTarget / 100 * 30)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button onClick={() => navigate('/phase2')} variant="outline">
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                שמור והמשך
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
