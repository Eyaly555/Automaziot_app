import { CompanyBranding } from '../types/proposal';

/**
 * Company Branding Configuration for Automaziot AI
 * Used in PDF generation, emails, and proposals
 */
export const COMPANY_BRANDING: CompanyBranding = {
  companyName: 'Automaziot AI',
  companyNameHe: 'אוטומציות AI',
  logoPath: '/logo1.png', // Using PNG for PDF compatibility
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

/**
 * Trial Contract Terms - Exact text as specified
 * These terms replace the standard payment and validity terms for trial contracts
 */
export const TRIAL_CONTRACT_TERMS = {
  title: 'תנאי תשלום וניסוי:',
  terms: [
    'הלקוח אינו משלם כל סכום בשלב זה.',
    'המוצר יימסר ללקוח לתקופת ניסיון של חמישה ימי עסקים, כאשר המוצר מאוחסן ומופעל במערכות של חברת אוטומציות AI בלבד.',
    'בתום תקופת הניסיון, הלקוח יוכל לבחור אחת מהאפשרויות הבאות:',
    'לשלם את מלוא הסכום (100%) — ולאחר מכן חברת אוטומציות AI תבצע את ההטמעה וההפעלה של המוצר במערכות הלקוח.',
    'לוותר על ההמשך — ובמקרה זה המוצר לא יוטמע במערכות הלקוח והניסיון יסתיים ללא חיוב.',
    'התשלום מתבצע אך ורק לאחר סיום תקופת הניסיון בת חמישה ימי עסקים ממועד ההפעלה הראשונית של המוצר (ולא ממועד חתימת ההסכם).'
  ],
  highlightedText: 'חמישה ימי עסקים ממועד ההפעלה הראשונית של המוצר'
};