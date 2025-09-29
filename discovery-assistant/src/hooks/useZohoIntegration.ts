import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { parseZohoParams, mapZohoToMeeting } from '../integrations/zoho/paramParser';
import { zohoSyncService } from '../services/zohoSyncService';
import { getZohoStorageKey, validateZohoParams, isTestMode } from '../utils/zohoHelpers';
import { isTestZohoMode, getTestZohoParams, testZohoSync } from '../utils/testZohoMode';
import { zohoRetryQueue } from '../services/zohoRetryQueue';
import { getDiscoveryFromZoho } from '../services/zohoAPI';

export const useZohoIntegration = () => {
  const store = useMeetingStore();
  const [isZohoMode, setIsZohoMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
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

    // Check if we're already viewing this record
    const currentRecordId = store.currentMeeting?.zohoIntegration?.recordId;
    if (currentRecordId === params.zohoRecordId) {
      console.log('Already viewing this Zoho record');
      return; // Already loaded the correct meeting
    }

    // Load data from Zoho first (two-way sync!)
    loadFromZoho(params);
  }, [search]);

  const loadFromZoho = async (params: any) => {
    try {
      console.log('Loading Discovery data from Zoho for record:', params.zohoRecordId);

      // First, try to fetch existing data from Zoho
      const zohoResult = await getDiscoveryFromZoho(params.zohoRecordId);

      if (zohoResult.success && zohoResult.discoveryData?.meetingData) {
        // Found existing meeting data in Zoho - load it
        console.log('Found existing Discovery data in Zoho, loading...');
        const meetingData = zohoResult.discoveryData.meetingData;

        // Ensure the meeting has the correct Zoho integration info
        meetingData.zohoIntegration = {
          recordId: params.zohoRecordId,
          module: 'Potentials1',
          contactInfo: {
            email: params.email,
            phone: params.phone
          },
          lastSync: zohoResult.discoveryData.lastUpdate,
          syncEnabled: true
        };

        // Load the meeting from Zoho data
        store.createOrLoadMeeting(meetingData);

        // Also save to localStorage for offline access
        const localKey = getZohoStorageKey(params.zohoRecordId);
        try {
          localStorage.setItem(localKey, JSON.stringify(meetingData));
        } catch (error) {
          console.error('Failed to save to localStorage (quota exceeded?):', error);
        }
      } else {
        // No existing data in Zoho, check localStorage as fallback
        console.log('No Discovery data in Zoho, checking localStorage...');
        const localKey = getZohoStorageKey(params.zohoRecordId);
        const existingData = localStorage.getItem(localKey);

        if (existingData) {
          try {
            const meeting = JSON.parse(existingData);
            console.log('Loading from localStorage (will sync to Zoho)');
            store.loadMeeting(meeting.meetingId);
            // Trigger sync to save this to Zoho
            setTimeout(() => syncToZoho(), 2000);
          } catch (e) {
            console.error('Failed to parse localStorage data');
            createNewMeeting(params);
          }
        } else {
          // No data anywhere - create new meeting
          console.log('Creating new meeting for Zoho record:', params.zohoRecordId);
          createNewMeeting(params);
        }
      }
    } catch (error) {
      console.error('Failed to load from Zoho, falling back to localStorage:', error);
      // Fallback to localStorage if Zoho fetch fails
      const localKey = getZohoStorageKey(params.zohoRecordId);
      const existingData = localStorage.getItem(localKey);

      if (existingData) {
        try {
          const meeting = JSON.parse(existingData);
          store.loadMeeting(meeting.meetingId);
        } catch (e) {
          createNewMeeting(params);
        }
      } else {
        createNewMeeting(params);
      }
    }
  };

  const createNewMeeting = (params: any) => {
    const mappedData = mapZohoToMeeting(params);
    store.createOrLoadMeeting(mappedData);
  };

  const syncToZoho = async () => {
    const meeting = store.currentMeeting;
    if (!meeting?.zohoIntegration?.recordId) return;

    // Handle test mode
    if (isTestMode()) {
      testZohoSync(meeting);
      return;
    }

    try {
      setSyncStatus('syncing');

      // Use the backend API for syncing
      const success = await zohoSyncService.syncToZoho(meeting);

      if (success) {
        store.updateZohoLastSync(new Date().toISOString());
        setSyncStatus('idle');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to sync to Zoho:', error);

      // Add to retry queue if sync is enabled
      if (meeting.zohoIntegration?.syncEnabled) {
        zohoRetryQueue.addToQueue(meeting, 'sync', error);
      }
    }
  };

  const enableAutoSync = () => {
    const meeting = store.currentMeeting;
    if (!meeting?.zohoIntegration?.recordId) return;

    store.setZohoSyncEnabled(true);
    syncToZoho();
  };

  return {
    isZohoMode,
    syncStatus,
    syncToZoho,
    enableAutoSync,
  };
};