#!/usr/bin/env node

/**
 * Test script for Zoho backend API
 * Run this to verify the Self Client authentication is working
 */

import fetch from 'node-fetch';

// Configuration - Update these if testing locally
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/zoho';

async function testZohoConnection() {
  console.log('🔍 Testing Zoho Backend Connection...\n');
  console.log(`API Base: ${API_BASE}\n`);

  try {
    // Test the connection endpoint
    console.log('1. Testing Zoho connection...');
    const testResponse = await fetch(`${API_BASE}/test`);

    if (!testResponse.ok) {
      throw new Error(`Connection test failed: ${testResponse.status} ${testResponse.statusText}`);
    }

    const testData = await testResponse.json();

    if (testData.success) {
      console.log('✅ Connection successful!');
      console.log(`   Organization: ${testData.organization?.company_name || 'Unknown'}`);
      console.log(`   Modules available: ${testData.modulesCount || 0}`);

      if (testData.modules && testData.modules.length > 0) {
        console.log('\n   Sample modules:');
        testData.modules.slice(0, 5).forEach(module => {
          console.log(`   - ${module.module_name} (${module.api_name})`);
        });
      }
    } else {
      console.log('❌ Connection failed:', testData.message);
      if (testData.hint) {
        console.log('   Hint:', testData.hint);
      }
    }

    // Test sync endpoint
    console.log('\n2. Testing sync endpoint...');
    const sampleMeeting = {
      meetingId: 'test-' + Date.now(),
      companyName: 'Test Company',
      contactName: 'Test Contact',
      role: 'CEO',
      industry: 'Technology',
      employeeCount: '50-100',
      progress: 75,
      modules: {
        overview: {
          businessDescription: 'Test business',
          mainChallenges: 'Growth challenges'
        }
      }
    };

    const syncResponse = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting: sampleMeeting,
        module: 'Deals'
      })
    });

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      throw new Error(`Sync test failed: ${syncResponse.status} - ${errorText}`);
    }

    const syncData = await syncResponse.json();

    if (syncData.success) {
      console.log('✅ Sync endpoint working!');
      console.log(`   Record ID: ${syncData.recordId || 'Not created'}`);
      console.log(`   Message: ${syncData.message}`);
    } else {
      console.log('❌ Sync failed:', syncData.message);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure environment variables are set in Vercel:');
    console.error('   - ZOHO_REFRESH_TOKEN');
    console.error('   - ZOHO_CLIENT_ID');
    console.error('   - ZOHO_CLIENT_SECRET');
    console.error('   - ZOHO_API_DOMAIN');
    console.error('2. If testing locally, make sure the API server is running');
    console.error('3. Check that the refresh token is valid and not expired');
  }
}

// Run the test
console.log('=================================');
console.log('Zoho Backend API Test');
console.log('=================================\n');

testZohoConnection().then(() => {
  console.log('\n=================================');
  console.log('Test completed');
  console.log('=================================');
}).catch(error => {
  console.error('\nUnexpected error:', error);
  process.exit(1);
});