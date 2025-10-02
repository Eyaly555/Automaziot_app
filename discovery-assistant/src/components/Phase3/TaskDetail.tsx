import React, { useState } from 'react';
import { X, Save, Clock, User, AlertCircle, CheckCircle, FileText, Plus, Trash2 } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { DevelopmentTask } from '../../types/phase3';

interface TaskDetailProps {
  task: DevelopmentTask;
  onClose: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const { updateTask, addTaskTestCase, updateTaskTestCase, addBlocker } = useMeetingStore();

  const [editedTask, setEditedTask] = useState<DevelopmentTask>(task);
  const [activeTab, setActiveTab] = useState<'details' | 'tests' | 'blockers'>('details');

  const handleSave = () => {
    updateTask(task.id, editedTask);
    onClose();
  };

  const handleAddTestCase = () => {
    const newTest = {
      id: generateId(),
      scenario: '',
      expectedResult: '',
      actualResult: '',
      status: 'pending' as const
    };
    addTaskTestCase(task.id, newTest);
    setEditedTask({
      ...editedTask,
      testCases: [...(editedTask.testCases || []), newTest]
    });
  };

  const handleUpdateTestCase = (index: number, updates: any) => {
    const updatedTests = [...(editedTask.testCases || [])];
    updatedTests[index] = { ...updatedTests[index], ...updates };
    setEditedTask({ ...editedTask, testCases: updatedTests });
  };

  const handleDeleteTestCase = (index: number) => {
    const updatedTests = (editedTask.testCases || []).filter((_, i) => i !== index);
    setEditedTask({ ...editedTask, testCases: updatedTests });
  };

  const handleAddBlocker = () => {
    const description = prompt('Describe the blocker:');
    if (!description) return;

    addBlocker(task.id, {
      taskId: task.id,
      description,
      severity: 'high',
      reportedBy: 'user'
    });
  };

  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300'
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    in_review: 'bg-purple-100 text-purple-800',
    blocked: 'bg-red-100 text-red-800',
    done: 'bg-green-100 text-green-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full bg-white bg-opacity-20 text-white text-xl font-bold px-3 py-2 rounded border-2 border-white border-opacity-30 focus:border-opacity-100 focus:outline-none"
              />
              <div className="flex items-center space-x-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[editedTask.priority]} border`}>
                  {editedTask.priority.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[editedTask.status]}`}>
                  {editedTask.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm opacity-90">
                  {editedTask.type.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="opacity-75 mb-1">Estimated</div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <input
                  type="number"
                  value={editedTask.estimatedHours}
                  onChange={(e) => setEditedTask({ ...editedTask, estimatedHours: parseFloat(e.target.value) })}
                  className="w-16 bg-white bg-opacity-20 px-2 py-1 rounded"
                  min="0"
                  step="0.5"
                />
                <span className="ml-1">hours</span>
              </div>
            </div>
            <div>
              <div className="opacity-75 mb-1">Actual</div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <input
                  type="number"
                  value={editedTask.actualHours}
                  onChange={(e) => setEditedTask({ ...editedTask, actualHours: parseFloat(e.target.value) })}
                  className="w-16 bg-white bg-opacity-20 px-2 py-1 rounded"
                  min="0"
                  step="0.5"
                />
                <span className="ml-1">hours</span>
              </div>
            </div>
            <div>
              <div className="opacity-75 mb-1">Assigned To</div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <input
                  type="text"
                  value={editedTask.assignedTo || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                  className="flex-1 bg-white bg-opacity-20 px-2 py-1 rounded"
                  placeholder="Unassigned"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {[
              { key: 'details', label: 'Details', icon: FileText },
              { key: 'tests', label: `Tests (${editedTask.testCases?.length || 0})`, icon: CheckCircle },
              { key: 'blockers', label: 'Blockers', icon: AlertCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === key
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sprint
                </label>
                <input
                  type="text"
                  value={editedTask.sprint || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, sprint: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Sprint 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Spec
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Type: {editedTask.relatedSpec.type}</div>
                  <div className="font-medium">{editedTask.relatedSpec.specName}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Notes
                </label>
                <textarea
                  value={editedTask.technicalNotes}
                  onChange={(e) => setEditedTask({ ...editedTask, technicalNotes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={4}
                  placeholder="Add technical notes, code snippets, or implementation details..."
                />
              </div>

              {editedTask.dependencies && editedTask.dependencies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dependencies
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center text-yellow-800 mb-2">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="font-medium">This task depends on {editedTask.dependencies.length} other task(s)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              {!editedTask.testCases || editedTask.testCases.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No test cases yet</p>
                  <button
                    onClick={handleAddTestCase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add First Test Case
                  </button>
                </div>
              ) : (
                <>
                  {editedTask.testCases.map((test, index) => (
                    <div key={test.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Test Case #{index + 1}</h4>
                        <button
                          onClick={() => handleDeleteTestCase(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Scenario
                          </label>
                          <input
                            type="text"
                            value={test.scenario}
                            onChange={(e) => handleUpdateTestCase(index, { scenario: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="What are you testing?"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Expected Result
                          </label>
                          <input
                            type="text"
                            value={test.expectedResult}
                            onChange={(e) => handleUpdateTestCase(index, { expectedResult: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="What should happen?"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Actual Result
                          </label>
                          <input
                            type="text"
                            value={test.actualResult || ''}
                            onChange={(e) => handleUpdateTestCase(index, { actualResult: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="What actually happened?"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Status
                          </label>
                          <select
                            value={test.status}
                            onChange={(e) => handleUpdateTestCase(index, { status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddTestCase}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Another Test Case
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'blockers' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900 mb-1">Report a Blocker</h3>
                    <p className="text-sm text-red-700 mb-3">
                      If this task is blocked, report it here so the team can help resolve it.
                    </p>
                    <button
                      onClick={handleAddBlocker}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Report Blocker
                    </button>
                  </div>
                </div>
              </div>

              {editedTask.status === 'blocked' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center text-yellow-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">This task is currently blocked</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(editedTask.updatedAt).toLocaleString('en-US')}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
