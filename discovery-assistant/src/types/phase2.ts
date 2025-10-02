/**
 * Phase 2: Implementation Specification Types
 *
 * These types define the detailed technical specifications gathered
 * AFTER the client approves moving forward with the project.
 */

// ============================================================================
// SYSTEM DEEP DIVE
// ============================================================================

export interface DetailedSystemSpec {
  id: string;
  systemId: string; // Reference to Phase 1 system
  systemName: string;

  // Authentication & Access
  authentication: SystemAuthentication;

  // Modules and Fields
  modules: SystemModule[];

  // Data Migration
  dataMigration: DataMigration;

  // Notes
  technicalNotes?: string;
}

export interface SystemAuthentication {
  method: 'oauth' | 'api_key' | 'basic_auth' | 'jwt' | 'custom';
  credentialsProvided: boolean;
  apiEndpoint: string;
  rateLimits: string;
  testAccountAvailable: boolean;
  customAuthDetails?: string;
}

export interface SystemModule {
  id: string;
  name: string; // e.g., "Contacts", "Deals", "Products"
  fields: SystemField[];
  customFields: SystemField[];
  recordCount: number;
  requiresMapping: boolean;
}

export interface SystemField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  dataType: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'picklist' | 'multi-picklist' | 'lookup' | 'email' | 'phone' | 'url';
  required: boolean;
  maxLength?: number;
  picklistValues?: string[];

  // Mapping to target system
  mappingTarget?: FieldMapping;
}

export interface FieldMapping {
  targetSystem: string;
  targetSystemId: string;
  targetModule: string;
  targetField: string;
  transformation?: string; // e.g., "uppercase", "lowercase", "date format YYYY-MM-DD", "trim"
  defaultValue?: string;
  validationRule?: string;
}

export interface DataMigration {
  required: boolean;
  recordCount: number;
  cleanupNeeded: boolean;
  historicalDataYears: number;
  migrationMethod: 'api' | 'csv_export' | 'csv_import' | 'database_dump' | 'manual' | 'etl_tool';
  dataSanitizationNeeded: boolean;
  testMigrationFirst: boolean;
  rollbackPlan: string;
}

// ============================================================================
// INTEGRATION FLOWS
// ============================================================================

export interface IntegrationFlow {
  id: string;
  name: string;
  description: string;
  sourceSystem: string;
  targetSystem: string;

  // Trigger
  trigger: FlowTrigger;

  // Steps
  steps: FlowStep[];

  // Configuration
  frequency: 'realtime' | 'every_5_min' | 'every_15_min' | 'hourly' | 'daily' | 'weekly' | 'manual';
  direction: 'one_way' | 'bidirectional';

  // Error Handling
  errorHandling: ErrorHandlingStrategy;

  // Testing
  testCases: TestCase[];

  // Status
  estimatedSetupTime: number; // minutes
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface FlowTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'watch_field' | 'new_record' | 'updated_record' | 'deleted_record';
  configuration: Record<string, any>;
  webhookUrl?: string;
  watchedField?: string;
  scheduleExpression?: string; // cron expression
}

export interface FlowStep {
  id: string;
  order: number;
  action: 'get_data' | 'transform_data' | 'create_record' | 'update_record' | 'delete_record' |
          'send_email' | 'send_whatsapp' | 'send_sms' | 'call_api' | 'conditional' | 'loop' |
          'delay' | 'log' | 'error_handler';
  name: string;
  description: string;
  system?: string;
  configuration: Record<string, any>;
  expectedOutput?: string;

  // Conditional logic
  condition?: {
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains' | 'in' | 'not_in';
    value: any;
    nextStepIfTrue?: string; // Step ID
    nextStepIfFalse?: string; // Step ID
  };
}

export interface ErrorHandlingStrategy {
  onError: 'retry' | 'skip' | 'stop' | 'alert' | 'fallback';
  retryAttempts?: number;
  retryDelay?: number; // seconds
  alertRecipients?: string[];
  fallbackAction?: string;
  logErrors: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  inputData: Record<string, any>;
  expectedOutput: Record<string, any>;
  status: 'not_tested' | 'passed' | 'failed';
  notes?: string;
}

// ============================================================================
// AI AGENT DETAILED SPECIFICATION
// ============================================================================

export interface DetailedAIAgentSpec {
  id: string;
  agentId: string; // Reference to Phase 1 agent
  name: string;
  department: 'sales' | 'service' | 'operations';

  // Knowledge Base
  knowledgeBase: KnowledgeBase;

  // Conversation Design
  conversationFlow: DetailedConversationFlow;

  // Integration Points
  integrations: AIAgentIntegrations;

  // Training & Testing
  training: AIAgentTraining;

  // Model Selection
  model: AIModelSelection;
}

export interface KnowledgeBase {
  sources: KnowledgeSource[];
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  totalDocuments: number;
  totalTokensEstimated: number;
  vectorDatabaseUsed: boolean;
  embeddingModel?: string;
}

export interface KnowledgeSource {
  id: string;
  type: 'pdf' | 'website' | 'crm_field' | 'api_endpoint' | 'google_drive' | 'notion' | 'confluence' | 'sharepoint' | 'csv' | 'json';
  name: string;
  location: string;
  accessMethod: string;
  requiresAuth: boolean;
  credentials?: string; // Encrypted or placeholder
  documentCount: number;
  lastUpdated?: Date;
  syncEnabled: boolean;
  includeInTraining: boolean;
}

export interface DetailedConversationFlow {
  steps: ConversationStep[];
  defaultFallback: string;
  maxConversationLength: number; // number of exchanges
  handoffConditions: string[];
}

export interface ConversationStep {
  id: string;
  order: number;
  agentMessage: string;
  expectedUserResponse: string[];
  variables: ConversationVariable[];
  nextStep?: string; // Step ID
  branches?: ConversationBranch[];
  actions?: ConversationAction[];
}

export interface ConversationVariable {
  name: string; // e.g., "customer_name", "order_id"
  type: 'string' | 'number' | 'date' | 'email' | 'phone';
  extractionMethod: 'user_input' | 'crm_lookup' | 'api_call';
  required: boolean;
  validationRule?: string;
}

export interface ConversationBranch {
  condition: string;
  nextStepId: string;
  description: string;
}

export interface ConversationAction {
  type: 'update_crm' | 'send_email' | 'send_sms' | 'create_ticket' | 'schedule_meeting' | 'call_api';
  configuration: Record<string, any>;
  whenToExecute: 'before_response' | 'after_response' | 'on_condition';
}

export interface AIAgentIntegrations {
  crm?: {
    enabled: boolean;
    fieldsToRead: string[];
    fieldsToUpdate: string[];
    updateTriggers: string[];
  };
  messaging?: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    webChat: boolean;
    platforms: string[];
  };
  scheduling?: {
    enabled: boolean;
    calendarSystem: string;
    availabilityRules: string;
  };
}

export interface AIAgentTraining {
  sampleConversations: SampleConversation[];
  edgeCases: string[];
  prohibitedTopics: string[];
  responseGuidelines: string[];
  toneAndStyle: string;
  languageSupport: string[]; // e.g., ['he', 'en', 'ar']
}

export interface SampleConversation {
  id: string;
  scenario: string;
  userMessages: string[];
  agentResponses: string[];
  successfulOutcome: boolean;
  notes?: string;
}

export interface AIModelSelection {
  modelId: string;
  modelName: string; // e.g., "GPT-4", "Claude 3.5"
  provider: string;
  costPerMonth: number;
  tokensPerMonthEstimated: number;
  reasoning: string;
}

// ============================================================================
// ACCEPTANCE CRITERIA
// ============================================================================

export interface AcceptanceCriteria {
  functional: FunctionalRequirement[];
  performance: PerformanceRequirement[];
  security: SecurityRequirement[];
  usability: UsabilityRequirement[];
}

export interface FunctionalRequirement {
  id: string;
  category: string;
  description: string;
  priority: 'must_have' | 'should_have' | 'nice_to_have';
  testScenario: string;
  acceptanceCriteria: string;
  status: 'pending' | 'in_progress' | 'passed' | 'failed';
  notes?: string;
}

export interface PerformanceRequirement {
  id: string;
  metric: string; // e.g., "API response time", "Page load time"
  target: string; // e.g., "< 200ms", "< 2 seconds"
  currentValue?: string;
  testMethod: string;
  status: 'pending' | 'passed' | 'failed';
}

export interface SecurityRequirement {
  id: string;
  requirement: string;
  category: 'authentication' | 'authorization' | 'data_encryption' | 'compliance' | 'audit';
  implementation: string;
  verified: boolean;
  notes?: string;
}

export interface UsabilityRequirement {
  id: string;
  requirement: string;
  userRole: string; // e.g., "Sales Rep", "Manager", "Customer"
  successCriteria: string;
  tested: boolean;
  feedback?: string;
}

// ============================================================================
// IMPLEMENTATION SPEC CONTAINER
// ============================================================================

export interface ImplementationSpecData {
  systems: DetailedSystemSpec[];
  integrations: IntegrationFlow[];
  aiAgents: DetailedAIAgentSpec[];
  acceptanceCriteria: AcceptanceCriteria;

  // Timeline
  estimatedStartDate?: Date;
  estimatedCompletionDate?: Date;
  totalEstimatedHours: number;

  // Progress
  completionPercentage: number;
  lastUpdated: Date;
  updatedBy: string;
}
