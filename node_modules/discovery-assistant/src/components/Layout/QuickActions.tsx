import React, { useState } from 'react';
import { Save, Download, RefreshCw, Check } from 'lucide-react';
import { Button } from '../Base/Button';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  exportDiscoveryPDF,
  exportImplementationSpecPDF,
  exportDevelopmentPDF,
} from '../../utils/exportTechnicalSpec';
import { SendNoteButton } from '../Common/SendNoteButton';
import { ZohoNoteComposer } from '../Common/ZohoNoteComposer';
import { useZohoNote } from '../../hooks/useZohoNote';

/**
 * Quick Actions Component
 * Floating action bar with Save, Export, and Sync buttons
 * Shows feedback for save operations
 */
export const QuickActions: React.FC = () => {
  const { currentMeeting, syncMeeting } = useMeetingStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>(
    'idle'
  );
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting'>(
    'idle'
  );

  // Zoho Note functionality
  const {
    isOpen: isNoteComposerOpen,
    suggestedTitle,
    suggestedContent,
    openComposer,
    closeComposer,
    handleSuccess,
  } = useZohoNote('dashboard');

  const isEnglish = currentMeeting?.phase === 'development';

  // Manual save (store already has auto-save, but this provides visual feedback)
  const handleSave = async () => {
    if (!currentMeeting) return;

    setSaveStatus('saving');

    // Simulate save delay for visual feedback
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Sync with Supabase/Zoho
  const handleSync = async () => {
    if (!currentMeeting) return;

    setSyncStatus('syncing');

    try {
      await syncMeeting(currentMeeting.meetingId);
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('idle');
    }
  };

  // Export to PDF
  const handleExport = async () => {
    if (!currentMeeting) return;

    setExportStatus('exporting');

    try {
      // Choose export function based on phase
      const phase = currentMeeting.phase;
      if (phase === 'discovery') {
        await exportDiscoveryPDF(currentMeeting);
      } else if (phase === 'implementation_spec') {
        await exportImplementationSpecPDF(currentMeeting);
      } else if (phase === 'development') {
        await exportDevelopmentPDF(currentMeeting);
      }
      setExportStatus('idle');
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('idle');
    }
  };

  // Don't show on clients list page
  if (!currentMeeting) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
      dir={isEnglish ? 'ltr' : 'rtl'}
    >
      <div className="bg-white border-2 border-gray-200 rounded-full shadow-lg px-2 py-2 flex items-center gap-2">
        {/* Save Button */}
        <Button
          variant={saveStatus === 'saved' ? 'success' : 'ghost'}
          size="sm"
          icon={saveStatus === 'saved' ? <Check /> : <Save />}
          loading={saveStatus === 'saving'}
          onClick={handleSave}
          ariaLabel={isEnglish ? 'Save' : 'שמור'}
        >
          {saveStatus === 'saved'
            ? isEnglish
              ? 'Saved'
              : 'נשמר'
            : isEnglish
              ? 'Save'
              : 'שמור'}
        </Button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Sync Button */}
        <Button
          variant={syncStatus === 'synced' ? 'success' : 'ghost'}
          size="sm"
          icon={syncStatus === 'synced' ? <Check /> : <RefreshCw />}
          loading={syncStatus === 'syncing'}
          onClick={handleSync}
          ariaLabel={isEnglish ? 'Sync' : 'סנכרן'}
        >
          {syncStatus === 'synced'
            ? isEnglish
              ? 'Synced'
              : 'סונכרן'
            : isEnglish
              ? 'Sync'
              : 'סנכרן'}
        </Button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Export Button */}
        <Button
          variant="ghost"
          size="sm"
          icon={<Download />}
          loading={exportStatus === 'exporting'}
          onClick={handleExport}
          ariaLabel={isEnglish ? 'Export' : 'ייצא'}
        >
          {isEnglish ? 'Export' : 'ייצא'}
        </Button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Send Note Button */}
        <SendNoteButton
          onClick={openComposer}
          variant="ghost"
          size="sm"
          showIcon={true}
          label={isEnglish ? 'Send Note' : 'שלח Note'}
        />
      </div>

      {/* Zoho Note Composer Modal */}
      <ZohoNoteComposer
        isOpen={isNoteComposerOpen}
        onClose={closeComposer}
        suggestedTitle={suggestedTitle}
        suggestedContent={suggestedContent}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
