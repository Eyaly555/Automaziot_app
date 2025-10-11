/**
 * Phase 3: Development Tracking Types
 *
 * These types define the task management and progress tracking system
 * for the development team during the implementation phase.
 *
 * Updated to match actual component usage in:
 * - ProgressTracking.tsx
 * - SystemView.tsx
 * - SprintView.tsx
 * - DeveloperDashboard.tsx
 * - BlockerManagement.tsx
 */

// ============================================================================
// DEVELOPMENT TASKS
// ============================================================================

/**
 * Represents a single development task derived from Phase 2 specifications.
 * Tasks are the atomic unit of work tracked in Phase 3.
 *
 * @example
 * {
 *   id: 'task_1',
 *   meetingId: 'meeting_123',
 *   title: 'Implement Zoho CRM authentication',
 *   status: 'in_progress',
 *   priority: 'high',
 *   estimatedHours: 8,
 *   actualHours: 5,
 *   sprint: 'Sprint 1',
 *   sprintId: 'sprint_1',
 *   system: 'Zoho CRM',
 *   assignedTo: 'john@example.com'
 * }
 */
export interface DevelopmentTask {
  // Basic Identification
  id: string;
  meetingId: string;
  title: string;
  description: string;

  // Task Classification
  type: 'integration' | 'ai_agent' | 'workflow' | 'migration' | 'testing' | 'deployment' | 'documentation' | 'bug_fix' | 'enhancement' | 'service_implementation' | 'system_implementation' | 'additional_service';

  // Context from Phase 2
  relatedSpec: {
    type: 'system' | 'integration_flow' | 'ai_agent' | 'acceptance_criteria' | 'service';
    specId: string;
    specName: string;
  };

  // Task Management
  /**
   * Current task status
   * - todo: Not started
   * - in_progress: Currently being worked on
   * - in_review: Code review or testing
   * - blocked: Cannot proceed due to blocker
   * - done: Completed and verified
   */
  status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';

  /**
   * Task priority level
   * - critical: Must be done immediately, blocks other work
   * - high: Important, should be done soon
   * - medium: Normal priority
   * - low: Nice to have, can be deferred
   */
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Assignment
  assignedTo?: string; // Email or name of assignee

  // Time Tracking
  estimatedHours: number; // Initial estimate in hours
  actualHours: number; // Actual time spent so far

  // Sprint Assignment
  /**
   * Sprint name (human-readable)
   * @example "Sprint 1", "Phase 1 - Foundation"
   */
  sprint?: string;

  /**
   * Sprint ID for programmatic reference
   * @example "sprint_1"
   */
  sprintId?: string;

  /**
   * Sprint number for ordering
   * @example 1, 2, 3
   */
  sprintNumber?: number;

  /**
   * System name from Phase 2 (for filtering and grouping)
   * @example "Zoho CRM", "n8n", "Google Calendar"
   */
  system?: string;

  // Dependencies
  dependencies: string[]; // Task IDs this task depends on
  blockedBy?: string; // Blocker ID if task is blocked
  blockingReason?: string; // Why this task is blocked
  blocksOtherTasks: string[]; // Task IDs that depend on this task

  // Testing
  testingRequired: boolean;
  testCases: TaskTestCase[];
  testStatus: 'not_started' | 'in_progress' | 'passed' | 'failed';

  // Technical Details
  technicalNotes: string;
  codeRepository?: string;
  branchName?: string;
  pullRequestUrl?: string;
  deploymentNotes?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  completedAt?: Date;
  completedBy?: string;
}

/**
 * Test case for a development task
 */
export interface TaskTestCase {
  id: string;
  description: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  passed: boolean;
  testedBy?: string;
  testedAt?: Date;
}

// ============================================================================
// SPRINT MANAGEMENT
// ============================================================================

/**
 * Represents a sprint/iteration in the development process.
 * Sprints group tasks into time-boxed work periods.
 *
 * @example
 * {
 *   id: 'sprint_1',
 *   sprintId: 'sprint_1',
 *   name: 'Sprint 1 - Foundation',
 *   sprintNumber: 1,
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-14'),
 *   status: 'active',
 *   goal: 'Set up core infrastructure and authentication',
 *   plannedCapacity: 80,
 *   actualVelocity: 65
 * }
 */
export interface Sprint {
  // Identification
  id: string;

  /**
   * Unique sprint identifier for programmatic reference
   * @example "sprint_1", "sprint_2"
   */
  sprintId?: string;

  meetingId: string;

  /**
   * Sprint number for ordering and display
   * @example 1, 2, 3
   */
  sprintNumber: number;

  /**
   * Human-readable sprint name
   * @example "Sprint 1 - Foundation", "Phase 1"
   */
  name: string;

  // Sprint Timeline
  startDate: Date;
  endDate: Date;

  /**
   * Sprint status
   * - planned: Not yet started, in planning phase
   * - active: Currently in progress
   * - completed: Sprint finished, in review/retrospective
   */
  status: 'planned' | 'active' | 'completed';

  // Sprint Planning
  /**
   * Sprint goal - what the team aims to accomplish
   * @example "Implement core CRM integration and authentication"
   */
  goal: string;

  goals?: string[]; // Alternative: multiple goals
  tasks?: string[]; // Task IDs (alternative to sprint property on tasks)

  /**
   * Total estimated hours available for the sprint
   * Usually: team size × hours per day × working days
   * @example 80 (2 devs × 8h × 5 days)
   */
  totalEstimatedHours?: number;

  /**
   * Planned team capacity in hours or story points
   */
  plannedCapacity?: number;

  // Sprint Progress
  completedTasks?: number; // Number of tasks completed
  totalTasks?: number; // Total tasks in sprint
  progressPercentage?: number; // 0-100

  /**
   * Sprint velocity - measure of work completed
   * Can be story points, tasks, or hours completed
   */
  velocity?: number;

  /**
   * Actual velocity achieved in this sprint
   * Used for future sprint planning
   */
  actualVelocity?: number;

  // Sprint Review & Retrospective
  accomplishments?: string[]; // What was achieved
  challenges?: string[]; // What went wrong
  retrospectiveNotes?: string; // General notes from retrospective

  /**
   * Retrospective data for continuous improvement
   */
  retrospective?: {
    whatWentWell: string[];
    whatToImprove: string[];
    actionItems: string[];
    attendees?: string[];
  };

  /**
   * Burndown chart data points
   * Tracks remaining work over time
   */
  metrics?: {
    burndownData?: Array<{
      date: string;
      remaining: number;
      ideal: number;
      actual?: number;
    }>;
    velocityTrend?: number[]; // Historical velocity
    completionRate?: number; // Percentage of planned work completed
  };
}

// ============================================================================
// PROJECT PROGRESS TRACKING
// ============================================================================

/**
 * Overall project progress metrics
 * Used in DeveloperDashboard for high-level overview
 */
export interface ProjectProgress {
  meetingId: string;

  // Overall Progress
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number; // 0-100

  // By Category/Type
  byType: {
    integration: { total: number; done: number; inProgress: number };
    ai_agent: { total: number; done: number; inProgress: number };
    workflow: { total: number; done: number; inProgress: number };
    testing: { total: number; done: number; inProgress: number };
    deployment: { total: number; done: number; inProgress: number };
  };

  // By System (from Phase 2)
  bySystem: {
    systemName: string;
    systemId: string;
    total: number;
    done: number;
    progressPercentage: number;
  }[];

  // Timeline Estimates
  estimatedCompletion: Date; // Projected completion date
  hoursEstimated: number; // Total estimated hours
  hoursActual: number; // Actual hours spent so far
  hoursRemaining: number; // Remaining estimated hours
  onTrack: boolean; // Is project on schedule?
  daysOverdue?: number; // Days behind schedule (if applicable)

  // Health Indicators
  /**
   * Overall project health status
   * - on_track: Meeting deadlines, no major issues
   * - at_risk: Some concerns, needs attention
   * - behind_schedule: Falling behind, requires intervention
   * - blocked: Critical blockers preventing progress
   */
  projectHealth: 'on_track' | 'at_risk' | 'behind_schedule' | 'blocked';
  healthReasons: string[]; // Reasons for health status

  // Blockers
  activeBlockers: number; // Count of active blockers
  blockersList: DevelopmentTask[]; // Tasks that are blocked
  criticalBlockers: number; // Count of critical blockers

  // Current Sprint Progress
  currentSprint?: {
    name: string;
    sprintNumber: number;
    startDate: Date;
    endDate: Date;
    completedTasks: number;
    totalTasks: number;
    velocity: number;
    onTrackForCompletion: boolean;
  };

  // Team Metrics
  teamUtilization: TeamMember[];
}

/**
 * Team member utilization and task assignment
 * Used for workload balancing and capacity planning
 */
export interface TeamMember {
  name: string;
  email?: string;
  role: string; // e.g., "Frontend Developer", "Backend Developer"

  // Task Counts
  assignedTasks: number;
  completedTasks: number;
  tasksInProgress: number;
  blockedTasks: number;

  // Time Tracking
  totalHoursEstimated: number;
  totalHoursActual: number;
  utilizationPercentage: number; // 0-100, indicates workload
  availableForNewTasks: boolean; // Can take on more work?
}

// ============================================================================
// BLOCKER MANAGEMENT
// ============================================================================

/**
 * Represents a blocker preventing task progress
 * Used in BlockerManagement component
 *
 * @example
 * {
 *   id: 'blocker_1',
 *   taskId: 'task_5',
 *   taskTitle: 'Implement Zoho OAuth',
 *   blockerType: 'technical',
 *   severity: 'critical',
 *   description: 'Zoho API credentials not yet provided',
 *   reportedBy: 'dev@example.com',
 *   createdAt: new Date(),
 *   resolved: false,
 *   status: 'open'
 * }
 */
export interface Blocker {
  // Identification
  id: string;
  taskId: string; // Task being blocked
  taskTitle: string; // For display purposes

  /**
   * Type of blocker
   * - technical: Code/architecture issue
   * - dependency: Waiting on another task/team
   * - resource: Missing resources (credentials, servers, etc.)
   * - approval: Waiting for decision/approval
   * - external: Third-party dependency
   * - unclear_requirements: Need clarification
   */
  blockerType: 'technical' | 'dependency' | 'resource' | 'approval' | 'external' | 'unclear_requirements';

  description: string;

  /**
   * Severity/impact of blocker
   * - critical: Blocks sprint goal, needs immediate attention
   * - high: Blocks multiple tasks
   * - medium: Blocks one task
   * - low: Minor inconvenience
   */
  severity: 'critical' | 'high' | 'medium' | 'low';

  /**
   * Impact on project
   */
  impact?: 'blocks_sprint' | 'delays_task' | 'reduces_quality' | 'increases_risk';

  // Reporting
  reportedBy: string; // Who reported the blocker
  createdAt?: Date; // When blocker was identified (alias for reportedAt)
  reportedAt?: Date; // When blocker was reported (legacy)

  // Status
  /**
   * Blocker status
   * - open: Not yet being addressed
   * - in_progress: Being worked on
   * - resolved: Blocker removed
   * - escalated: Escalated to management/client
   */
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';

  /**
   * Simple boolean indicating if blocker is resolved
   * Used in BlockerManagement component
   */
  resolved?: boolean;

  // Resolution
  resolvedBy?: string; // Who resolved it
  resolvedAt?: Date; // When it was resolved
  resolution?: string; // How it was resolved

  /**
   * Temporary workaround while blocker is being resolved
   */
  workaround?: string;

  // Additional Context
  blockedTasks?: string[]; // Other task IDs also blocked
  blockedSprints?: string[]; // Sprint IDs affected
  owner?: string; // Person responsible for resolving

  /**
   * Escalation details if blocker requires management intervention
   */
  escalation?: {
    level: 'team' | 'management' | 'client' | 'vendor';
    escalatedDate: string;
    escalatedTo?: string;
  };
}

// ============================================================================
// DEVELOPMENT TRACKING CONTAINER
// ============================================================================

/**
 * Main container for all Phase 3 development tracking data
 * Stored in meeting.developmentTracking
 */
export interface DevelopmentTrackingData {
  meetingId: string;

  // Core Data
  tasks: DevelopmentTask[];
  sprints: Sprint[];
  progress: ProjectProgress;
  blockers: Blocker[];

  // Settings
  defaultSprintDuration: number; // days (e.g., 14 for 2 weeks)
  hoursPerDay: number; // for calculations (e.g., 8)
  workingDaysPerWeek: number; // for calculations (e.g., 5)

  // Audit
  tasksGenerated: boolean; // Whether tasks were auto-generated from Phase 2
  tasksGeneratedAt?: Date;
  tasksGeneratedBy?: string;
  lastUpdated: Date;
  lastSyncToZoho?: Date;
}

// ============================================================================
// TASK GENERATION TEMPLATES
// ============================================================================

/**
 * Template for generating tasks from Phase 2 specifications
 * Used by taskGenerator utility
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: DevelopmentTask['type'];
  estimatedHours: number;
  priority: DevelopmentTask['priority'];
  testingRequired: boolean;
  dependencies: string[]; // Template IDs
  checklistItems: string[];
}

/**
 * Rules for generating tasks from different Phase 2 spec types
 */
export interface TaskGenerationRule {
  sourceType: 'system' | 'integration_flow' | 'ai_agent' | 'acceptance_criteria';
  templates: TaskTemplate[];
  customRules?: (sourceData: any) => DevelopmentTask[];
}

// ============================================================================
// EXPORTS & REPORTING
// ============================================================================

/**
 * Developer report for export/viewing
 * Used for generating progress reports
 */
export interface DeveloperReport {
  meetingId: string;
  clientName: string;
  generatedAt: Date;
  projectPhase: string;
  projectStatus: string;

  // Executive Summary
  summary: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    estimatedCompletion: Date;
    projectHealth: string;
    criticalBlockers: number;
  };

  // Detailed Sections
  taskBreakdown: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };

  sprints: {
    sprintNumber: number;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
    completedTasks: number;
    totalTasks: number;
  }[];

  blockers: {
    id: string;
    taskTitle: string;
    blockerType: string;
    description: string;
    impact: string;
    reportedAt: Date;
    status: string;
  }[];

  timeline: {
    hoursEstimated: number;
    hoursActual: number;
    hoursRemaining: number;
    onTrack: boolean;
  };
}

// ============================================================================
// EXPORT FORMATS (Jira, GitHub, etc.)
// ============================================================================

/**
 * Export format for Jira
 */
export interface JiraExport {
  issues: JiraIssue[];
}

export interface JiraIssue {
  summary: string; // Task title
  description: string;
  issueType: 'Task' | 'Bug' | 'Story' | 'Epic';
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  assignee?: string;
  labels: string[];
  estimateHours: number;
  dueDate?: string;
  customFields?: Record<string, any>;
}

/**
 * Export format for GitHub Issues
 */
export interface GitHubIssueExport {
  issues: GitHubIssue[];
}

export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  milestone?: string;
}

// ============================================================================
// VELOCITY & METRICS
// ============================================================================

/**
 * Team velocity metrics for sprint planning
 */
export interface VelocityMetrics {
  teamId?: string;
  sprintId: string;
  sprintNumber: number;

  // Velocity Measures
  plannedVelocity: number; // What was planned
  actualVelocity: number; // What was achieved

  // Historical Data
  averageVelocity: number; // Average over last N sprints
  velocityTrend: 'increasing' | 'stable' | 'decreasing';

  // Predictability
  commitmentReliability: number; // % of committed work completed (0-100)
}

/**
 * System-specific progress for SystemView component
 */
export interface SystemProgress {
  systemId: string;
  systemName: string;

  // Tasks
  tasks: DevelopmentTask[];
  totalTasks: number;
  completedTasks: number;

  // Progress
  progress: number; // 0-100

  /**
   * System status
   * - not_started: No work done
   * - in_progress: Work ongoing
   * - testing: In testing phase
   * - completed: All tasks done
   * - blocked: One or more critical blockers
   */
  status: 'not_started' | 'in_progress' | 'testing' | 'completed' | 'blocked';

  // Blockers
  blockers?: Blocker[];

  // Integrations
  integrations?: Array<{
    integrationId: string;
    status: string;
    progress: number;
  }>;
}
