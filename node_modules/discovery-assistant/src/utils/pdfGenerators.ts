import html2pdf from 'html2pdf.js';

/**
 * PDF Generation utilities using HTML-to-PDF approach
 * All methods leverage browser's BiDi rendering for proper Hebrew/English/Numbers
 */

export type PDFMethod = 'html2pdf' | 'browser-print';

/**
 * Method 1: html2pdf.js library
 * Converts HTML element to PDF using html2canvas + jsPDF under the hood
 */
export const generatePDFWithHtml2Pdf = async (
  element: HTMLElement,
  filename: string
): Promise<Blob> => {
  const opt = {
    margin: 0,
    filename: filename,
    // Fix: Use literal type 'jpeg' as const for proper type compatibility
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
  };

  return html2pdf().set(opt).from(element).output('blob');
};

/**
 * Method 2: Browser native window.print() API
 * Opens print dialog with the HTML content
 * User can "Save as PDF" using browser's native PDF renderer
 */
export const generatePDFWithBrowserPrint = (element: HTMLElement): void => {
  // Create a new window with only the proposal content
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error(
      'Failed to open print window. Please allow popups for this site.'
    );
  }

  // Write the HTML content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <title>הצעת מחיר - Automaziot AI</title>
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 0;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Rubik', sans-serif;
          direction: rtl;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .pdf-page {
            page-break-after: always;
          }

          .pdf-page:last-child {
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for fonts and images to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};

/**
 * Main PDF generation function
 * Routes to the appropriate method based on user selection
 */
export const generateProposalPDF = async (
  element: HTMLElement,
  filename: string,
  method: PDFMethod
): Promise<Blob | void> => {
  switch (method) {
    case 'html2pdf':
      return await generatePDFWithHtml2Pdf(element, filename);

    case 'browser-print':
      generatePDFWithBrowserPrint(element);
      return; // No blob returned for browser print

    default:
      throw new Error(`Unknown PDF generation method: ${method}`);
  }
};
