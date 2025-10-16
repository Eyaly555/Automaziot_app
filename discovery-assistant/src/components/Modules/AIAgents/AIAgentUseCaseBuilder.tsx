import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Save } from 'lucide-react';
import { Card } from '../../Common/Card';
import { TextField } from '../../Common/FormFields/TextField';
import { SelectField } from '../../Common/FormFields/SelectField';
import { CheckboxGroup } from '../../Common/FormFields/CheckboxGroup';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { AIAgentUseCase, ConversationFlowStep } from '../../../types';

interface AIAgentUseCaseBuilderProps {
  onSave?: (useCase: AIAgentUseCase) => void;
  initialData?: AIAgentUseCase;
  onCancel?: () => void;
}

export const AIAgentUseCaseBuilder: React.FC<AIAgentUseCaseBuilderProps> = ({
  onSave,
  initialData,
  onCancel,
}) => {
  const { updateModule, currentMeeting } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.aiAgents || {};

  // Auto-save hook for this component
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'aiAgents',
    immediateFields: ['useCaseName'], // Critical identifier
    debounceMs: 1500, // Slightly longer debounce for complex forms
    onError: (error) => {
      console.error('Auto-save error in AIAgentUseCaseBuilder:', error);
    },
  });

  // State for use case builder
  const [useCaseName, setUseCaseName] = useState(initialData?.name || '');
  const [trigger, setTrigger] = useState<string>(initialData?.trigger || '');
  const [customTrigger, setCustomTrigger] = useState(
    initialData?.customTrigger || ''
  );
  const [objective, setObjective] = useState(initialData?.objective || '');
  const [conversationFlow, setConversationFlow] = useState<
    ConversationFlowStep[]
  >(initialData?.conversationFlow || []);
  const [knowledgeBaseRequirements, setKnowledgeBaseRequirements] = useState<
    string[]
  >(initialData?.knowledgeBaseRequirements || []);
  const [fallbackStrategy, setFallbackStrategy] = useState<string>(
    initialData?.fallbackStrategy || ''
  );
  const [successCriteria, setSuccessCriteria] = useState<string[]>(
    initialData?.successCriteria || []
  );
  const [expectedVolume, setExpectedVolume] = useState<string>(
    initialData?.expectedVolume?.toString() || ''
  );
  const [priority, setPriority] = useState<string>(initialData?.priority || '');
  const [department, setDepartment] = useState<string>(
    initialData?.department || ''
  );

  // State for adding new items
  const [newFlowStep, setNewFlowStep] = useState('');
  const [newSuccessCriterion, setNewSuccessCriterion] = useState('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Conversation flow management
  const addFlowStep = () => {
    if (newFlowStep.trim()) {
      const newStep: ConversationFlowStep = {
        id: generateId(),
        order: conversationFlow.length + 1,
        action: newFlowStep.trim(),
        expectedResponse: '',
        nextStepCondition: '',
      };
      setConversationFlow([...conversationFlow, newStep]);
      setNewFlowStep('');
    }
  };

  const removeFlowStep = (id: string) => {
    const updatedFlow = conversationFlow
      .filter((step) => step.id !== id)
      .map((step, index) => ({ ...step, order: index + 1 }));
    setConversationFlow(updatedFlow);
  };

  const moveFlowStep = (id: string, direction: 'up' | 'down') => {
    const index = conversationFlow.findIndex((step) => step.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === conversationFlow.length - 1)
    ) {
      return;
    }

    const newFlow = [...conversationFlow];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFlow[index], newFlow[newIndex]] = [newFlow[newIndex], newFlow[index]];

    // Update order numbers
    const reorderedFlow = newFlow.map((step, idx) => ({
      ...step,
      order: idx + 1,
    }));
    setConversationFlow(reorderedFlow);
  };

  // Success criteria management
  const addSuccessCriterion = () => {
    if (newSuccessCriterion.trim()) {
      setSuccessCriteria([...successCriteria, newSuccessCriterion.trim()]);
      setNewSuccessCriterion('');
    }
  };

  const removeSuccessCriterion = (index: number) => {
    setSuccessCriteria(successCriteria.filter((_, i) => i !== index));
  };

  // Save handler (now uses auto-save)
  const handleSave = async () => {
    const useCase: AIAgentUseCase = {
      id: initialData?.id || generateId(),
      name: useCaseName,
      trigger: trigger as AIAgentUseCase['trigger'],
      customTrigger: trigger === 'custom' ? customTrigger : undefined,
      objective,
      conversationFlow,
      knowledgeBaseRequirements,
      fallbackStrategy: fallbackStrategy as AIAgentUseCase['fallbackStrategy'],
      successCriteria,
      expectedVolume: parseInt(expectedVolume) || 0,
      priority: priority as AIAgentUseCase['priority'],
      department: department as AIAgentUseCase['department'],
    };

    // Save to store using auto-save
    const existingSpecs = moduleData.agentSpecs || [];
    const updatedSpecs = initialData
      ? existingSpecs.map((spec) =>
          spec.id === initialData.id ? useCase : spec
        )
      : [...existingSpecs, useCase];

    await saveData(
      {
        ...moduleData,
        agentSpecs: updatedSpecs,
      },
      'manual'
    );

    if (onSave) {
      onSave(useCase);
    }
  };

  // Auto-save when state changes
  useEffect(() => {
    if (useCaseName) {
      // Only auto-save if we have a name
      const useCase: AIAgentUseCase = {
        id: initialData?.id || generateId(),
        name: useCaseName,
        trigger: trigger as AIAgentUseCase['trigger'],
        customTrigger: trigger === 'custom' ? customTrigger : undefined,
        objective,
        conversationFlow,
        knowledgeBaseRequirements,
        fallbackStrategy:
          fallbackStrategy as AIAgentUseCase['fallbackStrategy'],
        successCriteria,
        expectedVolume: parseInt(expectedVolume) || 0,
        priority: priority as AIAgentUseCase['priority'],
        department: department as AIAgentUseCase['department'],
      };

      const existingSpecs = moduleData.agentSpecs || [];
      const updatedSpecs = initialData
        ? existingSpecs.map((spec) =>
            spec.id === initialData.id ? useCase : spec
          )
        : [...existingSpecs, useCase];

      saveData({
        ...moduleData,
        agentSpecs: updatedSpecs,
      });
    }
  }, [
    useCaseName,
    trigger,
    customTrigger,
    objective,
    conversationFlow,
    knowledgeBaseRequirements,
    fallbackStrategy,
    successCriteria,
    expectedVolume,
    priority,
    department,
    initialData,
    moduleData,
    saveData,
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="בניית מפרט AI Agent" variant="glass">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                1
              </span>
              מידע בסיסי
            </h3>

            <TextField
              label="שם מקרה השימוש"
              value={useCaseName}
              onChange={setUseCaseName}
              placeholder="לדוגמה: סוכן AI למענה ראשוני ללידים חדשים"
              required
            />

            <SelectField
              label="טריגר להפעלה"
              value={trigger}
              onChange={setTrigger}
              required
              options={[
                { value: '', label: 'בחר...' },
                { value: 'new_lead', label: 'ליד חדש נכנס' },
                { value: 'customer_question', label: 'שאלת לקוח' },
                { value: 'after_hours', label: 'פניה מחוץ לשעות העבודה' },
                { value: 'appointment_booking', label: 'בקשה לקביעת פגישה' },
                { value: 'follow_up', label: 'מעקב אחרי לקוח קיים' },
                { value: 'custom', label: 'אחר (פרט)' },
              ]}
            />

            {trigger === 'custom' && (
              <TextField
                label="פרט את הטריגר"
                value={customTrigger}
                onChange={setCustomTrigger}
                placeholder="תאר במה יופעל ה-AI Agent"
                required
              />
            )}

            <SelectField
              label="מחלקה"
              value={department}
              onChange={setDepartment}
              required
              options={[
                { value: '', label: 'בחר...' },
                { value: 'sales', label: 'מכירות' },
                { value: 'service', label: 'שירות לקוחות' },
                { value: 'operations', label: 'תפעול' },
              ]}
            />

            <TextField
              label="מטרת השיחה"
              value={objective}
              onChange={setObjective}
              placeholder="תאר מה ה-AI צריך להשיג בשיחה הזו"
              multiline
              rows={3}
              required
            />
          </div>

          {/* Conversation Flow */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                2
              </span>
              תהליך השיחה
            </h3>

            {conversationFlow.length > 0 && (
              <div className="space-y-2">
                {conversationFlow.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-semibold text-gray-600 min-w-[30px]">
                      {step.order}.
                    </span>
                    <span className="flex-1 text-gray-800">{step.action}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveFlowStep(step.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                          index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title="הזז למעלה"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveFlowStep(step.id, 'down')}
                        disabled={index === conversationFlow.length - 1}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                          index === conversationFlow.length - 1
                            ? 'opacity-30 cursor-not-allowed'
                            : ''
                        }`}
                        title="הזז למטה"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFlowStep(step.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                        title="מחק"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <TextField
                value={newFlowStep}
                onChange={setNewFlowStep}
                placeholder="לדוגמה: בירור שם ופרטי יצירת קשר"
                className="flex-1"
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    addFlowStep();
                  }
                }}
              />
              <button
                onClick={addFlowStep}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הוסף שלב
              </button>
            </div>
          </div>

          {/* Knowledge Base Requirements */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                3
              </span>
              דרישות מאגר ידע
            </h3>

            <CheckboxGroup
              options={[
                { value: 'product_catalog', label: 'קטלוג מוצרים/שירותים' },
                { value: 'pricing', label: 'מחירים ותנאים' },
                { value: 'faq', label: 'שאלות נפוצות' },
                { value: 'company_info', label: 'מידע על החברה' },
                { value: 'policies', label: 'מדיניות ותקנון' },
                { value: 'customer_history', label: 'היסטוריית לקוחות' },
                { value: 'troubleshooting', label: 'מדריכי פתרון בעיות' },
                { value: 'appointments', label: 'זמינות ותורים' },
              ]}
              values={knowledgeBaseRequirements}
              onChange={setKnowledgeBaseRequirements}
              columns={2}
            />
          </div>

          {/* Fallback Strategy */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                4
              </span>
              אסטרטגיית גיבוי
            </h3>

            <SelectField
              label="מה יקרה כשה-AI לא יכול לעזור?"
              value={fallbackStrategy}
              onChange={setFallbackStrategy}
              required
              options={[
                { value: '', label: 'בחר...' },
                { value: 'human_handoff', label: 'העברה מיידית לנציג אנושי' },
                {
                  value: 'email_notification',
                  label: 'שליחת התראה במייל לצוות',
                },
                { value: 'scheduled_callback', label: 'קביעת חזרה ללקוח' },
                { value: 'faq_redirect', label: 'הפניה למאגר שאלות נפוצות' },
              ]}
            />
          </div>

          {/* Success Criteria */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                5
              </span>
              קריטריונים להצלחה
            </h3>

            {successCriteria.length > 0 && (
              <ul className="space-y-2">
                {successCriteria.map((criterion, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                  >
                    <span className="flex-1 text-gray-800">{criterion}</span>
                    <button
                      onClick={() => removeSuccessCriterion(index)}
                      className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                      title="מחק"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <TextField
                value={newSuccessCriterion}
                onChange={setNewSuccessCriterion}
                placeholder="לדוגמה: קבלת פרטי יצירת קשר מלאים מ-80% מהלידים"
                className="flex-1"
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    addSuccessCriterion();
                  }
                }}
              />
              <button
                onClick={addSuccessCriterion}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הוסף
              </button>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                6
              </span>
              פרטים נוספים
            </h3>

            <TextField
              label="נפח צפוי (פניות לחודש)"
              value={expectedVolume}
              onChange={setExpectedVolume}
              type="text"
              placeholder="לדוגמה: 500"
              dir="ltr"
            />

            <SelectField
              label="עדיפות"
              value={priority}
              onChange={setPriority}
              options={[
                { value: '', label: 'בחר...' },
                { value: 'high', label: 'גבוהה - דחוף ליישם' },
                { value: 'medium', label: 'בינונית - חשוב אך לא דחוף' },
                { value: 'low', label: 'נמוכה - nice to have' },
              ]}
            />
          </div>

          {/* Auto-Save Status and Manual Save */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t border-gray-200">
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
              {!isSaving && !saveError && useCaseName && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                שמור ידנית
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ביטול
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
