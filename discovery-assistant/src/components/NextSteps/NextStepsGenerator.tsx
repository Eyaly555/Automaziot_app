import { useMeetingStore } from '../../store/useMeetingStore';
import { useNavigate } from 'react-router-dom';
import { getRequirementsTemplate } from '../../config/serviceRequirementsTemplates';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';

interface NextStep {
  id: string;
  title: { he: string; en: string };
  description: { he: string; en: string };
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  action: {
    type: 'navigate' | 'modal' | 'function';
    target: string;
    label: { he: string; en: string };
  };
  completed: boolean;
}

export function NextStepsGenerator() {
  const { currentMeeting, getModuleProgress, getOverallProgress, canTransitionTo } = useMeetingStore();
  const navigate = useNavigate();

  if (!currentMeeting) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-500">לא נמצא פגישה פעילה</p>
        <p className="text-sm text-gray-400 mt-2">צור פגישה חדשה כדי להתחיל</p>
      </div>
    );
  }

  const nextSteps = generateNextSteps(currentMeeting, getModuleProgress, getOverallProgress, canTransitionTo);
  const urgentSteps = nextSteps.filter(s => s.priority === 'urgent' && !s.completed);
  const currentStep = nextSteps.find(s => !s.completed);

  const handleAction = (step: NextStep) => {
    if (step.action.type === 'navigate') {
      navigate(step.action.target);
    } else if (step.action.type === 'function') {
      // Execute function action
      console.log('[NextSteps] Executing function:', step.action.target);
      // Add function execution logic here
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'high':
        return <AlertCircle className="text-orange-500" size={20} />;
      case 'medium':
        return <Clock className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-0.5 rounded-full text-xs font-semibold";
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-700`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-700`;
      case 'medium':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'דחוף';
      case 'high': return 'גבוה';
      case 'medium': return 'בינוני';
      default: return 'נמוך';
    }
  };

  const completedCount = nextSteps.filter(s => s.completed).length;
  const totalCount = nextSteps.length;

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Sparkles className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">הצעדים הבאים</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {completedCount} מתוך {totalCount} הושלמו
              </p>
            </div>
          </div>
          {urgentSteps.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm font-semibold text-red-700">
                {urgentSteps.length} דחופים
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Current Step Highlight */}
        {currentStep && (
          <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-r-4 border-blue-500 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                {getPriorityIcon(currentStep.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-blue-900">
                    {currentStep.title.he}
                  </h3>
                  <span className={getPriorityBadge(currentStep.priority)}>
                    {getPriorityLabel(currentStep.priority)}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {currentStep.description.he}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{currentStep.estimatedTime}</span>
                  </div>
                  <button
                    onClick={() => handleAction(currentStep)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                  >
                    <span>{currentStep.action.label.he}</span>
                    <ArrowRight size={16} className="mr-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Steps List */}
        <div className="space-y-2">
          {nextSteps.map((step, index) => {
            const isCurrent = step === currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                  step.completed
                    ? 'bg-green-50 border-green-200 opacity-60'
                    : isCurrent
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="text-green-600" size={24} />
                  ) : isCurrent ? (
                    <div className="relative">
                      <Circle className="text-blue-500 fill-blue-500" size={24} />
                      <div className="absolute inset-0 animate-ping">
                        <Circle className="text-blue-400 opacity-75" size={24} />
                      </div>
                    </div>
                  ) : (
                    <Circle className="text-gray-400" size={24} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-medium ${
                        step.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {index + 1}. {step.title.he}
                    </span>
                    {!step.completed && !isCurrent && (
                      <span className={getPriorityBadge(step.priority)}>
                        {getPriorityLabel(step.priority)}
                      </span>
                    )}
                  </div>
                  {!step.completed && !isCurrent && (
                    <p className="text-sm text-gray-600">
                      {step.description.he}
                    </p>
                  )}
                  {step.estimatedTime && !step.completed && !isCurrent && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock size={12} />
                      <span>{step.estimatedTime}</span>
                    </div>
                  )}
                </div>

                {!step.completed && !isCurrent && (
                  <button
                    onClick={() => handleAction(step)}
                    className="flex-shrink-0 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm"
                  >
                    {step.action.label.he}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* All Tasks Complete */}
        {nextSteps.every(s => s.completed) && (
          <div className="text-center py-8">
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="font-bold text-xl text-gray-900 mb-2">מעולה! כל המשימות הושלמו</h3>
            <p className="text-gray-600 mb-4">אין צעדים נוספים כרגע</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/summary')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FileText size={16} className="inline ml-2" />
                הצג סיכום
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Generates smart next steps based on meeting state analysis
 */
function generateNextSteps(
  meeting: any,
  getModuleProgress: () => any[],
  getOverallProgress: () => number,
  canTransitionTo: (phase: string) => boolean
): NextStep[] {
  const steps: NextStep[] = [];
  const moduleProgress = getModuleProgress();
  const overallProgress = getOverallProgress();
  const currentPhase = meeting.phase || 'discovery';
  const currentStatus = meeting.status || 'discovery_in_progress';

  // ========================================================================
  // PHASE: DISCOVERY
  // ========================================================================
  if (currentPhase === 'discovery') {
    // Check module completion
    const incompleteModules = moduleProgress.filter(m => m.completed < m.total && m.total > 0);

    if (incompleteModules.length > 0) {
      const firstIncomplete = incompleteModules[0];
      steps.push({
        id: 'complete-modules',
        title: { he: `השלם מודול: ${firstIncomplete.hebrewName}`, en: `Complete Module: ${firstIncomplete.name}` },
        description: {
          he: `יש להשלים ${incompleteModules.length} מודולים. התחל עם ${firstIncomplete.hebrewName} (${firstIncomplete.completed}/${firstIncomplete.total})`,
          en: `Complete ${incompleteModules.length} modules. Start with ${firstIncomplete.name} (${firstIncomplete.completed}/${firstIncomplete.total})`
        },
        priority: overallProgress < 30 ? 'urgent' : 'high',
        estimatedTime: '20-30 דקות',
        action: {
          type: 'navigate',
          target: `/module/${firstIncomplete.moduleId}`,
          label: { he: 'פתח מודול', en: 'Open Module' }
        },
        completed: false
      });
    }

    // Check if wizard mode recommended (low progress)
    if (overallProgress < 20 && incompleteModules.length > 3) {
      steps.push({
        id: 'use-wizard',
        title: { he: 'השתמש באשף המודרך', en: 'Use Guided Wizard' },
        description: {
          he: 'האשף המודרך יעזור לך לעבור על כל המודולים בצורה מסודרת ומהירה',
          en: 'The guided wizard will help you go through all modules systematically'
        },
        priority: 'high',
        estimatedTime: '45-60 דקות',
        action: {
          type: 'navigate',
          target: '/wizard',
          label: { he: 'התחל אשף', en: 'Start Wizard' }
        },
        completed: false
      });
    }

    // Check if proposal generated
    const hasProposal = meeting.modules?.proposal?.proposedServices;
    if (overallProgress >= 50 && !hasProposal) {
      steps.push({
        id: 'generate-proposal',
        title: { he: 'צור הצעת שירותים', en: 'Generate Service Proposal' },
        description: {
          he: 'השתמש במנוע ההצעות האוטומטי כדי לייצר המלצות מותאמות אישית על בסיס הנתונים שנאספו',
          en: 'Use the proposal engine to generate personalized recommendations based on collected data'
        },
        priority: 'urgent',
        estimatedTime: '5 דקות',
        action: {
          type: 'navigate',
          target: '/module/proposal',
          label: { he: 'עבור להצעה', en: 'Go to Proposal' }
        },
        completed: false
      });
    }

    // Check if services selected
    const selectedServices = meeting.modules?.proposal?.selectedServices?.length || 0;
    if (hasProposal && selectedServices === 0) {
      steps.push({
        id: 'select-services',
        title: { he: 'בחר שירותים לפרויקט', en: 'Select Services for Project' },
        description: {
          he: 'בחר את השירותים שברצונך לכלול בהצעה הסופית ללקוח',
          en: 'Select services to include in the final client proposal'
        },
        priority: 'urgent',
        estimatedTime: '10 דקות',
        action: {
          type: 'navigate',
          target: '/module/proposal',
          label: { he: 'בחר שירותים', en: 'Select Services' }
        },
        completed: false
      });
    }

    // Check if requirements needed
    const servicesNeedingRequirements = getServicesNeedingRequirements(meeting);
    const collectedRequirements = meeting.modules?.requirements?.length || 0;
    if (selectedServices > 0 && collectedRequirements < servicesNeedingRequirements.length) {
      steps.push({
        id: 'collect-requirements',
        title: { he: 'אסוף דרישות טכניות', en: 'Collect Technical Requirements' },
        description: {
          he: `נדרשים מפרטים טכניים עבור ${servicesNeedingRequirements.length - collectedRequirements} שירותים`,
          en: `Technical specs needed for ${servicesNeedingRequirements.length - collectedRequirements} services`
        },
        priority: 'high',
        estimatedTime: '15-20 דקות',
        action: {
          type: 'navigate',
          target: '/requirements',
          label: { he: 'התחל איסוף', en: 'Start Collection' }
        },
        completed: false
      });
    }

    // Check ROI calculation
    const hasROI = meeting.modules?.roi?.calculations?.length > 0 || meeting.totalROI > 0;
    if (overallProgress >= 70 && !hasROI) {
      steps.push({
        id: 'calculate-roi',
        title: { he: 'חשב ROI ופוטנציאל חיסכון', en: 'Calculate ROI and Savings Potential' },
        description: {
          he: 'כמת את הפוטנציאל לחיסכון וזמן תשואה על ההשקעה',
          en: 'Quantify savings potential and return on investment'
        },
        priority: 'medium',
        estimatedTime: '10 דקות',
        action: {
          type: 'navigate',
          target: '/module/roi',
          label: { he: 'חשב ROI', en: 'Calculate ROI' }
        },
        completed: false
      });
    }

    // Check if ready for client approval
    if (
      selectedServices > 0 &&
      (!servicesNeedingRequirements.length || collectedRequirements >= servicesNeedingRequirements.length) &&
      currentStatus !== 'awaiting_client_decision' &&
      currentStatus !== 'client_approved'
    ) {
      steps.push({
        id: 'request-approval',
        title: { he: 'בקש אישור לקוח', en: 'Request Client Approval' },
        description: {
          he: 'שלח את ההצעה לאישור הלקוח ועבור לשלב מפרט היישום',
          en: 'Send proposal for client approval and move to implementation spec phase'
        },
        priority: 'urgent',
        estimatedTime: '5 דקות',
        action: {
          type: 'navigate',
          target: '/approval',
          label: { he: 'עבור לאישור', en: 'Go to Approval' }
        },
        completed: false
      });
    }
  }

  // ========================================================================
  // STATUS: AWAITING APPROVAL
  // ========================================================================
  if (currentStatus === 'awaiting_client_decision') {
    steps.push({
      id: 'await-approval',
      title: { he: 'ממתין לאישור לקוח', en: 'Awaiting Client Approval' },
      description: {
        he: 'ההצעה נשלחה ללקוח. ממתין להחלטה והמשך התהליך.',
        en: 'Proposal sent to client. Awaiting decision to proceed.'
      },
      priority: 'medium',
      estimatedTime: '1-3 ימי עסקים',
      action: {
        type: 'navigate',
        target: '/approval',
        label: { he: 'הצג אישור', en: 'View Approval' }
      },
      completed: false
    });
  }

  // ========================================================================
  // PHASE: IMPLEMENTATION SPEC
  // ========================================================================
  if (currentPhase === 'implementation_spec') {
    const specCompletion = meeting.implementationSpec?.completionPercentage || 0;

    if (specCompletion < 100) {
      const missingSpecs = [];
      if (!meeting.implementationSpec?.systems?.length) missingSpecs.push('Systems Deep Dive');
      if (!meeting.implementationSpec?.integrations?.length) missingSpecs.push('Integration Flows');
      if (!meeting.implementationSpec?.aiAgents?.length) missingSpecs.push('AI Agents');
      if (!meeting.implementationSpec?.acceptanceCriteria) missingSpecs.push('Acceptance Criteria');

      steps.push({
        id: 'complete-spec',
        title: { he: 'השלם מפרט יישום', en: 'Complete Implementation Spec' },
        description: {
          he: `${100 - specCompletion}% נותר להשלמה. חסרים: ${missingSpecs.join(', ')}`,
          en: `${100 - specCompletion}% remaining. Missing: ${missingSpecs.join(', ')}`
        },
        priority: 'high',
        estimatedTime: '2-4 שעות',
        action: {
          type: 'navigate',
          target: '/phase2',
          label: { he: 'המשך מפרט', en: 'Continue Spec' }
        },
        completed: false
      });
    }

    if (specCompletion >= 90 && canTransitionTo('development')) {
      steps.push({
        id: 'transition-to-dev',
        title: { he: 'עבור לשלב פיתוח', en: 'Transition to Development Phase' },
        description: {
          he: 'המפרט מוכן! צור משימות פיתוח וכרטיסי עבודה למפתחים',
          en: 'Spec is ready! Generate development tasks and work tickets'
        },
        priority: 'urgent',
        estimatedTime: '10 דקות',
        action: {
          type: 'navigate',
          target: '/phase2',
          label: { he: 'צור משימות', en: 'Generate Tasks' }
        },
        completed: false
      });
    }
  }

  // ========================================================================
  // PHASE: DEVELOPMENT
  // ========================================================================
  if (currentPhase === 'development') {
    const tasks = meeting.developmentTracking?.tasks || [];
    const blockers = tasks.filter((t: any) => t.status === 'blocked');
    const inProgress = tasks.filter((t: any) => t.status === 'in_progress');
    const todo = tasks.filter((t: any) => t.status === 'todo');
    const done = tasks.filter((t: any) => t.status === 'done');

    if (blockers.length > 0) {
      steps.push({
        id: 'resolve-blockers',
        title: { he: 'פתור חסימות', en: 'Resolve Blockers' },
        description: {
          he: `${blockers.length} משימות חסומות דורשות טיפול מיידי`,
          en: `${blockers.length} blocked tasks need immediate attention`
        },
        priority: 'urgent',
        estimatedTime: 'משתנה',
        action: {
          type: 'navigate',
          target: '/phase3/blockers',
          label: { he: 'הצג חסימות', en: 'View Blockers' }
        },
        completed: false
      });
    }

    if (inProgress.length === 0 && todo.length > 0 && blockers.length === 0) {
      steps.push({
        id: 'start-tasks',
        title: { he: 'התחל משימה חדשה', en: 'Start New Task' },
        description: {
          he: `${todo.length} משימות ממתינות להתחלה. בחר משימה והתחל עבודה`,
          en: `${todo.length} tasks waiting to start. Pick a task and begin work`
        },
        priority: 'high',
        estimatedTime: 'משתנה',
        action: {
          type: 'navigate',
          target: '/phase3',
          label: { he: 'פתח דאשבורד', en: 'Open Dashboard' }
        },
        completed: false
      });
    }

    if (inProgress.length > 0) {
      steps.push({
        id: 'continue-tasks',
        title: { he: 'המשך עבודה על משימות פעילות', en: 'Continue Active Tasks' },
        description: {
          he: `${inProgress.length} משימות בביצוע. עדכן סטטוס והמשך עבודה`,
          en: `${inProgress.length} tasks in progress. Update status and continue work`
        },
        priority: 'high',
        estimatedTime: 'משתנה',
        action: {
          type: 'navigate',
          target: '/phase3',
          label: { he: 'פתח דאשבורד', en: 'Open Dashboard' }
        },
        completed: false
      });
    }

    const completionRate = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;
    if (completionRate === 100 && canTransitionTo('completed')) {
      steps.push({
        id: 'complete-project',
        title: { he: 'סיים פרויקט', en: 'Complete Project' },
        description: {
          he: 'כל המשימות הושלמו! סמן את הפרויקט כהושלם',
          en: 'All tasks completed! Mark project as complete'
        },
        priority: 'urgent',
        estimatedTime: '5 דקות',
        action: {
          type: 'navigate',
          target: '/phase3',
          label: { he: 'סיים פרויקט', en: 'Complete Project' }
        },
        completed: false
      });
    }
  }

  // ========================================================================
  // PHASE: COMPLETED
  // ========================================================================
  if (currentPhase === 'completed') {
    steps.push({
      id: 'project-complete',
      title: { he: 'פרויקט הושלם בהצלחה', en: 'Project Completed Successfully' },
      description: {
        he: 'הפרויקט הושלם בהצלחה! ניתן לצפות בסיכום ולייצא דוחות',
        en: 'Project completed successfully! View summary and export reports'
      },
      priority: 'low',
      estimatedTime: '',
      action: {
        type: 'navigate',
        target: '/summary',
        label: { he: 'הצג סיכום', en: 'View Summary' }
      },
      completed: true
    });
  }

  return steps;
}

/**
 * Helper: Get services that need requirements collection
 */
function getServicesNeedingRequirements(meeting: any): string[] {
  const selectedServices = meeting.modules?.proposal?.selectedServices || [];

  // Filter services that have requirement templates
  return selectedServices.filter((service: any) => {
    // Use the actual template lookup to determine if requirements are needed
    return getRequirementsTemplate(service.id) !== null;
  });
}
