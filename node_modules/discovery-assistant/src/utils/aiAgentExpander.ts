/**
 * aiAgentExpander.ts
 *
 * Expands basic AI agent use cases from Phase 1 into detailed Phase 2 specifications.
 * Maps AICapability use cases to DetailedAIAgentSpec with knowledge base, conversation flow, etc.
 */

import { Meeting } from '../types';
import {
  DetailedAIAgentSpec,
  KnowledgeBase,
  KnowledgeSource,
  DetailedConversationFlow,
  AIAgentIntegrations,
  AIAgentTraining,
  AIModelSelection
} from '../types/phase2';

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Expands AI agents from Phase 1 into detailed Phase 2 specifications
 */
export const expandAIAgents = (meeting: Meeting): DetailedAIAgentSpec[] => {
  const aiModule = meeting.modules?.aiAgents;
  const detailedAgents: DetailedAIAgentSpec[] = [];

  if (!aiModule) {
    return detailedAgents;
  }

  // Expand sales agents
  if (aiModule.sales?.useCases && aiModule.sales.useCases.length > 0) {
    aiModule.sales.useCases.forEach(useCase => {
      detailedAgents.push(
        createDetailedSpec(useCase, 'sales', aiModule.sales!, meeting)
      );
    });
  }

  // Expand service agents
  if (aiModule.service?.useCases && aiModule.service.useCases.length > 0) {
    aiModule.service.useCases.forEach(useCase => {
      detailedAgents.push(
        createDetailedSpec(useCase, 'service', aiModule.service!, meeting)
      );
    });
  }

  // Expand operations agents
  if (aiModule.operations?.useCases && aiModule.operations.useCases.length > 0) {
    aiModule.operations.useCases.forEach(useCase => {
      detailedAgents.push(
        createDetailedSpec(useCase, 'operations', aiModule.operations!, meeting)
      );
    });
  }

  return detailedAgents;
};

/**
 * Create detailed specification from a use case
 */
const createDetailedSpec = (
  useCase: string,
  department: 'sales' | 'service' | 'operations',
  capability: any,
  meeting: Meeting
): DetailedAIAgentSpec => {
  return {
    id: generateId(),
    agentId: generateId(),
    name: useCase,
    department,

    // Suggest knowledge base sources from Phase 1
    knowledgeBase: suggestKnowledgeSources(department, meeting),

    // Create basic conversation flow
    conversationFlow: createBasicConversationFlow(useCase, department),

    // Suggest integrations based on Phase 1 systems
    integrations: suggestIntegrations(department, meeting),

    // Pre-fill training from Phase 1 data
    training: prefillTraining(department, meeting),

    // Suggest model based on use case complexity and readiness
    model: suggestModel(useCase, capability)
  };
};

/**
 * Suggest knowledge base sources based on department and Phase 1 data
 */
const suggestKnowledgeSources = (
  department: string,
  meeting: Meeting
): KnowledgeBase => {
  const sources: KnowledgeSource[] = [];

  // Check if they have a website
  const overview = meeting.modules?.overview;
  if (overview?.leadCaptureChannels?.includes('website') || overview?.website) {
    sources.push({
      id: generateId(),
      type: 'website',
      name: 'אתר החברה',
      location: overview.website || '',
      accessMethod: 'web scraping',
      requiresAuth: false,
      documentCount: 0,
      syncEnabled: true,
      includeInTraining: true
    });
  }

  // Check for FAQs in customer service module
  const customerService = meeting.modules?.customerService;
  if (department === 'service' && customerService?.autoResponse?.topQuestions) {
    const topQuestions = customerService.autoResponse.topQuestions;
    if (topQuestions.length > 0) {
      sources.push({
        id: generateId(),
        type: 'csv',
        name: 'שאלות ותשובות נפוצות',
        location: 'Phase 1 Customer Service FAQs',
        accessMethod: 'direct',
        requiresAuth: false,
        documentCount: topQuestions.length,
        syncEnabled: false,
        includeInTraining: true
      });
    }
  }

  // Check for CRM system
  const systems = meeting.modules?.systems?.detailedSystems || [];
  const crmSystem = systems.find(s => s.category === 'crm');
  if (crmSystem && (department === 'sales' || department === 'service')) {
    sources.push({
      id: generateId(),
      type: 'crm_field',
      name: `${crmSystem.specificSystem} - מידע לקוחות`,
      location: crmSystem.specificSystem,
      accessMethod: 'api',
      requiresAuth: true,
      documentCount: crmSystem.recordCount || 0,
      syncEnabled: true,
      includeInTraining: true
    });
  }

  // Check for product information
  const leadsAndSales = meeting.modules?.leadsAndSales;
  if (department === 'sales' && leadsAndSales?.productServices) {
    sources.push({
      id: generateId(),
      type: 'csv',
      name: 'קטלוג מוצרים ושירותים',
      location: 'Phase 1 Products/Services Data',
      accessMethod: 'direct',
      requiresAuth: false,
      documentCount: 1,
      syncEnabled: false,
      includeInTraining: true
    });
  }

  return {
    sources,
    updateFrequency: 'manual',
    totalDocuments: sources.length,
    totalTokensEstimated: estimateTokens(sources),
    vectorDatabaseUsed: sources.length > 0,
    embeddingModel: 'text-embedding-ada-002'
  };
};

/**
 * Estimate total tokens for knowledge sources
 */
const estimateTokens = (sources: KnowledgeSource[]): number => {
  let total = 0;

  sources.forEach(source => {
    switch (source.type) {
      case 'website':
        total += 50000; // Estimate ~50k tokens per website
        break;
      case 'crm_field':
        total += source.documentCount * 500; // Estimate ~500 tokens per record
        break;
      case 'csv':
      case 'json':
        total += source.documentCount * 200; // Estimate ~200 tokens per CSV row
        break;
      case 'pdf':
        total += source.documentCount * 2000; // Estimate ~2k tokens per PDF page
        break;
      default:
        total += source.documentCount * 1000;
    }
  });

  return total;
};

/**
 * Create basic conversation flow template
 */
const createBasicConversationFlow = (
  useCase: string,
  department: string
): DetailedConversationFlow => {
  // Map department to greeting
  const departmentGreetings = {
    sales: 'שלום! אני כאן לעזור לך עם שאלות אודות המוצרים והשירותים שלנו. במה אוכל לסייע?',
    service: 'שלום! אני סוכן שירות אוטומטי. אשמח לעזור לך. מה הבעיה או השאלה שלך?',
    operations: 'שלום! אני כאן לסייע בתהליכים תפעוליים. במה אוכל לעזור?'
  };

  return {
    greeting: departmentGreetings[department as keyof typeof departmentGreetings],
    intents: createBasicIntents(useCase, department),
    fallbackResponse: 'סליחה, לא הבנתי את שאלתך. האם תוכל לנסח אותה אחרת? או לחילופין, אוכל להעבירך לנציג אנושי.',
    escalationTriggers: [
      'המשתמש ביקש לדבר עם נציג אנושי',
      'לא הצלחתי לענות על 3 שאלות ברצף',
      'המשתמש כועס או משתמש במילים שליליות',
      'השאלה דורשת החלטה מורכבת או מידע לא זמין'
    ],
    maxTurns: 10,
    contextWindow: 5
  };
};

/**
 * Create basic intents for the use case
 */
const createBasicIntents = (_useCase: string, department: string): any[] => {
  const commonIntents = [];

  if (department === 'sales') {
    commonIntents.push(
      {
        name: 'בקשת מחיר',
        examples: ['כמה עולה?', 'מה המחיר?', 'תן לי הצעת מחיר'],
        response: 'אשמח לתת לך הצעת מחיר. אוכל לקבל עוד כמה פרטים על הצורך שלך?',
        requiresData: true
      },
      {
        name: 'מידע על מוצר',
        examples: ['ספר לי על המוצר', 'מה כולל?', 'תיאור המוצר'],
        response: '',
        requiresData: true
      }
    );
  } else if (department === 'service') {
    commonIntents.push(
      {
        name: 'דיווח על בעיה',
        examples: ['יש לי בעיה', 'המערכת לא עובדת', 'נתקלתי בתקלה'],
        response: 'מצטער לשמוע. בוא נבדוק ביחד מה קרה. תוכל לתאר את הבעיה בפירוט?',
        requiresData: true
      },
      {
        name: 'שאלה טכנית',
        examples: ['איך עושים...', 'מה התהליך ל...', 'הסבר לי איך'],
        response: '',
        requiresData: true
      }
    );
  } else if (department === 'operations') {
    commonIntents.push(
      {
        name: 'עדכון סטטוס',
        examples: ['מה הסטטוס?', 'איפה ההזמנה שלי?', 'מתי זה יגיע?'],
        response: '',
        requiresData: true
      },
      {
        name: 'בקשת שינוי',
        examples: ['אני רוצה לשנות', 'לעדכן את', 'לבטל את'],
        response: 'בוודאי. מה ברצונך לשנות?',
        requiresData: true
      }
    );
  }

  return commonIntents;
};

/**
 * Suggest integrations based on Phase 1 systems
 */
const suggestIntegrations = (
  department: string,
  meeting: Meeting
): AIAgentIntegrations => {
  const systems = meeting.modules?.systems?.detailedSystems || [];

  // Check for CRM
  const hasCRM = systems.some(s => s.category === 'crm');

  // Check for email system
  const hasEmail = systems.some(s =>
    s.specificSystem.toLowerCase().includes('gmail') ||
    s.specificSystem.toLowerCase().includes('outlook') ||
    s.specificSystem.toLowerCase().includes('office 365')
  );

  // Check for calendar system
  const hasCalendar = systems.some(s =>
    s.specificSystem.toLowerCase().includes('calendar') ||
    s.specificSystem.toLowerCase().includes('google calendar') ||
    s.specificSystem.toLowerCase().includes('outlook calendar')
  );

  return {
    crmEnabled: hasCRM,
    crmSystem: hasCRM ? systems.find(s => s.category === 'crm')?.specificSystem || '' : '',
    emailEnabled: hasEmail,
    emailProvider: hasEmail ? systems.find(s =>
      s.specificSystem.toLowerCase().includes('gmail') ||
      s.specificSystem.toLowerCase().includes('outlook')
    )?.specificSystem || '' : '',
    calendarEnabled: hasCalendar && department === 'sales',
    customWebhooks: []
  };
};

/**
 * Prefill training data from Phase 1
 */
const prefillTraining = (
  department: string,
  meeting: Meeting
): AIAgentTraining => {
  const customerService = meeting.modules?.customerService;
  const faqPairs: any[] = [];

  // Import FAQs from customer service module
  if (department === 'service' && customerService?.autoResponse?.topQuestions) {
    customerService.autoResponse.topQuestions.forEach((q) => {
      faqPairs.push({
        question: q,
        answer: '', // To be filled in Phase 2
        category: 'שירות לקוחות'
      });
    });
  }

  return {
    conversationExamples: [],
    faqPairs,
    prohibitedTopics: [],
    tone: 'professional',
    language: 'he'
  };
};

/**
 * Suggest AI model based on use case and capability
 */
const suggestModel = (
  useCase: string,
  capability: any
): AIModelSelection => {
  const isComplex = useCase.length > 50 || capability.potential === 'high';

  // For complex use cases or high potential, suggest GPT-4
  if (isComplex || capability.potential === 'high') {
    return {
      provider: 'OpenAI',
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      reasonForSelection: 'use case מורכב או פוטנציאל גבוה - דורש מודל מתקדם'
    };
  }

  // For simple use cases, GPT-3.5 is sufficient
  return {
    provider: 'OpenAI',
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1500,
    topP: 1.0,
    reasonForSelection: 'use case פשוט - מודל חסכוני מספיק'
  };
};

/**
 * Get AI agent expansion stats
 */
export const getAIAgentStats = (agents: DetailedAIAgentSpec[]) => {
  return {
    total: agents.length,
    sales: agents.filter(a => a.department === 'sales').length,
    service: agents.filter(a => a.department === 'service').length,
    operations: agents.filter(a => a.department === 'operations').length,
    totalKnowledgeSources: agents.reduce((acc, a) => acc + a.knowledgeBase.sources.length, 0),
    totalEstimatedTokens: agents.reduce((acc, a) => acc + a.knowledgeBase.totalTokensEstimated, 0),
    totalIntents: agents.reduce((acc, a) => acc + a.conversationFlow.intents.length, 0),
    crmIntegrationsCount: agents.filter(a => a.integrations.crmEnabled).length
  };
};

/**
 * Check if AI agent expansion is possible for a meeting
 */
export const hasAIAgentUseCases = (meeting: Meeting): boolean => {
  const aiModule = meeting.modules?.aiAgents;
  if (!aiModule) return false;

  const salesUseCases = aiModule.sales?.useCases?.length || 0;
  const serviceUseCases = aiModule.service?.useCases?.length || 0;
  const operationsUseCases = aiModule.operations?.useCases?.length || 0;

  return salesUseCases + serviceUseCases + operationsUseCases > 0;
};
