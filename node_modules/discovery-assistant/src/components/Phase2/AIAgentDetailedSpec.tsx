import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon,
  Lightbulb,
  CheckSquare,
  Loader,
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  expandAIAgents,
  hasAIAgentUseCases,
} from '../../utils/aiAgentExpander';
import {
  DetailedAIAgentSpec,
  KnowledgeSource,
  Intent,
  Webhook,
  FAQPair,
  AcceptanceCriteria,
  FunctionalRequirement,
  PerformanceRequirement,
  UsabilityRequirement,
} from '../../types/phase2';
import { Input, TextArea, Button } from '../Base';
import {
  generateAcceptanceCriteria,
  getAIAgentCriteria,
} from '../../utils/acceptanceCriteriaGenerator';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEPARTMENTS = [
  { value: 'sales', label: 'מכירות', icon: '💼' },
  { value: 'service', label: 'שירות לקוחות', icon: '🎧' },
  { value: 'operations', label: 'תפעול', icon: '⚙️' },
] as const;

const AI_MODELS = [
  {
    value: 'gpt-4',
    label: 'GPT-4',
    provider: 'OpenAI',
    description: 'המתקדם ביותר, מומלץ למשימות מורכבות',
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'מהיר וחסכוני, מתאים לרוב המשימות',
  },
  {
    value: 'claude-3-opus',
    label: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'מעולה לשיחות ארוכות ומורכבות',
  },
  {
    value: 'claude-3-sonnet',
    label: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'איזון בין ביצועים ומחיר',
  },
  {
    value: 'gemini-pro',
    label: 'Gemini Pro',
    provider: 'Google',
    description: 'שילוב טקסט ומולטימדיה',
  },
] as const;

export const AIAgentDetailedSpec: React.FC = () => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const existingAgent = agentId
    ? currentMeeting?.implementationSpec?.aiAgents.find((a) => a.id === agentId)
    : null;

  // Check if AI services were purchased (defensive fallback to selectedServices for backward compatibility)
  const purchasedServices =
    currentMeeting?.modules?.proposal?.purchasedServices?.length > 0
      ? currentMeeting.modules.proposal.purchasedServices
      : currentMeeting?.modules?.proposal?.selectedServices || [];
  const hasAIServices = purchasedServices.some(
    (s) => s.category === 'ai_agents'
  );
  const aiServicesCount = purchasedServices.filter(
    (s) => s.category === 'ai_agents'
  ).length;

  const [agent, setAgent] = useState<DetailedAIAgentSpec>(
    existingAgent || {
      id: generateId(),
      agentId: generateId(),
      name: '',
      department: 'sales',
      knowledgeBase: {
        sources: [],
        documentCount: 0,
        totalTokens: 0,
        updateFrequency: 'manual',
        embeddingModel: 'text-embedding-ada-002',
      },
      conversationFlow: {
        greeting: '',
        intents: [],
        fallbackResponse: '',
        escalationTriggers: [],
        maxTurns: 10,
        contextWindow: 5,
      },
      integrations: {
        crmEnabled: false,
        crmSystem: '',
        emailEnabled: false,
        emailProvider: '',
        calendarEnabled: false,
        customWebhooks: [],
      },
      training: {
        conversationExamples: [],
        faqPairs: [],
        prohibitedTopics: [],
        tone: 'professional',
        language: 'he',
      },
      model: {
        provider: 'OpenAI',
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
      },
    }
  );

  const [activeTab, setActiveTab] = useState<
    | 'basic'
    | 'knowledge'
    | 'conversation'
    | 'integrations'
    | 'training'
    | 'model'
    | 'acceptance'
  >('basic');
  const [expandedFromPhase1, setExpandedFromPhase1] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [agentCriteria, setAgentCriteria] = useState<AcceptanceCriteria | null>(
    null
  );

  // Auto-expand AI agents from Phase 1 on component mount
  useEffect(() => {
    // Only if we're creating a new agent (not editing existing)
    if (agentId || !currentMeeting) return;

    // CRITICAL: Check if client purchased AI services
    // Phase 2 should only expand AI agents if AI services were actually purchased
    // Defensive fallback to selectedServices for backward compatibility
    const purchasedServices =
      currentMeeting?.modules?.proposal?.purchasedServices?.length > 0
        ? currentMeeting.modules.proposal.purchasedServices
        : currentMeeting?.modules?.proposal?.selectedServices || [];
    const hasAIServices = purchasedServices.some(
      (s) => s.category === 'ai_agents'
    );

    console.log('[AIAgentDetailedSpec] AI Service Filtering:', {
      totalPurchasedServices: purchasedServices.length,
      hasAIServices,
      aiServicesCount: purchasedServices.filter(
        (s) => s.category === 'ai_agents'
      ).length,
      aiServiceIds: purchasedServices
        .filter((s) => s.category === 'ai_agents')
        .map((s) => s.id),
    });

    // If no AI services purchased, don't expand agents
    if (!hasAIServices) {
      console.warn(
        '[AIAgentDetailedSpec] No AI services purchased - skipping agent expansion'
      );
      return;
    }

    // Check if we have AI use cases in Phase 1
    const hasUseCases = hasAIAgentUseCases(currentMeeting);

    // Check if agents are already expanded in Phase 2
    const existingAgents = currentMeeting.implementationSpec?.aiAgents || [];

    // If we have use cases and no existing agents, auto-expand
    if (hasUseCases && existingAgents.length === 0 && !expandedFromPhase1) {
      console.log('[AIAgentDetailedSpec] Expanding AI agents from Phase 1...');
      const expandedAgents = expandAIAgents(currentMeeting);

      if (expandedAgents.length > 0) {
        console.log(
          '[AIAgentDetailedSpec] Successfully expanded',
          expandedAgents.length,
          'AI agents'
        );

        // Save expanded agents to meeting
        updateMeeting({
          implementationSpec: {
            ...currentMeeting.implementationSpec!,
            aiAgents: expandedAgents,
            lastUpdated: new Date(),
            updatedBy: 'system',
          },
        });

        setExpandedFromPhase1(true);

        // Navigate back to dashboard to show all expanded agents
        navigate('/phase2');
      }
    }
  }, [agentId, currentMeeting, expandedFromPhase1, navigate, updateMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // CRITICAL: Check if AI services were purchased before allowing save
    if (!hasAIServices) {
      alert(
        'לא ניתן לשמור סוכן AI - שירותי AI לא נכללו בהצעה המאושרת.\n\nאנא חזור לשלב Discovery ובחר שירותי AI רלוונטיים.'
      );
      console.warn(
        '[AIAgentDetailedSpec] Attempted to save AI agent without purchased AI services'
      );
      return;
    }

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
        ? currentMeeting.implementationSpec!.aiAgents.map(
            (a: DetailedAIAgentSpec) => (a.id === agentId ? agent : a)
          )
        : [...(currentMeeting.implementationSpec!.aiAgents || []), agent],
      lastUpdated: new Date(),
      updatedBy: 'user',
    };

    updateMeeting({
      implementationSpec: updatedSpec,
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
            lastUpdated: new Date(),
          },
        ],
      },
    });
  };

  const updateKnowledgeSource = (
    index: number,
    updates: Partial<KnowledgeSource>
  ) => {
    const updatedSources = [...agent.knowledgeBase.sources];
    updatedSources[index] = { ...updatedSources[index], ...updates };
    setAgent({
      ...agent,
      knowledgeBase: {
        ...agent.knowledgeBase,
        sources: updatedSources,
      },
    });
  };

  const deleteKnowledgeSource = (index: number) => {
    setAgent({
      ...agent,
      knowledgeBase: {
        ...agent.knowledgeBase,
        sources: agent.knowledgeBase.sources.filter(
          (_item: KnowledgeSource, i: number) => i !== index
        ),
      },
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
            requiresData: false,
          },
        ],
      },
    });
  };

  const updateIntent = (index: number, updates: Partial<Intent>) => {
    const updatedIntents = [...agent.conversationFlow.intents];
    updatedIntents[index] = { ...updatedIntents[index], ...updates };
    setAgent({
      ...agent,
      conversationFlow: {
        ...agent.conversationFlow,
        intents: updatedIntents,
      },
    });
  };

  const deleteIntent = (index: number) => {
    setAgent({
      ...agent,
      conversationFlow: {
        ...agent.conversationFlow,
        intents: agent.conversationFlow.intents.filter(
          (_item: Intent, i: number) => i !== index
        ),
      },
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
            category: '',
          },
        ],
      },
    });
  };

  const updateFAQPair = (index: number, updates: Partial<FAQPair>) => {
    const updatedFAQs = [...agent.training.faqPairs];
    updatedFAQs[index] = { ...updatedFAQs[index], ...updates };
    setAgent({
      ...agent,
      training: {
        ...agent.training,
        faqPairs: updatedFAQs,
      },
    });
  };

  const deleteFAQPair = (index: number) => {
    setAgent({
      ...agent,
      training: {
        ...agent.training,
        faqPairs: agent.training.faqPairs.filter(
          (_item: FAQPair, i: number) => i !== index
        ),
      },
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
            headers: {},
          },
        ],
      },
    });
  };

  const deleteWebhook = (index: number) => {
    setAgent({
      ...agent,
      integrations: {
        ...agent.integrations,
        customWebhooks: agent.integrations.customWebhooks.filter(
          (_item: Webhook, i: number) => i !== index
        ),
      },
    });
  };

  const handleGenerateCriteria = async () => {
    if (!currentMeeting) return;

    setIsGeneratingCriteria(true);
    try {
      // Generate full acceptance criteria
      const fullCriteria = generateAcceptanceCriteria(currentMeeting);

      // Filter to get only criteria for this AI agent
      const filtered = getAIAgentCriteria(
        fullCriteria,
        agent.name,
        agent.department
      );
      setAgentCriteria(filtered);

      // Save the full criteria to meeting
      updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec!,
          acceptanceCriteria: fullCriteria,
          lastUpdated: new Date(),
          updatedBy: 'user',
        },
      });
    } catch (error) {
      console.error('Failed to generate acceptance criteria:', error);
      alert('שגיאה ביצירת קריטריוני קבלה');
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const updateCriterion = (
    type: 'functional' | 'performance' | 'usability',
    id: string,
    updates: Partial<
      FunctionalRequirement | PerformanceRequirement | UsabilityRequirement
    >
  ) => {
    if (
      !currentMeeting?.implementationSpec?.acceptanceCriteria ||
      !agentCriteria
    )
      return;

    const fullCriteria = currentMeeting.implementationSpec.acceptanceCriteria;
    const updatedCriteria = {
      ...fullCriteria,
      [type]: fullCriteria[type].map(
        (
          item:
            | FunctionalRequirement
            | PerformanceRequirement
            | UsabilityRequirement
        ) => (item.id === id ? { ...item, ...updates } : item)
      ),
    };

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        acceptanceCriteria: updatedCriteria,
        lastUpdated: new Date(),
      },
    });

    // Update local state
    const filtered = getAIAgentCriteria(
      updatedCriteria,
      agent.name,
      agent.department
    );
    setAgentCriteria(filtered);
  };

  // Load existing criteria for this AI agent
  useEffect(() => {
    if (currentMeeting?.implementationSpec?.acceptanceCriteria && agent.name) {
      const filtered = getAIAgentCriteria(
        currentMeeting.implementationSpec.acceptanceCriteria,
        agent.name,
        agent.department
      );
      setAgentCriteria(filtered);
    }
  }, [currentMeeting, agent.name, agent.department]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {existingAgent ? 'עריכת סוכן AI' : 'סוכן AI חדש'}
              </h1>
              {hasAIServices && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  {aiServicesCount} שירותי AI נרכשו
                </span>
              )}
              {existingAgent?.id &&
                currentMeeting?.implementationSpec?.aiAgents?.find(
                  (a) => a.id === existingAgent.id
                )?.id &&
                expandedFromPhase1 && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    <Lightbulb className="w-4 h-4" />
                    הורחב מ-Phase 1
                  </span>
                )}
            </div>
            <button
              onClick={() => navigate('/phase2')}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Warning: No AI Services Purchased */}
        {!hasAIServices && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Bot className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  שירותי AI לא נכללו בהצעה המאושרת
                </h3>
                <p className="text-orange-800 mb-3">
                  כרגע לא רכשת שירותי AI במסגרת ההצעה המאושרת. כדי להוסיף סוכני
                  AI לפרויקט, יש לחזור לשלב Discovery ולבחור שירותי AI
                  רלוונטיים.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/phase2')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    חזרה ל-Phase 2
                  </button>
                  <button
                    onClick={() => navigate('/discovery')}
                    className="px-4 py-2 border-2 border-orange-600 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    חזרה ל-Discovery לבחירת שירותים
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { key: 'basic' as const, label: 'פרטים בסיסיים', icon: Settings },
              {
                key: 'knowledge' as const,
                label: `מקורות ידע (${agent.knowledgeBase.sources.length})`,
                icon: Database,
              },
              {
                key: 'conversation' as const,
                label: `שיחה (${agent.conversationFlow.intents.length})`,
                icon: MessageSquare,
              },
              {
                key: 'integrations' as const,
                label: 'אינטגרציות',
                icon: LinkIcon,
              },
              {
                key: 'training' as const,
                label: `אימון (${agent.training.faqPairs.length})`,
                icon: Brain,
              },
              { key: 'model' as const, label: 'מודל AI', icon: Sparkles },
              {
                key: 'acceptance' as const,
                label: 'קריטריוני קבלה',
                icon: CheckSquare,
              },
            ].map(
              ({
                key,
                label,
                icon: Icon,
              }: {
                key: typeof activeTab;
                label: string;
                icon: React.FC<{ className?: string }>;
              }) => (
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
              )
            )}
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <Input
                  label="שם הסוכן *"
                  value={agent.name}
                  onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                  placeholder="לדוגמה: סוכן תמיכה - שירות לקוחות"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מחלקה *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {DEPARTMENTS.map(
                      ({
                        value,
                        label,
                        icon,
                      }: {
                        value: DetailedAIAgentSpec['department'];
                        label: string;
                        icon: string;
                      }) => (
                        <button
                          key={value}
                          onClick={() =>
                            setAgent({ ...agent, department: value })
                          }
                          className={`flex items-center justify-center space-x-2 space-x-reverse p-4 rounded-lg border-2 transition-all ${
                            agent.department === value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{icon}</span>
                          <span className="font-medium">{label}</span>
                        </button>
                      )
                    )}
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
                      <h3 className="font-medium text-blue-900 mb-1">
                        מקורות ידע
                      </h3>
                      <p className="text-sm text-blue-700">
                        הוסף מסמכים, דפי אינטרנט, או מקורות נתונים אחרים שהסוכן
                        יוכל להשתמש בהם למתן מענה
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {agent.knowledgeBase.sources.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        עדיין לא הוספת מקורות ידע
                      </p>
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
                      {agent.knowledgeBase.sources.map(
                        (source: KnowledgeSource, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <select
                                value={source.type}
                                onChange={(e) =>
                                  updateKnowledgeSource(index, {
                                    type: e.target
                                      .value as KnowledgeSource['type'],
                                  })
                                }
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
                                  onChange={(e) =>
                                    updateKnowledgeSource(index, {
                                      name: e.target.value,
                                    })
                                  }
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
                                  onChange={(e) =>
                                    updateKnowledgeSource(index, {
                                      path: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                  placeholder={
                                    source.type === 'website'
                                      ? 'https://...'
                                      : '/path/to/file'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}

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
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          knowledgeBase: {
                            ...agent.knowledgeBase,
                            updateFrequency: e.target.value as any,
                          },
                        })
                      }
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
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          knowledgeBase: {
                            ...agent.knowledgeBase,
                            embeddingModel: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="text-embedding-ada-002">
                        Ada-002 (OpenAI)
                      </option>
                      <option value="text-embedding-3-small">
                        Embedding-3-Small (OpenAI)
                      </option>
                      <option value="text-embedding-3-large">
                        Embedding-3-Large (OpenAI)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Flow Tab */}
            {activeTab === 'conversation' && (
              <div className="space-y-6">
                <TextArea
                  label="ברכה פותחת"
                  value={agent.conversationFlow.greeting}
                  onChange={(e) =>
                    setAgent({
                      ...agent,
                      conversationFlow: {
                        ...agent.conversationFlow,
                        greeting: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  placeholder="שלום! אני כאן לעזור לך. במה אוכל לסייע?"
                />

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
                    {agent.conversationFlow.intents.map(
                      (intent: Intent, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <input
                              type="text"
                              value={intent.name}
                              onChange={(e) =>
                                updateIntent(index, { name: e.target.value })
                              }
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
                              onChange={(e) =>
                                updateIntent(index, {
                                  response: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                              placeholder="מה הסוכן יענה?"
                            />
                          </div>

                          <label className="flex items-center space-x-2 space-x-reverse mt-2">
                            <input
                              type="checkbox"
                              checked={intent.requiresData}
                              onChange={(e) =>
                                updateIntent(index, {
                                  requiresData: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            <span className="text-xs text-gray-600">
                              דורש שליפת מידע מבסיס הידע
                            </span>
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <TextArea
                  label="תגובת ברירת מחדל"
                  value={agent.conversationFlow.fallbackResponse}
                  onChange={(e) =>
                    setAgent({
                      ...agent,
                      conversationFlow: {
                        ...agent.conversationFlow,
                        fallbackResponse: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  placeholder="סליחה, לא הבנתי. אוכל לעזור במשהו אחר?"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר תורות מקסימלי
                    </label>
                    <input
                      type="number"
                      value={agent.conversationFlow.maxTurns}
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          conversationFlow: {
                            ...agent.conversationFlow,
                            maxTurns: parseInt(e.target.value),
                          },
                        })
                      }
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
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          conversationFlow: {
                            ...agent.conversationFlow,
                            contextWindow: parseInt(e.target.value),
                          },
                        })
                      }
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
                      <h4 className="font-medium text-gray-900">
                        אינטגרציה עם CRM
                      </h4>
                      <p className="text-sm text-gray-600">
                        עדכון אוטומטי של פרטי לקוח
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.integrations.crmEnabled}
                        onChange={(e) =>
                          setAgent({
                            ...agent,
                            integrations: {
                              ...agent.integrations,
                              crmEnabled: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {agent.integrations.crmEnabled && (
                    <Input
                      label="מערכת CRM"
                      value={agent.integrations.crmSystem}
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          integrations: {
                            ...agent.integrations,
                            crmSystem: e.target.value,
                          },
                        })
                      }
                      placeholder="Zoho CRM / Salesforce / HubSpot"
                    />
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        שליחת מיילים
                      </h4>
                      <p className="text-sm text-gray-600">
                        שליחה אוטומטית של מיילים
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.integrations.emailEnabled}
                        onChange={(e) =>
                          setAgent({
                            ...agent,
                            integrations: {
                              ...agent.integrations,
                              emailEnabled: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        אינטגרציה עם יומן
                      </h4>
                      <p className="text-sm text-gray-600">
                        קביעת פגישות אוטומטית
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.integrations.calendarEnabled}
                        onChange={(e) =>
                          setAgent({
                            ...agent,
                            integrations: {
                              ...agent.integrations,
                              calendarEnabled: e.target.checked,
                            },
                          })
                        }
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
                      {agent.integrations.customWebhooks.map(
                        (webhook: Webhook, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <input
                                type="text"
                                value={webhook.name}
                                onChange={(e) => {
                                  const updated = [
                                    ...agent.integrations.customWebhooks,
                                  ];
                                  updated[index] = {
                                    ...webhook,
                                    name: e.target.value,
                                  };
                                  setAgent({
                                    ...agent,
                                    integrations: {
                                      ...agent.integrations,
                                      customWebhooks: updated,
                                    },
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
                                const updated = [
                                  ...agent.integrations.customWebhooks,
                                ];
                                updated[index] = {
                                  ...webhook,
                                  url: e.target.value,
                                };
                                setAgent({
                                  ...agent,
                                  integrations: {
                                    ...agent.integrations,
                                    customWebhooks: updated,
                                  },
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                              placeholder="https://..."
                            />
                          </div>
                        )
                      )}
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
                    {agent.training.faqPairs.map(
                      (faq: FAQPair, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              שאלה #{index + 1}
                            </h4>
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
                                onChange={(e) =>
                                  updateFAQPair(index, {
                                    question: e.target.value,
                                  })
                                }
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
                                onChange={(e) =>
                                  updateFAQPair(index, {
                                    answer: e.target.value,
                                  })
                                }
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
                                onChange={(e) =>
                                  updateFAQPair(index, {
                                    category: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="לדוגמה: תמחור, תמיכה טכנית"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}

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
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          training: {
                            ...agent.training,
                            tone: e.target.value as any,
                          },
                        })
                      }
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
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          training: {
                            ...agent.training,
                            language: e.target.value as any,
                          },
                        })
                      }
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
                    {AI_MODELS.map(
                      (model: {
                        value: string;
                        label: string;
                        provider: string;
                        description: string;
                      }) => (
                        <button
                          key={model.value}
                          onClick={() =>
                            setAgent({
                              ...agent,
                              model: {
                                ...agent.model,
                                provider: model.provider,
                                modelName: model.value,
                              },
                            })
                          }
                          className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                            agent.model.modelName === model.value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {model.label}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  ({model.provider})
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {model.description}
                              </p>
                            </div>
                            {agent.model.modelName === model.value && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature
                      <span className="text-xs text-gray-500 mr-2">
                        (יצירתיות)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={agent.model.temperature}
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          model: {
                            ...agent.model,
                            temperature: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="2"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                      <span className="text-xs text-gray-500 mr-2">
                        (אורך תשובה)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={agent.model.maxTokens}
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          model: {
                            ...agent.model,
                            maxTokens: parseInt(e.target.value),
                          },
                        })
                      }
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
                      onChange={(e) =>
                        setAgent({
                          ...agent,
                          model: {
                            ...agent.model,
                            topP: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Acceptance Criteria Tab */}
            {activeTab === 'acceptance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      קריטריוני קבלה לסוכן AI
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      דרישות פונקציונליות, ביצועים ושימושיות לסוכן זה
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCriteria}
                    disabled={isGeneratingCriteria}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    {isGeneratingCriteria ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        מייצר...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        ייצר קריטריונים
                      </>
                    )}
                  </button>
                </div>

                {!agentCriteria ||
                (agentCriteria.functional.length === 0 &&
                  agentCriteria.performance.length === 0 &&
                  agentCriteria.usability.length === 0) ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      עדיין לא נוצרו קריטריוני קבלה
                    </p>
                    <button
                      onClick={handleGenerateCriteria}
                      disabled={isGeneratingCriteria}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Sparkles className="w-4 h-4 inline ml-2" />
                      ייצר עכשיו
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {agentCriteria.functional.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          דרישות פונקציונליות ({agentCriteria.functional.length}
                          )
                        </h4>
                        <div className="space-y-2">
                          {agentCriteria.functional.map(
                            (req: FunctionalRequirement) => (
                              <div
                                key={req.id}
                                className="bg-white border border-gray-200 rounded-lg p-3"
                              >
                                <input
                                  type="text"
                                  value={req.description}
                                  onChange={(e) =>
                                    updateCriterion('functional', req.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  className="w-full font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                                />
                                <p className="text-sm text-gray-600 mt-1 px-2">
                                  {req.acceptanceCriteria}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {agentCriteria.performance.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          דרישות ביצועים ({agentCriteria.performance.length})
                        </h4>
                        <div className="space-y-2">
                          {agentCriteria.performance.map(
                            (req: PerformanceRequirement) => (
                              <div
                                key={req.id}
                                className="bg-green-50 border border-green-200 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">
                                    {req.metric}
                                  </span>
                                  <input
                                    type="text"
                                    value={req.target}
                                    onChange={(e) =>
                                      updateCriterion('performance', req.id, {
                                        target: e.target.value,
                                      })
                                    }
                                    className="text-sm px-2 py-1 bg-white border border-green-300 rounded"
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {agentCriteria.usability.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          דרישות שימושיות ({agentCriteria.usability.length})
                        </h4>
                        <div className="space-y-2">
                          {agentCriteria.usability.map(
                            (req: UsabilityRequirement) => (
                              <div
                                key={req.id}
                                className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                              >
                                <p className="font-medium text-gray-900">
                                  {req.requirement}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {req.successCriteria}
                                </p>
                                <label className="flex items-center gap-1 text-sm mt-2">
                                  <input
                                    type="checkbox"
                                    checked={req.tested}
                                    onChange={(e) =>
                                      updateCriterion('usability', req.id, {
                                        tested: e.target.checked,
                                      })
                                    }
                                    className="rounded"
                                  />
                                  נבדק
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/phase2')}>
            ביטול
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            שמור סוכן AI
          </Button>
        </div>
      </div>
    </div>
  );
};
