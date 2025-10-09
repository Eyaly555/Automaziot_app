/**
 * Smart Field Unification System
 * Identifies common fields across services and provides unified collection
 */

import { ServiceRequirementsTemplate } from '../types/serviceRequirements';
import { getRequirementsTemplate } from '../config/serviceRequirementsTemplates';

export interface FieldUnification {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  usedByServices: string[];
  suggestedValue?: any;
  sourceService?: string;
  confidence: number;
}

export interface UnifiedFieldCollection {
  unifiedFields: FieldUnification[];
  serviceSpecificFields: Record<string, any[]>;
  totalEstimatedTime: number;
}

/**
 * Analyze purchased services and identify common fields
 */
export function analyzeFieldUnification(purchasedServiceIds: string[]): UnifiedFieldCollection {
  const serviceTemplates = purchasedServiceIds
    .map(id => getRequirementsTemplate(id))
    .filter(template => template !== null) as ServiceRequirementsTemplate[];

  if (serviceTemplates.length === 0) {
    return {
      unifiedFields: [],
      serviceSpecificFields: {},
      totalEstimatedTime: 0
    };
  }

  // Collect all fields from all services
  const fieldMap = new Map<string, {
    field: any;
    usedByServices: string[];
    sources: string[];
  }>();

  serviceTemplates.forEach(template => {
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        const fieldKey = `${field.id}_${field.type}`;

        if (fieldMap.has(fieldKey)) {
          const existing = fieldMap.get(fieldKey)!;
          existing.usedByServices.push(template.serviceId);
          existing.sources.push(template.serviceNameHe);
        } else {
          fieldMap.set(fieldKey, {
            field,
            usedByServices: [template.serviceId],
            sources: [template.serviceNameHe]
          });
        }
      });
    });
  });

  // Categorize fields as unified vs service-specific
  const unifiedFields: FieldUnification[] = [];
  const serviceSpecificFields: Record<string, any[]> = {};

  fieldMap.forEach((value, fieldKey) => {
    const { field, usedByServices, sources } = value;

    if (usedByServices.length > 1) {
      // This field is used by multiple services - make it unified
      unifiedFields.push({
        fieldId: field.id,
        fieldLabel: field.labelHe,
        fieldType: field.type,
        usedByServices,
        suggestedValue: suggestUnifiedValue(field, usedByServices),
        sourceService: sources[0],
        confidence: calculateConfidence(field, usedByServices)
      });
    } else {
      // Service-specific field
      const serviceId = usedByServices[0];
      if (!serviceSpecificFields[serviceId]) {
        serviceSpecificFields[serviceId] = [];
      }
      serviceSpecificFields[serviceId].push(field);
    }
  });

  // Calculate total estimated time
  const totalEstimatedTime = serviceTemplates.reduce((total, template) => {
    return total + template.estimatedTimeMinutes;
  }, 0);

  return {
    unifiedFields,
    serviceSpecificFields,
    totalEstimatedTime
  };
}

/**
 * Suggest a unified value for a field used across multiple services
 */
function suggestUnifiedValue(field: any, serviceIds: string[]): any {
  // For now, return null - this could be enhanced with ML or business rules
  return null;
}

/**
 * Calculate confidence level for unified field suggestion
 */
function calculateConfidence(field: any, serviceIds: string[]): number {
  // Higher confidence for fields with consistent types and validation
  let confidence = 0.5; // Base confidence

  // Boost confidence for fields with validation rules
  if (field.validation) {
    confidence += 0.2;
  }

  // Boost confidence for fields used by more services
  confidence += Math.min(serviceIds.length * 0.1, 0.3);

  // Boost confidence for certain field types
  if (['select', 'radio'].includes(field.type)) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Generate optimized collection strategy
 */
export function generateCollectionStrategy(unifiedFields: FieldUnification[], serviceSpecificFields: Record<string, any[]>): {
  collectionOrder: string[];
  estimatedTimePerService: Record<string, number>;
  totalEstimatedTime: number;
  smartDefaults: Record<string, any>;
} {
  // Order services by complexity and dependencies
  const serviceIds = Object.keys(serviceSpecificFields);

  // Simple heuristic: services with more fields first, then alphabetical
  const sortedServices = serviceIds.sort((a, b) => {
    const aFields = serviceSpecificFields[a].length;
    const bFields = serviceSpecificFields[b].length;
    if (aFields !== bFields) {
      return bFields - aFields; // More fields first
    }
    return a.localeCompare(b);
  });

  // Calculate time estimates
  const estimatedTimePerService: Record<string, number> = {};
  let totalEstimatedTime = 0;

  sortedServices.forEach(serviceId => {
    const fields = serviceSpecificFields[serviceId];
    const unifiedCount = unifiedFields.filter(uf =>
      uf.usedByServices.includes(serviceId)
    ).length;

    // Estimate: 30 seconds per field + 1 minute base per service
    const timeEstimate = Math.max(60, (fields.length + unifiedCount) * 30);
    estimatedTimePerService[serviceId] = timeEstimate;
    totalEstimatedTime += timeEstimate;
  });

  // Generate smart defaults based on unified fields
  const smartDefaults: Record<string, any> = {};
  unifiedFields.forEach(field => {
    if (field.suggestedValue) {
      smartDefaults[field.fieldId] = field.suggestedValue;
    }
  });

  return {
    collectionOrder: sortedServices,
    estimatedTimePerService,
    totalEstimatedTime,
    smartDefaults
  };
}

/**
 * Check if a service has all required data collected
 */
export function isServiceComplete(serviceId: string, collectedData: Record<string, any>): boolean {
  const template = getRequirementsTemplate(serviceId);
  if (!template) return false;

  return template.sections.every(section =>
    section.fields.every(field => {
      if (!field.required) return true;

      const value = collectedData[field.id];
      return value !== undefined && value !== null && value !== '';
    })
  );
}

/**
 * Get completion status for all services
 */
export function getServiceCompletionStatus(purchasedServices: string[], collectedData: Record<string, Record<string, any>>): {
  completed: string[];
  incomplete: string[];
  completionPercentage: number;
} {
  const completed: string[] = [];
  const incomplete: string[] = [];

  purchasedServices.forEach(serviceId => {
    if (isServiceComplete(serviceId, collectedData[serviceId] || {})) {
      completed.push(serviceId);
    } else {
      incomplete.push(serviceId);
    }
  });

  const completionPercentage = purchasedServices.length > 0
    ? (completed.length / purchasedServices.length) * 100
    : 0;

  return {
    completed,
    incomplete,
    completionPercentage: Math.round(completionPercentage)
  };
}
