import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SelectedService, ProposalData } from '../types/proposal';
import { COMPANY_BRANDING } from '../config/companyBranding';

/**
 * Professional Proposal PDF Generator for Automaziot AI
 * Creates a comprehensive, Hebrew-language proposal with branding using jsPDF
 * Uses Rubik fonts for proper Hebrew RTL support
 */

interface ProposalPDFOptions {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
}

// Load font helper function - converts TTF to base64 for jsPDF
async function loadFont(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

// Load image helper function
async function loadImageAsBase64(imagePath: string): Promise<string | null> {
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
}

// Format price in Hebrew currency (ILS)
const formatPrice = (price: number): string => {
  return `₪${price.toLocaleString('he-IL')}`;
};

// Format date in Hebrew format
const formatHebrewDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const generateProposalPDF = async (
  options: ProposalPDFOptions
): Promise<Blob> => {
  const { clientName, clientCompany, services, proposalData } = options;

  // Load Rubik font
  const rubikFont = await loadFont('/fonts/Rubik-VariableFont_wght.ttf');

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add the font to PDF
  doc.addFileToVFS('Rubik-VariableFont_wght.ttf', rubikFont);
  doc.addFont('Rubik-VariableFont_wght.ttf', 'Rubik', 'normal');
  doc.addFont('Rubik-VariableFont_wght.ttf', 'Rubik', 'bold');

  // Set font as default
  doc.setFont('Rubik');

  // Enable RTL - THIS IS THE KEY for Hebrew text
  doc.setR2L(true);

  // Load images
  const logoBase64 = await loadImageAsBase64(COMPANY_BRANDING.logoPath);
  const signatureBase64 = await loadImageAsBase64(COMPANY_BRANDING.signaturePath);

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + COMPANY_BRANDING.proposalValidity);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ==================== PAGE 1: HEADER & EXECUTIVE SUMMARY ====================

  let yPos = 20;

  // Header with logo and company info
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', pageWidth - margin - 40, yPos - 5, 40, 20);
  }

  // Company info (right side for RTL)
  doc.setFontSize(14);
  doc.setFont('Rubik', 'bold');
  doc.text(COMPANY_BRANDING.companyNameHe, margin, yPos, { align: 'left' });

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('Rubik', 'normal');
  doc.text(COMPANY_BRANDING.address, margin, yPos, { align: 'left' });

  yPos += 5;
  doc.text(`טלפון: ${COMPANY_BRANDING.phone}`, margin, yPos, { align: 'left' });

  yPos += 5;
  doc.text(`אימייל: ${COMPANY_BRANDING.email}`, margin, yPos, { align: 'left' });

  // Divider line
  yPos += 8;
  doc.setLineWidth(0.8);
  doc.setDrawColor(COMPANY_BRANDING.primaryColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Title
  yPos += 15;
  doc.setFontSize(28);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.primaryColor);
  doc.text('הצעת מחיר', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('פתרונות אוטומציה ובינה מלאכותית מותאמים אישית', pageWidth / 2, yPos, { align: 'center' });

  // Client details box
  yPos += 12;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(COMPANY_BRANDING.primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'FD');

  yPos += 8;
  doc.setFontSize(13);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text(`הצעת מחיר ל: ${clientName}`, pageWidth - margin - 5, yPos, { align: 'right' });

  if (clientCompany) {
    yPos += 6;
    doc.setFontSize(11);
    doc.setFont('Rubik', 'normal');
    doc.text(`חברה: ${clientCompany}`, pageWidth - margin - 5, yPos, { align: 'right' });
  }

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`תאריך: ${formatHebrewDate(today)}`, pageWidth - margin - 5, yPos, { align: 'right' });

  yPos += 5;
  doc.setTextColor(102, 102, 102);
  doc.text(
    `תוקף ההצעה: עד ${formatHebrewDate(validUntil)} (${COMPANY_BRANDING.proposalValidity} ימים)`,
    pageWidth - margin - 5,
    yPos,
    { align: 'right' }
  );

  // Executive Summary
  yPos += 15;
  doc.setFontSize(18);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('תקציר מנהלים', pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(51, 51, 51);
  const summaryText = buildExecutiveSummary(proposalData);
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 2 * margin);
  doc.text(summaryLines, pageWidth - margin, yPos, { align: 'right' });

  // ==================== PAGE 2: SERVICES TABLE ====================

  doc.addPage();
  yPos = 20;

  doc.setFontSize(18);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('פירוט שירותים', pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('להלן סיכום השירותים המוצעים', pageWidth - margin, yPos, { align: 'right' });

  yPos += 10;

  // Services table using autoTable
  const tableBody = services.map((service, index) => [
    (index + 1).toString(),
    service.nameHe,
    `${service.customDuration || service.estimatedDays} ימים`,
    formatPrice(service.customPrice || service.basePrice),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'שירות', 'זמן יישום', 'מחיר']],
    body: tableBody,
    styles: {
      font: 'Rubik',
      fontSize: 10,
      halign: 'right',
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COMPANY_BRANDING.primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'right', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 35 },
      3: { halign: 'center', cellWidth: 40, textColor: COMPANY_BRANDING.secondaryColor, fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
  });

  // ==================== PAGE 3: SERVICE DETAILS ====================

  doc.addPage();
  yPos = 20;

  doc.setFontSize(18);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('פירוט מלא של השירותים', pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('כל שירות מותאם במיוחד לצרכים שזיהינו', pageWidth - margin, yPos, { align: 'right' });

  yPos += 10;

  // Service details
  services.forEach((service, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // Service box
    const boxHeight = 55 + (service.notes ? 5 : 0);
    doc.setFillColor(250, 251, 252);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPos, pageWidth - 2 * margin, boxHeight, 'FD');

    // Service title
    const titleYPos = yPos + 7;
    doc.setFontSize(15);
    doc.setFont('Rubik', 'bold');
    doc.setTextColor(COMPANY_BRANDING.primaryColor);
    doc.text(`${index + 1}. ${service.nameHe}`, pageWidth - margin - 5, titleYPos, { align: 'right' });

    // Underline
    const titleWidth = doc.getTextWidth(`${index + 1}. ${service.nameHe}`);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 5 - titleWidth, titleYPos + 1, pageWidth - margin - 5 - titleWidth + 30, titleYPos + 1);

    let detailYPos = titleYPos + 8;

    // Why relevant
    doc.setFontSize(10);
    doc.setFont('Rubik', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('💡 למה זה רלוונטי לך:', pageWidth - margin - 5, detailYPos, { align: 'right' });

    detailYPos += 5;
    doc.setFont('Rubik', 'normal');
    const reasonLines = doc.splitTextToSize(service.reasonSuggestedHe, pageWidth - 2 * margin - 10);
    doc.text(reasonLines, pageWidth - margin - 5, detailYPos, { align: 'right' });
    detailYPos += reasonLines.length * 4 + 3;

    // What's included
    doc.setFont('Rubik', 'bold');
    doc.text('📋 מה זה כולל:', pageWidth - margin - 5, detailYPos, { align: 'right' });

    detailYPos += 5;
    doc.setFont('Rubik', 'normal');
    const descLines = doc.splitTextToSize(service.descriptionHe, pageWidth - 2 * margin - 10);
    doc.text(descLines, pageWidth - margin - 5, detailYPos, { align: 'right' });
    detailYPos += descLines.length * 4 + 3;

    // Notes
    if (service.notes) {
      doc.setFont('Rubik', 'normal');
      doc.setTextColor(102, 102, 102);
      const notesText = `💬 הערה: ${service.notes}`;
      const notesLines = doc.splitTextToSize(notesText, pageWidth - 2 * margin - 10);
      doc.text(notesLines, pageWidth - margin - 5, detailYPos, { align: 'right' });
      detailYPos += notesLines.length * 4 + 3;
    }

    // Footer: Duration and Price
    detailYPos += 2;
    doc.setFontSize(11);
    doc.setFont('Rubik', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(
      `⏱️ זמן יישום: ${service.customDuration || service.estimatedDays} ימים`,
      pageWidth - margin - 5,
      detailYPos,
      { align: 'right' }
    );

    doc.setFont('Rubik', 'bold');
    doc.setTextColor(COMPANY_BRANDING.secondaryColor);
    doc.text(
      `💰 השקעה: ${formatPrice(service.customPrice || service.basePrice)}`,
      margin + 5,
      detailYPos,
      { align: 'left' }
    );

    yPos += boxHeight + 5;
  });

  // ==================== PAGE 4: FINANCIAL SUMMARY & ROI ====================

  doc.addPage();
  yPos = 20;

  doc.setFontSize(28);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.primaryColor);
  doc.text('סיכום כספי ו-ROI', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('מבט על ההשקעה והתשואה', pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Summary box
  const summaryBoxHeight = proposalData.monthlySavings > 0 ? 55 : 35;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(COMPANY_BRANDING.primaryColor);
  doc.setLineWidth(0.8);
  doc.rect(margin, yPos, pageWidth - 2 * margin, summaryBoxHeight, 'FD');

  const boxYPos = yPos + 12;
  const thirdWidth = (pageWidth - 2 * margin) / 3;

  // Total services
  doc.setFontSize(9);
  doc.setTextColor(102, 102, 102);
  doc.text('מספר שירותים', pageWidth - margin - thirdWidth / 2, boxYPos, { align: 'center' });
  doc.setFontSize(22);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.primaryColor);
  doc.text(proposalData.summary.totalServices.toString(), pageWidth - margin - thirdWidth / 2, boxYPos + 8, { align: 'center' });

  // Total days
  doc.setFontSize(9);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('זמן יישום', pageWidth - margin - thirdWidth - thirdWidth / 2, boxYPos, { align: 'center' });
  doc.setFontSize(22);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text(`${proposalData.totalDays} ימים`, pageWidth - margin - thirdWidth - thirdWidth / 2, boxYPos + 8, { align: 'center' });

  // Total price
  doc.setFontSize(9);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('השקעה כוללת', margin + thirdWidth / 2, boxYPos, { align: 'center' });
  doc.setFontSize(22);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.primaryColor);
  doc.text(formatPrice(proposalData.totalPrice), margin + thirdWidth / 2, boxYPos + 8, { align: 'center' });

  // ROI section (if applicable)
  if (proposalData.monthlySavings > 0) {
    const roiYPos = boxYPos + 20;

    // Divider
    doc.setLineWidth(0.3);
    doc.setDrawColor(221, 221, 221);
    doc.line(margin + 10, roiYPos, pageWidth - margin - 10, roiYPos);

    // Monthly savings
    doc.setFontSize(11);
    doc.setFont('Rubik', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('💰 חיסכון חודשי', pageWidth - margin - thirdWidth / 2, roiYPos + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(formatPrice(proposalData.monthlySavings), pageWidth - margin - thirdWidth / 2, roiYPos + 14, { align: 'center' });

    // ROI months
    doc.setFontSize(11);
    doc.setFont('Rubik', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('📊 החזר השקעה', margin + thirdWidth / 2, roiYPos + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`${proposalData.expectedROIMonths} חודשים`, margin + thirdWidth / 2, roiYPos + 14, { align: 'center' });
  }

  yPos += summaryBoxHeight + 10;

  // Annual ROI highlight
  if (proposalData.monthlySavings > 0) {
    doc.setFillColor(COMPANY_BRANDING.primaryColor);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');

    doc.setFontSize(12);
    doc.setFont('Rubik', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('🎯 תשואה שנתית צפויה', pageWidth / 2, yPos + 7, { align: 'center' });

    doc.setFontSize(24);
    doc.text(formatPrice(proposalData.monthlySavings * 12), pageWidth / 2, yPos + 15, { align: 'center' });

    yPos += 25;
  }

  // Value proposition
  yPos += 5;
  doc.setFontSize(18);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('💎 למה כדאי לך לעבוד איתנו?', pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(51, 51, 51);

  const benefits = buildBenefitsList(proposalData);
  benefits.forEach((benefit) => {
    doc.text(`• ${benefit}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 6;
  });

  // ==================== PAGE 5: TERMS & TIMELINE ====================

  doc.addPage();
  yPos = 20;

  doc.setFontSize(18);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('תנאים ולוח זמנים', pageWidth - margin, yPos, { align: 'right' });

  yPos += 12;
  doc.setFontSize(12);
  doc.text('💳 תנאי תשלום:', pageWidth - margin, yPos, { align: 'right' });

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(`• ${COMPANY_BRANDING.paymentTermsHe}`, pageWidth - margin - 5, yPos, { align: 'right' });

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('⏱️ לוח זמנים משוער:', pageWidth - margin, yPos, { align: 'right' });

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(
    `• משך הפרויקט: ${Math.ceil(proposalData.totalDays / 5)} שבועות (${proposalData.totalDays} ימי עבודה)`,
    pageWidth - margin - 5,
    yPos,
    { align: 'right' }
  );
  yPos += 6;
  doc.text('• עדכוני סטטוס שבועיים', pageWidth - margin - 5, yPos, { align: 'right' });
  yPos += 6;
  doc.text('• מעקב צמוד ושקיפות מלאה', pageWidth - margin - 5, yPos, { align: 'right' });

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('📞 תמיכה:', pageWidth - margin, yPos, { align: 'right' });

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text('• זמינה בשעות העבודה', pageWidth - margin - 5, yPos, { align: 'right' });
  yPos += 6;
  doc.text('• תגובה תוך 24 שעות', pageWidth - margin - 5, yPos, { align: 'right' });

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('📋 תנאים נוספים:', pageWidth - margin, yPos, { align: 'right' });

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text(
    `• ההצעה תקפה ל-${COMPANY_BRANDING.proposalValidity} ימים מתאריך שליחה`,
    pageWidth - margin - 5,
    yPos,
    { align: 'right' }
  );
  yPos += 5;
  doc.text('• זכויות יוצרים על הקוד והפתרונות שפותחו שייכים ללקוח', pageWidth - margin - 5, yPos, { align: 'right' });
  yPos += 5;
  doc.text('• ביטול ההזמנה לאחר תחילת העבודה כרוך בחיוב יחסי', pageWidth - margin - 5, yPos, { align: 'right' });

  // ==================== PAGE 6: NEXT STEPS & SIGNATURE ====================

  doc.addPage();
  yPos = 20;

  doc.setFontSize(28);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.primaryColor);
  doc.text('🚀 השלב הבא', pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(51, 51, 51);

  const nextSteps = [
    'סקירת ההצעה ושאלות הבהרה',
    'תיאום פגישת קיק-אוף',
    'חתימה על הסכם',
    'תשלום מקדמה',
    'התחלת העבודה!',
  ];

  nextSteps.forEach((step, index) => {
    doc.text(`${index + 1}. ${step}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 7;
  });

  // Contact box
  yPos += 10;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(COMPANY_BRANDING.primaryColor);
  doc.setLineWidth(0.8);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'FD');

  const contactYPos = yPos + 8;
  doc.setFontSize(15);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(COMPANY_BRANDING.secondaryColor);
  doc.text('מוכנים להתחיל? בואו נדבר:', pageWidth / 2, contactYPos, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`📞 ${COMPANY_BRANDING.phone}`, pageWidth / 2, contactYPos + 7, { align: 'center' });
  doc.text(`📧 ${COMPANY_BRANDING.email}`, pageWidth / 2, contactYPos + 12, { align: 'center' });
  doc.text(`🌐 ${COMPANY_BRANDING.website}`, pageWidth / 2, contactYPos + 17, { align: 'center' });

  // Divider
  yPos += 40;
  doc.setLineWidth(0.2);
  doc.setDrawColor(204, 204, 204);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Signature section
  yPos += 10;

  if (signatureBase64) {
    doc.addImage(signatureBase64, 'PNG', pageWidth - margin - 35, yPos - 5, 30, 15);
  }

  doc.setFontSize(12);
  doc.setFont('Rubik', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(COMPANY_BRANDING.signerName, pageWidth - margin - 5, yPos + 12, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('Rubik', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text(
    `${COMPANY_BRANDING.signerTitle}, ${COMPANY_BRANDING.companyNameHe}`,
    pageWidth - margin - 5,
    yPos + 17,
    { align: 'right' }
  );

  doc.setTextColor(85, 85, 85);
  doc.text(formatHebrewDate(today), margin + 5, yPos + 12, { align: 'left' });

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📄 PDF Generated with jsPDF');
    console.log('✡️  RTL enabled with setR2L(true)');
    console.log('🔤 Using Rubik font for Hebrew support');
    console.log('📊 Services:', services.length);
    console.log('💰 Total:', formatPrice(proposalData.totalPrice));
  }

  // Return as Blob
  return doc.output('blob');
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
