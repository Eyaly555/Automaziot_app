/**
 * Phase 2: Implementation Specification Types
 *
 * These types define the detailed technical specifications gathered
 * AFTER the client approves moving forward with the project.
 */

// Import all service types from dedicated service files
import {
  AutomationServiceConfig,
  AutomationServiceEntry,
} from './automationServices';

import {
  AIAgentServiceConfig,
  AIAgentServiceEntry,
} from './aiAgentServices';

import {
  IntegrationServiceConfig,
  IntegrationServiceEntry,
} from './integrationServices';

import {
  SystemImplementationServiceConfig,
  SystemImplementationServiceEntry,
} from './systemImplementationServices';

import {
  AdditionalServiceConfig,
  AdditionalServiceEntry,
} from './additionalServices';

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
  type: 'webhook' | 'schedule' | 'manual' | 'watch_field' | 'new_record' | 'updated_record' | 'deleted_record' | 'event';
  configuration?: Record<string, any>;
  webhookUrl?: string;
  watchedField?: string;
  scheduleExpression?: string; // cron expression (deprecated - use 'schedule')
  schedule?: string; // cron expression for scheduled triggers
  eventName?: string; // Event name for event-based triggers
}

export interface FlowStep {
  id?: string; // Made optional for compatibility
  stepNumber?: number; // Alternative to 'order'
  order?: number; // Alternative to 'stepNumber'
  type?: 'fetch' | 'transform' | 'create' | 'update' | 'conditional' | 'delete'; // Alternative to 'action'
  action?: 'get_data' | 'transform_data' | 'create_record' | 'update_record' | 'delete_record' |
          'send_email' | 'send_whatsapp' | 'send_sms' | 'call_api' | 'conditional' | 'loop' |
          'delay' | 'log' | 'error_handler'; // Alternative to 'type'
  name?: string;
  description?: string;
  system?: string;
  configuration?: Record<string, any>;
  expectedOutput?: string;
  endpoint?: string; // API endpoint for fetch/create/update operations
  dataMapping?: Record<string, any>; // Data transformation mapping
  condition?: string; // Simple condition string for conditional steps

  // Advanced conditional logic (original structure)
  conditionalLogic?: {
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains' | 'in' | 'not_in';
    value: any;
    nextStepIfTrue?: string; // Step ID
    nextStepIfFalse?: string; // Step ID
  };
}

export interface ErrorHandlingStrategy {
  onError?: 'retry' | 'skip' | 'stop' | 'alert' | 'fallback';
  retryAttempts?: number; // Deprecated: use retryCount
  retryCount?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries in seconds
  alertRecipients?: string[];
  fallbackAction?: string; // What action to take on final failure
  strategy?: string; // General error handling strategy
  logErrors?: boolean; // Whether to log errors (made optional)
  notifyOnFailure?: boolean; // Whether to send notification on failure
  failureEmail?: string; // Email address for failure notifications
}

export interface TestCase {
  id: string;
  name?: string;
  scenario?: string; // Alternative to 'description'
  description?: string; // Alternative to 'scenario'
  input?: Record<string, any>; // Alternative to 'inputData'
  inputData?: Record<string, any>; // Alternative to 'input'
  expectedOutput?: Record<string, any>;
  actualOutput?: Record<string, any>; // Actual output from test execution
  status: 'not_tested' | 'passed' | 'failed' | 'pending'; // Added 'pending' as alias for 'not_tested'
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
  totalDocuments?: number; // Deprecated: use documentCount
  documentCount?: number; // Total number of documents in knowledge base
  totalTokensEstimated?: number; // Deprecated: use totalTokens
  totalTokens?: number; // Total tokens estimated for all documents
  vectorDatabaseUsed?: boolean;
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

/**
 * Intent represents a user's intention in the conversation
 * Used by AI agents to understand and respond to user queries
 */
export interface Intent {
  name: string; // Intent name (e.g., "request_quote", "ask_about_pricing")
  examples?: string[]; // Example user phrases that match this intent
  response: string; // Agent's response for this intent
  requiresData?: boolean; // Whether this intent requires fetching data from knowledge base
}

/**
 * Detailed conversation flow design for AI agents
 * Defines how the agent greets, handles intents, and manages conversations
 */
export interface DetailedConversationFlow {
  // Simple flow properties (used by AIAgentDetailedSpec component)
  greeting?: string; // Opening message when conversation starts
  intents?: Intent[]; // Array of conversation intents
  fallbackResponse?: string; // Response when agent doesn't understand
  escalationTriggers?: string[]; // Conditions that trigger handoff to human
  maxTurns?: number; // Maximum conversation exchanges before timeout
  contextWindow?: number; // Number of previous messages to consider

  // Advanced flow properties (original structure)
  steps?: ConversationStep[];
  defaultFallback?: string; // Deprecated: use fallbackResponse
  maxConversationLength?: number; // Deprecated: use maxTurns
  handoffConditions?: string[]; // Deprecated: use escalationTriggers
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

/**
 * Webhook configuration for custom integrations
 */
export interface Webhook {
  name: string; // Webhook name/identifier
  url: string; // Webhook URL endpoint
  trigger: string; // What triggers this webhook
  headers?: Record<string, any>; // Custom HTTP headers
}

/**
 * AI Agent integration configuration
 * Supports simple and advanced integration patterns
 */
export interface AIAgentIntegrations {
  // Simple integration flags (used by AIAgentDetailedSpec component)
  crmEnabled?: boolean; // Whether CRM integration is enabled
  crmSystem?: string; // CRM system name (e.g., "Zoho CRM", "Salesforce")
  emailEnabled?: boolean; // Whether email sending is enabled
  emailProvider?: string; // Email provider name
  calendarEnabled?: boolean; // Whether calendar integration is enabled
  customWebhooks?: Webhook[]; // Array of custom webhook integrations

  // Advanced integration configuration (original structure)
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

/**
 * FAQ (Frequently Asked Questions) pair
 * Used for training AI agents with common Q&A
 */
export interface FAQPair {
  question: string; // The question
  answer: string; // The answer
  category?: string; // Category for organization (e.g., "pricing", "support")
}

/**
 * AI Agent training configuration
 * Supports both simple and advanced training patterns
 */
export interface AIAgentTraining {
  // Simple training properties (used by AIAgentDetailedSpec component)
  conversationExamples?: any[]; // Simple conversation examples
  faqPairs?: FAQPair[]; // FAQ pairs for training
  tone?: 'professional' | 'friendly' | 'formal' | 'casual' | string; // Response tone
  language?: 'he' | 'en' | 'both' | string; // Primary language(s)

  // Advanced training properties (original structure)
  sampleConversations?: SampleConversation[];
  edgeCases?: string[];
  prohibitedTopics?: string[];
  responseGuidelines?: string[];
  toneAndStyle?: string; // Deprecated: use 'tone'
  languageSupport?: string[]; // e.g., ['he', 'en', 'ar'] - Deprecated: use 'language'
}

export interface SampleConversation {
  id: string;
  scenario: string;
  userMessages: string[];
  agentResponses: string[];
  successfulOutcome: boolean;
  notes?: string;
}

/**
 * AI Model selection and configuration
 * Defines which AI model to use and its parameters
 */
export interface AIModelSelection {
  modelId?: string;
  modelName: string; // e.g., "GPT-4", "Claude 3.5", "gpt-4"
  provider: string; // e.g., "OpenAI", "Anthropic", "Google"
  costPerMonth?: number;
  tokensPerMonthEstimated?: number;
  reasoning?: string;

  // Model parameters (used by AIAgentDetailedSpec component)
  temperature?: number; // 0-2, controls randomness/creativity
  maxTokens?: number; // Maximum tokens in response
  topP?: number; // 0-1, nucleus sampling parameter
}

// ============================================================================
// ACCEPTANCE CRITERIA
// ============================================================================

/**
 * Deployment criteria for production release
 * Defines requirements for successful deployment
 */
export interface DeploymentCriteria {
  approvers?: Array<{
    name?: string;
    role?: string;
    email?: string;
  }>;
  environment?: 'staging' | 'production' | 'dev';
  rollbackPlan?: string;
  smokeTests?: string[]; // Array of smoke tests to run after deployment
}

/**
 * Person who must sign off on the project
 */
export interface SignOffPerson {
  name: string;
  role: string;
  email: string;
}

/**
 * Complete acceptance criteria for the project
 * Supports both array names (functional/performance/security/usability)
 * and alternative names (functionalCriteria/performanceCriteria/securityCriteria)
 */
export interface AcceptanceCriteria {
  // Primary property names
  functional?: FunctionalRequirement[];
  performance?: PerformanceRequirement[];
  security?: SecurityRequirement[];
  usability?: UsabilityRequirement[];

  // Alternative property names (used by AcceptanceCriteriaBuilder component)
  functionalCriteria?: FunctionalRequirement[];
  performanceCriteria?: PerformanceRequirement[];
  securityCriteria?: SecurityRequirement[];

  // Deployment criteria
  deploymentCriteria?: DeploymentCriteria;

  // Sign-off requirements
  signOffRequired?: boolean;
  signOffBy?: SignOffPerson[];
}

/**
 * Functional requirement with test criteria
 */
export interface FunctionalRequirement {
  id: string;
  category?: string;
  description: string;
  priority: 'must_have' | 'should_have' | 'nice_to_have' | 'must' | 'should' | 'nice'; // Added short aliases
  testScenario?: string;
  acceptanceCriteria?: string;
  status: 'pending' | 'in_progress' | 'passed' | 'failed';
  testable?: boolean; // Whether this requirement can be tested automatically
  notes?: string;
}

/**
 * Performance requirement with measurable targets
 */
export interface PerformanceRequirement {
  id: string;
  metric: string; // e.g., "API response time", "Page load time"
  target: string; // e.g., "< 200ms", "< 2 seconds"
  currentValue?: string;
  testMethod?: string; // How this metric will be tested
  measurement?: string; // Alternative name for testMethod (used by AcceptanceCriteriaBuilder)
  status?: 'pending' | 'passed' | 'failed';
}

/**
 * Security requirement with verification status
 */
export interface SecurityRequirement {
  id: string;
  requirement: string;
  category?: 'authentication' | 'authorization' | 'data_encryption' | 'compliance' | 'audit';
  implementation?: string;
  verified?: boolean; // Whether this security requirement has been verified
  implemented?: boolean; // Whether this security requirement has been implemented (alternative name)
  verificationMethod?: string; // How this requirement will be verified
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

/**
 * Implementation Specification Data - Phase 2
 * נתוני מפרט הטמעה - שלב 2
 *
 * Contains all technical specifications gathered after client approval.
 * Organized by service categories: Systems, Integrations, AI Agents, Automations,
 * System Implementations, and Additional Services.
 */
export interface ImplementationSpecData {
  // Core Phase 2 Components (existing structure)
  /** מערכות עם פירוט טכני מלא */
  systems: DetailedSystemSpec[];

  /** זרימות אינטגרציה בין מערכות */
  integrations: IntegrationFlow[];

  /** סוכני AI עם מפרט מפורט */
  aiAgents: DetailedAIAgentSpec[];

  // NEW: Strongly-typed service configurations (Services 1-59)

  /** שירותי אוטומציה (Services 1-20) - Typed automation configurations */
  automations: AutomationServiceEntry[];

  /** שירותי AI נוספים (Services 21-30) - AI agent services beyond basic agents */
  aiAgentServices?: AIAgentServiceEntry[];

  /** שירותי אינטגרציה (Services 31-40) - Integration services */
  integrationServices?: IntegrationServiceEntry[];

  /** הטמעות מערכות (Services 41-49) - System implementation services */
  systemImplementations?: SystemImplementationServiceEntry[];

  /** שירותים נוספים (Services 50-59) - Additional services (data, reports, training, support, consulting) */
  additionalServices?: AdditionalServiceEntry[];

  // Acceptance Criteria
  /** קריטריונים לקבלה */
  acceptanceCriteria: AcceptanceCriteria;

  // Timeline
  /** תאריך התחלה משוער */
  estimatedStartDate?: Date;

  /** תאריך סיום משוער */
  estimatedCompletionDate?: Date;

  /** סך שעות משוער */
  totalEstimatedHours: number;

  // Progress
  /** אחוז השלמה */
  completionPercentage: number;

  /** עדכון אחרון */
  lastUpdated: Date;

  /** עודכן על ידי */
  updatedBy: string;
}
