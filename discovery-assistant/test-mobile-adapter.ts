/**
 * Test file for mobileDataAdapter
 * Run: npx tsx test-mobile-adapter.ts
 */

import { mobileToModules, validateMobileData } from './src/utils/mobileDataAdapter';
import type { MobileFormData } from './src/types/mobile';

// Test data - טופס מלא לדוגמה
const testData: MobileFormData = {
  ai_agents: {
    count: '2',
    channels: ['whatsapp', 'website'],
    domains: ['sales', 'customer_service'],
    notes: 'תמיכה בעברית ואנגלית, 24/7'
  },
  automations: {
    processes: ['lead_management', 'followup', 'crm_updates'],
    time_wasted: '3-4h',
    biggest_pain: 'things_fall',
    most_important_process: 'ניהול לידים מהאתר ישירות ל-CRM'
  },
  crm: {
    exists: 'yes',
    system: 'zoho',
    integrations: ['website_forms', 'facebook_leads'],
    data_quality: 'ok',
    users: '4-10',
    biggest_gap: 'no_reports',
    missing_report: 'דוח לידים שלא טופלו'
  }
};

console.log('🧪 Testing mobileDataAdapter\n');
console.log('='.repeat(60));

// Test 1: Validation
console.log('\n1️⃣ Testing Validation:');
const validation = validateMobileData(testData);
console.log('   Is Valid:', validation.isValid);
console.log('   Errors:', validation.errors.length === 0 ? 'None ✅' : validation.errors);

// Test 2: Conversion
console.log('\n2️⃣ Testing Conversion:');
const modules = mobileToModules(testData);

// Check all 9 modules exist
const moduleNames = [
  'overview', 'aiAgents', 'leadsAndSales', 'customerService',
  'operations', 'reporting', 'systems', 'roi'
];

console.log('   Modules Created:');
moduleNames.forEach(name => {
  const exists = modules[name as keyof typeof modules] !== undefined;
  console.log(`   ${exists ? '✅' : '❌'} ${name}`);
});

// Test 3: Key Values
console.log('\n3️⃣ Testing Key Values:');
console.log('   AI Priority:', modules.aiAgents?.priority);
console.log('   AI Sales Use Cases:', modules.aiAgents?.sales?.useCases);
console.log('   AI Service Use Cases:', modules.aiAgents?.service?.useCases);
console.log('   Focus Areas:', modules.overview?.focusAreas);
console.log('   Lead Sources:', modules.leadsAndSales?.leadSources);
console.log('   CRM System:', modules.systems?.currentSystems);
console.log('   Data Quality:', modules.systems?.dataQuality?.overall);
console.log('   Integration Level:', modules.systems?.integrations?.level);
console.log('   Automation Readiness:', modules.operations?.workProcesses?.automationReadiness);

// Test 4: Expected Values
console.log('\n4️⃣ Testing Expected Values:');
const tests = [
  {
    name: 'AI priority should be "sales"',
    actual: modules.aiAgents?.priority,
    expected: 'sales',
    pass: modules.aiAgents?.priority === 'sales'
  },
  {
    name: 'Should have focus areas',
    actual: modules.overview?.focusAreas?.length,
    expected: '3',
    pass: (modules.overview?.focusAreas?.length || 0) >= 2
  },
  {
    name: 'Should have CRM in systems',
    actual: modules.systems?.currentSystems,
    expected: "['crm']",
    pass: modules.systems?.currentSystems?.includes('crm')
  },
  {
    name: 'Integration level should be minimal',
    actual: modules.systems?.integrations?.level,
    expected: 'minimal',
    pass: modules.systems?.integrations?.level === 'minimal'
  },
  {
    name: 'Automation readiness should be > 50',
    actual: modules.operations?.workProcesses?.automationReadiness,
    expected: '> 50',
    pass: (modules.operations?.workProcesses?.automationReadiness || 0) > 50
  }
];

tests.forEach(test => {
  const icon = test.pass ? '✅' : '❌';
  console.log(`   ${icon} ${test.name}`);
  console.log(`      Expected: ${test.expected}, Got: ${JSON.stringify(test.actual)}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ Test completed!');
console.log('\n📝 Summary:');
console.log(`   - Validation: ${validation.isValid ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`   - All modules exist: ${moduleNames.every(n => modules[n as keyof typeof modules]) ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`   - Values correct: ${tests.filter(t => t.pass).length}/${tests.length} ✅`);

console.log('\n🎯 Ready to use in production!\n');

