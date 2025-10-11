/**
 * Zoho Clients Service
 * Manages client list caching, fetching, and synchronization
 */

import { ZohoClientListItem, Meeting, ZohoSyncResult } from '../types';

class ZohoClientsService {
  private memoryCache: Map<string, { data: any; timestamp: number }> = new Map();
  private syncQueue: Set<string> = new Set();
  private retryQueue: Map<string, { attempts: number; lastAttempt: number; data: any }> = new Map();
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  /**
   * Fetch clients list with caching
   */
  async fetchClientsList(filters: any = {}, useCache = true): Promise<ZohoClientListItem[]> {
    const cacheKey = `list_${JSON.stringify(filters)}`;

    // Check memory cache
    if (useCache && this.memoryCache.has(cacheKey)) {
      const cached = this.memoryCache.get(cacheKey)!;
      const cacheAge = Date.now() - cached.timestamp;

      if (cacheAge < 60000) { // 1 minute
        console.log('[ZohoClientsService] Using memory cache');
        return cached.data;
      }
    }

    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/zoho/potentials/list?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.potentials) {
        // Update memory cache
        this.memoryCache.set(cacheKey, {
          data: data.potentials,
          timestamp: Date.now()
        });

        return data.potentials;
      }

      throw new Error(data.message || 'Failed to fetch clients');
    } catch (error) {
      console.error('[ZohoClientsService] Fetch error:', error);
      throw error;
    }
  }

  /**
   * Get full client data
   */
  async getClientFull(recordId: string, useCache = true): Promise<Meeting | null> {
    const cacheKey = `client_${recordId}`;

    // Check memory cache
    if (useCache && this.memoryCache.has(cacheKey)) {
      const cached = this.memoryCache.get(cacheKey)!;
      const cacheAge = Date.now() - cached.timestamp;

      if (cacheAge < 30000) { // 30 seconds
        console.log('[ZohoClientsService] Using memory cache for client');
        return cached.data;
      }
    }

    try {
      const response = await fetch(`/api/zoho/potentials/${recordId}/full`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.meetingData) {
        // Update memory cache
        this.memoryCache.set(cacheKey, {
          data: data.meetingData,
          timestamp: Date.now()
        });

        return data.meetingData;
      }

      throw new Error(data.message || 'Failed to load client');
    } catch (error) {
      console.error('[ZohoClientsService] Load error:', error);
      throw error;
    }
  }

  /**
   * Sync client to Zoho with retry logic
   */
  async syncClient(meeting: Meeting, recordId?: string): Promise<ZohoSyncResult> {
    try {
      const response = await fetch('/api/zoho/potentials/sync-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting,
          recordId,
          fullSync: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Remove from retry queue if successful
        const key = recordId || meeting.meetingId;
        this.retryQueue.delete(key);
        this.syncQueue.delete(key);

        // Invalidate cache
        this.invalidateCache(`client_${data.recordId}`);
        this.invalidateCacheByPrefix('list_');

        return {
          success: true,
          recordId: data.recordId,
          message: 'Sync successful'
        };
      }

      throw new Error(data.message || 'Sync failed');
    } catch (error) {
      console.error('[ZohoClientsService] Sync error:', error);

      // Add to retry queue
      const key = recordId || meeting.meetingId;
      this.addToRetryQueue(key, { meeting, recordId });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      };
    }
  }

  /**
   * Search clients
   */
  async searchClients(query: string): Promise<ZohoClientListItem[]> {
    try {
      const response = await fetch(`/api/zoho/potentials/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.results) {
        return data.results;
      }

      return [];
    } catch (error) {
      console.error('[ZohoClientsService] Search error:', error);
      return [];
    }
  }

  /**
   * Update phase in Zoho
   */
  async updatePhase(recordId: string, phase: string, status: string, notes?: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/zoho/potentials/${recordId}/phase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, status, notes })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Invalidate cache
        this.invalidateCache(`client_${recordId}`);
        this.invalidateCacheByPrefix('list_');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[ZohoClientsService] Update phase error:', error);
      return false;
    }
  }

  /**
   * Add to retry queue
   */
  private addToRetryQueue(key: string, data: any): void {
    const existing = this.retryQueue.get(key);

    if (existing && existing.attempts >= this.maxRetries) {
      console.warn(`[ZohoClientsService] Max retries reached for ${key}`);
      this.retryQueue.delete(key);
      return;
    }

    this.retryQueue.set(key, {
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttempt: Date.now(),
      data
    });

    this.syncQueue.add(key);
  }

  /**
   * Process retry queue
   */
  async processRetryQueue(): Promise<void> {
    const now = Date.now();

    for (const [key, item] of this.retryQueue.entries()) {
      // Check if enough time has passed since last attempt
      if (now - item.lastAttempt < this.retryDelay) {
        continue;
      }

      console.log(`[ZohoClientsService] Retrying sync for ${key} (attempt ${item.attempts})`);

      try {
        const result = await this.syncClient(item.data.meeting, item.data.recordId);

        if (result.success) {
          this.retryQueue.delete(key);
          this.syncQueue.delete(key);
          console.log(`[ZohoClientsService] Retry successful for ${key}`);
        }
      } catch (error) {
        console.error(`[ZohoClientsService] Retry failed for ${key}:`, error);
      }
    }
  }

  /**
   * Get sync queue status
   */
  getSyncQueueStatus(): { pending: number; failed: number } {
    return {
      pending: this.syncQueue.size,
      failed: this.retryQueue.size
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.memoryCache.clear();
    console.log('[ZohoClientsService] All caches cleared');
  }

  /**
   * Invalidate specific cache entry
   */
  private invalidateCache(key: string): void {
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate cache entries by prefix
   */
  private invalidateCacheByPrefix(prefix: string): void {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys())
    };
  }
}

// Export singleton instance
export const zohoClientsService = new ZohoClientsService();
