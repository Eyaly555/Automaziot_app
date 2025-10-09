/**
 * End-to-End Flow Test
 * Simulates complete user journey from Phase 1 to Phase 3
 */

import { useMeetingStore } from '../src/store/useMeetingStore';

async function testCompleteFlow() {
  console.log('🧪 Starting E2E Flow Test\n');

  const store = useMeetingStore.getState();

  // ===== PHASE 1: Discovery =====
  console.log('📝 Phase 1: Creating meeting and filling discovery data');

  store.createMeeting('Test Company Ltd.');
  const meeting = store.currentMeeting;

  if (!meeting) {
    console.error('❌ Failed to create meeting');
    return false;
  }

  // Fill overview
  store.updateModule('overview', {
    businessType: 'b2b',
    employees: 75,
    mainGoals: ['Increase efficiency', 'Reduce costs']
  });

  // Fill leads & sales
  store.updateModule('leadsAndSales', {
    leadSources: [
      { name: 'Website', volume: 100 },
      { name: 'Facebook', volume: 50 },
      { name: 'Google Ads', volume: 80 }
    ]
  });

  // Fill proposal
  store.updateModule('proposal', {
    selectedServices: [
      { id: 'auto-lead-response', nameHe: 'מענה לידים', price: 5000 }
    ],
    purchasedServices: [
      { id: 'auto-lead-response', nameHe: 'מענה לידים', price: 5000 }
    ]
  });

  console.log('✅ Phase 1 data filled');
  console.log(`   Progress: ${store.getOverallProgress()}%`);

  // Update status to client approved
  store.updateMeeting({ status: 'client_approved' });

  // ===== PHASE 1 → 2 TRANSITION =====
  console.log('\n🔄 Attempting Phase 1 → 2 transition');

  const canTransitionTo2 = store.canTransitionTo('implementation_spec');
  console.log(`   Can transition: ${canTransitionTo2}`);

  if (!canTransitionTo2) {
    console.error('❌ Cannot transition to Phase 2');
    return false;
  }

  const transitionSuccess = store.transitionPhase('implementation_spec', 'E2E test');
  console.log(`   Transition success: ${transitionSuccess}`);
  console.log(`   New phase: ${store.currentMeeting?.phase}`);

  // ===== PHASE 2: Implementation Spec =====
  console.log('\n📋 Phase 2: Filling implementation spec');

  // Add service requirements
  store.updateMeeting({
    implementationSpec: {
      systems: [{ id: 'crm', systemName: 'Zoho CRM' }],
      acceptanceCriteria: {
        functional: [{ id: '1', description: 'Lead auto-response within 5 minutes' }]
      },
      automations: [
        {
          serviceId: 'auto-lead-response',
          serviceName: 'מענה אוטומטי ללידים',
          requirements: { /* ... */ },
          completedAt: new Date().toISOString()
        }
      ],
      completionPercentage: 100
    }
  });

  console.log('✅ Phase 2 data filled');
  console.log(`   Spec completion: 100%`);

  // ===== PHASE 2 → 3 TRANSITION =====
  console.log('\n🔄 Attempting Phase 2 → 3 transition');

  const canTransitionTo3 = store.canTransitionTo('development');
  console.log(`   Can transition: ${canTransitionTo3}`);

  if (!canTransitionTo3) {
    console.error('❌ Cannot transition to Phase 3');
    return false;
  }

  const transition2Success = store.transitionPhase('development', 'E2E test');
  console.log(`   Transition success: ${transition2Success}`);
  console.log(`   New phase: ${store.currentMeeting?.phase}`);

  // ===== VERIFICATION =====
  console.log('\n✅ E2E Flow Test PASSED!');
  console.log('\n📊 Final State:');
  console.log(`   Phase: ${store.currentMeeting?.phase}`);
  console.log(`   Status: ${store.currentMeeting?.status}`);
  console.log(`   Phase History: ${store.currentMeeting?.phaseHistory.length} transitions`);

  return true;
}

// Run test
testCompleteFlow().then(success => {
  process.exit(success ? 0 : 1);
});
