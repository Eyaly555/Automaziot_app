import React, { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, User, MessageSquare, Languages } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Blocker } from '../../types/phase3';
import { Button } from '../Base/Button';
import { Card } from '../Base/Card';

type Language = 'he' | 'en';

const translations = {
  he: {
    title: 'ניהול חסימות',
    subtitle: 'מעקב ופתרון חסימות המשפיעות על הפיתוח',
    noData: 'אין נתוני מעקב פיתוח זמינים',
    stats: {
      activeBlockers: 'חסימות פעילות',
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      resolved: 'נפתרו'
    },
    activeSection: {
      title: 'חסימות פעילות',
      blocker: 'חסימה',
      blockers: 'חסימות'
    },
    resolvedSection: {
      title: 'חסימות שנפתרו',
      resolved: 'נפתר',
      timeToResolve: 'זמן לפתרון',
      day: 'יום',
      days: 'ימים',
      reportedBy: 'דווח על ידי'
    },
    noBlockers: {
      title: 'אין חסימות',
      description: 'טרם דווחו חסימות.'
    },
    noActiveBlockers: {
      title: 'אין חסימות פעילות',
      description: 'מצוין! כל החסימות נפתרו.'
    },
    resolutionNotes: 'הערות פתרון',
    resolution: 'פתרון',
    resolve: 'פתור',
    today: 'היום',
    daysAgo: 'לפני',
    hoursEstimated: 'שעות משוערות'
  },
  en: {
    title: 'Blocker Management',
    subtitle: 'Track and resolve blockers affecting development',
    noData: 'No development tracking data available',
    stats: {
      activeBlockers: 'Active Blockers',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      resolved: 'Resolved'
    },
    activeSection: {
      title: 'Active Blockers',
      blocker: 'blocker',
      blockers: 'blockers'
    },
    resolvedSection: {
      title: 'Resolved Blockers',
      resolved: 'Resolved',
      timeToResolve: 'Time to resolve',
      day: 'day',
      days: 'days',
      reportedBy: 'Reported by'
    },
    noBlockers: {
      title: 'No Blockers',
      description: 'No blockers have been reported yet.'
    },
    noActiveBlockers: {
      title: 'No Active Blockers',
      description: 'Great! All blockers have been resolved.'
    },
    resolutionNotes: 'Resolution Notes',
    resolution: 'Resolution',
    resolve: 'Resolve',
    today: 'Today',
    daysAgo: 'ago',
    hoursEstimated: 'h'
  }
};

export const BlockerManagement: React.FC = () => {
  const { currentMeeting, resolveBlocker, updateTask } = useMeetingStore();
  const [language, setLanguage] = useState<Language>('he');

  useEffect(() => {
    const saved = localStorage.getItem('phase3_language');
    if (saved) setLanguage(saved as Language);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    localStorage.setItem('phase3_language', newLang);
  };

  const t = translations[language];

  const blockers = currentMeeting?.developmentTracking?.blockers || [];
  const tasks = currentMeeting?.developmentTracking?.tasks || [];

  const activeBlockers = useMemo(() => {
    return blockers.filter(b => !b.resolved);
  }, [blockers]);

  const resolvedBlockers = useMemo(() => {
    return blockers.filter(b => b.resolved);
  }, [blockers]);

  const blockersByTask = useMemo(() => {
    return activeBlockers.reduce((acc, blocker) => {
      const task = tasks.find(t => t.id === blocker.taskId);
      if (task) {
        if (!acc[blocker.taskId]) {
          acc[blocker.taskId] = {
            task,
            blockers: []
          };
        }
        acc[blocker.taskId].blockers.push(blocker);
      }
      return acc;
    }, {} as Record<string, { task: any; blockers: Blocker[] }>);
  }, [activeBlockers, tasks]);

  const blockersBySevertiy = useMemo(() => {
    return {
      critical: activeBlockers.filter(b => b.severity === 'critical').length,
      high: activeBlockers.filter(b => b.severity === 'high').length,
      medium: activeBlockers.filter(b => b.severity === 'medium').length,
      low: activeBlockers.filter(b => b.severity === 'low').length
    };
  }, [activeBlockers]);

  const handleResolveBlocker = (taskId: string, blockerId: string) => {
    if (confirm('Mark this blocker as resolved?')) {
      resolveBlocker(taskId, blockerId);

      // Check if task has any remaining blockers
      const taskBlockers = activeBlockers.filter(b => b.taskId === taskId && b.id !== blockerId);
      if (taskBlockers.length === 0) {
        // No more blockers, change status back to todo
        updateTask(taskId, { status: 'todo' });
      }
    }
  };

  const severityColors = {
    critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: 'text-red-600' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: 'text-orange-600' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: 'text-yellow-600' },
    low: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: 'text-blue-600' }
  };

  if (!currentMeeting?.developmentTracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t.noData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-1">{t.subtitle}</p>
          </div>
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Languages className="w-5 h-5" />
            <span className="font-medium">{language === 'he' ? 'English' : 'עברית'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.activeBlockers}</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{activeBlockers.length}</div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.critical}</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-700">{blockersBySevertiy.critical}</div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.high}</span>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{blockersBySevertiy.high}</div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.medium}</span>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{blockersBySevertiy.medium}</div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.resolved}</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{resolvedBlockers.length}</div>
          </Card>
        </div>

        {/* Active Blockers */}
        {activeBlockers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              {t.activeSection.title} ({activeBlockers.length})
            </h2>

            <div className="space-y-6">
              {Object.entries(blockersByTask).map(([taskId, { task, blockers: taskBlockers }]) => (
                <div key={taskId} className="border-2 border-red-200 rounded-lg overflow-hidden">
                  {/* Task Header */}
                  <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                          <span>{task.estimatedHours}h</span>
                          {task.assignedTo && (
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {task.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {taskBlockers.length} {taskBlockers.length === 1 ? t.activeSection.blocker : t.activeSection.blockers}
                      </span>
                    </div>
                  </div>

                  {/* Blockers List */}
                  <div className="divide-y divide-gray-200">
                    {taskBlockers.map(blocker => {
                      const colors = severityColors[blocker.severity];
                      const createdDate = new Date(blocker.createdAt);
                      const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <div key={blocker.id} className="px-6 py-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                                  {blocker.severity.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {daysAgo === 0 ? t.today : `${t.daysAgo} ${daysAgo} ${daysAgo === 1 ? t.resolvedSection.day : t.resolvedSection.days}`}
                                </span>
                                {blocker.reportedBy && (
                                  <span className="text-sm text-gray-600 flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    {blocker.reportedBy}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-900">{blocker.description}</p>
                              {blocker.resolution && (
                                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-start">
                                    <MessageSquare className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                                    <div>
                                      <div className="text-xs text-blue-800 font-medium mb-1">{t.resolutionNotes}</div>
                                      <div className="text-sm text-blue-900">{blocker.resolution}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() => handleResolveBlocker(taskId, blocker.id)}
                              variant="success"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {t.resolve}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t.noActiveBlockers.title}</h3>
            <p className="text-gray-600">{t.noActiveBlockers.description}</p>
          </div>
        )}

        {/* Resolved Blockers */}
        {resolvedBlockers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              {t.resolvedSection.title} ({resolvedBlockers.length})
            </h2>

            <div className="space-y-3">
              {resolvedBlockers.map(blocker => {
                const task = tasks.find(t => t.id === blocker.taskId);
                const colors = severityColors[blocker.severity];
                const resolvedDate = blocker.resolvedAt ? new Date(blocker.resolvedAt) : null;
                const createdDate = new Date(blocker.createdAt);
                const daysToResolve = resolvedDate
                  ? Math.floor((resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <div key={blocker.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {blocker.severity}
                          </span>
                          {task && (
                            <span className="text-sm text-gray-700 font-medium">{task.title}</span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{blocker.description}</p>
                        {blocker.resolution && (
                          <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                            <div className="text-xs text-green-800 font-medium mb-1">{t.resolution}</div>
                            <div className="text-sm text-green-900">{blocker.resolution}</div>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{t.resolvedSection.resolved} {resolvedDate?.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</span>
                          <span>{t.resolvedSection.timeToResolve}: {daysToResolve} {daysToResolve === 1 ? t.resolvedSection.day : t.resolvedSection.days}</span>
                          {blocker.reportedBy && <span>{t.resolvedSection.reportedBy} {blocker.reportedBy}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {blockers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t.noBlockers.title}</h3>
            <p className="text-gray-600">{t.noBlockers.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
