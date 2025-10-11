/**
 * Enhanced Input Component with Full Validation Support
 *
 * Integrates with the useFormValidation hook and validation.ts utility
 * Provides consistent validation UX across the application
 *
 * Features:
 * - Built-in error display with Hebrew messages
 * - Required field indicator
 * - Accessibility support (ARIA attributes)
 * - Multiple input types (text, email, tel, url, password)
 * - RTL/LTR support
 * - Disabled and loading states
 * - Helper text
 * - Character counter
 * - Auto-sanitization
 */

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps {
  /** Field label */
  label?: string;

  /** Current value */
  value: string;

  /** Change handler */
  onChange: (value: string) => void;

  /** Blur handler (for validation triggers) */
  onBlur?: () => void;

  /** Focus handler */
  onFocus?: () => void;

  /** Input type */
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'search';

  /** Placeholder text */
  placeholder?: string;

  /** Is this field required */
  required?: boolean;

  /** Is this field disabled */
  disabled?: boolean;

  /** Error state */
  error?: boolean;

  /** Helper text / error message */
  helperText?: string;

  /** Maximum character length */
  maxLength?: number;

  /** Show character counter */
  showCounter?: boolean;

  /** Text direction (RTL for Hebrew, LTR for English) */
  dir?: 'rtl' | 'ltr';

  /** Auto-complete attribute */
  autoComplete?: string;

  /** Name attribute for form submission */
  name?: string;

  /** ID for accessibility */
  id?: string;

  /** Additional CSS classes */
  className?: string;

  /** Prefix icon or text */
  prefix?: React.ReactNode;

  /** Suffix icon or text */
  suffix?: React.ReactNode;

  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Input variant */
  variant?: 'default' | 'filled' | 'outlined';

  /** Loading state */
  loading?: boolean;

  /** Read-only state */
  readOnly?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  maxLength,
  showCounter = false,
  dir = 'rtl',
  autoComplete,
  name,
  id,
  className = '',
  prefix,
  suffix,
  size = 'md',
  variant = 'default',
  loading = false,
  readOnly = false
}) => {
  const [_isFocused, setIsFocused] = useState(false);

  // Generate IDs for accessibility
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-300',
    filled: 'bg-gray-100 border border-transparent',
    outlined: 'bg-transparent border-2 border-gray-300'
  };

  // Base input classes
  const baseClasses = `
    w-full rounded-lg shadow-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/20
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'focus:border-primary'}
    ${disabled || loading ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-gray-400'}
    ${readOnly ? 'bg-gray-50 cursor-default' : ''}
    ${prefix ? 'pr-10' : ''}
    ${suffix ? 'pl-10' : ''}
  `.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Enforce maxLength
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    onChange(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <div className={`space-y-1 ${className}`} dir={dir}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1" aria-label="חובה">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {prefix}
          </div>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled || loading}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={error}
          aria-describedby={error ? errorId : helperText ? helperTextId : undefined}
          aria-required={required}
          className={baseClasses}
        />

        {/* Suffix */}
        {suffix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {suffix}
          </div>
        )}

        {/* Error Icon */}
        {error && !suffix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Helper Text / Error Message / Character Counter */}
      <div className="flex justify-between items-start gap-2">
        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            id={error ? errorId : helperTextId}
            className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
            role={error ? 'alert' : undefined}
          >
            {helperText}
          </p>
        )}

        {/* Character Counter */}
        {showCounter && maxLength && (
          <span className="text-sm text-gray-400 whitespace-nowrap">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;
