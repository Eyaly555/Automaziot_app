import { AlertCircle } from 'lucide-react';

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  rows?: number;
  autoResize?: boolean;
  disabled?: boolean;
  helpText?: string;
  dir?: 'rtl' | 'ltr';
  className?: string;
}

export const TextArea = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required,
  maxLength,
  showCharCount,
  rows = 4,
  autoResize,
  disabled,
  helpText,
  dir = 'rtl',
  className = '',
}: TextAreaProps) => {
  // Auto-resize functionality
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);

    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
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

      {/* TextArea */}
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className={`
          w-full px-3 py-2
          border rounded-lg
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-200'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          focus:outline-none focus:border-blue-500
          ${autoResize ? 'resize-none overflow-hidden' : 'resize-y'}
        `}
        style={autoResize ? { minHeight: `${rows * 24}px` } : undefined}
      />

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
