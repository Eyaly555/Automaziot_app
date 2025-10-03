/**
 * Data Migration Utility
 *
 * Handles automatic migration of Meeting data structures when schemas evolve.
 * Ensures zero data loss and backward compatibility during transitions.
 *
 * Version History:
 * - v1: Original structure (legacy data from localStorage)
 * - v2: Current structure (March 2025)
 *   - LeadsAndSalesModule.leadSources: object with sources property → LeadSource[] array
 *   - CustomerServiceModule.channels: object with list property → ServiceChannel[] array
 */

import { Meeting, LeadsAndSalesModule, CustomerServiceModule, LeadSource, ServiceChannel } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const CURRENT_DATA_VERSION = 2;
export const MIGRATION_LOG_KEY = 'discovery_migration_log';

// ============================================================================
// TYPES
// ============================================================================

export interface MigrationResult {
  meeting: Meeting;
  migrated: boolean;
  migrationsApplied: string[];
  errors: string[];
  originalVersion: number;
  newVersion: number;
}

export interface MigrationLog {
  timestamp: Date;
  meetingId: string;
  fromVersion: number;
  toVersion: number;
  migrationsApplied: string[];
  errors: string[];
}

// Legacy structure types for type safety during migration
interface LegacyLeadSourcesObject {
  sources?: LeadSource[];
  centralSystem?: string;
  commonIssues?: string[];
  [key: string]: any;
}

interface LegacyChannelsObject {
  list?: ServiceChannel[];
  multiChannelIssue?: string;
  unificationMethod?: string;
  [key: string]: any;
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Migrates a meeting object to the current data version.
 * This function is idempotent and safe to run multiple times.
 *
 * @param meeting - The meeting object to migrate (may be any version)
 * @returns MigrationResult with migrated meeting and metadata
 */
export function migrateMeetingData(meeting: any): MigrationResult {
  // Early return if no meeting data
  if (!meeting) {
    return {
      meeting: null as any,
      migrated: false,
      migrationsApplied: [],
      errors: ['No meeting data provided'],
      originalVersion: 1,
      newVersion: CURRENT_DATA_VERSION
    };
  }

  const result: MigrationResult = {
    meeting: meeting,
    migrated: false,
    migrationsApplied: [],
    errors: [],
    originalVersion: meeting.dataVersion || 1,
    newVersion: CURRENT_DATA_VERSION
  };

  // Deep clone to avoid mutating original
  try {
    result.meeting = JSON.parse(JSON.stringify(meeting));
  } catch (error) {
    result.errors.push(`Failed to clone meeting data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }

  // Check if migration is needed
  const currentVersion = result.meeting.dataVersion || 1;

  if (currentVersion >= CURRENT_DATA_VERSION) {
    console.log(`[DataMigration] Meeting ${meeting.meetingId} is already at version ${currentVersion}`);
    return result;
  }

  console.log(`[DataMigration] Migrating meeting ${meeting.meetingId} from v${currentVersion} to v${CURRENT_DATA_VERSION}`);

  // Run migrations in sequence
  try {
    // Migration 1→2: LeadsAndSales and CustomerService structure changes
    if (currentVersion < 2) {
      migrateV1ToV2(result);
    }

    // Update final version if migrations succeeded
    if (result.errors.length === 0) {
      result.meeting.dataVersion = CURRENT_DATA_VERSION;
      result.migrated = true;

      // Log the migration
      logMigration({
        timestamp: new Date(),
        meetingId: meeting.meetingId,
        fromVersion: currentVersion,
        toVersion: CURRENT_DATA_VERSION,
        migrationsApplied: result.migrationsApplied,
        errors: result.errors
      });
    }

  } catch (error) {
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration] Migration error:', error);
  }

  return result;
}

// ============================================================================
// MIGRATION FUNCTIONS (Version-Specific)
// ============================================================================

/**
 * Migrates from v1 to v2
 * - LeadsAndSales.leadSources: object with sources → LeadSource[] array
 * - CustomerService.channels: object with list → ServiceChannel[] array
 */
function migrateV1ToV2(result: MigrationResult): void {
  const meeting = result.meeting;

  // Guard: Ensure modules object exists
  if (!meeting.modules) {
    console.warn('[DataMigration v1→v2] No modules object found, initializing...');
    meeting.modules = {};
    result.migrationsApplied.push('initialized_empty_modules');
  }

  // ========================================
  // MIGRATION 1: LeadsAndSales.leadSources
  // ========================================
  try {
    if (meeting.modules.leadsAndSales) {
      const module = meeting.modules.leadsAndSales as any;
      const leadSources = module.leadSources;

      // Check if migration is needed
      if (leadSources !== undefined && leadSources !== null) {
        // Case 1: Already an array (already migrated or correct format)
        if (Array.isArray(leadSources)) {
          console.log('[DataMigration v1→v2] LeadsAndSales.leadSources already an array');
        }
        // Case 2: Object with 'sources' property (legacy format)
        else if (typeof leadSources === 'object' && 'sources' in leadSources) {
          const legacy = leadSources as LegacyLeadSourcesObject;

          // Extract the array from the object
          const sourcesArray = Array.isArray(legacy.sources) ? legacy.sources : [];

          console.log(`[DataMigration v1→v2] Migrating LeadsAndSales.leadSources from object to array (${sourcesArray.length} items)`);

          // Preserve any additional data that might be in the object
          const preservedData: any = {};
          Object.keys(legacy).forEach(key => {
            if (key !== 'sources') {
              preservedData[key] = legacy[key];
            }
          });

          // Update to new structure
          module.leadSources = sourcesArray;

          // Store preserved data in a separate field if it exists
          if (Object.keys(preservedData).length > 0) {
            module.leadSourcesMetadata = preservedData;
            result.migrationsApplied.push('leadsAndSales_leadSources_preserved_metadata');
          }

          result.migrationsApplied.push('leadsAndSales_leadSources_object_to_array');
        }
        // Case 3: Other object format (might be malformed data)
        else if (typeof leadSources === 'object') {
          console.warn('[DataMigration v1→v2] LeadsAndSales.leadSources is object but missing sources property');

          // Try to extract any array-like data
          const values = Object.values(leadSources).filter(v =>
            typeof v === 'object' && v !== null && 'channel' in v
          ) as LeadSource[];

          if (values.length > 0) {
            module.leadSources = values;
            result.migrationsApplied.push('leadsAndSales_leadSources_recovered_from_malformed_object');
          } else {
            // No recoverable data, set empty array
            module.leadSources = [];
            result.migrationsApplied.push('leadsAndSales_leadSources_reset_empty');
          }
        }
        // Case 4: Primitive or invalid type
        else {
          console.warn('[DataMigration v1→v2] LeadsAndSales.leadSources has invalid type:', typeof leadSources);
          module.leadSources = [];
          result.migrationsApplied.push('leadsAndSales_leadSources_reset_invalid_type');
        }
      } else {
        // leadSources is undefined or null - initialize as empty array
        module.leadSources = [];
        result.migrationsApplied.push('leadsAndSales_leadSources_initialized_empty');
      }
    }
  } catch (error) {
    result.errors.push(`LeadsAndSales migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v1→v2] LeadsAndSales error:', error);
  }

  // ========================================
  // MIGRATION 2: CustomerService.channels
  // ========================================
  try {
    if (meeting.modules.customerService) {
      const module = meeting.modules.customerService as any;
      const channels = module.channels;

      // Check if migration is needed
      if (channels !== undefined && channels !== null) {
        // Case 1: Already an array (already migrated or correct format)
        if (Array.isArray(channels)) {
          console.log('[DataMigration v1→v2] CustomerService.channels already an array');
        }
        // Case 2: Object with 'list' property (legacy format)
        else if (typeof channels === 'object' && 'list' in channels) {
          const legacy = channels as LegacyChannelsObject;

          // Extract the array from the object
          const channelsList = Array.isArray(legacy.list) ? legacy.list : [];

          console.log(`[DataMigration v1→v2] Migrating CustomerService.channels from object to array (${channelsList.length} items)`);

          // Preserve any additional data that might be in the object
          const preservedData: any = {};
          Object.keys(legacy).forEach(key => {
            if (key !== 'list') {
              preservedData[key] = legacy[key];
            }
          });

          // Update to new structure
          module.channels = channelsList;

          // Store preserved data in a separate field if it exists
          if (Object.keys(preservedData).length > 0) {
            module.channelsMetadata = preservedData;
            result.migrationsApplied.push('customerService_channels_preserved_metadata');
          }

          result.migrationsApplied.push('customerService_channels_object_to_array');
        }
        // Case 3: Other object format (might be malformed data)
        else if (typeof channels === 'object') {
          console.warn('[DataMigration v1→v2] CustomerService.channels is object but missing list property');

          // Try to extract any array-like data
          const values = Object.values(channels).filter(v =>
            typeof v === 'object' && v !== null && 'type' in v
          ) as ServiceChannel[];

          if (values.length > 0) {
            module.channels = values;
            result.migrationsApplied.push('customerService_channels_recovered_from_malformed_object');
          } else {
            // No recoverable data, set empty array
            module.channels = [];
            result.migrationsApplied.push('customerService_channels_reset_empty');
          }
        }
        // Case 4: Primitive or invalid type
        else {
          console.warn('[DataMigration v1→v2] CustomerService.channels has invalid type:', typeof channels);
          module.channels = [];
          result.migrationsApplied.push('customerService_channels_reset_invalid_type');
        }
      } else {
        // channels is undefined or null - initialize as empty array
        module.channels = [];
        result.migrationsApplied.push('customerService_channels_initialized_empty');
      }
    }
  } catch (error) {
    result.errors.push(`CustomerService migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v1→v2] CustomerService error:', error);
  }

  console.log(`[DataMigration v1→v2] Complete. Applied ${result.migrationsApplied.length} migrations, ${result.errors.length} errors`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if a meeting needs migration
 */
export function needsMigration(meeting: any): boolean {
  if (!meeting) return false;

  const currentVersion = meeting.dataVersion || 1;
  return currentVersion < CURRENT_DATA_VERSION;
}

/**
 * Gets a human-readable summary of migrations applied
 */
export function getMigrationSummary(meeting: any): string {
  const version = meeting.dataVersion || 1;

  if (version === CURRENT_DATA_VERSION) {
    return `Meeting is up to date (v${version})`;
  } else if (version < CURRENT_DATA_VERSION) {
    return `Migration needed: v${version} → v${CURRENT_DATA_VERSION}`;
  } else {
    return `Warning: Meeting version (v${version}) is newer than supported (v${CURRENT_DATA_VERSION})`;
  }
}

/**
 * Logs a migration to localStorage for debugging and audit trail
 */
function logMigration(log: MigrationLog): void {
  try {
    const existingLogs = localStorage.getItem(MIGRATION_LOG_KEY);
    const logs: MigrationLog[] = existingLogs ? JSON.parse(existingLogs) : [];

    logs.push(log);

    // Keep only last 50 logs to prevent localStorage bloat
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }

    localStorage.setItem(MIGRATION_LOG_KEY, JSON.stringify(logs));
    console.log(`[DataMigration] Logged migration for meeting ${log.meetingId}`);
  } catch (error) {
    console.error('[DataMigration] Failed to log migration:', error);
  }
}

/**
 * Gets all migration logs from localStorage
 */
export function getMigrationLogs(): MigrationLog[] {
  try {
    const logs = localStorage.getItem(MIGRATION_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('[DataMigration] Failed to retrieve migration logs:', error);
    return [];
  }
}

/**
 * Clears all migration logs
 */
export function clearMigrationLogs(): void {
  try {
    localStorage.removeItem(MIGRATION_LOG_KEY);
    console.log('[DataMigration] Cleared migration logs');
  } catch (error) {
    console.error('[DataMigration] Failed to clear migration logs:', error);
  }
}

/**
 * Validates that a meeting has been successfully migrated
 */
export function validateMigration(meeting: Meeting): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check version
  if (!meeting.dataVersion || meeting.dataVersion < CURRENT_DATA_VERSION) {
    issues.push(`Data version is outdated: ${meeting.dataVersion || 1} (expected ${CURRENT_DATA_VERSION})`);
  }

  // Validate LeadsAndSales structure
  if (meeting.modules?.leadsAndSales) {
    const leadSources = meeting.modules.leadsAndSales.leadSources;
    if (leadSources !== undefined && leadSources !== null && !Array.isArray(leadSources)) {
      issues.push('LeadsAndSales.leadSources is not an array');
    }
  }

  // Validate CustomerService structure
  if (meeting.modules?.customerService) {
    const channels = meeting.modules.customerService.channels;
    if (channels !== undefined && channels !== null && !Array.isArray(channels)) {
      issues.push('CustomerService.channels is not an array');
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

// ============================================================================
// BATCH MIGRATION UTILITIES
// ============================================================================

/**
 * Migrates all meetings in localStorage
 * Useful for one-time migrations or admin operations
 */
export function migrateAllLocalStorageMeetings(): {
  totalProcessed: number;
  migrated: number;
  failed: number;
  results: MigrationResult[]
} {
  const results: MigrationResult[] = [];
  let totalProcessed = 0;
  let migrated = 0;
  let failed = 0;

  console.log('[DataMigration] Starting batch migration of all localStorage meetings...');

  try {
    // Scan localStorage for meeting keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Look for discovery meeting keys
      if (key.startsWith('discovery_') && !key.includes('_log') && !key.includes('_cache')) {
        try {
          const data = localStorage.getItem(key);
          if (!data) continue;

          const meeting = JSON.parse(data);
          totalProcessed++;

          // Run migration
          const result = migrateMeetingData(meeting);
          results.push(result);

          if (result.migrated) {
            // Save migrated data back to localStorage
            localStorage.setItem(key, JSON.stringify(result.meeting));
            migrated++;
            console.log(`[DataMigration] ✓ Migrated: ${key}`);
          } else if (result.errors.length > 0) {
            failed++;
            console.error(`[DataMigration] ✗ Failed: ${key}`, result.errors);
          }
        } catch (error) {
          failed++;
          console.error(`[DataMigration] ✗ Error processing ${key}:`, error);
        }
      }
    }

    console.log(`[DataMigration] Batch migration complete: ${totalProcessed} processed, ${migrated} migrated, ${failed} failed`);
  } catch (error) {
    console.error('[DataMigration] Batch migration error:', error);
  }

  return { totalProcessed, migrated, failed, results };
}

/**
 * Generates a migration report for debugging
 */
export function generateMigrationReport(): string {
  const logs = getMigrationLogs();

  let report = `=== Data Migration Report ===\n\n`;
  report += `Current Version: v${CURRENT_DATA_VERSION}\n`;
  report += `Total Migrations Logged: ${logs.length}\n\n`;

  if (logs.length > 0) {
    report += `Recent Migrations:\n`;
    logs.slice(-10).forEach((log, idx) => {
      report += `\n${idx + 1}. Meeting ${log.meetingId}\n`;
      report += `   Time: ${new Date(log.timestamp).toLocaleString()}\n`;
      report += `   Version: v${log.fromVersion} → v${log.toVersion}\n`;
      report += `   Migrations: ${log.migrationsApplied.join(', ') || 'none'}\n`;
      if (log.errors.length > 0) {
        report += `   Errors: ${log.errors.join(', ')}\n`;
      }
    });
  }

  return report;
}
