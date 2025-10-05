/**
 * Progress Tracking Types
 *
 * Type definitions for tracking progress across modules, phases, and tasks.
 * Integrates with existing Meeting and MeetingPhase types.
 *
 * @module types/progress
 */

import { MeetingPhase } from './index';

// ============================================================================
// MODULE PROGRESS
// ============================================================================

/**
 * Progress tracking for a single module field
 */
export interface FieldProgress {
  /** Field identifier */
  fieldId: string;

  /** Field name */
  fieldName: string;

  /** Is field completed? */
  completed: boolean;

  /** Is field required? */
  required: boolean;

  /** Field value (for validation) */
  value?: any;

  /** Validation error if any */
  error?: string;
}

/**
 * Progress tracking for a module section
 */
export interface SectionProgress {
  /** Section identifier */
  sectionId: string;

  /** Section name */
  sectionName: string;

  /** Total fields in section */
  totalFields: number;

  /** Completed fields count */
  completedFields: number;

  /** Required fields count */
  requiredFields: number;

  /** Completed required fields count */
  completedRequiredFields: number;

  /** Completion percentage */
  percentage: number;

  /** Are all required fields completed? */
  requiredFieldsCompleted: boolean;

  /** Field-level progress */
  fields?: FieldProgress[];
}

/**
 * Progress tracking for a discovery module (Phase 1)
 *
 * @example
 * ```typescript
 * const moduleProgress: ModuleProgress = {
 *   moduleId: 'leadsAndSales',
 *   moduleName: 'Leads and Sales',
 *   hebrewName: 'לידים ומכירות',
 *   totalFields: 20,
 *   completedFields: 15,
 *   requiredFields: 10,
 *   completedRequiredFields: 10,
 *   percentage: 75,
 *   requiredFieldsCompleted: true,
 *   sections: [...]
 * };
 * ```
 */
export interface ModuleProgress {
  /** Module identifier */
  moduleId: string;

  /** Module name (English) */
  moduleName: string;

  /** Module name (Hebrew) */
  hebrewName: string;

  /** Total fields in module */
  totalFields: number;

  /** Completed fields count */
  completedFields: number;

  /** Required fields count */
  requiredFields: number;

  /** Completed required fields count */
  completedRequiredFields: number;

  /** Overall completion percentage */
  percentage: number;

  /** Are all required fields completed? */
  requiredFieldsCompleted: boolean;

  /** Section-level progress breakdown */
  sections?: SectionProgress[];

  /** Last updated timestamp */
  lastUpdated?: Date;

  /** Estimated time to complete (minutes) */
  estimatedTimeRemaining?: number;
}

// ============================================================================
// PHASE PROGRESS
// ============================================================================

/**
 * Progress tracking for an entire phase
 *
 * @example
 * ```typescript
 * const phaseProgress: PhaseProgress = {
 *   phase: 'discovery',
 *   modules: [...],
 *   totalModules: 9,
 *   completedModules: 7,
 *   overallPercentage: 78,
 *   requiredModulesCompleted: true,
 *   canProgress: true
 * };
 * ```
 */
export interface PhaseProgress {
  /** Current phase */
  phase: MeetingPhase;

  /** Module progress array */
  modules: ModuleProgress[];

  /** Total modules in phase */
  totalModules: number;

  /** Fully completed modules count */
  completedModules: number;

  /** Overall phase completion percentage */
  overallPercentage: number;

  /** Are all required modules completed? */
  requiredModulesCompleted: boolean;

  /** Can user progress to next phase? */
  canProgress: boolean;

  /** Blockers preventing progression */
  blockers?: string[];

  /** Phase start date */
  startedAt?: Date;

  /** Phase completion date */
  completedAt?: Date;

  /** Estimated completion date */
  estimatedCompletion?: Date;

  /** Total estimated hours */
  estimatedHours?: number;

  /** Actual hours spent */
  actualHours?: number;
}

// ============================================================================
// OVERALL PROGRESS
// ============================================================================

/**
 * Overall project progress across all phases
 *
 * @example
 * ```typescript
 * const overallProgress: OverallProgress = {
 *   currentPhase: 'implementation_spec',
 *   phases: [
 *     { phase: 'discovery', overallPercentage: 100, ... },
 *     { phase: 'implementation_spec', overallPercentage: 45, ... }
 *   ],
 *   totalPercentage: 48,
 *   phasesCompleted: 1,
 *   totalPhases: 3
 * };
 * ```
 */
export interface OverallProgress {
  /** Current active phase */
  currentPhase: MeetingPhase;

  /** Progress for each phase */
  phases: PhaseProgress[];

  /** Overall project completion percentage */
  totalPercentage: number;

  /** Number of completed phases */
  phasesCompleted: number;

  /** Total number of phases */
  totalPhases: number;

  /** Project start date */
  projectStartDate?: Date;

  /** Projected completion date */
  projectedCompletion?: Date;

  /** Is project on track? */
  onTrack?: boolean;

  /** Risk level */
  riskLevel?: 'low' | 'medium' | 'high';
}

// ============================================================================
// WIZARD PROGRESS (Phase 1)
// ============================================================================

/**
 * Progress tracking for wizard flow
 */
export interface WizardStepProgress {
  /** Step identifier */
  stepId: string;

  /** Step number (1-based) */
  stepNumber: number;

  /** Step title */
  title: string;

  /** Is step completed? */
  completed: boolean;

  /** Is step current? */
  current: boolean;

  /** Is step available? */
  available: boolean;

  /** Step completion percentage */
  percentage: number;

  /** Required fields in step */
  requiredFields: number;

  /** Completed required fields */
  completedRequiredFields: number;
}

/**
 * Overall wizard progress
 */
export interface WizardProgress {
  /** Current step index (0-based) */
  currentStep: number;

  /** Total steps */
  totalSteps: number;

  /** Completed steps count */
  completedSteps: number;

  /** Overall wizard percentage */
  percentage: number;

  /** Step-level progress */
  steps: WizardStepProgress[];

  /** Can complete wizard? */
  canComplete: boolean;

  /** Incomplete required steps */
  incompleteRequiredSteps: string[];
}

// ============================================================================
// PHASE 2 PROGRESS (Implementation Spec)
// ============================================================================

/**
 * Progress for a system specification
 */
export interface SystemSpecProgress {
  /** System ID */
  systemId: string;

  /** System name */
  systemName: string;

  /** Total specification sections */
  totalSections: number;

  /** Completed sections */
  completedSections: number;

  /** Completion percentage */
  percentage: number;

  /** Required sections incomplete */
  requiredIncomplete: string[];

  /** Is specification complete? */
  isComplete: boolean;

  /** Estimated hours for implementation */
  estimatedHours?: number;
}

/**
 * Progress for an integration flow
 */
export interface IntegrationFlowProgress {
  /** Flow ID */
  flowId: string;

  /** Flow name */
  flowName: string;

  /** Total configuration steps */
  totalSteps: number;

  /** Completed steps */
  completedSteps: number;

  /** Completion percentage */
  percentage: number;

  /** Is flow complete? */
  isComplete: boolean;

  /** Testing status */
  testingStatus?: 'not_started' | 'in_progress' | 'passed' | 'failed';
}

/**
 * Progress for AI agent specification
 */
export interface AIAgentSpecProgress {
  /** Agent ID */
  agentId: string;

  /** Agent name */
  agentName: string;

  /** Total specification sections */
  totalSections: number;

  /** Completed sections */
  completedSections: number;

  /** Completion percentage */
  percentage: number;

  /** Training data status */
  trainingDataStatus?: 'not_started' | 'in_progress' | 'complete';

  /** Is specification complete? */
  isComplete: boolean;
}

/**
 * Overall Phase 2 progress
 */
export interface Phase2Progress {
  /** System specifications progress */
  systems: SystemSpecProgress[];

  /** Integration flows progress */
  integrations: IntegrationFlowProgress[];

  /** AI agents progress */
  aiAgents: AIAgentSpecProgress[];

  /** Acceptance criteria completed? */
  acceptanceCriteriaComplete: boolean;

  /** Overall Phase 2 percentage */
  overallPercentage: number;

  /** Total estimated implementation hours */
  totalEstimatedHours: number;

  /** Can transition to development? */
  canTransitionToDevelopment: boolean;

  /** Blockers */
  blockers?: string[];
}

// ============================================================================
// PHASE 3 PROGRESS (Development)
// ============================================================================

/**
 * Sprint progress tracking
 */
export interface SprintProgress {
  /** Sprint ID */
  sprintId: string;

  /** Sprint name */
  sprintName: string;

  /** Total tasks in sprint */
  totalTasks: number;

  /** Completed tasks */
  completedTasks: number;

  /** In-progress tasks */
  inProgressTasks: number;

  /** Blocked tasks */
  blockedTasks: number;

  /** Completion percentage */
  percentage: number;

  /** Total estimated hours */
  estimatedHours: number;

  /** Actual hours spent */
  actualHours: number;

  /** Is sprint on track? */
  onTrack: boolean;

  /** Velocity (story points per day) */
  velocity?: number;

  /** Sprint start date */
  startDate: Date;

  /** Sprint end date */
  endDate: Date;

  /** Days remaining */
  daysRemaining: number;
}

/**
 * Task progress metrics
 */
export interface TaskProgressMetrics {
  /** Total tasks */
  total: number;

  /** Completed tasks */
  completed: number;

  /** In progress tasks */
  inProgress: number;

  /** Blocked tasks */
  blocked: number;

  /** Not started tasks */
  notStarted: number;

  /** Completion percentage */
  percentage: number;

  /** Total estimated hours */
  estimatedHours: number;

  /** Actual hours spent */
  actualHours: number;

  /** Hours remaining */
  remainingHours: number;

  /** Average completion time per task */
  averageCompletionTime?: number;
}

/**
 * Overall Phase 3 progress
 */
export interface Phase3Progress {
  /** Current sprint progress */
  currentSprint?: SprintProgress;

  /** All sprints progress */
  sprints: SprintProgress[];

  /** Overall task metrics */
  taskMetrics: TaskProgressMetrics;

  /** Progress by system */
  systemProgress: Array<{
    systemId: string;
    systemName: string;
    percentage: number;
    tasksCompleted: number;
    totalTasks: number;
  }>;

  /** Active blockers count */
  activeBlockers: number;

  /** Overall Phase 3 percentage */
  overallPercentage: number;

  /** Team velocity */
  teamVelocity?: {
    current: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };

  /** Estimated completion date */
  estimatedCompletion?: Date;

  /** Is on schedule? */
  onSchedule: boolean;
}

// ============================================================================
// PROGRESS CALCULATION HELPERS
// ============================================================================

/**
 * Progress calculation options
 */
export interface ProgressCalculationOptions {
  /** Include optional fields in calculation? */
  includeOptional?: boolean;

  /** Weight required fields more heavily? */
  weightRequired?: number;

  /** Minimum percentage to consider "complete" */
  completionThreshold?: number;

  /** Count empty arrays as incomplete? */
  strictArrayValidation?: boolean;
}

/**
 * Progress update event
 */
export interface ProgressUpdateEvent {
  /** Entity type being updated */
  entityType: 'module' | 'phase' | 'sprint' | 'task';

  /** Entity ID */
  entityId: string;

  /** Old percentage */
  oldPercentage: number;

  /** New percentage */
  newPercentage: number;

  /** Change amount */
  change: number;

  /** Timestamp */
  timestamp: Date;

  /** Update source */
  source: 'user' | 'auto-save' | 'sync' | 'import';
}

/**
 * Progress milestone
 */
export interface ProgressMilestone {
  /** Milestone ID */
  id: string;

  /** Milestone name */
  name: string;

  /** Description */
  description?: string;

  /** Target percentage */
  targetPercentage: number;

  /** Is achieved? */
  achieved: boolean;

  /** Achievement date */
  achievedAt?: Date;

  /** Associated phase */
  phase?: MeetingPhase;

  /** Reward/badge */
  reward?: {
    icon: string;
    title: string;
    description: string;
  };
}

/**
 * Progress analytics
 */
export interface ProgressAnalytics {
  /** Completion velocity (percentage per day) */
  velocity: number;

  /** Estimated days to completion */
  estimatedDaysToCompletion: number;

  /** Projected completion date */
  projectedCompletionDate: Date;

  /** Daily progress trend */
  trend: 'accelerating' | 'steady' | 'decelerating';

  /** Productivity score (0-100) */
  productivityScore: number;

  /** Bottleneck modules/phases */
  bottlenecks: Array<{
    id: string;
    name: string;
    type: 'module' | 'phase' | 'sprint';
    percentage: number;
    blockers: string[];
  }>;

  /** Progress history (last 30 days) */
  history: Array<{
    date: Date;
    percentage: number;
  }>;
}
