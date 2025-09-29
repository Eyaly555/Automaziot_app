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
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">התקדמות כללית</span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <ProgressBar value={progress} className="h-2" />
      </div>

      {/* Module Steps Grid */}
      <div className="space-y-4">
        {Object.entries(moduleGroups).map(([moduleId, steps]) => {
          const moduleCompleted = steps.every(step =>
            completedSteps.includes(step.id) || skippedSteps.includes(step.id)
          );
          const moduleInProgress = steps.some(step => step.id === currentStep);

          return (
            <div key={moduleId} className="border-b border-gray-200 pb-4 last:border-0">
              {/* Module Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${
                  moduleCompleted ? 'text-green-600' :
                  moduleInProgress ? 'text-blue-600' :
                  'text-gray-700'
                }`}>
                  {moduleNames[moduleId]}
                </h3>
                {moduleCompleted && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Steps within module */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {steps.map((step) => {
                  const status = getStepStatus(step.id);
                  const isClickable = status === 'completed' || status === 'skipped' || status === 'current';

                  return (
                    <button
                      key={step.id}
                      onClick={() => isClickable && onStepClick(step.id)}
                      disabled={!isClickable}
                      className={`
                        relative flex items-center gap-2 px-3 py-2 rounded-md text-xs
                        transition-all duration-200
                        ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'}
                        ${status === 'current' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        ${status === 'completed' ? 'bg-green-50 hover:bg-green-100' :
                          status === 'skipped' ? 'bg-yellow-50 hover:bg-yellow-100' :
                          status === 'current' ? 'bg-blue-50 hover:bg-blue-100' :
                          'bg-gray-50'
                        }
                      `}
                      title={step.sectionName}
                    >
                      <span className={`
                        flex items-center justify-center w-5 h-5 rounded-full
                        ${getStepColor(status)}
                      `}>
                        {getStepIcon(status)}
                      </span>
                      <span className={`
                        truncate flex-1 text-right
                        ${status === 'completed' ? 'text-green-700' :
                          status === 'skipped' ? 'text-yellow-700' :
                          status === 'current' ? 'text-blue-700 font-semibold' :
                          'text-gray-600'
                        }
                      `}>
                        {step.sectionName}
                      </span>
                      {step.isOptional && status === 'pending' && (
                        <span className="text-gray-400 text-xs">(אופציונלי)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => onStepClick('summary')}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md
            transition-all duration-200 hover:shadow-md
            ${currentStep === 'summary'
              ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <span className="font-medium">סיכום וסקירה</span>
          {completedSteps.length === WIZARD_STEPS.filter(s => !s.isOptional).length && (
            <Check className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-green-500"></span>
          <span>הושלם</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-blue-500"></span>
          <span>שלב נוכחי</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
          <span>דולג</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-gray-300"></span>
          <span>ממתין</span>
        </div>
      </div>
    </div>
  );
};