#!/usr/bin/env node

/**
 * API Compatibility Test Script
 *
 * This script tests API calls with different parameter combinations
 * to identify which parameters are supported by different models.
 *
 * Usage: node test-api-compatibility.mjs
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  // Test the actual API endpoints
  testEndpoints: [
    'http://localhost:3001/api/openai/test',  // Local proxy server
    // Add production URL when available: 'https://your-domain.vercel.app/api/openai/test'
  ],

  // Models to test
  models: [
    'gpt-5-mini-2025-08-07',
    'gpt-4o-mini',  // Fallback for testing
    'gpt-3.5-turbo' // Fallback for testing
  ],

  // Parameter combinations to test
  parameterSets: [
    // Basic required parameters
    {
      name: 'Basic Request',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_tokens: 50
      }
    },

    // With temperature
    {
      name: 'With Temperature',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_tokens: 50,
        temperature: 1.0
      }
    },

    // With seed
    {
      name: 'With Seed',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_tokens: 50,
        seed: 7
      }
    },

    // With response_format (JSON schema)
    {
      name: 'With JSON Schema',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Return {"test": "value"} as JSON' }],
        max_tokens: 50,
        response_format: {
          type: 'json_schema',
          json_schema: {
            type: 'object',
            properties: { test: { type: 'string' } }
          }
        }
      }
    },

    // All parameters together
    {
      name: 'All Parameters',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_tokens: 50,
        temperature: 1.0,
        seed: 7,
        response_format: {
          type: 'json_schema',
          json_schema: {
            type: 'object',
            properties: { test: { type: 'string' } }
          }
        }
      }
    }
  ]
};

/**
 * Test a single API endpoint with given parameters
 */
async function testApiCall(endpoint, testCase) {
  const startTime = Date.now();

  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📡 Endpoint: ${endpoint}`);
    console.log(`🤖 Model: ${testCase.params.model}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.params),
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS (${duration}ms)`);
      console.log(`📊 Tokens: ${data.usage?.total_tokens || 'N/A'}`);
      console.log(`🎯 Model: ${data.model || 'N/A'}`);
      return { success: true, duration, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED (${response.status}) (${duration}ms)`);
      console.log(`🚨 Error: ${errorText}`);

      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          status: response.status,
          error: errorJson,
          duration
        };
      } catch {
        return {
          success: false,
          status: response.status,
          error: errorText,
          duration
        };
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`💥 NETWORK ERROR (${duration}ms)`);
    console.log(`🚨 Error: ${error.message}`);
    return { success: false, error: error.message, duration };
  }
}

/**
 * Run all tests for a specific endpoint
 */
async function runEndpointTests(endpoint) {
  console.log(`\n🚀 Starting tests for endpoint: ${endpoint}`);

  const results = {
    endpoint,
    timestamp: new Date().toISOString(),
    tests: []
  };

  for (const testCase of TEST_CONFIG.parameterSets) {
    const result = await testApiCall(endpoint, testCase);
    results.tests.push({
      name: testCase.name,
      params: testCase.params,
      result
    });

    // Small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Analyze test results
 */
function analyzeResults(allResults) {
  console.log(`\n📊 === TEST RESULTS ANALYSIS ===`);

  const summary = {
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    errorsByType: {},
    avgResponseTime: 0
  };

  let totalResponseTime = 0;
  let responseTimeCount = 0;

  for (const endpointResult of allResults) {
    console.log(`\n📍 Endpoint: ${endpointResult.endpoint}`);

    for (const test of endpointResult.tests) {
      summary.totalTests++;

      if (test.result.success) {
        summary.successfulTests++;
        totalResponseTime += test.result.duration;
        responseTimeCount++;
      } else {
        summary.failedTests++;

        // Categorize errors
        const errorKey = test.result.error?.error?.type || test.result.error || 'Unknown Error';
        summary.errorsByType[errorKey] = (summary.errorsByType[errorKey] || 0) + 1;
      }

      // Show result
      const status = test.result.success ? '✅' : '❌';
      console.log(`  ${status} ${test.name}: ${test.result.success ? 'PASS' : 'FAIL'}`);
      if (!test.result.success && test.result.error) {
        console.log(`    💬 ${test.result.error}`);
      }
    }
  }

  // Calculate averages
  summary.avgResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;

  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total Tests: ${summary.totalTests}`);
  console.log(`   Successful: ${summary.successfulTests} (${Math.round((summary.successfulTests / summary.totalTests) * 100)}%)`);
  console.log(`   Failed: ${summary.failedTests} (${Math.round((summary.failedTests / summary.totalTests) * 100)}%)`);
  console.log(`   Avg Response Time: ${summary.avgResponseTime}ms`);

  if (Object.keys(summary.errorsByType).length > 0) {
    console.log(`\n🚨 ERRORS BY TYPE:`);
    for (const [errorType, count] of Object.entries(summary.errorsByType)) {
      console.log(`   ${errorType}: ${count} times`);
    }
  }

  return summary;
}

/**
 * Save results to file
 */
function saveResults(results) {
  const filename = `api-test-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${filename}`);
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`🎯 OpenAI API Compatibility Test`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);

  const allResults = [];

  for (const endpoint of TEST_CONFIG.testEndpoints) {
    try {
      const results = await runEndpointTests(endpoint);
      allResults.push(results);
    } catch (error) {
      console.log(`\n💥 Failed to test endpoint ${endpoint}: ${error.message}`);
    }
  }

  // Analyze results
  const summary = analyzeResults(allResults);

  // Save detailed results
  saveResults(allResults);

  // Exit with appropriate code
  if (summary.failedTests > 0) {
    console.log(`\n⚠️  Some tests failed. Check the results above.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All tests passed!`);
    process.exit(0);
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error(`💥 Script failed: ${error.message}`);
    process.exit(1);
  });
}

export { runTests, TEST_CONFIG };
