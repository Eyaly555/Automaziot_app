/**
 * acceptanceCriteriaGenerator.ts
 *
 * Generates acceptance criteria automatically based on Phase 2 implementation spec.
 * Creates functional, performance, security, and usability requirements.
 */

import { Meeting } from '../types';
import {
  AcceptanceCriteria,
  FunctionalRequirement,
  PerformanceRequirement,
  SecurityRequirement,
  UsabilityRequirement,
  DetailedSystemSpec,
  IntegrationFlow,
  DetailedAIAgentSpec,
} from '../types/phase2';
import { getServiceById } from '../config/servicesDatabase';

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Generate acceptance criteria from implementation spec
 */
export const generateAcceptanceCriteria = (
  meeting: Meeting
): AcceptanceCriteria => {
  return {
    functional: generateFunctionalRequirements(meeting),
    performance: generatePerformanceRequirements(meeting),
    security: generateSecurityRequirements(meeting),
    usability: generateUsabilityRequirements(meeting),
  };
};

/**
 * Generate functional requirements from services and systems
 */
const generateFunctionalRequirements = (
  meeting: Meeting
): FunctionalRequirement[] => {
  const requirements: FunctionalRequirement[] = [];
  const services =
    meeting.modules?.proposal?.purchasedServices ||
    meeting.modules?.proposal?.selectedServices ||
    [];
  const systems = meeting.implementationSpec?.systems || [];
  const integrations = meeting.implementationSpec?.integrations || [];
  const aiAgents = meeting.implementationSpec?.aiAgents || [];

  // Generate requirements for each service
  services.forEach((serviceId: string) => {
    const service = getServiceById(serviceId);
    if (!service) return;

    const serviceRequirements = generateServiceRequirements(
      serviceId,
      service.nameHe
    );
    requirements.push(...serviceRequirements);
  });

  // Generate requirements for each system
  systems.forEach((system: DetailedSystemSpec) => {
    requirements.push({
      id: generateId(),
      category: `מערכת - ${system.systemName}`,
      description: `אימות והזדהות במערכת ${system.systemName}`,
      priority: 'must_have',
      testScenario: `ביצוע קריאת API ל-${system.systemName} עם הזדהות`,
      acceptanceCriteria: `קריאת API מצליחה וחוזרת עם status 200`,
      status: 'pending',
    });

    if (system.dataMigration.required && system.dataMigration.recordCount > 0) {
      requirements.push({
        id: generateId(),
        category: `מערכת - ${system.systemName}`,
        description: `העברת ${system.dataMigration.recordCount.toLocaleString('he-IL')} רשומות מ-${system.systemName}`,
        priority: 'must_have',
        testScenario: `ביצוע העברת נתונים ניסיונית ל-100 רשומות ראשונות`,
        acceptanceCriteria: `100% מהרשומות מועברות ללא שגיאות, כל השדות תקינים`,
        status: 'pending',
      });
    }
  });

  // Generate requirements for each integration
  integrations.forEach((integration: IntegrationFlow) => {
    requirements.push({
      id: generateId(),
      category: 'אינטגרציה',
      description: integration.name || `סנכרון בין מערכות`,
      priority: integration.priority,
      testScenario: `יצירת רשומה במערכת מקור ובדיקת העברה למערכת יעד`,
      acceptanceCriteria: getIntegrationAcceptanceCriteria(
        integration.frequency
      ),
      status: 'pending',
    });

    if (integration.direction === 'bidirectional') {
      requirements.push({
        id: generateId(),
        category: 'אינטגרציה',
        description: `${integration.name || 'סנכרון'} - כיוון הפוך`,
        priority: integration.priority,
        testScenario: `עדכון רשומה במערכת יעד ובדיקת סנכרון חזרה למערכת מקור`,
        acceptanceCriteria: getIntegrationAcceptanceCriteria(
          integration.frequency
        ),
        status: 'pending',
      });
    }
  });

  // Generate requirements for AI agents
  aiAgents.forEach((agent: DetailedAIAgentSpec) => {
    requirements.push({
      id: generateId(),
      category: `AI - ${agent.department}`,
      description: `${agent.name} - תגובה נכונה`,
      priority: 'must_have',
      testScenario: `שליחת שאלה טיפוסית לסוכן וקבלת תגובה`,
      acceptanceCriteria: `הסוכן עונה תוך 5 שניות עם תשובה רלוונטית`,
      status: 'pending',
    });

    if (agent.integrations.crmEnabled) {
      requirements.push({
        id: generateId(),
        category: `AI - ${agent.department}`,
        description: `${agent.name} - אינטגרציה עם CRM`,
        priority: 'should_have',
        testScenario: `בדיקת יצירת ליד חדש ב-CRM דרך השיחה עם הסוכן`,
        acceptanceCriteria: `ליד נוצר ב-CRM עם כל הפרטים שנאספו בשיחה`,
        status: 'pending',
      });
    }
  });

  return requirements;
};

/**
 * Generate service-specific functional requirements
 */
const generateServiceRequirements = (
  serviceId: string,
  serviceName: string
): FunctionalRequirement[] => {
  const requirements: FunctionalRequirement[] = [];

  // CRM Implementation
  if (serviceId === 'impl-crm') {
    requirements.push(
      {
        id: generateId(),
        category: 'CRM',
        description: 'יצירת לידים מטפסים אוטומטית',
        priority: 'must_have',
        testScenario: 'מילוי טופס באתר ובדיקת יצירת הליד ב-CRM',
        acceptanceCriteria: 'ליד נוצר תוך 60 שניות עם כל השדות הנדרשים',
        status: 'pending',
      },
      {
        id: generateId(),
        category: 'CRM',
        description: 'הקצאה אוטומטית של לידים לנציגים',
        priority: 'must_have',
        testScenario: 'יצירת 10 לידים ובדיקת ההקצאה',
        acceptanceCriteria:
          'כל ליד מוקצה לנציג על בסיס round-robin או טריטוריה',
        status: 'pending',
      }
    );
  }

  // Automations
  if (serviceId.startsWith('auto-')) {
    requirements.push({
      id: generateId(),
      category: 'אוטומציה',
      description: `${serviceName} - הפעלה אוטומטית`,
      priority: 'must_have',
      testScenario: 'הפעלת trigger ובדיקת ביצוע האוטומציה',
      acceptanceCriteria: 'האוטומציה רצה בהצלחה תוך הזמן המוגדר',
      status: 'pending',
    });
  }

  // AI Agents
  if (serviceId.includes('ai-') || serviceId.includes('chatbot')) {
    requirements.push({
      id: generateId(),
      category: 'AI',
      description: `${serviceName} - דיוק תשובות`,
      priority: 'must_have',
      testScenario: 'בדיקת 50 שאלות טיפוסיות',
      acceptanceCriteria: 'לפחות 85% תשובות נכונות ורלוונטיות',
      status: 'pending',
    });
  }

  return requirements;
};

/**
 * Get acceptance criteria text for integration based on frequency
 */
const getIntegrationAcceptanceCriteria = (frequency: string): string => {
  switch (frequency) {
    case 'realtime':
      return 'הנתונים מסתנכרנים תוך 2 דקות מהשינוי';
    case 'hourly':
      return 'הנתונים מסתנכרנים פעם בשעה על פי לוח הזמנים';
    case 'daily':
      return 'הנתונים מסתנכרנים פעם ביום על פי לוח הזמנים';
    case 'weekly':
      return 'הנתונים מסתנכרנים פעם בשבוע על פי לוח הזמנים';
    default:
      return 'הסנכרון מתבצע בהצלחה';
  }
};

/**
 * Generate performance requirements
 */
const generatePerformanceRequirements = (
  meeting: Meeting
): PerformanceRequirement[] => {
  const requirements: PerformanceRequirement[] = [];
  const systems = meeting.implementationSpec?.systems || [];
  const integrations = meeting.implementationSpec?.integrations || [];
  const aiAgents = meeting.implementationSpec?.aiAgents || [];

  // API response times for systems
  systems.forEach((system: DetailedSystemSpec) => {
    requirements.push({
      id: generateId(),
      metric: `${system.systemName} - זמן תגובת API`,
      target: '< 500ms',
      testMethod: 'בדיקה עם 100 בקשות רצופות',
      status: 'pending',
    });
  });

  // Integration sync times
  integrations.forEach((integration: IntegrationFlow) => {
    if (integration.frequency === 'realtime') {
      requirements.push({
        id: generateId(),
        metric: `${integration.name || 'אינטגרציה'} - זמן סנכרון`,
        target: '< 2 minutes',
        testMethod: 'מדידת זמן מיצירת רשומה עד הופעתה במערכת היעד',
        status: 'pending',
      });
    }
  });

  // AI agent response times
  aiAgents.forEach((agent: DetailedAIAgentSpec) => {
    requirements.push({
      id: generateId(),
      metric: `${agent.name} - זמן תגובה`,
      target: '< 5 seconds',
      testMethod: 'שליחת 50 שאלות ומדידת זמן תגובה ממוצע',
      status: 'pending',
    });
  });

  // General system performance
  requirements.push({
    id: generateId(),
    metric: 'זמן טעינת דשבורד ראשי',
    target: '< 2 seconds',
    testMethod: 'טעינת הדשבורד עם 50 רשומות',
    status: 'pending',
  });

  return requirements;
};

/**
 * Generate security requirements
 */
const generateSecurityRequirements = (
  meeting: Meeting
): SecurityRequirement[] => {
  const requirements: SecurityRequirement[] = [];
  const systems = meeting.implementationSpec?.systems || [];

  // Authentication for each system
  systems.forEach((system: DetailedSystemSpec) => {
    requirements.push({
      id: generateId(),
      requirement: `אבטחת גישה ל-${system.systemName}`,
      category: 'authentication',
      implementation: `${system.authentication.method} עם הצפנת פרטי גישה`,
      verified: false,
    });

    if (system.dataMigration.required) {
      requirements.push({
        id: generateId(),
        requirement: `הצפנת נתונים בהעברה מ-${system.systemName}`,
        category: 'data_encryption',
        implementation: 'שימוש ב-HTTPS/TLS 1.3 להעברת נתונים',
        verified: false,
      });
    }
  });

  // API security
  requirements.push({
    id: generateId(),
    requirement: 'הגנת API endpoints',
    category: 'authentication',
    implementation: 'אימות API keys + rate limiting',
    verified: false,
  });

  // Data backup
  requirements.push({
    id: generateId(),
    requirement: 'גיבוי נתונים יומי',
    category: 'compliance',
    implementation: 'גיבוי אוטומטי לשרת מרוחק עם שמירת 30 ימים אחורה',
    verified: false,
  });

  // Audit log
  requirements.push({
    id: generateId(),
    requirement: 'לוג שינויים ופעולות',
    category: 'audit',
    implementation: 'רישום כל פעולה עם timestamp, משתמש, ופעולה',
    verified: false,
  });

  return requirements;
};

/**
 * Generate usability requirements
 */
const generateUsabilityRequirements = (
  meeting: Meeting
): UsabilityRequirement[] => {
  const requirements: UsabilityRequirement[] = [];
  const aiAgents = meeting.implementationSpec?.aiAgents || [];

  // General usability
  requirements.push(
    {
      id: generateId(),
      requirement: 'ממשק משתמש אינטואיטיבי',
      userRole: 'כל המשתמשים',
      successCriteria: 'משתמש חדש מסוגל לבצע משימה בסיסית ללא הדרכה תוך 5 דקות',
      tested: false,
    },
    {
      id: generateId(),
      requirement: 'תמיכה בעברית מלאה',
      userRole: 'כל המשתמשים',
      successCriteria: 'כל הטקסטים, ההודעות והשגיאות בעברית תקינה וקריאה',
      tested: false,
    },
    {
      id: generateId(),
      requirement: 'הודעות שגיאה ברורות',
      userRole: 'כל המשתמשים',
      successCriteria: 'הודעת שגיאה מסבירה מה קרה ואיך לתקן',
      tested: false,
    }
  );

  // AI agent usability
  aiAgents.forEach((agent: DetailedAIAgentSpec) => {
    requirements.push({
      id: generateId(),
      requirement: `${agent.name} - קלות שימוש`,
      userRole:
        agent.department === 'sales'
          ? 'נציג מכירות'
          : agent.department === 'service'
            ? 'נציג שירות'
            : 'מנהל',
      successCriteria: 'המשתמש מבין את תשובות הסוכן ומצליח להשלים משימה',
      tested: false,
    });
  });

  // Mobile responsiveness
  requirements.push({
    id: generateId(),
    requirement: 'תצוגה נכונה במובייל',
    userRole: 'כל המשתמשים',
    successCriteria: 'הממשק נראה ותפקודי במסכים 320px עד 1920px',
    tested: false,
  });

  return requirements;
};

/**
 * Get statistics about generated acceptance criteria
 */
export const getAcceptanceCriteriaStats = (criteria: AcceptanceCriteria) => {
  const total =
    criteria.functional.length +
    criteria.performance.length +
    criteria.security.length +
    criteria.usability.length;

  return {
    total,
    functional: criteria.functional.length,
    performance: criteria.performance.length,
    security: criteria.security.length,
    usability: criteria.usability.length,
    mustHave: criteria.functional.filter((r) => r.priority === 'must_have')
      .length,
    shouldHave: criteria.functional.filter((r) => r.priority === 'should_have')
      .length,
    niceToHave: criteria.functional.filter((r) => r.priority === 'nice_to_have')
      .length,
  };
};

/**
 * Filter acceptance criteria for a specific system
 */
export const getSystemCriteria = (
  criteria: AcceptanceCriteria,
  systemName: string
) => {
  return {
    functional: criteria.functional.filter((r) =>
      r.category.includes(systemName)
    ),
    performance: criteria.performance.filter((r) =>
      r.metric.includes(systemName)
    ),
    security: criteria.security.filter((r) =>
      r.requirement.includes(systemName)
    ),
    usability: criteria.usability.filter((r) =>
      r.requirement.includes(systemName)
    ),
  };
};

/**
 * Filter acceptance criteria for a specific integration
 */
export const getIntegrationCriteria = (
  criteria: AcceptanceCriteria,
  integrationName: string
) => {
  return {
    functional: criteria.functional.filter(
      (r) =>
        r.category === 'אינטגרציה' && r.description.includes(integrationName)
    ),
    performance: criteria.performance.filter(
      (r) =>
        r.metric.includes(integrationName) || r.metric.includes('אינטגרציה')
    ),
    security: criteria.security.filter(
      (r) =>
        r.requirement.includes('API') || r.requirement.includes('הצפנת נתונים')
    ),
    usability: [],
  };
};

/**
 * Filter acceptance criteria for a specific AI agent
 */
export const getAIAgentCriteria = (
  criteria: AcceptanceCriteria,
  agentName: string,
  department: string
) => {
  const departmentHe =
    department === 'sales'
      ? 'מכירות'
      : department === 'service'
        ? 'שירות'
        : 'תפעול';

  return {
    functional: criteria.functional.filter(
      (r) =>
        (r.category.includes('AI') && r.category.includes(departmentHe)) ||
        r.description.includes(agentName)
    ),
    performance: criteria.performance.filter(
      (r) =>
        r.metric.includes(agentName) ||
        (r.metric.includes('זמן תגובה') && r.metric.includes('AI'))
    ),
    security: criteria.security.filter(
      (r) => r.category === 'authentication' || r.category === 'data_encryption'
    ),
    usability: criteria.usability.filter(
      (r) => r.requirement.includes(agentName) || r.requirement.includes('סוכן')
    ),
  };
};
