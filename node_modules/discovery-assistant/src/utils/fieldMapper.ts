/**
 * Field Mapper Utility
 *
 * Handles cross-phase field mapping, value extraction, and data pre-population.
 * Connects Phase 1 → Phase 2 → Phase 3 data flows.
 */

import { Meeting } from '../types';
import {
  RegistryField,
  FieldLocation,
  FieldConflict,
  PrePopulationResult,
} from '../types/fieldRegistry';
import { getFieldById, FIELD_REGISTRY } from '../config/fieldRegistry';

/**
 * Get nested property value from object using dot notation path
 */
function get(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Set nested property value in object using dot notation path
 */
function set(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (current[key] === undefined) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
}

/**
 * Extract value from meeting data using JSON path
 */
export function extractFieldValue(
  meeting: Meeting | null,
  location: FieldLocation
): any {
  if (!meeting) return undefined;

  try {
    // Handle array paths with filters (e.g., "array[].property")
    if (location.path.includes('[]')) {
      return extractFromArrayPath(meeting, location.path);
    }

    // Simple path extraction
    return get(meeting, location.path);
  } catch (error) {
    console.warn(
      `[FieldMapper] Failed to extract value from path: ${location.path}`,
      error
    );
    return undefined;
  }
}

/**
 * Extract value from array path (e.g., "modules.leadsAndSales.leadSources[].volumePerMonth")
 * Returns the first matching value or array of values
 */
function extractFromArrayPath(meeting: Meeting, path: string): any {
  const parts = path.split('[]');

  if (parts.length === 1) {
    return get(meeting, path);
  }

  // Get array portion
  const arrayPath = parts[0];
  const array = get(meeting, arrayPath);

  if (!Array.isArray(array) || array.length === 0) {
    return undefined;
  }

  // Get property from array items
  const propertyPath = parts[1].startsWith('.')
    ? parts[1].substring(1)
    : parts[1];

  if (!propertyPath) {
    // Return the array itself
    return array;
  }

  // Extract property from each item
  const values = array
    .map((item) => get(item, propertyPath))
    .filter((val) => val !== undefined && val !== null && val !== '');

  // Return first value for single-value fields, or sum for numbers
  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];

  // If all values are numbers, return sum (useful for volume calculations)
  if (values.every((v) => typeof v === 'number')) {
    return values.reduce((sum, val) => sum + val, 0);
  }

  // Return first non-empty value
  return values[0];
}

/**
 * Set value in meeting data using JSON path
 */
export function setFieldValue(
  meeting: Meeting,
  location: FieldLocation,
  value: any
): Meeting {
  try {
    // Create a deep clone to avoid mutations
    const updated = JSON.parse(JSON.stringify(meeting));

    // Handle array paths
    if (location.path.includes('[]')) {
      console.warn(
        `[FieldMapper] Cannot set value on array path: ${location.path}`
      );
      return meeting;
    }

    // Set the value
    set(updated, location.path, value);

    return updated;
  } catch (error) {
    console.error(
      `[FieldMapper] Failed to set value at path: ${location.path}`,
      error
    );
    return meeting;
  }
}

/**
 * Pre-populate a field from its primary source
 */
export function prePopulateField(
  meeting: Meeting | null,
  fieldId: string
): PrePopulationResult {
  const field = getFieldById(fieldId);

  if (!field) {
    return {
      fieldId,
      populated: false,
      confidence: 0,
      message: 'Field not found in registry',
    };
  }

  if (!field.autoPopulate) {
    return {
      fieldId,
      populated: false,
      confidence: 0,
      message: 'Field is not configured for auto-population',
    };
  }

  if (!meeting) {
    return {
      fieldId,
      populated: false,
      confidence: 0,
      message: 'No meeting data available',
    };
  }

  // Try to extract from primary source
  const value = extractFieldValue(meeting, field.primarySource);

  if (value !== undefined && value !== null && value !== '') {
    return {
      fieldId,
      populated: true,
      source: field.primarySource,
      value,
      confidence: 1.0,
      message: 'Populated from primary source',
    };
  }

  // Try secondary sources
  for (const secondarySource of field.secondarySources) {
    const secondaryValue = extractFieldValue(meeting, secondarySource);

    if (
      secondaryValue !== undefined &&
      secondaryValue !== null &&
      secondaryValue !== ''
    ) {
      return {
        fieldId,
        populated: true,
        source: secondarySource,
        value: secondaryValue,
        confidence: 0.8,
        message: 'Populated from secondary source',
      };
    }
  }

  return {
    fieldId,
    populated: false,
    confidence: 0,
    message: 'No data available in any source',
  };
}

/**
 * Pre-populate multiple fields for a service
 */
export function prePopulateServiceFields(
  meeting: Meeting | null,
  serviceId: string
): Record<string, PrePopulationResult> {
  const results: Record<string, PrePopulationResult> = {};

  // Get all fields for this service
  const fields = Object.values(FIELD_REGISTRY).filter(
    (field) => field.usedBy.includes(serviceId) && field.autoPopulate
  );

  // Pre-populate each field
  for (const field of fields) {
    results[field.id] = prePopulateField(meeting, field.id);
  }

  return results;
}

/**
 * Detect conflicts for a field across all its locations
 */
export function detectFieldConflicts(
  meeting: Meeting | null,
  fieldId: string
): FieldConflict | null {
  const field = getFieldById(fieldId);

  if (!field || !meeting) {
    return null;
  }

  const locations: FieldConflict['locations'] = [];

  // Extract from primary source
  const primaryValue = extractFieldValue(meeting, field.primarySource);
  if (
    primaryValue !== undefined &&
    primaryValue !== null &&
    primaryValue !== ''
  ) {
    locations.push({
      location: field.primarySource,
      value: primaryValue,
    });
  }

  // Extract from secondary sources
  for (const secondarySource of field.secondarySources) {
    const secondaryValue = extractFieldValue(meeting, secondarySource);
    if (
      secondaryValue !== undefined &&
      secondaryValue !== null &&
      secondaryValue !== ''
    ) {
      locations.push({
        location: secondarySource,
        value: secondaryValue,
      });
    }
  }

  // Check if there are conflicts (different values)
  if (locations.length <= 1) {
    return null; // No conflict if only one value
  }

  const uniqueValues = new Set(
    locations.map((loc) => JSON.stringify(loc.value))
  );
  if (uniqueValues.size === 1) {
    return null; // No conflict if all values are the same
  }

  // Conflict detected
  return {
    fieldId,
    locations,
    suggestedResolution: 'use_primary',
    primaryLocation: field.primarySource,
  };
}

/**
 * Sync field value across all locations (bidirectional sync)
 */
export function syncFieldValue(
  meeting: Meeting,
  fieldId: string,
  newValue: any
): Meeting {
  const field = getFieldById(fieldId);

  if (!field || !field.syncBidirectional) {
    return meeting;
  }

  let updated = { ...meeting };

  // Update primary source
  updated = setFieldValue(updated, field.primarySource, newValue);

  // Update secondary sources
  for (const secondarySource of field.secondarySources) {
    updated = setFieldValue(updated, secondarySource, newValue);
  }

  return updated;
}

/**
 * Get smart field recommendations for a service
 * Identifies which fields can be auto-populated and which need manual entry
 */
export function getFieldRecommendations(
  meeting: Meeting | null,
  serviceId: string
): {
  autoPopulated: string[];
  needsManualEntry: string[];
  hasConflicts: string[];
} {
  const serviceFields = Object.values(FIELD_REGISTRY).filter((field) =>
    field.usedBy.includes(serviceId)
  );

  const autoPopulated: string[] = [];
  const needsManualEntry: string[] = [];
  const hasConflicts: string[] = [];

  for (const field of serviceFields) {
    const result = prePopulateField(meeting, field.id);
    const conflict = detectFieldConflicts(meeting, field.id);

    if (conflict) {
      hasConflicts.push(field.id);
    } else if (result.populated) {
      autoPopulated.push(field.id);
    } else {
      needsManualEntry.push(field.id);
    }
  }

  return {
    autoPopulated,
    needsManualEntry,
    hasConflicts,
  };
}

/**
 * Extract business context from Phase 1 for use in developer instructions
 */
export function extractBusinessContext(meeting: Meeting): {
  industry?: string;
  employees?: number;
  mainChallenge?: string;
  monthlyLeadVolume?: number;
  crmSystem?: string;
  currentResponseTime?: string;
  painPoints?: string[];
} {
  return {
    industry: meeting.modules?.overview?.industry,
    employees: meeting.modules?.operations?.hr?.employeeCount,
    mainChallenge: meeting.modules?.overview?.mainChallenge,
    monthlyLeadVolume: meeting.modules?.leadsAndSales?.leadVolume,
    crmSystem: meeting.modules?.systems?.crmName,
    currentResponseTime:
      meeting.modules?.leadsAndSales?.speedToLead?.duringBusinessHours,
    painPoints: meeting.painPoints?.map((p) => p.description) || [],
  };
}

/**
 * Map field value between different formats (transformations)
 */
export function transformFieldValue(
  value: any,
  fromField: RegistryField,
  toField: RegistryField
): any {
  // If fields are the same type, no transformation needed
  if (fromField.type === toField.type) {
    return value;
  }

  // Handle type conversions
  switch (toField.type) {
    case 'text':
      return String(value);

    case 'number':
      return Number(value) || 0;

    case 'boolean':
      return Boolean(value);

    case 'array':
      return Array.isArray(value) ? value : [value];

    default:
      return value;
  }
}

/**
 * Validate field value against registry validation rules
 */
export function validateFieldValue(
  fieldId: string,
  value: any
): { valid: boolean; errors: string[] } {
  const field = getFieldById(fieldId);

  if (!field) {
    return { valid: false, errors: ['Field not found in registry'] };
  }

  const errors: string[] = [];

  // Check required
  if (
    field.required &&
    (value === undefined || value === null || value === '')
  ) {
    errors.push(`${field.label.en} is required`);
  }

  // Skip validation if value is empty and not required
  if (
    !field.required &&
    (value === undefined || value === null || value === '')
  ) {
    return { valid: true, errors: [] };
  }

  // Validate based on type and rules
  if (field.validation) {
    const { pattern, min, max, minLength, maxLength, custom } =
      field.validation;

    // Pattern validation
    if (pattern && typeof value === 'string') {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      if (!regex.test(value)) {
        errors.push(`${field.label.en} format is invalid`);
      }
    }

    // Number range validation
    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        errors.push(`${field.label.en} must be at least ${min}`);
      }
      if (max !== undefined && value > max) {
        errors.push(`${field.label.en} must be at most ${max}`);
      }
    }

    // String length validation
    if (typeof value === 'string') {
      if (minLength !== undefined && value.length < minLength) {
        errors.push(
          `${field.label.en} must be at least ${minLength} characters`
        );
      }
      if (maxLength !== undefined && value.length > maxLength) {
        errors.push(
          `${field.label.en} must be at most ${maxLength} characters`
        );
      }
    }

    // Custom validation
    if (custom && !custom(value)) {
      errors.push(`${field.label.en} failed custom validation`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
