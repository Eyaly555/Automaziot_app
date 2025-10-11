/**
 * System Implementation Services Types (Services 41-49)
 *
 * This file contains TypeScript interfaces for all 9 System Implementation services.
 * Each interface represents the complete technical requirements and configuration
 * needed to implement a specific type of system (CRM, Marketing Automation, etc.).
 *
 * These types align with Phase 2 implementation specifications and support
 * detailed requirement gathering for system implementation projects.
 */

// ============================================================================
// Service #41: CRM Implementation
// ============================================================================

/**
 * Service #41: CRM Implementation
 * הטמעת מערכת CRM (Zoho/HubSpot/Salesforce)
 *
 * Timeline: 4-8 weeks
 * Complexity: High
 */
export interface ImplCrmRequirements {
  // Platform Selection
  platform: 'zoho' | 'hubspot' | 'salesforce';
  subscriptionTier: string; // e.g., "Professional", "Enterprise", "Suite Growth"

  // Admin Access
  adminAccess: {
    email: string;
    role: 'owner' | 'admin' | 'super_admin' | 'system_administrator';
    hasApiAccess: boolean;
    hasSandboxAccess?: boolean; // HubSpot Enterprise, Salesforce only
  };

  // API Credentials
  apiCredentials: {
    // Zoho
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;

    // HubSpot
    apiKey?: string;
    oauthAppId?: string;

    // Salesforce
    connectedAppId?: string;
    securityToken?: string;

    // Common
    apiDomain?: string;
    sandboxUrl?: string;
  };

  // API Rate Limits (platform-specific)
  apiLimits?: {
    platform: 'zoho' | 'hubspot' | 'salesforce';

    // Zoho: Concurrent calls
    concurrentCalls?: number; // 10-75 depending on subscription
    subConcurrencyCalls?: number; // 10 for heavy resources

    // HubSpot: Daily + burst
    dailyRequests?: number; // Professional: 650K, Enterprise: 1M
    burstRequests?: number; // 190 per 10 seconds

    // Salesforce: Daily + per user
    dailyApiCalls?: number; // Enterprise: 100K base
    perUserCalls?: number; // 1K per user
    bulkApiBatches?: number; // 15K batches/day
    bulkApiRecordsPerBatch?: number; // 10K records
  };

  // Data Migration
  dataMigration?: {
    sourceSystem: string;
    recordCount: number;
    hasBackup: boolean;
    cleanupCompleted: boolean; // Duplicates removed
    hasSftpAccess?: boolean;
    migrationMethod: 'csv_import' | 'bulk_api' | 'sftp' | 'manual';
  };

  // Custom Fields Configuration
  customFields: Array<{
    module: string; // Leads, Contacts, Deals, Accounts, etc.
    fieldName: string;
    fieldType: 'text' | 'number' | 'date' | 'datetime' | 'picklist' | 'multi_picklist' | 'lookup' | 'checkbox' | 'currency' | 'email' | 'phone' | 'url';
    isRequired: boolean;
    picklistValues?: string[]; // For picklist/multi_picklist
    defaultValue?: string;
  }>;

  // Sales Pipeline Configuration
  salesPipeline: {
    pipelineName: string;
    stages: string[];
    customProbability?: Record<string, number>; // stage -> probability %
    averageDealCycle?: number; // days
  };

  // Lead Sources
  leadSources: string[];

  // Workflow Automation Rules
  workflowRules: Array<{
    ruleName: string;
    module: string; // Which CRM module
    trigger: 'on_create' | 'on_update' | 'on_field_update' | 'on_stage_change' | 'scheduled';
    conditions?: string; // JSON string of conditions
    actions: Array<{
      type: 'send_email' | 'update_field' | 'create_task' | 'send_notification' | 'webhook';
      configuration: Record<string, unknown>;
    }>;
  }>;

  // User Roles & Permissions
  userRoles: Array<{
    roleName: string;
    permissions: string[];
    userCount: number;
    canExportData?: boolean;
    canDeleteRecords?: boolean;
    canManageSettings?: boolean;
  }>;

  // Integration Requirements
  integrations?: {
    email: boolean; // Gmail/Outlook sync
    calendar: boolean; // Calendar sync
    website: boolean; // Web forms
    emailMarketing?: boolean; // Sync to marketing platform
    phoneSystem?: boolean; // Call logging
  };

  // Training & Support
  trainingRequired: boolean;
  trainingType?: 'basic' | 'advanced' | 'admin' | 'all';
  supportLevel: 'basic' | 'extended' | 'premium';
  uatWeeks?: number; // User Acceptance Testing duration (2-3 weeks typical)

  // Timeline & Go-Live
  estimatedWeeks: number; // 4-8 weeks typical
  goLiveDate?: string; // ISO date
  hasRollbackPlan: boolean;
}

// ============================================================================
// Service #42: Marketing Automation Implementation
// ============================================================================

/**
 * Service #42: Marketing Automation Implementation
 * הטמעת מערכת אוטומציית שיווק (HubSpot Marketing/ActiveCampaign/Mailchimp)
 *
 * Timeline: 2-4 weeks
 * Complexity: Medium-High
 */
export interface ImplMarketingAutomationRequirements {
  // Platform Selection
  platform: 'hubspot_marketing' | 'activecampaign' | 'mailchimp';
  subscriptionTier: string; // "Starter", "Professional", "Plus", etc.

  // Admin Access
  adminAccess: {
    email: string;
    role: 'owner' | 'admin' | 'account_owner';
    hasApiAccess: boolean;
    hasSandboxAccess?: boolean; // HubSpot Enterprise only
  };

  // API Credentials
  apiCredentials: {
    apiKey?: string;
    oauthClientId?: string;
    oauthClientSecret?: string;
    apiEndpoint?: string;
  };

  // Domain Authentication (critical for deliverability)
  domainAuthentication: {
    domain: string;
    spfRecordConfigured: boolean;
    dkimRecordConfigured: boolean;
    hasPhysicalAddress: boolean; // Required by CAN-SPAM Act
    hasDnsAccess: boolean;
  };

  // Email Lists & Data
  emailLists?: {
    hasExistingLists: boolean;
    totalContacts?: number;
    hasGdprConsent: boolean; // GDPR compliance
    hasDoubleOptIn?: boolean;
    listsCsvReady?: boolean;
  };

  // Website Tracking
  websiteTracking: {
    hasWebsiteAccess: boolean;
    trackingCodeInstalled: boolean;
    useGoogleTagManager?: boolean;
    trackingDomains: string[];
  };

  // Email Templates & Branding
  emailTemplates?: {
    hasDesignedTemplates: boolean;
    brandColors?: string[];
    brandLogo?: string;
    needsDesignHelp: boolean;
  };

  // Automation Workflows
  automationWorkflows: Array<{
    workflowName: string;
    trigger: 'form_submit' | 'list_join' | 'tag_added' | 'page_visit' | 'email_opened' | 'link_clicked' | 'date_based';
    actions: Array<{
      type: 'send_email' | 'add_tag' | 'update_field' | 'move_to_list' | 'wait' | 'if_else' | 'webhook';
      delay?: number; // minutes/hours/days
      configuration?: Record<string, unknown>;
    }>;
  }>;

  // Lead Scoring (if applicable)
  leadScoring?: {
    enabled: boolean;
    scoringRules: Array<{
      action: string;
      points: number;
    }>;
    qualificationThreshold?: number;
  };

  // Segmentation Strategy
  segmentation: {
    segments: Array<{
      segmentName: string;
      criteria: string; // Description of segment criteria
      estimatedSize?: number;
    }>;
  };

  // Custom Fields
  customFields: Array<{
    fieldName: string;
    fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
    purpose: string;
    isRequired: boolean;
  }>;

  // GDPR & Compliance
  compliance: {
    gdprCompliant: boolean;
    hasUnsubscribeLink: boolean; // Required
    hasPhysicalAddress: boolean; // Required by CAN-SPAM
    hasPrivacyPolicy: boolean;
    cookieConsentBanner?: boolean;
  };

  // Integration Requirements
  integrations?: {
    crm: boolean;
    websiteForms: boolean;
    socialMedia?: boolean;
    landingPageBuilder?: boolean;
    ecommerce?: boolean;
  };

  // Email Sending Strategy
  emailStrategy?: {
    warmupPeriod: boolean; // Build sender reputation gradually
    startingVolume?: number; // Daily email limit at start
    targetVolume?: number; // Daily email goal
    abTestingEnabled?: boolean;
  };

  // Training & Support
  trainingRequired: boolean;
  trainingTopics?: string[]; // e.g., ["Workflows", "Campaigns", "Segmentation"]

  // Timeline
  estimatedWeeks: number; // 2-4 weeks typical
  goLiveDate?: string;
}

// ============================================================================
// Service #43: Project Management System Implementation
// ============================================================================

/**
 * Service #43: Project Management Implementation
 * הטמעת מערכת ניהול פרויקטים (Monday.com/Asana/Jira/ClickUp)
 *
 * Timeline: 3-6 weeks
 * Complexity: Medium-High
 */
export interface ImplProjectManagementRequirements {
  // Platform Selection
  platform: 'monday' | 'asana' | 'jira' | 'clickup';
  subscriptionTier: string; // "Standard", "Business", "Enterprise", "Unlimited"

  // Admin Access
  adminAccess: {
    email: string;
    role: 'owner' | 'admin' | 'workspace_owner';
    hasApiAccess: boolean;

    // Platform-specific
    hasScimAccess?: boolean; // Monday.com Enterprise - user management
    hasServiceAccount?: boolean; // Asana Enterprise - stable integrations
  };

  // API Credentials
  apiCredentials: {
    // Monday.com
    apiToken?: string;
    apiVersion?: string; // v2

    // Asana
    personalAccessToken?: string;
    serviceAccountToken?: string; // Enterprise only

    // Jira
    jiraEmail?: string;
    jiraApiToken?: string;
    jiraCloudOrServer?: 'cloud' | 'server' | 'data_center';

    // ClickUp
    personalApiToken?: string;
    oauthClientId?: string;
    awsRegion?: string; // Important for migration
  };

  // Organizational Structure
  organizationalStructure: {
    workspaces: Array<{
      workspaceName: string;
      teams: string[];
      departmentAlignment?: string;
    }>;
    totalUsers: number;
    externalCollaborators?: number;
  };

  // Workflow Templates
  workflowTemplates: Array<{
    templateName: string;
    projectType: string; // "Software Dev", "Marketing Campaign", "Client Onboarding"
    stages: string[];
    customFields: Array<{
      fieldName: string;
      fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'people' | 'status' | 'priority';
    }>;
  }>;

  // Status Configuration
  statusConfiguration: Array<{
    context: string; // e.g., "Development Tasks", "Marketing Projects"
    statuses: Array<{
      statusName: string;
      color?: string;
      isFinalState?: boolean;
    }>;
  }>;

  // Custom Fields (global or template-specific)
  customFields: Array<{
    fieldName: string;
    fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'person' | 'dependency' | 'formula';
    appliesTo: 'all' | string[]; // workspace names or project types
    isRequired: boolean;
  }>;

  // User Roles & Permissions
  userRoles: Array<{
    roleName: string;
    permissions: string[];
    userCount: number;
    canCreateProjects?: boolean;
    canDeleteTasks?: boolean;
    canManageWorkspace?: boolean;
  }>;

  // Data Migration (if from another PM tool)
  dataMigration?: {
    sourceSystem: string;
    projectCount: number;
    taskCount: number;
    hasExportedCsv: boolean;
    downTimeWindowHours?: number; // ClickUp requires downtime
    migrationApproved?: boolean; // ClickUp requires owner approval
  };

  // Automation Rules
  automationRules: Array<{
    ruleName: string;
    trigger: 'status_change' | 'date_reached' | 'task_created' | 'assignee_changed' | 'custom_field_update';
    conditions?: string;
    actions: Array<{
      type: 'notify' | 'update_field' | 'create_task' | 'move_item' | 'send_email';
      configuration: Record<string, unknown>;
    }>;
  }>;

  // Integration Requirements
  integrations?: {
    crm?: boolean;
    timeTracking?: boolean;
    fileStorage?: boolean; // Google Drive, Dropbox
    communicationTools?: boolean; // Slack, Teams
    calendar?: boolean;
  };

  // Training & Rollout
  trainingStrategy: {
    pilotProject?: boolean; // Recommended before full rollout
    trainingRequired: boolean;
    trainingAudience: Array<'project_managers' | 'team_members' | 'executives' | 'admins'>;
  };

  // Timeline
  estimatedWeeks: number; // 3-6 weeks typical
  goLiveDate?: string;
  hasRollbackPlan: boolean;
}

// ============================================================================
// Service #44: Helpdesk/Support System Implementation
// ============================================================================

/**
 * Service #44: Helpdesk Implementation
 * הטמעת מערכת Helpdesk/תמיכה (Zendesk/Freshdesk/Intercom)
 *
 * Timeline: 2-4 weeks
 * Complexity: Medium
 */
export interface ImplHelpdeskRequirements {
  // Platform Selection
  platform: 'zendesk' | 'freshdesk' | 'intercom';
  subscriptionTier: string; // "Suite Growth", "Enterprise", "Growth"

  // Admin Access
  adminAccess: {
    email: string;
    role: 'admin' | 'owner' | 'administrator';
    hasApiAccess: boolean;
    hasSandboxAccess?: boolean; // Zendesk Enterprise+
  };

  // API Credentials
  apiCredentials: {
    // Zendesk
    subdomain?: string;
    apiToken?: string;
    oauthToken?: string;

    // Freshdesk
    freshdeskDomain?: string;
    freshdeskApiKey?: string; // Note: Agent role affects API permissions

    // Intercom
    workspaceId?: string;
    accessToken?: string;
  };

  // Sandbox Configuration (Zendesk-specific)
  sandboxConfig?: {
    hasSandbox: boolean;
    dataReplicationEnabled?: boolean; // Premium sandbox - 10K-100K tickets
    userEmailsObfuscated?: boolean; // Emails changed to @example.com
  };

  // Email Integration
  emailIntegration: {
    supportEmails: string[]; // e.g., ["support@company.com", "help@company.com"]
    emailForwarding?: {
      configured: boolean;
      forwardingAddress?: string;
    };
    imapPopConfig?: {
      server: string;
      port: number;
      username: string;
      useSsl: boolean;
    };
    spfDkimConfigured: boolean; // Domain authentication
  };

  // Website Widget
  websiteWidget: {
    deploymentRequired: boolean;
    websiteUrls: string[];
    widgetPosition?: 'bottom_right' | 'bottom_left' | 'custom';
    hasWebsiteAccess: boolean;
    hasLiveChat: boolean;
  };

  // Ticket Configuration
  ticketConfiguration: {
    ticketTypes: Array<{
      typeName: string;
      category?: string;
      subcategory?: string;
    }>;
    priorityLevels: Array<{
      level: 'low' | 'medium' | 'high' | 'urgent';
      slaResponseTime?: number; // hours
      slaResolutionTime?: number; // hours
    }>;
  };

  // SLA Policies
  slaPolicies: Array<{
    policyName: string;
    appliesTo: string; // ticket type or customer tier
    firstResponseTime: number; // hours
    resolutionTime: number; // hours
    businessHoursOnly: boolean;
  }>;

  // Agent Roles & Permissions
  agentRoles: Array<{
    roleName: string;
    permissions: string[];
    agentCount: number;
    canDeleteTickets?: boolean;
    canManageSettings?: boolean;
    viewScope?: 'own_tickets' | 'team_tickets' | 'all_tickets';
  }>;

  // Ticket Assignment Rules
  assignmentRules: Array<{
    ruleName: string;
    conditions: string; // e.g., "Category = 'Technical'"
    assignTo: 'round_robin' | 'load_balanced' | 'specific_agent' | 'specific_team';
    agentOrTeamId?: string;
  }>;

  // Canned Responses (Templates)
  cannedResponses?: Array<{
    responseName: string;
    subject?: string;
    bodyPreview: string;
    category?: string;
  }>;

  // Knowledge Base
  knowledgeBase?: {
    hasArticles: boolean;
    articleCount?: number;
    categories: string[];
    isPublic: boolean;
    needsContentCreation?: boolean;
  };

  // Email Signature
  emailSignature?: {
    template: string;
    includeAgentName: boolean;
    includeCompanyInfo: boolean;
  };

  // Integration Requirements
  integrations?: {
    crm?: boolean;
    slackTeams?: boolean; // Notifications
    phoneSystem?: boolean;
    liveChatExternal?: boolean;
  };

  // Training & Support
  trainingRequired: boolean;
  trainingTopics?: string[]; // ["SLAs", "Escalation", "Knowledge Base"]

  // Go-Live Checklist
  goLiveChecklist?: {
    routingRulesVerified: boolean;
    slaTimersConfigured: boolean;
    notificationSettingsReady: boolean;
    agentAssignmentsComplete: boolean;
  };

  // Timeline
  estimatedWeeks: number; // 2-4 weeks typical
  goLiveDate?: string;
}

// ============================================================================
// Service #45: ERP Implementation
// ============================================================================

/**
 * Service #45: ERP Implementation
 * הטמעת ERP (SAP/Oracle NetSuite/Microsoft Dynamics)
 *
 * Timeline: 6-18 months
 * Complexity: Very High (most complex implementation)
 */
export interface ImplErpRequirements {
  // Platform Selection
  platform: 'sap_s4hana' | 'oracle_netsuite' | 'microsoft_dynamics' | 'odoo';
  subscriptionTier: string; // "Enterprise", "Ultimate", "Professional"

  // Licensing Model (especially important for SAP)
  licensingModel?: {
    type: 'perpetual' | 'subscription' | 'user_based' | 'revenue_based';
    sapLicenseCode?: string; // e.g., "7018652" (SAP S/4HANA Enterprise Management)
    creditMigrationPercentage?: number; // SAP: 70-80% as of 2024-2025
    modules: string[]; // Enabled ERP modules
  };

  // Admin Access
  adminAccess: {
    email: string;
    role: 'system_administrator' | 'admin' | 'deployment_administrator';

    // SAP-specific
    sapRfcUser?: {
      username: string;
      userType: 'communication' | 'dialog';
      hasRole: string; // SAP_DMIS_MC_DT_REMOTE
    };

    // NetSuite-specific
    netsuiteAdminFullAccess?: boolean;

    // Dynamics-specific
    azureAdPermissions?: boolean;
  };

  // API & Integration Credentials
  apiCredentials: {
    // SAP
    dmisAddonInstalled?: boolean; // Required for data migration
    rfcConnectionDetails?: Record<string, string>;

    // NetSuite
    restWebServicesEnabled?: boolean;
    suiteScriptDeploymentCapability?: boolean;

    // Dynamics
    webApiAccess?: boolean;
    organizationServiceAccess?: boolean;

    // Common
    apiEndpoint?: string;
    integrationUsername?: string;
  };

  // Database Access
  databaseAccess: {
    hasAccess: boolean;
    databaseType: 'postgresql' | 'mysql' | 'oracle' | 'sql_server' | 'hana';
    hasMigrationTools: boolean;
  };

  // Infrastructure
  infrastructure: {
    deploymentType: 'cloud' | 'on_premise' | 'hybrid';
    serversProvisioned: boolean;
    networkConfigured: boolean;
    firewallsSetup: boolean;
    hasTestEnvironment: boolean;
    hasSandbox: boolean;
  };

  // Sandbox Configuration
  sandboxConfig?: {
    hasSandbox: boolean;
    sandboxCount?: number; // NetSuite: 1+ per production
    sandboxType?: 'developer' | 'partial' | 'full'; // Salesforce-style
    copiesData?: boolean;
    copiesCustomizations?: boolean;
  };

  // Organizational Structure
  organizationalStructure: {
    companies: Array<{
      companyName: string;
      legalEntity: string;
      country: string;
      currency: string;
    }>;
    departments: string[];
    costCenters?: string[];
    businessUnits?: string[];
  };

  // Chart of Accounts
  chartOfAccounts: {
    approved: boolean;
    accountStructure: string; // Description or reference
    numberOfAccounts?: number;
    hasTaxConfiguration?: boolean;
  };

  // Master Data
  masterData: {
    customers: {
      count: number;
      dataCleanupComplete: boolean;
    };
    suppliers: {
      count: number;
      dataCleanupComplete: boolean;
    };
    products: {
      count: number;
      skuSystemDefined: boolean;
    };
    warehouses?: {
      count: number;
      locations: string[];
    };
  };

  // Business Process Mapping
  businessProcesses: Array<{
    processName: string;
    currentState: string; // Description of current process
    futureState: string; // How it will work in ERP
    impactedDepartments: string[];
    automationLevel: 'manual' | 'semi_automated' | 'fully_automated';
  }>;

  // User Roles & Permissions
  userRoles: Array<{
    roleName: string;
    department: string;
    permissions: string[];
    userCount: number;
    accessLevel: 'read_only' | 'standard' | 'power_user' | 'admin';
  }>;

  // Workflow Approvals
  workflowApprovals: Array<{
    workflowName: string;
    approvalSteps: Array<{
      stepName: string;
      approverRole: string;
      amountThreshold?: number;
    }>;
  }>;

  // Data Migration
  dataMigration: {
    migrationPlanComplete: boolean;
    historicalDataYears: number;
    legacySystems: string[];
    migrationMethod: 'bulk_api' | 'etl_tool' | 'csv_import' | 'custom_script';
    hasBackupStrategy: boolean;
    hasRollbackPlan: boolean;
  };

  // Integration Requirements
  integrations: {
    crm?: boolean;
    ecommerce?: boolean;
    banking?: boolean;
    hrPayroll?: boolean;
    legacySystems?: string[];
  };

  // Implementation Team
  implementationTeam: {
    projectManager: boolean;
    itManager: boolean;
    businessAnalysts: number;
    functionalLeads: Array<{
      area: 'finance' | 'operations' | 'warehouse' | 'procurement' | 'sales';
      assignedName?: string;
    }>;
    technicalDevelopers?: number;
  };

  // Change Management
  changeManagement: {
    hasExecutiveSponsor: boolean;
    sponsorRole?: string;
    communicationPlan: boolean;
    userReadinessAssessment?: boolean;
  };

  // Training Strategy
  trainingStrategy: {
    trainingRequired: boolean;
    audiences: Array<'finance' | 'operations' | 'warehouse' | 'procurement' | 'executives' | 'it_admins'>;
    trainingMethod: 'classroom' | 'online' | 'hybrid' | 'train_the_trainer';
    customTrainingMaterialsNeeded?: boolean;
  };

  // Go-Live Strategy
  goLiveStrategy: {
    approach: 'big_bang' | 'phased_rollout' | 'parallel_run';
    phases?: Array<{
      phaseName: string;
      scope: string;
      estimatedDate?: string;
    }>;
    postGoLiveSupport: {
      hours24x7Duration?: number; // days of 24/7 support
      dedicatedSupportTeam: boolean;
    };
  };

  // Budget & Timeline
  budget?: {
    estimatedCost: number;
    bufferPercentage: number; // 20-30% recommended
    contingencyPlanned: boolean;
  };

  estimatedMonths: number; // 6-18 months typical (SMB: 6-9, Enterprise: 12-18+)
  goLiveDate?: string;
}

// ============================================================================
// Service #46: E-commerce Platform Implementation
// ============================================================================

/**
 * Service #46: E-commerce Implementation
 * הטמעת מערכת E-commerce (Shopify/WooCommerce/Magento)
 *
 * Timeline: Shopify 2-4 weeks, WooCommerce 3-6 weeks, Magento 2-4 months
 * Complexity: Medium-High
 */
export interface ImplEcommerceRequirements {
  // Platform Selection
  platform: 'shopify' | 'woocommerce' | 'magento';
  subscriptionTier?: string; // Shopify: "Basic $39", "Shopify $105", "Advanced $399"

  // Admin Access
  adminAccess: {
    email: string;
    role: 'owner' | 'staff_full_permissions' | 'admin';

    // Shopify
    canCreateCustomApp?: boolean;

    // WooCommerce
    wordpressAdminAccess?: boolean;
    ftpSftpAccess?: boolean;
    databaseAccess?: boolean; // phpMyAdmin or MySQL

    // Magento
    sshCliAccess?: boolean;
    composerAccess?: boolean;
  };

  // API Credentials
  apiCredentials: {
    // Shopify (GraphQL Admin API - REST is legacy as of 2025)
    shopifyStoreName?: string;
    adminApiAccessToken?: string; // Shown only once!
    apiVersion?: string; // Must use GraphQL from April 2025
    apiScopes?: string[]; // read_products, write_orders, etc.

    // WooCommerce
    consumerKey?: string;
    consumerSecret?: string;
    restApiEndpoint?: string;

    // Magento
    magentoAdminToken?: string;
    apiBaseUrl?: string;
  };

  // Hosting & Infrastructure
  hosting: {
    // WooCommerce/Magento only (Shopify is fully managed)
    provider?: string;
    phpVersion?: string; // WC: 7.4+, Magento: 8.1+
    mysqlVersion?: string; // WC: 5.6+, Magento: 8.0+
    hasElasticsearch?: boolean; // Magento requirement
    serverSpecs?: {
      cpu?: string;
      ram?: string;
      storage?: string;
    };
  };

  // Domain & SSL
  domainSsl: {
    domain: string;
    dnsManagementAccess: boolean;
    sslCertificate: {
      installed: boolean;
      provider?: 'letsencrypt' | 'cloudflare' | 'commercial';
      autoRenewal?: boolean;
    };
  };

  // Product Catalog
  productCatalog: {
    hasOrganizedCatalog: boolean;
    productCount: number;
    categories: string[];
    subcategories?: string[];

    // Product Data
    productsHaveSkus: boolean;
    productsHaveImages: boolean;
    imageQuality?: 'low' | 'medium' | 'high' | 'professional';
    productsHaveDescriptions: boolean;

    // Variations
    hasProductVariations: boolean; // sizes, colors, etc.
    variationTypes?: string[];
  };

  // Inventory Management
  inventoryManagement: {
    trackInventory: boolean;
    multiWarehouse?: boolean;
    lowStockAlerts?: boolean;
    inventorySource?: 'manual' | 'erp_sync' | 'csv_import';
  };

  // Payment Gateway
  paymentGateway: {
    providers: Array<{
      name: 'stripe' | 'paypal' | 'square' | 'authorize_net' | 'other';
      credentialsReady: boolean;
      apiKey?: string;
      secretKey?: string;
      webhookUrl?: string;
    }>;
    pciDssCompliance: boolean;
  };

  // Shipping Configuration
  shippingConfiguration: {
    shippingMethods: Array<{
      methodName: string;
      provider?: 'fedex' | 'ups' | 'usps' | 'dhl' | 'local' | 'flat_rate';
      hasApiAccess?: boolean;
      zones: string[]; // shipping zones or countries
      ratesType: 'flat_rate' | 'calculated' | 'free' | 'table_rate';
    }>;
    deliveryTimesDefined: boolean;
  };

  // Tax Configuration
  taxConfiguration: {
    taxType: 'vat' | 'sales_tax' | 'gst' | 'none';
    taxRates: Array<{
      region: string;
      rate: number;
    }>;
    automaticTaxCalculation?: boolean;
    taxServiceIntegration?: string; // e.g., "Avalara", "TaxJar"
  };

  // Legal & Policies
  legalPolicies: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    refundPolicy: boolean;
    shippingPolicy: boolean;
    cookiePolicy?: boolean;
  };

  // Platform-Specific Settings
  platformSpecific?: {
    // WooCommerce
    woocommerce?: {
      hposEnabled?: boolean; // High-Performance Order Storage (2025 - 5x faster)
      version?: string; // Current: 9.7 as of April 2025
      wordPressVersion?: string; // Compatibility: 6.6+
    };

    // Shopify
    shopify?: {
      useGraphqlApi: boolean; // Required from April 2025
      legacyRestApiUsed?: boolean; // Will stop working
    };
  };

  // Data Migration (if migrating from another platform)
  dataMigration?: {
    sourceplatform: string;
    productsCount: number;
    customersCount?: number;
    ordersCount?: number;
    hasBackup: boolean;
    maintenanceModeScheduled?: boolean;
    migrationMethod: 'csv' | 'api' | 'plugin' | 'manual';
  };

  // SEO Migration (if applicable)
  seoMigration?: {
    has301Redirects: boolean;
    urlMappingComplete?: boolean;
    oldPlatformUrls?: string[];
  };

  // Analytics & Tracking
  analytics: {
    googleAnalytics4: boolean;
    facebookPixel?: boolean;
    googleTagManager?: boolean;
    conversionTracking?: boolean;
  };

  // Email Notifications
  emailNotifications: {
    orderConfirmation: boolean;
    shippingNotification: boolean;
    orderCancellation?: boolean;
    emailTemplatesCustomized?: boolean;
  };

  // Testing Requirements
  testing: {
    testOrdersCompleted: boolean;
    realPaymentTested?: boolean;
    shippingCalculationVerified?: boolean;
    taxCalculationVerified?: boolean;
  };

  // Integration Requirements
  integrations?: {
    inventoryErp?: boolean;
    crm?: boolean;
    emailMarketing?: boolean;
    accounting?: boolean;
  };

  // Go-Live Checklist
  goLiveChecklist?: {
    sslActive: boolean;
    paymentMethodsTested: boolean;
    shippingCalculatedCorrectly: boolean;
    taxRulesVerified: boolean;
    emailNotificationsWorking: boolean;
    analyticsTracking: boolean;
    legalPagesPublished: boolean;
  };

  // Training
  trainingRequired: boolean;
  trainingTopics?: string[]; // ["Product Management", "Order Processing", "Inventory"]

  // Timeline
  estimatedWeeks: number; // Shopify: 2-4, WooCommerce: 3-6, Magento: 8-16 weeks
  goLiveDate?: string;
}

// ============================================================================
// Service #47: Analytics Platform Implementation
// ============================================================================

/**
 * Service #47: Analytics Implementation
 * הטמעת מערכת Analytics (Google Analytics 4/Mixpanel/Amplitude)
 *
 * Timeline: Basic 1-2 days, Enhanced 1-2 weeks
 * Complexity: Medium
 */
export interface ImplAnalyticsRequirements {
  // Platform Selection
  platform: 'google_analytics_4' | 'mixpanel' | 'amplitude';

  // Admin Access
  adminAccess: {
    email: string;
    role: 'editor' | 'administrator' | 'owner' | 'admin';
    hasPropertyCreationPermissions?: boolean; // GA4
  };

  // Property/Project Configuration
  propertyConfig: {
    // GA4
    ga4PropertyId?: string; // G-XXXXXX
    ga4MeasurementId?: string;
    dataStreamConfigured?: boolean;

    // Mixpanel
    mixpanelProjectToken?: string;
    mixpanelApiSecret?: string;

    // Amplitude
    amplitudeApiKey?: string;
    amplitudeSecretKey?: string;
  };

  // Website/App Integration
  integration: {
    websiteUrls: string[];
    mobileApps?: Array<{
      platform: 'ios' | 'android';
      appId: string;
      sdkIntegrated: boolean;
    }>;

    // Tracking Code
    trackingCodeInstalled: boolean;
    useGoogleTagManager: boolean; // Highly recommended
    gtmContainerId?: string;

    // Developer Access
    hasDeveloperAccess: boolean;
    serverSideTracking?: boolean;
  };

  // Business Objectives (affects available reports in GA4)
  businessObjectives?: Array<
    'generate_leads' | 'increase_purchases' | 'raise_brand_awareness' | 'promote_products' | 'examine_user_behavior'
  >;

  // Enhanced Measurement (GA4 auto-tracking)
  enhancedMeasurement?: {
    enabled: boolean;
    pageViews?: boolean;
    scrollTracking?: boolean;
    outboundClicks?: boolean;
    siteSearch?: boolean;
    videoEngagement?: boolean;
    fileDownloads?: boolean;
  };

  // Event Taxonomy
  eventTaxonomy: Array<{
    eventName: string;
    category?: string;
    description: string;
    parameters?: Array<{
      parameterName: string;
      type: 'string' | 'number' | 'boolean';
      description: string;
    }>;
    triggerCondition: string; // e.g., "User clicks signup button"
  }>;

  // Conversion Events
  conversionEvents: Array<{
    eventName: string; // Must be an existing event
    conversionValue?: number;
    countingMethod?: 'once_per_session' | 'once_per_event';
  }>;

  // User Properties (Custom Dimensions)
  userProperties?: Array<{
    propertyName: string;
    type: 'string' | 'number' | 'boolean';
    purpose: string;
    examples?: string[];
  }>;

  // Data Retention
  dataRetention: {
    retentionPeriod: '14_months' | '26_months' | '38_months' | '50_months'; // GA4: 14 months default
    bigQueryExport?: boolean; // For long-term storage
    bigQueryProjectId?: string;
  };

  // Cross-Domain Tracking
  crossDomainTracking?: {
    enabled: boolean;
    domains: string[];
    linkerParameters?: boolean;
  };

  // Referral Exclusions
  referralExclusions?: {
    domains: string[]; // Don't count these as referrals
  };

  // Internal Traffic Filtering
  internalTrafficFilter?: {
    enabled: boolean;
    ipAddresses: string[];
    filterName?: string;
  };

  // Time Zone & Currency
  configuration: {
    timeZone: string; // e.g., "Asia/Jerusalem", "America/New_York"
    currency: string; // e.g., "ILS", "USD"
    reportingIdentity?: 'blended' | 'observed' | 'device_based'; // GA4
  };

  // E-commerce Tracking (if applicable)
  ecommerceTracking?: {
    enabled: boolean;
    enhancedEcommerce: boolean; // Product impressions, cart, checkout, purchase
    trackingMethod: 'gtm' | 'hardcoded' | 'plugin';
    events: Array<
      'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'refund'
    >;
  };

  // Audience/Segment Configuration
  audiences?: Array<{
    audienceName: string;
    criteria: string;
    purpose: string; // e.g., "Retargeting", "Analytics"
  }>;

  // Integration with Ad Platforms
  adPlatformIntegration?: {
    googleAds?: {
      linked: boolean;
      accountId?: string;
      autoTagging?: boolean;
    };
    facebookAds?: {
      linked: boolean;
      pixelId?: string;
    };
  };

  // Data Studio / Looker Integration
  reportingDashboards?: {
    dataStudioLooker: boolean;
    dashboardCount?: number;
    stakeholderAccess?: string[];
  };

  // Privacy & GDPR
  privacyCompliance: {
    cookieConsentBanner: boolean;
    anonymizeIp?: boolean; // GA4 does this by default
    dataProcessingAmendment?: boolean;
    respectDoNotTrack?: boolean;
  };

  // Testing & Validation
  testing: {
    realtimeReportChecked: boolean;
    debugModeUsed?: boolean; // GA4 Debug View
    testEventsVerified: boolean;
  };

  // Training & Documentation
  training: {
    trainingRequired: boolean;
    audiences?: Array<'marketing' | 'analysts' | 'executives' | 'developers'>;
    customDocumentation?: boolean;
  };

  // Timeline
  estimatedDays: number; // Basic: 1-2 days, Enhanced: 7-14 days
  goLiveDate?: string;
}

// ============================================================================
// Service #48: Workflow Automation Platform Implementation
// ============================================================================

/**
 * Service #48: Workflow Platform Implementation
 * הטמעת פלטפורמת Workflow Automation (n8n/Zapier/Make)
 *
 * Timeline: Basic 1-3 days, Complex 1-4 weeks
 * Complexity: Medium-High
 */
export interface ImplWorkflowPlatformRequirements {
  // Platform Selection
  platform: 'n8n_selfhosted' | 'n8n_cloud' | 'zapier' | 'make';
  subscriptionTier?: string; // "Free", "Starter", "Professional", "Team"

  // Self-Hosted Setup (n8n only)
  selfHostedSetup?: {
    serverProvider: 'aws' | 'digitalocean' | 'azure' | 'gcp' | 'hetzner' | 'other';
    serverSpecs: {
      ram: string; // Minimum 2GB
      storage: string; // Minimum 20GB
      cpu?: string;
    };

    // Docker Setup
    dockerInstalled: boolean;
    dockerComposeInstalled: boolean;

    // Database
    database: {
      type: 'postgresql' | 'mysql' | 'sqlite';
      host?: string;
      port?: number;
      credentialsReady: boolean;
    };

    // Domain & SSL
    domain: string;
    dnsAccess: boolean;
    sslCertificate: {
      type: 'letsencrypt' | 'cloudflare' | 'custom';
      autoRenewal: boolean;
    };

    // Nginx/Reverse Proxy
    reverseProxyConfigured: boolean;

    // SSH Access
    hasSshAccess: boolean;
    sysAdminSkills: boolean;
  };

  // Cloud Setup (n8n Cloud/Zapier/Make)
  cloudSetup?: {
    accountCreated: boolean;
    billingSetup: boolean;
    teamMembersInvited?: number;
    organizationAdminAccess?: boolean; // Make
  };

  // Admin Access
  adminAccess: {
    email: string;
    role: 'owner' | 'admin' | 'organization_admin';

    // Zapier-specific
    zapierAdminConsole?: boolean;

    // Make-specific
    scenarioCreationPermissions?: boolean;
  };

  // Environment Variables (n8n)
  environmentVariables?: {
    configured: boolean;
    variables: Array<{
      name: string;
      purpose: string;
      isSecret: boolean;
    }>;
  };

  // Connected Applications
  connectedApps: Array<{
    appName: string;
    authenticationType: 'oauth2' | 'api_key' | 'basic_auth' | 'custom';
    credentialsReady: boolean;
    apiEndpoint?: string;
    rateLimits?: {
      type: 'concurrent' | 'daily' | 'burst';
      limit: number;
      window?: string;
    };
  }>;

  // Workflow Definitions
  workflows: Array<{
    workflowName: string;
    description: string;

    // Trigger
    trigger: {
      type: 'webhook' | 'schedule' | 'app_event' | 'manual' | 'email';
      configuration: Record<string, unknown>;
    };

    // Steps/Actions
    steps: Array<{
      stepName: string;
      appName: string;
      action: string; // e.g., "Create Record", "Send Email"
      dataTransformation?: string;
    }>;

    // Conditions & Logic
    hasConditionalLogic?: boolean;
    hasLoops?: boolean;
    hasErrorHandling: boolean;

    // Priority
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedExecutionFrequency?: string; // e.g., "100 times/day"
  }>;

  // Data Transformation Rules
  dataTransformationRules?: Array<{
    ruleName: string;
    sourceFormat: string;
    targetFormat: string;
    transformationLogic: string;
  }>;

  // Error Handling Strategy
  errorHandling: {
    retryLogic: boolean;
    maxRetries?: number;
    exponentialBackoff?: boolean;
    alerting: {
      enabled: boolean;
      notificationChannels?: Array<'email' | 'slack' | 'teams' | 'sms'>;
      alertRecipients?: string[];
    };
    fallbackActions?: string; // What happens if all retries fail
  };

  // Webhook Configuration
  webhooks?: {
    publicEndpoints: string[];
    signatureValidation: boolean;
    ipWhitelisting?: boolean;
    rateLimiting?: boolean;
  };

  // Monitoring & Logging
  monitoring: {
    executionLogging: boolean;
    successRateTracking: boolean;
    dashboardSetup?: boolean;
    alertThresholds?: Array<{
      metric: 'failure_rate' | 'execution_time' | 'api_errors';
      threshold: number;
      action: string;
    }>;
  };

  // Version Control & Backup
  versionControl?: {
    workflowBackups: boolean;
    exportFormat?: 'json' | 'yaml'; // n8n supports JSON export
    backupFrequency?: 'daily' | 'weekly' | 'on_change';
    gitIntegration?: boolean;
  };

  // Security & Compliance
  security: {
    encryptedCredentials: boolean;
    accessControlConfigured: boolean;
    auditLogging?: boolean;
    dataRetentionPolicy?: string;
  };

  // Rate Limit Management
  rateLimitStrategy: {
    awarenessDocumented: boolean;
    implementedThrottling?: boolean;
    queueManagement?: boolean;
    criticalWorkflowsPrioritized?: boolean;
  };

  // Testing Plan
  testing: {
    testWorkflowsCreated: boolean;
    edgeCasesTested?: boolean;
    loadTesting?: boolean;
    mockDataUsed?: boolean;
  };

  // Documentation
  documentation: {
    workflowPurposeDocumented: boolean;
    dataFlowDiagrams?: boolean;
    troubleshootingGuide?: boolean;
    maintenanceInstructions?: boolean;
  };

  // Training
  training: {
    trainingRequired: boolean;
    topics?: Array<'workflow_creation' | 'debugging' | 'best_practices' | 'advanced_logic'>;
    trainingAudience?: string[];
  };

  // Cost Estimation (especially for cloud platforms)
  costEstimation?: {
    monthlyExecutions: number;
    estimatedMonthlyCost?: number;
    scalabilityPlanned?: boolean;
  };

  // Timeline
  estimatedDays: number; // Basic: 1-3 days, Complex: 7-28 days
  goLiveDate?: string;
}

// ============================================================================
// Service #49: Custom System Implementation
// ============================================================================

/**
 * Service #49: Custom System Implementation
 * הטמעת מערכת מותאמת אישית או מערכת niche ייחודית
 *
 * Timeline: 2 weeks - 6+ months (highly variable)
 * Complexity: Variable (depends on system)
 */
export interface ImplCustomRequirements {
  // System Identification
  systemIdentification: {
    systemName: string;
    systemType: 'web_app' | 'saas_platform' | 'legacy_system' | 'custom_built' | 'no_code_platform' | 'industry_specific' | 'other';
    vendor?: string;
    version?: string;
    technologyStack?: string[]; // e.g., ["Node.js", "PostgreSQL", "React"]
  };

  // Platform Category (helps determine approach)
  platformCategory?:
    | 'web_application'
    | 'saas_platform'
    | 'legacy_mainframe'
    | 'custom_developed'
    | 'no_code_platform'
    | 'industry_specific_software';

  // Admin Access
  adminAccess: {
    email: string;
    role: string; // Varies by system
    hasFullAccess: boolean;
    hasApiAccess?: boolean;
    hasDatabaseAccess?: boolean;
  };

  // Technical Documentation
  technicalDocumentation: {
    hasApiDocumentation: boolean;
    apiDocUrl?: string;
    hasDatabaseSchema: boolean;
    hasUserGuides: boolean;
    hasAdminManuals: boolean;
    hasSourceCode?: boolean; // For custom-built systems
    documentationQuality?: 'excellent' | 'good' | 'poor' | 'missing';
  };

  // Access Credentials
  accessCredentials: {
    credentialsReady: boolean;

    // Authentication Methods
    authenticationMethods: Array<{
      method: 'username_password' | 'api_key' | 'oauth2' | 'saml' | 'certificate' | 'vpn';
      configured: boolean;
      credentials?: Record<string, string>;
    }>;

    // VPN Access (if required)
    vpnAccess?: {
      required: boolean;
      configured: boolean;
      vpnType?: 'openvpn' | 'ipsec' | 'wireguard' | 'cisco_anyconnect';
    };
  };

  // Infrastructure
  infrastructure?: {
    // Cloud/Server
    deploymentType?: 'cloud' | 'on_premise' | 'hybrid' | 'saas';
    cloudProvider?: 'aws' | 'azure' | 'gcp' | 'other';
    serversProvisioned?: boolean;

    // Network
    networkConfigured?: boolean;
    firewallRulesSet?: boolean;
    loadBalancerConfigured?: boolean;

    // Database
    database?: {
      type: string;
      host?: string;
      accessConfigured: boolean;
    };
  };

  // API Configuration
  apiConfiguration?: {
    hasRestApi: boolean;
    hasSoapApi?: boolean;
    hasGraphqlApi?: boolean;
    hasWebhooks?: boolean;

    // API Details
    apiBaseUrl?: string;
    apiVersion?: string;
    authenticationMethod?: 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token' | 'custom';

    // Rate Limits
    rateLimits?: {
      type: 'per_second' | 'per_minute' | 'per_hour' | 'per_day' | 'concurrent';
      limit: number;
      burstLimit?: number;
    };

    // Sandbox/Testing
    hasSandboxApi?: boolean;
    sandboxUrl?: string;
  };

  // Data Inventory
  dataInventory: {
    dataCategoriesIdentified: boolean;
    categories?: Array<{
      categoryName: string;
      recordCount?: number;
      dataFormat?: string;
      migrationRequired?: boolean;
    }>;
  };

  // User Roles & Permissions
  userRoles: Array<{
    roleName: string;
    permissions: string[];
    userCount?: number;
    accessLevel?: string;
  }>;

  // Integration Endpoints
  integrationEndpoints: Array<{
    targetSystem: string;
    integrationType: 'api' | 'webhook' | 'file_transfer' | 'database_sync' | 'message_queue';
    direction: 'inbound' | 'outbound' | 'bidirectional';
    dataFormat?: 'json' | 'xml' | 'csv' | 'soap' | 'custom';
    frequency?: 'real_time' | 'scheduled' | 'event_driven';
  }>;

  // Legacy System Specifics (if applicable)
  legacySystemSpecifics?: {
    protocolsUsed?: Array<'soap' | 'xml_rpc' | 'ftp' | 'sftp' | 'edifact' | 'custom'>;
    requiresMiddleware?: boolean;
    middlewareType?: 'esb' | 'api_gateway' | 'adapter' | 'custom';
    modernizationPlanned?: boolean;
  };

  // Testing Environment
  testingEnvironment: {
    hasSeparateEnvironment: boolean;
    environmentType?: 'dev' | 'staging' | 'uat' | 'sandbox';
    mirrosProduction?: boolean;
    dataMasking?: boolean;
  };

  // Backup & Recovery
  backupRecovery: {
    backupStrategyDefined: boolean;
    backupFrequency?: 'hourly' | 'daily' | 'weekly' | 'real_time';
    backupRetention?: string; // e.g., "30 days", "1 year"
    disasterRecoveryPlan: boolean;
    rto?: number; // Recovery Time Objective (hours)
    rpo?: number; // Recovery Point Objective (hours)
  };

  // Security Requirements
  securityRequirements: {
    securityAuditCompleted?: boolean;
    complianceNeeds?: Array<'gdpr' | 'hipaa' | 'soc2' | 'pci_dss' | 'iso_27001'>;
    encryptionRequired?: boolean;
    ssoRequired?: boolean;
    mfaEnabled?: boolean;
    vulnerabilityAssessment?: boolean;
  };

  // Monitoring & Performance
  monitoring: {
    monitoringToolsConfigured?: boolean;
    monitoringTools?: string[];
    healthCheckEndpoints?: string[];
    performanceBenchmarks?: Array<{
      metric: string;
      target: number;
      unit: string;
    }>;
    alertingConfigured?: boolean;
  };

  // Vendor/Support Contact
  vendorSupport?: {
    hasTechnicalContact: boolean;
    contactName?: string;
    contactEmail?: string;
    supportSla?: {
      responseTime?: string;
      availability?: string; // e.g., "24/7", "Business hours"
      supportChannels?: Array<'phone' | 'email' | 'ticket' | 'chat'>;
    };
    hasMaintenanceContract?: boolean;
  };

  // Change Management Process
  changeManagement?: {
    changeProcessDefined: boolean;
    approvalWorkflow?: string;
    changeWindow?: string; // e.g., "Weekends only", "After hours"
    rollbackProcedure?: boolean;
  };

  // Customization & Development
  customization?: {
    customCodeRequired?: boolean;
    hasSourceCodeAccess?: boolean;
    developmentFramework?: string;
    deploymentProcess?: string;
    ciCdPipelineConfigured?: boolean;
  };

  // User Acceptance Testing
  userAcceptanceTesting: {
    uatPlanned: boolean;
    uatDuration?: number; // weeks
    uatParticipants?: Array<{
      role: string;
      count: number;
    }>;
    acceptanceCriteria?: string[];
  };

  // Training Requirements
  training: {
    trainingMaterialsExist: boolean;
    customTrainingNeeded?: boolean;
    trainingAudiences?: Array<{
      audience: string;
      trainingType: 'end_user' | 'admin' | 'technical' | 'executive';
      duration?: string;
    }>;
  };

  // Scalability Planning
  scalability?: {
    currentUserLoad?: number;
    expectedUserGrowth?: string;
    loadTestingCompleted?: boolean;
    horizontalScaling?: boolean;
    verticalScaling?: boolean;
  };

  // Version Compatibility
  versionCompatibility?: {
    currentVersion: string;
    targetVersion?: string;
    upgradePathDefined?: boolean;
    backwardCompatibility?: boolean;
    breakingChanges?: string[];
  };

  // Post-Implementation Support
  postImplementationSupport: {
    supportPlanDefined: boolean;
    supportDuration?: string; // e.g., "30 days", "3 months"
    supportLevel?: 'basic' | 'extended' | 'premium' | '24x7';
    knowledgeTransferPlanned?: boolean;
    documentationHandover?: boolean;
  };

  // Budget & Resources
  budgetResources?: {
    estimatedCost?: number;
    bufferPercentage: number; // 30-50% recommended for custom systems
    contingencyPlanned: boolean;

    // Resource Allocation
    projectManager?: boolean;
    technicalLead?: boolean;
    developers?: number;
    qaTesters?: number;
    systemAdmins?: number;
  };

  // Risk Assessment
  riskAssessment?: {
    risksIdentified: boolean;
    risks?: Array<{
      riskName: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      mitigationPlan?: string;
    }>;
  };

  // Timeline
  estimatedWeeks: number; // Highly variable: 2 weeks - 6+ months
  estimatedMonths?: number; // For longer projects
  goLiveDate?: string;

  // Success Criteria
  successCriteria?: Array<{
    criterion: string;
    measurableTarget?: string;
    verificationMethod?: string;
  }>;
}

// ============================================================================
// Union Type for All System Implementation Services
// ============================================================================

/**
 * Union type representing any System Implementation service configuration.
 * Use this for polymorphic handling of different implementation types.
 */
export type SystemImplementationServiceConfig =
  | ImplCrmRequirements
  | ImplMarketingAutomationRequirements
  | ImplProjectManagementRequirements
  | ImplHelpdeskRequirements
  | ImplErpRequirements
  | ImplEcommerceRequirements
  | ImplAnalyticsRequirements
  | ImplWorkflowPlatformRequirements
  | ImplCustomRequirements;

/**
 * System Implementation Service Entry
 * Wrapper type that includes metadata and the actual requirements
 */
export interface SystemImplementationServiceEntry {
  // Service Identification
  serviceId: string; // e.g., "impl-crm", "impl-marketing-automation"
  serviceName: string; // Display name in Hebrew/English
  category: 'system_implementation';

  // Requirements (one of the 9 types)
  requirements: SystemImplementationServiceConfig;

  // Status & Tracking
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress?: number; // 0-100

  // Metadata
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
  completedAt?: string; // ISO date
  assignedTo?: string; // Team member or vendor

  // Notes & Documentation
  notes?: string;
  implementationNotes?: string;
  issuesEncountered?: string[];

  // Budget & Timeline Tracking
  actualCost?: number;
  actualDuration?: number; // weeks or days
  varianceFromEstimate?: number; // percentage
}

/**
 * Type guard to check if a service config is CRM implementation
 */
export function isImplCrmRequirements(
  config: SystemImplementationServiceConfig
): config is ImplCrmRequirements {
  return 'platform' in config && ['zoho', 'hubspot', 'salesforce'].includes(config.platform);
}

/**
 * Type guard to check if a service config is Marketing Automation
 */
export function isImplMarketingAutomationRequirements(
  config: SystemImplementationServiceConfig
): config is ImplMarketingAutomationRequirements {
  return 'platform' in config && ['hubspot_marketing', 'activecampaign', 'mailchimp'].includes(config.platform);
}

/**
 * Type guard to check if a service config is Project Management
 */
export function isImplProjectManagementRequirements(
  config: SystemImplementationServiceConfig
): config is ImplProjectManagementRequirements {
  return 'platform' in config && ['monday', 'asana', 'jira', 'clickup'].includes(config.platform);
}

/**
 * Type guard to check if a service config is Helpdesk
 */
export function isImplHelpdeskRequirements(
  config: SystemImplementationServiceConfig
): config is ImplHelpdeskRequirements {
  return 'platform' in config && ['zendesk', 'freshdesk', 'intercom'].includes(config.platform);
}

/**
 * Type guard to check if a service config is ERP
 */
export function isImplErpRequirements(
  config: SystemImplementationServiceConfig
): config is ImplErpRequirements {
  return 'platform' in config && ['sap_s4hana', 'oracle_netsuite', 'microsoft_dynamics', 'odoo'].includes(config.platform);
}

/**
 * Type guard to check if a service config is E-commerce
 */
export function isImplEcommerceRequirements(
  config: SystemImplementationServiceConfig
): config is ImplEcommerceRequirements {
  return 'platform' in config && ['shopify', 'woocommerce', 'magento'].includes(config.platform);
}

/**
 * Type guard to check if a service config is Analytics
 */
export function isImplAnalyticsRequirements(
  config: SystemImplementationServiceConfig
): config is ImplAnalyticsRequirements {
  return 'platform' in config && ['google_analytics_4', 'mixpanel', 'amplitude'].includes(config.platform);
}

/**
 * Type guard to check if a service config is Workflow Platform
 */
export function isImplWorkflowPlatformRequirements(
  config: SystemImplementationServiceConfig
): config is ImplWorkflowPlatformRequirements {
  return 'platform' in config && ['n8n_selfhosted', 'n8n_cloud', 'zapier', 'make'].includes(config.platform);
}

/**
 * Type guard to check if a service config is Custom System
 */
export function isImplCustomRequirements(
  config: SystemImplementationServiceConfig
): config is ImplCustomRequirements {
  return 'systemIdentification' in config;
}

/**
 * Helper function to get service display name by ID
 */
export function getSystemImplementationServiceName(serviceId: string): string {
  const serviceNames: Record<string, string> = {
    'impl-crm': 'הטמעת CRM',
    'impl-marketing-automation': 'הטמעת מערכת אוטומציית שיווק',
    'impl-project-management': 'הטמעת מערכת ניהול פרויקטים',
    'impl-helpdesk': 'הטמעת מערכת Helpdesk',
    'impl-erp': 'הטמעת ERP',
    'impl-ecommerce': 'הטמעת מערכת E-commerce',
    'impl-analytics': 'הטמעת מערכת Analytics',
    'impl-workflow-platform': 'הטמעת פלטפורמת Workflow Automation',
    'impl-custom': 'הטמעת מערכת מותאמת אישית',
  };

  return serviceNames[serviceId] || serviceId;
}

/**
 * Helper function to get estimated timeline by service ID
 */
export function getEstimatedTimeline(serviceId: string): string {
  const timelines: Record<string, string> = {
    'impl-crm': '4-8 שבועות',
    'impl-marketing-automation': '2-4 שבועות',
    'impl-project-management': '3-6 שבועות',
    'impl-helpdesk': '2-4 שבועות',
    'impl-erp': '6-18 חודשים',
    'impl-ecommerce': '2-16 שבועות (תלוי בפלטפורמה)',
    'impl-analytics': '1-14 ימים',
    'impl-workflow-platform': '1-28 ימים',
    'impl-custom': 'משתנה (2 שבועות - 6+ חודשים)',
  };

  return timelines[serviceId] || 'לא צוין';
}

/**
 * Helper function to get complexity level by service ID
 */
export function getComplexityLevel(serviceId: string): 'low' | 'medium' | 'high' | 'very_high' {
  const complexity: Record<string, 'low' | 'medium' | 'high' | 'very_high'> = {
    'impl-crm': 'high',
    'impl-marketing-automation': 'medium',
    'impl-project-management': 'medium',
    'impl-helpdesk': 'medium',
    'impl-erp': 'very_high',
    'impl-ecommerce': 'medium',
    'impl-analytics': 'medium',
    'impl-workflow-platform': 'medium',
    'impl-custom': 'high', // Variable but default to high
  };

  return complexity[serviceId] || 'medium';
}
