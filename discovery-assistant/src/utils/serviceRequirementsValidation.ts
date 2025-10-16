/**
 * Service Requirements Validation Utilities
 *
 * Validates that all purchased services have completed technical requirement forms
 * before allowing Phase 2 → Phase 3 transition.
 */

import { Meeting } from '../types';
import { getRequirementsTemplate } from '../config/serviceRequirementsTemplates';

export interface ServiceValidationResult {
  isValid: boolean;
  missingServices: string[];
  completedCount: number;
  totalCount: number;
  requiredFieldsByService?: Record<string, string[]>;
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
      totalCount: 0,
      requiredFieldsByService: {},
    };
  }

  // Collect required fields for each service for documentation purposes
  const requiredFieldsByService: Record<string, string[]> = {};
  purchasedServices.forEach((service) => {
    const template = getRequirementsTemplate(service.id);
    if (template) {
      const fields: string[] = [];
      template.sections.forEach((section) => {
        section.fields.forEach((field) => {
          fields.push(`${section.titleHe}: ${field.labelHe} (${field.type})`);
        });
      });
      requiredFieldsByService[service.id] = fields;
    }
  });

  // Get all completed service IDs from all service categories
  const completed = new Set<string>();

  // Guard: Check if implementationSpec exists
  if (!implementationSpec) {
    return {
      isValid: false,
      missingServices: purchasedServices.map((s) => s.nameHe || s.name),
      completedCount: 0,
      totalCount: purchasedServices.length,
    };
  }

  // Check service requirements completion based on the actual structure
  // Each service requirement form should add an entry to its respective array

  // Automations (Services 1-20) - check if requirements were collected
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

  // Additional Services (Services 50-73)
  if (Array.isArray(implementationSpec.additionalServices)) {
    implementationSpec.additionalServices.forEach((service: any) => {
      if (service.serviceId) {
        completed.add(service.serviceId);
      }
    });
  }

  // Find missing services (services that were purchased but don't have completed forms)
  const missingServices = purchasedServices
    .filter((service) => !completed.has(service.id))
    .map((service) => service.nameHe || service.name);

  return {
    isValid: missingServices.length === 0,
    missingServices,
    completedCount: completed.size,
    totalCount: purchasedServices.length,
    requiredFieldsByService,
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
    console.log(
      '[Phase2 Validation] No purchased services - Phase 2 complete by default'
    );
    return true;
  }

  // Validate all services have completed requirements
  const validation = validateServiceRequirements(
    purchasedServices,
    meeting.implementationSpec || {}
  );

  if (!validation.isValid) {
    console.warn(
      '[Phase2 Validation] Missing service requirements:',
      validation.missingServices
    );
    console.warn(
      `[Phase2 Validation] Completed: ${validation.completedCount}/${validation.totalCount}`
    );
  }

  return validation.isValid;
};

/**
 * Gets a detailed breakdown of service completion status
 *
 * @param meeting - Current meeting object
 * @returns Detailed validation result
 */
export const getServiceCompletionStatus = (
  meeting: Meeting | null
): ServiceValidationResult => {
  if (!meeting) {
    return {
      isValid: false,
      missingServices: [],
      completedCount: 0,
      totalCount: 0,
    };
  }

  const purchasedServices = meeting.modules?.proposal?.purchasedServices || [];

  if (purchasedServices.length === 0) {
    return {
      isValid: true, // No services to complete
      missingServices: [],
      completedCount: 0,
      totalCount: 0,
    };
  }

  return validateServiceRequirements(
    purchasedServices,
    meeting.implementationSpec || {}
  );
};

/**
 * Generate comprehensive requirements documentation for developers
 * This creates a detailed specification of all fields that need to be collected for each service
 */
export function generateRequirementsDocumentation(
  purchasedServices: any[]
): string {
  let documentation = `# מפרט דרישות טכניות לכל השירותים\n\n`;

  purchasedServices.forEach((service) => {
    const template = getRequirementsTemplate(service.id);
    if (!template) return;

    documentation += `## ${template.serviceNameHe} (${service.id})\n\n`;
    documentation += `**זמן משוער לאיסוף:** ${template.estimatedTimeMinutes} דקות\n\n`;

    if (template.tipsHe.length > 0) {
      documentation += `**טיפים לאיסוף:**\n`;
      template.tipsHe.forEach((tip) => {
        documentation += `- ${tip}\n`;
      });
      documentation += `\n`;
    }

    template.sections.forEach((section) => {
      documentation += `### ${section.titleHe}\n\n`;

      section.fields.forEach((field) => {
        const required = field.required ? '**(חובה)**' : '**(אופציונלי)**';
        documentation += `- **${field.labelHe}** ${required}\n`;
        documentation += `  - סוג: ${field.type}\n`;

        if (field.options && field.options.length > 0) {
          documentation += `  - אפשרויות: ${field.options.map((opt) => opt.labelHe).join(', ')}\n`;
        }

        if (field.validation) {
          const validations = [];
          if (field.validation.min !== undefined)
            validations.push(`מינימום: ${field.validation.min}`);
          if (field.validation.max !== undefined)
            validations.push(`מקסימום: ${field.validation.max}`);
          if (field.validation.pattern)
            validations.push(`תבנית: ${field.validation.pattern}`);
          if (validations.length > 0) {
            documentation += `  - אימות: ${validations.join(', ')}\n`;
          }
        }

        documentation += `\n`;
      });

      documentation += `\n`;
    });

    documentation += `---\n\n`;
  });

  return documentation;
}

/**
 * Validate that all required fields for a service are properly collected
 */
export function validateServiceFields(
  serviceId: string,
  collectedData: any
): { isValid: boolean; missingFields: string[] } {
  const template = getRequirementsTemplate(serviceId);
  if (!template) {
    return { isValid: true, missingFields: [] };
  }

  const missingFields: string[] = [];

  template.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.required) {
        const fieldValue = collectedData[field.id];
        if (
          fieldValue === undefined ||
          fieldValue === null ||
          fieldValue === ''
        ) {
          missingFields.push(`${section.titleHe}: ${field.labelHe}`);
        }
      }
    });
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
