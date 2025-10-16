/**
 * Unit tests for data migration utility
 */

import { describe, it, expect } from 'vitest';
import {
  migrateMeetingData,
  needsMigration,
  validateMigration,
  getMigrationSummary,
  CURRENT_DATA_VERSION,
} from '../dataMigration';
import type { Meeting, LeadSource, ServiceChannel } from '../../types';

describe('dataMigration', () => {
  describe('needsMigration', () => {
    it('should return true for meetings without dataVersion', () => {
      const meeting = { meetingId: 'test-1' } as any;
      expect(needsMigration(meeting)).toBe(true);
    });

    it('should return true for meetings with old version', () => {
      const meeting = { meetingId: 'test-1', dataVersion: 1 } as any;
      expect(needsMigration(meeting)).toBe(true);
    });

    it('should return false for meetings at current version', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: CURRENT_DATA_VERSION,
      } as any;
      expect(needsMigration(meeting)).toBe(false);
    });

    it('should return false for null meeting', () => {
      expect(needsMigration(null)).toBe(false);
    });
  });

  describe('getMigrationSummary', () => {
    it('should return up-to-date message for current version', () => {
      const meeting = { dataVersion: CURRENT_DATA_VERSION } as any;
      const summary = getMigrationSummary(meeting);
      expect(summary).toContain('up to date');
    });

    it('should return migration needed message for old version', () => {
      const meeting = { dataVersion: 1 } as any;
      const summary = getMigrationSummary(meeting);
      expect(summary).toContain('Migration needed');
    });
  });

  describe('migrateMeetingData - LeadsAndSales', () => {
    it('should migrate leadSources from object with sources to array', () => {
      const oldMeeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: {
              sources: [
                { channel: 'Website', volumePerMonth: 100, quality: 4 },
                { channel: 'Facebook', volumePerMonth: 50, quality: 3 },
              ],
              centralSystem: 'HubSpot',
              commonIssues: ['Slow response'],
            },
          },
        },
      } as any;

      const result = migrateMeetingData(oldMeeting);

      expect(result.migrated).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.meeting.dataVersion).toBe(CURRENT_DATA_VERSION);
      expect(
        Array.isArray(result.meeting.modules.leadsAndSales.leadSources)
      ).toBe(true);
      expect(result.meeting.modules.leadsAndSales.leadSources).toHaveLength(2);
      expect(result.meeting.modules.leadsAndSales.leadSources[0].channel).toBe(
        'Website'
      );
      expect(result.migrationsApplied).toContain(
        'leadsAndSales_leadSources_object_to_array'
      );
    });

    it('should preserve metadata when migrating leadSources', () => {
      const oldMeeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: {
              sources: [{ channel: 'Website' }],
              centralSystem: 'HubSpot',
              customField: 'preserved',
            },
          },
        },
      } as any;

      const result = migrateMeetingData(oldMeeting);

      expect(
        result.meeting.modules.leadsAndSales.leadSourcesMetadata
      ).toBeDefined();
      expect(
        result.meeting.modules.leadsAndSales.leadSourcesMetadata.centralSystem
      ).toBe('HubSpot');
      expect(
        result.meeting.modules.leadsAndSales.leadSourcesMetadata.customField
      ).toBe('preserved');
      expect(result.migrationsApplied).toContain(
        'leadsAndSales_leadSources_preserved_metadata'
      );
    });

    it('should keep leadSources as array if already migrated', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: [{ channel: 'Website', volumePerMonth: 100 }],
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(
        Array.isArray(result.meeting.modules.leadsAndSales.leadSources)
      ).toBe(true);
      expect(result.meeting.modules.leadsAndSales.leadSources).toHaveLength(1);
    });

    it('should handle empty leadSources array', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: { sources: [] },
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(result.meeting.modules.leadsAndSales.leadSources).toEqual([]);
    });

    it('should handle undefined leadSources', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {},
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(result.meeting.modules.leadsAndSales.leadSources).toEqual([]);
      expect(result.migrationsApplied).toContain(
        'leadsAndSales_leadSources_initialized_empty'
      );
    });

    it('should handle malformed leadSources object', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: {
              item1: { channel: 'Website' },
              item2: { channel: 'Facebook' },
            },
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(
        Array.isArray(result.meeting.modules.leadsAndSales.leadSources)
      ).toBe(true);
      expect(
        result.meeting.modules.leadsAndSales.leadSources.length
      ).toBeGreaterThan(0);
      expect(result.migrationsApplied).toContain(
        'leadsAndSales_leadSources_recovered_from_malformed_object'
      );
    });

    it('should handle invalid type for leadSources', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: 'invalid string',
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(result.meeting.modules.leadsAndSales.leadSources).toEqual([]);
      expect(result.migrationsApplied).toContain(
        'leadsAndSales_leadSources_reset_invalid_type'
      );
    });
  });

  describe('migrateMeetingData - CustomerService', () => {
    it('should migrate channels from object with list to array', () => {
      const oldMeeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          customerService: {
            channels: {
              list: [
                { type: 'Phone', volumePerDay: 50 },
                { type: 'Email', volumePerDay: 100 },
              ],
              multiChannelIssue: 'Data scattered',
              unificationMethod: 'CRM',
            },
          },
        },
      } as any;

      const result = migrateMeetingData(oldMeeting);

      expect(result.migrated).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.meeting.dataVersion).toBe(CURRENT_DATA_VERSION);
      expect(
        Array.isArray(result.meeting.modules.customerService.channels)
      ).toBe(true);
      expect(result.meeting.modules.customerService.channels).toHaveLength(2);
      expect(result.meeting.modules.customerService.channels[0].type).toBe(
        'Phone'
      );
      expect(result.migrationsApplied).toContain(
        'customerService_channels_object_to_array'
      );
    });

    it('should preserve metadata when migrating channels', () => {
      const oldMeeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          customerService: {
            channels: {
              list: [{ type: 'Phone' }],
              multiChannelIssue: 'Scattered data',
              customNote: 'important',
            },
          },
        },
      } as any;

      const result = migrateMeetingData(oldMeeting);

      expect(
        result.meeting.modules.customerService.channelsMetadata
      ).toBeDefined();
      expect(
        result.meeting.modules.customerService.channelsMetadata
          .multiChannelIssue
      ).toBe('Scattered data');
      expect(
        result.meeting.modules.customerService.channelsMetadata.customNote
      ).toBe('important');
      expect(result.migrationsApplied).toContain(
        'customerService_channels_preserved_metadata'
      );
    });

    it('should keep channels as array if already migrated', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          customerService: {
            channels: [{ type: 'Phone', volumePerDay: 50 }],
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(
        Array.isArray(result.meeting.modules.customerService.channels)
      ).toBe(true);
      expect(result.meeting.modules.customerService.channels).toHaveLength(1);
    });

    it('should handle empty channels array', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          customerService: {
            channels: { list: [] },
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(result.meeting.modules.customerService.channels).toEqual([]);
    });

    it('should handle undefined channels', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          customerService: {},
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(result.meeting.modules.customerService.channels).toEqual([]);
      expect(result.migrationsApplied).toContain(
        'customerService_channels_initialized_empty'
      );
    });

    it('should handle malformed channels object', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          customerService: {
            channels: {
              ch1: { type: 'Phone' },
              ch2: { type: 'Email' },
            },
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(
        Array.isArray(result.meeting.modules.customerService.channels)
      ).toBe(true);
      expect(
        result.meeting.modules.customerService.channels.length
      ).toBeGreaterThan(0);
      expect(result.migrationsApplied).toContain(
        'customerService_channels_recovered_from_malformed_object'
      );
    });
  });

  describe('migrateMeetingData - Combined Scenarios', () => {
    it('should migrate both modules in one pass', () => {
      const oldMeeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: {
              sources: [{ channel: 'Website' }],
            },
          },
          customerService: {
            channels: {
              list: [{ type: 'Phone' }],
            },
          },
        },
      } as any;

      const result = migrateMeetingData(oldMeeting);

      expect(result.migrated).toBe(true);
      expect(result.migrationsApplied).toContain(
        'leadsAndSales_leadSources_object_to_array'
      );
      expect(result.migrationsApplied).toContain(
        'customerService_channels_object_to_array'
      );
      expect(
        Array.isArray(result.meeting.modules.leadsAndSales.leadSources)
      ).toBe(true);
      expect(
        Array.isArray(result.meeting.modules.customerService.channels)
      ).toBe(true);
    });

    it('should not mutate original meeting object', () => {
      const oldMeeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {
          leadsAndSales: {
            leadSources: {
              sources: [{ channel: 'Website' }],
            },
          },
        },
      } as any;

      const originalLeadSources = oldMeeting.modules.leadsAndSales.leadSources;
      const result = migrateMeetingData(oldMeeting);

      // Original should not be modified
      expect(oldMeeting.modules.leadsAndSales.leadSources).toBe(
        originalLeadSources
      );
      expect(typeof oldMeeting.modules.leadsAndSales.leadSources).toBe(
        'object'
      );

      // Result should be migrated
      expect(
        Array.isArray(result.meeting.modules.leadsAndSales.leadSources)
      ).toBe(true);
    });

    it('should handle missing modules object gracefully', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
      } as any;

      const result = migrateMeetingData(meeting);

      expect(result.errors).toHaveLength(0);
      expect(result.meeting.modules).toBeDefined();
      expect(result.migrationsApplied).toContain('initialized_empty_modules');
    });

    it('should return early for already migrated meetings', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: CURRENT_DATA_VERSION,
        modules: {
          leadsAndSales: {
            leadSources: [{ channel: 'Website' }],
          },
        },
      } as any;

      const result = migrateMeetingData(meeting);

      expect(result.migrated).toBe(false);
      expect(result.migrationsApplied).toHaveLength(0);
    });

    it('should handle null meeting gracefully', () => {
      const result = migrateMeetingData(null);

      expect(result.migrated).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('No meeting data');
    });
  });

  describe('validateMigration', () => {
    it('should validate successfully migrated meeting', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: CURRENT_DATA_VERSION,
        modules: {
          leadsAndSales: {
            leadSources: [{ channel: 'Website' }],
          },
          customerService: {
            channels: [{ type: 'Phone' }],
          },
        },
      } as any;

      const validation = validateMigration(meeting);

      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect outdated version', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: 1,
        modules: {},
      } as any;

      const validation = validateMigration(meeting);

      expect(validation.valid).toBe(false);
      expect(
        validation.issues.some((issue) => issue.includes('outdated'))
      ).toBe(true);
    });

    it('should detect invalid leadSources structure', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: CURRENT_DATA_VERSION,
        modules: {
          leadsAndSales: {
            leadSources: { sources: [] }, // Should be array
          },
        },
      } as any;

      const validation = validateMigration(meeting);

      expect(validation.valid).toBe(false);
      expect(
        validation.issues.some((issue) => issue.includes('leadSources'))
      ).toBe(true);
    });

    it('should detect invalid channels structure', () => {
      const meeting = {
        meetingId: 'test-1',
        dataVersion: CURRENT_DATA_VERSION,
        modules: {
          customerService: {
            channels: { list: [] }, // Should be array
          },
        },
      } as any;

      const validation = validateMigration(meeting);

      expect(validation.valid).toBe(false);
      expect(
        validation.issues.some((issue) => issue.includes('channels'))
      ).toBe(true);
    });
  });
});
