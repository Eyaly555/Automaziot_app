/**
 * Meeting Backup Service
 * 
 * Handles backup and restore of meeting data to/from localStorage.
 * Automatically manages backup expiration and cleanup.
 */

import { Meeting } from '../types';
import { BackupEntry, BackupMetadata, BackupResult, RestoreResult } from '../types/backup';

const BACKUP_PREFIX = 'meeting_backup_';
const BACKUP_LIST_KEY = 'meeting_backup_list';
const MAX_BACKUPS_PER_MEETING = 5;
const BACKUP_EXPIRATION_HOURS = 24;

/**
 * Creates a backup of a meeting
 * Automatically deletes old backups if limit is reached
 */
export function createBackup(
  meeting: Meeting, 
  reason: BackupEntry['reason'] = 'manual_backup'
): BackupResult {
  try {
    const timestamp = new Date();
    const backupId = `${BACKUP_PREFIX}${meeting.meetingId}_${timestamp.getTime()}`;
    
    const expiresAt = new Date(timestamp);
    expiresAt.setHours(expiresAt.getHours() + BACKUP_EXPIRATION_HOURS);

    const backup: BackupEntry = {
      id: backupId,
      meetingId: meeting.meetingId,
      timestamp,
      meeting,
      reason,
      expiresAt
    };

    // Save backup to localStorage
    localStorage.setItem(backupId, JSON.stringify(backup));

    // Update backup list
    addToBackupList(backupId, meeting.meetingId);

    // Clean up old backups
    deleteOldBackups(meeting.meetingId, MAX_BACKUPS_PER_MEETING);

    console.log(`[BackupService] ✓ Backup created: ${backupId}`);
    
    return {
      success: true,
      backupId
    };
  } catch (error) {
    console.error('[BackupService] Failed to create backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create backup'
    };
  }
}

/**
 * Gets all available backups for a meeting
 */
export function getAvailableBackups(meetingId: string): BackupEntry[] {
  try {
    const backupList = getBackupList();
    const meetingBackups = backupList.filter(id => id.includes(meetingId));
    
    const backups: BackupEntry[] = [];
    
    for (const backupId of meetingBackups) {
      try {
        const data = localStorage.getItem(backupId);
        if (data) {
          const backup: BackupEntry = JSON.parse(data);
          
          // Convert date strings back to Date objects
          backup.timestamp = new Date(backup.timestamp);
          backup.expiresAt = new Date(backup.expiresAt);
          
          // Check if expired
          if (backup.expiresAt < new Date()) {
            // Delete expired backup
            localStorage.removeItem(backupId);
            removeFromBackupList(backupId);
            continue;
          }
          
          backups.push(backup);
        }
      } catch (parseError) {
        console.error(`[BackupService] Failed to parse backup ${backupId}:`, parseError);
      }
    }
    
    // Sort by timestamp (newest first)
    backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return backups;
  } catch (error) {
    console.error('[BackupService] Failed to get backups:', error);
    return [];
  }
}

/**
 * Gets backup metadata (lighter version without full meeting data)
 */
export function getBackupMetadata(meetingId: string): BackupMetadata[] {
  const backups = getAvailableBackups(meetingId);
  
  return backups.map(backup => ({
    id: backup.id,
    meetingId: backup.meetingId,
    clientName: backup.meeting.clientName,
    timestamp: backup.timestamp,
    reason: backup.reason,
    overallProgress: calculateProgress(backup.meeting),
    expiresAt: backup.expiresAt
  }));
}

/**
 * Restores a meeting from a backup
 */
export function restoreFromBackup(backupId: string): RestoreResult {
  try {
    const data = localStorage.getItem(backupId);
    
    if (!data) {
      return {
        success: false,
        error: 'Backup not found'
      };
    }
    
    const backup: BackupEntry = JSON.parse(data);
    
    // Convert date strings back to Date objects
    backup.timestamp = new Date(backup.timestamp);
    backup.expiresAt = new Date(backup.expiresAt);
    backup.meeting.date = new Date(backup.meeting.date);
    
    // Check if expired
    if (backup.expiresAt < new Date()) {
      localStorage.removeItem(backupId);
      removeFromBackupList(backupId);
      return {
        success: false,
        error: 'Backup has expired'
      };
    }
    
    console.log(`[BackupService] ✓ Restored from backup: ${backupId}`);
    
    return {
      success: true,
      meeting: backup.meeting
    };
  } catch (error) {
    console.error('[BackupService] Failed to restore backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to restore backup'
    };
  }
}

/**
 * Deletes old backups, keeping only the specified number of most recent backups
 */
export function deleteOldBackups(meetingId: string, keepCount: number = MAX_BACKUPS_PER_MEETING): void {
  try {
    const backups = getAvailableBackups(meetingId);
    
    // Already sorted by timestamp (newest first)
    if (backups.length > keepCount) {
      const backupsToDelete = backups.slice(keepCount);
      
      for (const backup of backupsToDelete) {
        localStorage.removeItem(backup.id);
        removeFromBackupList(backup.id);
        console.log(`[BackupService] Deleted old backup: ${backup.id}`);
      }
    }
  } catch (error) {
    console.error('[BackupService] Failed to delete old backups:', error);
  }
}

/**
 * Deletes a specific backup
 */
export function deleteBackup(backupId: string): boolean {
  try {
    localStorage.removeItem(backupId);
    removeFromBackupList(backupId);
    console.log(`[BackupService] Deleted backup: ${backupId}`);
    return true;
  } catch (error) {
    console.error('[BackupService] Failed to delete backup:', error);
    return false;
  }
}

/**
 * Deletes all expired backups across all meetings
 */
export function cleanupExpiredBackups(): number {
  try {
    const backupList = getBackupList();
    let deletedCount = 0;
    
    for (const backupId of backupList) {
      try {
        const data = localStorage.getItem(backupId);
        if (data) {
          const backup: BackupEntry = JSON.parse(data);
          backup.expiresAt = new Date(backup.expiresAt);
          
          if (backup.expiresAt < new Date()) {
            localStorage.removeItem(backupId);
            removeFromBackupList(backupId);
            deletedCount++;
          }
        } else {
          // Backup doesn't exist but is in list - clean up
          removeFromBackupList(backupId);
        }
      } catch (parseError) {
        console.error(`[BackupService] Failed to parse backup ${backupId}:`, parseError);
        // Remove corrupted backup
        localStorage.removeItem(backupId);
        removeFromBackupList(backupId);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`[BackupService] Cleaned up ${deletedCount} expired backups`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error('[BackupService] Failed to cleanup expired backups:', error);
    return 0;
  }
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the list of all backup IDs
 */
function getBackupList(): string[] {
  try {
    const data = localStorage.getItem(BACKUP_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[BackupService] Failed to get backup list:', error);
    return [];
  }
}

/**
 * Adds a backup ID to the list
 */
function addToBackupList(backupId: string, meetingId: string): void {
  try {
    const list = getBackupList();
    if (!list.includes(backupId)) {
      list.push(backupId);
      localStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('[BackupService] Failed to add to backup list:', error);
  }
}

/**
 * Removes a backup ID from the list
 */
function removeFromBackupList(backupId: string): void {
  try {
    const list = getBackupList();
    const filtered = list.filter(id => id !== backupId);
    localStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[BackupService] Failed to remove from backup list:', error);
  }
}

/**
 * Calculates overall progress percentage for a meeting
 */
function calculateProgress(meeting: Meeting): number {
  if (!meeting.modules) return 0;
  
  let totalFields = 0;
  let filledFields = 0;
  
  for (const moduleKey in meeting.modules) {
    const moduleData = meeting.modules[moduleKey as keyof typeof meeting.modules];
    if (moduleData && typeof moduleData === 'object') {
      const fields = Object.values(moduleData);
      totalFields += fields.length;
      filledFields += fields.filter(value => 
        value !== undefined && 
        value !== null && 
        value !== '' && 
        !(Array.isArray(value) && value.length === 0)
      ).length;
    }
  }
  
  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

// Auto-cleanup expired backups on service initialization
cleanupExpiredBackups();

