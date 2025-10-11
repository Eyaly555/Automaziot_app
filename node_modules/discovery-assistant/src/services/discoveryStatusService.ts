/**
 * Discovery Status Service
 * Frontend service for tracking workflow stages
 *
 * This service calculates the appropriate Discovery_Status for Zoho CRM
 * based on the meeting's current state. It implements a 5-stage workflow:
 *
 * 1. discovery_started - User has filled any module data
 * 2. proposal - Services have been selected for proposal
 * 3. proposal_sent - Proposal has been downloaded or sent to client
 * 4. technical_details_collection - Client approved, Phase 2 in progress
 * 5. implementation_started - Phase 2 complete, development started
 */

import type { Meeting } from '../types';

export type DiscoveryStatusValue =
  | 'discovery_started'
  | 'proposal'
  | 'proposal_sent'
  | 'technical_details_collection'
  | 'implementation_started';

/**
 * Calculate Discovery_Status based on meeting state
 * This logic matches the backend calculation in api/zoho/helpers/discoveryStatus.js
 *
 * @param meeting - Complete meeting object
 * @returns Discovery status value
 */
export function calculateDiscoveryStatus(meeting: Meeting): DiscoveryStatusValue {
  if (!meeting) {
    console.warn('[Discovery Status] No meeting provided, defaulting to discovery_started');
    return 'discovery_started';
  }

  // RULE 5: Phase 2 completed → implementation_started
  // Check if all purchased services have completed requirements
  const phase2Complete = meeting.implementationSpec?.completionPercentage === 100;
  const inDevelopment = meeting.phase === 'development';

  if (inDevelopment || phase2Complete) {
    console.log('[Discovery Status] Rule 5: implementation_started');
    return 'implementation_started';
  }

  // RULE 4: Client approved → technical_details_collection
  const clientApproved = meeting.status === 'client_approved';
  const hasApprovalSignature = !!meeting.modules?.proposal?.approvedBy;

  if (clientApproved || hasApprovalSignature) {
    console.log('[Discovery Status] Rule 4: technical_details_collection');
    return 'technical_details_collection';
  }

  // RULE 3: Proposal sent (downloaded/printed) → proposal_sent
  const proposalSent = meeting.modules?.proposal?.proposalSent === true;
  const proposalSentAt = !!meeting.modules?.proposal?.proposalSentAt;

  if (proposalSent || proposalSentAt) {
    console.log('[Discovery Status] Rule 3: proposal_sent');
    return 'proposal_sent';
  }

  // RULE 2: Services selected → proposal
  const selectedServices = meeting.modules?.proposal?.selectedServices || [];
  const hasSelectedServices = selectedServices.some(s => s.selected === true);

  if (hasSelectedServices) {
    console.log('[Discovery Status] Rule 2: proposal');
    return 'proposal';
  }

  // RULE 1: Any module data → discovery_started
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
  ] as const;

  const hasAnyModuleData = moduleNames.some(moduleName => {
    const moduleData = modules[moduleName];
    if (!moduleData || typeof moduleData !== 'object') return false;

    // Check if module has any filled fields
    return Object.values(moduleData).some(value => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    });
  });

  if (hasAnyModuleData) {
    console.log('[Discovery Status] Rule 1: discovery_started');
    return 'discovery_started';
  }

  // Default for brand new meetings with no data
  console.log('[Discovery Status] Default: discovery_started');
  return 'discovery_started';
}

/**
 * Mark proposal as sent (triggers status update to proposal_sent)
 * Call this when user downloads or sends proposal
 *
 * @param meetingId - Meeting ID
 * @param updateModule - Function to update module data
 */
export async function markProposalAsSent(
  meetingId: string,
  updateModule: (moduleName: string, data: any) => void
): Promise<void> {
  try {
    updateModule('proposal', {
      proposalSent: true,
      proposalSentAt: new Date().toISOString()
    });

    console.log('[Discovery Status] Proposal marked as sent for meeting:', meetingId);
  } catch (error) {
    console.error('[Discovery Status] Failed to mark proposal as sent:', error);
  }
}

/**
 * Get status display information
 *
 * @param status - Discovery status value
 * @returns Status metadata including labels, colors, icons
 */
export function getStatusInfo(status: DiscoveryStatusValue) {
  const statusConfig = {
    discovery_started: {
      label: 'גילוי בתהליך',
      shortLabel: 'גילוי',
      labelEn: 'Discovery in Progress',
      description: 'איסוף מידע אודות הלקוח ותהליכיו',
      descriptionEn: 'Collecting client information and processes',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      icon: '🔍',
      stage: 1
    },
    proposal: {
      label: 'בניית הצעה',
      shortLabel: 'הצעה',
      labelEn: 'Building Proposal',
      description: 'בחירת שירותים מתאימים והכנת הצעת מחיר',
      descriptionEn: 'Selecting services and preparing price quote',
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      icon: '📝',
      stage: 2
    },
    proposal_sent: {
      label: 'הצעה נשלחה',
      shortLabel: 'נשלחה',
      labelEn: 'Proposal Sent',
      description: 'ההצעה נשלחה ללקוח, ממתינים להחלטה',
      descriptionEn: 'Proposal sent to client, awaiting decision',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      icon: '📨',
      stage: 3
    },
    technical_details_collection: {
      label: 'איסוף פרטים טכניים',
      shortLabel: 'פרטים טכניים',
      labelEn: 'Technical Details Collection',
      description: 'הלקוח אישר, איסוף דרישות טכניות מפורטות',
      descriptionEn: 'Client approved, collecting detailed technical requirements',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
      icon: '⚙️',
      stage: 4
    },
    implementation_started: {
      label: 'יישום החל',
      shortLabel: 'יישום',
      labelEn: 'Implementation Started',
      description: 'הפרויקט בפיתוח, צוות הטכני עובד על היישום',
      descriptionEn: 'Project in development, technical team working on implementation',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      icon: '🚀',
      stage: 5
    }
  };

  return statusConfig[status];
}

/**
 * Get all possible status values
 * Useful for dropdowns, filters, etc.
 *
 * @returns Array of all status values
 */
export function getAllStatuses(): DiscoveryStatusValue[] {
  return [
    'discovery_started',
    'proposal',
    'proposal_sent',
    'technical_details_collection',
    'implementation_started'
  ];
}

/**
 * Validate that a status value is valid
 *
 * @param status - Status value to validate
 * @returns True if valid, false otherwise
 */
export function isValidStatus(status: string): status is DiscoveryStatusValue {
  return getAllStatuses().includes(status as DiscoveryStatusValue);
}

/**
 * Get the next logical status in the workflow
 * Useful for suggesting next steps to users
 *
 * @param currentStatus - Current status
 * @returns Next status or null if at end
 */
export function getNextStatus(currentStatus: DiscoveryStatusValue): DiscoveryStatusValue | null {
  const workflow = getAllStatuses();
  const currentIndex = workflow.indexOf(currentStatus);

  if (currentIndex === -1 || currentIndex === workflow.length - 1) {
    return null; // Invalid status or already at end
  }

  return workflow[currentIndex + 1];
}

/**
 * Get the previous status in the workflow
 *
 * @param currentStatus - Current status
 * @returns Previous status or null if at start
 */
export function getPreviousStatus(currentStatus: DiscoveryStatusValue): DiscoveryStatusValue | null {
  const workflow = getAllStatuses();
  const currentIndex = workflow.indexOf(currentStatus);

  if (currentIndex <= 0) {
    return null; // Invalid status or already at start
  }

  return workflow[currentIndex - 1];
}

/**
 * Calculate progress percentage based on status
 * Maps status to approximate completion percentage
 *
 * @param status - Current status
 * @returns Progress percentage (0-100)
 */
export function getStatusProgressPercentage(status: DiscoveryStatusValue): number {
  const progressMap = {
    discovery_started: 20,
    proposal: 40,
    proposal_sent: 60,
    technical_details_collection: 80,
    implementation_started: 90
  };

  return progressMap[status] || 0;
}

/**
 * Format status for display
 * Returns Hebrew label by default, with option for English
 *
 * @param status - Status value
 * @param language - Language ('he' or 'en')
 * @returns Formatted status string
 */
export function formatStatus(status: DiscoveryStatusValue, language: 'he' | 'en' = 'he'): string {
  const info = getStatusInfo(status);
  return language === 'en' ? info.labelEn : info.label;
}
