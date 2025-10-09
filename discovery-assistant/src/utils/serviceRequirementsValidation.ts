/**
 * Service Requirements Validation Utilities
 *
 * Validates that all purchased services have completed technical requirement forms
 * before allowing Phase 2 → Phase 3 transition.
 */

import { Meeting } from '../types';

export interface ServiceValidationResult {
  isValid: boolean;
  missingServices: string[];
  completedCount: number;
  totalCount: number;
}

/**
 * בודק אם כל הטפסים של השירותים הנרכשים הושלמו
 *
 * Checks if all purchased services have completed their technical requirement forms.
 * This is required before transitioning from Phase 2 (Implementation Spec) to Phase 3 (Development).
 *
 * @param purchasedServices - List of services purchased by the client
 * @param implementationSpec - Implementation specification data from Phase 2
 * @returns Validation result with completion status and missing services
 */
export const validateServiceRequirements = (
  purchasedServices: any[],
  implementationSpec: any
): ServiceValidationResult => {
  // Handle empty array case: no services = nothing to validate = valid
  if (!Array.isArray(purchasedServices) || purchasedServices.length === 0) {
    return {
      isValid: true,
      missingServices: [],
      completedCount: 0,
      totalCount: 0
    };
  }

  // Get all completed service IDs from all service categories
  const completed = new Set<string>();

  // Guard: Check if implementationSpec exists
  if (!implementationSpec) {
    return {
      isValid: false,
      missingServices: purchasedServices.map(s => s.nameHe || s.name),
      completedCount: 0,
      totalCount: purchasedServices.length
    };
  }

  // Automations (Services 1-20)
  if (Array.isArray(implementationSpec.automations)) {
    implementationSpec.automations.forEach((automation: any) => {
      if (automation.serviceId) {
        completed.add(automation.serviceId);
      }
    });
  }

  // AI Agent Services (Services 21-30)
  if (Array.isArray(implementationSpec.aiAgentServices)) {
    implementationSpec.aiAgentServices.forEach((service: any) => {
      if (service.serviceId) {
        completed.add(service.serviceId);
      }
    });
  }

  // Integration Services (Services 31-40)
  if (Array.isArray(implementationSpec.integrationServices)) {
    implementationSpec.integrationServices.forEach((integration: any) => {
      if (integration.serviceId) {
        completed.add(integration.serviceId);
      }
    });
  }

  // System Implementations (Services 41-49)
  if (Array.isArray(implementationSpec.systemImplementations)) {
    implementationSpec.systemImplementations.forEach((system: any) => {
      if (system.serviceId) {
        completed.add(system.serviceId);
      }
    });
  }

  // Additional Services (Services 50-59)
  if (Array.isArray(implementationSpec.additionalServices)) {
    implementationSpec.additionalServices.forEach((service: any) => {
      if (service.serviceId) {
        completed.add(service.serviceId);
      }
    });
  }

  // Find missing services (services that were purchased but don't have completed forms)
  const missingServices = purchasedServices
    .filter(service => !completed.has(service.id))
    .map(service => service.nameHe || service.name);

  return {
    isValid: missingServices.length === 0,
    missingServices,
    completedCount: completed.size,
    totalCount: purchasedServices.length
  };
};

/**
 * בודק אם Phase 2 מוכן למעבר ל-Phase 3
 *
 * Checks if Phase 2 is complete and ready for transition to Phase 3.
 * Validates that all purchased services have completed technical requirements.
 *
 * @param meeting - Current meeting object
 * @returns true if all service requirements are complete, false otherwise
 */
export const isPhase2Complete = (meeting: Meeting | null): boolean => {
  if (!meeting) {
    console.warn('[Phase2 Validation] No meeting provided');
    return false;
  }

  // Check if there are any purchased services
  const purchasedServices = meeting.modules?.proposal?.purchasedServices || [];

  // FIXED: If no services purchased, Phase 2 is considered complete (nothing to validate)
  if (purchasedServices.length === 0) {
    console.log('[Phase2 Validation] No purchased services - Phase 2 complete by default');
    return true;
  }

  // Validate all services have completed requirements
  const validation = validateServiceRequirements(
    purchasedServices,
    meeting.implementationSpec || {}
  );

  if (!validation.isValid) {
    console.warn('[Phase2 Validation] Missing service requirements:', validation.missingServices);
    console.warn(`[Phase2 Validation] Completed: ${validation.completedCount}/${validation.totalCount}`);
  }

  return validation.isValid;
};

/**
 * Gets a detailed breakdown of service completion status
 *
 * @param meeting - Current meeting object
 * @returns Detailed validation result
 */
export const getServiceCompletionStatus = (meeting: Meeting | null): ServiceValidationResult => {
  if (!meeting) {
    return {
      isValid: false,
      missingServices: [],
      completedCount: 0,
      totalCount: 0
    };
  }

  const purchasedServices = meeting.modules?.proposal?.purchasedServices || [];

  if (purchasedServices.length === 0) {
    return {
      isValid: true, // No services to complete
      missingServices: [],
      completedCount: 0,
      totalCount: 0
    };
  }

  return validateServiceRequirements(
    purchasedServices,
    meeting.implementationSpec || {}
  );
};
