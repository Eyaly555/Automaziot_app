import { TDocumentDefinitions, Content, ContentTable, StyleDictionary, PageBreak } from 'pdfmake/interfaces';
import { SelectedService, ProposalData } from '../types/proposal';
import { COMPANY_BRANDING } from '../config/companyBranding';
import { processHebrewForPDF } from './hebrewBidi';
import { hebrewFontVfs, hasHebrewFonts } from './hebrewFonts';

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
  try {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule;

    // Configure VFS fonts - handle different module export structures
    const defaultVfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs || pdfFonts;

    if (!defaultVfs) {
      throw new Error('Failed to load font VFS from pdfmake/build/vfs_fonts');
    }

    // Merge Hebrew fonts into VFS if available
    const vfs = {
      ...defaultVfs,
      ...(hasHebrewFonts ? hebrewFontVfs : {}),
    };

    (pdfMake as any).vfs = vfs;

    // Debug: Log available fonts in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📚 Available fonts in VFS:', Object.keys(vfs).filter(k => k.endsWith('.ttf')));
      console.log('✡️  Hebrew fonts loaded:', hasHebrewFonts);
    }

    return pdfMake;
  } catch (error) {
    console.error('❌ Failed to load pdfMake:', error);
    throw new Error('PDF generation library failed to initialize');
  }
};

// Helper to process Hebrew text (applies BiDi reversal)
const h = (text: string): string => processHebrewForPDF(text);

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

  // Determine which font to use
  const fontName = hasHebrewFonts ? 'Rubik' : 'Roboto';
  const fontFiles = hasHebrewFonts
    ? {
        normal: 'Rubik-Regular.ttf',
        bold: 'Rubik-Bold.ttf',
        italics: 'Rubik-Italic.ttf',
        bolditalics: 'Rubik-BoldItalic.ttf',
      }
    : {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf',
      };

  // Define document content
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    // Font definitions - uses Rubik for Hebrew support if available
    fonts: {
      [fontName]: fontFiles,
    },

    // Default styles for RTL Hebrew
    defaultStyle: {
      font: fontName,
      fontSize: 10,
      alignment: 'right',
      lineHeight: 1.3,
    },

    content: [
      // ==================== PAGE 1: HEADER & EXECUTIVE SUMMARY ====================

      // Header with logo and company info (RTL layout: logo on right)
      {
        columns: [
          logoBase64
            ? {
                width: 100,
                image: logoBase64,
                fit: [100, 50],
                alignment: 'right',
              }
            : { width: 100, text: '' },
          {
            width: '*',
            text: '',
          },
          {
            width: 'auto',
            stack: [
              { text: h(COMPANY_BRANDING.companyNameHe), style: 'companyName', alignment: 'left' },
              { text: h(COMPANY_BRANDING.address), style: 'companyInfo', margin: [0, 4, 0, 0], alignment: 'left' },
              { text: h(`טלפון: ${COMPANY_BRANDING.phone}`), style: 'companyInfo', alignment: 'left' },
              { text: h(`אימייל: ${COMPANY_BRANDING.email}`), style: 'companyInfo', alignment: 'left' },
            ],
          },
        ],
        margin: [0, 0, 0, 25],
      },

      // Elegant divider with gradient effect
      {
        canvas: [
          {
            type: 'line' as const,
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 3,
            lineColor: COMPANY_BRANDING.primaryColor,
          },
        ],
        margin: [0, 0, 0, 30],
      },

      // Title with professional styling
      {
        stack: [
          { text: h('הצעת מחיר'), style: 'title', alignment: 'center' },
          {
            text: h('פתרונות אוטומציה ובינה מלאכותית מותאמים אישית'),
            fontSize: 11,
            alignment: 'center',
            color: '#666666',
            margin: [0, 5, 0, 0],
          },
        ],
        margin: [0, 0, 0, 25],
      },

      // Client details box with enhanced design
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    text: h(`הצעת מחיר ל: ${clientName}`),
                    style: 'clientInfo',
                    bold: true,
                    fontSize: 13,
                    color: COMPANY_BRANDING.secondaryColor,
                  },
                  clientCompany
                    ? {
                        text: h(`חברה: ${clientCompany}`),
                        style: 'clientInfo',
                        fontSize: 11,
                        margin: [0, 3, 0, 0],
                      }
                    : {},
                  {
                    canvas: [
                      {
                        type: 'line' as const,
                        x1: 0,
                        y1: 0,
                        x2: 450,
                        y2: 0,
                        lineWidth: 0.5,
                        lineColor: '#CCCCCC',
                      },
                    ],
                    margin: [0, 8, 0, 8],
                  },
                  {
                    text: h(`תאריך: ${formatHebrewDate(today)}`),
                    style: 'clientInfo',
                    fontSize: 10,
                  },
                  {
                    text: h(`תוקף ההצעה: עד ${formatHebrewDate(validUntil)} (${COMPANY_BRANDING.proposalValidity} ימים)`),
                    style: 'clientInfo',
                    fontSize: 10,
                    color: '#666666',
                  },
                ],
                fillColor: '#F8FAFC',
                margin: 15,
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1.5,
          vLineWidth: () => 1.5,
          hLineColor: () => COMPANY_BRANDING.primaryColor,
          vLineColor: () => COMPANY_BRANDING.primaryColor,
        },
        margin: [0, 0, 0, 25],
      },

      // Executive Summary
      { text: h('תקציר מנהלים'), style: 'sectionHeader', margin: [0, 10, 0, 10] },
      {
        text: h(buildExecutiveSummary(proposalData)),
        style: 'body',
        margin: [0, 0, 0, 20],
      },

      // ==================== PAGE 2: SERVICES TABLE ====================

      {
        text: h('פירוט שירותים'),
        style: 'sectionHeader',
        pageBreak: 'before' as PageBreak,
        margin: [0, 0, 0, 5],
      },
      {
        text: h('להלן סיכום השירותים המוצעים'),
        fontSize: 10,
        color: '#666666',
        margin: [0, 0, 0, 15],
      },

      // Services table with enhanced design
      {
        table: {
          headerRows: 1,
          widths: [35, '*', 70, 90],
          body: [
            [
              { text: '#', style: 'tableHeader', alignment: 'center' },
              { text: h('שירות'), style: 'tableHeader', alignment: 'right' },
              { text: h('זמן יישום'), style: 'tableHeader', alignment: 'center' },
              { text: h('מחיר'), style: 'tableHeader', alignment: 'center' },
            ],
            ...services.map((service, index) => [
              {
                text: (index + 1).toString(),
                alignment: 'center',
                fontSize: 10,
                bold: true,
                color: COMPANY_BRANDING.primaryColor,
              },
              {
                text: h(service.nameHe),
                fontSize: 10,
                bold: true,
              },
              {
                text: h(`${service.customDuration || service.estimatedDays} ימים`),
                alignment: 'center',
                fontSize: 10,
              },
              {
                text: formatPrice(service.customPrice || service.basePrice),
                alignment: 'center',
                fontSize: 10,
                bold: true,
                color: COMPANY_BRANDING.secondaryColor,
              },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return COMPANY_BRANDING.primaryColor;
            return rowIndex % 2 === 0 ? '#F8FAFC' : 'white';
          },
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 1.5 : 0.5),
          vLineWidth: () => 0.5,
          hLineColor: (i: number, node: any) => (i === 0 || i === node.table.body.length ? COMPANY_BRANDING.primaryColor : '#E5E7EB'),
          vLineColor: () => '#E5E7EB',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 0, 0, 25],
      } as ContentTable,

      // ==================== PAGE 3: SERVICE DETAILS ====================

      {
        text: h('פירוט מלא של השירותים'),
        style: 'sectionHeader',
        pageBreak: 'before' as PageBreak,
        margin: [0, 0, 0, 5],
      },
      {
        text: h('כל שירות מותאם במיוחד לצרכים שזיהינו'),
        fontSize: 10,
        color: '#666666',
        margin: [0, 0, 0, 20],
      },

      // Service details with enhanced professional layout
      ...services.flatMap((service, index) => [
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: h(`${index + 1}. ${service.nameHe}`),
                      style: 'serviceTitle',
                      fontSize: 15,
                      color: COMPANY_BRANDING.primaryColor,
                    },
                    {
                      canvas: [
                        {
                          type: 'line' as const,
                          x1: 0,
                          y1: 0,
                          x2: 80,
                          y2: 0,
                          lineWidth: 2,
                          lineColor: COMPANY_BRANDING.primaryColor,
                        },
                      ],
                      margin: [0, 5, 0, 10],
                    },
                    { text: h('💡 למה זה רלוונטי לך:'), style: 'subsectionHeader', margin: [0, 0, 0, 6] },
                    { text: h(service.reasonSuggestedHe), style: 'body', margin: [0, 0, 0, 10] },
                    { text: h('📋 מה זה כולל:'), style: 'subsectionHeader', margin: [0, 0, 0, 6] },
                    { text: h(service.descriptionHe), style: 'body', margin: [0, 0, 0, 10] },
                    service.notes
                      ? {
                          text: h(`💬 הערה: ${service.notes}`),
                          style: 'notes',
                          margin: [0, 0, 0, 10],
                          italics: true,
                        }
                      : {},
                    {
                      columns: [
                        {
                          width: '*',
                          text: h(`⏱️ זמן יישום: ${service.customDuration || service.estimatedDays} ימים`),
                          style: 'serviceDetail',
                          alignment: 'right',
                        },
                        {
                          width: '*',
                          text: h(`💰 השקעה: ${formatPrice(service.customPrice || service.basePrice)}`),
                          style: 'serviceDetail',
                          bold: true,
                          color: COMPANY_BRANDING.secondaryColor,
                          alignment: 'left',
                        },
                      ],
                      margin: [0, 5, 0, 0],
                    },
                  ],
                  fillColor: '#FAFBFC',
                  margin: 15,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#E5E7EB',
            vLineColor: () => '#E5E7EB',
          },
          margin: [0, 0, 0, 15],
        },
      ]),

      // ==================== PAGE 4: FINANCIAL SUMMARY & ROI ====================

      {
        stack: [
          { text: h('סיכום כספי ו-ROI'), style: 'title', alignment: 'center' },
          {
            text: h('מבט על ההשקעה והתשואה'),
            fontSize: 11,
            alignment: 'center',
            color: '#666666',
            margin: [0, 5, 0, 0],
          },
        ],
        pageBreak: 'before' as PageBreak,
        margin: [0, 0, 0, 25],
      },

      // Enhanced summary box with professional design
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    columns: [
                      {
                        width: '*',
                        stack: [
                          { text: h('מספר שירותים'), fontSize: 9, color: '#666666', alignment: 'right' },
                          {
                            text: proposalData.summary.totalServices.toString(),
                            style: 'summaryText',
                            fontSize: 22,
                            bold: true,
                            color: COMPANY_BRANDING.primaryColor,
                            alignment: 'right',
                          },
                        ],
                      },
                      {
                        width: '*',
                        stack: [
                          { text: h('זמן יישום'), fontSize: 9, color: '#666666', alignment: 'center' },
                          {
                            text: h(`${proposalData.totalDays} ימים`),
                            style: 'summaryText',
                            fontSize: 22,
                            bold: true,
                            color: COMPANY_BRANDING.secondaryColor,
                            alignment: 'center',
                          },
                        ],
                      },
                      {
                        width: '*',
                        stack: [
                          { text: h('השקעה כוללת'), fontSize: 9, color: '#666666', alignment: 'left' },
                          {
                            text: formatPrice(proposalData.totalPrice),
                            style: 'totalPrice',
                            fontSize: 22,
                            alignment: 'left',
                          },
                        ],
                      },
                    ],
                    margin: [0, 0, 0, 15],
                  },
                  ...(proposalData.monthlySavings > 0
                    ? [
                        {
                          canvas: [
                            {
                              type: 'line' as const,
                              x1: 0,
                              y1: 0,
                              x2: 480,
                              y2: 0,
                              lineWidth: 1,
                              lineColor: '#DDDDDD',
                            },
                          ],
                          margin: [0, 10, 0, 15],
                        },
                        {
                          columns: [
                            {
                              width: '*',
                              stack: [
                                { text: h('💰 חיסכון חודשי'), fontSize: 11, bold: true, alignment: 'right' },
                                {
                                  text: formatPrice(proposalData.monthlySavings),
                                  style: 'summaryText',
                                  fontSize: 16,
                                  bold: true,
                                  color: '#10B981',
                                  alignment: 'right',
                                },
                              ],
                            },
                            {
                              width: '*',
                              stack: [
                                { text: h('📊 החזר השקעה'), fontSize: 11, bold: true, alignment: 'left' },
                                {
                                  text: h(`${proposalData.expectedROIMonths} חודשים`),
                                  style: 'summaryText',
                                  fontSize: 16,
                                  bold: true,
                                  color: '#10B981',
                                  alignment: 'left',
                                },
                              ],
                            },
                          ],
                        },
                      ]
                    : []),
                ],
                fillColor: '#F8FAFC',
                margin: 20,
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
        margin: [0, 0, 0, 25],
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
                      stack: [
                        { text: h('🎯 תשואה שנתית צפויה'), fontSize: 12, color: 'white', alignment: 'center', bold: true },
                        {
                          text: formatPrice(proposalData.monthlySavings * 12),
                          fontSize: 24,
                          color: 'white',
                          alignment: 'center',
                          bold: true,
                          margin: [0, 5, 0, 0],
                        },
                      ],
                      fillColor: COMPANY_BRANDING.primaryColor,
                      margin: 15,
                    },
                  ],
                ],
              },
              layout: 'noBorders',
              margin: [0, 0, 0, 25],
            },
          ]
        : []),

      // Value proposition
      { text: h('💎 למה כדאי לך לעבוד איתנו?'), style: 'sectionHeader', margin: [0, 10, 0, 10] },
      {
        ul: buildBenefitsList(proposalData).map(b => h(b)),
        style: 'body',
        margin: [0, 0, 0, 20],
      },

      // ==================== PAGE 5: TERMS & TIMELINE ====================

      { text: h('תנאים ולוח זמנים'), style: 'sectionHeader', pageBreak: 'before' as PageBreak, margin: [0, 0, 0, 15] },

      { text: h('💳 תנאי תשלום:'), style: 'subsectionHeader', margin: [0, 10, 0, 5] },
      { text: h(`• ${COMPANY_BRANDING.paymentTermsHe}`), style: 'body', margin: [0, 0, 0, 15] },

      { text: h('⏱️ לוח זמנים משוער:'), style: 'subsectionHeader', margin: [0, 0, 0, 5] },
      {
        ul: [
          h(`משך הפרויקט: ${Math.ceil(proposalData.totalDays / 5)} שבועות (${proposalData.totalDays} ימי עבודה)`),
          h('עדכוני סטטוס שבועיים'),
          h('מעקב צמוד ושקיפות מלאה'),
        ],
        style: 'body',
        margin: [0, 0, 0, 15],
      },

      { text: h('📞 תמיכה:'), style: 'subsectionHeader', margin: [0, 0, 0, 5] },
      {
        ul: [h('זמינה בשעות העבודה'), h('תגובה תוך 24 שעות')],
        style: 'body',
        margin: [0, 0, 0, 15],
      },

      { text: h('📋 תנאים נוספים:'), style: 'subsectionHeader', margin: [0, 0, 0, 5] },
      {
        ul: [
          h(`ההצעה תקפה ל-${COMPANY_BRANDING.proposalValidity} ימים מתאריך שליחה`),
          h('זכויות יוצרים על הקוד והפתרונות שפותחו שייכים ללקוח'),
          h('ביטול ההזמנה לאחר תחילת העבודה כרוך בחיוב יחסי'),
        ],
        style: 'notes',
        margin: [0, 0, 0, 20],
      },

      // ==================== PAGE 6: NEXT STEPS & SIGNATURE ====================

      { text: h('🚀 השלב הבא'), style: 'title', pageBreak: 'before' as PageBreak, alignment: 'center', margin: [0, 0, 0, 20] },

      {
        ol: [
          h('סקירת ההצעה ושאלות הבהרה'),
          h('תיאום פגישת קיק-אוף'),
          h('חתימה על הסכם'),
          h('תשלום מקדמה'),
          h('התחלת העבודה!'),
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
                  { text: h('מוכנים להתחיל? בואו נדבר:'), style: 'contactHeader', alignment: 'center' },
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
              { text: h(COMPANY_BRANDING.signerName), style: 'signatureName', alignment: 'right' },
              {
                text: h(`${COMPANY_BRANDING.signerTitle}, ${COMPANY_BRANDING.companyNameHe}`),
                style: 'signatureTitle',
                alignment: 'right',
              },
            ],
          },
        ],
      },
    ],

    // Styles definition - Professional and polished for Hebrew RTL
    styles: {
      companyName: {
        fontSize: 14,
        bold: true,
        color: COMPANY_BRANDING.secondaryColor,
        lineHeight: 1.2,
      },
      companyInfo: {
        fontSize: 9,
        color: '#555555',
        lineHeight: 1.4,
      },
      title: {
        fontSize: 28,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
        lineHeight: 1.2,
        characterSpacing: 0.5,
      },
      sectionHeader: {
        fontSize: 18,
        bold: true,
        color: COMPANY_BRANDING.secondaryColor,
        lineHeight: 1.3,
        characterSpacing: 0.3,
      },
      subsectionHeader: {
        fontSize: 12,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
        lineHeight: 1.4,
      },
      serviceTitle: {
        fontSize: 14,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
        lineHeight: 1.3,
      },
      clientInfo: {
        fontSize: 11,
        lineHeight: 1.5,
      },
      body: {
        fontSize: 10,
        lineHeight: 1.6,
        color: '#333333',
      },
      notes: {
        fontSize: 9,
        italics: true,
        color: '#666666',
        lineHeight: 1.4,
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        lineHeight: 1.3,
      },
      serviceDetail: {
        fontSize: 11,
        lineHeight: 1.5,
      },
      summaryText: {
        fontSize: 13,
        margin: [0, 4, 0, 4],
        lineHeight: 1.5,
      },
      totalPrice: {
        fontSize: 18,
        bold: true,
        color: COMPANY_BRANDING.primaryColor,
        lineHeight: 1.3,
      },
      highlight: {
        fontSize: 16,
        bold: true,
        lineHeight: 1.3,
      },
      contactHeader: {
        fontSize: 15,
        bold: true,
        color: COMPANY_BRANDING.secondaryColor,
        lineHeight: 1.3,
      },
      contactInfo: {
        fontSize: 12,
        lineHeight: 1.5,
      },
      signatureName: {
        fontSize: 12,
        bold: true,
        lineHeight: 1.3,
      },
      signatureTitle: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.3,
      },
      signatureText: {
        fontSize: 10,
        color: '#555555',
      },
    } as StyleDictionary,
  };

  // Generate PDF and return as Blob
  const pdfMake = await getPdfMake();

  return new Promise((resolve, reject) => {
    try {
      // Debug: Log document definition in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 Generating PDF with', services.length, 'services');
        console.log('💰 Total price:', formatPrice(proposalData.totalPrice));
      }

      const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);

      pdfDocGenerator.getBlob((blob: Blob) => {
        // Validate the generated PDF
        if (!blob || blob.size === 0) {
          reject(new Error('Generated PDF is empty - check font configuration'));
          return;
        }

        if (blob.size < 1000) {
          console.warn('⚠️ PDF size is suspiciously small:', blob.size, 'bytes');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ PDF generated successfully!');
          console.log(`📊 Size: ${(blob.size / 1024).toFixed(2)} KB`);
        }

        resolve(blob);
      });
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
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
