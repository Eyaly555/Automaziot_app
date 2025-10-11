import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  Server,
  Link2,
  Bot,
  CheckSquare,
  Plus,
  ArrowRight,
  ChevronRight,
  Database,
  Zap,
  ClipboardList,
  FileCheck,
  FileText
} from 'lucide-react';
import { ImplementationSpecData, CollectedRequirements, SelectedService } from '../../types';
import { DetailedSystemSpec, IntegrationFlow, DetailedAIAgentSpec, FunctionalRequirement } from '../../types/phase2';
import { RequirementsNavigator } from '../Requirements/RequirementsNavigator';
import { getServiceById } from '../../config/servicesDatabase';
import { getRequirementsTemplate } from '../../config/serviceRequirementsTemplates';
import { ExportMenu } from '../Common/ExportMenu';
import { Button } from '../Base';
import { IncompleteServicesAlert } from './IncompleteServicesAlert';
import { DeveloperRequirementsGuide } from './DeveloperRequirementsGuide';
import { SmartRequirementsCollector } from './SmartRequirementsCollector';

type SpecSection = 'requirements' | 'systems' | 'integrations' | 'ai_agents' | 'acceptance' | 'guide' | 'smart_collector';

export const ImplementationSpecDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting, transitionPhase, canTransitionTo } = useMeetingStore();
  const [selectedSection, setSelectedSection] = useState<SpecSection>('requirements');

  // Auto-transition from discovery to implementation_spec if client approved
  useEffect(() => {
    if (currentMeeting?.phase === 'discovery' && currentMeeting?.status === 'client_approved') {
      console.log('[ImplementationSpecDashboard] Auto-transitioning from discovery to implementation_spec');
      transitionPhase('implementation_spec', 'Client approved proposal - auto-transition');
    }
  }, [currentMeeting?.phase, currentMeeting?.status, transitionPhase]);

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">לא נמצאה פגישה</h2>
          <button
            onClick={() => navigate('/dashboard')}
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
      automations: [],
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

    // Return early to allow React to re-render with the new spec
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">מאתחל מפרט יישום...</p>
        </div>
      </div>
    );
  }

  // Defensive access to implementationSpec - should never be null after initialization check above
  const spec = currentMeeting.implementationSpec;

  // Safety check - if spec is still null, return error state
  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">שגיאה באתחול המפרט</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            חזרה לדשבורד
          </button>
        </div>
      </div>
    );
  }

  // Defensive access to spec properties with fallback to empty arrays
  const systems = spec.systems || [];
  const integrations = spec.integrations || [];
  const aiAgents = spec.aiAgents || [];
  const acceptanceCriteria = spec.acceptanceCriteria || { functional: [], performance: [], security: [], usability: [] };

  // Get purchased services from proposal (services client actually bought)
  const purchasedServicesArray = currentMeeting.modules?.proposal?.purchasedServices || [];

  // Add warning if empty
  if (purchasedServicesArray.length === 0) {
    console.warn('[Phase2] No purchased services found - cannot proceed');
  }
  const requirements = currentMeeting.modules?.requirements || [];

  // Extract service IDs from purchased services
  const purchasedServiceIds = purchasedServicesArray.map((s: SelectedService) => s.id);

  // Debug logging for data flow validation
  console.log('[ImplementationSpecDashboard] Purchased services:', purchasedServicesArray.length);
  console.log('[ImplementationSpecDashboard] Service IDs:', purchasedServiceIds);

  // Filter services that actually have requirement templates
  const servicesWithRequirements = purchasedServiceIds.filter((serviceId: string) =>
    getRequirementsTemplate(serviceId) !== null
  );

  // Calculate completion percentages
  // Requirements: Check if all services with templates have requirements collected
  const requirementsProgress = servicesWithRequirements.length > 0
    ? (requirements.length / servicesWithRequirements.length * 100)
    : 100; // If no services need requirements, consider complete

  const systemsProgress = systems.length > 0 ?
    (systems.filter((s: DetailedSystemSpec) => s.authentication?.credentialsProvided).length / systems.length * 100) : 0;

  const integrationsProgress = integrations.length > 0 ?
    (integrations.filter((i: IntegrationFlow) => i.testCases?.length > 0).length / integrations.length * 100) : 0;

  const aiAgentsProgress = aiAgents.length > 0 ?
    (aiAgents.filter((a: DetailedAIAgentSpec) => a.knowledgeBase?.sources?.length > 0).length / aiAgents.length * 100) : 0;

  const acceptanceProgress =
    ((acceptanceCriteria.functional?.length || 0) +
     (acceptanceCriteria.performance?.length || 0) +
     (acceptanceCriteria.security?.length || 0) +
     (acceptanceCriteria.usability?.length || 0)) > 0 ? 50 : 0;

  const overallProgress = Math.round(
    (requirementsProgress + systemsProgress + integrationsProgress + aiAgentsProgress + acceptanceProgress) / 5
  );

  const sections = [
    {
      id: 'requirements' as SpecSection,
      name: 'איסוף דרישות',
      icon: ClipboardList,
      color: 'indigo',
      count: requirements.length,
      progress: requirementsProgress,
      description: 'דרישות טכניות מפורטות לכל שירות'
    },
    {
      id: 'smart_collector' as SpecSection,
      name: 'איסוף חכם',
      icon: Zap,
      color: 'purple',
      count: purchasedServicesArray.length,
      progress: requirementsProgress,
      description: 'איסוף דרישות טכניות עם זיהוי שדות משותפים'
    },
    {
      id: 'guide' as SpecSection,
      name: 'מדריך למפתחים',
      icon: FileText,
      color: 'teal',
      count: purchasedServicesArray.length,
      progress: requirementsProgress,
      description: 'מפרט מלא של כל השדות לאיסוף'
    },
    {
      id: 'systems' as SpecSection,
      name: 'מפרט מערכות',
      icon: Server,
      color: 'blue',
      count: systems.length,
      progress: systemsProgress,
      description: 'פירוט טכני מלא של כל מערכת'
    },
    {
      id: 'integrations' as SpecSection,
      name: 'זרימות אינטגרציה',
      icon: Link2,
      color: 'green',
      count: integrations.length,
      progress: integrationsProgress,
      description: 'הגדרת תהליכי אינטגרציה בין מערכות'
    },
    {
      id: 'ai_agents' as SpecSection,
      name: 'סוכני AI מפורטים',
      icon: Bot,
      color: 'purple',
      count: aiAgents.length,
      progress: aiAgentsProgress,
      description: 'מפרט מלא לכל סוכן AI'
    },
    {
      id: 'acceptance' as SpecSection,
      name: 'קריטריוני קבלה',
      icon: CheckSquare,
      color: 'orange',
      count:
        (acceptanceCriteria.functional?.length || 0) +
        (acceptanceCriteria.performance?.length || 0) +
        (acceptanceCriteria.security?.length || 0) +
        (acceptanceCriteria.usability?.length || 0),
      progress: acceptanceProgress,
      description: 'דרישות ותנאי סיום'
    }
  ];

  const handleCompleteSpec = () => {
    if (overallProgress < 100) {
      alert('יש להשלים 100% מהמפרט לפני המעבר לשלב הפיתוח');
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

  const handleRequirementsComplete = (allRequirements: CollectedRequirements[]) => {
    updateMeeting({
      modules: {
        ...currentMeeting.modules,
        requirements: allRequirements
      }
    });
    // Move to next section after requirements are complete
    setSelectedSection('systems');
  };

  // If requirements are not complete and requirements section is selected, show full RequirementsNavigator
  if (selectedSection === 'requirements' && requirementsProgress < 100) {
    return (
      <div id="requirements-navigator">
        <RequirementsNavigator
          meeting={currentMeeting}
          onComplete={handleRequirementsComplete}
          onBack={() => navigate('/dashboard')}
          language="he"
        />
      </div>
    );
  }

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

              {/* Export Menu */}
              <ExportMenu variant="button" />

              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                חזרה לדשבורד
              </Button>
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
        {/* Alert for incomplete services */}
        <IncompleteServicesAlert />

        {/* Link to Service Requirements Router */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">איסוף דרישות טכניות</h3>
              <p className="text-gray-600 mt-1">
                מלא את הדרישות הטכניות עבור כל השירותים שנרכשו
              </p>
            </div>
            <Link
              to="/phase2/service-requirements"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileCheck className="w-5 h-5" />
              מלא דרישות טכניות
            </Link>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
          {sections.map((section: typeof sections[number]) => {
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
              {sections.find((s: typeof sections[number]) => s.id === selectedSection)?.name}
            </h2>
            {selectedSection !== 'requirements' && selectedSection !== 'systems' && (
              <Button
                variant="primary"
                onClick={() => navigate(`/phase2/${selectedSection}/new`)}
                icon={<Plus className="w-5 h-5" />}
              >
                הוסף חדש
              </Button>
            )}
            {selectedSection === 'systems' && (
              <Button
                variant="primary"
                onClick={() => navigate('/phase2/systems')}
                icon={<Server className="w-5 h-5" />}
              >
                בחר מערכות
              </Button>
            )}
          </div>

          {/* Content based on selected section */}
          {selectedSection === 'smart_collector' && (
            <SmartRequirementsCollector />
          )}

          {selectedSection === 'guide' && (
            <DeveloperRequirementsGuide />
          )}

          {selectedSection === 'requirements' && (
            <div className="space-y-4">
              {requirementsProgress >= 100 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckSquare className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-900">איסוף הדרישות הושלם</h3>
                        <p className="text-sm text-green-700">נאספו דרישות עבור {requirements.length} שירותים</p>
                      </div>
                    </div>
                  </div>

                  {/* Show collected requirements summary */}
                  {requirements.map((req: CollectedRequirements) => {
                    const service = getServiceById(req.serviceId);
                    return (
                      <div
                        key={req.serviceId}
                        className="p-6 border border-gray-200 rounded-lg bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <ClipboardList className="w-8 h-8 text-indigo-600" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {service?.nameHe || req.serviceId}
                              </h3>
                              <p className="text-sm text-gray-600">
                                הושלם בתאריך: {req.completedAt ? new Date(req.completedAt).toLocaleDateString('he-IL') : 'לא הושלם'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {req.completedSections.length} סעיפים הושלמו
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">יש לאסוף דרישות טכניות עבור השירותים שנבחרו</p>
                  <button
                    onClick={() => {
                      // Navigate to requirements gathering
                      const requirementsSection = document.getElementById('requirements-navigator');
                      if (requirementsSection) {
                        requirementsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    התחל באיסוף דרישות
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedSection === 'systems' && (
            <div className="space-y-4">
              {spec.systems.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">טרם נוספו מערכות למפרט</p>
                  <button
                    onClick={() => navigate('/phase2/systems')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    בחר מערכות לפירוט
                  </button>
                </div>
              ) : (
                spec.systems.map((system: DetailedSystemSpec) => (
                  <div
                    key={system.id}
                    onClick={() => navigate(`/phase2/systems/${system.systemId}/dive`)}
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
              {/* Auto-suggestion info */}
              {spec.integrations.length > 0 && spec.integrations.some((i: IntegrationFlow) => i.id) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">אינטגרציות הוצעו אוטומטית</h4>
                      <p className="text-sm text-blue-800">
                        {spec.integrations.length} אינטגרציות זוהו מצרכי האינטגרציה שהוגדרו ב-Phase 1.
                        תוכל לערוך ולהתאים אותן לצרכים המדויקים.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                spec.integrations.map((integration: IntegrationFlow) => (
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
              {/* Auto-expansion info */}
              {spec.aiAgents.length > 0 && spec.aiAgents.some((a: DetailedAIAgentSpec) => a.id) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Bot className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">סוכני AI הורחבו אוטומטית</h4>
                      <p className="text-sm text-purple-800">
                        {spec.aiAgents.length} סוכני AI נוצרו מה-use cases שהוגדרו ב-Phase 1.
                        מולאו אוטומטית: בסיס ידע, זרימת שיחה, אינטגרציות, ובחירת מודל AI.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                spec.aiAgents.map((agent: DetailedAIAgentSpec) => (
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
                    {spec.acceptanceCriteria.functional.map((req: FunctionalRequirement) => (
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
        {overallProgress >= 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">מוכן להעברה לפיתוח!</h3>
                <p className="text-gray-700">
                  המפרט הטכני הושלם ב-{overallProgress}%. כל הדרישות הטכניות מוכנות לשלב הפיתוח.
                </p>
              </div>
              <Button
                variant="success"
                onClick={handleCompleteSpec}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                המשך לפיתוח
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
