import React, { useState } from 'react';
import {
  Check,
  Circle,
  SkipForward,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';
import { WIZARD_STEPS } from '../../config/wizardSteps';

interface WizardSidebarProps {
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  onStepClick: (stepId: string) => void;
}

export const WizardSidebar: React.FC<WizardSidebarProps> = ({
  currentStep,
  completedSteps,
  skippedSteps,
  onStepClick,
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  // Group steps by module
  const moduleGroups = WIZARD_STEPS.reduce(
    (acc, step) => {
      if (!acc[step.moduleId]) {
        acc[step.moduleId] = [];
      }
      acc[step.moduleId].push(step);
      return acc;
    },
    {} as Record<string, typeof WIZARD_STEPS>
  );

  const moduleNames: Record<string, string> = {
    overview: 'סקירה כללית',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    operations: 'תפעול',
    reporting: 'דיווחים',
    aiAgents: 'סוכני AI',
    systems: 'מערכות',
    roi: 'החזר השקעה',
    planning: 'תכנון',
  };

  const getStepStatus = (stepId: string) => {
    if (currentStep === stepId) return 'current';
    if (completedSteps.includes(stepId)) return 'completed';
    if (skippedSteps.includes(stepId)) return 'skipped';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'skipped':
        return <SkipForward className="w-4 h-4" />;
      case 'current':
        return <Circle className="w-4 h-4 fill-current" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'skipped':
        return 'bg-yellow-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-300 text-gray-500';
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Auto-expand module with current step
  React.useEffect(() => {
    const currentStepData = WIZARD_STEPS.find((s) => s.id === currentStep);
    if (currentStepData) {
      setExpandedModules(
        (prev) => new Set([...prev, currentStepData.moduleId])
      );
    }
  }, [currentStep]);

  return (
    <div className="fixed right-6 top-6 bottom-6 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-l from-blue-50 to-white">
        <h2 className="text-lg font-bold text-gray-900">מפת השלבים</h2>
        <p className="text-xs text-gray-600 mt-1">לחץ על שלב למעבר מהיר</p>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {Object.entries(moduleGroups).map(([moduleId, steps]) => {
            const isExpanded = expandedModules.has(moduleId);
            const moduleCompleted = steps.every(
              (step) =>
                completedSteps.includes(step.id) ||
                skippedSteps.includes(step.id)
            );
            const moduleInProgress = steps.some(
              (step) => step.id === currentStep
            );
            const moduleCompletedCount = steps.filter(
              (step) =>
                completedSteps.includes(step.id) ||
                skippedSteps.includes(step.id)
            ).length;

            return (
              <div key={moduleId} className="rounded-lg overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(moduleId)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg
                    transition-all duration-200 hover:shadow-md
                    ${
                      moduleCompleted
                        ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                        : moduleInProgress
                          ? 'bg-blue-50 border-2 border-blue-400'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    )}

                    {/* Module Status Icon */}
                    {moduleCompleted && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {!moduleCompleted && moduleInProgress && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500">
                        <Circle className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                    {!moduleCompleted && !moduleInProgress && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-300">
                        <Circle className="w-3 h-3 text-gray-500" />
                      </div>
                    )}

                    {/* Module Name */}
                    <span
                      className={`
                      text-sm font-semibold text-right flex-1
                      ${
                        moduleCompleted
                          ? 'text-green-700'
                          : moduleInProgress
                            ? 'text-blue-700'
                            : 'text-gray-700'
                      }
                    `}
                    >
                      {moduleNames[moduleId]}
                    </span>
                  </div>

                  {/* Progress Count */}
                  <span className="text-xs text-gray-600 font-medium mr-2">
                    {moduleCompletedCount}/{steps.length}
                  </span>
                </button>

                {/* Steps List (Expanded) */}
                {isExpanded && (
                  <div className="mt-1 mr-4 space-y-1">
                    {steps.map((step) => {
                      const status = getStepStatus(step.id);
                      const isClickable = true; // Allow navigation to any step

                      return (
                        <button
                          key={step.id}
                          onClick={() => onStepClick(step.id)}
                          disabled={false}
                          className={`
                            w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs
                            transition-all duration-200
                            ${isClickable ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed opacity-50'}
                            ${status === 'current' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                            ${
                              status === 'completed'
                                ? 'bg-green-50 hover:bg-green-100'
                                : status === 'skipped'
                                  ? 'bg-yellow-50 hover:bg-yellow-100'
                                  : status === 'current'
                                    ? 'bg-blue-50'
                                    : 'bg-gray-50 hover:bg-gray-100'
                            }
                          `}
                          title={step.sectionName}
                        >
                          <span
                            className={`
                            flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0
                            ${getStepColor(status)}
                          `}
                          >
                            {getStepIcon(status)}
                          </span>
                          <span
                            className={`
                            text-right flex-1
                            ${
                              status === 'completed'
                                ? 'text-green-700'
                                : status === 'skipped'
                                  ? 'text-yellow-700'
                                  : status === 'current'
                                    ? 'text-blue-700 font-semibold'
                                    : 'text-gray-600'
                            }
                          `}
                          >
                            {step.sectionName}
                          </span>
                          {step.isOptional && status === 'pending' && (
                            <span className="text-gray-400 text-xs flex-shrink-0">
                              (אופ׳)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer - Summary Button */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => onStepClick('summary')}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
            transition-all duration-200 hover:shadow-md font-medium
            ${
              currentStep === 'summary'
                ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <span>סיכום וסקירה</span>
          {completedSteps.length ===
            WIZARD_STEPS.filter((s) => !s.isOptional).length && (
            <Check className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Legend */}
      <div className="px-3 pb-3">
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>הושלם</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>נוכחי</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>דולג</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-300"></span>
            <span>ממתין</span>
          </div>
        </div>
      </div>
    </div>
  );
};
