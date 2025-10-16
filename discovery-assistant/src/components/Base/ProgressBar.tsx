import React from 'react';

export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * ProgressBar Component
 * Displays progress with customizable variants, sizes, and animations
 * Supports RTL layout with Hebrew text
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md',
  animated = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600">{clampedValue}%</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}
      >
        <div
          className={`
            ${variants[variant]}
            ${sizes[size]}
            ${animated ? 'transition-all duration-500 ease-out' : ''}
            rounded-full
          `}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
