/**
 * Zoho Retry Queue Service
 * Handles failed sync operations with exponential backoff and persistence
 */

import { Meeting } from '../types';
import { zohoSyncService } from './zohoSyncService';
import { formatZohoError } from '../utils/zohoHelpers';

interface QueueItem {
  id: string;
  meeting: Meeting;
  operation: 'sync' | 'load';
  timestamp: string;
  attempts: number;
  lastError?: string;
  nextRetryAt?: number;
}

class ZohoRetryQueue {
  private static instance: ZohoRetryQueue;
  private queue: QueueItem[] = [];
  private processing = false;
  private retryTimer: number | null = null;
  private readonly STORAGE_KEY = 'zoho_retry_queue';
  private readonly MAX_ATTEMPTS = 3;
  private readonly BASE_RETRY_DELAY = 5000; // 5 seconds
  private listeners: Set<(queue: QueueItem[]) => void> = new Set();

  private constructor() {
    this.loadQueue();
    this.startProcessing();
    this.setupNetworkListener();
  }

  static getInstance(): ZohoRetryQueue {
    if (!ZohoRetryQueue.instance) {
      ZohoRetryQueue.instance = new ZohoRetryQueue();
    }
    return ZohoRetryQueue.instance;
  }

  /**
   * Add a failed sync operation to the retry queue
   */
  addToQueue(
    meeting: Meeting,
    operation: 'sync' | 'load' = 'sync',
    error?: any
  ): void {
    const item: QueueItem = {
      id: `${meeting.meetingId}_${Date.now()}`,
      meeting,
      operation,
      timestamp: new Date().toISOString(),
      attempts: 0,
      lastError: formatZohoError(error),
      nextRetryAt: Date.now() + this.BASE_RETRY_DELAY,
    };

    // Check if similar item already exists
    const existingIndex = this.queue.findIndex(
      (q) =>
        q.meeting.meetingId === meeting.meetingId && q.operation === operation
    );

    if (existingIndex >= 0) {
      // Update existing item
      this.queue[existingIndex] = {
        ...this.queue[existingIndex],
        attempts: this.queue[existingIndex].attempts + 1,
        lastError: item.lastError,
        nextRetryAt: this.calculateNextRetryTime(
          this.queue[existingIndex].attempts + 1
        ),
      };
    } else {
      // Add new item
      this.queue.push(item);
    }

    this.saveQueue();
    this.notifyListeners();
    this.scheduleNextRetry();
  }

  /**
   * Process the retry queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const now = Date.now();

    // Find items ready to retry
    const readyItems = this.queue.filter(
      (item) => !item.nextRetryAt || item.nextRetryAt <= now
    );

    for (const item of readyItems) {
      if (item.attempts >= this.MAX_ATTEMPTS) {
        // Max attempts reached, remove from queue
        this.removeFromQueue(item.id);
        console.error(
          `Max retry attempts reached for ${item.operation}:`,
          item.lastError
        );
        continue;
      }

      try {
        // Attempt the operation - backend handles authentication
        if (item.operation === 'sync') {
          const success = await zohoSyncService.syncToZoho(item.meeting);
          if (success) {
            console.log(
              `Successfully synced meeting ${item.meeting.meetingId}`
            );
            // Success - remove from queue
            this.removeFromQueue(item.id);
          } else {
            throw new Error('Sync failed');
          }
        }
      } catch (error: any) {
        // Failed - update retry info
        item.attempts++;
        item.lastError = formatZohoError(error);
        item.nextRetryAt = this.calculateNextRetryTime(item.attempts);

        console.error(`Retry attempt ${item.attempts} failed:`, item.lastError);
      }
    }

    this.processing = false;
    this.saveQueue();
    this.notifyListeners();
    this.scheduleNextRetry();
  }

  /**
   * Calculate next retry time with exponential backoff
   */
  private calculateNextRetryTime(attempts: number): number {
    const delay = this.BASE_RETRY_DELAY * Math.pow(2, attempts - 1);
    const maxDelay = 300000; // 5 minutes max
    const jitter = Math.random() * 1000; // Add some randomness
    return Date.now() + Math.min(delay, maxDelay) + jitter;
  }

  /**
   * Remove item from queue
   */
  removeFromQueue(itemId: string): void {
    this.queue = this.queue.filter((item) => item.id !== itemId);
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Clear entire queue
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    failed: number;
    nextRetryIn?: number;
  } {
    const now = Date.now();
    const pending = this.queue.filter(
      (item) => item.attempts < this.MAX_ATTEMPTS
    );
    const failed = this.queue.filter(
      (item) => item.attempts >= this.MAX_ATTEMPTS
    );

    const nextRetry = Math.min(
      ...this.queue
        .filter((item) => item.nextRetryAt && item.nextRetryAt > now)
        .map((item) => item.nextRetryAt!)
    );

    return {
      total: this.queue.length,
      pending: pending.length,
      failed: failed.length,
      nextRetryIn: nextRetry ? nextRetry - now : undefined,
    };
  }

  /**
   * Schedule next retry attempt
   */
  private scheduleNextRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    if (this.queue.length === 0) return;

    const now = Date.now();
    const nextRetry = Math.min(
      ...this.queue
        .filter((item) => item.nextRetryAt && item.attempts < this.MAX_ATTEMPTS)
        .map((item) => item.nextRetryAt!)
    );

    if (nextRetry && nextRetry > now) {
      const delay = nextRetry - now;
      this.retryTimer = window.setTimeout(() => {
        this.processQueue();
      }, delay);
    } else {
      // Process immediately if something is ready
      this.processQueue();
    }
  }

  /**
   * Start automatic queue processing
   */
  private startProcessing(): void {
    // Process queue every 30 seconds
    setInterval(() => {
      this.processQueue();
    }, 30000);

    // Initial processing
    this.processQueue();
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener(): void {
    window.addEventListener('online', () => {
      console.log('Network restored, processing retry queue');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('Network lost, pausing retry queue');
      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
      }
    });
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save retry queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load retry queue:', error);
      this.queue = [];
    }
  }

  /**
   * Register a listener for queue changes
   */
  onQueueChange(callback: (queue: QueueItem[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.queue); // Initial call

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.queue));
  }

  /**
   * Force retry all items now
   */
  retryAllNow(): void {
    this.queue.forEach((item) => {
      item.nextRetryAt = Date.now();
    });
    this.saveQueue();
    this.processQueue();
  }

  /**
   * Get detailed queue information
   */
  getQueueDetails(): QueueItem[] {
    return [...this.queue]; // Return copy to prevent external modifications
  }
}

// Export singleton instance
export const zohoRetryQueue = ZohoRetryQueue.getInstance();
