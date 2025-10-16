/**
 * Restore Backup Menu
 *
 * Displays available backups for the current meeting and allows restoration.
 * Shows backup metadata including timestamp, reason, and progress.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle,
  Database,
} from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { BackupMetadata } from '../../../types/backup';
import toast from 'react-hot-toast';

interface RestoreBackupMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RestoreBackupMenu: React.FC<RestoreBackupMenuProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentMeeting = useMeetingStore((state) => state.currentMeeting);
  const getAvailableBackups = useMeetingStore(
    (state) => state.getAvailableBackups
  );
  const restoreFromBackup = useMeetingStore((state) => state.restoreFromBackup);

  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen]);

  const loadBackups = () => {
    try {
      const availableBackups = getAvailableBackups();
      setBackups(availableBackups);
    } catch (error) {
      console.error('[RestoreBackupMenu] Failed to load backups:', error);
      toast.error('שגיאה בטעינת רשימת גיבויים');
    }
  };

  const handleClose = () => {
    if (!isRestoring) {
      setSelectedBackupId(null);
      setConfirmRestore(false);
      onClose();
    }
  };

  const handleSelectBackup = (backupId: string) => {
    setSelectedBackupId(backupId);
    setConfirmRestore(false);
  };

  const handleRestore = async () => {
    if (!selectedBackupId) return;

    setIsRestoring(true);

    try {
      const success = await restoreFromBackup(selectedBackupId);

      if (success) {
        toast.success('המידע שוחזר בהצלחה מהגיבוי!', {
          icon: '✅',
          duration: 5000,
          position: 'top-center',
        });
        handleClose();
        onSuccess?.();
      } else {
        toast.error('שגיאה בשחזור המידע מהגיבוי', {
          icon: '❌',
          duration: 5000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('[RestoreBackupMenu] Restore failed:', error);
      toast.error('שגיאה בשחזור המידע', {
        icon: '❌',
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const getReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      pre_reset: 'לפני איפוס',
      manual_backup: 'גיבוי ידני',
      auto_backup: 'גיבוי אוטומטי',
    };
    return labels[reason] || reason;
  };

  const getReasonColor = (reason: string): string => {
    const colors: Record<string, string> = {
      pre_reset: 'bg-orange-100 text-orange-700 border-orange-200',
      manual_backup: 'bg-blue-100 text-blue-700 border-blue-200',
      auto_backup: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[reason] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `לפני ${diffMinutes} דקות`;
    } else if (diffHours < 24) {
      return `לפני ${diffHours} שעות`;
    } else {
      return new Date(date).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getExpiresIn = (expiresAt: Date): string => {
    const now = new Date();
    const diffMs = new Date(expiresAt).getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMs < 0) return 'פג תוקף';
    if (diffMinutes < 60) return `${diffMinutes} דקות`;
    if (diffHours < 24) return `${diffHours} שעות`;
    return `${Math.floor(diffHours / 24)} ימים`;
  };

  if (!isOpen || !currentMeeting) return null;

  const selectedBackup = backups.find((b) => b.id === selectedBackupId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">שחזור מגיבוי</h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentMeeting.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isRestoring}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {backups.length === 0 ? (
            // No backups
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                אין גיבויים זמינים
              </h3>
              <p className="text-sm text-gray-600">
                טרם נוצרו גיבויים עבור פגישה זו.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">שחזור מגיבוי</p>
                  <p>
                    בחר גיבוי מהרשימה למטה. שחזור יחליף את כל המידע הנוכחי במידע
                    מהגיבוי.
                  </p>
                </div>
              </div>

              {/* Backups list */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  גיבויים זמינים ({backups.length}):
                </h3>

                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    onClick={() => handleSelectBackup(backup.id)}
                    className={`
                      border-2 rounded-xl p-4 cursor-pointer transition-all
                      ${
                        selectedBackupId === backup.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side - info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`
                            px-2 py-1 rounded-lg text-xs font-semibold border
                            ${getReasonColor(backup.reason)}
                          `}
                          >
                            {getReasonLabel(backup.reason)}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(backup.timestamp)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              התקדמות:
                            </span>
                            <div className="flex-1 max-w-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${backup.overallProgress}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                                  {backup.overallProgress}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              יפוג בעוד: {getExpiresIn(backup.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side - selection indicator */}
                      {selectedBackupId === backup.id && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirmation */}
              {selectedBackup && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmRestore}
                      onChange={(e) => setConfirmRestore(e.target.checked)}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-orange-900 block mb-1">
                        אני מאשר שחזור מגיבוי
                      </span>
                      <span className="text-sm text-orange-700">
                        המידע הנוכחי יוחלף במידע מהגיבוי שנוצר{' '}
                        {formatDate(selectedBackup.timestamp)}. פעולה זו תדרוס
                        את כל השינויים שנעשו מאז יצירת הגיבוי.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  disabled={isRestoring}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  ביטול
                </button>
                <button
                  onClick={handleRestore}
                  disabled={!selectedBackupId || !confirmRestore || isRestoring}
                  className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRestoring ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>משחזר...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      <span>שחזר גיבוי</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
