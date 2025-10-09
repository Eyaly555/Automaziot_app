/**
 * Service-to-System Dependency Mapping
 *
 * This file maps all 59 services from servicesDatabase.ts to their required
 * technical dependencies: systems, integrations, and AI agents.
 *
 * Purpose:
 * - Phase 2 (Implementation Spec) should only show systems/integrations/AI
 *   needed for the services the client actually purchased
 * - Provides business reasoning for each mapping decision
 * - Ensures accurate technical requirements for development
 *
 * @see servicesDatabase.ts - Source of all service definitions
 * @see systemsDatabase.ts - Available system categories
 * @see phase2.ts - Implementation spec types
 */

import { SERVICES_DATABASE } from './servicesDatabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * System categories aligned with systemsDatabase.ts
 */
export type SystemCategory =
  | 'crm'                    // Customer Relationship Management
  | 'erp'                    // Enterprise Resource Planning
  | 'marketing_automation'   // Marketing automation platforms
  | 'helpdesk'              // Customer support/ticketing systems
  | 'accounting'            // Financial/accounting systems
  | 'project_management'    // Project/task management tools
  | 'hr_system'             // Human resources systems
  | 'inventory'             // Inventory management
  | 'ecommerce'             // E-commerce platforms
  | 'bi_analytics'          // Business Intelligence & Analytics
  | 'website'               // Website/web platform
  | 'email'                 // Email system/service
  | 'messaging'             // WhatsApp/SMS messaging platforms
  | 'calendar'              // Calendar system (Google, Outlook, etc.)
  | 'document_storage'      // Document storage (Google Drive, SharePoint, etc.)
  | 'notification';         // Notification service (Slack, Teams, etc.)

/**
 * Integration types describing data flow between systems
 * Format: "source_to_target" or "system1_system2" for bidirectional
 */
export type IntegrationType =
  // Website integrations
  | 'website_to_crm'
  | 'website_to_email'

  // CRM integrations
  | 'crm_to_email'
  | 'crm_to_messaging'
  | 'crm_to_calendar'
  | 'crm_to_helpdesk'
  | 'crm_to_notification'
  | 'crm_to_analytics'
  | 'crm_to_project_management'
  | 'crm_to_marketing'
  | 'crm_to_accounting'
  | 'crm_to_erp'

  // Email integrations
  | 'email_to_crm'
  | 'email_to_marketing'

  // Helpdesk integrations
  | 'helpdesk_to_crm'
  | 'helpdesk_to_messaging'

  // Calendar integrations
  | 'calendar_to_crm'
  | 'calendar_to_messaging'

  // Document integrations
  | 'document_to_crm'

  // ERP/Accounting integrations
  | 'accounting_to_erp'
  | 'erp_to_crm'

  // Project Management integrations
  | 'project_to_crm'

  // Analytics integrations
  | 'analytics_to_crm'
  | 'analytics_to_erp'
  | 'analytics_to_marketing'

  // Ecommerce integrations
  | 'ecommerce_to_crm'
  | 'ecommerce_to_erp'
  | 'ecommerce_to_inventory'

  // Bidirectional sync
  | 'bidirectional_sync'

  // Multi-system integration
  | 'multi_system_integration'

  // AI integrations
  | 'ai_to_crm'
  | 'ai_to_helpdesk'
  | 'ai_to_systems';

/**
 * AI agent types for intelligent automation
 */
export type AIAgentType =
  | 'sales'           // Sales automation, lead qualification, appointment booking
  | 'support'         // Customer service, FAQ, ticket triage
  | 'workflow'        // Workflow automation, process orchestration
  | 'analytics'       // Predictive analytics, data analysis
  | 'scheduling'      // Meeting/appointment scheduling
  | 'marketing';      // Marketing automation, content generation

/**
 * Service requirements defining all technical dependencies
 */
export interface ServiceRequirements {
  /** System categories required for this service */
  systems: SystemCategory[];

  /** Integration types needed between systems */
  integrations: IntegrationType[];

  /** AI agent types needed for this service */
  aiAgents: AIAgentType[];

  /** Business reasoning for these specific technical requirements */
  reasoning: string;
}

// ============================================================================
// SERVICE-TO-SYSTEM MAPPING
// ============================================================================

/**
 * Complete mapping of all 59 services to their technical dependencies
 *
 * Each mapping includes:
 * - systems: What platforms/tools does this service fundamentally need?
 * - integrations: What data flows between systems are required?
 * - aiAgents: What intelligent automation would enhance/enable this service?
 * - reasoning: Why these specific components? What business value?
 */
export const SERVICE_TO_SYSTEM_MAP: Record<string, ServiceRequirements> = {
  // ==================== AUTOMATIONS - QUICK WINS ====================

  'auto-lead-response': {
    systems: ['website', 'crm', 'email'],
    integrations: ['website_to_crm', 'crm_to_email'],
    aiAgents: [],
    reasoning: 'Requires website for lead capture forms, CRM to store lead data, email for sending auto-response. Integration ensures immediate lead capture and response without AI (simple templated response).'
  },

  'auto-sms-whatsapp': {
    systems: ['crm', 'messaging'],
    integrations: ['crm_to_messaging'],
    aiAgents: [],
    reasoning: 'Needs CRM to identify new leads and messaging platform (WhatsApp/SMS) to send notifications. Simple trigger-based automation without AI intelligence.'
  },

  'auto-crm-update': {
    systems: ['website', 'crm'],
    integrations: ['website_to_crm'],
    aiAgents: [],
    reasoning: 'Website form submissions automatically create/update CRM records. Direct integration eliminates manual data entry without needing AI.'
  },

  'auto-team-alerts': {
    systems: ['crm', 'notification'],
    integrations: ['crm_to_notification'],
    aiAgents: [],
    reasoning: 'CRM monitors for high-priority leads (based on rules), notification system (Slack/Teams/Email) alerts team members. Rule-based, no AI needed.'
  },

  'auto-appointment-reminders': {
    systems: ['calendar', 'crm', 'messaging'],
    integrations: ['calendar_to_messaging', 'crm_to_calendar'],
    aiAgents: [],
    reasoning: 'Calendar system tracks appointments, CRM provides customer contact info, messaging sends reminders (SMS/WhatsApp/Email). Time-based triggers, no AI required.'
  },

  'auto-welcome-email': {
    systems: ['crm', 'email'],
    integrations: ['crm_to_email'],
    aiAgents: [],
    reasoning: 'CRM detects new leads/customers, email system sends personalized welcome message using templates. Simple trigger-based automation.'
  },

  // ==================== AUTOMATIONS - MEDIUM ====================

  'auto-lead-workflow': {
    systems: ['crm', 'website', 'email', 'messaging'],
    integrations: ['website_to_crm', 'email_to_crm', 'crm_to_messaging'],
    aiAgents: [],
    reasoning: 'Complete lead lifecycle: website captures → CRM stores → auto-distribute to sales reps → follow-up via email/messaging. Multi-step workflow without AI (rule-based distribution).'
  },

  'auto-smart-followup': {
    systems: ['crm', 'email', 'messaging'],
    integrations: ['crm_to_email', 'crm_to_messaging'],
    aiAgents: ['sales'],
    reasoning: 'Tracks lead behavior in CRM, uses AI to determine optimal follow-up timing/channel (email vs WhatsApp vs SMS). AI analyzes engagement patterns to maximize conversion.'
  },

  'auto-system-sync': {
    systems: ['crm', 'erp'], // Generic - varies by client needs
    integrations: ['bidirectional_sync'],
    aiAgents: [],
    reasoning: 'Bidirectional data sync between 2-3 systems (e.g., CRM↔ERP, CRM↔Marketing). Specific systems depend on client needs, but integration pattern is consistent.'
  },

  'auto-service-workflow': {
    systems: ['helpdesk', 'crm'],
    integrations: ['helpdesk_to_crm'],
    aiAgents: ['support'],
    reasoning: 'Helpdesk manages tickets, CRM provides customer context. AI agent assists with ticket routing, priority setting, and initial triage based on customer history.'
  },

  'auto-reports': {
    systems: ['bi_analytics', 'crm', 'erp'],
    integrations: ['analytics_to_crm', 'analytics_to_erp'],
    aiAgents: [],
    reasoning: 'BI system aggregates data from CRM and ERP, generates automated daily/weekly reports. Scheduled jobs, no AI needed for basic reporting.'
  },

  'auto-document-mgmt': {
    systems: ['document_storage', 'crm'],
    integrations: ['document_to_crm'],
    aiAgents: [],
    reasoning: 'Documents uploaded to storage (Google Drive/SharePoint), metadata synced to CRM, automatic organization/tagging. OCR processing but not AI-driven.'
  },

  'auto-approval-workflow': {
    systems: ['crm', 'project_management', 'notification'],
    integrations: ['crm_to_notification'],
    aiAgents: [],
    reasoning: 'Workflow routes approval requests based on rules (amount, type), sends notifications, tracks status in project management tool. Rule-based routing without AI.'
  },

  'whatsapp-api-setup': {
    systems: ['messaging', 'crm'],
    integrations: ['crm_to_messaging'],
    aiAgents: [],
    reasoning: 'WhatsApp Business API setup for programmatic messaging, integrated with CRM for customer data. Foundation for automation, no AI in setup itself.'
  },

  'auto-email-templates': {
    systems: ['email', 'marketing_automation'],
    integrations: ['email_to_crm'],
    aiAgents: [],
    reasoning: 'Marketing automation platform manages email templates with personalization tokens, syncs with CRM for contact data. Template-based, not AI-generated.'
  },

  'auto-notifications': {
    systems: ['notification', 'crm'],
    integrations: ['crm_to_notification'],
    aiAgents: [],
    reasoning: 'Multi-channel notification system (email, SMS, push, Slack) triggered by CRM events. Smart routing based on rules, not AI.'
  },

  'auto-data-sync': {
    systems: ['crm', 'erp'], // Generic - varies by client
    integrations: ['bidirectional_sync'],
    aiAgents: [],
    reasoning: 'Real-time bidirectional sync between two systems. Specific systems vary, but requires robust conflict resolution and error handling. No AI needed.'
  },

  'auto-form-to-crm': {
    systems: ['website', 'crm'],
    integrations: ['website_to_crm'],
    aiAgents: [],
    reasoning: 'Website forms automatically create/update CRM records in real-time. Direct API integration, no AI required for data transfer.'
  },

  'auto-document-generation': {
    systems: ['crm', 'document_storage'],
    integrations: ['document_to_crm'],
    aiAgents: [],
    reasoning: 'CRM data populates templates (contracts, invoices, proposals) and generates documents automatically. Template-based generation, no AI needed.'
  },

  'auto-meeting-scheduler': {
    systems: ['calendar', 'crm', 'messaging'],
    integrations: ['calendar_to_crm', 'calendar_to_messaging'],
    aiAgents: ['scheduling'],
    reasoning: 'AI agent finds optimal meeting times based on availability, customer preferences, and timezone. Sends invites via messaging, syncs to CRM and calendar.'
  },

  'reports-automated': {
    systems: ['bi_analytics', 'crm', 'erp'],
    integrations: ['analytics_to_crm', 'analytics_to_erp'],
    aiAgents: [],
    reasoning: 'Comprehensive reporting system pulling from multiple data sources. Scheduled generation and distribution. Real-time dashboards without AI.'
  },

  // ==================== AUTOMATIONS - ADVANCED ====================

  'auto-end-to-end': {
    systems: ['crm', 'erp', 'project_management', 'accounting'],
    integrations: ['multi_system_integration'],
    aiAgents: ['workflow'],
    reasoning: 'Complete process automation from initiation to completion (e.g., lead → sale → fulfillment → invoicing). Requires workflow AI to handle complex decision trees and exceptions.'
  },

  'auto-multi-system': {
    systems: ['crm', 'erp', 'project_management', 'accounting'], // 4+ systems
    integrations: ['multi_system_integration'],
    aiAgents: [],
    reasoning: 'Integration across 4+ systems with complex data flows. Requires robust error handling, data transformation, and conflict resolution. No AI needed but highly complex.'
  },

  'auto-complex-logic': {
    systems: ['crm', 'erp'],
    integrations: ['multi_system_integration'],
    aiAgents: ['workflow'],
    reasoning: 'Automation with nested conditional logic, dynamic routing, and complex business rules. Workflow AI helps manage decision complexity and edge cases.'
  },

  'auto-sales-pipeline': {
    systems: ['crm', 'bi_analytics', 'email', 'messaging'],
    integrations: ['crm_to_analytics', 'crm_to_email', 'crm_to_messaging'],
    aiAgents: ['sales'],
    reasoning: 'Complete sales pipeline with real-time dashboard, automated stage progression, intelligent follow-ups. Sales AI predicts close probability and recommends next actions.'
  },

  'auto-cross-dept': {
    systems: ['crm', 'project_management', 'helpdesk', 'accounting'],
    integrations: ['multi_system_integration'],
    aiAgents: ['workflow'],
    reasoning: 'Automation spanning multiple departments (sales → operations → support → finance). Workflow AI manages handoffs, escalations, and cross-department dependencies.'
  },

  'auto-financial': {
    systems: ['accounting', 'erp', 'crm'],
    integrations: ['accounting_to_erp', 'erp_to_crm'],
    aiAgents: [],
    reasoning: 'Automates invoicing, payment tracking, reconciliation. Requires tight integration between financial systems. Rule-based automation without AI.'
  },

  'auto-project-mgmt': {
    systems: ['project_management', 'crm'],
    integrations: ['project_to_crm'],
    aiAgents: ['workflow'],
    reasoning: 'Automated project creation from CRM opportunities, task allocation, progress tracking. Workflow AI optimizes resource allocation and timeline estimates.'
  },

  // ==================== AI AGENTS - BASIC ====================

  'ai-faq-bot': {
    systems: ['website', 'helpdesk'],
    integrations: [],
    aiAgents: ['support'],
    reasoning: 'AI chatbot on website answers FAQs using knowledge base. Optional integration with helpdesk for ticket escalation. Support AI handles natural language understanding.'
  },

  'ai-lead-qualifier': {
    systems: ['crm', 'website'],
    integrations: ['website_to_crm', 'ai_to_crm'],
    aiAgents: ['sales'],
    reasoning: 'AI agent on website/chat qualifies leads by asking questions, capturing data to CRM. Sales AI determines lead quality and routing based on responses.'
  },

  'ai-form-assistant': {
    systems: ['website', 'crm'],
    integrations: ['website_to_crm'],
    aiAgents: ['support'],
    reasoning: 'AI guides users through complex forms, provides contextual help, validates inputs. Support AI makes form completion easier and increases conversion rates.'
  },

  'ai-triage': {
    systems: ['helpdesk', 'crm'],
    integrations: ['helpdesk_to_crm'],
    aiAgents: ['support'],
    reasoning: 'AI automatically categorizes and routes customer inquiries to correct department/agent. Support AI analyzes inquiry content and urgency for optimal routing.'
  },

  // ==================== AI AGENTS - ADVANCED ====================

  'ai-sales-agent': {
    systems: ['crm', 'calendar', 'messaging', 'email'],
    integrations: ['ai_to_crm', 'crm_to_calendar', 'crm_to_messaging', 'crm_to_email'],
    aiAgents: ['sales', 'scheduling'],
    reasoning: 'Complete sales AI from initial contact → qualification → nurturing → appointment booking. Requires CRM integration for data persistence, calendar for scheduling, multi-channel communication.'
  },

  'ai-service-agent': {
    systems: ['crm', 'helpdesk', 'messaging'],
    integrations: ['ai_to_helpdesk', 'helpdesk_to_crm', 'helpdesk_to_messaging'],
    aiAgents: ['support'],
    reasoning: 'AI service agent with system access can lookup customer info, create tickets, update records. Support AI provides personalized service based on customer history.'
  },

  'ai-complex-workflow': {
    systems: ['crm', 'project_management'],
    integrations: ['ai_to_systems'],
    aiAgents: ['workflow'],
    reasoning: 'AI manages complex conditional workflows with multiple decision points and dynamic routing. Workflow AI handles exceptions and learns from outcomes.'
  },

  'ai-action-agent': {
    systems: ['crm', 'project_management', 'helpdesk'],
    integrations: ['ai_to_crm', 'ai_to_systems'],
    aiAgents: ['workflow'],
    reasoning: 'AI that can take actions: create records, update fields, assign tasks, trigger automations. Workflow AI decides when/how to take action based on context.'
  },

  'ai-learning': {
    systems: ['crm', 'bi_analytics'],
    integrations: ['ai_to_crm', 'analytics_to_crm'],
    aiAgents: ['sales', 'analytics'],
    reasoning: 'AI learns from historical data and outcomes to improve over time. Requires analytics for pattern analysis and CRM for feedback loop. Continuously adapts behavior.'
  },

  // ==================== AI AGENTS - CUSTOM ====================

  'ai-multi-agent': {
    systems: ['crm', 'helpdesk', 'project_management'],
    integrations: ['ai_to_systems', 'multi_system_integration'],
    aiAgents: ['sales', 'support', 'workflow'],
    reasoning: 'Multiple specialized AI agents collaborate (sales AI + support AI + workflow AI). Requires sophisticated orchestration and shared context across agents.'
  },

  'ai-branded': {
    systems: ['crm', 'website', 'messaging'],
    integrations: ['ai_to_crm', 'ai_to_systems'],
    aiAgents: ['sales', 'support'],
    reasoning: 'AI with custom personality, tone, and brand voice. Requires extensive training and fine-tuning. Multi-channel deployment (web, WhatsApp, etc.).'
  },

  'ai-full-integration': {
    systems: ['crm', 'erp', 'helpdesk', 'project_management', 'bi_analytics'],
    integrations: ['ai_to_systems', 'multi_system_integration'],
    aiAgents: ['sales', 'support', 'workflow', 'analytics'],
    reasoning: 'AI deeply integrated with all business systems. Can read/write data across platforms, trigger actions, analyze patterns. Requires comprehensive system access and robust error handling.'
  },

  'ai-multimodal': {
    systems: ['crm', 'document_storage', 'helpdesk'],
    integrations: ['ai_to_systems'],
    aiAgents: ['support'],
    reasoning: 'AI processes multiple input types: text, documents (PDF/Word), images, voice. Support AI extracts information from documents and provides voice interaction capabilities.'
  },

  'ai-predictive': {
    systems: ['bi_analytics', 'crm', 'erp'],
    integrations: ['analytics_to_crm', 'ai_to_systems'],
    aiAgents: ['analytics', 'sales'],
    reasoning: 'AI analyzes historical data to predict outcomes: sales forecasts, churn risk, demand planning. Analytics AI identifies patterns and generates actionable predictions.'
  },

  // ==================== INTEGRATIONS ====================

  'integration-simple': {
    systems: [], // Varies based on which 2 systems
    integrations: ['bidirectional_sync'],
    aiAgents: [],
    reasoning: 'Basic integration between 2 popular systems with standard data sync. Specific systems vary by client needs. No AI required for basic sync.'
  },

  'int-webhook': {
    systems: [], // Varies based on systems
    integrations: ['website_to_crm'], // Example - varies
    aiAgents: [],
    reasoning: 'Webhook setup for real-time event notifications between systems. Lightweight integration pattern, no AI needed.'
  },

  'integration-complex': {
    systems: [], // 3+ systems - varies
    integrations: ['multi_system_integration'],
    aiAgents: [],
    reasoning: 'Complex integration across 3+ systems with bidirectional sync, data transformation, conflict resolution. No AI but requires sophisticated error handling.'
  },

  'int-transform': {
    systems: [], // Varies - 2 systems
    integrations: ['bidirectional_sync'],
    aiAgents: [],
    reasoning: 'Integration with complex data mapping and transformation (field mapping, format conversion, data enrichment). Rule-based transformations without AI.'
  },

  'int-custom-api': {
    systems: [], // Varies based on need
    integrations: ['multi_system_integration'],
    aiAgents: [],
    reasoning: 'Custom API development for unique integration requirements or systems without standard APIs. Highly technical, no AI needed.'
  },

  'int-legacy': {
    systems: [], // Legacy + modern system
    integrations: ['multi_system_integration'],
    aiAgents: [],
    reasoning: 'Integration with legacy systems (mainframe, AS/400, old databases). Requires custom connectors and data transformation. Complex but no AI.'
  },

  // ==================== SYSTEM IMPLEMENTATION ====================

  'impl-crm': {
    systems: ['crm'],
    integrations: [],
    aiAgents: [],
    reasoning: 'CRM setup, configuration, customization. Standalone implementation, no integrations in base service. AI not required for implementation.'
  },

  'impl-marketing': {
    systems: ['marketing_automation', 'email'],
    integrations: ['email_to_crm'], // Optional
    aiAgents: [],
    reasoning: 'Marketing automation platform setup (email campaigns, landing pages, automation workflows). Optional CRM integration. No AI in base implementation.'
  },

  'impl-erp': {
    systems: ['erp'],
    integrations: [],
    aiAgents: [],
    reasoning: 'ERP system setup, module configuration, workflow design. Standalone implementation, integrations sold separately. No AI required.'
  },

  'impl-project-management': {
    systems: ['project_management'],
    integrations: [],
    aiAgents: [],
    reasoning: 'Project management tool setup (boards, workflows, templates, permissions). Standalone implementation, no AI needed.'
  },

  // ==================== ADDITIONAL SERVICES ====================

  'data-cleanup': {
    systems: ['crm'], // Or any data system
    integrations: [],
    aiAgents: [],
    reasoning: 'Data deduplication, normalization, enrichment in existing system (usually CRM). No new systems or AI required - manual data work.'
  },

  'add-dashboard': {
    systems: ['bi_analytics'],
    integrations: ['analytics_to_crm', 'analytics_to_erp'],
    aiAgents: [],
    reasoning: 'Custom real-time dashboard built in BI tool, pulling data from multiple sources. Requires BI platform and data integrations. No AI needed for dashboards.'
  },

  'add-custom-reports': {
    systems: ['bi_analytics'],
    integrations: ['analytics_to_crm', 'analytics_to_erp'],
    aiAgents: [],
    reasoning: 'Custom automated reports from multiple data sources. BI system aggregates and formats data. Scheduled delivery without AI.'
  },

  'training-workshops': {
    systems: [],
    integrations: [],
    aiAgents: [],
    reasoning: 'Training and documentation service. No technical systems required - human service delivery.'
  },

  'support-ongoing': {
    systems: [],
    integrations: [],
    aiAgents: [],
    reasoning: 'Ongoing support and maintenance service. No specific systems required - covers all existing implementations.'
  },

  // ============================================================================
  // MISSING SERVICES - Added October 2025
  // ============================================================================

  'auto-sla-tracking': {
    systems: ['project_management', 'crm'],
    integrations: ['crm_to_notification'],
    aiAgents: [],
    reasoning: 'Tracks SLA deadlines in project management/CRM, sends alerts via notification system. Rule-based monitoring without AI.'
  },

  'auto-custom': {
    systems: [], // Varies based on client needs
    integrations: ['multi_system_integration'],
    aiAgents: [],
    reasoning: 'Custom automation tailored to specific business needs. Systems and integrations depend entirely on the use case.'
  },

  'int-crm-marketing': {
    systems: ['crm', 'marketing_automation'],
    integrations: ['email_to_marketing'],
    aiAgents: [],
    reasoning: 'Sync leads and campaigns between CRM and marketing automation platform. Bidirectional sync for lead tracking and campaign ROI.'
  },

  'int-crm-accounting': {
    systems: ['crm', 'accounting'],
    integrations: ['crm_to_accounting'],
    aiAgents: [],
    reasoning: 'Sync customer data and invoices between CRM and accounting system. Customer → invoice workflow automation.'
  },

  'int-crm-support': {
    systems: ['crm', 'helpdesk'],
    integrations: ['crm_to_helpdesk'],
    aiAgents: [],
    reasoning: 'Sync customer tickets between CRM and support system. Provides customer context to support agents and tracks service history.'
  },

  'int-calendar': {
    systems: ['calendar', 'crm'],
    integrations: ['calendar_to_crm'],
    aiAgents: [],
    reasoning: 'Sync appointments and events between calendar (Google/Outlook) and CRM. Ensures unified view of customer interactions.'
  },

  'int-ecommerce': {
    systems: ['ecommerce', 'crm', 'inventory'],
    integrations: ['ecommerce_to_crm', 'ecommerce_to_inventory'],
    aiAgents: [],
    reasoning: 'Integrate e-commerce platform (Shopify/WooCommerce) with CRM and inventory. Syncs orders, customers, and stock levels.'
  },

  'impl-helpdesk': {
    systems: ['helpdesk'],
    integrations: [],
    aiAgents: [],
    reasoning: 'Helpdesk/ticketing system setup and configuration. Standalone implementation, integrations sold separately.'
  },

  'impl-ecommerce': {
    systems: ['ecommerce'],
    integrations: [],
    aiAgents: [],
    reasoning: 'E-commerce platform (Shopify/WooCommerce) setup and configuration. Store setup, payment gateway, shipping. Integrations optional.'
  },

  'impl-workflow-platform': {
    systems: ['project_management'], // n8n/Zapier/Make as workflow platform
    integrations: [],
    aiAgents: [],
    reasoning: 'Workflow automation platform (n8n/Zapier/Make) setup. Foundation for automation services. No integrations in base setup.'
  },

  'impl-analytics': {
    systems: ['bi_analytics'],
    integrations: [],
    aiAgents: [],
    reasoning: 'Analytics and BI platform setup (Google Analytics, Tableau, Power BI). Dashboard and reporting foundation. Integrations optional.'
  },

  'impl-custom': {
    systems: [], // Varies based on client needs
    integrations: [],
    aiAgents: [],
    reasoning: 'Custom system implementation tailored to specific business requirements. System type depends entirely on client needs.'
  },

  'data-migration': {
    systems: [], // Source and target systems vary
    integrations: ['bidirectional_sync'],
    aiAgents: [],
    reasoning: 'Data migration service between any two systems. Requires ETL, mapping, validation. Specific systems depend on migration scenario.'
  },

  'training-ongoing': {
    systems: [],
    integrations: [],
    aiAgents: [],
    reasoning: 'Ongoing training and learning support service. No technical systems required - human service delivery with documentation.'
  },

  'consulting-strategy': {
    systems: [],
    integrations: [],
    aiAgents: [],
    reasoning: 'Strategic consulting for automation and digital transformation. Advisory service without technical implementation.'
  },

  'consulting-process': {
    systems: [],
    integrations: [],
    aiAgents: [],
    reasoning: 'Process mapping and optimization consulting. Business analysis service without technical system requirements.'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all unique system categories required for selected services
 *
 * @param serviceIds - Array of service IDs from client's purchased services
 * @returns Array of unique system categories needed
 *
 * @example
 * ```ts
 * const services = ['auto-lead-response', 'ai-sales-agent'];
 * const systems = getRequiredSystemsForServices(services);
 * // Returns: ['website', 'crm', 'email', 'calendar', 'messaging']
 * ```
 */
export const getRequiredSystemsForServices = (serviceIds: string[]): SystemCategory[] => {
  const systemCategories = new Set<SystemCategory>();

  serviceIds.forEach(serviceId => {
    const requirements = SERVICE_TO_SYSTEM_MAP[serviceId];
    if (requirements) {
      requirements.systems.forEach(system => systemCategories.add(system));
    }
  });

  return Array.from(systemCategories).sort();
};

/**
 * Get all unique integration types required for selected services
 *
 * @param serviceIds - Array of service IDs from client's purchased services
 * @returns Array of unique integration types needed
 *
 * @example
 * ```ts
 * const services = ['auto-lead-response', 'auto-crm-update'];
 * const integrations = getRequiredIntegrationsForServices(services);
 * // Returns: ['website_to_crm', 'crm_to_email']
 * ```
 */
export const getRequiredIntegrationsForServices = (serviceIds: string[]): IntegrationType[] => {
  const integrations = new Set<IntegrationType>();

  serviceIds.forEach(serviceId => {
    const requirements = SERVICE_TO_SYSTEM_MAP[serviceId];
    if (requirements) {
      requirements.integrations.forEach(integration => integrations.add(integration));
    }
  });

  return Array.from(integrations).sort();
};

/**
 * Get all unique AI agent types required for selected services
 *
 * @param serviceIds - Array of service IDs from client's purchased services
 * @returns Array of unique AI agent types needed
 *
 * @example
 * ```ts
 * const services = ['ai-sales-agent', 'auto-smart-followup'];
 * const agents = getRequiredAIAgentsForServices(services);
 * // Returns: ['sales', 'scheduling']
 * ```
 */
export const getRequiredAIAgentsForServices = (serviceIds: string[]): AIAgentType[] => {
  const agents = new Set<AIAgentType>();

  serviceIds.forEach(serviceId => {
    const requirements = SERVICE_TO_SYSTEM_MAP[serviceId];
    if (requirements) {
      requirements.aiAgents.forEach(agent => agents.add(agent));
    }
  });

  return Array.from(agents).sort();
};

/**
 * Validation result for mapping completeness check
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalServices: number;
    mappedServices: number;
    unmappedServices: number;
    servicesWithSystems: number;
    servicesWithIntegrations: number;
    servicesWithAI: number;
  };
}

/**
 * Validate that all services in the database have mappings
 * and check for consistency issues
 *
 * @returns Validation result with errors, warnings, and statistics
 *
 * @example
 * ```ts
 * const validation = validateServiceMappings();
 * if (!validation.isValid) {
 *   console.error('Mapping errors:', validation.errors);
 * }
 * ```
 */
export const validateServiceMappings = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  let servicesWithSystems = 0;
  let servicesWithIntegrations = 0;
  let servicesWithAI = 0;

  // Check that all services in database have mappings
  SERVICES_DATABASE.forEach(service => {
    const mapping = SERVICE_TO_SYSTEM_MAP[service.id];

    if (!mapping) {
      errors.push(`Service "${service.id}" (${service.name}) has no mapping defined`);
      return;
    }

    // Count statistics
    if (mapping.systems.length > 0) servicesWithSystems++;
    if (mapping.integrations.length > 0) servicesWithIntegrations++;
    if (mapping.aiAgents.length > 0) servicesWithAI++;

    // Validate that AI agent services have AI agents mapped
    if (service.category === 'ai_agents' && mapping.aiAgents.length === 0) {
      warnings.push(`AI service "${service.id}" has no AI agents mapped - this may be intentional for infrastructure services`);
    }

    // Validate that integration services have integrations mapped
    if (service.category === 'integrations' && mapping.integrations.length === 0) {
      warnings.push(`Integration service "${service.id}" has no integrations mapped - this may be a generic service`);
    }

    // Validate reasoning is present and meaningful
    if (!mapping.reasoning || mapping.reasoning.length < 50) {
      warnings.push(`Service "${service.id}" has insufficient business reasoning (should be detailed explanation)`);
    }
  });

  // Check for orphaned mappings (mappings without services)
  Object.keys(SERVICE_TO_SYSTEM_MAP).forEach(mappedServiceId => {
    const serviceExists = SERVICES_DATABASE.find(s => s.id === mappedServiceId);
    if (!serviceExists) {
      errors.push(`Mapping exists for "${mappedServiceId}" but service not found in SERVICES_DATABASE`);
    }
  });

  const totalServices = SERVICES_DATABASE.length;
  const mappedServices = Object.keys(SERVICE_TO_SYSTEM_MAP).length;
  const unmappedServices = totalServices - mappedServices;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalServices,
      mappedServices,
      unmappedServices,
      servicesWithSystems,
      servicesWithIntegrations,
      servicesWithAI
    }
  };
};

/**
 * Get all services that require a specific system category
 *
 * @param systemCategory - The system category to search for
 * @returns Array of service IDs that require this system
 *
 * @example
 * ```ts
 * const crmServices = getServicesBySystem('crm');
 * // Returns all service IDs that need CRM
 * ```
 */
export const getServicesBySystem = (systemCategory: SystemCategory): string[] => {
  return Object.entries(SERVICE_TO_SYSTEM_MAP)
    .filter(([_, requirements]) => requirements.systems.includes(systemCategory))
    .map(([serviceId, _]) => serviceId);
};

/**
 * Get all services that require a specific integration type
 *
 * @param integrationType - The integration type to search for
 * @returns Array of service IDs that require this integration
 *
 * @example
 * ```ts
 * const websiteCRMServices = getServicesByIntegration('website_to_crm');
 * // Returns all service IDs that need website→CRM integration
 * ```
 */
export const getServicesByIntegration = (integrationType: IntegrationType): string[] => {
  return Object.entries(SERVICE_TO_SYSTEM_MAP)
    .filter(([_, requirements]) => requirements.integrations.includes(integrationType))
    .map(([serviceId, _]) => serviceId);
};

/**
 * Get all services that require a specific AI agent type
 *
 * @param aiAgentType - The AI agent type to search for
 * @returns Array of service IDs that require this AI agent
 *
 * @example
 * ```ts
 * const salesAIServices = getServicesByAIAgent('sales');
 * // Returns all service IDs that need sales AI agent
 * ```
 */
export const getServicesByAIAgent = (aiAgentType: AIAgentType): string[] => {
  return Object.entries(SERVICE_TO_SYSTEM_MAP)
    .filter(([_, requirements]) => requirements.aiAgents.includes(aiAgentType))
    .map(([serviceId, _]) => serviceId);
};

/**
 * Get complete technical requirements for a single service
 *
 * @param serviceId - The service ID to get requirements for
 * @returns Service requirements or undefined if not found
 *
 * @example
 * ```ts
 * const reqs = getServiceRequirements('ai-sales-agent');
 * console.log(reqs.reasoning); // "Complete sales AI from initial contact..."
 * ```
 */
export const getServiceRequirements = (serviceId: string): ServiceRequirements | undefined => {
  return SERVICE_TO_SYSTEM_MAP[serviceId];
};

/**
 * Get aggregated requirements summary for multiple services
 *
 * @param serviceIds - Array of service IDs
 * @returns Summary with counts and unique lists
 *
 * @example
 * ```ts
 * const summary = getAggregatedRequirements(['auto-lead-response', 'ai-sales-agent']);
 * console.log(summary.totalSystems); // 5
 * console.log(summary.uniqueSystems); // ['website', 'crm', 'email', 'calendar', 'messaging']
 * ```
 */
export const getAggregatedRequirements = (serviceIds: string[]) => {
  const systems = getRequiredSystemsForServices(serviceIds);
  const integrations = getRequiredIntegrationsForServices(serviceIds);
  const aiAgents = getRequiredAIAgentsForServices(serviceIds);

  return {
    totalSystems: systems.length,
    uniqueSystems: systems,
    totalIntegrations: integrations.length,
    uniqueIntegrations: integrations,
    totalAIAgents: aiAgents.length,
    uniqueAIAgents: aiAgents,
    serviceCount: serviceIds.length
  };
};

// ============================================================================
// EXPORT VALIDATION ON MODULE LOAD
// ============================================================================

// Run validation on module load to catch mapping errors early
const validation = validateServiceMappings();

if (!validation.isValid) {
  console.error('❌ Service-to-System Mapping Validation FAILED:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
}

if (validation.warnings.length > 0) {
  console.warn('⚠️  Service-to-System Mapping Warnings:');
  validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
}

if (validation.isValid && validation.warnings.length === 0) {
  console.log('✅ Service-to-System Mapping Validation PASSED');
  console.log(`   Mapped: ${validation.stats.mappedServices}/${validation.stats.totalServices} services`);
  console.log(`   Systems: ${validation.stats.servicesWithSystems} services`);
  console.log(`   Integrations: ${validation.stats.servicesWithIntegrations} services`);
  console.log(`   AI Agents: ${validation.stats.servicesWithAI} services`);
}
