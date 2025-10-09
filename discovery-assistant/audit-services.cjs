const fs = require('fs');

// Read servicesDatabase.ts and extract service IDs
const dbContent = fs.readFileSync('src/config/servicesDatabase.ts', 'utf8');

// Extract service IDs from SERVICES_DATABASE array only
const servicesDbStart = dbContent.indexOf('export const SERVICES_DATABASE: ServiceItem[] = [');
const servicesDbEnd = dbContent.indexOf('];', servicesDbStart);
const servicesDbSection = dbContent.substring(servicesDbStart, servicesDbEnd);
const dbMatches = servicesDbSection.matchAll(/id: '([^']+)'/g);
const dbServices = Array.from(dbMatches).map(m => m[1]);

// Read serviceComponentMapping.ts
const mappingContent = fs.readFileSync('src/config/serviceComponentMapping.ts', 'utf8');

// Extract SERVICE_COMPONENT_MAP entries
const componentMapStart = mappingContent.indexOf('export const SERVICE_COMPONENT_MAP');
const componentMapEnd = mappingContent.indexOf('};', componentMapStart);
const componentMapSection = mappingContent.substring(componentMapStart, componentMapEnd);
const componentMatches = componentMapSection.matchAll(/'([^']+)':/g);
const componentServices = Array.from(componentMatches).map(m => m[1]);

// Extract SERVICE_CATEGORY_MAP entries
const categoryMapStart = mappingContent.indexOf('export const SERVICE_CATEGORY_MAP');
const categoryMapEnd = mappingContent.indexOf('};', categoryMapStart);
const categoryMapSection = mappingContent.substring(categoryMapStart, categoryMapEnd);
const categoryMatches = categoryMapSection.matchAll(/'([^']+)':/g);
const categoryServices = Array.from(categoryMatches).map(m => m[1]);

console.log('=== PHASE 2 SERVICE REQUIREMENTS SYSTEM AUDIT ===\n');
console.log('TOTALS:');
console.log('  Services in Database:        ', dbServices.length);
console.log('  Entries in Component Map:    ', componentServices.length);
console.log('  Entries in Category Map:     ', categoryServices.length);

console.log('\n=== DISCREPANCY ANALYSIS ===');

// Services in mapping but not in database
const inMappingNotInDb = componentServices.filter(s => !dbServices.includes(s));
console.log('\nServices in MAPPING but NOT in DATABASE:', inMappingNotInDb.length);
if (inMappingNotInDb.length > 0) {
  inMappingNotInDb.forEach(s => console.log('  - ' + s));
}

// Services in database but not in mapping
const inDbNotInMapping = dbServices.filter(s => !componentServices.includes(s));
console.log('\nServices in DATABASE but NOT in MAPPING:', inDbNotInMapping.length);
if (inDbNotInMapping.length > 0) {
  inDbNotInMapping.forEach(s => console.log('  - ' + s));
}

// Component map vs category map
const inComponentNotCategory = componentServices.filter(s => !categoryServices.includes(s));
console.log('\nServices in COMPONENT MAP but NOT in CATEGORY MAP:', inComponentNotCategory.length);
if (inComponentNotCategory.length > 0) {
  inComponentNotCategory.forEach(s => console.log('  - ' + s));
}

const inCategoryNotComponent = categoryServices.filter(s => !componentServices.includes(s));
console.log('\nServices in CATEGORY MAP but NOT in COMPONENT MAP:', inCategoryNotComponent.length);
if (inCategoryNotComponent.length > 0) {
  inCategoryNotComponent.forEach(s => console.log('  - ' + s));
}

// Category breakdown from database
console.log('\n=== DATABASE BREAKDOWN BY CATEGORY ===');
const dbByCategory = {
  'automations': 0,
  'ai_agents': 0,
  'integrations': 0,
  'system_implementation': 0,
  'additional_services': 0
};

dbServices.forEach(id => {
  const escapedId = id.replace(/[-]/g, '\\-');
  const serviceMatch = servicesDbSection.match(new RegExp(`id: '${escapedId}'[\\s\\S]{0,500}?category: '([^']+)'`));
  if (serviceMatch) {
    const cat = serviceMatch[1];
    if (dbByCategory[cat] !== undefined) {
      dbByCategory[cat]++;
    }
  }
});

Object.entries(dbByCategory).forEach(([cat, count]) => {
  console.log(`  ${cat.padEnd(25)} ${count}`);
});
console.log(`  ${'TOTAL'.padEnd(25)} ${dbServices.length}`);

// Category breakdown from mapping
console.log('\n=== MAPPING BREAKDOWN BY CATEGORY ===');
const mappingByCategory = {
  'automations': 0,
  'aiAgentServices': 0,
  'integrationServices': 0,
  'systemImplementations': 0,
  'additionalServices': 0
};

categoryServices.forEach(id => {
  const escapedId = id.replace(/[-]/g, '\\-');
  const catMatch = categoryMapSection.match(new RegExp(`'${escapedId}':\\s*'([^']+)'`));
  if (catMatch) {
    const cat = catMatch[1];
    if (mappingByCategory[cat] !== undefined) {
      mappingByCategory[cat]++;
    }
  }
});

Object.entries(mappingByCategory).forEach(([cat, count]) => {
  console.log(`  ${cat.padEnd(25)} ${count}`);
});
console.log(`  ${'TOTAL'.padEnd(25)} ${categoryServices.length}`);

// Check for duplicates
console.log('\n=== DUPLICATE CHECK ===');
const componentDuplicates = componentServices.filter((s, i) => componentServices.indexOf(s) !== i);
const categoryDuplicates = categoryServices.filter((s, i) => categoryServices.indexOf(s) !== i);
const dbDuplicates = dbServices.filter((s, i) => dbServices.indexOf(s) !== i);

console.log('Duplicates in Component Map:', componentDuplicates.length);
if (componentDuplicates.length > 0) {
  componentDuplicates.forEach(s => console.log('  - ' + s));
}

console.log('Duplicates in Category Map:', categoryDuplicates.length);
if (categoryDuplicates.length > 0) {
  categoryDuplicates.forEach(s => console.log('  - ' + s));
}

console.log('Duplicates in Database:', dbDuplicates.length);
if (dbDuplicates.length > 0) {
  dbDuplicates.forEach(s => console.log('  - ' + s));
}

// List all unique component files referenced
console.log('\n=== COMPONENT FILE ANALYSIS ===');
const componentImports = mappingContent.match(/import \{ (\w+) \} from/g);
const uniqueComponents = new Set();
if (componentImports) {
  componentImports.forEach(imp => {
    const match = imp.match(/import \{ (\w+) \}/);
    if (match) {
      uniqueComponents.add(match[1]);
    }
  });
}
console.log('Unique Component Files Imported:', uniqueComponents.size);
console.log('Total Service Mappings:', componentServices.length);
console.log('Reused Components (mappings - files):', componentServices.length - uniqueComponents.size);

// Overall status
console.log('\n=== OVERALL STATUS ===');
const totalDiscrepancies = inMappingNotInDb.length + inDbNotInMapping.length +
  inComponentNotCategory.length + inCategoryNotComponent.length +
  componentDuplicates.length + categoryDuplicates.length + dbDuplicates.length;

if (totalDiscrepancies === 0 && componentServices.length === categoryServices.length && componentServices.length === dbServices.length + 1) {
  console.log('✓ NEAR-PERFECT CONSISTENCY');
  console.log(`  Total services in database: ${dbServices.length}`);
  console.log(`  Total mappings: ${componentServices.length}`);
  console.log(`  Unique components: ${uniqueComponents.size}`);
  if (inMappingNotInDb.length === 1 && inMappingNotInDb[0] === 'impl-marketing-automation') {
    console.log(`  Note: impl-marketing-automation is an alias for impl-marketing (acceptable)`);
  }
} else if (totalDiscrepancies === 0) {
  console.log('✓ PERFECT CONSISTENCY - All systems synchronized');
  console.log(`  Total services: ${dbServices.length}`);
  console.log(`  All ${componentServices.length} mappings are consistent`);
} else {
  console.log(`✗ INCONSISTENCIES FOUND - ${totalDiscrepancies} issues detected`);
  console.log(`  Please review the discrepancies above`);
}
