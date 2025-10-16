/**
 * WhatsApp Service - Send proposals via WhatsApp
 * Using wa.me links for temporary solution
 */

export interface WhatsAppMessage {
  phone: string;
  message: string;
  pdfUrl?: string; // Optional PDF URL to include in message
}

/**
 * Send proposal via WhatsApp using wa.me link
 * Opens WhatsApp Web/App with pre-filled message
 */
export const sendProposalViaWhatsApp = (
  phone: string,
  clientName: string,
  pdfBlob?: Blob,
  includeROI: boolean = true
): void => {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Ensure phone starts with country code (972 for Israel)
  let formattedPhone = cleanPhone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '972' + formattedPhone.substring(1);
  } else if (
    !formattedPhone.startsWith('972') &&
    !formattedPhone.startsWith('+')
  ) {
    formattedPhone = '972' + formattedPhone;
  }

  // Remove '+' if exists
  formattedPhone = formattedPhone.replace('+', '');

  // Create message with conditional ROI mention
  const message = `שלום ${clientName} 👋

הנה הצעת המחיר המפורטת שלנו עבור פתרונות האוטומציה וה-AI.

ההצעה כוללת:
• פירוט מלא של כל השירותים
• מחירים מדויקים
• לוח זמנים משוער${includeROI ? '\n• חישובי ROI' : ''}

אשמח לענות על כל שאלה ולהמשיך הלאה! 🚀

בברכה,
אייל יעקבי מילר
אוטומציות AI
052-957-4200`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Create WhatsApp link
  const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  // Open WhatsApp in new tab
  window.open(whatsappLink, '_blank');

  // If PDF blob exists, we'll need to download it separately
  // (wa.me doesn't support file attachments directly)
  if (pdfBlob) {
    // Auto-download PDF for manual attachment
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${clientName.replace(/\s/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show instruction to user
    setTimeout(() => {
      alert(
        '📄 הקובץ ירד למחשב שלך. אנא צרף אותו ידנית בשיחת WhatsApp שנפתחה.'
      );
    }, 500);
  }
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  // Israeli phone: 10 digits starting with 0, or with country code
  return /^(0\d{9}|972\d{9}|\+972\d{9})$/.test(cleanPhone);
};

/**
 * Format phone number for display
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (cleanPhone.startsWith('972')) {
    const local = '0' + cleanPhone.substring(3);
    return `${local.substring(0, 3)}-${local.substring(3, 6)}-${local.substring(6)}`;
  } else if (cleanPhone.startsWith('0')) {
    return `${cleanPhone.substring(0, 3)}-${cleanPhone.substring(3, 6)}-${cleanPhone.substring(6)}`;
  }

  return phone;
};
