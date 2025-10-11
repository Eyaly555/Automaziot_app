import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Badge Component
 * Small label component for status indicators, counts, and tags
 * Supports multiple color variants and sizes
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  onClick,
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const clickableStyles = onClick
    ? 'cursor-pointer hover:opacity-80 transition-opacity'
    : '';

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <span className={iconSizes[size]}>{icon}</span>}
      {children}
    </span>
  );
};
