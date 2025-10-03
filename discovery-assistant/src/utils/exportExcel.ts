import * as XLSX from 'xlsx';
import { Meeting, PainPoint } from '../types';
import type { DevelopmentTask, Sprint, Blocker } from '../types/phase3';

/**
 * Calculate module completion percentage
 */
function calculateModuleCompletion(moduleData: any): number {
  if (!moduleData) return 0;

  let filledFields = 0;
  let totalFields = 0;

  Object.values(moduleData).forEach(value => {
    totalFields++;
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        filledFields++;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
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
    proposal: 'הצעת שירות'
  };
  return names[moduleKey] || moduleKey;
}

/**
 * Calculate hours saved from ROI data
 */
function calculateHoursSaved(roi: any): number {
  if (!roi?.currentCosts?.manualHours || !roi?.timeSavings?.automationPotential) {
    return 0;
  }

  const manualHours = roi.currentCosts.manualHours;
  const automationPercent = roi.timeSavings.automationPotential / 100;
  const weeklyHoursSaved = manualHours * automationPercent;

  return Math.round(weeklyHoursSaved * 4.33); // Monthly
}

/**
 * Calculate monthly savings from ROI data
 */
function calculateMonthlySavings(roi: any): number {
  if (!roi?.currentCosts?.manualHours || !roi?.currentCosts?.hourlyCost || !roi?.timeSavings?.automationPotential) {
    return 0;
  }

  const hoursSaved = calculateHoursSaved(roi);
  const hourlyCost = roi.currentCosts.hourlyCost;

  return Math.round(hoursSaved * hourlyCost);
}

/**
 * Calculate payback period in months
 */
function calculatePaybackPeriod(roi: any): number {
  const investment = roi?.investment?.estimatedAmount || 0;
  const monthlySavings = calculateMonthlySavings(roi);

  if (monthlySavings === 0) return 0;

  return Math.round(investment / monthlySavings);
}

/**
 * Calculate 12-month ROI percentage
 */
function calculate12MonthROI(roi: any): number {
  const investment = roi?.investment?.estimatedAmount || 0;
  const monthlySavings = calculateMonthlySavings(roi);
  const annualSavings = monthlySavings * 12;

  if (investment === 0) return 0;

  return Math.round(((annualSavings - investment) / investment) * 100);
}

/**
 * Export Discovery phase data to Excel
 */
export function exportDiscoveryToExcel(meeting: Meeting): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
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
    ['מספר עובדים', meeting.modules.overview?.employees || 'לא צוין'],
    ['אתגר מרכזי', meeting.modules.overview?.mainChallenge || 'לא צוין'],
    [''],
    ['סיכום השלמת מודולים'],
    ['מודול', 'אחוז השלמה'],
    ...Object.keys(meeting.modules).map(key => [
      getModuleName(key),
      `${calculateModuleCompletion(meeting.modules[key as keyof typeof meeting.modules])}%`
    ])
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);

  // Set column widths
  wsOverview['!cols'] = [
    { wch: 25 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, wsOverview, 'סקירה כללית');

  // Sheet 2: Pain Points
  const painPoints = meeting.painPoints || [];
  const painPointsData = [
    ['נקודות כאב מזוהות'],
    [''],
    ['מודול', 'תת-מודול', 'תיאור', 'חומרה', 'חיסכון חודשי משוער'],
    ...painPoints.map(pp => [
      getModuleName(pp.module),
      pp.subModule || '',
      pp.description,
      pp.severity === 'critical' ? 'קריטי' : pp.severity === 'high' ? 'גבוה' : pp.severity === 'medium' ? 'בינוני' : 'נמוך',
      pp.potentialSaving ? `₪${pp.potentialSaving.toLocaleString()}` : 'לא צוין'
    ])
  ];

  if (painPoints.length === 0) {
    painPointsData.push(['אין נקודות כאב רשומות', '', '', '', '']);
  }

  const wsPainPoints = XLSX.utils.aoa_to_sheet(painPointsData);
  wsPainPoints['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 50 },
    { wch: 15 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, wsPainPoints, 'נקודות כאב');

  // Sheet 3: ROI Summary
  const roi = meeting.modules.roi;
  const roiData = [
    ['ניתוח ROI'],
    [''],
    ['עלויות נוכחיות'],
    ['שעות ידניות בשבוע', roi?.currentCosts?.manualHours || 0],
    ['עלות לשעה (₪)', roi?.currentCosts?.hourlyCost || 0],
    ['עלות חודשית (₪)', (roi?.currentCosts?.manualHours || 0) * (roi?.currentCosts?.hourlyCost || 0) * 4.33],
    [''],
    ['חיסכון צפוי'],
    ['פוטנציאל אוטומציה (%)', roi?.timeSavings?.automationPotential || 0],
    ['שעות חיסכון בחודש', calculateHoursSaved(roi)],
    ['חיסכון כספי בחודש (₪)', calculateMonthlySavings(roi).toLocaleString()],
    [''],
    ['מדדי ROI'],
    ['טווח השקעה', roi?.investment?.range || 'לא צוין'],
    ['תקופת החזר (חודשים)', calculatePaybackPeriod(roi)],
    ['ROI ל-12 חודשים (%)', calculate12MonthROI(roi)]
  ];

  const wsROI = XLSX.utils.aoa_to_sheet(roiData);
  wsROI['!cols'] = [
    { wch: 30 },
    { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, wsROI, 'ניתוח ROI');

  // Sheet 4: Proposed Services
  const services = meeting.modules.proposal?.selectedServices || [];
  const servicesData = [
    ['שירותים מוצעים'],
    [''],
    ['שם השירות', 'קטגוריה', 'מחיר (₪)', 'ימי עבודה משוערים', 'עדיפות'],
    ...services.map((service: any) => [
      service.name,
      service.category,
      service.pricing ? `₪${service.pricing.toLocaleString()}` : 'הצעת מחיר',
      service.estimatedDays || 'TBD',
      service.priority || 'בינוני'
    ])
  ];

  if (services.length === 0) {
    servicesData.push(['אין שירותים נבחרים', '', '', '', '']);
  } else {
    servicesData.push([''], ['סה"כ השקעה', '', `₪${services.reduce((sum: number, s: any) => sum + (s.pricing || 0), 0).toLocaleString()}`]);
    servicesData.push(['סה"כ משך', '', `${services.reduce((sum: number, s: any) => sum + (s.estimatedDays || 0), 0)} ימים`]);
  }

  const wsServices = XLSX.utils.aoa_to_sheet(servicesData);
  wsServices['!cols'] = [
    { wch: 40 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, wsServices, 'שירותים מוצעים');

  // Sheet 5: Systems Inventory
  const systems = meeting.modules.systems?.currentSystems || [];
  const systemsData = [
    ['מלאי מערכות'],
    [''],
    ['שם המערכת', 'קטגוריה', 'גרסה', 'גישת API', 'שביעות רצון'],
    ...systems.map((sys: any) => [
      sys.systemName || sys.name,
      sys.category || 'לא צוין',
      sys.version || 'לא צוין',
      sys.apiAccess || 'לא ידוע',
      sys.satisfactionScore ? `${sys.satisfactionScore}/5` : 'לא דורג'
    ])
  ];

  if (systems.length === 0) {
    systemsData.push(['אין מערכות רשומות', '', '', '', '']);
  }

  const wsSystems = XLSX.utils.aoa_to_sheet(systemsData);
  wsSystems['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSystems, 'מערכות');

  // Export file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Discovery_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.xlsx`);
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
    ['אחוז השלמה', `${meeting.implementationSpec?.completionPercentage || 0}%`]
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  wsOverview['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // Sheet 2: Systems
  const systems = meeting.implementationSpec?.systems || [];
  const systemsData = [
    ['Systems Deep Dive'],
    [''],
    ['System Name', 'Authentication Method', 'API Endpoint', 'Modules Count', 'Migration Required', 'Estimated Hours']
  ];

  systems.forEach((sys: any) => {
    systemsData.push([
      sys.systemName,
      sys.authentication?.method || 'N/A',
      sys.authentication?.apiEndpoint || 'N/A',
      sys.modules?.length || 0,
      sys.dataMigration?.required ? 'Yes' : 'No',
      sys.estimatedHours || 0
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
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSystems, 'Systems');

  // Sheet 3: Integrations
  const integrations = meeting.implementationSpec?.integrations || [];
  const integrationsData = [
    ['Integration Flows'],
    [''],
    ['Flow Name', 'Source', 'Target', 'Trigger Type', 'Frequency', 'Steps Count', 'Estimated Hours']
  ];

  integrations.forEach((flow: any) => {
    integrationsData.push([
      flow.name,
      flow.sourceSystem,
      flow.targetSystem,
      flow.trigger?.type || 'N/A',
      flow.frequency || 'N/A',
      flow.steps?.length || 0,
      flow.estimatedHours || 0
    ]);
  });

  if (integrations.length === 0) {
    integrationsData.push(['No integration flows defined', '', '', '', '', '', '']);
  }

  const wsIntegrations = XLSX.utils.aoa_to_sheet(integrationsData);
  wsIntegrations['!cols'] = [
    { wch: 35 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, wsIntegrations, 'Integrations');

  // Sheet 4: AI Agents
  const aiAgents = meeting.implementationSpec?.aiAgents || [];
  const aiAgentsData = [
    ['AI Agents Specifications'],
    [''],
    ['Agent Name', 'Department', 'Model', 'Provider', 'Knowledge Sources', 'Integrations', 'Estimated Hours']
  ];

  aiAgents.forEach((agent: any) => {
    aiAgentsData.push([
      agent.name,
      agent.department || 'N/A',
      agent.model?.modelName || 'N/A',
      agent.model?.provider || 'N/A',
      agent.knowledgeBase?.sources?.length || 0,
      [
        agent.integrations?.crmEnabled && 'CRM',
        agent.integrations?.emailEnabled && 'Email',
        agent.integrations?.calendarEnabled && 'Calendar'
      ].filter(Boolean).join(', ') || 'None',
      agent.estimatedHours || 0
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
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, wsAIAgents, 'AI Agents');

  // Export file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Implementation_Spec_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.xlsx`);
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
  const taskData = [
    ['Development Task List'],
    [''],
    ['ID', 'Title', 'Type', 'Status', 'Priority', 'Estimated Hours', 'Actual Hours', 'Assignee', 'Sprint', 'System']
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
      task.relatedSpec?.specName || 'N/A'
    ]);
  });

  if (tasks.length === 0) {
    taskData.push(['No tasks defined', '', '', '', '', '', '', '', '', '']);
  }

  // Add summary
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const totalActual = tasks.reduce((sum, t) => sum + t.actualHours, 0);

  taskData.push([]);
  taskData.push(['Summary']);
  taskData.push(['Total Tasks', tasks.length]);
  taskData.push(['Completed', completedTasks, '', `${Math.round((completedTasks / (tasks.length || 1)) * 100)}%`]);
  taskData.push(['Total Estimated Hours', totalEstimated]);
  taskData.push(['Total Actual Hours', totalActual]);
  taskData.push(['Variance', totalActual - totalEstimated, '', `${totalEstimated > 0 ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100) : 0}%`]);

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
    { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, wsTasks, 'Task List');

  // Sheet 2: Sprint Summary
  const sprintData = [
    ['Sprint Summary'],
    [''],
    ['Sprint Name', 'Start Date', 'End Date', 'Goal', 'Status', 'Total Tasks', 'Completed', 'In Progress', 'Blocked']
  ];

  sprints.forEach((sprint: Sprint) => {
    const sprintTasks = tasks.filter((t: DevelopmentTask) => t.sprint === sprint.name);
    const completed = sprintTasks.filter((t: DevelopmentTask) => t.status === 'done').length;
    const inProgress = sprintTasks.filter((t: DevelopmentTask) => t.status === 'in_progress').length;
    const blocked = sprintTasks.filter((t: DevelopmentTask) => t.status === 'blocked').length;

    sprintData.push([
      sprint.name,
      new Date(sprint.startDate).toLocaleDateString('en-US'),
      new Date(sprint.endDate).toLocaleDateString('en-US'),
      sprint.goal || 'N/A',
      sprint.status,
      sprintTasks.length,
      completed,
      inProgress,
      blocked
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
    { wch: 10 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSprints, 'Sprint Summary');

  // Sheet 3: Blockers
  const blockerData = [
    ['Active Blockers'],
    [''],
    ['Blocker ID', 'Task ID', 'Reason', 'Severity', 'Reported Date', 'Status', 'Resolution']
  ];

  blockers.forEach((blocker: Blocker) => {
    blockerData.push([
      blocker.id,
      blocker.taskId,
      blocker.reason,
      blocker.severity,
      new Date(blocker.reportedDate).toLocaleDateString('en-US'),
      blocker.resolved ? 'Resolved' : 'Active',
      blocker.resolution || 'Pending'
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
    { wch: 40 }
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

  const systemTasksData = [
    ['Tasks by System/Component'],
    [''],
    ['System', 'Total Tasks', 'Completed', 'In Progress', 'Blocked', 'Todo', 'Completion %']
  ];

  Object.entries(tasksBySystem).forEach(([system, systemTasks]) => {
    const completed = systemTasks.filter(t => t.status === 'done').length;
    const inProgress = systemTasks.filter(t => t.status === 'in_progress').length;
    const blocked = systemTasks.filter(t => t.status === 'blocked').length;
    const todo = systemTasks.filter(t => t.status === 'todo').length;

    systemTasksData.push([
      system,
      systemTasks.length,
      completed,
      inProgress,
      blocked,
      todo,
      `${Math.round((completed / systemTasks.length) * 100)}%`
    ]);
  });

  const wsSystemTasks = XLSX.utils.aoa_to_sheet(systemTasksData);
  wsSystemTasks['!cols'] = [
    { wch: 40 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSystemTasks, 'Tasks by System');

  // Export file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Development_Tasks_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.xlsx`);
}
