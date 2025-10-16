import { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  helpText?: string;
  icon?: React.ReactNode;
  dir?: 'rtl' | 'ltr';
  className?: string;
}

export const Input = ({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  error,
  success,
  disabled,
  required,
  maxLength,
  showCharCount,
  helpText,
  icon,
  dir = 'rtl',
  className = '',
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div className={`w-full ${className}`} dir={dir}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon (right side for RTL, left for LTR) */}
        {icon && !error && !success && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`}
          >
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2
            ${icon ? (dir === 'rtl' ? 'pr-10' : 'pl-10') : ''}
            ${type === 'password' ? (dir === 'rtl' ? 'pl-10' : 'pr-10') : ''}
            ${error || success ? (dir === 'rtl' ? 'pl-10' : 'pr-10') : ''}
            border rounded-lg
            transition-all duration-200
            ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                : success
                  ? 'border-green-500 focus:ring-2 focus:ring-green-200'
                  : isFocused
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none
          `}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Success/Error Icons */}
        {(error || success) && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
          >
            {error && <AlertCircle className="w-4 h-4 text-red-500" />}
            {success && <Check className="w-4 h-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Helper Text / Error Message / Character Count */}
      <div className="mt-1 flex items-center justify-between">
        <div className="flex-1">
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
          {!error && helpText && (
            <p className="text-sm text-gray-500">{helpText}</p>
          )}
        </div>

        {showCharCount && maxLength && (
          <span
            className={`text-xs ${value.length > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-400'}`}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
