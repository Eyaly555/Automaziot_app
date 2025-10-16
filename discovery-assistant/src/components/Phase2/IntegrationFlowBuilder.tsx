import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  Database,
  GitBranch,
  Lightbulb,
  CheckSquare,
  Sparkles,
  Loader,
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  suggestIntegrationFlows,
  hasIntegrationFlowSuggestions,
} from '../../utils/integrationFlowSuggester';
import { getRequiredSystemsForServices } from '../../config/serviceToSystemMapping';
import {
  IntegrationFlow,
  FlowStep,
  TestCase,
  AcceptanceCriteria,
  FunctionalRequirement,
  PerformanceRequirement,
} from '../../types/phase2';
import { SelectedService, DetailedSystemInfo } from '../../types';
import { IntegrationFlowToolbar } from './IntegrationFlowToolbar';
import { Button, Input, Select } from '../Base';
import {
  generateAcceptanceCriteria,
  getIntegrationCriteria,
} from '../../utils/acceptanceCriteriaGenerator';

const generateId = () => Math.random().toString(36).substr(2, 9);

const TRIGGER_TYPES = [
  { value: 'webhook', label: 'Webhook', icon: Zap },
  { value: 'schedule', label: 'מתוזמן', icon: Clock },
  { value: 'manual', label: 'ידני', icon: Settings },
  { value: 'event', label: 'אירוע במערכת', icon: AlertCircle },
] as const;

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'זמן אמת' },
  { value: 'every_5_min', label: 'כל 5 דקות' },
  { value: 'hourly', label: 'שעתי' },
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'manual', label: 'ידני' },
] as const;

const STEP_TYPES = [
  { value: 'fetch', label: 'שליפת נתונים', icon: Database },
  { value: 'transform', label: 'עיבוד נתונים', icon: Settings },
  { value: 'conditional', label: 'תנאי', icon: GitBranch },
  { value: 'create', label: 'יצירה', icon: Plus },
  { value: 'update', label: 'עדכון', icon: CheckCircle },
] as const;

export const IntegrationFlowBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { flowId } = useParams();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const existingFlow = flowId
    ? currentMeeting?.implementationSpec?.integrations.find(
        (f) => f.id === flowId
      )
    : null;

  // Get available systems for source/target selection
  const availableSystems =
    currentMeeting?.implementationSpec?.systems.map((s) => ({
      id: s.systemId,
      name: s.systemName,
    })) || [];

  const [flow, setFlow] = useState<IntegrationFlow>(
    existingFlow || {
      id: generateId(),
      name: '',
      sourceSystem: '',
      targetSystem: '',
      trigger: {
        type: 'webhook',
        schedule: '',
        eventName: '',
      },
      steps: [],
      frequency: 'realtime',
      errorHandling: {
        retryCount: 3,
        retryDelay: 5,
        fallbackAction: 'log',
        notifyOnFailure: true,
        failureEmail: '',
      },
      testCases: [],
    }
  );

  const [activeTab, setActiveTab] = useState<
    'basic' | 'steps' | 'errors' | 'tests' | 'acceptance'
  >('basic');
  const [suggestedFromPhase1, setSuggestedFromPhase1] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [integrationCriteria, setIntegrationCriteria] =
    useState<AcceptanceCriteria | null>(null);

  // Undo/redo state
  const [history, setHistory] = useState<IntegrationFlow[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Auto-suggest integration flows from Phase 1 on component mount
  // FILTERED by purchased services only
  useEffect(() => {
    // Only if we're creating a new flow (not editing existing)
    if (flowId || !currentMeeting) return;

    // === DEFENSIVE: Get purchased services (fallback to selectedServices for backward compatibility) ===
    const purchasedServices =
      currentMeeting.modules?.proposal?.purchasedServices?.length > 0
        ? currentMeeting.modules.proposal.purchasedServices
        : currentMeeting.modules?.proposal?.selectedServices || [];

    // Early exit if no purchased services
    if (purchasedServices.length === 0) {
      console.warn(
        '[IntegrationFlowBuilder] No purchased services found - skipping auto-suggestion'
      );
      return;
    }

    // Extract service IDs
    const purchasedServiceIds = purchasedServices.map(
      (service: SelectedService) => service.id
    );
    console.log(
      '[IntegrationFlowBuilder] Purchased services:',
      purchasedServiceIds
    );

    // === FILTER: Get required system categories for purchased services ===
    const requiredSystemCategories =
      getRequiredSystemsForServices(purchasedServiceIds);
    console.log(
      '[IntegrationFlowBuilder] Required system categories:',
      requiredSystemCategories
    );

    // Early exit if no systems needed
    if (requiredSystemCategories.length === 0) {
      console.warn(
        '[IntegrationFlowBuilder] No systems required for purchased services - skipping auto-suggestion'
      );
      return;
    }

    // === FILTER: Only include Phase 1 systems that match required categories ===
    const allPhase1Systems =
      currentMeeting.modules?.systems?.detailedSystems || [];
    const relevantSystems = allPhase1Systems.filter(
      (system: DetailedSystemInfo) =>
        requiredSystemCategories.includes(system.category)
    );

    console.log(
      `[IntegrationFlowBuilder] Filtered systems: ${relevantSystems.length}/${allPhase1Systems.length} (only showing systems for purchased services)`
    );

    // Early exit if only 0-1 systems (need at least 2 systems for integrations)
    if (relevantSystems.length < 2) {
      console.warn(
        '[IntegrationFlowBuilder] Not enough systems for integrations (need 2+, have ' +
          relevantSystems.length +
          ') - skipping auto-suggestion'
      );
      return;
    }

    // Check if integrations are already populated in Phase 2
    const existingFlows = currentMeeting.implementationSpec?.integrations || [];

    // If no existing flows, auto-suggest based on FILTERED systems
    if (existingFlows.length === 0 && !suggestedFromPhase1) {
      // === CREATE FILTERED MEETING OBJECT ===
      // Only pass systems relevant to purchased services to the suggester
      const filteredMeeting = {
        ...currentMeeting,
        modules: {
          ...currentMeeting.modules,
          systems: {
            ...currentMeeting.modules.systems,
            detailedSystems: relevantSystems,
          },
        },
      };

      // Check if filtered meeting has integration needs
      const hasNeeds = hasIntegrationFlowSuggestions(filteredMeeting);

      if (!hasNeeds) {
        console.warn(
          '[IntegrationFlowBuilder] No integration needs found in filtered systems'
        );
        return;
      }

      // === SUGGEST INTEGRATIONS (filtered by purchased services) ===
      const suggestedFlows = suggestIntegrationFlows(filteredMeeting);

      console.log(
        `[IntegrationFlowBuilder] Generated ${suggestedFlows.length} integration suggestions from purchased services`
      );

      if (suggestedFlows.length > 0) {
        // Save suggested flows to meeting
        updateMeeting({
          implementationSpec: {
            ...currentMeeting.implementationSpec!,
            integrations: suggestedFlows,
            lastUpdated: new Date(),
            updatedBy: 'system',
          },
        });

        setSuggestedFromPhase1(true);

        // Navigate back to dashboard to show all suggested flows
        navigate('/phase2');
      }
    }
  }, [flowId, currentMeeting, suggestedFromPhase1, navigate, updateMeeting]);

  const saveToHistory = (newFlow: IntegrationFlow) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newFlow);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFlow(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFlow(history[historyIndex + 1]);
    }
  };

  const handleGenerateCriteria = async () => {
    if (!currentMeeting) return;

    setIsGeneratingCriteria(true);
    try {
      // Generate full acceptance criteria from the entire meeting
      const fullCriteria = generateAcceptanceCriteria(currentMeeting);

      // Filter to get only criteria for this integration
      const filtered = getIntegrationCriteria(fullCriteria, flow.name);
      setIntegrationCriteria(filtered);

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
    type: 'functional' | 'performance',
    id: string,
    updates: Partial<FunctionalRequirement> | Partial<PerformanceRequirement>
  ) => {
    if (
      !currentMeeting?.implementationSpec?.acceptanceCriteria ||
      !integrationCriteria
    )
      return;

    const fullCriteria = currentMeeting.implementationSpec.acceptanceCriteria;
    const updatedCriteria = {
      ...fullCriteria,
      [type]: fullCriteria[type].map(
        (item: FunctionalRequirement | PerformanceRequirement) =>
          item.id === id ? { ...item, ...updates } : item
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
    const filtered = getIntegrationCriteria(updatedCriteria, flow.name);
    setIntegrationCriteria(filtered);
  };

  // Load existing criteria for this integration
  useEffect(() => {
    if (currentMeeting?.implementationSpec?.acceptanceCriteria && flow.name) {
      const filtered = getIntegrationCriteria(
        currentMeeting.implementationSpec.acceptanceCriteria,
        flow.name
      );
      setIntegrationCriteria(filtered);
    }
  }, [currentMeeting, flow.name]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // Validation
    if (!flow.name || !flow.sourceSystem || !flow.targetSystem) {
      alert('יש למלא את כל שדות החובה');
      return;
    }

    if (flow.steps.length === 0) {
      alert('יש להוסיף לפחות צעד אחד לתהליך');
      return;
    }

    const updatedSpec = {
      ...currentMeeting.implementationSpec!,
      integrations: existingFlow
        ? currentMeeting.implementationSpec!.integrations.map(
            (f: IntegrationFlow) => (f.id === flowId ? flow : f)
          )
        : [...(currentMeeting.implementationSpec!.integrations || []), flow],
      lastUpdated: new Date(),
      updatedBy: 'user',
    };

    updateMeeting({
      implementationSpec: updatedSpec,
    });

    navigate('/phase2');
  };

  const addStep = () => {
    const newStep: FlowStep = {
      stepNumber: flow.steps.length + 1,
      type: 'fetch',
      description: '',
      endpoint: '',
      dataMapping: {},
      condition: '',
    };
    setFlow({ ...flow, steps: [...flow.steps, newStep] });
  };

  const updateStep = (index: number, updates: Partial<FlowStep>) => {
    const updatedSteps = [...flow.steps];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    setFlow({ ...flow, steps: updatedSteps });
  };

  const deleteStep = (index: number) => {
    const updatedSteps = flow.steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = updatedSteps.map((step: FlowStep, i: number) => ({
      ...step,
      stepNumber: i + 1,
    }));
    setFlow({ ...flow, steps: renumberedSteps });
  };

  const addTestCase = () => {
    const newTest: TestCase = {
      id: generateId(),
      scenario: '',
      input: {},
      expectedOutput: {},
      actualOutput: {},
      status: 'pending',
    };
    setFlow({ ...flow, testCases: [...flow.testCases, newTest] });
  };

  const updateTestCase = (index: number, updates: Partial<TestCase>) => {
    const updatedTests = [...flow.testCases];
    updatedTests[index] = { ...updatedTests[index], ...updates };
    setFlow({ ...flow, testCases: updatedTests });
  };

  const deleteTestCase = (index: number) => {
    setFlow({
      ...flow,
      testCases: flow.testCases.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {existingFlow ? 'עריכת אינטגרציה' : 'אינטגרציה חדשה'}
              </h1>
              {existingFlow?.id &&
                currentMeeting?.implementationSpec?.integrations?.find(
                  (f) => f.id === existingFlow.id
                )?.id &&
                suggestedFromPhase1 && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    <Lightbulb className="w-4 h-4" />
                    הוצע מ-Phase 1
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

          {/* Progress indicator */}
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <CheckCircle
              className={`w-4 h-4 ${activeTab === 'basic' ? 'text-blue-600' : 'text-gray-400'}`}
            />
            <span
              className={
                activeTab === 'basic' ? 'text-blue-600 font-medium' : ''
              }
            >
              פרטים בסיסיים
            </span>
            <ArrowRight className="w-4 h-4" />
            <CheckCircle
              className={`w-4 h-4 ${activeTab === 'steps' ? 'text-blue-600' : 'text-gray-400'}`}
            />
            <span
              className={
                activeTab === 'steps' ? 'text-blue-600 font-medium' : ''
              }
            >
              צעדים
            </span>
            <ArrowRight className="w-4 h-4" />
            <CheckCircle
              className={`w-4 h-4 ${activeTab === 'errors' ? 'text-blue-600' : 'text-gray-400'}`}
            />
            <span
              className={
                activeTab === 'errors' ? 'text-blue-600 font-medium' : ''
              }
            >
              טיפול בשגיאות
            </span>
            <ArrowRight className="w-4 h-4" />
            <CheckCircle
              className={`w-4 h-4 ${activeTab === 'tests' ? 'text-blue-600' : 'text-gray-400'}`}
            />
            <span
              className={
                activeTab === 'tests' ? 'text-blue-600 font-medium' : ''
              }
            >
              בדיקות
            </span>
          </div>
        </div>

        {/* Integration Flow Toolbar */}
        <IntegrationFlowToolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          stepCount={flow.steps.length}
          completionPercentage={Math.round(
            (((flow.name ? 1 : 0) +
              (flow.sourceSystem && flow.targetSystem ? 1 : 0) +
              (flow.steps.length > 0 ? 1 : 0) +
              (flow.testCases.length > 0 ? 1 : 0)) /
              4) *
              100
          )}
        />

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { key: 'basic', label: 'פרטים בסיסיים' },
              { key: 'steps', label: `צעדים (${flow.steps.length})` },
              { key: 'errors', label: 'טיפול בשגיאות' },
              { key: 'tests', label: `בדיקות (${flow.testCases.length})` },
              { key: 'acceptance', label: 'קריטריוני קבלה' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <Input
                  label="שם האינטגרציה *"
                  value={flow.name}
                  onChange={(e) => {
                    const newFlow = { ...flow, name: e.target.value };
                    setFlow(newFlow);
                    saveToHistory(newFlow);
                  }}
                  placeholder="לדוגמה: סנכרון לידים מ-Salesforce ל-Zoho CRM"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="מערכת מקור *"
                    value={flow.sourceSystem}
                    onChange={(e) => {
                      const newFlow = { ...flow, sourceSystem: e.target.value };
                      setFlow(newFlow);
                      saveToHistory(newFlow);
                    }}
                    required
                  >
                    <option value="">בחר מערכת</option>
                    {availableSystems.map(
                      (sys: { id: string; name: string }) => (
                        <option key={sys.id} value={sys.id}>
                          {sys.name}
                        </option>
                      )
                    )}
                  </Select>

                  <Select
                    label="מערכת יעד *"
                    value={flow.targetSystem}
                    onChange={(e) => {
                      const newFlow = { ...flow, targetSystem: e.target.value };
                      setFlow(newFlow);
                      saveToHistory(newFlow);
                    }}
                    required
                  >
                    <option value="">בחר מערכת</option>
                    {availableSystems.map(
                      (sys: { id: string; name: string }) => (
                        <option key={sys.id} value={sys.id}>
                          {sys.name}
                        </option>
                      )
                    )}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סוג טריגר *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TRIGGER_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() =>
                          setFlow({
                            ...flow,
                            trigger: { ...flow.trigger, type: value },
                          })
                        }
                        className={`flex items-center space-x-3 space-x-reverse p-4 rounded-lg border-2 transition-all ${
                          flow.trigger.type === value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {flow.trigger.type === 'schedule' && (
                  <Input
                    label="תזמון"
                    value={flow.trigger.schedule || ''}
                    onChange={(e) => {
                      const newFlow = {
                        ...flow,
                        trigger: { ...flow.trigger, schedule: e.target.value },
                      };
                      setFlow(newFlow);
                      saveToHistory(newFlow);
                    }}
                    placeholder="לדוגמה: 0 */5 * * * (כל 5 דקות)"
                  />
                )}

                {flow.trigger.type === 'event' && (
                  <Input
                    label="שם האירוע"
                    value={flow.trigger.eventName || ''}
                    onChange={(e) => {
                      const newFlow = {
                        ...flow,
                        trigger: { ...flow.trigger, eventName: e.target.value },
                      };
                      setFlow(newFlow);
                      saveToHistory(newFlow);
                    }}
                    placeholder="לדוגמה: lead.created"
                  />
                )}

                <Select
                  label="תדירות ריצה"
                  value={flow.frequency}
                  onChange={(e) => {
                    const newFlow = {
                      ...flow,
                      frequency: e.target.value as IntegrationFlow['frequency'],
                    };
                    setFlow(newFlow);
                    saveToHistory(newFlow);
                  }}
                >
                  {FREQUENCY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Steps Tab */}
            {activeTab === 'steps' && (
              <div className="space-y-4">
                {flow.steps.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      עדיין לא הוספת צעדים לאינטגרציה
                    </p>
                    <button
                      onClick={addStep}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף צעד ראשון
                    </button>
                  </div>
                ) : (
                  <>
                    {flow.steps.map((step: FlowStep, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {step.stepNumber}
                            </div>
                            <select
                              value={step.type}
                              onChange={(e) =>
                                updateStep(index, {
                                  type: e.target.value as FlowStep['type'],
                                })
                              }
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              {STEP_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => deleteStep(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              תיאור הצעד
                            </label>
                            <input
                              type="text"
                              value={step.description}
                              onChange={(e) =>
                                updateStep(index, {
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="מה קורה בצעד זה?"
                            />
                          </div>

                          {(step.type === 'fetch' ||
                            step.type === 'create' ||
                            step.type === 'update') && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                API Endpoint
                              </label>
                              <input
                                type="text"
                                value={step.endpoint || ''}
                                onChange={(e) =>
                                  updateStep(index, {
                                    endpoint: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                placeholder="/api/v1/..."
                              />
                            </div>
                          )}

                          {step.type === 'conditional' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                תנאי
                              </label>
                              <input
                                type="text"
                                value={step.condition || ''}
                                onChange={(e) =>
                                  updateStep(index, {
                                    condition: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                placeholder="לדוגמה: status === 'active'"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addStep}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף צעד נוסף
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Error Handling Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר ניסיונות חוזרים
                    </label>
                    <input
                      type="number"
                      value={flow.errorHandling.retryCount}
                      onChange={(e) =>
                        setFlow({
                          ...flow,
                          errorHandling: {
                            ...flow.errorHandling,
                            retryCount: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      השהיה בין ניסיונות (שניות)
                    </label>
                    <input
                      type="number"
                      value={flow.errorHandling.retryDelay}
                      onChange={(e) =>
                        setFlow({
                          ...flow,
                          errorHandling: {
                            ...flow.errorHandling,
                            retryDelay: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    פעולת חלופה בכשלון
                  </label>
                  <select
                    value={flow.errorHandling.fallbackAction}
                    onChange={(e) =>
                      setFlow({
                        ...flow,
                        errorHandling: {
                          ...flow.errorHandling,
                          fallbackAction: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="log">רישום ללוג בלבד</option>
                    <option value="queue">שמירה לתור לניסיון מאוחר יותר</option>
                    <option value="alert">שליחת התראה למפתח</option>
                    <option value="skip">דילוג על הרשומה</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={flow.errorHandling.notifyOnFailure}
                      onChange={(e) =>
                        setFlow({
                          ...flow,
                          errorHandling: {
                            ...flow.errorHandling,
                            notifyOnFailure: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      שלח התראה במייל בכשלון
                    </span>
                  </label>
                </div>

                {flow.errorHandling.notifyOnFailure && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      כתובת מייל להתראות
                    </label>
                    <input
                      type="email"
                      value={flow.errorHandling.failureEmail || ''}
                      onChange={(e) =>
                        setFlow({
                          ...flow,
                          errorHandling: {
                            ...flow.errorHandling,
                            failureEmail: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="developer@example.com"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Test Cases Tab */}
            {activeTab === 'tests' && (
              <div className="space-y-4">
                {flow.testCases.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      עדיין לא הוספת תרחישי בדיקה
                    </p>
                    <button
                      onClick={addTestCase}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף תרחיש בדיקה
                    </button>
                  </div>
                ) : (
                  <>
                    {flow.testCases.map((test: TestCase, index: number) => (
                      <div
                        key={test.id}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            תרחיש #{index + 1}
                          </h4>
                          <button
                            onClick={() => deleteTestCase(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              תיאור התרחיש
                            </label>
                            <input
                              type="text"
                              value={test.scenario}
                              onChange={(e) =>
                                updateTestCase(index, {
                                  scenario: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="מה בודקים בתרחיש זה?"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              סטטוס
                            </label>
                            <select
                              value={test.status}
                              onChange={(e) =>
                                updateTestCase(index, {
                                  status: e.target.value as TestCase['status'],
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="pending">ממתין</option>
                              <option value="passed">עבר</option>
                              <option value="failed">נכשל</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addTestCase}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף תרחיש נוסף
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Acceptance Criteria Tab */}
            {activeTab === 'acceptance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      קריטריוני קבלה לאינטגרציה
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      דרישות פונקציונליות וביצועים לאינטגרציה זו
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

                {!integrationCriteria ||
                (integrationCriteria.functional.length === 0 &&
                  integrationCriteria.performance.length === 0) ? (
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
                    {integrationCriteria.functional.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          דרישות פונקציונליות (
                          {integrationCriteria.functional.length})
                        </h4>
                        <div className="space-y-2">
                          {integrationCriteria.functional.map(
                            (req: FunctionalRequirement) => (
                              <div
                                key={req.id}
                                className="bg-white border border-gray-200 rounded-lg p-3"
                              >
                                <div className="flex items-start justify-between">
                                  <input
                                    type="text"
                                    value={req.description}
                                    onChange={(e) =>
                                      updateCriterion('functional', req.id, {
                                        description: e.target.value,
                                      })
                                    }
                                    className="flex-1 font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                                  />
                                </div>
                                <p className="text-sm text-gray-600 mt-1 px-2">
                                  {req.acceptanceCriteria}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {integrationCriteria.performance.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          דרישות ביצועים (
                          {integrationCriteria.performance.length})
                        </h4>
                        <div className="space-y-2">
                          {integrationCriteria.performance.map(
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
            שמור אינטגרציה
          </Button>
        </div>
      </div>
    </div>
  );
};
