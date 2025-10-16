import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  actions?: React.ReactNode;
  variant?: 'standard' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  padding = 'md',
  actions,
  variant = 'standard',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const variantClasses = {
    standard: 'bg-white border border-gray-200 shadow-md hover:shadow-lg',
    glass: 'bg-white border border-primary/20 shadow-md hover:shadow-lg',
  };

  return (
    <div
      className={`rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${variantClasses[variant]} ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
};
