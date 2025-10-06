import { TDocumentDefinitions, Content, ContentTable, StyleDictionary, PageBreak } from 'pdfmake/interfaces';
import { SelectedService, ProposalData } from '../types/proposal';
import { COMPANY_BRANDING } from '../config/companyBranding';

/**
 * Professional Proposal PDF Generator for Automaziot AI
 * Creates a comprehensive, Hebrew-language proposal with branding using pdfMake
 * Uses lazy-loaded fonts to avoid bloating the bundle
 */

interface ProposalPDFOptions {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
}

// Lazy load pdfMake to avoid bundling fonts upfront
const getPdfMake = async () => {
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  // Configure fonts
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

  return pdfMake;
};

export const generateProposalPDF = async (
  options: ProposalPDFOptions
): Promise<Blob> => {
  const { clientName, clientCompany, services, proposalData } = options;

  // Load images as base64
  const logoBase64 = await loadImageAsBase64(COMPANY_BRANDING.logoPath);
  const signatureBase64 = await loadImageAsBase64(COMPANY_BRANDING.signaturePath);

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + COMPANY_BRANDING.proposalValidity);

  // Define document content
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    // Default styles for RTL Hebrew
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      alignment: 'right',
    },

    content: [
      // ==================== PAGE 1: HEADER & EXECUTIVE SUMMARY ====================

      // Header with logo and company info
      {
        columns: [
          {
            width: 'auto',
            stack: [
              { text: COMPANY_BRANDING.companyNameHe, style: 'companyName' },
              { text: COMPANY_BRANDING.address, style: 'companyInfo', margin: [0, 3, 0, 0] },
              { text: `טלפון: ${COMPANY_BRANDING.phone}`, style: 'companyInfo' },
              { text: `אימייל: ${COMPANY_BRANDING.email}`, style: 'companyInfo' },
            ],
          },
          {
            width: '*',
            text: '',
          },
          logoBase64
            ? {
                width: 80,
                image: logoBase64,
                fit: [80, 40],
                alignment: 'left',
              }
            : { width: 80, text: '' },
        ],
        margin: [0, 0, 0, 20],
      },

      // Divider
      {
        canvas: [
          {
            type: 'line' as const,
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 2,
            lineColor: COMPANY_BRANDING.primaryColor,
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Title
      { text: 'הצעת מחיר', style: 'title', alignment: 'center', margin: [0, 0, 0, 20] },

      // Client details box
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: `הצעת מחיר ל: ${clientName}`, style: 'clientInfo', bold: true },
                  clientCompany ? { text: `חברה: ${clientCompany}`, style: 'clientInfo' } : {},
                  { text: `תאריך: ${formatHebrewDate(today)}`, style: 'clientInfo', margin: [0, 5, 0, 0] },
                  { text: `תוקף: עד ${formatHebrewDate(validUntil)} (${COMPANY_BRANDING.proposalValidity} ימים)`, style: 'clientInfo' },
                ],
                fillColor: '#EEF2FF',
                margin: 10,
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20],
      },

      // Executive Summary
      { text: 'תקציר מנהלים', style: 'sectionHeader', margin: [0, 10, 0, 10] },
      {
        text: buildExecutiveSummary(proposalData),
        style: 'body',
        margin: [0, 0, 0, 20],
      },

      // ==================== PAGE 2: SERVICES TABLE ====================

      { text: 'פירוט שירותים', style: 'sectionHeader', pageBreak: 'before' as PageBreak, margin: [0, 0, 0, 15] },

      // Services table
      {
        table: {
          headerRows: 1,
          widths: [30, '*', 60, 80],
          body: [
            [
              { text: '#', style: 'tableHeader', alignment: 'center' },
              { text: 'שירות', style: 'tableHeader' },
              { text: 'זמן יישום', style: 'tableHeader', alignment: 'center' },
              { text: 'מחיר', style: 'tableHeader', alignment: 'center' },
            ],
            ...services.map((service, index) => [
              { text: (index + 1).toString(), alignment: 'center' },
              { text: service.nameHe },
              { text: `${service.customDuration || service.estimatedDays} ימים`, alignment: 'center' },
              { text: formatPrice(service.customPrice || service.basePrice), alignment: 'center' },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? COMPANY_BRANDING.primaryColor : rowIndex % 2 === 0 ? '#F9FAFB' : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#E5E7EB',
          vLineColor: () => '#E5E7EB',
        },
        margin: [0, 0, 0, 20],
      } as ContentTable,

      // ==================== PAGE 3: SERVICE DETAILS ====================

      { text: 'פירוט מלא של השירותים', style: 'sectionHeader', pageBreak: 'before' as PageBreak, margin: [0, 0, 0, 15] },

      // Service details
      ...services.flatMap((service) => [
        { text: `🤖 ${service.nameHe}`, style: 'serviceTitle', margin: [0, 10, 0, 8] },
        { text: 'למה זה רלוונטי לך:', style: 'subsectionHeader', margin: [0, 0, 0, 5] },
        { text: service.reasonSuggestedHe, style: 'body', margin: [0, 0, 0, 8] },
        { text: 'מה זה כולל:', style: 'subsectionHeader', margin: [0, 0, 0, 5] },
        { text: service.descriptionHe, style: 'body', margin: [0, 0, 0, 8] },
        service.notes
          ? { text: `הערה: ${service.notes}`, style: 'notes', margin: [0, 0, 0, 8] }
          : {},
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    { text: `⏱️ זמן יישום: ${service.customDuration || service.estimatedDays} ימים`, style: 'serviceDetail' },
                    { text: `💰 השקעה: ${formatPrice(service.customPrice || service.basePrice)}`, style: 'serviceDetail' },
                  ],
                  fillColor: '#F5F5F5',
                  margin: 8,
                },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 15],
        },
      ]),

      // ==================== PAGE 4: FINANCIAL SUMMARY & ROI ====================

      { text: 'סיכום כספי ו-ROI', style: 'title', pageBreak: 'before' as PageBreak, alignment: 'center', margin: [0, 0, 0, 20] },

      // Summary box
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: `סה"כ שירותים: ${proposalData.summary.totalServices}`, style: 'summaryText' },
                  { text: `זמן יישום כולל: ${proposalData.totalDays} ימי עבודה`, style: 'summaryText' },
                  {
                    canvas: [{ type: 'line' as const, x1: 0, y1: 0, x2: 400, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }],
                    margin: [0, 8, 0, 8],
                  },
                  { text: `סה"כ השקעה: ${formatPrice(proposalData.totalPrice)}`, style: 'totalPrice' },
                  ...(proposalData.monthlySavings > 0
                    ? [
                        {
                          canvas: [{ type: 'line' as const, x1: 0, y1: 0, x2: 400, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }],
                          margin: [0, 8, 0, 8],
                        },
                        { text: `💰 חיסכון חודשי צפוי: ${formatPrice(proposalData.monthlySavings)}`, style: 'summaryText' },
                        { text: `📊 החזר השקעה (ROI): ${proposalData.expectedROIMonths} חודשים`, style: 'summaryText' },
                      ]
                    : []),
                ],
                fillColor: '#EEF2FF',
                margin: 15,
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 2,
          vLineWidth: () => 2,
          hLineColor: () => COMPANY_BRANDING.primaryColor,
          vLineColor: () => COMPANY_BRANDING.primaryColor,
        },
        margin: [0, 0, 0, 20],
      },

      // Annual savings highlight (if ROI data exists)
      ...(proposalData.monthlySavings > 0
        ? [
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: `🎯 חיסכון שנתי צפוי: ${formatPrice(proposalData.monthlySavings * 12)}`,
                      style: 'highlight',
                      alignment: 'center',
                      color: 'white',
                      fillColor: COMPANY_BRANDING.primaryColor,
                      margin: 10,
                    },
                  ],
                ],
              },
              layout: 'noBorders',
              margin: [0, 0, 0, 20],
            },
          ]
        : []),

      // Value proposition
      { text: '💎 למה כדאי לך לעבוד איתנו?', style: 'sectionHeader', margin: [0, 10, 0, 10] },
      {
        ul: buildBenefitsList(proposalData),
        style: 'body',
        margin: [0, 0, 0, 20],
      },

      // ==================== PAGE 5: TERMS & TIMELINE ====================

      { text: 'תנאים ולוח זמנים', style: 'sectionHeader', pageBreak: 'before' as PageBreak, margin: [0, 0, 0, 15] },

      { text: '💳 תנאי תשלום:', style: 'subsectionHeader', margin: [0, 10, 0, 5] },
      { text: `• ${COMPANY_BRANDING.paymentTermsHe}`, style: 'body', margin: [0, 0, 0, 15] },

      { text: '⏱️ לוח זמנים משוער:', style: 'subsectionHeader', margin: [0, 0, 0, 5] },
      {
        ul: [
          `משך הפרויקט: ${Math.ceil(proposalData.totalDays / 5)} שבועות (${proposalData.totalDays} ימי עבודה)`,
          'עדכוני סטטוס שבועיים',
          'מעקב צמוד ושקיפות מלאה',
        ],
        style: 'body',
        margin: [0, 0, 0, 15],
      },

      { text: '📞 תמיכה:', style: 'subsectionHeader', margin: [0, 0, 0, 5] },
      {
        ul: ['זמינה בשעות העבודה', 'תגובה תוך 24 שעות'],
        style: 'body',
        margin: [0, 0, 0, 15],
      },

      { text: '📋 תנאים נוספים:', style: 'subsectionHeader', margin: [0, 0, 0, 5] },
      {
        ul: [
          `ההצעה תקפה ל-${COMPANY_BRANDING.proposalValidity} ימים מתאריך שליחה`,
          'זכויות יוצרים על הקוד והפתרונות שפותחו שייכים ללקוח',
          'ביטול ההזמנה לאחר תחילת העבודה כרוך בחיוב יחסי',
        ],
        style: 'notes',
        margin: [0, 0, 0, 20],
      },

      // ==================== PAGE 6: NEXT STEPS & SIGNATURE ====================

      { text: '🚀 השלב הבא', style: 'title', pageBreak: 'before' as PageBreak, alignment: 'center', margin: [0, 0, 0, 20] },

      {
        ol: [
          'סקירת ההצעה ושאלות הבהרה',
          'תיאום פגישת קיק-אוף',
          'חתימה על הסכם',
          'תשלום מקדמה',
          'התחלת העבודה!',
        ],
        style: 'body',
        margin: [0, 0, 0, 20],
      },

      // Contact box
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: 'מוכנים להתחיל? בואו נדבר:', style: 'contactHeader', alignment: 'center' },
                  { text: `📞 ${COMPANY_BRANDING.phone}`, style: 'contactInfo', alignment: 'center', margin: [0, 5, 0, 0] },
                  { text: `📧 ${COMPANY_BRANDING.email}`, style: 'contactInfo', alignment: 'center' },
                  { text: `🌐 ${COMPANY_BRANDING.website}`, style: 'contactInfo', alignment: 'center' },
                ],
                fillColor: '#EEF2FF',
                margin: 15,
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 2,
          vLineWidth: () => 2,
          hLineColor: () => COMPANY_BRANDING.primaryColor,
          vLineColor: () => COMPANY_BRANDING.primaryColor,
        },
        margin: [0, 0, 0, 30],
      },

      // Divider
      {
        canvas: [
          {
            type: 'line' as const,
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 0.5,
            lineColor: '#CCCCCC',
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Signature section
      {
        columns: [
          {
            width: '*',
            text: formatHebrewDate(today),
            style: 'signatureText',
            alignment: 'left',
          },
          signatureBase64
            ? {
                width: 100,
                image: signatureBase64,
                fit: [80, 40],
                alignment: 'right',
                margin: [0, -20, 0, 0],
              }
            : { width: 100, text: '' },
          {
            width: 'auto',
            stack: [
              { text: COMPANY_BRANDING.signerName, style: 'signatureName', alignment: 'right' },
              {
                text: `${COMPANY_BRANDING.signerTitle}, ${COMPANY_BRANDING.companyNameHe}`,
                style: 'signatureTitle',
                alignment: 'right',
              },
            ],
          },
        ],
      },
    ],

    // Styles definition
    styles: {
      companyName: {
        fontSize: 12,
        bold: true,
        color: COMPANY_BRANDING.secondaryColor,
      },
      companyInfo: {
        fontSize: 8,
        color: '#666666',
      },
      title: {
        fontSize: 24,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: COMPANY_BRANDING.secondaryColor,
      },
      subsectionHeader: {
        fontSize: 11,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
      },
      serviceTitle: {
        fontSize: 13,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
      },
      clientInfo: {
        fontSize: 11,
      },
      body: {
        fontSize: 10,
      },
      notes: {
        fontSize: 9,
        italics: true,
        color: '#666666',
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'white',
      },
      serviceDetail: {
        fontSize: 10,
      },
      summaryText: {
        fontSize: 12,
        margin: [0, 3, 0, 3],
      },
      totalPrice: {
        fontSize: 16,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
      },
      highlight: {
        fontSize: 16,
        bold: true,
      },
      contactHeader: {
        fontSize: 14,
        bold: true,
        color: COMPANY_BRANDING.secondaryColor,
      },
      contactInfo: {
        fontSize: 11,
      },
      signatureName: {
        fontSize: 11,
      },
      signatureTitle: {
        fontSize: 9,
        color: '#666666',
      },
      signatureText: {
        fontSize: 10,
      },
    } as StyleDictionary,
  };

  // Generate PDF and return as Blob
  const pdfMake = await getPdfMake();

  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Build executive summary text
 */
const buildExecutiveSummary = (proposalData: ProposalData): string => {
  let summary = `לאחר ניתוח מעמיק של תהליכי העבודה שלכם, זיהינו ${proposalData.summary.totalServices} פתרונות אוטומציה ו-AI. ההשקעה הכוללת: ${formatPrice(proposalData.totalPrice)}`;

  if (proposalData.monthlySavings > 0) {
    summary += `, שיחסכו לכם ${formatPrice(proposalData.monthlySavings)} בחודש עם החזר השקעה תוך ${proposalData.expectedROIMonths} חודשים`;
  }

  summary += '.';
  return summary;
};

/**
 * Build benefits list
 */
const buildBenefitsList = (proposalData: ProposalData): string[] => {
  const benefits = [
    'פתרון מותאם במדויק לצרכים שלך',
    ...(proposalData.monthlySavings > 0 ? ['ROI מוכח ומדיד'] : []),
    `יישום מהיר - תוצאות תוך ${proposalData.totalDays} ימים`,
    'תמיכה מלאה לאורך כל הדרך',
    'טכנולוגיה מתקדמת של AI ואוטומציה',
  ];

  return benefits;
};

/**
 * Format price in Hebrew currency (ILS)
 */
const formatPrice = (price: number): string => {
  return `₪${price.toLocaleString('he-IL')}`;
};

/**
 * Format date in Hebrew format
 */
const formatHebrewDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Load image from path and convert to base64
 */
const loadImageAsBase64 = async (imagePath: string): Promise<string | null> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to load image: ${imagePath}`, error);
    return null;
  }
};
