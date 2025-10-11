#!/usr/bin/env node

/**
 * User-friendly script to run smart validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SmartValidator } from './smart-validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const validator = new SmartValidator();

  console.log('🚀 הפעלת בדיקה חכמה של קובץ requirementsPrefillEngine.ts\n');
  console.log('=' .repeat(60) + '\n');

  await validator.validate();

  console.log('=' .repeat(60));

  if (validator.issues.length > 0) {
    console.log(`\n📋 נמצאו ${validator.issues.length} בעיות שדורשות טיפול\n`);

    // הצג סיכום מהיר של כל הבעיות
    validator.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.functionName} (שורה ${issue.lineNumber})`);
    });

    console.log('\n💡 לפרטים מלאים ותיקונים, ראה למעלה');
    console.log('🔧 להחלת תיקונים אוטומטיים: node scripts/validate-prefill.js --fix');
  } else {
    console.log('\n🎉 הקובץ תקין! אין בעיות שדורשות טיפול');
  }

  console.log('\n' + '=' .repeat(60));
}

// Handle command line arguments
async function handleFixMode() {
  const { SmartValidator } = await import('./smart-validation.js');

  const validator = new SmartValidator();
  await validator.validate();

  if (validator.issues.length > 0) {
    console.log('🔧 מחיל תיקונים אוטומטיים...\n');
    await validator.applyFixes(true);
  }
}

if (process.argv.includes('--fix')) {
  handleFixMode().catch(console.error);
} else {
  main().catch(console.error);
}
