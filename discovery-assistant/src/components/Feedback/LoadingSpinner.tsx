import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Loading Spinner Component
 * Centralized loading indicator with multiple sizes
 * Can be used inline or as full-screen overlay
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
}) => {
  // Size configurations
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeStyles[size]} text-blue-600 animate-spin`} />
      {text && (
        <p className={`${textSizes[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton Component
 * Loading placeholder for content
 */
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
    }
  };

  return (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${getStyles()}
        ${className}
      `}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined),
      }}
    />
  );
};

/**
 * Module Loading Skeleton
 * Pre-built skeleton for module pages
 */
export const ModuleSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="text" width="50%" height={16} />
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={80} />
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-end">
        <Skeleton variant="rectangular" width={100} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
      </div>
    </div>
  );
};

/**
 * Dashboard Loading Skeleton
 * Pre-built skeleton for dashboard pages
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={120} />
      </div>

      {/* Main chart */}
      <Skeleton variant="rectangular" height={300} />

      {/* Data grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="rectangular" height={200} />
        <Skeleton variant="rectangular" height={200} />
      </div>
    </div>
  );
};
