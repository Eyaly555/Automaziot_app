/**
 * Script to convert TTF fonts to Base64 for pdfmake
 * Run: node scripts/convertFontsToBase64.js
 */

const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
const outputFile = path.join(__dirname, '..', 'src', 'utils', 'rubikFonts.ts');

// Read font files
const rubikRegular = fs.readFileSync(path.join(fontsDir, 'Rubik-Regular.ttf'));
const rubikBold = fs.readFileSync(path.join(fontsDir, 'Rubik-Bold.ttf'));

// Convert to Base64
const rubikRegularBase64 = rubikRegular.toString('base64');
const rubikBoldBase64 = rubikBold.toString('base64');

// Create TypeScript file
const content = `/**
 * Rubik Font for pdfmake - Hebrew Support
 * Auto-generated from TTF files
 * Generated: ${new Date().toISOString()}
 */

export const RUBIK_REGULAR_BASE64 = '${rubikRegularBase64}';

export const RUBIK_BOLD_BASE64 = '${rubikBoldBase64}';

export const RUBIK_FONTS = {
  Rubik: {
    normal: RUBIK_REGULAR_BASE64,
    bold: RUBIK_BOLD_BASE64,
  }
};
`;

// Write to file
fs.writeFileSync(outputFile, content, 'utf8');

console.log('✅ Fonts converted successfully!');
console.log(`📁 Output: ${outputFile}`);
console.log(`📊 Rubik Regular: ${Math.round(rubikRegularBase64.length / 1024)}KB`);
console.log(`📊 Rubik Bold: ${Math.round(rubikBoldBase64.length / 1024)}KB`);
