// Service Requirements Types - for gathering detailed specifications for each selected service

export type RequirementFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'list' // Dynamic list of items
  | 'conditional'; // Shows based on previous answers

export interface RequirementField {
  id: string;
  type: RequirementFieldType;
  label: string;
  labelHe: string;
  description?: string;
  descriptionHe?: string;
  placeholder?: string;
  placeholderHe?: string;
  required: boolean;
  options?: Array<{ value: string; label: string; labelHe: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    messageHe?: string;
  };
  dependsOn?: {
    fieldId: string;
    value: string | string[];
  };
  helperText?: string;
  helperTextHe?: string;
  examples?: string[];
  examplesHe?: string[];
  rows?: number; // Number of rows for textarea fields
  itemFields?: RequirementField[]; // Sub-fields for list/array type fields
}

export interface RequirementSection {
  id: string;
  title: string;
  titleHe: string;
  description?: string;
  descriptionHe?: string;
  fields: RequirementField[];
  order: number;
}

export interface ServiceRequirementsTemplate {
  serviceId: string; // Matches serviceId from servicesDatabase
  serviceName: string;
  serviceNameHe: string;
  sections: RequirementSection[];
  estimatedTimeMinutes: number; // How long to fill this out
  tips?: string[];
  tipsHe?: string[];
}

export interface CollectedRequirements {
  serviceId: string;
  data: { [fieldId: string]: any };
  completedSections: string[];
  startedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface RequirementsGatheringSession {
  meetingId: string;
  selectedServices: string[]; // Array of service IDs
  requirements: CollectedRequirements[];
  currentServiceIndex: number;
  currentSectionIndex: number;
  overallProgress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}
