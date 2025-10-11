/**
 * Validated Form Example Component
 *
 * Demonstrates proper integration of:
 * - useFormValidation hook
 * - validation.ts utility
 * - Enhanced Input component
 * - All form field components
 *
 * This is a reference implementation for developers
 */

import React from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { emailRules, phoneRules, numberRules, hebrewTextRules } from '../../utils/validation';
import { Input } from '../Common/FormFields/Input';
import { TextField } from '../Common/FormFields/TextField';
import { SelectField } from '../Common/FormFields/SelectField';
import { NumberField } from '../Common/FormFields/NumberField';
import { TextAreaField } from '../Common/FormFields/TextAreaField';

// ============================================================================
// TYPES
// ============================================================================

interface ExampleFormValues {
  clientName: string;
  email: string;
  phone: string;
  businessType: string;
  employees: number;
  description: string;
  website: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ValidatedFormExample: React.FC = () => {
  // Initialize form validation
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps
  } = useFormValidation<ExampleFormValues>({
    initialValues: {
      clientName: '',
      email: '',
      phone: '',
      businessType: '',
      employees: 0,
      description: '',
      website: ''
    },
    validationRules: {
      clientName: [
        ...hebrewTextRules,
        { type: 'required', message: 'שם לקוח הוא שדה חובה' }
      ],
      email: [
        ...emailRules,
        { type: 'required', message: 'כתובת אימייל היא שדה חובה' }
      ],
      phone: [
        ...phoneRules,
        { type: 'required', message: 'מספר טלפון הוא שדה חובה' }
      ],
      businessType: [
        { type: 'required', message: 'סוג העסק הוא שדה חובה' }
      ],
      employees: [
        { type: 'required', message: 'מספר עובדים הוא שדה חובה' },
        { type: 'min', value: 1, message: 'מספר עובדים חייב להיות לפחות 1' },
        { type: 'max', value: 10000, message: 'מספר עובדים לא יכול להיות יותר מ-10000' }
      ],
      description: [
        ...hebrewTextRules
      ],
      website: [
        { type: 'url', message: 'כתובת אתר לא תקינה' }
      ]
    },
    onSubmit: async (values) => {
      console.log('Form submitted with values:', values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('טופס נשלח בהצלחה!');
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          דוגמה לטופס עם Validation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Name - Using enhanced Input component */}
          <Input
            label="שם לקוח"
            {...getFieldProps('clientName')}
            type="text"
            placeholder="הזן שם לקוח"
            required
            maxLength={100}
            showCounter
          />

          {/* Email - Using TextField (backward compatible) */}
          <TextField
            label="אימייל"
            value={values.email}
            onChange={(value) => handleChange('email', value)}
            onBlur={() => handleBlur('email')}
            type="email"
            placeholder="example@company.com"
            required
            error={!!errors.email}
            helperText={errors.email}
            dir="ltr"
          />

          {/* Phone - Using TextField */}
          <TextField
            label="טלפון"
            value={values.phone}
            onChange={(value) => handleChange('phone', value)}
            onBlur={() => handleBlur('phone')}
            type="tel"
            placeholder="05X-XXXXXXX"
            required
            error={!!errors.phone}
            helperText={errors.phone}
          />

          {/* Business Type - Using SelectField */}
          <SelectField
            label="סוג העסק"
            value={values.businessType}
            onChange={(value) => handleChange('businessType', value)}
            options={[
              { value: 'b2b', label: 'B2B - עסק לעסק' },
              { value: 'b2c', label: 'B2C - עסק לצרכן' },
              { value: 'b2b2c', label: 'B2B2C - משולב' },
              { value: 'saas', label: 'SaaS' }
            ]}
            required
            error={!!errors.businessType}
            helperText={errors.businessType}
          />

          {/* Employees - Using NumberField */}
          <NumberField
            label="מספר עובדים"
            value={values.employees}
            onChange={(value) => handleChange('employees', value)}
            min={1}
            max={10000}
            required
            error={!!errors.employees}
            helperText={errors.employees}
          />

          {/* Description - Using TextAreaField */}
          <TextAreaField
            label="תיאור העסק"
            value={values.description}
            onChange={(value) => handleChange('description', value)}
            rows={4}
            placeholder="ספר לנו על העסק שלך..."
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* Website - Using enhanced Input with URL validation */}
          <Input
            label="אתר אינטרנט"
            {...getFieldProps('website')}
            type="url"
            placeholder="https://example.com"
            dir="ltr"
          />

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`
                flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${isValid && !isSubmitting
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? 'שולח...' : 'שלח טופס'}
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              איפוס
            </button>
          </div>

          {/* Validation Status */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">סטטוס Validation:</h3>
            <ul className="space-y-1 text-sm">
              <li className={isValid ? 'text-green-600' : 'text-red-600'}>
                {isValid ? '✓ טופס תקין' : '✗ יש שגיאות בטופס'}
              </li>
              <li className="text-gray-600">
                שדות שנגעת בהם: {Object.keys(touched).length}
              </li>
              <li className="text-gray-600">
                שגיאות: {Object.keys(errors).length}
              </li>
            </ul>

            {/* Show errors */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-red-600 mb-1">שגיאות:</p>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          הוראות שימוש
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>מלא את כל השדות הנדרשים (מסומנים ב-*)</li>
          <li>Validation מתבצע בזמן אמת לאחר שנגעת בשדה</li>
          <li>הטופס לא יישלח אם יש שגיאות</li>
          <li>שימו לב להודעות השגיאה המפורטות</li>
          <li>אימייל וטלפון מאומתים בפורמט ישראלי</li>
        </ol>
      </div>
    </div>
  );
};

export default ValidatedFormExample;
