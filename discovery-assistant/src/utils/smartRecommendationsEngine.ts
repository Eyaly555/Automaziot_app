/**
 * Phase 5 - Smart Recommendations Engine
 *
 * Analyzes meeting data to detect patterns, identify automation opportunities,
 * and generate prioritized recommendations with n8n workflow templates.
 */

import { Meeting } from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface SmartRecommendation {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  type?:
    | 'automation'
    | 'integration'
    | 'optimization'
    | 'training'
    | 'ai_implementation'; // Used by Dashboard component
  category: 'integration' | 'automation' | 'ai_agent' | 'process_improvement';
  impactScore: number; // 1-10
  effortScore: number; // 1-10
  quickWin: boolean; // impactScore >= 7 && effortScore <= 4
  estimatedROI: number;
  estimatedTimeSavings?: number; // Hours saved per month (used by Dashboard)
  estimatedCostSavings?: number; // Cost savings per month (used by Dashboard)
  affectedSystems: string[];
  suggestedTools: string[]; // Array of suggested tools (note: plural)
  implementationSteps: string[];
  priority: number;
  n8nWorkflowTemplate?: N8nWorkflowTemplate;
}

export interface N8nWorkflowTemplate {
  name: string;
  description: string;
  nodes: N8nNode[];
  connections: N8nConnection[];
  estimatedSetupTime: number; // minutes
}

export interface N8nNode {
  id: string;
  type: string;
  name: string;
  position: [number, number];
  parameters: Record<string, any>;
}

export interface N8nConnection {
  from: string;
  to: string;
  fromPort?: number;
  toPort?: number;
}

export interface PatternAnalysisResult {
  detectedPatterns: DetectedPattern[];
  automationOpportunities: number;
  totalPotentialSavings: number;
  criticalIssues: string[];
  quickWins: string[];
}

export interface DetectedPattern {
  type:
    | 'missing_integration'
    | 'manual_data_entry'
    | 'high_volume_task'
    | 'low_satisfaction'
    | 'unused_api'
    | 'after_hours_gap'
    | 'repetitive_process';
  description: string;
  affectedModules: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: number;
}

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class SmartRecommendationsEngine {
  private meeting: Meeting;
  private recommendations: SmartRecommendation[] = [];
  private patterns: DetectedPattern[] = [];

  constructor(meeting: Meeting) {
    this.meeting = meeting;
    this.analyzePatterns();
    this.generateRecommendations();
    this.prioritizeRecommendations();
  }

  // ==========================================================================
  // PATTERN RECOGNITION
  // ==========================================================================

  private analyzePatterns(): void {
    this.patterns = [];

    // Detect missing integrations between related systems
    this.detectMissingIntegrations();

    // Detect manual data entry opportunities
    this.detectManualDataEntry();

    // Detect high volume repetitive tasks
    this.detectHighVolumeTasks();

    // Detect systems with low satisfaction
    this.detectLowSatisfactionSystems();

    // Detect unused API capabilities
    this.detectUnusedAPIs();

    // Detect after-hours coverage gaps
    this.detectAfterHoursGaps();
  }

  private detectMissingIntegrations(): void {
    const systems = this.meeting.modules.systems?.detailedSystems || [];

    // Check for CRM + WhatsApp without integration
    const hasCRM = systems.some((s) => s.category === 'crm');
    const leadsChannels = this.meeting.modules.leadsAndSales?.leadSources || [];
    const serviceChannels =
      this.meeting.modules.customerService?.channels || [];
    const hasWhatsApp = [
      ...(Array.isArray(leadsChannels)
        ? leadsChannels.map((c) => c.channel)
        : []),
      ...(Array.isArray(serviceChannels)
        ? serviceChannels.map((c) => c.type)
        : []),
    ].some((channel) => channel?.toLowerCase().includes('whatsapp'));

    if (hasCRM && hasWhatsApp) {
      const hasIntegration = systems.some(
        (s) =>
          s.category === 'crm' &&
          s.integrationNeeds?.some((i) =>
            i.targetSystemName?.toLowerCase().includes('whatsapp')
          )
      );

      if (!hasIntegration) {
        this.patterns.push({
          type: 'missing_integration',
          description: 'CRM and WhatsApp not integrated - leads may be lost',
          affectedModules: ['leadsAndSales', 'customerService', 'systems'],
          severity: 'high',
          estimatedImpact: 8500,
        });
      }
    }

    // Check for systems with "missing" integration status
    systems.forEach((system) => {
      const missingIntegrations =
        system.integrationNeeds?.filter(
          (i) =>
            i.currentStatus === 'missing' && i.criticalityLevel === 'critical'
        ) || [];

      missingIntegrations.forEach((integration) => {
        this.patterns.push({
          type: 'missing_integration',
          description: `Missing critical integration: ${system.specificSystem} → ${integration.targetSystemName}`,
          affectedModules: ['systems'],
          severity: 'critical',
          estimatedImpact: 10000,
        });
      });
    });
  }

  private detectManualDataEntry(): void {
    // DEPRECATED: systemSync property removed in OperationsModule v2
    // Old code checked ops?.systemSync?.dataTransferMethod for manual data transfer
    // This detection logic has been removed as the property no longer exists
    // Future: Could analyze workProcesses.automationReadiness instead
    // DEPRECATED: financialProcesses.invoicing property removed in OperationsModule v2
    // Old code checked invoicing volume and time
    // This detection logic has been removed as the property no longer exists
    // Future: Could analyze relevant workflow data if added to new structure
  }

  private detectHighVolumeTasks(): void {
    // Check FAQ volume
    const faqs =
      this.meeting.modules.customerService?.autoResponse?.topQuestions || [];
    const totalFAQs = Array.isArray(faqs)
      ? faqs.reduce((sum, q) => sum + (q.frequencyPerDay || 0), 0)
      : 0;

    if (totalFAQs > 50) {
      this.patterns.push({
        type: 'high_volume_task',
        description: `${totalFAQs} repetitive FAQ responses per day`,
        affectedModules: ['customerService'],
        severity: totalFAQs > 100 ? 'critical' : 'high',
        estimatedImpact: totalFAQs * 5 * 22, // 5 min per FAQ, 22 working days
      });
    }

    // Check lead volume
    const leadSources = this.meeting.modules.leadsAndSales?.leadSources || [];
    const totalLeads = Array.isArray(leadSources)
      ? leadSources.reduce((sum, s) => sum + (s.volumePerMonth || 0), 0)
      : 0;

    if (
      totalLeads > 200 &&
      this.meeting.modules.leadsAndSales?.speedToLead?.duringBusinessHours ===
        'manual'
    ) {
      this.patterns.push({
        type: 'high_volume_task',
        description: `${totalLeads} leads/month processed manually`,
        affectedModules: ['leadsAndSales'],
        severity: 'high',
        estimatedImpact: totalLeads * 10, // 10 NIS per lead
      });
    }
  }

  private detectLowSatisfactionSystems(): void {
    const systems = this.meeting.modules.systems?.detailedSystems || [];

    systems.forEach((system) => {
      if (system.satisfactionScore <= 2) {
        this.patterns.push({
          type: 'low_satisfaction',
          description: `Low satisfaction with ${system.specificSystem} (${system.satisfactionScore}/5)`,
          affectedModules: ['systems'],
          severity: system.satisfactionScore === 1 ? 'critical' : 'high',
          estimatedImpact: 5000,
        });
      }
    });
  }

  private detectUnusedAPIs(): void {
    const systems = this.meeting.modules.systems?.detailedSystems || [];

    systems.forEach((system) => {
      if (system.apiAccess === 'full' || system.apiAccess === 'limited') {
        const hasIntegrations =
          system.integrationNeeds && system.integrationNeeds.length > 0;
        const usingIntegrations = system.integrationNeeds?.some(
          (i) => i.currentStatus === 'working' && i.integrationType === 'api'
        );

        if (hasIntegrations && !usingIntegrations) {
          this.patterns.push({
            type: 'unused_api',
            description: `${system.specificSystem} has API access but no API integrations`,
            affectedModules: ['systems'],
            severity: 'medium',
            estimatedImpact: 3000,
          });
        }
      }
    });
  }

  private detectAfterHoursGaps(): void {
    const speedToLead = this.meeting.modules.leadsAndSales?.speedToLead;

    if (
      speedToLead?.afterHours === 'no_response' ||
      speedToLead?.weekends === 'no_response'
    ) {
      const unanswered = speedToLead.unansweredPercentage || 0;

      this.patterns.push({
        type: 'after_hours_gap',
        description: `No after-hours response (${unanswered}% leads unanswered)`,
        affectedModules: ['leadsAndSales', 'customerService'],
        severity: unanswered > 30 ? 'critical' : 'high',
        estimatedImpact: unanswered * 200, // Lost opportunity cost
      });
    }
  }

  // ==========================================================================
  // RECOMMENDATION GENERATION
  // ==========================================================================

  private generateRecommendations(): void {
    this.recommendations = [];

    // Generate recommendations based on detected patterns
    this.patterns.forEach((pattern) => {
      switch (pattern.type) {
        case 'missing_integration':
          this.generateIntegrationRecommendation(pattern);
          break;
        case 'manual_data_entry':
          this.generateAutomationRecommendation(pattern);
          break;
        case 'high_volume_task':
          this.generateAIAgentRecommendation(pattern);
          break;
        case 'after_hours_gap':
          this.generateAfterHoursRecommendation(pattern);
          break;
        case 'low_satisfaction':
          this.generateSystemImprovementRecommendation(pattern);
          break;
        case 'unused_api':
          this.generateAPIIntegrationRecommendation(pattern);
          break;
      }
    });

    // Add template-based recommendations
    this.addTemplateRecommendations();
  }

  private generateIntegrationRecommendation(pattern: DetectedPattern): void {
    const id = `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.recommendations.push({
      id,
      title: 'System Integration',
      titleHebrew: 'אינטגרציה בין מערכות',
      description: pattern.description,
      category: 'integration',
      impactScore: pattern.severity === 'critical' ? 10 : 8,
      effortScore: 3,
      quickWin: true,
      estimatedROI: pattern.estimatedImpact,
      affectedSystems: this.extractSystemsFromPattern(pattern),
      suggestedTools: ['n8n', 'Zapier', 'Make'],
      implementationSteps: [
        'זיהוי נקודות החיבור הנדרשות',
        'הגדרת API credentials',
        'בניית workflow באמצעות n8n',
        'בדיקות ו-validation',
        'הפעלה ב-production',
      ],
      priority: 0,
      n8nWorkflowTemplate: this.getCRMWhatsAppIntegrationTemplate(),
    });
  }

  private generateAutomationRecommendation(pattern: DetectedPattern): void {
    const id = `automation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.recommendations.push({
      id,
      title: 'Process Automation',
      titleHebrew: 'אוטומציה של תהליך',
      description: pattern.description,
      category: 'automation',
      impactScore: 9,
      effortScore: 2,
      quickWin: true,
      estimatedROI: pattern.estimatedImpact,
      affectedSystems: this.extractSystemsFromPattern(pattern),
      suggestedTools: ['n8n', 'Python scripts', 'RPA tools'],
      implementationSteps: [
        'מיפוי התהליך הידני הקיים',
        'זיהוי נקודות לאוטומציה',
        'בניית workflow אוטומטי',
        'הוספת error handling',
        'הטמעה והכשרת משתמשים',
      ],
      priority: 0,
    });
  }

  private generateAIAgentRecommendation(pattern: DetectedPattern): void {
    const id = `ai-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.recommendations.push({
      id,
      title: 'AI Agent Implementation',
      titleHebrew: 'הטמעת סוכן AI',
      description: pattern.description,
      category: 'ai_agent',
      impactScore: 9,
      effortScore: 4,
      quickWin: true,
      estimatedROI: pattern.estimatedImpact,
      affectedSystems: ['Customer Service', 'CRM'],
      suggestedTools: ['OpenAI GPT-4', 'Anthropic Claude', 'Custom LLM'],
      implementationSteps: [
        'איסוף ידע וצירוף knowledge base',
        'בחירת מודל AI מתאים',
        'הטמעת chatbot/agent',
        'אימון ובדיקות',
        'השקה הדרגתית עם fallback אנושי',
      ],
      priority: 0,
      n8nWorkflowTemplate: this.getAIChatbotTemplate(),
    });
  }

  private generateAfterHoursRecommendation(pattern: DetectedPattern): void {
    const id = `after-hours-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.recommendations.push({
      id,
      title: 'After-Hours Automation',
      titleHebrew: 'אוטומציה מחוץ לשעות העבודה',
      description: pattern.description,
      category: 'automation',
      impactScore: 8,
      effortScore: 3,
      quickWin: true,
      estimatedROI: pattern.estimatedImpact,
      affectedSystems: ['WhatsApp', 'Email', 'CRM'],
      suggestedTools: ['n8n', 'Twilio', 'WhatsApp Business API'],
      implementationSteps: [
        'הגדרת תבניות תגובה אוטומטיות',
        'חיבור ל-WhatsApp Business API',
        'הגדרת scheduling ב-n8n',
        'יצירת notification למשמרת הבוקר',
        'בדיקות end-to-end',
      ],
      priority: 0,
      n8nWorkflowTemplate: this.getAfterHoursResponseTemplate(),
    });
  }

  private generateSystemImprovementRecommendation(
    pattern: DetectedPattern
  ): void {
    const id = `improvement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.recommendations.push({
      id,
      title: 'System Improvement',
      titleHebrew: 'שיפור מערכת',
      description: pattern.description,
      category: 'process_improvement',
      impactScore: 7,
      effortScore: 6,
      quickWin: false,
      estimatedROI: pattern.estimatedImpact,
      affectedSystems: this.extractSystemsFromPattern(pattern),
      suggestedTools: ['System alternatives', 'Training', 'Customization'],
      implementationSteps: [
        'ניתוח בעיות קיימות',
        'סקר שביעות רצון מעמיק',
        'בחינת אלטרנטיבות',
        'תכנית שיפור/מיגרציה',
        'הטמעה והכשרה',
      ],
      priority: 0,
    });
  }

  private generateAPIIntegrationRecommendation(pattern: DetectedPattern): void {
    const id = `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.recommendations.push({
      id,
      title: 'API Integration',
      titleHebrew: 'ניצול יכולות API',
      description: pattern.description,
      category: 'integration',
      impactScore: 7,
      effortScore: 3,
      quickWin: true,
      estimatedROI: pattern.estimatedImpact,
      affectedSystems: this.extractSystemsFromPattern(pattern),
      suggestedTools: ['n8n', 'Custom API development'],
      implementationSteps: [
        'קבלת API credentials',
        'תיעוד endpoints זמינים',
        'בניית integrations בסיסיות',
        'הרחבה לתרחישים נוספים',
        'ניטור ושיפור מתמיד',
      ],
      priority: 0,
    });
  }

  private addTemplateRecommendations(): void {
    // Only add templates that are relevant to detected patterns
    const hasCRM = this.meeting.modules.systems?.detailedSystems?.some(
      (s) => s.category === 'crm'
    );
    const hasReporting =
      this.meeting.modules.reporting?.scheduledReports &&
      this.meeting.modules.reporting.scheduledReports.length > 0;

    if (hasCRM && hasReporting) {
      this.recommendations.push(this.getDailySummaryReportRecommendation());
    }

    if (this.meeting.modules.leadsAndSales?.leadRouting?.method === 'manual') {
      this.recommendations.push(this.getLeadRoutingRecommendation());
    }

    if (this.meeting.modules.customerService?.onboarding) {
      this.recommendations.push(this.getCustomerOnboardingRecommendation());
    }

    // DEPRECATED: financialProcesses.invoicing removed in OperationsModule v2
    // Invoice generation recommendation is no longer automatically triggered
    // Future: Could check documentManagement.flows for invoice-related workflows
  }

  // ==========================================================================
  // PRIORITIZATION
  // ==========================================================================

  private prioritizeRecommendations(): void {
    // Sort by: quickWin first, then by (impactScore / effortScore) ratio
    this.recommendations.sort((a, b) => {
      // Quick wins first
      if (a.quickWin && !b.quickWin) return -1;
      if (!a.quickWin && b.quickWin) return 1;

      // Then by impact/effort ratio
      const ratioA = a.impactScore / a.effortScore;
      const ratioB = b.impactScore / b.effortScore;

      if (ratioA !== ratioB) {
        return ratioB - ratioA;
      }

      // Finally by estimated ROI
      return b.estimatedROI - a.estimatedROI;
    });

    // Assign priority numbers
    this.recommendations.forEach((rec, index) => {
      rec.priority = index + 1;
    });
  }

  public prioritizeRecommendationsArray(
    recommendations: SmartRecommendation[]
  ): SmartRecommendation[] {
    const sorted = [...recommendations].sort((a, b) => {
      if (a.quickWin && !b.quickWin) return -1;
      if (!a.quickWin && b.quickWin) return 1;

      const ratioA = a.impactScore / a.effortScore;
      const ratioB = b.impactScore / b.effortScore;

      if (ratioA !== ratioB) {
        return ratioB - ratioA;
      }

      return b.estimatedROI - a.estimatedROI;
    });

    sorted.forEach((rec, index) => {
      rec.priority = index + 1;
    });

    return sorted;
  }

  // Static method that doesn't require meeting data
  public static sortRecommendations(
    recommendations: SmartRecommendation[]
  ): SmartRecommendation[] {
    const sorted = [...recommendations].sort((a, b) => {
      if (a.quickWin && !b.quickWin) return -1;
      if (!a.quickWin && b.quickWin) return 1;

      const ratioA = a.impactScore / a.effortScore;
      const ratioB = b.impactScore / b.effortScore;

      if (ratioA !== ratioB) {
        return ratioB - ratioA;
      }

      return b.estimatedROI - a.estimatedROI;
    });

    sorted.forEach((rec, index) => {
      rec.priority = index + 1;
    });

    return sorted;
  }

  // ==========================================================================
  // TEMPLATE LIBRARY
  // ==========================================================================

  private getCRMWhatsAppIntegrationTemplate(): N8nWorkflowTemplate {
    return {
      name: 'CRM to WhatsApp Integration',
      description:
        'Automatically send WhatsApp messages when new leads are created in CRM',
      estimatedSetupTime: 30,
      nodes: [
        {
          id: 'trigger',
          type: 'webhook',
          name: 'CRM Webhook',
          position: [250, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'crm-lead',
          },
        },
        {
          id: 'extract',
          type: 'function',
          name: 'Extract Lead Data',
          position: [450, 300],
          parameters: {
            functionCode: `
              const leadData = {
                name: items[0].json.contact_name,
                phone: items[0].json.phone,
                source: items[0].json.lead_source
              };
              return [{ json: leadData }];
            `,
          },
        },
        {
          id: 'whatsapp',
          type: 'whatsapp',
          name: 'Send WhatsApp',
          position: [650, 300],
          parameters: {
            operation: 'sendMessage',
            to: '={{$json.phone}}',
            message: 'שלום {{$json.name}}, תודה על פנייתך. נחזור אליך בהקדם.',
          },
        },
        {
          id: 'crm-update',
          type: 'httpRequest',
          name: 'Update CRM',
          position: [850, 300],
          parameters: {
            method: 'PATCH',
            url: 'https://api.crm.com/leads/{{$json.id}}',
            jsonParameters: true,
            options: {
              body: {
                whatsapp_sent: true,
                last_contact: '={{new Date().toISOString()}}',
              },
            },
          },
        },
      ],
      connections: [
        { from: 'trigger', to: 'extract' },
        { from: 'extract', to: 'whatsapp' },
        { from: 'whatsapp', to: 'crm-update' },
      ],
    };
  }

  private getAIChatbotTemplate(): N8nWorkflowTemplate {
    return {
      name: 'AI Customer Service Chatbot',
      description:
        'Handle customer inquiries using AI with fallback to human agents',
      estimatedSetupTime: 60,
      nodes: [
        {
          id: 'webhook',
          type: 'webhook',
          name: 'Customer Message',
          position: [250, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'customer-chat',
          },
        },
        {
          id: 'openai',
          type: 'openai',
          name: 'AI Response',
          position: [450, 300],
          parameters: {
            operation: 'message',
            model: 'gpt-4',
            messages: {
              messageType: 'conversational',
              message: '={{$json.message}}',
            },
            options: {
              systemMessage: 'אתה נציג שירות לקוחות מועיל ומקצועי. ענה בעברית.',
            },
          },
        },
        {
          id: 'confidence-check',
          type: 'if',
          name: 'Check Confidence',
          position: [650, 300],
          parameters: {
            conditions: {
              boolean: [
                {
                  value1: '={{$json.confidence}}',
                  operation: 'larger',
                  value2: 0.7,
                },
              ],
            },
          },
        },
        {
          id: 'send-response',
          type: 'httpRequest',
          name: 'Send to Customer',
          position: [850, 200],
          parameters: {
            method: 'POST',
            url: 'https://api.whatsapp.com/send',
            body: {
              to: '={{$json.customer_phone}}',
              message: '={{$json.ai_response}}',
            },
          },
        },
        {
          id: 'human-handoff',
          type: 'slack',
          name: 'Alert Human Agent',
          position: [850, 400],
          parameters: {
            channel: '#customer-service',
            text: 'לקוח זקוק לעזרה אנושית: {{$json.message}}',
          },
        },
      ],
      connections: [
        { from: 'webhook', to: 'openai' },
        { from: 'openai', to: 'confidence-check' },
        { from: 'confidence-check', to: 'send-response', fromPort: 0 },
        { from: 'confidence-check', to: 'human-handoff', fromPort: 1 },
      ],
    };
  }

  private getAfterHoursResponseTemplate(): N8nWorkflowTemplate {
    return {
      name: 'After Hours Auto-Response',
      description: 'Automatically respond to leads outside business hours',
      estimatedSetupTime: 20,
      nodes: [
        {
          id: 'trigger',
          type: 'webhook',
          name: 'New Lead',
          position: [250, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'new-lead',
          },
        },
        {
          id: 'time-check',
          type: 'if',
          name: 'Check Business Hours',
          position: [450, 300],
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{new Date().getHours()}}',
                  operation: 'between',
                  value2: 9,
                  value3: 18,
                },
              ],
            },
          },
        },
        {
          id: 'business-hours',
          type: 'whatsapp',
          name: 'Immediate Response',
          position: [650, 200],
          parameters: {
            message: 'שלום! נציג יחזור אליך בתוך דקות.',
          },
        },
        {
          id: 'after-hours',
          type: 'whatsapp',
          name: 'After Hours Message',
          position: [650, 400],
          parameters: {
            message: 'שלום! קיבלנו את פנייתך. נחזור אליך מחר בשעות 9:00-18:00.',
          },
        },
        {
          id: 'crm-save',
          type: 'httpRequest',
          name: 'Save to CRM',
          position: [850, 300],
          parameters: {
            method: 'POST',
            url: 'https://api.crm.com/leads',
            body: {
              source: 'after_hours',
              priority: 'high',
              data: '={{$json}}',
            },
          },
        },
      ],
      connections: [
        { from: 'trigger', to: 'time-check' },
        { from: 'time-check', to: 'business-hours', fromPort: 0 },
        { from: 'time-check', to: 'after-hours', fromPort: 1 },
        { from: 'business-hours', to: 'crm-save' },
        { from: 'after-hours', to: 'crm-save' },
      ],
    };
  }

  private getDailySummaryReportTemplate(): N8nWorkflowTemplate {
    return {
      name: 'Daily Summary Report',
      description: 'Automated daily business metrics report',
      estimatedSetupTime: 45,
      nodes: [
        {
          id: 'schedule',
          type: 'schedule',
          name: 'Daily at 8 AM',
          position: [250, 300],
          parameters: {
            rule: {
              interval: [{ field: 'cronExpression', expression: '0 8 * * *' }],
            },
          },
        },
        {
          id: 'crm-data',
          type: 'httpRequest',
          name: 'Get CRM Metrics',
          position: [450, 250],
          parameters: {
            url: 'https://api.crm.com/metrics/daily',
          },
        },
        {
          id: 'service-data',
          type: 'httpRequest',
          name: 'Get Service Metrics',
          position: [450, 350],
          parameters: {
            url: 'https://api.helpdesk.com/tickets/summary',
          },
        },
        {
          id: 'merge',
          type: 'merge',
          name: 'Merge Data',
          position: [650, 300],
          parameters: {
            mode: 'mergeByIndex',
          },
        },
        {
          id: 'format',
          type: 'function',
          name: 'Format Report',
          position: [850, 300],
          parameters: {
            functionCode: `
              const report = \`
דו"ח יומי - \${new Date().toLocaleDateString('he-IL')}

📊 מכירות:
- לידים חדשים: \${items[0].json.new_leads}
- עסקאות שנסגרו: \${items[0].json.closed_deals}
- הכנסות: ₪\${items[0].json.revenue}

💬 שירות לקוחות:
- פניות חדשות: \${items[1].json.new_tickets}
- פניות שנסגרו: \${items[1].json.closed_tickets}
- זמן תגובה ממוצע: \${items[1].json.avg_response_time} דקות
              \`;
              return [{ json: { report } }];
            `,
          },
        },
        {
          id: 'email',
          type: 'email',
          name: 'Send Report',
          position: [1050, 300],
          parameters: {
            to: 'management@company.com',
            subject: 'דו"ח יומי - {{new Date().toLocaleDateString()}}',
            text: '={{$json.report}}',
          },
        },
      ],
      connections: [
        { from: 'schedule', to: 'crm-data' },
        { from: 'schedule', to: 'service-data' },
        { from: 'crm-data', to: 'merge' },
        { from: 'service-data', to: 'merge' },
        { from: 'merge', to: 'format' },
        { from: 'format', to: 'email' },
      ],
    };
  }

  private getLeadRoutingTemplate(): N8nWorkflowTemplate {
    return {
      name: 'Smart Lead Routing',
      description: 'Automatically route leads to the right sales rep',
      estimatedSetupTime: 30,
      nodes: [
        {
          id: 'webhook',
          type: 'webhook',
          name: 'New Lead',
          position: [250, 300],
          parameters: { path: 'lead-routing' },
        },
        {
          id: 'score',
          type: 'function',
          name: 'Score Lead',
          position: [450, 300],
          parameters: {
            functionCode: `
              let score = 0;
              if (items[0].json.company_size > 100) score += 30;
              if (items[0].json.budget > 50000) score += 40;
              if (items[0].json.urgency === 'high') score += 30;
              return [{ json: { ...items[0].json, score } }];
            `,
          },
        },
        {
          id: 'route',
          type: 'switch',
          name: 'Route by Score',
          position: [650, 300],
          parameters: {
            rules: {
              number: [
                {
                  value1: '={{$json.score}}',
                  operation: 'largerEqual',
                  value2: 70,
                  output: 0,
                },
                {
                  value1: '={{$json.score}}',
                  operation: 'largerEqual',
                  value2: 40,
                  output: 1,
                },
              ],
            },
          },
        },
        {
          id: 'senior',
          type: 'httpRequest',
          name: 'Senior Sales Rep',
          position: [850, 200],
          parameters: {
            url: 'https://api.crm.com/assign',
            body: { lead_id: '={{$json.id}}', rep: 'senior_team' },
          },
        },
        {
          id: 'regular',
          type: 'httpRequest',
          name: 'Regular Sales Rep',
          position: [850, 300],
          parameters: {
            url: 'https://api.crm.com/assign',
            body: { lead_id: '={{$json.id}}', rep: 'regular_team' },
          },
        },
        {
          id: 'junior',
          type: 'httpRequest',
          name: 'Junior Sales Rep',
          position: [850, 400],
          parameters: {
            url: 'https://api.crm.com/assign',
            body: { lead_id: '={{$json.id}}', rep: 'junior_team' },
          },
        },
      ],
      connections: [
        { from: 'webhook', to: 'score' },
        { from: 'score', to: 'route' },
        { from: 'route', to: 'senior', fromPort: 0 },
        { from: 'route', to: 'regular', fromPort: 1 },
        { from: 'route', to: 'junior', fromPort: 2 },
      ],
    };
  }

  private getCustomerOnboardingTemplate(): N8nWorkflowTemplate {
    return {
      name: 'Customer Onboarding Flow',
      description: 'Automated customer onboarding with scheduled touchpoints',
      estimatedSetupTime: 50,
      nodes: [
        {
          id: 'trigger',
          type: 'webhook',
          name: 'New Customer',
          position: [250, 300],
          parameters: { path: 'new-customer' },
        },
        {
          id: 'welcome',
          type: 'email',
          name: 'Welcome Email',
          position: [450, 300],
          parameters: {
            subject: 'ברוכים הבאים!',
            text: 'שלום {{$json.name}}, תודה שבחרת בנו!',
          },
        },
        {
          id: 'wait-1',
          type: 'wait',
          name: 'Wait 1 Day',
          position: [650, 300],
          parameters: { amount: 1, unit: 'days' },
        },
        {
          id: 'tutorial',
          type: 'email',
          name: 'Tutorial Email',
          position: [850, 300],
          parameters: {
            subject: 'איך להתחיל',
            text: 'הנה מדריך מהיר לשימוש במערכת...',
          },
        },
        {
          id: 'wait-2',
          type: 'wait',
          name: 'Wait 3 Days',
          position: [1050, 300],
          parameters: { amount: 3, unit: 'days' },
        },
        {
          id: 'check-in',
          type: 'email',
          name: 'Check-in Email',
          position: [1250, 300],
          parameters: {
            subject: 'איך הולך?',
            text: 'נשמח לשמוע איך המערכת עובדת עבורך',
          },
        },
      ],
      connections: [
        { from: 'trigger', to: 'welcome' },
        { from: 'welcome', to: 'wait-1' },
        { from: 'wait-1', to: 'tutorial' },
        { from: 'tutorial', to: 'wait-2' },
        { from: 'wait-2', to: 'check-in' },
      ],
    };
  }

  // DEPRECATED: Commented out unused template - kept for potential future use
  // Referenced by commented-out getInvoiceGenerationRecommendation function
  // private getInvoiceGenerationTemplate(): N8nWorkflowTemplate {
  //   return {
  //     name: 'Automated Invoice Generation',
  //     description: 'Generate and send invoices automatically from order data',
  //     estimatedSetupTime: 40,
  //     nodes: [
  //       {
  //         id: 'trigger',
  //         type: 'webhook',
  //         name: 'Order Completed',
  //         position: [250, 300],
  //         parameters: { path: 'order-complete' }
  //       },
  //       {
  //         id: 'get-customer',
  //         type: 'httpRequest',
  //         name: 'Get Customer Data',
  //         position: [450, 300],
  //         parameters: {
  //           url: 'https://api.crm.com/customers/{{$json.customer_id}}'
  //         }
  //       },
  //       {
  //         id: 'generate-pdf',
  //         type: 'function',
  //         name: 'Generate Invoice PDF',
  //         position: [650, 300],
  //         parameters: {
  //           functionCode: `
  //             // Generate invoice data
  //             const invoice = {
  //               number: 'INV-' + Date.now(),
  //               date: new Date().toLocaleDateString('he-IL'),
  //               customer: items[0].json.name,
  //               items: items[0].json.order_items,
  //               total: items[0].json.total
  //             };
  //             return [{ json: invoice }];
  //           `
  //         }
  //       },
  //       {
  //         id: 'save-accounting',
  //         type: 'httpRequest',
  //         name: 'Save to Accounting',
  //         position: [850, 250],
  //         parameters: {
  //           method: 'POST',
  //           url: 'https://api.accounting.com/invoices',
  //           body: '={{$json}}'
  //         }
  //       },
  //       {
  //         id: 'email-customer',
  //         type: 'email',
  //         name: 'Email Invoice',
  //         position: [850, 350],
  //         parameters: {
  //           to: '={{$json.customer_email}}',
  //           subject: 'חשבונית {{$json.number}}',
  //           attachments: '={{$json.pdf_url}}'
  //         }
  //       }
  //     ],
  //     connections: [
  //       { from: 'trigger', to: 'get-customer' },
  //       { from: 'get-customer', to: 'generate-pdf' },
  //       { from: 'generate-pdf', to: 'save-accounting' },
  //       { from: 'generate-pdf', to: 'email-customer' }
  //     ]
  //   };
  // }

  // ==========================================================================
  // TEMPLATE-BASED RECOMMENDATIONS
  // ==========================================================================

  private getDailySummaryReportRecommendation(): SmartRecommendation {
    return {
      id: `daily-report-${Date.now()}`,
      title: 'Daily Summary Report',
      titleHebrew: 'דו"ח סיכום יומי אוטומטי',
      description: 'Automated daily business metrics report sent every morning',
      category: 'automation',
      impactScore: 6,
      effortScore: 3,
      quickWin: false,
      estimatedROI: 4000,
      affectedSystems: ['CRM', 'Helpdesk', 'Email'],
      suggestedTools: ['n8n', 'Email'],
      implementationSteps: [
        'זיהוי מקורות נתונים (CRM, Service, etc)',
        'הגדרת מדדי KPI לדו"ח',
        'בניית workflow ב-n8n',
        'עיצוב תבנית דו"ח',
        'תזמון שליחה יומית',
      ],
      priority: 0,
      n8nWorkflowTemplate: this.getDailySummaryReportTemplate(),
    };
  }

  private getLeadRoutingRecommendation(): SmartRecommendation {
    return {
      id: `lead-routing-${Date.now()}`,
      title: 'Smart Lead Routing',
      titleHebrew: 'ניתוב חכם של לידים',
      description:
        'Automatically route leads to the right sales rep based on criteria',
      category: 'automation',
      impactScore: 8,
      effortScore: 2,
      quickWin: true,
      estimatedROI: 7500,
      affectedSystems: ['CRM', 'Lead Management'],
      suggestedTools: ['n8n', 'CRM API'],
      implementationSteps: [
        'הגדרת קריטריונים לניתוב',
        'מיפוי נציגי מכירות',
        'בניית לוגיקת ניקוד',
        'יצירת workflow ב-n8n',
        'בדיקות ומעקב',
      ],
      priority: 0,
      n8nWorkflowTemplate: this.getLeadRoutingTemplate(),
    };
  }

  private getCustomerOnboardingRecommendation(): SmartRecommendation {
    return {
      id: `onboarding-${Date.now()}`,
      title: 'Customer Onboarding Automation',
      titleHebrew: 'אוטומציה של תהליך קליטת לקוחות',
      description: 'Automated onboarding flow with scheduled touchpoints',
      category: 'automation',
      impactScore: 7,
      effortScore: 3,
      quickWin: true,
      estimatedROI: 5500,
      affectedSystems: ['CRM', 'Email', 'Customer Success'],
      suggestedTools: ['n8n', 'Email marketing'],
      implementationSteps: [
        'מיפוי תהליך הקליטה הנוכחי',
        'הגדרת נקודות מגע',
        'כתיבת תוכן לכל שלב',
        'בניית workflow ב-n8n',
        'מדידת הצלחה',
      ],
      priority: 0,
      n8nWorkflowTemplate: this.getCustomerOnboardingTemplate(),
    };
  }

  // DEPRECATED: Commented out unused function - kept for potential future use
  // Invoice generation recommendation is no longer automatically triggered
  // See addTemplateRecommendations() for details
  // private getInvoiceGenerationRecommendation(): SmartRecommendation {
  //   return {
  //     id: `invoice-${Date.now()}`,
  //     title: 'Automated Invoice Generation',
  //     titleHebrew: 'יצירת חשבוניות אוטומטית',
  //     description: 'Generate and send invoices automatically from completed orders',
  //     category: 'automation',
  //     impactScore: 9,
  //     effortScore: 3,
  //     quickWin: true,
  //     estimatedROI: 8000,
  //     affectedSystems: ['ERP', 'Accounting', 'Email'],
  //     suggestedTools: ['n8n', 'PDF generator', 'Accounting API'],
  //     implementationSteps: [
  //       'חיבור למערכת הנהלת חשבונות',
  //       'יצירת תבנית חשבונית',
  //       'בניית workflow ב-n8n',
  //       'הוספת שליחה אוטומטית',
  //       'אינטגרציה עם מערכת הכספים'
  //     ],
  //     priority: 0,
  //     n8nWorkflowTemplate: this.getInvoiceGenerationTemplate()
  //   };
  // }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private extractSystemsFromPattern(pattern: DetectedPattern): string[] {
    const systems: string[] = [];

    if (pattern.description.toLowerCase().includes('crm')) systems.push('CRM');
    if (pattern.description.toLowerCase().includes('whatsapp'))
      systems.push('WhatsApp');
    if (pattern.description.toLowerCase().includes('email'))
      systems.push('Email');
    if (pattern.description.toLowerCase().includes('invoic'))
      systems.push('Accounting');

    return systems;
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  public getRecommendations(): SmartRecommendation[] {
    return this.recommendations;
  }

  public getQuickWins(): SmartRecommendation[] {
    return this.recommendations.filter((r) => r.quickWin);
  }

  public getByCategory(
    category: SmartRecommendation['category']
  ): SmartRecommendation[] {
    return this.recommendations.filter((r) => r.category === category);
  }

  public getPatternAnalysis(): PatternAnalysisResult {
    const totalPotentialSavings = this.recommendations.reduce(
      (sum, rec) => sum + rec.estimatedROI,
      0
    );

    return {
      detectedPatterns: this.patterns,
      automationOpportunities: this.patterns.length,
      totalPotentialSavings,
      criticalIssues: this.patterns
        .filter((p) => p.severity === 'critical')
        .map((p) => p.description),
      quickWins: this.recommendations
        .filter((r) => r.quickWin)
        .map((r) => r.titleHebrew),
    };
  }

  public getTopRecommendations(count: number = 5): SmartRecommendation[] {
    return this.recommendations.slice(0, count);
  }

  public getTotalEstimatedROI(): number {
    return this.recommendations.reduce((sum, rec) => sum + rec.estimatedROI, 0);
  }
}

// ==========================================================================
// EXPORTED FUNCTIONS
// ==========================================================================

/**
 * Analyze patterns from meeting data
 */
export function analyzePatterns(meeting: Meeting): PatternAnalysisResult {
  const engine = new SmartRecommendationsEngine(meeting);
  return engine.getPatternAnalysis();
}

/**
 * Prioritize recommendations by quick wins and impact/effort ratio
 */
export function prioritizeRecommendations(
  recommendations: SmartRecommendation[]
): SmartRecommendation[] {
  return SmartRecommendationsEngine.sortRecommendations(recommendations);
}

/**
 * Get quick win recommendations (high impact, low effort)
 */
export function getQuickWins(meeting: Meeting): SmartRecommendation[] {
  const engine = new SmartRecommendationsEngine(meeting);
  return engine.getQuickWins();
}

/**
 * Get all recommendations for a meeting
 */
export function getSmartRecommendations(
  meeting: Meeting
): SmartRecommendation[] {
  const engine = new SmartRecommendationsEngine(meeting);
  return engine.getRecommendations();
}
