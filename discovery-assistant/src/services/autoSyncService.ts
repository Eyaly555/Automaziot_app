/**
 * Auto Sync Service
 * Handles automatic synchronization of current meeting to Zoho
 */

import { useMeetingStore } from '../store/useMeetingStore';
import { zohoClientsService } from './zohoClientsService';

class AutoSyncService {
  private syncInterval: number | null = null;
  private retryInterval: number | null = null;
  private lastSyncTime: Date | string | null = null;
  private isRunning = false;
  private syncIntervalMs = 5 * 60 * 1000; // 5 minutes
  private retryIntervalMs = 30 * 1000; // 30 seconds

  /**
   * Start auto-sync
   */
  start(intervalMs?: number): void {
    if (this.isRunning) {
      console.log('[AutoSync] Already running');
      return;
    }

    if (intervalMs) {
      this.syncIntervalMs = intervalMs;
    }

    this.isRunning = true;
    console.log(
      `[AutoSync] Starting with interval ${this.syncIntervalMs / 1000}s`
    );

    // Initial sync
    this.syncCurrentMeeting();

    // Set up periodic sync
    this.syncInterval = window.setInterval(() => {
      this.syncCurrentMeeting();
    }, this.syncIntervalMs);

    // Set up retry processor
    this.retryInterval = window.setInterval(() => {
      this.processRetryQueue();
    }, this.retryIntervalMs);
  }

  /**
   * Stop auto-sync
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log('[AutoSync] Stopping');

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }

  /**
   * Sync current meeting to Zoho
   */
  private async syncCurrentMeeting(): Promise<void> {
    const store = useMeetingStore.getState();
    const meeting = store.currentMeeting;

    if (!meeting) {
      console.log('[AutoSync] No current meeting to sync');
      return;
    }

    if (!meeting.zohoIntegration?.syncEnabled) {
      console.log('[AutoSync] Sync not enabled for current meeting');
      return;
    }

    try {
      console.log('[AutoSync] Syncing current meeting...', {
        clientName: meeting.clientName,
        recordId: meeting.zohoIntegration.recordId,
      });

      const success = await store.syncCurrentToZoho({
        silent: true,
        fullSync: false,
      });

      if (success) {
        this.lastSyncTime = new Date();
        console.log('[AutoSync] Sync successful at', this.lastSyncTime);
      } else {
        console.warn('[AutoSync] Sync failed');
      }
    } catch (error) {
      console.error('[AutoSync] Sync error:', error);
    }
  }

  /**
   * Process retry queue for failed syncs
   */
  private async processRetryQueue(): Promise<void> {
    try {
      await zohoClientsService.processRetryQueue();
    } catch (error) {
      console.error('[AutoSync] Retry queue processing error:', error);
    }
  }

  /**
   * Force immediate sync
   */
  async syncNow(): Promise<boolean> {
    const store = useMeetingStore.getState();
    const meeting = store.currentMeeting;

    if (!meeting) {
      console.warn('[AutoSync] No meeting to sync');
      return false;
    }

    console.log('[AutoSync] Force syncing now...');
    return await store.syncCurrentToZoho({
      silent: false,
      fullSync: true,
      force: true,
    });
  }

  /**
   * Safely get lastSyncTime as number (handles both Date and string from localStorage)
   */
  private getLastSyncTimeAsNumber(): number {
    if (!this.lastSyncTime) return 0;

    // Handle both Date objects and string dates from localStorage
    if (typeof this.lastSyncTime === 'string') {
      return new Date(this.lastSyncTime).getTime();
    }

    return this.lastSyncTime.getTime();
  }

  /**
   * Get sync status
   */
  getStatus(): {
    isRunning: boolean;
    lastSyncTime: Date | string | null;
    nextSyncIn: number | null;
    queueStatus: { pending: number; failed: number };
  } {
    const nextSyncIn =
      this.lastSyncTime && this.isRunning
        ? this.syncIntervalMs - (Date.now() - this.getLastSyncTimeAsNumber())
        : null;

    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      nextSyncIn: nextSyncIn && nextSyncIn > 0 ? nextSyncIn : null,
      queueStatus: zohoClientsService.getSyncQueueStatus(),
    };
  }

  /**
   * Update sync interval
   */
  updateInterval(intervalMs: number): void {
    this.syncIntervalMs = intervalMs;

    if (this.isRunning) {
      console.log(`[AutoSync] Updating interval to ${intervalMs / 1000}s`);
      this.stop();
      this.start();
    }
  }

  /**
   * Check if auto-sync is running
   */
  get running(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const autoSyncService = new AutoSyncService();
