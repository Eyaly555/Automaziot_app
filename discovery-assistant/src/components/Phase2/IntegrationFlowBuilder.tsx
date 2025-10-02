import React, { useState } from 'react';
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
  GitBranch
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  IntegrationFlow,
  FlowTrigger,
  FlowStep,
  ErrorHandlingStrategy,
  TestCase
} from '../../types/phase2';

const generateId = () => Math.random().toString(36).substr(2, 9);

const TRIGGER_TYPES = [
  { value: 'webhook', label: 'Webhook', icon: Zap },
  { value: 'schedule', label: 'מתוזמן', icon: Clock },
  { value: 'manual', label: 'ידני', icon: Settings },
  { value: 'event', label: 'אירוע במערכת', icon: AlertCircle }
] as const;

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'זמן אמת' },
  { value: 'every_5_min', label: 'כל 5 דקות' },
  { value: 'hourly', label: 'שעתי' },
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'manual', label: 'ידני' }
] as const;

const STEP_TYPES = [
  { value: 'fetch', label: 'שליפת נתונים', icon: Database },
  { value: 'transform', label: 'עיבוד נתונים', icon: Settings },
  { value: 'conditional', label: 'תנאי', icon: GitBranch },
  { value: 'create', label: 'יצירה', icon: Plus },
  { value: 'update', label: 'עדכון', icon: CheckCircle }
] as const;

export const IntegrationFlowBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { flowId } = useParams();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const existingFlow = flowId
    ? currentMeeting?.implementationSpec?.integrations.find(f => f.id === flowId)
    : null;

  // Get available systems for source/target selection
  const availableSystems = currentMeeting?.implementationSpec?.systems.map(s => ({
    id: s.systemId,
    name: s.systemName
  })) || [];

  const [flow, setFlow] = useState<IntegrationFlow>(existingFlow || {
    id: generateId(),
    name: '',
    sourceSystem: '',
    targetSystem: '',
    trigger: {
      type: 'webhook',
      schedule: '',
      eventName: ''
    },
    steps: [],
    frequency: 'realtime',
    errorHandling: {
      retryCount: 3,
      retryDelay: 5,
      fallbackAction: 'log',
      notifyOnFailure: true,
      failureEmail: ''
    },
    testCases: []
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'steps' | 'errors' | 'tests'>('basic');

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
        ? currentMeeting.implementationSpec!.integrations.map(f =>
            f.id === flowId ? flow : f
          )
        : [...(currentMeeting.implementationSpec!.integrations || []), flow],
      lastUpdated: new Date(),
      updatedBy: 'user'
    };

    updateMeeting({
      implementationSpec: updatedSpec
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
      condition: ''
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
    const renumberedSteps = updatedSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1
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
      status: 'pending'
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
      testCases: flow.testCases.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {existingFlow ? 'עריכת אינטגרציה' : 'אינטגרציה חדשה'}
            </h1>
            <button
              onClick={() => navigate('/phase2')}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <CheckCircle className={`w-4 h-4 ${activeTab === 'basic' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={activeTab === 'basic' ? 'text-blue-600 font-medium' : ''}>פרטים בסיסיים</span>
            <ArrowRight className="w-4 h-4" />
            <CheckCircle className={`w-4 h-4 ${activeTab === 'steps' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={activeTab === 'steps' ? 'text-blue-600 font-medium' : ''}>צעדים</span>
            <ArrowRight className="w-4 h-4" />
            <CheckCircle className={`w-4 h-4 ${activeTab === 'errors' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={activeTab === 'errors' ? 'text-blue-600 font-medium' : ''}>טיפול בשגיאות</span>
            <ArrowRight className="w-4 h-4" />
            <CheckCircle className={`w-4 h-4 ${activeTab === 'tests' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={activeTab === 'tests' ? 'text-blue-600 font-medium' : ''}>בדיקות</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { key: 'basic', label: 'פרטים בסיסיים' },
              { key: 'steps', label: `צעדים (${flow.steps.length})` },
              { key: 'errors', label: 'טיפול בשגיאות' },
              { key: 'tests', label: `בדיקות (${flow.testCases.length})` }
            ].map(tab => (
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם האינטגרציה *
                  </label>
                  <input
                    type="text"
                    value={flow.name}
                    onChange={(e) => setFlow({ ...flow, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="לדוגמה: סנכרון לידים מ-Salesforce ל-Zoho CRM"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מערכת מקור *
                    </label>
                    <select
                      value={flow.sourceSystem}
                      onChange={(e) => setFlow({ ...flow, sourceSystem: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">בחר מערכת</option>
                      {availableSystems.map(sys => (
                        <option key={sys.id} value={sys.id}>{sys.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מערכת יעד *
                    </label>
                    <select
                      value={flow.targetSystem}
                      onChange={(e) => setFlow({ ...flow, targetSystem: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">בחר מערכת</option>
                      {availableSystems.map(sys => (
                        <option key={sys.id} value={sys.id}>{sys.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סוג טריגר *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TRIGGER_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setFlow({
                          ...flow,
                          trigger: { ...flow.trigger, type: value }
                        })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תזמון
                    </label>
                    <input
                      type="text"
                      value={flow.trigger.schedule || ''}
                      onChange={(e) => setFlow({
                        ...flow,
                        trigger: { ...flow.trigger, schedule: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="לדוגמה: 0 */5 * * * (כל 5 דקות)"
                    />
                  </div>
                )}

                {flow.trigger.type === 'event' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שם האירוע
                    </label>
                    <input
                      type="text"
                      value={flow.trigger.eventName || ''}
                      onChange={(e) => setFlow({
                        ...flow,
                        trigger: { ...flow.trigger, eventName: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="לדוגמה: lead.created"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תדירות ריצה
                  </label>
                  <select
                    value={flow.frequency}
                    onChange={(e) => setFlow({ ...flow, frequency: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {FREQUENCY_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Steps Tab */}
            {activeTab === 'steps' && (
              <div className="space-y-4">
                {flow.steps.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">עדיין לא הוספת צעדים לאינטגרציה</p>
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
                    {flow.steps.map((step, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {step.stepNumber}
                            </div>
                            <select
                              value={step.type}
                              onChange={(e) => updateStep(index, { type: e.target.value as any })}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              {STEP_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
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
                              onChange={(e) => updateStep(index, { description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="מה קורה בצעד זה?"
                            />
                          </div>

                          {(step.type === 'fetch' || step.type === 'create' || step.type === 'update') && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                API Endpoint
                              </label>
                              <input
                                type="text"
                                value={step.endpoint || ''}
                                onChange={(e) => updateStep(index, { endpoint: e.target.value })}
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
                                onChange={(e) => updateStep(index, { condition: e.target.value })}
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
                      onChange={(e) => setFlow({
                        ...flow,
                        errorHandling: {
                          ...flow.errorHandling,
                          retryCount: parseInt(e.target.value)
                        }
                      })}
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
                      onChange={(e) => setFlow({
                        ...flow,
                        errorHandling: {
                          ...flow.errorHandling,
                          retryDelay: parseInt(e.target.value)
                        }
                      })}
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
                    onChange={(e) => setFlow({
                      ...flow,
                      errorHandling: {
                        ...flow.errorHandling,
                        fallbackAction: e.target.value as any
                      }
                    })}
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
                      onChange={(e) => setFlow({
                        ...flow,
                        errorHandling: {
                          ...flow.errorHandling,
                          notifyOnFailure: e.target.checked
                        }
                      })}
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
                      onChange={(e) => setFlow({
                        ...flow,
                        errorHandling: {
                          ...flow.errorHandling,
                          failureEmail: e.target.value
                        }
                      })}
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
                    <p className="text-gray-600 mb-4">עדיין לא הוספת תרחישי בדיקה</p>
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
                    {flow.testCases.map((test, index) => (
                      <div key={test.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">תרחיש #{index + 1}</h4>
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
                              onChange={(e) => updateTestCase(index, { scenario: e.target.value })}
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
                              onChange={(e) => updateTestCase(index, { status: e.target.value as any })}
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
            <span>שמור אינטגרציה</span>
          </button>
        </div>
      </div>
    </div>
  );
};
