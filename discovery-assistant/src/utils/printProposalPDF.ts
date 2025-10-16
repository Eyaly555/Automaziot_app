import { SelectedService, ProposalData, ContractVersion } from '../types/proposal';
import { COMPANY_BRANDING, TRIAL_CONTRACT_TERMS } from '../config/companyBranding';
import { AiProposalDoc } from '../schemas/aiProposal.schema';

export interface ProposalPDFOptions {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
  aiProposal?: AiProposalDoc;
  contractVersion?: ContractVersion;
}

const formatPrice = (price: number): string => {
  return `₪${price.toLocaleString('he-IL')}`;
};

export const formatHebrewDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Generate terms section based on contract version
 */
const generateTermsSection = (
  aiProposal: AiProposalDoc | undefined,
  proposalData: ProposalData,
  contractVersion: ContractVersion = 'standard'
): string => {
  // For trial contracts, ALWAYS use trial terms (completely ignore AI-generated terms)
  if (contractVersion === 'trial') {
    return `
      <h3>💳 ${TRIAL_CONTRACT_TERMS.title}</h3>
      <div style="padding-right: 15px; margin-bottom: 20px;">
        ${TRIAL_CONTRACT_TERMS.terms.map(term => {
          // Highlight the specific text as requested
          const highlightedTerm = term.replace(
            TRIAL_CONTRACT_TERMS.highlightedText,
            `<strong style="background-color: #ffff00; padding: 2px 4px; border-radius: 3px; border: 2px solid #ff6b00; font-weight: bold; color: #000;">${TRIAL_CONTRACT_TERMS.highlightedText}</strong>`
          );
          return `<p style="margin-bottom: 8px;">• ${highlightedTerm}</p>`;
        }).join('')}
      </div>
      
      <!-- Trial contracts do NOT include validity terms or additional conditions -->
      <!-- This ensures no AI-generated terms are accidentally included -->
    `;
  }

  // For standard contracts, use AI-generated terms if available, otherwise fallback
  if (aiProposal?.terms && contractVersion === 'standard') {
    return `
      <div>
        ${aiProposal.terms.map(term => `<p style="padding-right: 15px; margin-bottom: 8px;">• ${term}</p>`).join('')}
      </div>
    `;
  }

  // Fallback for standard contracts
  return `
    <h3>💳 תנאי תשלום:</h3>
    <p style="padding-right: 15px; margin-bottom: 20px;">• ${COMPANY_BRANDING.paymentTermsHe}</p>

    <h3>⏱️ לוח זמנים משוער:</h3>
    <ul style="padding-right: 30px; margin-bottom: 20px;">
      <li>משך הפרויקט: ${Math.ceil(proposalData.totalDays / 5)} שבועות (${proposalData.totalDays} ימי עבודה)</li>
      <li>עדכוני סטטוס שבועיים</li>
      <li>מעקב צמוד ושקיפות מלאה</li>
    </ul>

    <h3>📞 תמיכה:</h3>
    <ul style="padding-right: 30px; margin-bottom: 20px;">
      <li>זמינה בשעות העבודה</li>
      <li>תגובה תוך 24 שעות</li>
    </ul>

    <h3>📋 תנאים נוספים:</h3>
    <ul style="padding-right: 30px; font-size: 10pt; color: #666;">
      <li>ההצעה תקפה ל-${COMPANY_BRANDING.proposalValidity} ימים מתאריך שליחה</li>
      <li>זכויות יוצרים על הקוד והפתרונות שפותחו שייכים ללקוח</li>
      <li>ביטול ההזמנה לאחר תחילת העבודה כרוך בחיוב יחסי</li>
    </ul>
  `;
};

/**
 * Print Proposal PDF using browser's native print dialog
 * This method opens a new window with the proposal content and triggers the print dialog
 * User can save as PDF using the browser's built-in "Save as PDF" option
 */
export const printProposalPDF = (options: ProposalPDFOptions): void => {
  const { clientName, clientCompany, services, proposalData, aiProposal, contractVersion = 'standard' } = options;

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + COMPANY_BRANDING.proposalValidity);

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>הצעת מחיר - ${clientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Rubik', sans-serif;
      direction: rtl;
      color: #000;
      line-height: 1.6;
      font-size: 11pt;
    }

    .page {
      page-break-after: always;
      padding: 10px 0;
    }

    .page:last-child {
      page-break-after: auto;
    }

    h1 {
      font-size: 28pt;
      font-weight: 700;
      color: ${COMPANY_BRANDING.primaryColor};
      margin-bottom: 8px;
    }

    h2 {
      font-size: 20pt;
      font-weight: 700;
      color: ${COMPANY_BRANDING.secondaryColor};
      margin-bottom: 12px;
    }

    h3 {
      font-size: 16pt;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      font-size: 11pt;
      line-height: 1.7;
      margin-bottom: 8px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      margin-bottom: 15px;
      border-bottom: 2px solid ${COMPANY_BRANDING.primaryColor};
    }

    .company-info {
      text-align: right;
    }

    .company-info h3 {
      color: ${COMPANY_BRANDING.primaryColor};
      margin-bottom: 6px;
    }

    .company-info p {
      font-size: 10pt;
      margin-bottom: 2px;
    }

    .logo {
      max-width: 100px;
      height: auto;
    }

    .client-box {
      background: #f8fafc;
      border: 2px solid ${COMPANY_BRANDING.primaryColor};
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }

    .client-box h3 {
      color: ${COMPANY_BRANDING.secondaryColor};
      margin-bottom: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th {
      background: ${COMPANY_BRANDING.primaryColor};
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: 600;
      border: 1px solid #ddd;
      font-size: 11pt;
    }

    td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: center;
      font-size: 10pt;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .service-box {
      background: #fafbfc;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }

    .service-title {
      color: ${COMPANY_BRANDING.primaryColor};
      font-size: 15pt;
      font-weight: 700;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${COMPANY_BRANDING.primaryColor};
    }

    .service-section {
      margin: 12px 0;
    }

    .service-section strong {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .service-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
    }

    .price-highlight {
      font-size: 13pt;
      font-weight: 700;
      color: ${COMPANY_BRANDING.secondaryColor};
    }

    .summary-box {
      background: #f8fafc;
      border: 2px solid ${COMPANY_BRANDING.primaryColor};
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }

    .summary-grid {
      display: flex;
      justify-content: space-around;
      margin: 15px 0;
    }

    .summary-item {
      flex: 1;
    }

    .summary-label {
      font-size: 10pt;
      color: #666;
      margin-bottom: 6px;
    }

    .summary-value {
      font-size: 22pt;
      font-weight: 700;
      color: ${COMPANY_BRANDING.primaryColor};
    }

    .roi-highlight {
      background: ${COMPANY_BRANDING.primaryColor};
      color: white;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
    }

    .roi-highlight h3 {
      color: white;
      margin-bottom: 8px;
    }

    .roi-highlight .value {
      font-size: 26pt;
      font-weight: 700;
    }

    .benefits-list {
      padding-right: 20px;
      margin: 15px 0;
    }

    .benefits-list li {
      margin-bottom: 8px;
      font-size: 11pt;
    }

    .contact-box {
      background: #eef2ff;
      border: 2px solid ${COMPANY_BRANDING.primaryColor};
      border-radius: 6px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }

    .signature-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
    }

    .signature-img {
      max-width: 120px;
      margin-bottom: 8px;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <!-- PAGE 1: HEADER & OVERVIEW -->
  <div class="page">
    <div class="header">
      <div class="company-info">
        <h3>${COMPANY_BRANDING.companyNameHe}</h3>
        <p>${COMPANY_BRANDING.address}</p>
        <p>טלפון: ${COMPANY_BRANDING.phone}</p>
        <p>אימייל: ${COMPANY_BRANDING.email}</p>
      </div>
      ${COMPANY_BRANDING.logoPath ? `<img src="${COMPANY_BRANDING.logoPath}" alt="Logo" class="logo">` : ''}
    </div>

    <h1 style="text-align: center; margin: 25px 0 10px 0;">הצעת מחיר</h1>
    <p style="text-align: center; color: #666; font-size: 12pt; margin-bottom: 30px;">
      פתרונות אוטומציה ובינה מלאכותית מותאמים אישית
    </p>

    <div class="client-box">
      <h3>הצעת מחיר ל: ${clientName}</h3>
      ${clientCompany ? `<p style="font-size: 11pt; margin-bottom: 6px;">חברה: ${clientCompany}</p>` : ''}
      <p>תאריך: ${formatHebrewDate(today)}</p>
      <p style="color: #666;">תוקף ההצעה: עד ${formatHebrewDate(validUntil)} (${COMPANY_BRANDING.proposalValidity} ימים)</p>
    </div>

    <h2>תקציר מנהלים</h2>
    ${aiProposal?.executiveSummary ? `
      ${aiProposal.executiveSummary.map(paragraph => `<p style="font-size: 11pt; margin-bottom: 8px;">${paragraph}</p>`).join('')}
    ` : `
      <p style="font-size: 11pt;">
        לאחר ניתוח מעמיק של תהליכי העבודה שלכם, זיהינו ${proposalData.summary.totalServices} פתרונות
        אוטומציה ו-AI. ההשקעה הכוללת: ${formatPrice(proposalData.totalPrice)}${
          (proposalData.monthlySavings || 0) > 0
            ? `, שיחסכו לכם ${formatPrice(proposalData.monthlySavings || 0)} בחודש עם החזר השקעה תוך ${proposalData.expectedROIMonths || 0} חודשים`
            : ''
        }.
      </p>
    `}
  </div>

  <!-- PAGE 2: SERVICES TABLE -->
  <div class="page">
    <h2>פירוט שירותים</h2>
    <p style="color: #666; margin-bottom: 15px;">להלן סיכום השירותים המוצעים</p>

    <table>
      <thead>
        <tr>
          <th style="width: 8%;">#</th>
          <th style="width: 47%;">שירות</th>
          <th style="width: 20%;">זמן יישום</th>
          <th style="width: 25%;">מחיר</th>
        </tr>
      </thead>
      <tbody>
        ${services
          .map(
            (service, index) => `
          <tr>
            <td>${index + 1}</td>
            <td style="text-align: right; padding-right: 12px;">${service.customNameHe || service.nameHe}</td>
            <td>${service.customDuration || service.estimatedDays} ימים</td>
            <td style="font-weight: 700; color: ${COMPANY_BRANDING.secondaryColor};">
              ${formatPrice(service.customPrice || service.basePrice)}
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <!-- PAGE 3: SERVICE DETAILS -->
  <div class="page">
    <h2>פירוט מלא של השירותים</h2>
    <p style="color: #666; margin-bottom: 15px;">כל שירות מותאם במיוחד לצרכים שזיהינו</p>

    ${aiProposal?.services ? `
      ${aiProposal.services.map((aiService, index) => `
        <div class="service-box">
          <div class="service-title">${index + 1}. ${aiService.titleHe}</div>

          <div class="service-section">
            <strong>💡 למה זה רלוונטי לך:</strong>
            <p>${aiService.whyRelevantHe}</p>
          </div>

          <div class="service-section">
            <strong>📋 מה זה כולל:</strong>
            <p>${aiService.whatIncludedHe}</p>
          </div>
        </div>
      `).join('')}
    ` : `
      ${services
        .map(
          (service, index) => `
        <div class="service-box">
          <div class="service-title">${index + 1}. ${service.customNameHe || service.nameHe}</div>

          <div class="service-section">
            <strong>💡 למה זה רלוונטי לך:</strong>
            <p>${service.reasonSuggestedHe}</p>
          </div>

          <div class="service-section">
            <strong>📋 מה זה כולל:</strong>
            <p>${service.customDescriptionHe || service.descriptionHe}</p>
          </div>

          ${
            service.notes
              ? `
          <div class="service-section">
            <p style="color: #666;">💬 הערה: ${service.notes}</p>
          </div>
          `
              : ''
          }

          <div class="service-footer">
            <span class="price-highlight">💰 השקעה: ${formatPrice(service.customPrice || service.basePrice)}</span>
            <span>⏱️ זמן יישום: ${service.customDuration || service.estimatedDays} ימים</span>
          </div>
        </div>
      `
        )
        .join('')}
    `}
  </div>

  <!-- PAGE 4: FINANCIAL SUMMARY -->
  <div class="page">
    <h1 style="text-align: center; margin-bottom: 30px;">סיכום כספי</h1>

    <div class="summary-box">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">מספר שירותים</div>
          <div class="summary-value">${services.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">זמן יישום</div>
          <div class="summary-value" style="color: ${COMPANY_BRANDING.secondaryColor};">${aiProposal?.financialSummary?.totalDays || proposalData.totalDays} ימים</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">השקעה כוללת</div>
          <div class="summary-value">${formatPrice(aiProposal?.financialSummary?.totalPrice || proposalData.totalPrice)}</div>
        </div>
      </div>
    </div>

    ${
      (aiProposal?.financialSummary?.monthlySavings || (proposalData.monthlySavings || 0)) > 0
        ? `
    <div class="roi-highlight">
      <h3>🎯 תשואה שנתית צפויה</h3>
      <div class="value">${formatPrice((aiProposal?.financialSummary?.monthlySavings || (proposalData.monthlySavings || 0)) * 12)}</div>
      <p style="margin-top: 12px; font-size: 12pt;">
        חיסכון חודשי: ${formatPrice(aiProposal?.financialSummary?.monthlySavings || (proposalData.monthlySavings || 0))} |
        החזר השקעה: ${aiProposal?.financialSummary?.expectedROIMonths || (proposalData.expectedROIMonths || 0)} חודשים
      </p>
    </div>
    `
        : ''
    }

    <h3 style="margin-top: 25px;">💎 למה כדאי לך לעבוד איתנו?</h3>
    <ul class="benefits-list">
      <li>פתרון מותאם במדויק לצרכים שלך</li>
      ${proposalData.monthlySavings > 0 ? '<li>ROI מוכח ומדיד</li>' : ''}
      <li>יישום מהיר - תוצאות תוך ${proposalData.totalDays} ימים</li>
      <li>תמיכה מלאה לאורך כל הדרך</li>
      <li>טכנולוגיה מתקדמת של AI ואוטומציה</li>
    </ul>
  </div>

  <!-- PAGE 5: TERMS -->
  <div class="page">
    <h2>תנאים ולוח זמנים</h2>
    ${generateTermsSection(aiProposal, proposalData, contractVersion)}
  </div>

  <!-- PAGE 6: NEXT STEPS -->
  <div class="page">
    <h1 style="text-align: center; margin-bottom: 25px;">🚀 השלב הבא</h1>

    ${aiProposal?.nextSteps ? `
      <ol style="padding-right: 30px; font-size: 12pt; line-height: 2; margin-bottom: 25px;">
        ${aiProposal.nextSteps.map(step => `<li>${step}</li>`).join('')}
      </ol>
    ` : `
      <ol style="padding-right: 30px; font-size: 12pt; line-height: 2; margin-bottom: 25px;">
        <li>סקירת ההצעה ושאלות הבהרה</li>
        <li>תיאום פגישת קיק-אוף</li>
        <li>חתימה על הסכם</li>
        <li>תשלום מקדמה</li>
        <li>התחלת העבודה!</li>
      </ol>
    `}

    <div class="contact-box">
      <h3 style="color: ${COMPANY_BRANDING.secondaryColor}; margin-bottom: 12px;">
        מוכנים להתחיל? בואו נדבר:
      </h3>
      <p style="font-size: 12pt; margin-bottom: 6px;">📞 ${COMPANY_BRANDING.phone}</p>
      <p style="font-size: 12pt; margin-bottom: 6px;">📧 ${COMPANY_BRANDING.email}</p>
      <p style="font-size: 12pt;">🌐 ${COMPANY_BRANDING.website}</p>
    </div>

    <div class="signature-section">
      <div style="text-align: right;">
        ${
          COMPANY_BRANDING.signaturePath
            ? `<img src="${COMPANY_BRANDING.signaturePath}" class="signature-img" alt="Signature">`
            : ''
        }
        <p style="font-weight: 600; margin-bottom: 4px;">${COMPANY_BRANDING.signerName}</p>
        <p style="font-size: 10pt; color: #666; margin-bottom: 8px;">${COMPANY_BRANDING.signerTitle}, ${COMPANY_BRANDING.companyNameHe}</p>
        <p style="color: #666; font-size: 10pt;">תאריך: ${formatHebrewDate(today)}</p>
      </div>
      <div style="text-align: left;">
        <div style="border-bottom: 2px solid #000; width: 180px; margin-bottom: 8px; padding-bottom: 30px;"></div>
        <p style="font-weight: 600; margin-bottom: 4px;">חתימת הלקוח</p>
        <p style="font-size: 10pt; color: #666; margin-bottom: 6px;">שם: ___________________</p>
        <p style="font-size: 10pt; color: #666;">תאריך: ${formatHebrewDate(today)}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.');
  }

  // Write HTML content
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for fonts and images to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();

      // Close window after printing (optional - user might want to keep it open)
      // printWindow.onafterprint = () => {
      //   printWindow.close();
      // };
    }, 500);
  };
};
