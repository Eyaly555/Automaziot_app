/**
 * useFormValidation Hook
 *
 * Comprehensive form validation hook with state management
 * Integrates with the validation.ts utility for consistent validation
 *
 * Features:
 * - Values state management with type safety
 * - Errors state with field-level tracking
 * - Touched state for blur validation
 * - Real-time validation on change (after field is touched)
 * - Validate all on submit
 * - Form reset capability
 * - Programmatic value updates
 * - Debounced validation for performance
 * - Dirty state tracking
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  validate,
  validateAll,
  ValidationConfig,
  sanitizeInput,
} from '../utils/validation';

// ============================================================================
// TYPES
// ============================================================================

export interface UseFormValidationOptions<T> {
  /** Initial form values */
  initialValues: T;

  /** Validation rules configuration */
  validationRules: ValidationConfig<T>;

  /** Auto-sanitize string inputs (default: true) */
  autoSanitize?: boolean;

  /** Validate on change (after touched) (default: true) */
  validateOnChange?: boolean;

  /** Validate on blur (default: true) */
  validateOnBlur?: boolean;

  /** Debounce delay for onChange validation in ms (default: 300) */
  debounceDelay?: number;

  /** Callback when form is submitted and valid */
  onSubmit?: (values: T) => void | Promise<void>;

  /** Callback when validation changes */
  onValidationChange?: (isValid: boolean) => void;
}

export interface UseFormValidationReturn<T> {
  /** Current form values */
  values: T;

  /** Validation errors (only fields with errors) */
  errors: Partial<Record<keyof T, string>>;

  /** Touched state (fields that have been blurred) */
  touched: Partial<Record<keyof T, boolean>>;

  /** Dirty state (fields that have been modified) */
  dirty: Partial<Record<keyof T, boolean>>;

  /** Is the form currently valid */
  isValid: boolean;

  /** Is the form submitting */
  isSubmitting: boolean;

  /** Handle field value change */
  handleChange: (name: keyof T, value: any) => void;

  /** Handle field blur */
  handleBlur: (name: keyof T) => void;

  /** Validate all fields */
  validateAll: () => boolean;

  /** Validate a single field */
  validateField: (name: keyof T) => string | null;

  /** Reset form to initial values */
  reset: () => void;

  /** Set all values programmatically */
  setValues: (values: T | ((prev: T) => T)) => void;

  /** Set a single value programmatically */
  setValue: (name: keyof T, value: any) => void;

  /** Set errors manually */
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;

  /** Set a single error manually */
  setError: (name: keyof T, error: string) => void;

  /** Clear a specific error */
  clearError: (name: keyof T) => void;

  /** Clear all errors */
  clearErrors: () => void;

  /** Mark field as touched */
  setTouched: (name: keyof T, isTouched?: boolean) => void;

  /** Mark all fields as touched */
  setAllTouched: () => void;

  /** Submit form (validates and calls onSubmit if valid) */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;

  /** Get field props for easy integration with components */
  getFieldProps: (name: keyof T) => {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error: boolean;
    helperText: string | undefined;
  };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useFormValidation = <T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> => {
  const {
    initialValues,
    validationRules,
    autoSanitize = true,
    validateOnChange = true,
    validateOnBlur = true,
    debounceDelay = 300,
    onSubmit,
    onValidationChange,
  } = options;

  // State
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>(
    {}
  );
  const [touched, setTouchedState] = useState<
    Partial<Record<keyof T, boolean>>
  >({});
  const [dirty, setDirtyState] = useState<Partial<Record<keyof T, boolean>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for debouncing
  const debounceTimeouts = useRef<Partial<Record<keyof T, NodeJS.Timeout>>>({});

  // Computed isValid state
  const isValid = Object.keys(errors).length === 0;

  // Notify validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  /**
   * Validate a single field
   */
  const validateSingleField = useCallback(
    (name: keyof T, value: any): string | null => {
      const rules = validationRules[name];
      if (!rules) return null;

      const result = validate(value, rules, values);
      return result.error;
    },
    [validationRules, values]
  );

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback((): boolean => {
    const newErrors = validateAll(values, validationRules);
    setErrorsState(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  /**
   * Handle field value change
   */
  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      // Sanitize string inputs if enabled
      let processedValue = value;
      if (autoSanitize && typeof value === 'string') {
        processedValue = sanitizeInput(value);
      }

      // Update values
      setValuesState((prev) => ({ ...prev, [name]: processedValue }));

      // Mark as dirty
      setDirtyState((prev) => ({ ...prev, [name]: true }));

      // Validate on change if field was touched and option enabled
      if (validateOnChange && touched[name]) {
        // Clear existing debounce timeout
        if (debounceTimeouts.current[name]) {
          clearTimeout(debounceTimeouts.current[name]);
        }

        // Debounce validation
        debounceTimeouts.current[name] = setTimeout(() => {
          const error = validateSingleField(name, processedValue);

          setErrorsState((prev) => {
            const newErrors = { ...prev };
            if (error) {
              newErrors[name] = error;
            } else {
              delete newErrors[name];
            }
            return newErrors;
          });
        }, debounceDelay);
      }
    },
    [
      autoSanitize,
      validateOnChange,
      touched,
      debounceDelay,
      validateSingleField,
    ]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (name: keyof T) => {
      // Mark as touched
      setTouchedState((prev) => ({ ...prev, [name]: true }));

      // Validate on blur if option enabled
      if (validateOnBlur) {
        const error = validateSingleField(name, values[name]);

        setErrorsState((prev) => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
          return newErrors;
        });
      }
    },
    [validateOnBlur, values, validateSingleField]
  );

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
    setDirtyState({});
    setIsSubmitting(false);

    // Clear all debounce timeouts
    Object.values(debounceTimeouts.current).forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });
    debounceTimeouts.current = {};
  }, [initialValues]);

  /**
   * Set values programmatically
   */
  const setValues = useCallback((newValues: T | ((prev: T) => T)) => {
    if (typeof newValues === 'function') {
      setValuesState(newValues);
    } else {
      setValuesState(newValues);
    }
  }, []);

  /**
   * Set a single value programmatically
   */
  const setValue = useCallback((name: keyof T, value: any) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Set errors manually
   */
  const setErrors = useCallback(
    (newErrors: Partial<Record<keyof T, string>>) => {
      setErrorsState(newErrors);
    },
    []
  );

  /**
   * Set a single error manually
   */
  const setError = useCallback((name: keyof T, error: string) => {
    setErrorsState((prev) => ({ ...prev, [name]: error }));
  }, []);

  /**
   * Clear a specific error
   */
  const clearError = useCallback((name: keyof T) => {
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  /**
   * Mark field as touched
   */
  const setTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouchedState((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  /**
   * Mark all fields as touched
   */
  const setAllTouched = useCallback(() => {
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    Object.keys(validationRules).forEach((key) => {
      allTouched[key as keyof T] = true;
    });
    setTouchedState(allTouched);
  }, [validationRules]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      setAllTouched();

      // Validate all fields
      const isFormValid = validateAllFields();

      if (!isFormValid) {
        console.warn('[useFormValidation] Form validation failed', errors);
        return;
      }

      // Call onSubmit if provided
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('[useFormValidation] Submit error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [setAllTouched, validateAllFields, onSubmit, values, errors]
  );

  /**
   * Get field props for easy integration
   */
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name],
      onChange: (value: any) => handleChange(name, value),
      onBlur: () => handleBlur(name),
      error: !!errors[name],
      helperText: errors[name],
    }),
    [values, errors, handleChange, handleBlur]
  );

  // Cleanup debounce timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    validateAll: validateAllFields,
    validateField: validateSingleField,
    reset,
    setValues,
    setValue,
    setErrors,
    setError,
    clearError,
    clearErrors,
    setTouched,
    setAllTouched,
    handleSubmit,
    getFieldProps,
  };
};

export default useFormValidation;
