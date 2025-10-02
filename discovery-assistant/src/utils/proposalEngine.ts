import { Meeting } from '../types';
import { ProposedService, ProposalSummary } from '../types/proposal';
import { SERVICES_DATABASE } from '../config/servicesDatabase';

/**
 * Proposal Engine - Analyzes meeting data and suggests relevant services
 * This is the brain that reads all the filled data and proposes specific solutions
 */

interface SuggestionContext {
  service: typeof SERVICES_DATABASE[0];
  reason: string;
  reasonHe: string;
  relevanceScore: number;
  dataSource: string[];
  relatedData?: any;
}

export const generateProposal = (meeting: Meeting): {
  summary: ProposalSummary;
  proposedServices: ProposedService[];
} => {
  const suggestions: SuggestionContext[] = [];

  // Analyze each module and suggest services
  analyzeLeadsModule(meeting, suggestions);
  analyzeCustomerServiceModule(meeting, suggestions);
  analyzeOperationsModule(meeting, suggestions);
  analyzeReportingModule(meeting, suggestions);
  analyzeSystemsModule(meeting, suggestions);
  analyzeAIModule(meeting, suggestions);
  analyzeROIModule(meeting, suggestions);

  // Convert suggestions to ProposedService format
  const proposedServices: ProposedService[] = suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map(suggestion => ({
      ...suggestion.service,
      reasonSuggested: suggestion.reason,
      reasonSuggestedHe: suggestion.reasonHe,
      relevanceScore: suggestion.relevanceScore,
      dataSource: suggestion.dataSource,
      relatedData: suggestion.relatedData
    }));

  // Generate summary
  const summary = generateSummary(meeting, proposedServices);

  return { summary, proposedServices };
};

// ==================== MODULE ANALYZERS ====================

const analyzeLeadsModule = (meeting: Meeting, suggestions: SuggestionContext[]) => {
  const leads = meeting.modules?.leadsAndSales;
  if (!leads) return;

  // Count lead sources
  const leadSources = leads.leadSources || [];
  const totalLeadVolume = leadSources.reduce((sum, source) => sum + (source.volumePerMonth || 0), 0);

  // 1. If has Facebook leads → suggest Facebook to CRM automation
  const hasFacebookLeads = leadSources.some(s => s.channel === 'facebook' && (s.volumePerMonth || 0) > 20);
  if (hasFacebookLeads) {
    const fbLeads = leadSources.find(s => s.channel === 'facebook');
    addSuggestion(suggestions, 'auto-lead-response', {
      reason: `You have ${fbLeads?.volumePerMonth} leads/month from Facebook - save 10 hours/week`,
      reasonHe: `יש לך ${fbLeads?.volumePerMonth} לידים/חודש מפייסבוק - חיסכון של 10 שעות/שבוע`,
      relevanceScore: 9,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { channel: 'facebook', volume: fbLeads?.volumePerMonth }
    });
  }

  // 2. If has many leads (50+) → suggest full lead workflow
  if (totalLeadVolume >= 50) {
    addSuggestion(suggestions, 'auto-lead-workflow', {
      reason: `Managing ${totalLeadVolume} leads/month manually - full workflow will save 15-20 hours/week`,
      reasonHe: `ניהול ${totalLeadVolume} לידים/חודש ידנית - workflow מלא יחסוך 15-20 שעות/שבוע`,
      relevanceScore: 10,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { totalLeadVolume }
    });
  }

  // 3. If dropOffRate > 30% → suggest smart follow-up
  const dropOffRate = leads.followUp?.dropOffRate || 0;
  if (dropOffRate > 30) {
    addSuggestion(suggestions, 'auto-smart-followup', {
      reason: `${dropOffRate}% of leads drop off - smart follow-up can recover 20-30% of them`,
      reasonHe: `${dropOffRate}% מהלידים נושרים - מעקבים חכמים יכולים להחזיר 20-30% מהם`,
      relevanceScore: 9,
      dataSource: ['leadsAndSales.followUp'],
      relatedData: { dropOffRate }
    });
  }

  // 4. If has appointments with high cancellation → suggest reminders
  const cancellationRate = leads.appointments?.cancellationRate || 0;
  const noShowRate = leads.appointments?.noShowRate || 0;
  if (cancellationRate > 15 || noShowRate > 10) {
    addSuggestion(suggestions, 'auto-appointment-reminders', {
      reason: `${cancellationRate}% cancellation + ${noShowRate}% no-show - reminders will reduce by 50%`,
      reasonHe: `${cancellationRate}% ביטולים + ${noShowRate}% אי-הגעה - תזכורות יפחיתו ב-50%`,
      relevanceScore: 8,
      dataSource: ['leadsAndSales.appointments'],
      relatedData: { cancellationRate, noShowRate }
    });
  }

  // 5. If speed to lead is slow → suggest immediate response
  const duringHours = leads.speedToLead?.duringBusinessHours;
  if (duringHours && duringHours !== 'immediate') {
    addSuggestion(suggestions, 'auto-sms-whatsapp', {
      reason: 'Not responding immediately to leads - instant SMS/WhatsApp can increase conversion by 30%',
      reasonHe: 'אין מענה מיידי ללידים - SMS/WhatsApp מיידי יכול להעלות המרה ב-30%',
      relevanceScore: 9,
      dataSource: ['leadsAndSales.speedToLead'],
      relatedData: { currentSpeed: duringHours }
    });
  }

  // 6. If using website forms → suggest CRM auto-update
  const hasWebsite = leadSources.some(s => s.channel === 'website');
  if (hasWebsite) {
    addSuggestion(suggestions, 'auto-crm-update', {
      reason: 'Website leads need manual CRM entry - automation saves 5-8 hours/week',
      reasonHe: 'לידים מהאתר נכנסים ידנית ל-CRM - אוטומציה תחסוך 5-8 שעות/שבוע',
      relevanceScore: 8,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { channel: 'website' }
    });
  }

  // 7. If has many lead sources → suggest AI lead qualifier
  if (leadSources.length >= 4 && totalLeadVolume >= 80) {
    addSuggestion(suggestions, 'ai-lead-qualifier', {
      reason: `${leadSources.length} lead sources with ${totalLeadVolume} leads/month - AI can qualify and prioritize`,
      reasonHe: `${leadSources.length} מקורות לידים עם ${totalLeadVolume} לידים/חודש - AI יכול לסנן ולתעדף`,
      relevanceScore: 8,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { sources: leadSources.length, volume: totalLeadVolume }
    });
  }

  // 8. If manual lead routing → suggest AI sales agent
  const routingMethod = leads.leadRouting?.method;
  if (routingMethod === 'manual' && totalLeadVolume >= 100) {
    addSuggestion(suggestions, 'ai-sales-agent', {
      reason: 'Manual lead routing with high volume - AI sales agent can handle initial qualification',
      reasonHe: 'חלוקת לידים ידנית עם נפח גבוה - סוכן AI יכול לטפל בסינון ראשוני',
      relevanceScore: 9,
      dataSource: ['leadsAndSales.leadRouting', 'leadsAndSales.leadSources'],
      relatedData: { method: routingMethod, volume: totalLeadVolume }
    });
  }
};

const analyzeCustomerServiceModule = (meeting: Meeting, suggestions: SuggestionContext[]) => {
  const service = meeting.modules?.customerService;
  if (!service) return;

  const channels = service.channels || [];
  const totalDailyVolume = channels.reduce((sum, ch) => sum + (ch.volumePerDay || 0), 0);

  // 1. If has many inquiries/day → suggest FAQ bot
  const topQuestions = service.autoResponse?.topQuestions || [];
  if (topQuestions.length >= 5 && totalDailyVolume >= 20) {
    const totalFAQVolume = topQuestions.reduce((sum, q) => sum + (q.frequencyPerDay || 0), 0);
    addSuggestion(suggestions, 'ai-faq-bot', {
      reason: `${topQuestions.length} recurring questions, ${totalFAQVolume} times/day - AI bot will save 15 hours/week`,
      reasonHe: `${topQuestions.length} שאלות חוזרות, ${totalFAQVolume} פעמים/יום - בוט AI יחסוך 15 שעות/שבוע`,
      relevanceScore: 10,
      dataSource: ['customerService.autoResponse'],
      relatedData: { questions: topQuestions.length, frequency: totalFAQVolume }
    });
  }

  // 2. If has WhatsApp channel → suggest WhatsApp automation
  const hasWhatsApp = channels.some(ch => ch.type === 'whatsapp');
  if (hasWhatsApp && totalDailyVolume >= 15) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: `High WhatsApp volume (${totalDailyVolume}/day) - AI agent can handle 60-70% of inquiries`,
      reasonHe: `נפח גבוה ב-WhatsApp (${totalDailyVolume}/יום) - סוכן AI יכול לטפל ב-60-70% מהפניות`,
      relevanceScore: 9,
      dataSource: ['customerService.channels'],
      relatedData: { channel: 'whatsapp', volume: totalDailyVolume }
    });
  }

  // 3. If response time is slow → suggest auto-response
  const hasSlowResponse = channels.some(ch => {
    const time = ch.responseTime;
    return time && (time.includes('hour') || time.includes('day') || time.includes('שע') || time.includes('יום'));
  });
  if (hasSlowResponse) {
    addSuggestion(suggestions, 'auto-team-alerts', {
      reason: 'Slow response times detected - instant alerts will reduce response time by 70%',
      reasonHe: 'זמני תגובה איטיים - התראות מיידיות יקצרו זמן תגובה ב-70%',
      relevanceScore: 8,
      dataSource: ['customerService.channels'],
      relatedData: { slowResponse: true }
    });
  }

  // 4. If has after-hours inquiries → suggest 24/7 AI
  if (totalDailyVolume >= 10) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: 'Customer inquiries outside business hours - 24/7 AI agent never sleeps',
      reasonHe: 'פניות לקוחות מחוץ לשעות עבודה - סוכן AI 24/7 תמיד זמין',
      relevanceScore: 8,
      dataSource: ['customerService.channels'],
      relatedData: { volume: totalDailyVolume }
    });
  }

  // 5. If has proactive communication → automate it
  const proactive = service.proactiveCommunication;
  const timeSpent = proactive?.timeSpentWeekly || 0;
  if (timeSpent >= 5) {
    addSuggestion(suggestions, 'auto-service-workflow', {
      reason: `Spending ${timeSpent} hours/week on proactive communication - automation will save 80%`,
      reasonHe: `${timeSpent} שעות/שבוע על תקשורת פרואקטיבית - אוטומציה תחסוך 80%`,
      relevanceScore: 7,
      dataSource: ['customerService.proactiveCommunication'],
      relatedData: { hoursPerWeek: timeSpent }
    });
  }
};

const analyzeOperationsModule = (meeting: Meeting, suggestions: SuggestionContext[]) => {
  const ops = meeting.modules?.operations;
  if (!ops) return;

  // 1. If has multiple systems without sync → suggest integration
  const systems = ops.systemSync?.systems || [];
  const hasManualTransfer = ops.systemSync?.dataTransferMethod === 'manual';
  const manualWorkHours = ops.systemSync?.manualWork || 0;

  if (systems.length >= 2 && (hasManualTransfer || manualWorkHours >= 3)) {
    if (systems.length <= 3) {
      addSuggestion(suggestions, 'auto-system-sync', {
        reason: `${systems.length} systems with manual data transfer (${manualWorkHours}h/week) - integration will save 90%`,
        reasonHe: `${systems.length} מערכות עם העברה ידנית (${manualWorkHours}שעות/שבוע) - אינטגרציה תחסוך 90%`,
        relevanceScore: 10,
        dataSource: ['operations.systemSync'],
        relatedData: { systems: systems.length, hoursPerWeek: manualWorkHours }
      });
    } else {
      addSuggestion(suggestions, 'auto-multi-system', {
        reason: `${systems.length} systems need integration - save ${manualWorkHours} hours/week`,
        reasonHe: `${systems.length} מערכות צריכות אינטגרציה - חיסכון ${manualWorkHours} שעות/שבוע`,
        relevanceScore: 10,
        dataSource: ['operations.systemSync'],
        relatedData: { systems: systems.length, hoursPerWeek: manualWorkHours }
      });
    }
  }

  // 2. If has document management needs → suggest automation
  const docTypes = ops.documentManagement?.documentTypes || [];
  const totalDocVolume = docTypes.reduce((sum, doc) => sum + (doc.volumePerMonth || 0), 0);
  const totalDocTime = docTypes.reduce((sum, doc) =>
    sum + ((doc.volumePerMonth || 0) * (doc.timePerDocument || 0)), 0);

  if (totalDocVolume >= 50 || totalDocTime >= 20) {
    addSuggestion(suggestions, 'auto-document-mgmt', {
      reason: `${totalDocVolume} documents/month taking ${Math.round(totalDocTime)} hours - automation will save 70%`,
      reasonHe: `${totalDocVolume} מסמכים/חודש לוקחים ${Math.round(totalDocTime)} שעות - אוטומציה תחסוך 70%`,
      relevanceScore: 8,
      dataSource: ['operations.documentManagement'],
      relatedData: { volume: totalDocVolume, hours: totalDocTime }
    });
  }

  // 3. If has project management bottlenecks → suggest automation
  const bottlenecks = ops.projectManagement?.bottlenecks || [];
  if (bottlenecks.length >= 2) {
    addSuggestion(suggestions, 'auto-project-mgmt', {
      reason: `${bottlenecks.length} project management bottlenecks identified - automation will streamline`,
      reasonHe: `${bottlenecks.length} צווארי בקבוק בניהול פרויקטים - אוטומציה תייעל`,
      relevanceScore: 7,
      dataSource: ['operations.projectManagement'],
      relatedData: { bottlenecks: bottlenecks.length }
    });
  }

  // 4. If has financial process issues → suggest automation
  const invoicing = ops.financialProcesses?.invoicing;
  const invoiceVolume = invoicing?.volumePerMonth || 0;
  const invoiceTime = invoicing?.avgTimePerInvoice || 0;
  if (invoiceVolume >= 20 || (invoiceVolume * invoiceTime >= 10)) {
    addSuggestion(suggestions, 'auto-financial', {
      reason: `${invoiceVolume} invoices/month - automation will save ${Math.round(invoiceVolume * invoiceTime * 0.7)} hours/month`,
      reasonHe: `${invoiceVolume} חשבוניות/חודש - אוטומציה תחסוך ${Math.round(invoiceVolume * invoiceTime * 0.7)} שעות/חודש`,
      relevanceScore: 8,
      dataSource: ['operations.financialProcesses'],
      relatedData: { volume: invoiceVolume, timePerInvoice: invoiceTime }
    });
  }

  // 5. If has cross-department issues → suggest workflow automation
  const transfers = ops.crossDepartment?.transfers || [];
  const problematicTransfers = transfers.filter(t => t.status === 'problematic');
  if (problematicTransfers.length >= 2) {
    addSuggestion(suggestions, 'auto-cross-dept', {
      reason: `${problematicTransfers.length} problematic department handoffs - automation will fix`,
      reasonHe: `${problematicTransfers.length} העברות בעייתיות בין מחלקות - אוטומציה תפתור`,
      relevanceScore: 9,
      dataSource: ['operations.crossDepartment'],
      relatedData: { problematic: problematicTransfers.length }
    });
  }

  // 6. If has approval processes → automate them
  if (docTypes.length >= 3 || systems.length >= 2) {
    addSuggestion(suggestions, 'auto-approval-workflow', {
      reason: 'Multiple processes require approvals - automation will speed up by 80%',
      reasonHe: 'תהליכים מרובים דורשים אישורים - אוטומציה תזרז ב-80%',
      relevanceScore: 7,
      dataSource: ['operations'],
      relatedData: {}
    });
  }
};

const analyzeReportingModule = (meeting: Meeting, suggestions: SuggestionContext[]) => {
  const reporting = meeting.modules?.reporting;
  if (!reporting) return;

  // 1. If has manual reports → suggest automation
  const scheduledReports = reporting.scheduledReports || [];
  const totalReportTime = scheduledReports.reduce((sum, report) => sum + (report.timeToCreate || 0), 0);

  if (scheduledReports.length >= 2 || totalReportTime >= 5) {
    addSuggestion(suggestions, 'auto-reports', {
      reason: `${scheduledReports.length} manual reports taking ${totalReportTime} hours - automation will save 90%`,
      reasonHe: `${scheduledReports.length} דוחות ידניים לוקחים ${totalReportTime} שעות - אוטומציה תחסוך 90%`,
      relevanceScore: 9,
      dataSource: ['reporting.scheduledReports'],
      relatedData: { reports: scheduledReports.length, hours: totalReportTime }
    });
  }

  // 2. If tracking KPIs → suggest dashboard
  const kpis = reporting.kpis || [];
  if (kpis.length >= 5) {
    addSuggestion(suggestions, 'add-dashboard', {
      reason: `Tracking ${kpis.length} KPIs - real-time dashboard will provide instant insights`,
      reasonHe: `מעקב אחר ${kpis.length} מדדים - דשבורד real-time יספק תובנות מיידיות`,
      relevanceScore: 7,
      dataSource: ['reporting.kpis'],
      relatedData: { kpiCount: kpis.length }
    });
  }

  // 3. If needs real-time alerts → suggest automation
  const alerts = reporting.realTimeAlerts || [];
  if (alerts.length >= 2) {
    addSuggestion(suggestions, 'auto-team-alerts', {
      reason: `${alerts.length} alert types needed - automation will deliver instantly`,
      reasonHe: `${alerts.length} סוגי התראות נדרשים - אוטומציה תספק מיידית`,
      relevanceScore: 7,
      dataSource: ['reporting.realTimeAlerts'],
      relatedData: { alerts: alerts.length }
    });
  }
};

const analyzeSystemsModule = (meeting: Meeting, suggestions: SuggestionContext[]) => {
  const systems = meeting.modules?.systems;
  if (!systems) return;

  // 1. If has poor data quality → suggest data cleaning
  const dataQuality = systems.dataQuality?.overall;
  if (dataQuality === 'poor' || dataQuality === 'medium') {
    addSuggestion(suggestions, 'add-data-clean', {
      reason: 'Poor data quality detected - cleaning will improve efficiency by 40%',
      reasonHe: 'איכות נתונים ירודה - ניקוי ישפר יעילות ב-40%',
      relevanceScore: 8,
      dataSource: ['systems.dataQuality'],
      relatedData: { quality: dataQuality }
    });
  }

  // 2. If has integration issues → suggest integration services
  const integrationLevel = systems.integrations?.level;
  const integrationIssues = systems.integrations?.issues || [];
  if (integrationLevel === 'none' || integrationLevel === 'minimal' || integrationIssues.length >= 2) {
    const systemsList = systems.currentSystems || [];
    if (systemsList.length >= 2 && systemsList.length <= 3) {
      addSuggestion(suggestions, 'int-complex', {
        reason: `${systemsList.length} systems with integration issues - connect them seamlessly`,
        reasonHe: `${systemsList.length} מערכות עם בעיות אינטגרציה - חבר אותן בצורה חלקה`,
        relevanceScore: 9,
        dataSource: ['systems.integrations', 'systems.currentSystems'],
        relatedData: { systems: systemsList.length, issues: integrationIssues }
      });
    }
  }

  // 3. If needs API/webhooks → suggest development
  const apiNeeds = systems.apiWebhooks?.needs || [];
  if (apiNeeds.length >= 2) {
    addSuggestion(suggestions, 'int-custom-api', {
      reason: `${apiNeeds.length} custom API needs identified`,
      reasonHe: `${apiNeeds.length} צרכי API מותאם זוהו`,
      relevanceScore: 6,
      dataSource: ['systems.apiWebhooks'],
      relatedData: { needs: apiNeeds }
    });
  }

  // 4. If has no CRM → suggest implementation
  const hasCRM = (systems.currentSystems || []).some(s =>
    s.toLowerCase().includes('crm') || s.toLowerCase().includes('salesforce') ||
    s.toLowerCase().includes('hubspot') || s.toLowerCase().includes('zoho')
  );
  if (!hasCRM) {
    const overview = meeting.modules?.overview;
    const employees = overview?.employees;
    // Only suggest if business size warrants it
    if (employees && !['1-10'].includes(employees)) {
      addSuggestion(suggestions, 'impl-crm', {
        reason: 'No CRM detected - implementing one will improve lead management by 300%',
        reasonHe: 'לא זוהה CRM - הטמעה תשפר ניהול לידים ב-300%',
        relevanceScore: 7,
        dataSource: ['systems.currentSystems'],
        relatedData: { hasCRM: false }
      });
    }
  }
};

const analyzeAIModule = (meeting: Meeting, suggestions: SuggestionContext[]) => {
  const ai = meeting.modules?.aiAgents;
  if (!ai) return;

  // 1. If AI readiness is ready → suggest AI agent
  const salesReadiness = ai.sales?.readiness;
  const serviceReadiness = ai.service?.readiness;
  const priority = ai.priority;

  if (salesReadiness === 'ready' || serviceReadiness === 'ready') {
    if (priority === 'sales' && salesReadiness === 'ready') {
      const salesUseCases = ai.sales?.useCases || [];
      addSuggestion(suggestions, 'ai-sales-agent', {
        reason: `Sales AI is ready - ${salesUseCases.length} use cases identified`,
        reasonHe: `AI למכירות מוכן - ${salesUseCases.length} מקרי שימוש זוהו`,
        relevanceScore: 10,
        dataSource: ['aiAgents.sales'],
        relatedData: { useCases: salesUseCases.length, priority: 'sales' }
      });
    }

    if (priority === 'service' && serviceReadiness === 'ready') {
      const serviceUseCases = ai.service?.useCases || [];
      addSuggestion(suggestions, 'ai-service-agent', {
        reason: `Service AI is ready - ${serviceUseCases.length} use cases identified`,
        reasonHe: `AI לשירות מוכן - ${serviceUseCases.length} מקרי שימוש זוהו`,
        relevanceScore: 10,
        dataSource: ['aiAgents.service'],
        relatedData: { useCases: serviceUseCases.length, priority: 'service' }
      });
    }
  }

  // 2. If AI potential is high → suggest implementation
  const salesPotential = ai.sales?.potential;
  const servicePotential = ai.service?.potential;
  const opsPotential = ai.operations?.potential;

  if (salesPotential === 'high') {
    addSuggestion(suggestions, 'ai-sales-agent', {
      reason: 'High AI potential for sales identified',
      reasonHe: 'פוטנציאל AI גבוה למכירות זוהה',
      relevanceScore: 8,
      dataSource: ['aiAgents.sales'],
      relatedData: { potential: 'high' }
    });
  }

  if (servicePotential === 'high') {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: 'High AI potential for customer service identified',
      reasonHe: 'פוטנציאל AI גבוה לשירות זוהה',
      relevanceScore: 8,
      dataSource: ['aiAgents.service'],
      relatedData: { potential: 'high' }
    });
  }

  if (opsPotential === 'high') {
    addSuggestion(suggestions, 'ai-action-agent', {
      reason: 'High AI potential for operations identified',
      reasonHe: 'פוטנציאל AI גבוה לתפעול זוהה',
      relevanceScore: 7,
      dataSource: ['aiAgents.operations'],
      relatedData: { potential: 'high' }
    });
  }

  // 3. Natural language importance → suggest advanced AI
  const nlImportance = ai.naturalLanguageImportance;
  if (nlImportance === 'critical') {
    addSuggestion(suggestions, 'ai-complex-flow', {
      reason: 'Critical need for natural language - advanced AI agent recommended',
      reasonHe: 'צורך קריטי בשפה טבעית - סוכן AI מתקדם מומלץ',
      relevanceScore: 8,
      dataSource: ['aiAgents.naturalLanguageImportance'],
      relatedData: { importance: nlImportance }
    });
  }
};

const analyzeROIModule = (meeting: Meeting, suggestions: SuggestionContext[]) => {
  const roi = meeting.modules?.roi;
  if (!roi) return;

  // Analyze time savings potential
  const estimatedHours = roi.timeSavings?.estimatedHoursSaved;
  if (estimatedHours && parseInt(estimatedHours as string) >= 10) {
    const hours = parseInt(estimatedHours as string);
    addSuggestion(suggestions, 'auto-end-to-end', {
      reason: `${hours} hours/week can be saved - comprehensive automation recommended`,
      reasonHe: `${hours} שעות/שבוע ניתן לחסוך - אוטומציה מקיפה מומלצת`,
      relevanceScore: 9,
      dataSource: ['roi.timeSavings'],
      relatedData: { hours }
    });
  }

  // Analyze processes to automate
  const processes = roi.timeSavings?.processes || [];
  if (processes.length >= 5) {
    addSuggestion(suggestions, 'auto-complex-logic', {
      reason: `${processes.length} processes identified for automation`,
      reasonHe: `${processes.length} תהליכים זוהו לאוטומציה`,
      relevanceScore: 8,
      dataSource: ['roi.timeSavings'],
      relatedData: { processes: processes.length }
    });
  }

  // Check success metrics
  const metrics = roi.successMetrics || [];
  if (metrics.includes('reporting') || metrics.includes('data_quality')) {
    addSuggestion(suggestions, 'add-custom-reports', {
      reason: 'Reporting and data quality are success metrics - custom reports will track progress',
      reasonHe: 'דיווח ואיכות נתונים הם מדדי הצלחה - דוחות מותאמים יעקבו אחר התקדמות',
      relevanceScore: 6,
      dataSource: ['roi.successMetrics'],
      relatedData: { metrics }
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

const addSuggestion = (
  suggestions: SuggestionContext[],
  serviceId: string,
  context: Omit<SuggestionContext, 'service'>
) => {
  const service = SERVICES_DATABASE.find(s => s.id === serviceId);
  if (!service) return;

  // Check if already suggested
  const existing = suggestions.find(s => s.service.id === serviceId);
  if (existing) {
    // If already exists, increase relevance score if new one is higher
    if (context.relevanceScore > existing.relevanceScore) {
      existing.relevanceScore = context.relevanceScore;
      existing.dataSource = [...new Set([...existing.dataSource, ...context.dataSource])];
    }
    return;
  }

  suggestions.push({
    service,
    ...context
  });
};

const generateSummary = (meeting: Meeting, proposedServices: ProposedService[]): ProposalSummary => {
  // Count by category
  const automations = proposedServices.filter(s => s.category === 'automations').length;
  const aiAgents = proposedServices.filter(s => s.category === 'ai_agents').length;
  const integrations = proposedServices.filter(s => s.category === 'integrations').length;

  // Count identified processes (estimate from all modules)
  let identifiedProcesses = 0;
  const modules = meeting.modules;

  if (modules?.leadsAndSales?.leadSources) identifiedProcesses += modules.leadsAndSales.leadSources.length;
  if (modules?.customerService?.channels) identifiedProcesses += modules.customerService.channels.length;
  if (modules?.operations?.documentManagement?.documentTypes) {
    identifiedProcesses += modules.operations.documentManagement.documentTypes.length;
  }
  if (modules?.reporting?.scheduledReports) identifiedProcesses += modules.reporting.scheduledReports.length;

  // Get potential savings from ROI module
  const roiSummary = meeting.modules?.roi?.summary;
  const potentialMonthlySavings = roiSummary?.totalMonthlySaving || 0;
  const potentialWeeklySavingsHours = roiSummary?.totalHoursSaved || 0;

  return {
    totalServices: proposedServices.length,
    totalAutomations: automations,
    totalAIAgents: aiAgents,
    totalIntegrations: integrations,
    identifiedProcesses,
    potentialMonthlySavings,
    potentialWeeklySavingsHours
  };
};
