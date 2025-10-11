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
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-3 border border-gray-200">
        {/* Step Counter */}
        <div className="text-center pb-3 border-b border-gray-200">
          <div className="text-xs text-gray-500 mb-1">שלב</div>
          <div className="text-lg font-bold text-gray-900">
            {currentStep} / {totalSteps}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-2">
          {/* Previous Button */}
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all
              ${canGoPrevious
                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }
            `}
            aria-label="חזור לשלב הקודם"
            title="שלב קודם (→)"
          >
            <ChevronRight className="w-5 h-5" />
            <span>הקודם</span>
          </button>

          {/* Skip Button */}
          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-all"
              aria-label="דלג על שלב זה"
              title="דלג (Ctrl+S)"
            >
              <SkipForward className="w-4 h-4" />
              <span>דלג</span>
            </button>
          )}

          {/* Next/Complete Button */}
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all
              ${canGoNext
                ? isLastStep
                  ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }
            `}
            aria-label={isLastStep ? 'סיים אשף' : 'המשך לשלב הבא'}
            title={isLastStep ? 'סיום (Ctrl+Enter)' : 'שלב הבא (←)'}
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
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">←/→</kbd>
              <span>ניווט</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+↵</kbd>
              <span>המשך</span>
            </div>
            {onSkip && (
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+S</kbd>
                <span>דלג</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};