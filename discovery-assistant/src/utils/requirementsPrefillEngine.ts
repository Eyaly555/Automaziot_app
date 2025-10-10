import { Meeting } from '../types';
import { CollectedRequirements } from '../types/serviceRequirements';

/**
 * Smart Pre-fill Engine
 * Maps data from Phase 1 (8 modules) to service requirement questionnaires
 * So customers don't have to re-enter information they already provided
 */

export const prefillRequirementsFromMeeting = (
  serviceId: string,
  meeting: Meeting
): Partial<CollectedRequirements['data']> => {
  const modules = meeting.modules;

  switch (serviceId) {
    // ==================== CRM IMPLEMENTATION ====================
    case 'impl-crm':
      return prefillCRMRequirements(modules);

    // ==================== AI CHATBOT ====================
    case 'ai-faq-bot':
    case 'ai-service-agent':
    case 'ai-sales-agent':
    case 'ai-complex-workflow':
    case 'ai-action-agent':
      return prefillAIChatbotRequirements(modules, serviceId);

    // ==================== LEAD WORKFLOW ====================
    case 'auto-lead-workflow':
    case 'auto-lead-response':
    case 'auto-smart-followup':
      return prefillLeadWorkflowRequirements(modules);

    // ==================== WHATSAPP AUTOMATION ====================
    case 'auto-sms-whatsapp':
    case 'whatsapp-api-setup':
      return prefillWhatsAppRequirements(modules);

    // ==================== CRM AUTO UPDATE ====================
    case 'auto-crm-update':
    case 'auto-form-to-crm':
      return prefillCRMAutoUpdateRequirements(modules);

    // ==================== SYSTEM INTEGRATION ====================
    case 'auto-system-sync':
    case 'int-complex':
    case 'auto-multi-system':
    case 'integration-simple':
    case 'integration-complex':
    case 'auto-data-sync':
      return prefillSystemIntegrationRequirements(modules);

    // ==================== DOCUMENT MANAGEMENT ====================
    case 'auto-document-mgmt':
    case 'auto-document-generation':
      return prefillDocumentManagementRequirements(modules);

    // ==================== REPORTING & DASHBOARDS ====================
    case 'auto-reports':
    case 'add-dashboard':
    case 'add-custom-reports':
    case 'reports-automated':
      return prefillReportingRequirements(modules);

    // ==================== EMAIL & NOTIFICATIONS ====================
    case 'auto-email-templates':
    case 'auto-notifications':
      return prefillEmailNotificationsRequirements(modules);

    // ==================== APPROVAL WORKFLOWS ====================
    case 'auto-approval-workflow':
      return prefillApprovalWorkflowRequirements(modules);

    // ==================== MEETING SCHEDULER ====================
    case 'auto-meeting-scheduler':
      return prefillMeetingSchedulerRequirements(modules);

    // ==================== MARKETING AUTOMATION ====================
    case 'impl-marketing-automation':
      return prefillMarketingAutomationRequirements(modules);

    // ==================== PROJECT MANAGEMENT ====================
    case 'impl-project-management':
      return prefillProjectManagementRequirements(modules);

    // ==================== DATA CLEANUP ====================
    case 'data-cleanup':
      return prefillDataCleanupRequirements(modules);

    // ==================== SUPPORT & TRAINING ====================
    case 'support-ongoing':
    case 'training-workshops':
      return prefillSupportTrainingRequirements(modules);

    default:
      return prefillGenericRequirements(modules, serviceId);
  }
};

// ==================== CRM IMPLEMENTATION PRE-FILL ====================
const prefillCRMRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const overview = modules?.overview;
  const leads = modules?.leadsAndSales;
  const service = modules?.customerService;
  const systems = modules?.systems;

  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Number of users (from overview)
  if (overview?.employees) {
    const employeeRanges: Record<string, number> = {
      '1-10': 5,
      '11-50': 20,
      '51-200': 100,
      '200-500': 300,
      '500+': 500
    };
    prefilled.crm_users_count = employeeRanges[meeting.modules?.operations?.hr?.employeeCount] || 10;
  }

  // If they already have a system, detect it
  if (systems?.currentSystems) {
    const systemsList = systems.currentSystems;
    if (systemsList.some((s: string) => s.toLowerCase().includes('zoho'))) {
      prefilled.crm_preference = 'zoho';
    } else if (systemsList.some((s: string) => s.toLowerCase().includes('hubspot'))) {
      prefilled.crm_preference = 'hubspot';
    } else if (systemsList.some((s: string) => s.toLowerCase().includes('salesforce'))) {
      prefilled.crm_preference = 'salesforce';
    } else if (systemsList.some((s: string) => s.toLowerCase().includes('pipedrive'))) {
      prefilled.crm_preference = 'pipedrive';
    } else {
      prefilled.crm_preference = 'recommend';
    }
  }

  // Standard fields - auto-select based on what they collect
  prefilled.standard_fields = ['name', 'email', 'phone', 'company'];

  // Lead sources from Leads module
  if (leads?.leadSources && leads.leadSources.length > 0) {
    prefilled.lead_source_tracking = true;
  }

  // Sales pipeline stages (if they described their process)
  if (leads?.followUp) {
    prefilled.pipeline_stages = [
      'New Lead',
      'Contacted',
      'Qualified',
      'Meeting Scheduled',
      'Proposal Sent',
      'Negotiation',
      'Closed Won',
      'Closed Lost'
    ];
  }

  // Assignment method based on current routing
  if (leads?.leadRouting?.method) {
    const methodMap: Record<string, string> = {
      'rotation': 'round_robin',
      'expertise': 'skill',
      'territory': 'territory',
      'manual': 'manual'
    };
    prefilled.auto_assignment = methodMap[leads.leadRouting.method] || 'round_robin';
  }

  // Notifications
  prefilled.notifications = ['new_lead', 'hot_lead', 'deal_won'];

  // Email integration
  prefilled.email_integration = 'gmail'; // Default

  // Reports needed
  prefilled.reports_needed = [
    'sales_pipeline',
    'conversion_rates',
    'lead_sources',
    'team_performance'
  ];

  // Integrations
  const integrations: string[] = [];
  if (service?.channels?.some((ch) => ch.type === 'whatsapp')) {
    integrations.push('whatsapp');
  }
  if (leads?.leadSources?.some((s) => s.channel === 'facebook')) {
    integrations.push('facebook');
  }
  if (leads?.leadSources?.some((s) => s.channel === 'website')) {
    integrations.push('website');
  }
  prefilled.integrations = integrations;

  // Data migration
  if (systems?.currentSystems && systems.currentSystems.length > 0) {
    const hasCRM = systems.currentSystems.some((s: string) =>
      s.toLowerCase().includes('crm') ||
      s.toLowerCase().includes('salesforce') ||
      s.toLowerCase().includes('hubspot')
    );
    prefilled.existing_data = hasCRM ? 'yes_crm' : 'yes_spreadsheet';

    // Estimate data volume from lead volume
    const totalLeadVolume = leads?.leadSources?.reduce((sum: number, s) =>
      sum + (s.volumePerMonth || 0), 0) || 0;
    prefilled.data_volume = totalLeadVolume * 12; // Rough estimate: year of leads
  } else {
    prefilled.existing_data = 'no';
  }

  return prefilled;
};

// ==================== AI CHATBOT PRE-FILL ====================
const prefillAIChatbotRequirements = (
  modules: Meeting['modules'],
  _serviceId: string
): Partial<CollectedRequirements['data']> => {
  const overview = modules?.overview;
  const service = modules?.customerService;
  // Note: ai module data could be used to prefill AI-related requirements in future
  // const ai = modules?.aiAgents;

  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Bot name based on company
  prefilled.bot_name = 'עוזר אוטומטי'; // Default

  // Channels based on where they communicate
  const channels: string[] = [];
  if (service?.channels) {
    service.channels.forEach((ch) => {
      if (ch.type === 'whatsapp') channels.push('whatsapp');
      if (ch.type === 'facebook') channels.push('facebook');
      if (ch.type === 'instagram') channels.push('instagram');
      if (ch.type === 'website') channels.push('website');
    });
  }
  prefilled.channels = channels.length > 0 ? channels : ['website'];

  // Language
  prefilled.language = ['he', 'en']; // Default Hebrew + English

  // Personality based on business type
  const businessType = overview?.businessType;
  if (businessType === 'b2b' || businessType === 'saas') {
    prefilled.personality = 'professional';
  } else {
    prefilled.personality = 'friendly';
  }

  // FAQ list from customer service module
  if (service?.autoResponse?.topQuestions) {
    prefilled.faq_list = service.autoResponse.topQuestions.map((q) => ({
      question: q.question,
      answer: '' // They'll need to fill answers
    }));
  }

  // Include product info if they have products
  prefilled.product_info = true;

  // Welcome message
  prefilled.greeting_message = 'שלום! אני כאן לעזור לך. במה אוכל לסייע?';

  // Quick actions based on their services
  prefilled.quick_actions = [
    'שאלות נפוצות',
    'דבר עם נציג',
    'בדוק סטטוס'
  ];

  // Fallback strategy
  prefilled.fallback_strategy = 'human_handoff';

  // Business hours from service module
  prefilled.business_hours = 'א׳-ה׳ 9:00-17:00'; // Default

  // After hours action
  prefilled.after_hours_action = 'leave_message';

  // Handoff triggers
  prefilled.handoff_triggers = ['request', 'complex', 'frustrated'];

  // Integrations
  prefilled.crm_integration = true;
  prefilled.analytics = true;

  // Notification channels
  prefilled.notification_channel = ['email', 'whatsapp'];

  return prefilled;
};

// ==================== LEAD WORKFLOW PRE-FILL ====================
const prefillLeadWorkflowRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const leads = modules?.leadsAndSales;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Lead sources directly from module
  if (leads?.leadSources) {
    prefilled.lead_sources = leads.leadSources.map((s) => {
      const channelMap: Record<string, string> = {
        'website': 'website_form',
        'facebook': 'facebook_ads',
        'google': 'google_ads',
        'linkedin': 'linkedin',
        'whatsapp': 'whatsapp',
        'phone': 'phone',
        'email': 'email',
        'referrals': 'referrals'
      };
      return channelMap[s.channel] || s.channel;
    });

    // Monthly volume
    const totalVolume = leads.leadSources.reduce((sum: number, s) =>
      sum + (s.volumePerMonth || 0), 0);
    prefilled.monthly_volume = totalVolume;
  }

  // Response time based on speed to lead
  if (leads?.speedToLead?.duringBusinessHours) {
    const speedMap: Record<string, string> = {
      'immediate': 'immediate',
      'within_hour': '1hour',
      'same_day': 'same_day'
    };
    prefilled.auto_response_time = speedMap[leads.speedToLead.duringBusinessHours] || 'immediate';
  } else {
    prefilled.auto_response_time = 'immediate';
  }

  // Auto response channels based on follow-up channels
  if (leads?.followUp?.channels) {
    prefilled.auto_response_channel = leads.followUp.channels;
  } else {
    prefilled.auto_response_channel = ['email', 'whatsapp'];
  }

  // Welcome message template
  prefilled.welcome_message = 'תודה על פנייתך! קיבלנו את המידע וניצור איתך קשר בהקדם.';

  // Lead enrichment
  prefilled.lead_enrichment = true;

  // Lead scoring based on if they track quality
  const hasQualityTracking = leads?.leadSources?.some((s) => s.quality);
  prefilled.use_lead_scoring = hasQualityTracking ? 'yes' : 'no';

  // Hot lead criteria
  if (hasQualityTracking) {
    prefilled.hot_lead_criteria = ['high_budget', 'urgent', 'engagement'];
  }

  // Assignment method from routing
  if (leads?.leadRouting?.method) {
    const methodMap: Record<string, string> = {
      'rotation': 'round_robin',
      'expertise': 'skill',
      'territory': 'territory',
      'manual': 'round_robin'
    };
    prefilled.assignment_method = methodMap[leads.leadRouting.method] || 'round_robin';
  } else {
    prefilled.assignment_method = 'round_robin';
  }

  // Hot lead handling
  prefilled.hot_lead_handling = 'senior';

  // Reassignment
  prefilled.reassignment_rules = true;

  // Follow-up sequence based on drop-off rate
  const dropOffRate = leads?.followUp?.dropOffRate || 0;
  if (dropOffRate > 40) {
    prefilled.followup_sequence = 'aggressive';
  } else if (dropOffRate > 20) {
    prefilled.followup_sequence = 'moderate';
  } else {
    prefilled.followup_sequence = 'gentle';
  }

  // Follow-up channels
  if (leads?.followUp?.channels) {
    prefilled.followup_channels = leads.followUp.channels;
  }

  // No response action
  prefilled.no_response_action = 'nurture';

  // Notifications
  prefilled.notify_events = ['new_lead', 'hot_lead', 'lead_reply', 'no_activity'];
  prefilled.notification_channels = ['email', 'whatsapp', 'crm'];

  // Reporting
  prefilled.daily_summary = true;
  prefilled.weekly_analysis = true;
  prefilled.dashboard = true;

  return prefilled;
};

// ==================== WHATSAPP AUTOMATION PRE-FILL ====================
const prefillWhatsAppRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const leads = modules?.leadsAndSales;
  const service = modules?.customerService;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Check if they use WhatsApp
  const hasWhatsApp = service?.channels?.some((ch) => ch.type === 'whatsapp') ||
                      leads?.leadSources?.some((s) => s.channel === 'whatsapp');

  if (hasWhatsApp) {
    // Volume
    const whatsappChannel = service?.channels?.find((ch) => ch.type === 'whatsapp');
    prefilled.daily_volume = whatsappChannel?.volumePerDay || 20;

    // Response templates from FAQ
    if (service?.autoResponse?.topQuestions) {
      prefilled.response_templates = service.autoResponse.topQuestions.slice(0, 5);
    }
  }

  // Business info
  prefilled.business_name = ''; // They'll need to provide
  prefilled.business_phone = ''; // They'll need to provide

  // Message types needed
  prefilled.message_types = ['text', 'buttons', 'templates'];

  // Automation triggers
  prefilled.auto_triggers = ['new_message', 'keyword_match', 'business_hours'];

  // Integration with CRM
  prefilled.crm_integration = true;

  return prefilled;
};

// ==================== CRM AUTO UPDATE PRE-FILL ====================
const prefillCRMAutoUpdateRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const leads = modules?.leadsAndSales;
  const systems = modules?.systems;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Form sources
  const formSources: string[] = [];
  if (leads?.leadSources) {
    if (leads.leadSources.some((s) => s.channel === 'website')) formSources.push('website');
    if (leads.leadSources.some((s) => s.channel === 'facebook')) formSources.push('facebook');
    if (leads.leadSources.some((s) => s.channel === 'google')) formSources.push('google');
  }
  prefilled.form_sources = formSources;

  // CRM system
  if (systems?.currentSystems) {
    const crmSystem = systems.currentSystems.find((s: string) =>
      s.toLowerCase().includes('crm') ||
      s.toLowerCase().includes('zoho') ||
      s.toLowerCase().includes('hubspot') ||
      s.toLowerCase().includes('salesforce')
    );
    if (crmSystem) {
      prefilled.crm_system = crmSystem.toLowerCase();
    }
  }

  // Field mapping
  prefilled.auto_map_fields = true;
  prefilled.duplicate_check = true;
  prefilled.lead_source_tracking = true;

  return prefilled;
};

// ==================== SYSTEM INTEGRATION PRE-FILL ====================
const prefillSystemIntegrationRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const systems = modules?.systems;
  // Note: operations module data could be used to identify integration needs in future
  // const operations = modules?.operations;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Systems to integrate
  if (systems?.currentSystems) {
    prefilled.systems_list = systems.currentSystems;
  }

  // DEPRECATED: systemSync.dataTransferMethod removed in OperationsModule v2
  // Old code: prefilled.current_method = operations.systemSync.dataTransferMethod
  // Default to 'manual' if not specified

  // Data sync frequency
  prefilled.sync_frequency = 'realtime';

  // Sync direction
  prefilled.sync_direction = 'bidirectional';

  // DEPRECATED: systemSync.manualWork removed in OperationsModule v2
  // Old code: prefilled.weekly_hours_manual = operations.systemSync.manualWork
  // Future: Could estimate from workProcesses.automationReadiness

  // Issues to solve
  if (systems?.integrations?.issues) {
    prefilled.current_issues = systems.integrations.issues;
  }

  // API access
  if (systems?.apiWebhooks?.usage) {
    prefilled.api_available = systems.apiWebhooks.usage !== 'none';
  }

  return prefilled;
};

// ==================== DOCUMENT MANAGEMENT PRE-FILL ====================
const prefillDocumentManagementRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const operations = modules?.operations;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  if (operations?.documentManagement) {
    const docMgmt = operations.documentManagement;

    // Document types
    if (docMgmt.documentTypes) {
      prefilled.document_types = docMgmt.documentTypes.map((d) => ({
        type: d.type,
        monthly_volume: d.volumePerMonth,
        time_per_doc: d.timePerDocument
      }));
    }

    // Storage location
    prefilled.current_storage = docMgmt.storage || 'mixed';

    // Organization level
    prefilled.current_organization = docMgmt.organization || 'messy';

    // Incoming documents
    if (docMgmt.incomingDocuments) {
      prefilled.incoming_channels = docMgmt.incomingDocuments;
    }

    // Accuracy requirements
    prefilled.accuracy_required = docMgmt.accuracyRequired || 'high';
  }

  // Automation needs
  prefilled.auto_classify = true;
  prefilled.auto_extract_data = true;
  prefilled.auto_route = true;

  return prefilled;
};

// ==================== REPORTING & DASHBOARDS PRE-FILL ====================
const prefillReportingRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const reporting = modules?.reporting;
  const roi = modules?.roi;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Existing reports
  if (reporting?.scheduledReports) {
    prefilled.current_reports = reporting.scheduledReports.map((r) => ({
      name: r.name,
      frequency: r.frequency,
      time_to_create: r.timeToCreate
    }));
  }

  // KPIs to track
  if (reporting?.kpis) {
    prefilled.kpis_to_track = reporting.kpis.map((k) => k.name);
  }

  // Success metrics from ROI
  if (roi?.successMetrics) {
    prefilled.success_metrics = roi.successMetrics;
  }

  // Dashboard preferences
  prefilled.realtime_required = reporting?.dashboards?.realTime || false;
  prefilled.anomaly_detection = reporting?.dashboards?.anomalyDetection || 'automatic';

  // Report frequency
  prefilled.report_frequency = 'daily';

  // Distribution
  prefilled.distribution_channels = ['email', 'dashboard'];

  return prefilled;
};

// ==================== EMAIL & NOTIFICATIONS PRE-FILL ====================
const prefillEmailNotificationsRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const leads = modules?.leadsAndSales;
  const service = modules?.customerService;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Email templates - detect common types
  if (leads?.leadSources && leads.leadSources.length > 0) {
    prefilled.template_list = ['תודה על פנייתך', 'אישור פגישה', 'הצעת מחיר'];
  }

  // Personalization
  prefilled.personalization = ['name', 'company', 'product'];

  // Trigger - based on what they do with leads
  prefilled.trigger = ['lead_submit', 'meeting_booked', 'quote_sent'];

  // Notification events
  prefilled.events = ['new_lead', 'hot_lead', 'customer_message'];

  // Channels
  const channels: string[] = [];
  if (service?.channels?.some((ch) => ch.type === 'email')) channels.push('email');
  if (service?.channels?.some((ch) => ch.type === 'whatsapp')) channels.push('whatsapp');
  if (channels.length > 0) prefilled.channels = channels;

  return prefilled;
};

// ==================== APPROVAL WORKFLOW PRE-FILL ====================
const prefillApprovalWorkflowRequirements = (
  _modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  // Note: leads module data could be used to identify approval needs in future
  // const leads = _modules?.leadsAndSales;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Common workflow types
  prefilled.workflow_types = ['quotes', 'discounts'];

  // Approval chain - default to conditional (based on amount)
  prefilled.approval_chain = 'conditional';

  // Escalation
  prefilled.escalation = true;

  // Notification method
  prefilled.notification_method = ['email', 'whatsapp'];

  return prefilled;
};

// ==================== MEETING SCHEDULER PRE-FILL ====================
const prefillMeetingSchedulerRequirements = (
  _modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  // Note: overview module data could be used to prefill meeting settings in future
  // const overview = _modules?.overview;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Meeting types - common defaults
  prefilled.meeting_types = ['פגישת היכרות (15 דקות)', 'פגישת מכירה (30 דקות)'];

  // Calendar system - default to Google
  prefilled.calendar_system = 'google';

  // Availability - standard business hours
  prefilled.availability = 'א\'-ה\' 9:00-17:00';

  // Buffer time
  prefilled.buffer_time = 15;

  // Confirmations
  prefilled.confirmations = ['email', 'whatsapp'];

  // Video integration
  prefilled.video_integration = 'zoom';

  return prefilled;
};

// ==================== MARKETING AUTOMATION PRE-FILL ====================
const prefillMarketingAutomationRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const leads = modules?.leadsAndSales;
  const overview = modules?.overview;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Platform - recommend based on size
  if (meeting.modules?.operations?.hr?.employeeCount) {
    const empRange = meeting.modules.operations.hr.employeeCount;
    if (empRange === '1-10') prefilled.platform_preference = 'mailchimp';
    else if (empRange === '11-50') prefilled.platform_preference = 'activecampaign';
    else prefilled.platform_preference = 'hubspot';
  }

  // List size - estimate from lead volume
  if (leads?.leadVolume?.monthly) {
    const monthly = leads.leadVolume.monthly;
    if (monthly < 50) prefilled.list_size = 'under_1000';
    else if (monthly < 200) prefilled.list_size = '1000-5000';
    else if (monthly < 500) prefilled.list_size = '5000-20000';
    else prefilled.list_size = 'over_20000';
  }

  // Campaign types
  prefilled.campaign_types = ['welcome', 'nurture', 'promotional'];

  // Segmentation
  prefilled.segmentation = ['behavior', 'lead_score'];

  // Integrations
  prefilled.crm_sync = true;
  prefilled.analytics_tracking = true;

  return prefilled;
};

// ==================== PROJECT MANAGEMENT PRE-FILL ====================
const prefillProjectManagementRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const overview = modules?.overview;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Team size
  if (overview?.employees) {
    const employeeRanges: Record<string, number> = {
      '1-10': 5,
      '11-50': 20,
      '51-200': 50,
      '200-500': 150,
      '500+': 300
    };
    prefilled.team_size = employeeRanges[meeting.modules?.operations?.hr?.employeeCount] || 10;
  }

  // Platform - based on size
  if (prefilled.team_size && prefilled.team_size < 15) {
    prefilled.platform = 'asana';
  } else if (prefilled.team_size && prefilled.team_size < 50) {
    prefilled.platform = 'monday';
  } else {
    prefilled.platform = 'clickup';
  }

  // Features
  prefilled.features = ['tasks', 'timeline', 'reporting'];

  // Automation needs
  prefilled.automation_needs = ['task_creation', 'notifications'];

  return prefilled;
};

// ==================== DATA CLEANUP PRE-FILL ====================
const prefillDataCleanupRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const systems = modules?.systems;
  const leads = modules?.leadsAndSales;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Data location - from current systems
  if (systems?.currentSystems && systems.currentSystems.length > 0) {
    prefilled.data_location = systems.currentSystems[0];
  }

  // Record count - estimate from lead volume
  if (leads?.leadVolume?.total) {
    const total = leads.leadVolume.total;
    if (total < 1000) prefilled.record_count = 'under_1000';
    else if (total < 10000) prefilled.record_count = '1000-10000';
    else if (total < 50000) prefilled.record_count = '10000-50000';
    else prefilled.record_count = 'over_50000';
  }

  // Issues - common ones
  prefilled.issues = ['duplicates', 'incomplete', 'formatting'];

  // Merge strategy
  prefilled.merge_strategy = 'auto';

  // Validation
  prefilled.validation = true;

  return prefilled;
};

// ==================== SUPPORT & TRAINING PRE-FILL ====================
const prefillSupportTrainingRequirements = (
  modules: Meeting['modules']
): Partial<CollectedRequirements['data']> => {
  const overview = modules?.overview;
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Support hours - default to business hours
  prefilled.support_hours = 'business';

  // Response time - default to same day
  prefilled.response_time = 'same_day';

  // Support channels
  prefilled.support_channels = ['email', 'whatsapp'];

  // Training topics
  prefilled.training_topics = ['system_basics', 'automation_building'];

  // Participants - estimate from employees
  if (overview?.employees) {
    const employeeRanges: Record<string, number> = {
      '1-10': 3,
      '11-50': 8,
      '51-200': 15,
      '200-500': 30,
      '500+': 50
    };
    prefilled.participants = employeeRanges[meeting.modules?.operations?.hr?.employeeCount] || 5;
  }

  // Format - default to remote
  prefilled.format = 'remote';

  return prefilled;
};

// ==================== GENERIC PRE-FILL ====================
const prefillGenericRequirements = (
  modules: Meeting['modules'],
  _serviceId: string
): Partial<CollectedRequirements['data']> => {
  // For services we haven't specifically mapped yet,
  // extract whatever relevant info we can
  const prefilled: Partial<CollectedRequirements['data']> = {};

  // Always include basic business info
  prefilled.business_type = modules?.overview?.businessType;
  prefilled.employees_count = meeting.modules?.operations?.hr?.employeeCount;

  return prefilled;
};

// Helper function to check if a field should be shown as "already provided"
export const isFieldPrefilled = (
  fieldId: string,
  prefilledData: Partial<CollectedRequirements['data']>
): boolean => {
  return prefilledData && prefilledData[fieldId] !== undefined && prefilledData[fieldId] !== null;
};

// Helper to get the display text for prefilled data
export const getPrefilledDisplayText = (
  fieldId: string,
  prefilledData: Partial<CollectedRequirements['data']>
): string => {
  const value = prefilledData[fieldId];

  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (typeof value[0] === 'string') {
      return value.join(', ');
    }
    if (typeof value[0] === 'object') {
      return `${value.length} items`;
    }
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return String(value);
};
