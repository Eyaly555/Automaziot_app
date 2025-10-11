import { Meeting } from '../types';
import { syncMeetingWithZoho } from './zohoAPI';

class ZohoSyncService {
  /**
   * Sync meeting to Zoho CRM using backend API
   */
  async syncToZoho(meeting: Meeting): Promise<boolean> {
    try {
      const recordId = meeting.zohoIntegration?.recordId;

      console.log('[ZohoSync] Syncing meeting to Zoho', {
        meetingId: meeting.meetingId,
        recordId
      });

      const result = await syncMeetingWithZoho(meeting, recordId);

      if (result.success) {
        console.log('[ZohoSync] Successfully synced to Zoho', result);

        // Update the record ID if it's a new record
        if (result.recordId && !recordId) {
          // Store the new record ID for future syncs
          meeting.zohoIntegration = {
            ...meeting.zohoIntegration,
            recordId: result.recordId,
            lastSync: new Date().toISOString()
          };
        }

        return true;
      } else {
        console.error('[ZohoSync] Sync failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('[ZohoSync] Error syncing to Zoho:', error);
      return false;
    }
  }

  /**
   * Check if Zoho integration is available
   * Now just checks if we're in Zoho context (widget or params)
   */
  isZohoAvailable(): boolean {
    // Check if we're in Zoho widget context
    if (typeof window !== 'undefined' && (window as any).ZOHO?.CRM) {
      return true;
    }

    // Check if we have Zoho parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('Entity') || urlParams.has('EntityId');
  }

  /**
   * Get Zoho context from URL or widget
   */
  getZohoContext(): { entity?: string; entityId?: string; isWidget: boolean } {
    // Check for Zoho widget
    if (typeof window !== 'undefined' && (window as any).ZOHO?.CRM) {
      return { isWidget: true };
    }

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    return {
      entity: urlParams.get('Entity') || undefined,
      entityId: urlParams.get('EntityId') || undefined,
      isWidget: false
    };
  }
}

export const zohoSyncService = new ZohoSyncService();