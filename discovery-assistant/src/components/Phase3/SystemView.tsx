import React, { useMemo, useState, useEffect } from 'react';
import { Server, CheckCircle, Clock, AlertCircle, TrendingUp, Languages } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';

type Language = 'he' | 'en';

const translations = {
  he: {
    title: 'תצוגת מערכת',
    subtitle: 'מעקב אחר התקדמות פיתוח לפי מערכת',
    noSystems: 'טרם הוגדרו מערכות',
    stats: {
      totalSystems: 'סה"כ מערכות',
      totalTasks: 'סה"כ משימות',
      completed: 'הושלמו',
      overallProgress: 'התקדמות כוללת',
      totalHours: 'סה"כ שעות',
      hoursCompleted: 'שעות שהושלמו'
    },
    systemStatus: {
      blocked: 'חסום',
      onTrack: 'על המסלול',
      atRisk: 'בסיכון',
      behind: 'מאחור'
    },
    taskStatus: {
      total: 'סה"כ',
      done: 'בוצע',
      inProgress: 'בתהליך',
      todo: 'לביצוע',
      blocked: 'חסום'
    },
    systemDetails: {
      auth: 'אימות',
      modules: 'מודולים',
      migration: 'העברה',
      records: 'רשומות'
    },
    taskLabels: {
      noTasks: 'אין משימות למערכת זו עדיין',
      estimated: 'ש',
      remaining: 'נותר'
    },
    noSystemsConfigured: {
      title: 'לא הוגדרו מערכות',
      description: 'מערכות יופיעו כאן לאחר השלמת מפרט היישום בשלב 2'
    },
    priority: {
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך'
    }
  },
  en: {
    title: 'System View',
    subtitle: 'Track development progress by system',
    noSystems: 'No systems configured yet',
    stats: {
      totalSystems: 'Total Systems',
      totalTasks: 'Total Tasks',
      completed: 'completed',
      overallProgress: 'Overall Progress',
      totalHours: 'Total Hours',
      hoursCompleted: 'h completed'
    },
    systemStatus: {
      blocked: 'Blocked',
      onTrack: 'On Track',
      atRisk: 'At Risk',
      behind: 'Behind'
    },
    taskStatus: {
      total: 'Total',
      done: 'Done',
      inProgress: 'In Progress',
      todo: 'To Do',
      blocked: 'Blocked'
    },
    systemDetails: {
      auth: 'Auth',
      modules: 'Modules',
      migration: 'Migration',
      records: 'records'
    },
    taskLabels: {
      noTasks: 'No tasks for this system yet',
      estimated: 'h',
      remaining: 'remaining'
    },
    noSystemsConfigured: {
      title: 'No Systems Configured',
      description: 'Systems will appear here once you complete Phase 2 implementation specifications'
    },
    priority: {
      critical: 'CRITICAL',
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW'
    }
  }
};

export const SystemView: React.FC = () => {
  const { currentMeeting } = useMeetingStore();
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

  const systems = currentMeeting?.implementationSpec?.systems || [];
  const tasks = currentMeeting?.developmentTracking?.tasks || [];

  const systemStats = useMemo(() => {
    return systems.map(system => {
      const systemTasks = tasks.filter(t =>
        t.relatedSpec.type === 'system' && t.relatedSpec.specId === system.id
      );

      const total = systemTasks.length;
      const completed = systemTasks.filter(t => t.status === 'done').length;
      const inProgress = systemTasks.filter(t => t.status === 'in_progress').length;
      const blocked = systemTasks.filter(t => t.status === 'blocked').length;
      const todo = systemTasks.filter(t => t.status === 'todo').length;

      const totalHours = systemTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      const completedHours = systemTasks.filter(t => t.status === 'done')
        .reduce((sum, t) => sum + t.estimatedHours, 0);
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        system,
        tasks: systemTasks,
        stats: {
          total,
          completed,
          inProgress,
          blocked,
          todo,
          totalHours,
          completedHours,
          progress
        }
      };
    });
  }, [systems, tasks]);

  const overallStats = useMemo(() => {
    const totalTasks = systemStats.reduce((sum, s) => sum + s.stats.total, 0);
    const completedTasks = systemStats.reduce((sum, s) => sum + s.stats.completed, 0);
    const totalHours = systemStats.reduce((sum, s) => sum + s.stats.totalHours, 0);
    const completedHours = systemStats.reduce((sum, s) => sum + s.stats.completedHours, 0);

    return {
      totalTasks,
      completedTasks,
      totalHours,
      completedHours,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }, [systemStats]);

  if (!currentMeeting?.implementationSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t.noSystems}</p>
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

        {/* Overall Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.totalSystems}</span>
              <Server className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{systems.length}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.totalTasks}</span>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{overallStats.totalTasks}</div>
            <div className="text-sm text-gray-500 mt-1">
              {overallStats.completedTasks} {t.stats.completed}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.overallProgress}</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{overallStats.progress}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{t.stats.totalHours}</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{overallStats.totalHours}h</div>
            <div className="text-sm text-gray-500 mt-1">
              {overallStats.completedHours}{t.stats.hoursCompleted}
            </div>
          </div>
        </div>

        {/* System Cards */}
        <div className="space-y-6">
          {systemStats.map(({ system, tasks: sysTasks, stats }) => {
            const getHealthColor = () => {
              if (stats.blocked > 0) return 'text-red-600';
              if (stats.progress >= 75) return 'text-green-600';
              if (stats.progress >= 50) return 'text-yellow-600';
              return 'text-orange-600';
            };

            const getHealthLabel = () => {
              if (stats.blocked > 0) return t.systemStatus.blocked;
              if (stats.progress >= 75) return t.systemStatus.onTrack;
              if (stats.progress >= 50) return t.systemStatus.atRisk;
              return t.systemStatus.behind;
            };

            return (
              <div key={system.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* System Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Server className="w-6 h-6" />
                        <h2 className="text-2xl font-bold">{system.systemName}</h2>
                      </div>
                      <div className="flex items-center space-x-4 text-sm opacity-90">
                        <span>{t.systemDetails.auth}: {system.authentication.method}</span>
                        <span>{t.systemDetails.modules}: {system.modules?.length || 0}</span>
                        {system.dataMigration.required && (
                          <span>{t.systemDetails.migration}: {system.dataMigration.recordCount} {t.systemDetails.records}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getHealthColor()}`}>
                        {getHealthLabel()}
                      </div>
                      <div className="text-sm opacity-90 mt-1">{stats.progress}% complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-5 border-b">
                  <div className="p-4 text-center border-r">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600 mt-1">{t.taskStatus.total}</div>
                  </div>
                  <div className="p-4 text-center border-r">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-600 mt-1">{t.taskStatus.done}</div>
                  </div>
                  <div className="p-4 text-center border-r">
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    <div className="text-sm text-gray-600 mt-1">{t.taskStatus.inProgress}</div>
                  </div>
                  <div className="p-4 text-center border-r">
                    <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
                    <div className="text-sm text-gray-600 mt-1">{t.taskStatus.todo}</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
                    <div className="text-sm text-gray-600 mt-1">{t.taskStatus.blocked}</div>
                  </div>
                </div>

                {/* Task List */}
                <div className="p-6">
                  {sysTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">{t.taskLabels.noTasks}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sysTasks.map(task => {
                        const statusIcons = {
                          todo: <Clock className="w-4 h-4 text-gray-500" />,
                          in_progress: <Clock className="w-4 h-4 text-blue-500 animate-spin" />,
                          in_review: <CheckCircle className="w-4 h-4 text-purple-500" />,
                          blocked: <AlertCircle className="w-4 h-4 text-red-500" />,
                          done: <CheckCircle className="w-4 h-4 text-green-500" />
                        };

                        const statusColors = {
                          todo: 'border-gray-200',
                          in_progress: 'border-blue-300 bg-blue-50',
                          in_review: 'border-purple-300 bg-purple-50',
                          blocked: 'border-red-300 bg-red-50',
                          done: 'border-green-300 bg-green-50'
                        };

                        const priorityLabels = {
                          critical: { label: t.priority.critical, color: 'text-red-600' },
                          high: { label: t.priority.high, color: 'text-orange-600' },
                          medium: { label: t.priority.medium, color: 'text-yellow-600' },
                          low: { label: t.priority.low, color: 'text-green-600' }
                        };

                        const priority = priorityLabels[task.priority];

                        return (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${statusColors[task.status]}`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {statusIcons[task.status]}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <div className="flex items-center space-x-3 mt-1 text-sm">
                                  <span className={`font-medium ${priority.color}`}>
                                    {priority.label}
                                  </span>
                                  <span className="text-gray-600">
                                    {task.estimatedHours}h
                                  </span>
                                  {task.assignedTo && (
                                    <span className="text-gray-600">
                                      {task.assignedTo}
                                    </span>
                                  )}
                                  {task.sprint && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                      {task.sprint}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* System Footer with Hours */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-gray-600">{language === 'he' ? 'משוער: ' : 'Estimated: '}</span>
                      <span className="font-medium text-gray-900">{stats.totalHours}{t.taskLabels.estimated}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{language === 'he' ? 'הושלם: ' : 'Completed: '}</span>
                      <span className="font-medium text-green-600">{stats.completedHours}{t.taskLabels.estimated}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{language === 'he' ? 'נותר: ' : 'Remaining: '}</span>
                      <span className="font-medium text-blue-600">
                        {stats.totalHours - stats.completedHours}{t.taskLabels.estimated}
                      </span>
                    </div>
                  </div>
                  {stats.totalHours > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Hour Progress: </span>
                      <span className="font-medium text-gray-900">
                        {Math.round((stats.completedHours / stats.totalHours) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {systems.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t.noSystemsConfigured.title}</h3>
            <p className="text-gray-600">
              {t.noSystemsConfigured.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
