import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Blocker } from '../../types/phase3';

export const BlockerManagement: React.FC = () => {
  const { currentMeeting, resolveBlocker, updateTask } = useMeetingStore();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">Blocker Management</h1>
          <p className="text-gray-600 mt-1">Track and resolve blockers affecting development</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Active Blockers</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{activeBlockers.length}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Critical</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-700">{blockersBySevertiy.critical}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">High</span>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{blockersBySevertiy.high}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Medium</span>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{blockersBySevertiy.medium}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Resolved</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{resolvedBlockers.length}</div>
          </div>
        </div>

        {/* Active Blockers */}
        {activeBlockers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              Active Blockers ({activeBlockers.length})
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
                        {taskBlockers.length} {taskBlockers.length === 1 ? 'blocker' : 'blockers'}
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
                                  {daysAgo === 0 ? 'Today' : `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`}
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
                                      <div className="text-xs text-blue-800 font-medium mb-1">Resolution Notes</div>
                                      <div className="text-sm text-blue-900">{blocker.resolution}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleResolveBlocker(taskId, blocker.id)}
                              className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </button>
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Blockers</h3>
            <p className="text-gray-600">Great! All blockers have been resolved.</p>
          </div>
        )}

        {/* Resolved Blockers */}
        {resolvedBlockers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              Resolved Blockers ({resolvedBlockers.length})
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
                            <div className="text-xs text-green-800 font-medium mb-1">Resolution</div>
                            <div className="text-sm text-green-900">{blocker.resolution}</div>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Resolved {resolvedDate?.toLocaleDateString('en-US')}</span>
                          <span>Time to resolve: {daysToResolve} {daysToResolve === 1 ? 'day' : 'days'}</span>
                          {blocker.reportedBy && <span>Reported by {blocker.reportedBy}</span>}
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Blockers</h3>
            <p className="text-gray-600">No blockers have been reported yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
