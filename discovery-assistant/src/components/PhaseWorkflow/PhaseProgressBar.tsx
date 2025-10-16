import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PhaseProgressBarProps {
  isCompleted: boolean;
  isSubPhase?: boolean;
  compact?: boolean;
  animated?: boolean;
}

export const PhaseProgressBar: React.FC<PhaseProgressBarProps> = ({
  isCompleted,
  isSubPhase = false,
  compact = false,
  animated = true,
}) => {
  return (
    <div
      className={`
        flex items-center justify-center
        ${compact ? 'mx-2' : 'mx-4'}
        ${isSubPhase ? 'opacity-50' : ''}
      `}
    >
      {/* Connecting Line */}
      <div
        className={`
          ${compact ? 'w-8' : 'w-12'}
          h-0.5
          ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
          ${animated ? 'transition-colors duration-500' : ''}
        `}
        aria-hidden="true"
      />

      {/* Arrow Icon */}
      <ChevronRight
        className={`
          ${compact ? 'w-4 h-4' : 'w-5 h-5'}
          ${isCompleted ? 'text-green-500' : 'text-gray-300'}
          ${animated ? 'transition-colors duration-500' : ''}
          -mx-2
        `}
        aria-hidden="true"
      />

      {/* Connecting Line (after arrow) */}
      <div
        className={`
          ${compact ? 'w-8' : 'w-12'}
          h-0.5
          ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
          ${animated ? 'transition-colors duration-500' : ''}
        `}
        aria-hidden="true"
      />
    </div>
  );
};
