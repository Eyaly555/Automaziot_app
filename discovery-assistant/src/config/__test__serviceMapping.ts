/**
 * Quick validation test for service-to-system mapping
 * Run this to verify all 59 services are mapped correctly
 */

import { SERVICES_DATABASE } from './servicesDatabase';
import {
  validateServiceMappings,
  getRequiredSystemsForServices,
  getRequiredIntegrationsForServices,
  getRequiredAIAgentsForServices,
  getServicesBySystem,
  getServicesByIntegration,
  getServicesByAIAgent,
  getAggregatedRequirements
} from './serviceToSystemMapping';

console.log('='.repeat(80));
console.log('SERVICE-TO-SYSTEM MAPPING VALIDATION TEST');
console.log('='.repeat(80));
console.log();

// 1. Validate all mappings
console.log('1. VALIDATION CHECK');
console.log('-'.repeat(80));
const validation = validateServiceMappings();

if (validation.isValid) {
  console.log('✅ ALL MAPPINGS VALID!');
} else {
  console.log('❌ VALIDATION FAILED!');
  validation.errors.forEach(error => console.error(`   ${error}`));
}

if (validation.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  validation.warnings.forEach(warning => console.warn(`   ${warning}`));
}

console.log('\nStatistics:');
console.log(`   Total Services: ${validation.stats.totalServices}`);
console.log(`   Mapped Services: ${validation.stats.mappedServices}`);
console.log(`   Unmapped: ${validation.stats.unmappedServices}`);
console.log(`   With Systems: ${validation.stats.servicesWithSystems}`);
console.log(`   With Integrations: ${validation.stats.servicesWithIntegrations}`);
console.log(`   With AI Agents: ${validation.stats.servicesWithAI}`);
console.log();

// 2. Test helper functions
console.log('2. HELPER FUNCTION TESTS');
console.log('-'.repeat(80));

// Test case: Lead management services
const leadServices = ['auto-lead-response', 'auto-crm-update', 'ai-lead-qualifier'];
const leadSystems = getRequiredSystemsForServices(leadServices);
const leadIntegrations = getRequiredIntegrationsForServices(leadServices);
const leadAI = getRequiredAIAgentsForServices(leadServices);

console.log('Test: Lead Management Services');
console.log(`   Services: ${leadServices.join(', ')}`);
console.log(`   Required Systems: ${leadSystems.join(', ')}`);
console.log(`   Required Integrations: ${leadIntegrations.join(', ')}`);
console.log(`   Required AI Agents: ${leadAI.length > 0 ? leadAI.join(', ') : 'None'}`);
console.log();

// Test case: AI services
const aiServices = ['ai-sales-agent', 'ai-service-agent', 'ai-faq-bot'];
const aiSummary = getAggregatedRequirements(aiServices);
console.log('Test: AI Agent Services');
console.log(`   Services: ${aiServices.join(', ')}`);
console.log(`   Total Systems: ${aiSummary.totalSystems}`);
console.log(`   Systems: ${aiSummary.uniqueSystems.join(', ')}`);
console.log(`   Total Integrations: ${aiSummary.totalIntegrations}`);
console.log(`   Integrations: ${aiSummary.uniqueIntegrations.join(', ')}`);
console.log(`   Total AI Agents: ${aiSummary.totalAIAgents}`);
console.log(`   AI Agents: ${aiSummary.uniqueAIAgents.join(', ')}`);
console.log();

// 3. Reverse lookup tests
console.log('3. REVERSE LOOKUP TESTS');
console.log('-'.repeat(80));

const crmServices = getServicesBySystem('crm');
console.log(`Services requiring CRM: ${crmServices.length} services`);
console.log(`   First 5: ${crmServices.slice(0, 5).join(', ')}`);
console.log();

const salesAIServices = getServicesByAIAgent('sales');
console.log(`Services requiring Sales AI: ${salesAIServices.length} services`);
console.log(`   All: ${salesAIServices.join(', ')}`);
console.log();

const websiteCRMIntegrations = getServicesByIntegration('website_to_crm');
console.log(`Services requiring Website→CRM integration: ${websiteCRMIntegrations.length} services`);
console.log(`   All: ${websiteCRMIntegrations.join(', ')}`);
console.log();

// 4. Category breakdown
console.log('4. SERVICES BY CATEGORY');
console.log('-'.repeat(80));

const categories = {
  automations: SERVICES_DATABASE.filter(s => s.category === 'automations'),
  ai_agents: SERVICES_DATABASE.filter(s => s.category === 'ai_agents'),
  integrations: SERVICES_DATABASE.filter(s => s.category === 'integrations'),
  system_implementation: SERVICES_DATABASE.filter(s => s.category === 'system_implementation'),
  additional_services: SERVICES_DATABASE.filter(s => s.category === 'additional_services')
};

Object.entries(categories).forEach(([category, services]) => {
  console.log(`   ${category}: ${services.length} services`);
});
console.log();

// 5. Summary
console.log('5. MAPPING SUMMARY');
console.log('-'.repeat(80));
console.log(`✅ Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
console.log(`📊 Coverage: ${validation.stats.mappedServices}/${validation.stats.totalServices} services mapped`);
console.log(`🎯 Completeness: ${Math.round((validation.stats.mappedServices / validation.stats.totalServices) * 100)}%`);

if (validation.stats.unmappedServices > 0) {
  console.log(`⚠️  Missing: ${validation.stats.unmappedServices} services need mapping`);
}

console.log();
console.log('='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));
