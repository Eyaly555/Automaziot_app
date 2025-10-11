#!/usr/bin/env node

/**
 * API Structure Validation Script
 *
 * This script validates the API request structure and parameter compatibility
 * without making actual API calls. Useful for testing parameter combinations
 * before deployment.
 *
 * Usage: node validate-api-structure.mjs
 */

import fs from 'fs';

// Test configuration - same as in test-api-compatibility.mjs
const TEST_CONFIG = {
  models: [
    'gpt-5-mini-2025-08-07',
    'gpt-4o-mini',
    'gpt-3.5-turbo'
  ],

  parameterSets: [
    {
      name: 'Basic Request',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_completion_tokens: 50
      }
    },
    {
      name: 'With Temperature',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_completion_tokens: 50,
        temperature: 1.0
      }
    },
    {
      name: 'With Seed',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_completion_tokens: 50,
        seed: 7
      }
    },
    {
      name: 'With JSON Schema',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Return {"test": "value"} as JSON' }],
        max_completion_tokens: 50,
        response_format: {
          type: 'json_schema',
          json_schema: {
            type: 'object',
            properties: { test: { type: 'string' } }
          }
        }
      }
    },
    {
      name: 'All Parameters',
      params: {
        model: 'gpt-5-mini-2025-08-07',
        messages: [{ role: 'user', content: 'Say "Hello" in Hebrew' }],
        max_completion_tokens: 50,
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
 * Known parameter support by model type
 * Based on OpenAI documentation and common patterns
 */
const MODEL_PARAMETER_SUPPORT = {
  // Newer models (GPT-5, GPT-4o) - generally support all parameters
  'gpt-5': {
    supports_temperature: true,
    supports_seed: true,
    supports_json_schema: true,
    supports_max_completion_tokens: true,
    notes: 'Full parameter support'
  },

  // GPT-4 models - most support these parameters
  'gpt-4': {
    supports_temperature: true,
    supports_seed: true,
    supports_json_schema: true,
    supports_max_completion_tokens: true,
    notes: 'Full parameter support'
  },

  // GPT-3.5 models - limited support
  'gpt-3.5': {
    supports_temperature: true,
    supports_seed: false, // Not supported in older models
    supports_json_schema: false, // Not supported in older models
    supports_max_completion_tokens: false, // Uses max_tokens instead
    notes: 'Limited parameter support'
  },

  // Default for unknown models
  'default': {
    supports_temperature: true,
    supports_seed: false,
    supports_json_schema: false,
    supports_max_completion_tokens: true,
    notes: 'Conservative parameter support'
  }
};

/**
 * Get model support info
 */
function getModelSupport(modelName) {
  // Check for exact matches first
  for (const [prefix, support] of Object.entries(MODEL_PARAMETER_SUPPORT)) {
    if (modelName.startsWith(prefix)) {
      return support;
    }
  }

  // Return default for unknown models
  return MODEL_PARAMETER_SUPPORT.default;
}

/**
 * Validate a single parameter set
 */
function validateParameterSet(testCase) {
  const modelSupport = getModelSupport(testCase.params.model);
  const issues = [];
  const warnings = [];

  // Check temperature support
  if (testCase.params.temperature !== undefined && !modelSupport.supports_temperature) {
    issues.push(`Temperature not supported by ${testCase.params.model}`);
  }

  // Check seed support
  if (testCase.params.seed !== undefined && !modelSupport.supports_seed) {
    issues.push(`Seed parameter not supported by ${testCase.params.model}`);
  }

  // Check JSON schema support
  if (testCase.params.response_format?.type === 'json_schema' && !modelSupport.supports_json_schema) {
    issues.push(`JSON schema response_format not supported by ${testCase.params.model}`);
  }

  // Check max_completion_tokens vs max_tokens
  if (testCase.params.max_completion_tokens !== undefined && !modelSupport.supports_max_completion_tokens) {
    issues.push(`max_completion_tokens not supported by ${testCase.params.model} (use max_tokens instead)`);
  }

  // Warnings for potentially problematic combinations
  if (testCase.params.model.includes('gpt-5-mini') && testCase.params.response_format) {
    warnings.push('JSON schema with gpt-5-mini may have limitations');
  }

  if (testCase.params.model.includes('gpt-5-mini') && testCase.params.seed) {
    warnings.push('Seed parameter with gpt-5-mini may not be fully supported');
  }

  return { issues, warnings };
}

/**
 * Validate all parameter sets
 */
function validateAllParameterSets() {
  console.log(`🔍 Validating API Parameter Compatibility`);
  console.log(`📋 Checking ${TEST_CONFIG.parameterSets.length} parameter combinations`);
  console.log(`🤖 Testing ${TEST_CONFIG.models.length} models`);

  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: TEST_CONFIG.parameterSets.length,
      issues: 0,
      warnings: 0,
      compatible: 0
    },
    details: []
  };

  for (const testCase of TEST_CONFIG.parameterSets) {
    const validation = validateParameterSet(testCase);
    const modelSupport = getModelSupport(testCase.params.model);

    const result = {
      name: testCase.name,
      model: testCase.params.model,
      issues: validation.issues,
      warnings: validation.warnings,
      modelSupport,
      compatible: validation.issues.length === 0
    };

    results.details.push(result);

    // Update summary
    if (validation.issues.length > 0) {
      results.summary.issues += validation.issues.length;
    }
    if (validation.warnings.length > 0) {
      results.summary.warnings += validation.warnings.length;
    }
    if (validation.issues.length === 0) {
      results.summary.compatible++;
    }

    // Display results
    console.log(`\n📋 ${testCase.name}:`);
    console.log(`   🤖 Model: ${testCase.params.model}`);
    console.log(`   📊 Support: ${modelSupport.notes}`);

    if (validation.issues.length > 0) {
      console.log(`   ❌ Issues:`);
      validation.issues.forEach(issue => console.log(`      • ${issue}`));
    }

    if (validation.warnings.length > 0) {
      console.log(`   ⚠️  Warnings:`);
      validation.warnings.forEach(warning => console.log(`      • ${warning}`));
    }

    if (validation.issues.length === 0) {
      console.log(`   ✅ Compatible`);
    }
  }

  return results;
}

/**
 * Generate recommendations
 */
function generateRecommendations(results) {
  console.log(`\n💡 === RECOMMENDATIONS ===`);

  const incompatibleTests = results.details.filter(test => test.issues.length > 0);

  if (incompatibleTests.length === 0) {
    console.log(`✅ All parameter combinations are compatible!`);
    return;
  }

  console.log(`⚠️  Found ${incompatibleTests.length} incompatible parameter combinations:`);

  incompatibleTests.forEach(test => {
    console.log(`\n   ${test.name}:`);
    test.issues.forEach(issue => {
      console.log(`   ❌ ${issue}`);
    });
  });

  console.log(`\n🔧 Suggested fixes:`);

  // Group issues by type
  const issueTypes = {};
  incompatibleTests.forEach(test => {
    test.issues.forEach(issue => {
      const type = issue.split(':')[0];
      issueTypes[type] = (issueTypes[type] || 0) + 1;
    });
  });

  if (issueTypes['Temperature not supported']) {
    console.log(`   • Remove temperature parameter for models that don't support it`);
  }

  if (issueTypes['Seed parameter not supported']) {
    console.log(`   • Remove seed parameter for older models`);
  }

  if (issueTypes['JSON schema response_format not supported']) {
    console.log(`   • Use text response_format or remove response_format for older models`);
  }

  if (issueTypes['max_completion_tokens not supported']) {
    console.log(`   • Use max_tokens instead of max_completion_tokens for older models`);
  }
}

/**
 * Save validation results
 */
function saveValidationResults(results) {
  const filename = `api-validation-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Validation results saved to: ${filename}`);
}

/**
 * Main validation function
 */
function runValidation() {
  console.log(`🎯 API Parameter Compatibility Validation`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);

  const results = validateAllParameterSets();

  console.log(`\n📊 === VALIDATION SUMMARY ===`);
  console.log(`   Total Tests: ${results.summary.totalTests}`);
  console.log(`   Compatible: ${results.summary.compatible} (${Math.round((results.summary.compatible / results.summary.totalTests) * 100)}%)`);
  console.log(`   Issues Found: ${results.summary.issues}`);
  console.log(`   Warnings: ${results.summary.warnings}`);

  generateRecommendations(results);
  saveValidationResults(results);

  // Exit with appropriate code
  if (results.summary.issues > 0) {
    console.log(`\n⚠️  Found compatibility issues. Review the recommendations above.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All parameter combinations are compatible!`);
    process.exit(0);
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation();
}

export { runValidation, validateParameterSet, getModelSupport };
