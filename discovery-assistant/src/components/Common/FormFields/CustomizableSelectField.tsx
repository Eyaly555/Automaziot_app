import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SelectOption } from '../../../types';
import { useMeetingStore } from '../../../store/useMeetingStore';

interface CustomizableSelectFieldProps {
  label: string;
  value?: string | string[];
  options: SelectOption[];
  onChange: (value: string | string[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  placeholder?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
  moduleId?: string;
  fieldName?: string;
  validateCustom?: (value: string) => boolean | string;
  maxCustomEntries?: number;
}

export const CustomizableSelectField: React.FC<CustomizableSelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  required = false,
  disabled = false,
  multiple = false,
  placeholder = 'בחר אפשרות',
  allowCustom = false,
  customPlaceholder = 'הוסף ערך חדש...',
  moduleId,
  fieldName,
  validateCustom,
  maxCustomEntries = 10
}) => {
  const { getCustomValues, addCustomValue, removeCustomValue } = useMeetingStore();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');
  const [customError, setCustomError] = useState<string>('');

  // Get custom values from store
  const customValues = (moduleId && fieldName) ? getCustomValues(moduleId, fieldName) : [];

  // Combine predefined options with custom values
  const allOptions = [...options, ...customValues];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === '__custom__') {
      setShowCustomInput(true);
      return;
    }

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(selectedValue)) {
        onChange(currentValues.filter(v => v !== selectedValue));
      } else {
        onChange([...currentValues, selectedValue]);
      }
    } else {
      onChange(selectedValue);
      setShowCustomInput(false);
    }
  };

  const handleAddCustom = () => {
    if (!customInputValue.trim()) {
      setCustomError('ערך לא יכול להיות ריק');
      return;
    }

    // Check if already exists
    const exists = allOptions.some(opt =>
      opt.value.toLowerCase() === customInputValue.trim().toLowerCase()
    );

    if (exists) {
      setCustomError('ערך זה כבר קיים');
      return;
    }

    // Validate custom value
    if (validateCustom) {
      const validationResult = validateCustom(customInputValue);
      if (typeof validationResult === 'string') {
        setCustomError(validationResult);
        return;
      } else if (!validationResult) {
        setCustomError('ערך לא תקין');
        return;
      }
    }

    // Check max custom entries
    if (customValues.length >= maxCustomEntries) {
      setCustomError(`ניתן להוסיף עד ${maxCustomEntries} ערכים מותאמים אישית`);
      return;
    }

    // Add to store
    const newOption: SelectOption = {
      value: customInputValue.trim(),
      label: customInputValue.trim(),
      isCustom: true
    };

    if (moduleId && fieldName) {
      addCustomValue(moduleId, fieldName, newOption);
    }

    // Update selection
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange([...currentValues, newOption.value]);
    } else {
      onChange(newOption.value);
    }

    // Reset
    setCustomInputValue('');
    setCustomError('');
    setShowCustomInput(false);
  };

  const handleRemoveCustom = (customValue: string) => {
    if (moduleId && fieldName) {
      removeCustomValue(moduleId, fieldName, customValue);
    }

    // Update selection if this value was selected
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== customValue));
    } else if (value === customValue) {
      onChange('');
    }
  };

  const handleCustomInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomInputValue('');
      setCustomError('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      {/* Main Select */}
      <select
        value={multiple ? '' : (value || '')}
        onChange={handleSelectChange}
        disabled={disabled || showCustomInput}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      >
        <option value="">{placeholder}</option>
        {allOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.isCustom && ' (מותאם אישית)'}
          </option>
        ))}
        {allowCustom && (
          <option value="__custom__">➕ הוסף ערך חדש...</option>
        )}
      </select>

      {/* Custom Input */}
      {showCustomInput && (
        <div className="flex gap-2 animate-slideDown">
          <input
            type="text"
            value={customInputValue}
            onChange={(e) => {
              setCustomInputValue(e.target.value);
              setCustomError('');
            }}
            onKeyDown={handleCustomInputKeyPress}
            placeholder={customPlaceholder}
            className={`
              flex-1 px-3 py-2 border rounded-md
              ${customError ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            title="הוסף"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomInputValue('');
              setCustomError('');
            }}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            title="ביטול"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Custom Error */}
      {customError && (
        <p className="text-sm text-red-600 mt-1">{customError}</p>
      )}

      {/* Selected Values (for multiple) */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map(val => {
            const option = allOptions.find(opt => opt.value === val);
            if (!option) return null;

            return (
              <div
                key={val}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                <span>{option.label}</span>
                {option.isCustom && <span className="text-xs">(מותאם)</span>}
                <button
                  type="button"
                  onClick={() => {
                    if (option.isCustom) {
                      handleRemoveCustom(val);
                    } else {
                      onChange(value.filter(v => v !== val));
                    }
                  }}
                  className="hover:text-blue-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Values List */}
      {customValues.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">ערכים מותאמים אישית:</p>
          <div className="flex flex-wrap gap-2">
            {customValues.map(custom => (
              <div
                key={custom.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                <span>{custom.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(custom.value)}
                  className="hover:text-red-600 transition-colors"
                  title="מחק ערך מותאם"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};