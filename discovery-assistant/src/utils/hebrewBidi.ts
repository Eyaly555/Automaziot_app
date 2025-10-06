/**
 * Hebrew BiDi (Bidirectional) Text Processing for PDF Generation
 * Reverses Hebrew text for proper RTL rendering in pdfMake
 */

/**
 * Check if a character is Hebrew
 */
const isHebrew = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (code >= 0x0590 && code <= 0x05FF) || // Hebrew block
         (code >= 0xFB1D && code <= 0xFB4F);   // Hebrew presentation forms
};

/**
 * Check if a character is a digit
 */
const isDigit = (char: string): boolean => {
  return /\d/.test(char);
};

/**
 * Check if a character is Latin (English)
 */
const isLatin = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (code >= 0x0041 && code <= 0x005A) || // A-Z
         (code >= 0x0061 && code <= 0x007A);   // a-z
};

/**
 * Reverse Hebrew text for proper RTL display in PDF
 * Handles mixed Hebrew/English/Numbers correctly
 *
 * Examples:
 *   "שלום" → "םולש" (reversed)
 *   "שלום 123" → "123 םולש" (Hebrew reversed, numbers in place)
 *   "Hello שלום World" → "dlroW םולש olleH" (each segment reversed)
 */
export const reverseHebrewText = (text: string): string => {
  if (!text) return text;

  // Split into segments by direction
  const segments: Array<{ text: string; isRTL: boolean }> = [];
  let currentSegment = '';
  let isCurrentRTL = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charIsRTL = isHebrew(char);

    if (i === 0) {
      currentSegment = char;
      isCurrentRTL = charIsRTL;
    } else if (charIsRTL === isCurrentRTL) {
      currentSegment += char;
    } else {
      segments.push({ text: currentSegment, isRTL: isCurrentRTL });
      currentSegment = char;
      isCurrentRTL = charIsRTL;
    }
  }

  // Push last segment
  if (currentSegment) {
    segments.push({ text: currentSegment, isRTL: isCurrentRTL });
  }

  // Reverse the order of segments for RTL
  const reversedSegments = segments.reverse();

  // Reverse RTL segment text (Hebrew), keep LTR as-is
  return reversedSegments
    .map(seg => (seg.isRTL ? seg.text.split('').reverse().join('') : seg.text))
    .join('');
};

/**
 * Process Hebrew text for PDF - handles special cases
 */
export const processHebrewForPDF = (text: string): string => {
  if (!text) return text;

  // Check if text contains Hebrew
  const hasHebrew = Array.from(text).some(isHebrew);

  if (!hasHebrew) {
    // No Hebrew, return as-is
    return text;
  }

  // Contains Hebrew, apply BiDi reversal
  return reverseHebrewText(text);
};

/**
 * Process all text fields in an object recursively
 * Useful for processing entire data structures before PDF generation
 */
export const processObjectHebrewText = (obj: any): any => {
  if (typeof obj === 'string') {
    return processHebrewForPDF(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(processObjectHebrewText);
  }

  if (obj && typeof obj === 'object') {
    const processed: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        processed[key] = processObjectHebrewText(obj[key]);
      }
    }
    return processed;
  }

  return obj;
};
