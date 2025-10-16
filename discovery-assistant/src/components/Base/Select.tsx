import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  dir?: 'rtl' | 'ltr';
  loading?: boolean;
  className?: string;
}

export const Select = ({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'בחר...',
  error,
  required,
  searchable,
  disabled,
  clearable,
  dir = 'rtl',
  loading,
  className = '',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchTerm
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onBlur]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    onBlur?.();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    onBlur?.();
  };

  return (
    <div className={`w-full ${className}`} dir={dir} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          className={`
            w-full px-3 py-2 text-${dir === 'rtl' ? 'right' : 'left'}
            border rounded-lg
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-blue-200 border-blue-500' : ''}
            ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            focus:outline-none
            flex items-center justify-between
          `}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {loading ? 'טוען...' : selectedOption?.label || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {clearable && value && !disabled && (
              <X
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search */}
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="חפש..."
                    className={`w-full ${dir === 'rtl' ? 'pr-9' : 'pl-9'} py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  לא נמצאו תוצאות
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (!option.disabled) {
                        handleSelect(option.value);
                      }
                    }}
                    disabled={option.disabled}
                    className={`
                      w-full px-3 py-2 text-${dir === 'rtl' ? 'right' : 'left'} text-sm
                      flex items-center justify-between
                      transition-colors
                      ${option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                    `}
                  >
                    {option.label}
                    {option.value === value && <Check className="w-4 h-4" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
