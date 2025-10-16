import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Languages,
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Sprint } from '../../types/phase3';
import { Button } from '../Base/Button';
import { Card } from '../Base/Card';

type Language = 'he' | 'en';

const translations = {
  he: {
    title: 'תצוגת ספרינט',
    subtitle: 'מעקב אחר התקדמות ומהירות הספרינט',
    createSprint: 'צור ספרינט',
    noData: 'אין נתוני מעקב פיתוח זמינים',
    stats: {
      totalTasks: 'סה"כ משימות',
      completed: 'הושלם',
      inProgress: 'בתהליך',
      blocked: 'חסום',
    },
    burndown: {
      title: 'תרשים Burndown',
      subtitle: 'מעקב אחר עבודה נותרת לאורך זמן',
      idealBurndown: 'Burndown אידיאלי',
      actualBurndown: 'Burndown בפועל',
      day: 'יום',
    },
    sprintDetails: {
      title: 'פרטי ספרינט',
      goal: 'מטרת ספרינט',
      duration: 'משך',
      totalHours: 'סה"כ שעות',
      hoursEstimated: 'שעות משוערות',
      hoursCompleted: 'שעות שהושלמו',
      velocity: 'מהירות',
      storyPoints: 'נקודות סיפור',
    },
    taskList: {
      title: 'משימות ב',
      noTasks: 'אין משימות שהוקצו לספרינט זה עדיין',
      assignedTo: 'מוקצה ל',
      hoursEstimated: 'שעות משוערות',
    },
    status: {
      planned: 'מתוכנן',
      active: 'פעיל',
      completed: 'הושלם',
      todo: 'לביצוע',
      in_progress: 'בתהליך',
      in_review: 'בבדיקה',
      blocked: 'חסום',
      done: 'הושלם',
    },
    priority: {
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך',
    },
    noSprints: {
      title: 'אין ספרינטים עדיין',
      description: 'צור את הספרינט הראשון שלך כדי להתחיל במעקב אחר התקדמות',
      createFirst: 'צור ספרינט ראשון',
    },
    noSprintsCreated: 'לא נוצרו ספרינטים עדיין',
  },
  en: {
    title: 'Sprint View',
    subtitle: 'Track sprint progress and velocity',
    createSprint: 'Create Sprint',
    noData: 'No development tracking data available',
    stats: {
      totalTasks: 'Total Tasks',
      completed: 'Completed',
      inProgress: 'In Progress',
      blocked: 'Blocked',
    },
    burndown: {
      title: 'Burndown Chart',
      subtitle: 'Tracking remaining work over time',
      idealBurndown: 'Ideal Burndown',
      actualBurndown: 'Actual Burndown',
      day: 'Day',
    },
    sprintDetails: {
      title: 'Sprint Details',
      goal: 'Sprint Goal',
      duration: 'Duration',
      totalHours: 'Total Hours',
      hoursEstimated: 'h estimated',
      hoursCompleted: 'h completed',
      velocity: 'Velocity',
      storyPoints: 'story points',
    },
    taskList: {
      title: 'Tasks in',
      noTasks: 'No tasks assigned to this sprint yet',
      assignedTo: 'Assigned to',
      hoursEstimated: 'h estimated',
    },
    status: {
      planned: 'planned',
      active: 'active',
      completed: 'completed',
      todo: 'to do',
      in_progress: 'in progress',
      in_review: 'in review',
      blocked: 'blocked',
      done: 'done',
    },
    priority: {
      critical: 'CRITICAL',
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW',
    },
    noSprints: {
      title: 'No Sprints Yet',
      description: 'Create your first sprint to start tracking progress',
      createFirst: 'Create First Sprint',
    },
    noSprintsCreated: 'No sprints created yet',
  },
};

export const SprintView: React.FC = () => {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
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

  const sprints = currentMeeting?.developmentTracking?.sprints || [];
  const tasks = currentMeeting?.developmentTracking?.tasks || [];

  const activeSprint = selectedSprint
    ? sprints.find((s) => s.name === selectedSprint)
    : sprints.find((s) => s.status === 'active') || sprints[0];

  const sprintTasks = useMemo(() => {
    if (!activeSprint) return [];
    return tasks.filter((t) => t.sprint === activeSprint.name);
  }, [tasks, activeSprint]);

  const sprintStats = useMemo(() => {
    const total = sprintTasks.length;
    const completed = sprintTasks.filter((t) => t.status === 'done').length;
    const inProgress = sprintTasks.filter(
      (t) => t.status === 'in_progress'
    ).length;
    const blocked = sprintTasks.filter((t) => t.status === 'blocked').length;
    const totalHours = sprintTasks.reduce(
      (sum, t) => sum + t.estimatedHours,
      0
    );
    const completedHours = sprintTasks
      .filter((t) => t.status === 'done')
      .reduce((sum, t) => sum + t.estimatedHours, 0);

    return {
      total,
      completed,
      inProgress,
      blocked,
      totalHours,
      completedHours,
    };
  }, [sprintTasks]);

  const burndownData = useMemo(() => {
    if (!activeSprint) return [];

    const start = new Date(activeSprint.startDate);
    const end = new Date(activeSprint.endDate);
    const now = new Date();
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const data: { day: number; ideal: number; actual: number }[] = [];

    for (let day = 0; day <= Math.min(daysPassed, totalDays); day++) {
      const idealRemaining = sprintStats.totalHours * (1 - day / totalDays);
      const actualRemaining =
        sprintStats.totalHours - sprintStats.completedHours;

      data.push({
        day,
        ideal: Math.max(0, idealRemaining),
        actual: day === daysPassed ? actualRemaining : idealRemaining,
      });
    }

    return data;
  }, [activeSprint, sprintStats]);

  const handleCreateSprint = () => {
    const name = prompt('Sprint name:');
    if (!name) return;

    const startDate = prompt('Start date (YYYY-MM-DD):');
    if (!startDate) return;

    const endDate = prompt('End date (YYYY-MM-DD):');
    if (!endDate) return;

    const goal = prompt('Sprint goal:');
    if (!goal) return;

    const newSprint: Sprint = {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      goal,
      status: 'planned',
      plannedCapacity: 0,
      actualVelocity: 0,
    };

    updateMeeting({
      developmentTracking: {
        ...currentMeeting!.developmentTracking!,
        sprints: [...sprints, newSprint],
      },
    });

    setShowCreateSprint(false);
  };

  if (!currentMeeting?.developmentTracking) {
    return (
      <div
        className="text-center py-12"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t.noData}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4"
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-1">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Languages className="w-5 h-5" />
              <span className="font-medium">
                {language === 'he' ? 'English' : 'עברית'}
              </span>
            </button>

            <Button onClick={handleCreateSprint} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              {t.createSprint}
            </Button>
          </div>
        </div>

        {/* Sprint Selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {sprints.map((sprint) => {
              const isActive = activeSprint?.name === sprint.name;
              const statusColors = {
                planned: 'bg-gray-100 text-gray-800',
                active: 'bg-blue-100 text-blue-800',
                completed: 'bg-green-100 text-green-800',
              };

              return (
                <button
                  key={sprint.name}
                  onClick={() => setSelectedSprint(sprint.name)}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{sprint.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(sprint.startDate).toLocaleDateString(
                      language === 'he' ? 'he-IL' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )}{' '}
                    -{' '}
                    {new Date(sprint.endDate).toLocaleDateString(
                      language === 'he' ? 'he-IL' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs ${statusColors[sprint.status]}`}
                  >
                    {t.status[sprint.status as keyof typeof t.status]}
                  </span>
                </button>
              );
            })}
            {sprints.length === 0 && (
              <div className="text-gray-500 text-sm">{t.noSprintsCreated}</div>
            )}
          </div>
        </div>

        {activeSprint && (
          <>
            {/* Sprint Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">
                    {t.stats.totalTasks}
                  </span>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {sprintStats.total}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">
                    {t.stats.completed}
                  </span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {sprintStats.completed}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {sprintStats.total > 0
                    ? Math.round(
                        (sprintStats.completed / sprintStats.total) * 100
                      )
                    : 0}
                  %
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">
                    {t.stats.inProgress}
                  </span>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {sprintStats.inProgress}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">
                    {t.stats.blocked}
                  </span>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {sprintStats.blocked}
                </div>
              </Card>
            </div>

            {/* Burndown Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t.burndown.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {t.burndown.subtitle}
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 text-gray-400" />
              </div>

              <div className="relative" style={{ height: '300px' }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                  <span>{sprintStats.totalHours}h</span>
                  <span>{Math.round(sprintStats.totalHours * 0.75)}h</span>
                  <span>{Math.round(sprintStats.totalHours * 0.5)}h</span>
                  <span>{Math.round(sprintStats.totalHours * 0.25)}h</span>
                  <span>0h</span>
                </div>

                {/* Chart area */}
                <div className="absolute left-12 right-0 top-0 bottom-8 border-l-2 border-b-2 border-gray-300">
                  {/* Ideal line */}
                  <svg className="w-full h-full">
                    <defs>
                      <linearGradient
                        id="idealGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3B82F6"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    {burndownData.length > 1 && (
                      <>
                        {/* Ideal line */}
                        <polyline
                          points={burndownData
                            .map((d, i) => {
                              const x = (i / (burndownData.length - 1)) * 100;
                              const y =
                                100 - (d.ideal / sprintStats.totalHours) * 100;
                              return `${x}%,${y}%`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#93C5FD"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />

                        {/* Actual line */}
                        <polyline
                          points={burndownData
                            .map((d, i) => {
                              const x = (i / (burndownData.length - 1)) * 100;
                              const y =
                                100 - (d.actual / sprintStats.totalHours) * 100;
                              return `${x}%,${y}%`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />

                        {/* Data points */}
                        {burndownData.map((d, i) => {
                          const x = (i / (burndownData.length - 1)) * 100;
                          const y =
                            100 - (d.actual / sprintStats.totalHours) * 100;
                          return (
                            <circle
                              key={i}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="4"
                              fill="#3B82F6"
                              stroke="white"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </>
                    )}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs text-gray-500">
                  {burndownData.map((d, i) => {
                    if (
                      i % Math.ceil(burndownData.length / 7) === 0 ||
                      i === burndownData.length - 1
                    ) {
                      return <span key={i}>Day {d.day}</span>;
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-6 mt-8 text-sm">
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-blue-400 border-dashed border-t-2 border-blue-400 mr-2"></div>
                  <span className="text-gray-600">
                    {t.burndown.idealBurndown}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-blue-600 mr-2"></div>
                  <span className="text-gray-600">
                    {t.burndown.actualBurndown}
                  </span>
                </div>
              </div>
            </div>

            {/* Sprint Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t.sprintDetails.title}
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {t.sprintDetails.goal}
                  </div>
                  <div className="font-medium text-gray-900">
                    {activeSprint.goal}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {t.sprintDetails.duration}
                  </div>
                  <div className="font-medium text-gray-900">
                    {new Date(activeSprint.startDate).toLocaleDateString(
                      language === 'he' ? 'he-IL' : 'en-US'
                    )}{' '}
                    -{' '}
                    {new Date(activeSprint.endDate).toLocaleDateString(
                      language === 'he' ? 'he-IL' : 'en-US'
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {t.sprintDetails.totalHours}
                  </div>
                  <div className="font-medium text-gray-900">
                    {sprintStats.totalHours}
                    {t.sprintDetails.hoursEstimated}
                  </div>
                  <div className="text-sm text-gray-600">
                    {sprintStats.completedHours}
                    {t.sprintDetails.hoursCompleted}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {t.sprintDetails.velocity}
                  </div>
                  <div className="font-medium text-gray-900">
                    {activeSprint.actualVelocity || 0}{' '}
                    {t.sprintDetails.storyPoints}
                  </div>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t.taskList.title} {activeSprint.name}
              </h2>
              {sprintTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t.taskList.noTasks}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sprintTasks.map((task) => {
                    const statusColors = {
                      todo: 'bg-gray-100 text-gray-800',
                      in_progress: 'bg-blue-100 text-blue-800',
                      in_review: 'bg-purple-100 text-purple-800',
                      blocked: 'bg-red-100 text-red-800',
                      done: 'bg-green-100 text-green-800',
                    };

                    const priorityColors = {
                      critical: 'text-red-600',
                      high: 'text-orange-600',
                      medium: 'text-yellow-600',
                      low: 'text-green-600',
                    };

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {task.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded text-xs ${statusColors[task.status]}`}
                            >
                              {t.status[task.status as keyof typeof t.status]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className={priorityColors[task.priority]}>
                              {
                                t.priority[
                                  task.priority as keyof typeof t.priority
                                ]
                              }
                            </span>
                            <span>
                              {task.estimatedHours}
                              {t.taskList.hoursEstimated}
                            </span>
                            {task.assignedTo && (
                              <span>
                                {t.taskList.assignedTo} {task.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>
                        {task.status === 'done' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {!activeSprint && sprints.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t.noSprints.title}
            </h3>
            <p className="text-gray-600 mb-6">{t.noSprints.description}</p>
            <Button onClick={handleCreateSprint} variant="primary" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              {t.noSprints.createFirst}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
