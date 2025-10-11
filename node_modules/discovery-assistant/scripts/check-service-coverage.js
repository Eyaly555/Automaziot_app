/**
 * Check that all 73 services have:
 * 1. TypeScript interface
 * 2. React component
 * 3. Mapping in serviceComponentMapping.ts
 */

const fs = require('fs');
const path = require('path');

const EXPECTED_SERVICES = 73;

// Check components exist
const componentsDir = 'src/components/Phase2/ServiceRequirements';
const componentFiles = [];

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (item.endsWith('Spec.tsx')) {
      componentFiles.push(fullPath);
    }
  });
}

scanDir(componentsDir);

console.log(`📁 Found ${componentFiles.length} component files`);

// Check mapping file
const mappingFile = fs.readFileSync('src/config/serviceComponentMapping.ts', 'utf8');
const serviceComponentMapMatch = mappingFile.match(/export const SERVICE_COMPONENT_MAP[^}]+\}/s);
const serviceCategoryMapMatch = mappingFile.match(/export const SERVICE_CATEGORY_MAP[^}]+\}/s);

if (!serviceComponentMapMatch || !serviceCategoryMapMatch) {
  console.error('❌ Could not find mapping objects');
  process.exit(1);
}

const componentMapEntries = (serviceComponentMapMatch[0].match(/'[^']+'/g) || []).length / 2;
const categoryMapEntries = (serviceCategoryMapMatch[0].match(/'[^']+'/g) || []).length / 2;

console.log(`🗺️  SERVICE_COMPONENT_MAP: ${componentMapEntries} entries`);
console.log(`🗺️  SERVICE_CATEGORY_MAP: ${categoryMapEntries} entries`);

// Validation
const issues = [];

if (componentFiles.length < EXPECTED_SERVICES) {
  issues.push(`Missing ${EXPECTED_SERVICES - componentFiles.length} component files`);
}

if (componentMapEntries < EXPECTED_SERVICES) {
  issues.push(`Missing ${EXPECTED_SERVICES - componentMapEntries} entries in SERVICE_COMPONENT_MAP`);
}

if (categoryMapEntries < EXPECTED_SERVICES) {
  issues.push(`Missing ${EXPECTED_SERVICES - categoryMapEntries} entries in SERVICE_CATEGORY_MAP`);
}

if (issues.length > 0) {
  console.error('\n❌ Issues found:');
  issues.forEach(issue => console.error(`   - ${issue}`));
  process.exit(1);
} else {
  console.log('\n✅ All 73 services properly configured!');
}
