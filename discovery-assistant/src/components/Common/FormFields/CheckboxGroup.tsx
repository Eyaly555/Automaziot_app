import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxOption {
  value: string;
  label: string;
  checked?: boolean;
}

interface CheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  values = [],
  onChange,
  disabled = false,
  helperText,
  className = '',
  columns = 1
}) => {
  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns];

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className={`grid ${gridCols} gap-3`}>
        {options.map(option => (
          <label
            key={option.value}
            className={`flex items-center space-x-2 space-x-reverse cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={values.includes(option.value)}
                onChange={() => !disabled && handleToggle(option.value)}
                disabled={disabled}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center
                ${values.includes(option.value)
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-300'}`}>
                {values.includes(option.value) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};