/**
 * Feedback Modal Component
 *
 * Modal dialog for capturing detailed feedback during production testing.
 * Auto-detects current component and captures console logs.
 *
 * @module components/Feedback/FeedbackModal
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Camera, AlertCircle } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import { consoleLogger } from '../../services/consoleLogger';
import { getComponentByRoute } from '../../services/componentRegistry';
import type { FeedbackCategory, FeedbackPriority } from '../../types/feedback';

interface Props {
  onClose: () => void;
}

/**
 * Feedback Modal
 *
 * Full-featured modal for capturing feedback with:
 * - Auto-detected component context
 * - Category and priority selection
 * - Console log capture
 * - Screenshot capability (placeholder)
 */
export const FeedbackModal: React.FC<Props> = ({ onClose }) => {
  const location = useLocation();
  const currentComponent = getComponentByRoute(location.pathname);

  // Form state
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [priority, setPriority] = useState<FeedbackPriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [includeConsoleLogs, setIncludeConsoleLogs] = useState(true);
  const [screenshot] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const errors = consoleLogger.getErrors();
  const hasErrors = errors.length > 0;

  // Auto-select 'error' category if console errors exist
  useEffect(() => {
    if (hasErrors && category === 'bug') {
      setCategory('error');
    }
  }, [hasErrors]);

  // Handle screenshot capture (placeholder)
  const handleScreenshot = () => {
    // TODO: Implement screenshot capture using html2canvas or similar
    alert('Screenshot feature - to be implemented');
  };

  // Handle save
  const handleSave = () => {
    if (!title.trim()) {
      alert('יש למלא כותרת');
      return;
    }

    setIsSaving(true);

    try {
      feedbackService.save({
        route: location.pathname,
        componentName: currentComponent?.name || 'Unknown',
        filePath: currentComponent?.filePath || 'Unknown',
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        consoleLogs: includeConsoleLogs ? consoleLogger.getLogs(50) : [],
        consoleErrors: includeConsoleLogs ? errors : [],
        screenshot,
        status: 'todo'
      });

      // Success
      alert('✅ הפידבק נשמר בהצלחה!');
      onClose();
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('❌ שגיאה בשמירת הפידבק');
    } finally {
      setIsSaving(false);
    }
  };

  // Category options
  const categories: Array<{ value: FeedbackCategory; label: string; color: string }> = [
    { value: 'bug', label: '🐛 באג', color: 'red' },
    { value: 'feature', label: '✨ פיצר', color: 'blue' },
    { value: 'ui_ux', label: '🎨 UI/UX', color: 'purple' },
    { value: 'error', label: '❌ שגיאה', color: 'red' },
    { value: 'performance', label: '⚡ ביצועים', color: 'yellow' },
    { value: 'note', label: '📝 הערה', color: 'gray' }
  ];

  // Priority options
  const priorities: Array<{ value: FeedbackPriority; label: string }> = [
    { value: 'low', label: '🟢 נמוך' },
    { value: 'medium', label: '🟡 בינוני' },
    { value: 'high', label: '🟠 גבוה' },
    { value: 'urgent', label: '🔴 דחוף' }
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">📝 פידבק מהיר</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Component Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900">
              קומפוננטה נוכחית: {currentComponent?.displayName || 'לא זוהתה'}
            </div>
            <div className="text-xs text-blue-600 mt-1 font-mono">
              {currentComponent?.filePath || 'Unknown'}
            </div>
          </div>

          {/* Errors Alert */}
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-900">
                  זוהו {errors.length} שגיאות בconsole
                </div>
                <div className="text-xs text-red-700 mt-1">
                  השגיאות יצורפו אוטומטית לפידבק
                </div>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג הפידבק
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    category === cat.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              עדיפות
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    priority === p.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כותרת <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="לדוגמה: כפתור שמירה לא עובד"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תיאור מפורט
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="תאר את הבעיה, הרעיון, או ההערה בפירוט..."
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeConsoleLogs}
                onChange={e => setIncludeConsoleLogs(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                כלול console logs ({consoleLogger.getCount()} אחרונים
                {errors.length > 0 && `, ${errors.length} שגיאות`})
              </span>
            </label>

            <button
              onClick={handleScreenshot}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              צרף צילום מסך (לממש)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                       text-white py-3 px-4 rounded-lg font-medium transition-all"
          >
            {isSaving ? '⏳ שומר...' : '💾 שמור פידבק'}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-all"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};
