# Layer 4 Components - Quick Reference Card

## 🎯 Quick Import

```typescript
import { Input, Select, TextArea, ProgressBar, ModuleSkeleton } from '@/components/Base';
import { useFormValidation, commonValidations } from '@/utils/validation';
```

---

## 📝 Input Component

### Basic Usage
```typescript
<Input
  label="שם לקוח"
  value={name}
  onChange={setName}
  placeholder="הזן שם..."
  required
/>
```

### With Validation
```typescript
<Input
  label="אימייל"
  type="email"
  value={email}
  onChange={(v) => handleChange('email', v)}
  onBlur={() => handleBlur('email')}
  error={errors.email}
  icon={<Mail className="w-4 h-4" />}
  required
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Field label |
| `value` | string | required | Input value |
| `onChange` | function | required | Change handler |
| `type` | 'text' \| 'email' \| 'password' \| 'number' \| 'tel' | 'text' | Input type |
| `error` | string | - | Error message |
| `success` | boolean | - | Success state |
| `required` | boolean | - | Required field |
| `maxLength` | number | - | Max characters |
| `showCharCount` | boolean | - | Show character counter |
| `helpText` | string | - | Helper text |
| `icon` | ReactNode | - | Icon element |
| `dir` | 'rtl' \| 'ltr' | 'rtl' | Text direction |

---

## 📋 Select Component

### Basic Usage
```typescript
const options: Option[] = [
  { value: 'opt1', label: 'אופציה 1' },
  { value: 'opt2', label: 'אופציה 2' }
];

<Select
  label="בחר אופציה"
  value={selected}
  onChange={setSelected}
  options={options}
  placeholder="בחר..."
/>
```

### Searchable Select
```typescript
<Select
  label="מערכת"
  value={system}
  onChange={setSystem}
  options={systems}
  searchable
  clearable
  loading={isLoading}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Field label |
| `value` | string | required | Selected value |
| `onChange` | function | required | Change handler |
| `options` | Option[] | required | Options array |
| `placeholder` | string | 'בחר...' | Placeholder text |
| `searchable` | boolean | false | Enable search |
| `clearable` | boolean | false | Show clear button |
| `loading` | boolean | false | Loading state |
| `error` | string | - | Error message |
| `required` | boolean | - | Required field |
| `dir` | 'rtl' \| 'ltr' | 'rtl' | Text direction |

---

## 📄 TextArea Component

### Basic Usage
```typescript
<TextArea
  label="הערות"
  value={notes}
  onChange={setNotes}
  placeholder="הזן הערות..."
  rows={4}
/>
```

### With Auto-Resize & Character Count
```typescript
<TextArea
  label="תיאור"
  value={description}
  onChange={setDescription}
  autoResize
  maxLength={500}
  showCharCount
  error={errors.description}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Field label |
| `value` | string | required | Textarea value |
| `onChange` | function | required | Change handler |
| `rows` | number | 4 | Number of rows |
| `autoResize` | boolean | false | Auto-resize on input |
| `maxLength` | number | - | Max characters |
| `showCharCount` | boolean | - | Show character counter |
| `error` | string | - | Error message |
| `helpText` | string | - | Helper text |
| `required` | boolean | - | Required field |
| `dir` | 'rtl' \| 'ltr' | 'rtl' | Text direction |

---

## ✅ Validation System

### Complete Form Example
```typescript
const MyForm = () => {
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
      phone: ''
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
      phone: [
        commonValidations.phone()
      ]
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAll()) {
      // Submit
      console.log(values);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="שם"
        value={values.name}
        onChange={(v) => handleChange('name', v)}
        onBlur={() => handleBlur('name')}
        error={errors.name}
        required
      />
      {/* More fields... */}
    </form>
  );
};
```

### Common Validations
```typescript
commonValidations.required('שדה')        // Required field
commonValidations.email()                // Valid email
commonValidations.minLength(8, 'שדה')    // Min 8 characters
commonValidations.maxLength(100, 'שדה')  // Max 100 characters
commonValidations.minValue(1, 'שדה')     // Min value 1
commonValidations.maxValue(100, 'שדה')   // Max value 100
commonValidations.phone()                // Israeli phone
commonValidations.url()                  // Valid URL
```

### Custom Validator
```typescript
{
  type: 'custom',
  validator: (value) => value === expectedValue,
  message: 'ערך לא תקין'
}
```

---

## 📊 ProgressBar Component

### Basic Usage
```typescript
<ProgressBar
  value={75}
  label="התקדמות"
  showPercentage
  animated
/>
```

### Variants
```typescript
<ProgressBar value={100} variant="success" />  // Green
<ProgressBar value={85} variant="warning" />   // Yellow
<ProgressBar value={30} variant="error" />     // Red
<ProgressBar value={50} variant="default" />   // Blue
```

### Sizes
```typescript
<ProgressBar value={60} size="sm" />  // Small
<ProgressBar value={60} size="md" />  // Medium (default)
<ProgressBar value={60} size="lg" />  // Large
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number (0-100) | required | Progress percentage |
| `label` | string | - | Label text |
| `showPercentage` | boolean | true | Show percentage |
| `variant` | 'default' \| 'success' \| 'warning' \| 'error' | 'default' | Color variant |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| `animated` | boolean | false | Smooth animation |

---

## ⏳ Loading Skeletons

### Module Loading
```typescript
if (loading) {
  return <ModuleSkeleton />;
}
return <ModuleContent />;
```

### Dashboard Loading
```typescript
if (!currentMeeting) {
  return <DashboardSkeleton />;
}
return <Dashboard />;
```

### Available Skeletons
```typescript
<ModuleSkeleton />        // Full module layout
<DashboardSkeleton />     // Dashboard with stats
<CardSkeleton />          // Single card
<TableSkeleton rows={5} /> // Table with 5 rows
<ListSkeleton items={3} /> // List with 3 items
<FormSkeleton fields={4} /> // Form with 4 fields
```

### Custom Skeleton
```typescript
<Skeleton variant="text" />                    // Text line
<Skeleton variant="circular" width={64} />     // Avatar
<Skeleton variant="rectangular" height={200} /> // Box
```

---

## 🎨 Integration Patterns

### Module with All Features
```typescript
import { Input, ProgressBar, ModuleSkeleton } from '@/components/Base';
import { useFormValidation, commonValidations } from '@/utils/validation';
import { useMeetingStore } from '@/store/useMeetingStore';

export const MyModule = () => {
  const { currentMeeting, updateModule, getModuleProgress } = useMeetingStore();
  const [loading, setLoading] = useState(true);

  const moduleData = currentMeeting?.modules?.myModule || {};
  const progress = getModuleProgress()['myModule'] || 0;

  const { values, errors, handleChange, handleBlur, validateAll } = useFormValidation(
    { field1: moduleData.field1 || '' },
    { field1: [commonValidations.required('שדה 1')] }
  );

  if (loading) return <ModuleSkeleton />;

  const handleSave = () => {
    if (validateAll()) {
      updateModule('myModule', values);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <ProgressBar value={progress} label="התקדמות" animated />

      <Input
        label="שדה 1"
        value={values.field1}
        onChange={(v) => handleChange('field1', v)}
        onBlur={() => handleBlur('field1')}
        error={errors.field1}
        required
      />

      <button onClick={handleSave}>שמור</button>
    </div>
  );
};
```

---

## 🚀 Best Practices

### ✅ DO
- Use `useFormValidation` for all forms
- Show errors only after field is touched (`onBlur`)
- Use skeleton components during initial load
- Add `required` prop to mandatory fields
- Use `helpText` for guidance
- Validate all fields before submit with `validateAll()`
- Use appropriate progress variants (success when 100%)

### ❌ DON'T
- Don't show errors on first render before user interaction
- Don't use inline validation without touch state
- Don't skip loading states
- Don't forget RTL support for Hebrew text
- Don't ignore accessibility (ARIA labels built-in)
- Don't create new input components - use these

---

## 📚 Full Documentation

See `USAGE_EXAMPLES.md` for comprehensive examples and advanced patterns.
