/**
 * Task Auto-Generation Engine
 *
 * Generates development tasks from Phase 2 implementation specs
 */

import { Meeting, DevelopmentTask, DetailedSystemSpec, IntegrationFlow, DetailedAIAgentSpec, SystemModule, TestCase, SampleConversation, ImplementationSpecData } from '../types';
import { AutomationServiceEntry, AIAgentServiceEntry, IntegrationServiceEntry, SystemImplementationServiceEntry, AdditionalServiceEntry } from '../types/automationServices';

const generateId = () => Math.random().toString(36).substr(2, 9);

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

  // Generate tasks from purchased services
  tasks.push(...generateServiceTasks(meeting.meetingId, spec));

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
 */
function generateServiceTasks(meetingId: string, spec: ImplementationSpecData): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  // Process automation services
  if (spec.automations) {
    spec.automations.forEach((service: AutomationServiceEntry) => {
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceNameHe}`,
        description: `Implement the ${service.serviceName} automation service.\n\nCategory: ${service.category}\nService ID: ${service.serviceId}\nStatus: ${service.status}`,
        type: 'service_implementation',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceNameHe
        },
        status: 'todo',
        estimatedHours: service.config ? estimateServiceHours(service) : 8,
        actualHours: 0,
        priority: service.category === 'lead_management' ? 'high' : 'medium',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateServiceTestCases(service),
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
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceNameHe}`,
        description: `Implement the ${service.serviceName} AI agent service.\n\nDepartment: ${service.department}\nComplexity: ${service.complexity}`,
        type: 'ai_agent',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceNameHe
        },
        status: 'todo',
        estimatedHours: service.complexity === 'complex' ? 40 : service.complexity === 'medium' ? 24 : 16,
        actualHours: 0,
        priority: 'high',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateAIServiceTestCases(service),
        testStatus: 'not_started',
        technicalNotes: service.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
    });
  }

  // Process integration services
  if (spec.integrationServices) {
    spec.integrationServices.forEach((service: IntegrationServiceEntry) => {
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceNameHe}`,
        description: `Implement the ${service.serviceName} integration service.\n\nComplexity: ${service.complexity}\nSystems: ${service.sourceSystem} → ${service.targetSystem}`,
        type: 'integration',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceNameHe
        },
        status: 'todo',
        estimatedHours: service.complexity === 'complex' ? 32 : service.complexity === 'medium' ? 20 : 12,
        actualHours: 0,
        priority: 'medium',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateIntegrationServiceTestCases(service),
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
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceNameHe}`,
        description: `Implement the ${service.serviceName} system.\n\nPlatform: ${service.platform}\nModules: ${service.modules?.length || 0}`,
        type: 'system_implementation',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceNameHe
        },
        status: 'todo',
        estimatedHours: (service.modules?.length || 1) * 8,
        actualHours: 0,
        priority: 'high',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateSystemImplementationTestCases(service),
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
      tasks.push({
        id: generateId(),
        meetingId,
        title: `Implement ${service.serviceNameHe}`,
        description: `Implement the ${service.serviceName} service.\n\nType: ${service.type}\nScope: ${service.scope}`,
        type: 'additional_service',
        relatedSpec: {
          type: 'service',
          specId: service.serviceId,
          specName: service.serviceNameHe
        },
        status: 'todo',
        estimatedHours: service.scope === 'enterprise' ? 40 : service.scope === 'multi_department' ? 24 : 16,
        actualHours: 0,
        priority: 'medium',
        dependencies: [],
        blocksOtherTasks: [],
        testingRequired: true,
        testCases: generateAdditionalServiceTestCases(service),
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
 * Estimate hours for automation service based on complexity
 */
function estimateServiceHours(service: AutomationServiceEntry): number {
  if (service.category === 'lead_management') return 12;
  if (service.category === 'communication') return 8;
  if (service.category === 'crm_sync') return 16;
  if (service.category === 'team_productivity') return 10;
  if (service.category === 'ai_agents') return 24;
  return 12; // default
}

/**
 * Generate test cases for automation services
 */
function generateServiceTestCases(service: AutomationServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: `Test ${service.serviceNameHe} functionality`,
      steps: ['Configure service with provided settings', 'Trigger test scenario', 'Verify expected behavior'],
      expectedResult: 'Service operates according to specifications',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test error handling',
      steps: ['Simulate error conditions', 'Verify error handling', 'Check logging'],
      expectedResult: 'Errors are properly handled and logged',
      passed: false
    }
  ];
}

/**
 * Generate test cases for AI agent services
 */
function generateAIServiceTestCases(service: AIAgentServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: 'Test AI agent responses',
      steps: ['Configure AI agent', 'Test various conversation scenarios', 'Verify response quality'],
      expectedResult: 'AI agent provides accurate and helpful responses',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test knowledge base integration',
      steps: ['Verify knowledge base sources', 'Test information retrieval', 'Check response accuracy'],
      expectedResult: 'AI agent correctly uses knowledge base information',
      passed: false
    }
  ];
}

/**
 * Generate test cases for integration services
 */
function generateIntegrationServiceTestCases(service: IntegrationServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: 'Test data flow between systems',
      steps: ['Configure integration', 'Send test data', 'Verify data arrives correctly'],
      expectedResult: 'Data flows correctly between systems',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test error handling',
      steps: ['Simulate connection failures', 'Verify retry logic', 'Check error notifications'],
      expectedResult: 'Integration handles errors gracefully',
      passed: false
    }
  ];
}

/**
 * Generate test cases for system implementation services
 */
function generateSystemImplementationTestCases(service: SystemImplementationServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: 'Test system setup and configuration',
      steps: ['Install and configure system', 'Test basic functionality', 'Verify user access'],
      expectedResult: 'System is properly installed and accessible',
      passed: false
    },
    {
      id: generateId(),
      description: 'Test module functionality',
      steps: ['Test each configured module', 'Verify data flow', 'Check integrations'],
      expectedResult: 'All modules function correctly',
      passed: false
    }
  ];
}

/**
 * Generate test cases for additional services
 */
function generateAdditionalServiceTestCases(service: AdditionalServiceEntry): TestCase[] {
  return [
    {
      id: generateId(),
      description: `Test ${service.serviceNameHe} delivery`,
      steps: ['Deliver service according to specifications', 'Verify client satisfaction', 'Document outcomes'],
      expectedResult: 'Service delivered successfully',
      passed: false
    }
  ];
}
