import { useState } from 'react';

export type ValidationRule = {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
};

/**
 * Validates a value against an array of validation rules
 * @param value - The value to validate
 * @param rules - Array of validation rules to apply
 * @returns Error message if validation fails, null if successful
 */
export const validate = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message;
        }
        if (Array.isArray(value) && value.length === 0) {
          return rule.message;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return rule.message;
        }
        break;

      case 'min':
        if (typeof value === 'string' && value.length < rule.value) {
          return rule.message;
        }
        if (typeof value === 'number' && value < rule.value) {
          return rule.message;
        }
        if (Array.isArray(value) && value.length < rule.value) {
          return rule.message;
        }
        break;

      case 'max':
        if (typeof value === 'string' && value.length > rule.value) {
          return rule.message;
        }
        if (typeof value === 'number' && value > rule.value) {
          return rule.message;
        }
        if (Array.isArray(value) && value.length > rule.value) {
          return rule.message;
        }
        break;

      case 'pattern':
        if (value && !rule.value.test(value)) {
          return rule.message;
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          return rule.message;
        }
        break;
    }
  }

  return null;
};

/**
 * Hook for comprehensive form validation with automatic state management
 * @param initialValues - Initial form values
 * @param validationRules - Validation rules for each field
 * @returns Form state and validation methods
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule[]>>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates a single field
   */
  const validateField = (name: keyof T, value: any): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;
    return validate(value, rules);
  };

  /**
   * Handles field value changes with optional validation
   */
  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || undefined
      }));
    }
  };

  /**
   * Handles field blur events and triggers validation
   */
  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
  };

  /**
   * Validates all fields in the form
   * @returns true if all fields are valid, false otherwise
   */
  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    let isValid = true;

    (Object.keys(validationRules) as (keyof T)[]).forEach(name => {
      const error = validateField(name, values[name]);
      newTouched[name] = true;
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  };

  /**
   * Resets the form to initial state
   */
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  /**
   * Sets a specific field error manually
   */
  const setFieldError = (name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Clears a specific field error
   */
  const clearFieldError = (name: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  /**
   * Checks if a field has been touched
   */
  const isFieldTouched = (name: keyof T): boolean => {
    return touched[name] || false;
  };

  /**
   * Checks if a field has an error
   */
  const hasFieldError = (name: keyof T): boolean => {
    return !!errors[name];
  };

  /**
   * Gets the error message for a field
   */
  const getFieldError = (name: keyof T): string | undefined => {
    return errors[name];
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    validateField,
    reset,
    setValues,
    setFieldError,
    clearFieldError,
    isFieldTouched,
    hasFieldError,
    getFieldError,
    setIsSubmitting
  };
};

// Common validation rules
export const commonValidations = {
  required: (fieldName: string): ValidationRule => ({
    type: 'required',
    message: `${fieldName} הוא שדה חובה`
  }),

  email: (): ValidationRule => ({
    type: 'email',
    message: 'כתובת אימייל לא תקינה'
  }),

  minLength: (min: number, fieldName: string = 'שדה זה'): ValidationRule => ({
    type: 'min',
    value: min,
    message: `${fieldName} חייב להכיל לפחות ${min} תווים`
  }),

  maxLength: (max: number, fieldName: string = 'שדה זה'): ValidationRule => ({
    type: 'max',
    value: max,
    message: `${fieldName} לא יכול להכיל יותר מ-${max} תווים`
  }),

  minValue: (min: number, fieldName: string = 'ערך זה'): ValidationRule => ({
    type: 'min',
    value: min,
    message: `${fieldName} חייב להיות לפחות ${min}`
  }),

  maxValue: (max: number, fieldName: string = 'ערך זה'): ValidationRule => ({
    type: 'max',
    value: max,
    message: `${fieldName} לא יכול להיות יותר מ-${max}`
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message
  }),

  phone: (): ValidationRule => ({
    type: 'pattern',
    value: /^0[0-9]{1,2}-?[0-9]{7}$/,
    message: 'מספר טלפון לא תקין'
  }),

  url: (): ValidationRule => ({
    type: 'pattern',
    value: /^https?:\/\/.+/,
    message: 'כתובת URL לא תקינה'
  }),

  custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
    type: 'custom',
    validator,
    message
  })
};

// Pre-configured validation rule sets for common form fields
export const emailRules: ValidationRule[] = [
  commonValidations.required('אימייל'),
  commonValidations.email()
];

export const phoneRules: ValidationRule[] = [
  commonValidations.required('טלפון'),
  commonValidations.phone()
];

export const numberRules: ValidationRule[] = [
  commonValidations.required('מספר'),
  {
    type: 'pattern',
    value: /^[0-9]+$/,
    message: 'יש להזין מספר תקין'
  }
];

export const hebrewTextRules: ValidationRule[] = [
  commonValidations.required('טקסט'),
  {
    type: 'pattern',
    value: /^[\u0590-\u05FF\s]+$/,
    message: 'יש להזין טקסט בעברית בלבד'
  }
];
