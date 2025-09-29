import { useEffect, useState } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import { parseZohoParams, mapZohoToMeeting } from '../integrations/zoho/paramParser';
import { zohoSyncService } from '../services/zohoSyncService';
import { useZohoAuth } from './useZohoAuth';

export const useZohoIntegration = () => {
  const store = useMeetingStore();
  const [isZohoMode, setIsZohoMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const { startAuth, token, refreshToken } = useZohoAuth();

  useEffect(() => {
    const params = parseZohoParams(window.location.search);
    if (!params) return;

    setIsZohoMode(true);
    const localKey = `discovery_zoho_${params.zohoRecordId}`;
    const existingData = localStorage.getItem(localKey);

    if (existingData) {
      // Load existing meeting
      try {
        const meeting = JSON.parse(existingData);
        store.loadMeeting(meeting.meetingId);
        // If sync is enabled but no token, start auth
        if (meeting.zohoIntegration?.syncEnabled && !token) {
          startAuth();
        }
      } catch (e) {
        console.error('Failed to parse existing meeting data');
        createNewMeeting(params);
      }
    } else {
      // Create new meeting with Zoho data
      createNewMeeting(params);

      // Try to load from Zoho if available
      if (token) {
        loadFromZoho(params.zohoRecordId);
      }
    }
  }, []);

  const createNewMeeting = (params: any) => {
    const mappedData = mapZohoToMeeting(params);
    store.createOrLoadMeeting(mappedData);
    // If Zoho integration detected, initiate auth
    if (mappedData.zohoIntegration) {
      startAuth();
    }
  };

  const loadFromZoho = async (recordId: string) => {
    if (!token) {
      console.error('No token available for Zoho sync');
      return;
    }

    try {
      setSyncStatus('syncing');
      const data = await zohoSyncService.loadFromZoho(recordId, token);
      if (data) {
        store.updateMeeting(data);
      }
      setSyncStatus('idle');
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to load from Zoho:', error);
    }
  };

  const syncToZoho = async () => {
    const meeting = store.currentMeeting;
    if (!meeting?.zohoIntegration?.recordId) return;

    if (!token) {
      console.error('No token available for Zoho sync');
      startAuth();
      return;
    }

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        setSyncStatus('syncing');
        await zohoSyncService.syncToZoho(meeting, token);
        store.updateZohoLastSync(new Date().toISOString());
        setSyncStatus('idle');
        return;
      } catch (error: any) {
        attempts++;

        // Check if it's a 401 error that needs token refresh
        if (error.message?.includes('needsRefresh') && attempts < maxAttempts) {
          console.log('Token expired, refreshing...');
          const newToken = await refreshToken();
          if (!newToken) {
            setSyncStatus('error');
            console.error('Token refresh failed');
            return;
          }
          // Retry with new token
          continue;
        }

        setSyncStatus('error');
        console.error('Sync to Zoho failed:', error);
        return;
      }
    }
  };

  // Auto-sync on significant changes
  useEffect(() => {
    if (!isZohoMode || !store.currentMeeting?.zohoIntegration?.syncEnabled) return;

    const syncTimer = setTimeout(() => {
      syncToZoho();
    }, 5000); // 5 second debounce

    return () => clearTimeout(syncTimer);
  }, [store.currentMeeting?.modules]);

  // Sync on page unload
  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      if (isZohoMode && store.currentMeeting) {
        // Synchronous save to localStorage
        const localKey = `discovery_zoho_${store.currentMeeting.zohoIntegration?.recordId}`;
        localStorage.setItem(localKey, JSON.stringify(store.currentMeeting));

        // Attempt async sync (may not complete)
        syncToZoho();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isZohoMode, store.currentMeeting]);

  return {
    isZohoMode,
    syncStatus,
    syncToZoho,
    loadFromZoho
  };
};