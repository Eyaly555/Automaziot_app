import React, { useMemo } from 'react';
import { TrendingUp, Users, Clock, Target, Award, AlertTriangle, BarChart3 } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Card } from '../Base/Card';

export const ProgressTracking: React.FC = () => {
  const { currentMeeting } = useMeetingStore();

  const developmentTracking = currentMeeting?.developmentTracking;
  const tasks = developmentTracking?.tasks || [];
  const sprints = developmentTracking?.sprints || [];

  const overallMetrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;

    const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const completedHours = tasks.filter(t => t.status === 'done')
      .reduce((sum, t) => sum + t.estimatedHours, 0);
    const actualHours = tasks.reduce((sum, t) => sum + t.actualHours, 0);

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const hoursProgress = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

    const variance = actualHours - completedHours;
    const variancePercent = completedHours > 0 ? Math.round((variance / completedHours) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      todoTasks,
      totalHours,
      completedHours,
      actualHours,
      progress,
      hoursProgress,
      variance,
      variancePercent
    };
  }, [tasks]);

  const teamMetrics = useMemo(() => {
    const assignees = [...new Set(tasks.filter(t => t.assignedTo).map(t => t.assignedTo))];

    return assignees.map(assignee => {
      const assigneeTasks = tasks.filter(t => t.assignedTo === assignee);
      const completed = assigneeTasks.filter(t => t.status === 'done').length;
      const inProgress = assigneeTasks.filter(t => t.status === 'in_progress').length;
      const blocked = assigneeTasks.filter(t => t.status === 'blocked').length;

      const totalHours = assigneeTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      const completedHours = assigneeTasks.filter(t => t.status === 'done')
        .reduce((sum, t) => sum + t.estimatedHours, 0);

      return {
        name: assignee!,
        total: assigneeTasks.length,
        completed,
        inProgress,
        blocked,
        totalHours,
        completedHours,
        progress: assigneeTasks.length > 0 ? Math.round((completed / assigneeTasks.length) * 100) : 0
      };
    });
  }, [tasks]);

  const sprintMetrics = useMemo(() => {
    return sprints.map(sprint => {
      const sprintTasks = tasks.filter(t => t.sprint === sprint.name);
      const completed = sprintTasks.filter(t => t.status === 'done').length;
      const totalHours = sprintTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      const completedHours = sprintTasks.filter(t => t.status === 'done')
        .reduce((sum, t) => sum + t.estimatedHours, 0);

      return {
        name: sprint.name,
        status: sprint.status,
        total: sprintTasks.length,
        completed,
        totalHours,
        completedHours,
        progress: sprintTasks.length > 0 ? Math.round((completed / sprintTasks.length) * 100) : 0,
        goal: sprint.goal
      };
    });
  }, [tasks, sprints]);

  const priorityBreakdown = useMemo(() => {
    return {
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
  }, [tasks]);

  const typeBreakdown = useMemo(() => {
    const types = ['integration', 'ai_agent', 'workflow', 'migration', 'testing', 'deployment', 'documentation'];
    return types.map(type => ({
      type,
      count: tasks.filter(t => t.type === type).length,
      completed: tasks.filter(t => t.type === type && t.status === 'done').length
    })).filter(t => t.count > 0);
  }, [tasks]);

  if (!developmentTracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No development tracking data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-600 mt-1">Manager dashboard for project insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Overall Progress</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{overallMetrics.progress}%</div>
            <div className="text-sm text-gray-500 mt-1">
              {overallMetrics.completedTasks}/{overallMetrics.totalTasks} tasks
            </div>
            <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${overallMetrics.progress}%` }}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Hours Progress</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{overallMetrics.hoursProgress}%</div>
            <div className="text-sm text-gray-500 mt-1">
              {overallMetrics.completedHours}/{overallMetrics.totalHours}h
            </div>
            <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${overallMetrics.hoursProgress}%` }}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Time Variance</span>
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div className={`text-3xl font-bold ${overallMetrics.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overallMetrics.variance > 0 ? '+' : ''}{overallMetrics.variance}h
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {overallMetrics.variancePercent > 0 ? '+' : ''}{overallMetrics.variancePercent}%
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Blocked Tasks</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{overallMetrics.blockedTasks}</div>
            <div className="text-sm text-gray-500 mt-1">
              {overallMetrics.inProgressTasks} in progress
            </div>
          </Card>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Task Status Distribution</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-green-600">{overallMetrics.completedTasks}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Done</div>
              <div className="text-xs text-gray-500">
                {overallMetrics.totalTasks > 0 ? Math.round((overallMetrics.completedTasks / overallMetrics.totalTasks) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-blue-600">{overallMetrics.inProgressTasks}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">In Progress</div>
              <div className="text-xs text-gray-500">
                {overallMetrics.totalTasks > 0 ? Math.round((overallMetrics.inProgressTasks / overallMetrics.totalTasks) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-gray-600">{overallMetrics.todoTasks}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">To Do</div>
              <div className="text-xs text-gray-500">
                {overallMetrics.totalTasks > 0 ? Math.round((overallMetrics.todoTasks / overallMetrics.totalTasks) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-red-600">{overallMetrics.blockedTasks}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Blocked</div>
              <div className="text-xs text-gray-500">
                {overallMetrics.totalTasks > 0 ? Math.round((overallMetrics.blockedTasks / overallMetrics.totalTasks) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-purple-600">
                  {tasks.filter(t => t.status === 'in_review').length}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900">In Review</div>
              <div className="text-xs text-gray-500">
                {overallMetrics.totalTasks > 0 ? Math.round((tasks.filter(t => t.status === 'in_review').length / overallMetrics.totalTasks) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        {teamMetrics.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Team Performance</h2>
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {teamMetrics.map(member => (
                <div key={member.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {member.completed}/{member.total} tasks • {member.completedHours}/{member.totalHours}h
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{member.progress}%</div>
                      {member.blocked > 0 && (
                        <div className="text-sm text-red-600 mt-1">{member.blocked} blocked</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{member.inProgress} in progress</span>
                    <span>{member.total - member.completed - member.inProgress - member.blocked} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sprint Progress */}
        {sprintMetrics.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Sprint Progress</h2>
              <Award className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {sprintMetrics.map(sprint => {
                const statusColors = {
                  planned: 'bg-gray-100 text-gray-800',
                  active: 'bg-blue-100 text-blue-800',
                  completed: 'bg-green-100 text-green-800'
                };

                return (
                  <div key={sprint.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-medium text-gray-900">{sprint.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${statusColors[sprint.status]}`}>
                            {sprint.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{sprint.goal}</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{sprint.progress}%</div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${sprint.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{sprint.completed}/{sprint.total} tasks</span>
                      <span>{sprint.completedHours}/{sprint.totalHours}h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority & Type Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {/* Priority Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Priority Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-700">Critical</span>
                </div>
                <span className="font-medium text-gray-900">{priorityBreakdown.critical}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-700">High</span>
                </div>
                <span className="font-medium text-gray-900">{priorityBreakdown.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-700">Medium</span>
                </div>
                <span className="font-medium text-gray-900">{priorityBreakdown.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Low</span>
                </div>
                <span className="font-medium text-gray-900">{priorityBreakdown.low}</span>
              </div>
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Task Type Distribution</h2>
            <div className="space-y-3">
              {typeBreakdown.map(({ type, count, completed }) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-sm text-gray-600">{completed}/{count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${count > 0 ? (completed / count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
