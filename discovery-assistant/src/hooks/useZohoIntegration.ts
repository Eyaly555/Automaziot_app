import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { parseZohoParams, mapZohoToMeeting } from '../integrations/zoho/paramParser';
import { zohoSyncService } from '../services/zohoSyncService';
import { useZohoAuth } from './useZohoAuth';
import { getZohoStorageKey, validateZohoParams, isTestMode } from '../utils/zohoHelpers';
import { isTestZohoMode, getTestZohoParams, testZohoSync } from '../utils/testZohoMode';
import { zohoRetryQueue } from '../services/zohoRetryQueue';

export const useZohoIntegration = () => {
  const store = useMeetingStore();
  const [isZohoMode, setIsZohoMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const { startAuth, token, refreshToken } = useZohoAuth();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    // Check for test mode first
    if (isTestZohoMode()) {
      const testParams = getTestZohoParams();
      if (testParams) {
        setIsZohoMode(true);
        createNewMeeting(testParams);
        return;
      }
    }

    const params = parseZohoParams(search ? `?${search}` : '');
    if (!params || !validateZohoParams(params)) return;

    setIsZohoMode(true);
    const localKey = getZohoStorageKey(params.zohoRecordId);
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
  }, [search]);

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

      // Add to retry queue if we have a meeting structure
      const meeting = store.currentMeeting;
      if (meeting) {
        zohoRetryQueue.addToQueue(meeting, 'load', error);
      }
    }
  };

  const syncToZoho = async () => {
    const meeting = store.currentMeeting;
    if (!meeting?.zohoIntegration?.recordId) return;

    // Handle test mode
    if (isTestMode()) {
      const result = await testZohoSync(meeting);
      if (result.success) {
        store.updateZohoLastSync(new Date().toISOString());
        setSyncStatus('idle');
      }
      return;
    }

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
        await zohoSyncService.syncToZoho(meeting, attempts === 0 ? token : newToken || token);
        store.updateZohoLastSync(new Date().toISOString());
        setSyncStatus('idle');
        return;
      } catch (error: any) {
        attempts++;

        // Check if it's a 401 error that needs token refresh
        if (error.message?.includes('needsRefresh') && attempts < maxAttempts) {
          console.log('Token expired, refreshing...');
          var newToken = await refreshToken();
          if (!newToken) {
            setSyncStatus('error');
            console.error('Token refresh failed');
            return;
          }
          // Token will be used in next iteration
          continue;
        }

        setSyncStatus('error');
        console.error('Sync to Zoho failed:', error);

        // Add to retry queue
        if (meeting) {
          zohoRetryQueue.addToQueue(meeting, 'sync', error);
        }
        return;
      }
    }
  };

  // Auto-sync on significant changes
  useEffect(() => {
    if (!isZohoMode || !store.currentMeeting?.zohoIntegration?.syncEnabled) return;

    const syncTimer = setTimeout(() => {
      syncToZoho();
    }, 30000); // 30 second debounce for better performance

    return () => clearTimeout(syncTimer);
  }, [store.currentMeeting?.modules, isZohoMode, syncToZoho]);

  // Sync on page unload
  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      if (isZohoMode && store.currentMeeting) {
        // Synchronous save to localStorage
        const localKey = getZohoStorageKey(store.currentMeeting.zohoIntegration?.recordId || '');
        localStorage.setItem(localKey, JSON.stringify(store.currentMeeting));

        // Use sendBeacon for critical sync if available
        if (navigator.sendBeacon && token) {
          const syncData = JSON.stringify({
            meeting: store.currentMeeting,
            token: token
          });
          navigator.sendBeacon('/api/zoho/beacon-sync', syncData);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isZohoMode, store.currentMeeting, token]);

  return {
    isZohoMode,
    syncStatus,
    syncToZoho,
    loadFromZoho
  };
};