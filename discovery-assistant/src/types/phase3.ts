/**
 * Phase 3: Development Tracking Types
 *
 * These types define the task management and progress tracking system
 * for the development team.
 */

// ============================================================================
// DEVELOPMENT TASKS
// ============================================================================

export interface DevelopmentTask {
  id: string;
  meetingId: string;
  title: string;
  description: string;

  // Task Classification
  type: 'integration' | 'ai_agent' | 'workflow' | 'migration' | 'testing' | 'deployment' | 'documentation' | 'bug_fix' | 'enhancement';

  // Context from Phase 2
  relatedSpec: {
    type: 'system' | 'integration_flow' | 'ai_agent' | 'acceptance_criteria';
    specId: string;
    specName: string;
  };

  // Task Management
  status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';
  assignedTo?: string;
  estimatedHours: number;
  actualHours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  sprint?: string;
  sprintNumber?: number;

  // Dependencies
  dependencies: string[]; // Task IDs this task depends on
  blockedBy?: string;
  blockingReason?: string;
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

export interface Sprint {
  id: string;
  meetingId: string;
  sprintNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed';

  // Sprint Planning
  goals: string[];
  tasks: string[]; // Task IDs
  totalEstimatedHours: number;

  // Sprint Progress
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
  velocity: number; // Tasks completed per sprint

  // Sprint Review
  accomplishments?: string[];
  challenges?: string[];
  retrospectiveNotes?: string;
}

// ============================================================================
// PROJECT PROGRESS TRACKING
// ============================================================================

export interface ProjectProgress {
  meetingId: string;

  // Overall Progress
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;

  // By Category
  byType: {
    integration: { total: number; done: number; inProgress: number };
    ai_agent: { total: number; done: number; inProgress: number };
    workflow: { total: number; done: number; inProgress: number };
    testing: { total: number; done: number; inProgress: number };
    deployment: { total: number; done: number; inProgress: number };
  };

  // By System
  bySystem: {
    systemName: string;
    systemId: string;
    total: number;
    done: number;
    progressPercentage: number;
  }[];

  // Timeline
  estimatedCompletion: Date;
  hoursEstimated: number;
  hoursActual: number;
  hoursRemaining: number;
  onTrack: boolean;
  daysOverdue?: number;

  // Health Indicators
  projectHealth: 'on_track' | 'at_risk' | 'behind_schedule' | 'blocked';
  healthReasons: string[];

  // Blockers
  activeBlockers: number;
  blockersList: DevelopmentTask[];
  criticalBlockers: number;

  // Sprint Progress
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

export interface TeamMember {
  name: string;
  email?: string;
  role: string;
  assignedTasks: number;
  completedTasks: number;
  tasksInProgress: number;
  blockedTasks: number;
  totalHoursEstimated: number;
  totalHoursActual: number;
  utilizationPercentage: number;
  availableForNewTasks: boolean;
}

// ============================================================================
// BLOCKER MANAGEMENT
// ============================================================================

export interface Blocker {
  id: string;
  taskId: string;
  taskTitle: string;
  blockerType: 'technical' | 'dependency' | 'resource' | 'approval' | 'external' | 'unclear_requirements';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedAt: Date;
  status: 'open' | 'in_progress' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  blockedTasks: string[]; // Other task IDs blocked by this
}

// ============================================================================
// DEVELOPMENT TRACKING CONTAINER
// ============================================================================

export interface DevelopmentTrackingData {
  meetingId: string;
  tasks: DevelopmentTask[];
  sprints: Sprint[];
  progress: ProjectProgress;
  blockers: Blocker[];

  // Settings
  defaultSprintDuration: number; // days
  hoursPerDay: number; // for calculations
  workingDaysPerWeek: number;

  // Audit
  tasksGenerated: boolean;
  tasksGeneratedAt?: Date;
  tasksGeneratedBy?: string;
  lastUpdated: Date;
  lastSyncToZoho?: Date;
}

// ============================================================================
// TASK GENERATION TEMPLATES
// ============================================================================

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

export interface TaskGenerationRule {
  sourceType: 'system' | 'integration_flow' | 'ai_agent' | 'acceptance_criteria';
  templates: TaskTemplate[];
  customRules?: (sourceData: any) => DevelopmentTask[];
}

// ============================================================================
// EXPORTS & REPORTING
// ============================================================================

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
// EXPORT FORMATS
// ============================================================================

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
