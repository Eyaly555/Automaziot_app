import { Meeting, DetailedSystemInfo, SystemIntegrationNeed } from '../types';
import { getSystemLabel, getSystemDetails } from '../config/systemsDatabase';

export interface TechnicalSpecification {
  metadata: {
    clientName: string;
    dateGenerated: string;
    meetingDate: string;
    generatedBy: string;
  };
  executiveSummary: {
    systemCount: number;
    integrationCount: number;
    criticalIssuesCount: number;
    overview: string;
  };
  systemInventory: SystemInventoryItem[];
  integrationMap: IntegrationMapItem[];
  automationOpportunities: AutomationOpportunity[];
  n8nWorkflows: N8NWorkflowTemplate[];
  technicalRequirements: TechnicalRequirement[];
  implementationPlan: ImplementationPhase[];
}

export interface SystemInventoryItem {
  id: string;
  category: string;
  systemName: string;
  version?: string;
  apiAccess: string;
  recordCount?: number;
  monthlyUsers?: number;
  satisfactionScore: number;
  painPoints: string[];
  criticalFeatures: string[];
  migrationPriority: 'high' | 'medium' | 'low' | 'none';
}

export interface IntegrationMapItem {
  from: string;
  to: string;
  type: string;
  frequency: string;
  status: string;
  criticality: string;
  notes?: string;
}

export interface AutomationOpportunity {
  title: string;
  description: string;
  affectedSystems: string[];
  estimatedTimeSavings: string;
  complexity: 'low' | 'medium' | 'high';
  priority: number;
  suggestedTools: string[];
}

export interface N8NWorkflowTemplate {
  name: string;
  description: string;
  trigger: string;
  nodes: Array<{
    type: string;
    action: string;
    system?: string;
  }>;
  estimatedComplexity: 'Simple' | 'Medium' | 'Complex';
  estimatedHours: number;
}

export interface TechnicalRequirement {
  system: string;
  requirements: {
    authentication: string[];
    permissions: string[];
    endpoints: string[];
    rateLimit?: string;
    documentation?: string;
  };
}

export interface ImplementationPhase {
  phase: number;
  name: string;
  duration: string;
  tasks: string[];
  dependencies: string[];
  deliverables: string[];
}

export const generateTechnicalSpec = (meeting: Meeting): TechnicalSpecification => {
  const systems = meeting.modules.systems?.detailedSystems || [];
  const allIntegrations = systems.flatMap(sys =>
    sys.integrationNeeds.map(int => ({ ...int, sourceSystem: sys.specificSystem }))
  );

  const criticalPainPoints = systems.reduce((acc, sys) => acc + sys.mainPainPoints.length, 0);

  return {
    metadata: {
      clientName: meeting.clientName,
      dateGenerated: new Date().toISOString(),
      meetingDate: new Date(meeting.date).toISOString(),
      generatedBy: 'Automaziot Discovery Assistant'
    },
    executiveSummary: generateExecutiveSummary(meeting, systems, allIntegrations.length, criticalPainPoints),
    systemInventory: generateSystemInventory(systems),
    integrationMap: generateIntegrationMap(systems),
    automationOpportunities: generateAutomationOpportunities(meeting, systems),
    n8nWorkflows: generateN8NWorkflows(systems, meeting),
    technicalRequirements: generateTechnicalRequirements(systems),
    implementationPlan: generateImplementationPlan(systems, allIntegrations)
  };
};

const generateExecutiveSummary = (
  meeting: Meeting,
  systems: DetailedSystemInfo[],
  integrationCount: number,
  criticalIssuesCount: number
) => {
  const overview = `
הלקוח ${meeting.clientName} משתמש ב-${systems.length} מערכות מרכזיות עם ${integrationCount} אינטגרציות נדרשות.
זוהו ${criticalIssuesCount} נקודות כאב שניתנות לפתרון באמצעות אוטומציה.

**מערכות מרכזיות:**
${systems.map(s => `- ${s.specificSystem} (${s.category})`).join('\n')}

**סטטוס כללי:**
- רמת שביעות רצון ממוצעת: ${(systems.reduce((acc, s) => acc + s.satisfactionScore, 0) / systems.length).toFixed(1)}/5
- מערכות המצריכות שדרוג/החלפה: ${systems.filter(s => s.migrationWillingness === 'eager' || s.migrationWillingness === 'open').length}
- אינטגרציות קריטיות חסרות: ${systems.flatMap(s => s.integrationNeeds).filter(i => i.currentStatus === 'missing' && i.criticalityLevel === 'critical').length}
  `.trim();

  return {
    systemCount: systems.length,
    integrationCount,
    criticalIssuesCount,
    overview
  };
};

const generateSystemInventory = (systems: DetailedSystemInfo[]): SystemInventoryItem[] => {
  return systems.map(sys => ({
    id: sys.id,
    category: sys.category,
    systemName: sys.specificSystem,
    version: sys.version,
    apiAccess: sys.apiAccess,
    recordCount: sys.recordCount,
    monthlyUsers: sys.monthlyUsers,
    satisfactionScore: sys.satisfactionScore,
    painPoints: sys.mainPainPoints,
    criticalFeatures: sys.criticalFeatures,
    migrationPriority:
      sys.migrationWillingness === 'eager' ? 'high' :
      sys.migrationWillingness === 'open' ? 'medium' :
      sys.migrationWillingness === 'reluctant' ? 'low' : 'none'
  }));
};

const generateIntegrationMap = (systems: DetailedSystemInfo[]): IntegrationMapItem[] => {
  const integrations: IntegrationMapItem[] = [];

  systems.forEach(sys => {
    sys.integrationNeeds.forEach(int => {
      integrations.push({
        from: sys.specificSystem,
        to: int.targetSystemName,
        type: int.integrationType,
        frequency: int.frequency,
        status: int.currentStatus,
        criticality: int.criticalityLevel,
        notes: int.specificNeeds
      });
    });
  });

  return integrations;
};

const generateAutomationOpportunities = (
  meeting: Meeting,
  systems: DetailedSystemInfo[]
): AutomationOpportunity[] => {
  const opportunities: AutomationOpportunity[] = [];

  // Opportunity 1: Integration gaps
  const missingIntegrations = systems.flatMap(sys =>
    sys.integrationNeeds.filter(int => int.currentStatus === 'missing')
  );

  if (missingIntegrations.length > 0) {
    opportunities.push({
      title: 'אוטומציית אינטגרציות חסרות',
      description: `יש ${missingIntegrations.length} אינטגרציות חסרות בין מערכות שניתנות לאוטומציה`,
      affectedSystems: [...new Set(missingIntegrations.map(int => int.targetSystemName))],
      estimatedTimeSavings: '10-20 שעות/שבוע',
      complexity: missingIntegrations.length > 5 ? 'high' : 'medium',
      priority: 1,
      suggestedTools: ['n8n', 'Zapier', 'Make']
    });
  }

  // Opportunity 2: Manual data transfer
  if (meeting.modules.systems?.integrations?.manualDataTransfer &&
      meeting.modules.systems.integrations.manualDataTransfer !== 'none') {
    opportunities.push({
      title: 'אוטומציית העברת נתונים ידנית',
      description: 'צמצום זמן העברת נתונים ידנית באמצעות סנכרונים אוטומטיים',
      affectedSystems: systems.map(s => s.specificSystem),
      estimatedTimeSavings: '5-15 שעות/שבוע',
      complexity: 'medium',
      priority: 2,
      suggestedTools: ['n8n', 'API Integration']
    });
  }

  // Opportunity 3: Systems with low satisfaction
  const lowSatisfactionSystems = systems.filter(s => s.satisfactionScore <= 2);
  if (lowSatisfactionSystems.length > 0) {
    opportunities.push({
      title: 'שיפור/החלפת מערכות בעייתיות',
      description: `${lowSatisfactionSystems.length} מערכות עם שביעות רצון נמוכה`,
      affectedSystems: lowSatisfactionSystems.map(s => s.specificSystem),
      estimatedTimeSavings: 'תלוי במערכת',
      complexity: 'high',
      priority: 3,
      suggestedTools: ['Migration Tools', 'Custom Development']
    });
  }

  // Opportunity 4: CRM automation
  const crmSystem = systems.find(s => s.category === 'crm');
  if (crmSystem && crmSystem.mainPainPoints.length > 0) {
    opportunities.push({
      title: 'אוטומציית תהליכי CRM',
      description: `שיפור תהליכים במערכת ${crmSystem.specificSystem}`,
      affectedSystems: [crmSystem.specificSystem],
      estimatedTimeSavings: '8-12 שעות/שבוע',
      complexity: 'medium',
      priority: 2,
      suggestedTools: ['n8n', 'Native CRM Automation', 'AI Agents']
    });
  }

  return opportunities.sort((a, b) => a.priority - b.priority);
};

const generateN8NWorkflows = (
  systems: DetailedSystemInfo[],
  meeting: Meeting
): N8NWorkflowTemplate[] => {
  const workflows: N8NWorkflowTemplate[] = [];

  // Workflow 1: CRM to WhatsApp notification
  const crmSystem = systems.find(s => s.category === 'crm');
  if (crmSystem) {
    workflows.push({
      name: 'התראת WhatsApp על ליד חדש',
      description: `כאשר נוסף ליד חדש ב-${crmSystem.specificSystem}, שלח התראת WhatsApp למנהל המכירות`,
      trigger: `Webhook from ${crmSystem.specificSystem}`,
      nodes: [
        { type: 'Webhook', action: 'Listen for new lead' },
        { type: crmSystem.specificSystem, action: 'Get lead details', system: crmSystem.specificSystem },
        { type: 'Function', action: 'Format message' },
        { type: 'WhatsApp Business', action: 'Send message' }
      ],
      estimatedComplexity: 'Simple',
      estimatedHours: 2
    });
  }

  // Workflow 2: Daily summary report
  if (systems.length > 0) {
    workflows.push({
      name: 'דוח יומי אוטומטי',
      description: 'איסוף נתונים מכל המערכות ושליחת דוח מסכם באימייל',
      trigger: 'Schedule - Daily at 8:00 AM',
      nodes: [
        { type: 'Schedule', action: 'Trigger daily' },
        ...systems.slice(0, 3).map(s => ({
          type: s.specificSystem,
          action: 'Fetch daily stats',
          system: s.specificSystem
        })),
        { type: 'Function', action: 'Aggregate and format data' },
        { type: 'Email', action: 'Send summary report' }
      ],
      estimatedComplexity: 'Medium',
      estimatedHours: 6
    });
  }

  // Workflow 3: Integration sync
  const criticalIntegrations = systems.flatMap(s =>
    s.integrationNeeds.filter(int => int.criticalityLevel === 'critical' && int.currentStatus === 'missing')
  );

  if (criticalIntegrations.length > 0) {
    const integration = criticalIntegrations[0];
    const sourceSystem = systems.find(s =>
      s.integrationNeeds.some(int => int.id === integration.id)
    );

    if (sourceSystem) {
      workflows.push({
        name: `סנכרון ${sourceSystem.specificSystem} → ${integration.targetSystemName}`,
        description: `סנכרון אוטומטי של נתונים בין המערכות`,
        trigger: integration.frequency === 'realtime' ? 'Webhook' : `Schedule - ${integration.frequency}`,
        nodes: [
          { type: 'Trigger', action: integration.frequency === 'realtime' ? 'Webhook' : 'Schedule' },
          { type: sourceSystem.specificSystem, action: 'Get data', system: sourceSystem.specificSystem },
          { type: 'Function', action: 'Transform data' },
          { type: integration.targetSystemName, action: 'Update records', system: integration.targetSystemName },
          { type: 'Function', action: 'Error handling & logging' }
        ],
        estimatedComplexity: 'Medium',
        estimatedHours: 8
      });
    }
  }

  return workflows;
};

const generateTechnicalRequirements = (systems: DetailedSystemInfo[]): TechnicalRequirement[] => {
  return systems.map(sys => {
    const systemDetails = getSystemDetails(sys.category, sys.specificSystem);

    return {
      system: sys.specificSystem,
      requirements: {
        authentication: getAuthRequirements(sys),
        permissions: getPermissionRequirements(sys),
        endpoints: getEndpointRequirements(sys),
        rateLimit: getRateLimit(sys),
        documentation: getDocumentationLink(sys)
      }
    };
  });
};

const getAuthRequirements = (sys: DetailedSystemInfo): string[] => {
  const reqs = [];

  if (sys.apiAccess === 'full' || sys.apiAccess === 'limited') {
    reqs.push('OAuth 2.0 או API Key');
    reqs.push('Refresh Token (למערכות OAuth)');
  }

  if (sys.category === 'crm' || sys.category === 'erp') {
    reqs.push('Admin או API User credentials');
  }

  return reqs.length > 0 ? reqs : ['יש לבדוק דרישות Authentication במסמכי המערכת'];
};

const getPermissionRequirements = (sys: DetailedSystemInfo): string[] => {
  const perms = [`Read access ל-${sys.category}`];

  if (sys.integrationNeeds.some(int => int.dataFlow.includes('from'))) {
    perms.push(`Write access ל-${sys.specificSystem}`);
  }

  perms.push('Webhook creation permissions (אם נדרש)');

  return perms;
};

const getEndpointRequirements = (sys: DetailedSystemInfo): string[] => {
  return [
    `GET /${sys.category}/list`,
    `GET /${sys.category}/{id}`,
    `POST /${sys.category}`,
    `PUT /${sys.category}/{id}`,
    'Webhooks endpoint (אם נתמך)'
  ];
};

const getRateLimit = (sys: DetailedSystemInfo): string => {
  // Common rate limits by system type
  if (sys.specificSystem.includes('Salesforce')) return '15,000 API calls/day (Enterprise)';
  if (sys.specificSystem.includes('HubSpot')) return '100 requests/10 seconds';
  if (sys.specificSystem.includes('Zoho')) return '5,000 API calls/day (Standard)';

  return 'יש לבדוק במסמכי ה-API';
};

const getDocumentationLink = (sys: DetailedSystemInfo): string => {
  const links: Record<string, string> = {
    'salesforce': 'https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/',
    'hubspot': 'https://developers.hubspot.com/docs/api/overview',
    'zoho_crm': 'https://www.zoho.com/crm/developer/docs/api/v2/',
    'pipedrive': 'https://developers.pipedrive.com/docs/api/v1',
    'shopify': 'https://shopify.dev/docs/api',
    'monday_crm': 'https://developer.monday.com/api-reference/docs'
  };

  return links[sys.specificSystem.toLowerCase().replace(' ', '_')] ||
         `חפש: "${sys.specificSystem} API documentation"`;
};

const generateImplementationPlan = (
  systems: DetailedSystemInfo[],
  integrations: any[]
): ImplementationPhase[] => {
  const phases: ImplementationPhase[] = [];

  // Phase 1: Foundation
  phases.push({
    phase: 1,
    name: 'הקמת תשתית ואימות גישות',
    duration: '1-2 שבועות',
    tasks: [
      'הקמת סביבת פיתוח n8n',
      'קבלת credentials לכל המערכות',
      'אימות גישה ל-API של כל מערכת',
      'הקמת webhooks (במידת הצורך)',
      'הגדרת error handling ו-logging'
    ],
    dependencies: [],
    deliverables: [
      'סביבת n8n מוכנה',
      'גישה מאומתת לכל המערכות',
      'מסמך טכני עם כל ה-credentials'
    ]
  });

  // Phase 2: Critical Integrations
  const criticalIntegrations = integrations.filter(int => int.criticalityLevel === 'critical');
  if (criticalIntegrations.length > 0) {
    phases.push({
      phase: 2,
      name: 'אינטגרציות קריטיות',
      duration: '2-3 שבועות',
      tasks: criticalIntegrations.slice(0, 3).map(int =>
        `בניית workflow: ${int.from} → ${int.to}`
      ).concat([
        'בדיקות end-to-end',
        'הוספת error handling',
        'תיעוד workflows'
      ]),
      dependencies: ['Phase 1'],
      deliverables: [
        `${Math.min(criticalIntegrations.length, 3)} workflows פעילים`,
        'בדיקות מוצלחות',
        'תיעוד טכני'
      ]
    });
  }

  // Phase 3: Automation Workflows
  phases.push({
    phase: 3,
    name: 'workflows אוטומציה',
    duration: '2-3 שבועות',
    tasks: [
      'בניית workflows להתראות ודוחות',
      'אוטומציית תהליכים ידניים',
      'אופטימיזציה של workflows קיימים',
      'הוספת monitoring ו-alerts'
    ],
    dependencies: [`Phase ${phases.length}`],
    deliverables: [
      'workflows אוטומציה פעילים',
      'מערכת monitoring',
      'מסמך הפעלה למשתמשים'
    ]
  });

  // Phase 4: Optimization
  phases.push({
    phase: 4,
    name: 'אופטימיזציה ושיפורים',
    duration: '1-2 שבועות',
    tasks: [
      'ניתוח ביצועים',
      'אופטימיזציית workflows',
      'הוספת features מבוקשים',
      'הדרכת משתמשים',
      'העברה לפרודקשן'
    ],
    dependencies: [`Phase ${phases.length}`],
    deliverables: [
      'מערכת מאופטמת בפרודקשן',
      'הדרכות למשתמשים',
      'מסמכי תחזוקה'
    ]
  });

  return phases;
};