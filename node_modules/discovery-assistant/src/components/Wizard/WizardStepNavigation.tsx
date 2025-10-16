import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft } from 'lucide-react';
import { WIZARD_STEPS } from '../../config/wizardSteps';
import { useMeetingStore } from '../../store/useMeetingStore';

/**
 * WizardStepNavigation Component
 *
 * Enhanced wizard navigation with step indicators, progress animation,
 * and clickable navigation between completed/current steps.
 *
 * Features:
 * - Visual step indicators with numbers/checkmarks
 * - Completed/current/pending states
 * - Clickable navigation to any step
 * - Progress animation with framer-motion
 * - RTL support for Hebrew UI
 */
export const WizardStepNavigation: React.FC = () => {
  const { wizardState, navigateWizardStep } = useMeetingStore();

  if (!wizardState) {
    return null;
  }

  const handleStepClick = (stepId: string, index: number) => {
    // Allow navigation to current step or any completed step
    const isCompleted = wizardState.completedSteps.has(stepId);
    const isCurrent = wizardState.currentStep === index;

    if (isCompleted || isCurrent) {
      navigateWizardStep('jump', index);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-4 shadow-sm" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = wizardState.completedSteps.has(step.id);
            const isCurrent = wizardState.currentStep === index;
            const isClickable = isCompleted || isCurrent;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id, index)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                    ${
                      isCurrent
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                          : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                    }
                    ${isClickable ? 'hover:shadow-md' : ''}
                  `}
                  aria-label={`${isCompleted ? '�����' : isCurrent ? '�����' : '�����'}: ${step.sectionName}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {/* Step Number/Check Circle */}
                  <div
                    className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-200
                    ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md'
                        : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-500'
                    }
                  `}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Step Name */}
                  <span className="text-sm font-medium whitespace-nowrap">
                    {step.sectionName}
                  </span>

                  {/* Current Step Indicator - Bottom Bar */}
                  {isCurrent && (
                    <motion.div
                      layoutId="current-step-indicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>

                {/* Separator - ChevronLeft for RTL */}
                {index < WIZARD_STEPS.length - 1 && (
                  <ChevronLeft
                    className={`
                      w-4 h-4 mx-1 flex-shrink-0
                      ${isCompleted ? 'text-green-400' : 'text-gray-300'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            ��� {wizardState.currentStep + 1} ���� {WIZARD_STEPS.length}
            {' " '}
            {wizardState.completedSteps.size} ������
            {wizardState.skippedSections.size > 0 && (
              <>
                {' " '}
                <span className="text-orange-600">
                  {wizardState.skippedSections.size} �����
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
