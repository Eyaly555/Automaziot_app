// Main types for Discovery Assistant application

export interface Meeting {
  meetingId: string;
  clientName: string;
  date: Date;
  timer?: number;
  modules: Modules;
  painPoints: PainPoint[];
  notes?: string;
  totalROI?: number;
  customFieldValues?: CustomFieldValues;
  wizardState?: WizardState;
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
  leadsAndSales: LeadsAndSalesModule;
  customerService: CustomerServiceModule;
  operations: OperationsModule;
  reporting: ReportingModule;
  aiAgents: AIAgentsModule;
  systems: SystemsModule;
  roi: ROIModule;
  planning: PlanningModule;
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
  processes?: string[];
  currentSystems?: string[];
  mainGoals?: string[];
  budget?: string;
}

// Module 2 - Leads and Sales
export interface LeadsAndSalesModule {
  leadSources: LeadSource[];
  speedToLead: SpeedToLead;
  leadRouting: LeadRouting;
  followUp: FollowUpStrategy;
  appointments: AppointmentManagement;
}

export interface LeadSource {
  channel: string;
  volumePerMonth?: number;
  quality?: 1 | 2 | 3 | 4 | 5;
}

export interface SpeedToLead {
  duringBusinessHours?: string;
  afterHours?: 'no_response' | 'partial' | 'full';
  weekends?: 'no_response' | 'partial' | 'full';
  unansweredPercentage?: number;
}

export interface LeadRouting {
  method?: 'rotation' | 'expertise' | 'territory' | 'manual';
  unavailableAgentHandling?: string;
  hotLeadCriteria?: string[];
}

export interface FollowUpStrategy {
  attempts?: number;
  intervals?: number[];
  channels?: ('whatsapp' | 'sms' | 'email' | 'phone')[];
  dropOffRate?: number;
  nurturing?: boolean;
}

export interface AppointmentManagement {
  avgSchedulingTime?: number;
  cancellationRate?: number;
  noShowRate?: number;
  reminders?: {
    when: string[];
    channels: string[];
  };
}

// Module 3 - Customer Service
export interface CustomerServiceModule {
  channels: ServiceChannel[];
  autoResponse: AutoResponse;
  proactiveCommunication: ProactiveCommunication;
  communityManagement: CommunityManagement;
  reputationManagement: ReputationManagement;
  onboarding: CustomerOnboarding;
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

export interface ProactiveCommunication {
  updateTriggers?: string[];
  channels?: string[];
  frequency?: string;
  timeSpentWeekly?: number;
}

export interface CommunityManagement {
  exists: boolean;
  size?: number;
  platforms?: string[];
  challenges?: string[];
}

export interface ReputationManagement {
  feedbackCollection?: {
    when: string[];
    how: string[];
    responseRate?: number;
  };
  reviewsPerMonth?: number;
  platforms?: string[];
  strategy?: string;
}

export interface CustomerOnboarding {
  steps?: OnboardingStep[];
  followUpChecks?: string[];
  commonIssues?: string[];
}

export interface OnboardingStep {
  name: string;
  duration?: string;
}

// Module 4 - Operations
export interface OperationsModule {
  systemSync: SystemSync;
  documentManagement: DocumentManagement;
  projectManagement: ProjectManagement;
  financialProcesses: FinancialProcesses;
  hr: HRProcesses;
  crossDepartment: CrossDepartmentFlow;
}

export interface SystemSync {
  systems?: string[];
  dataTransferMethod?: string;
  duplicateData?: boolean;
  manualWork?: number;
}

export interface DocumentManagement {
  documentTypes?: DocumentType[];
  storage?: string;
  organization?: 'organized' | 'messy';
  incomingDocuments?: string[];
  accuracyRequired?: 'high' | 'medium' | 'low';
}

export interface DocumentType {
  type: string;
  volumePerMonth?: number;
  timePerDocument?: number;
}

export interface ProjectManagement {
  taskCreation?: string[];
  allocation?: 'automatic' | 'manual' | 'rotation';
  trackingTool?: string;
  bottlenecks?: string[];
  delayImpact?: string;
}

export interface FinancialProcesses {
  invoicing?: {
    volumePerMonth?: number;
    avgTimePerInvoice?: number;
    errors?: string[];
  };
  payments?: {
    trackingMethod?: string;
    reconciliationTime?: number;
  };
}

export interface HRProcesses {
  onboarding?: {
    steps?: string[];
    systemsToUpdate?: number;
    totalTime?: number;
  };
  management?: {
    attendance?: string;
    vacation?: string;
    communication?: string;
  };
}

export interface CrossDepartmentFlow {
  transfers?: DepartmentTransfer[];
  statusChecks?: {
    timePerDay?: number;
    mostTimeConsuming?: string;
  };
}

export interface DepartmentTransfer {
  from: string;
  to: string;
  status: 'smooth' | 'problematic';
}

// Module 5 - Reporting
export interface ReportingModule {
  realTimeAlerts?: Alert[];
  scheduledReports?: Report[];
  kpis?: KPI[];
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

// Module 6 - AI Agents
export interface AIAgentsModule {
  sales?: AICapability;
  service?: AICapability;
  operations?: AICapability;
  priority?: 'sales' | 'service' | 'operations';
  naturalLanguageImportance?: 'critical' | 'important' | 'less_important';
}

export interface AICapability {
  useCases?: string[];
  potential?: 'high' | 'medium' | 'low';
  readiness?: 'ready' | 'needs_work' | 'not_ready';
}

// Module 7 - Systems
export interface SystemsModule {
  currentSystems?: string[]; // Keep for backward compatibility
  customSystems?: string;
  detailedSystems?: DetailedSystemInfo[]; // NEW: Detailed system specifications
  integrations?: {
    level?: string;
    issues?: string[];
    manualDataTransfer?: string;
  };
  dataQuality?: {
    overall?: string;
    duplicates?: string;
    completeness?: string;
  };
  apiWebhooks?: {
    usage?: string;
    webhooks?: string;
    needs?: string[];
  };
  infrastructure?: {
    hosting?: string;
    security?: string[];
    backup?: string;
  };
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

// Module 8 - ROI
export interface ROIModule {
  calculations?: ROICalculation[];
  summary?: {
    totalMonthlySaving?: number;
    totalHoursSaved?: number;
    paybackPeriod?: number;
    implementationCost?: number;
  };
}

export interface ROICalculation {
  category: string;
  description: string;
  hoursSaved?: number;
  moneySaved?: number;
  calculation?: string;
}

// Module 9 - Planning
export interface PlanningModule {
  vision?: string;
  priorities?: Priority[];
  kpis?: PlannedKPI[];
  nextSteps?: NextStep[];
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