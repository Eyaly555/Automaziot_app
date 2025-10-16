import * as ExcelJS from 'exceljs';
import { Meeting, PainPoint, ROIModule, SelectedService } from '../types';
import type { DevelopmentTask, Sprint, Blocker } from '../types/phase3';
import type {
  DetailedSystemSpec,
  IntegrationFlow,
  DetailedAIAgentSpec,
} from '../types/phase2';

/**
 * Calculate module completion percentage
 */
function calculateModuleCompletion(
  moduleData: Record<string, unknown>
): number {
  if (!moduleData) return 0;

  let filledFields = 0;
  let totalFields = 0;

  Object.values(moduleData).forEach((value: unknown) => {
    totalFields++;
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        filledFields++;
      } else if (
        typeof value === 'object' &&
        value !== null &&
        Object.keys(value as Record<string, unknown>).length > 0
      ) {
        filledFields++;
      } else if (typeof value !== 'object') {
        filledFields++;
      }
    }
  });

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

/**
 * Get friendly module name
 */
function getModuleName(moduleKey: string): string {
  const names: Record<string, string> = {
    overview: 'סקירה כללית',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    operations: 'תפעול',
    reporting: 'דיווח',
    aiAgents: 'סוכני AI',
    systems: 'מערכות',
    roi: 'ROI',
    proposal: 'הצעת שירות',
  };
  return names[moduleKey] || moduleKey;
}

/**
 * Calculate hours saved from ROI data
 */
function calculateHoursSaved(roi: ROIModule | undefined): number {
  if (
    !roi?.currentCosts?.manualHours ||
    !roi?.timeSavings?.automationPotential
  ) {
    return 0;
  }

  const manualHours = parseFloat(roi.currentCosts.manualHours);
  const automationPercent =
    parseFloat(roi.timeSavings.automationPotential) / 100;
  const weeklyHoursSaved = manualHours * automationPercent;

  return Math.round(weeklyHoursSaved * 4.33); // Monthly
}

/**
 * Calculate monthly savings from ROI data
 */
function calculateMonthlySavings(roi: ROIModule | undefined): number {
  if (
    !roi?.currentCosts?.manualHours ||
    !roi?.currentCosts?.hourlyCost ||
    !roi?.timeSavings?.automationPotential
  ) {
    return 0;
  }

  const hoursSaved = calculateHoursSaved(roi);
  const hourlyCost = parseFloat(roi.currentCosts.hourlyCost);

  return Math.round(hoursSaved * hourlyCost);
}

/**
 * Calculate payback period in months
 */
function calculatePaybackPeriod(roi: ROIModule | undefined): number {
  const investment = roi?.investment?.budgetAvailable
    ? parseFloat(roi.investment.budgetAvailable)
    : 0;
  const monthlySavings = calculateMonthlySavings(roi);

  if (monthlySavings === 0) return 0;

  return Math.round(investment / monthlySavings);
}

/**
 * Calculate 12-month ROI percentage
 */
function calculate12MonthROI(roi: ROIModule | undefined): number {
  const investment = roi?.investment?.budgetAvailable
    ? parseFloat(roi.investment.budgetAvailable)
    : 0;
  const monthlySavings = calculateMonthlySavings(roi);
  const annualSavings = monthlySavings * 12;

  if (investment === 0) return 0;

  return Math.round(((annualSavings - investment) / investment) * 100);
}

/**
 * Export Discovery phase data to Excel
 */
export async function exportDiscoveryToExcel(meeting: Meeting): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Overview
  const overviewSheet = workbook.addWorksheet('סקירה כללית');
  const overviewData = [
    ['Discovery Assistant - סיכום פגישת גילוי'],
    [''],
    ['שם הלקוח', meeting.clientName],
    ['תאריך פגישה', new Date(meeting.date).toLocaleDateString('he-IL')],
    ['שלב', meeting.phase === 'discovery' ? 'גילוי' : meeting.phase],
    ['סטטוס', meeting.status || 'N/A'],
    [''],
    ['פרטי עסק'],
    ['סוג עסק', meeting.modules.overview?.businessType || 'לא צוין'],
    ['מספר עובדים', meeting.modules.operations?.hr?.employeeCount || 'לא צוין'],
    ['אתגר מרכזי', meeting.modules.overview?.mainChallenge || 'לא צוין'],
    [''],
    ['סיכום השלמת מודולים'],
    ['מודול', 'אחוז השלמה'],
    ...Object.keys(meeting.modules).map((key: string) => [
      getModuleName(key),
      `${calculateModuleCompletion(meeting.modules[key as keyof typeof meeting.modules] as Record<string, unknown>)}%`,
    ]),
  ];

  overviewData.forEach((row, rowIndex) => {
    const excelRow = overviewSheet.getRow(rowIndex + 1);
    row.forEach((cell, cellIndex) => {
      excelRow.getCell(cellIndex + 1).value = cell;
    });
  });

  // Set column widths
  overviewSheet.columns = [{ width: 25 }, { width: 40 }];

  // Sheet 2: Pain Points
  const painPointsSheet = workbook.addWorksheet('נקודות כאב');
  const painPoints = meeting.painPoints || [];
  const painPointsData = [
    ['נקודות כאב מזוהות'],
    [''],
    ['מודול', 'תת-מודול', 'תיאור', 'חומרה', 'חיסכון חודשי משוער'],
    ...painPoints.map((pp: PainPoint) => [
      getModuleName(pp.module),
      pp.subModule || '',
      pp.description,
      pp.severity === 'critical'
        ? 'קריטי'
        : pp.severity === 'high'
          ? 'גבוה'
          : pp.severity === 'medium'
            ? 'בינוני'
            : 'נמוך',
      pp.potentialSaving
        ? `₪${pp.potentialSaving.toLocaleString()}`
        : 'לא צוין',
    ]),
  ];

  if (painPoints.length === 0) {
    painPointsData.push(['אין נקודות כאב רשומות', '', '', '', '']);
  }

  painPointsData.forEach((row, rowIndex) => {
    const excelRow = painPointsSheet.getRow(rowIndex + 1);
    row.forEach((cell, cellIndex) => {
      excelRow.getCell(cellIndex + 1).value = cell;
    });
  });

  painPointsSheet.columns = [
    { width: 20 },
    { width: 20 },
    { width: 50 },
    { width: 15 },
    { width: 20 },
  ];

  // Sheet 3: ROI Summary
  const roiSheet = workbook.addWorksheet('ניתוח ROI');
  const roi = meeting.modules.roi;
  const manualHours = roi?.currentCosts?.manualHours
    ? parseFloat(roi.currentCosts.manualHours)
    : 0;
  const hourlyCost = roi?.currentCosts?.hourlyCost
    ? parseFloat(roi.currentCosts.hourlyCost)
    : 0;
  const automationPotential = roi?.timeSavings?.automationPotential
    ? parseFloat(roi.timeSavings.automationPotential)
    : 0;

  const roiData = [
    ['ניתוח ROI'],
    [''],
    ['עלויות נוכחיות'],
    ['שעות ידניות בשבוע', manualHours],
    ['עלות לשעה (₪)', hourlyCost],
    ['עלות חודשית (₪)', manualHours * hourlyCost * 4.33],
    [''],
    ['חיסכון צפוי'],
    ['פוטנציאל אוטומציה (%)', automationPotential],
    ['שעות חיסכון בחודש', calculateHoursSaved(roi)],
    ['חיסכון כספי בחודש (₪)', calculateMonthlySavings(roi).toLocaleString()],
    [''],
    ['מדדי ROI'],
    ['טווח השקעה', roi?.investment?.range || 'לא צוין'],
    ['תקופת החזר (חודשים)', calculatePaybackPeriod(roi)],
    ['ROI ל-12 חודשים (%)', calculate12MonthROI(roi)],
  ];

  roiData.forEach((row, rowIndex) => {
    const excelRow = roiSheet.getRow(rowIndex + 1);
    row.forEach((cell, cellIndex) => {
      excelRow.getCell(cellIndex + 1).value = cell;
    });
  });

  roiSheet.columns = [{ width: 30 }, { width: 25 }];

  // Sheet 4: Proposed Services
  const servicesSheet = workbook.addWorksheet('שירותים מוצעים');
  const services = meeting.modules.proposal?.selectedServices || [];
  const servicesData = [
    ['שירותים מוצעים'],
    [''],
    ['שם השירות', 'קטגוריה', 'מחיר (₪)', 'ימי עבודה משוערים', 'עדיפות'],
    ...services.map((service: SelectedService) => [
      service.name,
      service.category,
      service.customPrice
        ? `₪${service.customPrice.toLocaleString()}`
        : service.basePrice
          ? `₪${service.basePrice.toLocaleString()}`
          : 'הצעת מחיר',
      service.customDuration || service.estimatedDays || 'TBD',
      service.relevanceScore ? `${service.relevanceScore}/10` : 'בינוני',
    ]),
  ];

  if (services.length === 0) {
    servicesData.push(['אין שירותים נבחרים', '', '', '', '']);
  } else {
    servicesData.push(
      [''],
      [
        'סה"כ השקעה',
        '',
        `₪${services.reduce((sum: number, s: SelectedService) => sum + (s.customPrice ?? s.basePrice ?? 0), 0).toLocaleString()}`,
      ]
    );
    servicesData.push([
      'סה"כ משך',
      '',
      `${services.reduce((sum: number, s: SelectedService) => sum + (s.customDuration ?? s.estimatedDays ?? 0), 0)} ימים`,
    ]);
  }

  servicesData.forEach((row, rowIndex) => {
    const excelRow = servicesSheet.getRow(rowIndex + 1);
    row.forEach((cell, cellIndex) => {
      excelRow.getCell(cellIndex + 1).value = cell;
    });
  });

  servicesSheet.columns = [
    { width: 40 },
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 15 },
  ];

  // Sheet 5: Systems Inventory
  const systemsSheet = workbook.addWorksheet('מערכות');
  const detailedSystems = meeting.modules.systems?.detailedSystems || [];
  const currentSystems = meeting.modules.systems?.currentSystems || [];
  const systemsToExport =
    detailedSystems.length > 0 ? detailedSystems : currentSystems;

  const systemsData: (string | number)[][] = [
    ['מלאי מערכות'],
    [''],
    ['שם המערכת', 'קטגוריה', 'גרסה', 'גישת API', 'שביעות רצון'],
    ...(systemsToExport as (string | Record<string, unknown>)[]).map((sys) => {
      if (typeof sys === 'string') {
        return [sys, 'לא צוין', 'לא צוין', 'לא ידוע', 'לא דורג'];
      }
      const systemObj = sys as Record<string, unknown>;
      return [
        (systemObj.specificSystem as string) ||
          (systemObj.systemName as string) ||
          (systemObj.name as string) ||
          'לא ידוע',
        (systemObj.category as string) || 'לא צוין',
        (systemObj.version as string) || 'לא צוין',
        (systemObj.apiAccess as string) || 'לא ידוע',
        systemObj.satisfactionScore
          ? `${systemObj.satisfactionScore}/5`
          : 'לא דורג',
      ];
    }),
  ];

  if (systemsToExport.length === 0) {
    systemsData.push(['אין מערכות רשומות', '', '', '', '']);
  }

  systemsData.forEach((row, rowIndex) => {
    const excelRow = systemsSheet.getRow(rowIndex + 1);
    row.forEach((cell, cellIndex) => {
      excelRow.getCell(cellIndex + 1).value = cell;
    });
  });

  systemsSheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 15 },
    { width: 20 },
    { width: 15 },
  ];

  // Export file
  const timestamp = new Date().toISOString().split('T')[0];
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Discovery_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export Implementation Spec phase data to Excel
 */
export function exportImplementationSpecToExcel(meeting: Meeting): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
  const overviewData = [
    ['מפרט יישום טכני - Implementation Specification'],
    [''],
    ['שם הלקוח', meeting.clientName],
    ['מזהה פגישה', meeting.meetingId],
    ['תאריך', new Date(meeting.date).toLocaleDateString('he-IL')],
    ['שלב', meeting.phase],
    ['סטטוס', meeting.status || 'N/A'],
    [''],
    ['סיכום התקדמות'],
    ['סה"כ שעות משוערות', meeting.implementationSpec?.totalEstimatedHours || 0],
    ['אחוז השלמה', `${meeting.implementationSpec?.completionPercentage || 0}%`],
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  wsOverview['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // Sheet 2: Systems
  const systems = meeting.implementationSpec?.systems || [];
  const systemsData: (string | number)[][] = [
    ['Systems Deep Dive'],
    [''],
    [
      'System Name',
      'Authentication Method',
      'API Endpoint',
      'Modules Count',
      'Migration Required',
      'Estimated Hours',
    ],
  ];

  systems.forEach((sys: DetailedSystemSpec) => {
    systemsData.push([
      sys.systemName,
      sys.authentication?.method || 'N/A',
      sys.authentication?.apiEndpoint || 'N/A',
      sys.modules?.length || 0,
      sys.dataMigration?.required ? 'Yes' : 'No',
      0, // estimatedHours is not part of DetailedSystemSpec - would need to be calculated
    ]);
  });

  if (systems.length === 0) {
    systemsData.push(['No systems defined', '', '', '', '', '']);
  }

  const wsSystems = XLSX.utils.aoa_to_sheet(systemsData);
  wsSystems['!cols'] = [
    { wch: 30 },
    { wch: 25 },
    { wch: 40 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSystems, 'Systems');

  // Sheet 3: Integrations
  const integrations = meeting.implementationSpec?.integrations || [];
  const integrationsData: (string | number)[][] = [
    ['Integration Flows'],
    [''],
    [
      'Flow Name',
      'Source',
      'Target',
      'Trigger Type',
      'Frequency',
      'Steps Count',
      'Estimated Hours',
    ],
  ];

  integrations.forEach((flow: IntegrationFlow) => {
    integrationsData.push([
      flow.name,
      flow.sourceSystem,
      flow.targetSystem,
      flow.trigger?.type || 'N/A',
      flow.frequency || 'N/A',
      flow.steps?.length || 0,
      flow.estimatedSetupTime ? Math.round(flow.estimatedSetupTime / 60) : 0, // Convert minutes to hours
    ]);
  });

  if (integrations.length === 0) {
    integrationsData.push([
      'No integration flows defined',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  }

  const wsIntegrations = XLSX.utils.aoa_to_sheet(integrationsData);
  wsIntegrations['!cols'] = [
    { wch: 35 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, wsIntegrations, 'Integrations');

  // Sheet 4: AI Agents
  const aiAgents = meeting.implementationSpec?.aiAgents || [];
  const aiAgentsData: (string | number)[][] = [
    ['AI Agents Specifications'],
    [''],
    [
      'Agent Name',
      'Department',
      'Model',
      'Provider',
      'Knowledge Sources',
      'Integrations',
      'Estimated Hours',
    ],
  ];

  aiAgents.forEach((agent: DetailedAIAgentSpec) => {
    aiAgentsData.push([
      agent.name,
      agent.department || 'N/A',
      agent.model?.modelName || 'N/A',
      agent.model?.provider || 'N/A',
      agent.knowledgeBase?.sources?.length || 0,
      [
        agent.integrations?.crmEnabled && 'CRM',
        agent.integrations?.emailEnabled && 'Email',
        agent.integrations?.calendarEnabled && 'Calendar',
      ]
        .filter(Boolean)
        .join(', ') || 'None',
      0, // estimatedHours is not part of DetailedAIAgentSpec - would need to be calculated
    ]);
  });

  if (aiAgents.length === 0) {
    aiAgentsData.push(['No AI agents defined', '', '', '', '', '', '']);
  }

  const wsAIAgents = XLSX.utils.aoa_to_sheet(aiAgentsData);
  wsAIAgents['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 18 },
    { wch: 25 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, wsAIAgents, 'AI Agents');

  // Export file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(
    wb,
    `Implementation_Spec_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.xlsx`
  );
}

/**
 * Export Development phase data to Excel
 */
export function exportDevelopmentToExcel(meeting: Meeting): void {
  const wb = XLSX.utils.book_new();
  const tasks = meeting.developmentTracking?.tasks || [];
  const sprints = meeting.developmentTracking?.sprints || [];
  const blockers = meeting.developmentTracking?.blockers || [];

  // Sheet 1: Task List
  const taskData: (string | number)[][] = [
    ['Development Task List'],
    [''],
    [
      'ID',
      'Title',
      'Type',
      'Status',
      'Priority',
      'Estimated Hours',
      'Actual Hours',
      'Assignee',
      'Sprint',
      'System',
    ],
  ];

  tasks.forEach((task: DevelopmentTask) => {
    taskData.push([
      task.id,
      task.title,
      task.type,
      task.status,
      task.priority,
      task.estimatedHours,
      task.actualHours || 0,
      task.assignedTo || 'Unassigned',
      task.sprint || 'Backlog',
      task.relatedSpec?.specName || 'N/A',
    ]);
  });

  if (tasks.length === 0) {
    taskData.push(['No tasks defined', '', '', '', '', '', '', '', '', '']);
  }

  // Add summary
  const completedTasks = tasks.filter(
    (t: DevelopmentTask) => t.status === 'done'
  ).length;
  const totalEstimated = tasks.reduce(
    (sum: number, t: DevelopmentTask) => sum + (t.estimatedHours || 0),
    0
  );
  const totalActual = tasks.reduce(
    (sum: number, t: DevelopmentTask) => sum + (t.actualHours || 0),
    0
  );

  taskData.push([]);
  taskData.push(['Summary']);
  taskData.push(['Total Tasks', tasks.length]);
  taskData.push([
    'Completed',
    completedTasks,
    '',
    `${Math.round((completedTasks / (tasks.length || 1)) * 100)}%`,
  ]);
  taskData.push(['Total Estimated Hours', totalEstimated]);
  taskData.push(['Total Actual Hours', totalActual]);
  taskData.push([
    'Variance',
    totalActual - totalEstimated,
    '',
    `${totalEstimated > 0 ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100) : 0}%`,
  ]);

  const wsTasks = XLSX.utils.aoa_to_sheet(taskData);
  wsTasks['!cols'] = [
    { wch: 15 },
    { wch: 50 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTasks, 'Task List');

  // Sheet 2: Sprint Summary
  const sprintData: (string | number)[][] = [
    ['Sprint Summary'],
    [''],
    [
      'Sprint Name',
      'Start Date',
      'End Date',
      'Goal',
      'Status',
      'Total Tasks',
      'Completed',
      'In Progress',
      'Blocked',
    ],
  ];

  sprints.forEach((sprint: Sprint) => {
    const sprintTasks = tasks.filter(
      (t: DevelopmentTask) => t.sprint === sprint.name
    );
    const completed = sprintTasks.filter(
      (t: DevelopmentTask) => t.status === 'done'
    ).length;
    const inProgress = sprintTasks.filter(
      (t: DevelopmentTask) => t.status === 'in_progress'
    ).length;
    const blocked = sprintTasks.filter(
      (t: DevelopmentTask) => t.status === 'blocked'
    ).length;

    sprintData.push([
      sprint.name,
      new Date(sprint.startDate).toLocaleDateString('en-US'),
      new Date(sprint.endDate).toLocaleDateString('en-US'),
      sprint.goal || 'N/A',
      sprint.status,
      sprintTasks.length,
      completed,
      inProgress,
      blocked,
    ]);
  });

  if (sprints.length === 0) {
    sprintData.push(['No sprints defined', '', '', '', '', '', '', '', '']);
  }

  const wsSprints = XLSX.utils.aoa_to_sheet(sprintData);
  wsSprints['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 40 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSprints, 'Sprint Summary');

  // Sheet 3: Blockers
  const blockerData: (string | number)[][] = [
    ['Active Blockers'],
    [''],
    [
      'Blocker ID',
      'Task ID',
      'Reason',
      'Severity',
      'Reported Date',
      'Status',
      'Resolution',
    ],
  ];

  blockers.forEach((blocker: Blocker) => {
    blockerData.push([
      blocker.id,
      blocker.taskId,
      blocker.description, // Fixed: Blocker has 'description', not 'reason'
      blocker.severity,
      blocker.reportedAt
        ? new Date(blocker.reportedAt).toLocaleDateString('en-US')
        : 'N/A', // Fixed: Blocker has 'reportedAt', not 'reportedDate'
      blocker.resolved ? 'Resolved' : 'Active',
      blocker.resolution || 'Pending',
    ]);
  });

  if (blockers.length === 0) {
    blockerData.push(['No blockers reported', '', '', '', '', '', '']);
  }

  const wsBlockers = XLSX.utils.aoa_to_sheet(blockerData);
  wsBlockers['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 50 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, wsBlockers, 'Blockers');

  // Sheet 4: Tasks by System
  const tasksBySystem: Record<string, DevelopmentTask[]> = {};
  tasks.forEach((task: DevelopmentTask) => {
    const systemName = task.relatedSpec?.specName || 'Unassigned';
    if (!tasksBySystem[systemName]) {
      tasksBySystem[systemName] = [];
    }
    tasksBySystem[systemName].push(task);
  });

  const systemTasksData: (string | number)[][] = [
    ['Tasks by System/Component'],
    [''],
    [
      'System',
      'Total Tasks',
      'Completed',
      'In Progress',
      'Blocked',
      'Todo',
      'Completion %',
    ],
  ];

  Object.entries(tasksBySystem).forEach(
    ([system, systemTasks]: [string, DevelopmentTask[]]) => {
      const completed = systemTasks.filter(
        (t: DevelopmentTask) => t.status === 'done'
      ).length;
      const inProgress = systemTasks.filter(
        (t: DevelopmentTask) => t.status === 'in_progress'
      ).length;
      const blocked = systemTasks.filter(
        (t: DevelopmentTask) => t.status === 'blocked'
      ).length;
      const todo = systemTasks.filter(
        (t: DevelopmentTask) => t.status === 'todo'
      ).length;

      systemTasksData.push([
        system,
        systemTasks.length,
        completed,
        inProgress,
        blocked,
        todo,
        `${Math.round((completed / systemTasks.length) * 100)}%`,
      ]);
    }
  );

  const wsSystemTasks = XLSX.utils.aoa_to_sheet(systemTasksData);
  wsSystemTasks['!cols'] = [
    { wch: 40 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSystemTasks, 'Tasks by System');

  // Export file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(
    wb,
    `Development_Tasks_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.xlsx`
  );
}
