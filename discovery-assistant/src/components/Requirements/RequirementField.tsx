import React from 'react';
import { RequirementField as RequirementFieldType } from '../../types/serviceRequirements';
import { isFieldPrefilled, getPrefilledDisplayText } from '../../utils/requirementsPrefillEngine';

interface RequirementFieldProps {
  field: RequirementFieldType;
  value: any;
  onChange: (value: any) => void;
  prefilledData?: any;
  language: 'en' | 'he';
}

export const RequirementField: React.FC<RequirementFieldProps> = ({
  field,
  value,
  onChange,
  prefilledData,
  language
}) => {
  const isPrefilled = prefilledData && isFieldPrefilled(field.id, prefilledData);
  const label = language === 'he' ? field.labelHe : field.label;
  const description = language === 'he' ? field.descriptionHe : field.description;
  const helperText = language === 'he' ? field.helperTextHe : field.helperText;
  const placeholder = language === 'he' ? (field as any).placeholderHe : (field as any).placeholder;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isPrefilled ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
            }`}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={(field as any).rows || 3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isPrefilled ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
            }`}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isPrefilled ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
            }`}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isPrefilled ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
            }`}
            required={field.required}
          >
            <option value="">{language === 'he' ? 'בחר...' : 'Select...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {language === 'he' ? option.labelHe : option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValue, option.value]);
                    } else {
                      onChange(currentValue.filter((v: string) => v !== option.value));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{language === 'he' ? option.labelHe : option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  required={field.required}
                />
                <span>{language === 'he' ? option.labelHe : option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{label}</span>
          </label>
        );

      case 'list':
        const listValue = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {listValue.map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newList = [...listValue];
                    newList[index] = e.target.value;
                    onChange(newList);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newList = listValue.filter((_: any, i: number) => i !== index);
                    onChange(newList);
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange([...listValue, ''])}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-300"
            >
              + {language === 'he' ? 'הוסף' : 'Add'}
            </button>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isPrefilled ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
            }`}
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {field.required && <span className="text-red-500 mr-1">*</span>}
        </label>
        {isPrefilled && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {language === 'he' ? 'מולא אוטומטית מ-Phase 1' : 'Auto-filled from Phase 1'}
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {renderField()}

      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {isPrefilled && (
        <p className="text-xs text-blue-600">
          {language === 'he' ? 'ערך מקורי: ' : 'Original value: '}
          {getPrefilledDisplayText(field.id, prefilledData)}
        </p>
      )}

      {field.examples && field.examples.length > 0 && (
        <p className="text-xs text-gray-400">
          {language === 'he' ? 'דוגמאות: ' : 'Examples: '}
          {(language === 'he' ? field.examplesHe : field.examples)?.join(', ')}
        </p>
      )}
    </div>
  );
};
