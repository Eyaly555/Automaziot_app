/**
 * Discovery Status Helper
 *
 * Calculates the appropriate Discovery_Status value for Zoho CRM based on meeting state.
 * This implements the 5-stage workflow tracking system.
 *
 * Stages:
 * 1. discovery_started - Any module data filled
 * 2. proposal - Services selected in proposal
 * 3. proposal_sent - Proposal downloaded/sent to client
 * 4. technical_details_collection - Client approved, Phase 2 in progress
 * 5. implementation_started - Phase 2 complete, development started
 */

/**
 * Calculate Discovery_Status based on meeting state
 *
 * @param {Object} meeting - Full meeting object from frontend
 * @returns {string} One of: discovery_started, proposal, proposal_sent,
 *                   technical_details_collection, implementation_started
 */
export function calculateDiscoveryStatus(meeting) {
  if (!meeting) {
    console.warn('[Discovery Status] No meeting provided, defaulting to discovery_started');
    return 'discovery_started';
  }

  // RULE 5: Phase 2 completed → implementation_started
  // Check if all purchased services have completed requirements
  const phase2Complete = meeting.implementationSpec?.completionPercentage === 100;
  const inDevelopment = meeting.phase === 'development';

  if (inDevelopment || phase2Complete) {
    console.log('[Discovery Status] Rule 5: implementation_started (phase:', meeting.phase, ', phase2Complete:', phase2Complete, ')');
    return 'implementation_started';
  }

  // RULE 4: Client approved → technical_details_collection
  const clientApproved = meeting.status === 'client_approved';
  const hasApprovalSignature = !!meeting.modules?.proposal?.approvedBy;

  if (clientApproved || hasApprovalSignature) {
    console.log('[Discovery Status] Rule 4: technical_details_collection (status:', meeting.status, ', approved:', hasApprovalSignature, ')');
    return 'technical_details_collection';
  }

  // RULE 3: Proposal sent (downloaded/printed) → proposal_sent
  const proposalSent = meeting.modules?.proposal?.proposalSent === true;
  const proposalSentAt = !!meeting.modules?.proposal?.proposalSentAt;

  if (proposalSent || proposalSentAt) {
    console.log('[Discovery Status] Rule 3: proposal_sent (proposalSent:', proposalSent, ', sentAt:', proposalSentAt, ')');
    return 'proposal_sent';
  }

  // RULE 2: Proposal stage (services selected) → proposal
  const selectedServices = meeting.modules?.proposal?.selectedServices || [];
  const hasSelectedServices = selectedServices.some(s => s.selected === true);

  if (hasSelectedServices) {
    console.log('[Discovery Status] Rule 2: proposal (', selectedServices.filter(s => s.selected).length, 'services selected)');
    return 'proposal';
  }

  // RULE 1: Any module has data → discovery_started
  const modules = meeting.modules || {};
  const moduleNames = [
    'overview',
    'essentialDetails',
    'leadsAndSales',
    'customerService',
    'operations',
    'reporting',
    'aiAgents',
    'systems',
    'roi'
  ];

  const hasAnyModuleData = moduleNames.some(moduleName => {
    const moduleData = modules[moduleName];
    if (!moduleData || typeof moduleData !== 'object') return false;

    // Check if module has any filled fields (not null, undefined, empty string, or empty array)
    return Object.values(moduleData).some(value => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    });
  });

  if (hasAnyModuleData) {
    console.log('[Discovery Status] Rule 1: discovery_started (has module data)');
    return 'discovery_started';
  }

  // Default for brand new meetings with no data
  console.log('[Discovery Status] Default: discovery_started (new meeting)');
  return 'discovery_started';
}

/**
 * Get human-readable status description
 *
 * @param {string} status - Discovery status value
 * @returns {Object} Status metadata including description, stage number, etc.
 */
export function getStatusDescription(status) {
  const descriptions = {
    discovery_started: {
      description: 'Discovery in progress - collecting client information',
      descriptionHe: 'גילוי בתהליך - איסוף מידע אודות הלקוח',
      stage: 1,
      color: 'blue',
      icon: '🔍'
    },
    proposal: {
      description: 'Building proposal - services being selected',
      descriptionHe: 'בניית הצעה - בחירת שירותים',
      stage: 2,
      color: 'purple',
      icon: '📝'
    },
    proposal_sent: {
      description: 'Proposal sent to client - awaiting decision',
      descriptionHe: 'הצעה נשלחה ללקוח - ממתינים להחלטה',
      stage: 3,
      color: 'yellow',
      icon: '📨'
    },
    technical_details_collection: {
      description: 'Client approved - collecting technical requirements',
      descriptionHe: 'לקוח אישר - איסוף דרישות טכניות',
      stage: 4,
      color: 'orange',
      icon: '⚙️'
    },
    implementation_started: {
      description: 'Implementation started - project in development',
      descriptionHe: 'יישום החל - פרויקט בפיתוח',
      stage: 5,
      color: 'green',
      icon: '🚀'
    }
  };

  return descriptions[status] || {
    description: 'Unknown status',
    descriptionHe: 'סטטוס לא ידוע',
    stage: 0,
    color: 'gray',
    icon: '❓'
  };
}

/**
 * Validate that a status value is valid
 *
 * @param {string} status - Status value to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidStatus(status) {
  const validStatuses = [
    'discovery_started',
    'proposal',
    'proposal_sent',
    'technical_details_collection',
    'implementation_started'
  ];

  return validStatuses.includes(status);
}

/**
 * Get the next logical status in the workflow
 * Useful for suggesting next steps to users
 *
 * @param {string} currentStatus - Current status
 * @returns {string|null} Next status or null if at end
 */
export function getNextStatus(currentStatus) {
  const workflow = [
    'discovery_started',
    'proposal',
    'proposal_sent',
    'technical_details_collection',
    'implementation_started'
  ];

  const currentIndex = workflow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === workflow.length - 1) {
    return null; // Invalid status or already at end
  }

  return workflow[currentIndex + 1];
}

/**
 * Calculate progress percentage based on status
 * Maps status to approximate completion percentage
 *
 * @param {string} status - Current status
 * @returns {number} Progress percentage (0-100)
 */
export function getStatusProgressPercentage(status) {
  const progressMap = {
    discovery_started: 20,
    proposal: 40,
    proposal_sent: 60,
    technical_details_collection: 80,
    implementation_started: 90
  };

  return progressMap[status] || 0;
}
