import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Button Component
 * Universal button component with multiple variants, sizes, and states
 * Supports RTL layout, loading states, and icons
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = '',
  ariaLabel,
}) => {
  // Variant styles
  const variantStyles = {
    primary: `
      bg-blue-600 text-white
      hover:bg-blue-700
      focus:ring-2 focus:ring-blue-200 focus:ring-offset-2
      active:bg-blue-800
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-white text-gray-700 border-2 border-gray-300
      hover:bg-gray-50 hover:border-gray-400
      focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
      active:bg-gray-100
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
    `,
    success: `
      bg-green-600 text-white
      hover:bg-green-700
      focus:ring-2 focus:ring-green-200 focus:ring-offset-2
      active:bg-green-800
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      focus:ring-2 focus:ring-red-200 focus:ring-offset-2
      active:bg-red-800
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent text-gray-700
      hover:bg-gray-100
      focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
      active:bg-gray-200
      disabled:text-gray-400 disabled:cursor-not-allowed
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Icon size mapping
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/* Loading spinner */}
      {loading && <Loader2 className={`${iconSizes[size]} animate-spin`} />}

      {/* Left icon */}
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSizes[size]}>{icon}</span>
      )}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon */}
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSizes[size]}>{icon}</span>
      )}
    </button>
  );
};
