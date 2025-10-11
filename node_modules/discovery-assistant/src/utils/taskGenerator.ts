/**
 * Task Auto-Generation Engine
 *
 * Generates development tasks from Phase 2 implementation specs
 */

import { Meeting, DevelopmentTask, DetailedSystemSpec, IntegrationFlow, DetailedAIAgentSpec, SystemModule, TestCase, SampleConversation, ImplementationSpecData } from '../types';
import { AutomationServiceEntry } from '../types/automationServices';
import { AIAgentServiceEntry } from '../types/aiAgentServices';
import { IntegrationServiceEntry } from '../types/integrationServices';
import { SystemImplementationServiceEntry } from '../types/systemImplementationServices';
import { AdditionalServiceEntry } from '../types/additionalServices';
import { 
  generateAutoLeadResponseInstructions, 
  generateAutoFormToCrmInstructions,
  formatInstructionsAsMarkdown
} from './requirementsToInstructions';

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Convert Phase 2 TestCase to Phase 3 TaskTestCase
 */
function convertToTaskTestCase(testCase: TestCase): import('../types/phase3').TaskTestCase {
  return {
    id: testCase.id,
    description: testCase.description || testCase.scenario || testCase.name || 'Test case',
    steps: testCase.steps || ['Execute test'],
    expectedResult: testCase.expectedResult?.toString() || 'Pass',
    passed: testCase.passed || false,
    testedBy: undefined,
    testedAt: undefined
  };
}

export function generateTasksFromPhase2(meeting: Meeting): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  if (!meeting.implementationSpec) {
    return tasks;
  }

  const spec = meeting.implementationSpec;

  // Generate tasks from systems
  spec.systems.forEach((system: DetailedSystemSpec) => {
    tasks.push(...generateSystemTasks(meeting.meetingId, system));
  });

  // Generate tasks from integrations
  spec.integrations.forEach((integration: IntegrationFlow) => {
    tasks.push(...generateIntegrationTasks(meeting.meetingId, integration));
  });

  // Generate tasks from AI agents
  spec.aiAgents.forEach((agent: DetailedAIAgentSpec) => {
    tasks.push(...generateAIAgentTasks(meeting.meetingId, agent));
  });

  // Generate tasks from purchased services with full meeting context
  tasks.push(...generateServiceTasks(meeting.meetingId, spec, meeting));

  // Generate testing tasks
  tasks.push(...generateTestingTasks(meeting.meetingId, spec));

  // Generate deployment tasks
  tasks.push(...generateDeploymentTasks(meeting.meetingId));

  // Assign dependencies
  assignTaskDependencies(tasks);

  // Assign to sprints
  assignToSprints(tasks);

  return tasks;
}

function generateSystemTasks(meetingId: string, system: DetailedSystemSpec): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  // 1. Authentication setup
  tasks.push({
    id: generateId(),
    meetingId,
    title: `Set up ${system.systemName} authentication`,
    description: `Implement ${system.authentication.method} authentication for ${system.systemName}.\n\nEndpoint: ${system.authentication.apiEndpoint}\nRate Limits: ${system.authentication.rateLimits}`,
    type: 'integration',
    relatedSpec: {
      type: 'system',
      specId: system.id,
      specName: system.systemName
    },
    status: 'todo',
    estimatedHours: 4,
    actualHours: 0,
    priority: 'high',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: [
      {
        id: generateId(),
        description: 'Test authentication with valid credentials',
        steps: ['Provide valid API credentials', 'Attempt authentication', 'Verify success response'],
        expectedResult: 'Authentication successful with valid token',
        passed: false
      }
    ],
    testStatus: 'not_started',
    technicalNotes: system.technicalNotes || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  // 2. Module integration tasks
  system.modules.forEach((module: SystemModule) => {
    tasks.push({
      id: generateId(),
      meetingId,
      title: `Integrate ${system.systemName} ${module.name} module`,
      description: `Set up data sync for ${module.name} module.\n\nRecords: ${module.recordCount}\nFields: ${module.fields.length + module.customFields.length}`,
      type: 'integration',
      relatedSpec: {
        type: 'system',
        specId: system.id,
        specName: `${system.systemName} - ${module.name}`
      },
      status: 'todo',
      estimatedHours: 8,
      actualHours: 0,
      priority: 'medium',
      dependencies: [],
      blocksOtherTasks: [],
      testingRequired: true,
      testCases: [],
      testStatus: 'not_started',
      technicalNotes: `Module requires mapping: ${module.requiresMapping}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    });

    // Field mapping task if required
    if (module.requiresMapping && module.fields.length > 0) {
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Map fields for ${system.systemName} ${module.name}`,
        description: `Create field mapping for ${module.fields.length} fields in ${module.name} module`,
        type: 'integration',
        relatedSpec: {
          type: 'system',
          specId: system.id,
          specName: `${system.systemName} - ${module.name} Mapping`
        },
        status: 'todo',
        estimatedHours: 3,
        actualHours: 0,
        priority: 'medium',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: [],
        testStatus: 'not_started',
        technicalNotes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
    }
  });

  // 3. Data migration task
  if (system.dataMigration.required) {
    tasks.push({
      id: generateId(),
      meetingId,
      title: `Migrate data for ${system.systemName}`,
      description: `Migrate ${system.dataMigration.recordCount} records using ${system.dataMigration.migrationMethod}.\n\nHistorical data: ${system.dataMigration.historicalDataYears} years\nCleanup needed: ${system.dataMigration.cleanupNeeded}`,
      type: 'migration',
      relatedSpec: {
        type: 'system',
        specId: system.id,
        specName: `${system.systemName} Migration`
      },
      status: 'todo',
      estimatedHours: 16,
      actualHours: 0,
      priority: 'high',
      dependencies: [],
      blocksOtherTasks: [],
      testingRequired: true,
      testCases: [],
      testStatus: 'not_started',
      technicalNotes: `Rollback plan: ${system.dataMigration.rollbackPlan}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    });
  }

  return tasks;
}

function generateIntegrationTasks(meetingId: string, integration: IntegrationFlow): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  // 1. Create n8n workflow
  tasks.push({
    id: generateId(),
    meetingId,
    title: `Create n8n workflow: ${integration.name}`,
    description: `Build n8n workflow for ${integration.sourceSystem} → ${integration.targetSystem}\n\nTrigger: ${integration.trigger.type}\nFrequency: ${integration.frequency}\nSteps: ${integration.steps.length}`,
    type: 'workflow',
    relatedSpec: {
      type: 'integration_flow',
      specId: integration.id,
      specName: integration.name
    },
    status: 'todo',
    estimatedHours: 10,
    actualHours: 0,
    priority: integration.priority === 'critical' ? 'critical' : integration.priority as any,
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: integration.testCases.map((tc: TestCase) => ({
      id: generateId(),
      description: tc.name || tc.scenario || tc.description || 'Test case',
      steps: [tc.description || tc.scenario || tc.name || 'Execute test'],
      expectedResult: JSON.stringify(tc.expectedOutput || {}),
      passed: false
    })),
    testStatus: 'not_started',
    technicalNotes: integration.description,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  // 2. Error handling implementation
  tasks.push({
    id: generateId(),
    meetingId,
    title: `Implement error handling for ${integration.name}`,
    description: `Set up error handling: ${integration.errorHandling.onError}\n\nRetry: ${integration.errorHandling.retryAttempts} attempts\nAlert recipients: ${integration.errorHandling.alertRecipients?.join(', ')}`,
    type: 'workflow',
    relatedSpec: {
      type: 'integration_flow',
      specId: integration.id,
      specName: `${integration.name} - Error Handling`
    },
    status: 'todo',
    estimatedHours: 4,
    actualHours: 0,
    priority: 'medium',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: [],
    testStatus: 'not_started',
    technicalNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  return tasks;
}

function generateAIAgentTasks(meetingId: string, agent: DetailedAIAgentSpec): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  // 1. Knowledge base setup
  tasks.push({
    id: generateId(),
    meetingId,
    title: `Set up knowledge base for ${agent.name}`,
    description: `Configure ${agent.knowledgeBase.sources.length} knowledge sources\n\nSources: ${agent.knowledgeBase.sources.map(s => s.name).join(', ')}\nUpdate frequency: ${agent.knowledgeBase.updateFrequency}`,
    type: 'ai_agent',
    relatedSpec: {
      type: 'ai_agent',
      specId: agent.id,
      specName: `${agent.name} - Knowledge Base`
    },
    status: 'todo',
    estimatedHours: 8,
    actualHours: 0,
    priority: 'high',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: [],
    testStatus: 'not_started',
    technicalNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  // 2. Conversation flow implementation
  tasks.push({
    id: generateId(),
    meetingId,
    title: `Implement conversation flow for ${agent.name}`,
    description: `Build conversation logic with ${agent.conversationFlow.steps?.length ?? 0} steps\n\nMax length: ${agent.conversationFlow.maxConversationLength ?? agent.conversationFlow.maxTurns ?? 10} exchanges\nFallback: ${agent.conversationFlow.defaultFallback ?? agent.conversationFlow.fallbackResponse ?? 'Default fallback'}`,
    type: 'ai_agent',
    relatedSpec: {
      type: 'ai_agent',
      specId: agent.id,
      specName: `${agent.name} - Conversation Flow`
    },
    status: 'todo',
    estimatedHours: 12,
    actualHours: 0,
    priority: 'high',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: [],
    testStatus: 'not_started',
    technicalNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  // 3. Integration setup
  if (agent.integrations.crm?.enabled) {
    tasks.push({
      id: generateId(),
      meetingId,
      title: `Integrate ${agent.name} with CRM`,
      description: `Connect AI agent to CRM\n\nFields to read: ${agent.integrations.crm.fieldsToRead.length}\nFields to update: ${agent.integrations.crm.fieldsToUpdate.length}`,
      type: 'ai_agent',
      relatedSpec: {
        type: 'ai_agent',
        specId: agent.id,
        specName: `${agent.name} - CRM Integration`
      },
      status: 'todo',
      estimatedHours: 6,
      actualHours: 0,
      priority: 'medium',
      dependencies: [],
      blocksOtherTasks: [],
      testingRequired: true,
      testCases: [],
      testStatus: 'not_started',
      technicalNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    });
  }

  // 4. Training and testing
  tasks.push({
    id: generateId(),
    meetingId,
    title: `Train and test ${agent.name}`,
    description: `Train AI agent with ${agent.training.sampleConversations?.length ?? agent.training.conversationExamples?.length ?? 0} sample conversations\n\nEdge cases: ${agent.training.edgeCases?.length ?? 0}\nProhibited topics: ${agent.training.prohibitedTopics?.length ?? 0}`,
    type: 'testing',
    relatedSpec: {
      type: 'ai_agent',
      specId: agent.id,
      specName: `${agent.name} - Training`
    },
    status: 'todo',
    estimatedHours: 8,
    actualHours: 0,
    priority: 'high',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: (agent.training.sampleConversations ?? agent.training.conversationExamples ?? []).map((convo: SampleConversation) => ({
      id: generateId(),
      description: convo.scenario,
      steps: convo.userMessages,
      expectedResult: convo.agentResponses.join('\n'),
      passed: false
    })),
    testStatus: 'not_started',
    technicalNotes: `Tone: ${agent.training.toneAndStyle}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  return tasks;
}

function generateTestingTasks(meetingId: string, _spec: ImplementationSpecData): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  // Integration testing
  tasks.push({
    id: generateId(),
    meetingId,
    title: 'End-to-end integration testing',
    description: 'Test all integrations working together',
    type: 'testing',
    relatedSpec: {
      type: 'acceptance_criteria',
      specId: 'testing',
      specName: 'Integration Tests'
    },
    status: 'todo',
    estimatedHours: 12,
    actualHours: 0,
    priority: 'high',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: [],
    testStatus: 'not_started',
    technicalNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  return tasks;
}

function generateDeploymentTasks(meetingId: string): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  tasks.push({
    id: generateId(),
    meetingId,
    title: 'Deploy to production',
    description: 'Deploy all integrations and workflows to production environment',
    type: 'deployment',
    relatedSpec: {
      type: 'system',
      specId: 'deployment',
      specName: 'Production Deployment'
    },
    status: 'todo',
    estimatedHours: 4,
    actualHours: 0,
    priority: 'critical',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: true,
    testCases: [],
    testStatus: 'not_started',
    technicalNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  tasks.push({
    id: generateId(),
    meetingId,
    title: 'Documentation and handoff',
    description: 'Create documentation and hand off to client',
    type: 'documentation',
    relatedSpec: {
      type: 'system',
      specId: 'docs',
      specName: 'Documentation'
    },
    status: 'todo',
    estimatedHours: 8,
    actualHours: 0,
    priority: 'medium',
    dependencies: [],
    blocksOtherTasks: [],
    testingRequired: false,
    testCases: [],
    testStatus: 'not_started',
    technicalNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  });

  return tasks;
}

function assignTaskDependencies(tasks: DevelopmentTask[]): void {
  // Auth tasks must complete before integration tasks
  const authTasks = tasks.filter(t => t.title.toLowerCase().includes('authentication'));
  const integrationTasks = tasks.filter(t => t.type === 'integration' && !t.title.toLowerCase().includes('authentication'));

  integrationTasks.forEach(intTask => {
    const relatedAuthTask = authTasks.find(authTask =>
      intTask.relatedSpec.specName.includes(authTask.relatedSpec.specName.split(' ')[0])
    );
    if (relatedAuthTask) {
      intTask.dependencies.push(relatedAuthTask.id);
      relatedAuthTask.blocksOtherTasks.push(intTask.id);
    }
  });

  // Migration depends on integration
  const migrationTasks = tasks.filter(t => t.type === 'migration');
  migrationTasks.forEach(migTask => {
    const relatedIntTasks = integrationTasks.filter(intTask =>
      migTask.relatedSpec.specName.split(' ')[0] === intTask.relatedSpec.specName.split(' ')[0]
    );
    relatedIntTasks.forEach(intTask => {
      migTask.dependencies.push(intTask.id);
      intTask.blocksOtherTasks.push(migTask.id);
    });
  });

  // Testing depends on everything
  const testingTasks = tasks.filter(t => t.type === 'testing' && t.title.includes('End-to-end'));
  const deploymentTasks = tasks.filter(t => t.type === 'deployment');

  testingTasks.forEach(testTask => {
    tasks.filter(t => t.type !== 'testing' && t.type !== 'deployment').forEach(task => {
      testTask.dependencies.push(task.id);
      task.blocksOtherTasks.push(testTask.id);
    });
  });

  // Deployment depends on testing
  deploymentTasks.forEach(depTask => {
    testingTasks.forEach(testTask => {
      depTask.dependencies.push(testTask.id);
      testTask.blocksOtherTasks.push(depTask.id);
    });
  });
}

function assignToSprints(tasks: DevelopmentTask[]): void {
  // Assign tasks to 2-week sprints based on dependencies
  const tasksPerSprint = 10;

  // Sort by dependencies (tasks with no deps first)
  const sortedTasks = [...tasks].sort((a, b) => a.dependencies.length - b.dependencies.length);

  sortedTasks.forEach((task, index) => {
    task.sprint = `Sprint ${Math.ceil((index + 1) / tasksPerSprint)}`;
    task.sprintNumber = Math.ceil((index + 1) / tasksPerSprint);
  });
}

/**
 * Generate tasks from purchased services
 * This creates specific implementation tasks for each service that was purchased
 *
 * ENHANCED: Now uses actual collected requirements to generate detailed instructions
 * SMART: Intelligent time estimation based on service complexity and requirements
 */
function generateServiceTasks(meetingId: string, spec: ImplementationSpecData, meeting: Meeting): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  // Process automation services with SMART INSTRUCTION GENERATION
  if (spec.automations) {
    spec.automations.forEach((service: AutomationServiceEntry) => {
      // Generate intelligent instructions based on service type and collected requirements
      let detailedInstructions: string;
      let estimatedHours: number;

      if (service.serviceId === 'auto-lead-response' && service.requirements) {
        // Use the smart instruction generator
        const instructions = generateAutoLeadResponseInstructions(service.requirements, meeting);
        detailedInstructions = formatInstructionsAsMarkdown(instructions);
        estimatedHours = calculateSmartServiceHours(service, instructions.estimatedComplexity);
      } else if (service.serviceId === 'auto-form-to-crm' && service.requirements) {
        const instructions = generateAutoFormToCrmInstructions(service.requirements, meeting);
        detailedInstructions = formatInstructionsAsMarkdown(instructions);
        estimatedHours = calculateSmartServiceHours(service, instructions.estimatedComplexity);
      } else {
        // Fallback to basic description for services without custom generators yet
        detailedInstructions = generateBasicServiceDescription(service, meeting);
        estimatedHours = calculateSmartServiceHours(service, 'medium');
      }

      // SMART PRIORITY ASSIGNMENT based on business impact
      const smartPriority = calculateSmartPriority(service, meeting);

      // SMART DEPENDENCY DETECTION
      const smartDependencies = calculateSmartDependencies(service, spec);

      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceNameHe || service.serviceName}`,
        description: detailedInstructions,
        type: 'workflow',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceNameHe || service.serviceName
        },
        status: 'todo',
        estimatedHours,
        actualHours: 0,
        priority: smartPriority,
        dependencies: smartDependencies,
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateServiceTestCases(service).map(convertToTaskTestCase),
        testStatus: 'not_started',
        technicalNotes: service.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
    });
  }

  // Process AI agent services
  if (spec.aiAgentServices) {
    spec.aiAgentServices.forEach((service: AIAgentServiceEntry) => {
      const requirements = service.requirements as any;
      const complexity = requirements?.complexity || 'medium';
      const department = requirements?.department || 'service';
      
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceName}`,
        description: `Implement the ${service.serviceName} AI agent service.\n\nDepartment: ${department}\nComplexity: ${complexity}`,
        type: 'ai_agent',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceName
        },
        status: 'todo',
        estimatedHours: complexity === 'complex' ? 40 : complexity === 'medium' ? 24 : 16,
        actualHours: 0,
        priority: 'high',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateAIServiceTestCases(service).map(convertToTaskTestCase),
        testStatus: 'not_started',
        technicalNotes: (service as any).notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
    });
  }

  // Process integration services
  if (spec.integrationServices) {
    spec.integrationServices.forEach((service: IntegrationServiceEntry) => {
      const requirements = service.requirements as any;
      const complexity = requirements?.complexity || 'medium';
      const sourceSystem = requirements?.sourceSystem || 'System A';
      const targetSystem = requirements?.targetSystem || 'System B';
      
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceName}`,
        description: `Implement the ${service.serviceName} integration service.\n\nComplexity: ${complexity}\nSystems: ${sourceSystem} → ${targetSystem}`,
        type: 'integration',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceName
        },
        status: 'todo',
        estimatedHours: complexity === 'complex' ? 32 : complexity === 'medium' ? 20 : 12,
        actualHours: 0,
        priority: 'medium',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateIntegrationServiceTestCases(service).map(convertToTaskTestCase),
        testStatus: 'not_started',
        technicalNotes: service.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
    });
  }

  // Process system implementation services
  if (spec.systemImplementations) {
    spec.systemImplementations.forEach((service: SystemImplementationServiceEntry) => {
      const requirements = service.requirements as any;
      const platform = requirements?.platform || 'Unknown Platform';
      const modules = requirements?.modules || [];
      
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceName}`,
        description: `Implement the ${service.serviceName} system.\n\nPlatform: ${platform}\nModules: ${modules.length || 0}`,
        type: 'system_implementation',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceName
        },
        status: 'todo',
        estimatedHours: (modules.length || 1) * 8,
        actualHours: 0,
        priority: 'high',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateSystemImplementationTestCases(service).map(convertToTaskTestCase),
        testStatus: 'not_started',
        technicalNotes: service.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
    });
  }

  // Process additional services
  if (spec.additionalServices) {
    spec.additionalServices.forEach((service: AdditionalServiceEntry) => {
      const requirements = service.requirements as any;
      const serviceType = requirements?.type || 'data';
      const scope = requirements?.scope || 'single_department';
      
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceName}`,
        description: `Implement the ${service.serviceName} service.\n\nType: ${serviceType}\nScope: ${scope}`,
        type: 'additional_service',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceName
        },
        status: 'todo',
        estimatedHours: scope === 'enterprise' ? 40 : scope === 'multi_department' ? 24 : 16,
        actualHours: 0,
        priority: 'medium',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateAdditionalServiceTestCases(service).map(convertToTaskTestCase),
        testStatus: 'not_started',
        technicalNotes: service.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
    });
  }

  return tasks;
}

/**
 * Generate basic service description for services without custom generators
 */
function generateBasicServiceDescription(service: AutomationServiceEntry, meeting: Meeting): string {
  const businessCtx = require('./fieldMapper').extractBusinessContext(meeting);
  
  return `
## Service: ${service.serviceNameHe || service.serviceName}

**Client:** ${meeting.clientName}
**Category:** ${service.category || 'Not specified'}
**Service ID:** ${service.serviceId}

### Requirements Collected:
${service.requirements ? JSON.stringify(service.requirements, null, 2) : 'No specific requirements collected yet'}

### Business Context:
- Industry: ${businessCtx.industry || 'Not specified'}
- CRM System: ${businessCtx.crmSystem || 'Not specified'}
- Monthly Lead Volume: ${businessCtx.monthlyLeadVolume || 'Unknown'}

### Implementation Notes:
${service.notes || 'No additional notes'}

### Next Steps:
1. Review collected requirements in detail
2. Create detailed technical specification
3. Implement workflow in n8n
4. Test thoroughly before deployment

**Status:** ${service.status || 'Pending'}
  `.trim();
}

/**
 * SMART: Estimate hours for automation service based on complexity and requirements
 */
function calculateSmartServiceHours(service: AutomationServiceEntry, complexity: 'simple' | 'medium' | 'complex'): number {
  // Base hours by category
  let baseHours: number;
  if (service.category === 'lead_management') baseHours = 12;
  else if (service.category === 'communication') baseHours = 8;
  else if (service.category === 'crm_sync') baseHours = 16;
  else if (service.category === 'team_productivity') baseHours = 10;
  else if (service.category === 'ai_agents') baseHours = 24;
  else baseHours = 12;

  // Adjust based on complexity
  const complexityMultiplier = {
    simple: 0.7,
    medium: 1.0,
    complex: 1.4
  };

  // Adjust based on requirements completeness
  const requirements = service.requirements as any;
  let completenessFactor = 1.0;

  if (requirements) {
    const requiredFields = ['formPlatformAccess', 'emailServiceAccess', 'crmAccess', 'n8nWorkflow'];
    const completedFields = requiredFields.filter(field => requirements[field]);
    completenessFactor = 1 + (completedFields.length / requiredFields.length) * 0.3; // Up to 30% more for complete requirements
  }

  return Math.round(baseHours * complexityMultiplier[complexity] * completenessFactor);
}

/**
 * SMART: Calculate priority based on business impact
 */
function calculateSmartPriority(service: AutomationServiceEntry, meeting: Meeting): DevelopmentTask['priority'] {
  const businessCtx = require('./fieldMapper').extractBusinessContext(meeting);

  // Critical if it affects lead response time
  if (service.category === 'lead_management' && businessCtx.currentResponseTime === 'מעל 24 שעות') {
    return 'critical';
  }

  // High priority for revenue-impacting services
  if (service.category === 'lead_management' || service.category === 'crm_sync') {
    return 'high';
  }

  // Medium for communication services
  if (service.category === 'communication') {
    return 'medium';
  }

  // Lower for productivity services
  return 'low';
}

/**
 * SMART: Calculate task dependencies based on service relationships
 */
function calculateSmartDependencies(service: AutomationServiceEntry, spec: ImplementationSpecData): string[] {
  const dependencies: string[] = [];

  // CRM setup must happen before CRM-dependent services
  if (service.category === 'crm_sync' || service.serviceId === 'auto-form-to-crm') {
    const crmSystemTasks = spec.systems
      .filter(sys => sys.authentication.method)
      .map(sys => `system_auth_${sys.id}`);
    dependencies.push(...crmSystemTasks);
  }

  // Email setup for communication services
  if (service.category === 'communication') {
    dependencies.push('email_service_setup');
  }

  // n8n setup for workflow services
  if (service.category === 'workflow' || service.category === 'automation') {
    dependencies.push('n8n_instance_setup');
  }

  return dependencies;
}

/**
 * Generate test cases for automation services
 */
function generateServiceTestCases(_service: AutomationServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: `Test service functionality`,
      steps: ['Configure service with provided settings', 'Trigger test scenario', 'Verify expected behavior'],
      expectedResult: 'Service operates according to specifications',
      status: 'not_tested',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test error handling',
      steps: ['Simulate error conditions', 'Verify error handling', 'Check logging'],
      expectedResult: 'Errors are properly handled and logged',
      status: 'not_tested',
      passed: false
    }
  ];
}

/**
 * Generate test cases for AI agent services
 */
function generateAIServiceTestCases(_service: AIAgentServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: 'Test AI agent responses',
      steps: ['Configure AI agent', 'Test various conversation scenarios', 'Verify response quality'],
      expectedResult: 'AI agent provides accurate and helpful responses',
      status: 'not_tested',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test knowledge base integration',
      steps: ['Verify knowledge base sources', 'Test information retrieval', 'Check response accuracy'],
      expectedResult: 'AI agent correctly uses knowledge base information',
      status: 'not_tested',
      passed: false
    }
  ];
}

/**
 * Generate test cases for integration services
 */
function generateIntegrationServiceTestCases(_service: IntegrationServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: 'Test data flow between systems',
      steps: ['Configure integration', 'Send test data', 'Verify data arrives correctly'],
      expectedResult: 'Data flows correctly between systems',
      status: 'not_tested',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test error handling',
      steps: ['Simulate connection failures', 'Verify retry logic', 'Check error notifications'],
      expectedResult: 'Integration handles errors gracefully',
      status: 'not_tested',
      passed: false
    }
  ];
}

/**
 * Generate test cases for system implementation services
 */
function generateSystemImplementationTestCases(_service: SystemImplementationServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: 'Test system setup and configuration',
      steps: ['Install and configure system', 'Test basic functionality', 'Verify user access'],
      expectedResult: 'System is properly installed and accessible',
      status: 'not_tested',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test module functionality',
      steps: ['Test each configured module', 'Verify data flow', 'Check integrations'],
      expectedResult: 'All modules function correctly',
      status: 'not_tested',
      passed: false
    }
  ];
}

/**
 * Generate test cases for additional services
 */
function generateAdditionalServiceTestCases(_service: AdditionalServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: `Test service delivery`,
      steps: ['Deliver service according to specifications', 'Verify client satisfaction', 'Document outcomes'],
      expectedResult: 'Service delivered successfully',
      status: 'not_tested',
      passed: false
    }
  ];
}

// ============================================================================
// TASK EDITING AND REGENERATION
// ============================================================================

/**
 * Update an existing task with new values
 * Allows developers to edit task details, hours, and instructions
 */
export function updateTask(
  tasks: DevelopmentTask[],
  taskId: string,
  updates: Partial<DevelopmentTask>
): DevelopmentTask[] {
  return tasks.map(task => {
    if (task.id === taskId) {
      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date(),
        // If description or requirements changed, regenerate instructions
        ...(updates.description && { description: regenerateTaskInstructions(task, updates.description) })
      };

      // Update dependencies if priority or status changed
      if (updates.priority || updates.status) {
        return updateTaskDependencies(updatedTask, tasks);
      }

      return updatedTask;
    }
    return task;
  });
}

/**
 * Regenerate task instructions based on updated requirements
 */
function regenerateTaskInstructions(task: DevelopmentTask, newDescription?: string): string {
  // For now, return the new description or existing one
  // In a full implementation, this would regenerate based on service requirements
  return newDescription || task.description;
}

/**
 * Update task dependencies when a task's priority or status changes
 */
function updateTaskDependencies(updatedTask: DevelopmentTask, allTasks: DevelopmentTask[]): DevelopmentTask {
  // If task becomes critical, ensure it has no dependencies that could block it
  if (updatedTask.priority === 'critical') {
    updatedTask.dependencies = updatedTask.dependencies.filter(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask?.priority === 'critical';
    });
  }

  // Update blocksOtherTasks based on new dependencies
  updatedTask.blocksOtherTasks = allTasks
    .filter(t => t.dependencies.includes(updatedTask.id))
    .map(t => t.id);

  return updatedTask;
}

/**
 * Regenerate task plan based on updated requirements
 * Useful when Phase 2 data changes after initial generation
 */
export function regenerateTaskPlan(
  meeting: Meeting,
  existingTasks: DevelopmentTask[] = []
): DevelopmentTask[] {
  // Generate new tasks
  const newTasks = generateTasksFromPhase2(meeting);

  // Preserve existing task data where possible
  const mergedTasks = newTasks.map(newTask => {
    const existingTask = existingTasks.find(et => et.relatedSpec.specId === newTask.relatedSpec.specId);

    if (existingTask) {
      // Preserve actual hours, status, and manual edits
      return {
        ...newTask,
        actualHours: existingTask.actualHours,
        status: existingTask.status,
        assignedTo: existingTask.assignedTo,
        technicalNotes: existingTask.technicalNotes,
        // Keep custom description if it was manually edited
        description: existingTask.description.includes('CUSTOM EDIT') ? existingTask.description : newTask.description,
        updatedAt: new Date()
      };
    }

    return newTask;
  });

  return mergedTasks;
}

/**
 * Bulk update tasks with smart reordering
 */
export function bulkUpdateTasks(
  tasks: DevelopmentTask[],
  updates: Array<{ taskId: string; updates: Partial<DevelopmentTask> }>
): DevelopmentTask[] {
  let updatedTasks = [...tasks];

  // Apply all updates
  updates.forEach(({ taskId, updates: taskUpdates }) => {
    updatedTasks = updateTask(updatedTasks, taskId, taskUpdates);
  });

  // Reorder tasks based on new priorities and dependencies
  return reorderTasks(updatedTasks);
}

/**
 * Smart task reordering based on priorities and dependencies
 */
function reorderTasks(tasks: DevelopmentTask[]): DevelopmentTask[] {
  // Sort by priority (critical first), then by dependency count (fewer dependencies first)
  return tasks.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, put tasks with fewer dependencies first
    return a.dependencies.length - b.dependencies.length;
  });
}

/**
 * Validate task plan for consistency
 */
export function validateTaskPlan(tasks: DevelopmentTask[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for circular dependencies
  const circularDeps = findCircularDependencies(tasks);
  if (circularDeps.length > 0) {
    errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
  }

  // Check for orphaned tasks (no dependencies but not critical)
  const orphanedTasks = tasks.filter(task =>
    task.dependencies.length === 0 &&
    task.priority !== 'critical' &&
    !tasks.some(t => t.dependencies.includes(task.id))
  );

  if (orphanedTasks.length > 0) {
    warnings.push(`${orphanedTasks.length} tasks have no dependencies or dependents`);
  }

  // Check for unrealistic time estimates
  const unrealisticTasks = tasks.filter(task =>
    task.estimatedHours > 40 || task.estimatedHours < 1
  );

  if (unrealisticTasks.length > 0) {
    warnings.push(`${unrealisticTasks.length} tasks have unrealistic time estimates`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Find circular dependencies in task graph
 */
function findCircularDependencies(tasks: DevelopmentTask[]): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularDeps: string[] = [];

  function hasCircularDependency(taskId: string): boolean {
    if (recursionStack.has(taskId)) {
      return true; // Found a cycle
    }

    if (visited.has(taskId)) {
      return false; // Already processed
    }

    visited.add(taskId);
    recursionStack.add(taskId);

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      for (const depId of task.dependencies) {
        if (hasCircularDependency(depId)) {
          circularDeps.push(`${taskId} -> ${depId}`);
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  tasks.forEach(task => {
    if (!visited.has(task.id)) {
      hasCircularDependency(task.id);
    }
  });

  return [...new Set(circularDeps)]; // Remove duplicates
}
