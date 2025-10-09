// Main types for Discovery Assistant application

// ============================================================================
// NEW UX SYSTEM TYPES (Design System, Forms, Navigation, Feedback, Progress)
// ============================================================================

// Re-export design system types
export * from './design-system';

// Re-export form types
export * from './forms';

// Re-export navigation types
export * from './navigation';

// Re-export feedback types
export * from './feedback';

// Re-export progress types
export * from './progress';

// ============================================================================
// EXISTING MODULE TYPES
// ============================================================================

// Re-export proposal types
export * from './proposal';

// Re-export service requirements types
export * from './serviceRequirements';

// ============================================================================
// PHASE 2 SERVICE TYPES (Services 1-59)
// ============================================================================

// Re-export automation service types (Services 1-20)
export * from './automationServices';

// Re-export AI agent service types (Services 21-30)
export * from './aiAgentServices';

// Re-export integration service types (Services 31-40)
export * from './integrationServices';

// Re-export system implementation service types (Services 41-49)
export * from './systemImplementationServices';

// Re-export additional service types (Services 50-59)
export * from './additionalServices';

// ============================================================================
// PHASE TRACKING TYPES
// ============================================================================

export type MeetingPhase = 'discovery' | 'implementation_spec' | 'development' | 'completed';

export type MeetingStatus =
  | 'discovery_in_progress'
  | 'discovery_complete'
  | 'awaiting_client_decision'
  | 'client_approved'
  | 'spec_in_progress'
  | 'spec_complete'
  | 'dev_not_started'
  | 'dev_in_progress'
  | 'dev_testing'
  | 'dev_ready_for_deployment'
  | 'deployed'
  | 'completed';

export interface PhaseTransition {
  fromPhase: MeetingPhase | null;
  toPhase: MeetingPhase;
  timestamp: Date;
  transitionedBy: string;
  notes?: string;
}

// Bilingual text support for Phase 3 (English UI)
export interface BilingualText {
  he: string;  // Hebrew
  en: string;  // English
}

// ============================================================================
// ZOHO INTEGRATION TYPES
// ============================================================================

export interface ZohoClientListItem {
  recordId: string;
  clientName: string;
  companyName?: string;
  phase: MeetingPhase;
  status: MeetingStatus;
  overallProgress: number;
  phase2Progress?: number;
  phase3Progress?: number;
  lastModified: Date;
  lastSync?: Date;
  syncStatus: 'synced' | 'pending' | 'error';
  owner?: string;
  email?: string;
  phone?: string;
  discoveryDate?: Date;
  discoveryModulesCompleted?: number;
}

export interface ZohoClientsCache {
  lastFetch: Date;
  clients: ZohoClientListItem[];
  totalCount: number;
}

export interface ZohoSyncOptions {
  force?: boolean; // Force sync even if recent
  fullSync?: boolean; // Sync all data or just metadata
  silent?: boolean; // Don't show UI feedback
}

export interface ZohoSyncResult {
  success: boolean;
  recordId?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// MAIN MEETING TYPE
// ============================================================================

export interface Meeting {
  meetingId: string;
  id: string; // Alias for meetingId (used in some components)
  clientName: string;
  date: Date;
  timer?: number;
  modules: Modules;
  painPoints: PainPoint[];
  notes?: string;
  totalROI?: number;
  customFieldValues?: CustomFieldValues;
  wizardState?: WizardState;

  // Data migration tracking
  dataVersion?: number; // Current version: 2 (see dataMigration.ts)

  // NEW: Phase tracking
  phase: MeetingPhase;
  status: MeetingStatus;
  phaseHistory: PhaseTransition[];

  // NEW: Phase-specific data (imported from separate type files)
  discoveryData?: any; // Phase 1 data is the 'modules' field above
  implementationSpec?: ImplementationSpecData; // Defined in phase2.ts
  developmentTracking?: DevelopmentTrackingData; // Defined in phase3.ts

  // Database sync metadata
  supabaseId?: string; // Supabase record ID
  updatedAt?: string; // Last update timestamp

  zohoIntegration?: {
    recordId: string;
    module: 'Potentials1';
    lastSyncTime?: string;
    syncEnabled?: boolean;
    contactInfo?: {
      email?: string;
      phone?: string;
    };
  };
}

export interface Modules {
  overview: OverviewModule;
  essentialDetails?: EssentialDetailsModule; // NEW: Dynamic discovery module
  leadsAndSales: LeadsAndSalesModule;
  customerService: CustomerServiceModule;
  operations: OperationsModule;
  reporting: ReportingModule;
  aiAgents: AIAgentsModule;
  systems: SystemsModule;
  roi: ROIModule;
  proposal?: ProposalData; // ProposalData from types/proposal.ts
  planning?: PlanningModule; // Keep for backward compatibility
  requirements?: CollectedRequirements[]; // Requirements for selected services
}

// NEW: Essential Details Module - Dynamic based on focus areas
export interface EssentialDetailsModule {
  // Lead Capture & Management (shown if focusAreas includes 'lead_capture')
  leadManagement?: {
    whatHappensWhenLeadArrives?: string;
    whoResponsible?: string;
    timeToFirstContact?: string;
    leadTrackingMethod?: string;
    leadLossReasons?: string[];
  };

  // Sales Process (shown if focusAreas includes 'sales_process')
  salesProcess?: {
    salesStages?: string[];
    stageCriteria?: { stage: string; criteria: string }[];
    averageSalesCycle?: number; // days
    conversionRate?: number; // percentage
    opportunityTrackingMethod?: string;
    mainSalesBottleneck?: string;
  };

  // Customer Service (shown if focusAreas includes 'customer_service')
  customerServiceDetails?: {
    averageResponseTime?: string;
    ticketCategories?: string[];
    escalationProcess?: string;
    customerSatisfaction?: number; // 1-10
    repeatIssues?: string[];
  };

  // Automation Opportunities (shown if focusAreas includes 'automation')
  automationOpportunities?: {
    repetitiveProcesses?: { name: string; frequency: string; timePerExecution: number }[];
    manualDataEntry?: string[];
    automationPriority?: string;
  };

  // CRM & Systems (shown if focusAreas includes 'crm_upgrade' or crmStatus !== 'none')
  systemsDetails?: {
    currentCrmName?: string;
    crmUsage?: string; // how they use it today
    crmLimitations?: string[];
    desiredFeatures?: string[];
    integrationNeeds?: string[];
    userCount?: number;
    dataVolume?: string;
  };

  // Reporting & Analytics (shown if focusAreas includes 'reporting')
  reportingDetails?: {
    criticalReports?: string[];
    reportingFrequency?: string;
    dataGaps?: string[];
    decisionMakingChallenges?: string;
  };

  // AI Agents (shown if focusAreas includes 'ai_agents')
  aiDetails?: {
    aiUseCases?: string[];
    aiReadiness?: string;
    dataAvailability?: string;
    expectedOutcomes?: string[];
  };
}

export interface ModuleProgress {
  moduleId: string;
  name: string;
  hebrewName: string;
  completed: number;
  total: number;
  status: 'empty' | 'in_progress' | 'completed';
  subModules?: SubModuleProgress[];
}

export interface SubModuleProgress {
  id: string;
  name: string;
  hebrewName: string;
  status: 'empty' | 'in_progress' | 'completed';
}

export interface PainPoint {
  id: string;
  module: string;
  subModule?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  potentialSaving?: number;
  potentialHours?: number;
}

// Module 1 - Overview
export interface OverviewModule {
  businessType?: string;
  employees?: number;
  mainChallenge?: string;
  budget?: string;

  // NEW: Lead Sources (moved from LeadsAndSales 2.1)
  leadSources?: LeadSource[];
  leadCaptureChannels?: string[]; // website, phone, chat, etc.
  leadStorageMethod?: string; // excel, crm, email, paper

  // NEW: Service Channels (moved from CustomerService 3.1)
  serviceChannels?: ServiceChannel[];
  serviceVolume?: string; // daily/weekly volume estimate
  serviceSystemExists?: boolean;

  // NEW: Focus Areas - what the client wants to improve
  focusAreas?: FocusArea[];

  // NEW: CRM Status
  crmStatus?: 'none' | 'basic' | 'full';
  crmName?: string;
  crmSatisfaction?: 1 | 2 | 3 | 4 | 5;

  // Contact Information - Used by ProposalModule for client contact details
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Business Details
  industry?: string;
  website?: string;
  location?: string;
  established?: string;

  // Goals and Challenges - Used by validation guards and recommendation engine
  mainGoals?: string[];
  challenges?: string[];
  vision?: string;
  currentSituation?: string;
}

// Focus areas that drive Essential Details module
export type FocusArea =
  | 'lead_capture'        // קליטת לידים וניהול ראשוני
  | 'sales_process'       // ניהול תהליך המכירה
  | 'customer_service'    // ניהול שירות לקוחות
  | 'automation'          // אוטומציה של תהליכים
  | 'crm_upgrade'         // שדרוג/החלפת CRM
  | 'reporting'           // דיווח וניתוח נתונים
  | 'ai_agents';          // אוטומציה מבוססת AI

/**
 * Module 2 - Leads and Sales
 *
 * Tracks lead generation sources, response times, routing methods, follow-up strategies,
 * and appointment scheduling processes.
 *
 * @note Data structure migrated in v2 (March 2025):
 *       - leadSources changed from nested object {sources: LeadSource[]} to direct LeadSource[] array
 *       - Nested properties (centralSystem, commonIssues, etc.) moved to top level for better type safety
 *
 * @see dataMigration.ts - migrateV1ToV2() for migration logic
 * @see LeadsAndSalesModule.tsx - initializeLeadSources() for backward-compatible data loading
 *
 * @example
 * ```typescript
 * const module: LeadsAndSalesModule = {
 *   leadSources: [
 *     { channel: 'website', volumePerMonth: 100, quality: 4 },
 *     { channel: 'facebook', volumePerMonth: 50, quality: 3 }
 *   ],
 *   centralSystem: 'Zoho CRM',
 *   commonIssues: ['duplicates', 'missing_info']
 * };
 * ```
 */
export interface LeadsAndSalesModule {
  // Lead Sources Section - Direct array format (migrated from nested object in v2)
  leadSources?: LeadSource[];
  centralSystem?: string;
  commonIssues?: string[];
  missingOpportunities?: string;
  fallingLeadsPerMonth?: number;
  duplicatesFrequency?: string;
  missingInfoPercent?: number;
  timeToProcessLead?: number;
  costPerLostLead?: number;

  // Speed to Lead Section
  speedToLead?: SpeedToLead;

  // Lead Routing Section
  leadRouting?: LeadRouting;

  // Follow Up Section
  followUp?: FollowUpStrategy;

  // Appointments Section
  appointments?: AppointmentManagement;

  // Additional properties used in requirements and validation
  leadVolume?: number; // Total lead volume per month
  productServices?: string[]; // Products or services offered
  leadSourcesMetadata?: any; // Legacy metadata field (for backward compatibility)
}

export interface LeadSource {
  channel: string;
  volumePerMonth?: number;
  quality?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Speed to Lead metrics and response time tracking
 *
 * @property duringBusinessHours - Response time during business hours (e.g., "5 minutes", "1 hour")
 * @property responseTimeUnit - Unit for response time measurement (minutes, hours, days)
 * @property afterHours - Response capability after business hours
 * @property weekends - Response capability on weekends
 * @property unansweredPercentage - Percentage of leads that go unanswered (0-100)
 * @property whatHappensWhenUnavailable - What happens when sales team is unavailable
 * @property urgentVsRegular - Whether urgent leads are differentiated from regular leads
 * @property urgentHandling - How urgent leads are handled differently
 * @property opportunity - Identified opportunity for improvement in speed to lead
 */
export interface SpeedToLead {
  duringBusinessHours?: string;
  responseTimeUnit?: 'minutes' | 'hours' | 'days';
  afterHours?: 'no_response' | 'partial' | 'full';
  weekends?: 'no_response' | 'partial' | 'full';
  unansweredPercentage?: number;
  whatHappensWhenUnavailable?: string;
  urgentVsRegular?: boolean;
  urgentHandling?: string;
  opportunity?: string;
}

/**
 * Lead Routing configuration and methods
 *
 * @property method - Array of routing methods used (can use multiple simultaneously)
 * @property methodDetails - Detailed description of how routing methods work
 * @property unavailableAgentHandling - What happens when assigned agent is unavailable
 * @property hotLeadCriteria - Criteria that define a "hot" lead
 * @property customHotLeadCriteria - Custom user-defined hot lead criteria
 * @property hotLeadPriority - How hot leads are prioritized
 * @property aiPotential - Potential for AI to improve lead routing
 */
export interface LeadRouting {
  method?: string[]; // Changed from single value to array for multiple methods
  methodDetails?: string;
  unavailableAgentHandling?: string;
  hotLeadCriteria?: string[];
  customHotLeadCriteria?: string;
  hotLeadPriority?: string;
  aiPotential?: string;
}

/**
 * Follow-Up Strategy configuration
 *
 * @property attempts - Number of follow-up attempts before giving up
 * @property day1Interval - Follow-up interval on day 1
 * @property day3Interval - Follow-up interval on day 3
 * @property day7Interval - Follow-up interval on day 7
 * @property intervals - Legacy: Array of follow-up intervals (kept for backward compatibility)
 * @property channels - Channels used for follow-up (whatsapp, sms, email, phone)
 * @property dropOffRate - Percentage of leads that drop off during follow-up (0-100)
 * @property notNowHandling - How "not now" leads are handled
 * @property nurturing - Whether lead nurturing is implemented
 * @property nurturingDescription - Description of nurturing process
 * @property customerJourneyOpportunity - Identified opportunity for customer journey improvement
 */
export interface FollowUpStrategy {
  attempts?: number;
  day1Interval?: string;
  day3Interval?: string;
  day7Interval?: string;
  intervals?: number[]; // Legacy field
  channels?: ('whatsapp' | 'sms' | 'email' | 'phone')[];
  dropOffRate?: number;
  notNowHandling?: string;
  nurturing?: boolean;
  nurturingDescription?: string;
  customerJourneyOpportunity?: string;
}

/**
 * Appointment Management and Scheduling
 *
 * @property avgSchedulingTime - Average time (in minutes) to schedule an appointment
 * @property messagesPerScheduling - Average number of messages exchanged to schedule
 * @property cancellationRate - Percentage of appointments that get cancelled (0-100)
 * @property noShowRate - Percentage of appointments where client doesn't show (0-100)
 * @property multipleParticipants - Whether appointments involve multiple participants
 * @property changesPerWeek - Number of appointment changes/reschedulings per week
 * @property reminders - Reminder configuration
 * @property criticalPain - Whether appointment scheduling is a critical pain point
 */
export interface AppointmentManagement {
  avgSchedulingTime?: number;
  messagesPerScheduling?: number;
  cancellationRate?: number;
  noShowRate?: number;
  multipleParticipants?: boolean;
  changesPerWeek?: number;
  reminders?: {
    when: string[];
    channels: string[];
    customTime?: string;
  };
  criticalPain?: boolean;
}

/**
 * Module 3 - Customer Service
 *
 * Tracks customer support channels, auto-response capabilities, proactive communication,
 * community management, reputation monitoring, and customer onboarding processes.
 *
 * @note Data structure migrated in v2 (March 2025):
 *       - channels changed from nested object {list: ServiceChannel[]} to direct ServiceChannel[] array
 *       - Nested properties (multiChannelIssue, unificationMethod) moved to top level for better type safety
 *
 * @see dataMigration.ts - migrateV1ToV2() for migration logic
 * @see CustomerServiceModule.tsx - initializeChannels() for backward-compatible data loading
 *
 * @example
 * ```typescript
 * const module: CustomerServiceModule = {
 *   channels: [
 *     { type: 'whatsapp', volumePerDay: 50, responseTime: '5 minutes' },
 *     { type: 'email', volumePerDay: 30, responseTime: '2 hours' }
 *   ],
 *   multiChannelIssue: 'Messages getting lost between channels',
 *   unificationMethod: 'Using shared inbox'
 * };
 * ```
 */
export interface CustomerServiceModule {
  // Service Channels Section - Direct array format (migrated from nested object in v2)
  channels?: ServiceChannel[];
  multiChannelIssue?: string;
  unificationMethod?: string;

  // Auto Response Section
  autoResponse?: AutoResponse;

  // Proactive Communication Section
  proactiveCommunication?: ProactiveCommunication;

  // Community Management Section
  communityManagement?: CommunityManagement;

  // Reputation Management Section
  reputationManagement?: ReputationManagement;

  // Onboarding Section
  onboarding?: CustomerOnboarding;

  // Legacy metadata field (for backward compatibility)
  channelsMetadata?: any;
}

export interface ServiceChannel {
  type: string;
  volumePerDay?: number;
  responseTime?: string;
  availability?: string;
}

export interface AutoResponse {
  topQuestions: FAQ[];
  commonRequests: string[];
  automationPotential?: number;
}

export interface FAQ {
  question: string;
  frequencyPerDay?: number;
}

/**
 * Proactive Communication configuration
 *
 * @property updateTriggers - Events/triggers that require customer updates
 * @property updateChannelMapping - Mapping of update types to communication channels
 * @property whatMattersToCustomers - What customers care most about hearing updates on
 * @property frequency - How often proactive communication happens
 * @property type - Types of proactive communication (newsletters, updates, etc.)
 * @property channels - Legacy: Communication channels (kept for backward compatibility)
 * @property timeSpentWeekly - Hours per week spent on proactive communication
 */
export interface ProactiveCommunication {
  updateTriggers?: string[];
  updateChannelMapping?: {[key: string]: string};
  whatMattersToCustomers?: string;
  frequency?: string;
  type?: string[];
  channels?: string[]; // Legacy field
  timeSpentWeekly?: number;
}

/**
 * Community Management configuration
 *
 * @property exists - Whether a customer community exists
 * @property size - Number of community members
 * @property platforms - Platforms where community exists (Facebook, Discord, etc.)
 * @property challenges - Challenges in managing the community
 * @property eventsPerMonth - Number of community events per month
 * @property registrationMethod - How event registrations are managed
 * @property actualAttendanceRate - Percentage of registered attendees who actually show up
 * @property eventAutomationOpportunity - Opportunity to automate event management
 */
export interface CommunityManagement {
  exists: boolean;
  size?: number;
  platforms?: string[];
  challenges?: string[];
  eventsPerMonth?: number;
  registrationMethod?: string;
  actualAttendanceRate?: number;
  eventAutomationOpportunity?: string;
}

/**
 * Reputation Management configuration
 *
 * @property feedbackCollection - How and when customer feedback is collected
 * @property whatDoWithFeedback - What the business does with collected feedback
 * @property reviewsPerMonth - Number of online reviews received per month
 * @property platforms - Review platforms being monitored (Google, Facebook, etc.)
 * @property positiveReviewStrategy - Strategy for handling positive reviews
 * @property negativeReviewStrategy - Strategy for handling negative reviews
 * @property sentimentDetectionOpportunity - Opportunity for sentiment analysis automation
 * @property strategy - Legacy: General reputation strategy (kept for backward compatibility)
 */
export interface ReputationManagement {
  feedbackCollection?: {
    when: string[];
    how: string[];
    responseRate?: number;
  };
  whatDoWithFeedback?: string;
  reviewsPerMonth?: number;
  platforms?: string[];
  positiveReviewStrategy?: string;
  negativeReviewStrategy?: string;
  sentimentDetectionOpportunity?: string;
  strategy?: string; // Legacy field
}

/**
 * Customer Onboarding configuration
 *
 * @property steps - Onboarding process steps with timing
 * @property followUpChecks - Follow-up checks during onboarding
 * @property missingAlerts - Whether automated alerts are missing in onboarding
 * @property commonIssues - Common issues encountered during onboarding
 */
export interface CustomerOnboarding {
  steps?: OnboardingStep[];
  followUpChecks?: string[];
  missingAlerts?: boolean;
  commonIssues?: string;
}

/**
 * Individual onboarding step
 *
 * @property name - Name of the onboarding step
 * @property time - How long this step takes (e.g., "2 hours", "1 day")
 * @property duration - Legacy: Duration of step (kept for backward compatibility)
 */

export interface OnboardingStep {
  name: string;
  time?: string;
  duration?: string; // Legacy field
}

/**
 * Module 4 - Operations
 *
 * Tracks operational workflows, documentation, project management, human resources, and logistics.
 * This module captures internal business processes across five key operational areas.
 *
 * @note Data structure matches OperationsModule.tsx component (lines 229-273)
 *
 * @property workProcesses - Business process workflows and automation readiness assessment
 * @property documentManagement - Document storage, search, approval workflows, and version control
 * @property projectManagement - Project tracking, task management, resource allocation, and timeline accuracy
 * @property hr - Human resources processes including onboarding, training, and employee management
 * @property logistics - Inventory management, shipping processes, supplier relations, and warehouse operations
 *
 * @example
 * ```typescript
 * const operations: OperationsModule = {
 *   workProcesses: {
 *     processes: [
 *       {
 *         name: 'Order Processing',
 *         description: 'From order receipt to fulfillment',
 *         stepCount: 8,
 *         bottleneck: 'Manual approval step',
 *         failurePoint: 'Missing customer info',
 *         estimatedTime: 45
 *       }
 *     ],
 *     commonFailures: ['manual_errors', 'missing_info'],
 *     errorTrackingSystem: 'excel',
 *     processDocumentation: 'Stored in shared drive',
 *     automationReadiness: 70
 *   }
 * };
 * ```
 */
export interface OperationsModule {
  /** Work process workflows and bottleneck analysis */
  workProcesses?: {
    /** List of business processes with detailed workflow information */
    processes: WorkProcess[];
    /** Common failure points across processes */
    commonFailures: string[];
    /** System used for tracking errors (none, manual, excel, system, crm) */
    errorTrackingSystem: string;
    /** How processes are documented in the organization */
    processDocumentation: string;
    /** Readiness for automation (0-100%) */
    automationReadiness: number;
  };

  /** Document management and workflows */
  documentManagement?: {
    /** Document flows with volume and time metrics */
    flows: DocumentFlow[];
    /** Where documents are stored (google_drive, dropbox, sharepoint, local_server, physical, cloud) */
    storageLocations: string[];
    /** Description of difficulties in finding documents */
    searchDifficulties: string;
    /** Version control method (none, manual_naming, system, sharepoint, git) */
    versionControlMethod: string;
    /** Description of approval workflow process */
    approvalWorkflow: string;
    /** Document retention period in years */
    documentRetention: number;
  };

  /** Project management and tracking */
  projectManagement?: {
    /** Project management tools in use (monday, asana, trello, jira, notion, excel, ms_project) */
    tools: string[];
    /** Sources of task creation (email, meetings, phone, whatsapp, crm, customers, internal) */
    taskCreationSources: string[];
    /** Identified issues in project management */
    issues: ProjectIssue[];
    /** Method for resource allocation (none, manual, rotation, skills, automated) */
    resourceAllocationMethod: string;
    /** Accuracy of time estimates (0-100%) */
    timelineAccuracy: number;
    /** Project visibility/transparency level (none, meetings, dashboard, realtime) */
    projectVisibility: string;
    /** Percentage of projects that miss deadlines (0-100) */
    deadlineMissRate: number;
  };

  /** Human resources management */
  hr?: {
    /** Organizational departments with employee counts */
    departments: Department[];
    /** Number of steps in employee onboarding process */
    onboardingSteps: number;
    /** Duration of onboarding in days */
    onboardingDuration: number;
    /** Training requirements for employees */
    trainingRequirements: string[];
    /** Frequency of performance reviews (none, annual, biannual, quarterly, monthly) */
    performanceReviewFrequency: string;
    /** Annual employee turnover rate (0-100%) */
    employeeTurnoverRate: number;
    /** HR systems in use (hilan, priority, sap, workday, excel, paper) */
    hrSystemsInUse: string[];
  };

  /** Logistics and supply chain */
  logistics?: {
    /** Inventory management method (none, manual, excel, erp, wms, rfid) */
    inventoryMethod: string;
    /** Shipping processes (self_delivery, courier, post, pickup, dropshipping, third_party) */
    shippingProcesses: string[];
    /** Number of active suppliers */
    supplierCount: number;
    /** Average time to fulfill an order in days */
    orderFulfillmentTime: number;
    /** Warehouse operations performed (receiving, quality_check, storage, picking, packing, shipping, returns) */
    warehouseOperations: string[];
    /** Description of common delivery issues */
    deliveryIssues: string;
    /** Time to process a return in days */
    returnProcessTime: number;
    /** Inventory accuracy percentage (0-100%) */
    inventoryAccuracy: number;
  };
}

/**
 * Individual work process specification
 *
 * @property name - Name of the business process
 * @property description - Brief description of what the process does
 * @property stepCount - Number of steps in the process
 * @property bottleneck - Main bottleneck or slowdown point in the process
 * @property failurePoint - Most common point where the process fails
 * @property estimatedTime - Estimated time to complete the process in minutes
 */
export interface WorkProcess {
  name: string;
  description: string;
  stepCount: number;
  bottleneck: string;
  failurePoint: string;
  estimatedTime: number;
}

/**
 * Document flow specification
 *
 * @property type - Type of document (e.g., "Invoice", "Contract", "Report")
 * @property volumePerMonth - Number of documents of this type processed per month
 * @property timePerDocument - Time spent processing each document in minutes
 * @property requiresApproval - Whether this document type requires approval
 * @property versionControlNeeded - Whether version control is needed for this document type
 */
export interface DocumentFlow {
  type: string;
  volumePerMonth: number;
  timePerDocument: number;
  requiresApproval: boolean;
  versionControlNeeded: boolean;
}

/**
 * Project management issue
 *
 * @property area - Area where the issue occurs (e.g., "Resource allocation", "Timeline estimation")
 * @property frequency - How often the issue occurs (e.g., "Daily", "Weekly", "Monthly")
 * @property impact - Impact level of the issue on project success
 */
export interface ProjectIssue {
  area: string;
  frequency: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Organizational department
 *
 * @property name - Name of the department
 * @property employeeCount - Number of employees in the department
 * @property systems - Systems used by this department
 */
export interface Department {
  name: string;
  employeeCount: number;
  systems: string[];
}

/**
 * Module 5 - Reporting and Alerts
 *
 * Tracks real-time alerting, scheduled reporting, KPI measurement, and dashboard configuration.
 *
 * @property realTimeAlerts - Configured real-time alert rules
 * @property criticalAlerts - List of critical alert types that must be implemented
 * @property scheduledReports - Configured scheduled reports
 * @property kpis - Key Performance Indicators being tracked
 * @property dashboards - Dashboard configuration and capabilities
 */
export interface ReportingModule {
  /** Real-time alert configurations with channels and recipients */
  realTimeAlerts?: Alert[];

  /** Critical alert types that are required (e.g., 'new_lead', 'payment_failed', 'system_error') */
  criticalAlerts?: string[];

  /** Scheduled report configurations with frequency and distribution */
  scheduledReports?: Report[];

  /** Custom dashboards configured for different purposes */
  customDashboards?: Array<{
    name: string;
    metrics: string[];
    refreshRate: string;
  }>;

  /** Scheduled recurring reports */
  scheduledReportsList?: Array<{
    name: string;
    frequency: string;
    recipients: string[];
  }>;

  /** Key Performance Indicators being measured */
  kpis?: KPI[];

  /** Dashboard existence and configuration */
  dashboards?: DashboardConfig;
}

export interface Alert {
  type: string;
  channel?: string;
  recipients?: string[];
  frequency?: string;
}

export interface Report {
  name: string;
  frequency?: string;
  timeToCreate?: number;
  distribution?: string[];
}

export interface KPI {
  name: string;
  measured?: 'excel' | 'system' | 'manual' | 'not';
  frequency?: string;
}

export interface DashboardConfig {
  exists: boolean;
  realTime?: boolean;
  anomalyDetection?: 'automatic' | 'manual' | 'none';
}

/**
 * Module 6 - AI Agents
 *
 * Tracks AI implementation opportunities across sales, service, and operations.
 * Used by smartRecommendations engine to assess AI readiness and suggest implementations.
 *
 * @property sales - AI capabilities in sales department
 * @property service - AI capabilities in customer service
 * @property operations - AI capabilities in operations
 * @property priority - Which department should implement AI first
 * @property naturalLanguageImportance - Importance of natural language processing
 * @property readinessLevel - Overall AI readiness assessment (used by smartRecommendations.ts)
 * @property currentAI - Current AI tools or implementations in use
 * @property aiStrategy - Overall AI strategy and approach
 * @property constraints - Budget, timeline, compliance, and data privacy constraints
 * @property vendors - AI vendors being considered or in use
 * @property agentSpecs - Phase 2: Detailed AI agent specifications
 * @property selectedModels - Phase 2: AI model selections for specific use cases
 */
export interface AIAgentsModule {
  /** AI capabilities in sales department */
  sales?: AICapability;

  /** AI capabilities in customer service */
  service?: AICapability;

  /** AI capabilities in operations */
  operations?: AICapability;

  /** Priority department for AI implementation */
  priority?: 'sales' | 'service' | 'operations';

  /** Importance of natural language processing capabilities */
  naturalLanguageImportance?: 'critical' | 'important' | 'less_important';

  /** Overall AI readiness level - used by recommendation engine */
  readinessLevel?: 'none' | 'exploring' | 'pilot' | 'production' | 'high';

  /** Current AI tools or implementations in use */
  currentAI?: string[];

  /** Overall AI strategy and approach */
  aiStrategy?: string;

  /** Constraints affecting AI implementation */
  constraints?: {
    budget?: number;
    timeline?: string;
    compliance?: string[];
    dataPrivacy?: string[];
  };

  /** AI vendors being considered or in use */
  vendors?: Array<{
    name: string;
    service: string;
    integration: string;
  }>;

  // Phase 2: AI Agent Specification Builder
  agentSpecs?: AIAgentUseCase[];
  selectedModels?: AIModelSelection[];
}

export interface AICapability {
  useCases?: string[];
  potential?: 'high' | 'medium' | 'low';
  readiness?: 'ready' | 'needs_work' | 'not_ready';
}

// Phase 2: AI Agent Use Case Builder
export interface AIAgentUseCase {
  id: string;
  name: string;
  trigger: 'new_lead' | 'customer_question' | 'after_hours' | 'appointment_booking' | 'follow_up' | 'custom';
  customTrigger?: string;
  objective: string;
  conversationFlow: ConversationFlowStep[];
  knowledgeBaseRequirements: string[];
  fallbackStrategy: 'human_handoff' | 'email_notification' | 'scheduled_callback' | 'faq_redirect';
  successCriteria: string[];
  expectedVolume: number;
  priority: 'high' | 'medium' | 'low';
  department: 'sales' | 'service' | 'operations';
}

export interface ConversationFlowStep {
  id: string;
  order: number;
  action: string;
  expectedResponse?: string;
  nextStepCondition?: string;
}

// Phase 2: AI Model Selector (Updated October 2025)
export interface AIModelComparison {
  modelId: string;
  modelName: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'xAI' | 'Other';
  version: string;
  costPer1MTokensInput: number;
  costPer1MTokensOutput: number;
  maxTokens: number;
  hebrewSupport: 'excellent' | 'good' | 'basic' | 'none';
  responseSpeed: 'fast' | 'medium' | 'slow';
  contextWindow: number;
  strengths: string[];
  bestFor: string[];
  limitations: string[];
}

export interface AIModelSelection {
  useCaseId: string;
  selectedModelId: string;
  reasoning: string;
  estimatedMonthlyCost: number;
  estimatedTokensPerMonth: number;
}

/**
 * Module 7 - Systems Integration
 *
 * Tracks current systems, integration needs, data quality, API access, and infrastructure.
 * Used by smartRecommendations engine and validationGuards for system analysis.
 *
 * @property currentSystems - List of current systems in use (legacy)
 * @property customSystems - Custom systems description
 * @property detailedSystems - Detailed system specifications (Phase 2)
 * @property integrations - Integration status and needs
 * @property integrationNeeds - Specific integration requirements (used by validationGuards.ts)
 * @property dataQuality - Data quality assessment
 * @property apiWebhooks - API and webhook configuration
 * @property apiAccess - Whether API access is available (used by smartRecommendations.ts)
 * @property apiDocumentation - API documentation availability
 * @property dataWarehouse - Data warehouse presence (used by smartRecommendations.ts)
 * @property dataWarehouseType - Type of data warehouse in use
 * @property infrastructure - Infrastructure and hosting details
 * @property technicalDebt - Known technical debt issues
 * @property scalabilityConcerns - Scalability challenges
 */
export interface SystemsModule {
  /** List of current systems in use (legacy format) */
  currentSystems?: string[];

  /** Custom systems description */
  customSystems?: string;

  /** Detailed system specifications with API access and integration needs */
  detailedSystems?: DetailedSystemInfo[];

  /** Integration status and configuration */
  integrations?: {
    level?: string;
    issues?: string[];
    manualDataTransfer?: string;
  };

  /** Specific integration needs between systems - used by validationGuards */
  integrationNeeds?: Array<{
    from: string;
    to: string;
    type: 'api' | 'webhook' | 'file' | 'database';
    priority: 'high' | 'medium' | 'low';
  }>;

  /** Data quality metrics and assessment */
  dataQuality?: {
    overall?: string;
    duplicates?: string;
    completeness?: string;
  };

  /** API and webhook capabilities */
  apiWebhooks?: {
    usage?: string;
    webhooks?: string;
    needs?: string[];
  };

  /** Whether systems have API access - used by smartRecommendations */
  apiAccess?: boolean;

  /** API documentation availability */
  apiDocumentation?: string;

  /** Data warehouse presence - used by smartRecommendations */
  dataWarehouse?: boolean;

  /** Type of data warehouse in use */
  dataWarehouseType?: string;

  /** Infrastructure and hosting configuration */
  infrastructure?: {
    hosting?: string;
    security?: string[];
    backup?: string;
  };

  /** Known technical debt issues */
  technicalDebt?: string[];

  /** Scalability challenges and concerns */
  scalabilityConcerns?: string[];
}

// NEW: Detailed system specification
export interface DetailedSystemInfo {
  id: string;
  category: string; // 'crm', 'erp', 'marketing_automation', etc.
  specificSystem: string; // 'Salesforce', 'HubSpot', 'Zoho CRM', etc.
  version?: string; // 'Enterprise', 'Professional', 'Free'
  recordCount?: number; // How many records in the system
  apiAccess: 'full' | 'limited' | 'none' | 'unknown';
  satisfactionScore: 1 | 2 | 3 | 4 | 5;
  mainPainPoints: string[];
  integrationNeeds: SystemIntegrationNeed[];
  migrationWillingness: 'eager' | 'open' | 'reluctant' | 'no';
  monthlyUsers?: number;
  criticalFeatures: string[];
  dataVolume?: string; // 'small', 'medium', 'large', 'enterprise'
  customNotes?: string;
}

export interface SystemIntegrationNeed {
  id: string;
  targetSystemId: string; // References another DetailedSystemInfo.id
  targetSystemName: string;
  integrationType: 'native' | 'api' | 'zapier' | 'n8n' | 'make' | 'manual' | 'other';
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataFlow: 'bidirectional' | 'one-way-to' | 'one-way-from';
  criticalityLevel: 'critical' | 'important' | 'nice-to-have';
  currentStatus: 'working' | 'problematic' | 'missing';
  specificNeeds?: string;
}

// Legacy types - keep for backward compatibility
export interface SystemInfo {
  name: string;
  type: string;
  satisfaction?: 1 | 2 | 3 | 4 | 5;
  mainIssues?: string[];
}

export interface Integration {
  system1: string;
  system2: string;
  status: 'working' | 'problematic' | 'none';
  issues?: string[];
}

export interface DataQuality {
  duplicates?: 'many' | 'some' | 'none';
  accuracy?: 'high' | 'medium' | 'low';
  completeness?: number;
}

/**
 * Module 8 - ROI (Return on Investment)
 *
 * Comprehensive ROI tracking including current costs, time savings potential, investment planning,
 * and success metrics. Includes both form input data and calculated results.
 *
 * @property currentCosts - Current cost inputs (manual hours, hourly cost, tools cost, error cost, lost opportunities)
 * @property timeSavings - Time savings estimates and automation potential
 * @property investment - Investment range and payback expectations
 * @property successMetrics - KPIs for measuring success
 * @property measurementFrequency - How often to measure ROI metrics
 * @property summary - Calculated ROI summary (used by proposalEngine)
 * @property calculations - Detailed ROI calculations by category
 * @property implementationCosts - Breakdown of implementation costs
 * @property ongoingCosts - Breakdown of ongoing monthly costs
 * @property netSavings - Net savings at 12, 24, and 36 months
 * @property paybackPeriodMonths - Calculated payback period
 * @property roiPercentages - ROI percentages at different time horizons
 * @property scenarios - Conservative, realistic, and optimistic scenarios
 */
export interface ROIModule {
  // Form Input Fields
  /** Current cost analysis inputs */
  currentCosts?: {
    manualHours?: string;
    hourlyCost?: string;
    toolsCost?: string;
    errorCost?: string;
    lostOpportunities?: string;
  };

  /** Time savings potential and implementation approach */
  timeSavings?: {
    /** Estimated hours that can be saved per week through automation */
    estimatedHoursSaved?: string;
    /** Automation potential percentage (0-100) */
    automationPotential?: string;
    /** Processes to be automated */
    processes?: string[];
    /** Implementation speed (immediate, quick, moderate, gradual) */
    implementation?: string;
  };

  /** Investment planning and budget */
  investment?: {
    range?: string;
    paybackExpectation?: string;
    budgetAvailable?: string;
  };

  /** Success metrics to track */
  successMetrics?: string[];

  /** Measurement frequency (daily, weekly, monthly, quarterly, annually) */
  measurementFrequency?: string;

  // Calculated Results (populated by roiCalculator)
  /** ROI calculation results summary */
  calculations?: ROICalculation[];

  /** High-level ROI summary - used by proposalEngine */
  summary?: {
    totalMonthlySaving?: number;
    totalHoursSaved?: number;
    paybackPeriod?: number;
    implementationCost?: number;
  };

  /** Detailed implementation cost breakdown */
  implementationCosts?: {
    initialSetup?: number;
    toolsAndLicenses?: number;
    developerTime?: number;
    training?: number;
    total?: number;
  };

  /** Ongoing monthly cost breakdown */
  ongoingCosts?: {
    monthlySubscriptions?: number;
    maintenanceHours?: number;
    supportCosts?: number;
    total?: number;
  };

  /** Net savings projections */
  netSavings?: {
    month12?: number;
    month24?: number;
    month36?: number;
  };

  /** Payback period in months */
  paybackPeriodMonths?: number;

  /** ROI percentages at different time horizons */
  roiPercentages?: {
    roi12Month?: number;
    roi24Month?: number;
    roi36Month?: number;
  };

  /** Conservative, realistic, and optimistic ROI scenarios */
  scenarios?: {
    conservative?: ROIScenario;
    realistic?: ROIScenario;
    optimistic?: ROIScenario;
  };

  /** Estimated cost savings per month */
  estimatedCostSavings?: number;

  /** Detailed cost-benefit analysis */
  costAnalysis?: {
    currentCost?: number;
    automationCost?: number;
    netSavings?: number;
    roi?: number;
    paybackPeriod?: number; // months
  };

  /** Breakdown of benefits beyond cost savings */
  benefits?: {
    timeSavings?: number;
    costSavings?: number;
    qualityImprovement?: string;
    scalability?: string;
  };

  /** Timeline to realize value */
  timelineToValue?: string;
}

export interface ROICalculation {
  category: string;
  description: string;
  hoursSaved?: number;
  moneySaved?: number;
  calculation?: string;
}

export interface ROIScenario {
  name: string;
  nameHebrew: string;
  multiplier: number;
  monthlySavings: number;
  implementationCosts: number;
  ongoingMonthlyCosts: number;
  netSavings12Month: number;
  netSavings24Month: number;
  netSavings36Month: number;
  paybackPeriod: number;
  roi12Month: number;
  roi24Month: number;
  roi36Month: number;
}

/**
 * Module 9 - Planning and Summary
 *
 * Final planning module that captures vision, goals, priorities, implementation approach,
 * next steps, and risk assessment. This module ties together insights from all previous modules.
 *
 * Used by: PlanningModule component (lines 39-60 for structure reference)
 *
 * @property vision - Vision for after automation implementation
 * @property primaryGoals - Primary business goals (efficiency, customer_satisfaction, revenue_growth, etc.)
 * @property timeframe - Implementation timeframe (3_months, 6_months, 12_months, 18_months, over_18)
 * @property priorities - Prioritization of initiatives (top priorities, quick wins, long-term projects)
 * @property implementation - Implementation approach and team involvement
 * @property nextSteps - Immediate actions, follow-up dates, and decision makers
 * @property risks - Main risks identified
 * @property additionalSupport - Additional support or resources needed
 * @property successCriteria - Criteria for measuring success
 * @property constraints - Constraints affecting implementation
 * @property assumptions - Assumptions made during planning
 *
 * @example
 * ```typescript
 * const planning: PlanningModule = {
 *   vision: "Fully automated lead processing within 6 months",
 *   primaryGoals: ['efficiency', 'cost_reduction', 'scale'],
 *   timeframe: '6_months',
 *   priorities: {
 *     top: ['lead_automation', 'customer_response'],
 *     quickWins: ['email_templates', 'basic_chatbot'],
 *     longTerm: ['full_crm', 'ai_agents']
 *   },
 *   implementation: {
 *     approach: 'phased',
 *     team: 'full',
 *     training: 'moderate'
 *   },
 *   nextSteps: {
 *     immediate: 'Set up pilot group, Define success metrics',
 *     followUp: '2024-12-15',
 *     decisionMakers: 'CEO, CTO, Sales Director'
 *   },
 *   risks: ['budget', 'resistance', 'technical'],
 *   additionalSupport: 'Need external consultant for CRM migration'
 * };
 * ```
 */
export interface PlanningModule {
  /** Vision for the organization after successful automation implementation */
  vision?: string;

  /** Primary business goals to achieve (array of goal types) */
  primaryGoals?: string[];

  /** Implementation timeframe (3_months, 6_months, 12_months, 18_months, over_18) */
  timeframe?: string;

  /** Prioritization of initiatives across different timelines */
  priorities?: {
    /** Top 3 most important priorities */
    top?: string[];
    /** Quick wins that can be implemented fast */
    quickWins?: string[];
    /** Long-term strategic projects */
    longTerm?: string[];
  };

  /** Implementation approach and methodology */
  implementation?: {
    /** Implementation approach (pilot, phased, parallel, big_bang, agile) */
    approach?: string;
    /** Team involvement level (full, champions, it_led, external, mixed) */
    team?: string;
    /** Training needs (extensive, moderate, minimal, none) */
    training?: string;
    /** Implementation timeline */
    timeline?: string;
    /** Resource requirements */
    resources?: {
      team?: string[];
      budget?: number;
      tools?: string[];
    };
    /** Implementation phases */
    phases?: string[];
  };

  /** Next steps and action items */
  nextSteps?: {
    /** Immediate actions to take within one week */
    immediate?: string;
    /** Follow-up meeting date */
    followUp?: string;
    /** Key decision makers involved */
    decisionMakers?: string;
  };

  /** Main risks identified (budget, resistance, technical, time, skills, integration, data, vendor, compliance, scale) */
  risks?: string[];

  /** Additional support or resources needed for success */
  additionalSupport?: string;

  /** Success criteria for the implementation */
  successCriteria?: string[];

  /** Constraints affecting implementation */
  constraints?: string[];

  /** Assumptions made during planning */
  assumptions?: string[];

  /** Budget information */
  budget?: {
    range?: string;
    flexibility?: string;
  };

  /** Success metrics to measure implementation success */
  successMetrics?: string[];

  // Legacy fields - kept for backward compatibility
  /** Legacy: Array of priority items (replaced by priorities object) */
  priorityList?: Priority[];

  /** Legacy: Planned KPIs */
  kpis?: PlannedKPI[];

  /** Legacy: Next steps as array (replaced by nextSteps object) */
  nextStepsList?: NextStep[];

  /** Legacy: Open questions */
  openQuestions?: string;
}

export interface Priority {
  id: string;
  module: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  order?: number;
}

export interface PlannedKPI {
  name: string;
  currentValue?: string | number;
  targetValue?: string | number;
  timeframe?: string;
}

export interface NextStep {
  action: string;
  responsible?: string;
  deadline?: Date;
  status?: 'pending' | 'in_progress' | 'completed';
}

// Wizard Mode Types
export interface WizardState {
  currentStep: number;
  currentModuleIndex: number;
  currentFieldIndex: number;
  totalSteps: number;
  completedSteps: Set<string>;
  skippedSections: Set<string>;
  navigationHistory: string[];
  mode: 'wizard' | 'modular';
}

export interface WizardStep {
  id: string;
  moduleId: keyof Modules;
  sectionName: string;
  fields: WizardField[];
  isOptional: boolean;
  dependencies?: string[];
}

export interface WizardField {
  name: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  validation?: any; // Will be ZodSchema when implemented
  skipCondition?: (data: Meeting) => boolean;
}

// Custom Entries Types
export interface CustomFieldValues {
  [moduleId: string]: {
    [fieldName: string]: SelectOption[];
  };
}

export interface SelectOption {
  value: string;
  label: string;
  isCustom?: boolean;
  addedBy?: string;
  addedAt?: Date;
}

export interface CustomizableField {
  predefinedOptions: SelectOption[];
  customOptions: SelectOption[];
  allowCustom: boolean;
  customPlaceholder?: string;
  validateCustom?: (value: string) => boolean;
}

// AI Integration Types
export interface AIConfig {
  enabled: boolean;
  provider: 'openai' | 'xai-grok' | 'custom';
  apiKey?: string;
  endpoint?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  language: 'he' | 'en';
  cacheResponses: boolean;
  fallbackToStatic: boolean;
}

export interface AIRequest {
  type: 'recommendation' | 'analysis' | 'summary';
  context: Meeting;
  prompt?: string;
  language?: string;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  confidence: number;
  tokens: number;
  cached: boolean;
  provider: string;
  error?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  descriptionHebrew: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: string;
  timeline: string;
  dependencies: string[];
  estimatedROI?: number;
  aiGenerated: boolean;
  confidence: number;
}

// ============================================================================
// IMPORT & EXPORT PHASE 2 & PHASE 3 TYPES
// ============================================================================

// Re-export all Phase 2 types
export type {
  DetailedSystemSpec,
  SystemAuthentication,
  SystemModule,
  SystemField,
  FieldMapping,
  DataMigration,
  IntegrationFlow,
  FlowTrigger,
  FlowStep,
  ErrorHandlingStrategy,
  TestCase,
  DetailedAIAgentSpec,
  KnowledgeBase,
  KnowledgeSource,
  DetailedConversationFlow,
  ConversationStep,
  ConversationVariable,
  ConversationBranch,
  ConversationAction,
  AIAgentIntegrations,
  AIAgentTraining,
  SampleConversation,
  AIModelSelection,
  AcceptanceCriteria,
  FunctionalRequirement,
  PerformanceRequirement,
  SecurityRequirement,
  UsabilityRequirement,
  ImplementationSpecData,
} from './phase2';

// Re-export all Phase 3 types
export type {
  DevelopmentTask,
  TaskTestCase,
  Sprint,
  ProjectProgress,
  TeamMember,
  Blocker,
  DevelopmentTrackingData,
  TaskTemplate,
  TaskGenerationRule,
  DeveloperReport,
  JiraExport,
  JiraIssue,
  GitHubIssueExport,
  GitHubIssue,
} from './phase3';