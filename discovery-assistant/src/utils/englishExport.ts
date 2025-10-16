import { Meeting } from '../types';
import {
  DetailedSystemSpec,
  IntegrationFlow,
  DetailedAIAgentSpec,
  AcceptanceCriteria,
} from '../types/phase2';
import { DevelopmentTask, Sprint } from '../types/phase3';

/**
 * Generate English technical documentation for developers
 */
export function generateEnglishTechnicalDoc(meeting: Meeting): string {
  const doc: string[] = [];

  doc.push('# Technical Implementation Specification\n');
  doc.push(`**Project:** ${meeting.clientName}`);
  doc.push(`**Meeting ID:** ${meeting.meetingId}`);
  doc.push(`**Date:** ${new Date(meeting.date).toLocaleDateString('en-US')}`);
  doc.push(`**Status:** ${meeting.status}\n`);
  doc.push('---\n');

  // Phase 1: Discovery Summary
  doc.push('## 1. Discovery Summary\n');
  doc.push('### Client Information\n');
  doc.push(`**Company:** ${meeting.clientName}`);
  doc.push(
    `**Industry:** ${meeting.modules?.overview?.industry || 'Not specified'}`
  );
  doc.push(
    `**Company Size:** ${meeting.modules?.operations?.hr?.employeeCount || 'Not specified'} employees`
  );
  doc.push(
    `**Budget:** ${meeting.modules?.overview?.budget || 'Not specified'}\n`
  );

  // Current Systems
  const systems = meeting.modules?.systems?.detailedSystems;
  if (systems && systems.length > 0) {
    doc.push('### Current Systems\n');
    systems.forEach((sys) => {
      doc.push(`- **${sys.specificSystem || sys.category}** (${sys.category})`);
      doc.push(`  - API Access: ${sys.apiAccess}`);
      doc.push(`  - Satisfaction: ${sys.satisfactionScore}/5`);
      if (sys.mainPainPoints && sys.mainPainPoints.length > 0) {
        doc.push(`  - Pain points: ${sys.mainPainPoints.join(', ')}`);
      }
      if (sys.customNotes) {
        doc.push(`  - Notes: ${sys.customNotes}`);
      }
    });
    doc.push('');
  }

  // Pain Points
  if (meeting.painPoints && meeting.painPoints.length > 0) {
    doc.push('### Pain Points\n');
    meeting.painPoints.forEach((pain: any, index: number) => {
      doc.push(`${index + 1}. **${pain.title}**`);
      doc.push(`   - Impact: ${pain.impact}`);
      doc.push(`   - Frequency: ${pain.frequency}`);
      if (pain.details) {
        doc.push(`   - Details: ${pain.details}`);
      }
    });
    doc.push('');
  }

  // Phase 2: Implementation Specification
  if (meeting.implementationSpec) {
    doc.push('\n---\n');
    doc.push('## 2. Implementation Specification\n');

    // Systems
    if (
      meeting.implementationSpec.systems &&
      meeting.implementationSpec.systems.length > 0
    ) {
      doc.push('### 2.1 Systems Integration\n');
      meeting.implementationSpec.systems.forEach(
        (sys: DetailedSystemSpec, index: number) => {
          doc.push(`#### ${index + 1}. ${sys.systemName}\n`);
          doc.push(generateSystemSpec(sys));
        }
      );
    }

    // Integrations
    if (
      meeting.implementationSpec.integrations &&
      meeting.implementationSpec.integrations.length > 0
    ) {
      doc.push('### 2.2 Integration Flows\n');
      meeting.implementationSpec.integrations.forEach(
        (flow: IntegrationFlow, index: number) => {
          doc.push(`#### ${index + 1}. ${flow.name}\n`);
          doc.push(generateIntegrationSpec(flow));
        }
      );
    }

    // AI Agents
    if (
      meeting.implementationSpec.aiAgents &&
      meeting.implementationSpec.aiAgents.length > 0
    ) {
      doc.push('### 2.3 AI Agents\n');
      meeting.implementationSpec.aiAgents.forEach(
        (agent: DetailedAIAgentSpec, index: number) => {
          doc.push(`#### ${index + 1}. ${agent.name}\n`);
          doc.push(generateAIAgentSpec(agent));
        }
      );
    }

    // Acceptance Criteria
    if (meeting.implementationSpec.acceptanceCriteria) {
      doc.push('### 2.4 Acceptance Criteria\n');
      doc.push(
        generateAcceptanceCriteriaSpec(
          meeting.implementationSpec.acceptanceCriteria
        )
      );
    }
  }

  // Phase 3: Development Tasks
  if (meeting.developmentTracking) {
    doc.push('\n---\n');
    doc.push('## 3. Development Tasks\n');
    doc.push(
      generateDevelopmentTasksSpec(
        meeting.developmentTracking.tasks,
        meeting.developmentTracking.sprints || []
      )
    );
  }

  return doc.join('\n');
}

function generateSystemSpec(system: DetailedSystemSpec): string {
  const lines: string[] = [];

  lines.push('**Authentication**');
  lines.push(`- Method: ${system.authentication.method}`);
  lines.push(`- API Endpoint: ${system.authentication.apiEndpoint || 'N/A'}`);
  lines.push(
    `- Credentials Provided: ${system.authentication.credentialsProvided ? 'Yes' : 'No'}`
  );
  lines.push(
    `- Rate Limits: ${system.authentication.rateLimits || 'None specified'}`
  );
  lines.push(
    `- Test Account Available: ${system.authentication.testAccountAvailable ? 'Yes' : 'No'}\n`
  );

  if (system.modules && system.modules.length > 0) {
    lines.push('**Modules**');
    system.modules.forEach((mod) => {
      const totalFields = mod.fields.length + mod.customFields.length;
      lines.push(
        `- ${mod.name} (${totalFields} fields: ${mod.fields.length} standard, ${mod.customFields.length} custom)`
      );
      if (mod.customFields && mod.customFields.length > 0) {
        const customFieldNames = mod.customFields
          .map((f) => f.fieldLabel || f.fieldName)
          .join(', ');
        lines.push(`  - Custom fields: ${customFieldNames}`);
      }
    });
    lines.push('');
  }

  if (system.dataMigration.required) {
    lines.push('**Data Migration**');
    lines.push(`- Records to migrate: ${system.dataMigration.recordCount}`);
    lines.push(
      `- Historical data: ${system.dataMigration.historicalDataYears} years`
    );
    lines.push(`- Method: ${system.dataMigration.migrationMethod}`);
    lines.push(
      `- Cleanup needed: ${system.dataMigration.cleanupNeeded ? 'Yes' : 'No'}`
    );
    lines.push(
      `- Test migration first: ${system.dataMigration.testMigrationFirst ? 'Yes' : 'No'}`
    );
    if (system.dataMigration.rollbackPlan) {
      lines.push(`- Rollback plan: ${system.dataMigration.rollbackPlan}`);
    }
    lines.push('');
  }

  if (system.technicalNotes) {
    lines.push('**Technical Notes**');
    lines.push(system.technicalNotes + '\n');
  }

  return lines.join('\n');
}

function generateIntegrationSpec(flow: IntegrationFlow): string {
  const lines: string[] = [];

  lines.push(`**Source:** ${flow.sourceSystem}`);
  lines.push(`**Target:** ${flow.targetSystem}`);
  lines.push(`**Trigger:** ${flow.trigger.type}`);
  if (flow.trigger.schedule) {
    lines.push(`  - Schedule: ${flow.trigger.schedule}`);
  }
  if (flow.trigger.eventName) {
    lines.push(`  - Event: ${flow.trigger.eventName}`);
  }
  lines.push(`**Frequency:** ${flow.frequency}\n`);

  if (flow.steps && flow.steps.length > 0) {
    lines.push('**Steps:**');
    flow.steps.forEach((step) => {
      const stepNum = step.stepNumber || step.order || 0;
      const stepType = (step.type || step.action || 'STEP').toUpperCase();
      const stepDesc = step.description || step.name || 'No description';
      lines.push(`${stepNum}. ${stepType}: ${stepDesc}`);
      if (step.endpoint) {
        lines.push(`   - Endpoint: ${step.endpoint}`);
      }
      if (step.condition) {
        lines.push(`   - Condition: ${step.condition}`);
      }
    });
    lines.push('');
  }

  lines.push('**Error Handling**');
  const retryCount =
    flow.errorHandling.retryCount ?? flow.errorHandling.retryAttempts ?? 0;
  const retryDelay = flow.errorHandling.retryDelay ?? 0;
  lines.push(`- Retry count: ${retryCount}`);
  lines.push(`- Retry delay: ${retryDelay}s`);
  lines.push(
    `- Fallback action: ${flow.errorHandling.fallbackAction || 'None specified'}`
  );
  lines.push(
    `- Notify on failure: ${flow.errorHandling.notifyOnFailure ? 'Yes' : 'No'}`
  );
  if (flow.errorHandling.failureEmail) {
    lines.push(`- Failure email: ${flow.errorHandling.failureEmail}`);
  }
  lines.push('');

  if (flow.testCases && flow.testCases.length > 0) {
    lines.push('**Test Cases:**');
    flow.testCases.forEach((test, index) => {
      const testDesc =
        test.scenario || test.description || test.name || 'Test case';
      lines.push(`${index + 1}. ${testDesc} - Status: ${test.status}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

function generateAIAgentSpec(agent: DetailedAIAgentSpec): string {
  const lines: string[] = [];

  lines.push(`**Department:** ${agent.department}`);
  lines.push(
    `**AI Model:** ${agent.model.modelName} (${agent.model.provider})`
  );
  lines.push(`**Temperature:** ${agent.model.temperature}`);
  lines.push(`**Max Tokens:** ${agent.model.maxTokens}\n`);

  lines.push('**Knowledge Base**');
  lines.push(`- Sources: ${agent.knowledgeBase.sources.length}`);
  agent.knowledgeBase.sources.forEach((source, index) => {
    lines.push(`  ${index + 1}. ${source.type}: ${source.name}`);
    lines.push(`     - Location: ${source.location}`);
    lines.push(`     - Sync enabled: ${source.syncEnabled ? 'Yes' : 'No'}`);
  });
  lines.push(`- Update frequency: ${agent.knowledgeBase.updateFrequency}`);
  lines.push(
    `- Embedding model: ${agent.knowledgeBase.embeddingModel || 'Not specified'}\n`
  );

  if (agent.conversationFlow?.greeting) {
    lines.push('**Conversation Flow**');
    lines.push(`- Greeting: "${agent.conversationFlow.greeting}"`);
    const intents = agent.conversationFlow.intents || [];
    lines.push(`- Intents: ${intents.length}`);
    intents.forEach((intent, index) => {
      lines.push(`  ${index + 1}. ${intent.name}`);
      lines.push(`     - Requires data: ${intent.requiresData ? 'Yes' : 'No'}`);
    });
    lines.push(
      `- Max turns: ${agent.conversationFlow.maxTurns || 'Not specified'}`
    );
    lines.push(
      `- Context window: ${agent.conversationFlow.contextWindow || 'Not specified'}\n`
    );
  }

  lines.push('**Integrations**');
  lines.push(
    `- CRM: ${agent.integrations.crmEnabled ? `Yes (${agent.integrations.crmSystem})` : 'No'}`
  );
  lines.push(
    `- Email: ${agent.integrations.emailEnabled ? `Yes (${agent.integrations.emailProvider})` : 'No'}`
  );
  lines.push(
    `- Calendar: ${agent.integrations.calendarEnabled ? 'Yes' : 'No'}`
  );
  if (
    agent.integrations.customWebhooks &&
    agent.integrations.customWebhooks.length > 0
  ) {
    lines.push(
      `- Custom webhooks: ${agent.integrations.customWebhooks.length}`
    );
  }
  lines.push('');

  lines.push('**Training**');
  const faqPairs = agent.training.faqPairs || [];
  const conversationExamples = agent.training.conversationExamples || [];
  lines.push(`- FAQ pairs: ${faqPairs.length}`);
  lines.push(`- Conversation examples: ${conversationExamples.length}`);
  lines.push(`- Tone: ${agent.training.tone || 'Not specified'}`);
  lines.push(`- Language: ${agent.training.language || 'Not specified'}\n`);

  return lines.join('\n');
}

function generateAcceptanceCriteriaSpec(criteria: AcceptanceCriteria): string {
  const lines: string[] = [];

  if (criteria.functionalCriteria && criteria.functionalCriteria.length > 0) {
    lines.push('**Functional Criteria**');
    criteria.functionalCriteria.forEach((item, index) => {
      lines.push(
        `${index + 1}. [${item.priority.toUpperCase()}] ${item.description}`
      );
      lines.push(`   - Testable: ${item.testable ? 'Yes' : 'No'}`);
      lines.push(`   - Status: ${item.status}`);
    });
    lines.push('');
  }

  if (criteria.performanceCriteria && criteria.performanceCriteria.length > 0) {
    lines.push('**Performance Criteria**');
    criteria.performanceCriteria.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.metric}: ${item.target}`);
      lines.push(`   - Measurement: ${item.measurement}`);
    });
    lines.push('');
  }

  if (criteria.securityCriteria && criteria.securityCriteria.length > 0) {
    lines.push('**Security Requirements**');
    criteria.securityCriteria.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.requirement}`);
      lines.push(`   - Implemented: ${item.implemented ? 'Yes' : 'No'}`);
      lines.push(`   - Verification: ${item.verificationMethod}`);
    });
    lines.push('');
  }

  if (criteria.deploymentCriteria) {
    lines.push('**Deployment**');
    lines.push(
      `- Environment: ${criteria.deploymentCriteria.environment || 'Not specified'}`
    );
    if (
      criteria.deploymentCriteria.approvers &&
      criteria.deploymentCriteria.approvers.length > 0
    ) {
      lines.push('- Approvers:');
      criteria.deploymentCriteria.approvers.forEach((approver) => {
        lines.push(
          `  - ${approver.name || 'N/A'} (${approver.role || 'N/A'}) - ${approver.email || 'N/A'}`
        );
      });
    }
    if (criteria.deploymentCriteria.rollbackPlan) {
      lines.push(
        `- Rollback plan: ${criteria.deploymentCriteria.rollbackPlan}`
      );
    }
    if (
      criteria.deploymentCriteria.smokeTests &&
      criteria.deploymentCriteria.smokeTests.length > 0
    ) {
      lines.push('- Smoke tests:');
      criteria.deploymentCriteria.smokeTests.forEach((test) => {
        lines.push(`  - ${test}`);
      });
    }
    lines.push('');
  }

  if (criteria.signOffRequired) {
    lines.push('**Sign-Off Required**');
    if (criteria.signOffBy && criteria.signOffBy.length > 0) {
      lines.push('Sign-off by:');
      criteria.signOffBy.forEach((person) => {
        lines.push(`- ${person.name} (${person.role}) - ${person.email}`);
      });
    }
    lines.push('');
  }

  return lines.join('\n');
}

function generateDevelopmentTasksSpec(
  tasks: DevelopmentTask[],
  sprints: Sprint[]
): string {
  const lines: string[] = [];

  // Summary
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'in_progress'
  ).length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;

  lines.push('**Summary**');
  lines.push(`- Total tasks: ${totalTasks}`);
  lines.push(
    `- Completed: ${completedTasks} (${Math.round((completedTasks / totalTasks) * 100)}%)`
  );
  lines.push(`- In progress: ${inProgressTasks}`);
  lines.push(`- Blocked: ${blockedTasks}\n`);

  const totalEstimated = tasks.reduce(
    (sum, t) => sum + (t.estimatedHours || 0),
    0
  );
  const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  lines.push('**Hours**');
  lines.push(`- Estimated: ${totalEstimated}h`);
  lines.push(`- Actual: ${totalActual}h`);
  if (totalEstimated > 0) {
    lines.push(
      `- Variance: ${totalActual - totalEstimated}h (${Math.round(((totalActual - totalEstimated) / totalEstimated) * 100)}%)`
    );
  }
  lines.push('');

  // Group by type
  const tasksByType = tasks.reduce(
    (acc, task) => {
      if (!acc[task.type]) {
        acc[task.type] = [];
      }
      acc[task.type].push(task);
      return acc;
    },
    {} as Record<string, DevelopmentTask[]>
  );

  lines.push('### Tasks by Type\n');
  Object.entries(tasksByType).forEach(([type, typeTasks]) => {
    lines.push(`#### ${type.toUpperCase()} (${typeTasks.length} tasks)\n`);
    typeTasks.forEach((task) => {
      const statusEmoji =
        {
          todo: '⚪',
          in_progress: '🔵',
          in_review: '🟡',
          blocked: '🔴',
          done: '🟢',
        }[task.status] || '⚪';

      const priorityLabel =
        {
          critical: '🔴 CRITICAL',
          high: '🟠 HIGH',
          medium: '🟡 MEDIUM',
          low: '🟢 LOW',
        }[task.priority] || task.priority;

      lines.push(`${statusEmoji} **${task.title}** [${priorityLabel}]`);
      lines.push(
        `   - Related: ${task.relatedSpec.type} - ${task.relatedSpec.specName}`
      );
      lines.push(
        `   - Estimated: ${task.estimatedHours}h | Actual: ${task.actualHours}h`
      );
      if (task.assignedTo) {
        lines.push(`   - Assigned to: ${task.assignedTo}`);
      }
      if (task.sprint) {
        lines.push(`   - Sprint: ${task.sprint}`);
      }
      if (task.dependencies && task.dependencies.length > 0) {
        lines.push(`   - Dependencies: ${task.dependencies.length} tasks`);
      }
      if (task.testCases && task.testCases.length > 0) {
        lines.push(`   - Test cases: ${task.testCases.length}`);
      }
      lines.push('');
    });
  });

  // Sprints
  if (sprints && sprints.length > 0) {
    lines.push('### Sprints\n');
    sprints.forEach((sprint) => {
      lines.push(`#### ${sprint.name}`);
      const startDate = sprint.startDate
        ? new Date(sprint.startDate).toLocaleDateString('en-US')
        : 'Not set';
      const endDate = sprint.endDate
        ? new Date(sprint.endDate).toLocaleDateString('en-US')
        : 'Not set';
      lines.push(`- Duration: ${startDate} - ${endDate}`);
      lines.push(`- Goal: ${sprint.goal || 'Not specified'}`);
      lines.push(`- Status: ${sprint.status}`);

      const sprintTasks = tasks.filter((t) => t.sprint === sprint.name);
      const sprintCompleted = sprintTasks.filter(
        (t) => t.status === 'done'
      ).length;
      lines.push(`- Tasks: ${sprintCompleted}/${sprintTasks.length} completed`);
      lines.push('');
    });
  }

  return lines.join('\n');
}

/**
 * Export to markdown file
 */
export function exportToMarkdown(meeting: Meeting): void {
  const content = generateEnglishTechnicalDoc(meeting);
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `technical-spec-${meeting.clientName.replace(/\s+/g, '-')}-${meeting.meetingId}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export to plain text file
 */
export function exportToText(meeting: Meeting): void {
  const content = generateEnglishTechnicalDoc(meeting);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `technical-spec-${meeting.clientName.replace(/\s+/g, '-')}-${meeting.meetingId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(meeting: Meeting): Promise<void> {
  const content = generateEnglishTechnicalDoc(meeting);
  await navigator.clipboard.writeText(content);
}
