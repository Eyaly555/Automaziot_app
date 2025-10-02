import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Bot,
  Brain,
  MessageSquare,
  Database,
  Settings,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  DetailedAIAgentSpec,
  KnowledgeBase,
  DetailedConversationFlow,
  AIAgentIntegrations,
  AIAgentTraining,
  AIModelSelection
} from '../../types/phase2';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEPARTMENTS = [
  { value: 'sales', label: 'מכירות', icon: '💼' },
  { value: 'service', label: 'שירות לקוחות', icon: '🎧' },
  { value: 'operations', label: 'תפעול', icon: '⚙️' }
] as const;

const AI_MODELS = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI', description: 'המתקדם ביותר, מומלץ למשימות מורכבות' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'מהיר וחסכוני, מתאים לרוב המשימות' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic', description: 'מעולה לשיחות ארוכות ומורכבות' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'איזון בין ביצועים ומחיר' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google', description: 'שילוב טקסט ומולטימדיה' }
] as const;

const INTENT_TYPES = [
  'שאלה כללית',
  'בקשה למידע',
  'דיווח על בעיה',
  'בקשה לעזרה',
  'משוב',
  'אחר'
] as const;

export const AIAgentDetailedSpec: React.FC = () => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const existingAgent = agentId
    ? currentMeeting?.implementationSpec?.aiAgents.find(a => a.id === agentId)
    : null;

  const [agent, setAgent] = useState<DetailedAIAgentSpec>(existingAgent || {
    id: generateId(),
    agentId: generateId(),
    name: '',
    department: 'sales',
    knowledgeBase: {
      sources: [],
      documentCount: 0,
      totalTokens: 0,
      updateFrequency: 'manual',
      embeddingModel: 'text-embedding-ada-002'
    },
    conversationFlow: {
      greeting: '',
      intents: [],
      fallbackResponse: '',
      escalationTriggers: [],
      maxTurns: 10,
      contextWindow: 5
    },
    integrations: {
      crmEnabled: false,
      crmSystem: '',
      emailEnabled: false,
      emailProvider: '',
      calendarEnabled: false,
      customWebhooks: []
    },
    training: {
      conversationExamples: [],
      faqPairs: [],
      prohibitedTopics: [],
      tone: 'professional',
      language: 'he'
    },
    model: {
      provider: 'OpenAI',
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'knowledge' | 'conversation' | 'integrations' | 'training' | 'model'>('basic');

  const handleSave = () => {
    if (!currentMeeting) return;

    // Validation
    if (!agent.name || !agent.department) {
      alert('יש למלא את כל שדות החובה');
      return;
    }

    if (agent.knowledgeBase.sources.length === 0) {
      alert('יש להוסיף לפחות מקור ידע אחד');
      return;
    }

    const updatedSpec = {
      ...currentMeeting.implementationSpec!,
      aiAgents: existingAgent
        ? currentMeeting.implementationSpec!.aiAgents.map(a =>
            a.id === agentId ? agent : a
          )
        : [...(currentMeeting.implementationSpec!.aiAgents || []), agent],
      lastUpdated: new Date(),
      updatedBy: 'user'
    };

    updateMeeting({
      implementationSpec: updatedSpec
    });

    navigate('/phase2');
  };

  const addKnowledgeSource = () => {
    setAgent({
      ...agent,
      knowledgeBase: {
        ...agent.knowledgeBase,
        sources: [
          ...agent.knowledgeBase.sources,
          {
            type: 'document',
            name: '',
            path: '',
            lastUpdated: new Date()
          }
        ]
      }
    });
  };

  const updateKnowledgeSource = (index: number, updates: any) => {
    const updatedSources = [...agent.knowledgeBase.sources];
    updatedSources[index] = { ...updatedSources[index], ...updates };
    setAgent({
      ...agent,
      knowledgeBase: {
        ...agent.knowledgeBase,
        sources: updatedSources
      }
    });
  };

  const deleteKnowledgeSource = (index: number) => {
    setAgent({
      ...agent,
      knowledgeBase: {
        ...agent.knowledgeBase,
        sources: agent.knowledgeBase.sources.filter((_, i) => i !== index)
      }
    });
  };

  const addIntent = () => {
    setAgent({
      ...agent,
      conversationFlow: {
        ...agent.conversationFlow,
        intents: [
          ...agent.conversationFlow.intents,
          {
            name: '',
            examples: [],
            response: '',
            requiresData: false
          }
        ]
      }
    });
  };

  const updateIntent = (index: number, updates: any) => {
    const updatedIntents = [...agent.conversationFlow.intents];
    updatedIntents[index] = { ...updatedIntents[index], ...updates };
    setAgent({
      ...agent,
      conversationFlow: {
        ...agent.conversationFlow,
        intents: updatedIntents
      }
    });
  };

  const deleteIntent = (index: number) => {
    setAgent({
      ...agent,
      conversationFlow: {
        ...agent.conversationFlow,
        intents: agent.conversationFlow.intents.filter((_, i) => i !== index)
      }
    });
  };

  const addFAQPair = () => {
    setAgent({
      ...agent,
      training: {
        ...agent.training,
        faqPairs: [
          ...agent.training.faqPairs,
          {
            question: '',
            answer: '',
            category: ''
          }
        ]
      }
    });
  };

  const updateFAQPair = (index: number, updates: any) => {
    const updatedFAQs = [...agent.training.faqPairs];
    updatedFAQs[index] = { ...updatedFAQs[index], ...updates };
    setAgent({
      ...agent,
      training: {
        ...agent.training,
        faqPairs: updatedFAQs
      }
    });
  };

  const deleteFAQPair = (index: number) => {
    setAgent({
      ...agent,
      training: {
        ...agent.training,
        faqPairs: agent.training.faqPairs.filter((_, i) => i !== index)
      }
    });
  };

  const addWebhook = () => {
    setAgent({
      ...agent,
      integrations: {
        ...agent.integrations,
        customWebhooks: [
          ...agent.integrations.customWebhooks,
          {
            name: '',
            url: '',
            trigger: '',
            headers: {}
          }
        ]
      }
    });
  };

  const deleteWebhook = (index: number) => {
    setAgent({
      ...agent,
      integrations: {
        ...agent.integrations,
        customWebhooks: agent.integrations.customWebhooks.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Bot className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {existingAgent ? 'עריכת סוכן AI' : 'סוכן AI חדש'}
              </h1>
            </div>
            <button
              onClick={() => navigate('/phase2')}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { key: 'basic', label: 'פרטים בסיסיים', icon: Settings },
              { key: 'knowledge', label: `מקורות ידע (${agent.knowledgeBase.sources.length})`, icon: Database },
              { key: 'conversation', label: `שיחה (${agent.conversationFlow.intents.length})`, icon: MessageSquare },
              { key: 'integrations', label: 'אינטגרציות', icon: LinkIcon },
              { key: 'training', label: `אימון (${agent.training.faqPairs.length})`, icon: Brain },
              { key: 'model', label: 'מודל AI', icon: Sparkles }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`flex items-center space-x-2 space-x-reverse py-4 px-6 text-center font-medium transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם הסוכן *
                  </label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="לדוגמה: סוכן תמיכה - שירות לקוחות"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מחלקה *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {DEPARTMENTS.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setAgent({ ...agent, department: value })}
                        className={`flex items-center justify-center space-x-2 space-x-reverse p-4 rounded-lg border-2 transition-all ${
                          agent.department === value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Knowledge Base Tab */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">מקורות ידע</h3>
                      <p className="text-sm text-blue-700">
                        הוסף מסמכים, דפי אינטרנט, או מקורות נתונים אחרים שהסוכן יוכל להשתמש בהם למתן מענה
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {agent.knowledgeBase.sources.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">עדיין לא הוספת מקורות ידע</p>
                      <button
                        onClick={addKnowledgeSource}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        הוסף מקור ידע ראשון
                      </button>
                    </div>
                  ) : (
                    <>
                      {agent.knowledgeBase.sources.map((source, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <select
                              value={source.type}
                              onChange={(e) => updateKnowledgeSource(index, { type: e.target.value })}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="document">מסמך</option>
                              <option value="website">אתר אינטרנט</option>
                              <option value="database">מסד נתונים</option>
                              <option value="api">API</option>
                            </select>
                            <button
                              onClick={() => deleteKnowledgeSource(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                שם המקור
                              </label>
                              <input
                                type="text"
                                value={source.name}
                                onChange={(e) => updateKnowledgeSource(index, { name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="לדוגמה: מדריך משתמש - גרסה 2.0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                נתיב / URL
                              </label>
                              <input
                                type="text"
                                value={source.path}
                                onChange={(e) => updateKnowledgeSource(index, { path: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                placeholder={source.type === 'website' ? 'https://...' : '/path/to/file'}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addKnowledgeSource}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        הוסף מקור ידע נוסף
                      </button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תדירות עדכון
                    </label>
                    <select
                      value={agent.knowledgeBase.updateFrequency}
                      onChange={(e) => setAgent({
                        ...agent,
                        knowledgeBase: {
                          ...agent.knowledgeBase,
                          updateFrequency: e.target.value as any
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="realtime">זמן אמת</option>
                      <option value="daily">יומי</option>
                      <option value="weekly">שבועי</option>
                      <option value="manual">ידני</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מודל Embeddings
                    </label>
                    <select
                      value={agent.knowledgeBase.embeddingModel}
                      onChange={(e) => setAgent({
                        ...agent,
                        knowledgeBase: {
                          ...agent.knowledgeBase,
                          embeddingModel: e.target.value
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="text-embedding-ada-002">Ada-002 (OpenAI)</option>
                      <option value="text-embedding-3-small">Embedding-3-Small (OpenAI)</option>
                      <option value="text-embedding-3-large">Embedding-3-Large (OpenAI)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Flow Tab */}
            {activeTab === 'conversation' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ברכה פותחת
                  </label>
                  <textarea
                    value={agent.conversationFlow.greeting}
                    onChange={(e) => setAgent({
                      ...agent,
                      conversationFlow: {
                        ...agent.conversationFlow,
                        greeting: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="שלום! אני כאן לעזור לך. במה אוכל לסייע?"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      כוונות שיחה (Intents)
                    </label>
                    <button
                      onClick={addIntent}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      הוסף כוונה
                    </button>
                  </div>

                  <div className="space-y-3">
                    {agent.conversationFlow.intents.map((intent, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <input
                            type="text"
                            value={intent.name}
                            onChange={(e) => updateIntent(index, { name: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                            placeholder="שם הכוונה (לדוגמה: בקשת מחיר)"
                          />
                          <button
                            onClick={() => deleteIntent(index)}
                            className="mr-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-600">
                            תגובה
                          </label>
                          <textarea
                            value={intent.response}
                            onChange={(e) => updateIntent(index, { response: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={2}
                            placeholder="מה הסוכן יענה?"
                          />
                        </div>

                        <label className="flex items-center space-x-2 space-x-reverse mt-2">
                          <input
                            type="checkbox"
                            checked={intent.requiresData}
                            onChange={(e) => updateIntent(index, { requiresData: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-xs text-gray-600">
                            דורש שליפת מידע מבסיס הידע
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תגובת ברירת מחדל
                  </label>
                  <textarea
                    value={agent.conversationFlow.fallbackResponse}
                    onChange={(e) => setAgent({
                      ...agent,
                      conversationFlow: {
                        ...agent.conversationFlow,
                        fallbackResponse: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="סליחה, לא הבנתי. אוכל לעזור במשהו אחר?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר תורות מקסימלי
                    </label>
                    <input
                      type="number"
                      value={agent.conversationFlow.maxTurns}
                      onChange={(e) => setAgent({
                        ...agent,
                        conversationFlow: {
                          ...agent.conversationFlow,
                          maxTurns: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      חלון הקשר
                    </label>
                    <input
                      type="number"
                      value={agent.conversationFlow.contextWindow}
                      onChange={(e) => setAgent({
                        ...agent,
                        conversationFlow: {
                          ...agent.conversationFlow,
                          contextWindow: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">אינטגרציה עם CRM</h4>
                      <p className="text-sm text-gray-600">עדכון אוטומטי של פרטי לקוח</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.integrations.crmEnabled}
                        onChange={(e) => setAgent({
                          ...agent,
                          integrations: {
                            ...agent.integrations,
                            crmEnabled: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {agent.integrations.crmEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מערכת CRM
                      </label>
                      <input
                        type="text"
                        value={agent.integrations.crmSystem}
                        onChange={(e) => setAgent({
                          ...agent,
                          integrations: {
                            ...agent.integrations,
                            crmSystem: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Zoho CRM / Salesforce / HubSpot"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">שליחת מיילים</h4>
                      <p className="text-sm text-gray-600">שליחה אוטומטית של מיילים</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.integrations.emailEnabled}
                        onChange={(e) => setAgent({
                          ...agent,
                          integrations: {
                            ...agent.integrations,
                            emailEnabled: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">אינטגרציה עם יומן</h4>
                      <p className="text-sm text-gray-600">קביעת פגישות אוטומטית</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.integrations.calendarEnabled}
                        onChange={(e) => setAgent({
                          ...agent,
                          integrations: {
                            ...agent.integrations,
                            calendarEnabled: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Webhooks מותאמים אישית
                    </label>
                    <button
                      onClick={addWebhook}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      הוסף Webhook
                    </button>
                  </div>

                  {agent.integrations.customWebhooks.length > 0 && (
                    <div className="space-y-3">
                      {agent.integrations.customWebhooks.map((webhook, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <input
                              type="text"
                              value={webhook.name}
                              onChange={(e) => {
                                const updated = [...agent.integrations.customWebhooks];
                                updated[index] = { ...webhook, name: e.target.value };
                                setAgent({
                                  ...agent,
                                  integrations: { ...agent.integrations, customWebhooks: updated }
                                });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="שם ה-Webhook"
                            />
                            <button
                              onClick={() => deleteWebhook(index)}
                              className="mr-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <input
                            type="url"
                            value={webhook.url}
                            onChange={(e) => {
                              const updated = [...agent.integrations.customWebhooks];
                              updated[index] = { ...webhook, url: e.target.value };
                              setAgent({
                                ...agent,
                                integrations: { ...agent.integrations, customWebhooks: updated }
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="https://..."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Training Tab */}
            {activeTab === 'training' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      שאלות ותשובות (FAQ)
                    </label>
                    <button
                      onClick={addFAQPair}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      הוסף שאלה
                    </button>
                  </div>

                  <div className="space-y-3">
                    {agent.training.faqPairs.map((faq, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">שאלה #{index + 1}</h4>
                          <button
                            onClick={() => deleteFAQPair(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              שאלה
                            </label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFAQPair(index, { question: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="מה השאלה?"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              תשובה
                            </label>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => updateFAQPair(index, { answer: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                              placeholder="מה התשובה?"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              קטגוריה
                            </label>
                            <input
                              type="text"
                              value={faq.category}
                              onChange={(e) => updateFAQPair(index, { category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="לדוגמה: תמחור, תמיכה טכנית"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {agent.training.faqPairs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">לא הוספת שאלות ותשובות</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סגנון תשובות
                    </label>
                    <select
                      value={agent.training.tone}
                      onChange={(e) => setAgent({
                        ...agent,
                        training: {
                          ...agent.training,
                          tone: e.target.value as any
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="professional">מקצועי</option>
                      <option value="friendly">ידידותי</option>
                      <option value="formal">פורמלי</option>
                      <option value="casual">סיז'ואל</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שפה
                    </label>
                    <select
                      value={agent.training.language}
                      onChange={(e) => setAgent({
                        ...agent,
                        training: {
                          ...agent.training,
                          language: e.target.value as any
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="he">עברית</option>
                      <option value="en">אנגלית</option>
                      <option value="both">דו-לשוני</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Model Tab */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    בחר מודל AI
                  </label>
                  <div className="space-y-3">
                    {AI_MODELS.map(model => (
                      <button
                        key={model.value}
                        onClick={() => setAgent({
                          ...agent,
                          model: {
                            ...agent.model,
                            provider: model.provider,
                            modelName: model.value
                          }
                        })}
                        className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                          agent.model.modelName === model.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse mb-1">
                              <h4 className="font-medium text-gray-900">{model.label}</h4>
                              <span className="text-xs text-gray-500">({model.provider})</span>
                            </div>
                            <p className="text-sm text-gray-600">{model.description}</p>
                          </div>
                          {agent.model.modelName === model.value && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature
                      <span className="text-xs text-gray-500 mr-2">(יצירתיות)</span>
                    </label>
                    <input
                      type="number"
                      value={agent.model.temperature}
                      onChange={(e) => setAgent({
                        ...agent,
                        model: {
                          ...agent.model,
                          temperature: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="2"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                      <span className="text-xs text-gray-500 mr-2">(אורך תשובה)</span>
                    </label>
                    <input
                      type="number"
                      value={agent.model.maxTokens}
                      onChange={(e) => setAgent({
                        ...agent,
                        model: {
                          ...agent.model,
                          maxTokens: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="100"
                      max="4000"
                      step="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top P
                      <span className="text-xs text-gray-500 mr-2">(דיוק)</span>
                    </label>
                    <input
                      type="number"
                      value={agent.model.topP}
                      onChange={(e) => setAgent({
                        ...agent,
                        model: {
                          ...agent.model,
                          topP: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/phase2')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
          >
            <Save className="w-4 h-4" />
            <span>שמור סוכן AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
