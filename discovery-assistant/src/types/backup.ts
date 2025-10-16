/**
 * Backup Types for Meeting Data Recovery
 *
 * Provides type-safe backup and restore functionality for meeting data.
 * Backups are stored in localStorage with expiration dates.
 */

import { Meeting } from './index';

/**
 * Backup entry stored in localStorage
 *
 * @property id - Unique backup identifier (timestamp-based)
 * @property meetingId - ID of the meeting being backed up
 * @property timestamp - When the backup was created
 * @property meeting - Complete meeting data snapshot
 * @property reason - Why this backup was created
 * @property expiresAt - When this backup should be automatically deleted
 */
export interface BackupEntry {
  id: string;
  meetingId: string;
  timestamp: Date;
  meeting: Meeting;
  reason: 'manual_backup' | 'pre_reset' | 'auto_backup';
  expiresAt: Date;
}

/**
 * Backup metadata for listing backups
 * Lighter version without full meeting data
 */
export interface BackupMetadata {
  id: string;
  meetingId: string;
  clientName: string;
  timestamp: Date;
  reason: string;
  overallProgress: number;
  expiresAt: Date;
}

/**
 * Result of backup operation
 */
export interface BackupResult {
  success: boolean;
  backupId?: string;
  error?: string;
}

/**
 * Result of restore operation
 */
export interface RestoreResult {
  success: boolean;
  meeting?: Meeting;
  error?: string;
}
