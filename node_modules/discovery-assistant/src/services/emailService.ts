/**
 * Email Service - Generate Gmail mailto links for proposals
 * Creates pre-filled email drafts that open in Gmail
 */

import { ProposalData } from '../types/proposal';
import { COMPANY_BRANDING } from '../config/companyBranding';

export interface ProposalEmailOptions {
  clientEmail: string;
  clientName: string;
  clientCompany?: string;
  proposalData: ProposalData;
  pdfBlob?: Blob;
}

/**
 * Generate mailto link for Gmail with proposal details
 * Opens Gmail compose window with pre-filled content
 */
export const sendProposalViaEmail = (options: ProposalEmailOptions): void => {
  const { clientEmail, clientName, clientCompany, proposalData } = options;

  // Email subject
  const subject = `הצעת מחיר - ${COMPANY_BRANDING.companyNameHe} | ${clientName}`;

  // Email body (plain text version for mailto)
  const body = generateEmailBody(clientName, clientCompany, proposalData);

  // Create mailto link
  const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Open default email client
  window.location.href = mailtoLink;

  // If PDF exists, download it for manual attachment
  if (options.pdfBlob) {
    setTimeout(() => {
      downloadPDF(options.pdfBlob!, clientName);
      alert('📎 קובץ ה-PDF ירד למחשב. אנא צרף אותו ידנית למייל שנפתח.');
    }, 500);
  }
};

/**
 * Open Gmail compose window directly (works better than mailto for Gmail users)
 */
export const openGmailCompose = (options: ProposalEmailOptions): void => {
  const { clientEmail, clientName, clientCompany, proposalData } = options;

  // Gmail compose URL parameters
  const params = new URLSearchParams({
    to: clientEmail,
    su: `הצעת מחיר - ${COMPANY_BRANDING.companyNameHe} | ${clientName}`,
    body: generateEmailBody(clientName, clientCompany, proposalData),
  });

  // Open Gmail compose
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  window.open(gmailUrl, '_blank');

  // Download PDF for attachment
  if (options.pdfBlob) {
    setTimeout(() => {
      downloadPDF(options.pdfBlob!, clientName);
      alert('📎 קובץ ה-PDF ירד למחשב. גרור אותו לחלון Gmail שנפתח כדי לצרף.');
    }, 500);
  }
};

/**
 * Generate plain text email body
 */
const generateEmailBody = (
  clientName: string,
  clientCompany: string | undefined,
  proposalData: ProposalData
): string => {
  const includeROI = proposalData.monthlySavings > 0;
  const annualSavings = proposalData.monthlySavings * 12;

  // Build summary section conditionally
  let summary = `📊 סיכום ההצעה:
━━━━━━━━━━━━━━━━━━━━━━━
• מספר שירותים: ${proposalData.totalServices}
• זמן יישום משוער: ${proposalData.totalDays} ימי עבודה
• סה"כ השקעה: ₪${proposalData.totalPrice.toLocaleString('he-IL')}`;

  if (includeROI) {
    summary += `
• חיסכון חודשי צפוי: ₪${proposalData.monthlySavings.toLocaleString('he-IL')}
• חיסכון שנתי צפוי: ₪${annualSavings.toLocaleString('he-IL')}
• החזר השקעה (ROI): ${proposalData.expectedROIMonths} חודשים`;
  }

  // Build benefits section conditionally
  let benefits = `🎯 למה כדאי לך לעבוד איתנו?
━━━━━━━━━━━━━━━━━━━━━━━
✓ פתרון מותאם במדויק לצרכים שלך`;

  if (includeROI) {
    benefits += `
✓ ROI מוכח ומדיד - תראה תוצאות תוך ${proposalData.expectedROIMonths} חודשים`;
  }

  benefits += `
✓ יישום מהיר - תוצאות תוך ${proposalData.totalDays} ימים
✓ תמיכה מלאה לאורך כל הדרך
✓ טכנולוגיה מתקדמת של AI ואוטומציה`;

  return `שלום ${clientName},

תודה על הפגישה! מצורפת הצעת מחיר מפורטת המותאמת בדיוק לצרכים שזיהינו בעסק שלך${clientCompany ? ` (${clientCompany})` : ''}.

${summary}

${benefits}

📄 מצ"ב קובץ PDF עם כל הפרטים המלאים.

⏰ ההצעה תקפה ל-${COMPANY_BRANDING.proposalValidity} ימים.

יש לך שאלות? אשמח לענות ולעזור!

מוזמן/ת לחזור אליי בכל דרך נוחה:
📞 ${COMPANY_BRANDING.phone}
📧 ${COMPANY_BRANDING.email}
🌐 ${COMPANY_BRANDING.website}

מחכה לשמוע ממך,
${COMPANY_BRANDING.signerName}
${COMPANY_BRANDING.signerTitle}
${COMPANY_BRANDING.companyNameHe}`;
};

/**
 * Download PDF blob
 */
const downloadPDF = (pdfBlob: Blob, clientName: string): void => {
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proposal-${clientName.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate HTML email body (for future API integration)
 * This is a rich HTML version for when you implement proper email sending
 */
export const generateEmailHTML = (
  clientName: string,
  clientCompany: string | undefined,
  proposalData: ProposalData
): string => {
  const includeROI = proposalData.monthlySavings > 0;
  const annualSavings = proposalData.monthlySavings * 12;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #00D4D4 0%, #1E3A5F 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .summary-box {
      background: #EEF2FF;
      border-right: 4px solid #00D4D4;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-box h3 {
      margin: 0 0 15px 0;
      color: #1E3A5F;
      font-size: 18px;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .summary-item:last-child {
      border-bottom: none;
    }
    .summary-label {
      font-weight: 600;
      color: #555;
    }
    .summary-value {
      font-weight: bold;
      color: #00D4D4;
    }
    .benefits {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .benefits h3 {
      margin: 0 0 15px 0;
      color: #1E3A5F;
      font-size: 18px;
    }
    .benefit-item {
      padding: 8px 0;
      display: flex;
      align-items: start;
    }
    .benefit-item::before {
      content: "✓";
      color: #00D4D4;
      font-weight: bold;
      margin-left: 10px;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #00D4D4 0%, #1E3A5F 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      border-top: 2px solid #eee;
    }
    .contact-info {
      margin: 10px 0;
      color: #555;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>הצעת מחיר</h1>
      <p>פתרון אוטומציה מותאם ל-${clientName}</p>
    </div>

    <div class="content">
      <p class="greeting">שלום ${clientName},</p>

      <p>תודה על הפגישה! מצורפת הצעת מחיר מפורטת המותאמת בדיוק לצרכים שזיהינו בעסק שלך${clientCompany ? ` <strong>(${clientCompany})</strong>` : ''}.</p>

      <div class="summary-box">
        <h3>📊 סיכום ההצעה</h3>
        <div class="summary-item">
          <span class="summary-label">מספר שירותים:</span>
          <span class="summary-value">${proposalData.totalServices}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">זמן יישום משוער:</span>
          <span class="summary-value">${proposalData.totalDays} ימי עבודה</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">סה"כ השקעה:</span>
          <span class="summary-value">₪${proposalData.totalPrice.toLocaleString('he-IL')}</span>
        </div>
        ${includeROI ? `<div class="summary-item">
          <span class="summary-label">חיסכון חודשי צפוי:</span>
          <span class="summary-value">₪${proposalData.monthlySavings.toLocaleString('he-IL')}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">חיסכון שנתי צפוי:</span>
          <span class="summary-value">₪${annualSavings.toLocaleString('he-IL')}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">החזר השקעה (ROI):</span>
          <span class="summary-value">${proposalData.expectedROIMonths} חודשים</span>
        </div>` : ''}
      </div>

      <div class="benefits">
        <h3>🎯 למה כדאי לך לעבוד איתנו?</h3>
        <div class="benefit-item">פתרון מותאם במדויק לצרכים שלך</div>
        ${includeROI ? `<div class="benefit-item">ROI מוכח ומדיד - תראה תוצאות תוך ${proposalData.expectedROIMonths} חודשים</div>` : ''}
        <div class="benefit-item">יישום מהיר - תוצאות תוך ${proposalData.totalDays} ימים</div>
        <div class="benefit-item">תמיכה מלאה לאורך כל הדרך</div>
        <div class="benefit-item">טכנולוגיה מתקדמת של AI ואוטומציה</div>
      </div>

      <p style="text-align: center;">
        <a href="tel:${COMPANY_BRANDING.phone.replace(/\-/g, '')}" class="cta-button">📞 בואו נדבר!</a>
      </p>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        📄 מצ"ב קובץ PDF עם כל הפרטים המלאים.<br>
        ⏰ ההצעה תקפה ל-<strong>${COMPANY_BRANDING.proposalValidity} ימים</strong> מתאריך שליחה.
      </p>

      <div class="signature">
        <p style="margin: 5px 0;">מחכה לשמוע ממך,</p>
        <p style="margin: 5px 0; font-weight: bold;">${COMPANY_BRANDING.signerName}</p>
        <p style="margin: 5px 0;">${COMPANY_BRANDING.signerTitle}</p>
        <p style="margin: 5px 0;">${COMPANY_BRANDING.companyNameHe}</p>
      </div>
    </div>

    <div class="footer">
      <div class="contact-info">📞 ${COMPANY_BRANDING.phone}</div>
      <div class="contact-info">📧 ${COMPANY_BRANDING.email}</div>
      <div class="contact-info">🌐 ${COMPANY_BRANDING.website}</div>
    </div>
  </div>
</body>
</html>
  `;
};
