// discovery-assistant/src/utils/mobileDataAdapter.ts

import { Modules, FocusArea } from '../types';
import { MobileFormData } from '../types/mobile';

/**
 * ממיר נתונים מטופס מובייל לפורמט Modules מלא
 * כך שניתן להשתמש בכל הפונקציות הקיימות
 * 
 * @param data - Mobile form data (15 questions)
 * @returns Complete Modules object compatible with proposalEngine
 */
export function mobileToModules(data: MobileFormData): Modules {
  
  const { ai_agents, automations, crm } = data;

  return {
    // ===================================
    // OVERVIEW
    // ===================================
    overview: {
      businessType: 'b2b',
      employees: mapUsersToEmployees(crm.users),
      mainChallenge: automations.most_important_process || '',
      mainGoals: determineMainGoals(automations, crm),
      processes: determineProcesses(automations),
      currentSystems: crm.exists === 'yes' ? ['crm'] : [],
      budget: 'flexible',
      focusAreas: [
        'ai_agents',
        'automation',
        ...(crm.exists === 'yes' ? ['crm_upgrade'] as FocusArea[] : [])
      ] as FocusArea[]
    },

    // ===================================
    // AI AGENTS
    // ===================================
    aiAgents: {
      sales: {
        useCases: ai_agents.domains.includes('sales')
          ? mapDomainToSalesUseCases(ai_agents.domains, ai_agents.channels)
          : [],
        customUseCase: ai_agents.notes || '',
        potential: calculateAIPotential(ai_agents),
        readiness: 'immediate'
      },
      
      service: {
        useCases: ai_agents.domains.includes('customer_service')
          ? mapDomainToServiceUseCases(ai_agents.domains, ai_agents.channels)
          : [],
        customUseCase: ai_agents.notes || '',
        potential: calculateAIPotential(ai_agents),
        readiness: 'immediate'
      },
      
      operations: {
        useCases: ai_agents.domains.includes('technical_support')
          ? ['document_processing', 'workflow_optimization']
          : [],
        potential: 4,
        readiness: 'short'
      },
      
      priority: ai_agents.count === '1' ? 'pilot' 
        : ai_agents.count === '2' ? 'sales'
        : 'all',
      naturalLanguageImportance: 5,
      currentAITools: [],
      aiBarriers: determinePotentialBarriers(automations, crm),
      teamSkillLevel: 3
    },

    // ===================================
    // LEADS & SALES
    // ===================================
    leadsAndSales: {
      // Lead Sources - array של LeadSource objects
      leadSources: mapIntegrationsToLeadSources(crm.integrations),
      centralSystem: crm.exists === 'yes' ? 'crm' : 'scattered',
      commonIssues: determineLeadIssues(automations.biggest_pain),
      timeToProcessLead: mapTimeWastedToMinutes(automations.time_wasted),
      
      speedToLead: {
        duringBusinessHours: automations.biggest_pain === 'takes_time' ? 'slow' : 'moderate',
        responseTimeUnit: 'hours',
        afterHours: ai_agents.channels.length > 0 ? 'partial' : 'no_response',
        weekends: 'no_response',
        unansweredPercentage: automations.biggest_pain === 'things_fall' ? 30 : 10
      },
      
      leadRouting: {
        method: automations.processes.includes('lead_management') 
          ? ['rotation', 'load_balancing'] 
          : ['manual'],
        methodDetails: '',
        hotLeadCriteria: ai_agents.domains.includes('lead_qualification')
          ? ['urgency', 'fit']
          : []
      },
      
      followUp: {
        attempts: 3,
        day1Interval: 'same_day',
        day3Interval: 'daily',
        day7Interval: 'weekly',
        channels: automations.processes.includes('followup')
          ? ['whatsapp', 'email', 'sms']
          : [],
        dropOffRate: automations.biggest_pain === 'no_tracking' ? 40 : 20,
        nurturing: automations.processes.includes('followup')
      },
      
      appointments: {
        avgSchedulingTime: 15,
        messagesPerScheduling: 3,
        cancellationRate: 10,
        noShowRate: 5,
        multipleParticipants: false,
        changesPerWeek: 5,
        reminders: automations.processes.includes('reminders')
          ? {
              when: ['day_before', 'hour_before'],
              channels: ['whatsapp', 'sms']
            }
          : undefined,
        criticalPain: ai_agents.domains.includes('scheduling')
      }
    },

    // ===================================
    // CUSTOMER SERVICE
    // ===================================
    customerService: {
      channels: ai_agents.channels.map(ch => ({
        type: ch,
        volumePerDay: 20,
        responseTime: '1 hour'
      })),
      multiChannelIssue: ai_agents.channels.length > 2 ? 'minor' : '',
      unificationMethod: crm.exists === 'yes' ? 'unified_system' : 'none',
      autoResponse: {
        topQuestions: ai_agents.domains.includes('faq')
          ? [
              { question: 'שאלה נפוצה 1', frequencyPerDay: 5 },
              { question: 'שאלה נפוצה 2', frequencyPerDay: 3 }
            ]
          : [],
        commonRequests: [],
        automationPotential: ai_agents.domains.includes('faq') ? 60 : 30
      },
      proactiveCommunication: {
        updateTriggers: automations.processes.includes('customer_updates')
          ? ['post_purchase', 'during_process']
          : [],
        frequency: 'weekly',
        type: ['updates']
      },
      communityManagement: { 
        exists: false 
      },
      reputationManagement: {
        feedbackCollection: {
          when: [],
          how: []
        }
      },
      onboarding: {
        steps: []
      }
    },

    // ===================================
    // OPERATIONS
    // ===================================
    operations: {
      workProcesses: {
        processes: [],
        commonFailures: mapPainToFailures(automations.biggest_pain),
        errorTrackingSystem: crm.exists === 'yes' ? 'crm' : 'none',
        processDocumentation: '',
        automationReadiness: calculateAutomationReadiness(automations)
      },
      documentManagement: {
        flows: [],
        storageLocations: automations.processes.includes('documents') ? ['google_drive'] : [],
        searchDifficulties: '',
        versionControlMethod: 'none',
        approvalWorkflow: '',
        documentRetention: 0
      },
      projectManagement: {
        tools: [],
        taskCreationSources: [],
        issues: [],
        resourceAllocationMethod: 'manual',
        timelineAccuracy: 50,
        projectVisibility: 'meetings',
        deadlineMissRate: 20
      },
      hr: {
        departments: [],
        onboardingSteps: 0,
        onboardingDuration: 0,
        trainingRequirements: [],
        performanceReviewFrequency: 'none',
        employeeTurnoverRate: 0,
        hrSystemsInUse: []
      },
      logistics: {
        inventoryMethod: 'none',
        shippingProcesses: [],
        supplierCount: 0,
        orderFulfillmentTime: 0,
        warehouseOperations: [],
        deliveryIssues: '',
        returnProcessTime: 0,
        inventoryAccuracy: 0
      }
    },

    // ===================================
    // REPORTING
    // ===================================
    reporting: {
      criticalAlerts: automations.processes.includes('reports')
        ? ['new_lead', 'customer_complaint']
        : [],
      scheduledReports: automations.processes.includes('reports')
        ? [
            { name: 'דוח מכירות', frequency: 'weekly' },
            { name: 'דוח שיווק', frequency: 'weekly' }
          ]
        : [],
      kpis: crm.missing_report ? [
        { name: crm.missing_report, measured: 'not' }
      ] : [],
      dashboards: {
        exists: crm.biggest_gap !== 'no_reports',
        realTime: false,
        anomalyDetection: 'none'
      }
    },

    // ===================================
    // SYSTEMS
    // ===================================
    systems: {
      currentSystems: crm.exists === 'yes' ? ['crm'] : [],
      customSystems: crm.system === 'other' ? (crm.other_system || '') : '',
      integrations: {
        level: calculateIntegrationLevel(crm),
        issues: determineIntegrationIssues(crm, automations),
        manualDataTransfer: mapTimeWastedToManualTransfer(automations.time_wasted)
      },
      dataQuality: {
        overall: mapDataQualityToOverall(crm.data_quality),
        duplicates: crm.data_quality === 'messy' ? 'many' : 'none',
        completeness: crm.data_quality === 'clean' ? 'complete' : 'partial'
      },
      apiWebhooks: {
        usage: 'minimal',
        webhooks: 'none',
        needs: crm.integrations || []
      },
      infrastructure: {
        hosting: 'cloud',
        security: ['ssl', '2fa'],
        backup: 'daily'
      }
    },

    // ===================================
    // ROI (ריק - לא בשימוש, אבל proposalEngine מצפה לו)
    // ===================================
    roi: {
      currentCosts: {
        manualHours: String(mapTimeWastedToHours(automations.time_wasted)),
        hourlyCost: '100',
        toolsCost: '0',
        errorCost: '0',
        lostOpportunities: '0'
      },
      timeSavings: {
        estimatedHoursSaved: String(mapTimeWastedToHours(automations.time_wasted) * 0.7),
        processes: automations.processes,
        implementation: 'quick'
      },
      investment: {
        range: '10k_50k',
        paybackExpectation: '12_months',
        budgetAvailable: 'needs_approval'
      },
      successMetrics: [],
      measurementFrequency: 'monthly'
    }
  };
}

// ===================================
// Helper Functions
// ===================================

function mapDomainToSalesUseCases(domains: string[], channels: string[]): string[] {
  const useCases: string[] = [];
  
  if (domains.includes('sales')) {
    useCases.push('chatbot', 'first_contact');
  }
  
  if (domains.includes('lead_qualification')) {
    useCases.push('lead_qualification');
  }
  
  if (domains.includes('scheduling')) {
    useCases.push('appointment_scheduling');
  }
  
  if (channels.includes('whatsapp')) {
    useCases.push('follow_up');
  }
  
  return [...new Set(useCases)];
}

function mapDomainToServiceUseCases(domains: string[], channels: string[]): string[] {
  const useCases: string[] = [];
  
  if (domains.includes('customer_service')) {
    useCases.push('chatbot', 'auto_response');
  }
  
  if (domains.includes('faq')) {
    useCases.push('knowledge_base');
  }
  
  if (domains.includes('technical_support')) {
    useCases.push('ticket_classification', 'routing');
  }
  
  return [...new Set(useCases)];
}

function calculateAIPotential(ai_agents: any): number {
  let potential = 3;
  
  if (ai_agents.count === '3+') potential += 2;
  if (ai_agents.count === '2') potential += 1;
  if (ai_agents.domains.length >= 3) potential += 1;
  
  return Math.min(5, potential);
}

function determineMainGoals(automations: any, crm: any): string[] {
  const goals = [];
  
  if (automations.time_wasted === 'over_4h' || automations.time_wasted === '3-4h') {
    goals.push('save_time');
  }
  
  if (automations.biggest_pain === 'human_errors') {
    goals.push('reduce_errors');
  }
  
  if (automations.biggest_pain === 'things_fall' || automations.biggest_pain === 'no_tracking') {
    goals.push('improve_service');
  }
  
  if (crm.biggest_gap === 'no_reports' || crm.data_quality === 'messy') {
    goals.push('better_data');
  }
  
  return goals;
}

function determineProcesses(automations: any): string[] {
  const processes = [];
  
  if (automations.processes.includes('lead_management') || 
      automations.processes.includes('followup')) {
    processes.push('sales');
  }
  
  if (automations.processes.includes('customer_updates')) {
    processes.push('service', 'marketing');
  }
  
  if (automations.processes.includes('data_sync')) {
    processes.push('operations');
  }
  
  return processes;
}

function mapIntegrationsToLeadSources(integrations?: string[]): any[] {
  if (!integrations || integrations.length === 0) return [];
  
  const mapping: Record<string, string> = {
    'website_forms': 'website',
    'facebook_leads': 'facebook',
    'google_ads': 'google',
    'whatsapp': 'whatsapp',
    'email': 'email'
  };
  
  return integrations.map(i => ({
    channel: mapping[i] || i,
    volumePerMonth: 50,
    quality: 3 as 1 | 2 | 3 | 4 | 5
  }));
}

function mapTimeWastedToMinutes(timeWasted: string): number {
  const mapping: Record<string, number> = {
    'under_1h': 30,
    '1-2h': 60,
    '3-4h': 120,
    'over_4h': 180
  };
  
  return mapping[timeWasted] || 30;
}

function determineLeadIssues(pain: string): string[] {
  const mapping: Record<string, string[]> = {
    'things_fall': ['channels_miss', 'lead_loss'],
    'human_errors': ['incomplete_info', 'duplicates'],
    'takes_time': ['slow_processing'],
    'no_tracking': ['lead_loss', 'slow_processing']
  };
  
  return mapping[pain] || [];
}

function mapPainToFailures(pain: string): string[] {
  const mapping: Record<string, string[]> = {
    'human_errors': ['manual_errors'],
    'things_fall': ['missing_info', 'communication'],
    'no_tracking': ['communication'],
    'takes_time': ['manual_errors']
  };
  
  return mapping[pain] || [];
}

function calculateAutomationReadiness(automations: any): number {
  let score = 30;
  
  if (automations.processes.length >= 5) score += 30;
  if (automations.time_wasted === 'over_4h') score += 20;
  if (automations.most_important_process) score += 20;
  
  return Math.min(100, score);
}

function mapTimeWastedToHours(timeWasted: string): number {
  const mapping: Record<string, number> = {
    'under_1h': 5,
    '1-2h': 10,
    '3-4h': 20,
    'over_4h': 30
  };
  
  return mapping[timeWasted] || 5;
}

function mapTimeWastedToManualTransfer(timeWasted: string): string {
  const mapping: Record<string, string> = {
    'under_1h': '1-2_hours',
    '1-2h': '3-5_hours',
    '3-4h': '6-10_hours',
    'over_4h': 'over_10'
  };
  
  return mapping[timeWasted] || 'none';
}

function calculateIntegrationLevel(crm: any): 'full' | 'partial' | 'minimal' | 'none' {
  if (!crm.exists || crm.exists !== 'yes') return 'none';
  
  const count = crm.integrations?.length || 0;
  
  if (count >= 5) return 'full';
  if (count >= 3) return 'partial';
  if (count >= 1) return 'minimal';
  
  return 'none';
}

function determineIntegrationIssues(crm: any, automations: any): string[] {
  const issues = [];
  
  if (crm.data_quality === 'messy') {
    issues.push('data_loss', 'duplicate_entry');
  }
  
  if (crm.biggest_gap === 'not_connected') {
    issues.push('manual_updates');
  }
  
  if (automations.time_wasted === 'over_4h' || automations.time_wasted === '3-4h') {
    issues.push('sync_delays');
  }
  
  return issues;
}

function mapDataQualityToOverall(quality: string): string {
  const mapping: Record<string, string> = {
    'clean': 'excellent',
    'ok': 'good',
    'messy': 'poor',
    'no_crm': 'average'
  };
  
  return mapping[quality] || 'average';
}

function mapUsersToEmployees(users?: string): string {
  const mapping: Record<string, string> = {
    '1-3': '1-10',
    '4-10': '11-50',
    '11-20': '51-200',
    '20+': '200+'
  };
  
  return mapping[users || ''] || '11-50';
}

function determinePotentialBarriers(automations: any, crm: any): string[] {
  const barriers = [];
  
  if (crm.data_quality === 'messy') {
    barriers.push('data');
  }
  
  if (crm.biggest_gap === 'hard_to_use') {
    barriers.push('skills');
  }
  
  if (automations.biggest_pain === 'no_tracking') {
    barriers.push('integration');
  }
  
  return barriers;
}

/**
 * Validation
 */
export function validateMobileData(data: MobileFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // AI validation
  if (!data.ai_agents.count) {
    errors.push('חובה לבחור כמות סוכני AI');
  }
  if (data.ai_agents.channels.length === 0) {
    errors.push('חובה לבחור לפחות ערוץ אחד');
  }
  if (data.ai_agents.domains.length === 0) {
    errors.push('חובה לבחור לפחות תחום אחד');
  }
  
  // Automations validation
  if (data.automations.processes.length === 0) {
    errors.push('חובה לבחור לפחות תהליך אחד');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

