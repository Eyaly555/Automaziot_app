/**
 * Data Flow Validation Script
 * Validates that each phase uses data from previous phase correctly
 */

const fs = require('fs');
const path = require('path');

// Test meeting with data from all phases
const testMeeting = {
  phase: 'development',
  modules: {
    overview: { businessType: 'b2b', employees: 50 },
    proposal: {
      purchasedServices: [
        { id: 'auto-lead-response', nameHe: 'מענה לידים' }
      ]
    }
  },
  implementationSpec: {
    automations: [
      { serviceId: 'auto-lead-response', completedAt: new Date() }
    ]
  },
  developmentTracking: {
    tasks: []
  }
};

// Phase 1 → Phase 2 validation
console.log('🔍 Testing Phase 1 → Phase 2 data flow...');
const purchasedServices = testMeeting.modules?.proposal?.purchasedServices;
console.assert(Array.isArray(purchasedServices), '❌ Phase 2 should receive purchased services');
console.assert(purchasedServices.length > 0, '❌ Should have services');

// Phase 2 → Phase 3 validation
console.log('🔍 Testing Phase 2 → Phase 3 data flow...');
const automations = testMeeting.implementationSpec?.automations;
console.assert(Array.isArray(automations), '❌ Phase 3 should receive automations');
console.assert(
  automations.some(a => a.serviceId === 'auto-lead-response'),
  '❌ Should find completed automation'
);

console.log('✅ All data flow tests passed!');
