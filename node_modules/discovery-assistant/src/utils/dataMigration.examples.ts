/**
 * Data Migration Examples
 *
 * This file contains practical examples of using the data migration system.
 * These examples are for documentation and testing purposes.
 */

import {
  migrateMeetingData,
  needsMigration,
  validateMigration,
  getMigrationSummary,
  getMigrationLogs,
  generateMigrationReport,
  migrateAllLocalStorageMeetings,
  CURRENT_DATA_VERSION
} from './dataMigration';

// ============================================================================
// EXAMPLE 1: Check if Meeting Needs Migration
// ============================================================================

export function example1_checkIfMigrationNeeded() {
  console.log('=== Example 1: Check Migration Status ===');

  const meetings = [
    { meetingId: 'old-meeting', dataVersion: 1 },
    { meetingId: 'current-meeting', dataVersion: CURRENT_DATA_VERSION },
    { meetingId: 'legacy-meeting' } // No version property
  ];

  meetings.forEach(meeting => {
    const needs = needsMigration(meeting);
    const summary = getMigrationSummary(meeting);

    console.log(`Meeting ${meeting.meetingId}:`);
    console.log(`  Needs migration: ${needs}`);
    console.log(`  Summary: ${summary}`);
  });
}

// ============================================================================
// EXAMPLE 2: Migrate a Single Meeting
// ============================================================================

export function example2_migrateSingleMeeting() {
  console.log('=== Example 2: Migrate Single Meeting ===');

  // Old meeting with v1 structure
  const oldMeeting = {
    meetingId: 'test-123',
    clientName: 'Acme Corp',
    dataVersion: 1,
    modules: {
      leadsAndSales: {
        leadSources: {
          sources: [
            { channel: 'Website', volumePerMonth: 100, quality: 4 },
            { channel: 'Facebook Ads', volumePerMonth: 50, quality: 3 }
          ],
          centralSystem: 'HubSpot',
          commonIssues: ['Slow lead response', 'Manual data entry']
        }
      },
      customerService: {
        channels: {
          list: [
            { type: 'Phone', volumePerDay: 50, responseTime: '5 minutes' },
            { type: 'Email', volumePerDay: 100, responseTime: '2 hours' }
          ],
          multiChannelIssue: 'Data scattered across systems',
          unificationMethod: 'Planned CRM integration'
        }
      }
    }
  };

  console.log('Before migration:');
  console.log('  leadSources type:', typeof oldMeeting.modules.leadsAndSales.leadSources);
  console.log('  channels type:', typeof oldMeeting.modules.customerService.channels);

  // Run migration
  const result = migrateMeetingData(oldMeeting as any);

  if (result.migrated) {
    console.log('\n✓ Migration successful!');
    console.log('  Applied migrations:', result.migrationsApplied);
    console.log('  New version:', result.meeting.dataVersion);

    console.log('\nAfter migration:');
    console.log('  leadSources:', {
      isArray: Array.isArray(result.meeting.modules.leadsAndSales.leadSources),
      length: result.meeting.modules.leadsAndSales.leadSources?.length,
      data: result.meeting.modules.leadsAndSales.leadSources
    });
    console.log('  channels:', {
      isArray: Array.isArray(result.meeting.modules.customerService.channels),
      length: result.meeting.modules.customerService.channels?.length,
      data: result.meeting.modules.customerService.channels
    });

    // Check preserved metadata
    if (result.meeting.modules.leadsAndSales.leadSourcesMetadata) {
      console.log('\n  Preserved leadSources metadata:');
      console.log('    centralSystem:', result.meeting.modules.leadsAndSales.leadSourcesMetadata.centralSystem);
      console.log('    commonIssues:', result.meeting.modules.leadsAndSales.leadSourcesMetadata.commonIssues);
    }

    if (result.meeting.modules.customerService.channelsMetadata) {
      console.log('\n  Preserved channels metadata:');
      console.log('    multiChannelIssue:', result.meeting.modules.customerService.channelsMetadata.multiChannelIssue);
      console.log('    unificationMethod:', result.meeting.modules.customerService.channelsMetadata.unificationMethod);
    }
  } else if (result.errors.length > 0) {
    console.log('\n✗ Migration failed:');
    result.errors.forEach(error => console.log('  -', error));
  }

  return result.meeting;
}

// ============================================================================
// EXAMPLE 3: Validate Migration Result
// ============================================================================

export function example3_validateMigration() {
  console.log('=== Example 3: Validate Migration ===');

  // Run migration first
  const migratedMeeting = example2_migrateSingleMeeting();

  // Validate the result
  const validation = validateMigration(migratedMeeting);

  console.log('\nValidation result:');
  console.log('  Valid:', validation.valid);

  if (!validation.valid) {
    console.log('  Issues found:');
    validation.issues.forEach(issue => console.log('    -', issue));
  } else {
    console.log('  ✓ All checks passed');
  }
}

// ============================================================================
// EXAMPLE 4: Handle Edge Cases
// ============================================================================

export function example4_edgeCases() {
  console.log('=== Example 4: Edge Cases ===');

  const edgeCases = [
    {
      name: 'Empty leadSources',
      meeting: {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: { sources: [] }
          }
        }
      }
    },
    {
      name: 'Undefined leadSources',
      meeting: {
        meetingId: 'test-2',
        dataVersion: 1,
        modules: {
          leadsAndSales: {}
        }
      }
    },
    {
      name: 'Null channels',
      meeting: {
        meetingId: 'test-3',
        dataVersion: 1,
        modules: {
          customerService: {
            channels: null
          }
        }
      }
    },
    {
      name: 'Already array (migrated)',
      meeting: {
        meetingId: 'test-4',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: [{ channel: 'Website' }]
          }
        }
      }
    },
    {
      name: 'Malformed object',
      meeting: {
        meetingId: 'test-5',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: {
              item1: { channel: 'Website' },
              item2: { channel: 'Facebook' }
            }
          }
        }
      }
    },
    {
      name: 'Invalid type (string)',
      meeting: {
        meetingId: 'test-6',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: 'invalid string'
          }
        }
      }
    }
  ];

  edgeCases.forEach(({ name, meeting }) => {
    console.log(`\n${name}:`);
    const result = migrateMeetingData(meeting as any);

    if (result.migrated) {
      console.log('  ✓ Migrated successfully');
      console.log('    Applied:', result.migrationsApplied);
      console.log('    Result:', result.meeting.modules.leadsAndSales?.leadSources || 'N/A');
    } else if (result.errors.length > 0) {
      console.log('  ✗ Errors:', result.errors);
    } else {
      console.log('  - No migration needed');
    }
  });
}

// ============================================================================
// EXAMPLE 5: Batch Migration
// ============================================================================

export function example5_batchMigration() {
  console.log('=== Example 5: Batch Migration ===');

  // This would normally work with real localStorage
  console.log('Migrating all meetings in localStorage...');

  const result = migrateAllLocalStorageMeetings();

  console.log(`\nResults:`);
  console.log(`  Total processed: ${result.totalProcessed}`);
  console.log(`  Successfully migrated: ${result.migrated}`);
  console.log(`  Failed: ${result.failed}`);

  if (result.results.length > 0) {
    console.log('\nDetailed results:');
    result.results.forEach((res, idx) => {
      console.log(`  ${idx + 1}. Meeting ${res.meeting.meetingId}:`);
      console.log(`     Migrated: ${res.migrated}`);
      console.log(`     Migrations: ${res.migrationsApplied.join(', ') || 'none'}`);
      if (res.errors.length > 0) {
        console.log(`     Errors: ${res.errors.join(', ')}`);
      }
    });
  }
}

// ============================================================================
// EXAMPLE 6: View Migration Logs
// ============================================================================

export function example6_viewLogs() {
  console.log('=== Example 6: Migration Logs ===');

  const logs = getMigrationLogs();

  console.log(`Total migrations logged: ${logs.length}\n`);

  if (logs.length > 0) {
    console.log('Recent migrations:');
    logs.slice(-5).forEach((log, idx) => {
      console.log(`\n${idx + 1}. Meeting: ${log.meetingId}`);
      console.log(`   Time: ${new Date(log.timestamp).toLocaleString()}`);
      console.log(`   Version: v${log.fromVersion} → v${log.toVersion}`);
      console.log(`   Migrations: ${log.migrationsApplied.join(', ')}`);
      if (log.errors.length > 0) {
        console.log(`   Errors: ${log.errors.join(', ')}`);
      }
    });
  } else {
    console.log('No migration logs found.');
  }
}

// ============================================================================
// EXAMPLE 7: Generate Report
// ============================================================================

export function example7_generateReport() {
  console.log('=== Example 7: Migration Report ===\n');

  const report = generateMigrationReport();
  console.log(report);
}

// ============================================================================
// EXAMPLE 8: Integration with Store
// ============================================================================

export function example8_storeIntegration() {
  console.log('=== Example 8: Store Integration ===');

  console.log(`
The migration system is automatically integrated with Zustand store.

When the app loads:
1. Zustand persist middleware rehydrates state from localStorage
2. onRehydrateStorage callback runs automatically
3. Each meeting is checked with needsMigration()
4. If needed, migrateMeetingData() runs automatically
5. Updated meetings are saved back to state
6. Migration logs are saved to localStorage

You don't need to call migration functions manually.
The system handles everything on app startup.

To see it in action:
1. Open browser DevTools console
2. Reload the app
3. Watch for migration logs:
   [Store] Rehydrating from localStorage...
   [Store] Migrating current meeting...
   [DataMigration v1→v2] Migrating LeadsAndSales.leadSources...
   [Store] ✓ Migration successful
  `);
}

// ============================================================================
// EXAMPLE 9: Defensive Programming in Components
// ============================================================================

export function example9_defensiveProgramming() {
  console.log('=== Example 9: Defensive Programming ===');

  console.log(`
Even with automatic migration, components should use defensive checks:

1. Array.isArray() checks:

   const leadSources = meeting?.modules?.leadsAndSales?.leadSources;
   if (Array.isArray(leadSources)) {
     leadSources.forEach(source => {
       // Safe to iterate
     });
   }

2. Optional chaining:

   const channels = meeting?.modules?.customerService?.channels ?? [];

3. Type guards:

   function isLeadSourceArray(value: any): value is LeadSource[] {
     return Array.isArray(value) &&
            value.every(item => typeof item === 'object' && 'channel' in item);
   }

   if (isLeadSourceArray(leadSources)) {
     // Type-safe operations
   }

4. Default values:

   const sources = meeting.modules?.leadsAndSales?.leadSources || [];

This ensures your code works even if:
- Migration hasn't run yet
- Migration failed
- Data is in unexpected state
- User has old data cached
  `);
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  console.clear();
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Data Migration System - Examples        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  example1_checkIfMigrationNeeded();
  console.log('\n' + '─'.repeat(50) + '\n');

  example2_migrateSingleMeeting();
  console.log('\n' + '─'.repeat(50) + '\n');

  example3_validateMigration();
  console.log('\n' + '─'.repeat(50) + '\n');

  example4_edgeCases();
  console.log('\n' + '─'.repeat(50) + '\n');

  example5_batchMigration();
  console.log('\n' + '─'.repeat(50) + '\n');

  example6_viewLogs();
  console.log('\n' + '─'.repeat(50) + '\n');

  example7_generateReport();
  console.log('\n' + '─'.repeat(50) + '\n');

  example8_storeIntegration();
  console.log('\n' + '─'.repeat(50) + '\n');

  example9_defensiveProgramming();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Examples Complete                        ║');
  console.log('╚════════════════════════════════════════════╝');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).dataMigrationExamples = {
    example1_checkIfMigrationNeeded,
    example2_migrateSingleMeeting,
    example3_validateMigration,
    example4_edgeCases,
    example5_batchMigration,
    example6_viewLogs,
    example7_generateReport,
    example8_storeIntegration,
    example9_defensiveProgramming,
    runAllExamples
  };

  console.log('[Migration Examples] Available in window.dataMigrationExamples');
}
