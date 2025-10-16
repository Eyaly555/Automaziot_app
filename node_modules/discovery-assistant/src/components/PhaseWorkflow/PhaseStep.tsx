import React from 'react';
import { CheckCircle, Lock, LucideIcon } from 'lucide-react';

export type PhaseStepState = 'completed' | 'active' | 'unlocked' | 'locked';

interface PhaseStepProps {
  label: string;
  icon: LucideIcon;
  state: PhaseStepState;
  progress?: number;
  isSubPhase?: boolean;
  compact?: boolean;
  showProgress?: boolean;
  onClick?: () => void;
  description?: string;
}

export const PhaseStep: React.FC<PhaseStepProps> = ({
  label,
  icon: Icon,
  state,
  progress = 0,
  isSubPhase = false,
  compact = false,
  showProgress = true,
  onClick,
  description,
}) => {
  const isClickable = state === 'completed' || state === 'unlocked';

  // Color schemes based on state
  const colorSchemes = {
    completed: {
      bg: 'bg-green-500',
      border: 'border-green-500',
      text: 'text-green-600',
      ring: 'ring-green-500',
      icon: 'text-white',
      hover: 'hover:bg-green-600',
    },
    active: {
      bg: 'bg-blue-600',
      border: 'border-blue-600',
      text: 'text-blue-600',
      ring: 'ring-blue-600',
      icon: 'text-white',
      hover: '',
    },
    unlocked: {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      text: 'text-blue-600',
      ring: 'ring-blue-400',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-200',
    },
    locked: {
      bg: 'bg-gray-200',
      border: 'border-gray-300',
      text: 'text-gray-400',
      ring: 'ring-gray-300',
      icon: 'text-gray-400',
      hover: '',
    },
  };

  const colors = colorSchemes[state];

  return (
    <div
      className={`
        flex flex-col items-center
        ${isSubPhase ? 'scale-90 opacity-90' : ''}
        ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
        transition-all duration-200
        ${compact ? 'w-16' : 'w-24'}
      `}
      onClick={isClickable ? onClick : undefined}
      title={description}
      role="button"
      aria-label={`${label} - ${state}`}
      aria-disabled={!isClickable}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Circle Indicator */}
      <div className="relative">
        <div
          className={`
            ${compact ? 'w-12 h-12' : 'w-16 h-16'}
            rounded-full
            ${colors.bg}
            ${state === 'unlocked' ? `border-2 ${colors.border} bg-white` : ''}
            flex items-center justify-center
            shadow-md
            ${state === 'active' ? `animate-pulse ring-4 ring-opacity-50 ${colors.ring}` : ''}
            ${isClickable ? colors.hover : ''}
            transition-all duration-300
          `}
        >
          {state === 'completed' ? (
            <CheckCircle
              className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} ${colors.icon}`}
            />
          ) : state === 'locked' ? (
            <Lock
              className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} ${colors.icon}`}
            />
          ) : (
            <Icon
              className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} ${colors.icon}`}
            />
          )}
        </div>

        {/* Progress Ring for Active Phase */}
        {state === 'active' && showProgress && progress > 0 && (
          <svg
            className={`absolute top-0 left-0 ${compact ? 'w-12 h-12' : 'w-16 h-16'} transform -rotate-90`}
            aria-label={`${progress}% complete`}
          >
            <circle
              cx={compact ? '24' : '32'}
              cy={compact ? '24' : '32'}
              r={compact ? '22' : '30'}
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${progress * (compact ? 1.38 : 1.88)} ${compact ? 138 : 188}`}
              className="transition-all duration-500"
            />
          </svg>
        )}

        {/* Sub-phase indicator */}
        {isSubPhase && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
            aria-label="Sub-phase"
          />
        )}
      </div>

      {/* Label */}
      {!compact && (
        <div className="mt-3 text-center max-w-[100px]">
          <div className={`text-sm font-semibold ${colors.text} leading-tight`}>
            {label}
          </div>
          {state === 'active' && showProgress && progress > 0 && (
            <div className="text-xs text-gray-500 mt-1">{progress}% הושלם</div>
          )}
        </div>
      )}

      {/* Compact Label */}
      {compact && (
        <div
          className={`text-xs font-medium ${colors.text} mt-1 text-center max-w-[60px] leading-tight`}
        >
          {label}
        </div>
      )}
    </div>
  );
};
