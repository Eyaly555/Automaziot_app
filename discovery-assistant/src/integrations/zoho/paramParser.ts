import { Meeting } from '../../types';

export interface ZohoParams {
  zohoRecordId: string;
  companyName: string;
  email?: string;
  phone?: string;
  budgetRange?: string;
  requestedServices?: string;
  additionalNotes?: string;
}

export const parseZohoParams = (search: string): ZohoParams | null => {
  const urlParams = new URLSearchParams(search);
  const recordId = urlParams.get('zohoRecordId');

  if (!recordId) return null;

  return {
    zohoRecordId: recordId,
    companyName: urlParams.get('companyName') || '',
    email: urlParams.get('email') || undefined,
    phone: urlParams.get('phone') || undefined,
    budgetRange: urlParams.get('budgetRange') || undefined,
    requestedServices: urlParams.get('requestedServices') || undefined,
    additionalNotes: urlParams.get('additionalNotes') || undefined,
  };
};

export const mapZohoToMeeting = (params: ZohoParams): Partial<Meeting> => {
  return {
    clientName: params.companyName,
    notes: params.additionalNotes,
    zohoIntegration: {
      recordId: params.zohoRecordId,
      module: 'Potentials1',
      contactInfo: {
        email: params.email,
        phone: params.phone,
      },
    },
    modules: {
      overview: {
        businessType: params.companyName,
        budget: params.budgetRange,
        mainGoals: params.requestedServices?.split(',').map((s) => s.trim()),
      },
      leadsAndSales: {},
      customerService: {},
      operations: {},
      reporting: {},
      aiAgents: {},
      systems: {},
      roi: {},
      planning: {},
    },
  };
};
