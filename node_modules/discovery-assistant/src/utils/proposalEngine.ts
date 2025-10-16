import { Meeting } from '../types';
import { ProposedService, ProposalSummary } from '../types/proposal';
import { SERVICES_DATABASE } from '../config/servicesDatabase';

/**
 * Proposal Engine - Analyzes meeting data and suggests relevant services
 * This is the brain that reads all the filled data and proposes specific solutions
 */

interface SuggestionContext {
  service: (typeof SERVICES_DATABASE)[0];
  reason: string;
  reasonHe: string;
  relevanceScore: number;
  dataSource: string[];
  relatedData?: any;
}

export const generateProposal = (
  meeting: Meeting
): {
  summary: ProposalSummary;
  proposedServices: ProposedService[];
} => {
  const suggestions: SuggestionContext[] = [];

  // Analyze each module and suggest services
  analyzeOverviewModule(meeting, suggestions);
  analyzeEssentialDetailsModule(meeting, suggestions);
  analyzeLeadsModule(meeting, suggestions);
  analyzeCustomerServiceModule(meeting, suggestions);
  analyzeOperationsModule(meeting, suggestions);
  analyzeReportingModule(meeting, suggestions);
  analyzeSystemsModule(meeting, suggestions);
  analyzeAIModule(meeting, suggestions);
  analyzeROIModule(meeting, suggestions);

  // ==================== CROSS-MODULE INTELLIGENCE RULES ====================
  applyCrossModuleRules(meeting, suggestions);

  // Convert suggestions to ProposedService format
  const proposedServices: ProposedService[] = suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map((suggestion) => ({
      ...suggestion.service,
      reasonSuggested: suggestion.reason,
      reasonSuggestedHe: suggestion.reasonHe,
      relevanceScore: suggestion.relevanceScore,
      dataSource: suggestion.dataSource,
      relatedData: suggestion.relatedData,
    }));

  // Generate summary
  const summary = generateSummary(meeting, proposedServices);

  return { summary, proposedServices };
};

// ==================== MODULE ANALYZERS ====================

const analyzeOverviewModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const overview = meeting.modules?.overview;
  if (!overview) return;

  // FIELD 1: employees - Business size-based recommendations
  const employees = meeting.modules?.operations?.hr?.employeeCount;
  if (employees && employees >= 50) {
    addSuggestion(suggestions, 'auto-end-to-end', {
      reason: `With ${employees}+ employees, you need comprehensive automation to scale efficiently`,
      reasonHe: `עם ${employees}+ עובדים, אתה צריך אוטומציה מקיפה כדי להתרחב ביעילות`,
      relevanceScore: 9,
      dataSource: ['operations.hr.employeeCount'],
      relatedData: { employees },
    });
  }

  // FIELD 2: budget - Budget-based recommendations
  const budget = overview.budget;
  if (budget === 'high' || budget === '50000+') {
    addSuggestion(suggestions, 'ai-full-integration', {
      reason:
        'High budget allows for comprehensive AI integration across all systems',
      reasonHe: 'תקציב גבוה מאפשר אינטגרציית AI מקיפה על פני כל המערכות',
      relevanceScore: 8,
      dataSource: ['overview.budget'],
      relatedData: { budget },
    });
  } else if (budget === 'low' || budget === '0-10000') {
    addSuggestion(suggestions, 'auto-lead-response', {
      reason: 'Low budget - start with quick wins that deliver immediate value',
      reasonHe: 'תקציב נמוך - התחל עם quick wins שמספקים ערך מיידי',
      relevanceScore: 8,
      dataSource: ['overview.budget'],
      relatedData: { budget },
    });
  }

  // FIELD 3: mainChallenge - Challenge-based recommendations
  const mainChallenge = overview.mainChallenge?.toLowerCase() || '';

  if (
    mainChallenge.includes('lead') ||
    mainChallenge.includes('ליד') ||
    mainChallenge.includes('לקוח')
  ) {
    addSuggestion(suggestions, 'auto-lead-workflow', {
      reason:
        'Main challenge involves lead management - comprehensive workflow needed',
      reasonHe: 'האתגר העיקרי כולל ניהול לידים - נדרש workflow מקיף',
      relevanceScore: 10,
      dataSource: ['overview.mainChallenge'],
      relatedData: { challenge: mainChallenge },
    });

    if (employees && employees <= 20) {
      addSuggestion(suggestions, 'ai-sales-agent', {
        reason:
          'Small team with lead challenges - AI sales agent can multiply your capacity',
        reasonHe:
          'צוות קטן עם אתגרי לידים - סוכן AI למכירות יכול להכפיל את הקיבולת',
        relevanceScore: 9,
        dataSource: ['overview.mainChallenge', 'operations.hr.employeeCount'],
        relatedData: { challenge: mainChallenge, employees },
      });
    }
  }

  if (
    mainChallenge.includes('service') ||
    mainChallenge.includes('support') ||
    mainChallenge.includes('שירות') ||
    mainChallenge.includes('תמיכה')
  ) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason:
        'Main challenge is customer service - AI agent can handle 60-70% of inquiries',
      reasonHe:
        'האתגר העיקרי הוא שירות לקוחות - סוכן AI יכול לטפל ב-60-70% מהפניות',
      relevanceScore: 10,
      dataSource: ['overview.mainChallenge'],
      relatedData: { challenge: mainChallenge },
    });

    addSuggestion(suggestions, 'ai-faq-bot', {
      reason:
        'Service challenges often include repetitive questions - FAQ bot is a quick win',
      reasonHe: 'אתגרי שירות כוללים לרוב שאלות חוזרות - בוט FAQ הוא quick win',
      relevanceScore: 8,
      dataSource: ['overview.mainChallenge'],
      relatedData: { challenge: mainChallenge },
    });
  }

  if (
    mainChallenge.includes('report') ||
    mainChallenge.includes('data') ||
    mainChallenge.includes('דוח') ||
    mainChallenge.includes('נתונים')
  ) {
    addSuggestion(suggestions, 'auto-reports', {
      reason:
        'Reporting challenges identified - automated reports will save 15+ hours/week',
      reasonHe: 'זוהו אתגרי דיווח - דוחות אוטומטיים יחסכו 15+ שעות בשבוע',
      relevanceScore: 9,
      dataSource: ['overview.mainChallenge'],
      relatedData: { challenge: mainChallenge },
    });

    addSuggestion(suggestions, 'add-dashboard', {
      reason:
        'Data challenges need real-time visibility - dashboard provides instant insights',
      reasonHe:
        'אתגרי נתונים דורשים ראייה בזמן אמת - דשבורד מספק תובנות מיידיות',
      relevanceScore: 8,
      dataSource: ['overview.mainChallenge'],
      relatedData: { challenge: mainChallenge },
    });
  }

  if (
    mainChallenge.includes('manual') ||
    mainChallenge.includes('time') ||
    mainChallenge.includes('ידני') ||
    mainChallenge.includes('זמן')
  ) {
    addSuggestion(suggestions, 'auto-complex-logic', {
      reason: 'Manual processes taking too much time - automation is critical',
      reasonHe: 'תהליכים ידניים לוקחים יותר מדי זמן - אוטומציה קריטית',
      relevanceScore: 9,
      dataSource: ['overview.mainChallenge'],
      relatedData: { challenge: mainChallenge },
    });
  }

  // FIELD 4: businessType - Business type-based recommendations
  const businessType = overview.businessType?.toLowerCase() || '';

  if (businessType === 'b2b' || businessType.includes('b2b')) {
    if (employees && employees >= 10) {
      addSuggestion(suggestions, 'impl-crm', {
        reason:
          'B2B business with team - CRM is essential for managing complex sales cycles',
        reasonHe: 'עסק B2B עם צוות - CRM חיוני לניהול מחזורי מכירה מורכבים',
        relevanceScore: 8,
        dataSource: ['overview.businessType', 'operations.hr.employeeCount'],
        relatedData: { businessType, employees },
      });
    }
  }

  if (businessType === 'b2c' || businessType.includes('b2c')) {
    addSuggestion(suggestions, 'auto-smart-followup', {
      reason: 'B2C business needs fast, automated follow-up to convert leads',
      reasonHe: 'עסק B2C זקוק למעקב מהיר ואוטומטי להמרת לידים',
      relevanceScore: 8,
      dataSource: ['overview.businessType'],
      relatedData: { businessType },
    });

    addSuggestion(suggestions, 'ai-lead-qualifier', {
      reason: 'B2C high volume - AI can qualify leads automatically',
      reasonHe: 'B2C נפח גבוה - AI יכול לסנן לידים אוטומטית',
      relevanceScore: 7,
      dataSource: ['overview.businessType'],
      relatedData: { businessType },
    });
  }

  // FIELD 5: focusAreas - CRITICAL dynamic multi-service mapping
  const focusAreas = overview.focusAreas || [];
  focusAreas.forEach((area) => {
    switch (area) {
      case 'lead_capture':
        addSuggestion(suggestions, 'auto-lead-workflow', {
          reason:
            'Lead capture is a focus area - comprehensive lead workflow automation needed',
          reasonHe:
            'קליטת לידים היא תחום מיקוד - נדרשת אוטומציה מקיפה לזרימת לידים',
          relevanceScore: 9,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        addSuggestion(suggestions, 'auto-crm-update', {
          reason: 'Lead capture automation requires automatic CRM updates',
          reasonHe: 'אוטומציית קליטת לידים דורשת עדכון אוטומטי של CRM',
          relevanceScore: 8,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        break;

      case 'sales_process':
        addSuggestion(suggestions, 'auto-sales-pipeline', {
          reason:
            'Sales process is a focus area - complete sales pipeline automation recommended',
          reasonHe:
            'תהליך המכירה הוא תחום מיקוד - מומלצת אוטומציה מלאה של pipeline המכירות',
          relevanceScore: 9,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        addSuggestion(suggestions, 'ai-sales-agent', {
          reason:
            'Sales process optimization benefits greatly from AI sales agent',
          reasonHe: 'אופטימיזציה של תהליך המכירה נהנית מאוד מסוכן AI למכירות',
          relevanceScore: 8,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        break;

      case 'customer_service':
        addSuggestion(suggestions, 'ai-service-agent', {
          reason:
            'Customer service is a focus area - AI service agent can handle 60-70% of inquiries',
          reasonHe:
            'שירות לקוחות הוא תחום מיקוד - סוכן AI יכול לטפל ב-60-70% מהפניות',
          relevanceScore: 9,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        addSuggestion(suggestions, 'auto-service-workflow', {
          reason: 'Customer service focus requires automated service workflows',
          reasonHe: 'מיקוד בשירות לקוחות דורש זרימות שירות אוטומטיות',
          relevanceScore: 8,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        break;

      case 'automation':
        addSuggestion(suggestions, 'auto-end-to-end', {
          reason:
            'Automation is a focus area - end-to-end process automation recommended',
          reasonHe: 'אוטומציה היא תחום מיקוד - מומלצת אוטומציה מקצה לקצה',
          relevanceScore: 10,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        addSuggestion(suggestions, 'auto-complex-logic', {
          reason:
            'Automation focus - complex business logic automation will deliver maximum value',
          reasonHe:
            'מיקוד באוטומציה - אוטומציית לוגיקה עסקית מורכבת תספק ערך מקסימלי',
          relevanceScore: 9,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        break;

      case 'crm_upgrade':
        addSuggestion(suggestions, 'impl-crm', {
          reason:
            'CRM upgrade is a focus area - CRM implementation/migration needed',
          reasonHe: 'שדרוג CRM הוא תחום מיקוד - נדרשת הטמעה/מעבר CRM',
          relevanceScore: 10,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        addSuggestion(suggestions, 'data-cleanup', {
          reason: 'CRM upgrade requires data cleaning first',
          reasonHe: 'שדרוג CRM דורש ניקוי נתונים תחילה',
          relevanceScore: 8,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        break;

      case 'reporting':
        addSuggestion(suggestions, 'auto-reports', {
          reason:
            'Reporting is a focus area - automated reports will save 15+ hours/week',
          reasonHe:
            'דיווח הוא תחום מיקוד - דוחות אוטומטיים יחסכו 15+ שעות בשבוע',
          relevanceScore: 9,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        addSuggestion(suggestions, 'add-dashboard', {
          reason:
            'Reporting focus needs real-time dashboard for instant insights',
          reasonHe: 'מיקוד בדיווח דורש דשבורד real-time לתובנות מיידיות',
          relevanceScore: 9,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        break;

      case 'ai_agents':
        addSuggestion(suggestions, 'ai-multi-agent', {
          reason: 'AI agents are a focus area - multi-agent system recommended',
          reasonHe: 'סוכני AI הם תחום מיקוד - מומלצת מערכת רב-סוכנית',
          relevanceScore: 10,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        addSuggestion(suggestions, 'ai-full-integration', {
          reason: 'AI agent focus requires full integration with all systems',
          reasonHe: 'מיקוד בסוכני AI דורש אינטגרציה מלאה עם כל המערכות',
          relevanceScore: 9,
          dataSource: ['overview.focusAreas'],
          relatedData: { focusArea: area },
        });
        break;
    }
  });

  // FIELD 6: crmStatus - CRITICAL prerequisite logic
  const crmStatus = meeting.modules?.systems?.crmStatus;
  if (crmStatus === 'none') {
    addSuggestion(suggestions, 'impl-crm', {
      reason:
        'No CRM detected - CRM implementation is PREREQUISITE for other automations',
      reasonHe: 'לא זוהה CRM - הטמעת CRM היא תנאי מוקדם לאוטומציות אחרות',
      relevanceScore: 10,
      dataSource: ['systems.crmStatus'],
      relatedData: { crmStatus, priority: 'PREREQUISITE' },
    });
  }

  // FIELD 7: crmName - Existing CRM analysis
  const crmName = meeting.modules?.systems?.crmName;
  if (crmName && crmStatus === 'basic') {
    addSuggestion(suggestions, 'impl-crm', {
      reason: `Current CRM (${crmName}) is basic - upgrade to full CRM recommended`,
      reasonHe: `ה-CRM הנוכחי (${crmName}) בסיסי - מומלץ שדרוג ל-CRM מלא`,
      relevanceScore: 7,
      dataSource: ['systems.crmName', 'systems.crmStatus'],
      relatedData: { crmName, crmStatus },
    });
  }

  // FIELD 8: crmSatisfaction - Low satisfaction triggers migration
  const crmSatisfaction = meeting.modules?.systems?.crmSatisfaction;
  if (crmSatisfaction && crmSatisfaction <= 2) {
    addSuggestion(suggestions, 'impl-crm', {
      reason: `Low CRM satisfaction (${crmSatisfaction}/5) - migration to better CRM recommended`,
      reasonHe: `שביעות רצון נמוכה מ-CRM (${crmSatisfaction}/5) - מומלץ מעבר ל-CRM טוב יותר`,
      relevanceScore: 8,
      dataSource: ['systems.crmSatisfaction'],
      relatedData: { satisfaction: crmSatisfaction, priority: 'HIGH-IMPACT' },
    });
  }

  // FIELD 9: leadStorageMethod - Manual storage triggers CRM need
  const leadStorageMethod = overview.leadStorageMethod;
  if (
    leadStorageMethod === 'excel' ||
    leadStorageMethod === 'paper' ||
    leadStorageMethod === 'email'
  ) {
    addSuggestion(suggestions, 'impl-crm', {
      reason: `Leads stored in ${leadStorageMethod} - CRM implementation will improve efficiency by 300%`,
      reasonHe: `לידים מאוחסנים ב-${leadStorageMethod} - הטמעת CRM תשפר יעילות ב-300%`,
      relevanceScore: 9,
      dataSource: ['overview.leadStorageMethod'],
      relatedData: { storageMethod: leadStorageMethod, priority: 'URGENT' },
    });
  }

  // FIELD 10: serviceSystemExists - Service system gap
  const serviceSystemExists = overview.serviceSystemExists;
  if (serviceSystemExists === false) {
    addSuggestion(suggestions, 'auto-service-workflow', {
      reason:
        'No service system exists - automated service workflow is critical',
      reasonHe: 'אין מערכת שירות - זרימת שירות אוטומטית קריטית',
      relevanceScore: 9,
      dataSource: ['overview.serviceSystemExists'],
      relatedData: { exists: false, priority: 'URGENT' },
    });
  }

  // FIELD 11: leadSources - Lead source analysis (moved from Leads module)
  const leadSources = overview.leadSources || [];
  const totalLeadVolume = leadSources.reduce(
    (sum, source) => sum + (source.volumePerMonth || 0),
    0
  );

  if (totalLeadVolume >= 50) {
    addSuggestion(suggestions, 'auto-lead-workflow', {
      reason: `${totalLeadVolume} leads/month - comprehensive lead workflow needed`,
      reasonHe: `${totalLeadVolume} לידים/חודש - נדרש workflow לידים מקיף`,
      relevanceScore: 9,
      dataSource: ['overview.leadSources'],
      relatedData: { totalVolume: totalLeadVolume },
    });
  }

  // Facebook leads specific
  const fbLeads = leadSources.find(
    (s) => s.channel === 'facebook' && (s.volumePerMonth || 0) >= 20
  );
  if (fbLeads) {
    addSuggestion(suggestions, 'auto-lead-response', {
      reason: `${fbLeads.volumePerMonth} leads/month from Facebook - automation will save 10 hours/week`,
      reasonHe: `${fbLeads.volumePerMonth} לידים/חודש מפייסבוק - אוטומציה תחסוך 10 שעות/שבוע`,
      relevanceScore: 9,
      dataSource: ['overview.leadSources'],
      relatedData: { channel: 'facebook', volume: fbLeads.volumePerMonth },
    });
  }

  // FIELD 12: leadCaptureChannels - Multi-channel leads
  const leadCaptureChannels = overview.leadCaptureChannels || [];
  if (leadCaptureChannels.length >= 3) {
    addSuggestion(suggestions, 'auto-system-sync', {
      reason: `${leadCaptureChannels.length} lead capture channels - unification needed`,
      reasonHe: `${leadCaptureChannels.length} ערוצי קליטת לידים - נדרש איחוד`,
      relevanceScore: 8,
      dataSource: ['overview.leadCaptureChannels'],
      relatedData: { channels: leadCaptureChannels },
    });
  }

  // FIELD 13: serviceChannels - Service channel analysis (moved from Customer Service)
  const serviceChannels = overview.serviceChannels || [];
  const totalServiceVolume = serviceChannels.reduce(
    (sum, ch) => sum + (ch.volumePerDay || 0),
    0
  );

  if (totalServiceVolume >= 30) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: `${totalServiceVolume} service inquiries/day - AI agent can handle 60-70%`,
      reasonHe: `${totalServiceVolume} פניות שירות/יום - סוכן AI יכול לטפל ב-60-70%`,
      relevanceScore: 9,
      dataSource: ['overview.serviceChannels'],
      relatedData: { volume: totalServiceVolume },
    });
  }

  // WhatsApp service channel
  const whatsappService = serviceChannels.find(
    (ch) => ch.type === 'whatsapp' && (ch.volumePerDay || 0) >= 15
  );
  if (whatsappService) {
    addSuggestion(suggestions, 'whatsapp-api-setup', {
      reason: `${whatsappService.volumePerDay} WhatsApp inquiries/day - WhatsApp Business API setup needed`,
      reasonHe: `${whatsappService.volumePerDay} פניות WhatsApp/יום - נדרשת הקמת WhatsApp Business API`,
      relevanceScore: 8,
      dataSource: ['overview.serviceChannels'],
      relatedData: {
        channel: 'whatsapp',
        volume: whatsappService.volumePerDay,
      },
    });
  }

  // FIELD 14: serviceVolume - High volume service
  const serviceVolume = overview.serviceVolume;
  if (
    serviceVolume &&
    (serviceVolume.includes('high') ||
      serviceVolume.includes('100+') ||
      serviceVolume.includes('גבוה'))
  ) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: 'High service volume detected - AI agent is critical for scaling',
      reasonHe: 'נפח שירות גבוה זוהה - סוכן AI קריטי להרחבה',
      relevanceScore: 10,
      dataSource: ['overview.serviceVolume'],
      relatedData: { volume: serviceVolume, priority: 'URGENT' },
    });
  }
};

const analyzeLeadsModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const leads = meeting.modules?.leadsAndSales;
  if (!leads) return;

  // Count lead sources
  const leadSources = leads.leadSources || [];
  const totalLeadVolume = leadSources.reduce(
    (sum, source) => sum + (source.volumePerMonth || 0),
    0
  );

  // 1. If has Facebook leads → suggest Facebook to CRM automation
  const hasFacebookLeads = leadSources.some(
    (s) => s.channel === 'facebook' && (s.volumePerMonth || 0) > 20
  );
  if (hasFacebookLeads) {
    const fbLeads = leadSources.find((s) => s.channel === 'facebook');
    addSuggestion(suggestions, 'auto-lead-response', {
      reason: `You have ${fbLeads?.volumePerMonth} leads/month from Facebook - save 10 hours/week`,
      reasonHe: `יש לך ${fbLeads?.volumePerMonth} לידים/חודש מפייסבוק - חיסכון של 10 שעות/שבוע`,
      relevanceScore: 9,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { channel: 'facebook', volume: fbLeads?.volumePerMonth },
    });
  }

  // 2. If has many leads (50+) → suggest full lead workflow
  if (totalLeadVolume >= 50) {
    addSuggestion(suggestions, 'auto-lead-workflow', {
      reason: `Managing ${totalLeadVolume} leads/month manually - full workflow will save 15-20 hours/week`,
      reasonHe: `ניהול ${totalLeadVolume} לידים/חודש ידנית - workflow מלא יחסוך 15-20 שעות/שבוע`,
      relevanceScore: 10,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { totalLeadVolume },
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
      relatedData: { dropOffRate },
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
      relatedData: { cancellationRate, noShowRate },
    });
  }

  // 5. If speed to lead is slow → suggest immediate response
  const duringHours = leads.speedToLead?.duringBusinessHours;
  if (duringHours && duringHours !== 'immediate') {
    addSuggestion(suggestions, 'auto-sms-whatsapp', {
      reason:
        'Not responding immediately to leads - instant SMS/WhatsApp can increase conversion by 30%',
      reasonHe:
        'אין מענה מיידי ללידים - SMS/WhatsApp מיידי יכול להעלות המרה ב-30%',
      relevanceScore: 9,
      dataSource: ['leadsAndSales.speedToLead'],
      relatedData: { currentSpeed: duringHours },
    });
  }

  // 6. If using website forms → suggest CRM auto-update
  const hasWebsite = leadSources.some((s) => s.channel === 'website');
  if (hasWebsite) {
    addSuggestion(suggestions, 'auto-crm-update', {
      reason:
        'Website leads need manual CRM entry - automation saves 5-8 hours/week',
      reasonHe: 'לידים מהאתר נכנסים ידנית ל-CRM - אוטומציה תחסוך 5-8 שעות/שבוע',
      relevanceScore: 8,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { channel: 'website' },
    });
  }

  // 7. If has many lead sources → suggest AI lead qualifier
  if (leadSources.length >= 4 && totalLeadVolume >= 80) {
    addSuggestion(suggestions, 'ai-lead-qualifier', {
      reason: `${leadSources.length} lead sources with ${totalLeadVolume} leads/month - AI can qualify and prioritize`,
      reasonHe: `${leadSources.length} מקורות לידים עם ${totalLeadVolume} לידים/חודש - AI יכול לסנן ולתעדף`,
      relevanceScore: 8,
      dataSource: ['leadsAndSales.leadSources'],
      relatedData: { sources: leadSources.length, volume: totalLeadVolume },
    });
  }

  // 8. If manual lead routing → suggest AI sales agent
  const routingMethod = leads.leadRouting?.method;
  if (routingMethod?.includes('manual') && totalLeadVolume >= 100) {
    addSuggestion(suggestions, 'ai-sales-agent', {
      reason:
        'Manual lead routing with high volume - AI sales agent can handle initial qualification',
      reasonHe:
        'חלוקת לידים ידנית עם נפח גבוה - סוכן AI יכול לטפל בסינון ראשוני',
      relevanceScore: 9,
      dataSource: ['leadsAndSales.leadRouting', 'leadsAndSales.leadSources'],
      relatedData: { method: routingMethod, volume: totalLeadVolume },
    });
  }

  // === NEW: Additional Analysis from Previously Unused Fields ===

  // 9. Central System Issues
  const centralSystem = leads.centralSystem;
  const commonIssues = leads.commonIssues || [];
  if (commonIssues.length >= 2) {
    if (commonIssues.includes('duplicates')) {
      addSuggestion(suggestions, 'data-cleanup', {
        reason: `${centralSystem || 'Your system'} has duplicate issues - data cleaning will improve efficiency by 40%`,
        reasonHe: `${centralSystem || 'המערכת שלך'} סובלת מכפילויות - ניקוי נתונים ישפר יעילות ב-40%`,
        relevanceScore: 7,
        dataSource: [
          'leadsAndSales.centralSystem',
          'leadsAndSales.commonIssues',
        ],
        relatedData: { system: centralSystem, issues: commonIssues },
      });
    }

    if (commonIssues.includes('missing_info')) {
      addSuggestion(suggestions, 'ai-form-assistant', {
        reason:
          'Missing information in leads - AI form assistant will ensure complete data capture',
        reasonHe: 'מידע חסר בלידים - עוזר AI לטפסים יבטיח איסוף מידע מלא',
        relevanceScore: 8,
        dataSource: ['leadsAndSales.commonIssues'],
        relatedData: { issues: commonIssues },
      });
    }

    if (
      commonIssues.includes('lost_leads') ||
      commonIssues.includes('slow_response')
    ) {
      addSuggestion(suggestions, 'auto-team-alerts', {
        reason:
          'Leads getting lost or slow responses - instant alerts will prevent lead loss',
        reasonHe:
          'לידים אובדים או תגובות איטיות - התראות מיידיות ימנעו אובדן לידים',
        relevanceScore: 9,
        dataSource: ['leadsAndSales.commonIssues'],
        relatedData: { issues: commonIssues },
      });
    }
  }

  // 10. Missing Opportunities & Falling Leads
  const fallingLeadsPerMonth = leads.fallingLeadsPerMonth || 0;
  if (fallingLeadsPerMonth >= 10) {
    const costPerLostLead = leads.costPerLostLead || 100;
    const monthlyCost = fallingLeadsPerMonth * costPerLostLead;

    addSuggestion(suggestions, 'auto-smart-followup', {
      reason: `${fallingLeadsPerMonth} leads/month are falling through - ${monthlyCost} NIS monthly loss. Smart follow-up can recover 30%`,
      reasonHe: `${fallingLeadsPerMonth} לידים/חודש נושרים - הפסד של ${monthlyCost} ₪ לחודש. מעקב חכם יכול להחזיר 30%`,
      relevanceScore: 10,
      dataSource: [
        'leadsAndSales.fallingLeadsPerMonth',
        'leadsAndSales.costPerLostLead',
      ],
      relatedData: {
        fallingLeads: fallingLeadsPerMonth,
        costPerLead: costPerLostLead,
        monthlyCost,
      },
    });
  }

  // 11. Time to Process Lead
  const timeToProcessLead = leads.timeToProcessLead || 0;
  if (timeToProcessLead >= 30) {
    // 30 minutes or more
    addSuggestion(suggestions, 'auto-crm-update', {
      reason: `${timeToProcessLead} minutes to process each lead - automation will reduce to < 1 minute`,
      reasonHe: `${timeToProcessLead} דקות לעיבוד כל ליד - אוטומציה תקצר ל-<1 דקה`,
      relevanceScore: 8,
      dataSource: ['leadsAndSales.timeToProcessLead'],
      relatedData: {
        timePerLead: timeToProcessLead,
        monthlyLeads: totalLeadVolume,
      },
    });
  }

  // 12. Duplicate Frequency
  const duplicatesFrequency = leads.duplicatesFrequency;
  if (duplicatesFrequency === 'very_often' || duplicatesFrequency === 'often') {
    addSuggestion(suggestions, 'data-cleanup', {
      reason:
        'Frequent duplicates in lead data - data cleaning + automation will prevent future duplicates',
      reasonHe:
        'כפילויות תכופות בנתוני לידים - ניקוי נתונים + אוטומציה ימנעו כפילויות עתידיות',
      relevanceScore: 7,
      dataSource: ['leadsAndSales.duplicatesFrequency'],
      relatedData: { frequency: duplicatesFrequency },
    });
  }

  // 13. Missing Info Percentage
  const missingInfoPercent = leads.missingInfoPercent || 0;
  if (missingInfoPercent >= 30) {
    addSuggestion(suggestions, 'ai-form-assistant', {
      reason: `${missingInfoPercent}% of leads have missing info - AI assistant will guide users to complete all fields`,
      reasonHe: `${missingInfoPercent}% מהלידים חסרי מידע - עוזר AI ינחה משתמשים למלא את כל השדות`,
      relevanceScore: 8,
      dataSource: ['leadsAndSales.missingInfoPercent'],
      relatedData: { missingPercent: missingInfoPercent },
    });
  }

  // 14. Speed to Lead - After Hours & Weekends
  const afterHours = leads.speedToLead?.afterHours;
  const weekends = leads.speedToLead?.weekends;
  if (afterHours === 'no_response' || weekends === 'no_response') {
    addSuggestion(suggestions, 'ai-sales-agent', {
      reason:
        'No response after hours/weekends - AI sales agent works 24/7 and never sleeps',
      reasonHe:
        'אין מענה מחוץ לשעות/סופי שבוע - סוכן AI למכירות עובד 24/7 ולא ישן',
      relevanceScore: 9,
      dataSource: ['leadsAndSales.speedToLead'],
      relatedData: { afterHours, weekends },
    });
  }

  // 15. Unanswered Leads Percentage
  const unansweredPercentage = leads.speedToLead?.unansweredPercentage || 0;
  if (unansweredPercentage >= 20) {
    addSuggestion(suggestions, 'auto-team-alerts', {
      reason: `${unansweredPercentage}% of leads go unanswered - urgent alerts will ensure no lead is missed`,
      reasonHe: `${unansweredPercentage}% מהלידים לא נענים - התראות דחופות יבטיחו שאף ליד לא יפספס`,
      relevanceScore: 10,
      dataSource: ['leadsAndSales.speedToLead'],
      relatedData: { unansweredPercent: unansweredPercentage },
    });
  }

  // 16. Lead Routing - Hot Lead Criteria
  const hotLeadCriteria = leads.leadRouting?.hotLeadCriteria || [];
  if (hotLeadCriteria.length >= 2) {
    addSuggestion(suggestions, 'ai-lead-qualifier', {
      reason: `You have ${hotLeadCriteria.length} hot lead criteria - AI can automatically identify and prioritize them`,
      reasonHe: `יש לך ${hotLeadCriteria.length} קריטריונים ללידים חמים - AI יכול לזהות ולתעדף אותם אוטומטית`,
      relevanceScore: 8,
      dataSource: ['leadsAndSales.leadRouting'],
      relatedData: { criteria: hotLeadCriteria },
    });
  }

  // 17. Follow-up Strategy - Nurturing
  const nurturing = leads.followUp?.nurturing;
  if (nurturing === false || !nurturing) {
    const attempts = leads.followUp?.attempts || 0;
    if (attempts <= 2) {
      addSuggestion(suggestions, 'auto-smart-followup', {
        reason:
          'No nurturing strategy and only ${attempts} follow-up attempts - smart nurturing can increase conversions by 50%',
        reasonHe:
          'אין אסטרטגיית nurturing ורק ${attempts} ניסיונות מעקב - nurturing חכם יכול להגדיל המרות ב-50%',
        relevanceScore: 9,
        dataSource: ['leadsAndSales.followUp'],
        relatedData: { hasNurturing: nurturing, attempts },
      });
    }
  }

  // 18. Appointment Management - Scheduling Time
  const avgSchedulingTime = leads.appointments?.avgSchedulingTime || 0;
  const messagesPerScheduling = leads.appointments?.messagesPerScheduling || 0;
  if (avgSchedulingTime >= 15 || messagesPerScheduling >= 5) {
    addSuggestion(suggestions, 'auto-meeting-scheduler', {
      reason: `${avgSchedulingTime} min + ${messagesPerScheduling} messages to schedule - smart scheduler reduces to 2 minutes`,
      reasonHe: `${avgSchedulingTime} דקות + ${messagesPerScheduling} הודעות לתיאום - מתזמן חכם מקצר ל-2 דקות`,
      relevanceScore: 8,
      dataSource: ['leadsAndSales.appointments'],
      relatedData: {
        schedulingTime: avgSchedulingTime,
        messages: messagesPerScheduling,
      },
    });
  }

  // 19. Appointment Changes Per Week
  const changesPerWeek = leads.appointments?.changesPerWeek || 0;
  if (changesPerWeek >= 5) {
    addSuggestion(suggestions, 'auto-appointment-reminders', {
      reason: `${changesPerWeek} appointment changes/week - automated reminders and confirmations will reduce by 60%`,
      reasonHe: `${changesPerWeek} שינויי פגישות בשבוע - תזכורות ואישורים אוטומטיים יפחיתו ב-60%`,
      relevanceScore: 7,
      dataSource: ['leadsAndSales.appointments'],
      relatedData: { changesPerWeek },
    });
  }
};

const analyzeCustomerServiceModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const service = meeting.modules?.customerService;
  if (!service) return;

  const channels = service.channels || [];
  const totalDailyVolume = channels.reduce(
    (sum, ch) => sum + (ch.volumePerDay || 0),
    0
  );

  // 1. If has many inquiries/day → suggest FAQ bot
  const topQuestions = service.autoResponse?.topQuestions || [];
  if (topQuestions.length >= 5 && totalDailyVolume >= 20) {
    const totalFAQVolume = topQuestions.reduce(
      (sum, q) => sum + (q.frequencyPerDay || 0),
      0
    );
    addSuggestion(suggestions, 'ai-faq-bot', {
      reason: `${topQuestions.length} recurring questions, ${totalFAQVolume} times/day - AI bot will save 15 hours/week`,
      reasonHe: `${topQuestions.length} שאלות חוזרות, ${totalFAQVolume} פעמים/יום - בוט AI יחסוך 15 שעות/שבוע`,
      relevanceScore: 10,
      dataSource: ['customerService.autoResponse'],
      relatedData: {
        questions: topQuestions.length,
        frequency: totalFAQVolume,
      },
    });
  }

  // 2. If has WhatsApp channel → suggest WhatsApp automation
  const hasWhatsApp = channels.some((ch) => ch.type === 'whatsapp');
  if (hasWhatsApp && totalDailyVolume >= 15) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: `High WhatsApp volume (${totalDailyVolume}/day) - AI agent can handle 60-70% of inquiries`,
      reasonHe: `נפח גבוה ב-WhatsApp (${totalDailyVolume}/יום) - סוכן AI יכול לטפל ב-60-70% מהפניות`,
      relevanceScore: 9,
      dataSource: ['customerService.channels'],
      relatedData: { channel: 'whatsapp', volume: totalDailyVolume },
    });
  }

  // 3. If response time is slow → suggest auto-response
  const hasSlowResponse = channels.some((ch) => {
    const time = ch.responseTime;
    return (
      time &&
      (time.includes('hour') ||
        time.includes('day') ||
        time.includes('שע') ||
        time.includes('יום'))
    );
  });
  if (hasSlowResponse) {
    addSuggestion(suggestions, 'auto-team-alerts', {
      reason:
        'Slow response times detected - instant alerts will reduce response time by 70%',
      reasonHe: 'זמני תגובה איטיים - התראות מיידיות יקצרו זמן תגובה ב-70%',
      relevanceScore: 8,
      dataSource: ['customerService.channels'],
      relatedData: { slowResponse: true },
    });
  }

  // 4. If has after-hours inquiries → suggest 24/7 AI
  if (totalDailyVolume >= 10) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason:
        'Customer inquiries outside business hours - 24/7 AI agent never sleeps',
      reasonHe: 'פניות לקוחות מחוץ לשעות עבודה - סוכן AI 24/7 תמיד זמין',
      relevanceScore: 8,
      dataSource: ['customerService.channels'],
      relatedData: { volume: totalDailyVolume },
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
      relatedData: { hoursPerWeek: timeSpent },
    });
  }

  // === NEW: Additional Customer Service Analysis ===

  // 6. Multi-Channel Issues
  const multiChannelIssue = service.multiChannelIssue;
  if (multiChannelIssue && channels.length >= 3) {
    addSuggestion(suggestions, 'auto-system-sync', {
      reason: `${channels.length} service channels with integration issues - multi-channel unification needed`,
      reasonHe: `${channels.length} ערוצי שירות עם בעיות אינטגרציה - נדרש איחוד רב-ערוצי`,
      relevanceScore: 8,
      dataSource: [
        'customerService.multiChannelIssue',
        'customerService.channels',
      ],
      relatedData: { channelCount: channels.length, issue: multiChannelIssue },
    });
  }

  // 7. Community Management
  const community = service.communityManagement;
  if (community?.exists && community.size && community.size >= 100) {
    if (community.eventsPerMonth && community.eventsPerMonth >= 2) {
      addSuggestion(suggestions, 'auto-approval-workflow', {
        reason: `${community.eventsPerMonth} community events/month for ${community.size} members - automation will save registration and reminder time`,
        reasonHe: `${community.eventsPerMonth} אירועי קהילה/חודש עבור ${community.size} חברים - אוטומציה תחסוך זמן רישום ותזכורות`,
        relevanceScore: 7,
        dataSource: ['customerService.communityManagement'],
        relatedData: {
          events: community.eventsPerMonth,
          members: community.size,
        },
      });
    }

    const attendanceRate = community.actualAttendanceRate || 0;
    if (attendanceRate < 70) {
      addSuggestion(suggestions, 'auto-appointment-reminders', {
        reason: `Only ${attendanceRate}% attendance rate - automated reminders can boost to 85%+`,
        reasonHe: `רק ${attendanceRate}% אחוז הגעה - תזכורות אוטומטיות יכולות להגדיל ל-85%+`,
        relevanceScore: 6,
        dataSource: ['customerService.communityManagement'],
        relatedData: { attendanceRate },
      });
    }
  }

  // 8. Reputation Management
  const reputation = service.reputationManagement;
  if (reputation?.reviewsPerMonth && reputation.reviewsPerMonth >= 10) {
    addSuggestion(suggestions, 'auto-notifications', {
      reason: `${reputation.reviewsPerMonth} reviews/month - automated alerts for new reviews will improve response time`,
      reasonHe: `${reputation.reviewsPerMonth} ביקורות/חודש - התראות אוטומטיות לביקורות חדשות ישפרו זמן תגובה`,
      relevanceScore: 6,
      dataSource: ['customerService.reputationManagement'],
      relatedData: { reviews: reputation.reviewsPerMonth },
    });

    if (reputation.platforms && reputation.platforms.length >= 3) {
      addSuggestion(suggestions, 'auto-reports', {
        reason: `Monitoring ${reputation.platforms.length} review platforms - automated dashboard will centralize all feedback`,
        reasonHe: `מעקב אחר ${reputation.platforms.length} פלטפורמות ביקורות - דשבורד אוטומטי ירכז את כל המשוב`,
        relevanceScore: 7,
        dataSource: ['customerService.reputationManagement'],
        relatedData: { platforms: reputation.platforms },
      });
    }
  }

  // 9. Customer Onboarding
  const onboarding = service.onboarding;
  if (onboarding?.steps && onboarding.steps.length >= 5) {
    addSuggestion(suggestions, 'auto-service-workflow', {
      reason: `${onboarding.steps.length}-step onboarding process - automation will ensure consistency and save time`,
      reasonHe: `תהליך onboarding של ${onboarding.steps.length} שלבים - אוטומציה תבטיח עקביות ותחסוך זמן`,
      relevanceScore: 7,
      dataSource: ['customerService.onboarding'],
      relatedData: { steps: onboarding.steps.length },
    });

    if (onboarding.missingAlerts) {
      addSuggestion(suggestions, 'auto-team-alerts', {
        reason:
          'Onboarding lacks automated alerts - critical steps may be missed without notifications',
        reasonHe:
          'ל-onboarding חסרות התראות אוטומטיות - שלבים קריטיים עלולים להתפספס ללא הודעות',
        relevanceScore: 8,
        dataSource: ['customerService.onboarding'],
        relatedData: { missingAlerts: true },
      });
    }
  }
};

const analyzeOperationsModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const ops = meeting.modules?.operations;
  if (!ops) return;

  // DEPRECATED: systemSync property removed in OperationsModule v2
  // Lines 236-257 removed - old code checked ops.systemSync for system integration needs
  // Future: Could analyze workProcesses or projectManagement for integration opportunities

  // 2. If has document management needs → suggest automation
  const docFlows = ops.documentManagement?.flows || [];
  const totalDocVolume = docFlows.reduce(
    (sum, flow) => sum + (flow.volumePerMonth || 0),
    0
  );

  if (totalDocVolume >= 50) {
    addSuggestion(suggestions, 'auto-document-mgmt', {
      reason: `${totalDocVolume} document flows/month - automation will save 70%`,
      reasonHe: `${totalDocVolume} זרימות מסמכים/חודש - אוטומציה תחסוך 70%`,
      relevanceScore: 8,
      dataSource: ['operations.documentManagement'],
      relatedData: { volume: totalDocVolume },
    });
  }

  // 3. If has project management issues → suggest automation
  const projectIssues = ops.projectManagement?.issues || [];
  if (projectIssues.length >= 2) {
    addSuggestion(suggestions, 'auto-project-mgmt', {
      reason: `${projectIssues.length} project management issues identified - automation will streamline`,
      reasonHe: `${projectIssues.length} בעיות בניהול פרויקטים - אוטומציה תייעל`,
      relevanceScore: 7,
      dataSource: ['operations.projectManagement'],
      relatedData: { issues: projectIssues.length },
    });
  }

  // DEPRECATED: financialProcesses.invoicing removed in OperationsModule v2
  // Lines 289-299 removed - old code checked invoicing volume and time
  // Future: Could check documentManagement.flows for invoice-related workflows

  // DEPRECATED: crossDepartment property removed in OperationsModule v2
  // Lines 303-312 removed - old code checked transfers for problematic handoffs
  // Future: Could analyze workProcesses for cross-department workflow issues

  // 6. If has approval processes → automate them
  if (docFlows.length >= 3) {
    addSuggestion(suggestions, 'auto-approval-workflow', {
      reason:
        'Multiple document flows require approvals - automation will speed up by 80%',
      reasonHe: 'זרימות מסמכים מרובות דורשות אישורים - אוטומציה תזרז ב-80%',
      relevanceScore: 7,
      dataSource: ['operations'],
      relatedData: {},
    });
  }

  // === NEW: Comprehensive Operations Analysis ===

  // 7. Work Processes Analysis
  const workProcesses = ops.workProcesses;
  if (workProcesses?.processes && workProcesses.processes.length >= 3) {
    const totalSteps = workProcesses.processes.reduce(
      (sum, p) => sum + p.stepCount,
      0
    );
    const avgTime =
      workProcesses.processes.reduce((sum, p) => sum + p.estimatedTime, 0) /
      workProcesses.processes.length;

    addSuggestion(suggestions, 'auto-end-to-end', {
      reason: `${workProcesses.processes.length} business processes with ${totalSteps} total steps - end-to-end automation recommended`,
      reasonHe: `${workProcesses.processes.length} תהליכי עבודה עם ${totalSteps} שלבים כוללים - מומלצת אוטומציה מקצה לקצה`,
      relevanceScore: 9,
      dataSource: ['operations.workProcesses'],
      relatedData: {
        processCount: workProcesses.processes.length,
        totalSteps,
        avgTime,
      },
    });

    if (workProcesses.automationReadiness >= 70) {
      addSuggestion(suggestions, 'auto-complex-logic', {
        reason: `${workProcesses.automationReadiness}% automation readiness - processes are well-documented and ready to automate`,
        reasonHe: `${workProcesses.automationReadiness}% מוכנות לאוטומציה - תהליכים מתועדים היטב ומוכנים לאוטומציה`,
        relevanceScore: 10,
        dataSource: ['operations.workProcesses'],
        relatedData: { readiness: workProcesses.automationReadiness },
      });
    }
  }

  // 8. Document Management Deep Analysis
  const docMgmt = ops.documentManagement;
  if (docMgmt) {
    if (docMgmt.searchDifficulties && docMgmt.searchDifficulties.length > 20) {
      addSuggestion(suggestions, 'impl-project-management', {
        reason:
          'Document search difficulties - proper document management system will improve findability by 300%',
        reasonHe:
          'קשיים בחיפוש מסמכים - מערכת ניהול מסמכים תשפר יכולת איתור ב-300%',
        relevanceScore: 7,
        dataSource: ['operations.documentManagement'],
        relatedData: { issue: 'search_difficulties' },
      });
    }

    if (
      docMgmt.versionControlMethod === 'none' ||
      docMgmt.versionControlMethod === 'manual_naming'
    ) {
      addSuggestion(suggestions, 'auto-document-mgmt', {
        reason:
          'No proper version control - automated versioning will prevent confusion and data loss',
        reasonHe:
          'אין ניהול גרסאות תקין - ניהול גרסאות אוטומטי ימנע בלבול ואובדן מידע',
        relevanceScore: 7,
        dataSource: ['operations.documentManagement'],
        relatedData: { versionControl: docMgmt.versionControlMethod },
      });
    }
  }

  // 9. Project Management Detailed Analysis
  const projectMgmt = ops.projectManagement;
  if (projectMgmt) {
    const deadlineMissRate = projectMgmt.deadlineMissRate || 0;
    if (deadlineMissRate >= 30) {
      addSuggestion(suggestions, 'auto-project-mgmt', {
        reason: `${deadlineMissRate}% projects miss deadlines - automated tracking and alerts will improve on-time delivery`,
        reasonHe: `${deadlineMissRate}% מהפרויקטים מחטיאים דדליינים - מעקב והתראות אוטומטיות ישפרו הגשה בזמן`,
        relevanceScore: 9,
        dataSource: ['operations.projectManagement'],
        relatedData: { missRate: deadlineMissRate },
      });
    }

    if (
      projectMgmt.resourceAllocationMethod === 'manual' ||
      projectMgmt.resourceAllocationMethod === 'none'
    ) {
      addSuggestion(suggestions, 'auto-project-mgmt', {
        reason:
          'Manual resource allocation - automation will optimize team utilization and prevent burnout',
        reasonHe: 'הקצאת משאבים ידנית - אוטומציה תייעל ניצול צוות ותמנע שחיקה',
        relevanceScore: 8,
        dataSource: ['operations.projectManagement'],
        relatedData: { allocationMethod: projectMgmt.resourceAllocationMethod },
      });
    }

    const timelineAccuracy = projectMgmt.timelineAccuracy || 0;
    if (timelineAccuracy < 60) {
      addSuggestion(suggestions, 'add-dashboard', {
        reason: `Only ${timelineAccuracy}% timeline accuracy - real-time dashboard will improve visibility and planning`,
        reasonHe: `רק ${timelineAccuracy}% דיוק בלוחות זמנים - דשבורד real-time ישפר ראייה ותכנון`,
        relevanceScore: 7,
        dataSource: ['operations.projectManagement'],
        relatedData: { accuracy: timelineAccuracy },
      });
    }
  }

  // 10. HR Automation Opportunities
  const hr = ops.hr;
  if (hr) {
    if (hr.onboardingSteps >= 10 || hr.onboardingDuration >= 14) {
      addSuggestion(suggestions, 'auto-service-workflow', {
        reason: `${hr.onboardingSteps} onboarding steps taking ${hr.onboardingDuration} days - automation will ensure consistency`,
        reasonHe: `${hr.onboardingSteps} שלבי onboarding שלוקחים ${hr.onboardingDuration} ימים - אוטומציה תבטיח עקביות`,
        relevanceScore: 7,
        dataSource: ['operations.hr'],
        relatedData: {
          steps: hr.onboardingSteps,
          duration: hr.onboardingDuration,
        },
      });
    }

    const turnoverRate = hr.employeeTurnoverRate || 0;
    if (turnoverRate >= 20) {
      addSuggestion(suggestions, 'auto-reports', {
        reason: `${turnoverRate}% employee turnover - automated surveys and analytics can identify retention issues`,
        reasonHe: `${turnoverRate}% תחלופת עובדים - סקרים וניתוחים אוטומטיים יכולים לזהות בעיות שימור`,
        relevanceScore: 6,
        dataSource: ['operations.hr'],
        relatedData: { turnover: turnoverRate },
      });
    }
  }

  // 11. Logistics & Inventory
  const logistics = ops.logistics;
  if (logistics) {
    if (
      logistics.inventoryMethod === 'manual' ||
      logistics.inventoryMethod === 'excel'
    ) {
      addSuggestion(suggestions, 'impl-erp', {
        reason: `Manual/Excel inventory management - ERP system will prevent stockouts and overstocking`,
        reasonHe: `ניהול מלאי ידני/Excel - מערכת ERP תמנע חוסרים ועודפים במלאי`,
        relevanceScore: 8,
        dataSource: ['operations.logistics'],
        relatedData: { method: logistics.inventoryMethod },
      });
    }

    const inventoryAccuracy = logistics.inventoryAccuracy || 0;
    if (inventoryAccuracy < 90) {
      addSuggestion(suggestions, 'auto-system-sync', {
        reason: `Only ${inventoryAccuracy}% inventory accuracy - automated sync will improve to 99%+`,
        reasonHe: `רק ${inventoryAccuracy}% דיוק מלאי - סנכרון אוטומטי ישפר ל-99%+`,
        relevanceScore: 9,
        dataSource: ['operations.logistics'],
        relatedData: { accuracy: inventoryAccuracy },
      });
    }

    if (logistics.orderFulfillmentTime >= 5) {
      addSuggestion(suggestions, 'auto-end-to-end', {
        reason: `${logistics.orderFulfillmentTime} days order fulfillment - automation can reduce to 1-2 days`,
        reasonHe: `${logistics.orderFulfillmentTime} ימי עיבוד הזמנה - אוטומציה יכולה לקצר ל-1-2 ימים`,
        relevanceScore: 8,
        dataSource: ['operations.logistics'],
        relatedData: { fulfillmentDays: logistics.orderFulfillmentTime },
      });
    }
  }
};

const analyzeReportingModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const reporting = meeting.modules?.reporting;
  if (!reporting) return;

  // 1. If has manual reports → suggest automation
  const scheduledReports = reporting.scheduledReports || [];
  const totalReportTime = scheduledReports.reduce(
    (sum, report) => sum + (report.timeToCreate || 0),
    0
  );

  if (scheduledReports.length >= 2 || totalReportTime >= 5) {
    addSuggestion(suggestions, 'auto-reports', {
      reason: `${scheduledReports.length} manual reports taking ${totalReportTime} hours - automation will save 90%`,
      reasonHe: `${scheduledReports.length} דוחות ידניים לוקחים ${totalReportTime} שעות - אוטומציה תחסוך 90%`,
      relevanceScore: 9,
      dataSource: ['reporting.scheduledReports'],
      relatedData: { reports: scheduledReports.length, hours: totalReportTime },
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
      relatedData: { kpiCount: kpis.length },
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
      relatedData: { alerts: alerts.length },
    });
  }

  // === NEW: Dashboards Analysis ===
  const dashboards = reporting.dashboards;
  if (dashboards && !dashboards.exists) {
    addSuggestion(suggestions, 'add-dashboard', {
      reason:
        'No existing dashboard - real-time visibility is critical for data-driven decisions',
      reasonHe: 'אין דשבורד קיים - ראייה בזמן אמת קריטית להחלטות מונעות נתונים',
      relevanceScore: 8,
      dataSource: ['reporting.dashboards'],
      relatedData: { exists: false },
    });
  } else if (dashboards?.exists && !dashboards.realTime) {
    addSuggestion(suggestions, 'add-dashboard', {
      reason:
        'Dashboard exists but not real-time - upgrade to live data will improve decision speed',
      reasonHe:
        'יש דשבורד אך לא בזמן אמת - שדרוג לנתונים חיים ישפר מהירות החלטות',
      relevanceScore: 7,
      dataSource: ['reporting.dashboards'],
      relatedData: { realTime: false },
    });
  }
};

const analyzeSystemsModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const systems = meeting.modules?.systems;
  if (!systems) return;

  // 1. If has poor data quality → suggest data cleaning
  const dataQuality = systems.dataQuality?.overall;
  if (dataQuality === 'poor' || dataQuality === 'medium') {
    addSuggestion(suggestions, 'add-data-clean', {
      reason:
        'Poor data quality detected - cleaning will improve efficiency by 40%',
      reasonHe: 'איכות נתונים ירודה - ניקוי ישפר יעילות ב-40%',
      relevanceScore: 8,
      dataSource: ['systems.dataQuality'],
      relatedData: { quality: dataQuality },
    });
  }

  // 2. If has integration issues → suggest integration services
  const integrationLevel = systems.integrations?.level;
  const integrationIssues = systems.integrations?.issues || [];
  if (
    integrationLevel === 'none' ||
    integrationLevel === 'minimal' ||
    integrationIssues.length >= 2
  ) {
    const systemsList = systems.currentSystems || [];
    if (systemsList.length >= 2 && systemsList.length <= 3) {
      addSuggestion(suggestions, 'int-complex', {
        reason: `${systemsList.length} systems with integration issues - connect them seamlessly`,
        reasonHe: `${systemsList.length} מערכות עם בעיות אינטגרציה - חבר אותן בצורה חלקה`,
        relevanceScore: 9,
        dataSource: ['systems.integrations', 'systems.currentSystems'],
        relatedData: { systems: systemsList.length, issues: integrationIssues },
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
      relatedData: { needs: apiNeeds },
    });
  }

  // 4. If has no CRM → suggest implementation
  const hasCRM = (systems.currentSystems || []).some(
    (s) =>
      s.toLowerCase().includes('crm') ||
      s.toLowerCase().includes('salesforce') ||
      s.toLowerCase().includes('hubspot') ||
      s.toLowerCase().includes('zoho')
  );
  if (!hasCRM) {
    const overview = meeting.modules?.overview;
    const employees = overview?.employees;
    // Only suggest if business size warrants it (employees is number, so check if > 10)
    if (employees && employees > 10) {
      addSuggestion(suggestions, 'impl-crm', {
        reason:
          'No CRM detected - implementing one will improve lead management by 300%',
        reasonHe: 'לא זוהה CRM - הטמעה תשפר ניהול לידים ב-300%',
        relevanceScore: 7,
        dataSource: ['systems.currentSystems'],
        relatedData: { hasCRM: false },
      });
    }
  }

  // === NEW: Detailed Systems Analysis ===

  // 5. Detailed Systems with Pain Points
  const detailedSystems = systems.detailedSystems || [];
  detailedSystems.forEach((sys) => {
    if (sys.satisfactionScore <= 2 && sys.mainPainPoints.length >= 2) {
      if (
        sys.migrationWillingness === 'eager' ||
        sys.migrationWillingness === 'open'
      ) {
        addSuggestion(suggestions, 'impl-crm', {
          reason: `${sys.specificSystem} has satisfaction score ${sys.satisfactionScore}/5 and ${sys.mainPainPoints.length} pain points - migration ready`,
          reasonHe: `${sys.specificSystem} עם שביעות רצון ${sys.satisfactionScore}/5 ו-${sys.mainPainPoints.length} נקודות כאב - מוכן למעבר`,
          relevanceScore: 9,
          dataSource: ['systems.detailedSystems'],
          relatedData: {
            system: sys.specificSystem,
            satisfaction: sys.satisfactionScore,
            painPoints: sys.mainPainPoints,
          },
        });
      } else {
        addSuggestion(suggestions, 'int-complex', {
          reason: `${sys.specificSystem} has ${sys.mainPainPoints.length} pain points but migration reluctant - integration recommended`,
          reasonHe: `${sys.specificSystem} עם ${sys.mainPainPoints.length} נקודות כאב אך חשש ממעבר - מומלצת אינטגרציה`,
          relevanceScore: 7,
          dataSource: ['systems.detailedSystems'],
          relatedData: {
            system: sys.specificSystem,
            painPoints: sys.mainPainPoints,
          },
        });
      }
    }

    // Integration needs analysis
    if (sys.integrationNeeds && sys.integrationNeeds.length >= 2) {
      const criticalIntegrations = sys.integrationNeeds.filter(
        (i) => i.criticalityLevel === 'critical'
      );
      if (criticalIntegrations.length >= 1) {
        addSuggestion(suggestions, 'integration-complex', {
          reason: `${sys.specificSystem} needs ${criticalIntegrations.length} critical integrations`,
          reasonHe: `${sys.specificSystem} זקוק ל-${criticalIntegrations.length} אינטגרציות קריטיות`,
          relevanceScore: 9,
          dataSource: ['systems.detailedSystems'],
          relatedData: {
            system: sys.specificSystem,
            integrations: criticalIntegrations.length,
          },
        });
      }
    }
  });

  // 6. Infrastructure Issues
  const infrastructure = systems.infrastructure;
  if (infrastructure?.hosting === 'local_server') {
    addSuggestion(suggestions, 'add-custom-reports', {
      reason:
        'Local server hosting - cloud migration will improve accessibility and reliability',
      reasonHe: 'אירוח על שרת מקומי - מעבר לענן ישפר נגישות ואמינות',
      relevanceScore: 6,
      dataSource: ['systems.infrastructure'],
      relatedData: { hosting: 'local' },
    });
  }
};

const analyzeAIModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
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
        relatedData: { useCases: salesUseCases.length, priority: 'sales' },
      });
    }

    if (priority === 'service' && serviceReadiness === 'ready') {
      const serviceUseCases = ai.service?.useCases || [];
      addSuggestion(suggestions, 'ai-service-agent', {
        reason: `Service AI is ready - ${serviceUseCases.length} use cases identified`,
        reasonHe: `AI לשירות מוכן - ${serviceUseCases.length} מקרי שימוש זוהו`,
        relevanceScore: 10,
        dataSource: ['aiAgents.service'],
        relatedData: { useCases: serviceUseCases.length, priority: 'service' },
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
      relatedData: { potential: 'high' },
    });
  }

  if (servicePotential === 'high') {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: 'High AI potential for customer service identified',
      reasonHe: 'פוטנציאל AI גבוה לשירות זוהה',
      relevanceScore: 8,
      dataSource: ['aiAgents.service'],
      relatedData: { potential: 'high' },
    });
  }

  if (opsPotential === 'high') {
    addSuggestion(suggestions, 'ai-action-agent', {
      reason: 'High AI potential for operations identified',
      reasonHe: 'פוטנציאל AI גבוה לתפעול זוהה',
      relevanceScore: 7,
      dataSource: ['aiAgents.operations'],
      relatedData: { potential: 'high' },
    });
  }

  // 3. Natural language importance → suggest advanced AI
  const nlImportance = ai.naturalLanguageImportance;
  if (nlImportance === 'critical') {
    addSuggestion(suggestions, 'ai-complex-flow', {
      reason:
        'Critical need for natural language - advanced AI agent recommended',
      reasonHe: 'צורך קריטי בשפה טבעית - סוכן AI מתקדם מומלץ',
      relevanceScore: 8,
      dataSource: ['aiAgents.naturalLanguageImportance'],
      relatedData: { importance: nlImportance },
    });
  }

  // === NEW: Agent Specs & Model Selection Analysis ===
  const agentSpecs = ai.agentSpecs || [];
  if (agentSpecs.length >= 3) {
    addSuggestion(suggestions, 'ai-multi-agent', {
      reason: `${agentSpecs.length} AI agent use cases defined - multi-agent system will coordinate them efficiently`,
      reasonHe: `${agentSpecs.length} מקרי שימוש של AI מוגדרים - מערכת רב-סוכנית תתאם אותם ביעילות`,
      relevanceScore: 9,
      dataSource: ['aiAgents.agentSpecs'],
      relatedData: { specCount: agentSpecs.length },
    });
  }

  const selectedModels = ai.selectedModels || [];
  if (selectedModels.length >= 1) {
    const totalMonthlyCost = selectedModels.reduce(
      (sum, m) => sum + m.estimatedMonthlyCost,
      0
    );
    if (totalMonthlyCost >= 500) {
      addSuggestion(suggestions, 'ai-full-integration', {
        reason: `AI models selected with ${totalMonthlyCost} NIS/month budget - full integration maximizes ROI`,
        reasonHe: `מודלי AI נבחרו עם תקציב ${totalMonthlyCost} ₪/חודש - אינטגרציה מלאה תמקסם ROI`,
        relevanceScore: 8,
        dataSource: ['aiAgents.selectedModels'],
        relatedData: {
          monthlyCost: totalMonthlyCost,
          modelCount: selectedModels.length,
        },
      });
    }
  }
};

const analyzeROIModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const roi = meeting.modules?.roi;
  if (!roi) return;

  // Analyze time savings potential
  const automationPotential = roi.timeSavings?.automationPotential;
  if (automationPotential) {
    const hours = parseInt(automationPotential);
    if (!isNaN(hours) && hours >= 10) {
      addSuggestion(suggestions, 'auto-end-to-end', {
        reason: `${hours} hours/week can be saved - comprehensive automation recommended`,
        reasonHe: `${hours} שעות/שבוע ניתן לחסוך - אוטומציה מקיפה מומלצת`,
        relevanceScore: 9,
        dataSource: ['roi.timeSavings'],
        relatedData: { hours },
      });
    }
  }

  // Analyze processes to automate
  const processes = roi.timeSavings?.processes || [];
  if (processes.length >= 5) {
    addSuggestion(suggestions, 'auto-complex-logic', {
      reason: `${processes.length} processes identified for automation`,
      reasonHe: `${processes.length} תהליכים זוהו לאוטומציה`,
      relevanceScore: 8,
      dataSource: ['roi.timeSavings'],
      relatedData: { processes: processes.length },
    });
  }

  // Check success metrics
  const metrics = roi.successMetrics || [];
  if (metrics.includes('reporting') || metrics.includes('data_quality')) {
    addSuggestion(suggestions, 'add-custom-reports', {
      reason:
        'Reporting and data quality are success metrics - custom reports will track progress',
      reasonHe:
        'דיווח ואיכות נתונים הם מדדי הצלחה - דוחות מותאמים יעקבו אחר התקדמות',
      relevanceScore: 6,
      dataSource: ['roi.successMetrics'],
      relatedData: { metrics },
    });
  }

  // === NEW: ROI Scenarios & Investment Analysis ===
  const scenarios = roi.scenarios;
  if (scenarios) {
    const realistic = scenarios.realistic;
    if (realistic && realistic.paybackPeriod <= 12) {
      addSuggestion(suggestions, 'auto-end-to-end', {
        reason: `Realistic scenario shows ${realistic.paybackPeriod} month payback - excellent ROI opportunity`,
        reasonHe: `תרחיש ריאלי מראה החזר של ${realistic.paybackPeriod} חודשים - הזדמנות ROI מצוינת`,
        relevanceScore: 10,
        dataSource: ['roi.scenarios'],
        relatedData: {
          payback: realistic.paybackPeriod,
          roi12: realistic.roi12Month,
        },
      });
    }
  }

  const implementationCosts = roi.implementationCosts;
  const ongoingCosts = roi.ongoingCosts;
  if (implementationCosts && ongoingCosts) {
    const totalImpl = implementationCosts.total || 0;
    const monthlyOngoing = ongoingCosts.total || 0;
    const summary = roi.summary;
    const monthlySaving = summary?.totalMonthlySaving || 0;

    if (monthlySaving > monthlyOngoing * 3) {
      addSuggestion(suggestions, 'auto-complex-logic', {
        reason: `Monthly savings (${monthlySaving} NIS) are 3x ongoing costs (${monthlyOngoing} NIS) - strong business case`,
        reasonHe: `חיסכון חודשי (${monthlySaving} ₪) פי-3 מעלויות שוטפות (${monthlyOngoing} ₪) - מקרה עסקי חזק`,
        relevanceScore: 9,
        dataSource: [
          'roi.implementationCosts',
          'roi.ongoingCosts',
          'roi.summary',
        ],
        relatedData: { monthlySaving, monthlyOngoing, totalImpl },
      });
    }
  }
};

const analyzeEssentialDetailsModule = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const essentials = meeting.modules?.essentialDetails;
  if (!essentials) return;

  // ========== LEAD MANAGEMENT SECTION (Fields 15-20) ==========
  const leadMgmt = essentials.leadManagement;
  if (leadMgmt) {
    // FIELD 15: whatHappensWhenLeadArrives - Lead handling process
    if (
      leadMgmt.whatHappensWhenLeadArrives &&
      leadMgmt.whatHappensWhenLeadArrives.toLowerCase().includes('manual')
    ) {
      addSuggestion(suggestions, 'auto-lead-workflow', {
        reason:
          'Lead handling is manual - automated lead workflow will save hours daily',
        reasonHe: 'טיפול בלידים ידני - workflow אוטומטי לידים יחסוך שעות ביום',
        relevanceScore: 9,
        dataSource: [
          'essentialDetails.leadManagement.whatHappensWhenLeadArrives',
        ],
        relatedData: { process: leadMgmt.whatHappensWhenLeadArrives },
      });
    }

    // FIELD 16: whoResponsible - Lead responsibility assignment
    if (
      leadMgmt.whoResponsible &&
      leadMgmt.whoResponsible.toLowerCase().includes('manual')
    ) {
      addSuggestion(suggestions, 'auto-lead-workflow', {
        reason:
          'Manual lead assignment - automated routing will ensure instant distribution',
        reasonHe: 'הקצאת לידים ידנית - ניתוב אוטומטי יבטיח חלוקה מיידית',
        relevanceScore: 8,
        dataSource: ['essentialDetails.leadManagement.whoResponsible'],
        relatedData: { responsibility: leadMgmt.whoResponsible },
      });
    }

    // FIELD 17: timeToFirstContact - Response time analysis
    if (
      leadMgmt.timeToFirstContact &&
      (leadMgmt.timeToFirstContact.includes('hour') ||
        leadMgmt.timeToFirstContact.includes('day') ||
        leadMgmt.timeToFirstContact.includes('שע') ||
        leadMgmt.timeToFirstContact.includes('יום'))
    ) {
      addSuggestion(suggestions, 'auto-sms-whatsapp', {
        reason: `First contact time is ${leadMgmt.timeToFirstContact} - instant automated response will increase conversions by 30%`,
        reasonHe: `זמן מגע ראשון הוא ${leadMgmt.timeToFirstContact} - תגובה אוטומטית מיידית תגדיל המרות ב-30%`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.leadManagement.timeToFirstContact'],
        relatedData: {
          contactTime: leadMgmt.timeToFirstContact,
          priority: 'HIGH-IMPACT',
        },
      });
    }

    // FIELD 18: leadTrackingMethod - Tracking system analysis
    if (
      leadMgmt.leadTrackingMethod &&
      (leadMgmt.leadTrackingMethod.includes('excel') ||
        leadMgmt.leadTrackingMethod.includes('manual') ||
        leadMgmt.leadTrackingMethod.includes('ידני'))
    ) {
      addSuggestion(suggestions, 'impl-crm', {
        reason: `Lead tracking in ${leadMgmt.leadTrackingMethod} - CRM implementation is URGENT`,
        reasonHe: `מעקב לידים ב-${leadMgmt.leadTrackingMethod} - הטמעת CRM דחופה`,
        relevanceScore: 10,
        dataSource: ['essentialDetails.leadManagement.leadTrackingMethod'],
        relatedData: {
          method: leadMgmt.leadTrackingMethod,
          priority: 'URGENT',
        },
      });
    }

    // FIELD 19-20: leadLossReasons - Analyze why leads are lost
    if (leadMgmt.leadLossReasons && leadMgmt.leadLossReasons.length >= 2) {
      addSuggestion(suggestions, 'auto-smart-followup', {
        reason: `${leadMgmt.leadLossReasons.length} lead loss reasons identified - smart automation can prevent 40% of losses`,
        reasonHe: `${leadMgmt.leadLossReasons.length} סיבות לאובדן לידים זוהו - אוטומציה חכמה יכולה למנוע 40% מההפסדים`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.leadManagement.leadLossReasons'],
        relatedData: {
          lossReasons: leadMgmt.leadLossReasons,
          priority: 'HIGH-IMPACT',
        },
      });

      // If slow response is a loss reason
      const hasSlowResponse = leadMgmt.leadLossReasons.some(
        (r) =>
          r.toLowerCase().includes('slow') ||
          r.toLowerCase().includes('איט') ||
          r.toLowerCase().includes('מהיר')
      );
      if (hasSlowResponse) {
        addSuggestion(suggestions, 'auto-team-alerts', {
          reason:
            'Slow response causes lead loss - instant alerts will prevent this',
          reasonHe: 'תגובה איטית גורמת לאובדן לידים - התראות מיידיות ימנעו זאת',
          relevanceScore: 10,
          dataSource: ['essentialDetails.leadManagement.leadLossReasons'],
          relatedData: { reason: 'slow_response', priority: 'URGENT' },
        });
      }
    }
  }

  // ========== SALES PROCESS SECTION (Fields 21-26) ==========
  const salesProcess = essentials.salesProcess;
  if (salesProcess) {
    // FIELD 21: salesStages - Sales pipeline stages
    if (salesProcess.salesStages && salesProcess.salesStages.length >= 5) {
      addSuggestion(suggestions, 'auto-sales-pipeline', {
        reason: `${salesProcess.salesStages.length} sales stages - complete pipeline automation will ensure no opportunity is lost`,
        reasonHe: `${salesProcess.salesStages.length} שלבי מכירה - אוטומציית pipeline מלאה תבטיח שלא תאבד הזדמנות`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.salesProcess.salesStages'],
        relatedData: { stageCount: salesProcess.salesStages.length },
      });
    }

    // FIELD 22: stageCriteria - Stage movement criteria
    if (salesProcess.stageCriteria && salesProcess.stageCriteria.length >= 3) {
      addSuggestion(suggestions, 'auto-sales-pipeline', {
        reason: `${salesProcess.stageCriteria.length} stage criteria defined - automation will enforce consistent sales process`,
        reasonHe: `${salesProcess.stageCriteria.length} קריטריונים לשלבים מוגדרים - אוטומציה תאכוף תהליך מכירה עקבי`,
        relevanceScore: 8,
        dataSource: ['essentialDetails.salesProcess.stageCriteria'],
        relatedData: { criteriaCount: salesProcess.stageCriteria.length },
      });
    }

    // FIELD 23: averageSalesCycle - Sales cycle duration
    if (
      salesProcess.averageSalesCycle &&
      salesProcess.averageSalesCycle >= 30
    ) {
      addSuggestion(suggestions, 'auto-lead-workflow', {
        reason: `${salesProcess.averageSalesCycle} day sales cycle - automation will reduce by 40%`,
        reasonHe: `מחזור מכירה של ${salesProcess.averageSalesCycle} ימים - אוטומציה תקצר ב-40%`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.salesProcess.averageSalesCycle'],
        relatedData: {
          salesCycle: salesProcess.averageSalesCycle,
          priority: 'HIGH-IMPACT',
        },
      });
    }

    // FIELD 24: conversionRate - Low conversion triggers AI
    if (salesProcess.conversionRate && salesProcess.conversionRate < 20) {
      addSuggestion(suggestions, 'ai-sales-agent', {
        reason: `${salesProcess.conversionRate}% conversion rate - AI sales agent can improve to 30%+ through better qualification and follow-up`,
        reasonHe: `${salesProcess.conversionRate}% אחוז המרה - סוכן AI למכירות יכול לשפר ל-30%+ דרך סינון ומעקב טובים יותר`,
        relevanceScore: 10,
        dataSource: ['essentialDetails.salesProcess.conversionRate'],
        relatedData: {
          conversionRate: salesProcess.conversionRate,
          priority: 'URGENT',
        },
      });
    }

    // FIELD 25: opportunityTrackingMethod - Tracking opportunities
    if (
      salesProcess.opportunityTrackingMethod &&
      (salesProcess.opportunityTrackingMethod.includes('manual') ||
        salesProcess.opportunityTrackingMethod.includes('excel') ||
        salesProcess.opportunityTrackingMethod.includes('ידני'))
    ) {
      addSuggestion(suggestions, 'impl-crm', {
        reason: `Opportunity tracking is ${salesProcess.opportunityTrackingMethod} - CRM with pipeline management needed`,
        reasonHe: `מעקב הזדמנויות הוא ${salesProcess.opportunityTrackingMethod} - נדרש CRM עם ניהול pipeline`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.salesProcess.opportunityTrackingMethod'],
        relatedData: { method: salesProcess.opportunityTrackingMethod },
      });
    }

    // FIELD 26: mainSalesBottleneck - Critical bottleneck analysis
    const bottleneck = salesProcess.mainSalesBottleneck?.toLowerCase() || '';
    if (bottleneck) {
      if (bottleneck.includes('follow') || bottleneck.includes('מעקב')) {
        addSuggestion(suggestions, 'auto-smart-followup', {
          reason:
            'Follow-up is main sales bottleneck - smart automation will solve this',
          reasonHe:
            'מעקבים הם צוואר הבקבוק העיקרי במכירות - אוטומציה חכמה תפתור זאת',
          relevanceScore: 10,
          dataSource: ['essentialDetails.salesProcess.mainSalesBottleneck'],
          relatedData: { bottleneck, priority: 'URGENT' },
        });
      } else if (
        bottleneck.includes('qualify') ||
        bottleneck.includes('סינון') ||
        bottleneck.includes('איכות')
      ) {
        addSuggestion(suggestions, 'ai-lead-qualifier', {
          reason:
            'Lead qualification is main bottleneck - AI qualifier will automate this',
          reasonHe:
            'סינון לידים הוא צוואר הבקבוק העיקרי - AI יאמת זאת אוטומטית',
          relevanceScore: 10,
          dataSource: ['essentialDetails.salesProcess.mainSalesBottleneck'],
          relatedData: { bottleneck, priority: 'URGENT' },
        });
      } else if (
        bottleneck.includes('data') ||
        bottleneck.includes('update') ||
        bottleneck.includes('נתונים') ||
        bottleneck.includes('עדכון')
      ) {
        addSuggestion(suggestions, 'auto-crm-update', {
          reason:
            'Data updates are main bottleneck - automatic CRM sync will eliminate this',
          reasonHe:
            'עדכוני נתונים הם צוואר הבקבוק העיקרי - סנכרון אוטומטי של CRM יבטל זאת',
          relevanceScore: 10,
          dataSource: ['essentialDetails.salesProcess.mainSalesBottleneck'],
          relatedData: { bottleneck, priority: 'URGENT' },
        });
      }
    }
  }

  // ========== CUSTOMER SERVICE DETAILS SECTION (Fields 27-31) ==========
  const serviceDetails = essentials.customerServiceDetails;
  if (serviceDetails) {
    // FIELD 27: averageResponseTime - Slow response triggers automation
    if (
      serviceDetails.averageResponseTime &&
      (serviceDetails.averageResponseTime.includes('hour') ||
        serviceDetails.averageResponseTime.includes('day') ||
        serviceDetails.averageResponseTime.includes('שע') ||
        serviceDetails.averageResponseTime.includes('יום'))
    ) {
      addSuggestion(suggestions, 'ai-service-agent', {
        reason: `Average response time ${serviceDetails.averageResponseTime} - AI agent provides instant responses 24/7`,
        reasonHe: `זמן תגובה ממוצע ${serviceDetails.averageResponseTime} - סוכן AI מספק תגובות מיידיות 24/7`,
        relevanceScore: 9,
        dataSource: [
          'essentialDetails.customerServiceDetails.averageResponseTime',
        ],
        relatedData: {
          responseTime: serviceDetails.averageResponseTime,
          priority: 'HIGH-IMPACT',
        },
      });
    }

    // FIELD 28: ticketCategories - Multiple categories suggest automation
    if (
      serviceDetails.ticketCategories &&
      serviceDetails.ticketCategories.length >= 5
    ) {
      addSuggestion(suggestions, 'auto-service-workflow', {
        reason: `${serviceDetails.ticketCategories.length} ticket categories - automated routing and categorization needed`,
        reasonHe: `${serviceDetails.ticketCategories.length} קטגוריות פניות - נדרש ניתוב וקטגוריזציה אוטומטית`,
        relevanceScore: 8,
        dataSource: [
          'essentialDetails.customerServiceDetails.ticketCategories',
        ],
        relatedData: { categoryCount: serviceDetails.ticketCategories.length },
      });
    }

    // FIELD 29: escalationProcess - Manual escalation needs automation
    if (
      serviceDetails.escalationProcess &&
      serviceDetails.escalationProcess.toLowerCase().includes('manual')
    ) {
      addSuggestion(suggestions, 'auto-service-workflow', {
        reason:
          'Manual escalation process - automation will ensure critical issues are escalated instantly',
        reasonHe:
          'תהליך הסלמה ידני - אוטומציה תבטיח הסלמה מיידית של בעיות קריטיות',
        relevanceScore: 8,
        dataSource: [
          'essentialDetails.customerServiceDetails.escalationProcess',
        ],
        relatedData: { process: serviceDetails.escalationProcess },
      });
    }

    // FIELD 30: customerSatisfaction - Low satisfaction triggers AI service
    const satisfaction = serviceDetails.customerSatisfaction || 0;
    if (satisfaction <= 6) {
      addSuggestion(suggestions, 'ai-service-agent', {
        reason: `Customer satisfaction ${satisfaction}/10 - AI service agent will improve response quality and speed`,
        reasonHe: `שביעות רצון לקוחות ${satisfaction}/10 - סוכן AI לשירות ישפר איכות ומהירות תגובה`,
        relevanceScore: 9,
        dataSource: [
          'essentialDetails.customerServiceDetails.customerSatisfaction',
        ],
        relatedData: { satisfaction, priority: 'URGENT' },
      });
    }

    // FIELD 31: repeatIssues - Recurring issues need FAQ bot
    if (
      serviceDetails.repeatIssues &&
      serviceDetails.repeatIssues.length >= 3
    ) {
      addSuggestion(suggestions, 'ai-faq-bot', {
        reason: `${serviceDetails.repeatIssues.length} recurring service issues - AI FAQ bot will handle them automatically`,
        reasonHe: `${serviceDetails.repeatIssues.length} בעיות שירות חוזרות - בוט FAQ AI יטפל בהן אוטומטית`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.customerServiceDetails.repeatIssues'],
        relatedData: {
          repeatIssues: serviceDetails.repeatIssues,
          issueCount: serviceDetails.repeatIssues.length,
        },
      });
    }
  }

  // ========== AUTOMATION OPPORTUNITIES SECTION (Fields 32-34) ==========
  const autoOpp = essentials.automationOpportunities;
  if (autoOpp) {
    // FIELD 32: repetitiveProcesses - Core automation opportunities
    if (
      autoOpp.repetitiveProcesses &&
      autoOpp.repetitiveProcesses.length >= 3
    ) {
      const totalTime = autoOpp.repetitiveProcesses.reduce(
        (sum, p) => sum + (p.timePerExecution || 0),
        0
      );
      const totalDaily = autoOpp.repetitiveProcesses.reduce((sum, p) => {
        const freq = p.frequency?.toLowerCase() || '';
        const time = p.timePerExecution || 0;
        if (freq.includes('day') || freq.includes('יום')) return sum + time;
        if (freq.includes('week') || freq.includes('שבוע'))
          return sum + time / 5;
        if (freq.includes('month') || freq.includes('חודש'))
          return sum + time / 22;
        return sum;
      }, 0);

      addSuggestion(suggestions, 'auto-complex-logic', {
        reason: `${autoOpp.repetitiveProcesses.length} repetitive processes taking ${Math.round(totalDaily)} min/day - automation will save ${Math.round((totalDaily * 22) / 60)} hours/month`,
        reasonHe: `${autoOpp.repetitiveProcesses.length} תהליכים חוזרים לוקחים ${Math.round(totalDaily)} דק'/יום - אוטומציה תחסוך ${Math.round((totalDaily * 22) / 60)} שעות/חודש`,
        relevanceScore: 10,
        dataSource: [
          'essentialDetails.automationOpportunities.repetitiveProcesses',
        ],
        relatedData: {
          processCount: autoOpp.repetitiveProcesses.length,
          totalTime,
          dailyTime: totalDaily,
          priority: 'URGENT',
        },
      });
    }

    // FIELD 33: manualDataEntry - Data entry automation
    if (autoOpp.manualDataEntry && autoOpp.manualDataEntry.length >= 2) {
      addSuggestion(suggestions, 'auto-crm-update', {
        reason: `${autoOpp.manualDataEntry.length} manual data entry tasks - automation will eliminate 90% of this work`,
        reasonHe: `${autoOpp.manualDataEntry.length} משימות הזנת נתונים ידנית - אוטומציה תבטל 90% מעבודה זו`,
        relevanceScore: 9,
        dataSource: [
          'essentialDetails.automationOpportunities.manualDataEntry',
        ],
        relatedData: { entryTasks: autoOpp.manualDataEntry },
      });
    }

    // FIELD 34: automationPriority - Priority level affects urgency
    if (autoOpp.automationPriority) {
      const priority = autoOpp.automationPriority.toLowerCase();
      if (
        priority.includes('high') ||
        priority.includes('urgent') ||
        priority.includes('גבוה') ||
        priority.includes('דחוף')
      ) {
        addSuggestion(suggestions, 'auto-end-to-end', {
          reason:
            'Automation marked as HIGH PRIORITY - end-to-end automation will deliver maximum impact',
          reasonHe:
            'אוטומציה מסומנת בעדיפות גבוהה - אוטומציה מקצה לקצה תספק השפעה מקסימלית',
          relevanceScore: 10,
          dataSource: [
            'essentialDetails.automationOpportunities.automationPriority',
          ],
          relatedData: {
            priority: autoOpp.automationPriority,
            urgency: 'URGENT',
          },
        });
      }
    }
  }

  // ========== SYSTEMS DETAILS SECTION (Fields 35-41) ==========
  const systemsDetails = essentials.systemsDetails;
  if (systemsDetails) {
    // FIELD 35: currentCrmName - CRM identification
    const crmName = systemsDetails.currentCrmName;

    // FIELD 36: crmUsage - How CRM is used
    if (
      systemsDetails.crmUsage &&
      systemsDetails.crmUsage.toLowerCase().includes('limited')
    ) {
      addSuggestion(suggestions, 'impl-crm', {
        reason: `CRM usage is limited - full CRM implementation will unlock 300% more value`,
        reasonHe: `שימוש ב-CRM מוגבל - הטמעת CRM מלאה תפתח 300% יותר ערך`,
        relevanceScore: 8,
        dataSource: ['essentialDetails.systemsDetails.crmUsage'],
        relatedData: { usage: systemsDetails.crmUsage, crmName },
      });
    }

    // FIELD 37: crmLimitations - CRM pain points
    if (
      systemsDetails.crmLimitations &&
      systemsDetails.crmLimitations.length >= 3
    ) {
      // FIELD 38: desiredFeatures - What they want
      if (
        systemsDetails.desiredFeatures &&
        systemsDetails.desiredFeatures.length >= 2
      ) {
        addSuggestion(suggestions, 'impl-crm', {
          reason: `Current CRM has ${systemsDetails.crmLimitations.length} limitations, ${systemsDetails.desiredFeatures.length} desired features identified - migration recommended`,
          reasonHe: `ל-CRM נוכחי ${systemsDetails.crmLimitations.length} מגבלות, ${systemsDetails.desiredFeatures.length} תכונות רצויות זוהו - מומלץ מעבר`,
          relevanceScore: 9,
          dataSource: [
            'essentialDetails.systemsDetails.crmLimitations',
            'essentialDetails.systemsDetails.desiredFeatures',
          ],
          relatedData: {
            limitations: systemsDetails.crmLimitations,
            desiredFeatures: systemsDetails.desiredFeatures,
            crmName,
            priority: 'HIGH-IMPACT',
          },
        });
      }
    }

    // FIELD 39: integrationNeeds - Integration requirements
    if (
      systemsDetails.integrationNeeds &&
      systemsDetails.integrationNeeds.length >= 2
    ) {
      addSuggestion(suggestions, 'integration-complex', {
        reason: `${systemsDetails.integrationNeeds.length} integration needs identified - complex integration solution required`,
        reasonHe: `${systemsDetails.integrationNeeds.length} צרכי אינטגרציה זוהו - נדרש פתרון אינטגרציה מורכב`,
        relevanceScore: 8,
        dataSource: ['essentialDetails.systemsDetails.integrationNeeds'],
        relatedData: { integrations: systemsDetails.integrationNeeds },
      });
    }

    // FIELD 40: userCount - Team size for CRM
    if (systemsDetails.userCount && systemsDetails.userCount >= 10) {
      addSuggestion(suggestions, 'impl-crm', {
        reason: `${systemsDetails.userCount} CRM users - enterprise-grade CRM with proper training needed`,
        reasonHe: `${systemsDetails.userCount} משתמשי CRM - נדרש CRM ברמת ארגון עם הדרכה מתאימה`,
        relevanceScore: 7,
        dataSource: ['essentialDetails.systemsDetails.userCount'],
        relatedData: { userCount: systemsDetails.userCount },
      });
    }

    // FIELD 41: dataVolume - Large data needs better system
    if (
      systemsDetails.dataVolume &&
      (systemsDetails.dataVolume.includes('large') ||
        systemsDetails.dataVolume.includes('enterprise') ||
        systemsDetails.dataVolume.includes('גדול'))
    ) {
      addSuggestion(suggestions, 'data-cleanup', {
        reason: `${systemsDetails.dataVolume} data volume - data cleanup PREREQUISITE before any migration`,
        reasonHe: `נפח נתונים ${systemsDetails.dataVolume} - ניקוי נתונים תנאי מוקדם לכל מעבר`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.systemsDetails.dataVolume'],
        relatedData: {
          volume: systemsDetails.dataVolume,
          priority: 'PREREQUISITE',
        },
      });
    }
  }

  // ========== REPORTING DETAILS SECTION (Fields 42-45) ==========
  const reportingDetails = essentials.reportingDetails;
  if (reportingDetails) {
    // FIELD 42: criticalReports - Critical reporting needs
    if (
      reportingDetails.criticalReports &&
      reportingDetails.criticalReports.length >= 3
    ) {
      addSuggestion(suggestions, 'auto-reports', {
        reason: `${reportingDetails.criticalReports.length} critical reports identified - automation will save 15+ hours/week`,
        reasonHe: `${reportingDetails.criticalReports.length} דוחות קריטיים זוהו - אוטומציה תחסוך 15+ שעות/שבוע`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.reportingDetails.criticalReports'],
        relatedData: { reports: reportingDetails.criticalReports },
      });
    }

    // FIELD 43: reportingFrequency - High frequency needs automation
    if (
      reportingDetails.reportingFrequency &&
      (reportingDetails.reportingFrequency.includes('daily') ||
        reportingDetails.reportingFrequency.includes('יומי'))
    ) {
      addSuggestion(suggestions, 'auto-reports', {
        reason:
          'Daily reporting frequency - automation is critical to eliminate repetitive work',
        reasonHe: 'תדירות דיווח יומית - אוטומציה קריטית לביטול עבודה חוזרת',
        relevanceScore: 10,
        dataSource: ['essentialDetails.reportingDetails.reportingFrequency'],
        relatedData: {
          frequency: reportingDetails.reportingFrequency,
          priority: 'URGENT',
        },
      });
    }

    // FIELD 44: dataGaps - Missing data triggers dashboard
    if (reportingDetails.dataGaps && reportingDetails.dataGaps.length >= 2) {
      addSuggestion(suggestions, 'add-dashboard', {
        reason: `${reportingDetails.dataGaps.length} data gaps identified - real-time dashboard will provide missing insights`,
        reasonHe: `${reportingDetails.dataGaps.length} פערי מידע זוהו - דשבורד real-time יספק תובנות חסרות`,
        relevanceScore: 8,
        dataSource: ['essentialDetails.reportingDetails.dataGaps'],
        relatedData: { gaps: reportingDetails.dataGaps },
      });
    }

    // FIELD 45: decisionMakingChallenges - Decision support needs
    if (reportingDetails.decisionMakingChallenges) {
      addSuggestion(suggestions, 'add-dashboard', {
        reason:
          'Decision-making challenges identified - real-time dashboard with analytics will improve decisions',
        reasonHe:
          'אתגרי קבלת החלטות זוהו - דשבורד real-time עם ניתוחים ישפר החלטות',
        relevanceScore: 8,
        dataSource: [
          'essentialDetails.reportingDetails.decisionMakingChallenges',
        ],
        relatedData: { challenges: reportingDetails.decisionMakingChallenges },
      });
    }
  }

  // ========== AI DETAILS SECTION (Fields 46-49) ==========
  const aiDetails = essentials.aiDetails;
  if (aiDetails) {
    // FIELD 46: aiUseCases - COMBINED with aiReadiness for smart logic
    const useCaseCount = aiDetails.aiUseCases?.length || 0;
    const readiness = aiDetails.aiReadiness?.toLowerCase() || '';

    if (useCaseCount >= 2) {
      if (
        readiness === 'high' ||
        readiness.includes('ready') ||
        readiness.includes('מוכן')
      ) {
        addSuggestion(suggestions, 'ai-multi-agent', {
          reason: `${useCaseCount} AI use cases with HIGH readiness - multi-agent system ready for immediate implementation`,
          reasonHe: `${useCaseCount} מקרי שימוש AI עם מוכנות גבוהה - מערכת רב-סוכנית מוכנה להטמעה מיידית`,
          relevanceScore: 10,
          dataSource: [
            'essentialDetails.aiDetails.aiUseCases',
            'essentialDetails.aiDetails.aiReadiness',
          ],
          relatedData: {
            useCases: aiDetails.aiUseCases,
            readiness: aiDetails.aiReadiness,
            priority: 'URGENT',
          },
        });
      } else if (
        readiness === 'medium' ||
        readiness.includes('partial') ||
        readiness.includes('חלקי')
      ) {
        addSuggestion(suggestions, 'ai-sales-agent', {
          reason: `${useCaseCount} AI use cases with medium readiness - start with focused AI agent, expand later`,
          reasonHe: `${useCaseCount} מקרי שימוש AI עם מוכנות בינונית - התחל עם סוכן AI ממוקד, הרחב מאוחר יותר`,
          relevanceScore: 8,
          dataSource: [
            'essentialDetails.aiDetails.aiUseCases',
            'essentialDetails.aiDetails.aiReadiness',
          ],
          relatedData: {
            useCases: aiDetails.aiUseCases,
            readiness: aiDetails.aiReadiness,
          },
        });
      } else if (
        readiness === 'low' ||
        readiness.includes('not') ||
        readiness.includes('לא')
      ) {
        addSuggestion(suggestions, 'data-cleanup', {
          reason: `${useCaseCount} AI use cases but LOW readiness - data cleanup and system preparation needed FIRST`,
          reasonHe: `${useCaseCount} מקרי שימוש AI אך מוכנות נמוכה - נדרש ניקוי נתונים והכנת מערכות תחילה`,
          relevanceScore: 9,
          dataSource: [
            'essentialDetails.aiDetails.aiUseCases',
            'essentialDetails.aiDetails.aiReadiness',
          ],
          relatedData: {
            useCases: aiDetails.aiUseCases,
            readiness: aiDetails.aiReadiness,
            priority: 'PREREQUISITE',
          },
        });
      }
    }

    // FIELD 47: aiReadiness - Already analyzed above in combination with useCases

    // FIELD 48: dataAvailability - Data availability for AI
    if (
      aiDetails.dataAvailability &&
      (aiDetails.dataAvailability.toLowerCase().includes('poor') ||
        aiDetails.dataAvailability.toLowerCase().includes('limited') ||
        aiDetails.dataAvailability.toLowerCase().includes('חסר'))
    ) {
      addSuggestion(suggestions, 'data-cleanup', {
        reason:
          'Poor data availability for AI - data cleanup and enrichment is PREREQUISITE',
        reasonHe:
          'זמינות נתונים גרועה ל-AI - ניקוי והעשרת נתונים הם תנאי מוקדם',
        relevanceScore: 10,
        dataSource: ['essentialDetails.aiDetails.dataAvailability'],
        relatedData: {
          availability: aiDetails.dataAvailability,
          priority: 'PREREQUISITE',
        },
      });
    }

    // FIELD 49: expectedOutcomes - What they expect from AI
    if (aiDetails.expectedOutcomes && aiDetails.expectedOutcomes.length >= 2) {
      addSuggestion(suggestions, 'ai-full-integration', {
        reason: `${aiDetails.expectedOutcomes.length} expected AI outcomes - full integration will deliver all outcomes`,
        reasonHe: `${aiDetails.expectedOutcomes.length} תוצאות צפויות מ-AI - אינטגרציה מלאה תספק את כל התוצאות`,
        relevanceScore: 9,
        dataSource: ['essentialDetails.aiDetails.expectedOutcomes'],
        relatedData: { outcomes: aiDetails.expectedOutcomes },
      });
    }
  }
};

// ==================== CROSS-MODULE INTELLIGENCE RULES ====================

const applyCrossModuleRules = (
  meeting: Meeting,
  suggestions: SuggestionContext[]
) => {
  const overview = meeting.modules?.overview;
  const essentials = meeting.modules?.essentialDetails;
  const leads = meeting.modules?.leadsAndSales;
  const systems = meeting.modules?.systems;

  // RULE 1: No CRM + Unanswered Leads = URGENT CRM Implementation
  const noCRM = overview?.crmStatus === 'none';
  const unansweredLeads = leads?.speedToLead?.unansweredPercentage || 0;
  if (noCRM && unansweredLeads >= 20) {
    addSuggestion(suggestions, 'impl-crm', {
      reason: `CRITICAL: No CRM + ${unansweredLeads}% unanswered leads - CRM implementation is URGENT PREREQUISITE`,
      reasonHe: `קריטי: אין CRM + ${unansweredLeads}% לידים לא נענים - הטמעת CRM היא תנאי מוקדם דחוף`,
      relevanceScore: 10,
      dataSource: [
        'systems.crmStatus',
        'leadsAndSales.speedToLead.unansweredPercentage',
      ],
      relatedData: {
        noCRM,
        unansweredLeads,
        priority: 'URGENT',
        prerequisite: true,
      },
    });
  }

  // RULE 2: Poor Data Quality + Integration Needs = Data Cleanup FIRST
  const dataQuality = systems?.dataQuality?.overall;
  const hasIntegrationNeeds =
    (systems?.integrations?.issues?.length || 0) >= 2 ||
    (essentials?.systemsDetails?.integrationNeeds?.length || 0) >= 2;
  if (
    (dataQuality === 'poor' || dataQuality === 'medium') &&
    hasIntegrationNeeds
  ) {
    addSuggestion(suggestions, 'data-cleanup', {
      reason: `${dataQuality} data quality + integration needs - data cleanup is PREREQUISITE before integration`,
      reasonHe: `איכות נתונים ${dataQuality} + צרכי אינטגרציה - ניקוי נתונים הוא תנאי מוקדם לאינטגרציה`,
      relevanceScore: 10,
      dataSource: [
        'systems.dataQuality',
        'systems.integrations',
        'essentialDetails.systemsDetails',
      ],
      relatedData: {
        dataQuality,
        hasIntegrationNeeds,
        priority: 'PREREQUISITE',
      },
    });
  }

  // RULE 3: Long Sales Cycle + Low Conversion + No Follow-up = AI + Automation
  const salesCycle = essentials?.salesProcess?.averageSalesCycle || 0;
  const conversionRate = essentials?.salesProcess?.conversionRate || 100;
  const followUpAttempts = leads?.followUp?.attempts || 0;
  if (salesCycle >= 30 && conversionRate < 20 && followUpAttempts <= 2) {
    addSuggestion(suggestions, 'ai-sales-agent', {
      reason: `${salesCycle} day sales cycle + ${conversionRate}% conversion + only ${followUpAttempts} follow-ups - AI sales agent will transform results`,
      reasonHe: `מחזור ${salesCycle} ימים + ${conversionRate}% המרה + רק ${followUpAttempts} מעקבים - סוכן AI למכירות ישנה את התוצאות`,
      relevanceScore: 10,
      dataSource: ['essentialDetails.salesProcess', 'leadsAndSales.followUp'],
      relatedData: {
        salesCycle,
        conversionRate,
        followUpAttempts,
        priority: 'URGENT',
      },
    });

    addSuggestion(suggestions, 'auto-smart-followup', {
      reason: `Critical gap: long sales cycle with minimal follow-up - smart automation needed`,
      reasonHe: `פער קריטי: מחזור מכירה ארוך עם מעקבים מינימליים - נדרשת אוטומציה חכמה`,
      relevanceScore: 9,
      dataSource: ['essentialDetails.salesProcess', 'leadsAndSales.followUp'],
      relatedData: { salesCycle, followUpAttempts, priority: 'HIGH-IMPACT' },
    });
  }

  // RULE 4: Poor Service + High Volume = AI Service Agent URGENT
  const serviceSatisfaction =
    essentials?.customerServiceDetails?.customerSatisfaction || 10;
  const serviceChannels = overview?.serviceChannels || [];
  const totalServiceVolume = serviceChannels.reduce(
    (sum, ch) => sum + (ch.volumePerDay || 0),
    0
  );
  if (serviceSatisfaction <= 6 && totalServiceVolume >= 30) {
    addSuggestion(suggestions, 'ai-service-agent', {
      reason: `CRITICAL: ${serviceSatisfaction}/10 satisfaction + ${totalServiceVolume} inquiries/day - AI service agent is URGENT`,
      reasonHe: `קריטי: ${serviceSatisfaction}/10 שביעות רצון + ${totalServiceVolume} פניות/יום - סוכן AI לשירות דחוף`,
      relevanceScore: 10,
      dataSource: [
        'essentialDetails.customerServiceDetails',
        'overview.serviceChannels',
      ],
      relatedData: {
        satisfaction: serviceSatisfaction,
        volume: totalServiceVolume,
        priority: 'URGENT',
      },
    });
  }

  // RULE 5: Low Budget = Quick Wins Only
  const budget = overview?.budget;
  if (budget === 'low' || budget === '0-10000') {
    // Boost relevance of quick wins, de-prioritize complex solutions
    suggestions.forEach((suggestion) => {
      const isQuickWin =
        suggestion.service.tags?.includes('quick-win') ||
        suggestion.service.complexity === 'simple' ||
        suggestion.service.estimatedDays <= 2;
      const isComplex =
        suggestion.service.complexity === 'complex' ||
        suggestion.service.estimatedDays >= 8;

      if (isQuickWin) {
        suggestion.relevanceScore = Math.min(10, suggestion.relevanceScore + 2);
        suggestion.relatedData = {
          ...suggestion.relatedData,
          budget: 'low',
          quickWin: true,
        };
      } else if (isComplex) {
        suggestion.relevanceScore = Math.max(1, suggestion.relevanceScore - 2);
        suggestion.relatedData = {
          ...suggestion.relatedData,
          budget: 'low',
          deferUntilBudget: true,
        };
      }
    });

    addSuggestion(suggestions, 'auto-lead-response', {
      reason:
        'Low budget - start with quick win: auto lead response delivers immediate value',
      reasonHe:
        'תקציב נמוך - התחל עם quick win: תגובה אוטומטית ללידים מספקת ערך מיידי',
      relevanceScore: 9,
      dataSource: ['overview.budget'],
      relatedData: { budget, strategy: 'quick_wins_first' },
    });
  }

  // RULE 6: High Budget + Large Organization = Comprehensive Solution
  const employees = overview?.employees || 0;
  if ((budget === 'high' || budget === '50000+') && employees >= 30) {
    // Boost comprehensive solutions
    addSuggestion(suggestions, 'auto-end-to-end', {
      reason: `High budget (${budget}) + ${employees} employees - comprehensive end-to-end automation recommended`,
      reasonHe: `תקציב גבוה (${budget}) + ${employees} עובדים - מומלצת אוטומציה מקיפה מקצה לקצה`,
      relevanceScore: 10,
      dataSource: ['overview.budget', 'operations.hr.employeeCount'],
      relatedData: { budget, employees, strategy: 'comprehensive' },
    });

    addSuggestion(suggestions, 'ai-full-integration', {
      reason:
        'High budget + large organization - full AI integration will maximize ROI',
      reasonHe: 'תקציב גבוה + ארגון גדול - אינטגרציית AI מלאה תמקסם ROI',
      relevanceScore: 9,
      dataSource: ['overview.budget', 'operations.hr.employeeCount'],
      relatedData: { budget, employees, strategy: 'comprehensive' },
    });

    // Boost relevance of all complex solutions for high-budget clients
    suggestions.forEach((suggestion) => {
      if (
        suggestion.service.complexity === 'complex' ||
        suggestion.service.basePrice >= 5000
      ) {
        suggestion.relevanceScore = Math.min(10, suggestion.relevanceScore + 2);
        suggestion.relatedData = {
          ...suggestion.relatedData,
          budget: 'high',
          comprehensiveApproach: true,
        };
      }
    });
  }

  // Additional intelligence: Check for prerequisite services
  const hasCRMSuggestion = suggestions.some((s) => s.service.id === 'impl-crm');
  const hasDataCleanup = suggestions.some(
    (s) => s.service.id === 'data-cleanup'
  );
  const hasAdvancedAI = suggestions.some(
    (s) =>
      s.service.category === 'ai_agents' &&
      (s.service.complexity === 'complex' || s.service.complexity === 'medium')
  );

  // If advanced AI suggested but prerequisites missing, flag them
  if (hasAdvancedAI && !hasCRMSuggestion && noCRM) {
    addSuggestion(suggestions, 'impl-crm', {
      reason: 'AI agents require CRM infrastructure - CRM is PREREQUISITE',
      reasonHe: 'סוכני AI דורשים תשתית CRM - CRM הוא תנאי מוקדם',
      relevanceScore: 10,
      dataSource: ['cross-module-intelligence'],
      relatedData: { prerequisiteFor: 'ai_agents', priority: 'PREREQUISITE' },
    });
  }

  if (
    hasAdvancedAI &&
    !hasDataCleanup &&
    (dataQuality === 'poor' || dataQuality === 'medium')
  ) {
    addSuggestion(suggestions, 'data-cleanup', {
      reason: 'AI agents need quality data - data cleanup is PREREQUISITE',
      reasonHe:
        'סוכני AI זקוקים לנתונים איכותיים - ניקוי נתונים הוא תנאי מוקדם',
      relevanceScore: 10,
      dataSource: ['cross-module-intelligence'],
      relatedData: { prerequisiteFor: 'ai_agents', priority: 'PREREQUISITE' },
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

const addSuggestion = (
  suggestions: SuggestionContext[],
  serviceId: string,
  context: Omit<SuggestionContext, 'service'>
) => {
  const service = SERVICES_DATABASE.find((s) => s.id === serviceId);
  if (!service) return;

  // Check if already suggested
  const existing = suggestions.find((s) => s.service.id === serviceId);
  if (existing) {
    // If already exists, increase relevance score if new one is higher
    if (context.relevanceScore > existing.relevanceScore) {
      existing.relevanceScore = context.relevanceScore;
      existing.dataSource = Array.from(
        new Set([...existing.dataSource, ...context.dataSource])
      );
    }
    return;
  }

  suggestions.push({
    service,
    ...context,
  });
};

const generateSummary = (
  meeting: Meeting,
  proposedServices: ProposedService[]
): ProposalSummary => {
  // Count by category
  const automations = proposedServices.filter(
    (s) => s.category === 'automations'
  ).length;
  const aiAgents = proposedServices.filter(
    (s) => s.category === 'ai_agents'
  ).length;
  const integrations = proposedServices.filter(
    (s) => s.category === 'integrations'
  ).length;

  // Count identified processes from all modules with detailed analysis
  let identifiedProcesses = 0;
  const modules = meeting.modules;

  // 1. OVERVIEW MODULE
  const overview = modules?.overview;
  if (overview) {
    if (modules?.operations?.hr?.employeeCount) identifiedProcesses += 1; // Business size is a process dimension
    if (overview.mainChallenge) identifiedProcesses += 1; // Main challenge indicates a process gap
  }

  // 2. ESSENTIAL DETAILS MODULE
  const essentials = modules?.essentialDetails;
  if (essentials) {
    if (essentials.leadManagement) identifiedProcesses += 1;
    if (essentials.salesProcess) identifiedProcesses += 1;
    if (essentials.customerServiceDetails) identifiedProcesses += 1;
    if (essentials.automationOpportunities?.repetitiveProcesses) {
      identifiedProcesses +=
        essentials.automationOpportunities.repetitiveProcesses.length;
    }
    if (essentials.systemsDetails) identifiedProcesses += 1;
  }

  // 3. LEADS & SALES MODULE - Enhanced counting
  const leads = modules?.leadsAndSales;
  if (leads) {
    if (Array.isArray(leads.leadSources))
      identifiedProcesses += leads.leadSources.length;
    if (leads.centralSystem) identifiedProcesses += 1; // Central system is a key process
    if (leads.followUp) identifiedProcesses += 1; // Follow-up is a process
    if (leads.appointments) identifiedProcesses += 1; // Scheduling is a process
    if (leads.leadRouting?.hotLeadCriteria) identifiedProcesses += 1; // Lead scoring is a process
  }

  // 4. CUSTOMER SERVICE MODULE - Enhanced counting
  const service = modules?.customerService;
  if (service) {
    if (Array.isArray(service.channels))
      identifiedProcesses += service.channels.length;
    if (service.autoResponse) identifiedProcesses += 1;
    if (service.communityManagement?.exists) identifiedProcesses += 1;
    if (service.reputationManagement) identifiedProcesses += 1;
    if (service.onboarding) identifiedProcesses += 1;
  }

  // 5. OPERATIONS MODULE - Count all sub-processes
  const ops = modules?.operations;
  if (ops) {
    // Work processes
    if (
      ops.workProcesses?.processes &&
      ops.workProcesses.processes.length > 0
    ) {
      identifiedProcesses += ops.workProcesses.processes.length;
    }

    // Document management
    if (ops.documentManagement?.flows) {
      identifiedProcesses += ops.documentManagement.flows.length;
    }
    if (ops.documentManagement?.versionControlMethod) identifiedProcesses += 1;
    if (ops.documentManagement?.approvalWorkflow) identifiedProcesses += 1;

    // Project management
    if (
      ops.projectManagement?.tools &&
      ops.projectManagement.tools.length > 0
    ) {
      identifiedProcesses += 1;
    }
    if (ops.projectManagement?.resourceAllocationMethod)
      identifiedProcesses += 1;
    if (ops.projectManagement?.issues)
      identifiedProcesses += ops.projectManagement.issues.length;

    // HR processes
    if (ops.hr?.onboardingSteps && ops.hr.onboardingSteps > 0)
      identifiedProcesses += 1;
    if (ops.hr?.performanceReviewFrequency) identifiedProcesses += 1;
    if (ops.hr?.departments) identifiedProcesses += ops.hr.departments.length;

    // Logistics
    if (ops.logistics?.inventoryMethod) identifiedProcesses += 1;
    if (ops.logistics?.shippingProcesses)
      identifiedProcesses += ops.logistics.shippingProcesses.length;
  }

  // 6. REPORTING MODULE - Enhanced counting
  const reporting = modules?.reporting;
  if (reporting) {
    if (reporting.scheduledReports)
      identifiedProcesses += reporting.scheduledReports.length;
    if (reporting.dashboards?.exists) identifiedProcesses += 1;
    if (reporting.realTimeAlerts)
      identifiedProcesses += reporting.realTimeAlerts.length;
  }

  // 7. SYSTEMS MODULE - Count detailed systems
  const systems = modules?.systems;
  if (systems) {
    if (systems.detailedSystems && systems.detailedSystems.length > 0) {
      identifiedProcesses += systems.detailedSystems.length;
    }
    if (systems.infrastructure?.hosting) identifiedProcesses += 1;
    if (systems.infrastructure?.backup) identifiedProcesses += 1;
  }

  // 8. AI AGENTS MODULE - Count AI use cases
  const ai = modules?.aiAgents;
  if (ai) {
    if (ai.agentSpecs && ai.agentSpecs.length > 0) {
      identifiedProcesses += ai.agentSpecs.length;
    }
    if (ai.selectedModels && ai.selectedModels.length > 0) {
      identifiedProcesses += ai.selectedModels.length;
    }
  }

  // 9. ROI MODULE - Count ROI scenarios as strategic processes
  const roi = modules?.roi;
  if (roi) {
    if (roi.scenarios) identifiedProcesses += 3; // Conservative, optimistic, realistic scenarios
    if (roi.implementationCosts) identifiedProcesses += 1; // Investment planning is a process
  }

  // Get potential savings from ROI module with enhanced detail
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
    potentialWeeklySavingsHours,
  };
};
