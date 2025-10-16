/**
 * Feedback Viewer Component
 *
 * Admin interface for viewing, managing, and exporting feedbacks.
 * Displays all feedbacks with filtering, status updates, and export options.
 *
 * @module components/Feedback/FeedbackViewer
 */

import React, { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Filter } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import type {
  FeedbackEntry,
  FeedbackStatus,
  FeedbackCategory,
  FeedbackPriority,
} from '../../types/feedback';

/**
 * Feedback Viewer
 *
 * Comprehensive feedback management interface with:
 * - Statistics dashboard
 * - Filtering by status, category, priority
 * - Status updates
 * - Delete functionality
 * - Export to Markdown/JSON
 */
export const FeedbackViewer: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>(
    'all'
  );
  const [filterCategory, setFilterCategory] = useState<
    FeedbackCategory | 'all'
  >('all');
  const [filterPriority, setFilterPriority] = useState<
    FeedbackPriority | 'all'
  >('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load feedbacks
  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = () => {
    setFeedbacks(feedbackService.getAll());
  };

  // Apply filters
  const filtered = feedbacks.filter(
    (f) =>
      (filterStatus === 'all' || f.status === filterStatus) &&
      (filterCategory === 'all' || f.category === filterCategory) &&
      (filterPriority === 'all' || f.priority === filterPriority)
  );

  // Sort by priority and date
  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Stats
  const stats = feedbackService.getStats();

  // Handlers
  const handleStatusChange = (id: string, status: FeedbackStatus) => {
    feedbackService.update(id, { status });
    loadFeedbacks();
  };

  const handleDelete = (id: string) => {
    if (confirm('למחוק פידבק זה?')) {
      feedbackService.delete(id);
      loadFeedbacks();
    }
  };

  const handleExportMarkdown = () => {
    const markdown = feedbackService.exportMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FEEDBACK-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = feedbackService.exportJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedbacks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryIcons: Record<FeedbackCategory, string> = {
    bug: '🐛',
    feature: '✨',
    ui_ux: '🎨',
    error: '❌',
    performance: '⚡',
    note: '📝',
  };

  const priorityColors: Record<FeedbackPriority, string> = {
    urgent: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📝 ניהול פידבקים
            </h1>
            <p className="text-gray-600 mt-1">
              ניהול וייצוא פידבקים לבדיקה עם Claude Code
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? 'הסתר פילטרים' : 'הצג פילטרים'}
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium"
            >
              <FileText className="w-5 h-5" />
              ייצא JSON
            </button>
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow"
            >
              <Download className="w-5 h-5" />
              ייצא Markdown
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 mt-1">סה"כ פידבקים</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-900">
              {stats.byStatus.todo}
            </div>
            <div className="text-sm text-orange-700 mt-1">📋 TODO</div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-900">
              {stats.byStatus.doing}
            </div>
            <div className="text-sm text-blue-700 mt-1">🔄 בטיפול</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-900">
              {stats.byStatus.done}
            </div>
            <div className="text-sm text-green-700 mt-1">✅ הושלם</div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 space-y-4">
            <h3 className="font-bold text-gray-900">סינון פידבקים</h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סטטוס
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">הכל</option>
                  <option value="todo">TODO</option>
                  <option value="doing">בטיפול</option>
                  <option value="done">הושלם</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קטגוריה
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">הכל</option>
                  <option value="bug">🐛 באג</option>
                  <option value="feature">✨ פיצר</option>
                  <option value="ui_ux">🎨 UI/UX</option>
                  <option value="error">❌ שגיאה</option>
                  <option value="performance">⚡ ביצועים</option>
                  <option value="note">📝 הערה</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  עדיפות
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">הכל</option>
                  <option value="urgent">🔴 דחוף</option>
                  <option value="high">🟠 גבוה</option>
                  <option value="medium">🟡 בינוני</option>
                  <option value="low">🟢 נמוך</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-4">
          מציג {sorted.length} מתוך {stats.total} פידבקים
        </div>

        {/* Feedbacks List */}
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                אין פידבקים
              </h3>
              <p className="text-gray-600">
                לחץ על הכפתור הסגול בפינה השמאלית כדי להוסיף פידבק
              </p>
            </div>
          ) : (
            sorted.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {categoryIcons[feedback.category]}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {feedback.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[feedback.priority]}`}
                      >
                        {feedback.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-mono">
                        {feedback.componentName}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(feedback.timestamp).toLocaleString('he-IL')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={feedback.status}
                      onChange={(e) =>
                        handleStatusChange(
                          feedback.id,
                          e.target.value as FeedbackStatus
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                    >
                      <option value="todo">📋 TODO</option>
                      <option value="doing">🔄 בטיפול</option>
                      <option value="done">✅ הושלם</option>
                    </select>
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="מחק"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {feedback.description && (
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {feedback.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="font-mono text-gray-600">
                    📁 {feedback.filePath}
                  </div>
                  {feedback.consoleErrors.length > 0 && (
                    <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                      {feedback.consoleErrors.length} שגיאות console
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
