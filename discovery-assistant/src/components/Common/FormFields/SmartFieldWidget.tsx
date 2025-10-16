/**
 * Smart Field Widget Component
 *
 * Reusable component for rendering smart fields with auto-population indicators,
 * conflict warnings, and source information.
 *
 * @example
 * ```tsx
 * const crmSystem = useSmartField({ fieldId: 'crm_system', ... });
 *
 * <SmartFieldWidget
 *   smartField={crmSystem}
 *   fieldType="select"
 *   options={[
 *     { value: 'zoho', label: 'Zoho CRM' },
 *     { value: 'salesforce', label: 'Salesforce' }
 *   ]}
 * />
 * ```
 */

import { SmartFieldValue } from '../../../types/fieldRegistry';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface SmartFieldWidgetProps<T = any> {
  smartField: SmartFieldValue<T>;
  fieldType:
    | 'text'
    | 'number'
    | 'email'
    | 'url'
    | 'select'
    | 'textarea'
    | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

export function SmartFieldWidget<T = any>(props: SmartFieldWidgetProps<T>) {
  const {
    smartField,
    fieldType,
    options,
    placeholder,
    className = '',
    disabled = false,
    multiline = false,
    rows = 3,
  } = props;

  const {
    value,
    setValue,
    isAutoPopulated,
    source,
    hasConflict,
    conflict,
    isLoading,
    error,
    metadata,
  } = smartField;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Determine field styling based on state
  const inputClassName = `
    w-full px-3 py-2 border rounded-lg transition-colors
    ${isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'}
    ${hasConflict ? 'border-orange-400 bg-orange-50' : ''}
    ${error ? 'border-red-400 bg-red-50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-2">
      {/* Label with indicators */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {metadata.label.he}
          {metadata.required && <span className="text-red-500 mr-1">*</span>}
        </label>

        {/* Auto-population badge */}
        {isAutoPopulated && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            מולא אוטומטית
          </span>
        )}

        {/* Conflict badge */}
        {hasConflict && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
            <AlertCircle className="w-3 h-3" />
            אי-התאמה
          </span>
        )}
      </div>

      {/* Description */}
      {metadata.description && (
        <p className="text-xs text-gray-500">{metadata.description.he}</p>
      )}

      {/* Field Input */}
      {fieldType === 'select' && options ? (
        <select
          value={(value as string) || ''}
          onChange={(e) => setValue(e.target.value as T)}
          className={inputClassName}
          disabled={disabled}
        >
          <option value="">{placeholder || 'בחר אפשרות...'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : fieldType === 'textarea' || multiline ? (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => setValue(e.target.value as T)}
          className={inputClassName}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      ) : fieldType === 'checkbox' ? (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(value as boolean) || false}
            onChange={(e) => setValue(e.target.checked as T)}
            className="rounded border-gray-300"
            disabled={disabled}
          />
          <span className="text-sm">{placeholder}</span>
        </label>
      ) : (
        <input
          type={fieldType}
          value={(value as string) || ''}
          onChange={(e) => {
            const newValue =
              fieldType === 'number'
                ? (parseFloat(e.target.value) as T)
                : (e.target.value as T);
            setValue(newValue);
          }}
          className={inputClassName}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}

      {/* Auto-population source info */}
      {isAutoPopulated && source && (
        <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-green-900">
              <strong>מקור:</strong> {source.description}
            </div>
            <div className="text-green-700 mt-1">
              השדה מולא אוטומטית מ-
              {source.phase === 'phase1'
                ? 'שלב 1'
                : source.phase === 'phase2'
                  ? 'שלב 2'
                  : 'שלב 3'}
              . תוכל לערוך אם נדרש.
            </div>
          </div>
        </div>
      )}

      {/* Conflict warning */}
      {hasConflict && conflict && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 text-sm">
                זוהתה אי-התאמה
              </h4>
              <p className="text-xs text-orange-700 mt-1">
                נמצאו ערכים שונים עבור שדה זה במקומות שונים:
              </p>
            </div>
          </div>

          <div className="space-y-1 mt-2">
            {conflict.locations.map((loc: any, idx: number) => (
              <div
                key={idx}
                className="text-xs flex items-center gap-2 p-2 bg-white rounded"
              >
                <span className="font-mono text-orange-800">
                  {JSON.stringify(loc.value)}
                </span>
                <span className="text-gray-500">←</span>
                <span className="text-gray-600">
                  {loc.location.description}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs text-orange-700">
            מומלץ לבחור ערך אחד ולהשתמש בו בכל המקומות.
          </div>
        </div>
      )}

      {/* Validation error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified smart field for common use cases
 */
export function SmartTextField(
  props: Omit<SmartFieldWidgetProps, 'fieldType'>
) {
  return <SmartFieldWidget {...props} fieldType="text" />;
}

export function SmartSelectField(
  props: Omit<SmartFieldWidgetProps, 'fieldType'> & {
    options: Array<{ value: string; label: string }>;
  }
) {
  return <SmartFieldWidget {...props} fieldType="select" />;
}

export function SmartEmailField(
  props: Omit<SmartFieldWidgetProps, 'fieldType'>
) {
  return <SmartFieldWidget {...props} fieldType="email" />;
}

export function SmartNumberField(
  props: Omit<SmartFieldWidgetProps, 'fieldType'>
) {
  return <SmartFieldWidget {...props} fieldType="number" />;
}

export function SmartCheckboxField(
  props: Omit<SmartFieldWidgetProps, 'fieldType'>
) {
  return <SmartFieldWidget {...props} fieldType="checkbox" />;
}
