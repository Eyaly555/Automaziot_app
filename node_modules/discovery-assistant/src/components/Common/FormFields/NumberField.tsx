import React from 'react';

interface NumberFieldProps {
  label?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: boolean;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  disabled = false,
  required = false,
  helperText,
  error = false,
  suffix,
  prefix,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(undefined);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        // Validate against min/max constraints
        let validatedNum = num;
        if (min !== undefined && num < min) {
          validatedNum = min;
        }
        if (max !== undefined && num > max) {
          validatedNum = max;
        }
        onChange(validatedNum);
      }
    }
  };

  return (
    <div className={`space-y-1 ${className}`} dir="rtl">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary
            ${prefix ? 'pr-12' : ''}
            ${suffix ? 'pl-12' : ''}
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        />
        {suffix && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            {suffix}
          </span>
        )}
      </div>
      {helperText && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};