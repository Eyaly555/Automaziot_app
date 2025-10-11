/**
 * Form & Input Types
 *
 * Type definitions for form components, validation, and form state management.
 *
 * @module types/forms
 */

import { ReactNode } from 'react';

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Standard HTML input types supported by the Input component
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';

/**
 * Input size variants
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input visual states
 */
export type InputState = 'default' | 'error' | 'success' | 'warning';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation rule types
 *
 * @description
 * - required: Field must have a value
 * - email: Must be valid email format
 * - min: Minimum length (string) or value (number)
 * - max: Maximum length (string) or value (number)
 * - pattern: Must match regular expression
 * - custom: Custom validation function
 */
export type ValidationRuleType = 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';

/**
 * Validation rule configuration
 *
 * @example
 * ```typescript
 * const emailRule: ValidationRule = {
 *   type: 'email',
 *   message: 'כתובת אימייל לא תקינה'
 * };
 *
 * const customRule: ValidationRule = {
 *   type: 'custom',
 *   validator: (value) => value !== 'admin',
 *   message: 'שם משתמש זה אסור'
 * };
 * ```
 */
export interface ValidationRule {
  /** Type of validation */
  type: ValidationRuleType;

  /** Value for min/max rules or RegExp for pattern */
  value?: number | RegExp;

  /** Error message to display when validation fails */
  message: string;

  /** Custom validator function (for 'custom' type) */
  validator?: (value: any) => boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Is the value valid? */
  valid: boolean;

  /** Error message if invalid */
  error?: string;
}

/**
 * Field-level validation configuration
 *
 * @example
 * ```typescript
 * const fieldValidation: FieldValidation = {
 *   rules: [
 *     { type: 'required', message: 'שדה חובה' },
 *     { type: 'min', value: 3, message: 'לפחות 3 תווים' }
 *   ],
 *   validateOn: 'blur'
 * };
 * ```
 */
export interface FieldValidation {
  /** Array of validation rules */
  rules: ValidationRule[];

  /** When to trigger validation */
  validateOn?: 'change' | 'blur' | 'submit';

  /** Debounce delay for 'change' validation (ms) */
  debounce?: number;
}

// ============================================================================
// FORM FIELD STATE
// ============================================================================

/**
 * State for a single form field
 *
 * @template T - Type of the field value
 *
 * @example
 * ```typescript
 * const emailField: FormFieldState<string> = {
 *   value: 'user@example.com',
 *   error: undefined,
 *   touched: true,
 *   dirty: true,
 *   validating: false
 * };
 * ```
 */
export interface FormFieldState<T = any> {
  /** Current value */
  value: T;

  /** Error message if validation failed */
  error?: string;

  /** Has the field been interacted with? */
  touched: boolean;

  /** Has the value changed from initial? */
  dirty?: boolean;

  /** Is validation currently running? */
  validating?: boolean;

  /** Initial value for reset */
  initialValue?: T;
}

/**
 * Form state for all fields
 *
 * @template T - Shape of form values
 *
 * @example
 * ```typescript
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 *
 * const formState: FormState<LoginForm> = {
 *   values: { email: '', password: '' },
 *   errors: {},
 *   touched: {},
 *   isValid: false,
 *   isSubmitting: false
 * };
 * ```
 */
export interface FormState<T extends Record<string, any>> {
  /** Current form values */
  values: T;

  /** Field-level errors */
  errors: Partial<Record<keyof T, string>>;

  /** Which fields have been touched */
  touched: Partial<Record<keyof T, boolean>>;

  /** Is the entire form valid? */
  isValid: boolean;

  /** Is the form currently submitting? */
  isSubmitting: boolean;

  /** Has the form been submitted at least once? */
  isSubmitted?: boolean;

  /** Number of submit attempts */
  submitCount?: number;
}

// ============================================================================
// FORM FIELD PROPS
// ============================================================================

/**
 * Base props for form input components
 *
 * @template T - Type of the input value
 */
export interface FormFieldProps<T = string> {
  /** Field label */
  label?: string;

  /** Current value */
  value: T;

  /** Change handler */
  onChange: (value: T) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Error message */
  error?: string;

  /** Success state */
  success?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Required field indicator */
  required?: boolean;

  /** Help text shown below field */
  helpText?: string;

  /** Icon to display */
  icon?: ReactNode;

  /** Field name for form data */
  name?: string;

  /** Field ID */
  id?: string;

  /** Auto-complete attribute */
  autoComplete?: string;

  /** Text direction */
  dir?: 'rtl' | 'ltr';

  /** Blur handler */
  onBlur?: () => void;

  /** Focus handler */
  onFocus?: () => void;
}

/**
 * Props specific to text inputs
 */
export interface TextInputProps extends FormFieldProps<string> {
  /** Input type */
  type?: InputType;

  /** Maximum character length */
  maxLength?: number;

  /** Show character count? */
  showCharCount?: boolean;

  /** Input size */
  size?: InputSize;

  /** Pattern for validation */
  pattern?: string;
}

/**
 * Props for textarea components
 */
export interface TextAreaProps extends FormFieldProps<string> {
  /** Number of visible rows */
  rows?: number;

  /** Maximum character length */
  maxLength?: number;

  /** Show character count? */
  showCharCount?: boolean;

  /** Auto-resize on content change? */
  autoResize?: boolean;

  /** Minimum rows when auto-resizing */
  minRows?: number;

  /** Maximum rows when auto-resizing */
  maxRows?: number;
}

/**
 * Option for select/radio/checkbox inputs
 */
export interface SelectOption {
  /** Option value */
  value: string;

  /** Display label */
  label: string;

  /** Is option disabled? */
  disabled?: boolean;

  /** Optional icon */
  icon?: ReactNode;

  /** Optional description */
  description?: string;
}

/**
 * Props for select components
 */
export interface SelectProps extends FormFieldProps<string> {
  /** Available options */
  options: SelectOption[];

  /** Is searchable/filterable? */
  searchable?: boolean;

  /** Allow custom values? */
  allowCustom?: boolean;

  /** Placeholder when no selection */
  placeholder?: string;

  /** Size variant */
  size?: InputSize;

  /** Loading state */
  loading?: boolean;

  /** Custom render for options */
  renderOption?: (option: SelectOption) => ReactNode;
}

/**
 * Props for multi-select components
 */
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
  /** Selected values */
  value: string[];

  /** Change handler for array of values */
  onChange: (value: string[]) => void;

  /** Maximum selections allowed */
  maxSelections?: number;

  /** Show selected count badge? */
  showCount?: boolean;
}

/**
 * Props for checkbox group
 */
export interface CheckboxGroupProps extends FormFieldProps<string[]> {
  /** Available options */
  options: SelectOption[];

  /** Layout direction */
  direction?: 'horizontal' | 'vertical';

  /** Spacing between checkboxes */
  spacing?: 'compact' | 'normal' | 'relaxed';
}

/**
 * Props for radio group
 */
export interface RadioGroupProps extends FormFieldProps<string> {
  /** Available options */
  options: SelectOption[];

  /** Layout direction */
  direction?: 'horizontal' | 'vertical';

  /** Spacing between radios */
  spacing?: 'compact' | 'normal' | 'relaxed';
}

/**
 * Props for number input
 */
export interface NumberInputProps extends Omit<FormFieldProps<number>, 'value' | 'onChange'> {
  /** Current numeric value */
  value: number | undefined;

  /** Change handler */
  onChange: (value: number | undefined) => void;

  /** Minimum value */
  min?: number;

  /** Maximum value */
  max?: number;

  /** Step increment */
  step?: number;

  /** Number of decimal places */
  precision?: number;

  /** Show increment/decrement buttons? */
  showControls?: boolean;

  /** Format display value */
  formatter?: (value: number) => string;

  /** Parse input value */
  parser?: (value: string) => number;
}

// ============================================================================
// FORM ACTIONS
// ============================================================================

/**
 * Form action handlers
 *
 * @template T - Shape of form values
 */
export interface FormActions<T extends Record<string, any>> {
  /** Set value for a field */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;

  /** Set multiple values at once */
  setValues: (values: Partial<T>) => void;

  /** Set error for a field */
  setError: (field: keyof T, error: string) => void;

  /** Clear error for a field */
  clearError: (field: keyof T) => void;

  /** Mark field as touched */
  setTouched: (field: keyof T, touched: boolean) => void;

  /** Validate a specific field */
  validateField: (field: keyof T) => Promise<boolean>;

  /** Validate all fields */
  validateForm: () => Promise<boolean>;

  /** Reset form to initial values */
  reset: () => void;

  /** Submit form */
  submit: () => Promise<void>;
}

/**
 * Form configuration
 *
 * @template T - Shape of form values
 */
export interface FormConfig<T extends Record<string, any>> {
  /** Initial form values */
  initialValues: T;

  /** Validation rules per field */
  validationRules?: Partial<Record<keyof T, ValidationRule[]>>;

  /** Submit handler */
  onSubmit: (values: T) => void | Promise<void>;

  /** Validation mode */
  mode?: 'onChange' | 'onBlur' | 'onSubmit';

  /** Re-validate on value change? */
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';

  /** Enable browser validation? */
  nativeValidation?: boolean;
}

/**
 * Return type for form hook
 *
 * @template T - Shape of form values
 */
export interface UseFormReturn<T extends Record<string, any>> extends FormActions<T> {
  /** Current form state */
  state: FormState<T>;

  /** Register a field */
  register: <K extends keyof T>(
    name: K,
    validation?: ValidationRule[]
  ) => {
    name: K;
    value: T[K];
    onChange: (value: T[K]) => void;
    onBlur: () => void;
    error: string | undefined;
  };

  /** Get field state */
  getFieldState: <K extends keyof T>(name: K) => FormFieldState<T[K]>;

  /** Form element props */
  formProps: {
    onSubmit: (e: React.FormEvent) => void;
    noValidate?: boolean;
  };
}

// ============================================================================
// DYNAMIC FORMS
// ============================================================================

/**
 * Dynamic form field definition
 */
export interface DynamicFormField {
  /** Field name/key */
  name: string;

  /** Field type */
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date';

  /** Field label */
  label: string;

  /** Default value */
  defaultValue?: any;

  /** Is required? */
  required?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Help text */
  helpText?: string;

  /** Validation rules */
  validation?: ValidationRule[];

  /** Options (for select/radio/checkbox) */
  options?: SelectOption[];

  /** Conditional visibility */
  visible?: boolean | ((values: Record<string, any>) => boolean);

  /** Field props */
  props?: Record<string, any>;
}

/**
 * Dynamic form section
 */
export interface DynamicFormSection {
  /** Section ID */
  id: string;

  /** Section title */
  title: string;

  /** Section description */
  description?: string;

  /** Fields in this section */
  fields: DynamicFormField[];

  /** Is section collapsible? */
  collapsible?: boolean;

  /** Default collapsed state */
  defaultCollapsed?: boolean;

  /** Conditional visibility */
  visible?: boolean | ((values: Record<string, any>) => boolean);
}

/**
 * Dynamic form configuration
 */
export interface DynamicFormConfig {
  /** Form ID */
  id: string;

  /** Form title */
  title?: string;

  /** Form description */
  description?: string;

  /** Form sections */
  sections: DynamicFormSection[];

  /** Submit button text */
  submitText?: string;

  /** Cancel button text */
  cancelText?: string;

  /** Show progress indicator? */
  showProgress?: boolean;

  /** Submit handler */
  onSubmit: (values: Record<string, any>) => void | Promise<void>;

  /** Cancel handler */
  onCancel?: () => void;
}
