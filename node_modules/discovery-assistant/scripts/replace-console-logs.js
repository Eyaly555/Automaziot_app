#!/usr/bin/env node

/**
 * Script to replace console.log statements with logger calls
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript/TSX files
function findTsFiles(dir) {
  const files = [];

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
        scan(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

// Replace console.log patterns
function replaceConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern for console.log, console.warn, console.error, console.info
  const consolePatterns = [
    {
      pattern: /console\.log\(([^)]+)\);?/g,
      replacement: (match, args) => {
        // Check if it's a simple string literal
        if (args.match(/^['"`][^'"`]*['"`]$/)) {
          return `logger.debug(${args});`;
        } else {
          return `logger.debug(${args});`;
        }
      }
    },
    {
      pattern: /console\.warn\(([^)]+)\);?/g,
      replacement: (match, args) => `logger.warn(${args});`
    },
    {
      pattern: /console\.error\(([^)]+)\);?/g,
      replacement: (match, args) => `logger.error(${args});`
    },
    {
      pattern: /console\.info\(([^)]+)\);?/g,
      replacement: (match, args) => `logger.info(${args});`
    }
  ];

  for (const { pattern, replacement } of consolePatterns) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, '../src');
  const files = findTsFiles(srcDir);

  console.log(`Found ${files.length} TypeScript files to process...`);

  let updatedCount = 0;
  for (const file of files) {
    if (replaceConsoleLogs(file)) {
      updatedCount++;
    }
  }

  console.log(`\n✅ Completed! Updated ${updatedCount} files.`);

  if (updatedCount > 0) {
    console.log('\n⚠️  Please review the changes and ensure:');
    console.log('   1. Add import: import { logger } from \'../utils/consoleLogger\';');
    console.log('   2. Check that complex console.log calls work correctly');
    console.log('   3. Test the application to ensure logging works as expected');
  }
}

if (require.main === module) {
  main();
}
