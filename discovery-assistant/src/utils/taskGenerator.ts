/**
 * Task Auto-Generation Engine
 *
 * Generates development tasks from Phase 2 implementation specs
 */

import { Meeting, DevelopmentTask, DetailedSystemSpec, IntegrationFlow, DetailedAIAgentSpec } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function generateTasksFromPhase2(meeting: Meeting): DevelopmentTask[] {
  const tasks: DevelopmentTask[] = [];

  if (!meeting.implementationSpec) {
    return tasks;
  }

  const spec = meeting.implementationSpec;

  // Generate tasks from systems
  spec.systems.forEach(system => {
    tasks.push(...generateSystemTasks(meeting.meetingId, system));
  });

  // Generate tasks from integrations
  spec.integrations.forEach(integration => {
    tasks.push(...generateIntegrationTasks(meeting.meetingId, integration));
  });

  // Generate tasks from AI agents
  spec.aiAgents.forEach(agent => {
    tasks.push(...generateAIAgentTasks(meeting.meetingId, agent));
  });

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
  system.modules.forEach(module => {
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
    testCases: integration.testCases.map(tc => ({
      id: generateId(),
      description: tc.name,
      steps: [tc.description],
      expectedResult: JSON.stringify(tc.expectedOutput),
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
    description: `Build conversation logic with ${agent.conversationFlow.steps.length} steps\n\nMax length: ${agent.conversationFlow.maxConversationLength} exchanges\nFallback: ${agent.conversationFlow.defaultFallback}`,
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
    description: `Train AI agent with ${agent.training.sampleConversations.length} sample conversations\n\nEdge cases: ${agent.training.edgeCases.length}\nProhibited topics: ${agent.training.prohibitedTopics.length}`,
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
    testCases: agent.training.sampleConversations.map(convo => ({
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

function generateTestingTasks(meetingId: string, spec: any): DevelopmentTask[] {
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
  let currentSprint = 1;
  const tasksPerSprint = 10;

  // Sort by dependencies (tasks with no deps first)
  const sortedTasks = [...tasks].sort((a, b) => a.dependencies.length - b.dependencies.length);

  sortedTasks.forEach((task, index) => {
    task.sprint = `Sprint ${Math.ceil((index + 1) / tasksPerSprint)}`;
    task.sprintNumber = Math.ceil((index + 1) / tasksPerSprint);
  });
}
