/**
 * Component Registry Service
 *
 * Maps routes to component information for automatic context detection
 * in the feedback system.
 *
 * @module services/componentRegistry
 */

import type { ComponentInfo } from '../types/feedback';

/**
 * Route to component mapping
 *
 * Maps application routes to their corresponding component information
 * for automatic feedback context detection.
 */
export const ROUTES_MAP: Record<string, ComponentInfo> = {
  // Dashboard & Main
  '/dashboard': {
    name: 'Dashboard',
    displayName: 'דשבורד ראשי',
    filePath: 'src/components/Dashboard/Dashboard.tsx'
  },
  '/clients': {
    name: 'ClientsListView',
    displayName: 'רשימת לקוחות',
    filePath: 'src/components/Clients/ClientsListView.tsx'
  },
  '/summary': {
    name: 'SummaryTab',
    displayName: 'סיכום',
    filePath: 'src/components/Summary/SummaryTab.tsx'
  },

  // Wizard
  '/wizard': {
    name: 'WizardMode',
    displayName: 'מצב אשף',
    filePath: 'src/components/Wizard/WizardMode.tsx'
  },

  // Discovery Modules
  '/module/overview': {
    name: 'OverviewModule',
    displayName: 'מודול סקירה',
    filePath: 'src/components/Modules/Overview/OverviewModule.tsx'
  },
  '/module/essentialDetails': {
    name: 'EssentialDetailsModule',
    displayName: 'פרטים חיוניים',
    filePath: 'src/components/Modules/EssentialDetails/EssentialDetailsModule.tsx'
  },
  '/module/leadsAndSales': {
    name: 'LeadsAndSalesModule',
    displayName: 'לידים ומכירות',
    filePath: 'src/components/Modules/LeadsAndSales/LeadsAndSalesModule.tsx'
  },
  '/module/customerService': {
    name: 'CustomerServiceModule',
    displayName: 'שירות לקוחות',
    filePath: 'src/components/Modules/CustomerService/CustomerServiceModule.tsx'
  },
  '/module/operations': {
    name: 'OperationsModule',
    displayName: 'תפעול',
    filePath: 'src/components/Modules/Operations/OperationsModule.tsx'
  },
  '/module/reporting': {
    name: 'ReportingModule',
    displayName: 'דיווח',
    filePath: 'src/components/Modules/Reporting/ReportingModule.tsx'
  },
  '/module/aiAgents': {
    name: 'AIAgentsModule',
    displayName: 'סוכני AI',
    filePath: 'src/components/Modules/AIAgents/AIAgentsModule.tsx'
  },
  '/module/systems': {
    name: 'SystemsModuleEnhanced',
    displayName: 'מערכות',
    filePath: 'src/components/Modules/Systems/SystemsModuleEnhanced.tsx'
  },
  '/module/roi': {
    name: 'ROIModule',
    displayName: 'ROI',
    filePath: 'src/components/Modules/ROI/ROIModule.tsx'
  },
  '/module/proposal': {
    name: 'ProposalModule',
    displayName: 'הצעה',
    filePath: 'src/components/Modules/Proposal/ProposalModule.tsx'
  },

  // Phase Workflow
  '/requirements': {
    name: 'RequirementsFlow',
    displayName: 'זרימת דרישות',
    filePath: 'src/components/PhaseWorkflow/RequirementsFlow.tsx'
  },
  '/approval': {
    name: 'ClientApprovalView',
    displayName: 'אישור לקוח',
    filePath: 'src/components/PhaseWorkflow/ClientApprovalView.tsx'
  },

  // Phase 2 - Implementation Spec
  '/phase2': {
    name: 'ImplementationSpecDashboard',
    displayName: 'דשבורד מפרט יישום',
    filePath: 'src/components/Phase2/ImplementationSpecDashboard.tsx'
  },
  '/phase2/systems': {
    name: 'SystemDeepDiveSelection',
    displayName: 'בחירת מערכת לצלילה',
    filePath: 'src/components/Phase2/SystemDeepDiveSelection.tsx'
  },
  '/phase2/systems/:systemId/dive': {
    name: 'SystemDeepDive',
    displayName: 'צלילה עמוקה למערכת',
    filePath: 'src/components/Phase2/SystemDeepDive.tsx'
  },
  '/phase2/integrations/new': {
    name: 'IntegrationFlowBuilder',
    displayName: 'בונה זרימת אינטגרציה',
    filePath: 'src/components/Phase2/IntegrationFlowBuilder.tsx'
  },
  '/phase2/integrations/:flowId': {
    name: 'IntegrationFlowBuilder',
    displayName: 'עריכת זרימת אינטגרציה',
    filePath: 'src/components/Phase2/IntegrationFlowBuilder.tsx'
  },
  '/phase2/agents/new': {
    name: 'AIAgentDetailedSpec',
    displayName: 'מפרט סוכן AI חדש',
    filePath: 'src/components/Phase2/AIAgentDetailedSpec.tsx'
  },
  '/phase2/agents/:agentId': {
    name: 'AIAgentDetailedSpec',
    displayName: 'עריכת מפרט סוכן AI',
    filePath: 'src/components/Phase2/AIAgentDetailedSpec.tsx'
  },
  '/phase2/automations/auto-crm-update': {
    name: 'AutoCRMUpdateSpec',
    displayName: 'מפרט עדכון CRM אוטומטי',
    filePath: 'src/components/Phase2/AutoCRMUpdateSpec.tsx'
  },
  '/phase2/automations/ai-triage': {
    name: 'AITriageSpec',
    displayName: 'מפרט מיון AI',
    filePath: 'src/components/Phase2/AITriageSpec.tsx'
  },
  '/phase2/acceptance': {
    name: 'AcceptanceCriteriaBuilder',
    displayName: 'בונה קריטריוני קבלה',
    filePath: 'src/components/Phase2/AcceptanceCriteriaBuilder.tsx'
  },
  '/phase2/service-requirements': {
    name: 'ServiceRequirementsRouter',
    displayName: 'נתב דרישות שירותים',
    filePath: 'src/components/Phase2/ServiceRequirementsRouter.tsx'
  },

  // Phase 3 - Development
  '/phase3': {
    name: 'DeveloperDashboard',
    displayName: 'Developer Dashboard',
    filePath: 'src/components/Phase3/DeveloperDashboard.tsx'
  },
  '/phase3/sprints': {
    name: 'SprintView',
    displayName: 'Sprint View',
    filePath: 'src/components/Phase3/SprintView.tsx'
  },
  '/phase3/systems': {
    name: 'SystemView',
    displayName: 'System View',
    filePath: 'src/components/Phase3/SystemView.tsx'
  },
  '/phase3/progress': {
    name: 'ProgressTracking',
    displayName: 'Progress Tracking',
    filePath: 'src/components/Phase3/ProgressTracking.tsx'
  },
  '/phase3/blockers': {
    name: 'BlockerManagement',
    displayName: 'Blocker Management',
    filePath: 'src/components/Phase3/BlockerManagement.tsx'
  },

  // Settings
  '/settings/ai': {
    name: 'AISettings',
    displayName: 'הגדרות AI',
    filePath: 'src/components/Settings/AISettings.tsx'
  }
};

/**
 * Get component information by route
 *
 * Supports both exact matches and dynamic routes with parameters.
 *
 * @param route - Current route path
 * @returns Component info or null if not found
 *
 * @example
 * ```typescript
 * const info = getComponentByRoute('/phase2/systems/crm/dive');
 * // Returns: { name: 'SystemDeepDive', displayName: '...', filePath: '...' }
 * ```
 */
export function getComponentByRoute(route: string): ComponentInfo | null {
  // Try exact match first
  if (ROUTES_MAP[route]) {
    return ROUTES_MAP[route];
  }

  // Try dynamic route matching
  // Check if route starts with any registered pattern
  for (const [pattern, info] of Object.entries(ROUTES_MAP)) {
    // Convert :param patterns to regex
    const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);

    if (regex.test(route)) {
      return info;
    }
  }

  return null;
}

/**
 * Get all registered components
 *
 * @returns Array of all component information
 */
export function getAllComponents(): ComponentInfo[] {
  // Remove duplicates by component name
  const uniqueComponents = new Map<string, ComponentInfo>();

  Object.values(ROUTES_MAP).forEach(component => {
    if (!uniqueComponents.has(component.name)) {
      uniqueComponents.set(component.name, component);
    }
  });

  return Array.from(uniqueComponents.values());
}

/**
 * Search components by name or display name
 *
 * @param query - Search query
 * @returns Matching components
 */
export function searchComponents(query: string): ComponentInfo[] {
  const lowerQuery = query.toLowerCase();

  return getAllComponents().filter(component =>
    component.name.toLowerCase().includes(lowerQuery) ||
    component.displayName.toLowerCase().includes(lowerQuery) ||
    component.filePath.toLowerCase().includes(lowerQuery)
  );
}
