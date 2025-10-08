/**
 * Data Migration Utility
 *
 * Handles automatic migration of Meeting data structures when schemas evolve.
 * Ensures zero data loss and backward compatibility during transitions.
 *
 * Version History:
 * - v1: Original structure (legacy data from localStorage)
 * - v2: March 2025
 *   - LeadsAndSalesModule.leadSources: object with sources property → LeadSource[] array
 *   - CustomerServiceModule.channels: object with list property → ServiceChannel[] array
 * - v3: October 2025 - Overview Module Refactor
 *   - Removed: OverviewModule.processes, mainGoals, currentSystems
 *   - Added: leadSources, leadCaptureChannels, serviceChannels, focusAreas, crmStatus
 *   - Added new module: essentialDetails
 *   - Data moved from LeadsAndSales 2.1 and CustomerService 3.1 to Overview
 * - v4: October 2025 - Proposal purchasedServices Fallback
 *   - Added purchasedServices field for client-approved services
 *   - Migration copies selectedServices → purchasedServices for backward compatibility
 *   - Ensures Phase 2 filtering works for old meetings
 */

import { Meeting, LeadSource, ServiceChannel } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const CURRENT_DATA_VERSION = 4;
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

    // Migration 2→3: Overview Module Refactor
    if (currentVersion < 3) {
      migrateV2ToV3(result);
    }

    // Migration 3→4: Proposal purchasedServices fallback
    if (currentVersion < 4) {
      migrateV3ToV4(result);
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

/**
 * Migrates from v2 to v3
 * - Overview: Remove processes, mainGoals, currentSystems
 * - Overview: Add leadSources, serviceChannels from other modules (sync bidirectionally)
 * - Overview: Add focusAreas, crmStatus
 * - Initialize essentialDetails module
 */
function migrateV2ToV3(result: MigrationResult): void {
  const meeting = result.meeting;

  console.log('[DataMigration v2→v3] Starting Overview module refactor...');

  // Guard: Ensure modules object exists
  if (!meeting.modules) {
    console.warn('[DataMigration v2→v3] No modules object found, initializing...');
    meeting.modules = {};
    result.migrationsApplied.push('initialized_empty_modules');
  }

  // ========================================
  // MIGRATION 1: Remove deprecated Overview fields
  // ========================================
  try {
    if (!meeting.modules.overview) {
      meeting.modules.overview = {};
      result.migrationsApplied.push('overview_initialized');
    }

    const overview = meeting.modules.overview as any;

    // Remove deprecated fields (but keep data in case we need to restore)
    const deprecatedData: any = {};

    if (overview.processes !== undefined) {
      deprecatedData.processes = overview.processes;
      delete overview.processes;
      result.migrationsApplied.push('overview_removed_processes');
    }

    if (overview.mainGoals !== undefined) {
      deprecatedData.mainGoals = overview.mainGoals;
      delete overview.mainGoals;
      result.migrationsApplied.push('overview_removed_mainGoals');
    }

    if (overview.currentSystems !== undefined) {
      deprecatedData.currentSystems = overview.currentSystems;
      delete overview.currentSystems;
      result.migrationsApplied.push('overview_removed_currentSystems');
    }

    // Store deprecated data in metadata for potential recovery
    if (Object.keys(deprecatedData).length > 0) {
      overview._deprecatedFields_v2 = deprecatedData;
      result.migrationsApplied.push('overview_stored_deprecated_data');
    }

  } catch (error) {
    result.errors.push(`Overview cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v2→v3] Overview cleanup error:', error);
  }

  // ========================================
  // MIGRATION 2: Copy leadSources from LeadsAndSales to Overview
  // ========================================
  try {
    const overview = meeting.modules.overview as any;
    const leadsAndSales = meeting.modules.leadsAndSales as any;

    // Copy leadSources if exists in LeadsAndSales and not in Overview
    if (leadsAndSales?.leadSources && Array.isArray(leadsAndSales.leadSources)) {
      if (!overview.leadSources || !Array.isArray(overview.leadSources) || overview.leadSources.length === 0) {
        overview.leadSources = JSON.parse(JSON.stringify(leadsAndSales.leadSources));
        result.migrationsApplied.push('overview_copied_leadSources_from_leadsAndSales');
      }
    }

    // Initialize empty array if still undefined
    if (!overview.leadSources) {
      overview.leadSources = [];
      result.migrationsApplied.push('overview_initialized_leadSources_empty');
    }

  } catch (error) {
    result.errors.push(`LeadSources migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v2→v3] LeadSources error:', error);
  }

  // ========================================
  // MIGRATION 3: Copy serviceChannels from CustomerService to Overview
  // ========================================
  try {
    const overview = meeting.modules.overview as any;
    const customerService = meeting.modules.customerService as any;

    // Copy channels if exists in CustomerService and not in Overview
    if (customerService?.channels && Array.isArray(customerService.channels)) {
      if (!overview.serviceChannels || !Array.isArray(overview.serviceChannels) || overview.serviceChannels.length === 0) {
        overview.serviceChannels = JSON.parse(JSON.stringify(customerService.channels));
        result.migrationsApplied.push('overview_copied_serviceChannels_from_customerService');
      }
    }

    // Initialize empty array if still undefined
    if (!overview.serviceChannels) {
      overview.serviceChannels = [];
      result.migrationsApplied.push('overview_initialized_serviceChannels_empty');
    }

  } catch (error) {
    result.errors.push(`ServiceChannels migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v2→v3] ServiceChannels error:', error);
  }

  // ========================================
  // MIGRATION 4: Initialize new Overview fields
  // ========================================
  try {
    const overview = meeting.modules.overview as any;

    // Initialize focusAreas if not exists
    if (!overview.focusAreas) {
      overview.focusAreas = [];
      result.migrationsApplied.push('overview_initialized_focusAreas');
    }

    // Initialize CRM status based on existing data
    if (!overview.crmStatus) {
      // Try to infer from systems module
      const systems = meeting.modules.systems as any;
      if (systems?.currentSystems && Array.isArray(systems.currentSystems) && systems.currentSystems.length > 0) {
        // Check if any CRM-like system exists
        const hasCRM = systems.currentSystems.some((sys: string) =>
          sys.toLowerCase().includes('crm') ||
          sys.toLowerCase().includes('salesforce') ||
          sys.toLowerCase().includes('hubspot') ||
          sys.toLowerCase().includes('zoho')
        );
        overview.crmStatus = hasCRM ? 'full' : 'basic';
        result.migrationsApplied.push('overview_inferred_crmStatus_from_systems');
      } else {
        overview.crmStatus = 'none';
        result.migrationsApplied.push('overview_defaulted_crmStatus_none');
      }
    }

  } catch (error) {
    result.errors.push(`Overview new fields initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v2→v3] Overview new fields error:', error);
  }

  // ========================================
  // MIGRATION 5: Initialize essentialDetails module
  // ========================================
  try {
    if (!meeting.modules.essentialDetails) {
      meeting.modules.essentialDetails = {};
      result.migrationsApplied.push('essentialDetails_initialized');
    }

  } catch (error) {
    result.errors.push(`EssentialDetails initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v2→v3] EssentialDetails error:', error);
  }

  console.log(`[DataMigration v2→v3] Complete. Applied ${result.migrationsApplied.length} migrations, ${result.errors.length} errors`);
}

/**
 * Migrates from v3 to v4
 * - Proposal: Add purchasedServices fallback from selectedServices
 * - Ensures Phase 2 filtering works for meetings created before purchasedServices field existed
 */
function migrateV3ToV4(result: MigrationResult): void {
  const meeting = result.meeting;

  console.log('[DataMigration v3→v4] Starting purchasedServices migration...');

  // Guard: Ensure modules object exists
  if (!meeting.modules) {
    console.warn('[DataMigration v3→v4] No modules object found, initializing...');
    meeting.modules = {};
    result.migrationsApplied.push('initialized_empty_modules');
  }

  // ========================================
  // MIGRATION 1: Add purchasedServices fallback
  // ========================================
  try {
    const proposal = meeting.modules.proposal as any;

    // If no proposal module exists, skip migration
    if (!proposal) {
      console.log('[DataMigration v3→v4] No proposal module found, skipping');
      result.migrationsApplied.push('proposal_not_found_skipped');
      return;
    }

    // Check if purchasedServices already exists and has data
    if (proposal.purchasedServices && Array.isArray(proposal.purchasedServices) && proposal.purchasedServices.length > 0) {
      console.log(`[DataMigration v3→v4] purchasedServices already exists (${proposal.purchasedServices.length} items), skipping`);
      result.migrationsApplied.push('proposal_purchasedServices_already_exists');
      return;
    }

    // Get selectedServices for fallback
    const selectedServices = proposal.selectedServices;

    // Case 1: selectedServices exists and is an array
    if (selectedServices && Array.isArray(selectedServices)) {
      if (selectedServices.length > 0) {
        // Copy selectedServices to purchasedServices
        proposal.purchasedServices = JSON.parse(JSON.stringify(selectedServices));

        console.log(`[DataMigration v3→v4] Copied ${selectedServices.length} selectedServices to purchasedServices`);
        result.migrationsApplied.push('proposal_purchasedServices_copied_from_selectedServices');
      } else {
        // selectedServices is empty array
        proposal.purchasedServices = [];
        console.log('[DataMigration v3→v4] selectedServices is empty, initialized purchasedServices as empty array');
        result.migrationsApplied.push('proposal_purchasedServices_initialized_empty');
      }
    }
    // Case 2: selectedServices is null, undefined, or not an array
    else {
      proposal.purchasedServices = [];

      if (selectedServices === null) {
        console.warn('[DataMigration v3→v4] selectedServices is null, initialized purchasedServices as empty array');
        result.migrationsApplied.push('proposal_purchasedServices_initialized_empty_from_null');
      } else if (selectedServices === undefined) {
        console.warn('[DataMigration v3→v4] selectedServices is undefined, initialized purchasedServices as empty array');
        result.migrationsApplied.push('proposal_purchasedServices_initialized_empty_from_undefined');
      } else {
        console.warn(`[DataMigration v3→v4] selectedServices has invalid type (${typeof selectedServices}), initialized purchasedServices as empty array`);
        result.migrationsApplied.push('proposal_purchasedServices_initialized_empty_invalid_type');
      }
    }

  } catch (error) {
    result.errors.push(`Proposal purchasedServices migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[DataMigration v3→v4] Proposal error:', error);
  }

  console.log(`[DataMigration v3→v4] Complete. Applied ${result.migrationsApplied.length} migrations, ${result.errors.length} errors`);
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

  // Validate Proposal structure (v4 migration)
  if (meeting.modules?.proposal) {
    const proposal = meeting.modules.proposal as any;

    // Check purchasedServices field exists (should be present after v4 migration)
    if (proposal.purchasedServices === undefined) {
      issues.push('Proposal.purchasedServices is undefined (v4 migration may not have run)');
    } else if (!Array.isArray(proposal.purchasedServices)) {
      issues.push('Proposal.purchasedServices is not an array');
    }

    // Warn if selectedServices is missing (should still exist for backward compatibility)
    if (proposal.selectedServices === undefined) {
      issues.push('Proposal.selectedServices is undefined (data may be corrupted)');
    } else if (!Array.isArray(proposal.selectedServices)) {
      issues.push('Proposal.selectedServices is not an array');
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
