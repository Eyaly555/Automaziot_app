import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  AlertCircle,
  Info,
  Loader,
  MessageSquare,
  Database,
  Settings,
  Shield,
  TrendingUp,
  Globe,
  DollarSign,
  Zap,
  BookOpen
} from 'lucide-react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { AIFAQBotConfig } from '../../../../types/automationServices';
import { Button, Input, Select } from '../../../Base';

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' }
];

const OPENAI_MODELS = [
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o Mini (מומלץ - זול ויעיל)',
    cost: { input: 0.15, output: 0.60 }
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    cost: { input: 0.50, output: 1.50 }
  }
];

const ANTHROPIC_MODELS = [
  {
    value: 'claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet (90% caching savings)',
    cost: { input: 3.00, output: 15.00 }
  },
  {
    value: 'claude-3.5-haiku',
    label: 'Claude 3.5 Haiku',
    cost: { input: 0.80, output: 4.00 }
  }
];

const VECTOR_DATABASES = [
  { value: 'supabase_pgvector', label: 'Supabase pgvector (חינם עד 500MB)' },
  { value: 'pinecone_starter', label: 'Pinecone Starter (1M reads חינם)' },
  { value: 'qdrant', label: 'Qdrant' },
  { value: 'weaviate', label: 'Weaviate' }
];

const EMBEDDING_MODELS = [
  { value: 'text-embedding-3-small', label: 'text-embedding-3-small (מומלץ - $0.02/1M)' },
  { value: 'text-embedding-3-large', label: 'text-embedding-3-large' },
  { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002' }
];

const FAQ_FORMATS = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
  { value: 'pdf', label: 'PDF' },
  { value: 'google_docs', label: 'Google Docs' }
];

const CHUNK_STRATEGIES = [
  { value: '500_tokens', label: '500 tokens (מומלץ)' },
  { value: '1000_tokens', label: '1000 tokens' },
  { value: 'custom', label: 'מותאם אישית' }
];

const CHAT_WIDGET_TYPES = [
  { value: 'javascript_sdk', label: 'JavaScript SDK' },
  { value: 'iframe', label: 'iframe embed' },
  { value: 'api', label: 'API integration' }
];

const CHAT_WIDGET_POSITIONS = [
  { value: 'bottom_right', label: 'פינה ימנית תחתונה' },
  { value: 'bottom_left', label: 'פינה שמאלית תחתונה' },
  { value: 'custom', label: 'מיקום מותאם' }
];

export const AIFAQBotSpec: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AIFAQBotConfig>({
    aiProvider: 'openai',
    model: 'gpt-4o-mini',
    apiKeyProvided: false,
    vectorDatabase: 'supabase_pgvector',
    vectorDbCredentialsReady: false,
    embeddingModel: 'text-embedding-3-small',
    knowledgeBase: {
      faqCount: 50,
      faqFormat: 'json',
      documentChunkingStrategy: '500_tokens'
    },
    messageTemplates: {
      greeting: 'שלום! אני כאן לעזור לך. איך אני יכול לסייע?',
      fallback: 'מצטער, אני לא בטוח שאני מבין את השאלה. האם תוכל לנסח אותה אחרת?',
      handoff: 'אעביר אותך לנציג אנושי שיוכל לעזור לך יותר טוב.',
      privacyNotice: 'השיחה מוקלטת לצורך שיפור השירות. המידע נשמר למשך 30 יום.'
    },
    escalationConfig: {
      failedAttemptsThreshold: 2,
      escalationKeywords: ['דחוף', 'מנהל', 'תלונה', 'urgent', 'manager', 'complaint'],
      businessHoursOnly: false,
      humanAgentAvailable: false
    },
    ragConfig: {
      hybridApproach: true,
      topKResults: 3,
      confidenceThreshold: 0.75,
      contextWindow: 128000
    },
    websiteIntegration: {
      websiteUrl: '',
      chatWidgetType: 'javascript_sdk',
      chatWidgetPosition: 'bottom_right',
      mobileResponsive: true
    },
    gdprCompliance: {
      conversationRetentionDays: 30,
      encryptAtRest: true,
      userDeletionRights: true,
      privacyPolicyLink: '',
      cookieConsent: true
    },
    rateLimits: {
      requestsPerMinute: 30000,
      concurrentUsers: 500,
      dailyConversations: 100
    },
    monitoring: {
      resolutionRateTarget: 70,
      fallbackRateTarget: 20,
      trackUserSatisfaction: true,
      analyticsEnabled: true
    },
    costEstimation: {
      estimatedConversationsPerDay: 100,
      averageMessagesPerConversation: 6
    },
    testing: {
      testMode: true,
      testFAQsUploaded: false,
      vectorDbTested: false,
      chatWidgetTested: false
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'knowledge' | 'templates' | 'rag' | 'integration' | 'gdpr' | 'cost'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing config from meeting store if available
  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(a => a.serviceId === 'ai-faq-bot');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Cost calculator
  const estimatedMonthlyCost = useMemo(() => {
    const { estimatedConversationsPerDay, averageMessagesPerConversation } = config.costEstimation;
    const totalMessagesPerMonth = estimatedConversationsPerDay * 30 * averageMessagesPerConversation;

    // Estimate tokens per message (input + output)
    const avgInputTokensPerMessage = 200; // User question + context
    const avgOutputTokensPerMessage = 150; // Bot response

    const totalInputTokens = totalMessagesPerMonth * avgInputTokensPerMessage;
    const totalOutputTokens = totalMessagesPerMonth * avgOutputTokensPerMessage;

    let aiCost = 0;
    if (config.aiProvider === 'openai') {
      const model = OPENAI_MODELS.find(m => m.value === config.model);
      if (model) {
        aiCost = (totalInputTokens / 1000000 * model.cost.input) +
                 (totalOutputTokens / 1000000 * model.cost.output);
      }
    } else {
      const model = ANTHROPIC_MODELS.find(m => m.value === config.model);
      if (model) {
        // Apply 90% caching savings for Claude
        const cachedInputCost = (totalInputTokens * 0.9) / 1000000 * (model.cost.input * 0.1);
        const regularInputCost = (totalInputTokens * 0.1) / 1000000 * model.cost.input;
        aiCost = cachedInputCost + regularInputCost + (totalOutputTokens / 1000000 * model.cost.output);
      }
    }

    // Add embedding cost
    const embeddingCost = (config.knowledgeBase.faqCount * 100) / 1000000 * 0.02; // One-time cost for embeddings

    // Add vector DB cost (if using paid tier)
    const vectorDbCost = config.vectorDatabase === 'supabase_pgvector' && config.knowledgeBase.faqCount > 100 ? 25 : 0;

    return {
      aiCost: aiCost.toFixed(2),
      embeddingCost: embeddingCost.toFixed(2),
      vectorDbCost: vectorDbCost.toFixed(2),
      totalMonthlyCost: (aiCost + vectorDbCost).toFixed(2),
      totalMessagesPerMonth
    };
  }, [config.costEstimation, config.aiProvider, config.model, config.knowledgeBase.faqCount, config.vectorDatabase]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!currentMeeting) return;

      const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
      const updated = aiAgentServices.filter(a => a.serviceId !== 'ai-faq-bot');

      updated.push({
        serviceId: 'ai-faq-bot',
        serviceName: 'צ\'אטבוט למענה על שאלות נפוצות',
        requirements: {
          ...config,
          costEstimation: {
            ...config.costEstimation,
            estimatedMonthlyCost: parseFloat(estimatedMonthlyCost.totalMonthlyCost)
          }
        },
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
      console.error('Error saving ai-faq-bot config:', error);
      setIsSaving(false);
    }
  };

  const getModelOptions = () => {
    return config.aiProvider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                צ'אטבוט AI למענה על שאלות נפוצות
              </h1>
              <p className="text-gray-600">
                AI FAQ Chatbot - Service #21
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
                { id: 'knowledge', label: 'מאגר ידע', icon: BookOpen },
                { id: 'templates', label: 'תבניות הודעות', icon: MessageSquare },
                { id: 'rag', label: 'RAG וחיפוש', icon: Database },
                { id: 'integration', label: 'אינטגרציה לאתר', icon: Globe },
                { id: 'gdpr', label: 'GDPR ופרטיות', icon: Shield },
                { id: 'cost', label: 'תכנון עלויות', icon: DollarSign }
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
                        model: e.target.value === 'openai' ? 'gpt-4o-mini' : 'claude-3.5-sonnet'
                      })}
                      options={AI_PROVIDERS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מודל AI
                    </label>
                    <Select
                      value={config.model}
                      onChange={(e) => setConfig({ ...config, model: e.target.value as any })}
                      options={getModelOptions()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vector Database
                    </label>
                    <Select
                      value={config.vectorDatabase}
                      onChange={(e) => setConfig({ ...config, vectorDatabase: e.target.value as any })}
                      options={VECTOR_DATABASES}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Embedding Model
                    </label>
                    <Select
                      value={config.embeddingModel}
                      onChange={(e) => setConfig({ ...config, embeddingModel: e.target.value as any })}
                      options={EMBEDDING_MODELS}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.apiKeyProvided}
                      onChange={(e) => setConfig({ ...config, apiKeyProvided: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      API Key מוכן
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.vectorDbCredentialsReady}
                      onChange={(e) => setConfig({ ...config, vectorDbCredentialsReady: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Vector DB Credentials מוכנים
                    </span>
                  </label>
                </div>

                {config.aiProvider === 'openai' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">שימו לב - OpenAI</h4>
                        <p className="text-sm text-blue-700">
                          GPT-4o Mini זול פי 20 מ-GPT-4 Turbo ומספיק טוב ל-FAQ בסיסי.
                          Prompt caching מוריד עלויות ב-75% על context חוזר.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {config.aiProvider === 'anthropic' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-1">שימו לב - Claude</h4>
                        <p className="text-sm text-purple-700">
                          Claude 3.5 Sonnet עם prompt caching חוסך 90% מעלויות ה-input tokens.
                          מומלץ לשיחות ארוכות עם הרבה context.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Knowledge Base Tab */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר שאלות תשובות (FAQ)
                    </label>
                    <Input
                      type="number"
                      value={config.knowledgeBase.faqCount}
                      onChange={(e) => setConfig({
                        ...config,
                        knowledgeBase: { ...config.knowledgeBase, faqCount: parseInt(e.target.value) }
                      })}
                      min="50"
                      max="200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      מינימום: 50, מקסימום: 200 (מומלץ 100-150)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      פורמט FAQ
                    </label>
                    <Select
                      value={config.knowledgeBase.faqFormat}
                      onChange={(e) => setConfig({
                        ...config,
                        knowledgeBase: { ...config.knowledgeBase, faqFormat: e.target.value as any }
                      })}
                      options={FAQ_FORMATS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מיקום אחסון
                    </label>
                    <Input
                      value={config.knowledgeBase.faqStorageLocation || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        knowledgeBase: { ...config.knowledgeBase, faqStorageLocation: e.target.value }
                      })}
                      placeholder="Google Drive / Dropbox / URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אסטרטגיית Chunking
                    </label>
                    <Select
                      value={config.knowledgeBase.documentChunkingStrategy}
                      onChange={(e) => setConfig({
                        ...config,
                        knowledgeBase: { ...config.knowledgeBase, documentChunkingStrategy: e.target.value as any }
                      })}
                      options={CHUNK_STRATEGIES}
                    />
                  </div>
                </div>

                {config.knowledgeBase.documentChunkingStrategy === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      גודל Chunk מותאם (tokens)
                    </label>
                    <Input
                      type="number"
                      value={config.knowledgeBase.customChunkSize || 500}
                      onChange={(e) => setConfig({
                        ...config,
                        knowledgeBase: { ...config.knowledgeBase, customChunkSize: parseInt(e.target.value) }
                      })}
                      min="100"
                      max="2000"
                    />
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">דברים חשובים</h4>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc mr-5">
                        <li>ודא שכל השאלות והתשובות מנוסחות בצורה ברורה וקצרה</li>
                        <li>כל FAQ צריך category לארגון נכון</li>
                        <li>אל תעלה מעל 100-200 FAQs - אחרת צריך delegation</li>
                        <li>תבנית: question (שאלה), answer (תשובה), category (קטגוריה)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הודעת פתיחה (Greeting)
                  </label>
                  <textarea
                    value={config.messageTemplates.greeting}
                    onChange={(e) => setConfig({
                      ...config,
                      messageTemplates: { ...config.messageTemplates, greeting: e.target.value }
                    })}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הודעת Fallback (כשלא יודע לענות)
                  </label>
                  <textarea
                    value={config.messageTemplates.fallback}
                    onChange={(e) => setConfig({
                      ...config,
                      messageTemplates: { ...config.messageTemplates, fallback: e.target.value }
                    })}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הודעת Handoff (העברה לאנושי)
                  </label>
                  <textarea
                    value={config.messageTemplates.handoff}
                    onChange={(e) => setConfig({
                      ...config,
                      messageTemplates: { ...config.messageTemplates, handoff: e.target.value }
                    })}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הודעת פרטיות (GDPR)
                  </label>
                  <textarea
                    value={config.messageTemplates.privacyNotice}
                    onChange={(e) => setConfig({
                      ...config,
                      messageTemplates: { ...config.messageTemplates, privacyNotice: e.target.value }
                    })}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">הגדרות Escalation</h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ניסיונות כושלים לפני העברה
                      </label>
                      <Input
                        type="number"
                        value={config.escalationConfig.failedAttemptsThreshold}
                        onChange={(e) => setConfig({
                          ...config,
                          escalationConfig: { ...config.escalationConfig, failedAttemptsThreshold: parseInt(e.target.value) }
                        })}
                        min="1"
                        max="5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        אימייל להעברה
                      </label>
                      <Input
                        type="email"
                        value={config.escalationConfig.handoffEmail || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          escalationConfig: { ...config.escalationConfig, handoffEmail: e.target.value }
                        })}
                        placeholder="support@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      מילות מפתח להעברה (מופרדות בפסיק)
                    </label>
                    <Input
                      value={config.escalationConfig.escalationKeywords.join(', ')}
                      onChange={(e) => setConfig({
                        ...config,
                        escalationConfig: {
                          ...config.escalationConfig,
                          escalationKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }
                      })}
                      placeholder="דחוף, מנהל, תלונה, urgent, manager"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.escalationConfig.businessHoursOnly}
                        onChange={(e) => setConfig({
                          ...config,
                          escalationConfig: { ...config.escalationConfig, businessHoursOnly: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">העברה רק בשעות עבודה</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.escalationConfig.humanAgentAvailable}
                        onChange={(e) => setConfig({
                          ...config,
                          escalationConfig: { ...config.escalationConfig, humanAgentAvailable: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">נציג אנושי זמין</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* RAG Configuration Tab */}
            {activeTab === 'rag' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top-K Results
                    </label>
                    <Input
                      type="number"
                      value={config.ragConfig.topKResults}
                      onChange={(e) => setConfig({
                        ...config,
                        ragConfig: { ...config.ragConfig, topKResults: parseInt(e.target.value) }
                      })}
                      min="1"
                      max="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">מומלץ: 3-5</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Threshold
                    </label>
                    <Input
                      type="number"
                      step="0.05"
                      value={config.ragConfig.confidenceThreshold}
                      onChange={(e) => setConfig({
                        ...config,
                        ragConfig: { ...config.ragConfig, confidenceThreshold: parseFloat(e.target.value) }
                      })}
                      min="0.5"
                      max="1.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">מומלץ: 0.70-0.80</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Context Window (tokens)
                    </label>
                    <Input
                      type="number"
                      value={config.ragConfig.contextWindow}
                      onChange={(e) => setConfig({
                        ...config,
                        ragConfig: { ...config.ragConfig, contextWindow: parseInt(e.target.value) }
                      })}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">128K tokens (GPT-4o)</p>
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.ragConfig.hybridApproach}
                    onChange={(e) => setConfig({
                      ...config,
                      ragConfig: { ...config.ragConfig, hybridApproach: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Hybrid Approach (FAQ-links + RAG fallback) - מומלץ מאוד!
                  </span>
                </label>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">קריטי - Hybrid Approach</h4>
                      <p className="text-sm text-red-700">
                        חובה להשתמש ב-Hybrid approach! FAQ-links (vetted answers) + RAG fallback.
                        לא לגנרט תשובות לשאלות נפוצות - רק לחזור תשובות מאומתות.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Website Integration Tab */}
            {activeTab === 'integration' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      כתובת האתר
                    </label>
                    <Input
                      value={config.websiteIntegration.websiteUrl}
                      onChange={(e) => setConfig({
                        ...config,
                        websiteIntegration: { ...config.websiteIntegration, websiteUrl: e.target.value }
                      })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סוג Widget
                    </label>
                    <Select
                      value={config.websiteIntegration.chatWidgetType}
                      onChange={(e) => setConfig({
                        ...config,
                        websiteIntegration: { ...config.websiteIntegration, chatWidgetType: e.target.value as any }
                      })}
                      options={CHAT_WIDGET_TYPES}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מיקום Widget
                    </label>
                    <Select
                      value={config.websiteIntegration.chatWidgetPosition}
                      onChange={(e) => setConfig({
                        ...config,
                        websiteIntegration: { ...config.websiteIntegration, chatWidgetPosition: e.target.value as any }
                      })}
                      options={CHAT_WIDGET_POSITIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      צבע Widget (אופציונלי)
                    </label>
                    <Input
                      type="color"
                      value={config.websiteIntegration.chatWidgetColor || '#3B82F6'}
                      onChange={(e) => setConfig({
                        ...config,
                        websiteIntegration: { ...config.websiteIntegration, chatWidgetColor: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.websiteIntegration.mobileResponsive}
                    onChange={(e) => setConfig({
                      ...config,
                      websiteIntegration: { ...config.websiteIntegration, mobileResponsive: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mobile Responsive (מותאם לנייד)
                  </span>
                </label>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">טיפ חשוב</h4>
                      <p className="text-sm text-blue-700">
                        וודא שיש גישה לקוד האתר להטמעת JavaScript SDK או iframe.
                        בדוק שה-widget לא חוסם תוכן חשוב באתר (במיוחד במובייל).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GDPR Tab */}
            {activeTab === 'gdpr' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ימי שמירת שיחות
                    </label>
                    <Input
                      type="number"
                      value={config.gdprCompliance.conversationRetentionDays}
                      onChange={(e) => setConfig({
                        ...config,
                        gdprCompliance: { ...config.gdprCompliance, conversationRetentionDays: parseInt(e.target.value) }
                      })}
                      min="1"
                      max="90"
                    />
                    <p className="text-xs text-gray-500 mt-1">מומלץ: מקסימום 30 יום</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      קישור למדיניות פרטיות
                    </label>
                    <Input
                      value={config.gdprCompliance.privacyPolicyLink}
                      onChange={(e) => setConfig({
                        ...config,
                        gdprCompliance: { ...config.gdprCompliance, privacyPolicyLink: e.target.value }
                      })}
                      placeholder="https://example.com/privacy"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.gdprCompliance.encryptAtRest}
                      onChange={(e) => setConfig({
                        ...config,
                        gdprCompliance: { ...config.gdprCompliance, encryptAtRest: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Encrypt at Rest (הצפנת נתונים)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.gdprCompliance.userDeletionRights}
                      onChange={(e) => setConfig({
                        ...config,
                        gdprCompliance: { ...config.gdprCompliance, userDeletionRights: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      זכות משתמש למחיקת נתונים ("delete my data")
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.gdprCompliance.cookieConsent}
                      onChange={(e) => setConfig({
                        ...config,
                        gdprCompliance: { ...config.gdprCompliance, cookieConsent: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Cookie Consent (הסכמה לעוגיות)
                    </span>
                  </label>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">דרישות GDPR</h4>
                      <ul className="text-sm text-red-700 space-y-1 list-disc mr-5">
                        <li>שיחות מקסימום 30 יום שמירה</li>
                        <li>הצפנה של נתונים (encryption at rest)</li>
                        <li>זכות משתמש למחוק נתונים ("delete my data")</li>
                        <li>קישור למדיניות פרטיות</li>
                        <li>הסכמה מפורשת לשמירת שיחות</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Planning Tab */}
            {activeTab === 'cost' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שיחות מוערכות ליום
                    </label>
                    <Input
                      type="number"
                      value={config.costEstimation.estimatedConversationsPerDay}
                      onChange={(e) => setConfig({
                        ...config,
                        costEstimation: { ...config.costEstimation, estimatedConversationsPerDay: parseInt(e.target.value) }
                      })}
                      min="10"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      הודעות ממוצעות לשיחה
                    </label>
                    <Input
                      type="number"
                      value={config.costEstimation.averageMessagesPerConversation}
                      onChange={(e) => setConfig({
                        ...config,
                        costEstimation: { ...config.costEstimation, averageMessagesPerConversation: parseInt(e.target.value) }
                      })}
                      min="2"
                      max="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RPM (Requests Per Minute)
                    </label>
                    <Input
                      type="number"
                      value={config.rateLimits.requestsPerMinute}
                      onChange={(e) => setConfig({
                        ...config,
                        rateLimits: { ...config.rateLimits, requestsPerMinute: parseInt(e.target.value) }
                      })}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">GPT-4o Mini Tier 1: 30K RPM</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      משתמשים במקביל (max)
                    </label>
                    <Input
                      type="number"
                      value={config.rateLimits.concurrentUsers}
                      onChange={(e) => setConfig({
                        ...config,
                        rateLimits: { ...config.rateLimits, concurrentUsers: parseInt(e.target.value) }
                      })}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">~500 concurrent users</p>
                  </div>
                </div>

                {/* Cost Breakdown Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">הערכת עלויות חודשית</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">עלות AI (API calls):</span>
                      <span className="font-bold text-gray-900">${estimatedMonthlyCost.aiCost}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">עלות Embeddings (חד פעמי):</span>
                      <span className="font-bold text-gray-900">${estimatedMonthlyCost.embeddingCost}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Vector DB:</span>
                      <span className="font-bold text-gray-900">${estimatedMonthlyCost.vectorDbCost}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">סה"כ חודשי:</span>
                      <span className="text-2xl font-bold text-blue-600">${estimatedMonthlyCost.totalMonthlyCost}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      מבוסס על {estimatedMonthlyCost.totalMessagesPerMonth.toLocaleString()} הודעות/חודש
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">יעדי ביצועים</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        יעד Resolution Rate (%)
                      </label>
                      <Input
                        type="number"
                        value={config.monitoring.resolutionRateTarget}
                        onChange={(e) => setConfig({
                          ...config,
                          monitoring: { ...config.monitoring, resolutionRateTarget: parseInt(e.target.value) }
                        })}
                        min="50"
                        max="100"
                      />
                      <p className="text-xs text-gray-500 mt-1">מומלץ: {'>'} 70%</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        יעד Fallback Rate (%)
                      </label>
                      <Input
                        type="number"
                        value={config.monitoring.fallbackRateTarget}
                        onChange={(e) => setConfig({
                          ...config,
                          monitoring: { ...config.monitoring, fallbackRateTarget: parseInt(e.target.value) }
                        })}
                        min="0"
                        max="50"
                      />
                      <p className="text-xs text-gray-500 mt-1">מומלץ: {'<'} 20%</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.monitoring.trackUserSatisfaction}
                        onChange={(e) => setConfig({
                          ...config,
                          monitoring: { ...config.monitoring, trackUserSatisfaction: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">מעקב שביעות רצון משתמשים (CSAT)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.monitoring.analyticsEnabled}
                        onChange={(e) => setConfig({
                          ...config,
                          monitoring: { ...config.monitoring, analyticsEnabled: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Analytics מופעל</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">מעקב ביצועים</h4>
                      <p className="text-sm text-blue-700">
                        מעקב: resolution rate (target: {'>'} 70%), fallback rate ({'<'} 20%), user satisfaction (CSAT).
                        חשוב לעקוב אחרי missed utterances - שאלות שהבוט לא הבין.
                      </p>
                    </div>
                  </div>
                </div>
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
