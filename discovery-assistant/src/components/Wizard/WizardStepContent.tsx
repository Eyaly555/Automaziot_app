import React from 'react';
import { WizardStep, WizardField, Meeting } from '../../types';
import { AlertCircle } from 'lucide-react';

interface WizardStepContentProps {
  step: WizardStep;
  values: any;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
  meeting: Meeting;
}

export const WizardStepContent: React.FC<WizardStepContentProps> = ({
  step,
  values,
  errors,
  onChange,
  meeting,
}) => {
  // Get field value from nested object structure
  const getFieldValue = (fieldName: string) => {
    const parts = fieldName.split('.');
    let value = values;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  };

  // Check if field should be skipped
  const shouldSkipField = (field: WizardField): boolean => {
    if (field.skipCondition) {
      return field.skipCondition(meeting);
    }
    return false;
  };

  // Render a single field
  const renderField = (field: WizardField) => {
    if (shouldSkipField(field)) {
      return null;
    }

    const FieldComponent = field.component;
    const fieldValue = getFieldValue(field.name);
    const fieldError = errors[field.name];

    // Add allow custom support for specific fields
    const enhancedProps = {
      ...field.props,
      value: fieldValue,
      onChange: (value: any) => onChange(field.name, value),
      error: fieldError,
    };

    // Special handling for components that need custom entries support
    if (field.props.allowCustom) {
      enhancedProps.allowCustom = true;
      enhancedProps.onCustomAdd = (customValue: string) => {
        // Handle custom value addition
        const currentValues = fieldValue || [];
        onChange(field.name, [...currentValues, customValue]);
      };
    }

    return (
      <div key={field.name} className="mb-6">
        <FieldComponent {...enhancedProps} />
        {fieldError && (
          <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{fieldError}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{step.sectionName}</h2>
        {step.isOptional && (
          <p className="mt-1 text-sm text-gray-500">
            שלב זה הוא אופציונלי - ניתן לדלג עליו אם לא רלוונטי
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-6">{step.fields.map(renderField)}</div>

      {/* Module Context Info */}
      {step.moduleId === 'overview' && step.id === 'overview-basics' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            המידע שתמלא כאן יעזור להתאים את השאלות הבאות לעסק שלך
          </p>
        </div>
      )}

      {step.moduleId === 'roi' && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            חישוב ה-ROI יתבצע אוטומטית על בסיס הנתונים שהזנת במודולים הקודמים
          </p>
        </div>
      )}

      {step.moduleId === 'planning' && step.id === 'planning-nextsteps' && (
        <div className="mt-6 p-4 bg-purple-50 rounded-md">
          <p className="text-sm text-purple-800">
            בסיום האשף תקבל סיכום מלא עם המלצות מותאמות אישית וחישובי ROI
          </p>
        </div>
      )}
    </div>
  );
};
