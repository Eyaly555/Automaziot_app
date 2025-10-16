// discovery-assistant/src/components/Mobile/MobileQuickForm.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Button, Card } from '../Base';
import { AISection } from './components/AISection';
import { AutomationSection } from './components/AutomationSection';
import { CRMSection } from './components/CRMSection';
import {
  mobileToModules,
  validateMobileData,
} from '../../utils/mobileDataAdapter';
import { generateProposal } from '../../utils/proposalEngine';
import type { MobileFormData, MobileSectionType } from '../../types/mobile';

export const MobileQuickForm: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();

  const [formData, setFormData] = useState<MobileFormData>({
    ai_agents: {
      count: '1',
      channels: [],
      domains: [],
    },
    automations: {
      processes: [],
      time_wasted: 'under_1h',
      biggest_pain: 'things_fall',
      most_important_process: '',
    },
    crm: {
      exists: 'no',
      data_quality: 'ok',
    },
  });

  const [currentSection, setCurrentSection] = useState<MobileSectionType>('ai');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for accessibility and scroll management
  const errorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Redirect if no meeting
  React.useEffect(() => {
    if (!currentMeeting) {
      navigate('/clients');
    }
  }, [currentMeeting, navigate]);

  // Focus management - scroll to errors when they appear
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      // Scroll error into view with margin for better visibility
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Set focus for screen readers
      errorRef.current.focus();
    }
  }, [errors]);

  // Announce section changes for screen readers
  useEffect(() => {
    const sectionNames = {
      ai: 'סוכני AI',
      automation: 'אוטומציות עסקיות',
      crm: 'CRM ואינטגרציות',
    };

    // Announce to screen readers
    const announcement = `עברת לחלק ${currentSection === 'ai' ? '1' : currentSection === 'automation' ? '2' : '3'} מתוך 3: ${sectionNames[currentSection]}`;

    // Create temporary live region for announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;
    document.body.appendChild(liveRegion);

    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);

    // Scroll to top of content on section change
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSection]);

  // Haptic feedback helper (vibration API for supported devices)
  const triggerHapticFeedback = (
    type: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Update section data
  const updateSection = <K extends keyof MobileFormData>(
    section: K,
    updates: Partial<MobileFormData[K]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }));
    setErrors([]); // Clear errors on change
  };

  // Validate current section with enhanced feedback
  const validateCurrentSection = (): boolean => {
    const newErrors: string[] = [];

    if (currentSection === 'ai') {
      if (formData.ai_agents.channels.length === 0) {
        newErrors.push('חובה לבחור לפחות ערוץ אחד');
      }
      if (formData.ai_agents.domains.length === 0) {
        newErrors.push('חובה לבחור לפחות תחום אחד');
      }
    }

    if (currentSection === 'automation') {
      if (formData.automations.processes.length === 0) {
        newErrors.push('חובה לבחור לפחות תהליך אחד');
      }
    }

    if (newErrors.length > 0) {
      // Provide haptic feedback for validation errors
      triggerHapticFeedback('medium');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Navigation with haptic feedback
  const handleNext = () => {
    if (!validateCurrentSection()) {
      return;
    }

    // Success haptic feedback
    triggerHapticFeedback('light');

    if (currentSection === 'ai') {
      setCurrentSection('automation');
    } else if (currentSection === 'automation') {
      setCurrentSection('crm');
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    // Light haptic feedback for navigation
    triggerHapticFeedback('light');

    if (currentSection === 'crm') {
      setCurrentSection('automation');
    } else if (currentSection === 'automation') {
      setCurrentSection('ai');
    }
  };

  // Submit with loading state and enhanced error handling
  const handleSubmit = async () => {
    if (!currentMeeting) {
      navigate('/clients');
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate
      const validation = validateMobileData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        triggerHapticFeedback('medium');
        setIsSubmitting(false);
        return;
      }

      // Success haptic feedback before processing
      triggerHapticFeedback('heavy');

      // Convert to full modules
      const fullModules = mobileToModules(formData);

      // Save all modules
      Object.entries(fullModules).forEach(([key, value]) => {
        updateModule(key as any, value);
      });

      // Generate proposal (simulate async operation with small delay for UX)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const proposalResult = generateProposal({
        ...currentMeeting,
        modules: fullModules,
      });

      // Save proposal
      updateModule('proposal', proposalResult);

      // Final success haptic feedback
      triggerHapticFeedback('heavy');

      // Navigate to proposal
      navigate('/module/proposal');
    } catch (error) {
      console.error('Error generating proposal:', error);
      setErrors(['אירעה שגיאה ביצירת ההצעה. נסה שוב.']);
      triggerHapticFeedback('heavy');
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const progress =
    currentSection === 'ai' ? 33 : currentSection === 'automation' ? 66 : 100;

  // Section metadata for accessibility
  const sectionInfo = {
    ai: { step: 1, name: 'סוכני AI', icon: '🤖' },
    automation: { step: 2, name: 'אוטומציות עסקיות', icon: '⚙️' },
    crm: { step: 3, name: 'CRM ואינטגרציות', icon: '🔗' },
  };

  const currentSectionInfo = sectionInfo[currentSection];

  if (!currentMeeting) {
    return null;
  }

  return (
    <div className="mobile-quick-form min-h-screen bg-gray-50" dir="rtl">
      {/* Header with enhanced accessibility */}
      <header
        className="mobile-header sticky top-0 z-10 bg-white shadow-sm"
        role="banner"
        aria-label="כותרת שאלון מהיר"
      >
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            שאלון מהיר {currentSectionInfo.icon}
          </h1>

          {/* Progress Bar with ARIA attributes for accessibility */}
          <div
            className="mobile-progress mt-3"
            role="progressbar"
            aria-label={`התקדמות שאלון: ${progress}%`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="mobile-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mobile-progress-text mt-2">
            חלק {currentSectionInfo.step}/3 - {currentSectionInfo.name}
          </p>
        </div>
      </header>

      {/* Main Content with proper landmark */}
      <main
        ref={contentRef}
        className="px-4 py-6 pb-24"
        role="main"
        aria-label="תוכן שאלון"
      >
        <Card className="mobile-card" padding="none">
          {/* Section Content */}
          {currentSection === 'ai' && (
            <AISection
              data={formData.ai_agents}
              onChange={(updates) => updateSection('ai_agents', updates)}
            />
          )}

          {currentSection === 'automation' && (
            <AutomationSection
              data={formData.automations}
              onChange={(updates) => updateSection('automations', updates)}
            />
          )}

          {currentSection === 'crm' && (
            <CRMSection
              data={formData.crm}
              onChange={(updates) => updateSection('crm', updates)}
            />
          )}

          {/* Enhanced Error Display with accessibility and better mobile UX */}
          {errors.length > 0 && (
            <div
              ref={errorRef}
              className="mobile-validation-error mt-6 mx-6 scroll-mt-24"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              tabIndex={-1}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  ⚠️
                </span>
                <div className="flex-1">
                  <p className="mobile-validation-error-text font-medium mb-2">
                    יש למלא את השדות הבאים:
                  </p>
                  <ul
                    className="mobile-validation-error-text list-disc list-inside space-y-1"
                    aria-label="רשימת שגיאות"
                  >
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Loading State Overlay */}
          {isSubmitting && (
            <div
              className="mt-6 mx-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center"
              role="status"
              aria-atomic="true"
            >
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
              <p className="text-blue-900 font-medium text-lg">
                יוצר הצעת מחיר...
              </p>
              <p className="text-blue-700 text-sm mt-1">
                אנא המתן, זה לוקח רק כמה שניות
              </p>
            </div>
          )}
        </Card>
      </main>

      {/* Navigation with iOS safe-area support */}
      <nav
        className="mobile-nav"
        role="navigation"
        aria-label="ניווט שאלון"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="mobile-nav-buttons">
          {currentSection !== 'ai' && (
            <Button
              onClick={handlePrevious}
              variant="secondary"
              size="lg"
              className="mobile-nav-button mobile-nav-button-secondary"
              disabled={isSubmitting}
              ariaLabel={`חזור לחלק ${currentSectionInfo.step - 1}`}
            >
              ← הקודם
            </Button>
          )}

          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="mobile-nav-button mobile-nav-button-primary"
            disabled={isSubmitting}
            loading={isSubmitting && currentSection === 'crm'}
            ariaLabel={
              currentSection === 'crm'
                ? 'צור הצעת מחיר'
                : `המשך לחלק ${currentSectionInfo.step + 1}`
            }
          >
            {currentSection === 'crm' ? 'צור הצעת מחיר →' : 'הבא →'}
          </Button>
        </div>
      </nav>

      {/* Screen Reader Only Helper Text */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isSubmitting && 'טוען... אנא המתן'}
      </div>
    </div>
  );
};
