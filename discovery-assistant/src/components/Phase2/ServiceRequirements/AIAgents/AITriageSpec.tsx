import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Settings,
  Tag,
  Zap,
  Route,
  Heart,
  TrendingUp,
  Loader,
  Info,
  Brain
} from 'lucide-react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import {
  AITriageConfig,
  TriageCategory,
  PriorityRule,
  RoutingRule
} from '../../../../types/automationServices';
import { Button, Input, Select } from '../../../Base';
import type { AIAgentServiceEntry } from '../../../../types/aiAgentServices';

const generateId = () => Math.random().toString(36).substr(2, 9);

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'azure_openai', label: 'Azure OpenAI' }
];

const AI_MODELS: Record<string, Array<{ value: string; label: string }>> = {
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (מומלץ - $0.15/$0.60)' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
  ],
  anthropic: [
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku (מהיר וזול)' },
    { value: 'claude-3-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' }
  ],
  google: [
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-flash', label: 'Gemini Flash' }
  ],
  azure_openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' }
  ]
};

const CRM_SYSTEMS = [
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'other', label: 'אחר' }
];

const TICKETING_SYSTEMS = [
  { value: 'zendesk', label: 'Zendesk' },
  { value: 'freshdesk', label: 'Freshdesk' },
  { value: 'jira_service_desk', label: 'Jira Service Desk' },
  { value: 'helpscout', label: 'Help Scout' },
  { value: 'intercom', label: 'Intercom' },
  { value: 'other', label: 'אחר' }
];

const PRIORITY_LEVELS = [
  { value: 'urgent', label: 'דחוף (Urgent)' },
  { value: 'high', label: 'גבוה (High)' },
  { value: 'medium', label: 'בינוני (Medium)' },
  { value: 'low', label: 'נמוך (Low)' }
];

const DEFAULT_CATEGORIES: TriageCategory[] = [
  { id: '1', name: 'Sales', nameHe: 'מכירות', keywords: ['quote', 'price', 'buy', 'purchase'], autoAssignTo: 'sales@company.com' },
  { id: '2', name: 'Support', nameHe: 'תמיכה', keywords: ['help', 'issue', 'problem', 'error'], autoAssignTo: 'support@company.com' },
  { id: '3', name: 'Billing', nameHe: 'חשבונאות', keywords: ['invoice', 'payment', 'refund', 'billing'], autoAssignTo: 'billing@company.com' },
  { id: '4', name: 'Technical', nameHe: 'טכני', keywords: ['api', 'integration', 'technical', 'bug'], autoAssignTo: 'tech@company.com' },
  { id: '5', name: 'General', nameHe: 'כללי', keywords: ['general', 'question', 'info'], autoAssignTo: 'info@company.com' }
];

export const AITriageSpec: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AITriageConfig>({
    aiProvider: 'openai',
    aiModel: 'gpt-4o-mini',
    n8nAccess: true,
    modelSettings: {
      temperature: 0.3,
      maxTokens: 500,
      confidenceThreshold: 0.75
    },
    categories: DEFAULT_CATEGORIES,
    priorityRules: [],
    routingRules: [],
    sentimentAnalysis: {
      enabled: true,
      thresholds: {
        veryNegative: -0.8,
        negative: -0.5,
        neutral: 0,
        positive: 0.5,
        veryPositive: 0.8
      },
      emotionDetection: {
        enabled: true,
        detectFrustration: true,
        detectAnger: true,
        detectUrgency: true,
        detectExcitement: false,
        detectDisappointment: true
      },
      escalationRules: []
    },
    vipHandling: {
      enabled: false,
      vipIdentificationMethod: 'crm_field',
      autoPriorityBoost: true,
      vipPriority: 'high',
      vipNotificationMethod: 'immediate_alert'
    },
    trainingData: {
      historicalInquiriesCount: 0,
      trainingCompleted: false,
      manualReviewEnabled: true
    },
    performance: {
      processingTimeTarget: 5,
      dailyInquiryVolume: 100,
      monitorAccuracy: true,
      accuracyTargetPercentage: 90
    },
    integrationChannels: [
      { channel: 'email', enabled: true },
      { channel: 'web_form', enabled: true },
      { channel: 'chat', enabled: false }
    ],
    errorHandling: {
      onLowConfidence: 'manual_review',
      fallbackPriority: 'medium',
      errorNotificationEmail: '',
      retryAttempts: 3,
      logAllClassifications: true
    },
    testMode: true,
    testAccountAvailable: false
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'categories' | 'priority' | 'routing' | 'sentiment' | 'vip'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing config from meeting store if available
  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: AIAgentServiceEntry) => a.serviceId === 'ai-triage');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!currentMeeting) return;

      const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
      const updated = aiAgentServices.filter((a: AIAgentServiceEntry) => a.serviceId !== 'ai-triage');

      updated.push({
        serviceId: 'ai-triage',
        serviceName: 'AI לסינון ותיעדוף פניות',
        requirements: config,
        completedAt: new Date().toISOString()
      });

      updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          aiAgentServices: updated,
        }
      });

      setTimeout(() => {
        setIsSaving(false);
        navigate('/phase2');
      }, 500);
    } catch (error) {
      console.error('Error saving ai-triage config:', error);
      setIsSaving(false);
    }
  };

  // Category Management
  const addCategory = () => {
    const newId = (config.categories.length + 1).toString();
    setConfig({
      ...config,
      categories: [
        ...config.categories,
        {
          id: newId,
          name: '',
          nameHe: '',
          keywords: [],
          autoAssignTo: ''
        }
      ]
    });
  };

  const removeCategory = (id: string) => {
    setConfig({
      ...config,
      categories: config.categories.filter(c => c.id !== id)
    });
  };

  const updateCategory = (id: string, updates: Partial<TriageCategory>) => {
    setConfig({
      ...config,
      categories: config.categories.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  // Priority Rule Management
  const addPriorityRule = () => {
    setConfig({
      ...config,
      priorityRules: [
        ...config.priorityRules,
        {
          id: generateId(),
          name: '',
          nameHe: '',
          conditions: [],
          resultPriority: 'medium',
          escalate: false
        }
      ]
    });
  };

  const removePriorityRule = (id: string) => {
    setConfig({
      ...config,
      priorityRules: config.priorityRules.filter(r => r.id !== id)
    });
  };

  const updatePriorityRule = (id: string, updates: Partial<PriorityRule>) => {
    setConfig({
      ...config,
      priorityRules: config.priorityRules.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  // Routing Rule Management
  const addRoutingRule = () => {
    setConfig({
      ...config,
      routingRules: [
        ...config.routingRules,
        {
          id: generateId(),
          category: config.categories[0]?.id || '',
          priority: 'medium',
          routeTo: {
            type: 'team',
            target: ''
          },
          notificationMethod: 'email',
          autoAssign: true
        }
      ]
    });
  };

  const removeRoutingRule = (id: string) => {
    setConfig({
      ...config,
      routingRules: config.routingRules.filter(r => r.id !== id)
    });
  };

  const updateRoutingRule = (id: string, updates: Partial<RoutingRule>) => {
    setConfig({
      ...config,
      routingRules: config.routingRules.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Brain className="w-8 h-8 text-blue-600" />
                AI לסינון פניות ראשוני (AI Triage)
              </h1>
              <p className="text-gray-600">
                AI Triage - Service #27 - Classification, Sentiment Analysis, Priority & Routing
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-2 px-6 overflow-x-auto">
              {[
                { id: 'basic', label: 'הגדרות בסיס', icon: Settings },
                { id: 'categories', label: 'קטגוריות', icon: Tag },
                { id: 'priority', label: 'כללי עדיפות', icon: Zap },
                { id: 'routing', label: 'מטריצת ניתוב', icon: Route },
                { id: 'sentiment', label: 'ניתוח סנטימנט', icon: Heart },
                { id: 'vip', label: 'VIP ולקוחות מיוחדים', icon: TrendingUp }
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
            {/* Basic Settings Tab */}
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
                        aiProvider: e.target.value as any,
                        aiModel: AI_MODELS[e.target.value]?.[0]?.value || 'gpt-4o-mini'
                      })}
                      options={AI_PROVIDERS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מודל AI
                    </label>
                    <Select
                      value={config.aiModel}
                      onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
                      options={AI_MODELS[config.aiProvider] || []}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מערכת CRM (אופציונלי)
                    </label>
                    <Select
                      value={config.crmSystem || ''}
                      onChange={(e) => setConfig({ ...config, crmSystem: e.target.value as any || undefined })}
                      options={[
                        { value: '', label: 'ללא CRM' },
                        ...CRM_SYSTEMS
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מערכת Ticketing (אופציונלי)
                    </label>
                    <Select
                      value={config.ticketingSystem || ''}
                      onChange={(e) => setConfig({ ...config, ticketingSystem: e.target.value as any || undefined })}
                      options={[
                        { value: '', label: 'ללא Ticketing' },
                        ...TICKETING_SYSTEMS
                      ]}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">הגדרות מודל AI</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Temperature (0-2)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={config.modelSettings.temperature}
                        onChange={(e) => setConfig({
                          ...config,
                          modelSettings: { ...config.modelSettings, temperature: parseFloat(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">נמוך יותר = יותר דטרמיניסטי</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Tokens
                      </label>
                      <Input
                        type="number"
                        value={config.modelSettings.maxTokens}
                        onChange={(e) => setConfig({
                          ...config,
                          modelSettings: { ...config.modelSettings, maxTokens: parseInt(e.target.value) }
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Confidence Threshold (0-1)
                      </label>
                      <Input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={config.modelSettings.confidenceThreshold}
                        onChange={(e) => setConfig({
                          ...config,
                          modelSettings: { ...config.modelSettings, confidenceThreshold: parseFloat(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">סף ביטחון לסיווג אוטומטי</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">מידע חשוב</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        GPT-4o Mini מומלץ לסיווג - מספיק טוב ב-60%+ דיוק, מהיר (&#60;5 שניות), וזול ($0.15/$0.60 למיליון tokens).
                      </p>
                      <p className="text-sm text-blue-700">
                        עלות משוערת: 1,000 פניות ליום × 500 tokens ממוצע = ~$0.30 ליום (~$9/חודש)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">טקסונומיית קטגוריות</h3>
                    <p className="text-sm text-gray-600 mt-1">הגדר 5-10 קטגוריות לסיווג פניות</p>
                  </div>
                  <Button onClick={addCategory} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    הוסף קטגוריה
                  </Button>
                </div>

                <div className="space-y-4">
                  {config.categories.map((category, index) => (
                    <div key={category.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">קטגוריה #{index + 1}</span>
                        </div>
                        <button
                          onClick={() => removeCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            שם (English)
                          </label>
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                            placeholder="Sales"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            שם (עברית)
                          </label>
                          <Input
                            value={category.nameHe}
                            onChange={(e) => updateCategory(category.id, { nameHe: e.target.value })}
                            placeholder="מכירות"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          מילות מפתח (מופרדות בפסיק)
                        </label>
                        <Input
                          value={category.keywords.join(', ')}
                          onChange={(e) => updateCategory(category.id, {
                            keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="quote, price, buy, purchase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          ניתוב אוטומטי (אימייל/שם צוות)
                        </label>
                        <Input
                          value={category.autoAssignTo || ''}
                          onChange={(e) => updateCategory(category.id, { autoAssignTo: e.target.value })}
                          placeholder="sales@company.com"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">טיפ חשוב</h4>
                      <p className="text-sm text-yellow-700">
                        מומלץ להתחיל עם 5-7 קטגוריות בסיסיות. יותר מדי קטגוריות יכול להוריד את הדיוק.
                        וודא שמילות המפתח ברורות ולא חופפות בין קטגוריות.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Priority Rules Tab */}
            {activeTab === 'priority' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">כללי עדיפות</h3>
                    <p className="text-sm text-gray-600 mt-1">הגדר כללים לקביעת עדיפות אוטומטית</p>
                  </div>
                  <Button onClick={addPriorityRule} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    הוסף כלל
                  </Button>
                </div>

                {config.priorityRules.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">אין כללי עדיפות עדיין</p>
                    <Button onClick={addPriorityRule} variant="outline">
                      הוסף כלל ראשון
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.priorityRules.map((rule, index) => (
                      <div key={rule.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-600" />
                            <span className="font-medium text-gray-900">כלל #{index + 1}</span>
                          </div>
                          <button
                            onClick={() => removePriorityRule(rule.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              שם הכלל (English)
                            </label>
                            <Input
                              value={rule.name}
                              onChange={(e) => updatePriorityRule(rule.id, { name: e.target.value })}
                              placeholder="VIP Customer Urgent Keywords"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              שם הכלל (עברית)
                            </label>
                            <Input
                              value={rule.nameHe}
                              onChange={(e) => updatePriorityRule(rule.id, { nameHe: e.target.value })}
                              placeholder="מילות מפתח דחופות ללקוח VIP"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              עדיפות תוצאה
                            </label>
                            <Select
                              value={rule.resultPriority}
                              onChange={(e) => updatePriorityRule(rule.id, { resultPriority: e.target.value as any })}
                              options={PRIORITY_LEVELS}
                            />
                          </div>

                          <div>
                            <label className="flex items-center gap-2 mt-5">
                              <input
                                type="checkbox"
                                checked={rule.escalate || false}
                                onChange={(e) => updatePriorityRule(rule.id, { escalate: e.target.checked })}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">העלה אוטומטית למנהל</span>
                            </label>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          הערה: התנאים המדויקים יוגדרו ב-n8n workflow (מילות מפתח, סנטימנט, דרגת לקוח, וכו')
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Routing Matrix Tab */}
            {activeTab === 'routing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">מטריצת ניתוב</h3>
                    <p className="text-sm text-gray-600 mt-1">מיפוי קטגוריה + עדיפות → צוות/אדם</p>
                  </div>
                  <Button onClick={addRoutingRule} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    הוסף כלל ניתוב
                  </Button>
                </div>

                {config.routingRules.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Route className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">אין כללי ניתוב עדיין</p>
                    <Button onClick={addRoutingRule} variant="outline">
                      הוסף כלל ניתוב ראשון
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.routingRules.map((rule, index) => (
                      <div key={rule.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Route className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">כלל ניתוב #{index + 1}</span>
                          </div>
                          <button
                            onClick={() => removeRoutingRule(rule.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              קטגוריה
                            </label>
                            <Select
                              value={rule.category}
                              onChange={(e) => updateRoutingRule(rule.id, { category: e.target.value })}
                              options={config.categories.map(c => ({ value: c.id, label: c.nameHe || c.name }))}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              עדיפות
                            </label>
                            <Select
                              value={rule.priority}
                              onChange={(e) => updateRoutingRule(rule.id, { priority: e.target.value as any })}
                              options={PRIORITY_LEVELS}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              סוג יעד
                            </label>
                            <Select
                              value={rule.routeTo.type}
                              onChange={(e) => updateRoutingRule(rule.id, {
                                routeTo: { ...rule.routeTo, type: e.target.value as any }
                              })}
                              options={[
                                { value: 'team', label: 'צוות (Team)' },
                                { value: 'person', label: 'אדם ספציפי (Person)' },
                                { value: 'department', label: 'מחלקה (Department)' },
                                { value: 'round_robin', label: 'Round Robin (חלוקה שווה)' }
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              יעד (אימייל/שם)
                            </label>
                            <Input
                              value={rule.routeTo.target}
                              onChange={(e) => updateRoutingRule(rule.id, {
                                routeTo: { ...rule.routeTo, target: e.target.value }
                              })}
                              placeholder="support-team@company.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              שיטת התראה
                            </label>
                            <Select
                              value={rule.notificationMethod}
                              onChange={(e) => updateRoutingRule(rule.id, { notificationMethod: e.target.value as any })}
                              options={[
                                { value: 'email', label: 'Email' },
                                { value: 'sms', label: 'SMS' },
                                { value: 'whatsapp', label: 'WhatsApp' },
                                { value: 'slack', label: 'Slack' },
                                { value: 'teams', label: 'Microsoft Teams' }
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              SLA (דקות)
                            </label>
                            <Input
                              type="number"
                              value={rule.slaMinutes || ''}
                              onChange={(e) => updateRoutingRule(rule.id, { slaMinutes: parseInt(e.target.value) || undefined })}
                              placeholder="60"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 mt-3">
                          <input
                            type="checkbox"
                            checked={rule.autoAssign !== undefined ? rule.autoAssign : true}
                            onChange={(e) => updateRoutingRule(rule.id, { autoAssign: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">הקצה אוטומטית ליעד (ללא התערבות ידנית)</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sentiment Analysis Tab */}
            {activeTab === 'sentiment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">ניתוח סנטימנט ורגש</h3>
                  <p className="text-sm text-gray-600">זיהוי תסכול, כעס, דחיפות ושביעות רצון בפניות</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.sentimentAnalysis.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        sentimentAnalysis: { ...config.sentimentAnalysis, enabled: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      הפעל ניתוח סנטימנט
                    </span>
                  </label>
                </div>

                {config.sentimentAnalysis.enabled && (
                  <>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">ספי סנטימנט (-1 עד 1)</h4>
                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Very Negative
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="-1"
                            max="1"
                            value={config.sentimentAnalysis.thresholds.veryNegative}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                thresholds: { ...config.sentimentAnalysis.thresholds, veryNegative: parseFloat(e.target.value) }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Negative
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="-1"
                            max="1"
                            value={config.sentimentAnalysis.thresholds.negative}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                thresholds: { ...config.sentimentAnalysis.thresholds, negative: parseFloat(e.target.value) }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Neutral
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="-1"
                            max="1"
                            value={config.sentimentAnalysis.thresholds.neutral}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                thresholds: { ...config.sentimentAnalysis.thresholds, neutral: parseFloat(e.target.value) }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Positive
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="-1"
                            max="1"
                            value={config.sentimentAnalysis.thresholds.positive}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                thresholds: { ...config.sentimentAnalysis.thresholds, positive: parseFloat(e.target.value) }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Very Positive
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="-1"
                            max="1"
                            value={config.sentimentAnalysis.thresholds.veryPositive}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                thresholds: { ...config.sentimentAnalysis.thresholds, veryPositive: parseFloat(e.target.value) }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">זיהוי רגשות ספציפיים</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.sentimentAnalysis.emotionDetection.detectFrustration}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                emotionDetection: { ...config.sentimentAnalysis.emotionDetection, detectFrustration: e.target.checked }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">תסכול (Frustration)</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.sentimentAnalysis.emotionDetection.detectAnger}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                emotionDetection: { ...config.sentimentAnalysis.emotionDetection, detectAnger: e.target.checked }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">כעס (Anger)</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.sentimentAnalysis.emotionDetection.detectUrgency}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                emotionDetection: { ...config.sentimentAnalysis.emotionDetection, detectUrgency: e.target.checked }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">דחיפות (Urgency)</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.sentimentAnalysis.emotionDetection.detectDisappointment}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                emotionDetection: { ...config.sentimentAnalysis.emotionDetection, detectDisappointment: e.target.checked }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">אכזבה (Disappointment)</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.sentimentAnalysis.emotionDetection.detectExcitement}
                            onChange={(e) => setConfig({
                              ...config,
                              sentimentAnalysis: {
                                ...config.sentimentAnalysis,
                                emotionDetection: { ...config.sentimentAnalysis.emotionDetection, detectExcitement: e.target.checked }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">התרגשות (Excitement)</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">מחקר אנטרפרייז 2025</h4>
                          <p className="text-sm text-blue-700">
                            60%+ מארגונים משתמשים בניתוח סנטימנט לשיפור חוויית לקוח.
                            זיהוי תסכול + VIP customer = auto-escalate ל-high priority מפחית zמניעה נזק מוניטין.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* VIP Handling Tab */}
            {activeTab === 'vip' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">טיפול ב-VIP ולקוחות מיוחדים</h3>
                  <p className="text-sm text-gray-600">זיהוי אוטומטי והעלאת עדיפות ללקוחות VIP</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.vipHandling.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        vipHandling: { ...config.vipHandling, enabled: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      הפעל טיפול VIP
                    </span>
                  </label>
                </div>

                {config.vipHandling.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שיטת זיהוי VIP
                        </label>
                        <Select
                          value={config.vipHandling.vipIdentificationMethod}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: { ...config.vipHandling, vipIdentificationMethod: e.target.value as any }
                          })}
                          options={[
                            { value: 'crm_field', label: 'שדה ב-CRM' },
                            { value: 'customer_tier', label: 'דרגת לקוח (Tier)' },
                            { value: 'email_domain', label: 'דומיין אימייל' },
                            { value: 'manual_list', label: 'רשימה ידנית' }
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          עדיפות VIP
                        </label>
                        <Select
                          value={config.vipHandling.vipPriority}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: { ...config.vipHandling, vipPriority: e.target.value as any }
                          })}
                          options={PRIORITY_LEVELS.filter(p => p.value === 'urgent' || p.value === 'high')}
                        />
                      </div>
                    </div>

                    {config.vipHandling.vipIdentificationMethod === 'crm_field' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם שדה VIP ב-CRM
                        </label>
                        <Input
                          value={config.vipHandling.vipField || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: { ...config.vipHandling, vipField: e.target.value }
                          })}
                          placeholder="Is_VIP, VIP_Status, Account_Type"
                        />
                      </div>
                    )}

                    {config.vipHandling.vipIdentificationMethod === 'customer_tier' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          דרגות VIP (מופרדות בפסיק)
                        </label>
                        <Input
                          value={config.vipHandling.vipTiers?.join(', ') || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: {
                              ...config.vipHandling,
                              vipTiers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          placeholder="platinum, gold, premium"
                        />
                      </div>
                    )}

                    {config.vipHandling.vipIdentificationMethod === 'email_domain' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          דומיינים VIP (מופרדים בפסיק)
                        </label>
                        <Input
                          value={config.vipHandling.vipDomains?.join(', ') || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: {
                              ...config.vipHandling,
                              vipDomains: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          placeholder="enterprise-client.com, big-company.com"
                        />
                      </div>
                    )}

                    {config.vipHandling.vipIdentificationMethod === 'manual_list' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          רשימת אימיילים VIP (מופרדים בפסיק)
                        </label>
                        <Input
                          value={config.vipHandling.vipEmails?.join(', ') || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: {
                              ...config.vipHandling,
                              vipEmails: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          placeholder="ceo@client.com, director@partner.com"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.vipHandling.autoPriorityBoost}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: { ...config.vipHandling, autoPriorityBoost: e.target.checked }
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">העלה עדיפות אוטומטית ל-VIP</span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שיטת התראה VIP
                        </label>
                        <Select
                          value={config.vipHandling.vipNotificationMethod}
                          onChange={(e) => setConfig({
                            ...config,
                            vipHandling: { ...config.vipHandling, vipNotificationMethod: e.target.value as any }
                          })}
                          options={[
                            { value: 'immediate_alert', label: 'התראה מיידית' },
                            { value: 'dedicated_queue', label: 'תור ייעודי VIP' },
                            { value: 'auto_assign_senior', label: 'הקצאה אוטומטית לסניור' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900 mb-1">קריטי</h4>
                          <p className="text-sm text-red-700">
                            לקוח VIP עם סנטימנט שלילי = סיכון מוניטין גבוה.
                            וודא שיש תהליך להעלאה מיידית למנהל account או סניור.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => navigate('/phase2')}
            variant="outline"
          >
            ביטול
          </Button>
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
                שמור והמשך
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
