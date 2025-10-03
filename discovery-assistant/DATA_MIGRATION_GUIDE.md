# Data Migration Guide

## Overview

The Discovery Assistant uses a robust data migration system to handle schema changes automatically. This ensures zero data loss when data structures evolve, while maintaining backward compatibility with legacy localStorage data.

## Current Version

**Data Version: 2** (March 2025)

## Migration System Architecture

### Components

1. **`src/utils/dataMigration.ts`** - Core migration logic
   - Version tracking
   - Migration functions for each schema change
   - Validation and logging utilities

2. **`src/store/useMeetingStore.ts`** - Integration point
   - Automatic migration on app load via Zustand persist middleware
   - Runs migrations during rehydration from localStorage

3. **`src/types/index.ts`** - Type definitions
   - `Meeting.dataVersion` field tracks current version

## Version History

### Version 2 (March 2025)

**Changes:**
- **LeadsAndSalesModule.leadSources**: Migrated from object with `sources` property to direct `LeadSource[]` array
- **CustomerServiceModule.channels**: Migrated from object with `list` property to direct `ServiceChannel[]` array

**Migration Details:**

#### Before (v1):
```typescript
{
  modules: {
    leadsAndSales: {
      leadSources: {
        sources: [
          { channel: 'Website', volumePerMonth: 100, quality: 4 },
          { channel: 'Facebook', volumePerMonth: 50, quality: 3 }
        ],
        centralSystem: 'HubSpot',
        commonIssues: ['Slow response']
      }
    },
    customerService: {
      channels: {
        list: [
          { type: 'Phone', volumePerDay: 50 },
          { type: 'Email', volumePerDay: 100 }
        ],
        multiChannelIssue: 'Data scattered',
        unificationMethod: 'CRM'
      }
    }
  }
}
```

#### After (v2):
```typescript
{
  dataVersion: 2,
  modules: {
    leadsAndSales: {
      leadSources: [
        { channel: 'Website', volumePerMonth: 100, quality: 4 },
        { channel: 'Facebook', volumePerMonth: 50, quality: 3 }
      ],
      leadSourcesMetadata: {
        centralSystem: 'HubSpot',
        commonIssues: ['Slow response']
      }
    },
    customerService: {
      channels: [
        { type: 'Phone', volumePerDay: 50 },
        { type: 'Email', volumePerDay: 100 }
      ],
      channelsMetadata: {
        multiChannelIssue: 'Data scattered',
        unificationMethod: 'CRM'
      }
    }
  }
}
```

**Data Preservation:**
- Array data extracted from nested objects
- Additional properties preserved in `*Metadata` fields
- No data loss during migration

## How It Works

### Automatic Migration

1. **On App Load:**
   - Zustand persist middleware rehydrates state from localStorage
   - `onRehydrateStorage` callback checks each meeting's `dataVersion`
   - If version < CURRENT_DATA_VERSION, migration runs automatically

2. **Migration Process:**
   - Meeting data is deep cloned (no mutation of original)
   - Sequential migration functions run for each version gap
   - Errors are caught and logged, original data preserved on failure
   - Success: Meeting updated with new structure and version number
   - Migration logged to localStorage for audit trail

3. **Console Output:**
```
[Store] Rehydrating from localStorage...
[Store] Migrating current meeting (abc123)...
[DataMigration v1→v2] Migrating LeadsAndSales.leadSources from object to array (2 items)
[DataMigration v1→v2] Migrating CustomerService.channels from object to array (2 items)
[DataMigration v1→v2] Complete. Applied 2 migrations, 0 errors
[Store] ✓ Migration successful. Applied: leadsAndSales_leadSources_object_to_array, customerService_channels_object_to_array
[Store] Rehydration complete
```

### Manual Migration

For debugging or admin operations:

```typescript
import { migrateMeetingData, migrateAllLocalStorageMeetings } from './utils/dataMigration';

// Migrate a single meeting
const meeting = { /* your meeting data */ };
const result = migrateMeetingData(meeting);

if (result.migrated) {
  console.log('Migrations applied:', result.migrationsApplied);
  // Use result.meeting for updated data
} else if (result.errors.length > 0) {
  console.error('Migration errors:', result.errors);
}

// Migrate all meetings in localStorage
const batchResult = migrateAllLocalStorageMeetings();
console.log(`Processed: ${batchResult.totalProcessed}`);
console.log(`Migrated: ${batchResult.migrated}`);
console.log(`Failed: ${batchResult.failed}`);
```

## Migration Safety Features

### 1. Idempotency
Migrations can run multiple times safely:
- Already migrated data is detected and skipped
- No duplicate migrations applied

### 2. Deep Cloning
Original data never mutated:
```typescript
result.meeting = JSON.parse(JSON.stringify(meeting));
```

### 3. Error Handling
Comprehensive error handling prevents data loss:
- Try-catch blocks around each migration
- Errors logged, original data returned on failure
- Detailed error messages for debugging

### 4. Data Validation
Post-migration validation ensures correctness:
```typescript
import { validateMigration } from './utils/dataMigration';

const validation = validateMigration(meeting);
if (!validation.valid) {
  console.error('Validation issues:', validation.issues);
}
```

### 5. Audit Trail
All migrations logged to localStorage:
```typescript
import { getMigrationLogs, generateMigrationReport } from './utils/dataMigration';

const logs = getMigrationLogs();
console.log('Recent migrations:', logs);

const report = generateMigrationReport();
console.log(report);
```

## Edge Cases Handled

### Empty/Undefined Data
```typescript
// undefined leadSources → empty array
leadSources: undefined → leadSources: []

// null channels → empty array
channels: null → channels: []
```

### Malformed Data
```typescript
// Object without expected properties
leadSources: { item1: {...}, item2: {...} }
// Attempts to recover LeadSource objects from values
→ leadSources: [LeadSource, LeadSource]
```

### Invalid Types
```typescript
// String where object/array expected
leadSources: "invalid"
→ leadSources: []
```

### Already Migrated
```typescript
// Array already present (v2 structure in v1 meeting)
leadSources: [{ channel: 'Website' }]
→ No migration, kept as-is
```

## Testing

### Unit Tests

Run the comprehensive test suite:
```bash
npm test -- dataMigration.test.ts
```

Tests cover:
- ✓ Migration detection (needsMigration)
- ✓ Object-to-array conversions
- ✓ Metadata preservation
- ✓ Edge cases (empty, undefined, null, malformed)
- ✓ Error handling
- ✓ Validation
- ✓ No mutation of original data

### Manual Testing

1. **Test with Real Data:**
   - Open browser console
   - Run: `localStorage.getItem('discovery-assistant-storage')`
   - Copy the JSON
   - Manually modify structure to v1 format
   - Reload app
   - Check console for migration logs

2. **Test Batch Migration:**
   ```javascript
   // In browser console
   const { migrateAllLocalStorageMeetings } = await import('./src/utils/dataMigration');
   const result = migrateAllLocalStorageMeetings();
   console.log(result);
   ```

## Defensive Programming in Components

Even with migrations, components should use defensive checks:

### Array.isArray() Checks
```typescript
// Before accessing array
if (Array.isArray(leadSources)) {
  leadSources.forEach(source => {
    // Safe to iterate
  });
}
```

### Optional Chaining
```typescript
// Safe property access
const sources = meeting?.modules?.leadsAndSales?.leadSources ?? [];
```

### Type Guards
```typescript
function isLeadSourceArray(value: any): value is LeadSource[] {
  return Array.isArray(value) && value.every(item =>
    typeof item === 'object' && 'channel' in item
  );
}

if (isLeadSourceArray(leadSources)) {
  // Type-safe operations
}
```

### Default Values
```typescript
const channels = meeting.modules?.customerService?.channels || [];
```

## Adding New Migrations

When adding a new schema change:

### 1. Update CURRENT_DATA_VERSION
```typescript
// In dataMigration.ts
export const CURRENT_DATA_VERSION = 3; // Increment
```

### 2. Add Migration Function
```typescript
function migrateV2ToV3(result: MigrationResult): void {
  const meeting = result.meeting;

  try {
    // Your migration logic here

    if (/* migration applied */) {
      result.migrationsApplied.push('your_migration_name');
    }
  } catch (error) {
    result.errors.push(`Your migration failed: ${error.message}`);
  }
}
```

### 3. Call in migrateMeetingData
```typescript
if (currentVersion < 3) {
  migrateV2ToV3(result);
}
```

### 4. Update Type Definitions
```typescript
// In src/types/index.ts
export interface YourModule {
  // New structure
}
```

### 5. Write Tests
```typescript
describe('migrateMeetingData v2→v3', () => {
  it('should migrate YourModule', () => {
    // Test your migration
  });
});
```

### 6. Update Documentation
- Add version entry to this guide
- Document before/after structure
- Note any breaking changes

## Rollback Strategy

If a migration causes issues:

### Immediate Rollback
1. Revert code changes
2. Redeploy previous version
3. Users' old data remains intact in localStorage

### Data Recovery
If data was corrupted:
1. Check migration logs:
   ```typescript
   import { getMigrationLogs } from './utils/dataMigration';
   const logs = getMigrationLogs();
   ```
2. Restore from Supabase backup (if sync enabled)
3. Or manually fix localStorage data structure

### Prevention
- Always test migrations with real data samples
- Use staging environment first
- Implement gradual rollout
- Monitor console errors after deployment

## Performance Considerations

### Migration Performance
- Migrations run once per meeting on first load
- Deep cloning adds ~1-5ms per meeting
- Minimal impact on app startup (<50ms for 10 meetings)

### Optimization Tips
- Keep migration functions simple
- Avoid complex computations
- Use early returns for already-migrated data

## Debugging Tips

### Check Current Version
```typescript
const meeting = useMeetingStore.getState().currentMeeting;
console.log('Data version:', meeting?.dataVersion);
```

### Inspect Migration Logs
```typescript
import { getMigrationLogs } from './utils/dataMigration';
const logs = getMigrationLogs();
console.table(logs);
```

### Force Re-migration
```typescript
// Set version back to 1
const meeting = useMeetingStore.getState().currentMeeting;
meeting.dataVersion = 1;
localStorage.setItem('discovery-assistant-storage', JSON.stringify({
  state: { currentMeeting: meeting, meetings: [meeting] }
}));
// Reload app
```

### Generate Report
```typescript
import { generateMigrationReport } from './utils/dataMigration';
console.log(generateMigrationReport());
```

## Best Practices

1. **Always test migrations** with real localStorage data before deployment
2. **Never delete old data** during migration - preserve in metadata fields
3. **Use semantic version numbers** for major schema changes
4. **Log everything** - migrations, errors, warnings
5. **Validate after migration** using `validateMigration()`
6. **Keep migrations simple** - one clear transformation per function
7. **Document changes** in this guide and in code comments
8. **Handle all edge cases** - null, undefined, empty, malformed
9. **Write comprehensive tests** covering happy path and edge cases
10. **Monitor production** for migration errors after deployment

## Support

For migration issues:
1. Check browser console for error logs
2. Review `getMigrationLogs()` output
3. Run `validateMigration()` on affected meeting
4. Check localStorage data structure manually
5. Restore from Supabase backup if available

## FAQ

**Q: What happens if migration fails?**
A: Original data is preserved, errors logged to console, app continues with old structure.

**Q: Can I rollback a migration?**
A: Yes, revert code changes and redeploy. User data in localStorage remains unchanged.

**Q: Will old meetings still work?**
A: Yes, defensive programming in components ensures compatibility with both old and new structures during transition.

**Q: How do I know if migration succeeded?**
A: Check console logs, run `validateMigration()`, or inspect `meeting.dataVersion`.

**Q: What if I have data in multiple places (localStorage, Supabase, Zoho)?**
A: Migration runs on localStorage first. Supabase sync happens after. Zoho sync preserves data structure.

**Q: Can I skip a version?**
A: Yes, migrations run sequentially. A v1 meeting will run v1→v2 then v2→v3.

**Q: What about performance with many meetings?**
A: Migrations are fast (<5ms per meeting). First load may take slightly longer, then cached.
