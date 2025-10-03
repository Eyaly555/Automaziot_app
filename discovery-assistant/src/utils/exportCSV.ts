import { Meeting } from '../types';
import type { DevelopmentTask } from '../types/phase3';

/**
 * Map internal task type to Jira issue type
 */
function mapTaskTypeToJiraType(type: string): string {
  const mapping: Record<string, string> = {
    integration: 'Task',
    ai_agent: 'Story',
    workflow: 'Task',
    migration: 'Task',
    testing: 'Test',
    deployment: 'Task',
    bug: 'Bug',
    feature: 'Story'
  };

  return mapping[type] || 'Task';
}

/**
 * Map internal priority to Jira priority
 */
function mapPriorityToJira(priority: string): string {
  const mapping: Record<string, string> = {
    critical: 'Highest',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  return mapping[priority] || 'Medium';
}

/**
 * Map internal status to Jira status
 */
function mapStatusToJira(status: string): string {
  const mapping: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    blocked: 'Blocked',
    done: 'Done'
  };

  return mapping[status] || 'To Do';
}

/**
 * Estimate story points based on hours
 */
function estimateStoryPoints(hours: number): number {
  if (hours <= 2) return 1;
  if (hours <= 4) return 2;
  if (hours <= 8) return 3;
  if (hours <= 16) return 5;
  if (hours <= 32) return 8;
  return 13;
}

/**
 * Format task description for GitHub issue body
 */
function formatGitHubIssueBody(task: DevelopmentTask): string {
  const parts: string[] = [];

  // Description
  if (task.description) {
    parts.push(task.description);
    parts.push('');
  }

  // Related spec
  if (task.relatedSpec) {
    parts.push(`**Related Spec:** ${task.relatedSpec.type} - ${task.relatedSpec.specName}`);
    parts.push('');
  }

  // Technical details
  parts.push('## Technical Details');
  parts.push(`- **Type:** ${task.type}`);
  parts.push(`- **Priority:** ${task.priority}`);
  parts.push(`- **Estimated Hours:** ${task.estimatedHours}h`);
  if (task.actualHours) {
    parts.push(`- **Actual Hours:** ${task.actualHours}h`);
  }
  parts.push('');

  // Dependencies
  if (task.dependencies && task.dependencies.length > 0) {
    parts.push('## Dependencies');
    task.dependencies.forEach(dep => {
      parts.push(`- [ ] ${dep}`);
    });
    parts.push('');
  }

  // Test cases
  if (task.testCases && task.testCases.length > 0) {
    parts.push('## Test Cases');
    task.testCases.forEach(testCase => {
      parts.push(`- [ ] ${testCase.name}`);
      if (testCase.description) {
        parts.push(`  ${testCase.description}`);
      }
    });
    parts.push('');
  }

  // Acceptance criteria
  if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
    parts.push('## Acceptance Criteria');
    task.acceptanceCriteria.forEach(criteria => {
      parts.push(`- [ ] ${criteria}`);
    });
  }

  return parts.join('\n');
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field value
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Export tasks to Jira CSV format
 */
export function exportTasksToJiraCSV(meeting: Meeting): void {
  const tasks = meeting.developmentTracking?.tasks || [];

  if (tasks.length === 0) {
    alert('No tasks available to export');
    return;
  }

  // Jira CSV format
  const headers = [
    'Summary',
    'Issue Type',
    'Priority',
    'Status',
    'Assignee',
    'Reporter',
    'Description',
    'Story Points',
    'Sprint',
    'Labels',
    'Component',
    'Estimated Hours',
    'System'
  ];

  const rows = tasks.map((task: DevelopmentTask) => [
    escapeCSVField(task.title),
    escapeCSVField(mapTaskTypeToJiraType(task.type)),
    escapeCSVField(mapPriorityToJira(task.priority)),
    escapeCSVField(mapStatusToJira(task.status)),
    escapeCSVField(task.assignedTo || ''),
    'Discovery Assistant',
    escapeCSVField(task.description || ''),
    estimateStoryPoints(task.estimatedHours),
    escapeCSVField(task.sprint || ''),
    escapeCSVField(task.tags?.join(' ') || ''),
    escapeCSVField(task.relatedSpec?.type || ''),
    task.estimatedHours,
    escapeCSVField(task.relatedSpec?.specName || '')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `Jira_Import_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.csv`, 'text/csv');
}

/**
 * Export tasks to GitHub Issues CSV format
 */
export function exportTasksToGitHubCSV(meeting: Meeting): void {
  const tasks = meeting.developmentTracking?.tasks || [];

  if (tasks.length === 0) {
    alert('No tasks available to export');
    return;
  }

  // GitHub Issues CSV format
  const headers = ['Title', 'Body', 'Labels', 'Milestone', 'Assignees'];

  const rows = tasks.map((task: DevelopmentTask) => [
    escapeCSVField(task.title),
    escapeCSVField(formatGitHubIssueBody(task)),
    escapeCSVField([
      task.type,
      task.priority,
      task.status,
      ...(task.tags || [])
    ].join(',')),
    escapeCSVField(task.sprint || ''),
    escapeCSVField(task.assignedTo || '')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `GitHub_Import_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.csv`, 'text/csv');
}

/**
 * Export tasks to generic CSV format (for Excel or other tools)
 */
export function exportTasksToGenericCSV(meeting: Meeting): void {
  const tasks = meeting.developmentTracking?.tasks || [];

  if (tasks.length === 0) {
    alert('No tasks available to export');
    return;
  }

  const headers = [
    'ID',
    'Title',
    'Type',
    'Status',
    'Priority',
    'Description',
    'Estimated Hours',
    'Actual Hours',
    'Assignee',
    'Sprint',
    'Related Spec',
    'Tags',
    'Created',
    'Updated'
  ];

  const rows = tasks.map((task: DevelopmentTask) => [
    escapeCSVField(task.id),
    escapeCSVField(task.title),
    escapeCSVField(task.type),
    escapeCSVField(task.status),
    escapeCSVField(task.priority),
    escapeCSVField(task.description || ''),
    task.estimatedHours,
    task.actualHours || 0,
    escapeCSVField(task.assignedTo || 'Unassigned'),
    escapeCSVField(task.sprint || 'Backlog'),
    escapeCSVField(`${task.relatedSpec?.type || ''} - ${task.relatedSpec?.specName || ''}`),
    escapeCSVField(task.tags?.join(', ') || ''),
    escapeCSVField(task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''),
    escapeCSVField(task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : '')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `Tasks_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.csv`, 'text/csv');
}

/**
 * Export sprint summary to CSV
 */
export function exportSprintSummaryToCSV(meeting: Meeting): void {
  const sprints = meeting.developmentTracking?.sprints || [];
  const tasks = meeting.developmentTracking?.tasks || [];

  if (sprints.length === 0) {
    alert('No sprints available to export');
    return;
  }

  const headers = [
    'Sprint Name',
    'Start Date',
    'End Date',
    'Goal',
    'Status',
    'Total Tasks',
    'Completed',
    'In Progress',
    'Blocked',
    'Todo',
    'Completion %',
    'Total Hours Estimated',
    'Total Hours Actual'
  ];

  const rows = sprints.map((sprint: any) => {
    const sprintTasks = tasks.filter((t: DevelopmentTask) => t.sprint === sprint.name);
    const completed = sprintTasks.filter((t: DevelopmentTask) => t.status === 'done').length;
    const inProgress = sprintTasks.filter((t: DevelopmentTask) => t.status === 'in_progress').length;
    const blocked = sprintTasks.filter((t: DevelopmentTask) => t.status === 'blocked').length;
    const todo = sprintTasks.filter((t: DevelopmentTask) => t.status === 'todo').length;
    const totalEstimated = sprintTasks.reduce((sum: number, t: DevelopmentTask) => sum + t.estimatedHours, 0);
    const totalActual = sprintTasks.reduce((sum: number, t: DevelopmentTask) => sum + t.actualHours, 0);

    return [
      escapeCSVField(sprint.name),
      escapeCSVField(new Date(sprint.startDate).toLocaleDateString()),
      escapeCSVField(new Date(sprint.endDate).toLocaleDateString()),
      escapeCSVField(sprint.goal || ''),
      escapeCSVField(sprint.status),
      sprintTasks.length,
      completed,
      inProgress,
      blocked,
      todo,
      `${Math.round((completed / (sprintTasks.length || 1)) * 100)}%`,
      totalEstimated,
      totalActual
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `Sprint_Summary_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.csv`, 'text/csv');
}

/**
 * Export blockers to CSV
 */
export function exportBlockersToCSV(meeting: Meeting): void {
  const blockers = meeting.developmentTracking?.blockers || [];

  if (blockers.length === 0) {
    alert('No blockers available to export');
    return;
  }

  const headers = [
    'Blocker ID',
    'Task ID',
    'Task Title',
    'Reason',
    'Severity',
    'Reported Date',
    'Reported By',
    'Status',
    'Resolution',
    'Resolved Date',
    'Resolved By'
  ];

  const tasks = meeting.developmentTracking?.tasks || [];

  const rows = blockers.map((blocker: any) => {
    const task = tasks.find((t: DevelopmentTask) => t.id === blocker.taskId);

    return [
      escapeCSVField(blocker.id),
      escapeCSVField(blocker.taskId),
      escapeCSVField(task?.title || 'N/A'),
      escapeCSVField(blocker.reason),
      escapeCSVField(blocker.severity),
      escapeCSVField(new Date(blocker.reportedDate).toLocaleDateString()),
      escapeCSVField(blocker.reportedBy || ''),
      blocker.resolved ? 'Resolved' : 'Active',
      escapeCSVField(blocker.resolution || 'Pending'),
      escapeCSVField(blocker.resolvedDate ? new Date(blocker.resolvedDate).toLocaleDateString() : ''),
      escapeCSVField(blocker.resolvedBy || '')
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `Blockers_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.csv`, 'text/csv');
}
