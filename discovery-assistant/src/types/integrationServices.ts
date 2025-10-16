/**
 * Integration Services Type Definitions
 * Services 31-40: Integration Services
 *
 * This file contains TypeScript interfaces for all integration services,
 * including authentication, system connections, field mapping, and sync configurations.
 */

/**
 * Authentication types supported across integration services
 */
export type AuthType = 'oauth2' | 'api_key' | 'basic' | 'bearer_token';

/**
 * Sync direction options for integrations
 */
export type SyncDirection = 'one-way' | 'bi-directional';

/**
 * Sync frequency options
 */
export type SyncFrequency = 'real-time' | 'polling' | 'batch';

/**
 * Conflict resolution strategies for bi-directional sync
 */
export type ConflictResolutionStrategy =
  | 'last-write-wins'
  | 'manual-review'
  | 'timestamp-based'
  | 'field-level-merge';

/**
 * Base system configuration interface
 */
export interface SystemConfig {
  name: string;
  authType: AuthType;
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    bearerToken?: string;
    username?: string;
    password?: string;
  };
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerSecond?: number;
    requestsPerDay?: number;
    concurrentRequests?: number;
  };
  apiVersion?: string;
  baseUrl?: string;
}

/**
 * Field mapping configuration
 */
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required?: boolean;
  defaultValue?: any;
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  url: string;
  secret?: string;
  signatureVerification?: 'hmac-sha256' | 'hmac-sha1' | 'basic-auth';
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'exponential' | 'linear';
    delays: number[]; // in seconds
  };
  sslRequired: boolean;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  retryAttempts: number;
  retryDelays: number[]; // in seconds
  circuitBreakerThreshold?: number;
  alertChannels: ('email' | 'slack' | 'sms')[];
  alertRecipients: string[];
  deadLetterQueue?: boolean;
}

/**
 * Monitoring and logging configuration
 */
export interface MonitoringConfig {
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  dashboardUrl?: string;
  alertThresholds?: {
    errorRatePercent: number;
    responseTimeMs: number;
    syncDelayMinutes: number;
  };
}

// ==================== SERVICE 31: INTEGRATION SIMPLE ====================

/**
 * Service #31: Simple Integration (2 systems)
 * אינטגרציה פשוטה בין 2 מערכות
 *
 * חיבור חד-כיווני בין 2 מערכות פופולריות עם סנכרון נתונים בסיסי
 * ללא טרנספורמציות מורכבות
 */
export interface IntegrationSimpleRequirements {
  /** מערכת מקור - לקריאת נתונים */
  sourceSystem: SystemConfig;

  /** מערכת יעד - לכתיבת נתונים */
  targetSystem: SystemConfig;

  /** הגדרות סנכרון */
  syncConfig: {
    direction: SyncDirection;
    frequency: SyncFrequency;
    pollingInterval?: number; // in minutes (minimum 5 minutes recommended)
    batchSize?: number;
  };

  /** מיפוי שדות בין המערכות */
  fieldMapping: FieldMapping[];

  /** הגדרות n8n */
  n8nConfig: {
    workflowEndpoint: string;
    apiKey?: string;
    estimatedNodes: number; // 3-5 nodes average
  };

  /** טיפול בשגיאות */
  errorHandling: ErrorHandlingConfig;

  /** Metadata */
  metadata: {
    complexity: 'simple';
    estimatedHours: number; // 8-16 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number; // 1,000-10,000 typical
    monthlyCost?: number;
  };
}

// ==================== SERVICE 32: INTEGRATION COMPLEX ====================

/**
 * Service #32: Complex Integration (3+ systems)
 * אינטגרציה מורכבת (3+ מערכות)
 *
 * חיבור מספר מערכות (3 ומעלה) עם סנכרון דו-כיווני,
 * טרנספורמציות נתונים מורכבות, ולוגיקה עסקית מותנית
 */
export interface IntegrationComplexRequirements {
  /** מערכות מקור ויעד (3 ומעלה) */
  systems: SystemConfig[];

  /** הגדרות סנכרון דו-כיווני */
  syncConfig: {
    direction: 'bi-directional';
    frequency: 'real-time';
    requiresWebhooks: true;
    conflictResolution: ConflictResolutionStrategy;
  };

  /** מיפוי שדות מורכב */
  fieldMappings: {
    systemPair: string; // "SystemA <-> SystemB"
    mappings: FieldMapping[];
    transformationLogic?: string;
  }[];

  /** Webhook configurations */
  webhooks: {
    systemName: string;
    config: WebhookConfig;
  }[];

  /** Database for sync state tracking */
  database: {
    type: 'supabase' | 'postgresql';
    tables: {
      syncLog: boolean;
      conflictQueue: boolean;
      syncState: boolean;
    };
  };

  /** טיפול בעדכונים מעגליים */
  circularUpdatePrevention: {
    enabled: boolean;
    syncSourceIdField: string;
    conflictLogging: boolean;
  };

  /** הגדרות n8n */
  n8nConfig: {
    mainWorkflow: string;
    subWorkflows?: string[];
    errorWorkflows?: string[];
    estimatedNodes: number; // 15-25 nodes
  };

  /** ניטור ותחזוקה */
  monitoring: MonitoringConfig;

  /** טיפול בשגיאות */
  errorHandling: ErrorHandlingConfig & {
    tokenRefreshAutomation: boolean;
    webhookRetryQueue: boolean;
  };

  /** Metadata */
  metadata: {
    complexity: 'complex';
    estimatedHours: number; // 40-80 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number; // 10,000-50,000 typical
    monthlyCost?: number;
  };
}

// ==================== SERVICE 33: INT-COMPLEX ====================

/**
 * Service #33: Enterprise Integration (4+ systems)
 * אינטגרציית מערכות מורכבת - גרסה מתקדמת
 *
 * אינטגרציה ארגונית מורכבת עם 4+ מערכות, data orchestration מתקדם,
 * business rules engine, ו-enterprise-grade error recovery
 */
export interface IntComplexRequirements {
  /** מערכות ארגוניות (4 ומעלה) */
  enterpriseSystems: SystemConfig[];

  /** API Gateway configuration */
  apiGateway?: {
    type: 'kong' | 'aws-api-gateway' | 'azure-api-management';
    enabled: boolean;
    centralizedAuth: boolean;
    rateLimitingStrategy: 'token-bucket' | 'leaky-bucket' | 'fixed-window';
  };

  /** Message Queue for async operations */
  messageQueue: {
    type: 'redis' | 'rabbitmq' | 'aws-sqs';
    host: string;
    port?: number;
    credentials?: {
      username?: string;
      password?: string;
    };
    queueNames: {
      mainQueue: string;
      deadLetterQueue: string;
      retryQueue: string;
    };
  };

  /** Database configuration */
  database: {
    type: 'postgresql' | 'supabase';
    connectionString: string;
    tables: {
      syncState: boolean;
      conflictQueue: boolean;
      auditLog: boolean;
      retryQueue: boolean;
    };
    concurrencyControl: {
      distributedLocks: boolean;
      lockProvider: 'redis' | 'database';
    };
  };

  /** Hub-and-Spoke integration pattern */
  integrationPattern: {
    type: 'hub-and-spoke' | 'peer-to-peer' | 'event-driven';
    hubSystem?: string; // e.g., "CRM"
    eventBus?: string;
  };

  /** Sync configurations per system pair */
  syncConfigurations: {
    systemPair: string;
    direction: SyncDirection;
    frequency: SyncFrequency;
    fieldMappings: FieldMapping[];
    businessRules?: string[];
  }[];

  /** Webhook infrastructure */
  webhookInfrastructure: {
    dedicatedReceiver: boolean;
    queueSystem: boolean;
    signatureVerification: 'hmac-sha256' | 'hmac-sha512';
    payloadBackup: {
      enabled: boolean;
      storageType?: 's3' | 'azure-blob' | 'gcs';
      bucketName?: string;
    };
  };

  /** n8n Enterprise configuration */
  n8nConfig: {
    edition: 'enterprise' | 'self-hosted';
    workflows: {
      main: string[];
      subWorkflows: string[];
      errorHandlers: string[];
    };
    estimatedNodes: number; // 30-50 nodes
  };

  /** Monitoring and observability */
  monitoring: MonitoringConfig & {
    platform: 'grafana' | 'datadog' | 'new-relic';
    realTimeDashboards: boolean;
    slaTracking: boolean;
  };

  /** Advanced error handling */
  errorHandling: ErrorHandlingConfig & {
    circuitBreaker: {
      enabled: boolean;
      failureThreshold: number; // e.g., 10 consecutive failures
      resetTimeoutSeconds: number;
    };
    idempotencyKeys: boolean;
    dataValidation: {
      jsonSchema: boolean;
      customValidators?: string[];
    };
  };

  /** Security configuration */
  security: {
    hmacSignatureVerification: boolean;
    apiKeyRotation: {
      enabled: boolean;
      intervalDays: number; // e.g., 90 days
    };
    ipWhitelisting?: string[];
    encryptedCredentialStorage:
      | 'supabase-vault'
      | 'aws-secrets'
      | 'hashicorp-vault';
  };

  /** Data governance */
  dataGovernance: {
    auditTrail: boolean;
    dataRetentionDays: number;
    gdprCompliant: boolean;
    accessControlPolicy: string;
  };

  /** Disaster recovery */
  disasterRecovery: {
    backupStrategy: string;
    rollbackProcedures: string;
    rtoMinutes: number; // Recovery Time Objective
    rpoMinutes: number; // Recovery Point Objective
  };

  /** Metadata */
  metadata: {
    complexity: 'enterprise';
    estimatedHours: number; // 100-200 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number; // 50,000-200,000 typical
    monthlyCost?: number;
    scalability: {
      horizontalScaling: boolean;
      loadBalancer?: string;
      peakLoadMultiplier: number; // e.g., 3x normal load
    };
  };
}

// ==================== SERVICE 34: WHATSAPP API SETUP ====================

/**
 * Service #34: WhatsApp Business API Setup
 * הקמת WhatsApp Business API
 *
 * הקמה מלאה של WhatsApp Business API עם Meta, כולל business verification,
 * הגדרת message templates, webhook configuration, וחיבור ל-CRM/n8n
 */
export interface WhatsappApiSetupRequirements {
  /** Meta Business Manager configuration */
  metaBusinessManager: {
    accountId: string;
    verified: boolean;
    businessEmail: string;
    businessWebsite: string;
    privacyPolicyUrl: string;
  };

  /** Facebook App configuration */
  facebookApp: {
    appId: string;
    appSecret: string;
    accessToken: string;
    tokenExpiry?: string;
  };

  /** WhatsApp Business Account (WABA) */
  whatsappBusinessAccount: {
    wabaId: string;
    phoneNumber: string;
    phoneNumberId: string;
    displayName: string;
    tier: 'tier-1' | 'tier-2' | 'tier-3' | 'unlimited'; // Messaging tier
  };

  /** API configuration */
  apiConfig: {
    type: 'cloud-api' | 'on-premise';
    apiVersion: string; // v18.0+ recommended
    rateLimits: {
      messagesPerSecond: number; // 80 for Cloud API, 600 for On-Premise
      messagesPerDay: number; // 1,000,000 for Cloud API
    };
  };

  /** Message templates */
  messageTemplates: {
    templateId: string;
    name: string;
    category: 'marketing' | 'utility' | 'authentication';
    language: string;
    status: 'pending' | 'approved' | 'rejected';
    content: string;
    variables?: string[];
    approvalTime?: string; // 24-48 hours typical, instant for verified
  }[];

  /** Webhook configuration */
  webhookConfig: WebhookConfig & {
    verifyToken: string; // For Meta verification
    subscriptionFields: string[]; // e.g., ['messages', 'message_status']
  };

  /** Integration with other systems */
  integrations: {
    n8n: {
      incomingWebhookUrl: string;
      outgoingApiEndpoint: string;
    };
    crm: {
      system: string; // e.g., "Zoho CRM"
      contactSync: boolean;
      conversationLogging: boolean;
    };
    database: {
      type: 'supabase' | 'postgresql';
      messageHistory: boolean;
      templateStorage: boolean;
    };
  };

  /** 24-hour window compliance */
  messagingRules: {
    twentyFourHourWindow: boolean;
    requireTemplatesOutsideWindow: boolean;
    freeFormResponseWindow: number; // 24 hours in seconds
  };

  /** Media handling */
  mediaConfig: {
    supportedTypes: ('image' | 'video' | 'document' | 'audio')[];
    maxSizes: {
      image: number; // 5MB
      video: number; // 16MB
      document: number; // 100MB
    };
    storageProvider?: 's3' | 'azure-blob' | 'gcs';
    retentionDays: number; // 30 days max for WhatsApp
  };

  /** Pricing and costs */
  pricingConfig: {
    model: 'pay-per-message';
    countryCode: string;
    rates: {
      marketing: number; // per message
      utility: number; // per message
      authentication: number; // per message
    };
    estimatedMonthlyMessages: number;
    estimatedMonthlyCost: number;
  };

  /** Quality and compliance */
  qualityControl: {
    currentRating: 'high' | 'medium' | 'low';
    spamComplaintsThreshold: number;
    blockRate: number;
    qualityMonitoring: boolean;
  };

  /** Testing configuration */
  testing: {
    testNumbers: string[];
    sandboxMode: boolean;
    testingCompleted: boolean;
  };

  /** Metadata */
  metadata: {
    complexity: 'medium';
    estimatedHours: number; // 20-40 hours typical
    prerequisites: string[];
    legalCompliance: ('gdpr' | 'ccpa' | 'local-regulations')[];
  };
}

// ==================== SERVICE 35: INT-CRM-MARKETING ====================

/**
 * Service #35: CRM to Marketing Automation Integration
 * אינטגרציית CRM למערכת Marketing Automation
 *
 * סנכרון דו-כיווני בין מערכת CRM (Zoho) למערכת Marketing Automation
 * (HubSpot/Mailchimp/ActiveCampaign) לניהול leads, רשימות תפוצה, campaigns, ו-tracking
 */
export interface IntCrmMarketingRequirements {
  /** CRM configuration (Zoho) */
  crmSystem: SystemConfig & {
    modules: ('contacts' | 'leads' | 'accounts' | 'custom-modules')[];
    customFields: {
      fieldName: string;
      fieldType: string;
      apiName: string;
    }[];
  };

  /** Marketing platform configuration */
  marketingPlatform: {
    type: 'hubspot' | 'mailchimp' | 'activecampaign';
    config: SystemConfig;
    capabilities: {
      lists: boolean;
      campaigns: boolean;
      automation: boolean;
      leadScoring: boolean;
    };
  };

  /** Bi-directional sync configuration */
  syncConfig: {
    direction: 'bi-directional';
    frequency: 'real-time';

    /** CRM → Marketing */
    crmToMarketing: {
      entities: ('contacts' | 'leads' | 'tags' | 'custom-fields')[];
      triggers: string[]; // e.g., "new lead created", "contact updated"
      listSegmentation: {
        enabled: boolean;
        rules: {
          crmCondition: string;
          marketingList: string;
        }[];
      };
    };

    /** Marketing → CRM */
    marketingToCrm: {
      entities: (
        | 'email-opens'
        | 'clicks'
        | 'unsubscribes'
        | 'conversions'
        | 'campaign-responses'
      )[];
      triggers: string[];
      leadScoring: {
        enabled: boolean;
        scoreFieldInCrm: string;
        scoringRules?: string[];
      };
    };
  };

  /** Field mapping */
  fieldMappings: {
    crmField: string;
    marketingField: string;
    syncDirection: 'crm-to-marketing' | 'marketing-to-crm' | 'bi-directional';
    transformation?: string;
  }[];

  /** Duplicate handling */
  duplicateHandling: {
    uniqueKey: 'email';
    strategy: 'skip' | 'update' | 'create-new';
    deduplicationRules?: string[];
  };

  /** Unsubscribe management (CRITICAL) */
  unsubscribeSync: {
    enabled: boolean;
    syncWithinMinutes: number; // Must be very fast (legal requirement)
    respectGlobalUnsubscribe: boolean;
    listSpecificUnsubscribes: boolean;
  };

  /** Campaign tracking */
  campaignTracking: {
    enabled: boolean;
    campaignIdMapping: {
      crmField: string;
      marketingField: string;
    };
    roiTracking: {
      enabled: boolean;
      linkToDeals: boolean;
    };
  };

  /** Compliance (GDPR/CAN-SPAM) */
  compliance: {
    gdprCompliant: boolean;
    consentManagement: {
      enabled: boolean;
      consentDateField: string;
      consentSourceField: string;
    };
    dataRetentionDays: number;
    rightToErasure: boolean;
  };

  /** List hygiene */
  listHygiene: {
    removeBouncedEmails: boolean;
    removeInactiveContacts: boolean;
    inactivityThresholdDays?: number;
  };

  /** Batch operations */
  batchConfig: {
    enabled: boolean;
    batchSize: number; // 100-500 recommended
    batchFrequency: 'hourly' | 'daily' | 'weekly';
  };

  /** Webhooks */
  webhooks: WebhookConfig[];

  /** Error handling */
  errorHandling: ErrorHandlingConfig;

  /** Metadata */
  metadata: {
    complexity: 'medium';
    estimatedHours: number; // 30-60 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number;
    monthlyCost?: number;
  };
}

// ==================== SERVICE 36: INT-CRM-ACCOUNTING ====================

/**
 * Service #36: CRM to Accounting System Integration
 * אינטגרציית CRM למערכת הנהלת חשבונות
 *
 * סנכרון נתונים בין CRM (Zoho) למערכת הנהלת חשבונות (QuickBooks/Xero)
 * לניהול לקוחות, חשבוניות, תשלומים, ודוחות פיננסיים
 */
export interface IntCrmAccountingRequirements {
  /** CRM configuration (Zoho) */
  crmSystem: SystemConfig & {
    modules: ('accounts' | 'deals' | 'contacts' | 'products')[];
    dealStages: string[];
  };

  /** Accounting system configuration */
  accountingSystem: {
    type: 'quickbooks' | 'xero';
    config: SystemConfig;
    realmId?: string; // QuickBooks specific
    tenantId?: string; // Xero specific
    sandboxMode: boolean; // MUST test in sandbox first
  };

  /** Entity mappings */
  entityMappings: {
    /** CRM Accounts → Accounting Customers */
    customers: {
      crmModule: 'accounts';
      accountingEntity: 'customers';
      matchingLogic: 'company-name-email' | 'exact-match' | 'fuzzy-match';
      fieldMappings: FieldMapping[];
      autoCreate: boolean;
    };

    /** CRM Deals → Accounting Invoices */
    invoices: {
      crmModule: 'deals';
      accountingEntity: 'invoices';
      triggerStage: string; // e.g., "Won", "Closed Won"
      approvalRequired: boolean;
      templateMapping: {
        dealCategory?: string;
        invoiceTemplate: string;
        lineItemsMapping: FieldMapping[];
      };
    };

    /** Products sync */
    products: {
      direction: 'bi-directional' | 'crm-to-accounting' | 'accounting-to-crm';
      crmModule: 'products';
      accountingEntity: 'items';
      fieldMappings: FieldMapping[];
    };

    /** Payment tracking */
    payments: {
      direction: 'accounting-to-crm';
      accountingEntity: 'payments';
      crmField: string; // e.g., "Payment Status"
      updateInvoiceStatus: boolean;
    };
  };

  /** Financial configuration */
  financialConfig: {
    /** Tax settings */
    tax: {
      enabled: boolean;
      taxRates: {
        region: string;
        rate: number;
        accountingTaxCodeId?: string;
      }[];
      vatGst: 'vat' | 'gst' | 'sales-tax';
      israelVatRate?: number; // 17%
    };

    /** Chart of accounts mapping */
    chartOfAccounts: {
      autoCreate: boolean; // Should be FALSE
      mapping: {
        crmDealCategory: string;
        accountingIncomeAccount: string;
        accountCode?: string;
      }[];
    };

    /** Currency handling */
    multiCurrency: {
      enabled: boolean;
      baseCurrency: string;
      supportedCurrencies: string[];
      exchangeRateSync: boolean;
      revaluationHandling?: string;
    };

    /** Payment terms */
    paymentTerms: {
      defaultTerms: string; // e.g., "Net 30"
      perCustomerType?: {
        customerType: string;
        terms: string;
      }[];
    };
  };

  /** Invoice workflow */
  invoiceWorkflow: {
    autoCreateInvoice: boolean;
    requiresApproval: boolean;
    approvers?: string[];
    duplicatePrevention: {
      enabled: boolean;
      referenceField: string; // Use CRM Deal ID
    };
    dataValidation: {
      requiredFields: string[];
      amountValidation: boolean;
      customerValidation: boolean;
    };
  };

  /** Payment reconciliation */
  paymentReconciliation: {
    enabled: boolean;
    matchingLogic: 'exact-amount' | 'partial-allowed';
    manualReviewThreshold?: number;
    reconciliationFrequency: 'daily' | 'weekly';
    reportRecipients: string[];
  };

  /** Batch operations */
  batchInvoicing: {
    enabled: boolean;
    batchSize: number;
    errorHandlingPerInvoice: boolean;
  };

  /** Webhooks */
  webhooks: WebhookConfig[];

  /** Error handling (CRITICAL for financial data) */
  errorHandling: ErrorHandlingConfig & {
    financialErrorAlert: {
      immediate: boolean;
      channels: ('email' | 'sms' | 'phone')[];
      recipients: string[];
    };
    auditTrail: boolean;
  };

  /** Compliance and audit */
  compliance: {
    auditLog: boolean;
    immutableRecords: boolean; // Some systems don't allow editing posted invoices
    dataRetentionYears: number; // Usually 7 years for accounting
  };

  /** Metadata */
  metadata: {
    complexity: 'high';
    estimatedHours: number; // 60-100 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number;
    monthlyCost?: number; // QuickBooks from $30/mo, Xero from $15/mo
  };
}

// ==================== SERVICE 37: INT-CRM-SUPPORT ====================

/**
 * Service #37: CRM to Support System Integration
 * אינטגרציית CRM למערכת תמיכת לקוחות
 *
 * חיבור בין CRM (Zoho) למערכת Support (Zendesk/Freshdesk/Intercom)
 * לסנכרון פניות שירות, tickets, היסטוריית לקוח, ו-SLA tracking
 */
export interface IntCrmSupportRequirements {
  /** CRM configuration (Zoho) */
  crmSystem: SystemConfig & {
    modules: ('accounts' | 'contacts' | 'cases' | 'tickets')[];
    customFields?: {
      fieldName: string;
      apiName: string;
    }[];
  };

  /** Support platform configuration */
  supportPlatform: {
    type: 'zendesk' | 'freshdesk' | 'intercom';
    config: SystemConfig;
    plan?: string; // e.g., "Enterprise", "Garden"
    capabilities: {
      tickets: boolean;
      users: boolean;
      organizations: boolean;
      satisfactionScores: boolean;
    };
  };

  /** Entity mappings */
  entityMappings: {
    /** Contacts sync */
    contacts: {
      direction: 'bi-directional';
      crmModule: 'contacts';
      supportEntity: 'users';
      fieldMappings: FieldMapping[];
      autoCreateInSupport: boolean;
    };

    /** Organizations/Accounts sync */
    organizations: {
      direction: 'bi-directional';
      crmModule: 'accounts';
      supportEntity: 'organizations';
      fieldMappings: FieldMapping[];
    };

    /** Tickets/Cases sync */
    tickets: {
      direction: 'bi-directional';
      createCrmCaseRules: string[]; // When to create CRM case vs. keep only in support
      supportEntity: 'tickets';
      crmModule: 'cases';
      fieldMappings: FieldMapping[];
      syncConversationThread: boolean;
      attachmentHandling: {
        enabled: boolean;
        maxSizeMb: number;
        storageLocation?: string;
      };
    };
  };

  /** Field mapping configurations */
  fieldMappingConfig: {
    /** Priority mapping */
    priority: {
      supportLevels: string[]; // e.g., ["Low", "Medium", "High", "Urgent"]
      crmLevels: string[];
      mapping: { support: string; crm: string }[];
    };

    /** Status workflow */
    status: {
      supportStatuses: string[]; // e.g., ["New", "Open", "Pending", "Solved"]
      crmStatuses: string[];
      mapping: { support: string; crm: string }[];
    };

    /** Agent/User mapping */
    agents: {
      matchBy: 'email' | 'user-id';
      supportAgents: { id: string; email: string; name: string }[];
      crmUsers: { id: string; email: string; name: string }[];
      assignmentSync: boolean;
    };
  };

  /** Real-time sync configuration */
  realTimeSync: {
    enabled: boolean;
    events: (
      | 'ticket-created'
      | 'ticket-updated'
      | 'status-changed'
      | 'agent-assigned'
    )[];
    webhooks: WebhookConfig[];
  };

  /** Customer context enrichment */
  customerContext: {
    /** Pull CRM data into support platform */
    enrichSupport: boolean;
    dataPoints: string[]; // e.g., ["Account Value", "Last Purchase", "Contract Status"]

    /** Push support data to CRM */
    enrichCrm: boolean;
    metrics: string[]; // e.g., ["Total Tickets", "Avg Response Time", "CSAT Score"]
  };

  /** SLA tracking */
  slaTracking: {
    enabled: boolean;
    definitions: {
      priority: string;
      responseTimeMinutes: number;
      resolutionTimeHours: number;
    }[];
    breachWarnings: {
      enabled: boolean;
      notifyInCrm: boolean;
      notifyChannels: ('email' | 'slack')[];
    };
  };

  /** Customer satisfaction (CSAT/NPS) */
  satisfactionScores: {
    enabled: boolean;
    syncToCrm: boolean;
    crmFields: {
      csatScore?: string;
      npsScore?: string;
      lastSurveyDate?: string;
    };
  };

  /** Escalation rules */
  escalationRules: {
    enabled: boolean;
    rules: {
      condition: string; // e.g., "Priority = Urgent"
      action: string; // e.g., "Notify Sales Team in CRM"
      notifyUsers: string[];
    }[];
  };

  /** Response templates (optional) */
  responseTemplates: {
    syncEnabled: boolean;
    direction?: 'support-to-crm' | 'crm-to-support';
  };

  /** Reporting and dashboards */
  reporting: {
    syncMetricsToCrm: boolean;
    dashboardUrl?: string;
    metrics: string[]; // e.g., ["Ticket Volume", "Avg Resolution Time", "CSAT"]
  };

  /** Duplicate prevention */
  duplicatePrevention: {
    enabled: boolean;
    checkBeforeCreate: boolean;
    matchingFields: string[]; // e.g., ["email", "ticket-subject"]
  };

  /** Error handling */
  errorHandling: ErrorHandlingConfig & {
    webhookReliability: {
      zendeskRetries: number; // Up to 3 times with exponential backoff
      freshdeskAuth: boolean; // Requires API key in headers
    };
    idempotencyKeys: boolean;
  };

  /** Metadata */
  metadata: {
    complexity: 'medium';
    estimatedHours: number; // 40-60 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number;
    monthlyCost?: number;
  };
}

// ==================== SERVICE 38: INT-CALENDAR ====================

/**
 * Service #38: Calendar APIs Integration
 * אינטגרציית Calendar APIs
 *
 * סנכרון אירועים ופגישות בין מערכות לוח שנה (Google Calendar, Outlook Calendar)
 * ו-CRM/מערכות אחרות, כולל תזמון אוטומטי ותזכורות
 */
export interface IntCalendarRequirements {
  /** Calendar providers */
  calendarProviders: {
    google?: {
      enabled: boolean;
      config: SystemConfig & {
        apiVersion: 'v3';
        quotas: {
          queriesPerDay: number; // 1,000,000 default
          perUserQuotas: boolean;
        };
        cloudProjectId: string;
      };
    };
    microsoft?: {
      enabled: boolean;
      config: SystemConfig & {
        apiVersion: 'v1.0';
        graphEndpoint: string;
        azureAppId: string;
        permissions: string[]; // e.g., ["Calendar.ReadWrite"]
      };
    };
  };

  /** CRM integration */
  crmIntegration: {
    system: string; // e.g., "Zoho CRM"
    module: 'events' | 'meetings' | 'calls';
    config: SystemConfig;
  };

  /** Sync configuration */
  syncConfig: {
    direction: 'bi-directional';
    frequency: 'real-time';

    /** CRM → Calendar */
    crmToCalendar: {
      enabled: boolean;
      triggerEvents: string[]; // e.g., "meeting scheduled in CRM"
      defaultCalendar: 'primary' | string; // calendar ID
      conflictCheck: boolean;
    };

    /** Calendar → CRM */
    calendarToCrm: {
      enabled: boolean;
      updateEvents: ('time-change' | 'cancellation' | 'attendee-change')[];
      createMeetingInCrm: boolean;
    };
  };

  /** Webhook configuration */
  webhookConfig: {
    google: {
      enabled: boolean;
      pushNotifications: boolean;
      renewalFrequencyHours: number; // ~24 hours, renew every 20 hours
      verificationToken: string;
    };
    microsoft: {
      enabled: boolean;
      subscriptions: boolean;
      expirationMinutes: number; // Max 4230 minutes (~3 days)
      renewalFrequencyDays: number; // Renew every 3 days
      validationToken: string;
    };
  };

  /** Webhook renewal automation */
  webhookRenewal: {
    enabled: boolean;
    cronSchedule: string;
    alertOnFailure: boolean;
  };

  /** Event field mapping */
  eventMappings: {
    summary: { crmField: string; calendarField: 'summary' };
    description: { crmField: string; calendarField: 'description' };
    startTime: { crmField: string; calendarField: 'start' };
    endTime: { crmField: string; calendarField: 'end' };
    location: { crmField: string; calendarField: 'location' };
    attendees: {
      enabled: boolean;
      crmField: string;
      calendarField: 'attendees';
      externalAttendeesAllowed: boolean;
    };
  };

  /** Timezone handling */
  timezoneConfig: {
    defaultTimezone: string; // IANA format, e.g., "Asia/Jerusalem"
    convertUserTimezones: boolean;
    alwaysUseIanaFormat: boolean;
  };

  /** Recurring events */
  recurringEvents: {
    enabled: boolean;
    useRruleFormat: boolean; // RFC 5545
    syncIndividualOccurrences: boolean;
  };

  /** Meeting type and category mapping */
  meetingTypes: {
    crmMeetingTypes: string[];
    calendarCategories: string[];
    mapping: { crmType: string; calendarCategory: string }[];
  };

  /** Reminders */
  reminders: {
    syncEnabled: boolean;
    defaultReminder: {
      google: { method: 'popup' | 'email'; minutes: number };
      microsoft: { minutes: number };
    };
    syncCrmTasksToReminders: boolean;
  };

  /** Privacy settings */
  privacySettings: {
    respectPrivateEvents: boolean;
    defaultVisibility: 'public' | 'private' | 'default';
  };

  /** Video conferencing */
  videoConferencing: {
    google: {
      autoAddGoogleMeet: boolean;
    };
    microsoft: {
      autoAddTeams: boolean;
    };
  };

  /** Availability checking */
  availabilityCheck: {
    enabled: boolean;
    freeBusyQuery: boolean;
    conflictResolution: 'prefer-calendar' | 'prefer-crm' | 'manual';
  };

  /** All-day events */
  allDayEvents: {
    enabled: boolean;
    handleWithoutTimezone: boolean;
  };

  /** Attachment support */
  attachments: {
    google: {
      enabled: boolean;
      syncAttachments: boolean;
    };
    microsoft: {
      enabled: boolean;
      useOneDriveLinks: boolean;
    };
  };

  /** Error handling */
  errorHandling: ErrorHandlingConfig & {
    rateLimitHandling: {
      googleDailyLimit: boolean; // 1M queries/day
      microsoftThrottling: boolean; // Very strict
      exponentialBackoff: number[]; // [1, 2, 4, 8] seconds
    };
    http429Handling: boolean; // Too Many Requests
  };

  /** Metadata */
  metadata: {
    complexity: 'medium';
    estimatedHours: number; // 30-50 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number;
    monthlyCost?: number; // Google Calendar API free, Microsoft Graph included in M365
  };
}

// ==================== SERVICE 39: INT-ECOMMERCE ====================

/**
 * Service #39: eCommerce Platform Integration
 * אינטגרציית פלטפורמות eCommerce
 *
 * סנכרון מלאי, הזמנות, לקוחות, ומוצרים בין פלטפורמת eCommerce
 * (Shopify/WooCommerce) ו-CRM/ERP/מערכות ניהול מלאי
 */
export interface IntEcommerceRequirements {
  /** eCommerce platform */
  ecommercePlatform: {
    type: 'shopify' | 'woocommerce';
    config: SystemConfig & {
      shopName?: string; // Shopify store name
      shopDomain?: string; // WooCommerce domain
      apiType?: 'rest' | 'graphql'; // Shopify supports both
    };
    rateLimits: {
      shopify?: {
        restRequestsPerSecond: number; // 2/second
        burstLimit: number; // Up to 40 requests
        graphqlPointsPerMinute: number; // 1,000 points/minute
      };
      woocommerce?: {
        requestsPerMinute: number; // Server-dependent, assume 60
      };
    };
  };

  /** CRM/ERP integration */
  businessSystems: {
    crm?: {
      enabled: boolean;
      system: string; // e.g., "Zoho CRM"
      modules: ('accounts' | 'contacts' | 'products' | 'sales-orders')[];
      config: SystemConfig;
    };
    erp?: {
      enabled: boolean;
      system: string;
      config: SystemConfig;
    };
    inventoryManagement?: {
      enabled: boolean;
      system: string;
      masterSystem: 'ecommerce' | 'inventory';
      config: SystemConfig;
    };
  };

  /** Entity sync configuration */
  entitySync: {
    /** Products sync */
    products: {
      direction: 'bi-directional' | 'crm-to-ecommerce' | 'ecommerce-to-crm';
      includeVariants: boolean;
      skuLevelTracking: boolean;
      imageSyncEnabled: boolean;
      imageMaxSizeMb?: number; // 5-10MB typical
      batchSync: {
        enabled: boolean;
        batchSize: number; // 100-500 recommended
      };
      fieldMappings: FieldMapping[];
    };

    /** Orders sync */
    orders: {
      direction: 'ecommerce-to-crm';
      realTimeSync: boolean;

      /** eCommerce → CRM */
      ecommerceToCrm: {
        triggerEvents: (
          | 'order-placed'
          | 'payment-completed'
          | 'order-fulfilled'
        )[];
        createSalesOrder: boolean;
        orderIdMapping: {
          ecommerceField: 'order_id';
          crmField: string;
        };
      };

      /** Order status mapping */
      statusMapping: {
        ecommerceStatuses: string[];
        crmStages: string[];
        mapping: { ecommerce: string; crm: string }[];
      };
    };

    /** Customers sync */
    customers: {
      direction: 'bi-directional';

      /** eCommerce → CRM */
      ecommerceToCrm: {
        triggerEvents: ('new-customer' | 'customer-updated')[];
        createContact: boolean;
        deduplication: {
          enabled: boolean;
          matchBy: 'email';
        };
      };

      /** CRM → eCommerce */
      crmToEcommerce: {
        updateCustomerData: boolean;
        syncFields: string[];
      };

      fieldMappings: FieldMapping[];
    };

    /** Inventory sync */
    inventory: {
      enabled: boolean;
      realTimeSync: boolean;

      /** Order → Inventory */
      orderToInventory: {
        reduceStockOnOrder: boolean;
        reserveStockOnPayment: boolean;
      };

      /** Inventory → eCommerce */
      inventoryToEcommerce: {
        updateAvailableQuantity: boolean;
        lowStockAlerts: boolean;
        multiLocation?: boolean; // Shopify supports multiple locations
      };

      reconciliation: {
        enabled: boolean;
        frequency: 'hourly' | 'daily';
      };
    };
  };

  /** Webhook configuration */
  webhookConfig: WebhookConfig & {
    shopify?: {
      hmacVerification: 'sha256';
      topics: string[]; // e.g., ["orders/create", "products/update"]
    };
    woocommerce?: {
      webhookSecret: string;
      topics: string[];
    };
    responseTimeRequirement: number; // <2 seconds for Shopify
  };

  /** Payment and fulfillment */
  paymentFulfillment: {
    /** Payment tracking */
    payment: {
      syncPaymentStatus: boolean;
      paymentGateway?: string;
      reconciliation: {
        enabled: boolean;
        matchTransactions: boolean;
      };
    };

    /** Fulfillment tracking */
    fulfillment: {
      syncFulfillmentStatus: boolean;
      updateTrackingNumbers: boolean;
      shippingMethodMapping?: {
        ecommerceMethod: string;
        crmMethod: string;
      }[];
    };
  };

  /** Refund handling */
  refunds: {
    enabled: boolean;
    syncImmediately: boolean; // Financial impact - must be immediate
    processingRules: string[];
    updateInCrm: boolean;
    updateInventory: boolean;
  };

  /** Abandoned cart recovery (optional) */
  abandonedCarts: {
    enabled: boolean;
    syncToCrm: boolean;
    remarketingCampaigns: boolean;
  };

  /** Customer lifetime value (CLV) */
  customerMetrics: {
    calculateClvInCrm: boolean;
    syncOrderHistory: boolean;
    aggregateMetrics: string[]; // e.g., ["Total Orders", "Total Spent", "Avg Order Value"]
  };

  /** Tax and shipping */
  taxShipping: {
    syncTaxRules: boolean;
    syncShippingMethods: boolean;
  };

  /** Error handling */
  errorHandling: ErrorHandlingConfig & {
    orderCreationFailure: {
      immediateAlert: boolean;
      alertChannels: ('email' | 'sms' | 'slack')[];
    };
    webhookFailures: {
      shopifyRetry: {
        enabled: boolean;
        maxRetryHours: number; // 48 hours
        exponentialBackoff: boolean;
      };
    };
  };

  /** Testing */
  testing: {
    shopifyDevelopmentStore?: boolean;
    woocommerceStagingSite?: boolean;
    testOrdersCompleted: boolean;
  };

  /** Metadata */
  metadata: {
    complexity: 'high';
    estimatedHours: number; // 60-100 hours typical
    prerequisites: string[];
    monthlyApiCalls?: number;
    monthlyCost?: number; // Shopify API free, WooCommerce free (hosting costs)
  };
}

// ==================== SERVICE 40: INT-CUSTOM ====================

/**
 * Service #40: Custom API Integration
 * אינטגרציית API מותאמת אישית
 *
 * פיתוח והטמעת API מותאם אישית לצרכים ייחודיים,
 * כולל API design, documentation, authentication, versioning,
 * ו-integration עם מערכות קיימות
 */
export interface IntCustomRequirements {
  /** API Architecture */
  apiArchitecture: {
    type: 'restful' | 'graphql' | 'grpc';
    design: 'microservices' | 'monolithic' | 'serverless';
    httpMethods: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')[];
    responseFormat: 'json' | 'xml' | 'protobuf';
    baseUrl: string;
  };

  /** Authentication strategy */
  authentication: {
    userFacing?: {
      type: 'oauth2';
      flows: (
        | 'authorization-code'
        | 'implicit'
        | 'client-credentials'
        | 'password'
      )[];
      tokenExpiry: {
        accessTokenMinutes: number; // Typical: 60 minutes
        refreshTokenDays: number; // Typical: 30-90 days
      };
      scopes?: string[];
    };
    serverToServer?: {
      type: 'api-key' | 'client-credentials' | 'jwt';
      keyRotation?: {
        enabled: boolean;
        intervalDays: number; // e.g., 90 days
      };
    };
    security: {
      httpsOnly: boolean;
      ipWhitelisting?: string[];
      twoFactorAuth?: boolean;
    };
  };

  /** API Gateway (optional) */
  apiGateway?: {
    enabled: boolean;
    provider:
      | 'kong'
      | 'aws-api-gateway'
      | 'azure-api-management'
      | 'google-apigee';
    features: {
      rateLimiting: boolean;
      authentication: boolean;
      analytics: boolean;
      caching: boolean;
    };
  };

  /** Rate limiting */
  rateLimiting: {
    enabled: boolean;
    algorithm:
      | 'token-bucket'
      | 'leaky-bucket'
      | 'fixed-window'
      | 'sliding-window';
    limits: {
      requestsPerMinute: number;
      requestsPerHour?: number;
      requestsPerDay?: number;
      burstAllowance?: number;
    };
    perClientLimits?: {
      clientId: string;
      customLimit: number;
    }[];
    headers: {
      rateLimitLimit: 'X-RateLimit-Limit';
      rateLimitRemaining: 'X-RateLimit-Remaining';
      rateLimitReset: 'X-RateLimit-Reset';
    };
  };

  /** API Versioning */
  versioning: {
    strategy: 'uri-path' | 'query-param' | 'header' | 'content-negotiation';
    currentVersion: string; // e.g., "v1", "v2"
    supportedVersions: string[];
    deprecationPolicy: {
      announcementMonths: number; // e.g., 6 months
      supportMonths: number; // e.g., 12 months after announcement
    };
  };

  /** Endpoints design */
  endpoints: {
    resourceName: string;
    uri: string; // e.g., "/api/v1/resources/{id}"
    methods: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')[];
    authentication: boolean;
    rateLimited: boolean;
    description: string;
    requestSchema?: object; // JSON Schema
    responseSchema?: object; // JSON Schema
  }[];

  /** Data model */
  dataModel: {
    database: {
      type: 'postgresql' | 'supabase' | 'mongodb' | 'mysql';
      connectionString: string;
      indexes: {
        table: string;
        fields: string[];
        type: 'btree' | 'hash' | 'gin' | 'gist';
      }[];
      connectionPooling: {
        enabled: boolean;
        minConnections: number;
        maxConnections: number;
      };
    };
    entities: {
      name: string;
      fields: {
        name: string;
        type: string;
        required: boolean;
        unique?: boolean;
        indexed?: boolean;
      }[];
      relationships?: {
        type: 'one-to-one' | 'one-to-many' | 'many-to-many';
        targetEntity: string;
      }[];
    }[];
    validationRules: {
      entity: string;
      field: string;
      rules: string[];
    }[];
  };

  /** Response features */
  responseFeatures: {
    pagination: {
      enabled: boolean;
      type: 'offset-limit' | 'cursor-based';
      defaultPageSize: number;
      maxPageSize: number;
    };
    filtering: {
      enabled: boolean;
      supportedOperators: (
        | 'eq'
        | 'ne'
        | 'gt'
        | 'gte'
        | 'lt'
        | 'lte'
        | 'in'
        | 'like'
      )[];
      exampleQuery?: string; // "?status=active&created_after=2025-01-01"
    };
    sorting: {
      enabled: boolean;
      format: string; // e.g., "?sort=created_at:desc"
      multipleFields: boolean;
    };
    fieldSelection: {
      enabled: boolean;
      format: string; // e.g., "?fields=id,name,email"
    };
  };

  /** Error handling */
  errorHandling: {
    standardHttpCodes: boolean;
    customErrorCodes?: {
      code: string;
      httpStatus: number;
      message: string;
    }[];
    errorResponse: {
      includeErrorCode: boolean;
      includeMessage: boolean;
      includeDetails: boolean;
      includeTimestamp: boolean;
      includeRequestId: boolean;
    };
    localization?: {
      enabled: boolean;
      supportedLanguages: string[];
    };
  };

  /** Security */
  security: {
    inputValidation: {
      enabled: boolean;
      sanitization: boolean;
      maxPayloadSizeMb: number;
    };
    sqlInjectionPrevention: {
      parameterizedQueries: boolean;
      ormUsage: boolean;
    };
    xssPrevention: {
      outputSanitization: boolean;
      contentSecurityPolicy: boolean;
    };
    cors: {
      enabled: boolean;
      allowedOrigins: string[]; // Don't use wildcard (*) in production
      allowedMethods: string[];
      allowCredentials: boolean;
    };
  };

  /** Webhook support */
  webhooks?: {
    enabled: boolean;
    events: string[];
    deliveryConfig: {
      retryAttempts: number;
      backoffStrategy: 'exponential';
      delays: number[]; // [5, 25, 125] seconds
    };
    security: {
      signatureType: 'hmac-sha256' | 'hmac-sha512';
      includeTimestamp: boolean; // Prevent replay attacks
    };
  };

  /** Batch operations */
  batchOperations?: {
    enabled: boolean;
    maxBatchSize: number;
    endpoints: string[];
  };

  /** Caching */
  caching?: {
    enabled: boolean;
    provider: 'redis' | 'memcached' | 'cdn';
    strategy: 'cache-aside' | 'write-through' | 'write-behind';
    ttlSeconds: number;
    cacheableEndpoints: string[];
  };

  /** Performance targets */
  performance: {
    responseTimeMs: {
      get: number; // <200ms target
      post: number; // <500ms target
      put: number; // <500ms target
    };
    throughput: {
      requestsPerSecond: number;
      peakLoadMultiplier: number; // e.g., 10x normal load
    };
    availability: {
      uptimePercent: number; // e.g., 99.9%
      slaTarget: string;
    };
  };

  /** Documentation */
  documentation: {
    openapiSpec: {
      enabled: boolean;
      version: '3.0' | '3.1';
      specUrl?: string;
    };
    swaggerUi: {
      enabled: boolean;
      url?: string;
    };
    postmanCollection: {
      enabled: boolean;
      collectionUrl?: string;
    };
    codeExamples: {
      languages: ('curl' | 'javascript' | 'python' | 'java' | 'php' | 'ruby')[];
    };
    changelog: {
      enabled: boolean;
      url?: string;
    };
  };

  /** Monitoring and observability */
  monitoring: MonitoringConfig & {
    apm?: {
      enabled: boolean;
      provider: 'datadog' | 'new-relic' | 'elastic-apm';
    };
    logging: {
      structured: boolean;
      format: 'json' | 'text';
      includeRequestId: boolean;
      retentionDays: number;
    };
    tracing: {
      enabled: boolean;
      distributed: boolean;
    };
  };

  /** Load testing */
  loadTesting: {
    completed: boolean;
    tool?: 'k6' | 'jmeter' | 'gatling' | 'locust';
    peakLoadTested: boolean;
    resultsUrl?: string;
  };

  /** CI/CD */
  cicd?: {
    enabled: boolean;
    provider: 'github-actions' | 'gitlab-ci' | 'jenkins' | 'circleci';
    automatedTesting: boolean;
    stagingEnvironment: boolean;
    deploymentStrategy: 'blue-green' | 'canary' | 'rolling';
  };

  /** Testing strategy */
  testing: {
    unitTests: {
      enabled: boolean;
      coveragePercent: number; // Target: 80%+
      framework?: string;
    };
    integrationTests: {
      enabled: boolean;
      coveragePercent?: number;
    };
    e2eTests: {
      enabled: boolean;
      framework?: string;
    };
  };

  /** Integration with other systems */
  integrations: {
    crm?: {
      enabled: boolean;
      system: string;
      direction: SyncDirection;
    };
    internalSystems?: {
      system: string;
      type: 'legacy' | 'modern';
      integrationMethod: 'direct-api' | 'message-queue' | 'webhook';
    }[];
    thirdPartyApis?: {
      apiName: string;
      purpose: string;
      credentials: SystemConfig;
    }[];
  };

  /** n8n orchestration */
  n8nIntegration?: {
    enabled: boolean;
    workflows: string[];
    customNodes?: string[];
  };

  /** Metadata */
  metadata: {
    complexity: 'simple' | 'medium' | 'high' | 'enterprise';
    estimatedHours: number; // 20-40 (simple), 100-200 (complex)
    prerequisites: string[];
    monthlyApiCalls?: number;
    monthlyCost?: number;
    maintenanceHoursPerMonth?: number;
  };
}

// ==================== UNION TYPE ====================

/**
 * Union type for all integration service configurations
 */
export type IntegrationServiceConfig =
  | IntegrationSimpleRequirements
  | IntegrationComplexRequirements
  | IntComplexRequirements
  | WhatsappApiSetupRequirements
  | IntCrmMarketingRequirements
  | IntCrmAccountingRequirements
  | IntCrmSupportRequirements
  | IntCalendarRequirements
  | IntEcommerceRequirements
  | IntCustomRequirements;

/**
 * Integration service entry with metadata
 * שירות אינטגרציה עם metadata
 */
export interface IntegrationServiceEntry {
  /** Service identifier (31-40) */
  serviceId:
    | 'integration-simple'
    | 'integration-complex'
    | 'int-complex'
    | 'whatsapp-api-setup'
    | 'int-crm-marketing'
    | 'int-crm-accounting'
    | 'int-crm-support'
    | 'int-calendar'
    | 'int-ecommerce'
    | 'int-custom';

  /** Service display name */
  serviceName: string;

  /** Service requirements configuration */
  requirements: IntegrationServiceConfig;

  /** Completion timestamp */
  completedAt?: string;

  /** Last update timestamp */
  updatedAt?: string;

  /** Notes and additional context */
  notes?: string;

  /** Testing status */
  testingStatus?: 'not-started' | 'in-progress' | 'completed' | 'failed';

  /** Production deployment status */
  deploymentStatus?: 'not-deployed' | 'staging' | 'production';
}

/**
 * Integration services collection for Phase 2
 * אוסף שירותי אינטגרציה עבור שלב 2
 */
export interface IntegrationServicesCollection {
  /** Selected integration services */
  selectedServices: IntegrationServiceEntry[];

  /** Total estimated hours */
  totalEstimatedHours: number;

  /** Total estimated cost */
  totalEstimatedCost: number;

  /** Overall complexity assessment */
  overallComplexity: 'simple' | 'medium' | 'high' | 'enterprise';

  /** Integration completion percentage */
  completionPercentage: number;
}
