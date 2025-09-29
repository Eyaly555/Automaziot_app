import React from 'react';

interface TextFieldProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  helperText?: string;
  error?: boolean;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value = '',
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  multiline = false,
  rows = 3,
  required = false,
  helperText,
  error = false,
  className = '',
  dir = 'rtl'
}) => {
  const baseClasses = `w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200
    focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none
    hover:border-gray-400
    ${error ? 'border-red-300' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100' : 'bg-white'}`;

  return (
    <div className={`space-y-1 ${className}`} dir={dir}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseClasses}
        />
      )}
      {helperText && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};