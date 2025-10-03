// Proposal & Service Types for dynamic price quotation

export type ServicePriority = 'primary' | 'secondary' | 'optional';

export type ServiceCategoryId =
  | 'automations'
  | 'ai_agents'
  | 'integrations'
  | 'system_implementation'
  | 'additional_services';

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  nameHe: string;
  priority: ServicePriority;
  icon: string; // emoji
  description: string;
  descriptionHe: string;
}

export interface ServiceItem {
  id: string;
  category: ServiceCategoryId;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  basePrice: number; // in ILS
  estimatedDays: number;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[]; // for filtering/matching
}

export interface ProposedService extends ServiceItem {
  reasonSuggested: string; // why this service is relevant
  reasonSuggestedHe: string;
  relevanceScore: number; // 1-10, how relevant based on data
  dataSource: string[]; // which modules influenced this suggestion
  relatedData?: any; // specific data points that triggered this
}

export interface SelectedService extends ProposedService {
  selected: boolean;
  customPrice?: number; // user can edit
  customDescription?: string; // user can edit
  customDescriptionHe?: string;
  notes?: string;
}

export interface ProposalSummary {
  totalServices: number;
  totalAutomations: number;
  totalAIAgents: number;
  totalIntegrations: number;
  identifiedProcesses: number;
  potentialMonthlySavings: number;
  potentialWeeklySavingsHours: number;
}

export interface ProposalData {
  meetingId: string;
  generatedAt: Date;
  summary: ProposalSummary;
  proposedServices: ProposedService[];
  selectedServices: SelectedService[];
  totalPrice: number;
  totalDays: number;
  expectedROIMonths: number;
  monthlySavings: number;
  customNotes?: string;

  // Client approval fields
  approvalSignature?: string; // Base64 image data
  approvedBy?: string; // Client name
  approvedAt?: string; // ISO timestamp
  approvalNotes?: string; // Additional client notes
  rejectionFeedback?: string; // Feedback if rejected
  rejectedAt?: string; // ISO timestamp
}

export interface ProposalExport {
  format: 'pdf' | 'email' | 'zoho';
  data: ProposalData;
  clientInfo: {
    name: string;
    company?: string;
    email?: string;
  };
}
