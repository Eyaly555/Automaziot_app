/**
 * טיפוסים עבור גרסת מובייל
 */

export interface MobileFormData {
  ai_agents: AIAgentsData;
  automations: AutomationsData;
  crm: CRMData;
}

export interface AIAgentsData {
  count: '1' | '2' | '3+';
  channels: string[];
  other_channel?: string;
  domains: string[];
  notes?: string;
}

export interface AutomationsData {
  processes: string[];
  time_wasted: 'under_1h' | '1-2h' | '3-4h' | 'over_4h';
  biggest_pain: 'things_fall' | 'human_errors' | 'takes_time' | 'no_tracking' | 'other';
  biggest_pain_other?: string;
  most_important_process: string;
}

export interface CRMData {
  exists: 'yes' | 'no' | 'not_sure';
  system?: 'zoho' | 'salesforce' | 'hubspot' | 'monday' | 'pipedrive' | 'other';
  other_system?: string;
  integrations?: string[];
  data_quality: 'clean' | 'ok' | 'messy' | 'no_crm';
  users?: '1-3' | '4-10' | '11-20' | '20+';
  biggest_gap?: 'no_automation' | 'not_connected' | 'hard_to_use' | 'no_reports' | 'no_system' | 'other';
  biggest_gap_other?: string;
  missing_report?: string;
}

export interface MobileValidationResult {
  isValid: boolean;
  errors: string[];
}

export type MobileSectionType = 'ai' | 'automation' | 'crm';

