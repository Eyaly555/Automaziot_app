import { supabase, isSupabaseConfigured, optimisticUpdate } from '../lib/supabase';
import type { Meeting } from '../types';
import type { Meeting as DBMeeting, MeetingActivity } from '../types/database';

interface SyncResult {
  success: boolean;
  error?: string;
  conflicts?: any[];
  synced?: number;
}

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
}

export class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private conflictResolutionStrategy: 'local' | 'remote' | 'merge' | 'ask' = 'merge';
  private offlineChanges: Map<string, any> = new Map();

  private constructor() {
    this.loadQueueFromStorage();
    this.startAutoSync();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Load sync queue from localStorage
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem('syncQueue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  // Save sync queue to localStorage
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  // Add item to sync queue
  private addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): void {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(queueItem);
    this.saveQueueToStorage();

    // Trigger immediate sync if online
    if (navigator.onLine && isSupabaseConfigured()) {
      this.processQueue();
    }
  }

  // Process sync queue
  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    const processed: string[] = [];

    for (const item of this.syncQueue) {
      try {
        const success = await this.processSyncItem(item);
        if (success) {
          processed.push(item.id);
        } else {
          item.retries++;
          if (item.retries > 3) {
            // Move to dead letter queue after 3 retries
            this.handleFailedSync(item);
            processed.push(item.id);
          }
        }
      } catch (error) {
        console.error('Error processing sync item:', error);
        item.retries++;
      }
    }

    // Remove processed items
    this.syncQueue = this.syncQueue.filter(item => !processed.includes(item.id));
    this.saveQueueToStorage();
    this.isSyncing = false;
  }

  // Process individual sync item
  private async processSyncItem(item: SyncQueueItem): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      switch (item.type) {
        case 'create':
          const { error: createError } = await supabase
            .from(item.table)
            .insert(item.data);
          return !createError;

        case 'update':
          const { error: updateError } = await supabase
            .from(item.table)
            .update(item.data)
            .eq('id', item.data.id);
          return !updateError;

        case 'delete':
          const { error: deleteError } = await supabase
            .from(item.table)
            .delete()
            .eq('id', item.data.id);
          return !deleteError;

        default:
          return false;
      }
    } catch (error) {
      console.error('Sync error:', error);
      return false;
    }
  }

  // Handle failed sync items
  private handleFailedSync(item: SyncQueueItem): void {
    const deadLetterQueue = JSON.parse(localStorage.getItem('deadLetterQueue') || '[]');
    deadLetterQueue.push({ ...item, failedAt: Date.now() });
    localStorage.setItem('deadLetterQueue', JSON.stringify(deadLetterQueue));
  }

  // Sync meeting to Supabase
  async syncMeeting(meeting: Meeting, userId: string): Promise<SyncResult> {
    if (!isSupabaseConfigured()) {
      // Store in offline changes for later sync
      this.offlineChanges.set(meeting.id, meeting);
      return { success: true };
    }

    try {
      // Check if meeting exists in database
      const { data: existingMeeting } = await supabase
        .from('meetings')
        .select('version, updated_at')
        .eq('id', meeting.id)
        .single();

      const dbMeeting: Partial<DBMeeting> = {
        id: meeting.id,
        owner_id: userId,
        company_name: meeting.companyName,
        contact_name: meeting.contactName,
        contact_role: meeting.contactRole,
        contact_email: meeting.contactEmail,
        contact_phone: meeting.contactPhone,
        meeting_date: meeting.meetingDate,
        status: meeting.status || 'draft',
        modules: meeting.modules as any,
        pain_points: meeting.painPoints as any,
        custom_field_values: meeting.customFieldValues as any,
        wizard_state: meeting.wizardState as any,
        ai_insights: meeting.aiInsights as any,
        updated_at: new Date().toISOString(),
        last_modified_by: userId
      };

      if (existingMeeting) {
        // Handle conflict resolution
        const hasConflict = await this.detectConflict(meeting, existingMeeting);
        if (hasConflict) {
          const resolved = await this.resolveConflict(meeting, existingMeeting);
          if (!resolved) {
            return {
              success: false,
              error: 'Conflict detected',
              conflicts: [existingMeeting]
            };
          }
        }

        // Update with version increment
        dbMeeting.version = (existingMeeting.version || 0) + 1;

        const { error } = await supabase
          .from('meetings')
          .update(dbMeeting)
          .eq('id', meeting.id);

        if (error) {
          this.addToQueue({ type: 'update', table: 'meetings', data: dbMeeting });
          return { success: false, error: error.message };
        }

        // Log activity
        await this.logActivity({
          meeting_id: meeting.id,
          user_id: userId,
          action: 'update',
          metadata: { version: dbMeeting.version }
        });

      } else {
        // Create new meeting
        dbMeeting.version = 1;

        const { error } = await supabase
          .from('meetings')
          .insert(dbMeeting);

        if (error) {
          this.addToQueue({ type: 'create', table: 'meetings', data: dbMeeting });
          return { success: false, error: error.message };
        }

        // Log activity
        await this.logActivity({
          meeting_id: meeting.id,
          user_id: userId,
          action: 'create'
        });
      }

      return { success: true, synced: 1 };

    } catch (error) {
      console.error('Sync error:', error);
      this.addToQueue({
        type: existingMeeting ? 'update' : 'create',
        table: 'meetings',
        data: meeting
      });
      return { success: false, error: 'Sync failed' };
    }
  }

  // Detect conflicts
  private async detectConflict(local: Meeting, remote: any): Promise<boolean> {
    // Compare timestamps
    const localTime = new Date(local.updatedAt || 0).getTime();
    const remoteTime = new Date(remote.updated_at).getTime();

    // If remote is newer and versions differ, we have a conflict
    return remoteTime > localTime && remote.version !== local.version;
  }

  // Resolve conflicts
  private async resolveConflict(local: Meeting, remote: any): Promise<boolean> {
    switch (this.conflictResolutionStrategy) {
      case 'local':
        // Local wins - proceed with update
        return true;

      case 'remote':
        // Remote wins - discard local changes
        return false;

      case 'merge':
        // Attempt to merge changes
        return this.mergeChanges(local, remote);

      case 'ask':
        // Show conflict resolution UI (not implemented here)
        return false;

      default:
        return false;
    }
  }

  // Merge changes
  private mergeChanges(local: Meeting, remote: any): boolean {
    try {
      // Simple merge strategy - combine both changes
      // In real implementation, this would be more sophisticated
      const merged = {
        ...remote,
        ...local,
        version: remote.version + 1
      };

      // Store merged version
      this.offlineChanges.set(local.id, merged);
      return true;
    } catch (error) {
      console.error('Merge failed:', error);
      return false;
    }
  }

  // Sync all meetings
  async syncAllMeetings(meetings: Meeting[], userId: string): Promise<SyncResult> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    let synced = 0;
    const conflicts: any[] = [];
    const errors: string[] = [];

    for (const meeting of meetings) {
      const result = await this.syncMeeting(meeting, userId);
      if (result.success) {
        synced++;
      } else {
        if (result.conflicts) {
          conflicts.push(...result.conflicts);
        }
        if (result.error) {
          errors.push(result.error);
        }
      }
    }

    return {
      success: synced === meetings.length,
      synced,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };
  }

  // Pull meetings from Supabase
  async pullMeetings(userId: string): Promise<{ meetings: Meeting[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { meetings: [] };
    }

    try {
      // Get meetings where user is owner or collaborator
      const { data: meetings, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_collaborators!inner(user_id, role)
        `)
        .or(`owner_id.eq.${userId},meeting_collaborators.user_id.eq.${userId}`);

      if (error) {
        return { meetings: [], error: error.message };
      }

      // Convert database meetings to app meetings
      const appMeetings: Meeting[] = meetings.map((dbMeeting: any) => ({
        id: dbMeeting.id,
        companyName: dbMeeting.company_name,
        contactName: dbMeeting.contact_name,
        contactRole: dbMeeting.contact_role,
        contactEmail: dbMeeting.contact_email,
        contactPhone: dbMeeting.contact_phone,
        meetingDate: dbMeeting.meeting_date,
        status: dbMeeting.status,
        modules: dbMeeting.modules,
        painPoints: dbMeeting.pain_points,
        customFieldValues: dbMeeting.custom_field_values,
        wizardState: dbMeeting.wizard_state,
        aiInsights: dbMeeting.ai_insights,
        createdAt: dbMeeting.created_at,
        updatedAt: dbMeeting.updated_at,
        version: dbMeeting.version
      }));

      return { meetings: appMeetings };

    } catch (error) {
      console.error('Pull error:', error);
      return { meetings: [], error: 'Failed to pull meetings' };
    }
  }

  // Log activity
  private async logActivity(activity: Partial<MeetingActivity>): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      await supabase
        .from('meeting_activities')
        .insert(activity);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Start auto sync
  private startAutoSync(): void {
    if (this.syncInterval) {
      return;
    }

    // Process queue every 30 seconds
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && isSupabaseConfigured()) {
        this.processQueue();
        this.syncOfflineChanges();
      }
    }, 30000);

    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.processQueue();
      this.syncOfflineChanges();
    });

    window.addEventListener('offline', () => {
      console.log('Offline - sync paused');
    });
  }

  // Sync offline changes
  private async syncOfflineChanges(): Promise<void> {
    if (this.offlineChanges.size === 0 || !isSupabaseConfigured()) {
      return;
    }

    for (const [id, meeting] of this.offlineChanges) {
      // Get user from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const result = await this.syncMeeting(meeting, user.id);
        if (result.success) {
          this.offlineChanges.delete(id);
        }
      }
    }
  }

  // Stop auto sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Set conflict resolution strategy
  setConflictResolution(strategy: 'local' | 'remote' | 'merge' | 'ask'): void {
    this.conflictResolutionStrategy = strategy;
  }

  // Get sync status
  getSyncStatus(): {
    queueLength: number;
    isSyncing: boolean;
    offlineChanges: number;
    isOnline: boolean;
    isConfigured: boolean;
  } {
    return {
      queueLength: this.syncQueue.length,
      isSyncing: this.isSyncing,
      offlineChanges: this.offlineChanges.size,
      isOnline: navigator.onLine,
      isConfigured: isSupabaseConfigured()
    };
  }

  // Force sync
  async forceSync(): Promise<SyncResult> {
    await this.processQueue();
    await this.syncOfflineChanges();

    return {
      success: this.syncQueue.length === 0 && this.offlineChanges.size === 0,
      synced: this.syncQueue.length
    };
  }

  // Clear sync queue
  clearQueue(): void {
    this.syncQueue = [];
    this.saveQueueToStorage();
  }

  // Get failed sync items
  getFailedSyncs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('deadLetterQueue') || '[]');
    } catch {
      return [];
    }
  }

  // Retry failed syncs
  async retryFailedSyncs(): Promise<SyncResult> {
    const failed = this.getFailedSyncs();
    let retried = 0;

    for (const item of failed) {
      delete item.failedAt;
      delete item.retries;
      this.addToQueue(item);
      retried++;
    }

    localStorage.setItem('deadLetterQueue', '[]');
    await this.processQueue();

    return {
      success: true,
      synced: retried
    };
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();