import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SelectedService, ProposalData } from '../types/proposal';
import { COMPANY_BRANDING } from '../config/companyBranding';

/**
 * Professional Proposal PDF Generator for Automaziot AI
 * Creates a comprehensive, Hebrew-language proposal with branding
 */

interface ProposalPDFOptions {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
}

export const generateProposalPDF = async (
  options: ProposalPDFOptions
): Promise<Blob> => {
  const { clientName, clientCompany, services, proposalData } = options;

  // Create PDF with RTL support
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Enable RTL
  doc.setR2L(true);
  doc.setLanguage('he');

  // Load logo and signature (as base64 or from public path)
  // Note: In production, these should be converted to base64 or loaded properly
  const logoBase64 = await loadImageAsBase64(COMPANY_BRANDING.logoPath);
  const signatureBase64 = await loadImageAsBase64(COMPANY_BRANDING.signaturePath);

  let yPosition = 20;

  // ==================== PAGE 1: HEADER & EXECUTIVE SUMMARY ====================

  // Header with logo
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 150, yPosition, 40, 15); // Right side (RTL)
  }

  // Company details (left side in RTL = right side visually)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 95); // Dark blue
  doc.text(COMPANY_BRANDING.companyNameHe, 20, yPosition + 5, { align: 'left' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(COMPANY_BRANDING.address, 20, yPosition + 10, { align: 'left' });
  doc.text(`טלפון: ${COMPANY_BRANDING.phone}`, 20, yPosition + 14, { align: 'left' });
  doc.text(`אימייל: ${COMPANY_BRANDING.email}`, 20, yPosition + 18, { align: 'left' });

  yPosition += 30;

  // Divider line
  doc.setDrawColor(0, 212, 212); // Cyan
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);

  yPosition += 10;

  // Proposal title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 212, 212);
  doc.text('הצעת מחיר', 105, yPosition, { align: 'center' });

  yPosition += 15;

  // Client details box
  doc.setFillColor(238, 242, 255); // Light blue background
  doc.rect(20, yPosition, 170, 30, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  doc.text(`הצעת מחיר ל: ${clientName}`, 185, yPosition + 8, { align: 'right' });
  if (clientCompany) {
    doc.text(`חברה: ${clientCompany}`, 185, yPosition + 14, { align: 'right' });
  }

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + COMPANY_BRANDING.proposalValidity);

  doc.text(`תאריך: ${formatHebrewDate(today)}`, 185, yPosition + 20, { align: 'right' });
  doc.text(`תוקף: עד ${formatHebrewDate(validUntil)} (${COMPANY_BRANDING.proposalValidity} ימים)`, 185, yPosition + 26, { align: 'right' });

  yPosition += 40;

  // Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 95);
  doc.text('תקציר מנהלים', 185, yPosition, { align: 'right' });

  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const summaryText = `לאחר ניתוח מעמיק של תהליכי העבודה שלכם, זיהינו ${proposalData.totalServices} פתרונות אוטומציה ו-AI שיחסכו לכם ${formatPrice(proposalData.monthlySavings)} בחודש. ההשקעה הכוללת: ${formatPrice(proposalData.totalPrice)}, עם החזר השקעה תוך ${proposalData.expectedROIMonths} חודשים.`;

  const lines = doc.splitTextToSize(summaryText, 150);
  doc.text(lines, 185, yPosition, { align: 'right' });

  yPosition += lines.length * 6 + 10;

  // ==================== PAGE 2: SERVICES TABLE ====================

  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 95);
  doc.text('פירוט שירותים', 185, yPosition, { align: 'right' });

  yPosition += 10;

  // Create services table
  const tableData = services.map((service, index) => [
    (index + 1).toString(), // Row number
    service.nameHe,
    `${service.customDuration || service.estimatedDays} ימים`,
    formatPrice(service.customPrice || service.basePrice),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'שירות', 'זמן יישום', 'מחיר']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3,
      halign: 'right',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [0, 212, 212], // Cyan
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 90 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 35 },
    },
    margin: { right: 20, left: 20 },
  });

  // @ts-ignore - autoTable adds finalY
  yPosition = doc.lastAutoTable.finalY + 10;

  // ==================== PAGE 3: SERVICE DETAILS ====================

  doc.addPage();
  yPosition = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 95);
  doc.text('פירוט מלא של השירותים', 185, yPosition, { align: 'right' });

  yPosition += 10;

  for (const service of services) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Service name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 212, 212);
    doc.text(`🤖 ${service.nameHe}`, 185, yPosition, { align: 'right' });
    yPosition += 7;

    // Why relevant
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('למה זה רלוונטי לך:', 185, yPosition, { align: 'right' });
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const reasonLines = doc.splitTextToSize(service.reasonSuggestedHe, 150);
    doc.text(reasonLines, 185, yPosition, { align: 'right' });
    yPosition += reasonLines.length * 5 + 3;

    // Description
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('מה זה כולל:', 185, yPosition, { align: 'right' });
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(service.descriptionHe, 150);
    doc.text(descLines, 185, yPosition, { align: 'right' });
    yPosition += descLines.length * 5 + 3;

    // Additional notes if any
    if (service.notes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const notesLines = doc.splitTextToSize(`הערה: ${service.notes}`, 150);
      doc.text(notesLines, 185, yPosition, { align: 'right' });
      yPosition += notesLines.length * 5 + 3;
    }

    // Service details in box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPosition, 170, 15, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`⏱️ זמן יישום: ${service.customDuration || service.estimatedDays} ימים`, 185, yPosition + 6, { align: 'right' });
    doc.text(`💰 השקעה: ${formatPrice(service.customPrice || service.basePrice)}`, 185, yPosition + 11, { align: 'right' });

    yPosition += 20;
  }

  // ==================== PAGE 4: FINANCIAL SUMMARY & ROI ====================

  doc.addPage();
  yPosition = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 95);
  doc.text('סיכום כספי ו-ROI', 105, yPosition, { align: 'center' });

  yPosition += 15;

  // Summary box
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(0, 212, 212);
  doc.setLineWidth(1);
  doc.rect(40, yPosition, 130, 60, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  doc.text(`סה"כ שירותים: ${proposalData.totalServices}`, 160, yPosition + 10, { align: 'right' });
  doc.text(`זמן יישום כולל: ${proposalData.totalDays} ימי עבודה`, 160, yPosition + 18, { align: 'right' });

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(50, yPosition + 23, 160, yPosition + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 212, 212);
  doc.text(`סה"כ השקעה: ${formatPrice(proposalData.totalPrice)}`, 160, yPosition + 32, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.line(50, yPosition + 37, 160, yPosition + 37);

  doc.text(`💰 חיסכון חודשי צפוי: ${formatPrice(proposalData.monthlySavings)}`, 160, yPosition + 45, { align: 'right' });
  doc.text(`📊 החזר השקעה (ROI): ${proposalData.expectedROIMonths} חודשים`, 160, yPosition + 53, { align: 'right' });

  yPosition += 70;

  // Annual savings highlight
  const annualSavings = proposalData.monthlySavings * 12;
  doc.setFillColor(0, 212, 212);
  doc.rect(40, yPosition, 130, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`🎯 חיסכון שנתי צפוי: ${formatPrice(annualSavings)}`, 105, yPosition + 12, { align: 'center' });

  yPosition += 35;

  // Value proposition
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 95);
  doc.text('💎 למה כדאי לך לעבוד איתנו?', 185, yPosition, { align: 'right' });

  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const benefits = [
    'פתרון מותאם במדויק לצרכים שלך',
    'ROI מוכח ומדיד',
    `יישום מהיר - תוצאות תוך ${proposalData.totalDays} ימים`,
    'תמיכה מלאה לאורך כל הדרך',
    'טכנולוגיה מתקדמת של AI ואוטומציה',
  ];

  benefits.forEach((benefit) => {
    doc.text(`• ${benefit}`, 180, yPosition, { align: 'right' });
    yPosition += 6;
  });

  // ==================== PAGE 5: TERMS & TIMELINE ====================

  doc.addPage();
  yPosition = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 95);
  doc.text('תנאים ולוח זמנים', 185, yPosition, { align: 'right' });

  yPosition += 12;

  // Payment terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 212, 212);
  doc.text('💳 תנאי תשלום:', 185, yPosition, { align: 'right' });

  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`• ${COMPANY_BRANDING.paymentTermsHe}`, 180, yPosition, { align: 'right' });

  yPosition += 15;

  // Timeline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 212, 212);
  doc.text('⏱️ לוח זמנים משוער:', 185, yPosition, { align: 'right' });

  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const weeks = Math.ceil(proposalData.totalDays / 5);
  doc.text(`• משך הפרויקט: ${weeks} שבועות (${proposalData.totalDays} ימי עבודה)`, 180, yPosition, { align: 'right' });
  yPosition += 6;
  doc.text('• עדכוני סטטוס שבועיים', 180, yPosition, { align: 'right' });
  yPosition += 6;
  doc.text('• מעקב צמוד ושקיפות מלאה', 180, yPosition, { align: 'right' });

  yPosition += 15;

  // Support
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 212, 212);
  doc.text('📞 תמיכה:', 185, yPosition, { align: 'right' });

  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('• זמינה בשעות העבודה', 180, yPosition, { align: 'right' });
  yPosition += 6;
  doc.text('• תגובה תוך 24 שעות', 180, yPosition, { align: 'right' });

  yPosition += 15;

  // Legal terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 212, 212);
  doc.text('📋 תנאים נוספים:', 185, yPosition, { align: 'right' });

  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`• ההצעה תקפה ל-${COMPANY_BRANDING.proposalValidity} ימים מתאריך שליחה`, 180, yPosition, { align: 'right' });
  yPosition += 5;
  doc.text('• זכויות יוצרים על הקוד והפתרונות שפותחו שייכים ללקוח', 180, yPosition, { align: 'right' });
  yPosition += 5;
  doc.text('• ביטול ההזמנה לאחר תחילת העבודה כרוך בחיוב יחסי', 180, yPosition, { align: 'right' });

  // ==================== PAGE 6: NEXT STEPS & SIGNATURE ====================

  doc.addPage();
  yPosition = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 212, 212);
  doc.text('🚀 השלב הבא', 105, yPosition, { align: 'center' });

  yPosition += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const steps = [
    'סקירת ההצעה ושאלות הבהרה',
    'תיאום פגישת קיק-אוף',
    'חתימה על הסכם',
    'תשלום מקדמה',
    'התחלת העבודה!',
  ];

  steps.forEach((step, index) => {
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(0, 212, 212);
    doc.circle(165, yPosition + 1, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text((index + 1).toString(), 165, yPosition + 2.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(step, 155, yPosition + 2, { align: 'right' });
    yPosition += 10;
  });

  yPosition += 15;

  // Contact box
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(0, 212, 212);
  doc.setLineWidth(1);
  doc.rect(40, yPosition, 130, 30, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 95);
  doc.text('מוכנים להתחיל? בואו נדבר:', 105, yPosition + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`📞 ${COMPANY_BRANDING.phone}`, 105, yPosition + 15, { align: 'center' });
  doc.text(`📧 ${COMPANY_BRANDING.email}`, 105, yPosition + 21, { align: 'center' });
  doc.text(`🌐 ${COMPANY_BRANDING.website}`, 105, yPosition + 27, { align: 'center' });

  yPosition += 45;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(40, yPosition, 170, yPosition);

  yPosition += 15;

  // Signature section
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  doc.text(COMPANY_BRANDING.signerName, 140, yPosition, { align: 'right' });
  doc.text(formatHebrewDate(new Date()), 70, yPosition, { align: 'left' });

  yPosition += 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(COMPANY_BRANDING.signerTitle + ', ' + COMPANY_BRANDING.companyNameHe, 140, yPosition, { align: 'right' });

  // Add signature image if available
  if (signatureBase64) {
    doc.addImage(signatureBase64, 'JPG', 110, yPosition - 20, 30, 15);
  }

  // Return PDF as Blob
  return doc.output('blob');
};

// ==================== HELPER FUNCTIONS ====================

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
 * In production, this should be replaced with actual image loading
 */
const loadImageAsBase64 = async (imagePath: string): Promise<string | null> => {
  try {
    // For now, we'll construct the URL from the public path
    // In production, you might need to use fetch and convert to base64
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
