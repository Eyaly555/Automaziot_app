import React from 'react';
import { Check, Circle, SkipForward } from 'lucide-react';
import { WIZARD_STEPS } from '../../config/wizardSteps';
import { ProgressBar } from '../Common/ProgressBar/ProgressBar';

interface WizardProgressProps {
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  onStepClick: (stepId: string) => void;
  progress: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  completedSteps,
  skippedSteps,
  onStepClick,
  progress
}) => {
  // Group steps by module
  const moduleGroups = WIZARD_STEPS.reduce((acc, step) => {
    if (!acc[step.moduleId]) {
      acc[step.moduleId] = [];
    }
    acc[step.moduleId].push(step);
    return acc;
  }, {} as Record<string, typeof WIZARD_STEPS>);

  const moduleNames: Record<string, string> = {
    overview: 'סקירה כללית',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    operations: 'תפעול',
    reporting: 'דיווחים',
    aiAgents: 'סוכני AI',
    systems: 'מערכות',
    roi: 'החזר השקעה',
    planning: 'תכנון'
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Compact Progress Bar with Module Breakdown */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">התקדמות כללית</span>
            <span className="text-xs text-gray-600">
              ({completedSteps.length} / {WIZARD_STEPS.length} שלבים)
            </span>
          </div>
          <span className="text-lg font-bold text-blue-600">{progress}%</span>
        </div>
        <ProgressBar value={progress} className="h-2.5" />
      </div>

      {/* Compact Module Overview */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {Object.entries(moduleGroups).map(([moduleId, steps]) => {
          const moduleCompleted = steps.every(step =>
            completedSteps.includes(step.id) || skippedSteps.includes(step.id)
          );
          const moduleInProgress = steps.some(step => step.id === currentStep);
          const moduleCompletedCount = steps.filter(step =>
            completedSteps.includes(step.id) || skippedSteps.includes(step.id)
          ).length;

          return (
            <button
              key={moduleId}
              onClick={() => {
                // Jump to first incomplete step in module or first step
                const firstIncomplete = steps.find(s => !completedSteps.includes(s.id) && !skippedSteps.includes(s.id));
                onStepClick(firstIncomplete?.id || steps[0].id);
              }}
              className={`
                relative p-2 rounded-md border transition-all duration-200 hover:shadow-md
                ${moduleCompleted
                  ? 'bg-green-50 border-green-300 hover:bg-green-100'
                  : moduleInProgress
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }
              `}
              title={`${moduleNames[moduleId]} (${moduleCompletedCount}/${steps.length})`}
            >
              <div className="flex flex-col items-center gap-1">
                {moduleCompleted && <Check className="w-4 h-4 text-green-600" />}
                {!moduleCompleted && moduleInProgress && <Circle className="w-4 h-4 text-blue-600 fill-current" />}
                {!moduleCompleted && !moduleInProgress && <Circle className="w-4 h-4 text-gray-400" />}

                <span className={`
                  text-xs font-medium text-center line-clamp-2
                  ${moduleCompleted ? 'text-green-700' :
                    moduleInProgress ? 'text-blue-700' :
                    'text-gray-600'
                  }
                `}>
                  {moduleNames[moduleId]}
                </span>

                <span className="text-xs text-gray-500">
                  {moduleCompletedCount}/{steps.length}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onStepClick('summary')}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm
            transition-all duration-200 hover:shadow-md
            ${currentStep === 'summary'
              ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <span className="font-medium">סיכום וסקירה</span>
          {completedSteps.length === WIZARD_STEPS.filter(s => !s.isOptional).length && (
            <Check className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Compact Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-gray-600">
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
  );
};