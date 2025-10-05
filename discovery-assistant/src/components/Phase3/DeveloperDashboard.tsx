import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { generateTasksFromPhase2 } from '../../utils/taskGenerator';
import { DevelopmentTask, DevelopmentTrackingData } from '../../types';
import {
  LayoutGrid,
  List,
  Calendar,
  FolderTree,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  Play,
  Languages
} from 'lucide-react';
import { ExportMenu } from '../Common/ExportMenu';

type ViewMode = 'kanban' | 'list' | 'sprint' | 'system' | 'team';
type Language = 'he' | 'en';

const translations = {
  he: {
    title: 'דשבורד מפתחים',
    project: 'פרויקט',
    viewModes: {
      kanban: 'קנבן',
      list: 'רשימה',
      sprint: 'ספרינט',
      system: 'מערכת',
      team: 'צוות'
    },
    stats: {
      totalTasks: 'משימות כוללות',
      completed: 'הושלם',
      done: 'בוצע',
      inProgress: 'בתהליך',
      blocked: 'חסום',
      projectHealth: 'בריאות הפרויקט',
      onTrack: 'על המסלול',
      atRisk: 'בסיכון',
      behind: 'מאחור'
    },
    filters: {
      title: 'סינון',
      allStatuses: 'כל הסטטוסים',
      toDo: 'לביצוע',
      inProgress: 'בתהליך',
      inReview: 'בבדיקה',
      blocked: 'חסום',
      done: 'הושלם',
      allPriorities: 'כל העדיפויות',
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך',
      showing: 'מציג',
      of: 'מתוך',
      tasks: 'משימות'
    },
    progress: {
      overall: 'התקדמות כללית',
      hoursEstimated: 'שעות משוערות',
      hoursActual: 'שעות בפועל',
      hoursRemaining: 'שעות נותרות'
    },
    errors: {
      noProject: 'לא נמצא פרויקט',
      backToDashboard: 'חזרה לדשבורד',
      specRequired: 'נדרשת מפרט יישום',
      specRequiredDesc: 'השלם את מפרט היישום בשלב 2 לפני יצירת משימות פיתוח.',
      goToPhase2: 'עבור לשלב 2'
    },
    statusLabels: {
      todo: 'לביצוע',
      in_progress: 'בתהליך',
      in_review: 'בבדיקה',
      blocked: 'חסום',
      done: 'הושלם'
    },
    comingSoon: {
      sprint: 'תצוגת ספרינט בקרוב',
      system: 'תצוגת מערכת בקרוב',
      team: 'תצוגת צוות בקרוב',
      underDevelopment: 'תצוגה זו בפיתוח'
    }
  },
  en: {
    title: 'Developer Dashboard',
    project: 'Project',
    viewModes: {
      kanban: 'Kanban',
      list: 'List',
      sprint: 'Sprint',
      system: 'System',
      team: 'Team'
    },
    stats: {
      totalTasks: 'Total Tasks',
      completed: 'Completed',
      done: 'done',
      inProgress: 'In Progress',
      blocked: 'Blocked',
      projectHealth: 'Project Health',
      onTrack: 'On Track',
      atRisk: 'At Risk',
      behind: 'Behind'
    },
    filters: {
      title: 'Filters',
      allStatuses: 'All Statuses',
      toDo: 'To Do',
      inProgress: 'In Progress',
      inReview: 'In Review',
      blocked: 'Blocked',
      done: 'Done',
      allPriorities: 'All Priorities',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      showing: 'Showing',
      of: 'of',
      tasks: 'tasks'
    },
    progress: {
      overall: 'Overall Progress',
      hoursEstimated: 'hours estimated',
      hoursActual: 'hours actual',
      hoursRemaining: 'hours remaining'
    },
    errors: {
      noProject: 'No Project Found',
      backToDashboard: 'Back to Dashboard',
      specRequired: 'Implementation Spec Required',
      specRequiredDesc: 'Complete the implementation specification in Phase 2 before generating development tasks.',
      goToPhase2: 'Go to Phase 2'
    },
    statusLabels: {
      todo: 'To Do',
      in_progress: 'In Progress',
      in_review: 'In Review',
      blocked: 'Blocked',
      done: 'Done'
    },
    comingSoon: {
      sprint: 'Sprint view coming soon',
      system: 'System view coming soon',
      team: 'Team view coming soon',
      underDevelopment: 'This view is under development'
    }
  }
};

export const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
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

  // Initialize development tracking if needed
  useEffect(() => {
    if (!currentMeeting) return;

    if (!currentMeeting.developmentTracking) {
      // Check if we can generate tasks
      if (!currentMeeting.implementationSpec || currentMeeting.implementationSpec.systems.length === 0) {
        return;
      }

      // Generate tasks automatically
      const generatedTasks = generateTasksFromPhase2(currentMeeting);

      const newTracking: DevelopmentTrackingData = {
        meetingId: currentMeeting.meetingId,
        tasks: generatedTasks,
        sprints: [],
        progress: {
          meetingId: currentMeeting.meetingId,
          totalTasks: generatedTasks.length,
          completedTasks: 0,
          progressPercentage: 0,
          byType: {
            integration: { total: 0, done: 0, inProgress: 0 },
            ai_agent: { total: 0, done: 0, inProgress: 0 },
            workflow: { total: 0, done: 0, inProgress: 0 },
            testing: { total: 0, done: 0, inProgress: 0 },
            deployment: { total: 0, done: 0, inProgress: 0 }
          },
          bySystem: [],
          estimatedCompletion: new Date(),
          hoursEstimated: generatedTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
          hoursActual: 0,
          hoursRemaining: generatedTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
          onTrack: true,
          projectHealth: 'on_track',
          healthReasons: [],
          activeBlockers: 0,
          blockersList: [],
          criticalBlockers: 0,
          teamUtilization: []
        },
        blockers: [],
        defaultSprintDuration: 14,
        hoursPerDay: 8,
        workingDaysPerWeek: 5,
        tasksGenerated: true,
        tasksGeneratedAt: new Date(),
        tasksGeneratedBy: 'system',
        lastUpdated: new Date()
      };

      updateMeeting({ developmentTracking: newTracking });
    }
  }, [currentMeeting]);

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.errors.noProject}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.errors.backToDashboard}
          </button>
        </div>
      </div>
    );
  }

  if (!currentMeeting.developmentTracking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.errors.specRequired}</h2>
          <p className="text-gray-600 mb-6">
            {t.errors.specRequiredDesc}
          </p>
          <button
            onClick={() => navigate('/phase2')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.errors.goToPhase2}
          </button>
        </div>
      </div>
    );
  }

  const tracking = currentMeeting.developmentTracking;
  const progress = tracking.progress;

  // Calculate real-time stats
  const tasks = tracking.tasks;
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const inReviewTasks = tasks.filter(t => t.status === 'in_review');
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const progressPercentage = Math.round((doneTasks.length / tasks.length) * 100);

  // Filter tasks
  let filteredTasks = tasks;
  if (filterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
  }
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
  }

  // Health indicator
  const getHealthColor = () => {
    if (blockedTasks.length > 3) return 'red';
    if (progressPercentage < 30 && tasks.length > 10) return 'yellow';
    return 'green';
  };

  const healthColor = getHealthColor();

  return (
    <div className="min-h-screen bg-gray-100" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-gray-600 mt-1">{t.project}: {currentMeeting.clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Export Menu */}
              <ExportMenu variant="button" />

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <Languages className="w-5 h-5" />
                <span className="font-medium">{language === 'he' ? 'English' : 'עברית'}</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {[
                  { mode: 'kanban' as ViewMode, icon: LayoutGrid, label: t.viewModes.kanban },
                  { mode: 'list' as ViewMode, icon: List, label: t.viewModes.list },
                  { mode: 'sprint' as ViewMode, icon: Calendar, label: t.viewModes.sprint },
                  { mode: 'system' as ViewMode, icon: FolderTree, label: t.viewModes.system },
                  { mode: 'team' as ViewMode, icon: Users, label: t.viewModes.team }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      viewMode === mode
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          {/* Total Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.stats.totalTasks}</p>
                <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <List className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.stats.completed}</p>
                <p className="text-3xl font-bold text-green-600">{doneTasks.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">{progressPercentage}% {t.stats.done}</div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.stats.inProgress}</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
              </div>
              <Play className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Blocked */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.stats.blocked}</p>
                <p className="text-3xl font-bold text-red-600">{blockedTasks.length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.stats.projectHealth}</p>
                <p className={`text-2xl font-bold ${
                  healthColor === 'green' ? 'text-green-600' :
                  healthColor === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {healthColor === 'green' ? `🟢 ${t.stats.onTrack}` :
                   healthColor === 'yellow' ? `🟡 ${t.stats.atRisk}` :
                   `🔴 ${t.stats.behind}`}
                </p>
              </div>
              <TrendingUp className={`w-10 h-10 ${
                healthColor === 'green' ? 'text-green-600' :
                healthColor === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t.progress.overall}</h3>
            <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{progress.hoursEstimated} {t.progress.hoursEstimated}</span>
            <span>{progress.hoursActual} {t.progress.hoursActual}</span>
            <span>{progress.hoursRemaining} {t.progress.hoursRemaining}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
          <span className="font-semibold text-gray-700">{t.filters.title}:</span>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t.filters.allStatuses}</option>
            <option value="todo">{t.filters.toDo}</option>
            <option value="in_progress">{t.filters.inProgress}</option>
            <option value="in_review">{t.filters.inReview}</option>
            <option value="blocked">{t.filters.blocked}</option>
            <option value="done">{t.filters.done}</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t.filters.allPriorities}</option>
            <option value="critical">{t.filters.critical}</option>
            <option value="high">{t.filters.high}</option>
            <option value="medium">{t.filters.medium}</option>
            <option value="low">{t.filters.low}</option>
          </select>

          <span className={`${language === 'he' ? 'mr-auto' : 'ml-auto'} text-sm text-gray-600`}>
            {t.filters.showing} {filteredTasks.length} {t.filters.of} {tasks.length} {t.filters.tasks}
          </span>
        </div>

        {/* Task List/Kanban View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-3 h-3 rounded-full ${
                          task.status === 'done' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          task.status === 'blocked' ? 'bg-red-500' :
                          task.status === 'in_review' ? 'bg-purple-500' :
                          'bg-gray-300'
                        }`} />
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full font-semibold ${
                          task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {task.estimatedHours}h
                        </span>
                        <span className="text-gray-600">{task.sprint}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {task.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="grid grid-cols-5 gap-6">
            {['todo', 'in_progress', 'in_review', 'blocked', 'done'].map(status => {
              const statusTasks = filteredTasks.filter(t => t.status === status);

              return (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{t.statusLabels[status as keyof typeof t.statusLabels]}</h3>
                    <span className="text-sm text-gray-600">{statusTasks.length}</span>
                  </div>
                  <div className="space-y-3">
                    {statusTasks.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{
                        borderColor:
                          task.priority === 'critical' ? '#DC2626' :
                          task.priority === 'high' ? '#F59E0B' :
                          task.priority === 'medium' ? '#3B82F6' :
                          '#10B981'
                      }}>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">{task.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedHours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other views placeholder */}
        {(viewMode === 'sprint' || viewMode === 'system' || viewMode === 'team') && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {viewMode === 'sprint' && t.comingSoon.sprint}
              {viewMode === 'system' && t.comingSoon.system}
              {viewMode === 'team' && t.comingSoon.team}
            </p>
            <p className="text-sm text-gray-500">
              {t.comingSoon.underDevelopment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
