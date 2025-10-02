import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  Server,
  Link2,
  Bot,
  CheckSquare,
  Plus,
  ArrowRight,
  ChevronRight,
  Settings,
  Database,
  Zap,
  FileText,
  Download,
  Copy,
  FileDown
} from 'lucide-react';
import { ImplementationSpecData } from '../../types';
import { exportToMarkdown, exportToText, copyToClipboard } from '../../utils/englishExport';

type SpecSection = 'systems' | 'integrations' | 'ai_agents' | 'acceptance';

export const ImplementationSpecDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting, transitionPhase, canTransitionTo } = useMeetingStore();
  const [selectedSection, setSelectedSection] = useState<SpecSection>('systems');

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">לא נמצאה פגישה</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            חזרה לדשבורד
          </button>
        </div>
      </div>
    );
  }

  // Initialize implementation spec if doesn't exist
  if (!currentMeeting.implementationSpec) {
    const newSpec: ImplementationSpecData = {
      systems: [],
      integrations: [],
      aiAgents: [],
      acceptanceCriteria: {
        functional: [],
        performance: [],
        security: [],
        usability: []
      },
      totalEstimatedHours: 0,
      completionPercentage: 0,
      lastUpdated: new Date(),
      updatedBy: 'user'
    };

    updateMeeting({ implementationSpec: newSpec });
  }

  const spec = currentMeeting.implementationSpec!;

  // Calculate completion percentages
  const systemsProgress = spec.systems.length > 0 ?
    (spec.systems.filter(s => s.authentication.credentialsProvided).length / spec.systems.length * 100) : 0;

  const integrationsProgress = spec.integrations.length > 0 ?
    (spec.integrations.filter(i => i.testCases.length > 0).length / spec.integrations.length * 100) : 0;

  const aiAgentsProgress = spec.aiAgents.length > 0 ?
    (spec.aiAgents.filter(a => a.knowledgeBase.sources.length > 0).length / spec.aiAgents.length * 100) : 0;

  const acceptanceProgress =
    (spec.acceptanceCriteria.functional.length +
     spec.acceptanceCriteria.performance.length +
     spec.acceptanceCriteria.security.length +
     spec.acceptanceCriteria.usability.length) > 0 ? 50 : 0;

  const overallProgress = Math.round(
    (systemsProgress + integrationsProgress + aiAgentsProgress + acceptanceProgress) / 4
  );

  const sections = [
    {
      id: 'systems' as SpecSection,
      name: 'מפרט מערכות',
      icon: Server,
      color: 'blue',
      count: spec.systems.length,
      progress: systemsProgress,
      description: 'פירוט טכני מלא של כל מערכת'
    },
    {
      id: 'integrations' as SpecSection,
      name: 'זרימות אינטגרציה',
      icon: Link2,
      color: 'green',
      count: spec.integrations.length,
      progress: integrationsProgress,
      description: 'הגדרת תהליכי אינטגרציה בין מערכות'
    },
    {
      id: 'ai_agents' as SpecSection,
      name: 'סוכני AI מפורטים',
      icon: Bot,
      color: 'purple',
      count: spec.aiAgents.length,
      progress: aiAgentsProgress,
      description: 'מפרט מלא לכל סוכן AI'
    },
    {
      id: 'acceptance' as SpecSection,
      name: 'קריטריוני קבלה',
      icon: CheckSquare,
      color: 'orange',
      count:
        spec.acceptanceCriteria.functional.length +
        spec.acceptanceCriteria.performance.length +
        spec.acceptanceCriteria.security.length +
        spec.acceptanceCriteria.usability.length,
      progress: acceptanceProgress,
      description: 'דרישות ותנאי סיום'
    }
  ];

  const handleCompleteSpec = () => {
    if (overallProgress < 70) {
      alert('יש להשלים לפחות 70% מהמפרט לפני המעבר לשלב הפיתוח');
      return;
    }

    if (confirm('האם אתה בטוח שברצונך להשלים את המפרט ולעבור לשלב הפיתוח?')) {
      updateMeeting({
        status: 'spec_complete',
        implementationSpec: {
          ...spec,
          completionPercentage: overallProgress,
          lastUpdated: new Date()
        }
      });

      if (canTransitionTo('development')) {
        transitionPhase('development', 'Completed implementation specification');
        navigate('/phase3');
      }
    }
  };

  const handleExportMarkdown = () => {
    exportToMarkdown(currentMeeting);
  };

  const handleExportText = () => {
    exportToText(currentMeeting);
  };

  const handleCopyToClipboard = async () => {
    try {
      await copyToClipboard(currentMeeting);
      alert('הועתק ללוח!');
    } catch (error) {
      alert('שגיאה בהעתקה');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">מפרט יישום טכני</h1>
              <p className="text-gray-600 mt-1">פרטים טכניים מלאים לצוות הפיתוח</p>
              <p className="text-sm text-gray-500 mt-1">לקוח: {currentMeeting.clientName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{overallProgress}%</div>
                <div className="text-sm text-gray-600">השלמה</div>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  title="ייצוא למפתחים (Markdown)"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Markdown</span>
                </button>
                <button
                  onClick={handleExportText}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  title="ייצוא טקסט"
                >
                  <FileText className="w-4 h-4" />
                  <span>Text</span>
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  title="העתק ללוח"
                >
                  <Copy className="w-4 h-4" />
                  <span>העתק</span>
                </button>
              </div>

              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                חזרה לדשבורד
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const isSelected = selectedSection === section.id;

            return (
              <div
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  isSelected ? 'ring-2 ring-blue-500 transform scale-105' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${section.color}-100`}>
                    <Icon className={`w-6 h-6 text-${section.color}-600`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{section.count}</div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${section.color}-500 transition-all duration-500`}
                      style={{ width: `${section.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">{Math.round(section.progress)}% מושלם</div>
              </div>
            );
          })}
        </div>

        {/* Selected Section Content */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {sections.find(s => s.id === selectedSection)?.name}
            </h2>
            <button
              onClick={() => navigate(`/phase2/${selectedSection}/new`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              הוסף חדש
            </button>
          </div>

          {/* Content based on selected section */}
          {selectedSection === 'systems' && (
            <div className="space-y-4">
              {spec.systems.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">טרם נוספו מערכות למפרט</p>
                  <button
                    onClick={() => navigate('/phase2/systems/new')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    הוסף מערכת ראשונה
                  </button>
                </div>
              ) : (
                spec.systems.map((system) => (
                  <div
                    key={system.id}
                    onClick={() => navigate(`/phase2/systems/${system.id}`)}
                    className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Server className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{system.systemName}</h3>
                          <p className="text-sm text-gray-600">
                            {system.modules.length} מודולים • {system.authentication.method}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedSection === 'integrations' && (
            <div className="space-y-4">
              {spec.integrations.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">טרם הוגדרו אינטגרציות</p>
                  <button
                    onClick={() => navigate('/phase2/integrations/new')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    הגדר אינטגרציה ראשונה
                  </button>
                </div>
              ) : (
                spec.integrations.map((integration) => (
                  <div
                    key={integration.id}
                    onClick={() => navigate(`/phase2/integrations/${integration.id}`)}
                    className="p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Link2 className="w-8 h-8 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-600">
                            {integration.sourceSystem} → {integration.targetSystem}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          integration.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          integration.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          integration.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {integration.priority}
                        </span>
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedSection === 'ai_agents' && (
            <div className="space-y-4">
              {spec.aiAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">טרם הוגדרו סוכני AI מפורטים</p>
                  <button
                    onClick={() => navigate('/phase2/ai-agents/new')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    הגדר סוכן AI ראשון
                  </button>
                </div>
              ) : (
                spec.aiAgents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => navigate(`/phase2/ai-agents/${agent.id}`)}
                    className="p-6 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Bot className="w-8 h-8 text-purple-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-600">
                            {agent.department} • {agent.knowledgeBase.sources.length} מקורות ידע
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedSection === 'acceptance' && (
            <div className="space-y-6">
              {/* Functional Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">דרישות פונקציונליות</h3>
                {spec.acceptanceCriteria.functional.length === 0 ? (
                  <p className="text-gray-600 text-sm">טרם הוגדרו דרישות</p>
                ) : (
                  <div className="space-y-2">
                    {spec.acceptanceCriteria.functional.map((req) => (
                      <div key={req.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                req.priority === 'must_have' ? 'bg-red-100 text-red-700' :
                                req.priority === 'should_have' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {req.priority}
                              </span>
                              <span className={`w-3 h-3 rounded-full ${
                                req.status === 'passed' ? 'bg-green-500' :
                                req.status === 'failed' ? 'bg-red-500' :
                                req.status === 'in_progress' ? 'bg-yellow-500' :
                                'bg-gray-300'
                              }`} />
                            </div>
                            <p className="text-sm text-gray-900 mt-2">{req.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/phase2/acceptance/new')}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
              >
                + הוסף קריטריון קבלה
              </button>
            </div>
          )}
        </div>

        {/* Complete Spec Button */}
        {overallProgress >= 70 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">מוכן להעברה לפיתוח!</h3>
                <p className="text-gray-700">
                  המפרט הטכני הושלם ב-{overallProgress}%. ניתן כעת לעבור לשלב הפיתוח ולייצר משימות אוטומטית.
                </p>
              </div>
              <button
                onClick={handleCompleteSpec}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
              >
                <span>המשך לפיתוח</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
