const fs = require('fs');

// Read servicesDatabase.ts and extract service IDs with categories
const dbContent = fs.readFileSync('src/config/servicesDatabase.ts', 'utf8');
const servicesDbStart = dbContent.indexOf('export const SERVICES_DATABASE: ServiceItem[] = [');
const servicesDbEnd = dbContent.indexOf('];', servicesDbStart);
const servicesDbSection = dbContent.substring(servicesDbStart, servicesDbEnd);

// Extract all services with their categories from database
const dbServiceCategories = {};
const serviceBlocks = servicesDbSection.split('},');
serviceBlocks.forEach(block => {
  const idMatch = block.match(/id: '([^']+)'/);
  const catMatch = block.match(/category: '([^']+)'/);
  if (idMatch && catMatch) {
    dbServiceCategories[idMatch[1]] = catMatch[1];
  }
});

// Read serviceComponentMapping.ts
const mappingContent = fs.readFileSync('src/config/serviceComponentMapping.ts', 'utf8');

// Extract SERVICE_CATEGORY_MAP entries with their categories
const categoryMapStart = mappingContent.indexOf('export const SERVICE_CATEGORY_MAP');
const categoryMapEnd = mappingContent.indexOf('};', categoryMapStart);
const categoryMapSection = mappingContent.substring(categoryMapStart, categoryMapEnd);

const mappingServiceCategories = {};
const mappingLines = categoryMapSection.split('\n');
mappingLines.forEach(line => {
  const match = line.match(/'([^']+)':\s*'([^']+)'/);
  if (match) {
    mappingServiceCategories[match[1]] = match[2];
  }
});

console.log('=== CATEGORY CONSISTENCY ANALYSIS ===\n');

// Category name mapping
const categoryMapping = {
  'automations': 'automations',
  'ai_agents': 'aiAgentServices',
  'integrations': 'integrationServices',
  'system_implementation': 'systemImplementations',
  'additional_services': 'additionalServices'
};

// Find services with category mismatches
console.log('CATEGORY MISMATCHES:');
let mismatches = 0;
Object.keys(dbServiceCategories).forEach(serviceId => {
  const dbCategory = dbServiceCategories[serviceId];
  const expectedMappingCategory = categoryMapping[dbCategory];
  const actualMappingCategory = mappingServiceCategories[serviceId];

  if (actualMappingCategory && actualMappingCategory !== expectedMappingCategory) {
    console.log(`  ${serviceId}`);
    console.log(`    Database:  ${dbCategory} (should map to ${expectedMappingCategory})`);
    console.log(`    Mapping:   ${actualMappingCategory}`);
    console.log('');
    mismatches++;
  }
});

if (mismatches === 0) {
  console.log('  None - all categories match!\n');
}

// Find services in database but not in mapping
console.log('SERVICES IN DATABASE BUT NOT IN MAPPING:');
let notInMapping = 0;
Object.keys(dbServiceCategories).forEach(serviceId => {
  if (!mappingServiceCategories[serviceId]) {
    console.log(`  - ${serviceId} (${dbServiceCategories[serviceId]})`);
    notInMapping++;
  }
});
if (notInMapping === 0) {
  console.log('  None\n');
} else {
  console.log('');
}

// Find services in mapping but not in database
console.log('SERVICES IN MAPPING BUT NOT IN DATABASE:');
let notInDb = 0;
Object.keys(mappingServiceCategories).forEach(serviceId => {
  if (!dbServiceCategories[serviceId]) {
    console.log(`  - ${serviceId} (mapped to ${mappingServiceCategories[serviceId]})`);
    notInDb++;
  }
});
if (notInDb === 0) {
  console.log('  None\n');
} else {
  console.log('');
}

// Breakdown by category
console.log('=== DETAILED BREAKDOWN ===\n');
console.log('AUTOMATIONS:');
console.log('  In Database (category=automations):', Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'automations').length);
console.log('  In Mapping (category=automations):', Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'automations').length);

console.log('\nAI AGENTS:');
console.log('  In Database (category=ai_agents):', Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'ai_agents').length);
console.log('  In Mapping (category=aiAgentServices):', Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'aiAgentServices').length);

console.log('\nINTEGRATIONS:');
console.log('  In Database (category=integrations):', Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'integrations').length);
console.log('  In Mapping (category=integrationServices):', Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'integrationServices').length);

// List integrations to find the discrepancy
const dbIntegrations = Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'integrations');
const mappingIntegrations = Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'integrationServices');
console.log('\n  Services in DB with category=integrations:');
dbIntegrations.forEach(s => console.log(`    - ${s}`));
console.log('\n  Services in Mapping with category=integrationServices:');
mappingIntegrations.forEach(s => console.log(`    - ${s}`));

console.log('\nSYSTEM IMPLEMENTATIONS:');
console.log('  In Database (category=system_implementation):', Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'system_implementation').length);
console.log('  In Mapping (category=systemImplementations):', Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'systemImplementations').length);

// List system implementations to find the extra one
const dbSystemImpl = Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'system_implementation');
const mappingSystemImpl = Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'systemImplementations');
console.log('\n  Services in DB with category=system_implementation:');
dbSystemImpl.forEach(s => console.log(`    - ${s}`));
console.log('\n  Services in Mapping with category=systemImplementations:');
mappingSystemImpl.forEach(s => console.log(`    - ${s}`));

console.log('\nADDITIONAL SERVICES:');
console.log('  In Database (category=additional_services):', Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'additional_services').length);
console.log('  In Mapping (category=additionalServices):', Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'additionalServices').length);

// List additional services to find the extra one
const dbAdditional = Object.keys(dbServiceCategories).filter(s => dbServiceCategories[s] === 'additional_services');
const mappingAdditional = Object.keys(mappingServiceCategories).filter(s => mappingServiceCategories[s] === 'additionalServices');
console.log('\n  Services in DB with category=additional_services:');
dbAdditional.forEach(s => console.log(`    - ${s}`));
console.log('\n  Services in Mapping with category=additionalServices:');
mappingAdditional.forEach(s => console.log(`    - ${s}`));
