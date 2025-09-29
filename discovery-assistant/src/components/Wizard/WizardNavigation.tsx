import React, { useEffect } from 'react';
import { ChevronRight, ChevronLeft, SkipForward, Check } from 'lucide-react';

interface WizardNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastStep?: boolean;
  currentStep: number;
  totalSteps: number;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onNext,
  onPrevious,
  onSkip,
  canGoNext,
  canGoPrevious,
  isLastStep = false,
  currentStep,
  totalSteps
}) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't navigate when typing in form fields
      }

      switch (e.key) {
        case 'ArrowRight':
          if (canGoPrevious) {
            e.preventDefault();
            onPrevious();
          }
          break;
        case 'ArrowLeft':
          if (canGoNext) {
            e.preventDefault();
            onNext();
          }
          break;
        case 'Enter':
          if (e.ctrlKey && canGoNext) {
            e.preventDefault();
            onNext();
          }
          break;
        case 's':
          if (e.ctrlKey && onSkip) {
            e.preventDefault();
            onSkip();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canGoNext, canGoPrevious, onNext, onPrevious, onSkip]);

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex justify-between items-center">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
            ${canGoPrevious
              ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="חזור לשלב הקודם"
        >
          <ChevronRight className="w-5 h-5" />
          <span>הקודם</span>
        </button>

        {/* Center Info */}
        <div className="flex items-center gap-4">
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="דלג על שלב זה"
            >
              <SkipForward className="w-4 h-4" />
              <span>דלג</span>
            </button>
          )}

          <span className="text-sm text-gray-600">
            שלב {currentStep} מתוך {totalSteps}
          </span>
        </div>

        {/* Next/Complete Button */}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
            ${canGoNext
              ? isLastStep
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label={isLastStep ? 'סיים אשף' : 'המשך לשלב הבא'}
        >
          <span>{isLastStep ? 'סיום' : 'הבא'}</span>
          {isLastStep ? (
            <Check className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-4 flex justify-center">
        <div className="text-xs text-gray-500 space-x-4 space-x-reverse">
          <span>← / → לניווט</span>
          <span>Ctrl+Enter להמשך</span>
          {onSkip && <span>Ctrl+S לדילוג</span>}
        </div>
      </div>
    </div>
  );
};