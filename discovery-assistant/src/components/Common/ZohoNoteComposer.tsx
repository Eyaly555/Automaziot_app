import React, { useState, useEffect } from 'react';
import { X, Send, Loader, CheckCircle, AlertCircle, StickyNote } from 'lucide-react';
import { Button, Card } from '../Base';
import { TextArea } from '../Base/TextArea';
import { Input } from '../Base/Input';
import { createZohoNote } from '../../services/zohoAPI';
import { useMeetingStore } from '../../store/useMeetingStore';

export interface ZohoNoteComposerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedTitle: string;
  suggestedContent: string;
  onSuccess?: () => void;
}

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

/**
 * ZohoNoteComposer - Modal component for composing and sending notes to Zoho CRM
 * 
 * Features:
 * - Editable title and content
 * - Suggested content based on context
 * - Visual feedback during send
 * - Success/error handling
 */
export const ZohoNoteComposer: React.FC<ZohoNoteComposerProps> = ({
  isOpen,
  onClose,
  suggestedTitle,
  suggestedContent,
  onSuccess
}) => {
  const { currentMeeting } = useMeetingStore();
  
  const [title, setTitle] = useState(suggestedTitle);
  const [content, setContent] = useState(suggestedContent);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Update when props change
  useEffect(() => {
    if (isOpen) {
      setTitle(suggestedTitle);
      setContent(suggestedContent);
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, suggestedTitle, suggestedContent]);

  // Handle send
  const handleSend = async () => {
    if (!currentMeeting?.zohoIntegration?.recordId) {
      setErrorMessage('לא נמצא Record ID של Zoho');
      setStatus('error');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setErrorMessage('נא למלא כותרת ותוכן');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      await createZohoNote(
        currentMeeting.zohoIntegration.recordId,
        title.trim(),
        content.trim(),
        currentMeeting.zohoIntegration.module || 'Potentials1'
      );

      setStatus('success');
      
      // Show success for 1.5 seconds then close
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to send note to Zoho:', error);
      setErrorMessage(error instanceof Error ? error.message : 'שגיאה בשליחת ההערה');
      setStatus('error');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (status === 'sending') return; // Prevent closing during send
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Don't render if no meeting or no Zoho integration
  if (!currentMeeting?.zohoIntegration?.recordId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-bold">שגיאה</h3>
          </div>
          <p className="text-gray-700 mb-6">
            לא ניתן לשלוח הערות ל-Zoho. אין חיבור לרקורד Zoho.
          </p>
          <Button onClick={onClose} variant="outline" size="md" className="w-full">
            סגור
          </Button>
        </div>
      </div>
    );
  }

  const isEnglish = currentMeeting.phase === 'development';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
      dir={isEnglish ? 'ltr' : 'rtl'}
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== 'sending') {
          handleCancel();
        }
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <StickyNote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEnglish ? 'Send Note to Zoho CRM' : 'שלח הערה ל-Zoho CRM'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentMeeting.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={status === 'sending'}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isEnglish ? 'Close' : 'סגור'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  {isEnglish ? 'Error' : 'שגיאה'}
                </p>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                {isEnglish 
                  ? '✓ Note sent successfully to Zoho!' 
                  : '✓ ההערה נשלחה בהצלחה ל-Zoho!'}
              </p>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEnglish ? 'Title' : 'כותרת'}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEnglish ? 'Note title...' : 'כותרת ההערה...'}
              disabled={status === 'sending' || status === 'success'}
              className="w-full"
            />
          </div>

          {/* Content TextArea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEnglish ? 'Content' : 'תוכן'}
            </label>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isEnglish ? 'Note content...' : 'תוכן ההערה...'}
              rows={10}
              disabled={status === 'sending' || status === 'success'}
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              {isEnglish 
                ? 'You can edit the suggested content before sending' 
                : 'ניתן לערוך את התוכן המוצע לפני השליחה'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50"
          dir={isEnglish ? 'ltr' : 'rtl'}
        >
          <Button
            onClick={handleCancel}
            variant="outline"
            size="md"
            disabled={status === 'sending' || status === 'success'}
          >
            {isEnglish ? 'Cancel' : 'ביטול'}
          </Button>
          <Button
            onClick={handleSend}
            variant={status === 'success' ? 'success' : 'primary'}
            size="md"
            icon={
              status === 'sending' ? <Loader className="animate-spin" /> :
              status === 'success' ? <CheckCircle /> :
              <Send />
            }
            disabled={status === 'sending' || status === 'success' || !title.trim() || !content.trim()}
            loading={status === 'sending'}
          >
            {status === 'sending' 
              ? (isEnglish ? 'Sending...' : 'שולח...') 
              : status === 'success'
              ? (isEnglish ? 'Sent!' : 'נשלח!')
              : (isEnglish ? 'Send to Zoho' : 'שלח ל-Zoho')}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};

