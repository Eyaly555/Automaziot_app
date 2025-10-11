#!/usr/bin/env node

/**
 * Smart Validation Script for requirementsPrefillEngine.ts
 * Provides contextual fixes instead of automatic replacements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SmartValidator {
  constructor() {
    this.filePath = path.join(__dirname, '../src/utils/requirementsPrefillEngine.ts');
    this.issues = [];
    this.content = '';
  }

  async validate() {
    console.log('🔍 Running smart validation...\n');

    this.content = fs.readFileSync(this.filePath, 'utf8');
    this.findIssues();
    this.displayIssues();
    this.suggestFixes();

    return this.issues;
  }

  findIssues() {
    // 1. מצא פונקציות שמקבלות modules כפרמטר
    const functionPattern = /const (\w+) = \(\s*modules:\s*Meeting\['modules'\]/g;
    const functions = [];

    let match;
    while ((match = functionPattern.exec(this.content)) !== null) {
      functions.push({
        name: match[1],
        startIndex: match.index
      });
    }

    // עבור על כל פונקציה וחפש שימושים של meeting.modules
    functions.forEach(func => {
      const functionBodyPattern = new RegExp(`const ${func.name}.*?^}`, 'ms');
      const functionBodyMatch = this.content.substring(func.startIndex).match(functionBodyPattern);

      if (functionBodyMatch) {
        const functionBody = functionBodyMatch[0];
        const meetingModulesMatches = functionBody.match(/meeting\.modules/g);

        if (meetingModulesMatches) {
          meetingModulesMatches.forEach(match => {
            const matchIndex = functionBody.indexOf(match) + func.startIndex;

            this.issues.push({
              type: 'meeting-modules-usage',
              functionName: func.name,
              lineNumber: this.getLineNumber(matchIndex),
              column: this.getColumnNumber(matchIndex),
              context: this.getContext(matchIndex, 50),
              explanation: this.getExplanation(func.name),
              fix: this.getFix(func.name, match)
            });
          });
        }
      }
    });

    // 2. חפש שימושים של console.log במקום logger
    const consoleLogPattern = /console\.log\(/g;
    let consoleMatch;
    while ((consoleMatch = consoleLogPattern.exec(this.content)) !== null) {
      this.issues.push({
        type: 'console-log-usage',
        lineNumber: this.getLineNumber(consoleMatch.index),
        column: this.getColumnNumber(consoleMatch.index),
        context: this.getContext(consoleMatch.index, 30),
        explanation: 'מומלץ להשתמש ב-consoleLogger במקום console.log ישיר ליעילות רישום אחידה',
        fix: {
          original: 'console.log(',
          corrected: 'logger.info(',
          reason: 'החלפת console.log ב-logger.info לשימוש במערכת הרישום המאוחדת'
        }
      });
    }

    // 3. חפש שימושים של any במקום טייפים ספציפיים
    const anyTypePattern = /:\s*any/g;
    let anyMatch;
    while ((anyMatch = anyTypePattern.exec(this.content)) !== null) {
      this.issues.push({
        type: 'any-type-usage',
        lineNumber: this.getLineNumber(anyMatch.index),
        column: this.getColumnNumber(anyMatch.index),
        context: this.getContext(anyMatch.index, 40),
        explanation: 'מומלץ להגדיר טייפים ספציפיים במקום any לשיפור בטיחות הטייפים',
        fix: {
          original: ': any',
          corrected: ': unknown או טייפ ספציפי',
          reason: 'החלפת any בטייפ ספציפי יותר לבטיחות טייפים משופרת'
        }
      });
    }
  }

  getLineNumber(index) {
    const beforeContent = this.content.substring(0, index);
    return beforeContent.split('\n').length;
  }

  getColumnNumber(index) {
    const beforeContent = this.content.substring(0, index);
    const lines = beforeContent.split('\n');
    const lastLine = lines[lines.length - 1];
    return lastLine.length + 1;
  }

  getContext(index, radius = 50) {
    const start = Math.max(0, index - radius);
    const end = Math.min(this.content.length, index + radius);
    return this.content.substring(start, end).replace(/\n/g, ' ↵ ');
  }

  getExplanation(functionName) {
    return `הפונקציה ${functionName} מקבלת את הפרמטר 'modules' אבל משתמשת ב-meeting.modules.
            זה שגוי כי הפונקציה לא מקבלת את האובייקט meeting כפרמטר, רק את modules.
            צריך להשתמש ב-modules שהועבר כפרמטר במקום ב-meeting.modules.`;
  }

  getFix(functionName, problematicCode) {
    return {
      original: problematicCode,
      corrected: problematicCode.replace('meeting.modules', 'modules'),
      reason: `החלפת meeting.modules ב-modules כי הפונקציה ${functionName} מקבלת רק את modules כפרמטר`
    };
  }

  displayIssues() {
    if (this.issues.length === 0) {
      console.log('✅ לא נמצאו בעיות בקובץ!');
      return;
    }

    console.log(`🚨 נמצאו ${this.issues.length} בעיות:\n`);

    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. בעיה בפונקציה: ${issue.functionName}`);
      console.log(`   שורה: ${issue.lineNumber}, עמודה: ${issue.column}`);
      console.log(`   קטע קוד: ${issue.context}`);
      console.log(`   הסבר: ${issue.explanation}`);
      console.log(`   תיקון מוצע: ${issue.fix.original} → ${issue.fix.corrected}`);
      console.log(`   סיבה: ${issue.fix.reason}\n`);
    });
  }

  suggestFixes() {
    if (this.issues.length === 0) return;

    console.log('💡 הצעות לתיקון:');
    console.log('');

    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. עבור הפונקציה ${issue.functionName}:`);
      console.log('   ```typescript');
      console.log(`   // במקום:`);
      console.log(`   ${issue.fix.original}`);
      console.log('   ');
      console.log(`   // השתמש ב:`);
      console.log(`   ${issue.fix.corrected}`);
      console.log('   ```');
      console.log('');
    });
  }

  async applyFixes(auto = false) {
    if (this.issues.length === 0) {
      console.log('✅ אין תיקונים להחיל');
      return;
    }

    if (!auto) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('❓ האם להחיל את כל התיקונים האוטומטיים? (y/n)');
      const answer = await this.question(rl, '');

      if (answer.toLowerCase() !== 'y') {
        console.log('תיקונים לא הוחלו');
        rl.close();
        return;
      }

      rl.close();
    }

    let newContent = this.content;

    // החל תיקונים מהסוף להתחלה כדי לא לשנות אינדקסים
    const sortedIssues = [...this.issues].sort((a, b) => b.lineNumber - a.lineNumber);

    sortedIssues.forEach(issue => {
      const oldCode = issue.fix.original;
      const newCode = issue.fix.corrected;
      newContent = newContent.replace(oldCode, newCode);
    });

    fs.writeFileSync(this.filePath, newContent);
    console.log(`✅ הוחלו ${this.issues.length} תיקונים בהצלחה!`);
  }

  question(rl, query) {
    return new Promise(resolve => {
      rl.question(query, resolve);
    });
  }
}

// הפעלה
async function main() {
  const validator = new SmartValidator();
  await validator.validate();

  if (process.argv.includes('--fix')) {
    await validator.applyFixes(process.argv.includes('--auto'));
  }
}

export { SmartValidator };
