#!/usr/bin/env node

/**
 * Test Discovery Status Workflow
 *
 * This script tests all 5 stages of the Discovery_Status workflow:
 * 1. discovery_started
 * 2. proposal
 * 3. proposal_sent
 * 4. technical_details_collection
 * 5. implementation_started
 *
 * Usage:
 *   node scripts/test-discovery-status.js [recordId]
 *
 * If no recordId is provided, the script will create a test record in Zoho.
 */

import fetch from 'node-fetch';

const VERCEL_BASE_URL = process.env.VERCEL_URL || 'http://localhost:5176';
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${'='.repeat(60)}]`, 'cyan');
  log(`[STEP ${step}] ${message}`, 'bright');
  log(`[${'='.repeat(60)}]\n`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Create test meeting data
 */
function createTestMeetingData(stage) {
  const baseData = {
    meetingId: `test-${Date.now()}`,
    clientName: 'Test Client - Discovery Status',
    modules: {
      overview: {
        companyName: 'Test Company Ltd.',
        contactEmail: 'test@example.com',
        contactPhone: '+972501234567',
      }
    },
    phase: 'discovery',
    status: 'not_started'
  };

  // Stage 1: Just basic data (discovery_started)
  if (stage === 1) {
    return baseData;
  }

  // Stage 2: Add selected services (proposal)
  if (stage === 2) {
    return {
      ...baseData,
      modules: {
        ...baseData.modules,
        proposal: {
          selectedServices: [
            {
              id: 'auto-lead-response',
              name: 'Auto Lead Response',
              nameHe: 'מענה אוטומטי לפניות',
              selected: true,
              basePrice: 5000,
              estimatedDays: 7
            }
          ]
        }
      }
    };
  }

  // Stage 3: Proposal sent (proposal_sent)
  if (stage === 3) {
    return {
      ...baseData,
      modules: {
        ...baseData.modules,
        proposal: {
          selectedServices: [
            {
              id: 'auto-lead-response',
              name: 'Auto Lead Response',
              nameHe: 'מענה אוטומטי לפניות',
              selected: true,
              basePrice: 5000,
              estimatedDays: 7
            }
          ],
          proposalSent: true,
          proposalSentAt: new Date().toISOString()
        }
      }
    };
  }

  // Stage 4: Client approved (technical_details_collection)
  if (stage === 4) {
    return {
      ...baseData,
      modules: {
        ...baseData.modules,
        proposal: {
          selectedServices: [
            {
              id: 'auto-lead-response',
              name: 'Auto Lead Response',
              nameHe: 'מענה אוטומטי לפניות',
              selected: true,
              basePrice: 5000,
              estimatedDays: 7
            }
          ],
          proposalSent: true,
          proposalSentAt: new Date().toISOString(),
          approvedBy: 'Test Client',
          approvedAt: new Date().toISOString()
        }
      },
      status: 'client_approved'
    };
  }

  // Stage 5: Phase 2 complete (implementation_started)
  if (stage === 5) {
    return {
      ...baseData,
      modules: {
        ...baseData.modules,
        proposal: {
          selectedServices: [
            {
              id: 'auto-lead-response',
              name: 'Auto Lead Response',
              nameHe: 'מענה אוטומטי לפניות',
              selected: true,
              basePrice: 5000,
              estimatedDays: 7
            }
          ],
          proposalSent: true,
          proposalSentAt: new Date().toISOString(),
          approvedBy: 'Test Client',
          approvedAt: new Date().toISOString()
        }
      },
      status: 'client_approved',
      phase: 'development',
      implementationSpec: {
        completionPercentage: 100,
        automations: [
          {
            serviceId: 'auto-lead-response',
            serviceName: 'מענה אוטומטי לפניות',
            requirements: {},
            completedAt: new Date().toISOString()
          }
        ]
      }
    };
  }

  return baseData;
}

/**
 * Sync meeting to Zoho
 */
async function syncToZoho(meetingData, recordId = null) {
  const endpoint = `${VERCEL_BASE_URL}/api/zoho/sync`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meeting: meetingData,
      recordId: recordId,
      module: 'Potentials1'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sync failed: ${error}`);
  }

  return await response.json();
}

/**
 * Verify Discovery_Status in Zoho
 */
async function verifyZohoStatus(recordId, expectedStatus) {
  // Get access token
  const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: ZOHO_REFRESH_TOKEN,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: 'refresh_token'
    })
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Fetch record
  const recordResponse = await fetch(
    `https://www.zohoapis.com/crm/v8/Potentials1/${recordId}?fields=Discovery_Status`,
    {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`
      }
    }
  );

  const recordData = await recordResponse.json();
  const actualStatus = recordData.data?.[0]?.Discovery_Status;

  return {
    expected: expectedStatus,
    actual: actualStatus,
    matches: actualStatus === expectedStatus
  };
}

/**
 * Wait for a specified time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main test function
 */
async function runTests(recordId = null) {
  log('\n🧪 DISCOVERY STATUS WORKFLOW TEST', 'bright');
  log('═'.repeat(70), 'cyan');
  log(`Base URL: ${VERCEL_BASE_URL}`, 'blue');
  log(`Testing ${recordId ? 'existing' : 'new'} Zoho record`, 'blue');
  log('═'.repeat(70) + '\n', 'cyan');

  // Check environment variables
  if (!ZOHO_REFRESH_TOKEN || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    logError('Missing Zoho environment variables!');
    logInfo('Required: ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET');
    process.exit(1);
  }

  const stages = [
    { num: 1, status: 'discovery_started', label: 'Discovery Started (Module Data)' },
    { num: 2, status: 'proposal', label: 'Proposal (Services Selected)' },
    { num: 3, status: 'proposal_sent', label: 'Proposal Sent (Downloaded/Printed)' },
    { num: 4, status: 'technical_details_collection', label: 'Technical Details (Client Approved)' },
    { num: 5, status: 'implementation_started', label: 'Implementation Started (Phase 2 Complete)' }
  ];

  let currentRecordId = recordId;
  const results = [];

  for (const stage of stages) {
    logStep(stage.num, stage.label);

    try {
      // Create test data for this stage
      logInfo(`Creating test meeting data for stage ${stage.num}...`);
      const meetingData = createTestMeetingData(stage.num);

      // Sync to Zoho
      logInfo('Syncing to Zoho...');
      const syncResult = await syncToZoho(meetingData, currentRecordId);

      if (!currentRecordId) {
        currentRecordId = syncResult.recordId;
        logSuccess(`Created new Zoho record: ${currentRecordId}`);
      } else {
        logSuccess(`Updated Zoho record: ${currentRecordId}`);
      }

      // Wait for sync to complete
      logInfo('Waiting for sync to complete...');
      await wait(2000);

      // Verify status
      logInfo(`Verifying Discovery_Status = "${stage.status}"...`);
      const verification = await verifyZohoStatus(currentRecordId, stage.status);

      if (verification.matches) {
        logSuccess(`✓ Status verified: "${verification.actual}"`);
        results.push({
          stage: stage.num,
          label: stage.label,
          status: stage.status,
          success: true,
          error: null
        });
      } else {
        logError(`✗ Status mismatch!`);
        logError(`  Expected: "${verification.expected}"`);
        logError(`  Actual: "${verification.actual}"`);
        results.push({
          stage: stage.num,
          label: stage.label,
          status: stage.status,
          success: false,
          error: `Expected "${verification.expected}", got "${verification.actual}"`
        });
      }

    } catch (error) {
      logError(`Test failed: ${error.message}`);
      results.push({
        stage: stage.num,
        label: stage.label,
        status: stage.status,
        success: false,
        error: error.message
      });
    }

    // Wait between stages
    if (stage.num < stages.length) {
      await wait(1000);
    }
  }

  // Print summary
  log('\n' + '═'.repeat(70), 'cyan');
  log('TEST SUMMARY', 'bright');
  log('═'.repeat(70), 'cyan');

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  results.forEach(result => {
    if (result.success) {
      logSuccess(`Stage ${result.stage}: ${result.label}`);
    } else {
      logError(`Stage ${result.stage}: ${result.label}`);
      logError(`  Error: ${result.error}`);
    }
  });

  log('\n' + '─'.repeat(70), 'cyan');

  if (successCount === totalCount) {
    logSuccess(`\nAll tests passed! ${successCount}/${totalCount} ✓`);
    logSuccess(`\nZoho Record ID: ${currentRecordId}`);
    logSuccess('View in Zoho: https://crm.zoho.com/crm/org123456789/tab/Potentials/' + currentRecordId);
  } else {
    logError(`\nSome tests failed: ${successCount}/${totalCount} passed`);
  }

  log('\n' + '═'.repeat(70) + '\n', 'cyan');

  process.exit(successCount === totalCount ? 0 : 1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const recordId = args[0] || null;

// Run tests
runTests(recordId).catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
