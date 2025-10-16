import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: boolean;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value = '',
  onChange,
  options,
  placeholder = 'בחר...',
  disabled = false,
  required = false,
  helperText,
  error = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`} dir="rtl">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm appearance-none focus:ring-primary focus:border-primary
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      </div>
      {helperText && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
