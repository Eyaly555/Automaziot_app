import type { Meeting, MeetingPhase, Modules } from '../types';
import type { ImplementationSpecData } from '../types';
import type { DevelopmentTracking } from '../types/phase3';
import { formatDate } from './formatters';

/**
 * Context types for generating Zoho notes
 */
export type NoteContextType =
  | 'dashboard'
  | 'module'
  | 'summary'
  | 'proposal'
  | 'requirements'
  | 'approval'
  | 'phase2_dashboard'
  | 'phase2_system'
  | 'phase2_integration'
  | 'phase2_agent'
  | 'phase2_service'
  | 'phase3_dashboard'
  | 'phase3_sprint'
  | 'phase3_system'
  | 'phase3_blockers';

/**
 * Context for generating a note
 */
export interface NoteGenerationContext {
  contextType: NoteContextType;
  meeting: Meeting;
  moduleId?: keyof Modules;
  moduleData?: any;
  specificId?: string; // For specific system/integration/agent ID
  additionalData?: any;
}

/**
 * Generated note content
 */
export interface GeneratedNote {
  title: string;
  content: string;
}

/**
 * Generate a Zoho note based on context
 */
export function generateContextualNote(
  context: NoteGenerationContext
): GeneratedNote {
  const { contextType, meeting } = context;

  switch (contextType) {
    case 'dashboard':
      return generateDashboardNote(meeting);

    case 'module':
      return generateModuleNote(meeting, context.moduleId!, context.moduleData);

    case 'summary':
      return generateSummaryNote(meeting);

    case 'proposal':
      return generateProposalNote(meeting);

    case 'requirements':
      return generateRequirementsNote(meeting);

    case 'approval':
      return generateApprovalNote(meeting);

    case 'phase2_dashboard':
      return generatePhase2DashboardNote(meeting);

    case 'phase2_system':
      return generatePhase2SystemNote(meeting, context.specificId!);

    case 'phase2_integration':
      return generatePhase2IntegrationNote(meeting, context.specificId!);

    case 'phase2_agent':
      return generatePhase2AgentNote(meeting, context.specificId!);

    case 'phase2_service':
      return generatePhase2ServiceNote(meeting, context.specificId!);

    case 'phase3_dashboard':
      return generatePhase3DashboardNote(meeting);

    case 'phase3_sprint':
      return generatePhase3SprintNote(meeting);

    case 'phase3_system':
      return generatePhase3SystemNote(meeting);

    case 'phase3_blockers':
      return generatePhase3BlockersNote(meeting);

    default:
      return generateGenericNote(meeting);
  }
}

// ============================================================================
// Phase 1: Discovery Note Generators
// ============================================================================

/**
 * Generate dashboard summary note
 */
function generateDashboardNote(meeting: Meeting): GeneratedNote {
  const overallProgress = calculateOverallProgress(meeting);
  const painPointsCount = meeting.painPoints?.length || 0;
  const timer = meeting.timer || 0;
  const timerMinutes = Math.floor(timer / 60);

  const contentParts = [
    '=== סטטוס כללי של הפרויקט ===',
    `לקוח: ${meeting.clientName}`,
    `תאריך: ${formatDate(meeting.date)}`,
    `שלב: ${getPhaseLabel(meeting.phase)}`,
    '',
    '=== התקדמות ===',
    `אחוז השלמה כולל: ${overallProgress}%`,
    `זמן שיחה מצטבר: ${timerMinutes} דקות`,
    '',
    '=== נקודות כאב ===',
    painPointsCount > 0
      ? meeting
          .painPoints!.map(
            (pp, i) => `${i + 1}. ${pp.description} (חומרה: ${pp.severity})`
          )
          .join('\n')
      : 'לא זוהו נקודות כאב',
    '',
  ];

  // Add ROI if available
  if (meeting.modules?.roi) {
    const roi = meeting.modules.roi;
    contentParts.push('=== ROI משוער ===');
    if (roi.estimatedMonthlySavings) {
      contentParts.push(
        `חיסכון חודשי משוער: ₪${roi.estimatedMonthlySavings.toLocaleString('he-IL')}`
      );
    }
    if (roi.estimatedImplementationCost) {
      contentParts.push(
        `עלות יישום משוערת: ₪${roi.estimatedImplementationCost.toLocaleString('he-IL')}`
      );
    }
    contentParts.push('');
  }

  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `סיכום Dashboard - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate module-specific note
 */
function generateModuleNote(
  meeting: Meeting,
  moduleId: keyof Modules,
  moduleData: any
): GeneratedNote {
  const moduleName = getModuleName(moduleId);

  const contentParts = [
    `=== ${moduleName} ===`,
    `לקוח: ${meeting.clientName}`,
    '',
    '=== נתונים שהושלמו ===',
  ];

  // Add module-specific data
  if (moduleData && typeof moduleData === 'object') {
    Object.entries(moduleData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const fieldName = formatFieldName(key);
        const fieldValue = formatFieldValue(value);
        contentParts.push(`• ${fieldName}: ${fieldValue}`);
      }
    });
  } else {
    contentParts.push('אין נתונים זמינים למודול זה');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `סיכום ${moduleName} - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate summary tab note
 */
function generateSummaryNote(meeting: Meeting): GeneratedNote {
  const overallProgress = calculateOverallProgress(meeting);

  const contentParts = [
    '=== סיכום מלא של שלב הגילוי ===',
    `לקוח: ${meeting.clientName}`,
    `אחוז השלמה: ${overallProgress}%`,
    '',
    '=== מודולים שהושלמו ===',
  ];

  // List completed modules
  const modules = meeting.modules;
  Object.entries(modules).forEach(([moduleId, moduleData]) => {
    if (moduleData && Object.keys(moduleData).length > 0) {
      const moduleName = getModuleName(moduleId as keyof Modules);
      const completion = calculateModuleCompletion(moduleData);
      contentParts.push(`✓ ${moduleName} (${completion}%)`);
    }
  });

  contentParts.push('');
  contentParts.push('=== נקודות כאב מזוהות ===');
  if (meeting.painPoints && meeting.painPoints.length > 0) {
    meeting.painPoints.forEach((pp, i) => {
      contentParts.push(`${i + 1}. ${pp.description}`);
      contentParts.push(`   חומרה: ${pp.severity}, קטגוריה: ${pp.category}`);
    });
  } else {
    contentParts.push('לא זוהו נקודות כאב');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `סיכום שלב גילוי מלא - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate proposal note
 */
function generateProposalNote(meeting: Meeting): GeneratedNote {
  const proposal = meeting.modules?.planning;

  const contentParts = [
    '=== הצעה מסחרית ===',
    `לקוח: ${meeting.clientName}`,
    '',
  ];

  if (proposal?.selectedServices && proposal.selectedServices.length > 0) {
    contentParts.push('=== שירותים שנבחרו ===');
    proposal.selectedServices.forEach((service: any, i: number) => {
      contentParts.push(`${i + 1}. ${service.name}`);
      if (service.estimatedPrice) {
        contentParts.push(
          `   מחיר: ₪${service.estimatedPrice.toLocaleString('he-IL')}`
        );
      }
      if (service.estimatedHours) {
        contentParts.push(`   זמן ביצוע: ${service.estimatedHours} שעות`);
      }
    });
    contentParts.push('');

    // Calculate totals
    const totalPrice = proposal.selectedServices.reduce(
      (sum: number, s: any) => sum + (s.estimatedPrice || 0),
      0
    );
    const totalHours = proposal.selectedServices.reduce(
      (sum: number, s: any) => sum + (s.estimatedHours || 0),
      0
    );

    contentParts.push('=== סיכום ===');
    contentParts.push(`מחיר כולל: ₪${totalPrice.toLocaleString('he-IL')}`);
    contentParts.push(`זמן ביצוע כולל: ${totalHours} שעות`);
  } else {
    contentParts.push('טרם נבחרו שירותים');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `הצעה מסחרית - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate requirements flow note
 */
function generateRequirementsNote(meeting: Meeting): GeneratedNote {
  return {
    title: `דרישות נוספות - ${meeting.clientName}`,
    content: [
      '=== דרישות שנאספו ===',
      `לקוח: ${meeting.clientName}`,
      '',
      'דרישות ושאלות משלימות שנאספו בשלב איסוף הדרישות.',
      '',
      `--- נוצר ב-${new Date().toLocaleString('he-IL')}`,
    ].join('\n'),
  };
}

/**
 * Generate approval note
 */
function generateApprovalNote(meeting: Meeting): GeneratedNote {
  const status = meeting.status || 'not_started';

  return {
    title: `סטטוס אישור לקוח - ${meeting.clientName}`,
    content: [
      '=== אישור לקוח ===',
      `לקוח: ${meeting.clientName}`,
      `סטטוס: ${getStatusLabel(status)}`,
      '',
      'הערות ושינויים מבוקשים מהלקוח.',
      '',
      `--- נוצר ב-${new Date().toLocaleString('he-IL')}`,
    ].join('\n'),
  };
}

// ============================================================================
// Phase 2: Implementation Spec Note Generators
// ============================================================================

/**
 * Generate Phase 2 dashboard note
 */
function generatePhase2DashboardNote(meeting: Meeting): GeneratedNote {
  const spec = meeting.implementationSpec;

  const contentParts = [
    '=== מפרט יישום - סיכום ===',
    `לקוח: ${meeting.clientName}`,
    '',
  ];

  if (spec) {
    contentParts.push('=== סטטיסטיקות ===');
    contentParts.push(`מערכות: ${spec.systems?.length || 0}`);
    contentParts.push(`אינטגרציות: ${spec.integrations?.length || 0}`);
    contentParts.push(`סוכני AI: ${spec.aiAgents?.length || 0}`);
    contentParts.push(`אוטומציות: ${spec.automations?.length || 0}`);
    contentParts.push(`אחוז השלמה: ${spec.completionPercentage || 0}%`);
    contentParts.push(`שעות משוערות: ${spec.totalEstimatedHours || 0}`);
  } else {
    contentParts.push('טרם הוזן מפרט יישום');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `מפרט יישום - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate Phase 2 system deep dive note
 */
function generatePhase2SystemNote(
  meeting: Meeting,
  systemId: string
): GeneratedNote {
  const spec = meeting.implementationSpec;
  const system = spec?.systems?.find((s: any) => s.id === systemId);

  const contentParts = [
    '=== פירוט מערכת ===',
    `לקוח: ${meeting.clientName}`,
    '',
  ];

  if (system) {
    contentParts.push(`מערכת: ${system.name}`);
    contentParts.push(`תיאור: ${system.description || 'לא זמין'}`);
    contentParts.push(`שעות משוערות: ${system.estimatedHours || 0}`);
    contentParts.push('');

    if (system.features && system.features.length > 0) {
      contentParts.push('=== תכונות ===');
      system.features.forEach((feature: any, i: number) => {
        contentParts.push(`${i + 1}. ${feature.name || feature}`);
      });
    }
  } else {
    contentParts.push('מערכת לא נמצאה');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `מערכת: ${system?.name || systemId} - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate Phase 2 integration note
 */
function generatePhase2IntegrationNote(
  meeting: Meeting,
  integrationId: string
): GeneratedNote {
  const spec = meeting.implementationSpec;
  const integration = spec?.integrations?.find(
    (i: any) => i.id === integrationId
  );

  const contentParts = [
    '=== פירוט אינטגרציה ===',
    `לקוח: ${meeting.clientName}`,
    '',
  ];

  if (integration) {
    contentParts.push(`שם: ${integration.name}`);
    contentParts.push(`מערכת מקור: ${integration.sourceSystem || 'לא זמין'}`);
    contentParts.push(`מערכת יעד: ${integration.targetSystem || 'לא זמין'}`);
    contentParts.push(`תיאור: ${integration.description || 'לא זמין'}`);
  } else {
    contentParts.push('אינטגרציה לא נמצאה');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `אינטגרציה: ${integration?.name || integrationId} - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate Phase 2 AI agent note
 */
function generatePhase2AgentNote(
  meeting: Meeting,
  agentId: string
): GeneratedNote {
  const spec = meeting.implementationSpec;
  const agent = spec?.aiAgents?.find((a: any) => a.id === agentId);

  const contentParts = [
    '=== פירוט סוכן AI ===',
    `לקוח: ${meeting.clientName}`,
    '',
  ];

  if (agent) {
    contentParts.push(`שם: ${agent.name}`);
    contentParts.push(`תיאור: ${agent.description || 'לא זמין'}`);
    contentParts.push(`מודל AI: ${agent.aiModel || 'לא זמין'}`);
    contentParts.push('');

    if (agent.useCases && agent.useCases.length > 0) {
      contentParts.push('=== תרחישי שימוש ===');
      agent.useCases.forEach((useCase: string, i: number) => {
        contentParts.push(`${i + 1}. ${useCase}`);
      });
    }
  } else {
    contentParts.push('סוכן AI לא נמצא');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `סוכן AI: ${agent?.name || agentId} - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate Phase 2 service requirements note
 */
function generatePhase2ServiceNote(
  meeting: Meeting,
  serviceId: string
): GeneratedNote {
  const spec = meeting.implementationSpec;
  const service = spec?.collectedRequirements?.[serviceId];

  const contentParts = [
    '=== דרישות שירות ===',
    `לקוח: ${meeting.clientName}`,
    `שירות: ${serviceId}`,
    '',
  ];

  if (service) {
    contentParts.push('דרישות שנאספו עבור שירות זה.');
    // Add more specific details based on service structure
  } else {
    contentParts.push('טרם נאספו דרישות לשירות זה');
  }

  contentParts.push('');
  contentParts.push(`--- נוצר ב-${new Date().toLocaleString('he-IL')}`);

  return {
    title: `דרישות שירות: ${serviceId} - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

// ============================================================================
// Phase 3: Development Note Generators
// ============================================================================

/**
 * Generate Phase 3 dashboard note
 */
function generatePhase3DashboardNote(meeting: Meeting): GeneratedNote {
  const dev = meeting.developmentTracking;

  const contentParts = [
    '=== Development Progress ===',
    `Client: ${meeting.clientName}`,
    '',
  ];

  if (dev) {
    contentParts.push('=== Statistics ===');
    contentParts.push(`Sprints: ${dev.sprints?.length || 0}`);
    contentParts.push(`Total Tasks: ${dev.tasks?.length || 0}`);

    const completedTasks =
      dev.tasks?.filter((t: any) => t.status === 'done').length || 0;
    contentParts.push(`Completed Tasks: ${completedTasks}`);

    const activeTasks =
      dev.tasks?.filter((t: any) => t.status === 'in_progress').length || 0;
    contentParts.push(`Active Tasks: ${activeTasks}`);

    const blockers =
      dev.tasks?.filter((t: any) => t.blockers && t.blockers.length > 0)
        .length || 0;
    contentParts.push(`Blocked Tasks: ${blockers}`);
  } else {
    contentParts.push('Development tracking not started');
  }

  contentParts.push('');
  contentParts.push(`--- Created at ${new Date().toLocaleString('en-US')}`);

  return {
    title: `Development Progress - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate Phase 3 sprint note
 */
function generatePhase3SprintNote(meeting: Meeting): GeneratedNote {
  const dev = meeting.developmentTracking;
  const currentSprint = dev?.sprints?.find((s: any) => s.status === 'active');

  const contentParts = [
    '=== Sprint Details ===',
    `Client: ${meeting.clientName}`,
    '',
  ];

  if (currentSprint) {
    contentParts.push(`Sprint: ${currentSprint.name}`);
    contentParts.push(`Goal: ${currentSprint.goal || 'N/A'}`);
    contentParts.push(`Status: ${currentSprint.status}`);

    const sprintTasks =
      dev?.tasks?.filter((t: any) => t.sprintId === currentSprint.id) || [];
    contentParts.push(`Tasks: ${sprintTasks.length}`);
  } else {
    contentParts.push('No active sprint');
  }

  contentParts.push('');
  contentParts.push(`--- Created at ${new Date().toLocaleString('en-US')}`);

  return {
    title: `Sprint Progress - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

/**
 * Generate Phase 3 system view note
 */
function generatePhase3SystemNote(meeting: Meeting): GeneratedNote {
  return {
    title: `System Progress - ${meeting.clientName}`,
    content: [
      '=== System Implementation Progress ===',
      `Client: ${meeting.clientName}`,
      '',
      'Detailed system implementation status.',
      '',
      `--- Created at ${new Date().toLocaleString('en-US')}`,
    ].join('\n'),
  };
}

/**
 * Generate Phase 3 blockers note
 */
function generatePhase3BlockersNote(meeting: Meeting): GeneratedNote {
  const dev = meeting.developmentTracking;
  const blockedTasks =
    dev?.tasks?.filter((t: any) => t.blockers && t.blockers.length > 0) || [];

  const contentParts = [
    '=== Active Blockers ===',
    `Client: ${meeting.clientName}`,
    '',
  ];

  if (blockedTasks.length > 0) {
    contentParts.push(`Total Blocked Tasks: ${blockedTasks.length}`);
    contentParts.push('');
    contentParts.push('=== Blockers List ===');

    blockedTasks.forEach((task: any, i: number) => {
      contentParts.push(`${i + 1}. Task: ${task.title}`);
      task.blockers.forEach((blocker: any) => {
        contentParts.push(`   - ${blocker.description} (${blocker.severity})`);
      });
    });
  } else {
    contentParts.push('No active blockers');
  }

  contentParts.push('');
  contentParts.push(`--- Created at ${new Date().toLocaleString('en-US')}`);

  return {
    title: `Blockers Report - ${meeting.clientName}`,
    content: contentParts.join('\n'),
  };
}

// ============================================================================
// Generic Fallback
// ============================================================================

/**
 * Generate generic note
 */
function generateGenericNote(meeting: Meeting): GeneratedNote {
  return {
    title: `הערה - ${meeting.clientName}`,
    content: [
      `=== הערה עבור ${meeting.clientName} ===`,
      '',
      'הערה כללית.',
      '',
      `--- נוצר ב-${new Date().toLocaleString('he-IL')}`,
    ].join('\n'),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate overall progress
 */
function calculateOverallProgress(meeting: Meeting): number {
  if (!meeting.modules) return 0;

  const modules = Object.values(meeting.modules);
  let totalFields = 0;
  let completedFields = 0;

  modules.forEach((moduleData) => {
    if (moduleData && typeof moduleData === 'object') {
      const fields = Object.values(moduleData);
      totalFields += fields.length;

      fields.forEach((value) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          completedFields++;
        }
      });
    }
  });

  return totalFields > 0
    ? Math.round((completedFields / totalFields) * 100)
    : 0;
}

/**
 * Calculate module completion
 */
function calculateModuleCompletion(moduleData: any): number {
  if (!moduleData || typeof moduleData !== 'object') return 0;

  const fields = Object.values(moduleData);
  const completed = fields.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
  ).length;

  return fields.length > 0 ? Math.round((completed / fields.length) * 100) : 0;
}

/**
 * Get Hebrew module name
 */
function getModuleName(moduleId: keyof Modules): string {
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
    planning: 'סיכום ותכנון',
  };
  return names[moduleId] || moduleId;
}

/**
 * Get Hebrew phase label
 */
function getPhaseLabel(phase: MeetingPhase): string {
  const labels: Record<MeetingPhase, string> = {
    discovery: 'גילוי',
    implementation_spec: 'מפרט טכני',
    development: 'Development',
    completed: 'הושלם',
  };
  return labels[phase] || phase;
}

/**
 * Get status label
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_started: 'לא התחיל',
    in_progress: 'בתהליך',
    discovery_complete: 'גילוי הושלם',
    awaiting_client_decision: 'ממתין להחלטת לקוח',
    client_approved: 'לקוח אישר',
    spec_in_progress: 'מפרט בתהליך',
    spec_complete: 'מפרט הושלם',
    development_in_progress: 'פיתוח בתהליך',
    completed: 'הושלם',
  };
  return labels[status] || status;
}

/**
 * Format field name for display
 */
function formatFieldName(fieldName: string): string {
  // Convert camelCase to readable text
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format field value for display
 */
function formatFieldValue(value: any): string {
  if (value === null || value === undefined) return 'לא זמין';
  if (typeof value === 'boolean') return value ? 'כן' : 'לא';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
