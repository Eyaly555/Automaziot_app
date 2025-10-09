import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'elevated' | 'highlighted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

/**
 * Card Component
 * Flexible container component with multiple visual variants
 * Supports headers, footers, and interactive states
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
  header,
  footer,
  title,
  subtitle,
  icon,
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-md border border-gray-100',
    highlighted: 'bg-blue-50 border-2 border-blue-200',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Hover effect if clickable or hoverable
  const hoverStyles = (onClick || hoverable)
    ? 'cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all duration-200'
    : '';

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Auto-generate header if title/subtitle/icon provided
  const autoHeader = (title || subtitle || icon) && !header ? (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
      )}
      <div className="flex-1">
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
    </div>
  ) : null;

  return (
    <div
      className={`
        rounded-lg
        ${variantStyles[variant]}
        ${hoverStyles}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header - either custom or auto-generated */}
      {(header || autoHeader) && (
        <div className={`border-b border-gray-200 ${paddingStyles[padding]}`}>
          {header || autoHeader}
        </div>
      )}

      {/* Main content */}
      <div className={(!header && !autoHeader && !footer) ? paddingStyles[padding] : padding === 'none' ? '' : 'p-4'}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`border-t border-gray-200 ${paddingStyles[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};
