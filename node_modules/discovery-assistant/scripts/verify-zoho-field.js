/**
 * Zoho Discovery_Status Field Verification Script
 *
 * This script verifies that the Discovery_Status field is properly configured in Zoho CRM.
 * Run after completing Zoho field setup.
 *
 * Usage:
 *   node scripts/verify-zoho-field.js [recordId]
 *
 * If no recordId provided, it will test with a sample record from your CRM.
 */

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:5176/api';

async function testZohoConnection() {
  console.log('🔌 Testing Zoho API connection...\n');

  try {
    const response = await fetch(`${API_BASE}/zoho/test`);
    const data = await response.json();

    if (data.success) {
      console.log('✅ Zoho connection successful');
      console.log(`   Organization: ${data.organization?.company_name || 'Unknown'}`);
      return true;
    } else {
      console.error('❌ Zoho connection failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function getTestRecordId() {
  console.log('\n📋 Fetching test record from Zoho...\n');

  try {
    const response = await fetch(`${API_BASE}/zoho/potentials/list?per_page=1`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const recordId = data.data[0].id;
      console.log(`✅ Found test record: ${recordId}`);
      console.log(`   Name: ${data.data[0].Name || 'Unknown'}`);
      return recordId;
    } else {
      console.error('❌ No records found in Potentials module');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching records:', error.message);
    return null;
  }
}

async function verifyDiscoveryStatusField(recordId) {
  console.log(`\n🔍 Verifying Discovery_Status field on record ${recordId}...\n`);

  try {
    // Fetch record with Discovery_Status field
    const response = await fetch(
      `${API_BASE}/zoho/potentials/${recordId}/full`
    );
    const data = await response.json();

    if (!data.success) {
      console.error('❌ Failed to fetch record:', data.message);
      return false;
    }

    const record = data.data;

    // Check if Discovery_Status field exists
    if ('Discovery_Status' in record) {
      console.log('✅ Discovery_Status field exists');
      console.log(`   Current value: "${record.Discovery_Status || '(empty)'}"`);

      // Validate value is one of the expected values
      const validValues = [
        'discovery_started',
        'proposal',
        'proposal_sent',
        'technical_details_collection',
        'implementation_started'
      ];

      if (record.Discovery_Status && validValues.includes(record.Discovery_Status)) {
        console.log('✅ Value is valid');
      } else if (!record.Discovery_Status) {
        console.log('⚠️  Value is empty (this is OK for new records)');
      } else {
        console.log(`⚠️  Value "${record.Discovery_Status}" is not in expected list`);
        console.log('   Expected values:', validValues.join(', '));
      }

      return true;
    } else {
      console.error('❌ Discovery_Status field NOT FOUND in record');
      console.log('\n💡 Field may not be configured yet. Please follow ZOHO_DISCOVERY_STATUS_SETUP.md');
      console.log('   Available fields:', Object.keys(record).join(', '));
      return false;
    }
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    return false;
  }
}

async function testFieldUpdate(recordId) {
  console.log(`\n✏️  Testing field update on record ${recordId}...\n`);

  try {
    // Try to update Discovery_Status to test value
    const testValue = 'discovery_started';
    const response = await fetch(
      `${API_BASE}/zoho/potentials/${recordId}/phase`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'discovery',
          status: 'discovery_in_progress',
          notes: 'Test update from verification script'
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('✅ Field update successful');
      console.log('   Updated Discovery_Status via API');
      return true;
    } else {
      console.error('❌ Field update failed:', data.message);
      console.log('\n💡 This may indicate permission issues or incorrect field setup');
      return false;
    }
  } catch (error) {
    console.error('❌ Update error:', error.message);
    return false;
  }
}

async function runFullVerification() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Zoho Discovery_Status Field Verification Script');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get recordId from command line or fetch one
  const args = process.argv.slice(2);
  let recordId = args[0];

  // Step 1: Test Zoho connection
  const connectionOk = await testZohoConnection();
  if (!connectionOk) {
    console.error('\n❌ Verification failed: Cannot connect to Zoho');
    process.exit(1);
  }

  // Step 2: Get test record if not provided
  if (!recordId) {
    recordId = await getTestRecordId();
    if (!recordId) {
      console.error('\n❌ Verification failed: No record available for testing');
      console.log('\n💡 Create at least one Potential in Zoho CRM first');
      process.exit(1);
    }
  }

  // Step 3: Verify field exists
  const fieldExists = await verifyDiscoveryStatusField(recordId);
  if (!fieldExists) {
    console.error('\n❌ Verification failed: Discovery_Status field not found');
    console.log('\n📖 Please complete field setup using ZOHO_DISCOVERY_STATUS_SETUP.md');
    process.exit(1);
  }

  // Step 4: Test field update
  const updateWorks = await testFieldUpdate(recordId);
  if (!updateWorks) {
    console.error('\n❌ Verification failed: Cannot update Discovery_Status field');
    console.log('\n💡 Check API permissions and field configuration');
    process.exit(1);
  }

  // All checks passed
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ ALL CHECKS PASSED');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Discovery_Status field is properly configured and working!');
  console.log('You can now proceed with the backend/frontend implementation.\n');
}

// Run verification
runFullVerification().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
