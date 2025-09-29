import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { parseZohoParams, mapZohoToMeeting } from '../integrations/zoho/paramParser';
import { zohoSyncService } from '../services/zohoSyncService';
import { getZohoStorageKey, validateZohoParams, isTestMode } from '../utils/zohoHelpers';
import { isTestZohoMode, getTestZohoParams, testZohoSync } from '../utils/testZohoMode';
import { zohoRetryQueue } from '../services/zohoRetryQueue';

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

    const localKey = getZohoStorageKey(params.zohoRecordId);
    const existingData = localStorage.getItem(localKey);

    if (existingData) {
      // Load existing meeting for this specific Zoho record
      try {
        const meeting = JSON.parse(existingData);
        console.log('Loading existing meeting for Zoho record:', params.zohoRecordId);
        store.loadMeeting(meeting.meetingId);
      } catch (e) {
        console.error('Failed to parse existing meeting data');
        createNewMeeting(params);
      }
    } else {
      // Create new meeting with Zoho data
      console.log('Creating new meeting for Zoho record:', params.zohoRecordId);
      createNewMeeting(params);
    }
  }, [search]);

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