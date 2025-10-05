/**
 * Validation Guards System
 *
 * Business logic validation guards for:
 * - Phase transitions
 * - Module completion checks
 * - Form submission validation
 * - Navigation guards
 * - Data integrity checks
 *
 * Integrates with the phase guard system and wizard validation
 */

import { Meeting, MeetingPhase, MeetingStatus, WizardStep } from '../types';
import { WIZARD_STEPS } from '../config/wizardSteps';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationGuardResult {
  canProceed: boolean;
  reasons: string[];
  missingFields?: string[];
  warnings?: string[];
}

export interface ModuleCompletionResult {
  isComplete: boolean;
  completionPercentage: number;
  requiredFieldsMissing: string[];
  optionalFieldsMissing: string[];
}

export interface PhaseTransitionValidation {
  canTransition: boolean;
  reasons: string[];
  requiredActions: string[];
  progress: number;
}

// ============================================================================
// MODULE VALIDATION GUARDS
// ============================================================================

/**
 * Check if Overview module is complete
 */
export const validateOverviewModule = (meeting: Meeting): ModuleCompletionResult => {
  const overview = meeting?.modules?.overview;
  const requiredFieldsMissing: string[] = [];
  const optionalFieldsMissing: string[] = [];

  // Required fields
  if (!overview?.businessType) requiredFieldsMissing.push('סוג העסק');
  if (!overview?.employees) requiredFieldsMissing.push('מספר עובדים');

  // Optional but recommended
  if (!overview?.mainChallenge) optionalFieldsMissing.push('אתגר מרכזי');
  if (!overview?.mainGoals || overview.mainGoals.length === 0) optionalFieldsMissing.push('מטרות עיקריות');

  const totalRequired = 2;
  const completedRequired = totalRequired - requiredFieldsMissing.length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  return {
    isComplete: requiredFieldsMissing.length === 0,
    completionPercentage,
    requiredFieldsMissing,
    optionalFieldsMissing
  };
};

/**
 * Check if LeadsAndSales module is complete
 */
export const validateLeadsAndSalesModule = (meeting: Meeting): ModuleCompletionResult => {
  const leadsAndSales = meeting?.modules?.leadsAndSales;
  const requiredFieldsMissing: string[] = [];
  const optionalFieldsMissing: string[] = [];

  // Required: At least one lead source
  if (!leadsAndSales?.leadSources || !Array.isArray(leadsAndSales.leadSources) || leadsAndSales.leadSources.length === 0) {
    requiredFieldsMissing.push('מקורות לידים');
  }

  // Optional but recommended
  if (!leadsAndSales?.speedToLead) optionalFieldsMissing.push('מהירות טיפול בליד');
  if (!leadsAndSales?.leadRouting) optionalFieldsMissing.push('ניתוב לידים');

  const totalRequired = 1;
  const completedRequired = totalRequired - requiredFieldsMissing.length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  return {
    isComplete: requiredFieldsMissing.length === 0,
    completionPercentage,
    requiredFieldsMissing,
    optionalFieldsMissing
  };
};

/**
 * Check if CustomerService module is complete
 */
export const validateCustomerServiceModule = (meeting: Meeting): ModuleCompletionResult => {
  const customerService = meeting?.modules?.customerService;
  const requiredFieldsMissing: string[] = [];
  const optionalFieldsMissing: string[] = [];

  // Required: At least one support channel
  if (!customerService?.channels || !Array.isArray(customerService.channels) || customerService.channels.length === 0) {
    requiredFieldsMissing.push('ערוצי תמיכה');
  }

  // Optional but recommended
  if (!customerService?.autoResponse) optionalFieldsMissing.push('מענה אוטומטי');

  const totalRequired = 1;
  const completedRequired = totalRequired - requiredFieldsMissing.length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  return {
    isComplete: requiredFieldsMissing.length === 0,
    completionPercentage,
    requiredFieldsMissing,
    optionalFieldsMissing
  };
};

/**
 * Check if Systems module is complete
 */
export const validateSystemsModule = (meeting: Meeting): ModuleCompletionResult => {
  const systems = meeting?.modules?.systems;
  const requiredFieldsMissing: string[] = [];
  const optionalFieldsMissing: string[] = [];

  // Required: At least one current system documented
  if (!systems?.currentSystems || !Array.isArray(systems.currentSystems) || systems.currentSystems.length === 0) {
    requiredFieldsMissing.push('מערכות קיימות');
  }

  // Optional but recommended
  if (!systems?.integrationNeeds) optionalFieldsMissing.push('צרכי אינטגרציה');

  const totalRequired = 1;
  const completedRequired = totalRequired - requiredFieldsMissing.length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  return {
    isComplete: requiredFieldsMissing.length === 0,
    completionPercentage,
    requiredFieldsMissing,
    optionalFieldsMissing
  };
};

/**
 * Check if ROI module is complete
 */
export const validateROIModule = (meeting: Meeting): ModuleCompletionResult => {
  const roi = meeting?.modules?.roi;
  const requiredFieldsMissing: string[] = [];
  const optionalFieldsMissing: string[] = [];

  // Required: Cost analysis completed
  if (!roi?.costAnalysis) requiredFieldsMissing.push('ניתוח עלויות');
  if (roi?.costAnalysis && !roi.costAnalysis.hourlyRate) requiredFieldsMissing.push('תעריף שעתי');

  // Optional but recommended
  if (!roi?.timeSavings) optionalFieldsMissing.push('חיסכון בזמן');

  const totalRequired = 2;
  const completedRequired = totalRequired - requiredFieldsMissing.length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  return {
    isComplete: requiredFieldsMissing.length === 0,
    completionPercentage,
    requiredFieldsMissing,
    optionalFieldsMissing
  };
};

/**
 * Check if Proposal module is complete
 */
export const validateProposalModule = (meeting: Meeting): ModuleCompletionResult => {
  const proposal = meeting?.modules?.proposal;
  const requiredFieldsMissing: string[] = [];
  const optionalFieldsMissing: string[] = [];

  // Required: Proposal must exist and have services
  if (!proposal) {
    requiredFieldsMissing.push('הצעה לא נוצרה');
  } else {
    if (!proposal.proposedServices || proposal.proposedServices.length === 0) {
      requiredFieldsMissing.push('שירותים מוצעים');
    }
  }

  const totalRequired = 1;
  const completedRequired = totalRequired - requiredFieldsMissing.length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  return {
    isComplete: requiredFieldsMissing.length === 0,
    completionPercentage,
    requiredFieldsMissing,
    optionalFieldsMissing
  };
};

/**
 * Validate all modules and get overall completion
 */
export const validateAllModules = (meeting: Meeting): {
  overall: ModuleCompletionResult;
  modules: Record<string, ModuleCompletionResult>;
} => {
  const modules = {
    overview: validateOverviewModule(meeting),
    leadsAndSales: validateLeadsAndSalesModule(meeting),
    customerService: validateCustomerServiceModule(meeting),
    systems: validateSystemsModule(meeting),
    roi: validateROIModule(meeting),
    proposal: validateProposalModule(meeting)
  };

  // Calculate overall completion
  const totalModules = Object.keys(modules).length;
  const totalCompletionPercentage = Object.values(modules).reduce(
    (sum, module) => sum + module.completionPercentage,
    0
  );
  const overallPercentage = Math.round(totalCompletionPercentage / totalModules);

  const allRequiredFields = Object.values(modules).flatMap(m => m.requiredFieldsMissing);
  const allOptionalFields = Object.values(modules).flatMap(m => m.optionalFieldsMissing);

  return {
    overall: {
      isComplete: allRequiredFields.length === 0,
      completionPercentage: overallPercentage,
      requiredFieldsMissing: allRequiredFields,
      optionalFieldsMissing: allOptionalFields
    },
    modules
  };
};

// ============================================================================
// PHASE TRANSITION VALIDATION GUARDS
// ============================================================================

/**
 * Validate transition from Discovery to Implementation Spec
 */
export const validateDiscoveryToImplementationSpec = (
  meeting: Meeting
): PhaseTransitionValidation => {
  const reasons: string[] = [];
  const requiredActions: string[] = [];

  // Check overall discovery progress
  const validation = validateAllModules(meeting);
  const progress = validation.overall.completionPercentage;

  // Minimum 70% completion required
  if (progress < 70) {
    reasons.push(`יש להשלים לפחות 70% מגילוי הדרישות (נוכחי: ${progress}%)`);
    requiredActions.push('השלם את המודולים החסרים');
  }

  // Proposal module must be complete
  const proposalValidation = validateProposalModule(meeting);
  if (!proposalValidation.isComplete) {
    reasons.push('יש להשלים את מודול ההצעה המסחרית');
    requiredActions.push('צור הצעה מסחרית');
  }

  // Client approval required
  if (meeting.status !== 'client_approved') {
    reasons.push('נדרש אישור לקוח לפני מעבר לשלב מפרט היישום');
    requiredActions.push('קבל אישור לקוח להצעה');
  }

  // Client contact information required
  if (!meeting.zohoIntegration?.contactInfo?.email && !meeting.zohoIntegration?.contactInfo?.phone) {
    reasons.push('יש להזין פרטי קשר של הלקוח');
    requiredActions.push('הזן אימייל או טלפון של הלקוח');
  }

  return {
    canTransition: reasons.length === 0,
    reasons,
    requiredActions,
    progress
  };
};

/**
 * Validate transition from Implementation Spec to Development
 */
export const validateImplementationSpecToDevelopment = (
  meeting: Meeting
): PhaseTransitionValidation => {
  const reasons: string[] = [];
  const requiredActions: string[] = [];

  // Check if implementation spec exists
  if (!meeting.implementationSpec) {
    reasons.push('יש ליצור מפרט יישום');
    requiredActions.push('צור מפרט יישום');
    return {
      canTransition: false,
      reasons,
      requiredActions,
      progress: 0
    };
  }

  const spec = meeting.implementationSpec;
  const progress = spec.completionPercentage || 0;

  // Minimum 90% spec completion required
  if (progress < 90) {
    reasons.push(`יש להשלים לפחות 90% ממפרט היישום (נוכחי: ${progress}%)`);
    requiredActions.push('השלם את מפרט היישום');
  }

  // At least one system spec required
  if (!spec.systems || spec.systems.length === 0) {
    reasons.push('יש להגדיר לפחות מערכת אחת במפרט');
    requiredActions.push('הוסף מפרט מערכת');
  }

  // Acceptance criteria required
  if (!spec.acceptanceCriteria) {
    reasons.push('יש להגדיר קריטריוני קבלה');
    requiredActions.push('הגדר קריטריוני קבלה');
  }

  // Team members should be assigned
  if (!meeting.developmentTracking?.teamMembers || meeting.developmentTracking.teamMembers.length === 0) {
    reasons.push('מומלץ להקצות חברי צוות לפני תחילת הפיתוח');
    requiredActions.push('הקצה חברי צוות');
  }

  return {
    canTransition: reasons.length === 0,
    reasons,
    requiredActions,
    progress
  };
};

/**
 * Validate transition from Development to Completed
 */
export const validateDevelopmentToCompleted = (
  meeting: Meeting
): PhaseTransitionValidation => {
  const reasons: string[] = [];
  const requiredActions: string[] = [];

  // Check if development tracking exists
  if (!meeting.developmentTracking) {
    reasons.push('לא נמצא מעקב פיתוח');
    requiredActions.push('התחל מעקב פיתוח');
    return {
      canTransition: false,
      reasons,
      requiredActions,
      progress: 0
    };
  }

  const dev = meeting.developmentTracking;
  const tasks = dev.tasks || [];

  if (tasks.length === 0) {
    reasons.push('לא נמצאו משימות פיתוח');
    requiredActions.push('צור משימות פיתוח');
    return {
      canTransition: false,
      reasons,
      requiredActions,
      progress: 0
    };
  }

  // All tasks must be completed
  const incompleteTasks = tasks.filter(t => t.status !== 'done');
  const progress = Math.round(((tasks.length - incompleteTasks.length) / tasks.length) * 100);

  if (incompleteTasks.length > 0) {
    reasons.push(`יש ${incompleteTasks.length} משימות שטרם הושלמו`);
    requiredActions.push('השלם את כל המשימות');
  }

  // No unresolved blockers
  const blockers = dev.blockers || [];
  const unresolvedBlockers = blockers.filter(b => b.status !== 'resolved');
  if (unresolvedBlockers.length > 0) {
    reasons.push(`יש ${unresolvedBlockers.length} חסמים שטרם נפתרו`);
    requiredActions.push('פתר את כל החסמים');
  }

  return {
    canTransition: reasons.length === 0,
    reasons,
    requiredActions,
    progress
  };
};

/**
 * Master phase transition validator
 */
export const validatePhaseTransition = (
  meeting: Meeting,
  targetPhase: MeetingPhase
): PhaseTransitionValidation => {
  const currentPhase = meeting.phase;

  // Validate transition logic based on phases
  if (currentPhase === 'discovery' && targetPhase === 'implementation_spec') {
    return validateDiscoveryToImplementationSpec(meeting);
  }

  if (currentPhase === 'implementation_spec' && targetPhase === 'development') {
    return validateImplementationSpecToDevelopment(meeting);
  }

  if (currentPhase === 'development' && targetPhase === 'completed') {
    return validateDevelopmentToCompleted(meeting);
  }

  // Invalid transition
  return {
    canTransition: false,
    reasons: [`לא ניתן לעבור מ-${currentPhase} ל-${targetPhase}`],
    requiredActions: [],
    progress: 0
  };
};

// ============================================================================
// WIZARD STEP VALIDATION
// ============================================================================

/**
 * Validate a wizard step's required fields
 */
export const validateWizardStep = (
  step: WizardStep,
  moduleData: any
): ValidationGuardResult => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check each field in the step
  for (const field of step.fields) {
    const isRequired = field.props?.required;
    const fieldValue = moduleData?.[field.name];

    if (isRequired) {
      // Check if field is empty
      const isEmpty =
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0);

      if (isEmpty) {
        missingFields.push(field.props?.label || field.name);
      }
    }
  }

  return {
    canProceed: missingFields.length === 0,
    reasons: missingFields.length > 0
      ? [`יש למלא את השדות הבאים: ${missingFields.join(', ')}`]
      : [],
    missingFields,
    warnings: step.isOptional ? ['סעיף זה הוא אופציונלי'] : []
  };
};

/**
 * Validate wizard section completion
 */
export const validateWizardSection = (
  sectionId: string,
  meeting: Meeting
): ValidationGuardResult => {
  const sectionSteps = WIZARD_STEPS.filter(step => step.moduleId === sectionId);
  const allMissingFields: string[] = [];
  const allReasons: string[] = [];

  for (const step of sectionSteps) {
    const moduleData = meeting.modules[step.moduleId as keyof typeof meeting.modules];
    const validation = validateWizardStep(step, moduleData);

    if (!validation.canProceed) {
      allMissingFields.push(...(validation.missingFields || []));
      allReasons.push(...validation.reasons);
    }
  }

  return {
    canProceed: allMissingFields.length === 0,
    reasons: allReasons,
    missingFields: allMissingFields
  };
};

// ============================================================================
// NAVIGATION GUARDS
// ============================================================================

/**
 * Check if user can leave page with unsaved changes
 */
export const validateNavigationWithUnsavedChanges = (
  isDirty: boolean,
  language: 'he' | 'en' = 'he'
): ValidationGuardResult => {
  if (!isDirty) {
    return {
      canProceed: true,
      reasons: []
    };
  }

  return {
    canProceed: false,
    reasons: [
      language === 'he'
        ? 'יש שינויים שלא נשמרו'
        : 'You have unsaved changes'
    ],
    warnings: [
      language === 'he'
        ? 'השינויים יאבדו אם תצא מהעמוד'
        : 'Changes will be lost if you leave this page'
    ]
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  validateOverviewModule,
  validateLeadsAndSalesModule,
  validateCustomerServiceModule,
  validateSystemsModule,
  validateROIModule,
  validateProposalModule,
  validateAllModules,
  validatePhaseTransition,
  validateDiscoveryToImplementationSpec,
  validateImplementationSpecToDevelopment,
  validateDevelopmentToCompleted,
  validateWizardStep,
  validateWizardSection,
  validateNavigationWithUnsavedChanges
};
