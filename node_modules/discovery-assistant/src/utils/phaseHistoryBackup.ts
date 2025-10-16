/**
 * Phase History Backup System
 * Prevents loss of audit trail by maintaining backups
 */

interface PhaseHistoryBackup {
  meetingId: string;
  history: PhaseTransition[];
  timestamp: Date;
  checksum: string; // For integrity validation
}

/**
 * Save phase history backup to localStorage
 */
export function backupPhaseHistory(
  meetingId: string,
  history: PhaseTransition[]
): void {
  try {
    const backup: PhaseHistoryBackup = {
      meetingId,
      history: JSON.parse(JSON.stringify(history)), // Deep clone
      timestamp: new Date(),
      checksum: generateChecksum(history),
    };

    const key = `phase_history_backup_${meetingId}`;
    localStorage.setItem(key, JSON.stringify(backup));

    console.log(`[Phase History] ✅ Backup saved for meeting ${meetingId}`);
  } catch (error) {
    console.error('[Phase History] ❌ Failed to backup:', error);
  }
}

/**
 * Restore phase history from backup
 */
export function restorePhaseHistory(
  meetingId: string
): PhaseTransition[] | null {
  try {
    const key = `phase_history_backup_${meetingId}`;
    const data = localStorage.getItem(key);

    if (!data) {
      console.warn('[Phase History] No backup found');
      return null;
    }

    const backup: PhaseHistoryBackup = JSON.parse(data);

    // Verify checksum
    const expectedChecksum = generateChecksum(backup.history);
    if (backup.checksum !== expectedChecksum) {
      console.error(
        '[Phase History] ⚠️ Checksum mismatch - backup may be corrupted'
      );
      return null;
    }

    console.log(`[Phase History] ✅ Restored backup from ${backup.timestamp}`);
    return backup.history;
  } catch (error) {
    console.error('[Phase History] ❌ Failed to restore:', error);
    return null;
  }
}

/**
 * Generate checksum for integrity validation
 */
function generateChecksum(history: PhaseTransition[]): string {
  const data = JSON.stringify(history);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * List all backups (for debugging)
 */
export function listAllBackups(): Array<{
  meetingId: string;
  timestamp: Date;
}> {
  const backups: Array<{ meetingId: string; timestamp: Date }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('phase_history_backup_')) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const backup: PhaseHistoryBackup = JSON.parse(data);
          backups.push({
            meetingId: backup.meetingId,
            timestamp: backup.timestamp,
          });
        }
      } catch (e) {
        console.error(`Failed to parse backup ${key}`);
      }
    }
  }

  return backups;
}
