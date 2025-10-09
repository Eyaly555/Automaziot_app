/**
 * Service Component Mapping
 * Maps Service IDs to their corresponding React Components
 *
 * This file provides the central routing logic for Phase 2 service requirements.
 * Each service purchased by the client maps to a specific requirements form component.
 */

import React from 'react';

// Automations (Services 1-20)
import { AutoLeadResponseSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoLeadResponseSpec';
import { AutoSmsWhatsappSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoSmsWhatsappSpec';
import { AutoCRMUpdateSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoCRMUpdateSpec';
import { AutoTeamAlertsSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoTeamAlertsSpec';
import { AutoLeadWorkflowSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoLeadWorkflowSpec';
import { AutoSmartFollowupSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoSmartFollowupSpec';
import { AutoMeetingSchedulerSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoMeetingSchedulerSpec';
import { AutoFormToCrmSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoFormToCrmSpec';
import { AutoNotificationsSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoNotificationsSpec';
import { AutoApprovalWorkflowSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoApprovalWorkflowSpec';
import { AutoDocumentGenerationSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoDocumentGenerationSpec';
import { AutoDocumentMgmtSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoDocumentMgmtSpec';
import { AutoDataSyncSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoDataSyncSpec';
import { AutoSystemSyncSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoSystemSyncSpec';
import { AutoReportsSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoReportsSpec';
import { AutoMultiSystemSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoMultiSystemSpec';
import { AutoEndToEndSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoEndToEndSpec';
import { AutoSlaTrackingSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoSlaTrackingSpec';
import { AutoCustomSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoCustomSpec';
import { AutoEmailTemplatesSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoEmailTemplatesSpec';

// AI Agents (Services 21-30)
import { AIFAQBotSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AIFAQBotSpec';
import { AILeadQualifierSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AILeadQualifierSpec';
import { AISalesAgentSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AISalesAgentSpec';
import { AIServiceAgentSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AIServiceAgentSpec';
import { AIActionAgentSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AIActionAgentSpec';
import { AIComplexWorkflowSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AIComplexWorkflowSpec';
import { AIPredictiveSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AIPredictiveSpec';
import { AIFullIntegrationSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AIFullIntegrationSpec';
import { AIMultiAgentSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AIMultiAgentSpec';
import { AITriageSpec } from '../components/Phase2/ServiceRequirements/AIAgents/AITriageSpec';

// Integrations (Services 31-40)
import { IntegrationSimpleSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntegrationSimpleSpec';
import { IntegrationComplexSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntegrationComplexSpec';
import { WhatsappApiSetupSpec } from '../components/Phase2/ServiceRequirements/Integrations/WhatsappApiSetupSpec';
import { IntComplexSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntComplexSpec';
import { IntCrmMarketingSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntCrmMarketingSpec';
import { IntCrmAccountingSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntCrmAccountingSpec';
import { IntCrmSupportSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntCrmSupportSpec';
import { IntCalendarSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntCalendarSpec';
import { IntEcommerceSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntEcommerceSpec';
import { IntCustomSpec } from '../components/Phase2/ServiceRequirements/Integrations/IntCustomSpec';

// System Implementations (Services 41-49)
import { ImplCrmSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplCrmSpec';
import { ImplProjectManagementSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplProjectManagementSpec';
import { ImplMarketingAutomationSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplMarketingAutomationSpec';
import { ImplHelpdeskSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplHelpdeskSpec';
import { ImplErpSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplErpSpec';
import { ImplEcommerceSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplEcommerceSpec';
import { ImplWorkflowPlatformSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplWorkflowPlatformSpec';
import { ImplAnalyticsSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplAnalyticsSpec';
import { ImplCustomSpec } from '../components/Phase2/ServiceRequirements/SystemImplementations/ImplCustomSpec';

// Additional Services (Services 50-59)
import { DataCleanupSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/DataCleanupSpec';
import { DataMigrationSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/DataMigrationSpec';
import { AddDashboardSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/AddDashboardSpec';
import { AddCustomReportsSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/AddCustomReportsSpec';
import { TrainingWorkshopsSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/TrainingWorkshopsSpec';
import { TrainingOngoingSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/TrainingOngoingSpec';
import { ReportsAutomatedSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/ReportsAutomatedSpec';
import { SupportOngoingSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/SupportOngoingSpec';
import { ConsultingStrategySpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/ConsultingStrategySpec';
import { ConsultingProcessSpec } from '../components/Phase2/ServiceRequirements/AdditionalServices/ConsultingProcessSpec';

/**
 * Service Component Map
 * Maps service IDs to their React components
 *
 * IMPORTANT: All 59 services must be mapped here
 * If a component is missing, the router will show an error message
 */
export const SERVICE_COMPONENT_MAP: Record<string, React.FC> = {
  // ==================== AUTOMATIONS (1-20) ====================
  'auto-lead-response': AutoLeadResponseSpec,
  'auto-sms-whatsapp': AutoSmsWhatsappSpec,
  'auto-crm-update': AutoCRMUpdateSpec,
  'auto-team-alerts': AutoTeamAlertsSpec,
  'auto-lead-workflow': AutoLeadWorkflowSpec,
  'auto-smart-followup': AutoSmartFollowupSpec,
  'auto-meeting-scheduler': AutoMeetingSchedulerSpec,
  'auto-form-to-crm': AutoFormToCrmSpec,
  'auto-notifications': AutoNotificationsSpec,
  'auto-approval-workflow': AutoApprovalWorkflowSpec,
  'auto-document-generation': AutoDocumentGenerationSpec,
  'auto-document-mgmt': AutoDocumentMgmtSpec,
  'auto-data-sync': AutoDataSyncSpec,
  'auto-system-sync': AutoSystemSyncSpec,
  'auto-reports': AutoReportsSpec,
  'auto-multi-system': AutoMultiSystemSpec,
  'auto-end-to-end': AutoEndToEndSpec,
  'auto-sla-tracking': AutoSlaTrackingSpec,
  'auto-custom': AutoCustomSpec,
  'auto-email-templates': AutoEmailTemplatesSpec,

  // Additional automation services (if they exist in serviceRequirementsTemplates.ts)
  'auto-appointment-reminders': AutoNotificationsSpec, // Reuse notifications component
  'auto-welcome-email': AutoEmailTemplatesSpec, // Reuse email templates
  'auto-service-workflow': AutoLeadWorkflowSpec, // Reuse workflow component
  'auto-complex-logic': AutoCustomSpec, // Reuse custom component
  'auto-sales-pipeline': AutoLeadWorkflowSpec, // Reuse workflow component
  'auto-cross-dept': AutoMultiSystemSpec, // Reuse multi-system component
  'auto-financial': AutoCustomSpec, // Reuse custom component
  'auto-project-mgmt': AutoCustomSpec, // Reuse custom component

  // ==================== AI AGENTS (21-30) ====================
  'ai-faq-bot': AIFAQBotSpec,
  'ai-lead-qualifier': AILeadQualifierSpec,
  'ai-sales-agent': AISalesAgentSpec,
  'ai-service-agent': AIServiceAgentSpec,
  'ai-action-agent': AIActionAgentSpec,
  'ai-complex-workflow': AIComplexWorkflowSpec,
  'ai-predictive': AIPredictiveSpec,
  'ai-full-integration': AIFullIntegrationSpec,
  'ai-multi-agent': AIMultiAgentSpec,
  'ai-triage': AITriageSpec,

  // Additional AI services
  'ai-form-assistant': AIServiceAgentSpec, // Reuse service agent
  'ai-learning': AIComplexWorkflowSpec, // Reuse complex workflow
  'ai-branded': AIServiceAgentSpec, // Reuse service agent
  'ai-multimodal': AIFullIntegrationSpec, // Reuse full integration

  // ==================== INTEGRATIONS (31-40) ====================
  'integration-simple': IntegrationSimpleSpec,
  'integration-complex': IntegrationComplexSpec,
  'whatsapp-api-setup': WhatsappApiSetupSpec,
  'int-crm-marketing': IntCrmMarketingSpec,
  'int-crm-accounting': IntCrmAccountingSpec,
  'int-crm-support': IntCrmSupportSpec,
  'int-calendar': IntCalendarSpec,
  'int-ecommerce': IntEcommerceSpec,

  // Additional integration services
  'int-webhook': IntegrationSimpleSpec, // Reuse simple integration
  'int-transform': IntegrationComplexSpec, // Reuse complex integration
  'int-custom-api': IntCustomSpec, // Reuse custom integration
  'int-legacy': IntegrationComplexSpec, // Reuse complex integration

  // ==================== SYSTEM IMPLEMENTATIONS (41-49) ====================
  'impl-crm': ImplCrmSpec,
  'impl-project-management': ImplProjectManagementSpec,
  'impl-helpdesk': ImplHelpdeskSpec,
  'impl-erp': ImplErpSpec,
  'impl-ecommerce': ImplEcommerceSpec,
  'impl-workflow-platform': ImplWorkflowPlatformSpec,
  'impl-analytics': ImplAnalyticsSpec,
  'impl-custom': ImplCustomSpec,

  // Additional impl services
  'impl-marketing': ImplMarketingAutomationSpec, // Reuse marketing automation

  // ==================== ADDITIONAL SERVICES (50-59) ====================
  'data-cleanup': DataCleanupSpec,
  'data-migration': DataMigrationSpec,
  'add-dashboard': AddDashboardSpec,
  'add-custom-reports': AddCustomReportsSpec,
  'training-workshops': TrainingWorkshopsSpec,
  'training-ongoing': TrainingOngoingSpec,
  'reports-automated': ReportsAutomatedSpec,
  'support-ongoing': SupportOngoingSpec,
  'consulting-strategy': ConsultingStrategySpec,
  'consulting-process': ConsultingProcessSpec,
};

/**
 * Service Category Map
 * Maps service IDs to their category for data storage
 *
 * This determines which array in implementationSpec the data will be stored:
 * - automations: implementationSpec.automations[]
 * - aiAgentServices: implementationSpec.aiAgentServices[]
 * - integrationServices: implementationSpec.integrationServices[]
 * - systemImplementations: implementationSpec.systemImplementations[]
 * - additionalServices: implementationSpec.additionalServices[]
 */
export const SERVICE_CATEGORY_MAP: Record<string, string> = {
  // ==================== AUTOMATIONS ====================
  'auto-lead-response': 'automations',
  'auto-sms-whatsapp': 'automations',
  'auto-crm-update': 'automations',
  'auto-team-alerts': 'automations',
  'auto-lead-workflow': 'automations',
  'auto-smart-followup': 'automations',
  'auto-meeting-scheduler': 'automations',
  'auto-form-to-crm': 'automations',
  'auto-notifications': 'automations',
  'auto-approval-workflow': 'automations',
  'auto-document-generation': 'automations',
  'auto-document-mgmt': 'automations',
  'auto-data-sync': 'automations',
  'auto-system-sync': 'automations',
  'auto-reports': 'automations',
  'auto-multi-system': 'automations',
  'auto-end-to-end': 'automations',
  'auto-sla-tracking': 'automations',
  'auto-custom': 'automations',
  'auto-email-templates': 'automations',
  'auto-appointment-reminders': 'automations',
  'auto-welcome-email': 'automations',
  'auto-service-workflow': 'automations',
  'auto-complex-logic': 'automations',
  'auto-sales-pipeline': 'automations',
  'auto-cross-dept': 'automations',
  'auto-financial': 'automations',
  'auto-project-mgmt': 'automations',

  // ==================== AI AGENTS ====================
  'ai-faq-bot': 'aiAgentServices',
  'ai-lead-qualifier': 'aiAgentServices',
  'ai-sales-agent': 'aiAgentServices',
  'ai-service-agent': 'aiAgentServices',
  'ai-action-agent': 'aiAgentServices',
  'ai-complex-workflow': 'aiAgentServices',
  'ai-predictive': 'aiAgentServices',
  'ai-full-integration': 'aiAgentServices',
  'ai-multi-agent': 'aiAgentServices',
  'ai-triage': 'aiAgentServices',
  'ai-form-assistant': 'aiAgentServices',
  'ai-learning': 'aiAgentServices',
  'ai-branded': 'aiAgentServices',
  'ai-multimodal': 'aiAgentServices',

  // ==================== INTEGRATIONS ====================
  'integration-simple': 'integrationServices',
  'integration-complex': 'integrationServices',
  'whatsapp-api-setup': 'integrationServices',
  'int-crm-marketing': 'integrationServices',
  'int-crm-accounting': 'integrationServices',
  'int-crm-support': 'integrationServices',
  'int-calendar': 'integrationServices',
  'int-ecommerce': 'integrationServices',
  'int-webhook': 'integrationServices',
  'int-transform': 'integrationServices',
  'int-custom-api': 'integrationServices',
  'int-legacy': 'integrationServices',

  // ==================== SYSTEM IMPLEMENTATIONS ====================
  'impl-crm': 'systemImplementations',
  'impl-project-management': 'systemImplementations',
  'impl-helpdesk': 'systemImplementations',
  'impl-erp': 'systemImplementations',
  'impl-ecommerce': 'systemImplementations',
  'impl-workflow-platform': 'systemImplementations',
  'impl-analytics': 'systemImplementations',
  'impl-custom': 'systemImplementations',
  'impl-marketing': 'systemImplementations',

  // ==================== ADDITIONAL SERVICES ====================
  'data-cleanup': 'additionalServices',
  'data-migration': 'additionalServices',
  'add-dashboard': 'additionalServices',
  'add-custom-reports': 'additionalServices',
  'training-workshops': 'additionalServices',
  'training-ongoing': 'additionalServices',
  'reports-automated': 'additionalServices',
  'support-ongoing': 'additionalServices',
  'consulting-strategy': 'additionalServices',
  'consulting-process': 'additionalServices',
};

/**
 * Get the category for a service ID
 * @param serviceId - The service identifier
 * @returns The category name or 'unknown' if not found
 */
export function getServiceCategory(serviceId: string): string {
  return SERVICE_CATEGORY_MAP[serviceId] || 'unknown';
}

/**
 * Get the component for a service ID
 * @param serviceId - The service identifier
 * @returns The React component or null if not found
 */
export function getServiceComponent(serviceId: string): React.FC | null {
  return SERVICE_COMPONENT_MAP[serviceId] || null;
}

/**
 * Check if a service has a component mapping
 * @param serviceId - The service identifier
 * @returns True if component exists, false otherwise
 */
export function hasServiceComponent(serviceId: string): boolean {
  return serviceId in SERVICE_COMPONENT_MAP;
}
