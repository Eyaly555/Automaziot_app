/**
 * Field Registry Type Definitions
 * 
 * Defines the structure for the central field registry that tracks
 * all fields across Phase 1, Phase 2, and Phase 3 of the discovery process.
 */

export type Phase = 'phase1' | 'phase2' | 'phase3';

export type FieldType = 
  | 'text'
  | 'number'
  | 'email'
  | 'url'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'array'
  | 'object'
  | 'custom';

export type FieldCategory =
  | 'crm'
  | 'email'
  | 'forms'
  | 'systems'
  | 'authentication'
  | 'integration'
  | 'ai'
  | 'workflow'
  | 'business'
  | 'technical'
  | 'other';

/**
 * Transformation function to convert field value from one format to another
 */
export interface FieldTransformation {
  id: string;
  name: string;
  description: string;
  transform: (value: any, context?: any) => any;
  validate?: (value: any) => boolean;
}

/**
 * Defines where a field value is stored in the meeting data structure
 */
export interface FieldLocation {
  path: string; // JSON path, e.g., 'modules.overview.crmName'
  phase: Phase;
  module?: string; // Module name for Phase 1, service ID for Phase 2
  description: string;
}

/**
 * Core field definition in the registry
 */
export interface RegistryField {
  // Identification
  id: string; // Unique identifier, e.g., 'crm_system'
  
  // Display
  label: {
    he: string;
    en: string;
  };
  placeholder?: {
    he?: string;
    en?: string;
  };
  description?: {
    he?: string;
    en?: string;
  };
  
  // Field configuration
  type: FieldType;
  category: FieldCategory;
  
  // Cross-phase tracking
  collectedIn: Phase[]; // Phases where this field is collected
  usedBy: string[]; // Service IDs or module names that use this field
  
  // Data sources
  primarySource: FieldLocation; // Primary location where field is first collected
  secondarySources: FieldLocation[]; // Other locations where this field appears
  
  // Auto-population settings
  autoPopulate: boolean; // Should this field auto-populate from primary source?
  syncBidirectional: boolean; // Should changes update all locations?
  
  // Transformations
  transformations?: FieldTransformation[]; // How to transform value between locations
  
  // Validation
  required?: boolean;
  validation?: {
    pattern?: string | RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean;
  };
  
  // Options for select/multiselect fields
  options?: Array<{
    value: string;
    label: { he: string; en: string };
  }>;
  
  // Metadata
  importance: 'critical' | 'high' | 'medium' | 'low';
  businessContext?: string; // Why this field matters for the business
  technicalContext?: string; // How this field is used technically
}

/**
 * Field mapping between two locations
 */
export interface FieldMapping {
  sourceField: string; // Field ID in registry
  targetField: string; // Field ID in registry
  sourceLocation: FieldLocation;
  targetLocation: FieldLocation;
  transformation?: FieldTransformation;
  confidence: number; // 0-1, how confident we are in this mapping
}

/**
 * Field conflict when same field has different values in different locations
 */
export interface FieldConflict {
  fieldId: string;
  locations: Array<{
    location: FieldLocation;
    value: any;
    lastModified?: Date;
  }>;
  suggestedResolution: 'use_primary' | 'use_latest' | 'manual';
  primaryLocation: FieldLocation;
}

/**
 * Result of field pre-population
 */
export interface PrePopulationResult {
  fieldId: string;
  populated: boolean;
  source?: FieldLocation;
  value?: any;
  confidence: number;
  message?: string;
}

/**
 * Context for field operations
 */
export interface FieldContext {
  meeting: any; // Current meeting object
  phase: Phase;
  serviceId?: string; // Current service ID (Phase 2)
  moduleId?: string; // Current module ID (Phase 1)
  language: 'he' | 'en';
}

/**
 * Field registry query options
 */
export interface FieldQueryOptions {
  category?: FieldCategory;
  phase?: Phase;
  usedByService?: string;
  usedByModule?: string;
  autoPopulate?: boolean;
  importance?: RegistryField['importance'];
}

/**
 * Smart field hook configuration
 */
export interface SmartFieldConfig {
  fieldId: string; // ID from field registry
  localPath: string; // Local state path in component
  serviceId?: string; // Service ID (Phase 2)
  moduleId?: string; // Module ID (Phase 1)
  onConflict?: (conflict: FieldConflict) => void;
  autoSave?: boolean; // Auto-save changes to meeting store
  readOnly?: boolean; // Field is read-only (just display)
}

/**
 * Smart field return value
 */
export interface SmartFieldValue<T = any> {
  value: T;
  setValue: (value: T) => void;
  isAutoPopulated: boolean;
  source?: FieldLocation;
  hasConflict: boolean;
  conflict?: FieldConflict;
  isLoading: boolean;
  error?: string;
  metadata: {
    fieldId: string;
    label: { he: string; en: string };
    description?: { he?: string; en?: string };
    type: FieldType;
    required?: boolean;
  };
}

