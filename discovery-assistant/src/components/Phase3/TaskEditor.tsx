import React, { useState, useEffect } from 'react';
import { DevelopmentTask } from '../../types/phase3';
import { Button } from '../Base/Button';
import { Card } from '../Base/Card';
import { X, Save, AlertTriangle } from 'lucide-react';
import { Input, TextArea, Select } from '../Base';

interface TaskEditorProps {
  task: DevelopmentTask;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<DevelopmentTask>) => void;
  language: 'he' | 'en';
}

const translations = {
  he: {
    title: 'עריכת משימה',
    description: 'תיאור',
    estimatedHours: 'שעות משוערות',
    actualHours: 'שעות בפועל',
    priority: 'עדיפות',
    status: 'סטטוס',
    technicalNotes: 'הערות טכניות',
    save: 'שמור',
    cancel: 'ביטול',
    priorityOptions: {
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך'
    },
    statusOptions: {
      todo: 'לביצוע',
      in_progress: 'בתהליך',
      in_review: 'בבדיקה',
      blocked: 'חסום',
      done: 'הושלם'
    }
  },
  en: {
    title: 'Edit Task',
    description: 'Description',
    estimatedHours: 'Estimated Hours',
    actualHours: 'Actual Hours',
    priority: 'Priority',
    status: 'Status',
    technicalNotes: 'Technical Notes',
    save: 'Save',
    cancel: 'Cancel',
    priorityOptions: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    },
    statusOptions: {
      todo: 'To Do',
      in_progress: 'In Progress',
      in_review: 'In Review',
      blocked: 'Blocked',
      done: 'Done'
    }
  }
};

export const TaskEditor: React.FC<TaskEditorProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  language
}) => {
  const [formData, setFormData] = useState<Partial<DevelopmentTask>>({});
  const t = translations[language];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        priority: task.priority,
        status: task.status,
        technicalNotes: task.technicalNotes
      });
    }
  }, [task]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleInputChange = (field: keyof DevelopmentTask, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.description}
            </label>
            <TextArea
              value={formData.title || ''}
              onChange={(value) => handleInputChange('title', value)}
              rows={3}
              placeholder={t.description}
            />
          </div>

          {/* Hours Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.estimatedHours}
              </label>
              <Input
                type="number"
                value={String(formData.estimatedHours || 0)}
                onChange={(value) => handleInputChange('estimatedHours', parseInt(value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.actualHours}
              </label>
              <Input
                type="number"
                value={String(formData.actualHours || 0)}
                onChange={(value) => handleInputChange('actualHours', parseInt(value) || 0)}
              />
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.priority}
              </label>
              <Select
                value={formData.priority || 'medium'}
                onChange={(value) => handleInputChange('priority', value)}
                options={[
                  { value: 'critical', label: t.priorityOptions.critical },
                  { value: 'high', label: t.priorityOptions.high },
                  { value: 'medium', label: t.priorityOptions.medium },
                  { value: 'low', label: t.priorityOptions.low }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.status}
              </label>
              <Select
                value={formData.status || 'todo'}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'todo', label: t.statusOptions.todo },
                  { value: 'in_progress', label: t.statusOptions.in_progress },
                  { value: 'in_review', label: t.statusOptions.in_review },
                  { value: 'blocked', label: t.statusOptions.blocked },
                  { value: 'done', label: t.statusOptions.done }
                ]}
              />
            </div>
          </div>

          {/* Technical Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.technicalNotes}
            </label>
            <TextArea
              value={formData.technicalNotes || ''}
              onChange={(value) => handleInputChange('technicalNotes', value)}
              rows={4}
              placeholder={t.technicalNotes}
            />
          </div>

          {/* Task Details Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">מידע על המשימה:</p>
                <p>• סוג: {task.type}</p>
                <p>• נוצר: {new Date(task.createdAt).toLocaleDateString()}</p>
                <p>• מערכת: {task.system || 'לא צוין'}</p>
                {task.dependencies.length > 0 && (
                  <p>• תלויות: {task.dependencies.length} משימות</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            {t.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            {t.save}
          </Button>
        </div>
      </Card>
    </div>
  );
};
