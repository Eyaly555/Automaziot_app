import { Meeting, ModuleProgress } from '../types';

export interface RemainingTask {
  type: 'module' | 'spec' | 'integration' | 'ai_agent' | 'acceptance';
  description: string;
  urgent: boolean;
  count?: number;
}

export interface PurchasedService {
  id: string;
  name: string;
  price?: number;
  category: string;
}

export interface NextAction {
  description: string;
  urgent: boolean;
  action: () => void;
}

export interface ClientProgressSummary {
  overallProgress: number;
  phaseStatus: {
    discovery: 'completed' | 'in_progress' | 'not_started';
    implementation: 'completed' | 'in_progress' | 'waiting' | 'not_started';
    development: 'completed' | 'in_progress' | 'waiting' | 'not_started';
  };
  remainingTasks: RemainingTask[];
  purchasedServices: PurchasedService[];
  nextActions: NextAction[];
}

/**
 * Calculate remaining tasks for current meeting
 */
export function calculateRemainingTasks(meeting: Meeting): RemainingTask[] {
  const tasks: RemainingTask[] = [];

  if (!meeting) return tasks;

  // Check incomplete modules in Discovery phase
  const incompleteModules = getIncompleteModules(meeting);
  if (incompleteModules.length > 0) {
    tasks.push({
      type: 'module',
      description: `${incompleteModules.length} מודולים לא הושלמו ב-Discovery`,
      urgent: incompleteModules.some((m) => m.total - m.completed > 3),
      count: incompleteModules.length,
    });
  }

  // Check Phase 2 - Implementation Spec
  if (meeting.phase === 'implementation_spec' && meeting.implementationSpec) {
    const spec = meeting.implementationSpec;

    // Incomplete system specs
    const incompleteSystems = spec.systems.filter(
      (s: any) => s.completionPercentage < 100
    );
    if (incompleteSystems.length > 0) {
      tasks.push({
        type: 'spec',
        description: `${incompleteSystems.length} מפרטי מערכות לא הושלמו`,
        urgent: true,
        count: incompleteSystems.length,
      });
    }

    // Missing integrations
    const requiredIntegrations = spec.integrations.filter(
      (i: any) => i.isRequired !== false
    );
    const incompleteIntegrations = spec.integrations.filter(
      (i: any) => i.completionPercentage < 100
    );
    if (requiredIntegrations.length === 0) {
      tasks.push({
        type: 'integration',
        description: 'אינטגרציות לא הוגדרו',
        urgent: true,
      });
    } else if (incompleteIntegrations.length > 0) {
      tasks.push({
        type: 'integration',
        description: `${incompleteIntegrations.length} אינטגרציות לא הושלמו`,
        urgent: true,
        count: incompleteIntegrations.length,
      });
    }

    // Missing AI agents
    const requiredAIAgents = spec.aiAgents.filter(
      (a: any) => a.isRequired !== false
    );
    const incompleteAIAgents = spec.aiAgents.filter(
      (a: any) => a.completionPercentage < 100
    );
    if (requiredAIAgents.length > 0 && incompleteAIAgents.length > 0) {
      tasks.push({
        type: 'ai_agent',
        description: `${incompleteAIAgents.length} סוכני AI לא הוגדרו`,
        urgent: false,
        count: incompleteAIAgents.length,
      });
    }

    // Missing acceptance criteria
    const hasAcceptanceCriteria =
      spec.acceptanceCriteria &&
      Object.values(spec.acceptanceCriteria).some((arr: any) => arr.length > 0);
    if (!hasAcceptanceCriteria) {
      tasks.push({
        type: 'acceptance',
        description: 'Acceptance Criteria לא נכתבו',
        urgent: false,
      });
    }
  }

  // Check Phase 3 - Development
  if (meeting.phase === 'development' && meeting.developmentTracking) {
    const dev = meeting.developmentTracking;
    const incompleteTasks = dev.tasks.filter((t: any) => t.status !== 'done');
    if (incompleteTasks.length > 0) {
      tasks.push({
        type: 'module',
        description: `${incompleteTasks.length} משימות פיתוח לא הושלמו`,
        urgent: incompleteTasks.some((t: any) => t.priority === 'critical'),
        count: incompleteTasks.length,
      });
    }
  }

  return tasks;
}

/**
 * Get purchased services from proposal
 */
export function getPurchasedServices(meeting: Meeting): PurchasedService[] {
  if (!meeting.modules?.proposal?.purchasedServices) {
    return [];
  }

  return meeting.modules.proposal.purchasedServices.map((service: any) => ({
    id: service.id,
    name: service.name,
    price: service.price,
    category: service.category,
  }));
}

/**
 * Generate next recommended actions
 */
export function generateNextActions(meeting: Meeting): NextAction[] {
  const actions: NextAction[] = [];

  if (!meeting) return actions;

  // If Discovery not complete
  const overallProgress = getOverallProgress(meeting);
  if (overallProgress < 100) {
    actions.push({
      description: 'השלם את כל מודולי ה-Discovery',
      urgent: overallProgress < 50,
      action: () => {
        // Navigate to first incomplete module
        const incompleteModules = getIncompleteModules(meeting);
        if (incompleteModules.length > 0) {
          window.location.href = `/module/${incompleteModules[0].moduleId}`;
        }
      },
    });
  }

  // If services selected but not sent to client
  const hasSelectedServices = meeting.modules?.proposal?.selectedServices?.some(
    (s: any) => s.selected
  );
  if (hasSelectedServices && !meeting.modules?.proposal?.proposalSent) {
    actions.push({
      description: 'שלח הצעה ללקוח',
      urgent: true,
      action: () => (window.location.href = '/module/proposal'),
    });
  }

  // If proposal sent but client decision pending
  if (
    meeting.modules?.proposal?.proposalSent &&
    meeting.status === 'awaiting_client_decision'
  ) {
    actions.push({
      description: 'המתן לאישור לקוח והכנס שירותים שנרכשו',
      urgent: false,
      action: () => (window.location.href = '/approval'),
    });
  }

  // If client approved but still in discovery phase
  if (meeting.status === 'client_approved' && meeting.phase === 'discovery') {
    actions.push({
      description: 'עבר ל-Implementation Spec',
      urgent: true,
      action: () => {
        // This would trigger phase transition
        console.log('Transition to implementation_spec');
      },
    });
  }

  // Phase 2 specific actions
  if (meeting.phase === 'implementation_spec') {
    const remainingTasks = calculateRemainingTasks(meeting);
    if (remainingTasks.length > 0) {
      const urgentTasks = remainingTasks.filter((t) => t.urgent);
      if (urgentTasks.length > 0) {
        actions.push({
          description: `השלם ${urgentTasks.length} משימות דחופות ב-Phase 2`,
          urgent: true,
          action: () => (window.location.href = '/phase2'),
        });
      }
    } else {
      actions.push({
        description: 'Phase 2 הושלם - מוכן למעבר ל-Development',
        urgent: false,
        action: () => {
          // Trigger transition to development
          console.log('Transition to development');
        },
      });
    }
  }

  // Phase 3 specific actions
  if (meeting.phase === 'development') {
    actions.push({
      description: 'נהל משימות פיתוח וספרינטים',
      urgent: false,
      action: () => (window.location.href = '/phase3'),
    });
  }

  return actions;
}

/**
 * Get incomplete modules for current meeting
 */
function getIncompleteModules(meeting: Meeting): ModuleProgress[] {
  // This would use the existing getModuleProgress logic
  // For now, return mock data based on meeting structure
  const modules: ModuleProgress[] = [];

  if (!meeting.modules) return modules;

  const moduleNames = [
    'overview',
    'essentialDetails',
    'leadsAndSales',
    'customerService',
    'operations',
    'reporting',
    'aiAgents',
    'systems',
    'roi',
  ];

  moduleNames.forEach((moduleName) => {
    const moduleData = meeting.modules[moduleName as keyof Meeting['modules']];
    if (moduleData) {
      const fields = Object.keys(moduleData).length;
      const completedFields = Object.values(moduleData).filter(
        (v) =>
          v !== null &&
          v !== undefined &&
          v !== '' &&
          (Array.isArray(v) ? v.length > 0 : true)
      ).length;

      if (completedFields < fields) {
        modules.push({
          moduleId: moduleName,
          name: moduleName,
          hebrewName: getModuleHebrewName(moduleName),
          completed: completedFields,
          total: fields,
          percentage:
            fields > 0 ? Math.round((completedFields / fields) * 100) : 0,
          status:
            completedFields === 0
              ? 'empty'
              : completedFields === fields
                ? 'completed'
                : 'in_progress',
        } as ModuleProgress);
      }
    }
  });

  return modules;
}

/**
 * Get overall progress percentage
 */
function getOverallProgress(meeting: Meeting): number {
  if (!meeting.modules) return 0;

  const moduleNames = [
    'overview',
    'essentialDetails',
    'leadsAndSales',
    'customerService',
    'operations',
    'reporting',
    'aiAgents',
    'systems',
    'roi',
  ];

  let totalFields = 0;
  let completedFields = 0;

  moduleNames.forEach((moduleName) => {
    const moduleData = meeting.modules[moduleName as keyof Meeting['modules']];
    if (moduleData) {
      const fields = Object.keys(moduleData).length;
      const completed = Object.values(moduleData).filter(
        (v) =>
          v !== null &&
          v !== undefined &&
          v !== '' &&
          (Array.isArray(v) ? v.length > 0 : true)
      ).length;

      totalFields += fields;
      completedFields += completed;
    }
  });

  return totalFields > 0
    ? Math.round((completedFields / totalFields) * 100)
    : 0;
}

/**
 * Get Hebrew name for module
 */
function getModuleHebrewName(moduleId: string): string {
  const names: Record<string, string> = {
    overview: 'סקירה כללית',
    essentialDetails: 'איפיון ממוקד',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    operations: 'תפעול פנימי',
    reporting: 'דוחות והתראות',
    aiAgents: 'סוכני AI',
    systems: 'מערכות וטכנולוגיה',
    roi: 'ROI וכימות',
  };
  return names[moduleId] || moduleId;
}

/**
 * Calculate client progress summary
 */
export function calculateClientProgressSummary(
  meeting: Meeting
): ClientProgressSummary {
  const overallProgress = getOverallProgress(meeting);
  const remainingTasks = calculateRemainingTasks(meeting);
  const purchasedServices = getPurchasedServices(meeting);
  const nextActions = generateNextActions(meeting);

  // Determine phase statuses
  let discoveryStatus: 'completed' | 'in_progress' | 'not_started' =
    'not_started';
  let implementationStatus:
    | 'completed'
    | 'in_progress'
    | 'waiting'
    | 'not_started' = 'not_started';
  let developmentStatus:
    | 'completed'
    | 'in_progress'
    | 'waiting'
    | 'not_started' = 'not_started';

  // Discovery status
  if (overallProgress === 100) {
    discoveryStatus = 'completed';
  } else if (overallProgress > 0) {
    discoveryStatus = 'in_progress';
  }

  // Implementation status
  if (meeting.phase === 'implementation_spec') {
    implementationStatus = 'in_progress';
  } else if (meeting.phase === 'development' || meeting.phase === 'completed') {
    implementationStatus = 'completed';
  } else if (discoveryStatus === 'completed') {
    implementationStatus = 'waiting';
  }

  // Development status
  if (meeting.phase === 'development') {
    developmentStatus = 'in_progress';
  } else if (meeting.phase === 'completed') {
    developmentStatus = 'completed';
  } else if (implementationStatus === 'completed') {
    developmentStatus = 'waiting';
  }

  return {
    overallProgress,
    phaseStatus: {
      discovery: discoveryStatus,
      implementation: implementationStatus,
      development: developmentStatus,
    },
    remainingTasks,
    purchasedServices,
    nextActions,
  };
}
