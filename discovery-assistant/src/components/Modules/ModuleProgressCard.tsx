import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { ProgressBar } from '../Base/ProgressBar';

export interface ModuleProgressCardProps {
  moduleId: string;
  moduleName: string;
  icon: string;
  description: string;
  route: string;
}

/**
 * ModuleProgressCard Component
 *
 * Displays a clickable module card with:
 * - Module icon, title, and description
 * - Progress bar showing completion percentage
 * - Status icon (completed/in-progress/not-started)
 * - Integration with useMeetingStore for real-time progress
 * - Navigation to module on click
 *
 * @param moduleId - The module identifier (e.g., 'overview', 'leadsAndSales')
 * @param moduleName - Hebrew display name
 * @param icon - Emoji or icon character
 * @param description - Brief description in Hebrew
 * @param route - Navigation route (e.g., '/module/overview')
 */
export const ModuleProgressCard: React.FC<ModuleProgressCardProps> = ({
  moduleId,
  moduleName,
  icon,
  description,
  route
}) => {
  const navigate = useNavigate();
  const { getModuleProgress } = useMeetingStore();

  // Get progress for this specific module
  const allProgress = getModuleProgress();
  const moduleProgress = allProgress.find(m => m.moduleId === moduleId);
  const progressPercentage = moduleProgress
    ? Math.round((moduleProgress.completed / moduleProgress.total) * 100)
    : 0;

  // Determine status
  const getStatus = () => {
    if (progressPercentage === 100) return 'completed';
    if (progressPercentage > 0) return 'in_progress';
    return 'not_started';
  };

  const status = getStatus();

  // Status icon component
  const StatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  // Progress bar variant
  const getVariant = () => {
    if (progressPercentage === 100) return 'success';
    if (progressPercentage > 0) return 'default';
    return 'default';
  };

  const handleClick = () => {
    navigate(route);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-right group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`фъз оегем ${moduleName} - ${progressPercentage}% дещмн`}
      dir="rtl"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-4xl flex-shrink-0 transition-transform group-hover:scale-110">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
            {moduleName}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {description}
          </p>

          {/* Progress Bar */}
          <div className="mt-3">
            <ProgressBar
              value={progressPercentage}
              showPercentage
              variant={getVariant()}
              size="sm"
              animated
            />
          </div>

          {/* Progress Text */}
          <div className="mt-2 text-xs text-gray-600">
            {moduleProgress && (
              <span>
                {moduleProgress.completed} оъек {moduleProgress.total} щгеъ дещмое
              </span>
            )}
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex-shrink-0">
          <StatusIcon />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 flex items-center justify-end gap-2">
        {status === 'completed' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            дещмн
          </span>
        )}
        {status === 'in_progress' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <PlayCircle className="w-3 h-3" />
            бъдмйк
          </span>
        )}
        {status === 'not_started' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            <Circle className="w-3 h-3" />
            ишн дъзйм
          </span>
        )}
      </div>
    </button>
  );
};
