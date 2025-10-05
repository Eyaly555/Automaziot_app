import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../Base/Card';
import { ProgressBar } from '../Base/ProgressBar';

export interface SystemSpecSection {
  name: string;
  completed: boolean;
  required: boolean;
}

export interface SystemSpecProgressProps {
  systemName: string;
  sections: SystemSpecSection[];
}

/**
 * SystemSpecProgress Component
 *
 * Displays progress tracker for system specification completion in Phase 2.
 *
 * Features:
 * - Completion percentage with visual progress bar
 * - Section checklist with required field indicators
 * - Warning display for missing required sections
 * - Completion status for each section
 * - Integration with Card and ProgressBar base components
 *
 * @param systemName - Name of the system being specified
 * @param sections - Array of sections with completion and required status
 */
export const SystemSpecProgress: React.FC<SystemSpecProgressProps> = ({
  systemName,
  sections
}) => {
  // Calculate completion percentage
  const completedCount = sections.filter(s => s.completed).length;
  const totalCount = sections.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find missing required sections
  const requiredIncomplete = sections.filter(s => s.required && !s.completed);

  // Determine progress variant
  const getVariant = () => {
    if (progress === 100) return 'success';
    if (requiredIncomplete.length > 0) return 'warning';
    return 'default';
  };

  return (
    <Card variant="bordered" padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4" dir="rtl">
        <h3 className="text-lg font-semibold text-gray-900">{systemName}</h3>
        <span className="text-sm text-gray-600">
          {completedCount}/{totalCount} дещмое
        </span>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={progress}
        variant={getVariant()}
        animated
      />

      {/* Required Fields Warning */}
      {requiredIncomplete.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg" dir="rtl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">щгеъ зебд зсшйн:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {requiredIncomplete.map((section, i) => (
                  <li key={i}>{section.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Section Checklist */}
      <div className="mt-4 space-y-2" dir="rtl">
        {sections.map((section, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-gray-50 transition-colors"
          >
            <span className={`flex items-center gap-2 ${section.completed ? 'text-gray-900' : 'text-gray-500'}`}>
              {section.name}
              {section.required && (
                <span className="text-red-500 font-bold" title="щгд зебд">
                  *
                </span>
              )}
            </span>
            <div>
              {section.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Summary */}
      {progress === 100 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg" dir="rtl">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">
              офши дотшлъ дещмн бомеае
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
