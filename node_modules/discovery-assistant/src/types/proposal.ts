// Proposal & Service Types for dynamic price quotation
import { AiProposalDoc } from '../schemas/aiProposal.schema';

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
  customDuration?: number; // user can edit estimated days
  customDescription?: string; // user can edit
  customDescriptionHe?: string;
  customNameHe?: string; // user can edit service name
  notes?: string; // additional notes per service
  manuallyAdded?: boolean; // true if service was manually added by user
}

export interface ProposalSummary {
  totalServices: number;
  totalAutomations: number;
  totalAIAgents: number;
  totalIntegrations: number;
  identifiedProcesses: number;
  potentialMonthlySavings: number;
  potentialWeeklySavingsHours: number;
  totalPrice: number;
  totalDays: number;
}

export interface ProposalData {
  meetingId: string;
  generatedAt: Date;
  summary: ProposalSummary;
  proposedServices: ProposedService[];
  selectedServices: SelectedService[]; // Services selected for proposal
  purchasedServices?: SelectedService[]; // Services actually purchased by client
  totalPrice: number; // מחיר כולל ללא מע"מ
  totalPriceWithVat: number; // מחיר כולל עם מע"מ
  totalDays: number;
  expectedROIMonths: number;
  monthlySavings: number;
  customNotes?: string;
  pmNote?: string; // הערת מנהל פרויקט

  // AI-generated proposal fields
  aiProposal?: {
    createdAt: string;
    model?: string;
    status: 'generating' | 'success' | 'failed';
    sections?: AiProposalDoc; // matches schema
    rawMarkdown?: string;
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
    instructions?: string; // last additional instructions used
  };

  // Optional history for regeneration tracking
  aiProposalHistory?: Array<Pick<ProposalData['aiProposal'], 'createdAt' | 'sections' | 'instructions'>>;

  // הנחות ומחירים מיוחדים
  discountPercentage?: number; // אחוז הנחה על המחיר הבסיסי
  discountedPrice?: number; // מחיר לאחר הנחה (ללא מע"מ)
  finalPriceWithVat?: number; // מחיר סופי עם מע"מ לאחר הנחה

  // Client approval fields
  approvalSignature?: string; // Base64 image data
  approvedBy?: string; // Client name
  approvedAt?: string; // ISO timestamp
  approvalNotes?: string; // Additional client notes
  rejectionFeedback?: string; // Feedback if rejected
  rejectedAt?: string; // ISO timestamp

  // Proposal sent tracking (for Discovery_Status workflow)
  proposalSent?: boolean; // True when proposal downloaded/sent
  proposalSentAt?: string; // ISO timestamp when proposal was sent
}

export interface ProposalExport {
  format: 'pdf' | 'email' | 'zoho';
  data: ProposalData;
  clientInfo: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
}

// Company Branding Configuration
export interface CompanyBranding {
  companyName: string;
  companyNameHe: string;
  logoPath: string; // path to logo file
  address: string;
  phone: string;
  email: string;
  website: string;
  signaturePath: string; // path to signature image
  signerName: string;
  signerTitle: string;
  // Payment terms
  paymentTerms: string;
  paymentTermsHe: string;
  proposalValidity: number; // days
  warrantyPeriod?: number; // months (optional)
  // Colors
  primaryColor?: string; // hex color
  secondaryColor?: string;
}
