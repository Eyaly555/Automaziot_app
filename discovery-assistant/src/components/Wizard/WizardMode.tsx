import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Card } from '../Common/Card';
import { WizardSidebar } from './WizardSidebar';
import { WizardProgress } from './WizardProgress';
import { WizardStepContent } from './WizardStepContent';
import { WizardSummary } from './WizardSummary';
import { WIZARD_STEPS, getStepById, getNextStep, getPreviousStep } from '../../config/wizardSteps';
import { WizardState, WizardStep } from '../../types';

export const WizardMode: React.FC = () => {
  const navigate = useNavigate();
  const { stepId } = useParams<{ stepId?: string }>();
  const {
    currentMeeting,
    updateMeeting,
    updateModule,
    wizardState,
    setWizardState,
    initializeWizard,
    updateWizardProgress,
    navigateWizardStep,
    skipWizardSection,
    syncWizardToModules
  } = useMeetingStore();

  const [currentStep, setCurrentStep] = useState<WizardStep | undefined>();
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize wizard state on mount
  useEffect(() => {
    if (!wizardState) {
      initializeWizard();
    }
  }, [wizardState, initializeWizard]);

  // Load current step based on URL or state
  useEffect(() => {
    if (stepId === 'summary') {
      setShowSummary(true);
      setCurrentStep(undefined);
    } else if (stepId) {
      const step = getStepById(stepId);
      setCurrentStep(step);
      setShowSummary(false);
    } else if (wizardState) {
      // Default to first step
      const firstStep = WIZARD_STEPS[0];
      setCurrentStep(firstStep);
      setShowSummary(false);
      navigate(`/wizard/${firstStep.id}`, { replace: true });
    }
  }, [stepId, wizardState, navigate]);

  // Check if meeting exists
  useEffect(() => {
    if (!currentMeeting) {
      navigate('/', { replace: true });
    }
  }, [currentMeeting, navigate]);

  // Handle field changes
  const handleFieldChange = useCallback((fieldPath: string, value: any) => {
    if (!currentStep || !currentMeeting) return;

    // Parse field path (e.g., "speedToLead.duringBusinessHours" -> module: leadsAndSales, field: speedToLead.duringBusinessHours)
    const moduleId = currentStep.moduleId;
    const fieldParts = fieldPath.split('.');

    // Get current module data
    const moduleData = currentMeeting.modules[moduleId] || {};

    // Helper function to set nested value
    const setNestedValue = (obj: any, path: string[], value: any): any => {
      if (path.length === 1) {
        return { ...obj, [path[0]]: value };
      }

      const [first, ...rest] = path;
      return {
        ...obj,
        [first]: setNestedValue(obj[first] || {}, rest, value)
      };
    };

    // Update nested field
    const updatedModuleData = setNestedValue(moduleData, fieldParts, value);

    updateModule(moduleId, updatedModuleData);

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldPath];
      return newErrors;
    });

    // Sync to modules
    syncWizardToModules();
  }, [currentStep, currentMeeting, updateModule, syncWizardToModules]);

  // Validate current step
  const validateStep = (): boolean => {
    if (!currentStep || currentStep.isOptional) return true;

    const stepErrors: Record<string, string> = {};
    let isValid = true;

    currentStep.fields.forEach(field => {
      if (field.props.required) {
        const value = getFieldValue(field.name);
        if (!value || (Array.isArray(value) && value.length === 0)) {
          stepErrors[field.name] = 'שדה חובה';
          isValid = false;
        }
      }
    });

    setErrors(stepErrors);
    return isValid;
  };

  // Get field value from meeting data
  const getFieldValue = (fieldPath: string): any => {
    if (!currentStep || !currentMeeting) return undefined;

    const moduleId = currentStep.moduleId;
    const moduleData = currentMeeting.modules[moduleId] || {};

    const fieldParts = fieldPath.split('.');
    let value = moduleData;

    for (const part of fieldParts) {
      value = value?.[part];
    }

    return value;
  };

  // Handle navigation
  const handleNext = () => {
    if (showSummary) {
      // Complete wizard
      navigate('/');
      return;
    }

    if (!validateStep()) {
      return;
    }

    if (!currentStep) return;

    // Mark current step as completed
    updateWizardProgress(currentStep.id);

    // Get next step
    const businessType = currentMeeting?.modules.overview?.businessType;
    const nextStep = getNextStep(currentStep.id, businessType);

    if (nextStep) {
      navigate(`/wizard/${nextStep.id}`);
    } else {
      // Go to summary
      navigate('/wizard/summary');
    }
  };

  const handlePrevious = () => {
    if (showSummary) {
      // Go back to last step
      const lastStep = WIZARD_STEPS[WIZARD_STEPS.length - 1];
      navigate(`/wizard/${lastStep.id}`);
      return;
    }

    if (!currentStep) return;

    const businessType = currentMeeting?.modules.overview?.businessType;
    const prevStep = getPreviousStep(currentStep.id, businessType);

    if (prevStep) {
      navigate(`/wizard/${prevStep.id}`);
    }
  };

  const handleSkip = () => {
    if (!currentStep) return;

    skipWizardSection(currentStep.id);
    handleNext();
  };

  const handleJumpToStep = (targetStepId: string) => {
    navigate(`/wizard/${targetStepId}`);
  };

  const handleExitWizard = () => {
    // Sync all data before exiting
    syncWizardToModules();
    navigate('/');
  };

  // Calculate progress
  const calculateProgress = (): number => {
    if (!wizardState) return 0;
    const completedCount = wizardState.completedSteps.size;
    const totalCount = WIZARD_STEPS.length;
    return Math.round((completedCount / totalCount) * 100);
  };

  if (!currentMeeting || !wizardState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar with Module/Step Navigation */}
      <WizardSidebar
        currentStep={currentStep?.id || 'summary'}
        completedSteps={Array.from(wizardState.completedSteps)}
        skippedSteps={Array.from(wizardState.skippedSections)}
        onStepClick={handleJumpToStep}
      />

      <div className="container mx-auto px-4 py-6 max-w-5xl ml-80">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                אשף גילוי - {currentMeeting.clientName}
              </h1>
              <p className="text-gray-600 mt-2">
                {showSummary ? 'סיכום' : currentStep?.sectionName}
              </p>
            </div>
            <button
              onClick={handleExitWizard}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              יציאה לדשבורד
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-6">
          {showSummary ? (
            <WizardSummary
              meeting={currentMeeting}
              onEdit={handleJumpToStep}
            />
          ) : currentStep ? (
            <Card className="p-6">
              <WizardStepContent
                step={currentStep}
                values={currentMeeting.modules[currentStep.moduleId] || {}}
                errors={errors}
                onChange={handleFieldChange}
                meeting={currentMeeting}
              />
            </Card>
          ) : null}
        </div>

        {/* Progress */}
        <WizardProgress
          currentStep={currentStep?.id || 'summary'}
          completedSteps={Array.from(wizardState.completedSteps)}
          skippedSteps={Array.from(wizardState.skippedSections)}
          onStepClick={handleJumpToStep}
          progress={calculateProgress()}
        />
      </div>
    </div>
  );
};