/**
 * Central Field Registry
 *
 * Single source of truth for all fields across Phase 1, Phase 2, and Phase 3.
 * Maps field relationships and enables smart auto-population.
 */

import { RegistryField } from '../types/fieldRegistry';

/**
 * Master field registry
 * All fields that appear in the discovery process are defined here
 */
export const FIELD_REGISTRY: Record<string, RegistryField> = {
  // ============================================================================
  // CRM SYSTEM FIELDS
  // ============================================================================

  crm_system: {
    id: 'crm_system',
    label: { he: 'מערכת CRM', en: 'CRM System' },
    placeholder: { he: 'בחר מערכת CRM', en: 'Select CRM System' },
    description: {
      he: 'מערכת ניהול קשרי לקוחות בשימוש',
      en: 'Customer Relationship Management system in use',
    },
    type: 'select',
    category: 'crm',
    collectedIn: ['phase1', 'phase2'],
    usedBy: [
      'auto-form-to-crm',
      'auto-crm-update',
      'auto-lead-response',
      'auto-data-sync',
      'int-crm-marketing',
      'int-crm-support',
      'impl-crm',
      'ai-lead-qualifier',
      'ai-action-agent',
      'ai-full-integration',
    ],
    primarySource: {
      path: 'modules.overview.crmName',
      phase: 'phase1',
      module: 'overview',
      description: 'CRM system name from Overview module',
    },
    secondarySources: [
      {
        path: 'modules.systems.detailedSystems[].specificSystem',
        phase: 'phase1',
        module: 'systems',
        description: 'Detailed CRM system from Systems module',
      },
    ],
    autoPopulate: true,
    syncBidirectional: true,
    required: false,
    importance: 'critical',
    businessContext:
      'Core system for managing customer relationships and sales pipeline',
    technicalContext:
      'Required for CRM integrations, lead management, and data sync automations',
    options: [
      { value: 'zoho', label: { he: 'Zoho CRM', en: 'Zoho CRM' } },
      { value: 'salesforce', label: { he: 'Salesforce', en: 'Salesforce' } },
      { value: 'hubspot', label: { he: 'HubSpot', en: 'HubSpot' } },
      { value: 'pipedrive', label: { he: 'Pipedrive', en: 'Pipedrive' } },
      { value: 'monday', label: { he: 'Monday CRM', en: 'Monday CRM' } },
      { value: 'other', label: { he: 'אחר', en: 'Other' } },
    ],
  },

  crm_auth_method: {
    id: 'crm_auth_method',
    label: { he: 'שיטת אימות CRM', en: 'CRM Authentication Method' },
    description: {
      he: 'שיטת האימות לגישה ל-CRM',
      en: 'Authentication method for CRM access',
    },
    type: 'select',
    category: 'authentication',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-form-to-crm',
      'auto-crm-update',
      'auto-lead-response',
      'int-crm-marketing',
    ],
    primarySource: {
      path: 'implementationSpec.systems[].authentication.method',
      phase: 'phase2',
      description: 'CRM authentication method from System Deep Dive',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    technicalContext: 'Determines how we authenticate API requests to the CRM',
    options: [
      { value: 'oauth', label: { he: 'OAuth 2.0', en: 'OAuth 2.0' } },
      { value: 'api_key', label: { he: 'API Key', en: 'API Key' } },
      { value: 'basic_auth', label: { he: 'Basic Auth', en: 'Basic Auth' } },
      { value: 'jwt', label: { he: 'JWT Token', en: 'JWT Token' } },
    ],
  },

  crm_module: {
    id: 'crm_module',
    label: { he: 'מודול CRM', en: 'CRM Module' },
    description: {
      he: 'המודול ב-CRM לעבודה (לידים, אנשי קשר, עסקאות)',
      en: 'CRM module to work with (Leads, Contacts, Deals)',
    },
    type: 'select',
    category: 'crm',
    collectedIn: ['phase2'],
    usedBy: ['auto-form-to-crm', 'auto-crm-update', 'auto-lead-response'],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.crmAccess.module',
      phase: 'phase2',
      description: 'CRM module from automation requirements',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    options: [
      { value: 'leads', label: { he: 'לידים', en: 'Leads' } },
      { value: 'contacts', label: { he: 'אנשי קשר', en: 'Contacts' } },
      { value: 'potentials', label: { he: 'עסקאות', en: 'Potentials/Deals' } },
      { value: 'accounts', label: { he: 'חשבונות', en: 'Accounts' } },
    ],
  },

  // ============================================================================
  // EMAIL SERVICE FIELDS
  // ============================================================================

  email_provider: {
    id: 'email_provider',
    label: { he: 'ספק שירות אימייל', en: 'Email Service Provider' },
    description: {
      he: 'ספק השירות לשליחת אימיילים אוטומטיים',
      en: 'Service provider for sending automated emails',
    },
    type: 'select',
    category: 'email',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-lead-response',
      'auto-email-templates',
      'auto-welcome-email',
      'auto-notifications',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.emailServiceAccess.provider',
      phase: 'phase2',
      description: 'Email provider from automation requirements',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    technicalContext:
      'Email service used for all automated email communications',
    options: [
      { value: 'sendgrid', label: { he: 'SendGrid', en: 'SendGrid' } },
      { value: 'mailgun', label: { he: 'Mailgun', en: 'Mailgun' } },
      { value: 'smtp', label: { he: 'SMTP', en: 'SMTP' } },
      { value: 'gmail', label: { he: 'Gmail API', en: 'Gmail API' } },
      {
        value: 'outlook',
        label: { he: 'Outlook/Office 365', en: 'Outlook/Office 365' },
      },
      { value: 'other', label: { he: 'אחר', en: 'Other' } },
    ],
  },

  email_daily_limit: {
    id: 'email_daily_limit',
    label: { he: 'מגבלה יומית אימיילים', en: 'Daily Email Limit' },
    type: 'number',
    category: 'email',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-lead-response',
      'auto-email-templates',
      'auto-notifications',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.emailServiceAccess.rateLimits.daily',
      phase: 'phase2',
      description: 'Daily email rate limit',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: false,
    importance: 'medium',
    validation: {
      min: 0,
      max: 1000000,
    },
  },

  // ============================================================================
  // FORM PLATFORM FIELDS
  // ============================================================================

  form_platform: {
    id: 'form_platform',
    label: { he: 'פלטפורמת טפסים', en: 'Form Platform' },
    description: {
      he: 'הפלטפורמה בה הטפסים בנויים',
      en: 'Platform where forms are built',
    },
    type: 'select',
    category: 'forms',
    collectedIn: ['phase1', 'phase2'],
    usedBy: ['auto-form-to-crm', 'auto-lead-response'],
    primarySource: {
      path: 'modules.leadsAndSales.leadSources[].channel',
      phase: 'phase1',
      description: 'Form platform from lead sources',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: true,
    importance: 'high',
    options: [
      { value: 'wix', label: { he: 'Wix Forms', en: 'Wix Forms' } },
      { value: 'wordpress', label: { he: 'WordPress', en: 'WordPress' } },
      { value: 'elementor', label: { he: 'Elementor', en: 'Elementor' } },
      {
        value: 'google_forms',
        label: { he: 'Google Forms', en: 'Google Forms' },
      },
      { value: 'typeform', label: { he: 'Typeform', en: 'Typeform' } },
      { value: 'jotform', label: { he: 'JotForm', en: 'JotForm' } },
      { value: 'custom', label: { he: 'מותאם אישית', en: 'Custom' } },
    ],
  },

  form_webhook_capability: {
    id: 'form_webhook_capability',
    label: { he: 'תמיכה ב-Webhooks', en: 'Webhook Support' },
    type: 'boolean',
    category: 'forms',
    collectedIn: ['phase2'],
    usedBy: ['auto-form-to-crm', 'auto-lead-response'],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.formPlatformAccess.webhookCapability',
      phase: 'phase2',
      description: 'Form platform webhook capability',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: false,
    importance: 'high',
    technicalContext:
      'Determines if we can use webhooks (realtime) or need polling',
  },

  // ============================================================================
  // N8N WORKFLOW FIELDS
  // ============================================================================

  n8n_instance_url: {
    id: 'n8n_instance_url',
    label: { he: 'כתובת n8n Instance', en: 'n8n Instance URL' },
    type: 'url',
    category: 'workflow',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-lead-response',
      'auto-form-to-crm',
      'auto-data-sync',
      'auto-notifications',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.n8nWorkflow.instanceUrl',
      phase: 'phase2',
      description: 'n8n instance URL',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    validation: {
      pattern: /^https?:\/\/.+/,
    },
  },

  n8n_webhook_endpoint: {
    id: 'n8n_webhook_endpoint',
    label: { he: 'Webhook Endpoint', en: 'Webhook Endpoint' },
    type: 'url',
    category: 'workflow',
    collectedIn: ['phase2'],
    usedBy: ['auto-lead-response', 'auto-form-to-crm'],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.n8nWorkflow.webhookEndpoint',
      phase: 'phase2',
      description: 'n8n webhook endpoint URL',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    validation: {
      pattern: /^https?:\/\/.+\/webhook\/.+/,
    },
  },

  // ============================================================================
  // BUSINESS CONTEXT FIELDS
  // ============================================================================

  monthly_lead_volume: {
    id: 'monthly_lead_volume',
    label: { he: 'כמות לידים חודשית', en: 'Monthly Lead Volume' },
    description: {
      he: 'כמות הלידים המגיעים בחודש',
      en: 'Number of leads received per month',
    },
    type: 'number',
    category: 'business',
    collectedIn: ['phase1'],
    usedBy: ['auto-lead-response', 'auto-form-to-crm'],
    primarySource: {
      path: 'modules.leadsAndSales.leadVolume',
      phase: 'phase1',
      description: 'Lead volume from Leads and Sales module',
    },
    secondarySources: [
      {
        path: 'modules.leadsAndSales.leadSources[].volumePerMonth',
        phase: 'phase1',
        module: 'leadsAndSales',
        description: 'Sum of all lead source volumes',
      },
    ],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'medium',
    businessContext: 'Helps size infrastructure and estimate costs',
    validation: {
      min: 0,
      max: 1000000,
    },
  },

  current_response_time: {
    id: 'current_response_time',
    label: { he: 'זמן תגובה נוכחי', en: 'Current Response Time' },
    description: {
      he: 'זמן התגובה הממוצע ללידים כיום',
      en: 'Current average response time to leads',
    },
    type: 'text',
    category: 'business',
    collectedIn: ['phase1'],
    usedBy: ['auto-lead-response'],
    primarySource: {
      path: 'modules.leadsAndSales.speedToLead.duringBusinessHours',
      phase: 'phase1',
      description: 'Response time from Speed to Lead section',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'medium',
    businessContext: 'Baseline for measuring improvement after automation',
  },

  // ============================================================================
  // SYSTEM INTEGRATION FIELDS
  // ============================================================================

  system_name: {
    id: 'system_name',
    label: { he: 'שם המערכת', en: 'System Name' },
    type: 'text',
    category: 'systems',
    collectedIn: ['phase1', 'phase2'],
    usedBy: ['int-simple', 'int-complex', 'impl-crm'],
    primarySource: {
      path: 'modules.systems.detailedSystems[].specificSystem',
      phase: 'phase1',
      description: 'System name from Systems module',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: true,
    importance: 'high',
  },

  system_api_access: {
    id: 'system_api_access',
    label: { he: 'גישה ל-API', en: 'API Access' },
    type: 'select',
    category: 'systems',
    collectedIn: ['phase1', 'phase2'],
    usedBy: ['int-simple', 'int-complex'],
    primarySource: {
      path: 'modules.systems.detailedSystems[].apiAccess',
      phase: 'phase1',
      description: 'API access level from Systems module',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    options: [
      { value: 'full', label: { he: 'גישה מלאה', en: 'Full Access' } },
      { value: 'limited', label: { he: 'גישה מוגבלת', en: 'Limited Access' } },
      { value: 'none', label: { he: 'אין גישה', en: 'No Access' } },
      { value: 'unknown', label: { he: 'לא ידוע', en: 'Unknown' } },
    ],
  },

  // ============================================================================
  // AI AGENT FIELDS
  // ============================================================================

  ai_agent_department: {
    id: 'ai_agent_department',
    label: { he: 'מחלקה לסוכן AI', en: 'AI Agent Department' },
    type: 'select',
    category: 'ai',
    collectedIn: ['phase1', 'phase2'],
    usedBy: ['ai-sales-agent', 'ai-service-agent', 'ai-faq-bot'],
    primarySource: {
      path: 'modules.aiAgents.priority',
      phase: 'phase1',
      description: 'Priority department for AI from AI Agents module',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: true,
    importance: 'high',
    options: [
      { value: 'sales', label: { he: 'מכירות', en: 'Sales' } },
      { value: 'service', label: { he: 'שירות', en: 'Service' } },
      { value: 'operations', label: { he: 'תפעול', en: 'Operations' } },
    ],
  },

  ai_model_preference: {
    id: 'ai_model_preference',
    label: { he: 'העדפת מודל AI', en: 'AI Model Preference' },
    type: 'select',
    category: 'ai',
    collectedIn: ['phase2'],
    usedBy: [
      'ai-sales-agent',
      'ai-service-agent',
      'ai-faq-bot',
      'ai-lead-qualifier',
      'ai-triage',
      'ai-action-agent',
      'ai-full-integration',
    ],
    primarySource: {
      path: 'implementationSpec.aiAgents[].model.modelName',
      phase: 'phase2',
      description: 'AI model selection from AI agent spec',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    options: [
      { value: 'gpt-4o', label: { he: 'GPT-4o', en: 'GPT-4o' } },
      { value: 'gpt-4o-mini', label: { he: 'GPT-4o Mini', en: 'GPT-4o Mini' } },
      { value: 'gpt-4-turbo', label: { he: 'GPT-4 Turbo', en: 'GPT-4 Turbo' } },
      {
        value: 'claude-3.5-sonnet',
        label: { he: 'Claude 3.5 Sonnet', en: 'Claude 3.5 Sonnet' },
      },
      {
        value: 'claude-3.5-haiku',
        label: { he: 'Claude 3.5 Haiku', en: 'Claude 3.5 Haiku' },
      },
    ],
  },

  // ============================================================================
  // WHATSAPP FIELDS (used across multiple services)
  // ============================================================================

  whatsapp_api_provider: {
    id: 'whatsapp_api_provider',
    label: { he: 'ספק WhatsApp API', en: 'WhatsApp API Provider' },
    type: 'select',
    category: 'integration',
    collectedIn: ['phase2'],
    usedBy: [
      'whatsapp-api-setup',
      'auto-sms-whatsapp',
      'auto-notifications',
      'ai-service-agent',
    ],
    primarySource: {
      path: 'implementationSpec.integrationServices[].requirements.provider',
      phase: 'phase2',
      description: 'WhatsApp API provider',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    options: [
      { value: 'twilio', label: { he: 'Twilio', en: 'Twilio' } },
      { value: 'messagebird', label: { he: 'MessageBird', en: 'MessageBird' } },
      {
        value: 'whatsapp_business',
        label: { he: 'WhatsApp Business API', en: 'WhatsApp Business API' },
      },
      { value: 'vonage', label: { he: 'Vonage', en: 'Vonage' } },
    ],
  },

  whatsapp_phone_number: {
    id: 'whatsapp_phone_number',
    label: { he: 'מספר WhatsApp Business', en: 'WhatsApp Business Number' },
    type: 'text',
    category: 'integration',
    collectedIn: ['phase2'],
    usedBy: ['whatsapp-api-setup', 'auto-sms-whatsapp', 'auto-notifications'],
    primarySource: {
      path: 'implementationSpec.integrationServices[].requirements.businessPhone',
      phase: 'phase2',
      description: 'WhatsApp business phone number',
    },
    secondarySources: [
      {
        path: 'modules.overview.contactPhone',
        phase: 'phase1',
        description: 'Company phone from Overview',
      },
    ],
    autoPopulate: true,
    syncBidirectional: false,
    required: true,
    importance: 'critical',
    validation: {
      pattern: /^\+?[1-9]\d{1,14}$/,
    },
  },

  // ============================================================================
  // CALENDAR INTEGRATION FIELDS
  // ============================================================================

  calendar_system: {
    id: 'calendar_system',
    label: { he: 'מערכת יומנים', en: 'Calendar System' },
    type: 'select',
    category: 'integration',
    collectedIn: ['phase2'],
    usedBy: [
      'int-calendar',
      'auto-appointment-reminders',
      'auto-meeting-scheduler',
      'ai-sales-agent',
    ],
    primarySource: {
      path: 'implementationSpec.integrationServices[].requirements.calendarSystem',
      phase: 'phase2',
      description: 'Calendar system selection',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    options: [
      {
        value: 'google_calendar',
        label: { he: 'Google Calendar', en: 'Google Calendar' },
      },
      {
        value: 'outlook',
        label: { he: 'Outlook Calendar', en: 'Outlook Calendar' },
      },
      { value: 'office365', label: { he: 'Office 365', en: 'Office 365' } },
      {
        value: 'apple_calendar',
        label: { he: 'Apple Calendar', en: 'Apple Calendar' },
      },
    ],
  },

  // ============================================================================
  // COMPANY/CLIENT INFO FIELDS (used for context)
  // ============================================================================

  company_industry: {
    id: 'company_industry',
    label: { he: 'תעשייה', en: 'Industry' },
    type: 'text',
    category: 'business',
    collectedIn: ['phase1'],
    usedBy: ['*'], // Used for context in all services
    primarySource: {
      path: 'modules.overview.industry',
      phase: 'phase1',
      description: 'Company industry from Overview',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'medium',
    businessContext: 'Helps tailor automations to industry-specific needs',
  },

  company_size: {
    id: 'company_size',
    label: { he: 'גודל החברה', en: 'Company Size' },
    type: 'number',
    category: 'business',
    collectedIn: ['phase1'],
    usedBy: ['*'], // Used for context and sizing infrastructure
    primarySource: {
      path: 'modules.overview.employees',
      phase: 'phase1',
      description: 'Number of employees from Overview',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'medium',
    businessContext: 'Determines scale of automations and user licenses needed',
    validation: {
      min: 1,
      max: 100000,
    },
  },

  company_website: {
    id: 'company_website',
    label: { he: 'אתר אינטרנט', en: 'Website' },
    type: 'url',
    category: 'business',
    collectedIn: ['phase1'],
    usedBy: ['auto-form-to-crm', 'auto-lead-response'],
    primarySource: {
      path: 'modules.overview.website',
      phase: 'phase1',
      description: 'Company website from Overview',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'low',
    validation: {
      pattern: /^https?:\/\/.+/,
    },
  },

  // ============================================================================
  // ERROR HANDLING FIELDS (common across automations)
  // ============================================================================

  alert_email: {
    id: 'alert_email',
    label: { he: 'אימייל להתראות', en: 'Alert Email' },
    type: 'email',
    category: 'technical',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-lead-response',
      'auto-form-to-crm',
      'auto-data-sync',
      'auto-system-sync',
      'int-complex',
      'ai-triage',
      'add-custom-reports',
      'add-dashboard',
      'consulting-process',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.n8nWorkflow.errorHandling.alertEmail',
      phase: 'phase2',
      description: 'Alert email for errors',
    },
    secondarySources: [
      {
        path: 'modules.overview.contactEmail',
        phase: 'phase1',
        description: 'Company contact email from Overview',
      },
    ],
    autoPopulate: true,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    technicalContext: 'Email address for receiving system alerts and errors',
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },

  retry_attempts: {
    id: 'retry_attempts',
    label: { he: 'ניסיונות חוזרים', en: 'Retry Attempts' },
    type: 'number',
    category: 'technical',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-lead-response',
      'auto-form-to-crm',
      'auto-data-sync',
      'int-simple',
      'int-complex',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.n8nWorkflow.errorHandling.retryAttempts',
      phase: 'phase2',
      description: 'Number of retry attempts on failure',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: false,
    importance: 'medium',
    technicalContext:
      'How many times to retry failed operations before alerting',
    validation: {
      min: 0,
      max: 10,
    },
  },

  // ============================================================================
  // DATA SYNC FIELDS
  // ============================================================================

  sync_frequency: {
    id: 'sync_frequency',
    label: { he: 'תדירות סנכרון', en: 'Sync Frequency' },
    type: 'select',
    category: 'integration',
    collectedIn: ['phase2'],
    usedBy: ['auto-data-sync', 'auto-system-sync', 'int-simple', 'int-complex'],
    primarySource: {
      path: 'implementationSpec.integrations[].frequency',
      phase: 'phase2',
      description: 'Integration sync frequency',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    options: [
      { value: 'realtime', label: { he: 'בזמן אמת', en: 'Realtime' } },
      {
        value: 'every_5_min',
        label: { he: 'כל 5 דקות', en: 'Every 5 minutes' },
      },
      {
        value: 'every_15_min',
        label: { he: 'כל 15 דקות', en: 'Every 15 minutes' },
      },
      { value: 'hourly', label: { he: 'כל שעה', en: 'Hourly' } },
      { value: 'daily', label: { he: 'יומי', en: 'Daily' } },
      { value: 'weekly', label: { he: 'שבועי', en: 'Weekly' } },
    ],
  },

  // ============================================================================
  // SMTP/EMAIL SERVER FIELDS (for custom email)
  // ============================================================================

  smtp_host: {
    id: 'smtp_host',
    label: { he: 'שרת SMTP', en: 'SMTP Host' },
    type: 'text',
    category: 'email',
    collectedIn: ['phase2'],
    usedBy: ['auto-email-templates', 'auto-welcome-email'],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.emailServiceAccess.smtpCredentials.host',
      phase: 'phase2',
      description: 'SMTP server host',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: false,
    importance: 'medium',
    placeholder: { he: 'smtp.gmail.com', en: 'smtp.gmail.com' },
  },

  smtp_port: {
    id: 'smtp_port',
    label: { he: 'פורט SMTP', en: 'SMTP Port' },
    type: 'number',
    category: 'email',
    collectedIn: ['phase2'],
    usedBy: ['auto-email-templates', 'auto-welcome-email'],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.emailServiceAccess.smtpCredentials.port',
      phase: 'phase2',
      description: 'SMTP server port',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: true,
    required: false,
    importance: 'medium',
    validation: {
      min: 1,
      max: 65535,
    },
  },

  // ============================================================================
  // BUSINESS HOURS FIELDS
  // ============================================================================

  business_hours_start: {
    id: 'business_hours_start',
    label: { he: 'שעת התחלה', en: 'Business Hours Start' },
    type: 'text',
    category: 'business',
    collectedIn: ['phase1', 'phase2'],
    usedBy: [
      'ai-sales-agent',
      'auto-appointment-reminders',
      'auto-service-workflow',
    ],
    primarySource: {
      path: 'modules.customerService.businessHours.start',
      phase: 'phase1',
      description: 'Business hours start time',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'medium',
    placeholder: { he: '09:00', en: '09:00' },
  },

  business_hours_end: {
    id: 'business_hours_end',
    label: { he: 'שעת סיום', en: 'Business Hours End' },
    type: 'text',
    category: 'business',
    collectedIn: ['phase1', 'phase2'],
    usedBy: [
      'ai-sales-agent',
      'auto-appointment-reminders',
      'auto-service-workflow',
    ],
    primarySource: {
      path: 'modules.customerService.businessHours.end',
      phase: 'phase1',
      description: 'Business hours end time',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'medium',
    placeholder: { he: '18:00', en: '18:00' },
  },

  // ============================================================================
  // LEAD SOURCE FIELDS
  // ============================================================================

  primary_lead_source: {
    id: 'primary_lead_source',
    label: { he: 'מקור לידים ראשי', en: 'Primary Lead Source' },
    type: 'text',
    category: 'business',
    collectedIn: ['phase1'],
    usedBy: ['auto-lead-response', 'auto-lead-workflow'],
    primarySource: {
      path: 'modules.leadsAndSales.leadSources[0].channel',
      phase: 'phase1',
      description: 'Primary lead source channel',
    },
    secondarySources: [],
    autoPopulate: true,
    syncBidirectional: false,
    required: false,
    importance: 'medium',
    businessContext: 'Main channel where leads come from',
  },

  // ============================================================================
  // TEAM/ASSIGNMENT FIELDS
  // ============================================================================

  default_assignee: {
    id: 'default_assignee',
    label: { he: 'אחראי ברירת מחדל', en: 'Default Assignee' },
    type: 'text',
    category: 'business',
    collectedIn: ['phase2'],
    usedBy: ['auto-form-to-crm', 'auto-lead-workflow', 'auto-service-workflow'],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.defaultAssignee',
      phase: 'phase2',
      description: 'Default person to assign leads/tasks to',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: false,
    importance: 'medium',
  },

  // ============================================================================
  // DATABASE FIELDS (for workflow state management)
  // ============================================================================

  database_type: {
    id: 'database_type',
    label: { he: 'סוג מסד נתונים', en: 'Database Type' },
    type: 'select',
    category: 'technical',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-approval-workflow',
      'auto-service-workflow',
      'auto-data-sync',
      'int-complex',
      'impl-crm',
      'add-custom-reports',
      'add-dashboard',
      'consulting-process',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.stateManagement.storageType',
      phase: 'phase2',
      description: 'Database type for state management',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    options: [
      { value: 'postgresql', label: { he: 'PostgreSQL', en: 'PostgreSQL' } },
      { value: 'mysql', label: { he: 'MySQL', en: 'MySQL' } },
      { value: 'mongodb', label: { he: 'MongoDB', en: 'MongoDB' } },
      { value: 'sql_server', label: { he: 'SQL Server', en: 'SQL Server' } },
    ],
  },

  database_connection_string: {
    id: 'database_connection_string',
    label: { he: 'מחרוזת חיבור למסד נתונים', en: 'Database Connection String' },
    type: 'text',
    category: 'technical',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-approval-workflow',
      'auto-service-workflow',
      'auto-data-sync',
      'int-complex',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.stateManagement.databaseConfig.connectionString',
      phase: 'phase2',
      description: 'Database connection string',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    technicalContext:
      'Full connection string including credentials for database access',
    placeholder: {
      he: 'postgresql://user:password@host:port/database',
      en: 'postgresql://user:password@host:port/database',
    },
  },

  // ============================================================================
  // NOTIFICATION FIELDS
  // ============================================================================

  notification_channels: {
    id: 'notification_channels',
    label: { he: 'ערוצי התראות', en: 'Notification Channels' },
    type: 'multiselect',
    category: 'communication',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-notifications',
      'auto-approval-workflow',
      'auto-service-workflow',
      'auto-team-alerts',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.notificationChannels',
      phase: 'phase2',
      description: 'Notification channels to use',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    options: [
      { value: 'email', label: { he: 'אימייל', en: 'Email' } },
      { value: 'sms', label: { he: 'SMS', en: 'SMS' } },
      { value: 'whatsapp', label: { he: 'WhatsApp', en: 'WhatsApp' } },
      { value: 'slack', label: { he: 'Slack', en: 'Slack' } },
      {
        value: 'teams',
        label: { he: 'Microsoft Teams', en: 'Microsoft Teams' },
      },
    ],
  },

  // ============================================================================
  // API AUTHENTICATION FIELDS
  // ============================================================================

  api_auth_method: {
    id: 'api_auth_method',
    label: { he: 'שיטת אימות API', en: 'API Authentication Method' },
    type: 'select',
    category: 'authentication',
    collectedIn: ['phase2'],
    usedBy: [
      'int-simple',
      'int-complex',
      'int-calendar',
      'int-crm-marketing',
      'impl-crm',
    ],
    primarySource: {
      path: 'implementationSpec.integrations[].authMethod',
      phase: 'phase2',
      description: 'API authentication method',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    options: [
      { value: 'oauth', label: { he: 'OAuth 2.0', en: 'OAuth 2.0' } },
      { value: 'api_key', label: { he: 'API Key', en: 'API Key' } },
      { value: 'basic_auth', label: { he: 'Basic Auth', en: 'Basic Auth' } },
      {
        value: 'bearer_token',
        label: { he: 'Bearer Token', en: 'Bearer Token' },
      },
      { value: 'jwt', label: { he: 'JWT', en: 'JWT' } },
    ],
  },

  api_endpoint_url: {
    id: 'api_endpoint_url',
    label: { he: 'כתובת API Endpoint', en: 'API Endpoint URL' },
    type: 'url',
    category: 'technical',
    collectedIn: ['phase2'],
    usedBy: ['int-simple', 'int-complex', 'int-calendar', 'whatsapp-api-setup'],
    primarySource: {
      path: 'implementationSpec.integrations[].endpointUrl',
      phase: 'phase2',
      description: 'API endpoint URL',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'critical',
    validation: {
      pattern: /^https?:\/\/.+/,
    },
  },

  // ============================================================================
  // WORKFLOW MANAGEMENT FIELDS
  // ============================================================================

  workflow_trigger: {
    id: 'workflow_trigger',
    label: { he: 'טריגר ל-Workflow', en: 'Workflow Trigger' },
    type: 'select',
    category: 'workflow',
    collectedIn: ['phase2'],
    usedBy: [
      'auto-service-workflow',
      'auto-lead-workflow',
      'auto-approval-workflow',
      'auto-complex-logic',
    ],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.trigger',
      phase: 'phase2',
      description: 'What triggers the workflow',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: true,
    importance: 'high',
    options: [
      { value: 'webhook', label: { he: 'Webhook', en: 'Webhook' } },
      { value: 'schedule', label: { he: 'לפי זמן', en: 'Schedule' } },
      { value: 'event', label: { he: 'אירוע', en: 'Event' } },
      { value: 'manual', label: { he: 'ידני', en: 'Manual' } },
      { value: 'api_call', label: { he: 'קריאת API', en: 'API Call' } },
    ],
  },

  // ============================================================================
  // DUPLICATE DETECTION FIELDS
  // ============================================================================

  duplicate_detection_field: {
    id: 'duplicate_detection_field',
    label: { he: 'שדה לזיהוי כפילויות', en: 'Duplicate Detection Field' },
    type: 'select',
    category: 'technical',
    collectedIn: ['phase2'],
    usedBy: ['auto-form-to-crm', 'auto-lead-response', 'auto-data-sync'],
    primarySource: {
      path: 'implementationSpec.automations[].requirements.duplicateDetectionField',
      phase: 'phase2',
      description: 'Field used for duplicate detection',
    },
    secondarySources: [],
    autoPopulate: false,
    syncBidirectional: true,
    required: false,
    importance: 'high',
    technicalContext:
      'Field to check for duplicates (typically email or phone)',
    options: [
      { value: 'email', label: { he: 'אימייל', en: 'Email' } },
      { value: 'phone', label: { he: 'טלפון', en: 'Phone' } },
      {
        value: 'email_and_phone',
        label: { he: 'אימייל + טלפון', en: 'Email + Phone' },
      },
      { value: 'custom', label: { he: 'שדה מותאם', en: 'Custom Field' } },
    ],
  },
};

/**
 * Get field by ID from registry
 */
export function getFieldById(fieldId: string): RegistryField | undefined {
  return FIELD_REGISTRY[fieldId];
}

/**
 * Get all fields for a specific service
 */
export function getFieldsForService(serviceId: string): RegistryField[] {
  return Object.values(FIELD_REGISTRY).filter((field) =>
    field.usedBy.includes(serviceId)
  );
}

/**
 * Get all fields for a specific category
 */
export function getFieldsByCategory(category: string): RegistryField[] {
  return Object.values(FIELD_REGISTRY).filter(
    (field) => field.category === category
  );
}

/**
 * Get all auto-populate fields
 */
export function getAutoPopulateFields(): RegistryField[] {
  return Object.values(FIELD_REGISTRY).filter(
    (field) => field.autoPopulate === true
  );
}

/**
 * Get fields collected in a specific phase
 */
export function getFieldsByPhase(
  phase: 'phase1' | 'phase2' | 'phase3'
): RegistryField[] {
  return Object.values(FIELD_REGISTRY).filter((field) =>
    field.collectedIn.includes(phase)
  );
}
