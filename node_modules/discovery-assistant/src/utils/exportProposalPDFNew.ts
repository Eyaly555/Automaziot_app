import { SelectedService, ProposalData } from '../types/proposal';
import { COMPANY_BRANDING } from '../config/companyBranding';

interface ProposalPDFOptions {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
}

const formatPrice = (price: number): string => {
  return `₪${price.toLocaleString('he-IL')}`;
};

const formatHebrewDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Generate Professional PDF using Browser Print Dialog
 * Uses browser's native BiDi rendering for perfect Hebrew/English/Numbers
 */
export const generateProposalPDF = (options: ProposalPDFOptions): void => {
  const { clientName, clientCompany, services, proposalData } = options;

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
      margin: 20mm;
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
    }

    .page {
      page-break-after: always;
      padding: 20px 0;
    }

    .page:last-child {
      page-break-after: auto;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      color: ${COMPANY_BRANDING.primaryColor};
      margin-bottom: 10px;
    }

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: ${COMPANY_BRANDING.secondaryColor};
      margin-bottom: 15px;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    p {
      font-size: 12px;
      line-height: 1.8;
      margin-bottom: 10px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 15px;
      margin-bottom: 20px;
      border-bottom: 3px solid ${COMPANY_BRANDING.primaryColor};
    }

    .company-info {
      text-align: right;
    }

    .company-info h3 {
      color: ${COMPANY_BRANDING.primaryColor};
      margin-bottom: 8px;
    }

    .company-info p {
      font-size: 11px;
      margin-bottom: 3px;
    }

    .logo {
      max-width: 120px;
      height: auto;
    }

    .client-box {
      background: #f8fafc;
      border: 2px solid ${COMPANY_BRANDING.primaryColor};
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }

    .client-box h3 {
      color: ${COMPANY_BRANDING.secondaryColor};
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
    }

    th {
      background: ${COMPANY_BRANDING.primaryColor};
      color: white;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      border: 1px solid #ddd;
    }

    td {
      padding: 12px;
      border: 1px solid #ddd;
      text-align: center;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .service-box {
      background: #fafbfc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .service-title {
      color: ${COMPANY_BRANDING.primaryColor};
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${COMPANY_BRANDING.primaryColor};
    }

    .service-section {
      margin: 15px 0;
    }

    .service-section strong {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .service-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }

    .price-highlight {
      font-size: 16px;
      font-weight: 700;
      color: ${COMPANY_BRANDING.secondaryColor};
    }

    .summary-box {
      background: #f8fafc;
      border: 2px solid ${COMPANY_BRANDING.primaryColor};
      border-radius: 8px;
      padding: 30px;
      margin: 25px 0;
      text-align: center;
    }

    .summary-grid {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
    }

    .summary-item {
      flex: 1;
    }

    .summary-label {
      font-size: 11px;
      color: #666;
      margin-bottom: 8px;
    }

    .summary-value {
      font-size: 26px;
      font-weight: 700;
      color: ${COMPANY_BRANDING.primaryColor};
    }

    .roi-highlight {
      background: ${COMPANY_BRANDING.primaryColor};
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      text-align: center;
    }

    .roi-highlight h3 {
      color: white;
      margin-bottom: 10px;
    }

    .roi-highlight .value {
      font-size: 32px;
      font-weight: 700;
    }

    .benefits-list {
      padding-right: 25px;
      margin: 20px 0;
    }

    .benefits-list li {
      margin-bottom: 10px;
      font-size: 13px;
    }

    .contact-box {
      background: #eef2ff;
      border: 2px solid ${COMPANY_BRANDING.primaryColor};
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin: 25px 0;
    }

    .signature-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 40px;
      padding-top: 25px;
      border-top: 1px solid #ccc;
    }

    .signature-img {
      max-width: 150px;
      margin-bottom: 10px;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
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

    <h1 style="text-align: center; margin: 30px 0;">הצעת מחיר</h1>
    <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 40px;">
      פתרונות אוטומציה ובינה מלאכותית מותאמים אישית
    </p>

    <div class="client-box">
      <h3>הצעת מחיר ל: ${clientName}</h3>
      ${clientCompany ? `<p style="font-size: 13px; margin-bottom: 8px;">חברה: ${clientCompany}</p>` : ''}
      <p>תאריך: ${formatHebrewDate(today)}</p>
      <p style="color: #666;">תוקף ההצעה: עד ${formatHebrewDate(validUntil)} (${COMPANY_BRANDING.proposalValidity} ימים)</p>
    </div>

    <h2>תקציר מנהלים</h2>
    <p style="font-size: 13px;">
      לאחר ניתוח מעמיק של תהליכי העבודה שלכם, זיהינו ${proposalData.summary.totalServices} פתרונות
      אוטומציה ו-AI. ההשקעה הכוללת: ${formatPrice(proposalData.totalPrice)}${
        proposalData.monthlySavings > 0
          ? `, שיחסכו לכם ${formatPrice(proposalData.monthlySavings)} בחודש עם החזר השקעה תוך ${proposalData.expectedROIMonths} חודשים`
          : ''
      }.
    </p>
  </div>

  <!-- PAGE 2: SERVICES TABLE -->
  <div class="page">
    <h2>פירוט שירותים</h2>
    <p style="color: #666; margin-bottom: 20px;">להלן סיכום השירותים המוצעים</p>

    <table>
      <thead>
        <tr>
          <th style="width: 10%;">#</th>
          <th style="width: 45%;">שירות</th>
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
            <td style="text-align: right; padding-right: 15px;">${service.nameHe}</td>
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
    <p style="color: #666; margin-bottom: 20px;">כל שירות מותאם במיוחד לצרכים שזיהינו</p>

    ${services
      .map(
        (service, index) => `
      <div class="service-box">
        <div class="service-title">${index + 1}. ${service.nameHe}</div>

        <div class="service-section">
          <strong>💡 למה זה רלוונטי לך:</strong>
          <p>${service.reasonSuggestedHe}</p>
        </div>

        <div class="service-section">
          <strong>📋 מה זה כולל:</strong>
          <p>${service.descriptionHe}</p>
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
  </div>

  <!-- PAGE 4: FINANCIAL SUMMARY -->
  <div class="page">
    <h1 style="text-align: center; margin-bottom: 40px;">סיכום כספי ו-ROI</h1>

    <div class="summary-box">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">מספר שירותים</div>
          <div class="summary-value">${proposalData.summary.totalServices}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">זמן יישום</div>
          <div class="summary-value" style="color: ${COMPANY_BRANDING.secondaryColor};">${proposalData.totalDays} ימים</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">השקעה כוללת</div>
          <div class="summary-value">${formatPrice(proposalData.totalPrice)}</div>
        </div>
      </div>
    </div>

    ${
      proposalData.monthlySavings > 0
        ? `
    <div class="roi-highlight">
      <h3>🎯 תשואה שנתית צפויה</h3>
      <div class="value">${formatPrice(proposalData.monthlySavings * 12)}</div>
      <p style="margin-top: 15px; font-size: 14px;">
        חיסכון חודשי: ${formatPrice(proposalData.monthlySavings)} |
        החזר השקעה: ${proposalData.expectedROIMonths} חודשים
      </p>
    </div>
    `
        : ''
    }

    <h3 style="margin-top: 30px;">💎 למה כדאי לך לעבוד איתנו?</h3>
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

    <h3>💳 תנאי תשלום:</h3>
    <p style="padding-right: 20px; margin-bottom: 25px;">• ${COMPANY_BRANDING.paymentTermsHe}</p>

    <h3>⏱️ לוח זמנים משוער:</h3>
    <ul style="padding-right: 35px; margin-bottom: 25px;">
      <li>משך הפרויקט: ${Math.ceil(proposalData.totalDays / 5)} שבועות (${proposalData.totalDays} ימי עבודה)</li>
      <li>עדכוני סטטוס שבועיים</li>
      <li>מעקב צמוד ושקיפות מלאה</li>
    </ul>

    <h3>📞 תמיכה:</h3>
    <ul style="padding-right: 35px; margin-bottom: 25px;">
      <li>זמינה בשעות העבודה</li>
      <li>תגובה תוך 24 שעות</li>
    </ul>

    <h3>📋 תנאים נוספים:</h3>
    <ul style="padding-right: 35px; font-size: 11px; color: #666;">
      <li>ההצעה תקפה ל-${COMPANY_BRANDING.proposalValidity} ימים מתאריך שליחה</li>
      <li>זכויות יוצרים על הקוד והפתרונות שפותחו שייכים ללקוח</li>
      <li>ביטול ההזמנה לאחר תחילת העבודה כרוך בחיוב יחסי</li>
    </ul>
  </div>

  <!-- PAGE 6: NEXT STEPS -->
  <div class="page">
    <h1 style="text-align: center; margin-bottom: 30px;">🚀 השלב הבא</h1>

    <ol style="padding-right: 35px; font-size: 14px; line-height: 2.2; margin-bottom: 30px;">
      <li>סקירת ההצעה ושאלות הבהרה</li>
      <li>תיאום פגישת קיק-אוף</li>
      <li>חתימה על הסכם</li>
      <li>תשלום מקדמה</li>
      <li>התחלת העבודה!</li>
    </ol>

    <div class="contact-box">
      <h3 style="color: ${COMPANY_BRANDING.secondaryColor}; margin-bottom: 15px;">
        מוכנים להתחיל? בואו נדבר:
      </h3>
      <p style="font-size: 14px; margin-bottom: 8px;">📞 ${COMPANY_BRANDING.phone}</p>
      <p style="font-size: 14px; margin-bottom: 8px;">📧 ${COMPANY_BRANDING.email}</p>
      <p style="font-size: 14px;">🌐 ${COMPANY_BRANDING.website}</p>
    </div>

    <div class="signature-section">
      <div style="text-align: left;">
        <p style="color: #666;">${formatHebrewDate(today)}</p>
      </div>
      <div style="text-align: right;">
        ${COMPANY_BRANDING.signaturePath ? `<img src="${COMPANY_BRANDING.signaturePath}" class="signature-img" alt="Signature">` : ''}
        <p style="font-weight: 600; margin-bottom: 5px;">${COMPANY_BRANDING.signerName}</p>
        <p style="font-size: 12px; color: #666;">${COMPANY_BRANDING.signerTitle}, ${COMPANY_BRANDING.companyNameHe}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('נא לאפשר חלונות קופצים עבור אתר זה');
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Print after content loads
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};
