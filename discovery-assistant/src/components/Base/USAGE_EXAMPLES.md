# Layer 4: Form & Data Components - Usage Examples

This document provides comprehensive usage examples for all components in Layer 4.

## Table of Contents

1. [Input Component](#input-component)
2. [Select Component](#select-component)
3. [TextArea Component](#textarea-component)
4. [Validation System](#validation-system)
5. [ProgressBar Component](#progressbar-component)
6. [Loading Skeleton Components](#loading-skeleton-components)

---

## Input Component

Enhanced text input with validation, character count, icons, and password toggle.

### Basic Usage

```typescript
import { Input } from '@/components/Base';

function BasicInputExample() {
  const [name, setName] = useState('');

  return (
    <Input
      label="שם מלא"
      value={name}
      onChange={setName}
      placeholder="הזן שם מלא"
      required
    />
  );
}
```

### Email Input with Validation

```typescript
import { Input } from '@/components/Base';
import { Mail } from 'lucide-react';

function EmailInputExample() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleBlur = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setError('כתובת אימייל לא תקינה');
    } else {
      setError('');
    }
  };

  return (
    <Input
      label="אימייל"
      type="email"
      value={email}
      onChange={setEmail}
      onBlur={handleBlur}
      error={error}
      icon={<Mail className="w-4 h-4" />}
      required
    />
  );
}
```

### Password Input with Toggle

```typescript
function PasswordInputExample() {
  const [password, setPassword] = useState('');

  return (
    <Input
      label="סיסמה"
      type="password"
      value={password}
      onChange={setPassword}
      placeholder="הזן סיסמה"
      helpText="הסיסמה חייבת להכיל לפחות 8 תווים"
      required
    />
  );
}
```

### Input with Character Count

```typescript
function CharCountInputExample() {
  const [description, setDescription] = useState('');

  return (
    <Input
      label="תיאור קצר"
      value={description}
      onChange={setDescription}
      maxLength={100}
      showCharCount
      helpText="תאר את המוצר בקצרה"
    />
  );
}
```

### Success State Input

```typescript
function SuccessInputExample() {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);

  const checkAvailability = async () => {
    // Simulate API call
    const available = await checkUsernameAvailable(username);
    setIsAvailable(available);
  };

  return (
    <Input
      label="שם משתמש"
      value={username}
      onChange={setUsername}
      onBlur={checkAvailability}
      success={isAvailable}
      helpText={isAvailable ? 'שם המשתמש זמין!' : 'בדוק זמינות'}
    />
  );
}
```

### LTR Input (English)

```typescript
function EnglishInputExample() {
  const [apiKey, setApiKey] = useState('');

  return (
    <Input
      label="API Key"
      value={apiKey}
      onChange={setApiKey}
      dir="ltr"
      placeholder="Enter your API key"
      maxLength={50}
      showCharCount
    />
  );
}
```

---

## Select Component

Enhanced dropdown with search, keyboard navigation, and loading state.

### Basic Select

```typescript
import { Select, type Option } from '@/components/Base';

function BasicSelectExample() {
  const [status, setStatus] = useState('');

  const options: Option[] = [
    { value: 'active', label: 'פעיל' },
    { value: 'inactive', label: 'לא פעיל' },
    { value: 'pending', label: 'ממתין' }
  ];

  return (
    <Select
      label="סטטוס"
      value={status}
      onChange={setStatus}
      options={options}
      placeholder="בחר סטטוס"
      required
    />
  );
}
```

### Searchable Select

```typescript
function SearchableSelectExample() {
  const [country, setCountry] = useState('');

  const countries: Option[] = [
    { value: 'il', label: 'ישראל' },
    { value: 'us', label: 'ארצות הברית' },
    { value: 'uk', label: 'בריטניה' },
    { value: 'de', label: 'גרמניה' },
    // ... many more countries
  ];

  return (
    <Select
      label="מדינה"
      value={country}
      onChange={setCountry}
      options={countries}
      searchable
      placeholder="בחר מדינה"
    />
  );
}
```

### Select with Disabled Options

```typescript
function DisabledOptionsExample() {
  const [plan, setPlan] = useState('');

  const plans: Option[] = [
    { value: 'free', label: 'חינם' },
    { value: 'basic', label: 'בסיסי' },
    { value: 'premium', label: 'פרימיום', disabled: true },
    { value: 'enterprise', label: 'ארגוני', disabled: true }
  ];

  return (
    <Select
      label="תכנית"
      value={plan}
      onChange={setPlan}
      options={plans}
      placeholder="בחר תכנית"
      helpText="תכניות מתקדמות יהיו זמינות בקרוב"
    />
  );
}
```

### Clearable Select

```typescript
function ClearableSelectExample() {
  const [category, setCategory] = useState('');

  const categories: Option[] = [
    { value: 'tech', label: 'טכנולוגיה' },
    { value: 'business', label: 'עסקים' },
    { value: 'design', label: 'עיצוב' }
  ];

  return (
    <Select
      label="קטגוריה"
      value={category}
      onChange={setCategory}
      options={categories}
      clearable
      placeholder="בחר קטגוריה (אופציונלי)"
    />
  );
}
```

### Loading Select

```typescript
function LoadingSelectExample() {
  const [system, setSystem] = useState('');
  const [systems, setSystems] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    setLoading(true);
    const data = await fetchSystems();
    setSystems(data);
    setLoading(false);
  };

  return (
    <Select
      label="מערכת"
      value={system}
      onChange={setSystem}
      options={systems}
      loading={loading}
      searchable
    />
  );
}
```

---

## TextArea Component

Enhanced textarea with auto-resize, character count, and validation.

### Basic TextArea

```typescript
import { TextArea } from '@/components/Base';

function BasicTextAreaExample() {
  const [notes, setNotes] = useState('');

  return (
    <TextArea
      label="הערות"
      value={notes}
      onChange={setNotes}
      placeholder="הזן הערות..."
      rows={4}
    />
  );
}
```

### TextArea with Character Count

```typescript
function CharCountTextAreaExample() {
  const [feedback, setFeedback] = useState('');

  return (
    <TextArea
      label="משוב"
      value={feedback}
      onChange={setFeedback}
      maxLength={500}
      showCharCount
      helpText="שתף אותנו במחשבות שלך"
      required
    />
  );
}
```

### Auto-Resizing TextArea

```typescript
function AutoResizeTextAreaExample() {
  const [description, setDescription] = useState('');

  return (
    <TextArea
      label="תיאור מפורט"
      value={description}
      onChange={setDescription}
      autoResize
      rows={3}
      placeholder="התיאור יתרחב אוטומטית..."
    />
  );
}
```

### TextArea with Validation

```typescript
function ValidatedTextAreaExample() {
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const handleBlur = () => {
    if (comments.length < 10) {
      setError('ההערות חייבות להכיל לפחות 10 תווים');
    } else {
      setError('');
    }
  };

  return (
    <TextArea
      label="הערות"
      value={comments}
      onChange={setComments}
      onBlur={handleBlur}
      error={error}
      maxLength={1000}
      showCharCount
      required
    />
  );
}
```

---

## Validation System

Comprehensive form validation with automatic state management.

### Complete Form Example

```typescript
import { Input, Select, TextArea } from '@/components/Base';
import { useFormValidation, commonValidations } from '@/utils/validation';

function CompleteFormExample() {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    reset
  } = useFormValidation(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      message: ''
    },
    {
      name: [
        commonValidations.required('שם'),
        commonValidations.minLength(2, 'שם')
      ],
      email: [
        commonValidations.required('אימייל'),
        commonValidations.email()
      ],
      password: [
        commonValidations.required('סיסמה'),
        commonValidations.minLength(8, 'סיסמה')
      ],
      confirmPassword: [
        commonValidations.required('אימות סיסמה'),
        {
          type: 'custom',
          validator: (value) => value === values.password,
          message: 'הסיסמאות אינן תואמות'
        }
      ],
      country: [
        commonValidations.required('מדינה')
      ],
      message: [
        commonValidations.required('הודעה'),
        commonValidations.minLength(10, 'הודעה')
      ]
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateAll()) {
      // Form is valid - submit data
      console.log('Form data:', values);
      reset();
    } else {
      console.log('Form has errors');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="שם מלא"
        value={values.name}
        onChange={(value) => handleChange('name', value)}
        onBlur={() => handleBlur('name')}
        error={errors.name}
        required
      />

      <Input
        label="אימייל"
        type="email"
        value={values.email}
        onChange={(value) => handleChange('email', value)}
        onBlur={() => handleBlur('email')}
        error={errors.email}
        required
      />

      <Input
        label="סיסמה"
        type="password"
        value={values.password}
        onChange={(value) => handleChange('password', value)}
        onBlur={() => handleBlur('password')}
        error={errors.password}
        required
      />

      <Input
        label="אימות סיסמה"
        type="password"
        value={values.confirmPassword}
        onChange={(value) => handleChange('confirmPassword', value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={errors.confirmPassword}
        required
      />

      <Select
        label="מדינה"
        value={values.country}
        onChange={(value) => handleChange('country', value)}
        onBlur={() => handleBlur('country')}
        options={countryOptions}
        error={errors.country}
        searchable
        required
      />

      <TextArea
        label="הודעה"
        value={values.message}
        onChange={(value) => handleChange('message', value)}
        onBlur={() => handleBlur('message')}
        error={errors.message}
        maxLength={500}
        showCharCount
        required
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          שלח
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          איפוס
        </button>
      </div>
    </form>
  );
}
```

### Custom Validation Rules

```typescript
import { useFormValidation, type ValidationRule } from '@/utils/validation';

function CustomValidationExample() {
  const israeliPhoneValidator: ValidationRule = {
    type: 'custom',
    validator: (value) => /^0[0-9]{1,2}-?[0-9]{7}$/.test(value),
    message: 'מספר טלפון ישראלי לא תקין'
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll
  } = useFormValidation(
    { phone: '' },
    {
      phone: [
        { type: 'required', message: 'טלפון הוא שדה חובה' },
        israeliPhoneValidator
      ]
    }
  );

  return (
    <Input
      label="טלפון"
      value={values.phone}
      onChange={(value) => handleChange('phone', value)}
      onBlur={() => handleBlur('phone')}
      error={errors.phone}
      placeholder="050-1234567"
    />
  );
}
```

---

## ProgressBar Component

Visual progress indicator with multiple variants and sizes.

### Basic Progress Bar

```typescript
import { ProgressBar } from '@/components/Base';

function BasicProgressExample() {
  const [progress, setProgress] = useState(60);

  return (
    <ProgressBar
      value={progress}
      label="התקדמות"
      showPercentage
      animated
    />
  );
}
```

### Success Progress Bar

```typescript
function SuccessProgressExample() {
  const completionPercentage = 100;

  return (
    <ProgressBar
      value={completionPercentage}
      label="הושלם!"
      variant="success"
      animated
    />
  );
}
```

### Warning Progress Bar

```typescript
function WarningProgressExample() {
  const diskUsage = 85;

  return (
    <ProgressBar
      value={diskUsage}
      label="שימוש בדיסק"
      variant="warning"
      size="lg"
      showPercentage
    />
  );
}
```

### Module Progress Tracking

```typescript
import { useMeetingStore } from '@/store/useMeetingStore';
import { ProgressBar } from '@/components/Base';

function ModuleProgressExample() {
  const { getModuleProgress } = useMeetingStore();
  const progress = getModuleProgress();

  return (
    <div className="space-y-4">
      {Object.entries(progress).map(([moduleId, percentage]) => (
        <ProgressBar
          key={moduleId}
          value={percentage}
          label={moduleId}
          variant={percentage === 100 ? 'success' : 'default'}
          animated
        />
      ))}
    </div>
  );
}
```

### Multi-Size Progress Bars

```typescript
function ProgressSizesExample() {
  const progress = 45;

  return (
    <div className="space-y-4">
      <ProgressBar value={progress} size="sm" label="קטן" />
      <ProgressBar value={progress} size="md" label="בינוני" />
      <ProgressBar value={progress} size="lg" label="גדול" />
    </div>
  );
}
```

---

## Loading Skeleton Components

Skeleton loaders for better perceived performance.

### Module Skeleton

```typescript
import { ModuleSkeleton } from '@/components/Base';

function ModuleLoadingExample() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  if (loading) {
    return <ModuleSkeleton />;
  }

  return <ModuleContent data={data} />;
}
```

### Dashboard Skeleton

```typescript
import { DashboardSkeleton } from '@/components/Base';

function DashboardLoadingExample() {
  const { currentMeeting } = useMeetingStore();

  if (!currentMeeting) {
    return <DashboardSkeleton />;
  }

  return <Dashboard meeting={currentMeeting} />;
}
```

### Custom Skeleton Layouts

```typescript
import { Skeleton } from '@/components/Base';

function CustomSkeletonExample() {
  return (
    <div className="space-y-4">
      {/* Header with avatar */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
      </div>

      {/* Content blocks */}
      <Skeleton variant="rectangular" height={200} />

      {/* Text lines */}
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="85%" />
      </div>
    </div>
  );
}
```

### Table Skeleton

```typescript
import { TableSkeleton } from '@/components/Base';

function TableLoadingExample() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <TableSkeleton rows={10} />;
  }

  return <DataTable />;
}
```

### List Skeleton

```typescript
import { ListSkeleton } from '@/components/Base';

function ListLoadingExample() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <ListSkeleton items={5} />;
  }

  return <ItemsList />;
}
```

### Form Skeleton

```typescript
import { FormSkeleton } from '@/components/Base';

function FormLoadingExample() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <FormSkeleton fields={6} />;
  }

  return <EditForm />;
}
```

---

## Integration with Existing Modules

### Example: LeadsAndSales Module Integration

```typescript
import { Input, Select, TextArea, ProgressBar } from '@/components/Base';
import { useFormValidation, commonValidations } from '@/utils/validation';
import { useMeetingStore } from '@/store/useMeetingStore';

export const LeadsAndSalesModule = () => {
  const { currentMeeting, updateModule } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.leadsAndSales || {};

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    setValues
  } = useFormValidation(
    {
      centralSystem: moduleData.centralSystem || '',
      responseTime: moduleData.responseTime || '',
      notes: moduleData.notes || ''
    },
    {
      centralSystem: [
        commonValidations.required('מערכת מרכזית')
      ],
      responseTime: [
        commonValidations.required('זמן תגובה'),
        commonValidations.minValue(1, 'זמן תגובה')
      ],
      notes: [
        commonValidations.minLength(10, 'הערות')
      ]
    }
  );

  const handleSave = () => {
    if (validateAll()) {
      updateModule('leadsAndSales', values);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">מכירות ולידים</h2>
        <ProgressBar value={75} label="התקדמות" animated />
      </div>

      <Input
        label="מערכת ניהול מרכזית"
        value={values.centralSystem}
        onChange={(value) => handleChange('centralSystem', value)}
        onBlur={() => handleBlur('centralSystem')}
        error={errors.centralSystem}
        required
      />

      <Input
        label="זמן תגובה ממוצע (דקות)"
        type="number"
        value={values.responseTime}
        onChange={(value) => handleChange('responseTime', value)}
        onBlur={() => handleBlur('responseTime')}
        error={errors.responseTime}
        required
      />

      <TextArea
        label="הערות נוספות"
        value={values.notes}
        onChange={(value) => handleChange('notes', value)}
        onBlur={() => handleBlur('notes')}
        error={errors.notes}
        autoResize
        maxLength={500}
        showCharCount
      />

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        שמור
      </button>
    </div>
  );
};
```

---

## Best Practices

1. **Always use validation** for forms with the `useFormValidation` hook
2. **Show loading states** with skeleton components while fetching data
3. **Provide feedback** using error and success states on inputs
4. **Use progress bars** to show completion status
5. **Support RTL/LTR** by setting the `dir` prop appropriately
6. **Add helpful text** using `helpText` prop for guidance
7. **Keyboard accessibility** is built-in - ensure forms are keyboard navigable
8. **Character limits** should be communicated with `showCharCount`

---

## Common Patterns

### Search with Debouncing

```typescript
import { Input } from '@/components/Base';
import { useDebounce } from '@/hooks/useDebounce';

function SearchExample() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <Input
      value={search}
      onChange={setSearch}
      placeholder="חפש..."
      icon={<Search className="w-4 h-4" />}
    />
  );
}
```

### Conditional Field Validation

```typescript
function ConditionalValidationExample() {
  const [accountType, setAccountType] = useState('personal');

  const validationRules = {
    companyName: accountType === 'business'
      ? [commonValidations.required('שם החברה')]
      : []
  };

  // Use with form validation
}
```

### Multi-Step Form Progress

```typescript
function MultiStepFormExample() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div>
      <ProgressBar
        value={progress}
        label={`שלב ${currentStep} מתוך ${totalSteps}`}
        animated
      />
      {/* Form steps */}
    </div>
  );
}
```

---

This completes the usage examples for Layer 4 components. All components are production-ready and follow the Discovery Assistant's design patterns and accessibility requirements.
