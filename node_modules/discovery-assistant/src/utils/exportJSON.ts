import { Meeting } from '../types';

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
 * Export complete meeting data to JSON
 * Full backup including all phases
 */
export function exportMeetingToJSON(meeting: Meeting): void {
  const jsonData = JSON.stringify(meeting, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `Meeting_Full_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export Discovery phase data to JSON
 * Includes modules, pain points, ROI, and proposal
 */
export function exportDiscoveryToJSON(meeting: Meeting): void {
  const discoveryData = {
    meetingId: meeting.meetingId,
    clientName: meeting.clientName,
    date: meeting.date,
    phase: meeting.phase,
    status: meeting.status,
    modules: meeting.modules,
    painPoints: meeting.painPoints,
    totalROI: meeting.totalROI,
    customFieldValues: meeting.customFieldValues,
    notes: meeting.notes,
    zohoIntegration: meeting.zohoIntegration,
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(discoveryData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `Discovery_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export Implementation Spec phase data to JSON
 * Includes systems, integrations, AI agents, and acceptance criteria
 */
export function exportImplementationSpecToJSON(meeting: Meeting): void {
  if (!meeting.implementationSpec) {
    alert('No implementation specification data available');
    return;
  }

  const phase2Data = {
    meetingId: meeting.meetingId,
    clientName: meeting.clientName,
    phase: meeting.phase,
    status: meeting.status,
    implementationSpec: meeting.implementationSpec,
    // Include discovery data for context
    discoveryModules: {
      overview: meeting.modules.overview,
      systems: meeting.modules.systems,
      proposal: meeting.modules.proposal
    },
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(phase2Data, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `Implementation_Spec_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export Development phase data to JSON
 * Includes tasks, sprints, blockers, and team members
 */
export function exportDevelopmentToJSON(meeting: Meeting): void {
  if (!meeting.developmentTracking) {
    alert('No development tracking data available');
    return;
  }

  const phase3Data = {
    meetingId: meeting.meetingId,
    clientName: meeting.clientName,
    phase: meeting.phase,
    status: meeting.status,
    developmentTracking: meeting.developmentTracking,
    // Include relevant context from previous phases
    projectContext: {
      overview: meeting.modules.overview,
      totalROI: meeting.totalROI,
      proposedServices: meeting.modules.proposal?.selectedServices
    },
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(phase3Data, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `Development_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export systems inventory to JSON
 * Specialized export for systems data
 */
export function exportSystemsInventoryToJSON(meeting: Meeting): void {
  const systemsData = {
    clientName: meeting.clientName,
    exportDate: new Date().toISOString(),
    discoveryPhase: {
      currentSystems: meeting.modules.systems?.currentSystems || [],
      integrationNeeds: meeting.modules.systems?.integrationNeeds,
      // Calculate average satisfaction from detailed systems
      satisfactionScore: meeting.modules.systems?.detailedSystems?.length
        ? meeting.modules.systems.detailedSystems.reduce((sum, sys) => sum + sys.satisfactionScore, 0) / meeting.modules.systems.detailedSystems.length
        : undefined
    },
    implementationPhase: meeting.implementationSpec?.systems || [],
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(systemsData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `Systems_Inventory_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export ROI analysis to JSON
 * Specialized export for ROI data
 */
export function exportROIAnalysisToJSON(meeting: Meeting): void {
  const roiData = {
    clientName: meeting.clientName,
    exportDate: new Date().toISOString(),
    totalROI: meeting.totalROI,
    roiModule: meeting.modules.roi,
    painPoints: meeting.painPoints,
    proposedServices: meeting.modules.proposal?.selectedServices || [],
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(roiData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `ROI_Analysis_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export tasks to JSON
 * Specialized export for development tasks
 */
export function exportTasksToJSON(meeting: Meeting): void {
  if (!meeting.developmentTracking?.tasks) {
    alert('No tasks available to export');
    return;
  }

  const tasksData = {
    clientName: meeting.clientName,
    exportDate: new Date().toISOString(),
    tasks: meeting.developmentTracking.tasks,
    sprints: meeting.developmentTracking.sprints || [],
    blockers: meeting.developmentTracking.blockers || [],
    teamMembers: meeting.developmentTracking.teamMembers || [],
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(tasksData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `Tasks_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export n8n workflow templates to JSON
 * Specialized export for integration workflows
 */
export function exportN8NWorkflowsToJSON(meeting: Meeting): void {
  if (!meeting.implementationSpec?.integrations) {
    alert('No integration flows available to export');
    return;
  }

  const workflows = meeting.implementationSpec.integrations.map((flow: any) => ({
    name: flow.name,
    nodes: [
      {
        parameters: {},
        name: 'Trigger',
        type: flow.trigger?.type || 'webhook',
        typeVersion: 1,
        position: [250, 300]
      },
      ...(flow.steps || []).map((step: any, index: number) => ({
        parameters: {
          operation: step.type,
          endpoint: step.endpoint || '',
          authentication: 'predefinedCredentialType'
        },
        name: step.description || `Step ${index + 1}`,
        type: step.type === 'api_call' ? 'httpRequest' : step.type,
        typeVersion: 1,
        position: [250 + (index + 1) * 200, 300]
      }))
    ],
    connections: {},
    settings: {
      executionOrder: 'v1'
    }
  }));

  const n8nData = {
    clientName: meeting.clientName,
    exportDate: new Date().toISOString(),
    workflows,
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(n8nData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `n8n_Workflows_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Export pain points to JSON
 * Specialized export for pain points analysis
 */
export function exportPainPointsToJSON(meeting: Meeting): void {
  const painPointsData = {
    clientName: meeting.clientName,
    exportDate: new Date().toISOString(),
    painPoints: meeting.painPoints || [],
    summary: {
      totalCount: meeting.painPoints?.length || 0,
      criticalCount: meeting.painPoints?.filter(p => p.severity === 'critical').length || 0,
      highCount: meeting.painPoints?.filter(p => p.severity === 'high').length || 0,
      mediumCount: meeting.painPoints?.filter(p => p.severity === 'medium').length || 0,
      lowCount: meeting.painPoints?.filter(p => p.severity === 'low').length || 0,
      totalPotentialSavings: meeting.painPoints?.reduce((sum, p) => sum + (p.potentialSaving || 0), 0) || 0,
      totalPotentialHours: meeting.painPoints?.reduce((sum, p) => sum + (p.potentialHours || 0), 0) || 0
    },
    byModule: Object.entries(
      (meeting.painPoints || []).reduce((acc, p) => {
        if (!acc[p.module]) {
          acc[p.module] = [];
        }
        acc[p.module].push(p);
        return acc;
      }, {} as Record<string, typeof meeting.painPoints>)
    ).map(([module, points]) => ({
      module,
      count: points.length,
      points
    })),
    exportVersion: '1.0'
  };

  const jsonData = JSON.stringify(painPointsData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonData,
    `Pain_Points_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.json`,
    'application/json'
  );
}

/**
 * Import meeting data from JSON
 * Can be used to restore backups
 */
export async function importMeetingFromJSON(file: File): Promise<Meeting | null> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Basic validation
    if (!data.meetingId || !data.clientName) {
      throw new Error('Invalid meeting data: missing required fields');
    }

    // Convert date strings back to Date objects
    if (data.date) {
      data.date = new Date(data.date);
    }

    if (data.phaseHistory) {
      data.phaseHistory = data.phaseHistory.map((transition: any) => ({
        ...transition,
        timestamp: new Date(transition.timestamp)
      }));
    }

    return data as Meeting;
  } catch (error) {
    console.error('Error importing meeting from JSON:', error);
    alert('Failed to import meeting data. Please check the file format.');
    return null;
  }
}

/**
 * Copy meeting data to clipboard as JSON
 */
export async function copyMeetingToClipboard(meeting: Meeting): Promise<void> {
  try {
    const jsonData = JSON.stringify(meeting, null, 2);
    await navigator.clipboard.writeText(jsonData);
    alert('Meeting data copied to clipboard');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    alert('Failed to copy to clipboard');
  }
}

/**
 * Copy specific phase data to clipboard as JSON
 */
export async function copyPhaseDataToClipboard(meeting: Meeting, phase: 'discovery' | 'implementation_spec' | 'development'): Promise<void> {
  try {
    let data: any;

    switch (phase) {
      case 'discovery':
        data = {
          modules: meeting.modules,
          painPoints: meeting.painPoints,
          totalROI: meeting.totalROI
        };
        break;
      case 'implementation_spec':
        data = meeting.implementationSpec;
        break;
      case 'development':
        data = meeting.developmentTracking;
        break;
    }

    const jsonData = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(jsonData);
    alert(`${phase} data copied to clipboard`);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    alert('Failed to copy to clipboard');
  }
}
