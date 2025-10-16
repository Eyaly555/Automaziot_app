/**
 * AI Agent Services Type Definitions
 * Generated from AI_AGENTS_TECHNICAL_REQUIREMENTS.md
 * Services 21-30: Complete implementation type system
 *
 * @description Type definitions for all 10 AI Agent services including configuration,
 * requirements, and integration specifications. Each interface represents a complete
 * service configuration that can be stored in the implementationSpec.
 */

// ============================================================================
// Common Types & Enums
// ============================================================================

/**
 * AI Provider options across all services
 */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure_openai';

/**
 * Priority levels for triage and routing
 */
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

/**
 * Vector database providers for RAG implementations
 */
export type VectorDatabaseProvider =
  | 'supabase_pgvector'
  | 'pinecone_starter'
  | 'pinecone_standard'
  | 'qdrant'
  | 'weaviate'
  | 'chromadb';

/**
 * Common messaging channels across services
 */
export type MessagingChannel =
  | 'whatsapp'
  | 'website'
  | 'facebook'
  | 'instagram'
  | 'email'
  | 'sms'
  | 'chat'
  | 'web_form';

/**
 * CRM system integrations
 */
export type CRMSystem =
  | 'zoho'
  | 'salesforce'
  | 'hubspot'
  | 'pipedrive'
  | 'monday'
  | 'other';

// ============================================================================
// Service #21: AI FAQ Bot
// ============================================================================

/**
 * Service #21: AI FAQ Bot Requirements
 * בוט AI למענה על שאלות נפוצות
 *
 * @description Configuration for an AI-powered FAQ chatbot with RAG capabilities.
 * Uses vector database for semantic search and hybrid approach (FAQ-links + RAG fallback).
 *
 * **Key Features:**
 * - Semantic search using embeddings
 * - Hybrid approach: vetted FAQ answers + RAG fallback
 * - Multi-channel deployment (website, WhatsApp, etc.)
 * - GDPR compliant conversation storage
 *
 * **Cost Estimation:**
 * - GPT-4o Mini: ~$5-10/month for 100 conversations/day
 * - Embeddings: $0.02 per 1M tokens (one-time cost)
 * - Vector DB: Free tier (Supabase) or $25/month (paid)
 */
export interface AIFaqBotRequirements {
  /** AI provider selection */
  aiProvider: AIProvider;

  /** AI model name (e.g., 'gpt-4o-mini', 'claude-3.5-sonnet') */
  model: string;

  /** API key provided and configured */
  apiKeyProvided: boolean;

  /** Vector database provider */
  vectorDatabase: VectorDatabaseProvider;

  /** Vector DB credentials ready */
  vectorDbCredentialsReady: boolean;

  /** Embedding model for semantic search */
  embeddingModel:
    | 'text-embedding-3-small'
    | 'text-embedding-3-large'
    | 'text-embedding-ada-002';

  /** Knowledge base configuration */
  knowledgeBase: {
    /** Number of FAQ entries (recommended: 50-200) */
    faqCount: number;

    /** FAQ document format */
    faqFormat: 'json' | 'csv' | 'excel' | 'pdf' | 'google_docs';

    /** Storage location (Google Drive, Dropbox, URL) */
    faqStorageLocation?: string;

    /** Document chunking strategy */
    documentChunkingStrategy: '500_tokens' | '1000_tokens' | 'custom';

    /** Custom chunk size in tokens (if strategy is 'custom') */
    customChunkSize?: number;
  };

  /** Message templates */
  messageTemplates: {
    /** Greeting message */
    greeting: string;

    /** Fallback response when bot doesn't know answer */
    fallback: string;

    /** Handoff message when escalating to human */
    handoff: string;

    /** Privacy notice (GDPR requirement) */
    privacyNotice: string;
  };

  /** Escalation configuration */
  escalationConfig: {
    /** Number of failed attempts before handoff */
    failedAttemptsThreshold: number;

    /** Keywords that trigger immediate escalation */
    escalationKeywords: string[];

    /** Only escalate during business hours */
    businessHoursOnly: boolean;

    /** Human agent availability */
    humanAgentAvailable: boolean;

    /** Email for handoff notifications */
    handoffEmail?: string;
  };

  /** RAG (Retrieval-Augmented Generation) configuration */
  ragConfig: {
    /** Use hybrid approach (FAQ-links + RAG fallback) - RECOMMENDED */
    hybridApproach: boolean;

    /** Number of top results to retrieve (recommended: 3-5) */
    topKResults: number;

    /** Confidence threshold for automatic response (0-1) */
    confidenceThreshold: number;

    /** Context window size in tokens */
    contextWindow: number;
  };

  /** Website integration settings */
  websiteIntegration: {
    /** Website URL */
    websiteUrl: string;

    /** Chat widget type */
    chatWidgetType: 'javascript_sdk' | 'iframe' | 'api';

    /** Widget position on page */
    chatWidgetPosition: 'bottom_right' | 'bottom_left' | 'custom';

    /** Widget color (hex) */
    chatWidgetColor?: string;

    /** Mobile responsive */
    mobileResponsive: boolean;
  };

  /** GDPR compliance settings */
  gdprCompliance: {
    /** Conversation retention in days (recommended: max 30) */
    conversationRetentionDays: number;

    /** Encrypt data at rest */
    encryptAtRest: boolean;

    /** Allow user data deletion rights */
    userDeletionRights: boolean;

    /** Privacy policy link */
    privacyPolicyLink: string;

    /** Cookie consent required */
    cookieConsent: boolean;
  };

  /** Rate limits and capacity */
  rateLimits: {
    /** Requests per minute (GPT-4o Mini Tier 1: 30K RPM) */
    requestsPerMinute: number;

    /** Maximum concurrent users */
    concurrentUsers: number;

    /** Daily conversation limit */
    dailyConversations: number;
  };

  /** Performance monitoring */
  monitoring: {
    /** Resolution rate target percentage (recommended: >70%) */
    resolutionRateTarget: number;

    /** Fallback rate target percentage (recommended: <20%) */
    fallbackRateTarget: number;

    /** Track user satisfaction (CSAT) */
    trackUserSatisfaction: boolean;

    /** Analytics enabled */
    analyticsEnabled: boolean;
  };

  /** Cost estimation */
  costEstimation: {
    /** Estimated conversations per day */
    estimatedConversationsPerDay: number;

    /** Average messages per conversation */
    averageMessagesPerConversation: number;

    /** Estimated monthly cost in USD (calculated) */
    estimatedMonthlyCost?: number;
  };

  /** Testing configuration */
  testing: {
    /** Test mode enabled */
    testMode: boolean;

    /** Test FAQs uploaded */
    testFAQsUploaded: boolean;

    /** Vector DB tested */
    vectorDbTested: boolean;

    /** Chat widget tested */
    chatWidgetTested: boolean;
  };
}

// ============================================================================
// Service #22: AI Lead Qualifier
// ============================================================================

/**
 * Service #22: AI Lead Qualifier Requirements
 * AI לאיסוף מידע ראשוני מלידים (BANT)
 *
 * @description AI bot for qualifying leads using BANT methodology
 * (Budget, Authority, Need, Timeline) with predictive scoring.
 *
 * **Key Features:**
 * - BANT qualification framework
 * - Predictive lead scoring (multidimensional data)
 * - CRM integration for automatic scoring
 * - Real-time scoring (2 hours → 2 minutes)
 *
 * **Impact:**
 * - 40% more qualified opportunities identified
 * - 30% increase in conversion rates
 * - 25% reduction in CAC
 */
export interface AILeadQualifierRequirements {
  /** AI provider */
  aiProvider: AIProvider;

  /** AI model (recommended: GPT-4o or Claude 3.5 Sonnet) */
  model: string;

  /** CRM system integration */
  crmSystem: CRMSystem;

  /** CRM API credentials configured */
  crmCredentialsReady: boolean;

  /** BANT qualification criteria */
  bantCriteria: {
    /** Budget qualification */
    budget: {
      /** Minimum budget threshold */
      minimumBudget?: number;

      /** Budget qualification questions */
      questions: string[];

      /** Score weight (0-25) */
      scoreWeight: number;
    };

    /** Authority qualification */
    authority: {
      /** Decision maker roles */
      decisionMakerRoles: string[];

      /** Authority qualification questions */
      questions: string[];

      /** Score weight (0-25) */
      scoreWeight: number;
    };

    /** Need qualification */
    need: {
      /** Pain points to identify */
      painPoints: string[];

      /** Need qualification questions */
      questions: string[];

      /** Score weight (0-25) */
      scoreWeight: number;
    };

    /** Timeline qualification */
    timeline: {
      /** Ideal timeline options */
      idealTimelines: string[];

      /** Timeline qualification questions */
      questions: string[];

      /** Score weight (0-25) */
      scoreWeight: number;
    };
  };

  /** Conversation flow */
  conversationFlow: {
    /** Maximum number of questions (recommended: 5-8) */
    maxQuestions: number;

    /** Conversation type */
    conversationType: 'structured' | 'conversational';

    /** Greeting message */
    greetingMessage: string;

    /** Completion message */
    completionMessage: string;
  };

  /** Lead scoring configuration */
  leadScoring: {
    /** Minimum qualified score (0-100) */
    qualifiedThreshold: number;

    /** Use predictive analytics */
    usePredictiveAnalytics: boolean;

    /** Additional scoring factors */
    additionalFactors?: {
      /** Website behavior tracking */
      websiteBehavior: boolean;

      /** Email engagement */
      emailEngagement: boolean;

      /** Content downloads */
      contentDownloads: boolean;
    };
  };

  /** Follow-up automation */
  followUp: {
    /** Auto-send thank you email */
    autoThankYouEmail: boolean;

    /** Email template for qualified leads */
    qualifiedEmailTemplate?: string;

    /** Email template for unqualified leads */
    unqualifiedEmailTemplate?: string;

    /** Maximum follow-up attempts */
    maxFollowUpAttempts: number;
  };

  /** Integration channels */
  channels: {
    channel: 'web_form' | 'chat' | 'email' | 'phone';
    enabled: boolean;
  }[];

  /** Performance tracking */
  performance: {
    /** Daily lead volume */
    dailyLeadVolume: number;

    /** Target qualification rate (%) */
    qualificationRateTarget: number;

    /** Target completion rate (%) */
    completionRateTarget: number;
  };
}

// ============================================================================
// Service #23: AI Sales Agent
// ============================================================================

/**
 * Service #23: AI Sales Agent Requirements
 * סוכן AI למכירות מלא
 *
 * @description Full AI sales agent that handles conversations, answers product
 * questions, schedules meetings, and updates CRM.
 *
 * **Key Features:**
 * - Product knowledge base with RAG
 * - Calendar integration (Google Calendar/Calendly)
 * - CRM real-time updates
 * - Multi-channel support (WhatsApp, website, email)
 * - Objection handling
 *
 * **Cost Consideration:**
 * - GPT-4o output tokens cost 4x input ($10 vs $3)
 * - Prompt caching saves 75% on static content
 * - Budget: ~$20-30/day for 200 conversations
 */
export interface AISalesAgentRequirements {
  /** AI provider */
  aiProvider: AIProvider;

  /** AI model (recommended: GPT-4o or Claude Sonnet 4.5) */
  model: string;

  /** Vector database for knowledge base */
  vectorDatabase: VectorDatabaseProvider;

  /** Product knowledge base */
  productKnowledgeBase: {
    /** Number of product documents */
    documentCount: number;

    /** Knowledge base types included */
    includes: {
      productCatalog: boolean;
      pricingInfo: boolean;
      caseStudies: boolean;
      competitorComparisons: boolean;
      technicalSpecs: boolean;
    };

    /** Embedding model */
    embeddingModel: string;

    /** Knowledge base storage location */
    storageLocation: string;
  };

  /** Sales playbook */
  salesPlaybook: {
    /** Objection handling scripts */
    objectionHandling: {
      objection: string;
      response: string;
    }[];

    /** Pricing strategies */
    pricingStrategies: string[];

    /** Qualification questions */
    qualificationQuestions: string[];

    /** Handoff criteria (when to escalate to human) */
    handoffCriteria: {
      budgetThreshold?: number;
      dealType?: string[];
      complexity?: 'high' | 'medium' | 'low';
    };
  };

  /** Calendar integration */
  calendarIntegration: {
    /** Calendar system */
    system: 'google_calendar' | 'calendly' | 'microsoft_outlook' | 'other';

    /** API configured */
    apiConfigured: boolean;

    /** Availability rules */
    availabilityRules: {
      /** Business hours */
      businessHours: {
        start: string; // HH:MM format
        end: string;
      };

      /** Buffer time between meetings (minutes) */
      bufferTime: number;

      /** Meeting types and durations */
      meetingTypes: {
        type: string;
        durationMinutes: number;
      }[];
    };
  };

  /** CRM integration */
  crmIntegration: {
    /** CRM system */
    system: CRMSystem;

    /** Real-time updates enabled */
    realTimeUpdates: boolean;

    /** Webhooks configured */
    webhooksConfigured: boolean;

    /** Fields to update */
    fieldsToUpdate: string[];
  };

  /** Multi-channel configuration */
  channels: {
    channel: MessagingChannel;
    enabled: boolean;
    config?: Record<string, any>;
  }[];

  /** Message templates */
  messageTemplates: {
    greeting: string;
    productPitch: string;
    meetingInvite: string;
    followUp: string;
  };

  /** Conversation limits */
  conversationLimits: {
    /** Maximum messages before handoff */
    maxMessages: number;

    /** Conversation timeout (minutes) */
    timeoutMinutes: number;
  };

  /** Performance metrics */
  performance: {
    /** Daily conversation volume */
    dailyConversations: number;

    /** Conversion targets */
    targets: {
      /** Conversation → Qualified Lead (%) */
      conversationToLead: number;

      /** Qualified → Meeting Booked (%) */
      leadToMeeting: number;
    };
  };
}

// ============================================================================
// Service #24: AI Service Agent
// ============================================================================

/**
 * Service #24: AI Service Agent Requirements
 * סוכן AI לשירות לקוחות
 *
 * @description AI agent for customer service with ticket management,
 * order status checking, and human handoff capabilities.
 *
 * **Key Features:**
 * - Function calling for actions (check order, create ticket)
 * - Sentiment analysis for escalation
 * - Multi-channel support
 * - Integration with ticketing systems
 *
 * **Target Metrics:**
 * - Resolution rate: >60% (AI resolves without human)
 * - Escalation rate: <40%
 * - First response: <2 minutes
 */
export interface AIServiceAgentRequirements {
  /** AI provider (must support function calling) */
  aiProvider: AIProvider;

  /** AI model (GPT-4o or Claude 3.5 Sonnet) */
  model: string;

  /** Vector database for help documentation */
  vectorDatabase: VectorDatabaseProvider;

  /** Help documentation knowledge base */
  helpDocumentation: {
    /** Number of help documents */
    documentCount: number;

    /** Document types */
    includes: {
      troubleshootingGuides: boolean;
      howToArticles: boolean;
      returnPolicies: boolean;
      faq: boolean;
    };

    /** Chunking strategy */
    chunkingStrategy: '500_tokens' | '1000_tokens' | 'custom';
  };

  /** Ticketing system integration */
  ticketingSystem?: {
    /** System type */
    system:
      | 'zendesk'
      | 'freshdesk'
      | 'jira_service_desk'
      | 'helpscout'
      | 'intercom'
      | 'zoho_desk'
      | 'other';

    /** API configured */
    apiConfigured: boolean;

    /** Auto-create tickets */
    autoCreateTickets: boolean;

    /** Ticket fields to populate */
    ticketFields: string[];
  };

  /** Order management integration */
  orderManagement?: {
    /** System type */
    system: string;

    /** API configured */
    apiConfigured: boolean;

    /** Available functions */
    functions: (
      | 'getOrderStatus'
      | 'getTrackingNumber'
      | 'processRefund'
      | 'updateShipping'
    )[];
  };

  /** Function/Tool definitions */
  toolDefinitions: {
    /** Tool name */
    name: string;

    /** Tool description */
    description: string;

    /** Parameters */
    parameters: {
      name: string;
      type: string;
      required: boolean;
    }[];
  }[];

  /** Sentiment analysis */
  sentimentAnalysis: {
    /** Enabled */
    enabled: boolean;

    /** Escalation threshold (-1 to 1) */
    escalationThreshold: number;

    /** Detect emotions */
    detectEmotions: {
      frustration: boolean;
      anger: boolean;
      disappointment: boolean;
    };
  };

  /** Escalation rules */
  escalationRules: {
    /** Escalate on negative sentiment */
    negativesentiment: boolean;

    /** Escalate on specific keywords */
    keywords: string[];

    /** Escalate on failed resolution attempts */
    failedAttempts: number;

    /** Handoff message */
    handoffMessage: string;
  };

  /** Multi-channel support */
  channels: {
    channel: MessagingChannel | 'whatsapp_business';
    enabled: boolean;
    /** WhatsApp Business API configuration (if applicable) */
    whatsappConfig?: {
      phoneNumberId: string;
      businessAccountId: string;
      messageTemplatesApproved: boolean;
    };
  }[];

  /** SLA targets */
  slaTargets: {
    /** First response time (minutes) */
    firstResponse: number;

    /** AI resolution time (minutes) */
    aiResolution: number;

    /** Human resolution time (hours) */
    humanResolution: number;
  };

  /** Performance monitoring */
  performance: {
    /** Daily ticket volume */
    dailyTicketVolume: number;

    /** Resolution rate target (%) */
    resolutionRateTarget: number;

    /** Track Bot Experience Score (BES) */
    trackBES: boolean;
  };
}

// ============================================================================
// Service #25: AI Action Agent
// ============================================================================

/**
 * Service #25: AI Action Agent Requirements
 * AI עם יכולות פעולה (Actions)
 *
 * @description AI agent that performs actions across multiple systems:
 * update CRM, create tasks, send emails, update documents.
 *
 * **Key Features:**
 * - Function calling / tool use
 * - Multi-system API access
 * - Action validation layer
 * - Audit logging
 * - Error handling & rollback
 *
 * **Security:**
 * - RBAC (Role-Based Access Control)
 * - Human approval for critical actions
 * - Comprehensive audit trail
 * - Rate limiting (max 10 actions/minute)
 */
export interface AIActionAgentRequirements {
  /** AI provider (must support function calling) */
  aiProvider: AIProvider;

  /** AI model (GPT-4o or Claude 3.5 Sonnet with tool use) */
  model: string;

  /** Action definitions */
  actionDefinitions: {
    /** Action name */
    name: string;

    /** Action description */
    description: string;

    /** Target system */
    targetSystem:
      | 'crm'
      | 'project_management'
      | 'email'
      | 'document_storage'
      | 'calendar'
      | 'other';

    /** API endpoint or function */
    endpoint: string;

    /** HTTP method */
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    /** Required parameters */
    parameters: {
      name: string;
      type: string;
      required: boolean;
      description: string;
    }[];

    /** Requires human approval */
    requiresApproval: boolean;
  }[];

  /** Permission model (RBAC) */
  permissions: {
    /** Role name */
    role: string;

    /** Allowed actions */
    allowedActions: string[];

    /** Approval threshold (e.g., actions >$500 need approval) */
    approvalThreshold?: {
      type: 'budget' | 'bulk_count' | 'critical';
      value: number | string;
    };
  }[];

  /** Validation layer */
  validation: {
    /** Validate permissions before action */
    checkPermissions: boolean;

    /** Validate parameters */
    validateParameters: boolean;

    /** Critical actions requiring approval */
    criticalActions: ('delete' | 'payment' | 'contract' | 'bulk_operations')[];

    /** Human approval email */
    approvalEmail?: string;
  };

  /** Audit logging */
  auditLogging: {
    /** Log all actions */
    logAllActions: boolean;

    /** Storage system */
    storageSystem: 'supabase' | 'database' | 's3' | 'other';

    /** Log fields to capture */
    logFields: (
      | 'user'
      | 'action'
      | 'parameters'
      | 'result'
      | 'timestamp'
      | 'ip_address'
    )[];

    /** Retention period (days) */
    retentionDays: number;
  };

  /** Error handling */
  errorHandling: {
    /** Retry logic */
    retryEnabled: boolean;

    /** Maximum retries */
    maxRetries: number;

    /** Rollback on failure */
    rollbackOnFailure: boolean;

    /** Error notification email */
    errorNotificationEmail?: string;
  };

  /** Rate limiting */
  rateLimiting: {
    /** Maximum actions per minute (per user) */
    actionsPerMinute: number;

    /** Maximum actions per conversation */
    actionsPerConversation: number;
  };

  /** System integrations */
  systemIntegrations: {
    /** System name */
    system:
      | 'crm'
      | 'project_management'
      | 'email'
      | 'document_storage'
      | 'calendar';

    /** System details */
    details: string;

    /** API configured */
    apiConfigured: boolean;

    /** Available actions */
    availableActions: string[];
  }[];

  /** Testing configuration */
  testing: {
    /** Sandbox environment URL */
    sandboxUrl?: string;

    /** Test mode enabled */
    testMode: boolean;

    /** Test actions performed */
    testActionsCompleted: boolean;
  };
}

// ============================================================================
// Service #26: AI Complex Workflow
// ============================================================================

/**
 * Service #26: AI Complex Workflow Requirements
 * סוכן AI עם תהליכי עבודה מורכבים
 *
 * @description AI agent managing complex workflows with conditional logic,
 * multi-step processes, and cross-department handoffs.
 *
 * **Key Features:**
 * - LangGraph for stateful workflows
 * - Checkpoint & resume (durable execution)
 * - Multi-agent coordination
 * - Human-in-the-loop at checkpoints
 * - SLA tracking per step
 *
 * **Architecture Patterns:**
 * - Network (full mesh)
 * - Supervisor (central coordinator)
 * - Hierarchical (supervisors of supervisors)
 */
export interface AIComplexWorkflowRequirements {
  /** AI provider */
  aiProvider: AIProvider;

  /** AI model (must support extended context 200K+ tokens) */
  model: string;

  /** Workflow orchestration */
  orchestration: {
    /** Framework */
    framework: 'langgraph' | 'n8n' | 'custom' | 'zapier';

    /** Framework configured */
    configured: boolean;
  };

  /** State management */
  stateManagement: {
    /** Storage system */
    storageSystem: 'supabase' | 'redis' | 'database' | 'other';

    /** Checkpoint enabled (durable execution) */
    checkpointEnabled: boolean;

    /** Resume on failure */
    resumeOnFailure: boolean;
  };

  /** Workflow definition */
  workflowDefinition: {
    /** Workflow name */
    name: string;

    /** Workflow steps */
    steps: {
      /** Step ID */
      id: string;

      /** Step name */
      name: string;

      /** Step type */
      type: 'automated' | 'human_approval' | 'conditional' | 'parallel';

      /** Target system */
      targetSystem?: string;

      /** Timeout (minutes) */
      timeoutMinutes: number;

      /** Next step(s) - can be conditional */
      nextSteps: {
        condition?: string;
        stepId: string;
      }[];
    }[];

    /** Trigger conditions */
    triggers: {
      type: 'form_submission' | 'email' | 'crm_event' | 'webhook' | 'schedule';
      config: Record<string, any>;
    }[];
  };

  /** Decision logic */
  decisionLogic: {
    /** Rules */
    rules: {
      /** Rule description */
      description: string;

      /** Condition (if/then) */
      condition: string;

      /** Action to take */
      action: string;
    }[];
  };

  /** Multi-agent coordination */
  multiAgent?: {
    /** Architecture pattern */
    pattern: 'network' | 'supervisor' | 'hierarchical' | 'custom';

    /** Agent roles */
    agents: {
      name: string;
      role: string;
      responsibilities: string[];
    }[];
  };

  /** Human-in-the-loop */
  humanInTheLoop: {
    /** Checkpoints requiring approval */
    approvalCheckpoints: string[];

    /** Approval timeout (hours) */
    approvalTimeoutHours: number;

    /** Escalation on timeout */
    escalateOnTimeout: boolean;

    /** Approver emails */
    approverEmails: string[];
  };

  /** SLA definitions */
  slaDefinitions: {
    /** Step ID or workflow name */
    target: string;

    /** SLA time (hours) */
    slaHours: number;

    /** Escalation on breach */
    escalateOnBreach: boolean;

    /** Escalation contact */
    escalationContact?: string;
  }[];

  /** Error handling */
  errorHandling: {
    /** Retry failed steps */
    retryFailedSteps: boolean;

    /** Max retries per step */
    maxRetries: number;

    /** Fallback actions */
    fallbackActions: {
      stepId: string;
      fallbackType: 'skip' | 'manual_intervention' | 'alternative_path';
    }[];
  };

  /** Performance tracking */
  performance: {
    /** Average workflow duration target (hours) */
    durationTarget: number;

    /** Completion rate target (%) */
    completionRateTarget: number;

    /** Track bottleneck steps */
    trackBottlenecks: boolean;
  };
}

// ============================================================================
// Service #27: AI Triage
// ============================================================================

/**
 * Service #27: AI Triage Requirements
 * AI לסינון פניות ראשוני
 *
 * @description AI for classifying incoming inquiries, detecting sentiment,
 * assigning priority, and routing to appropriate teams.
 *
 * **Key Features:**
 * - Category classification (5-10 categories)
 * - Sentiment analysis (detect frustration, anger, urgency)
 * - Priority assignment (urgent/high/medium/low)
 * - Routing matrix (category + priority → team)
 * - VIP handling
 *
 * **Performance:**
 * - Processing time: <5 seconds
 * - Accuracy target: >90%
 * - Cost: ~$0.30/day for 1,000 inquiries (GPT-4o Mini)
 */
export interface AITriageRequirements {
  /** AI provider */
  aiProvider: AIProvider;

  /** AI model (recommended: GPT-4o Mini for classification) */
  aiModel: string;

  /** n8n access configured */
  n8nAccess: boolean;

  /** Model settings */
  modelSettings: {
    /** Temperature (0-2, lower = more deterministic) */
    temperature: number;

    /** Max tokens for classification response */
    maxTokens: number;

    /** Confidence threshold (0-1) */
    confidenceThreshold: number;
  };

  /** Category taxonomy */
  categories: TriageCategory[];

  /** Priority rules */
  priorityRules: PriorityRule[];

  /** Routing rules (matrix) */
  routingRules: RoutingRule[];

  /** Sentiment analysis */
  sentimentAnalysis: {
    /** Enabled */
    enabled: boolean;

    /** Sentiment thresholds */
    thresholds: {
      veryNegative: number;
      negative: number;
      neutral: number;
      positive: number;
      veryPositive: number;
    };

    /** Emotion detection */
    emotionDetection: {
      enabled: boolean;
      detectFrustration: boolean;
      detectAnger: boolean;
      detectUrgency: boolean;
      detectExcitement: boolean;
      detectDisappointment: boolean;
    };

    /** Escalation rules based on sentiment */
    escalationRules: {
      emotion: string;
      threshold: number;
      action: string;
    }[];
  };

  /** VIP handling */
  vipHandling: {
    /** Enabled */
    enabled: boolean;

    /** VIP identification method */
    vipIdentificationMethod:
      | 'crm_field'
      | 'customer_tier'
      | 'email_domain'
      | 'manual_list';

    /** CRM field name for VIP (if method is crm_field) */
    vipField?: string;

    /** VIP tiers (if method is customer_tier) */
    vipTiers?: string[];

    /** VIP domains (if method is email_domain) */
    vipDomains?: string[];

    /** VIP email list (if method is manual_list) */
    vipEmails?: string[];

    /** Auto-boost priority for VIPs */
    autoPriorityBoost: boolean;

    /** VIP priority level */
    vipPriority: PriorityLevel;

    /** VIP notification method */
    vipNotificationMethod:
      | 'immediate_alert'
      | 'dedicated_queue'
      | 'auto_assign_senior';
  };

  /** Training data */
  trainingData: {
    /** Number of historical inquiries for training */
    historicalInquiriesCount: number;

    /** Training completed */
    trainingCompleted: boolean;

    /** Manual review enabled (first 2 weeks) */
    manualReviewEnabled: boolean;
  };

  /** Performance targets */
  performance: {
    /** Processing time target (seconds) */
    processingTimeTarget: number;

    /** Daily inquiry volume */
    dailyInquiryVolume: number;

    /** Monitor accuracy */
    monitorAccuracy: boolean;

    /** Accuracy target (%) */
    accuracyTargetPercentage: number;
  };

  /** Integration channels */
  integrationChannels: {
    channel: 'email' | 'chat' | 'web_form' | 'whatsapp' | 'phone';
    enabled: boolean;
  }[];

  /** CRM/Ticketing integration */
  crmSystem?: CRMSystem;
  ticketingSystem?: 'zendesk' | 'freshdesk' | 'jira_service_desk' | 'other';

  /** Error handling */
  errorHandling: {
    /** Action on low confidence classification */
    onLowConfidence: 'manual_review' | 'default_category' | 'escalate';

    /** Fallback priority if classification fails */
    fallbackPriority: PriorityLevel;

    /** Error notification email */
    errorNotificationEmail?: string;

    /** Retry attempts */
    retryAttempts: number;

    /** Log all classifications */
    logAllClassifications: boolean;
  };

  /** Testing */
  testMode: boolean;
  testAccountAvailable: boolean;
}

/**
 * Triage category definition
 */
export interface TriageCategory {
  /** Unique category ID */
  id: string;

  /** Category name (English) */
  name: string;

  /** Category name (Hebrew) */
  nameHe: string;

  /** Keywords for classification */
  keywords: string[];

  /** Auto-assign to (email/team name) */
  autoAssignTo?: string;
}

/**
 * Priority rule definition
 */
export interface PriorityRule {
  /** Unique rule ID */
  id: string;

  /** Rule name (English) */
  name: string;

  /** Rule name (Hebrew) */
  nameHe: string;

  /** Conditions for rule (defined in n8n workflow) */
  conditions: string[];

  /** Resulting priority level */
  resultPriority: PriorityLevel;

  /** Escalate to manager */
  escalate: boolean;
}

/**
 * Routing rule definition
 */
export interface RoutingRule {
  /** Unique rule ID */
  id: string;

  /** Category ID */
  category: string;

  /** Priority level */
  priority: PriorityLevel;

  /** Route to target */
  routeTo: {
    type: 'team' | 'person' | 'department' | 'round_robin';
    target: string; // email or name
  };

  /** Notification method */
  notificationMethod: 'email' | 'sms' | 'whatsapp' | 'slack' | 'teams';

  /** SLA (minutes) */
  slaMinutes?: number;

  /** Auto-assign (no manual intervention) */
  autoAssign: boolean;
}

// ============================================================================
// Service #28: AI Predictive Analytics
// ============================================================================

/**
 * Service #28: AI Predictive Analytics Requirements
 * AI עם יכולות ניתוח וחיזוי
 *
 * @description AI with predictive analytics for churn prediction, demand forecasting,
 * lead scoring, and revenue prediction.
 *
 * **Key Features:**
 * - Multi-dimensional data analysis
 * - Feature engineering (20-50 features)
 * - Model training (regression, classification)
 * - Real-time inference
 * - Model drift monitoring
 *
 * **Impact:**
 * - 25% reduction in CAC
 * - 30% increase in conversion rates
 * - Churn prediction accuracy >75%
 */
export interface AIPredictiveRequirements {
  /** AI provider */
  aiProvider: AIProvider;

  /** AI model (GPT-4o with Code Interpreter or Claude 3.5 Sonnet) */
  model: string;

  /** Prediction type */
  predictionType:
    | 'churn'
    | 'demand_forecasting'
    | 'lead_scoring'
    | 'revenue_prediction'
    | 'multi';

  /** Data warehouse integration */
  dataWarehouse: {
    /** System type */
    system: 'supabase' | 'bigquery' | 'snowflake' | 'redshift' | 'other';

    /** Connection configured */
    configured: boolean;

    /** Historical data available (months) */
    historicalDataMonths: number;
  };

  /** Feature engineering */
  featureEngineering: {
    /** Number of features */
    featureCount: number;

    /** Feature categories */
    categories: {
      customerDemographics: boolean;
      transactionHistory: boolean;
      websiteBehavior: boolean;
      emailEngagement: boolean;
      supportInteractions: boolean;
      productUsage: boolean;
    };

    /** Custom features */
    customFeatures?: {
      name: string;
      description: string;
      dataSource: string;
    }[];
  };

  /** Target variable definition */
  targetVariable: {
    /** Variable name */
    name: string;

    /** Type */
    type: 'binary' | 'multiclass' | 'continuous';

    /** Definition (e.g., "churn = no purchase in 90 days") */
    definition: string;
  };

  /** Model training */
  modelTraining: {
    /** Training/validation split ratio */
    trainTestSplit: number; // e.g., 0.7 for 70/30 split

    /** Algorithms to test */
    algorithms: (
      | 'linear_regression'
      | 'logistic_regression'
      | 'random_forest'
      | 'gradient_boosting'
      | 'neural_network'
    )[];

    /** Baseline accuracy (without AI) */
    baselineAccuracy?: number;

    /** Target accuracy */
    targetAccuracy: number;
  };

  /** Real-time inference */
  realTimeInference: {
    /** Inference API configured */
    apiConfigured: boolean;

    /** API endpoint */
    apiEndpoint?: string;

    /** Max inference latency (ms) */
    maxLatencyMs: number;
  };

  /** CRM integration for predictions */
  crmIntegration: {
    /** CRM system */
    system: CRMSystem;

    /** Write predictions to CRM */
    writePredictions: boolean;

    /** Prediction fields */
    predictionFields: {
      fieldName: string;
      predictionType: string;
    }[];
  };

  /** Alerting rules */
  alerting: {
    /** Alert conditions */
    conditions: {
      type: 'high_churn_risk' | 'low_lead_score' | 'anomaly_detected';
      threshold: number;
      recipients: string[];
    }[];
  };

  /** Model monitoring */
  modelMonitoring: {
    /** Track model drift */
    trackDrift: boolean;

    /** Retraining schedule */
    retrainingSchedule: 'weekly' | 'monthly' | 'quarterly' | 'on_drift';

    /** Accuracy degradation threshold (%) */
    accuracyDegradationThreshold: number;

    /** Alert on drift */
    alertOnDrift: boolean;
  };

  /** Explainability */
  explainability: {
    /** Use SHAP values or similar */
    enabled: boolean;

    /** Explain top N features */
    topFeatures: number;
  };

  /** Performance */
  performance: {
    /** Daily predictions volume */
    dailyPredictions: number;

    /** Current accuracy (if model trained) */
    currentAccuracy?: number;
  };

  /** GDPR compliance */
  gdprCompliance: {
    /** Legal basis for profiling */
    legalBasis: 'legitimate_interest' | 'consent' | 'contract';

    /** User can request explanation */
    allowExplanationRequests: boolean;

    /** User can opt out */
    allowOptOut: boolean;
  };
}

// ============================================================================
// Service #29: AI Full Integration
// ============================================================================

/**
 * Service #29: AI Full Integration Requirements
 * אינטגרציה עמוקה עם כל המערכות
 *
 * @description AI integrated with all business systems (CRM, ERP, PM, Finance)
 * with access to all data for cross-system queries.
 *
 * **Key Features:**
 * - Multi-system orchestration (8-12 systems)
 * - Unified data layer
 * - Real-time sync (webhooks)
 * - RBAC across all systems
 * - Comprehensive audit trail
 *
 * **Complexity:**
 * - Prompt caching essential (90% cost savings)
 * - Cross-system queries can be slow
 * - Testing across 8-12 systems is complex
 */
export interface AIFullIntegrationRequirements {
  /** AI provider */
  aiProvider: AIProvider;

  /** AI model (with prompt caching support) */
  model: string;

  /** Prompt caching configured */
  promptCachingEnabled: boolean;

  /** System integrations */
  systemIntegrations: {
    /** System type */
    systemType:
      | 'crm'
      | 'erp'
      | 'project_management'
      | 'finance'
      | 'hr'
      | 'email'
      | 'calendar'
      | 'document_storage';

    /** System name/provider */
    systemName: string;

    /** API configured */
    apiConfigured: boolean;

    /** Real-time sync enabled */
    realTimeSync: boolean;

    /** Sync method */
    syncMethod?: 'webhooks' | 'polling' | 'api_calls';

    /** Data access level */
    dataAccess: 'read_only' | 'read_write' | 'full_control';
  }[];

  /** Unified data layer */
  unifiedDataLayer: {
    /** Implementation type */
    type: 'supabase' | 'custom_warehouse' | 'data_lake';

    /** Aggregates data from all systems */
    aggregatesAllSystems: boolean;

    /** Update frequency */
    updateFrequency: 'real_time' | 'hourly' | 'daily';
  };

  /** Data mapping */
  dataMapping: {
    /** Cross-system field mappings */
    fieldMappings: {
      field: string;
      systems: {
        systemName: string;
        fieldName: string;
      }[];
    }[];
  };

  /** Permissions & security */
  permissions: {
    /** RBAC enabled */
    rbacEnabled: boolean;

    /** AI respects user permissions in each system */
    respectUserPermissions: boolean;

    /** Permission validation before queries */
    validateBeforeQuery: boolean;
  };

  /** Audit trail */
  auditTrail: {
    /** Log all cross-system queries */
    logAllQueries: boolean;

    /** Log fields */
    logFields: (
      | 'user'
      | 'query'
      | 'systems_accessed'
      | 'data_returned'
      | 'timestamp'
    )[];

    /** Storage system */
    storageSystem: string;

    /** Retention period (days) */
    retentionDays: number;
  };

  /** Error handling */
  errorHandling: {
    /** Graceful degradation if system down */
    gracefulDegradation: boolean;

    /** Use cached data on system failure */
    useCachedData: boolean;

    /** Fallback strategy */
    fallbackStrategy: 'partial_data' | 'error_message' | 'retry';
  };

  /** Performance optimization */
  performanceOptimization: {
    /** Cache frequently accessed data */
    cacheFrequentData: boolean;

    /** Cache TTL (minutes) */
    cacheTTL: number;

    /** Rate limit coordination across systems */
    coordinateRateLimits: boolean;
  };

  /** Query capabilities */
  queryCapabilities: {
    /** Example queries supported */
    exampleQueries: string[];

    /** Max systems per query */
    maxSystemsPerQuery: number;

    /** Query timeout (seconds) */
    queryTimeoutSeconds: number;
  };

  /** Cost management */
  costManagement: {
    /** Monitor token usage by system */
    monitorBySystem: boolean;

    /** Daily budget limit (USD) */
    dailyBudgetLimit?: number;

    /** Alert on high usage */
    alertOnHighUsage: boolean;
  };
}

// ============================================================================
// Service #30: AI Multi-Agent
// ============================================================================

/**
 * Service #30: AI Multi-Agent System Requirements
 * מספר סוכני AI משתפי פעולה
 *
 * @description System of 3-5 specialized AI agents collaborating to solve
 * complex problems.
 *
 * **Key Features:**
 * - Agent specialization (Sales, Support, Data, Action, Routing)
 * - Supervisor or Hierarchical coordination
 * - Shared memory across agents
 * - Durable execution with handoffs
 * - LangGraph orchestration
 *
 * **Architecture Patterns:**
 * - Network (full mesh) - for 3-5 agents
 * - Supervisor (central coordinator) - recommended for 3-5 agents
 * - Hierarchical (supervisors of supervisors) - for 6+ agents
 *
 * **Impact:**
 * - 35-45% increase in resolution rates vs single agent
 * - Better specialization improves accuracy
 */
export interface AIMultiAgentRequirements {
  /** AI provider */
  aiProvider: AIProvider;

  /** AI model (run multiple instances) */
  model: string;

  /** LangGraph framework */
  langGraphConfigured: boolean;

  /** Architecture pattern */
  architecturePattern: 'network' | 'supervisor' | 'hierarchical' | 'custom';

  /** Agent definitions */
  agents: {
    /** Agent name */
    name: string;

    /** Agent role */
    role:
      | 'sales'
      | 'support'
      | 'data_analysis'
      | 'action_execution'
      | 'routing'
      | 'custom';

    /** Specialization description */
    specialization: string;

    /** Responsibilities */
    responsibilities: string[];

    /** System access */
    systemAccess: string[];

    /** Model settings (can differ per agent) */
    modelSettings?: {
      temperature: number;
      maxTokens: number;
    };
  }[];

  /** Supervisor configuration (if using supervisor pattern) */
  supervisorConfig?: {
    /** Routing algorithm */
    routingAlgorithm:
      | 'intent_based'
      | 'skill_based'
      | 'round_robin'
      | 'load_balanced';

    /** Delegation rules */
    delegationRules: {
      condition: string;
      targetAgent: string;
    }[];
  };

  /** Shared memory */
  sharedMemory: {
    /** Storage system */
    storageSystem: 'redis' | 'supabase' | 'memory_db' | 'other';

    /** All agents access same customer context */
    sharedCustomerContext: boolean;

    /** Session TTL (minutes) */
    sessionTTL: number;
  };

  /** Agent communication */
  agentCommunication: {
    /** Communication protocol */
    protocol: 'json_messages' | 'structured_handoff' | 'api_calls';

    /** Handoff includes conversation context */
    includeContext: boolean;

    /** Max handoffs per conversation */
    maxHandoffs: number;
  };

  /** Coordination layer */
  coordination: {
    /** Coordinator type */
    coordinator: 'supervisor_agent' | 'orchestrator_service' | 'rule_based';

    /** Conflict resolution */
    conflictResolution: 'supervisor_decides' | 'voting' | 'priority_based';
  };

  /** Durable execution */
  durableExecution: {
    /** Workflows persist across handoffs */
    enabled: boolean;

    /** Checkpoint state */
    checkpointState: boolean;

    /** Resume on agent failure */
    resumeOnFailure: boolean;
  };

  /** Error handling */
  errorHandling: {
    /** Retry failed agent */
    retryFailedAgent: boolean;

    /** Fallback to different agent */
    fallbackAgent?: string;

    /** Human escalation on multi-agent failure */
    humanEscalationOnFailure: boolean;
  };

  /** Performance tracking */
  performance: {
    /** Track resolution rate by agent */
    trackByAgent: boolean;

    /** Track handoff latency */
    trackHandoffLatency: boolean;

    /** Optimization targets */
    targets: {
      /** Resolution rate (%) */
      resolutionRate: number;

      /** Average handoffs per conversation */
      avgHandoffs: number;

      /** Response time (seconds) */
      responseTime: number;
    };
  };

  /** Cost management */
  costManagement: {
    /** Running 3-5 agents = 3-5x costs */
    expectedCostMultiplier: number;

    /** Daily budget (USD) */
    dailyBudget?: number;

    /** Disable unused agents */
    disableUnusedAgents: boolean;

    /** Monitor token usage per agent */
    monitorPerAgent: boolean;
  };

  /** Testing scenarios */
  testing: {
    /** Multi-step workflow tests */
    multiStepWorkflows: boolean;

    /** Agent failure scenarios */
    agentFailureTests: boolean;

    /** Conflicting agent responses */
    conflictScenarios: boolean;
  };
}

// ============================================================================
// Union Types & Service Entry
// ============================================================================

/**
 * Union type of all AI Agent service configurations
 */
export type AIAgentServiceConfig =
  | AIFaqBotRequirements
  | AILeadQualifierRequirements
  | AISalesAgentRequirements
  | AIServiceAgentRequirements
  | AIActionAgentRequirements
  | AIComplexWorkflowRequirements
  | AITriageRequirements
  | AIPredictiveRequirements
  | AIFullIntegrationRequirements
  | AIMultiAgentRequirements;

/**
 * AI Agent Service Entry
 * Container for any AI agent service configuration
 */
export interface AIAgentServiceEntry {
  /** Service ID (ai-faq-bot, ai-lead-qualifier, etc.) */
  serviceId: string;

  /** Service name */
  serviceName: string;

  /** Service configuration (one of the 10 types above) */
  requirements: AIAgentServiceConfig;

  /** Completion status */
  status: 'not_started' | 'configuring' | 'configured' | 'testing' | 'deployed';

  /** Completed timestamp */
  completedAt?: string;

  /** Last updated timestamp */
  updatedAt?: string;

  /** Updated by user ID */
  updatedBy?: string;
}

/**
 * Service ID type for type safety
 */
export type AIAgentServiceId =
  | 'ai-faq-bot' // #21
  | 'ai-lead-qualifier' // #22
  | 'ai-sales-agent' // #23
  | 'ai-service-agent' // #24
  | 'ai-action-agent' // #25
  | 'ai-complex-workflow' // #26
  | 'ai-triage' // #27
  | 'ai-predictive' // #28
  | 'ai-full-integration' // #29
  | 'ai-multi-agent'; // #30

/**
 * Service metadata for UI rendering
 */
export interface AIAgentServiceMetadata {
  id: AIAgentServiceId;
  nameEn: string;
  nameHe: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex' | 'advanced';
  estimatedImplementationDays: number;
  priority: 'quick_win' | 'high_value' | 'advanced';
}

/**
 * All 10 AI Agent Services Metadata
 */
export const AI_AGENT_SERVICES_METADATA: AIAgentServiceMetadata[] = [
  {
    id: 'ai-faq-bot',
    nameEn: 'AI FAQ Bot',
    nameHe: "צ'אטבוט AI למענה על שאלות נפוצות",
    description:
      'AI chatbot for answering frequently asked questions with RAG capabilities',
    complexity: 'simple',
    estimatedImplementationDays: 5,
    priority: 'quick_win',
  },
  {
    id: 'ai-lead-qualifier',
    nameEn: 'AI Lead Qualifier',
    nameHe: 'AI לאיסוף מידע ראשוני מלידים',
    description:
      'AI bot for qualifying leads using BANT methodology with predictive scoring',
    complexity: 'medium',
    estimatedImplementationDays: 7,
    priority: 'quick_win',
  },
  {
    id: 'ai-sales-agent',
    nameEn: 'AI Sales Agent',
    nameHe: 'סוכן AI למכירות',
    description:
      'Full AI sales agent handling conversations, scheduling, and CRM updates',
    complexity: 'complex',
    estimatedImplementationDays: 10,
    priority: 'high_value',
  },
  {
    id: 'ai-service-agent',
    nameEn: 'AI Service Agent',
    nameHe: 'סוכן AI לשירות לקוחות',
    description:
      'AI customer service agent with ticket management and order checking',
    complexity: 'complex',
    estimatedImplementationDays: 12,
    priority: 'high_value',
  },
  {
    id: 'ai-action-agent',
    nameEn: 'AI Action Agent',
    nameHe: 'AI עם יכולות פעולה',
    description:
      'AI agent that performs actions across systems with audit logging',
    complexity: 'complex',
    estimatedImplementationDays: 12,
    priority: 'high_value',
  },
  {
    id: 'ai-triage',
    nameEn: 'AI Triage',
    nameHe: 'AI לסינון פניות ראשוני',
    description:
      'AI for classifying, prioritizing, and routing incoming inquiries',
    complexity: 'simple',
    estimatedImplementationDays: 5,
    priority: 'quick_win',
  },
  {
    id: 'ai-complex-workflow',
    nameEn: 'AI Complex Workflow',
    nameHe: 'סוכן AI עם תהליכי עבודה מורכבים',
    description:
      'AI managing multi-step workflows with LangGraph orchestration',
    complexity: 'advanced',
    estimatedImplementationDays: 15,
    priority: 'advanced',
  },
  {
    id: 'ai-predictive',
    nameEn: 'AI Predictive Analytics',
    nameHe: 'AI עם יכולות ניתוח וחיזוי',
    description:
      'AI with predictive analytics for churn, lead scoring, and forecasting',
    complexity: 'advanced',
    estimatedImplementationDays: 20,
    priority: 'advanced',
  },
  {
    id: 'ai-full-integration',
    nameEn: 'AI Full Integration',
    nameHe: 'אינטגרציה עמוקה עם כל המערכות',
    description:
      'AI integrated with all business systems (CRM, ERP, PM, Finance)',
    complexity: 'advanced',
    estimatedImplementationDays: 25,
    priority: 'advanced',
  },
  {
    id: 'ai-multi-agent',
    nameEn: 'AI Multi-Agent System',
    nameHe: 'מספר סוכני AI משתפי פעולה',
    description:
      'System of 3-5 specialized AI agents collaborating via LangGraph',
    complexity: 'advanced',
    estimatedImplementationDays: 20,
    priority: 'advanced',
  },
];
