import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SelectOption } from '../../../types';
import { useMeetingStore } from '../../../store/useMeetingStore';

interface CustomizableCheckboxGroupProps {
  label: string;
  options: SelectOption[];
  value?: string[];
  onChange: (value: string[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  max?: number;
  allowCustom?: boolean;
  customPlaceholder?: string;
  moduleId?: string;
  fieldName?: string;
  validateCustom?: (value: string) => boolean | string;
  maxCustomEntries?: number;
}

export const CustomizableCheckboxGroup: React.FC<CustomizableCheckboxGroupProps> = ({
  label,
  options,
  value = [],
  onChange,
  error,
  required = false,
  disabled = false,
  max,
  allowCustom = false,
  customPlaceholder = 'הוסף אפשרות חדשה...',
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

  const handleCheckboxChange = (optionValue: string) => {
    if (disabled) return;

    const currentValues = Array.isArray(value) ? value : [];

    if (currentValues.includes(optionValue)) {
      // Uncheck - remove from array
      onChange(currentValues.filter(v => v !== optionValue));
    } else {
      // Check - add to array if not at max
      if (max && currentValues.length >= max) {
        return; // Don't add if at max
      }
      onChange([...currentValues, optionValue]);
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

    // Auto-select the new custom option
    const currentValues = Array.isArray(value) ? value : [];
    if (!max || currentValues.length < max) {
      onChange([...currentValues, newOption.value]);
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

    // Unselect if it was selected
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(customValue)) {
      onChange(currentValues.filter(v => v !== customValue));
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

  const selectedCount = value.length;
  const isAtMax = max ? selectedCount >= max : false;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
        {max && (
          <span className={`text-xs ${isAtMax ? 'text-orange-600' : 'text-gray-500'}`}>
            {selectedCount}/{max} נבחרו
          </span>
        )}
      </div>

      {/* Checkbox Options */}
      <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
        {allOptions.map(option => {
          const isChecked = value.includes(option.value);
          const isDisabled = disabled || (!isChecked && isAtMax);

          return (
            <div key={option.value} className="flex items-center justify-between group">
              <label
                className={`flex items-center gap-2 flex-1 cursor-pointer
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                  p-1 rounded transition-colors
                `}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(option.value)}
                  disabled={isDisabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {option.label}
                  {option.isCustom && (
                    <span className="text-xs text-gray-500 mr-2">(מותאם אישית)</span>
                  )}
                </span>
              </label>
              {option.isCustom && (
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(option.value)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                  title="מחק אפשרות מותאמת"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Custom Option Button */}
        {allowCustom && !showCustomInput && (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            disabled={disabled}
            className={`
              w-full flex items-center gap-2 p-2 mt-2
              ${disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
              rounded-md transition-colors text-sm font-medium
            `}
          >
            <Plus className="w-4 h-4" />
            <span>הוסף אפשרות חדשה</span>
          </button>
        )}
      </div>

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

      {/* Selected Summary */}
      {value.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">נבחרו:</p>
          <div className="flex flex-wrap gap-2">
            {value.map(val => {
              const option = allOptions.find(opt => opt.value === val);
              if (!option) return null;

              return (
                <div
                  key={val}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                >
                  <span>{option.label}</span>
                  <button
                    type="button"
                    onClick={() => handleCheckboxChange(val)}
                    className="hover:text-blue-900 transition-colors"
                    title="הסר"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
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