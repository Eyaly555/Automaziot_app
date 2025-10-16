/**
 * Reset Meeting Modal
 *
 * Two-step confirmation modal for resetting meeting data:
 * Step 1: Confirm with explanation of what will be reset/preserved
 * Step 2: Type client name to verify intention
 *
 * Features:
 * - Double confirmation to prevent accidental data loss
 * - Name verification for extra safety
 * - Optional backup creation (enabled by default)
 * - Toast notifications for success/failure
 */

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  RotateCcw,
  Shield,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import toast from 'react-hot-toast';

interface ResetMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetMeetingModal: React.FC<ResetMeetingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentMeeting = useMeetingStore((state) => state.currentMeeting);
  const resetMeetingData = useMeetingStore((state) => state.resetMeetingData);

  const [step, setStep] = useState<1 | 2>(1);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [createBackup, setCreateBackup] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen || !currentMeeting) return null;

  const handleClose = () => {
    if (!isResetting) {
      setStep(1);
      setConfirmationInput('');
      setCreateBackup(true);
      onClose();
    }
  };

  const handleContinueToStep2 = () => {
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setConfirmationInput('');
  };

  const handleReset = async () => {
    setIsResetting(true);

    try {
      const success = await resetMeetingData(createBackup);

      if (success) {
        toast.success(
          createBackup
            ? 'המידע אופס בהצלחה. גיבוי נשמר ל-24 שעות'
            : 'המידע אופס בהצלחה',
          {
            icon: '✅',
            duration: 5000,
            position: 'top-center',
          }
        );
        handleClose();
        onSuccess?.();
      } else {
        toast.error('שגיאה באיפוס המידע. נסה שוב', {
          icon: '❌',
          duration: 5000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('[ResetMeetingModal] Reset failed:', error);
      toast.error('שגיאה באיפוס המידע', {
        icon: '❌',
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const isNameMatch =
    confirmationInput.trim().toLowerCase() ===
    currentMeeting.clientName.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                איפוס מידע פגישה
              </h2>
              <p className="text-sm text-gray-500 mt-1">שלב {step} מתוך 2</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isResetting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Initial Confirmation
            <div className="space-y-6">
              {/* Warning */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-2">
                      אזהרה: פעולה זו תמחק את כל המידע שהוזן בפגישה
                    </h3>
                    <p className="text-sm text-red-700">
                      כל הנתונים שמילאת במהלך הפגישה יימחקו ולא יהיה ניתן לשחזרם
                      (אלא אם תבחר ליצור גיבוי).
                    </p>
                  </div>
                </div>
              </div>

              {/* What will be reset */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                  מה יימחק:
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>
                        כל 9 המודולים (סקירה כללית, לידים ומכירות, שירות לקוחות,
                        וכו')
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>נקודות כאב, הערות, טיימר</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>חישובי ROI, ערכים מותאמים אישית</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>מפרט יישום (Phase 2) ומעקב פיתוח (Phase 3)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>היסטוריית מעברים בין שלבים</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* What will be preserved */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  מה יישמר (מידע מזוהו):
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        שם הלקוח: <strong>{currentMeeting.clientName}</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>פרטי קשר (טלפון, אימייל)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>קישור לזוהו (Record ID)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>שלב ניהול הפרויקט הנוכחי</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>תאריך יצירת הפגישה</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Backup option */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createBackup}
                    onChange={(e) => setCreateBackup(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-blue-900 block mb-1">
                      שמור גיבוי לשחזור (מומלץ)
                    </span>
                    <span className="text-sm text-blue-700">
                      הגיבוי יישמר למשך 24 שעות ויאפשר לך לשחזר את המידע במידת
                      הצורך. ניתן לשחזר דרך תפריט ההגדרות.
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleContinueToStep2}
                  className="px-6 py-3 text-white bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
                >
                  המשך לאישור
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Name Verification
            <div className="space-y-6">
              {/* Final Warning */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-2">אישור סופי</h3>
                    <p className="text-sm text-red-700">
                      זהו שלב האישור האחרון. המידע יימחק לאחר לחיצה על "אפס
                      מידע".
                    </p>
                  </div>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block font-semibold text-gray-900 mb-3">
                  הקלד את שם הלקוח לאימות:
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    placeholder={`הקלד: ${currentMeeting.clientName}`}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-lg"
                    disabled={isResetting}
                    autoFocus
                  />
                  {confirmationInput && !isNameMatch && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="w-4 h-4" />
                      השם לא תואם. נסה שוב.
                    </p>
                  )}
                  {confirmationInput && isNameMatch && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      השם תואם!
                    </p>
                  )}
                </div>
              </div>

              {/* Backup reminder */}
              {createBackup && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    גיבוי יווצר אוטומטית לפני האיפוס ויישמר למשך 24 שעות.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={handleBackToStep1}
                  disabled={isResetting}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  חזור
                </button>
                <button
                  onClick={handleReset}
                  disabled={!isNameMatch || isResetting}
                  className="px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isResetting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>מאפס...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>אפס מידע</span>
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
