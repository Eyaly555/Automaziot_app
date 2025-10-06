import { CompanyBranding } from '../types/proposal';

/**
 * Company Branding Configuration for Automaziot AI
 * Used in PDF generation, emails, and proposals
 */
export const COMPANY_BRANDING: CompanyBranding = {
  companyName: 'Automaziot AI',
  companyNameHe: 'אוטומציות AI',
  logoPath: '/logo1.svg', // Using SVG for better quality
  address: 'נצח ישראל 3, תל אביב',
  phone: '052-957-4200',
  email: 'info@automaziot.ai',
  website: 'www.automaziot.ai',
  signaturePath: '/Signature.jpg',
  signerName: 'אייל יעקבי מילר',
  signerTitle: 'מנכ"ל ומייסד',

  // Payment terms
  paymentTerms: '50% upfront, 50% upon completion',
  paymentTermsHe: '50% מקדמה, 50% עם השלמה',
  proposalValidity: 7, // days
  warrantyPeriod: undefined, // No warranty period included

  // Brand colors (from website)
  primaryColor: '#00D4D4', // Cyan from logo
  secondaryColor: '#1E3A5F', // Dark blue from logo
};
