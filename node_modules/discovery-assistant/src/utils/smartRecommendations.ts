import { Meeting, WorkProcess, DocumentFlow, FAQ } from '../types';

interface Recommendation {
  id: string;
  module: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedSavings?: number;
  automationPotential?: number;
  implementation: string[];
  relatedPainPoints: string[];
  category: 'efficiency' | 'cost' | 'quality' | 'growth' | 'risk';
  timeframe: 'immediate' | 'short' | 'medium' | 'long';
}

interface InsightMetrics {
  totalPainPoints: number;
  automationOpportunities: number;
  estimatedMonthlySavings: number;
  timeWastage: number; // hours per month
  efficiencyScore: number; // 0-100
  digitalMaturityScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  growthPotential: number; // percentage
  customerSatisfactionImpact: number; // 0-100
}

export class SmartRecommendationsEngine {
  private meeting: Meeting;
  private recommendations: Recommendation[] = [];
  private insights: InsightMetrics;

  constructor(meeting: Meeting) {
    this.meeting = meeting;
    this.insights = this.calculateInsights();
    this.generateRecommendations();
  }

  private calculateInsights(): InsightMetrics {
    const modules = this.meeting.modules;
    let totalPainPoints = 0;
    let automationOpportunities = 0;
    let estimatedMonthlySavings = 0;
    let timeWastage = 0;

    // Count pain points
    totalPainPoints = this.meeting.painPoints?.length || 0;

    // Lead & Sales insights
    if (modules.leadsAndSales) {
      const leadData = modules.leadsAndSales;

      // Time wastage from manual lead processing
      // Note: timeToProcessLead is at top level of LeadsAndSalesModule, not in leadSources array
      if (
        leadData.timeToProcessLead &&
        leadData.leadSources &&
        Array.isArray(leadData.leadSources)
      ) {
        const totalMonthlyLeads = leadData.leadSources.reduce(
          (sum, source) => sum + (source.volumePerMonth || 0),
          0
        );
        timeWastage += (leadData.timeToProcessLead * totalMonthlyLeads) / 60;
      }

      // Cost of lost leads
      // Note: costPerLostLead and fallingLeadsPerMonth are at top level, not nested
      if (leadData.costPerLostLead && leadData.fallingLeadsPerMonth) {
        estimatedMonthlySavings +=
          leadData.costPerLostLead * leadData.fallingLeadsPerMonth * 0.3; // Assume 30% can be saved
      }

      // Automation opportunities
      // Note: leadSources is an array of LeadSource, check if any source is 'crm'
      if (
        leadData.leadSources &&
        Array.isArray(leadData.leadSources) &&
        !leadData.leadSources.some((source) => source.channel === 'crm')
      ) {
        automationOpportunities++;
      }
      // Note: FollowUpStrategy doesn't have 'method' property, it has 'channels' array
      // If manual follow-up is being done, channels would be limited or undefined
      if (
        leadData.followUp &&
        (!leadData.followUp.channels || leadData.followUp.channels.length === 0)
      ) {
        automationOpportunities++;
      }
      // Note: LeadsAndSalesModule doesn't have 'qualification' property
      // Count as automation opportunity if lead routing is manual or undefined
      if (!leadData.leadRouting || !leadData.leadRouting.method) {
        automationOpportunities++;
      }
    }

    // Customer Service insights
    if (modules.customerService) {
      const serviceData = modules.customerService;

      // Response time impact - calculate average response time across channels
      if (
        serviceData.channels &&
        Array.isArray(serviceData.channels) &&
        serviceData.channels.length > 0
      ) {
        const channelsWithResponseTime = serviceData.channels.filter((ch) => {
          const time = ch.responseTime;
          return time && typeof time === 'string' && !isNaN(parseInt(time));
        });

        if (channelsWithResponseTime.length > 0) {
          const avgResponseTime =
            channelsWithResponseTime.reduce((sum, ch) => {
              const time = parseInt(ch.responseTime || '0');
              return sum + time;
            }, 0) / channelsWithResponseTime.length;

          if (avgResponseTime > 60) {
            const volumePerDay = serviceData.channels.reduce(
              (sum, ch) => sum + (ch.volumePerDay || 0),
              0
            );
            timeWastage += (avgResponseTime * volumePerDay * 22) / 60; // 22 working days
          }
        }
      }

      // FAQ automation potential
      if (
        serviceData.autoResponse?.topQuestions &&
        Array.isArray(serviceData.autoResponse.topQuestions)
      ) {
        const totalFAQVolume = serviceData.autoResponse.topQuestions.reduce(
          (sum, q: FAQ) => sum + (q?.frequencyPerDay || 0),
          0
        );

        if (totalFAQVolume > 50) {
          automationOpportunities++;
          timeWastage += (totalFAQVolume * 5 * 22) / 60; // 5 min per FAQ, 22 days
        }
      }

      // Multi-channel inefficiency - check if unificationMethod is missing
      // Note: 'unifiedInbox' is not a property of channels array. Check unificationMethod instead.
      if (
        !serviceData.unificationMethod ||
        serviceData.unificationMethod === 'none'
      ) {
        automationOpportunities++;
      }
    }

    // Operations insights
    if (modules.operations) {
      const opsData = modules.operations;

      // Process inefficiencies
      if (opsData.workProcesses?.processes) {
        opsData.workProcesses.processes.forEach((process: WorkProcess) => {
          if (process.stepCount > 10) {
            automationOpportunities++;
          }
          if (process.bottleneck) {
            timeWastage += process.estimatedTime * 0.2; // 20% time loss from bottlenecks
          }
        });
      }

      // Document processing time
      if (
        opsData.documentManagement?.flows &&
        Array.isArray(opsData.documentManagement.flows)
      ) {
        const docTime = opsData.documentManagement.flows.reduce(
          (sum, flow: DocumentFlow) =>
            sum + flow.volumePerMonth * flow.timePerDocument,
          0
        );
        timeWastage += docTime / 60;

        if (docTime > 1000) {
          automationOpportunities++;
        }
      }

      // HR inefficiencies
      if (
        opsData.hr?.onboardingDuration &&
        opsData.hr.onboardingDuration > 30
      ) {
        automationOpportunities++;
      }
    }

    // Calculate scores
    const efficiencyScore = Math.max(0, 100 - (timeWastage / 100) * 10);
    const digitalMaturityScore = this.calculateDigitalMaturity();
    const riskLevel =
      totalPainPoints > 15 ? 'high' : totalPainPoints > 8 ? 'medium' : 'low';
    const growthPotential = Math.min(100, automationOpportunities * 8);
    const customerSatisfactionImpact = this.calculateCustomerImpact();

    return {
      totalPainPoints,
      automationOpportunities,
      estimatedMonthlySavings: Math.round(estimatedMonthlySavings),
      timeWastage: Math.round(timeWastage),
      efficiencyScore: Math.round(efficiencyScore),
      digitalMaturityScore: Math.round(digitalMaturityScore),
      riskLevel,
      growthPotential: Math.round(growthPotential),
      customerSatisfactionImpact: Math.round(customerSatisfactionImpact),
    };
  }

  private calculateDigitalMaturity(): number {
    let score = 50; // Base score
    const modules = this.meeting.modules;

    // Lead management maturity
    // Note: leadSources is an array of LeadSource, not an object with sources property
    if (
      modules.leadsAndSales?.leadSources &&
      Array.isArray(modules.leadsAndSales.leadSources) &&
      modules.leadsAndSales.leadSources.some(
        (source) => source.channel === 'crm'
      )
    )
      score += 5;
    if (
      modules.leadsAndSales?.leadSources &&
      Array.isArray(modules.leadsAndSales.leadSources) &&
      modules.leadsAndSales.leadSources.some(
        (source) => source.channel === 'website'
      )
    )
      score += 5;
    // Note: LeadsAndSalesModule doesn't have 'qualification' property
    // Use leadRouting automation level as alternative indicator
    if (
      modules.leadsAndSales?.leadRouting?.method &&
      Array.isArray(modules.leadsAndSales.leadRouting.method) &&
      modules.leadsAndSales.leadRouting.method.includes('automated')
    )
      score += 10;

    // Customer service maturity
    // Note: channels is an array, check unificationMethod instead for unified inbox
    if (
      modules.customerService?.unificationMethod &&
      modules.customerService.unificationMethod !== 'none'
    )
      score += 10;
    // Note: AutoResponse doesn't have 'hasBot' property
    // Use automationPotential as alternative indicator
    if (
      modules.customerService?.autoResponse?.automationPotential &&
      modules.customerService.autoResponse.automationPotential > 50
    )
      score += 10;

    // Operations maturity
    if (modules.operations?.documentManagement?.versionControlMethod !== 'none')
      score += 5;
    if (
      modules.operations?.projectManagement?.tools &&
      modules.operations.projectManagement.tools.length > 0
    )
      score += 5;

    // AI readiness
    if (modules.aiAgents?.currentAI && modules.aiAgents.currentAI.length > 0)
      score += 10;
    if (modules.aiAgents?.readinessLevel === 'high') score += 10;

    // Systems integration
    if (
      modules.systems?.currentSystems &&
      modules.systems.currentSystems.length > 3
    )
      score += 5;
    if (modules.systems?.integrations?.level === 'full') score += 10;

    return Math.min(100, score);
  }

  private calculateCustomerImpact(): number {
    let impact = 50; // Base impact
    const modules = this.meeting.modules;

    // Response time impact - calculate average response time from channels array
    if (
      modules.customerService?.channels &&
      Array.isArray(modules.customerService.channels) &&
      modules.customerService.channels.length > 0
    ) {
      const channelsWithResponseTime = modules.customerService.channels.filter(
        (ch) => {
          const time = ch.responseTime;
          return time && typeof time === 'string' && !isNaN(parseInt(time));
        }
      );

      if (channelsWithResponseTime.length > 0) {
        const avgResponseTime =
          channelsWithResponseTime.reduce((sum, ch) => {
            const time = parseInt(ch.responseTime || '0');
            return sum + time;
          }, 0) / channelsWithResponseTime.length;

        if (avgResponseTime < 30) impact += 20;
        else if (avgResponseTime > 120) impact -= 20;
      }
    }

    // Service quality
    // Note: channels is an array, check unificationMethod for unified inbox
    if (
      modules.customerService?.unificationMethod &&
      modules.customerService.unificationMethod !== 'none'
    )
      impact += 10;
    // Note: AutoResponse doesn't have 'hasBot' property
    // Use automationPotential as alternative indicator
    if (
      modules.customerService?.autoResponse?.automationPotential &&
      modules.customerService.autoResponse.automationPotential > 50
    )
      impact += 10;

    // Lead response
    // Note: FollowUpStrategy doesn't have 'firstContactTime' property
    // Use speedToLead.duringBusinessHours as alternative
    if (modules.leadsAndSales?.speedToLead?.duringBusinessHours) {
      const responseTime = parseInt(
        modules.leadsAndSales.speedToLead.duringBusinessHours
      );
      if (!isNaN(responseTime)) {
        if (responseTime < 60) impact += 15;
        else if (responseTime > 1440) impact -= 15;
      }
    }

    return Math.max(0, Math.min(100, impact));
  }

  private generateRecommendations(): void {
    this.recommendations = [];

    // Lead & Sales Recommendations
    this.generateLeadRecommendations();

    // Customer Service Recommendations
    this.generateServiceRecommendations();

    // Operations Recommendations
    this.generateOperationsRecommendations();

    // AI & Automation Recommendations
    this.generateAIRecommendations();

    // Systems Integration Recommendations
    this.generateSystemsRecommendations();

    // Cross-module Recommendations
    this.generateCrossModuleRecommendations();

    // Sort by priority and impact
    this.recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return (b.estimatedSavings || 0) - (a.estimatedSavings || 0);
    });
  }

  private generateLeadRecommendations(): void {
    const leadData = this.meeting.modules.leadsAndSales;
    if (!leadData) return;

    // CRM implementation
    // Note: leadSources is an array of LeadSource, not an object with sources property
    const hasCRM =
      leadData.leadSources &&
      Array.isArray(leadData.leadSources) &&
      leadData.leadSources.some((source) => source.channel === 'crm');

    if (!hasCRM) {
      this.recommendations.push({
        id: 'lead-crm-implementation',
        module: 'leadsAndSales',
        priority: 'high',
        title: 'הטמעת מערכת CRM',
        description:
          'מערכת CRM תאפשר ניהול מרכזי של לידים, אוטומציה של תהליכים ומעקב מדויק',
        impact: 'הגדלת שיעור ההמרה ב-25%, חיסכון של 15 שעות שבועיות',
        effort: 'medium',
        estimatedSavings: 15000,
        automationPotential: 80,
        implementation: [
          'בחירת מערכת CRM מתאימה (HubSpot, Salesforce, Monday)',
          'הגדרת תהליכי עבודה במערכת',
          'הכשרת צוות המכירות',
          'חיבור לאתר ולערוצי השיווק',
        ],
        relatedPainPoints: ['manual-lead-tracking', 'lost-leads'],
        category: 'efficiency',
        timeframe: 'short',
      });
    }

    // Lead scoring automation
    // Note: LeadsAndSalesModule doesn't have 'qualification' property
    // Check if lead routing is automated instead
    const hasAutomatedRouting =
      leadData.leadRouting?.method &&
      Array.isArray(leadData.leadRouting.method) &&
      leadData.leadRouting.method.includes('automated');

    if (!hasAutomatedRouting) {
      this.recommendations.push({
        id: 'lead-scoring-automation',
        module: 'leadsAndSales',
        priority:
          (leadData.fallingLeadsPerMonth ?? 0) > 50 ? 'critical' : 'high',
        title: 'אוטומציה של ניקוד לידים',
        description: 'מערכת ניקוד אוטומטית תעדף לידים איכותיים ותמנע בזבוז זמן',
        impact: 'שיפור יעילות צוות המכירות ב-40%',
        effort: 'low',
        estimatedSavings: 8000,
        automationPotential: 90,
        implementation: [
          'הגדרת קריטריונים לניקוד',
          'יצירת מודל ניקוד במערכת',
          'אוטומציה של הקצאת לידים',
          'מעקב ואופטימיזציה',
        ],
        relatedPainPoints: ['lead-qualification'],
        category: 'efficiency',
        timeframe: 'immediate',
      });
    }

    // Follow-up automation
    // Note: FollowUpStrategy doesn't have 'method' property
    // Check if follow-up channels are limited or missing, indicating manual process
    const hasAutomatedFollowUp =
      leadData.followUp?.channels && leadData.followUp.channels.length > 1;

    if (leadData.followUp && !hasAutomatedFollowUp) {
      this.recommendations.push({
        id: 'followup-automation',
        module: 'leadsAndSales',
        priority: 'high',
        title: 'אוטומציה של מעקב לידים',
        description: 'רצפי מיילים ו-SMS אוטומטיים למעקב אחרי לידים',
        impact: 'הגדלת שיעור המענה ב-35%',
        effort: 'low',
        estimatedSavings: 5000,
        automationPotential: 85,
        implementation: [
          'יצירת תבניות למיילי מעקב',
          'הגדרת טריגרים וזמנים',
          'חיבור למערכת שליחת SMS',
          'יצירת רצפים personalized',
        ],
        relatedPainPoints: ['follow-up-delays'],
        category: 'growth',
        timeframe: 'immediate',
      });
    }

    // Lost leads recovery
    // Note: LeadsAndSalesModule uses fallingLeadsPerMonth, not leadManagement.lostLeadsPerMonth
    if (leadData.fallingLeadsPerMonth && leadData.fallingLeadsPerMonth > 20) {
      this.recommendations.push({
        id: 'lost-leads-recovery',
        module: 'leadsAndSales',
        priority: 'medium',
        title: 'תוכנית להחזרת לידים אבודים',
        description: 'קמפיין ממוקד להחזרת לידים שנשרו מהתהליך',
        impact: `החזרת ${Math.round(leadData.fallingLeadsPerMonth * 0.15)} לידים בחודש`,
        effort: 'medium',
        estimatedSavings: leadData.costPerLostLead
          ? leadData.costPerLostLead * leadData.fallingLeadsPerMonth * 0.15
          : 3000,
        automationPotential: 60,
        implementation: [
          'ניתוח סיבות לנשירה',
          'יצירת הצעות ממוקדות',
          'קמפיין אימייל/SMS להחזרה',
          'הצעות מיוחדות ללידים חוזרים',
        ],
        relatedPainPoints: ['high-lead-loss'],
        category: 'growth',
        timeframe: 'short',
      });
    }
  }

  private generateServiceRecommendations(): void {
    const serviceData = this.meeting.modules.customerService;
    if (!serviceData) return;

    // Chatbot for FAQs
    if (
      serviceData.autoResponse?.topQuestions &&
      Array.isArray(serviceData.autoResponse.topQuestions)
    ) {
      const faqVolume = serviceData.autoResponse.topQuestions.reduce(
        (sum, q: FAQ) => sum + (q?.frequencyPerDay || 0),
        0
      );

      // Note: AutoResponse doesn't have 'hasBot' property
      // Use automationPotential as indicator - if low or undefined, suggest chatbot
      const hasBot =
        serviceData.autoResponse?.automationPotential &&
        serviceData.autoResponse.automationPotential > 70;

      if (faqVolume > 30 && !hasBot) {
        this.recommendations.push({
          id: 'chatbot-implementation',
          module: 'customerService',
          priority: faqVolume > 100 ? 'critical' : 'high',
          title: "הטמעת צ'אטבוט לשאלות נפוצות",
          description: 'בוט אוטומטי שיענה על השאלות הנפוצות וישחרר את הצוות',
          impact: `חיסכון של ${Math.round((faqVolume * 5) / 60)} שעות ביום`,
          effort: 'medium',
          estimatedSavings: (faqVolume * 5 * 22 * 50) / 60, // 50 ₪ per hour
          automationPotential: 95,
          implementation: [
            'מיפוי כל השאלות הנפוצות',
            'כתיבת תשובות מפורטות',
            "הטמעת פלטפורמת צ'אט",
            'אימון הבוט ובדיקות',
            'השקה הדרגתית עם backup אנושי',
          ],
          relatedPainPoints: ['repetitive-questions'],
          category: 'efficiency',
          timeframe: 'short',
        });
      }
    }

    // Unified inbox - check if unificationMethod is missing and multiple channels exist
    // Note: channels is an array, check unificationMethod and channels.length instead
    if (
      (!serviceData.unificationMethod ||
        serviceData.unificationMethod === 'none') &&
      serviceData.channels &&
      Array.isArray(serviceData.channels) &&
      serviceData.channels.length > 2
    ) {
      this.recommendations.push({
        id: 'unified-inbox',
        module: 'customerService',
        priority: 'high',
        title: 'מערכת תיבת דואר מאוחדת',
        description:
          'ריכוז כל הערוצים במקום אחד - אימייל, WhatsApp, פייסבוק, טלפון',
        impact: 'קיצור זמן תגובה ב-50%, מניעת כפילויות',
        effort: 'medium',
        estimatedSavings: 12000,
        automationPotential: 70,
        implementation: [
          'בחירת פלטפורמה (Intercom, Zendesk, Freshdesk)',
          'חיבור כל הערוצים',
          'הגדרת SLA וחוקי ניתוב',
          'הכשרת הצוות',
        ],
        relatedPainPoints: ['channel-fragmentation'],
        category: 'quality',
        timeframe: 'short',
      });
    }

    // Response time improvement - check average response time across channels
    if (
      serviceData.channels &&
      Array.isArray(serviceData.channels) &&
      serviceData.channels.length > 0
    ) {
      const channelsWithResponseTime = serviceData.channels.filter((ch) => {
        const time = ch.responseTime;
        return time && typeof time === 'string' && !isNaN(parseInt(time));
      });

      if (channelsWithResponseTime.length > 0) {
        const avgResponseTime =
          channelsWithResponseTime.reduce((sum, ch) => {
            const time = parseInt(ch.responseTime || '0');
            return sum + time;
          }, 0) / channelsWithResponseTime.length;

        if (avgResponseTime > 120) {
          this.recommendations.push({
            id: 'response-time-improvement',
            module: 'customerService',
            priority: 'critical',
            title: 'שיפור זמני תגובה',
            description: 'תוכנית לקיצור זמני התגובה ללקוחות',
            impact: 'שיפור שביעות רצון לקוחות ב-40%',
            effort: 'low',
            estimatedSavings: 8000,
            automationPotential: 50,
            implementation: [
              'הגדרת SLA ברורים',
              'תבניות תגובה מהירה',
              'מערכת התראות לפניות ממתינות',
              'תעדוף פניות לפי דחיפות',
            ],
            relatedPainPoints: ['slow-response'],
            category: 'quality',
            timeframe: 'immediate',
          });
        }
      }
    }

    // Sentiment analysis - check if reputation management feedback collection exists
    // Note: CustomerServiceModule doesn't have 'satisfaction' field. Check reputationManagement instead.
    if (
      serviceData.reputationManagement &&
      (!serviceData.reputationManagement.feedbackCollection ||
        !serviceData.reputationManagement.feedbackCollection.how ||
        serviceData.reputationManagement.feedbackCollection.how.length === 0)
    ) {
      this.recommendations.push({
        id: 'sentiment-tracking',
        module: 'customerService',
        priority: 'medium',
        title: 'מעקב שביעות רצון לקוחות',
        description: 'מערכת למדידת ומעקב אחר שביעות רצון',
        impact: 'זיהוי מוקדם של בעיות, שיפור החוויה',
        effort: 'low',
        estimatedSavings: 5000,
        automationPotential: 80,
        implementation: [
          'הטמעת סקרי NPS/CSAT',
          'ניתוח סנטימנט אוטומטי',
          'דשבורד מעקב',
          'תוכנית שיפור מבוססת נתונים',
        ],
        relatedPainPoints: ['no-feedback-loop'],
        category: 'quality',
        timeframe: 'short',
      });
    }
  }

  private generateOperationsRecommendations(): void {
    const opsData = this.meeting.modules.operations;
    if (!opsData) return;

    // Process automation
    if (opsData.workProcesses?.processes) {
      const complexProcesses = opsData.workProcesses.processes.filter(
        (p: WorkProcess) => p.stepCount > 10 || p.bottleneck
      );

      if (complexProcesses.length > 0) {
        this.recommendations.push({
          id: 'process-automation',
          module: 'operations',
          priority: 'high',
          title: 'אוטומציה של תהליכים מורכבים',
          description: `${complexProcesses.length} תהליכים זוהו כמתאימים לאוטומציה`,
          impact: 'חיסכון של 30% מזמן העבודה בתהליכים אלו',
          effort: 'high',
          estimatedSavings: complexProcesses.length * 3000,
          automationPotential: 75,
          implementation: [
            'מיפוי מפורט של התהליכים',
            'זיהוי נקודות לאוטומציה',
            'בחירת כלי אוטומציה (Zapier, Make, n8n)',
            'בנייה והטמעה הדרגתית',
          ],
          relatedPainPoints: ['process-bottlenecks'],
          category: 'efficiency',
          timeframe: 'medium',
        });
      }
    }

    // Document management system
    if (
      opsData.documentManagement?.versionControlMethod === 'none' ||
      opsData.documentManagement?.searchDifficulties
    ) {
      this.recommendations.push({
        id: 'document-management',
        module: 'operations',
        priority: 'medium',
        title: 'מערכת ניהול מסמכים',
        description: 'מערכת מרכזית לניהול, אחסון וחיפוש מסמכים',
        impact: 'חיסכון של 5 שעות שבועיות בחיפוש מסמכים',
        effort: 'medium',
        estimatedSavings: 6000,
        automationPotential: 60,
        implementation: [
          'בחירת פלטפורמה (SharePoint, Google Workspace)',
          'הגדרת מבנה תיקיות וקטלוג',
          'העברת מסמכים קיימים',
          'הגדרת הרשאות וגרסאות',
        ],
        relatedPainPoints: ['document-chaos'],
        category: 'efficiency',
        timeframe: 'short',
      });
    }

    // HR onboarding optimization
    if (opsData.hr?.onboardingDuration && opsData.hr.onboardingDuration > 30) {
      this.recommendations.push({
        id: 'onboarding-optimization',
        module: 'operations',
        priority: 'medium',
        title: 'ייעול תהליך קליטת עובדים',
        description: 'קיצור והאוטמטיזציה של תהליך הקליטה',
        impact: `קיצור זמן קליטה מ-${opsData.hr.onboardingDuration} ל-${Math.round(opsData.hr.onboardingDuration * 0.6)} ימים`,
        effort: 'medium',
        estimatedSavings: 4000,
        automationPotential: 70,
        implementation: [
          'יצירת checklist דיגיטלי',
          'אוטומציה של הרשאות ומערכות',
          'ערכת קליטה דיגיטלית',
          'מנטור אוטומטי למעקב',
        ],
        relatedPainPoints: ['lengthy-onboarding'],
        category: 'efficiency',
        timeframe: 'short',
      });
    }

    // Project management tools
    if (
      opsData.projectManagement?.deadlineMissRate &&
      opsData.projectManagement.deadlineMissRate > 20
    ) {
      this.recommendations.push({
        id: 'project-management-improvement',
        module: 'operations',
        priority:
          opsData.projectManagement.deadlineMissRate > 40 ? 'critical' : 'high',
        title: 'שיפור ניהול פרויקטים',
        description: 'כלים ותהליכים לעמידה בלוחות זמנים',
        impact: 'הפחתת חריגות מלו"ז ב-60%',
        effort: 'medium',
        estimatedSavings: 10000,
        automationPotential: 65,
        implementation: [
          'הטמעת כלי ניהול פרויקטים',
          'הגדרת תהליכי תכנון ריאליים',
          'מעקב אוטומטי והתראות',
          'ניתוח חסמים וצווארי בקבוק',
        ],
        relatedPainPoints: ['deadline-misses'],
        category: 'risk',
        timeframe: 'short',
      });
    }
  }

  private generateAIRecommendations(): void {
    const aiData = this.meeting.modules.aiAgents;
    if (!aiData) return;

    // AI implementation based on readiness
    if (
      aiData.readinessLevel === 'high' &&
      (!aiData.currentAI || aiData.currentAI.length === 0)
    ) {
      this.recommendations.push({
        id: 'ai-quick-wins',
        module: 'aiAgents',
        priority: 'high',
        title: 'Quick Wins עם AI',
        description: 'הארגון בשל להטמעת AI - התחלה עם פתרונות מהירים',
        impact: 'חיסכון של 20 שעות שבועיות, שיפור דיוק ב-30%',
        effort: 'low',
        estimatedSavings: 20000,
        automationPotential: 90,
        implementation: [
          "צ'אטבוט לשירות לקוחות",
          'אוטומציה של מיילים',
          'ניתוח נתונים אוטומטי',
          'תמלול ותיעוד אוטומטי',
        ],
        relatedPainPoints: ['no-ai-usage'],
        category: 'growth',
        timeframe: 'immediate',
      });
    }

    // Specific AI use cases based on pain points
    if (this.meeting.painPoints?.some((p) => p.module === 'customerService')) {
      this.recommendations.push({
        id: 'ai-customer-service',
        module: 'aiAgents',
        priority: 'high',
        title: 'AI לשירות לקוחות',
        description: 'סוכן AI שיטפל ב-70% מהפניות באופן אוטומטי',
        impact: 'שחרור 3 נציגי שירות למשימות מורכבות',
        effort: 'medium',
        estimatedSavings: 25000,
        automationPotential: 85,
        implementation: [
          'אימון מודל על היסטוריית פניות',
          'יצירת knowledge base',
          'אינטגרציה עם מערכות קיימות',
          'השקה הדרגתית עם supervision',
        ],
        relatedPainPoints: ['high-service-volume'],
        category: 'efficiency',
        timeframe: 'short',
      });
    }

    // AI for data analysis - check if dashboards don't exist or are not real-time
    // Note: DashboardConfig doesn't have 'updateFrequency' property, use 'realTime' instead
    if (
      this.meeting.modules.reporting?.dashboards &&
      (!this.meeting.modules.reporting.dashboards.exists ||
        !this.meeting.modules.reporting.dashboards.realTime)
    ) {
      this.recommendations.push({
        id: 'ai-analytics',
        module: 'aiAgents',
        priority: 'medium',
        title: 'AI לניתוח נתונים',
        description: 'ניתוח אוטומטי של נתונים וייצור תובנות',
        impact: 'תובנות בזמן אמת, החלטות מבוססות נתונים',
        effort: 'medium',
        estimatedSavings: 15000,
        automationPotential: 80,
        implementation: [
          'חיבור למקורות נתונים',
          'הגדרת KPIs ומטריקות',
          'יצירת דשבורדים חכמים',
          'התראות על חריגות',
        ],
        relatedPainPoints: ['manual-reporting'],
        category: 'quality',
        timeframe: 'medium',
      });
    }
  }

  private generateSystemsRecommendations(): void {
    const sysData = this.meeting.modules.systems;
    if (!sysData) return;

    // Systems integration
    if (
      sysData.integrations?.level === 'none' &&
      sysData.currentSystems &&
      Array.isArray(sysData.currentSystems) &&
      sysData.currentSystems.length > 3
    ) {
      this.recommendations.push({
        id: 'systems-integration',
        module: 'systems',
        priority: 'critical',
        title: 'אינטגרציה בין מערכות',
        description: 'חיבור המערכות הקיימות למניעת כפל עבודה',
        impact: 'חיסכון של 15 שעות שבועיות, מניעת טעויות',
        effort: 'high',
        estimatedSavings: 18000,
        automationPotential: 75,
        implementation: [
          'מיפוי נקודות חיבור נדרשות',
          'בחירת פלטפורמת אינטגרציה',
          'פיתוח חיבורים',
          'בדיקות וולידציה',
        ],
        relatedPainPoints: ['system-silos'],
        category: 'efficiency',
        timeframe: 'medium',
      });
    }

    // API development
    if (
      sysData.apiAccess === false &&
      sysData.currentSystems &&
      Array.isArray(sysData.currentSystems) &&
      sysData.currentSystems.length > 2
    ) {
      this.recommendations.push({
        id: 'api-development',
        module: 'systems',
        priority: 'medium',
        title: 'פיתוח API למערכות',
        description: 'יצירת ממשקי API לגישה לנתונים',
        impact: 'אפשרות לאוטומציה מתקדמת',
        effort: 'high',
        estimatedSavings: 12000,
        automationPotential: 85,
        implementation: [
          'הגדרת דרישות API',
          'פיתוח endpoints',
          'תיעוד ממשקים',
          'אבטחה והרשאות',
        ],
        relatedPainPoints: ['no-api-access'],
        category: 'growth',
        timeframe: 'long',
      });
    }
  }

  private generateCrossModuleRecommendations(): void {
    // End-to-end automation
    if (this.insights.automationOpportunities > 10) {
      this.recommendations.push({
        id: 'end-to-end-automation',
        module: 'cross-module',
        priority: 'critical',
        title: 'אוטומציה מקצה לקצה',
        description: 'חיבור כל התהליכים העסקיים לזרימה אוטומטית',
        impact: 'טרנספורמציה דיגיטלית מלאה, חיסכון של 40% מכוח האדם התפעולי',
        effort: 'high',
        estimatedSavings: 50000,
        automationPotential: 90,
        implementation: [
          'מיפוי תהליכים חוצי ארגון',
          'תכנון ארכיטקטורת אוטומציה',
          'הטמעה בשלבים',
          'ניטור ואופטימיזציה',
        ],
        relatedPainPoints: ['manual-everything'],
        category: 'growth',
        timeframe: 'long',
      });
    }

    // Data centralization
    if (!this.meeting.modules.systems?.dataWarehouse) {
      this.recommendations.push({
        id: 'data-centralization',
        module: 'cross-module',
        priority: 'high',
        title: 'ריכוז נתונים במאגר מרכזי',
        description: 'Data Warehouse לכל נתוני הארגון',
        impact: 'תובנות עסקיות מתקדמות, BI ו-Analytics',
        effort: 'high',
        estimatedSavings: 20000,
        automationPotential: 70,
        implementation: [
          'בחירת פלטפורמת DW',
          'ETL מכל המערכות',
          'מודל נתונים אחיד',
          'כלי BI ודשבורדים',
        ],
        relatedPainPoints: ['data-fragmentation'],
        category: 'quality',
        timeframe: 'long',
      });
    }

    // Customer 360 view
    if (
      this.meeting.modules.leadsAndSales &&
      this.meeting.modules.customerService
    ) {
      this.recommendations.push({
        id: 'customer-360',
        module: 'cross-module',
        priority: 'medium',
        title: 'תמונת לקוח 360°',
        description: 'ריכוז כל המידע על הלקוח במקום אחד',
        impact: 'שיפור חווית לקוח, הגדלת מכירות',
        effort: 'medium',
        estimatedSavings: 15000,
        automationPotential: 60,
        implementation: [
          'איחוד נתוני לקוחות',
          'יצירת פרופיל לקוח מאוחד',
          'ממשק גישה אחיד',
          'היסטוריה והעדפות',
        ],
        relatedPainPoints: ['customer-data-silos'],
        category: 'quality',
        timeframe: 'medium',
      });
    }
  }

  public getRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  public getInsights(): InsightMetrics {
    return this.insights;
  }

  public getTopPriorities(count: number = 5): Recommendation[] {
    return this.recommendations.slice(0, count);
  }

  public getQuickWins(): Recommendation[] {
    return this.recommendations.filter(
      (r) => r.effort === 'low' && r.timeframe === 'immediate'
    );
  }

  public getHighImpactItems(): Recommendation[] {
    return this.recommendations.filter(
      (r) =>
        (r.estimatedSavings || 0) > 10000 || (r.automationPotential ?? 0) > 80
    );
  }

  public getByModule(module: string): Recommendation[] {
    return this.recommendations.filter((r) => r.module === module);
  }

  public getByCategory(category: string): Recommendation[] {
    return this.recommendations.filter((r) => r.category === category);
  }

  public getTotalEstimatedSavings(): number {
    return this.recommendations.reduce(
      (sum, r) => sum + (r.estimatedSavings || 0),
      0
    );
  }

  public getImplementationRoadmap(): { [key: string]: Recommendation[] } {
    return {
      immediate: this.recommendations.filter(
        (r) => r.timeframe === 'immediate'
      ),
      short: this.recommendations.filter((r) => r.timeframe === 'short'),
      medium: this.recommendations.filter((r) => r.timeframe === 'medium'),
      long: this.recommendations.filter((r) => r.timeframe === 'long'),
    };
  }

  public generateExecutiveSummary(): string {
    const topRecs = this.getTopPriorities(3);
    const savings = this.getTotalEstimatedSavings();
    const quickWins = this.getQuickWins();

    return `
      סיכום מנהלים - המלצות לשיפור

      מצב נוכחי:
      • ${this.insights.totalPainPoints} נקודות כאב זוהו
      • ${this.insights.automationOpportunities} הזדמנויות לאוטומציה
      • ציון בשלות דיגיטלית: ${this.insights.digitalMaturityScore}/100
      • ${this.insights.timeWastage} שעות מבוזבזות בחודש

      פוטנציאל חיסכון:
      • ₪${savings.toLocaleString()} לחודש
      • ${Math.round((savings * 12) / 1000)}K ₪ בשנה

      3 המלצות מובילות:
      ${topRecs
        .map(
          (r, i) => `
      ${i + 1}. ${r.title}
         השפעה: ${r.impact}
         חיסכון: ₪${r.estimatedSavings?.toLocaleString() || 'לא חושב'}
      `
        )
        .join('')}

      Quick Wins (${quickWins.length} פעולות):
      ${quickWins.map((r) => `• ${r.title}`).join('\n      ')}
    `;
  }
}
