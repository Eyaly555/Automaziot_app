/**
 * Type definitions for automation service configurations
 * Based on technical requirements research from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */

// ==================== AUTO LEAD RESPONSE ====================

export interface AutoLeadResponseConfig {
  // Basic Information
  formPlatform: 'wix' | 'wordpress' | 'elementor' | 'google_forms' | 'typeform' | 'custom';
  emailService: 'sendgrid' | 'mailgun' | 'smtp' | 'gmail' | 'outlook';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  n8nAccess: boolean;

  // Form Configuration
  webhookSupport: 'yes' | 'plugin' | 'no';
  formFields: string[]; // List of form field names
  formUrl: string;

  // Email Service Setup
  emailCredentialsReady: boolean;
  domainVerified: boolean;
  emailTemplate: string; // HTML or plain text template with {{variables}}
  senderName: string;
  senderEmail: string;
  rateLimitKnown: boolean;

  // CRM Integration
  crmCredentialsReady: boolean;
  crmModule: 'leads' | 'contacts' | 'potentials';
  crmFieldMapping: Array<{ formField: string; crmField: string }>;
  logResponseInCrm: boolean;

  // Response Configuration
  responseTime: 'immediate' | '2-5min' | '15min';
  businessHoursOnly: boolean;
  fallbackMechanism: 'queue' | 'alternative' | 'alert';
  duplicateCheck: boolean;

  // n8n Workflow
  n8nEndpoint?: string;
  errorNotificationEmail: string;
  retryAttempts: number;
  testMode: boolean;
}

/**
 * Technical requirements for auto-lead-response service implementation
 */
export interface AutoLeadResponseRequirements {
  // Required Systems Access
  formPlatformAccess: {
    platform: string;
    webhookCapability: boolean;
    apiKey?: string;
    pluginRequired?: boolean;
  };

  emailServiceAccess: {
    provider: string;
    apiKey?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    domainVerified: boolean;
    spfRecord?: string;
    dkimRecord?: string;
    rateLimits: {
      daily: number;
      monthly: number;
    };
  };

  crmAccess: {
    system: string;
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    module: string;
    fieldsAvailable: string[];
  };

  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
    };
  };
}

/**
 * Service implementation status tracking
 */
export interface AutoLeadResponseImplementation {
  serviceId: 'auto-lead-response';
  config: AutoLeadResponseConfig;
  requirements: AutoLeadResponseRequirements;

  // Implementation progress
  status: 'not_started' | 'configuring' | 'testing' | 'deployed' | 'active' | 'paused';

  // Setup steps completed
  setupSteps: {
    formWebhookConfigured: boolean;
    emailServiceConfigured: boolean;
    domainVerified: boolean;
    crmIntegrationTested: boolean;
    n8nWorkflowDeployed: boolean;
    testEmailsSent: boolean;
    productionLaunched: boolean;
  };

  // Performance metrics
  metrics?: {
    totalLeadsProcessed: number;
    averageResponseTime: number; // in seconds
    successRate: number; // percentage
    emailDeliveryRate: number; // percentage
    crmSyncSuccessRate: number; // percentage
    lastExecuted?: Date;
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      errorMessage: string;
    }>;
  };

  // Maintenance
  lastTested?: Date;
  lastUpdated?: Date;
  notes?: string;
}

/**
 * Setup guide steps for implementation
 */
export interface AutoLeadResponseSetupGuide {
  steps: Array<{
    id: string;
    order: number;
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
    prerequisites?: string[];
    prerequisitesHe?: string[];
    estimatedTime: number; // minutes
    actions: Array<{
      action: string;
      actionHe: string;
      details?: string;
      detailsHe?: string;
    }>;
    verificationCriteria: string;
    verificationCriteriaHe: string;
    troubleshooting?: Array<{
      issue: string;
      issueHe: string;
      solution: string;
      solutionHe: string;
    }>;
  }>;
}

// Export type for use in requirements collection
export type AutoLeadResponseData = Partial<AutoLeadResponseConfig>;

// ==================== AUTO CRM UPDATE ====================

/**
 * Configuration for auto-crm-update service
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md #3
 */
export interface AutoCRMUpdateConfig {
  // Basic Information
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  formPlatform: 'wix' | 'wordpress' | 'elementor' | 'google_forms' | 'typeform' | 'jotform' | 'custom';
  n8nAccess: boolean;

  // CRM Authentication
  authMethod: 'oauth' | 'api_key' | 'basic_auth';
  credentialsProvided: boolean;
  apiAccessEnabled: boolean; // Some CRM plans require paid add-on

  // Form Integration
  formWebhookUrl?: string;
  formApiIntegration?: 'webhook' | 'polling' | 'zapier' | 'make';
  webhookSupport: 'native' | 'plugin_required' | 'not_supported';

  // Field Mapping
  fieldMappings: Array<{
    id: string;
    formField: string;
    formFieldType: 'text' | 'email' | 'phone' | 'number' | 'date' | 'dropdown' | 'checkbox';
    crmField: string;
    crmFieldType: 'text' | 'email' | 'phone' | 'number' | 'date' | 'picklist' | 'boolean' | 'lookup';
    required: boolean;
    transformation?: 'uppercase' | 'lowercase' | 'trim' | 'phone_format' | 'date_format' | 'none';
    defaultValue?: string;
    validationRule?: string;
  }>;

  // Duplicate Detection
  duplicateDetectionEnabled: boolean;
  duplicateCheckFields: string[]; // e.g., ['email', 'phone']
  duplicateStrategy: 'update_existing' | 'skip' | 'create_new' | 'alert';

  // Data Validation
  dataValidationEnabled: boolean;
  validationRules: Array<{
    field: string;
    rule: 'required' | 'email_format' | 'phone_format' | 'min_length' | 'max_length' | 'regex';
    value?: string; // For min_length, max_length, regex
    errorMessage: string;
  }>;

  // CRM Configuration
  crmModule: 'leads' | 'contacts' | 'accounts' | 'potentials' | 'deals' | 'custom';
  customFieldsReady: boolean;
  customFieldsList?: string[];

  // Error Handling
  errorHandlingStrategy: 'retry' | 'skip_and_log' | 'alert_admin' | 'fallback_to_email';
  retryAttempts: number;
  retryDelay: number; // seconds
  errorNotificationEmail: string;
  logFailedSubmissions: boolean;

  // Rate Limits
  rateLimitKnown: boolean;
  dailyApiCallLimit?: number;
  batchUpdateEnabled: boolean; // For Salesforce with many forms
  batchSize?: number;

  // n8n Workflow
  n8nEndpoint?: string;
  testMode: boolean;
  testAccountAvailable: boolean;
}

/**
 * Technical requirements for auto-crm-update service implementation
 */
export interface AutoCRMUpdateRequirements {
  // CRM Access
  crmAccess: {
    system: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';

    // Zoho OAuth
    zohoCredentials?: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      apiDomain: string;
      tokenExpiry: string; // "3 months" or "permanent (Self Client)"
    };

    // Salesforce
    salesforceCredentials?: {
      consumerKey: string;
      consumerSecret: string;
      username: string;
      password: string;
      securityToken: string;
    };

    // HubSpot
    hubspotCredentials?: {
      apiKey?: string;
      privateAppToken?: string;
    };

    // Rate Limits
    rateLimits: {
      daily: number;
      concurrent?: number;
      batchSupported: boolean;
    };

    // Modules & Fields
    targetModule: string;
    customFieldsAvailable: boolean;
    customFields: Array<{
      apiName: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  };

  // Form Platform
  formPlatformAccess: {
    platform: string;
    webhookSupport: boolean;
    webhookUrl?: string;
    apiIntegration?: {
      method: 'rest_api' | 'webhook' | 'polling';
      apiKey?: string;
      endpoint?: string;
    };
    formFields: Array<{
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
      required: boolean;
    }>;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      retryDelay: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Field Mapping Document
  fieldMappingDocument?: {
    mappings: Array<{
      formField: string;
      crmField: string;
      transformation?: string;
      notes?: string;
    }>;
    lastUpdated: Date;
  };

  // Duplicate Detection Rules
  duplicateDetection?: {
    enabled: boolean;
    strategy: string;
    checkFields: string[];
  };
}

/**
 * Service implementation status tracking
 */
export interface AutoCRMUpdateImplementation {
  serviceId: 'auto-crm-update';
  config: AutoCRMUpdateConfig;
  requirements: AutoCRMUpdateRequirements;

  // Implementation progress
  status: 'not_started' | 'configuring' | 'testing' | 'deployed' | 'active' | 'paused';

  // Setup steps completed
  setupSteps: {
    crmCredentialsConfigured: boolean;
    crmApiAccessVerified: boolean;
    customFieldsCreated: boolean;
    formWebhookConfigured: boolean;
    fieldMappingCompleted: boolean;
    duplicateDetectionConfigured: boolean;
    n8nWorkflowDeployed: boolean;
    validationRulesTested: boolean;
    testSubmissionSuccessful: boolean;
    productionLaunched: boolean;
  };

  // Performance metrics
  metrics?: {
    totalFormsProcessed: number;
    successfulUpdates: number;
    failedUpdates: number;
    duplicatesDetected: number;
    validationErrors: number;
    averageProcessingTime: number; // in seconds
    successRate: number; // percentage
    lastExecuted?: Date;
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      errorMessage: string;
      formData?: Record<string, any>;
    }>;
  };

  // Maintenance
  lastTested?: Date;
  lastUpdated?: Date;
  refreshTokenExpiry?: Date; // For Zoho
  notes?: string;
}

/**
 * Setup guide steps for implementation
 */
export interface AutoCRMUpdateSetupGuide {
  steps: Array<{
    id: string;
    order: number;
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
    prerequisites?: string[];
    prerequisitesHe?: string[];
    estimatedTime: number; // minutes
    actions: Array<{
      action: string;
      actionHe: string;
      details?: string;
      detailsHe?: string;
    }>;
    verificationCriteria: string;
    verificationCriteriaHe: string;
    troubleshooting?: Array<{
      issue: string;
      issueHe: string;
      solution: string;
      solutionHe: string;
    }>;
  }>;

  // Important warnings specific to auto-crm-update
  criticalWarnings: {
    dataValidation: string;
    dataValidationHe: string;
    refreshTokenRenewal: string; // Zoho specific
    refreshTokenRenewalHe: string;
    apiRateLimits: string; // Salesforce specific
    apiRateLimitsHe: string;
    errorHandling: string;
    errorHandlingHe: string;
  };
}

// Export type for use in requirements collection
export type AutoCRMUpdateData = Partial<AutoCRMUpdateConfig>;

// ==================== AUTO EMAIL TEMPLATES ====================

/**
 * Configuration for auto-email-templates service
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md #9
 */
export interface AutoEmailTemplatesConfig {
  // Basic Information
  emailService: 'sendgrid' | 'mailgun' | 'smtp' | 'gmail' | 'outlook' | 'amazon_ses';
  templateEngine: 'handlebars' | 'liquid' | 'mustache' | 'ejs';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  n8nAccess: boolean;

  // Email Service Setup
  emailCredentialsReady: boolean;
  domainVerified: boolean;
  spfRecordConfigured: boolean;
  dkimRecordConfigured: boolean;
  dmarcRecordConfigured: boolean;
  rateLimitKnown: boolean;
  dailyEmailLimit?: number;

  // Template Management
  templates: Array<{
    id: string;
    name: string;
    nameHe: string;
    category: 'welcome' | 'follow_up' | 'proposal' | 'invoice' | 'thank_you' | 'reminder' | 'newsletter' | 'custom';
    subject: string;
    subjectHe?: string;
    htmlContent: string; // HTML with inline CSS
    plainTextContent?: string;
    personalizationFields: string[]; // e.g., ['firstName', 'companyName', 'dealAmount']
    unsubscribeLink: boolean;
    physicalAddress?: string;
    privacyPolicyLink?: string;
    mobileResponsive: boolean;
    testEmailSent: boolean;
    lastModified: Date;
    status: 'draft' | 'testing' | 'active' | 'paused' | 'archived';
  }>;

  // Personalization Configuration
  personalizationFields: Array<{
    fieldName: string;
    fieldLabel: string;
    fieldLabelHe: string;
    dataSource: 'crm' | 'form' | 'manual' | 'computed';
    crmFieldMapping?: string;
    defaultValue?: string;
    required: boolean;
    format?: 'text' | 'date' | 'currency' | 'number';
  }>;

  // CRM Integration
  crmCredentialsReady: boolean;
  crmFieldsAvailable: string[];
  dataFetchMethod: 'api_call' | 'webhook' | 'manual';

  // Design & Deliverability
  designToolUsed?: 'stripo' | 'beefree' | 'unlayer' | 'custom_html';
  emailTestingToolUsed?: 'litmus' | 'email_on_acid' | 'mailtrap' | 'none';
  spamScoreChecked: boolean;
  mobileTestingDone: boolean;
  darkModeCompatible: boolean;

  // Legal Compliance
  unsubscribeMechanismConfigured: boolean;
  unsubscribeListManaged: boolean;
  physicalAddressIncluded: boolean;
  privacyPolicyLinked: boolean;
  gdprCompliant: boolean;
  canSpamCompliant: boolean;
  israeliPrivacyLawCompliant: boolean;

  // A/B Testing
  abTestingEnabled: boolean;
  abTests?: Array<{
    id: string;
    testName: string;
    variantA: {
      subject: string;
      content: string;
    };
    variantB: {
      subject: string;
      content: string;
    };
    metric: 'open_rate' | 'click_rate' | 'conversion_rate';
    results?: {
      variantAPerformance: number;
      variantBPerformance: number;
      winner?: 'A' | 'B';
    };
  }>;

  // Automation Triggers
  automationTriggers: Array<{
    id: string;
    triggerName: string;
    triggerNameHe: string;
    triggerType: 'crm_event' | 'time_based' | 'user_action' | 'manual';
    templateId: string;
    active: boolean;
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: string;
    }>;
  }>;

  // Error Handling
  errorHandlingStrategy: 'retry' | 'skip_and_log' | 'alert_admin' | 'fallback';
  retryAttempts: number;
  retryDelay: number; // seconds
  errorNotificationEmail: string;
  logFailedSends: boolean;

  // n8n Workflow
  n8nEndpoint?: string;
  testMode: boolean;
}

/**
 * Technical requirements for auto-email-templates service implementation
 */
export interface AutoEmailTemplatesRequirements {
  // Email Service Provider Access
  emailServiceAccess: {
    provider: 'sendgrid' | 'mailgun' | 'smtp' | 'gmail' | 'outlook' | 'amazon_ses';

    // SendGrid
    sendgridCredentials?: {
      apiKey: string;
      rateLimits: {
        free: { daily: 100 };
        paid: { daily: number }; // 40,000-100,000
      };
    };

    // Mailgun
    mailgunCredentials?: {
      apiKey: string;
      domain: string;
      region: 'us' | 'eu';
      rateLimits: {
        free: { monthly: 5000 };
        paid: { monthly: number };
      };
    };

    // SMTP
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
      secure: boolean;
    };

    // Domain Verification
    domainVerification: {
      domain: string;
      spfRecord: string;
      dkimRecord: string;
      dmarcRecord: string;
      verified: boolean;
      verificationDate?: Date;
    };
  };

  // Template Engine
  templateEngine: {
    engine: 'handlebars' | 'liquid' | 'mustache' | 'ejs';
    version: string;
    syntaxSupport: {
      variables: boolean; // {{firstName}}
      conditionals: boolean; // {{#if}}
      loops: boolean; // {{#each}}
      partials: boolean; // {{> header}}
    };
  };

  // CRM Access
  crmAccess: {
    system: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    fieldsAvailable: Array<{
      apiName: string;
      label: string;
      type: string;
    }>;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    templateRendering: {
      engine: string;
      renderNode: boolean;
    };
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Design Tools (Optional)
  designTools?: {
    tool: 'stripo' | 'beefree' | 'unlayer' | 'custom';
    apiKey?: string;
    templates?: Array<{
      id: string;
      name: string;
      category: string;
    }>;
  };

  // Testing Tools (Optional)
  testingTools?: {
    tool: 'litmus' | 'email_on_acid' | 'mailtrap';
    apiKey?: string;
    testAccountEmail?: string;
  };
}

/**
 * Service implementation status tracking
 */
export interface AutoEmailTemplatesImplementation {
  serviceId: 'auto-email-templates';
  config: AutoEmailTemplatesConfig;
  requirements: AutoEmailTemplatesRequirements;

  // Implementation progress
  status: 'not_started' | 'configuring' | 'testing' | 'deployed' | 'active' | 'paused';

  // Setup steps completed
  setupSteps: {
    emailServiceConfigured: boolean;
    domainVerified: boolean;
    spfDkimConfigured: boolean;
    templateEngineSetup: boolean;
    crmIntegrationTested: boolean;
    templatesDesigned: boolean;
    personalizationFieldsMapped: boolean;
    unsubscribeMechanismConfigured: boolean;
    legalComplianceVerified: boolean;
    n8nWorkflowDeployed: boolean;
    testEmailsSent: boolean;
    spamScoreChecked: boolean;
    mobileResponsiveTested: boolean;
    productionLaunched: boolean;
  };

  // Performance metrics
  metrics?: {
    totalEmailsSent: number;
    totalTemplatesActive: number;
    averageOpenRate: number; // percentage
    averageClickRate: number; // percentage
    deliveryRate: number; // percentage
    bounceRate: number; // percentage
    spamComplaintRate: number; // percentage
    unsubscribeRate: number; // percentage
    templateUsageByCategory: Record<string, number>;
    lastExecuted?: Date;
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      errorMessage: string;
      templateId?: string;
      recipientEmail?: string;
    }>;
  };

  // A/B Test Results
  abTestResults?: Array<{
    testId: string;
    testName: string;
    completedDate: Date;
    winner: 'A' | 'B';
    improvement: number; // percentage
  }>;

  // Maintenance
  lastTested?: Date;
  lastUpdated?: Date;
  nextDomainVerificationCheck?: Date;
  notes?: string;
}

/**
 * Setup guide steps for implementation
 */
export interface AutoEmailTemplatesSetupGuide {
  steps: Array<{
    id: string;
    order: number;
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
    prerequisites?: string[];
    prerequisitesHe?: string[];
    estimatedTime: number; // minutes
    actions: Array<{
      action: string;
      actionHe: string;
      details?: string;
      detailsHe?: string;
    }>;
    verificationCriteria: string;
    verificationCriteriaHe: string;
    troubleshooting?: Array<{
      issue: string;
      issueHe: string;
      solution: string;
      solutionHe: string;
    }>;
  }>;

  // Important warnings specific to auto-email-templates
  criticalWarnings: {
    emailDeliverability: string;
    emailDeliverabilityHe: string;
    mobileResponsiveness: string;
    mobileResponsivenessHe: string;
    personalizationMistakes: string;
    personalizationMistakesHe: string;
    legalRequirements: string;
    legalRequirementsHe: string;
    abTesting: string;
    abTestingHe: string;
  };

  // Best practices
  bestPractices: {
    design: string[];
    designHe: string[];
    deliverability: string[];
    deliverabilityHe: string[];
    personalization: string[];
    personalizationHe: string[];
    legal: string[];
    legalHe: string[];
  };
}

/**
 * Email template personalization variable
 */
export interface EmailTemplateVariable {
  name: string; // e.g., "firstName"
  displayName: string; // e.g., "First Name"
  displayNameHe: string; // e.g., "שם פרטי"
  syntax: string; // e.g., "{{firstName}}" or "{{ firstName }}"
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  defaultValue?: string;
  required: boolean;
  example: string;
  description: string;
  descriptionHe: string;
}

/**
 * Email template validation result
 */
export interface EmailTemplateValidation {
  isValid: boolean;
  errors: Array<{
    type: 'missing_variable' | 'invalid_html' | 'missing_unsubscribe' | 'missing_address' | 'too_many_images' | 'broken_link';
    message: string;
    messageHe: string;
    severity: 'error' | 'warning' | 'info';
    location?: string;
  }>;
  warnings: Array<{
    type: string;
    message: string;
    messageHe: string;
  }>;
  spamScore?: number; // 0-10, lower is better
  estimatedDeliverability?: 'excellent' | 'good' | 'fair' | 'poor';
}

// Export type for use in requirements collection
export type AutoEmailTemplatesData = Partial<AutoEmailTemplatesConfig>;

// ==================== AUTO FORM TO CRM ====================
// Note: auto-form-to-crm (service #8) is functionally identical to auto-crm-update (service #3)
// Both services handle form submissions → CRM updates
// Using type aliases to avoid code duplication

/**
 * Configuration for auto-form-to-crm service
 * Alias for AutoCRMUpdateConfig - these services are functionally identical
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md #8
 * @see AutoCRMUpdateConfig for full documentation
 */
export type AutoFormToCrmConfig = AutoCRMUpdateConfig;

/**
 * Technical requirements for auto-form-to-crm service implementation
 * Alias for AutoCRMUpdateRequirements
 * @see AutoCRMUpdateRequirements for full documentation
 */
export type AutoFormToCrmRequirements = AutoCRMUpdateRequirements;

/**
 * Service implementation status tracking for auto-form-to-crm
 * Extended from AutoCRMUpdateImplementation with service-specific ID
 */
export interface AutoFormToCrmImplementation extends Omit<AutoCRMUpdateImplementation, 'serviceId'> {
  serviceId: 'auto-form-to-crm';
}

/**
 * Setup guide steps for auto-form-to-crm implementation
 * Alias for AutoCRMUpdateSetupGuide
 * @see AutoCRMUpdateSetupGuide for full documentation
 */
export type AutoFormToCrmSetupGuide = AutoCRMUpdateSetupGuide;

// Export type for use in requirements collection
export type AutoFormToCrmData = Partial<AutoFormToCrmConfig>;

// ==================== AI FAQ BOT ====================

/**
 * Configuration for ai-faq-bot service (Service #21)
 * Based on technical requirements from AI_AGENTS_TECHNICAL_REQUIREMENTS.md
 */
export interface AIFAQBotConfig {
  // AI Provider Selection
  aiProvider: 'openai' | 'anthropic';
  model: 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'claude-3.5-sonnet' | 'claude-3.5-haiku';
  apiKeyProvided: boolean;

  // Vector Database
  vectorDatabase: 'supabase_pgvector' | 'pinecone_starter' | 'qdrant' | 'weaviate';
  vectorDbCredentialsReady: boolean;
  embeddingModel: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';

  // Knowledge Base
  knowledgeBase: {
    faqCount: number; // 50-100 minimum, 100-200 maximum
    faqFormat: 'json' | 'csv' | 'excel' | 'pdf' | 'google_docs';
    faqStorageLocation?: string; // Google Drive, Dropbox, etc.
    documentChunkingStrategy: '500_tokens' | '1000_tokens' | 'custom';
    customChunkSize?: number;
  };

  // Message Templates
  messageTemplates: {
    greeting: string;
    fallback: string; // When bot doesn't know the answer
    handoff: string; // When transferring to human
    privacyNotice: string; // GDPR compliance
  };

  // Decision Tree / Escalation
  escalationConfig: {
    failedAttemptsThreshold: number; // 2-3 failed attempts
    escalationKeywords: string[]; // e.g., ["urgent", "manager", "complaint"]
    businessHoursOnly: boolean;
    handoffEmail?: string;
    humanAgentAvailable: boolean;
  };

  // RAG Configuration
  ragConfig: {
    hybridApproach: boolean; // FAQ-links (vetted) + RAG fallback
    topKResults: number; // 3-5 recommended
    confidenceThreshold: number; // 0.7-0.8 recommended
    contextWindow: number; // 128K tokens for GPT-4o
  };

  // Website Integration
  websiteIntegration: {
    websiteUrl: string;
    chatWidgetType: 'javascript_sdk' | 'iframe' | 'api';
    chatWidgetPosition: 'bottom_right' | 'bottom_left' | 'custom';
    chatWidgetColor?: string;
    mobileResponsive: boolean;
  };

  // GDPR Compliance
  gdprCompliance: {
    conversationRetentionDays: number; // Max 30 days recommended
    encryptAtRest: boolean;
    userDeletionRights: boolean;
    privacyPolicyLink: string;
    cookieConsent: boolean;
  };

  // Rate Limits & Performance
  rateLimits: {
    requestsPerMinute: number; // GPT-4o Mini = 30K RPM Tier 1
    concurrentUsers: number; // Max ~500 for Tier 1
    dailyConversations: number; // For cost estimation
  };

  // Monitoring
  monitoring: {
    resolutionRateTarget: number; // >70% recommended
    fallbackRateTarget: number; // <20% recommended
    trackUserSatisfaction: boolean; // CSAT
    analyticsEnabled: boolean;
  };

  // Cost Planning
  costEstimation: {
    estimatedConversationsPerDay: number; // ~100 conversations/day
    averageMessagesPerConversation: number; // 5-10 messages
    estimatedMonthlyCost?: number; // Auto-calculated
  };

  // Testing & Deployment
  testing: {
    testMode: boolean;
    testAccountEmail?: string;
    testFAQsUploaded: boolean;
    vectorDbTested: boolean;
    chatWidgetTested: boolean;
  };
}

/**
 * Technical requirements for ai-faq-bot service implementation
 */
export interface AIFAQBotRequirements {
  // AI Provider Access
  aiProviderAccess: {
    provider: 'openai' | 'anthropic';
    apiKey: string;

    // OpenAI specific
    openaiConfig?: {
      model: 'gpt-4o-mini' | 'gpt-3.5-turbo';
      inputCostPer1M: number; // $0.15 for GPT-4o Mini
      outputCostPer1M: number; // $0.60 for GPT-4o Mini
      cachedInputCostPer1M: number; // $0.125 with prompt caching
      rateLimits: {
        rpm: number; // 30K for Tier 1
        tpm: number; // Tokens per minute
      };
    };

    // Anthropic specific
    anthropicConfig?: {
      model: 'claude-3.5-sonnet' | 'claude-3.5-haiku';
      inputCostPer1M: number; // $3 for Sonnet
      outputCostPer1M: number; // $15 for Sonnet
      promptCachingSavings: number; // 90% for Claude
    };
  };

  // Vector Database Access
  vectorDatabaseAccess: {
    database: 'supabase_pgvector' | 'pinecone_starter' | 'qdrant' | 'weaviate';

    // Supabase pgvector
    supabaseConfig?: {
      url: string;
      anonKey: string;
      freeTierLimit: string; // "500MB"
      paidTierCost: number; // $25/month for 8GB
    };

    // Pinecone
    pineconeConfig?: {
      apiKey: string;
      environment: string;
      index: string;
      freeTierLimits: {
        reads: number; // 1M/month
        writes: number; // 2M/month
      };
    };

    // Embedding configuration
    embeddingConfig: {
      model: string;
      dimensions: number; // 1536 for text-embedding-3-small
      costPer1MTokens: number; // $0.02
    };
  };

  // Knowledge Base Storage
  knowledgeBaseStorage: {
    storageLocation: 'google_drive' | 'dropbox' | 'local' | 'supabase';
    accessMethod: 'api' | 'manual_upload';
    apiKey?: string;
    folderId?: string;

    // FAQ structure
    faqStructure: {
      format: 'json' | 'csv';
      requiredFields: string[]; // ['question', 'answer', 'category']
      optionalFields: string[]; // ['keywords', 'metadata']
    };

    // Document processing
    documentProcessing: {
      chunkSize: number; // 500-1000 tokens
      overlap: number; // 50-100 tokens overlap
      cleaningRequired: boolean;
    };
  };

  // Website Integration
  websiteAccess: {
    websiteUrl: string;
    accessToWebsiteCode: boolean;

    // Chat widget deployment
    widgetDeployment: {
      method: 'javascript_snippet' | 'iframe_embed' | 'api_integration';
      placementInstructions: string;
      customStyling: boolean;
    };

    // Authentication
    authenticationRequired: boolean;
    userIdentification: boolean; // Track returning users
  };

  // Supabase Integration (for chat history & authentication)
  supabaseIntegration: {
    url: string;
    anonKey: string;

    // Tables
    tables: {
      conversations: boolean;
      messages: boolean;
      users: boolean;
      feedback: boolean;
    };

    // Authentication
    authentication: {
      enabled: boolean;
      provider: 'email' | 'google' | 'github' | 'anonymous';
    };
  };
}

/**
 * Service implementation status tracking for ai-faq-bot
 */
export interface AIFAQBotImplementation {
  serviceId: 'ai-faq-bot';
  config: AIFAQBotConfig;
  requirements: AIFAQBotRequirements;

  // Implementation progress
  status: 'not_started' | 'configuring' | 'testing' | 'deployed' | 'active' | 'paused';

  // Setup steps completed
  setupSteps: {
    aiProviderConfigured: boolean;
    apiKeyVerified: boolean;
    vectorDbSetup: boolean;
    knowledgeBaseUploaded: boolean;
    embeddingsGenerated: boolean;
    messageTemplatesConfigured: boolean;
    escalationRulesSet: boolean;
    websiteWidgetDeployed: boolean;
    gdprComplianceVerified: boolean;
    testConversationsCompleted: boolean;
    monitoringEnabled: boolean;
    productionLaunched: boolean;
  };

  // Performance metrics
  metrics?: {
    totalConversations: number;
    resolutionRate: number; // Target >70%
    fallbackRate: number; // Target <20%
    averageMessagesPerConversation: number;
    userSatisfactionScore: number; // CSAT 0-5
    escalationRate: number; // % of conversations escalated to human
    averageResponseTime: number; // milliseconds
    topFAQs: Array<{
      question: string;
      askCount: number;
    }>;
    missedQuestions: Array<{
      question: string;
      missCount: number;
    }>;
    lastExecuted?: Date;
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      errorMessage: string;
    }>;
  };

  // Cost tracking
  costTracking?: {
    currentMonthCost: number;
    averageCostPerConversation: number;
    tokenUsage: {
      inputTokens: number;
      outputTokens: number;
      cachedTokens: number;
    };
    projectedMonthlyCost: number;
  };

  // Maintenance
  lastTested?: Date;
  lastUpdated?: Date;
  knowledgeBaseLastUpdated?: Date;
  notes?: string;
}

/**
 * Setup guide steps for ai-faq-bot implementation
 */
export interface AIFAQBotSetupGuide {
  steps: Array<{
    id: string;
    order: number;
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
    prerequisites?: string[];
    prerequisitesHe?: string[];
    estimatedTime: number; // minutes
    actions: Array<{
      action: string;
      actionHe: string;
      details?: string;
      detailsHe?: string;
    }>;
    verificationCriteria: string;
    verificationCriteriaHe: string;
    troubleshooting?: Array<{
      issue: string;
      issueHe: string;
      solution: string;
      solutionHe: string;
    }>;
  }>;

  // Important warnings specific to ai-faq-bot
  criticalWarnings: {
    knowledgeBaseQuality: string;
    knowledgeBaseQualityHe: string;
    hybridApproach: string;
    hybridApproachHe: string;
    gdprCompliance: string;
    gdprComplianceHe: string;
    rateLimits: string;
    rateLimitsHe: string;
    costManagement: string;
    costManagementHe: string;
    monitoring: string;
    monitoringHe: string;
  };

  // Best practices
  bestPractices: {
    faqStructure: string[];
    faqStructureHe: string[];
    conversationDesign: string[];
    conversationDesignHe: string[];
    escalation: string[];
    escalationHe: string[];
    performance: string[];
    performanceHe: string[];
  };
}

// Export type for use in requirements collection
export type AIFAQBotData = Partial<AIFAQBotConfig>;

// ==================== AI TRIAGE ====================

/**
 * Category for AI triage classification
 */
export interface TriageCategory {
  id: string;
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
  keywords: string[]; // Keywords that indicate this category
  autoAssignTo?: string; // Default team/person to route to
}

/**
 * Priority rule for AI triage
 */
export interface PriorityRule {
  id: string;
  name: string;
  nameHe: string;
  conditions: Array<{
    type: 'keyword' | 'sentiment' | 'customer_tier' | 'time' | 'custom';
    operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'in_list';
    value: string | number | string[];
    field?: string; // For custom conditions
  }>;
  resultPriority: 'urgent' | 'high' | 'medium' | 'low';
  escalate?: boolean; // Auto-escalate if this rule matches
}

/**
 * Routing rule that maps category + priority to team/person
 */
export interface RoutingRule {
  id: string;
  category: string; // Category ID
  priority: 'urgent' | 'high' | 'medium' | 'low';
  routeTo: {
    type: 'team' | 'person' | 'department' | 'round_robin';
    target: string; // Team name, person email, or department ID
    backupTarget?: string; // Fallback if primary target unavailable
  };
  notificationMethod: 'email' | 'sms' | 'whatsapp' | 'slack' | 'teams' | 'multiple';
  notificationTargets?: string[]; // Email addresses, phone numbers, etc.
  autoAssign?: boolean; // Automatically assign to target without manual intervention
  slaMinutes?: number; // SLA response time in minutes
}

/**
 * Sentiment analysis configuration
 */
export interface SentimentAnalysisConfig {
  enabled: boolean;
  thresholds: {
    veryNegative: number; // e.g., -0.8 (range -1 to 1)
    negative: number; // e.g., -0.5
    neutral: number; // e.g., 0
    positive: number; // e.g., 0.5
    veryPositive: number; // e.g., 0.8
  };
  emotionDetection: {
    enabled: boolean;
    detectFrustration: boolean;
    detectAnger: boolean;
    detectUrgency: boolean;
    detectExcitement: boolean;
    detectDisappointment: boolean;
  };
  escalationRules: Array<{
    sentimentThreshold: number; // e.g., -0.5 for negative sentiment
    emotion?: 'frustration' | 'anger' | 'urgency' | 'disappointment';
    action: 'increase_priority' | 'escalate_to_manager' | 'send_alert' | 'auto_assign_senior';
    targetPriority?: 'urgent' | 'high';
  }>;
}

/**
 * Configuration for ai-triage service (Service #27)
 * Based on technical requirements from AI_AGENTS_TECHNICAL_REQUIREMENTS.md
 */
export interface AITriageConfig {
  // Basic Information
  aiProvider: 'openai' | 'anthropic' | 'google' | 'azure_openai';
  aiModel: string; // e.g., "gpt-4o-mini", "claude-3-haiku", "gemini-pro"
  crmSystem?: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  ticketingSystem?: 'zendesk' | 'freshdesk' | 'jira_service_desk' | 'helpscout' | 'intercom' | 'other';
  n8nAccess: boolean;

  // AI Model Configuration
  modelSettings: {
    temperature: number; // 0-2, lower = more deterministic
    maxTokens: number; // Max tokens for classification response
    confidenceThreshold: number; // 0-1, minimum confidence to auto-classify
  };

  // Category Taxonomy (5-10 categories)
  categories: TriageCategory[];

  // Priority Rules
  priorityRules: PriorityRule[];

  // Routing Matrix
  routingRules: RoutingRule[];

  // Sentiment Analysis
  sentimentAnalysis: SentimentAnalysisConfig;

  // VIP Customer Handling
  vipHandling: {
    enabled: boolean;
    vipIdentificationMethod: 'crm_field' | 'customer_tier' | 'email_domain' | 'manual_list';
    vipField?: string; // CRM field name for VIP flag
    vipTiers?: string[]; // e.g., ['platinum', 'gold']
    vipDomains?: string[]; // e.g., ['enterprise-client.com']
    vipEmails?: string[]; // Manual list of VIP emails
    autoPriorityBoost: boolean; // Auto-increase priority for VIPs
    vipPriority: 'urgent' | 'high';
    vipNotificationMethod: 'immediate_alert' | 'dedicated_queue' | 'auto_assign_senior';
  };

  // Training Data
  trainingData: {
    historicalInquiriesCount: number; // Number of labeled historical inquiries
    trainingCompleted: boolean;
    lastTrainingDate?: Date;
    accuracyRate?: number; // Percentage of correct classifications
    manualReviewEnabled: boolean; // Human review low-confidence classifications
  };

  // Performance & Monitoring
  performance: {
    processingTimeTarget: number; // Target processing time in seconds (e.g., 5)
    dailyInquiryVolume: number; // Expected number of inquiries per day
    estimatedMonthlyCost?: number; // Estimated AI API cost per month
    monitorAccuracy: boolean; // Track manual re-categorization rate
    accuracyTargetPercentage: number; // e.g., 90 (target <10% re-categorization)
  };

  // Integration
  integrationChannels: Array<{
    channel: 'email' | 'web_form' | 'chat' | 'whatsapp' | 'sms' | 'phone_transcript';
    enabled: boolean;
    webhookUrl?: string;
    apiEndpoint?: string;
  }>;

  // Error Handling
  errorHandling: {
    onLowConfidence: 'manual_review' | 'default_category' | 'alert_admin';
    defaultCategory?: string; // Category ID for low-confidence cases
    fallbackPriority: 'medium' | 'high';
    errorNotificationEmail: string;
    retryAttempts: number;
    logAllClassifications: boolean;
  };

  // n8n Workflow
  n8nEndpoint?: string;
  testMode: boolean;
  testAccountAvailable: boolean;
}

/**
 * Technical requirements for ai-triage service implementation
 */
export interface AITriageRequirements {
  // AI Provider Access
  aiProviderAccess: {
    provider: 'openai' | 'anthropic' | 'google' | 'azure_openai';
    apiKey: string;
    modelName: string;

    // OpenAI
    openaiCredentials?: {
      apiKey: string;
      organization?: string;
      model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo';
      costPer1MInputTokens: number; // e.g., 0.15
      costPer1MOutputTokens: number; // e.g., 0.60
    };

    // Anthropic
    anthropicCredentials?: {
      apiKey: string;
      model: 'claude-3-haiku' | 'claude-3-sonnet' | 'claude-3-opus';
      costPer1MInputTokens: number;
      costPer1MOutputTokens: number;
    };

    // Rate Limits
    rateLimits: {
      requestsPerMinute: number;
      tokensPerMinute: number;
      dailyBudget?: number; // Dollar amount
    };
  };

  // CRM Access (for VIP detection and customer data)
  crmAccess?: {
    system: string;
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    customerFields: string[]; // Fields to fetch for classification context
    vipIndicatorField?: string;
  };

  // Ticketing System Access
  ticketingSystemAccess?: {
    system: string;
    authMethod: string;
    apiKey?: string;
    webhookSupport: boolean;
    customFieldsAvailable: boolean;
    autoAssignmentSupported: boolean;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    aiIntegrationNode: boolean; // n8n has native OpenAI/Anthropic nodes
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Training Dataset
  trainingDataset?: {
    source: 'csv_export' | 'crm_export' | 'ticketing_system' | 'manual_entry';
    sampleCount: number; // Should be 100-200 minimum
    labeled: boolean;
    categories: string[];
    dataQuality: 'good' | 'needs_cleanup' | 'poor';
  };
}

/**
 * Service implementation status tracking
 */
export interface AITriageImplementation {
  serviceId: 'ai-triage';
  config: AITriageConfig;
  requirements: AITriageRequirements;

  // Implementation progress
  status: 'not_started' | 'configuring' | 'training' | 'testing' | 'deployed' | 'active' | 'paused';

  // Setup steps completed
  setupSteps: {
    aiProviderConfigured: boolean;
    categoryTaxonomyDefined: boolean;
    priorityRulesConfigured: boolean;
    routingMatrixConfigured: boolean;
    sentimentAnalysisEnabled: boolean;
    vipHandlingConfigured: boolean;
    trainingDataPrepared: boolean;
    modelTrained: boolean;
    crmIntegrationTested: boolean;
    ticketingIntegrationTested: boolean;
    n8nWorkflowDeployed: boolean;
    accuracyTestingCompleted: boolean;
    productionLaunched: boolean;
  };

  // Performance metrics
  metrics?: {
    totalInquiriesProcessed: number;
    averageProcessingTime: number; // in seconds
    accuracyRate: number; // percentage of correct classifications
    manualReviewRate: number; // percentage requiring manual review
    sentimentBreakdown: {
      veryNegative: number;
      negative: number;
      neutral: number;
      positive: number;
      veryPositive: number;
    };
    categoryBreakdown: Record<string, number>; // category name -> count
    priorityBreakdown: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
    vipInquiriesCount: number;
    averageResponseTimeSLA: number; // in minutes
    slaBreachCount: number;
    estimatedMonthlyCost: number; // AI API costs
    lastExecuted?: Date;
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      errorMessage: string;
      inquiryText?: string;
    }>;
  };

  // Maintenance
  lastTested?: Date;
  lastUpdated?: Date;
  lastRetraining?: Date;
  notes?: string;
}

/**
 * Setup guide steps for implementation
 */
export interface AITriageSetupGuide {
  steps: Array<{
    id: string;
    order: number;
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
    prerequisites?: string[];
    prerequisitesHe?: string[];
    estimatedTime: number; // minutes
    actions: Array<{
      action: string;
      actionHe: string;
      details?: string;
      detailsHe?: string;
    }>;
    verificationCriteria: string;
    verificationCriteriaHe: string;
    troubleshooting?: Array<{
      issue: string;
      issueHe: string;
      solution: string;
      solutionHe: string;
    }>;
  }>;

  // Important warnings specific to ai-triage
  criticalWarnings: {
    trainingDataQuality: string;
    trainingDataQualityHe: string;
    sentimentAccuracy: string;
    sentimentAccuracyHe: string;
    vipHandling: string;
    vipHandlingHe: string;
    costMonitoring: string;
    costMonitoringHe: string;
    accuracyMonitoring: string;
    accuracyMonitoringHe: string;
  };

  // Best practices
  bestPractices: {
    categoryDesign: string[];
    categoryDesignHe: string[];
    priorityRules: string[];
    priorityRulesHe: string[];
    sentimentAnalysis: string[];
    sentimentAnalysisHe: string[];
    routing: string[];
    routingHe: string[];
  };
}

// Export type for use in requirements collection
export type AITriageData = Partial<AITriageConfig>;

// ==================== AUTO SMS/WHATSAPP ====================

/**
 * Configuration for auto-sms-whatsapp service (Service #2)
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoSmsWhatsappConfig {
  // Basic Information
  messagingProvider: 'whatsapp_business_api' | 'twilio' | 'both';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  n8nAccess: boolean;

  // WhatsApp Business API Configuration
  whatsappConfig?: {
    hasBusinessAccount: boolean; // Not WhatsApp Business App!
    phoneNumberId?: string; // From Meta Business Suite
    wabaId?: string; // WhatsApp Business Account ID
    accessToken?: string; // System User Token (permanent)
    webhookVerificationToken?: string;
    webhookCallbackUrl?: string; // HTTPS required
    businessVerified: boolean; // Meta Business Verification (3-7 days)
    phoneNumberStatus: 'pending' | 'verified' | 'active';
  };

  // Message Templates (Meta approved)
  messageTemplates: Array<{
    id: string;
    name: string;
    nameHe: string;
    category: 'marketing' | 'utility' | 'authentication';
    language: 'he' | 'en' | 'ar';
    headerType?: 'text' | 'image' | 'video' | 'document';
    headerContent?: string;
    bodyText: string;
    footerText?: string;
    buttons?: Array<{
      type: 'quick_reply' | 'call_to_action' | 'url';
      text: string;
      url?: string;
      phoneNumber?: string;
    }>;
    variables: string[]; // {{1}}, {{2}}, etc.
    status: 'pending_approval' | 'approved' | 'rejected' | 'disabled';
    approvalDate?: Date;
    rejectionReason?: string;
  }>;

  // Twilio Configuration
  twilioConfig?: {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string; // Twilio phone number
    whatsappEnabled: boolean;
    smsEnabled: boolean;
    rateLimitsKnown: boolean;
    dailySmsLimit?: number; // Typically 200 SMS/hour
  };

  // CRM Integration
  crmCredentialsReady: boolean;
  crmModule: 'leads' | 'contacts' | 'potentials';
  phoneNumberField: string; // CRM field containing phone number
  phoneFormatValidation: boolean; // International format required (+972...)

  // Rate Limits & Tier Management
  whatsappRateLimits: {
    currentTier: 'tier_1' | 'tier_2' | 'tier_3'; // Tier 1: 1K/day, Tier 2: 10K/day, Tier 3: 100K/day
    dailyLimit: number;
    messagesPerSecond: number;
    qualityRating: 'green' | 'yellow' | 'red'; // Affects rate limits
  };

  // Opt-in Management
  optInManagement: {
    enabled: boolean;
    optInRequired: boolean; // Legal requirement
    optInMethod: 'crm_field' | 'checkbox' | 'initial_message';
    optInCrmField?: string;
    optOutHandling: boolean;
    optOutKeywords: string[]; // e.g., ['STOP', 'עצור']
  };

  // Automation Triggers
  triggers: Array<{
    id: string;
    name: string;
    nameHe: string;
    triggerType: 'new_lead' | 'lead_status_change' | 'time_based' | 'manual';
    crmTriggerField?: string;
    crmTriggerValue?: string;
    templateId: string;
    delay?: number; // minutes
    active: boolean;
  }>;

  // Reply Handling (24-hour window)
  replyHandling: {
    enabled: boolean;
    conversationWindow: 24; // hours - WhatsApp limitation
    autoReplyToResponses: boolean;
    updateCrmOnReply: boolean;
    crmReplyStatusField?: string;
    humanHandoffTrigger: boolean; // Trigger human agent after response
  };

  // Error Handling
  errorHandling: {
    onTemplateRejection: 'alert_admin' | 'use_fallback' | 'pause_automation';
    onInvalidPhoneNumber: 'skip' | 'alert' | 'log';
    onRateLimitExceeded: 'queue' | 'wait' | 'alert';
    onQualityRatingDrop: 'reduce_volume' | 'pause' | 'alert';
    errorNotificationEmail: string;
    retryAttempts: number;
    logFailures: boolean;
  };

  // Legal & Compliance
  compliance: {
    optInDocumented: boolean;
    privacyPolicyLink?: string;
    dataRetentionDays: number; // WhatsApp conversations
    gdprCompliant: boolean;
    israeliPrivacyLaw: boolean;
  };

  // n8n Workflow
  n8nEndpoint?: string;
  testMode: boolean;
  testPhoneNumbers?: string[]; // For testing without affecting real customers
}

/**
 * Technical requirements for auto-sms-whatsapp service implementation
 */
export interface AutoSmsWhatsappRequirements {
  // Meta Business Suite Access (for WhatsApp)
  metaBusinessAccess?: {
    businessAccountId: string;
    businessVerificationStatus: 'pending' | 'verified' | 'rejected';
    verificationDuration: string; // "3-7 days"
    phoneNumberId: string;
    phoneNumber: string; // Must be dedicated, not used in WhatsApp App
    wabaId: string;
    accessToken: string; // System User Token (permanent, not 24-hour)
    webhookSetup: {
      verificationToken: string;
      callbackUrl: string; // Must be HTTPS
      eventsSubscribed: string[]; // ['messages', 'message_status']
    };
  };

  // Twilio Access (alternative/additional)
  twilioAccess?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    whatsappSandbox: boolean; // For testing
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    rateLimits: {
      smsPerHour: number;
      whatsappPerDay: number;
    };
    pricing: {
      smsPerMessage: number;
      whatsappPerMessage: number;
    };
  };

  // Message Template Management
  messageTemplates: {
    templatesCreated: boolean;
    templateApprovalStatus: 'pending' | 'approved' | 'rejected';
    approvalTimeline: string; // "24-72 hours"
    templateGuidelines: {
      noLinks: boolean; // Links often cause rejection
      noPricing: boolean; // Pricing often causes rejection
      variablesLimit: number; // Max variables allowed
      characterLimit: number; // Max characters per template
    };
    rejectionRate?: number; // Historical rejection rate
  };

  // CRM Integration
  crmAccess: {
    system: string;
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    phoneNumberField: string;
    phoneNumberFormat: 'international'; // +972501234567 required
    optInField?: string;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    whatsappIntegration: boolean; // n8n has WhatsApp node
    twilioIntegration: boolean; // n8n has Twilio node
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Prerequisites
  prerequisites: {
    dedicatedPhoneNumber: boolean;
    businessVerification: boolean;
    metaBusinessAccount: boolean;
    messageTemplatesReady: boolean;
    optInMechanismReady: boolean;
    internationalPhoneFormat: boolean;
  };
}

/**
 * Service implementation status tracking
 */
export interface AutoSmsWhatsappImplementation {
  serviceId: 'auto-sms-whatsapp';
  config: AutoSmsWhatsappConfig;
  requirements: AutoSmsWhatsappRequirements;

  // Implementation progress
  status: 'not_started' | 'business_verification' | 'template_approval' | 'configuring' | 'testing' | 'deployed' | 'active' | 'paused';

  // Setup steps completed
  setupSteps: {
    metaBusinessAccountCreated: boolean;
    businessVerificationCompleted: boolean;
    phoneNumberAcquired: boolean;
    whatsappBusinessApiConfigured: boolean;
    messageTemplatesSubmitted: boolean;
    messageTemplatesApproved: boolean;
    webhookConfigured: boolean;
    crmIntegrationTested: boolean;
    optInMechanismImplemented: boolean;
    n8nWorkflowDeployed: boolean;
    testMessagesSent: boolean;
    qualityRatingMonitored: boolean;
    productionLaunched: boolean;
  };

  // Performance metrics
  metrics?: {
    totalMessagesSent: number;
    whatsappMessagesSent: number;
    smsMessagesSent: number;
    deliveryRate: number; // percentage
    readRate: number; // percentage (WhatsApp read receipts)
    responseRate: number; // percentage of recipients who replied
    currentTier: 'tier_1' | 'tier_2' | 'tier_3';
    qualityRating: 'green' | 'yellow' | 'red';
    templateRejectionCount: number;
    optOutCount: number;
    invalidPhoneNumberCount: number;
    averageCostPerMessage: number;
    estimatedMonthlyCost: number;
    lastExecuted?: Date;
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      errorMessage: string;
      phoneNumber?: string;
      templateId?: string;
    }>;
  };

  // Maintenance
  lastTested?: Date;
  lastUpdated?: Date;
  nextBusinessVerificationCheck?: Date;
  notes?: string;
}

/**
 * Setup guide steps for implementation
 */
export interface AutoSmsWhatsappSetupGuide {
  steps: Array<{
    id: string;
    order: number;
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
    prerequisites?: string[];
    prerequisitesHe?: string[];
    estimatedTime: number; // minutes
    actions: Array<{
      action: string;
      actionHe: string;
      details?: string;
      detailsHe?: string;
    }>;
    verificationCriteria: string;
    verificationCriteriaHe: string;
    troubleshooting?: Array<{
      issue: string;
      issueHe: string;
      solution: string;
      solutionHe: string;
    }>;
  }>;

  // Important warnings
  criticalWarnings: {
    templateRestrictions: string;
    templateRestrictionsHe: string;
    conversationWindow: string;
    conversationWindowHe: string;
    phoneNumberFormat: string;
    phoneNumberFormatHe: string;
    optInRequirement: string;
    optInRequirementHe: string;
    qualityRating: string;
    qualityRatingHe: string;
  };
}

// Export type for use in requirements collection
export type AutoSmsWhatsappData = Partial<AutoSmsWhatsappConfig>;

// ==================== AUTO TEAM ALERTS ====================

/**
 * Configuration for auto-team-alerts service (Service #4)
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoTeamAlertsConfig {
  // Basic Information
  notificationChannels: Array<'slack' | 'teams' | 'email' | 'sms' | 'push'>;
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  n8nAccess: boolean;

  // Lead Scoring Configuration
  leadScoring: {
    enabled: boolean;
    scoringCriteria: Array<{
      id: string;
      criterion: string; // e.g., "budget > $10,000"
      criterionHe: string;
      field: string; // CRM field name
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_list';
      value: string | number | string[];
      points: number;
    }>;
    highPriorityThreshold: number; // Total points to be considered "important"
    mediumPriorityThreshold: number;
    autoCalculate: boolean;
  };

  // Notification Channels Setup
  slackConfig?: {
    enabled: boolean;
    workspaceUrl?: string;
    webhookUrl?: string;
    channelName?: string; // e.g., #sales-alerts
    mentionUsers?: string[]; // @user mentions for urgent alerts
    messageFormat: 'minimal' | 'detailed' | 'custom';
    customTemplate?: string;
    rateLimit: number; // 1 message/second per webhook
  };

  teamsConfig?: {
    enabled: boolean;
    webhookUrl?: string;
    channelName?: string;
    cardFormat: 'adaptive' | 'simple';
    actionButtons: boolean; // "View in CRM", "Assign to me", etc.
    customTemplate?: string;
  };

  emailConfig?: {
    enabled: boolean;
    emailService: 'sendgrid' | 'mailgun' | 'smtp';
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    recipients: string[];
    subjectTemplate: string; // e.g., "🔥 Hot Lead: {{leadName}}"
    htmlTemplate?: string;
    ccOnHighPriority?: string[]; // Additional CCs for high-priority leads
  };

  smsConfig?: {
    enabled: boolean;
    provider: 'twilio' | 'other';
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
    recipients: string[]; // Phone numbers to alert
    messageTemplate: string; // Max 160 chars for SMS
    onlyForUrgent: boolean; // SMS only for urgent/high-priority
  };

  pushConfig?: {
    enabled: boolean;
    provider: 'onesignal' | 'firebase' | 'other';
    apiKey?: string;
    appId?: string;
    userSegments?: string[]; // Which users to notify
    messageTemplate: string;
  };

  // Alert Rules
  alertRules: Array<{
    id: string;
    name: string;
    nameHe: string;
    trigger: 'new_lead' | 'lead_score_change' | 'field_change' | 'time_based';
    conditions: Array<{
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'changed_to';
      value: any;
    }>;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    notificationChannels: Array<'slack' | 'teams' | 'email' | 'sms' | 'push'>;
    recipients: {
      slack?: string[]; // User IDs or @mentions
      teams?: string[];
      email?: string[];
      sms?: string[];
      push?: string[];
    };
    active: boolean;
    quietHours?: {
      enabled: boolean;
      startHour: number; // 22 (10 PM)
      endHour: number; // 8 (8 AM)
      daysOfWeek: number[]; // 0-6, Sunday = 0
    };
  }>;

  // Alert Fatigue Prevention
  alertFatigue: {
    maxAlertsPerHour: number; // Prevent spam
    maxAlertsPerDay: number;
    deduplicationEnabled: boolean;
    deduplicationWindow: number; // minutes - don't send same alert twice within X minutes
    escalationOnly: boolean; // Only alert on priority increase, not every update
  };

  // Team Roster
  teamRoster: Array<{
    id: string;
    name: string;
    role: string; // "Sales Manager", "Sales Rep", "BDR"
    email: string;
    phone?: string;
    slackUserId?: string;
    teamsUserId?: string;
    availability: {
      daysOfWeek: number[]; // 1-5 for Mon-Fri
      startHour: number;
      endHour: number;
      timezone: string;
    };
    alertPreference: Array<'slack' | 'teams' | 'email' | 'sms' | 'push'>;
    receiveUrgentOnly: boolean;
  }>;

  // CRM Integration
  crmCredentialsReady: boolean;
  crmWebhookSupport: boolean;
  crmRealTimeUpdates: boolean;
  crmModule: 'leads' | 'contacts' | 'potentials';

  // Error Handling
  errorHandling: {
    onSlackFailure: 'fallback_to_email' | 'retry' | 'skip';
    onTeamsFailure: 'fallback_to_email' | 'retry' | 'skip';
    onEmailFailure: 'fallback_to_sms' | 'retry' | 'skip';
    retryAttempts: number;
    retryDelay: number; // seconds
    errorNotificationEmail: string;
    logAllAlerts: boolean;
  };

  // n8n Workflow
  n8nEndpoint?: string;
  testMode: boolean;
  testRecipients?: {
    slack?: string;
    teams?: string;
    email?: string;
    sms?: string;
  };
}

/**
 * Technical requirements for auto-team-alerts service implementation
 */
export interface AutoTeamAlertsRequirements {
  // Slack Access
  slackAccess?: {
    workspaceUrl: string;
    incomingWebhookEnabled: boolean;
    webhookUrl: string;
    channel: string;
    permissions: string[];
    rateLimit: string; // "1 message/second"
  };

  // Microsoft Teams Access
  teamsAccess?: {
    tenantId?: string;
    webhookUrl: string;
    channelName: string;
    connectorInstalled: boolean;
    adaptiveCardsSupported: boolean;
  };

  // Email Service Access
  emailAccess?: {
    provider: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    dailyLimit: number;
  };

  // SMS Service Access
  smsAccess?: {
    provider: 'twilio' | 'other';
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    costPerSms: number;
    monthlyBudget?: number;
  };

  // Push Notification Access
  pushAccess?: {
    provider: 'onesignal' | 'firebase';
    apiKey: string;
    appId?: string;
    userSegments: string[];
    platforms: string[]; // ['web', 'ios', 'android']
  };

  // CRM Access
  crmAccess: {
    system: string;
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    webhookSupport: boolean;
    realTimeWebhooks: boolean;
    fieldsAvailable: string[];
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    multiChannelSupport: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

/**
 * Service implementation status tracking
 */
export interface AutoTeamAlertsImplementation {
  serviceId: 'auto-team-alerts';
  config: AutoTeamAlertsConfig;
  requirements: AutoTeamAlertsRequirements;

  // Implementation progress
  status: 'not_started' | 'configuring' | 'testing' | 'deployed' | 'active' | 'paused';

  // Setup steps completed
  setupSteps: {
    leadScoringConfigured: boolean;
    slackWebhookConfigured: boolean;
    teamsWebhookConfigured: boolean;
    emailServiceConfigured: boolean;
    smsServiceConfigured: boolean;
    pushServiceConfigured: boolean;
    alertRulesDefined: boolean;
    teamRosterConfigured: boolean;
    quietHoursConfigured: boolean;
    crmWebhookTested: boolean;
    n8nWorkflowDeployed: boolean;
    testAlertsVerified: boolean;
    alertFatiguePreventionTested: boolean;
    productionLaunched: boolean;
  };

  // Performance metrics
  metrics?: {
    totalAlertsSent: number;
    alertsByChannel: {
      slack: number;
      teams: number;
      email: number;
      sms: number;
      push: number;
    };
    alertsByPriority: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
    averageAlertTime: number; // seconds from lead creation to alert sent
    deliveryRate: number; // percentage
    slackFailureCount: number;
    teamsFailureCount: number;
    emailFailureCount: number;
    smsFailureCount: number;
    alertsSuppressed: number; // Due to fatigue prevention
    lastExecuted?: Date;
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      errorMessage: string;
      channel?: string;
      leadId?: string;
    }>;
  };

  // Maintenance
  lastTested?: Date;
  lastUpdated?: Date;
  notes?: string;
}

/**
 * Setup guide steps for implementation
 */
export interface AutoTeamAlertsSetupGuide {
  steps: Array<{
    id: string;
    order: number;
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
    prerequisites?: string[];
    prerequisitesHe?: string[];
    estimatedTime: number;
    actions: Array<{
      action: string;
      actionHe: string;
      details?: string;
      detailsHe?: string;
    }>;
    verificationCriteria: string;
    verificationCriteriaHe: string;
    troubleshooting?: Array<{
      issue: string;
      issueHe: string;
      solution: string;
      solutionHe: string;
    }>;
  }>;

  criticalWarnings: {
    alertFatigue: string;
    alertFatigueHe: string;
    priorityLogic: string;
    priorityLogicHe: string;
    slackRateLimit: string;
    slackRateLimitHe: string;
    quietHours: string;
    quietHoursHe: string;
  };
}

// Export type for use in requirements collection
export type AutoTeamAlertsData = Partial<AutoTeamAlertsConfig>;

// ==================== AUTO LEAD WORKFLOW ====================

/**
 * Service #5: Auto Lead Workflow
 * ניהול מקצה לקצה של לידים - קליטה, חלוקה לסוכנים, מעקב אוטומטי
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoLeadWorkflowRequirements {
  // CRM System Access
  crmAccess: {
    system: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    fullAccess: boolean; // Create, Read, Update, Assign
    leadStages: string[]; // ['New', 'Contacted', 'Qualified', 'Demo', 'Closed']
  };

  // Lead Assignment Logic
  leadAssignment: {
    strategy: 'round_robin' | 'territory_based' | 'skill_based' | 'load_balanced';
    salesTeamRoster: Array<{
      agentId: string;
      name: string;
      email: string;
      territories?: string[];
      skills?: string[];
      maxLeadsPerDay?: number;
      availability: {
        daysOfWeek: number[];
        startHour: number;
        endHour: number;
        timezone: string;
      };
    }>;
    fallbackAgent?: string; // If no agent available
  };

  // Email Automation
  emailAutomation: {
    provider: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    templates: Array<{
      stageName: string;
      subject: string;
      htmlContent: string;
      sendDelay?: number; // minutes
    }>;
  };

  // WhatsApp/SMS Integration
  messagingIntegration?: {
    whatsappEnabled: boolean;
    smsEnabled: boolean;
    provider: 'twilio' | 'whatsapp_business_api';
    credentials: {
      accountSid?: string;
      authToken?: string;
      phoneNumber?: string;
      wabaId?: string;
      accessToken?: string;
    };
    messageTemplates: Array<{
      stageName: string;
      templateId: string;
      messageText: string;
    }>;
  };

  // Calendar Integration
  calendarIntegration?: {
    enabled: boolean;
    provider: 'google_calendar' | 'microsoft_graph';
    apiKey: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    followUpScheduling: boolean; // Auto-schedule follow-up tasks
  };

  // Task Management (Optional)
  taskManagement?: {
    enabled: boolean;
    system: 'asana' | 'monday' | 'clickup' | 'crm_tasks';
    apiKey?: string;
    projectId?: string;
    autoCreateTasks: boolean;
  };

  // Workflow Stages Configuration
  workflowStages: Array<{
    stageName: string;
    slaHours: number; // Max time before escalation
    automationActions: Array<{
      actionType: 'email' | 'sms' | 'whatsapp' | 'task' | 'assignment';
      trigger: 'on_entry' | 'after_delay' | 'on_no_response';
      delayMinutes?: number;
      templateId?: string;
    }>;
    exitConditions: string[]; // Conditions to move to next stage
  }>;

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Lead Enrichment (Optional)
  leadEnrichment?: {
    enabled: boolean;
    provider: 'clearbit' | 'hunter_io' | 'zoominfo';
    apiKey: string;
    enrichFields: string[]; // ['company_size', 'industry', 'revenue']
  };
}

// ==================== AUTO SMART FOLLOWUP ====================

/**
 * Service #6: Auto Smart Followup
 * מעקבים אוטומטיים חכמים על בסיס התנהגות הליד
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoSmartFollowupRequirements {
  // Behavioral Tracking
  behavioralTracking: {
    crmActivityLog: boolean;
    websiteTracking: boolean;
    trackingProvider?: 'google_analytics' | 'mixpanel' | 'segment';
    apiKey?: string;
    trackingId?: string;
  };

  // Email Engagement Tracking
  emailTracking: {
    provider: 'sendgrid' | 'mailgun';
    apiKey: string;
    eventWebhook: string; // For open/click events
    trackOpens: boolean;
    trackClicks: boolean;
    trackUnsubscribes: boolean;
  };

  // WhatsApp Read Receipts
  whatsappTracking?: {
    enabled: boolean;
    whatsappBusinessApiAccess: boolean;
    wabaId: string;
    accessToken: string;
    webhookUrl: string;
    trackReadReceipts: boolean;
  };

  // Lead Engagement Scoring
  engagementScoring: {
    scoringRules: Array<{
      action: 'email_opened' | 'email_clicked' | 'whatsapp_read' | 'whatsapp_replied' | 'website_visit' | 'form_submission';
      points: number;
      decayDays?: number; // Points decay after X days
    }>;
    highEngagementThreshold: number;
    mediumEngagementThreshold: number;
    lowEngagementThreshold: number;
  };

  // Multi-Channel Follow-up
  multiChannelAccess: {
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    smsEnabled: boolean;
    emailCredentials?: {
      provider: 'sendgrid' | 'mailgun';
      apiKey: string;
    };
    whatsappCredentials?: {
      wabaId: string;
      accessToken: string;
    };
    smsCredentials?: {
      provider: 'twilio';
      accountSid: string;
      authToken: string;
      phoneNumber: string;
    };
  };

  // Follow-up Cadence
  followupCadence: {
    cadencePlans: Array<{
      planName: string;
      planNameHe: string;
      engagementLevel: 'high' | 'medium' | 'low';
      steps: Array<{
        dayNumber: number;
        channel: 'email' | 'whatsapp' | 'sms';
        templateId: string;
        condition?: string; // e.g., "if not opened previous email"
      }>;
      maxFollowups: number;
      stopOnReply: boolean;
    }>;
  };

  // AI/ML Decision Logic (Optional)
  aiDecisionLogic?: {
    enabled: boolean;
    provider: 'openai' | 'custom';
    apiKey?: string;
    model?: string;
    useAiForTiming: boolean; // AI decides best time to send
    useAiForChannel: boolean; // AI decides best channel
  };

  // CRM Integration
  crmAccess: {
    system: string;
    authMethod: 'oauth' | 'api_key';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    activityLogAccess: boolean;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    conditionalLogic: boolean; // n8n IF nodes for decision tree
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Opt-out Management
  optOutManagement: {
    enabled: boolean;
    optOutKeywords: string[]; // ['STOP', 'עצור', 'UNSUBSCRIBE']
    optOutHandling: 'immediate' | 'end_of_cadence';
    optOutStorage: 'crm_field' | 'database';
  };
}

// ==================== AUTO MEETING SCHEDULER ====================

/**
 * Service #7: Auto Meeting Scheduler
 * תזמון פגישות אוטומטי עם סנכרון ללוח שנה ותזכורות
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoMeetingSchedulerRequirements {
  // Calendar API Access
  calendarAccess: {
    provider: 'google_calendar' | 'microsoft_graph' | 'both';

    // Google Calendar
    googleCredentials?: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      calendarId: string;
    };

    // Microsoft Graph (Outlook/Office 365)
    microsoftCredentials?: {
      tenantId: string;
      clientId: string;
      clientSecret: string;
      refreshToken: string;
    };

    // Permissions
    readCalendar: boolean;
    writeCalendar: boolean;
  };

  // Scheduling Tool Integration (Optional)
  schedulingTool?: {
    enabled: boolean;
    tool: 'calendly' | 'cal_com' | 'custom';
    apiKey?: string;
    eventTypes?: Array<{
      id: string;
      name: string;
      duration: number; // minutes
    }>;
  };

  // Video Conferencing
  videoConferencing: {
    enabled: boolean;
    provider: 'zoom' | 'google_meet' | 'microsoft_teams';

    // Zoom
    zoomCredentials?: {
      accountId: string;
      clientId: string;
      clientSecret: string;
      minPlan: 'pro' | 'business'; // Pro minimum for API
    };

    // Google Meet (uses Google Calendar API)
    googleMeetEnabled?: boolean;

    // Microsoft Teams
    teamsCredentials?: {
      tenantId: string;
      clientId: string;
      clientSecret: string;
    };

    autoGenerateMeetingLink: boolean;
  };

  // Email Service
  emailService: {
    provider: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    templates: {
      confirmation: string;
      reminder24h: string;
      reminder1h: string;
      cancellation: string;
      rescheduling: string;
    };
  };

  // CRM Integration
  crmAccess: {
    system: 'zoho' | 'salesforce' | 'hubspot' | 'other';
    authMethod: 'oauth' | 'api_key';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    logMeetingsInCrm: boolean;
    meetingModule: 'events' | 'activities' | 'meetings';
  };

  // Availability Configuration
  availabilityConfig: {
    workingHours: {
      daysOfWeek: number[]; // 1-5 for Mon-Fri
      startHour: number;
      endHour: number;
      timezone: string;
    };
    bufferTime: number; // minutes between meetings
    minimumNotice: number; // hours - minimum time before meeting can be scheduled
    maximumAdvance: number; // days - how far in advance to allow booking
    blockedDates?: string[]; // ISO date strings
  };

  // Meeting Types
  meetingTypes: Array<{
    id: string;
    name: string;
    nameHe: string;
    duration: number; // minutes
    description?: string;
    descriptionHe?: string;
    videoConferenceRequired: boolean;
    calendarColor?: string;
    reminderEnabled: boolean;
  }>;

  // Timezone Handling
  timezoneConfig: {
    defaultTimezone: string;
    supportedTimezones: string[];
    autoDetectTimezone: boolean;
    displayTimezoneInEmails: boolean;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Cancellation/Rescheduling
  cancellationConfig: {
    allowCancellation: boolean;
    minimumCancellationNotice: number; // hours
    allowRescheduling: boolean;
    maxReschedules: number;
    noShowHandling: boolean;
  };
}

// ==================== AUTO NOTIFICATIONS ====================

/**
 * Service #10: Auto Notifications
 * מערכת התראות חכמה במגוון ערוצים (Email, SMS, Push, Slack)
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoNotificationsRequirements {
  // Email Channel
  emailChannel?: {
    enabled: boolean;
    provider: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    dailyLimit: number;
  };

  // SMS Channel
  smsChannel?: {
    enabled: boolean;
    provider: 'twilio' | 'other';
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
    costPerSms: number;
    dailyBudget?: number;
  };

  // Push Notifications
  pushChannel?: {
    enabled: boolean;
    provider: 'onesignal' | 'firebase' | 'other';
    apiKey: string;
    appId?: string;
    userSegments?: string[];
    platforms: Array<'web' | 'ios' | 'android'>;
  };

  // Slack Channel
  slackChannel?: {
    enabled: boolean;
    webhookUrl?: string;
    botToken?: string;
    defaultChannel: string;
    allowDirectMessages: boolean;
  };

  // Microsoft Teams Channel
  teamsChannel?: {
    enabled: boolean;
    webhookUrl: string;
    channelName: string;
    adaptiveCardsEnabled: boolean;
  };

  // User Preferences System
  userPreferences: {
    storageMethod: 'crm_fields' | 'database' | 'both';
    crmFields?: {
      emailNotifications: string;
      smsNotifications: string;
      pushNotifications: string;
    };
    databaseSchema?: {
      tableName: string;
      userIdField: string;
      preferencesField: string;
    };
    defaultPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
      slack: boolean;
    };
  };

  // Notification Types
  notificationTypes: Array<{
    id: string;
    name: string;
    nameHe: string;
    category: 'lead' | 'task' | 'payment' | 'system' | 'custom';
    priority: 'critical' | 'high' | 'medium' | 'low';
    defaultChannels: Array<'email' | 'sms' | 'push' | 'slack' | 'teams'>;
    template: {
      email?: string;
      sms?: string;
      push?: string;
      slack?: string;
    };
  }>;

  // Priority & Routing
  priorityRouting: {
    criticalChannels: Array<'email' | 'sms' | 'push' | 'slack'>;
    highChannels: Array<'email' | 'sms' | 'push' | 'slack'>;
    mediumChannels: Array<'email' | 'push' | 'slack'>;
    lowChannels: Array<'email' | 'push'>;
  };

  // Rate Limiting
  rateLimiting: {
    enabled: boolean;
    maxNotificationsPerHour: number;
    maxNotificationsPerDay: number;
    perChannel: {
      email?: number;
      sms?: number;
      push?: number;
    };
  };

  // Quiet Hours
  quietHours: {
    enabled: boolean;
    startHour: number; // 22 (10 PM)
    endHour: number; // 8 (8 AM)
    daysOfWeek: number[]; // 0-6, Sunday = 0
    timezone: string;
    criticalBypassQuietHours: boolean;
  };

  // Delivery Tracking
  deliveryTracking: {
    trackDelivery: boolean;
    trackOpens: boolean; // Email, Push
    trackClicks: boolean; // Email, Push
    retryFailedDeliveries: boolean;
    maxRetries: number;
    retryDelay: number; // minutes
  };

  // CRM Integration
  crmAccess?: {
    system: string;
    authMethod: 'oauth' | 'api_key';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    userContactInfoFields: {
      email: string;
      phone: string;
      userId: string;
    };
  };

  // Event Source
  eventSource: {
    systems: Array<'crm' | 'forms' | 'payment' | 'ticketing' | 'custom'>;
    webhookEndpoint: string;
    apiIntegrations: boolean;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    multiChannelSupport: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
      fallbackChannel?: 'email' | 'sms';
    };
  };

  // Escalation rules (for notifications that need escalation)
  escalation?: {
    enabled: boolean;
    rules?: Array<{
      trigger: string;
      escalateTo: string;
      delay: number;
    }>;
  };

  // Audit Trail (for tracking notification history)
  auditTrail?: {
    enabled: boolean;
    storageMethod?: 'database' | 'crm' | 'file';
    retentionDays?: number;
  };
}

// ==================== AUTO APPROVAL WORKFLOW ====================

/**
 * Service #11: Auto Approval Workflow
 * תהליכי אישור אוטומטיים עם ניתוב והתראות
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoApprovalWorkflowRequirements {
  // Workflow State Management
  stateManagement: {
    storageType: 'database' | 'crm' | 'both';

    // Database
    databaseConfig?: {
      connectionString: string;
      tableName: string;
      schema: {
        approvalId: string;
        itemId: string;
        status: string;
        currentApprover: string;
        history: string;
      };
    };

    // CRM
    crmConfig?: {
      system: string;
      module: string;
      statusField: string;
      approverField: string;
    };
  };

  // Approval Hierarchy
  approvalHierarchy: {
    levels: Array<{
      level: number;
      name: string;
      nameHe: string;
      approvers: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        backupApproverId?: string;
      }>;
      conditions?: Array<{
        field: string;
        operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
        value: any;
      }>;
    }>;
    requireAllApprovers: boolean; // All must approve vs. any one
    parallelApproval: boolean; // All at once vs. sequential
  };

  // Routing Logic
  routingLogic: {
    routingStrategy: 'hierarchy' | 'round_robin' | 'skill_based' | 'load_balanced';
    routingRules: Array<{
      itemType: string;
      condition?: string;
      targetLevel: number;
      targetApproverId?: string;
    }>;
  };

  // Email Notification System
  emailNotifications: {
    provider: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    templates: {
      approvalRequest: string;
      approvalGranted: string;
      approvalDenied: string;
      escalation: string;
      timeout: string;
    };
  };

  // Approval Methods
  approvalMethods: {
    emailBased: boolean; // Magic links in email
    uiBased: boolean; // Dedicated approval UI
    slackBased?: boolean;
    teamsBased?: boolean;

    // Magic Link Configuration
    magicLinkConfig?: {
      expirationHours: number;
      encryptionKey: string;
      baseUrl: string;
    };

    // UI Configuration
    uiConfig?: {
      approvalPageUrl: string;
      authenticationRequired: boolean;
    };
  };

  // Escalation Rules
  escalation: {
    enabled: boolean;
    escalationTiers: Array<{
      tier: number;
      timeoutHours: number;
      escalateTo: string; // User ID or email
      notificationMethod: 'email' | 'sms' | 'slack' | 'all';
    }>;
    finalEscalation?: {
      action: 'auto_approve' | 'auto_reject' | 'alert_admin';
      adminEmail?: string;
    };
  };

  // Audit Trail
  auditTrail: {
    enabled: boolean;
    logStorage: 'database' | 'file' | 'both';
    logFields: {
      timestamp: boolean;
      approverId: boolean;
      decision: boolean;
      comments: boolean;
      ipAddress: boolean;
      userAgent: boolean;
    };
    retentionDays: number;
  };

  // Multi-level Approval
  multiLevelConfig: {
    enabled: boolean;
    maxLevels: number;
    levelThresholds?: Array<{
      level: number;
      minimumAmount?: number;
      itemType?: string;
    }>;
  };

  // Source System Integration
  sourceSystem: {
    system: 'crm' | 'erp' | 'hrms' | 'document_management' | 'custom';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      apiKey?: string;
    };
    webhookSupport: boolean;
    updateStatusEndpoint?: string;
  };

  // E-signature Integration (Optional)
  eSignature?: {
    enabled: boolean;
    provider: 'docusign' | 'pandadoc' | 'hellosign';
    apiKey: string;
    requireSignature: boolean;
    documentTemplateId?: string;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    stateTracking: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

// ==================== AUTO DOCUMENT GENERATION ====================

/**
 * Service #12: Auto Document Generation
 * יצירה אוטומטית של חוזים, חשבוניות, הצעות מחיר
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoDocumentGenerationRequirements {
  // Document Generation Service
  documentGenerationService: {
    provider: 'docmosis' | 'pandadoc' | 'google_docs' | 'carbone_io' | 'custom';

    // Docmosis
    docmosisConfig?: {
      apiKey: string;
      endpoint: string;
      templates: string[]; // Template IDs
    };

    // PandaDoc
    pandadocConfig?: {
      apiKey: string;
      workspaceId?: string;
      templates: Array<{
        id: string;
        name: string;
        type: 'contract' | 'invoice' | 'proposal';
      }>;
    };

    // Google Docs
    googleDocsConfig?: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      templateFolderId: string;
      templates: Array<{
        id: string;
        name: string;
      }>;
    };

    // Carbone.io (Open Source)
    carboneConfig?: {
      apiKey?: string;
      selfHosted: boolean;
      endpoint?: string;
    };
  };

  // Template Storage
  templateStorage: {
    storageProvider: 'google_drive' | 'dropbox' | 's3' | 'azure_blob' | 'local';

    googleDriveConfig?: {
      folderId: string;
      serviceAccountKey: string;
    };

    dropboxConfig?: {
      accessToken: string;
      folderPath: string;
    };

    s3Config?: {
      bucketName: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };

    azureBlobConfig?: {
      connectionString: string;
      containerName: string;
    };
  };

  // Data Source
  dataSource: {
    primarySource: 'crm' | 'erp' | 'database' | 'api';

    crmAccess?: {
      system: string;
      authMethod: 'oauth' | 'api_key';
      credentials: {
        clientId?: string;
        clientSecret?: string;
        refreshToken?: string;
        apiKey?: string;
      };
      dataFields: string[];
    };

    erpAccess?: {
      system: 'sap' | 'oracle' | 'netsuite' | 'other';
      apiEndpoint: string;
      credentials: Record<string, string>;
    };

    databaseAccess?: {
      connectionString: string;
      tables: string[];
      queries: Array<{
        name: string;
        sql: string;
      }>;
    };
  };

  // PDF Manipulation
  pdfManipulation?: {
    enabled: boolean;
    library: 'pdftk' | 'ghostscript' | 'pypdf2' | 'pdf_lib';
    features: {
      merging: boolean;
      splitting: boolean;
      watermarking: boolean;
      encryption: boolean;
      signing: boolean;
    };
  };

  // Document Types
  documentTypes: Array<{
    id: string;
    name: string;
    nameHe: string;
    category: 'contract' | 'invoice' | 'proposal' | 'receipt' | 'report' | 'custom';
    templateId: string;
    outputFormat: 'pdf' | 'docx' | 'html' | 'xlsx';
    dataMappings: Array<{
      documentField: string;
      dataSource: string;
      transformation?: 'uppercase' | 'lowercase' | 'currency' | 'date_format';
    }>;
  }>;

  // Generated Document Storage
  outputStorage: {
    storageProvider: 'google_drive' | 'dropbox' | 's3' | 'crm_attachment' | 'local';
    folderStructure: 'by_client' | 'by_type' | 'by_date' | 'custom';
    fileNamingConvention: string; // e.g., "{clientName}_{docType}_{date}.pdf"

    googleDriveConfig?: {
      folderId: string;
      serviceAccountKey: string;
    };

    dropboxConfig?: {
      accessToken: string;
      basePath: string;
    };

    s3Config?: {
      bucketName: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };

  // Email Delivery
  emailDelivery?: {
    enabled: boolean;
    provider: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    templates: {
      contractEmail: string;
      invoiceEmail: string;
      proposalEmail: string;
    };
    attachDocument: boolean;
  };

  // CRM Integration
  crmIntegration?: {
    attachToRecord: boolean;
    crmSystem: string;
    attachmentModule: 'leads' | 'contacts' | 'deals' | 'invoices';
    updateStatusField?: string;
  };

  // Hebrew/RTL Support
  hebrewSupport: {
    rtlSupport: boolean;
    hebrewFonts: string[];
    provider: string; // Which provider supports Hebrew best
  };

  // Legal & Compliance
  legalCompliance: {
    legalReviewRequired: boolean;
    versionControl: boolean;
    templateApprovalWorkflow: boolean;
    signatureRequired: boolean;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
      saveFailedData: boolean;
    };
  };
}

// ==================== AUTO DOCUMENT MANAGEMENT ====================

/**
 * Service #13: Auto Document Management
 * קבלה, עיבוד ושמירה אוטומטית של מסמכים
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoDocumentMgmtRequirements {
  // Email Integration (for receiving documents)
  emailIntegration: {
    provider: 'gmail' | 'office365' | 'imap';

    gmailConfig?: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      watchLabels: string[]; // Gmail labels to monitor
    };

    office365Config?: {
      tenantId: string;
      clientId: string;
      clientSecret: string;
      mailboxEmail: string;
      folderIds: string[];
    };

    imapConfig?: {
      host: string;
      port: number;
      username: string;
      password: string;
      folders: string[];
    };

    attachmentFilters: {
      allowedExtensions: string[]; // ['.pdf', '.docx', '.xlsx', '.jpg']
      maxSizeMB: number;
      excludeExtensions?: string[];
    };
  };

  // OCR Service
  ocrService: {
    provider: 'google_cloud_vision' | 'aws_textract' | 'azure_computer_vision' | 'tesseract';

    googleCloudVisionConfig?: {
      projectId: string;
      keyFilePath: string;
      features: string[]; // ['TEXT_DETECTION', 'DOCUMENT_TEXT_DETECTION']
      languageHints: string[]; // ['he', 'en']
    };

    awsTextractConfig?: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      documentTypes: string[]; // ['invoices', 'receipts', 'ids']
    };

    azureConfig?: {
      endpoint: string;
      apiKey: string;
      modelId?: string;
    };

    tesseractConfig?: {
      selfHosted: boolean;
      languages: string[]; // ['heb', 'eng']
      configPath?: string;
    };

    accuracyTarget: number; // Percentage
    hebrewSupport: boolean;
  };

  // Document Classification
  documentClassification: {
    method: 'ai' | 'rule_based' | 'hybrid';

    aiClassification?: {
      provider: 'openai' | 'anthropic' | 'custom';
      apiKey: string;
      model: string;
      confidenceThreshold: number;
    };

    ruleBasedClassification?: {
      rules: Array<{
        documentType: string;
        keywords: string[];
        regexPatterns?: string[];
        fileNamePatterns?: string[];
      }>;
    };

    documentTypes: Array<{
      id: string;
      name: string;
      nameHe: string;
      category: 'invoice' | 'contract' | 'id' | 'receipt' | 'report' | 'other';
      requiredFields?: string[];
    }>;
  };

  // Metadata Extraction
  metadataExtraction: {
    enabled: boolean;
    extractionFields: Array<{
      fieldName: string;
      fieldType: 'text' | 'number' | 'date' | 'currency';
      extractionMethod: 'ocr' | 'regex' | 'ai';
      pattern?: string; // For regex
      aiPrompt?: string; // For AI extraction
      required: boolean;
    }>;
    validationRules: Array<{
      field: string;
      rule: 'required' | 'format' | 'range';
      value?: any;
    }>;
  };

  // Cloud Storage
  cloudStorage: {
    primaryProvider: 'google_drive' | 'dropbox' | 'sharepoint' | 's3' | 'azure_blob';

    googleDriveConfig?: {
      serviceAccountKey: string;
      rootFolderId: string;
      sharedDriveId?: string;
    };

    dropboxConfig?: {
      accessToken: string;
      rootPath: string;
      teamSpaceId?: string;
    };

    sharepointConfig?: {
      tenantId: string;
      clientId: string;
      clientSecret: string;
      siteUrl: string;
      libraryName: string;
    };

    s3Config?: {
      bucketName: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      encryption: boolean;
    };

    azureBlobConfig?: {
      connectionString: string;
      containerName: string;
      encryption: boolean;
    };
  };

  // Folder Structure
  folderStructure: {
    organizationMethod: 'by_client' | 'by_type' | 'by_date' | 'by_department' | 'custom';
    folderTemplate: string; // e.g., "{year}/{month}/{client_name}/{doc_type}"
    autoCreateFolders: boolean;
    folderNamingConvention: string;
  };

  // File Naming
  fileNaming: {
    namingConvention: string; // e.g., "{client_name}_{doc_type}_{date}_{time}.{ext}"
    sanitizeNames: boolean; // Remove special characters
    appendTimestamp: boolean;
    preventDuplicates: boolean;
    duplicateHandling: 'rename' | 'overwrite' | 'skip';
  };

  // CRM/ERP Integration
  systemIntegration?: {
    enabled: boolean;
    systems: Array<{
      system: 'crm' | 'erp';
      name: string;
      authMethod: 'oauth' | 'api_key';
      credentials: Record<string, string>;
      linkDocumentToRecord: boolean;
      recordMatchingField: string; // e.g., 'invoice_number', 'client_email'
      attachmentModule: string;
    }>;
  };

  // Access Control
  accessControl: {
    enabled: boolean;
    permissionLevels: Array<{
      role: string;
      canView: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canShare: boolean;
      folderRestrictions?: string[];
    }>;
    encryptSensitiveDocuments: boolean;
    encryptionMethod?: 'aes256' | 'rsa';
  };

  // Search & Indexing
  searchIndexing: {
    enabled: boolean;
    indexProvider: 'elasticsearch' | 'algolia' | 'native';
    fullTextSearch: boolean;
    metadataSearch: boolean;
    ocrTextSearch: boolean;

    elasticsearchConfig?: {
      endpoint: string;
      apiKey: string;
      indexName: string;
    };

    algoliaConfig?: {
      appId: string;
      apiKey: string;
      indexName: string;
    };
  };

  // Cleanup & Retention
  cleanupPolicy: {
    enabled: boolean;
    retentionDays: number;
    archiveOldDocuments: boolean;
    archiveStorageProvider?: string;
    deleteAfterArchive: boolean;
    excludedDocumentTypes?: string[];
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    processingQueue: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
      quarantineFailedDocuments: boolean;
    };
  };
}

// ==================== AUTO DATA SYNC ====================

/**
 * Service #14: Auto Data Sync
 * סנכרון דו-כיווני של נתונים בזמן אמת בין מערכות
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoDataSyncRequirements {
  // System A Access
  systemA: {
    name: string;
    type: 'crm' | 'erp' | 'ecommerce' | 'database' | 'custom';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    apiEndpoints: {
      read: string;
      write: string;
      webhook?: string;
    };
    rateLimits: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  };

  // System B Access
  systemB: {
    name: string;
    type: 'crm' | 'erp' | 'ecommerce' | 'database' | 'custom';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
    };
    apiEndpoints: {
      read: string;
      write: string;
      webhook?: string;
    };
    rateLimits: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  };

  // Sync Configuration
  syncConfig: {
    direction: 'one_way_a_to_b' | 'one_way_b_to_a' | 'bi_directional';
    frequency: 'real_time' | 'every_5min' | 'every_15min' | 'hourly' | 'daily';
    batchSize?: number; // For bulk syncs
  };

  // Field Mapping
  fieldMapping: {
    mappings: Array<{
      systemAField: string;
      systemBField: string;
      dataType: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
      transformation?: {
        type: 'format' | 'calculate' | 'lookup' | 'custom';
        formula?: string;
      };
      bidirectional: boolean;
    }>;
    masterDataSource: 'system_a' | 'system_b' | 'timestamp_based'; // For conflict resolution
  };

  // Conflict Resolution
  conflictResolution: {
    strategy: 'master_wins' | 'newest_wins' | 'manual_review' | 'custom_logic';
    customLogic?: string; // JavaScript function or rule
    notifyOnConflict: boolean;
    conflictNotificationEmail?: string;
  };

  // Change Tracking
  changeTracking: {
    method: 'timestamp' | 'version_number' | 'hash' | 'webhook';
    timestampField?: string;
    versionField?: string;
    webhookSupport: {
      systemA: boolean;
      systemB: boolean;
    };
  };

  // Sync State Database
  syncStateDatabase: {
    enabled: boolean;
    provider: 'postgres' | 'mysql' | 'mongodb' | 'supabase' | 'firebase';
    connectionString?: string;
    tableName: string;
    schema: {
      recordId: string;
      systemAId: string;
      systemBId: string;
      lastSyncTimestamp: string;
      syncStatus: string;
      conflictFlag: string;
    };
  };

  // Idempotency
  idempotency: {
    enabled: boolean;
    method: 'unique_key' | 'request_id' | 'hash';
    uniqueKeyFields?: string[];
    preventDuplicateSyncs: boolean;
  };

  // Webhook Configuration
  webhookConfig: {
    systemAWebhook?: {
      url: string;
      secret: string;
      events: string[]; // ['create', 'update', 'delete']
    };
    systemBWebhook?: {
      url: string;
      secret: string;
      events: string[];
    };
  };

  // Error Handling
  errorHandling: {
    onSyncFailure: 'retry' | 'skip' | 'queue' | 'rollback';
    retryAttempts: number;
    retryDelay: number; // seconds
    maxQueueSize?: number;
    rollbackSupport: boolean;
    errorNotificationEmail: string;
    logAllErrors: boolean;
  };

  // Initial Data Load
  initialLoad: {
    required: boolean;
    strategy: 'full_sync' | 'incremental' | 'date_range';
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    batchSize: number;
    estimatedRecordCount?: number;
  };

  // Exclusion Rules
  exclusionRules?: {
    excludeRecords: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'starts_with';
      value: any;
    }>;
    excludeFields: string[];
  };

  // Monitoring & Alerts
  monitoring: {
    enabled: boolean;
    dashboardUrl?: string;
    alertThresholds: {
      syncErrorRate: number; // Percentage
      syncDelayMinutes: number;
      conflictCount: number;
    };
    healthCheckEndpoint?: string;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

// ==================== AUTO SYSTEM SYNC ====================

/**
 * Service #15: Auto System Sync
 * סנכרון אוטומטי של נתונים בין 2-3 מערכות שונות
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoSystemSyncRequirements {
  // Systems Configuration
  systems: Array<{
    id: string;
    name: string;
    type: 'crm' | 'erp' | 'ecommerce' | 'accounting' | 'shipping' | 'marketing' | 'custom';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
      apiKey?: string;
      username?: string;
      password?: string;
    };
    apiEndpoints: {
      base: string;
      read?: string;
      write?: string;
      webhook?: string;
    };
    rateLimits: {
      requestsPerMinute?: number;
      requestsPerDay?: number;
      concurrent?: number;
    };
  }>;

  // Data Flow Configuration
  dataFlow: {
    flowDiagram: string; // URL or description
    flows: Array<{
      id: string;
      sourceSystem: string;
      targetSystems: string[];
      entityType: 'customer' | 'order' | 'product' | 'invoice' | 'custom';
      syncDirection: 'one_way' | 'bi_directional';
      frequency: 'real_time' | 'scheduled' | 'manual';
      schedule?: string; // Cron expression
    }>;
  };

  // Field Mapping (for all systems)
  globalFieldMapping: {
    masterDataDefinitions: Array<{
      entityType: string;
      masterFields: Array<{
        fieldName: string;
        fieldType: string;
        required: boolean;
        systemMappings: Record<string, string>; // systemId -> field name in that system
      }>;
    }>;
  };

  // Sync Logic
  syncLogic: {
    syncType: 'full' | 'incremental' | 'delta';
    conflictResolution: 'master_system' | 'newest_wins' | 'manual';
    masterSystem?: string; // System ID that is the source of truth
    deduplicationEnabled: boolean;
    deduplicationFields: string[];
  };

  // Data Transformation
  dataTransformation: {
    enabled: boolean;
    transformations: Array<{
      sourceSystem: string;
      targetSystem: string;
      transformationType: 'format' | 'calculate' | 'lookup' | 'merge';
      transformationLogic: string; // JavaScript or formula
    }>;
    dateFormatStandardization: boolean;
    currencyConversion: boolean;
    timezoneHandling: boolean;
  };

  // Error Handling
  errorHandling: {
    strategy: 'retry' | 'skip_and_log' | 'queue' | 'alert';
    retryAttempts: number;
    retryDelay: number;
    partialFailureHandling: 'rollback' | 'continue' | 'alert';
    errorNotificationEmail: string;
    logAllSyncAttempts: boolean;
  };

  // Webhooks & Real-time Sync
  webhooks: {
    enabled: boolean;
    systemWebhooks: Array<{
      systemId: string;
      webhookUrl: string;
      events: string[];
      secret?: string;
    }>;
  };

  // Initial Data Load
  initialDataLoad: {
    required: boolean;
    strategy: 'parallel' | 'sequential';
    bulkImportSupported: boolean;
    estimatedRecordCount: number;
    estimatedTimeDays: number;
  };

  // Sync State Tracking
  syncStateTracking: {
    database: 'postgres' | 'mysql' | 'supabase' | 'firebase';
    connectionString?: string;
    trackingTables: {
      syncLogs: string;
      entityMapping: string;
      conflictQueue: string;
    };
  };

  // Monitoring
  monitoring: {
    enabled: boolean;
    metricsToTrack: string[];
    alerting: {
      syncFailures: boolean;
      dataDrift: boolean;
      performanceIssues: boolean;
      apiRateLimitApproaching: boolean;
    };
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    workflowComplexity: 'simple' | 'moderate' | 'complex';
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

// ==================== AUTO REPORTS ====================

/**
 * Service #16: Auto Reports
 * יצירה ושליחה אוטומטית של דוחות תקופתיים
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoReportsRequirements {
  // Data Sources
  dataSources: Array<{
    id: string;
    name: string;
    type: 'crm' | 'erp' | 'analytics' | 'database' | 'api';

    // CRM/ERP
    apiAccess?: {
      authMethod: 'oauth' | 'api_key';
      credentials: Record<string, string>;
      endpoints: string[];
    };

    // Analytics
    analyticsAccess?: {
      platform: 'google_analytics' | 'mixpanel' | 'amplitude';
      apiKey: string;
      propertyId?: string;
      metrics: string[];
    };

    // Database
    databaseAccess?: {
      connectionString: string;
      queries: Array<{
        name: string;
        sql: string;
      }>;
    };
  }>;

  // Report Types
  reportTypes: Array<{
    id: string;
    name: string;
    nameHe: string;
    category: 'sales' | 'marketing' | 'financial' | 'operational' | 'custom';
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand';
    schedule?: {
      cronExpression?: string;
      dayOfWeek?: number; // For weekly
      dayOfMonth?: number; // For monthly
      time: string; // HH:mm
      timezone: string;
    };
    dataSourceIds: string[];
    kpis: Array<{
      name: string;
      nameHe: string;
      calculation: string;
      format: 'number' | 'currency' | 'percentage' | 'duration';
    }>;
  }>;

  // Report Generation
  reportGeneration: {
    format: 'pdf' | 'excel' | 'google_sheets' | 'html' | 'multiple';

    // PDF Generation
    pdfConfig?: {
      library: 'puppeteer' | 'jspdf' | 'wkhtmltopdf';
      template: string; // HTML template
      styling: string; // CSS
      pageSize: 'A4' | 'letter';
      orientation: 'portrait' | 'landscape';
    };

    // Excel Generation
    excelConfig?: {
      library: 'exceljs' | 'xlsx' | 'sheetjs';
      templatePath?: string;
      worksheets: Array<{
        name: string;
        dataSource: string;
      }>;
    };

    // Google Sheets
    googleSheetsConfig?: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      templateSpreadsheetId?: string;
      autoShare: boolean;
      shareWith: string[];
    };

    // Charts & Visualizations
    chartsEnabled: boolean;
    chartLibrary?: 'chartjs' | 'd3' | 'recharts';
  };

  // Report Templates
  reportTemplates: Array<{
    id: string;
    reportTypeId: string;
    templateType: 'html' | 'excel' | 'google_sheets';
    templatePath: string;
    variables: string[]; // Template variables to be replaced
    design: {
      logo?: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
      fonts: string[];
    };
  }>;

  // Data Aggregation
  dataAggregation: {
    aggregationRules: Array<{
      metric: string;
      aggregationType: 'sum' | 'average' | 'count' | 'min' | 'max' | 'custom';
      groupBy?: string[];
      filters?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
    }>;
    calculatedFields: Array<{
      name: string;
      formula: string; // JavaScript or formula
    }>;
  };

  // Delivery Configuration
  deliveryConfig: {
    methods: Array<'email' | 'slack' | 'teams' | 'cloud_storage' | 'dashboard'>;

    emailDelivery?: {
      provider: 'sendgrid' | 'mailgun' | 'smtp';
      apiKey?: string;
      smtpCredentials?: {
        host: string;
        port: number;
        username: string;
        password: string;
      };
      recipients: Array<{
        email: string;
        reportTypes: string[];
      }>;
      subject: string;
      bodyTemplate: string;
      attachReport: boolean;
    };

    slackDelivery?: {
      webhookUrl: string;
      channels: string[];
      includeCharts: boolean;
    };

    teamsDelivery?: {
      webhookUrl: string;
      channels: string[];
      adaptiveCards: boolean;
    };

    cloudStorage?: {
      provider: 'google_drive' | 'dropbox' | 's3';
      credentials: Record<string, string>;
      folderPath: string;
    };
  };

  // Scheduling
  scheduling: {
    scheduler: 'n8n_cron' | 'node_cron' | 'external';
    timezone: string;
    retryOnFailure: boolean;
    retryAttempts: number;
  };

  // Report Archive
  archiving: {
    enabled: boolean;
    storageProvider: 'google_drive' | 's3' | 'local';
    retentionDays: number;
    folderStructure: 'by_date' | 'by_type' | 'by_recipient';
  };

  // Data Freshness
  dataFreshness: {
    maxStalenessHours: number;
    dataAsOfTimestamp: boolean; // Include "Data as of" timestamp
    cacheEnabled: boolean;
    cacheDurationMinutes?: number;
  };

  // Performance
  performance: {
    queryTimeout: number; // seconds
    maxReportSizeMB: number;
    parallelDataFetch: boolean;
    optimizedQueries: boolean;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    cronSupport: boolean;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

// ==================== AUTO MULTI-SYSTEM ====================

/**
 * Service #17: Auto Multi-System
 * אינטגרציה מלאה של 4+ מערכות
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoMultiSystemRequirements {
  // All Systems
  systems: Array<{
    id: string;
    name: string;
    type: 'crm' | 'erp' | 'ecommerce' | 'accounting' | 'shipping' | 'marketing' | 'inventory' | 'support' | 'custom';
    priority: 'primary' | 'secondary' | 'tertiary';
    authMethod: 'oauth' | 'api_key' | 'basic_auth' | 'jwt';
    credentials: Record<string, string>;
    endpoints: {
      base: string;
      health?: string;
      webhook?: string;
    };
    rateLimits: {
      requestsPerMinute?: number;
      requestsPerDay?: number;
      burstLimit?: number;
    };
    availability: {
      sla: number; // Percentage
      maintenanceWindows?: string[];
    };
  }>;

  // Central Data Model
  centralDataModel: {
    entities: Array<{
      entityName: string;
      masterDefinition: {
        fields: Array<{
          fieldName: string;
          dataType: string;
          required: boolean;
          unique: boolean;
        }>;
      };
      systemMappings: Array<{
        systemId: string;
        entityNameInSystem: string;
        fieldMappings: Record<string, string>; // central field -> system field
      }>;
    }>;
    masterSystem?: string; // System ID that is source of truth
  };

  // Data Transformation Engine
  transformationEngine: {
    transformationRules: Array<{
      id: string;
      sourceSystem: string;
      targetSystem: string;
      entityType: string;
      transformations: Array<{
        field: string;
        transformationType: 'format' | 'calculate' | 'lookup' | 'aggregate' | 'custom';
        logic: string; // JavaScript function or formula
      }>;
    }>;
    customFunctions: Array<{
      name: string;
      code: string; // JavaScript
      description: string;
    }>;
  };

  // Orchestration
  orchestration: {
    platform: 'n8n' | 'zapier' | 'make' | 'custom';
    complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';

    n8nConfig?: {
      instanceUrl: string;
      isPro: boolean;
      workflowCount: number;
      subWorkflows: boolean;
    };

    workflows: Array<{
      id: string;
      name: string;
      trigger: 'webhook' | 'schedule' | 'manual' | 'event';
      involvedSystems: string[];
      steps: number;
      errorHandlingStrategy: string;
    }>;
  };

  // Transaction Management
  transactionManagement: {
    enabled: boolean;
    rollbackCapability: boolean;
    rollbackStrategy: 'automatic' | 'manual' | 'conditional';
    transactionLog: {
      database: string;
      tableName: string;
      retentionDays: number;
    };
    compensatingTransactions: boolean;
  };

  // Error Handling & Recovery
  errorHandling: {
    strategy: 'fail_fast' | 'best_effort' | 'circuit_breaker';
    circuitBreaker?: {
      failureThreshold: number;
      timeoutSeconds: number;
      resetAfterSeconds: number;
    };
    fallbackMechanisms: Array<{
      systemId: string;
      fallbackAction: 'queue' | 'alternative_system' | 'manual_review' | 'skip';
    }>;
    errorNotification: {
      channels: Array<'email' | 'slack' | 'sms' | 'pagerduty'>;
      recipients: string[];
      severity: Array<'critical' | 'high' | 'medium' | 'low'>;
    };
  };

  // Rate Limit Management
  rateLimitManagement: {
    enabled: boolean;
    globalLimits: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
    perSystemThrottling: boolean;
    queueingStrategy: 'fifo' | 'priority' | 'weighted';
    backpressureHandling: boolean;
  };

  // Logging & Monitoring
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    destination: 'file' | 'database' | 'cloudwatch' | 'datadog' | 'sentry';
    structuredLogging: boolean;
    logRetentionDays: number;

    cloudwatchConfig?: {
      logGroupName: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };

    datadogConfig?: {
      apiKey: string;
      site: string;
    };

    sentryConfig?: {
      dsn: string;
      environment: string;
    };
  };

  monitoring: {
    enabled: boolean;
    metrics: Array<'throughput' | 'latency' | 'error_rate' | 'queue_depth' | 'system_health'>;
    dashboardUrl?: string;
    alerting: {
      channels: Array<'email' | 'slack' | 'pagerduty' | 'opsgenie'>;
      alertRules: Array<{
        metric: string;
        threshold: number;
        duration: number;
        severity: 'critical' | 'warning';
      }>;
    };
  };

  // Data Warehouse (Optional)
  dataWarehouse?: {
    enabled: boolean;
    provider: 'snowflake' | 'bigquery' | 'redshift' | 'postgres';
    connectionString?: string;
    syncFrequency: 'real_time' | 'hourly' | 'daily';
    centralizedReporting: boolean;
  };

  // Testing Environment
  testingEnvironment: {
    hasTestAccounts: boolean;
    testingStrategy: 'sandbox' | 'staging' | 'production_subset';
    automatedTesting: boolean;
    testCoverage?: number;
  };

  // Documentation
  documentation: {
    architectureDiagram: string; // URL or path
    dataFlowDiagrams: string[];
    apiDocumentation: string[];
    runbooks: string[];
    teamKnowledgeBase: string;
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    isPro: boolean;
    httpsEnabled: boolean;
    workflowVersioning: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

// ==================== AUTO END-TO-END ====================

/**
 * Service #18: Auto End-to-End
 * אוטומציה מלאה של תהליך עסקי מתחילה ועד סוף
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoEndToEndRequirements {
  // Business Process Definition
  businessProcess: {
    processName: string;
    processNameHe: string;
    processCategory: 'sales' | 'operations' | 'finance' | 'hr' | 'customer_service' | 'custom';
    processDocumentation: string; // URL or path to flowchart
    processSteps: Array<{
      stepId: string;
      stepName: string;
      stepNameHe: string;
      stepType: 'automatic' | 'manual' | 'approval' | 'decision' | 'notification';
      system?: string; // System ID if automatic
      assignedTo?: string; // User/role if manual
      slaMinutes?: number;
      order: number;
      dependencies?: string[]; // Other step IDs
    }>;
    estimatedDuration: number; // minutes
  };

  // System Integrations
  systemIntegrations: Array<{
    systemId: string;
    systemName: string;
    role: 'trigger' | 'processor' | 'notifier' | 'storage';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: Record<string, string>;
    endpoints: {
      trigger?: string;
      action?: string;
      status?: string;
    };
  }>;

  // Workflow Orchestration
  workflowOrchestration: {
    orchestrator: 'n8n' | 'temporal' | 'camunda' | 'custom';

    n8nConfig?: {
      instanceUrl: string;
      mainWorkflowId: string;
      subWorkflows: Array<{
        id: string;
        name: string;
        triggerType: string;
      }>;
      errorHandling: 'retry' | 'fallback' | 'manual';
    };

    temporalConfig?: {
      namespace: string;
      workflowType: string;
      taskQueue: string;
    };

    camundaConfig?: {
      processDefinitionId: string;
      deploymentId: string;
    };
  };

  // State Machine
  stateMachine: {
    enabled: boolean;
    states: Array<{
      stateName: string;
      stateType: 'initial' | 'intermediate' | 'final' | 'error';
      allowedTransitions: string[];
      onEntry?: string; // Action to perform
      onExit?: string;
    }>;
    stateStorage: 'database' | 'crm' | 'memory';
    stateStorageConfig?: {
      connectionString?: string;
      tableName?: string;
      crmField?: string;
    };
  };

  // Error Handling (Step-by-Step)
  errorHandlingStrategy: {
    globalStrategy: 'fail_fast' | 'continue_on_error' | 'retry_all' | 'partial_rollback';
    stepLevelHandling: Array<{
      stepId: string;
      onError: 'retry' | 'skip' | 'rollback' | 'alert' | 'fallback';
      retryAttempts?: number;
      retryDelay?: number;
      fallbackAction?: string;
      alertRecipients?: string[];
    }>;
  };

  // Human-in-the-Loop
  humanInTheLoop: {
    approvalSteps: Array<{
      stepId: string;
      approverRole: string;
      approverEmails: string[];
      approvalMethod: 'email' | 'ui' | 'slack' | 'teams';
      timeoutHours: number;
      onTimeout: 'escalate' | 'auto_approve' | 'auto_reject';
    }>;
    manualInterventionTriggers: Array<{
      condition: string;
      assignTo: string;
      instructions: string;
    }>;
  };

  // Transaction & Rollback
  transactionManagement: {
    enabled: boolean;
    transactionScope: 'full_process' | 'per_step' | 'grouped';
    rollbackCapability: boolean;
    rollbackStrategy: 'compensating_transactions' | 'reverse_operations' | 'state_revert';
    rollbackSteps: Array<{
      stepId: string;
      rollbackAction: string; // Action to undo the step
      rollbackData?: string; // Data needed for rollback
    }>;
  };

  // Parallel Processing
  parallelProcessing: {
    enabled: boolean;
    parallelSteps: Array<{
      groupId: string;
      stepIds: string[];
      joinStrategy: 'wait_all' | 'wait_any' | 'wait_majority';
    }>;
  };

  // Monitoring & Observability
  monitoring: {
    enabled: boolean;
    trackMetrics: Array<'process_duration' | 'step_duration' | 'error_rate' | 'throughput' | 'bottlenecks'>;
    dashboardUrl?: string;
    processVisualization: boolean;
    realTimeTracking: boolean;

    alerting: {
      channels: Array<'email' | 'slack' | 'pagerduty'>;
      alertRules: Array<{
        condition: string;
        severity: 'critical' | 'warning' | 'info';
        recipients: string[];
      }>;
    };
  };

  // Audit Trail
  auditTrail: {
    enabled: boolean;
    logAllSteps: boolean;
    logUserActions: boolean;
    logDataChanges: boolean;
    storage: 'database' | 'file' | 'cloud';
    retentionDays: number;
    complianceRequirements?: string[];
  };

  // Performance Optimization
  performanceOptimization: {
    timeoutHandling: {
      globalTimeout: number; // minutes
      stepTimeouts: Record<string, number>; // stepId -> timeout
      onTimeout: 'fail' | 'continue' | 'retry';
    };
    caching: {
      enabled: boolean;
      cacheStepOutputs: boolean;
      cacheDuration: number; // minutes
    };
    asyncProcessing: {
      enabled: boolean;
      asyncSteps: string[]; // Step IDs that can run async
    };
  };

  // Testing & Validation
  testing: {
    hasTestEnvironment: boolean;
    testingStrategy: 'end_to_end' | 'step_by_step' | 'both';
    testCases: Array<{
      testName: string;
      scenario: string;
      expectedOutcome: string;
    }>;
    validationChecks: Array<{
      stepId: string;
      validation: string; // Validation rule
      onValidationFailure: 'fail' | 'alert' | 'continue';
    }>;
  };

  // Change Management
  changeManagement: {
    versionControl: boolean;
    changeApprovalRequired: boolean;
    rollbackPlan: string;
    deploymentStrategy: 'blue_green' | 'canary' | 'direct';
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    isPro: boolean;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

// ==================== AUTO SLA TRACKING ====================

/**
 * Service #19: Auto SLA Tracking
 * מעקב ודיווח אוטומטי על עמידה ב-SLA (זמני תגובה ופתרון)
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoSlaTrackingRequirements {
  // Ticketing System Integration
  ticketingSystem: {
    system: 'zendesk' | 'freshdesk' | 'zoho_desk' | 'jira_service_desk' | 'helpscout' | 'intercom' | 'custom';
    authMethod: 'oauth' | 'api_key' | 'basic_auth';
    credentials: {
      apiKey?: string;
      domain?: string;
      email?: string;
      password?: string;
      clientId?: string;
      clientSecret?: string;
    };
    endpoints: {
      tickets: string;
      webhook?: string;
      updates: string;
    };
  };

  // SLA Definitions
  slaDefinitions: Array<{
    id: string;
    name: string;
    nameHe: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    responseTimeSLA: {
      enabled: boolean;
      minutes: number;
    };
    resolutionTimeSLA: {
      enabled: boolean;
      hours: number;
    };
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than';
      value: any;
    }>;
  }>;

  // Working Hours Calendar
  workingHoursCalendar: {
    timezone: string;
    workingDays: number[]; // 1-5 for Mon-Fri
    workingHours: {
      start: string; // HH:mm
      end: string;
    };
    holidays: string[]; // ISO date strings
    excludeWeekends: boolean;
    excludeHolidays: boolean;
  };

  // SLA Calculator
  slaCalculator: {
    calculationMethod: 'calendar_hours' | 'business_hours';
    pauseTimerOn: Array<'waiting_on_customer' | 'waiting_on_third_party' | 'on_hold'>;
    resetTimerOn?: string[]; // Ticket status that resets SLA
    bufferMinutes?: number; // Grace period before breach
  };

  // Real-time Monitoring
  realTimeMonitoring: {
    enabled: boolean;
    monitoringFrequency: 'continuous' | 'every_minute' | 'every_5min';
    webhookSupport: boolean;
    pollInterval?: number; // seconds, if no webhook
  };

  // Alert & Escalation
  alertEscalation: {
    alertThresholds: Array<{
      thresholdType: 'time_remaining' | 'percentage_elapsed';
      value: number; // minutes or percentage
      severity: 'warning' | 'critical';
      notificationChannels: Array<'email' | 'sms' | 'slack' | 'teams'>;
      recipients: string[];
    }>;

    escalationRules: Array<{
      triggeredWhen: 'sla_breach' | 'approaching_breach' | 'no_response';
      minutesBeforeBreach?: number;
      escalateTo: string; // User ID or email
      escalationMethod: 'email' | 'sms' | 'slack' | 'teams' | 'auto_assign';
      autoAssignToSenior?: boolean;
    }>;
  };

  // SLA Breach Handling
  breachHandling: {
    onBreach: 'alert' | 'escalate' | 'auto_assign' | 'create_task';
    breachNotificationChannels: Array<'email' | 'sms' | 'slack' | 'dashboard'>;
    breachNotificationRecipients: string[];
    logBreaches: boolean;
    breachReportFrequency: 'daily' | 'weekly' | 'monthly';
  };

  // Reporting & Dashboard
  reporting: {
    enabled: boolean;
    dashboardUrl?: string;
    metricsToTrack: Array<
      'sla_compliance_rate' |
      'average_response_time' |
      'average_resolution_time' |
      'breach_count' |
      'tickets_at_risk' |
      'team_performance'
    >;
    reportFormat: 'pdf' | 'excel' | 'dashboard' | 'email';
    reportFrequency: 'daily' | 'weekly' | 'monthly';
    reportRecipients: string[];
  };

  // CRM Integration (Optional)
  crmIntegration?: {
    enabled: boolean;
    crmSystem: 'zoho' | 'salesforce' | 'hubspot';
    authMethod: 'oauth' | 'api_key';
    credentials: Record<string, string>;
    logSlaMetrics: boolean;
    customerSlaField?: string; // CRM field for customer-specific SLA
  };

  // Timezone Handling
  timezoneConfig: {
    supportMultipleTimezones: boolean;
    customerTimezoneField?: string; // Ticket field containing customer timezone
    convertToCustomerTimezone: boolean;
    displayTimezoneInReports: boolean;
  };

  // Clock Stop/Pause
  clockStopRules: {
    enabled: boolean;
    pauseConditions: Array<{
      ticketStatus: string;
      pauseType: 'waiting_on_customer' | 'waiting_on_third_party' | 'on_hold';
      resumeCondition: string;
    }>;
  };

  // Performance Metrics
  performanceMetrics: {
    trackTeamPerformance: boolean;
    trackIndividualPerformance: boolean;
    benchmarks: {
      targetComplianceRate: number; // percentage
      targetResponseTime: number; // minutes
      targetResolutionTime: number; // hours
    };
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    webhookEndpoint: string;
    httpsEnabled: boolean;
    cronSchedule?: string; // For polling if no webhook
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };
}

// ==================== AUTO CUSTOM ====================

/**
 * Service #20: Auto Custom
 * אוטומציה מותאמת אישית לצרכים ייחודיים של העסק
 * Based on technical requirements from AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
 */
export interface AutoCustomRequirements {
  // Custom Requirements
  customRequirements: {
    businessNeed: string;
    businessNeedHe: string;
    detailedDescription: string;
    detailedDescriptionHe: string;
    processFlowDiagram?: string; // URL or path
    successCriteria: string[];
    successCriteriaHe: string[];
  };

  // Systems Involved
  systemsInvolved: Array<{
    systemId: string;
    systemName: string;
    systemType: 'crm' | 'erp' | 'legacy' | 'proprietary' | 'saas' | 'database' | 'api' | 'custom';
    role: 'source' | 'destination' | 'processor' | 'trigger';
    accessMethod: 'api' | 'database' | 'file' | 'webhook' | 'scraping' | 'custom';
    authMethod?: string;
    credentials?: Record<string, string>;
    apiDocumentation?: string;
    hasTestEnvironment: boolean;
  }>;

  // Custom API Development
  customApiDevelopment?: {
    required: boolean;
    apiType: 'rest' | 'graphql' | 'soap' | 'grpc' | 'webhook';
    framework: 'express' | 'fastify' | 'nestjs' | 'serverless' | 'custom';
    hosting: 'vercel' | 'aws_lambda' | 'google_cloud_functions' | 'azure_functions' | 'self_hosted';
    authentication: 'api_key' | 'oauth' | 'jwt' | 'basic_auth' | 'custom';
    rateLimiting: boolean;
    caching: boolean;
    apiDocumentationTool?: 'swagger' | 'postman' | 'readme';
  };

  // Custom Business Logic
  customBusinessLogic: {
    logicDescription: string;
    logicDescriptionHe: string;
    implementationType: 'javascript' | 'python' | 'no_code' | 'low_code' | 'rule_engine';

    codeImplementation?: {
      language: 'javascript' | 'typescript' | 'python';
      framework?: string;
      repository?: string;
      testCoverage?: number;
    };

    ruleEngine?: {
      engine: 'drools' | 'easyrules' | 'nools' | 'custom';
      rulesFormat: 'json' | 'dsl' | 'code';
      rulesCount: number;
    };
  };

  // Data Transformation
  dataTransformation: {
    complexTransformations: boolean;
    transformationTypes: Array<'format' | 'calculation' | 'aggregation' | 'enrichment' | 'validation' | 'custom'>;
    transformationLogic: string; // Description or code
    dataValidationRules: Array<{
      field: string;
      rule: string;
      errorHandling: 'fail' | 'skip' | 'default_value' | 'alert';
    }>;
  };

  // Integration Patterns
  integrationPatterns: {
    patterns: Array<'request_response' | 'event_driven' | 'batch' | 'streaming' | 'pub_sub' | 'custom'>;
    eventDriven?: {
      eventBus: 'kafka' | 'rabbitmq' | 'aws_eventbridge' | 'google_pubsub' | 'custom';
      eventTypes: string[];
    };
    batchProcessing?: {
      schedule: string; // Cron
      batchSize: number;
      parallelProcessing: boolean;
    };
  };

  // Testing Requirements
  testingRequirements: {
    testingStrategy: 'unit' | 'integration' | 'e2e' | 'all';
    testFramework?: 'jest' | 'mocha' | 'pytest' | 'cypress' | 'playwright';
    testCoverage: number; // percentage target
    hasTestData: boolean;
    testDataSource?: string;
    performanceTesting: boolean;
    loadTesting: boolean;
  };

  // Documentation Requirements
  documentationRequirements: {
    technicalDocumentation: boolean;
    userDocumentation: boolean;
    apiDocumentation: boolean;
    runbooks: boolean;
    trainingMaterials: boolean;
    documentationFormat: Array<'markdown' | 'confluence' | 'notion' | 'pdf' | 'video'>;
  };

  // Deployment & Maintenance
  deploymentMaintenance: {
    deploymentMethod: 'ci_cd' | 'manual' | 'serverless' | 'container';
    cicdPlatform?: 'github_actions' | 'gitlab_ci' | 'jenkins' | 'circleci';
    hosting: 'cloud' | 'on_premise' | 'hybrid';
    monitoring: boolean;
    monitoringTools?: Array<'datadog' | 'new_relic' | 'cloudwatch' | 'prometheus' | 'custom'>;
    backupStrategy: string;
    disasterRecovery: boolean;
  };

  // Security & Compliance
  securityCompliance: {
    dataEncryption: boolean;
    encryptionMethod?: 'aes256' | 'rsa' | 'tls';
    accessControl: boolean;
    rbacRequired: boolean;
    auditLogging: boolean;
    complianceRequirements?: Array<'gdpr' | 'hipaa' | 'pci_dss' | 'sox' | 'iso27001'>;
    dataMasking: boolean;
    sensitiveDataHandling: string;
  };

  // Performance Requirements
  performanceRequirements: {
    expectedVolume: {
      requestsPerMinute?: number;
      recordsPerDay?: number;
      concurrentUsers?: number;
    };
    latencyTarget: number; // milliseconds
    availabilityTarget: number; // percentage (SLA)
    scalability: 'horizontal' | 'vertical' | 'auto_scaling';
  };

  // Cost Estimation
  costEstimation: {
    developmentHours: number;
    estimatedMonthlyCost: {
      infrastructure: number;
      apiCalls: number;
      storage: number;
      other: number;
      total: number;
      currency: 'USD' | 'ILS';
    };
    roi: {
      timeSavingsHours: number;
      costSavings: number;
      revenueIncrease?: number;
      paybackPeriodMonths: number;
    };
  };

  // n8n Workflow
  n8nWorkflow: {
    instanceUrl: string;
    isPro: boolean;
    customNodes: boolean;
    httpsEnabled: boolean;
    errorHandling: {
      retryAttempts: number;
      alertEmail: string;
      logErrors: boolean;
    };
  };

  // Additional Notes
  additionalNotes?: {
    constraints: string[];
    dependencies: string[];
    risks: string[];
    assumptions: string[];
  };
}

// ==================== UNION TYPES & WRAPPER ====================

/**
 * Union type של כל automation service requirements
 * מאפשר type-safe handling של כל השירותים במערכת
 */
export type AutomationServiceConfig =
  | AutoLeadResponseRequirements
  | AutoSmsWhatsappRequirements
  | AutoCRMUpdateRequirements
  | AutoTeamAlertsRequirements
  | AutoLeadWorkflowRequirements
  | AutoSmartFollowupRequirements
  | AutoMeetingSchedulerRequirements
  | AutoFormToCrmRequirements
  | AutoEmailTemplatesRequirements
  | AutoNotificationsRequirements
  | AutoApprovalWorkflowRequirements
  | AutoDocumentGenerationRequirements
  | AutoDocumentMgmtRequirements
  | AutoDataSyncRequirements
  | AutoSystemSyncRequirements
  | AutoReportsRequirements
  | AutoMultiSystemRequirements
  | AutoEndToEndRequirements
  | AutoSlaTrackingRequirements
  | AutoCustomRequirements
  | AIFAQBotRequirements
  | AITriageRequirements;

/**
 * Wrapper type לשמירת automation service במערכת
 * כולל metadata נוסף מעבר ל-configuration עצמו
 */
export interface AutomationServiceEntry {
  serviceId: string;
  serviceName: string;
  serviceNameHe: string;
  category: 'lead_management' | 'communication' | 'crm_sync' | 'team_productivity' | 'ai_agents' | 'custom';
  config?: AutomationServiceConfig; // Legacy field
  requirements?: any; // Phase 2 collected requirements (typed per service)
  status: 'not_started' | 'configuring' | 'testing' | 'deployed' | 'active' | 'paused' | 'archived';
  completedAt?: Date | string;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  notes?: string;

  // Implementation tracking
  setupProgress?: number; // 0-100 percentage
  estimatedCompletionDate?: Date;
  technicalOwner?: string;
  businessOwner?: string;
}

/**
 * Automation service catalog entry
 * מתאר שירות זמין ללקוחות
 */
export interface AutomationServiceCatalogEntry {
  serviceId: string;
  serviceName: string;
  serviceNameHe: string;
  category: 'lead_management' | 'communication' | 'crm_sync' | 'team_productivity' | 'ai_agents' | 'custom';
  description: string;
  descriptionHe: string;
  benefits: string[];
  benefitsHe: string[];
  prerequisites: string[];
  prerequisitesHe: string[];
  estimatedSetupTime: number; // hours
  estimatedCostPerMonth: {
    min: number;
    max: number;
    currency: 'USD' | 'ILS';
  };
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  availableForTiers: Array<'basic' | 'pro' | 'enterprise'>;
  relatedServices: string[]; // Other service IDs that work well together
  icon?: string;
  documentationUrl?: string;
  videoTutorialUrl?: string;
}

// ==================== ADDITIONAL AUTO SERVICES ====================

/**
 * Auto Welcome Email Service
 * שליחה אוטומטית של מייל פתיחה ללידים חדשים
 */
export interface AutoWelcomeEmailRequirements {
  // Email Service Configuration
  emailService: {
    provider: 'sendgrid' | 'mailgun' | 'smtp' | 'gmail';
    apiKey?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
  };

  // Email Template
  template: {
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    variables?: string[]; // e.g., {{name}}, {{company}}
  };

  // Trigger Configuration
  trigger: {
    source: 'form_submission' | 'crm_new_lead' | 'api_webhook';
    webhookUrl?: string;
    crmModule?: string;
  };

  // CRM Integration (optional)
  crmIntegration?: {
    enabled: boolean;
    system: string;
    logEmailSent: boolean;
    updateFieldOnSend?: string;
  };

  // Testing & Quality
  testEmailAddress: string;
  sendTestEmail?: boolean;
}

/**
 * Auto Service Workflow Requirements
 * תהליך שירות אוטומטי מקצה לקצה
 */
export interface AutoServiceWorkflowRequirements {
  // Workflow Definition
  workflowName: string;
  workflowType: 'support_ticket' | 'service_request' | 'maintenance' | 'custom';
  
  // Steps Configuration
  steps: Array<{
    id: string;
    name: string;
    action: 'assign' | 'notify' | 'update_status' | 'send_email' | 'create_task';
    configuration: Record<string, any>;
  }>;

  // Assignment Rules
  assignmentRules?: {
    method: 'round_robin' | 'load_balanced' | 'skill_based' | 'manual';
    assignees?: string[];
  };

  // SLA Configuration
  sla?: {
    responseTime: number; // minutes
    resolutionTime: number; // hours
    escalationRules?: Array<{
      condition: string;
      action: string;
      delay: number;
    }>;
  };

  // Integration Points
  integrations?: {
    crm?: boolean;
    ticketing?: boolean;
    notifications?: boolean;
  };
}

// ==================== EXPORT TYPES FOR REQUIREMENTS COLLECTION ====================

// Export types for use in requirements collection
export type AutoLeadWorkflowData = Partial<AutoLeadWorkflowRequirements>;
export type AutoSmartFollowupData = Partial<AutoSmartFollowupRequirements>;
export type AutoMeetingSchedulerData = Partial<AutoMeetingSchedulerRequirements>;
export type AutoNotificationsData = Partial<AutoNotificationsRequirements>;
export type AutoApprovalWorkflowData = Partial<AutoApprovalWorkflowRequirements>;
export type AutoDocumentGenerationData = Partial<AutoDocumentGenerationRequirements>;
export type AutoDocumentMgmtData = Partial<AutoDocumentMgmtRequirements>;
export type AutoDataSyncData = Partial<AutoDataSyncRequirements>;
export type AutoSystemSyncData = Partial<AutoSystemSyncRequirements>;
export type AutoReportsData = Partial<AutoReportsRequirements>;
export type AutoMultiSystemData = Partial<AutoMultiSystemRequirements>;
export type AutoEndToEndData = Partial<AutoEndToEndRequirements>;
export type AutoSlaTrackingData = Partial<AutoSlaTrackingRequirements>;
export type AutoCustomData = Partial<AutoCustomRequirements>;
