import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value = '',
  onChange,
  options,
  disabled = false,
  required = false,
  helperText,
  error = false,
  className = '',
  orientation = 'vertical',
}) => {
  // Check if we're in mobile context by looking for mobile classes or mobile route
  const isMobile =
    className.includes('mobile-') ||
    window.location.pathname.includes('/mobile/');

  if (isMobile) {
    return (
      <div className={`mobile-radio-group ${className}`} dir="rtl">
        {label && (
          <label className="mobile-question">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <div
          className={`${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}`}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={`mobile-radio-option ${value === option.value ? 'selected' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => !disabled && onChange(e.target.value)}
                disabled={disabled}
                className="mobile-radio-option input"
              />
              <span className="mobile-radio-option label">{option.label}</span>
              {option.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {option.description}
                </p>
              )}
            </label>
          ))}
        </div>
        {helperText && (
          <p className={`mobile-helper-text ${error ? 'text-red-600' : ''}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div
        className={`${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-start cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => !disabled && onChange(e.target.value)}
              disabled={disabled}
              className="mt-1 ml-2 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700">{option.label}</span>
              {option.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      {helperText && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
